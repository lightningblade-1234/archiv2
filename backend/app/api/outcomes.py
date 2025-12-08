"""Outcome tracking API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.db.database import get_db
from app.models.analysis import Alert
from app.models.intervention_outcome import InterventionOutcome
from app.schemas.outcomes import OutcomeSummaryResponse
import structlog

logger = structlog.get_logger()
router = APIRouter(prefix="/api/outcomes", tags=["outcomes"])


@router.get("/summary", response_model=OutcomeSummaryResponse)
async def get_outcome_summary(
    days: int = Query(30, ge=1, le=365, description="Analysis period in days"),
    db: Session = Depends(get_db)
):
    """
    Show how many interventions actually helped students.
    THE MOST IMPORTANT METRIC: Does the system improve outcomes?
    """
    cutoff = datetime.utcnow() - timedelta(days=days)
    
    # Get all alerts in period
    alerts = db.query(Alert).filter(Alert.created_at > cutoff).all()
    total_alerts = len(alerts)
    
    if total_alerts == 0:
        raise HTTPException(status_code=404, detail=f"No alerts in past {days} days")
    
    # Count engagement
    engaged_count = sum(1 for a in alerts if a.counseling_appointment_attended)
    engagement_rate = engaged_count / total_alerts if total_alerts > 0 else 0
    
    # Count symptom improvement
    outcomes = db.query(InterventionOutcome).filter(
        InterventionOutcome.created_at > cutoff,
        InterventionOutcome.symptom_improved == True
    ).all()
    improved_count = len(outcomes)
    improvement_rate = improved_count / total_alerts if total_alerts > 0 else 0
    
    # Baseline from literature
    BASELINE_ENGAGEMENT_RATE = 0.12  # 12% normally seek counseling
    
    # Calculate lift
    system_lift = engagement_rate / BASELINE_ENGAGEMENT_RATE if BASELINE_ENGAGEMENT_RATE > 0 else 0
    
    return OutcomeSummaryResponse(
        period_days=days,
        total_alerts=total_alerts,
        students_engaged_with_counseling=engaged_count,
        engagement_rate=round(engagement_rate, 3),
        students_with_symptom_improvement=improved_count,
        improvement_rate=round(improvement_rate, 3),
        comparison_to_baseline={
            "baseline_engagement_rate": BASELINE_ENGAGEMENT_RATE,
            "system_lift": round(system_lift, 2),
            "interpretation": f"Students are {system_lift:.1f}x more likely to engage with counseling"
        }
    )

