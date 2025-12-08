"""Alert API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.schemas.risk import RiskProfile, AlertRecommendation
from app.schemas.alerts import AlertOutcomeUpdate
from app.services.alerts.risk_calculator import RiskCalculator
from app.db.database import get_db
from app.models.analysis import MessageAnalysis
import structlog

logger = structlog.get_logger()
router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.get("/risk-profile/{student_id}")
async def get_risk_profile(
    student_id: str,
    db: Session = Depends(get_db)
):
    """Get current risk profile for student."""
    calculator = RiskCalculator(db)
    profile = calculator.get_current_risk_profile(student_id)
    
    if not profile:
        raise HTTPException(status_code=404, detail="No risk profile found")
    
    return profile


@router.get("/pending")
async def get_pending_alerts(
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get pending alerts, prioritized by risk."""
    from app.models.analysis import Alert
    from app.models.student import Student
    
    alerts = db.query(Alert).filter(
        Alert.routing_status == "PENDING"
    ).order_by(Alert.created_at.desc()).limit(limit).all()
    
    result = []
    for a in alerts:
        # Get student information
        student = db.query(Student).filter(Student.student_id == a.student_id).first()
        student_name = student.name if student and student.name else a.student_id
        
        # Map alert_type to severity
        severity_map = {
            "IMMEDIATE": "Critical",
            "URGENT": "High",
            "ROUTINE": "Medium"
        }
        severity = severity_map.get(a.alert_type, "Medium")
        
        # Determine alert type display
        if "Crisis protocol" in a.message:
            alert_type_display = "Crisis Keywords"
        elif "High risk" in a.message:
            alert_type_display = "High Risk Score"
        else:
            alert_type_display = "Risk Alert"
        
        result.append({
            "id": a.id,
            "student_id": a.student_id,
            "studentName": student_name,
            "alert_type": a.alert_type,
            "type": alert_type_display,
            "severity": severity,
            "message": a.message,
            "status": "Unread",
            "triggeredAt": a.created_at.strftime("%Y-%m-%d %I:%M %p"),
            "actionRequired": "Immediate intervention recommended" if severity == "Critical" else "Review and follow-up needed",
            "testType": "Message Analysis"
        })
    
    return result


@router.get("/{alert_id}/detail")
async def get_alert_detail(
    alert_id: int,
    db: Session = Depends(get_db)
):
    """
    Get complete context for an alert including all AI reasoning.
    This is what counselors use to review alerts and provide feedback.
    """
    from app.models.analysis import Alert
    from app.models.student import Student
    from app.models.assessment import RiskProfile, Assessment
    from app.models.analysis import TemporalPattern
    
    # Get alert
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # Get associated risk profile
    risk_profile = None
    if alert.risk_profile_id:
        risk_profile = db.query(RiskProfile).filter(
            RiskProfile.id == alert.risk_profile_id
        ).first()
    
    # Get associated message analysis (find most recent before alert)
    message_analysis = db.query(MessageAnalysis)\
        .filter(MessageAnalysis.student_id == alert.student_id)\
        .filter(MessageAnalysis.created_at <= alert.created_at)\
        .order_by(MessageAnalysis.created_at.desc())\
        .first()
    
    # Get student for baseline
    student = db.query(Student).filter(Student.student_id == alert.student_id).first()
    
    # Get recent temporal patterns
    temporal_patterns = db.query(TemporalPattern)\
        .filter(TemporalPattern.student_id == alert.student_id)\
        .order_by(TemporalPattern.detected_at.desc())\
        .limit(3)\
        .all()
    
    # Get recent assessments
    recent_assessments = db.query(Assessment)\
        .filter(Assessment.student_id == alert.student_id)\
        .order_by(Assessment.administered_at.desc())\
        .limit(3)\
        .all()
    
    # Map alert_type to severity
    severity_map = {
        "IMMEDIATE": "Critical",
        "URGENT": "High",
        "ROUTINE": "Medium"
    }
    
    return {
        "alert": {
            "id": alert.id,
            "severity": severity_map.get(alert.alert_type, "Medium"),
            "alert_type": alert.alert_type,
            "created_at": alert.created_at,
            "reviewed_at": alert.reviewed_at,
            "reviewed_by": alert.counselor_id,
            "status": alert.routing_status,
            "message": alert.message
        },
        "triggering_message": {
            "text": message_analysis.message_text if message_analysis else None,
            "timestamp": message_analysis.created_at if message_analysis else None,
            "concern_indicators": message_analysis.concern_indicators if message_analysis else [],
            "safety_flags": message_analysis.safety_flags if message_analysis else []
        },
        "risk_assessment": {
            "overall_risk": risk_profile.overall_risk if risk_profile else None,
            "confidence": risk_profile.confidence if risk_profile else None,
            "risk_factors": risk_profile.risk_factors if risk_profile else {},
            "recommended_action": risk_profile.recommended_action if risk_profile else None
        },
        "student_context": {
            "baseline_established": student.baseline_profile is not None if student else False,
            "communication_style": student.baseline_profile.get("communication_style") if student and student.baseline_profile else None,
            "recent_assessments": [
                {"type": a.assessment_type, "score": a.score, "date": a.administered_at}
                for a in recent_assessments
            ]
        },
        "temporal_context": {
            "patterns_detected": [
                {"type": p.pattern_type, "severity": p.risk_multiplier, "detected_at": p.detected_at}
                for p in temporal_patterns
            ]
        }
    }


@router.post("/{alert_id}/outcome")
async def record_alert_outcome(
    alert_id: int,
    outcome: AlertOutcomeUpdate,
    db: Session = Depends(get_db)
):
    """
    Record what happened after an alert was generated.
    Did student engage with counseling? Attend appointment?
    """
    from app.models.analysis import Alert
    from app.models.intervention_outcome import InterventionOutcome
    
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # Update alert with outcome data
    alert.counseling_appointment_scheduled = outcome.appointment_scheduled
    alert.counseling_appointment_attended = outcome.appointment_attended
    alert.appointment_scheduled_at = outcome.scheduled_at
    alert.appointment_attended_at = outcome.attended_at
    
    # Create or update InterventionOutcome
    intervention = db.query(InterventionOutcome).filter(
        InterventionOutcome.alert_id == alert_id
    ).first()
    
    if not intervention:
        intervention = InterventionOutcome(
            alert_id=alert_id,
            student_id=alert.student_id
        )
        db.add(intervention)
    
    intervention.counseling_engaged = outcome.appointment_attended or False
    intervention.appointment_scheduled_at = outcome.scheduled_at
    intervention.appointment_attended_at = outcome.attended_at
    
    db.commit()
    db.refresh(alert)
    
    return {
        "success": True,
        "alert_id": alert_id,
        "outcome_recorded": True
    }




