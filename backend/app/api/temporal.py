"""Temporal pattern API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.db.database import get_db
from app.models.analysis import TemporalPattern
from app.models.assessment import RiskProfile
from app.schemas.temporal import TemporalPatternsResponse, PatternItem, RiskTrajectory, TimeSeriesPoint, PatternDataDetail
import structlog

logger = structlog.get_logger()
router = APIRouter(prefix="/api/temporal", tags=["temporal"])


@router.get("/students/{student_id}/patterns", response_model=TemporalPatternsResponse)
async def get_temporal_patterns(
    student_id: str,
    days: int = Query(30, ge=1, le=90, description="Analysis period in days"),
    db: Session = Depends(get_db)
):
    """
    Get detected temporal patterns and risk trajectory.
    Shows if student is deteriorating, improving, or stable over time.
    """
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    # Get detected patterns
    patterns = db.query(TemporalPattern)\
        .filter(TemporalPattern.student_id == student_id)\
        .filter(TemporalPattern.detected_at > cutoff_date)\
        .order_by(TemporalPattern.detected_at.desc())\
        .all()
    
    # Get risk score time series
    risk_history = db.query(RiskProfile)\
        .filter(RiskProfile.student_id == student_id)\
        .filter(RiskProfile.calculated_at > cutoff_date)\
        .order_by(RiskProfile.calculated_at.asc())\
        .all()
    
    if not risk_history:
        raise HTTPException(
            status_code=404, 
            detail=f"No risk data found for past {days} days"
        )
    
    # Format patterns
    pattern_items = [
        PatternItem(
            pattern_type=p.pattern_type,
            detected_at=p.detected_at,
            severity=p.risk_multiplier,
            risk_multiplier=p.risk_multiplier,
            description=_get_pattern_description(p.pattern_type),
            requires_immediate_action=p.risk_multiplier > 1.5,
            pattern_data=PatternDataDetail(
                velocity=p.pattern_data.get("velocity") if p.pattern_data else None,
                acceleration=p.pattern_data.get("acceleration") if p.pattern_data else None
            )
        )
        for p in patterns
    ]
    
    # Format risk trajectory
    trajectory = RiskTrajectory(
        time_series=[
            TimeSeriesPoint(
                timestamp=r.calculated_at,
                overall_risk=r.overall_risk,
                risk_score_numeric=_risk_to_numeric(r.overall_risk),
                confidence=r.confidence
            )
            for r in risk_history
        ],
        current_velocity=patterns[0].pattern_data.get("velocity") if patterns and patterns[0].pattern_data else None,
        trend=_calculate_trend(risk_history)
    )
    
    return TemporalPatternsResponse(
        student_id=student_id,
        analysis_period_days=days,
        patterns_detected=pattern_items,
        risk_trajectory=trajectory
    )


def _get_pattern_description(pattern_type: str) -> str:
    """Human-readable descriptions of patterns."""
    descriptions = {
        "rapid_deterioration": "Risk scores declining rapidly - immediate attention needed",
        "pre_decision_calm": "CRITICAL: Sudden improvement after sustained distress (possible suicide decision)",
        "chronic_elevated": "Sustained high risk over extended period - consider medication evaluation",
        "cyclical": "Alternating high/low risk patterns - possible bipolar indicator",
        "disengagement": "Decreasing app usage and message frequency"
    }
    return descriptions.get(pattern_type, "Unknown pattern detected")


def _risk_to_numeric(risk_level: str) -> float:
    """Convert risk level to numeric for graphing."""
    mapping = {
        "LOW": 0.25,
        "MEDIUM": 0.5,
        "HIGH": 0.75,
        "CRISIS": 1.0
    }
    return mapping.get(risk_level, 0)


def _calculate_trend(risk_history: List[RiskProfile]) -> str:
    """Determine overall trend."""
    if len(risk_history) < 2:
        return "insufficient_data"
    
    scores = [_risk_to_numeric(r.overall_risk) for r in risk_history]
    
    # Compare recent vs older averages
    midpoint = len(scores) // 2
    recent_avg = sum(scores[midpoint:]) / len(scores[midpoint:])
    older_avg = sum(scores[:midpoint]) / len(scores[:midpoint])
    
    if recent_avg > older_avg + 0.15:
        return "worsening"
    elif recent_avg < older_avg - 0.15:
        return "improving"
    else:
        return "stable"

