"""Automated symptom improvement checker task (Solution 8)."""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.analysis import Alert
from app.models.assessment import Assessment
from app.models.intervention_outcome import InterventionOutcome
import structlog

logger = structlog.get_logger()


def check_symptom_improvement():
    """
    Check if students showed symptom improvement 2 weeks after alert.
    
    This function runs daily (via scheduler) and looks at alerts from exactly 14 days ago.
    It compares baseline PHQ-9 scores (before alert) with follow-up scores (2-4 weeks after)
    to determine if the intervention helped.
    
    What This Function Does:
    - Finds alerts from 14 days ago
    - Retrieves baseline PHQ-9 (administered before alert)
    - Retrieves follow-up PHQ-9 (administered 10-30 days after alert)
    - Calculates improvement magnitude (baseline - followup)
    - Flags clinically significant improvement (>= 3 point reduction)
    - Updates InterventionOutcome records
    
    What This Function Does NOT Do:
    - Does NOT create alerts (only analyzes existing ones)
    - Does NOT replace counselor judgment
    - Does NOT run automatically (requires scheduler setup)
    
    Returns:
        Dict with processing statistics
    """
    db = SessionLocal()
    
    try:
        # Get alerts from 14 days ago
        two_weeks_ago = datetime.utcnow() - timedelta(days=14)
        target_date_start = two_weeks_ago.replace(hour=0, minute=0, second=0, microsecond=0)
        target_date_end = two_weeks_ago.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        alerts = db.query(Alert).filter(
            Alert.created_at.between(target_date_start, target_date_end)
        ).all()
        
        logger.info("symptom_improvement_check_started",
                   alerts_found=len(alerts),
                   target_date=two_weeks_ago.date().isoformat())
        
        processed = 0
        improved = 0
        skipped_no_baseline = 0
        skipped_no_followup = 0
        
        for alert in alerts:
            try:
                # Get baseline PHQ-9 (before alert)
                baseline = db.query(Assessment).filter(
                    Assessment.student_id == alert.student_id,
                    Assessment.assessment_type == "PHQ9",
                    Assessment.administered_at < alert.created_at
                ).order_by(Assessment.administered_at.desc()).first()
                
                if not baseline:
                    skipped_no_baseline += 1
                    logger.debug("no_baseline_phq9",
                                alert_id=alert.id,
                                student_id=alert.student_id)
                    continue
                
                # Get follow-up PHQ-9 (after alert, within 2-4 weeks)
                followup_start = alert.created_at + timedelta(days=10)
                followup_end = alert.created_at + timedelta(days=30)
                
                followup = db.query(Assessment).filter(
                    Assessment.student_id == alert.student_id,
                    Assessment.assessment_type == "PHQ9",
                    Assessment.administered_at.between(followup_start, followup_end)
                ).order_by(Assessment.administered_at.asc()).first()
                
                if not followup:
                    skipped_no_followup += 1
                    logger.debug("no_followup_phq9",
                                alert_id=alert.id,
                                student_id=alert.student_id)
                    continue
                
                # Calculate improvement
                improvement = baseline.score - followup.score
                symptom_improved = improvement >= 3  # Clinically significant threshold
                
                # Create or update outcome
                outcome = db.query(InterventionOutcome).filter(
                    InterventionOutcome.alert_id == alert.id
                ).first()
                
                if not outcome:
                    outcome = InterventionOutcome(
                        alert_id=alert.id,
                        student_id=alert.student_id
                    )
                    db.add(outcome)
                
                # Update outcome with PHQ-9 data
                outcome.baseline_phq9 = baseline.score
                outcome.followup_phq9 = followup.score
                outcome.symptom_improved = symptom_improved
                outcome.improvement_magnitude = improvement
                
                processed += 1
                if symptom_improved:
                    improved += 1
                
                logger.info("outcome_updated",
                           alert_id=alert.id,
                           student_id=alert.student_id,
                           baseline_phq9=baseline.score,
                           followup_phq9=followup.score,
                           improvement=improvement,
                           symptom_improved=symptom_improved)
                
            except Exception as e:
                logger.error("outcome_check_failed_for_alert",
                            alert_id=alert.id,
                            student_id=alert.student_id,
                            error=str(e),
                            exc_info=True)
                continue
        
        db.commit()
        
        improvement_rate = (improved / processed * 100) if processed > 0 else 0
        
        logger.info("symptom_improvement_check_completed",
                   alerts_checked=len(alerts),
                   outcomes_processed=processed,
                   students_improved=improved,
                   improvement_rate=round(improvement_rate, 2),
                   skipped_no_baseline=skipped_no_baseline,
                   skipped_no_followup=skipped_no_followup)
        
        return {
            "alerts_checked": len(alerts),
            "outcomes_processed": processed,
            "students_improved": improved,
            "improvement_rate": round(improvement_rate, 2),
            "skipped_no_baseline": skipped_no_baseline,
            "skipped_no_followup": skipped_no_followup
        }
        
    except Exception as e:
        logger.error("symptom_improvement_check_failed",
                    error=str(e),
                    exc_info=True)
        db.rollback()
        raise
    finally:
        db.close()

