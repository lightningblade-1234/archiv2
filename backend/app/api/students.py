"""Student API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.student import Student
from app.schemas.students import BaselineProfileResponse
import structlog

logger = structlog.get_logger()
router = APIRouter(prefix="/api/students", tags=["students"])


@router.get("/{student_id}/baseline", response_model=BaselineProfileResponse)
async def get_student_baseline(
    student_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve student's baseline communication profile.
    Shows what's "normal" for this student.
    """
    student = db.query(Student).filter(Student.student_id == student_id).first()
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    if not student.baseline_profile:
        raise HTTPException(
            status_code=404, 
            detail="Baseline not yet established (need 2-3 sessions)"
        )
    
    baseline = student.baseline_profile
    stats = baseline.get("statistics", {})
    emoji_data = baseline.get("emoji_baseline", {})
    
    return BaselineProfileResponse(
        student_id=student_id,
        baseline_established_at=baseline.get("established_at"),
        message_count=stats.get("total_messages"),
        language_patterns={
            "avg_message_length": stats.get("avg_message_length"),
            "sentiment_baseline": stats.get("sentiment_mean"),
            "sentiment_variability": stats.get("sentiment_variance"),
            "typical_emotionality": stats.get("emotionality_level"),
            "sarcasm_frequency": stats.get("sarcasm_frequency")
        },
        emoji_usage={
            "emoji_per_message": emoji_data.get("avg_emoji_per_message"),
            "most_used_emojis": emoji_data.get("common_emojis", {}),
            "typical_functions": emoji_data.get("function_distribution", {})
        },
        communication_style=baseline.get("communication_style", "unknown")
    )

