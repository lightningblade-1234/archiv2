"""Outcome tracking schemas."""
from pydantic import BaseModel


class BaselineComparison(BaseModel):
    """Comparison to baseline engagement rate."""
    baseline_engagement_rate: float
    system_lift: float
    interpretation: str


class OutcomeSummaryResponse(BaseModel):
    """Outcome summary statistics."""
    period_days: int
    total_alerts: int
    students_engaged_with_counseling: int
    engagement_rate: float
    students_with_symptom_improvement: int
    improvement_rate: float
    comparison_to_baseline: BaselineComparison

