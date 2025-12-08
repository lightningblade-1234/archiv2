"""Temporal pattern schemas."""
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime


class PatternDataDetail(BaseModel):
    """Pattern data details."""
    velocity: Optional[float]
    acceleration: Optional[float]


class PatternItem(BaseModel):
    """Detected temporal pattern."""
    pattern_type: str
    detected_at: datetime
    severity: float
    risk_multiplier: float
    description: str
    requires_immediate_action: bool
    pattern_data: PatternDataDetail


class TimeSeriesPoint(BaseModel):
    """Risk score time series point."""
    timestamp: datetime
    overall_risk: str
    risk_score_numeric: float
    confidence: float


class RiskTrajectory(BaseModel):
    """Risk trajectory over time."""
    time_series: List[TimeSeriesPoint]
    current_velocity: Optional[float]
    trend: str  # "improving", "worsening", "stable", "insufficient_data"


class TemporalPatternsResponse(BaseModel):
    """Temporal patterns and risk trajectory."""
    student_id: str
    analysis_period_days: int
    patterns_detected: List[PatternItem]
    risk_trajectory: RiskTrajectory

