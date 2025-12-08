"""Intervention outcome tracking model."""
from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base, TimestampMixin


class InterventionOutcome(Base, TimestampMixin):
    """Tracks outcomes of interventions."""
    __tablename__ = "intervention_outcomes"
    
    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"), nullable=False)
    student_id = Column(String, ForeignKey("students.student_id"), nullable=False)
    
    # Immediate outcomes (0-7 days)
    counseling_engaged = Column(Boolean, default=False)
    appointment_scheduled_at = Column(DateTime, nullable=True)
    appointment_attended_at = Column(DateTime, nullable=True)
    
    # Short-term outcomes (2-4 weeks)
    baseline_phq9 = Column(Integer, nullable=True)
    followup_phq9 = Column(Integer, nullable=True)
    symptom_improved = Column(Boolean, nullable=True)
    improvement_magnitude = Column(Integer, nullable=True)
    
    # Medium-term outcomes (8-12 weeks)
    trajectory_slope = Column(Float, nullable=True)
    sustained_improvement = Column(Boolean, nullable=True)
    
    # Long-term outcomes
    still_enrolled_next_semester = Column(Boolean, nullable=True)
    subsequent_crisis_count = Column(Integer, default=0)
    
    # Relationships
    alert = relationship("Alert", back_populates="outcome")
    student = relationship("Student", back_populates="outcomes")

