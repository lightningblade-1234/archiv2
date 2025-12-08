"""Alert schemas."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AlertOutcomeUpdate(BaseModel):
    """Update outcome for an alert."""
    appointment_scheduled: bool
    appointment_attended: Optional[bool] = None
    scheduled_at: Optional[datetime] = None
    attended_at: Optional[datetime] = None

