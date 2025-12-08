"""Student schemas."""
from pydantic import BaseModel
from typing import Dict, Optional
from datetime import datetime


class BaselineProfileResponse(BaseModel):
    """Student baseline communication profile."""
    student_id: str
    baseline_established_at: Optional[datetime]
    message_count: Optional[int]
    language_patterns: Dict
    emoji_usage: Dict
    communication_style: str

