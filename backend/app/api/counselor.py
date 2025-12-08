"""Counselor dashboard API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import Optional
from datetime import datetime, timedelta
from app.db.database import get_db
from app.api.deps import get_current_counselor
from app.schemas.counselor import (
    AlertQueueResponse,
    AlertQueueItem,
    AlertFullContextResponse,
    CounselorFeedbackRequest,
    CounselorFeedbackResponse,
    InterventionOutcomeRequest,
    InterventionOutcomeResponse,
    StudentTimelineResponse,
    DashboardMetricsResponse,
    AlertStatistics,
    PerformanceMetrics,
    OutcomeMetrics,
    CounselorSatisfaction,
    TriggeringMessage,
    RiskAssessment,
    StudentBaseline,
    TemporalContext,
    RecentAssessment,
    TimelineEvent,
    RiskTrajectoryPoint
)
from app.models.analysis import Alert, MessageAnalysis, TemporalPattern
from app.models.student import Student
from app.models.assessment import RiskProfile, Assessment
from app.models.intervention_outcome import InterventionOutcome
from app.models.learning import CounselorFeedback
from app.services.learning.feedback_collector import FeedbackCollector
from app.services.learning.performance_monitor import PerformanceMonitor
import structlog

logger = structlog.get_logger()
router = APIRouter(prefix="/api/counselor", tags=["counselor"])


@router.get("/alerts/queue", response_model=AlertQueueResponse)
async def get_alert_queue(
    status: str = Query("PENDING", description="Filter by routing_status"),
    limit: int = Query(50, ge=1, le=200, description="Maximum number of alerts to return"),
    db: Session = Depends(get_db),
    counselor: Student = Depends(get_current_counselor)
):
    """
    Get counselor's alert queue with priority ordering.
    Shows pending alerts with risk profile data.
    """
    # Priority order: IMMEDIATE > URGENT > ROUTINE
    priority_map = {"IMMEDIATE": 1, "URGENT": 2, "ROUTINE": 3}
    
    # Query alerts with joins
    alerts_query = db.query(Alert)\
        .filter(Alert.routing_status == status)\
        .order_by(
            func.case(
                (Alert.alert_type == "IMMEDIATE", 1),
                (Alert.alert_type == "URGENT", 2),
                (Alert.alert_type == "ROUTINE", 3),
                else_=4
            ),
            desc(Alert.created_at)
        )\
        .limit(limit)
    
    alerts = alerts_query.all()
    
    result = []
    now = datetime.utcnow()
    
    for alert in alerts:
        # Get student information
        student = db.query(Student).filter(Student.student_id == alert.student_id).first()
        student_name = student.name if student and student.name else alert.student_id
        
        # Get risk profile
        risk_profile = None
        overall_risk = None
        confidence = None
        
        if alert.risk_profile_id:
            risk_profile = db.query(RiskProfile).filter(
                RiskProfile.id == alert.risk_profile_id
            ).first()
            if risk_profile:
                overall_risk = risk_profile.overall_risk
                confidence = risk_profile.confidence
        
        # Calculate time elapsed
        time_elapsed = (now - alert.created_at).total_seconds() / 3600.0
        
        result.append(AlertQueueItem(
            id=alert.id,
            student_id=alert.student_id,
            student_name=student_name,
            alert_type=alert.alert_type,
            overall_risk=overall_risk,
            confidence=confidence,
            created_at=alert.created_at,
            time_elapsed_hours=round(time_elapsed, 2),
            message=alert.message,
            routing_status=alert.routing_status
        ))
    
    return AlertQueueResponse(
        total_alerts=len(result),
        alerts=result
    )


@router.get("/alerts/{alert_id}/full-context", response_model=AlertFullContextResponse)
async def get_alert_full_context(
    alert_id: int,
    db: Session = Depends(get_db),
    counselor: Student = Depends(get_current_counselor)
):
    """
    Get complete context for an alert including all AI reasoning.
    This is the most important endpoint - counselors use it to review alerts.
    """
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
    
    # Get associated message analysis (find most recent before or at alert time)
    message_analysis = db.query(MessageAnalysis)\
        .filter(MessageAnalysis.student_id == alert.student_id)\
        .filter(MessageAnalysis.created_at <= alert.created_at)\
        .order_by(desc(MessageAnalysis.created_at))\
        .first()
    
    # Get student for baseline
    student = db.query(Student).filter(Student.student_id == alert.student_id).first()
    
    # Get recent temporal patterns
    temporal_patterns = db.query(TemporalPattern)\
        .filter(TemporalPattern.student_id == alert.student_id)\
        .order_by(desc(TemporalPattern.detected_at))\
        .limit(3)\
        .all()
    
    # Get recent assessments
    recent_assessments = db.query(Assessment)\
        .filter(Assessment.student_id == alert.student_id)\
        .order_by(desc(Assessment.administered_at))\
        .limit(3)\
        .all()
    
    # Build temporal context from patterns
    patterns_detected = [p.pattern_type for p in temporal_patterns]
    velocity = None
    acceleration = None
    trend = None
    
    if temporal_patterns:
        latest_pattern = temporal_patterns[0]
        pattern_data = latest_pattern.pattern_data
        if isinstance(pattern_data, dict):
            velocity = pattern_data.get("velocity")
            acceleration = pattern_data.get("acceleration")
            # Determine trend
            if velocity and velocity < -0.3:
                trend = "worsening"
            elif velocity and velocity > 0.3:
                trend = "improving"
            else:
                trend = "stable"
    
    # Build baseline profile
    baseline_profile = {}
    if student and student.baseline_profile:
        baseline_profile = student.baseline_profile
    
    # Map alert_type to severity
    severity_map = {
        "IMMEDIATE": "Critical",
        "URGENT": "High",
        "ROUTINE": "Medium"
    }
    
    return AlertFullContextResponse(
        alert={
            "id": alert.id,
            "severity": severity_map.get(alert.alert_type, "Medium"),
            "alert_type": alert.alert_type,
            "created_at": alert.created_at,
            "reviewed_at": alert.reviewed_at,
            "reviewed_by": alert.counselor_id,
            "status": alert.routing_status,
            "message": alert.message
        },
        triggering_message=TriggeringMessage(
            text=message_analysis.message_text if message_analysis else None,
            timestamp=message_analysis.created_at if message_analysis else None,
            concern_indicators=message_analysis.concern_indicators if message_analysis else [],
            safety_flags=message_analysis.safety_flags if message_analysis else [],
            emoji_analysis=message_analysis.emoji_analysis if message_analysis else None
        ),
        risk_assessment=RiskAssessment(
            overall_risk=risk_profile.overall_risk if risk_profile else None,
            confidence=risk_profile.confidence if risk_profile else None,
            risk_factors=risk_profile.risk_factors if risk_profile else {},
            recommended_action=risk_profile.recommended_action if risk_profile else None
        ),
        student_baseline=StudentBaseline(
            typical_sentiment=baseline_profile.get("typical_sentiment"),
            communication_style=baseline_profile.get("communication_style"),
            emoji_usage_rate=baseline_profile.get("emoji_usage_rate"),
            baseline_established=bool(baseline_profile)
        ),
        temporal_context=TemporalContext(
            patterns_detected=patterns_detected,
            velocity=velocity,
            acceleration=acceleration,
            trend=trend
        ),
        recent_assessments=[
            RecentAssessment(
                type=a.assessment_type,
                score=a.score,
                date=a.administered_at,
                severity=None  # Can be calculated from score if needed
            )
            for a in recent_assessments
        ]
    )


@router.post("/alerts/{alert_id}/feedback", response_model=CounselorFeedbackResponse)
async def submit_counselor_feedback(
    alert_id: int,
    feedback: CounselorFeedbackRequest,
    db: Session = Depends(get_db),
    counselor: Student = Depends(get_current_counselor)
):
    """
    Submit counselor feedback on alert appropriateness.
    Feeds into Solution 8 continuous learning.
    """
    # Get alert to extract student_id and risk_profile_id
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # Use existing FeedbackCollector
    collector = FeedbackCollector(db)
    
    # Map ai_accuracy int to string (FeedbackCollector expects string)
    accuracy_map = {
        1: "missed_context",
        2: "missed_context",
        3: "appropriate",
        4: "appropriate",
        5: "over_flagged"
    }
    ai_accuracy_str = accuracy_map.get(feedback.ai_accuracy, "appropriate")
    
    # Map actual_severity to urgency
    severity_to_urgency = {
        "None": "routine",
        "Mild": "soon",
        "Moderate": "soon",
        "Severe": "urgent",
        "Crisis": "crisis"
    }
    urgency = severity_to_urgency.get(feedback.actual_severity, "routine")
    
    feedback_data = {
        "student_id": alert.student_id,
        "alert_id": alert_id,
        "risk_profile_id": alert.risk_profile_id,
        "was_appropriate": feedback.was_appropriate,
        "actual_severity": feedback.actual_severity,
        "urgency": urgency,
        "ai_accuracy": ai_accuracy_str,
        "what_ai_missed": feedback.notes if not feedback.was_appropriate else None,
        "what_ai_over_interpreted": feedback.notes if feedback.ai_accuracy == 5 else None,
        "actual_clinical_scores": None,
        "counselor_id": counselor.student_id
    }
    
    result = collector.submit_feedback(feedback_data)
    
    logger.info("counselor_feedback_submitted",
               alert_id=alert_id,
               counselor_id=counselor.student_id,
               was_appropriate=feedback.was_appropriate)
    
    return CounselorFeedbackResponse(
        success=True,
        feedback_id=result.get("feedback_id")
    )


@router.post("/alerts/{alert_id}/outcome", response_model=InterventionOutcomeResponse)
async def record_intervention_outcome(
    alert_id: int,
    outcome: InterventionOutcomeRequest,
    db: Session = Depends(get_db),
    counselor: Student = Depends(get_current_counselor)
):
    """
    Record intervention outcome for an alert.
    Updates both Alert and InterventionOutcome records.
    """
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # Update alert with outcome data
    alert.counseling_appointment_scheduled = outcome.counseling_appointment_scheduled
    alert.counseling_appointment_attended = outcome.counseling_appointment_attended
    alert.appointment_scheduled_at = outcome.appointment_scheduled_at
    alert.appointment_attended_at = outcome.appointment_attended_at
    alert.counselor_id = counselor.student_id
    alert.reviewed_at = datetime.utcnow()
    alert.routing_status = "REVIEWED"
    
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
    
    intervention.counseling_engaged = outcome.counseling_appointment_attended or False
    intervention.appointment_scheduled_at = outcome.appointment_scheduled_at
    intervention.appointment_attended_at = outcome.appointment_attended_at
    
    db.commit()
    db.refresh(intervention)
    
    logger.info("intervention_outcome_recorded",
               alert_id=alert_id,
               counselor_id=counselor.student_id,
               counseling_engaged=intervention.counseling_engaged)
    
    return InterventionOutcomeResponse(
        success=True,
        outcome_id=intervention.id
    )


@router.get("/students/{student_id}/timeline", response_model=StudentTimelineResponse)
async def get_student_timeline(
    student_id: str,
    days: int = Query(30, ge=1, le=365, description="How far back to look"),
    db: Session = Depends(get_db),
    counselor: Student = Depends(get_current_counselor)
):
    """
    Get complete student history timeline for context.
    Shows messages, assessments, patterns, and alerts in chronological order.
    """
    cutoff = datetime.utcnow() - timedelta(days=days)
    
    # Get student
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Get all message analyses
    messages = db.query(MessageAnalysis)\
        .filter(MessageAnalysis.student_id == student_id,
                MessageAnalysis.created_at >= cutoff)\
        .order_by(desc(MessageAnalysis.created_at))\
        .all()
    
    # Get all risk profiles
    risk_profiles = db.query(RiskProfile)\
        .filter(RiskProfile.student_id == student_id,
                RiskProfile.calculated_at >= cutoff)\
        .order_by(desc(RiskProfile.calculated_at))\
        .all()
    
    # Get all assessments
    assessments = db.query(Assessment)\
        .filter(Assessment.student_id == student_id,
                Assessment.administered_at >= cutoff)\
        .order_by(desc(Assessment.administered_at))\
        .all()
    
    # Get all temporal patterns
    patterns = db.query(TemporalPattern)\
        .filter(TemporalPattern.student_id == student_id,
                TemporalPattern.detected_at >= cutoff)\
        .order_by(desc(TemporalPattern.detected_at))\
        .all()
    
    # Get all alerts
    alerts = db.query(Alert)\
        .filter(Alert.student_id == student_id,
                Alert.created_at >= cutoff)\
        .order_by(desc(Alert.created_at))\
        .all()
    
    # Build timeline events
    timeline = []
    
    # Add message events
    for msg in messages:
        timeline.append(TimelineEvent(
            timestamp=msg.created_at,
            type="message",
            data={
                "message_text": msg.message_text,
                "concern_indicators": msg.concern_indicators or [],
                "safety_flags": msg.safety_flags or [],
                "emoji_analysis": msg.emoji_analysis
            }
        ))
    
    # Add assessment events
    for assessment in assessments:
        timeline.append(TimelineEvent(
            timestamp=assessment.administered_at,
            type="assessment",
            data={
                "assessment_type": assessment.assessment_type,
                "score": assessment.score,
                "responses": assessment.responses,
                "trigger_reason": assessment.trigger_reason
            }
        ))
    
    # Add pattern events
    for pattern in patterns:
        timeline.append(TimelineEvent(
            timestamp=pattern.detected_at,
            type="pattern",
            data={
                "pattern_type": pattern.pattern_type,
                "risk_multiplier": pattern.risk_multiplier,
                "pattern_data": pattern.pattern_data
            }
        ))
    
    # Add alert events
    for alert in alerts:
        timeline.append(TimelineEvent(
            timestamp=alert.created_at,
            type="alert",
            data={
                "alert_type": alert.alert_type,
                "message": alert.message,
                "routing_status": alert.routing_status
            }
        ))
    
    # Sort timeline by timestamp descending (most recent first)
    timeline.sort(key=lambda x: x.timestamp, reverse=True)
    
    # Build risk trajectory chart data
    risk_map = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRISIS": 4}
    trajectory_data = []
    
    for profile in sorted(risk_profiles, key=lambda x: x.calculated_at):
        trajectory_data.append(RiskTrajectoryPoint(
            date=profile.calculated_at.date().isoformat(),
            risk_score=risk_map.get(profile.overall_risk, 1)
        ))
    
    return StudentTimelineResponse(
        student_id=student_id,
        baseline_profile=student.baseline_profile,
        timeline=timeline,
        risk_trajectory_chart_data=trajectory_data
    )


@router.get("/dashboard/metrics", response_model=DashboardMetricsResponse)
async def get_dashboard_metrics(
    days: int = Query(30, ge=1, le=365, description="Analysis period in days"),
    db: Session = Depends(get_db),
    counselor: Student = Depends(get_current_counselor)
):
    """
    Get aggregated dashboard metrics for system performance and outcomes.
    Combines data from multiple sources.
    """
    cutoff = datetime.utcnow() - timedelta(days=days)
    
    # Get alert statistics
    alerts = db.query(Alert).filter(Alert.created_at >= cutoff).all()
    
    alert_by_severity = {}
    total_response_time = 0.0
    response_count = 0
    
    for alert in alerts:
        alert_by_severity[alert.alert_type] = alert_by_severity.get(alert.alert_type, 0) + 1
        
        # Calculate response time if reviewed
        if alert.reviewed_at and alert.created_at:
            response_time = (alert.reviewed_at - alert.created_at).total_seconds() / 3600.0
            total_response_time += response_time
            response_count += 1
    
    avg_response_time = total_response_time / response_count if response_count > 0 else None
    
    # Get performance metrics from PerformanceMonitor
    monitor = PerformanceMonitor(db)
    weekly_report = monitor.get_weekly_report()
    
    # Extract precision, recall, F1 from weekly report
    precision = None
    recall = None
    f1_score = None
    false_positive_rate = None
    
    if weekly_report and "weekly_metrics" in weekly_report:
        metrics = weekly_report["weekly_metrics"]
        precision = metrics.get("precision")
        recall = metrics.get("recall")
        f1_score = metrics.get("f1_score")
        false_positive_rate = metrics.get("false_positive_rate")
    
    # Get outcome metrics
    outcomes = db.query(InterventionOutcome).filter(
        InterventionOutcome.created_at >= cutoff
    ).all()
    
    total_interventions = len(alerts)
    students_engaged = sum(1 for o in outcomes if o.counseling_engaged)
    engagement_rate = students_engaged / total_interventions if total_interventions > 0 else 0.0
    
    students_improved = sum(1 for o in outcomes if o.symptom_improved)
    improvement_rate = students_improved / total_interventions if total_interventions > 0 else 0.0
    
    # Baseline comparison
    BASELINE_ENGAGEMENT_RATE = 0.12
    system_lift = engagement_rate / BASELINE_ENGAGEMENT_RATE if BASELINE_ENGAGEMENT_RATE > 0 else 0
    
    # Get counselor satisfaction from feedback
    feedbacks = db.query(CounselorFeedback).filter(
        CounselorFeedback.feedback_date >= cutoff
    ).all()
    
    # Map ai_accuracy string to numeric rating
    accuracy_map = {
        "missed_context": 2,
        "appropriate": 4,
        "over_flagged": 3
    }
    
    accuracy_ratings = []
    appropriate_count = 0
    
    for feedback in feedbacks:
        rating = accuracy_map.get(feedback.ai_accuracy, 3)
        accuracy_ratings.append(rating)
        if feedback.was_appropriate:
            appropriate_count += 1
    
    avg_accuracy_rating = sum(accuracy_ratings) / len(accuracy_ratings) if accuracy_ratings else None
    
    return DashboardMetricsResponse(
        period_days=days,
        alert_statistics=AlertStatistics(
            total_alerts=len(alerts),
            by_severity=alert_by_severity,
            avg_response_time_hours=round(avg_response_time, 2) if avg_response_time else None
        ),
        performance_metrics=PerformanceMetrics(
            precision=precision,
            recall=recall,
            f1_score=f1_score,
            false_positive_rate=false_positive_rate
        ),
        outcome_metrics=OutcomeMetrics(
            total_interventions=total_interventions,
            students_engaged=students_engaged,
            engagement_rate=round(engagement_rate, 3),
            students_improved=students_improved,
            improvement_rate=round(improvement_rate, 3),
            baseline_comparison={
                "baseline_engagement_rate": BASELINE_ENGAGEMENT_RATE,
                "system_lift": round(system_lift, 2),
                "interpretation": f"Students are {system_lift:.1f}x more likely to engage with counseling"
            }
        ),
        counselor_satisfaction=CounselorSatisfaction(
            avg_ai_accuracy_rating=round(avg_accuracy_rating, 1) if avg_accuracy_rating else None,
            alerts_marked_appropriate=appropriate_count
        )
    )

