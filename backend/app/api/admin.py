"""Admin dashboard API endpoints for student information."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from app.db.database import get_db
from app.models.student import Student
from app.models.analysis import Alert, MessageAnalysis, TemporalPattern
from app.models.assessment import RiskProfile, Assessment
from app.models.intervention_outcome import InterventionOutcome
from pydantic import BaseModel
import structlog

logger = structlog.get_logger()
router = APIRouter(prefix="/api/admin", tags=["admin"])


class StudentSummary(BaseModel):
    """Student summary for admin dashboard."""
    student_id: str
    name: Optional[str] = None
    email: str
    session_count: int
    last_activity: Optional[datetime] = None
    current_risk_level: Optional[str] = None
    risk_confidence: Optional[float] = None
    baseline_established: bool
    total_assessments: int
    total_alerts: int
    last_alert_at: Optional[datetime] = None


class AdminStatsResponse(BaseModel):
    """Admin dashboard statistics."""
    total_students: int
    active_students: int  # Students active in last 7 days
    total_sessions: int
    active_sessions: int  # Sessions in last 24 hours
    total_alerts: int
    pending_alerts: int
    high_risk_students: int
    students_with_baseline: int


class StudentListResponse(BaseModel):
    """Student list response."""
    total: int
    students: List[StudentSummary]


class WellnessDataPoint(BaseModel):
    """Wellness data point for charts."""
    date: str  # ISO date string
    overall: float  # Overall wellness score (0-100)
    risk_level: str  # "LOW", "MEDIUM", "HIGH", "CRISIS"
    assessment_count: int


class WellnessTrendResponse(BaseModel):
    """Wellness trend data."""
    monthly: List[WellnessDataPoint]
    daily: List[WellnessDataPoint]


@router.get("/students", response_model=StudentListResponse)
async def get_all_students(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get all students with their summary information.
    Used for admin dashboard student list.
    """
    # Build query
    query = db.query(Student).filter(Student.is_admin == False)  # Exclude admins
    
    # Search filter
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Student.name.ilike(search_filter)) |
            (Student.email.ilike(search_filter)) |
            (Student.student_id.ilike(search_filter))
        )
    
    # Get total count
    total = query.count()
    
    # Get students with pagination
    students = query.order_by(desc(Student.created_at)).offset(offset).limit(limit).all()
    
    # Build summaries with related data
    summaries = []
    for student in students:
        # Get current risk profile
        current_risk = db.query(RiskProfile)\
            .filter(RiskProfile.student_id == student.student_id)\
            .order_by(desc(RiskProfile.calculated_at))\
            .first()
        
        # Get total assessments
        assessment_count = db.query(func.count(Assessment.id))\
            .filter(Assessment.student_id == student.student_id)\
            .scalar() or 0
        
        # Get total alerts
        alert_count = db.query(func.count(Alert.id))\
            .filter(Alert.student_id == student.student_id)\
            .scalar() or 0
        
        # Get last alert
        last_alert = db.query(Alert)\
            .filter(Alert.student_id == student.student_id)\
            .order_by(desc(Alert.created_at))\
            .first()
        
        # Get last activity (most recent message or assessment)
        last_message = db.query(MessageAnalysis)\
            .filter(MessageAnalysis.student_id == student.student_id)\
            .order_by(desc(MessageAnalysis.created_at))\
            .first()
        
        last_activity = None
        if last_message:
            last_activity = last_message.created_at
        if last_alert and (not last_activity or last_alert.created_at > last_activity):
            last_activity = last_alert.created_at
        
        summaries.append(StudentSummary(
            student_id=student.student_id,
            name=student.name,
            email=student.email,
            session_count=student.session_count or 0,
            last_activity=last_activity,
            current_risk_level=current_risk.overall_risk if current_risk else None,
            risk_confidence=current_risk.confidence if current_risk else None,
            baseline_established=bool(student.baseline_profile),
            total_assessments=assessment_count,
            total_alerts=alert_count,
            last_alert_at=last_alert.created_at if last_alert else None
        ))
    
    return StudentListResponse(
        total=total,
        students=summaries
    )


@router.get("/stats", response_model=AdminStatsResponse)
async def get_admin_stats(
    db: Session = Depends(get_db)
):
    """
    Get aggregated statistics for admin dashboard.
    """
    # Total students (excluding admins)
    total_students = db.query(func.count(Student.id))\
        .filter(Student.is_admin == False)\
        .scalar() or 0
    
    # Active students (active in last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    active_student_ids = db.query(func.distinct(MessageAnalysis.student_id))\
        .filter(MessageAnalysis.created_at >= seven_days_ago)\
        .all()
    active_students = len(active_student_ids)
    
    # Total sessions (sum of all session_count)
    total_sessions = db.query(func.sum(Student.session_count))\
        .filter(Student.is_admin == False)\
        .scalar() or 0
    
    # Active sessions (sessions in last 24 hours)
    one_day_ago = datetime.utcnow() - timedelta(days=1)
    active_sessions = db.query(func.count(MessageAnalysis.id))\
        .filter(MessageAnalysis.created_at >= one_day_ago)\
        .scalar() or 0
    
    # Total alerts
    total_alerts = db.query(func.count(Alert.id)).scalar() or 0
    
    # Pending alerts
    pending_alerts = db.query(func.count(Alert.id))\
        .filter(Alert.routing_status == "PENDING")\
        .scalar() or 0
    
    # High risk students (current risk HIGH or CRISIS)
    high_risk_students = db.query(func.count(func.distinct(RiskProfile.student_id)))\
        .filter(RiskProfile.overall_risk.in_(["HIGH", "CRISIS"]))\
        .filter(RiskProfile.calculated_at >= seven_days_ago)\
        .scalar() or 0
    
    # Students with baseline established
    students_with_baseline = db.query(func.count(Student.id))\
        .filter(Student.is_admin == False)\
        .filter(Student.baseline_profile.isnot(None))\
        .filter(Student.baseline_profile != {})\
        .scalar() or 0
    
    return AdminStatsResponse(
        total_students=total_students,
        active_students=active_students,
        total_sessions=total_sessions or 0,
        active_sessions=active_sessions,
        total_alerts=total_alerts,
        pending_alerts=pending_alerts,
        high_risk_students=high_risk_students,
        students_with_baseline=students_with_baseline
    )


@router.get("/wellness/trends", response_model=WellnessTrendResponse)
async def get_wellness_trends(
    days: int = Query(30, ge=7, le=365, description="Number of days for daily trend"),
    db: Session = Depends(get_db)
):
    """
    Get wellness trend data for charts.
    Returns monthly and daily wellness data.
    """
    # Risk level to wellness score mapping (inverse)
    risk_to_wellness = {
        "LOW": 85.0,
        "MEDIUM": 60.0,
        "HIGH": 35.0,
        "CRISIS": 15.0
    }
    
    # Get risk profiles for trend calculation
    cutoff = datetime.utcnow() - timedelta(days=max(days, 90))  # At least 90 days for monthly
    
    risk_profiles = db.query(RiskProfile)\
        .filter(RiskProfile.calculated_at >= cutoff)\
        .order_by(RiskProfile.calculated_at)\
        .all()
    
    # Build daily data
    daily_data: Dict[str, Dict[str, Any]] = {}
    
    for profile in risk_profiles:
        date_key = profile.calculated_at.date().isoformat()
        wellness_score = risk_to_wellness.get(profile.overall_risk, 50.0)
        
        if date_key not in daily_data:
            daily_data[date_key] = {
                "date": date_key,
                "wellness_scores": [],
                "risk_levels": [],
                "assessment_count": 0
            }
        
        daily_data[date_key]["wellness_scores"].append(wellness_score)
        daily_data[date_key]["risk_levels"].append(profile.overall_risk)
    
    # Get assessment counts per day
    assessments = db.query(Assessment)\
        .filter(Assessment.administered_at >= cutoff)\
        .all()
    
    for assessment in assessments:
        date_key = assessment.administered_at.date().isoformat()
        if date_key in daily_data:
            daily_data[date_key]["assessment_count"] += 1
    
    # Convert to list and calculate averages
    daily_list = []
    for date_key in sorted(daily_data.keys())[-days:]:  # Last N days
        data = daily_data[date_key]
        avg_wellness = sum(data["wellness_scores"]) / len(data["wellness_scores"]) if data["wellness_scores"] else 50.0
        
        # Most common risk level
        risk_level = max(set(data["risk_levels"]), key=data["risk_levels"].count) if data["risk_levels"] else "MEDIUM"
        
        daily_list.append(WellnessDataPoint(
            date=date_key,
            overall=round(avg_wellness, 1),
            risk_level=risk_level,
            assessment_count=data["assessment_count"]
        ))
    
    # Build monthly data (aggregate daily data by month)
    monthly_data: Dict[str, Dict[str, Any]] = {}
    
    for daily_point in daily_list:
        # Extract year-month from date
        date_obj = datetime.fromisoformat(daily_point.date)
        month_key = date_obj.strftime("%Y-%m")
        month_label = date_obj.strftime("%b")
        
        if month_key not in monthly_data:
            monthly_data[month_key] = {
                "month": month_label,
                "date": f"{month_key}-01",
                "wellness_scores": [],
                "risk_levels": [],
                "assessment_count": 0
            }
        
        monthly_data[month_key]["wellness_scores"].append(daily_point.overall)
        monthly_data[month_key]["risk_levels"].append(daily_point.risk_level)
        monthly_data[month_key]["assessment_count"] += daily_point.assessment_count
    
    # Convert to list
    monthly_list = []
    for month_key in sorted(monthly_data.keys()):
        data = monthly_data[month_key]
        avg_wellness = sum(data["wellness_scores"]) / len(data["wellness_scores"]) if data["wellness_scores"] else 50.0
        risk_level = max(set(data["risk_levels"]), key=data["risk_levels"].count) if data["risk_levels"] else "MEDIUM"
        
        monthly_list.append(WellnessDataPoint(
            date=data["date"],
            overall=round(avg_wellness, 1),
            risk_level=risk_level,
            assessment_count=data["assessment_count"]
        ))
    
    return WellnessTrendResponse(
        monthly=monthly_list,
        daily=daily_list
    )


@router.get("/students/{student_id}/details")
async def get_student_details(
    student_id: str,
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific student.
    Includes all extracted data: baseline, assessments, risk profiles, patterns.
    """
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Get all risk profiles
    risk_profiles = db.query(RiskProfile)\
        .filter(RiskProfile.student_id == student_id)\
        .order_by(desc(RiskProfile.calculated_at))\
        .all()
    
    # Get all assessments
    assessments = db.query(Assessment)\
        .filter(Assessment.student_id == student_id)\
        .order_by(desc(Assessment.administered_at))\
        .all()
    
    # Get all alerts
    alerts = db.query(Alert)\
        .filter(Alert.student_id == student_id)\
        .order_by(desc(Alert.created_at))\
        .all()
    
    # Get recent message analyses
    recent_messages = db.query(MessageAnalysis)\
        .filter(MessageAnalysis.student_id == student_id)\
        .order_by(desc(MessageAnalysis.created_at))\
        .limit(20)\
        .all()
    
    # Get temporal patterns
    patterns = db.query(TemporalPattern)\
        .filter(TemporalPattern.student_id == student_id)\
        .order_by(desc(TemporalPattern.detected_at))\
        .all()
    
    # Get intervention outcomes
    outcomes = db.query(InterventionOutcome)\
        .filter(InterventionOutcome.student_id == student_id)\
        .all()
    
    return {
        "student": {
            "student_id": student.student_id,
            "name": student.name,
            "email": student.email,
            "major": student.major,
            "session_count": student.session_count,
            "last_checkpoint_date": student.last_checkpoint_date,
            "created_at": student.created_at
        },
        "baseline_profile": student.baseline_profile or {},
        "risk_profiles": [
            {
                "id": rp.id,
                "overall_risk": rp.overall_risk,
                "confidence": rp.confidence,
                "risk_factors": rp.risk_factors,
                "recommended_action": rp.recommended_action,
                "calculated_at": rp.calculated_at
            }
            for rp in risk_profiles
        ],
        "assessments": [
            {
                "id": a.id,
                "assessment_type": a.assessment_type,
                "score": a.score,
                "responses": a.responses,
                "administered_at": a.administered_at,
                "trigger_reason": a.trigger_reason
            }
            for a in assessments
        ],
        "alerts": [
            {
                "id": a.id,
                "alert_type": a.alert_type,
                "message": a.message,
                "routing_status": a.routing_status,
                "created_at": a.created_at,
                "risk_profile_id": a.risk_profile_id
            }
            for a in alerts
        ],
        "recent_messages": [
            {
                "id": m.id,
                "message_text": m.message_text,
                "concern_indicators": m.concern_indicators,
                "safety_flags": m.safety_flags,
                "emoji_analysis": m.emoji_analysis,
                "sentiment_score": m.sentiment_score,
                "created_at": m.created_at
            }
            for m in recent_messages
        ],
        "temporal_patterns": [
            {
                "id": p.id,
                "pattern_type": p.pattern_type,
                "detected_at": p.detected_at,
                "risk_multiplier": p.risk_multiplier,
                "pattern_data": p.pattern_data
            }
            for p in patterns
        ],
        "intervention_outcomes": [
            {
                "id": o.id,
                "alert_id": o.alert_id,
                "counseling_engaged": o.counseling_engaged,
                "symptom_improved": o.symptom_improved,
                "baseline_phq9": o.baseline_phq9,
                "followup_phq9": o.followup_phq9,
                "improvement_magnitude": o.improvement_magnitude
            }
            for o in outcomes
        ]
    }

