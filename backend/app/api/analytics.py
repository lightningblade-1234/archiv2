"""Analytics API endpoints for admin dashboard."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.models.analysis import CrisisAnalytics, CrisisReport
from pydantic import BaseModel
from datetime import datetime
import structlog

logger = structlog.get_logger()
router = APIRouter(prefix="/api/analytics", tags=["analytics"])


class AnalyticsResponse(BaseModel):
    id: int
    student_id: str
    student_name: str
    student_email: str
    priority: str
    trigger_reason: str
    trigger_message: Optional[str]
    created_at: datetime
    alert_id: Optional[int]
    
    class Config:
        from_attributes = True


class ReportResponse(BaseModel):
    id: int
    student_id: str
    student_name: str
    summary: str
    key_findings: List[str]
    recommended_actions: List[str]
    report_type: str
    created_at: datetime
    analytics_id: Optional[int]
    
    class Config:
        from_attributes = True


@router.get("/crisis", response_model=List[AnalyticsResponse])
async def get_crisis_analytics(
    limit: int = Query(50, le=100),
    priority: Optional[str] = Query(None, description="Filter by priority: CRITICAL, HIGH, MEDIUM"),
    db: Session = Depends(get_db)
):
    """Get all crisis analytics data, sorted by priority and date."""
    query = db.query(CrisisAnalytics)
    
    if priority:
        query = query.filter(CrisisAnalytics.priority == priority)
    
    analytics_list = query.order_by(
        CrisisAnalytics.priority.desc(),
        CrisisAnalytics.created_at.desc()
    ).limit(limit).all()
    
    result = []
    for analytics in analytics_list:
        student_profile = analytics.student_profile or {}
        result.append(AnalyticsResponse(
            id=analytics.id,
            student_id=analytics.student_id,
            student_name=student_profile.get("name", "Unknown"),
            student_email=student_profile.get("email", "N/A"),
            priority=analytics.priority,
            trigger_reason=analytics.trigger_reason,
            trigger_message=analytics.trigger_message,
            created_at=analytics.created_at,
            alert_id=analytics.alert_id
        ))
    
    return result


@router.get("/crisis/{analytics_id}")
async def get_crisis_analytics_detail(
    analytics_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed analytics data for a specific crisis case."""
    analytics = db.query(CrisisAnalytics).filter(
        CrisisAnalytics.id == analytics_id
    ).first()
    
    if not analytics:
        raise HTTPException(status_code=404, detail="Analytics record not found")
    
    return {
        "id": analytics.id,
        "student_id": analytics.student_id,
        "student_profile": analytics.student_profile,
        "recent_messages": analytics.recent_messages,
        "message_analyses": analytics.message_analyses,
        "risk_profiles": analytics.risk_profiles,
        "current_risk_profile": analytics.current_risk_profile,
        "assessments": analytics.assessments,
        "temporal_patterns": analytics.temporal_patterns,
        "session_summary": analytics.session_summary,
        "behavioral_metadata": analytics.behavioral_metadata,
        "priority": analytics.priority,
        "trigger_reason": analytics.trigger_reason,
        "trigger_message": analytics.trigger_message,
        "created_at": analytics.created_at.isoformat() if analytics.created_at else None
    }


@router.get("/reports", response_model=List[ReportResponse])
async def get_crisis_reports(
    limit: int = Query(50, le=100),
    report_type: Optional[str] = Query(None, description="Filter by report type: CRISIS, HIGH_RISK, ROUTINE"),
    db: Session = Depends(get_db)
):
    """Get all crisis reports (word summaries), sorted by date."""
    query = db.query(CrisisReport)
    
    if report_type:
        query = query.filter(CrisisReport.report_type == report_type)
    
    reports = query.order_by(
        CrisisReport.created_at.desc()
    ).limit(limit).all()
    
    result = []
    for report in reports:
        # Get student name from analytics or student table
        student_name = "Unknown"
        if report.analytics_id:
            analytics = db.query(CrisisAnalytics).filter(
                CrisisAnalytics.id == report.analytics_id
            ).first()
            if analytics and analytics.student_profile:
                student_name = analytics.student_profile.get("name", "Unknown")
        
        result.append(ReportResponse(
            id=report.id,
            student_id=report.student_id,
            student_name=student_name,
            summary=report.summary,
            key_findings=report.key_findings or [],
            recommended_actions=report.recommended_actions or [],
            report_type=report.report_type,
            created_at=report.created_at,
            analytics_id=report.analytics_id
        ))
    
    return result


@router.get("/reports/{report_id}")
async def get_crisis_report_detail(
    report_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed report for a specific crisis case."""
    report = db.query(CrisisReport).filter(
        CrisisReport.id == report_id
    ).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return {
        "id": report.id,
        "student_id": report.student_id,
        "summary": report.summary,
        "key_findings": report.key_findings,
        "recommended_actions": report.recommended_actions,
        "report_type": report.report_type,
        "generated_by": report.generated_by,
        "created_at": report.created_at.isoformat() if report.created_at else None,
        "analytics_id": report.analytics_id,
        "alert_id": report.alert_id
    }


@router.post("/generate/{student_id}")
async def generate_analytics_for_student(
    student_id: str,
    db: Session = Depends(get_db)
):
    """Manually generate analytics and reports for a specific student."""
    from app.models.student import Student
    from app.models.analysis import Alert
    from app.services.crisis.analytics_collector import CrisisAnalyticsCollector
    from app.core.llm_client import get_llm_client
    
    # Find student
    student = db.query(Student).filter(
        Student.student_id == student_id
    ).first()
    
    if not student:
        # Try finding by name or email
        student = db.query(Student).filter(
            (Student.name.ilike(f"%{student_id}%")) |
            (Student.email.ilike(f"%{student_id}%"))
        ).first()
        
        if not student:
            raise HTTPException(
                status_code=404,
                detail=f"Student '{student_id}' not found"
            )
    
    # Get LLM client - FORCE LOCAL LLM
    from app.core.config import settings
    from app.core.llm_client import LLMClient
    llm_client = LLMClient(
        provider="local",
        base_url=settings.local_llm_base_url,
        model=settings.local_llm_model
    )
    
    # Initialize collector
    collector = CrisisAnalyticsCollector(db, llm_client)
    
    # Get or create an alert (if none exists, we'll create analytics without alert_id)
    alert = db.query(Alert).filter(
        Alert.student_id == student.student_id
    ).order_by(Alert.created_at.desc()).first()
    
    alert_id = alert.id if alert else None
    
    # Create current risk profile (mock if none exists)
    current_risk_profile = {
        "overall_risk": "HIGH",
        "confidence": 0.85,
        "risk_factors": {
            "suicidal_ideation": "moderate",
            "depression_severity": "high",
            "behavior_change": "significant"
        },
        "recommended_action": "Immediate counselor contact required"
    }
    
    try:
        # Collect and save analytics
        analytics = await collector.collect_and_save_analytics(
            student_id=student.student_id,
            alert_id=alert_id,
            trigger_reason="Manual analytics generation for admin dashboard",
            trigger_message="Analytics generated via API endpoint",
            current_risk_profile=current_risk_profile,
            priority="HIGH"
        )
        
        # Generate and save report
        report = await collector.generate_and_save_report(
            student_id=student.student_id,
            analytics_id=analytics.id,
            alert_id=alert_id,
            report_type="CRISIS"
        )
        
        logger.info("analytics_generated_manually",
                   student_id=student.student_id,
                   analytics_id=analytics.id,
                   report_id=report.id)
        
        return {
            "success": True,
            "message": f"Analytics and report generated for {student.name}",
            "student_id": student.student_id,
            "student_name": student.name,
            "analytics_id": analytics.id,
            "report_id": report.id
        }
        
    except Exception as e:
        logger.error("analytics_generation_failed",
                    student_id=student.student_id,
                    error=str(e),
                    exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate analytics: {str(e)}"
        )
