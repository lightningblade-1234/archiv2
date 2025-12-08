"""Assessment API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List
from scipy.stats import linregress
from app.schemas.assessment import (
    AssessmentRequest, AssessmentResult, PHQ2Request, GAD2Request, CSSRSRequest,
    AssessmentHistoryResponse, AssessmentItem, TrajectoryAnalysis
)
from app.services.assessment.hybrid_assessment import HybridAssessmentService
from app.services.assessment.cssrs import CSSRSService
from app.db.database import get_db
import structlog

logger = structlog.get_logger()
router = APIRouter(prefix="/api/assessments", tags=["assessments"])


@router.get("/checkpoint-plan/{student_id}")
async def get_checkpoint_plan(
    student_id: str,
    db: Session = Depends(get_db)
):
    """Get checkpoint assessment plan for student."""
    service = HybridAssessmentService(db)
    
    if not service.should_trigger_checkpoint_assessment(student_id):
        return {"should_trigger": False}
    
    plan = service.get_checkpoint_assessment_plan(student_id)
    return {"should_trigger": True, "plan": plan}


@router.post("/phq2", response_model=AssessmentResult)
async def submit_phq2(
    student_id: str,
    responses: dict,
    db: Session = Depends(get_db)
):
    """Submit PHQ-2 responses."""
    # Calculate score (sum of responses, threshold is 3)
    score = sum(responses.values())
    
    # If score >= 3, recommend full PHQ-9
    if score >= 3:
        return {
            "student_id": student_id,
            "assessment_type": "PHQ2",
            "score": score,
            "responses": responses,
            "administered_at": datetime.utcnow(),
            "interpretation": "Positive screen - recommend full PHQ-9",
            "recommended_action": "administer_phq9"
        }
    
    return {
        "student_id": student_id,
        "assessment_type": "PHQ2",
        "score": score,
        "responses": responses,
        "administered_at": datetime.utcnow(),
        "interpretation": "Negative screen",
        "recommended_action": "continue_monitoring"
    }


@router.post("/cssrs/trigger-check")
async def check_cssrs_trigger(
    student_id: str,
    context: dict,
    db: Session = Depends(get_db)
):
    """Check if C-SSRS should be triggered."""
    service = CSSRSService(db)
    should_trigger = service.should_trigger_cssrs(student_id, context)
    
    if should_trigger:
        questions = service.get_cssrs_questions()
        return {
            "should_trigger": True,
            "message": "I want to ask you some specific questions to understand how to best support you. These are important safety questions.",
            "questions": questions.questions
        }
    
    return {"should_trigger": False}


@router.post("/cssrs/submit", response_model=dict)
async def submit_cssrs(
    student_id: str,
    responses: dict,
    trigger_reason: str,
    db: Session = Depends(get_db)
):
    """Submit C-SSRS responses."""
    service = CSSRSService(db)
    
    # Score responses
    score_result = service.score_cssrs(responses)
    
    # Determine clinical action
    action = service.determine_clinical_action(score_result["score"])
    
    # Create assessment record
    assessment = service.create_assessment_record(
        student_id, responses, score_result, trigger_reason
    )
    
    return {
        "assessment_id": assessment.id,
        "score": score_result["score"],
        "severity_level": score_result["severity_level"],
        "clinical_action": action
    }


@router.get("/students/{student_id}/history", response_model=AssessmentHistoryResponse)
async def get_assessment_history(
    student_id: str,
    assessment_type: Optional[str] = None,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    Get student's assessment history with trajectory analysis.
    Critical for tracking if interventions work.
    """
    from app.models.assessment import Assessment
    
    query = db.query(Assessment).filter(Assessment.student_id == student_id)
    
    if assessment_type:
        query = query.filter(Assessment.assessment_type == assessment_type)
    
    assessments = query.order_by(Assessment.administered_at.desc()).limit(limit).all()
    
    if not assessments:
        raise HTTPException(status_code=404, detail="No assessments found")
    
    # Format assessment items
    assessment_items = [
        AssessmentItem(
            id=a.id,
            type=a.assessment_type,
            score=a.score,
            severity=_get_severity_from_score(a.assessment_type, a.score),
            administered_at=a.administered_at,
            trigger_reason=a.trigger_reason,
            responses=a.responses,
            counselor_reviewed=False,
            follow_up_scheduled=False
        )
        for a in assessments
    ]
    
    # Calculate trajectory if enough data
    trajectory = None
    if len(assessments) >= 2:
        trajectory = _calculate_trajectory(assessments)
    
    return AssessmentHistoryResponse(
        student_id=student_id,
        total_assessments=len(assessments),
        assessments=assessment_items,
        trajectory=trajectory
    )


def _get_severity_from_score(assessment_type: str, score: int) -> Optional[str]:
    """Map assessment score to severity level."""
    if assessment_type == "PHQ9":
        if score >= 20:
            return "SEVERE"
        elif score >= 15:
            return "MODERATELY_SEVERE"
        elif score >= 10:
            return "MODERATE"
        elif score >= 5:
            return "MILD"
        else:
            return "MINIMAL"
    elif assessment_type == "GAD7":
        if score >= 15:
            return "SEVERE"
        elif score >= 10:
            return "MODERATE"
        elif score >= 5:
            return "MILD"
        else:
            return "MINIMAL"
    elif assessment_type == "C_SSRS":
        if score >= 3:
            return "HIGH_RISK"
        elif score >= 1:
            return "MODERATE_RISK"
        else:
            return "LOW_RISK"
    return None


def _calculate_trajectory(assessments: List) -> TrajectoryAnalysis:
    """Calculate if scores improving/worsening using linear regression."""
    sorted_assessments = sorted(assessments, key=lambda x: x.administered_at)
    scores = [a.score for a in sorted_assessments]
    
    if len(scores) < 2:
        return None
    
    x = list(range(len(scores)))
    slope, intercept, r_value, p_value, std_err = linregress(x, scores)
    
    # Determine direction
    if slope < -0.5:
        direction = "improving"
    elif slope > 0.5:
        direction = "worsening"
    else:
        direction = "stable"
    
    change = scores[-1] - scores[0]
    change_percentage = round(((scores[-1] - scores[0]) / scores[0] * 100), 1) if scores[0] != 0 else 0
    
    return TrajectoryAnalysis(
        direction=direction,
        slope=round(slope, 3),
        statistical_significance=p_value < 0.05,
        first_score=scores[0],
        latest_score=scores[-1],
        change=change,
        change_percentage=change_percentage
    )

