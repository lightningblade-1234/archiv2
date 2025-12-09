"""Message processing API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.schemas.message import Message, MessageAnalysis
from app.services.analysis.sequential_processor import SequentialProcessor
from app.services.assessment.hybrid_assessment import HybridAssessmentService
from app.db.database import get_db
from app.core.llm_client import get_llm_client
from app.models.student import Session as SessionModel
from pydantic import BaseModel
from datetime import datetime
import structlog

logger = structlog.get_logger()
router = APIRouter(prefix="/api/messages", tags=["messages"])


class SessionResponse(BaseModel):
    id: int
    session_number: int
    created_at: datetime
    message_count: int
    
    class Config:
        from_attributes = True


class ChatMessage(BaseModel):
    id: str
    content: str
    sender: str
    timestamp: str


@router.post("/process", response_model=MessageAnalysis)
async def process_message(
    message: Message,
    db: Session = Depends(get_db),
    llm_client = Depends(get_llm_client)
):
    """Process incoming student message through sequential checkpoints."""
    try:
        processor = SequentialProcessor(db, llm_client)
        analysis = await processor.process_message(message)
        
        # Create alert if crisis protocol triggered or high risk detected
        if analysis.crisis_protocol_triggered or (analysis.risk_profile and analysis.risk_profile.get("overall_risk") in ["HIGH", "CRISIS"]):
            from app.models.analysis import Alert
            from app.services.crisis.analytics_collector import CrisisAnalyticsCollector
            
            alert_type = "IMMEDIATE" if analysis.crisis_protocol_triggered else "URGENT"
            alert_message = "Crisis protocol triggered - immediate intervention required" if analysis.crisis_protocol_triggered else f"High risk detected: {analysis.risk_profile.get('overall_risk', 'HIGH')} risk level"
            
            # Check if alert already exists for this message (avoid duplicates)
            existing_alert = db.query(Alert).filter(
                Alert.student_id == message.student_id,
                Alert.message == alert_message,
                Alert.routing_status == "PENDING"
            ).first()
            
            alert = None
            if not existing_alert:
                alert = Alert(
                    student_id=message.student_id,
                    alert_type=alert_type,
                    message=alert_message,
                    routing_status="PENDING"
                )
                db.add(alert)
                db.commit()
                db.refresh(alert)
                logger.info("alert_created",
                           student_id=message.student_id,
                           alert_type=alert_type,
                           crisis_triggered=analysis.crisis_protocol_triggered,
                           alert_id=alert.id)
            
            # Collect comprehensive analytics and generate report when emergency protocol is triggered
            if analysis.crisis_protocol_triggered:
                try:
                    collector = CrisisAnalyticsCollector(db, llm_client)
                    
                    # Determine priority
                    priority = "CRITICAL" if analysis.crisis_protocol_triggered else "HIGH"
                    
                    # Collect and save analytics
                    analytics = await collector.collect_and_save_analytics(
                        student_id=message.student_id,
                        alert_id=alert.id if alert else None,
                        trigger_reason="Crisis protocol triggered - immediate safety concern detected",
                        trigger_message=message.message_text[:500],  # Limit message length
                        current_risk_profile=analysis.risk_profile,
                        priority=priority
                    )
                    
                    # Generate and save word summary report
                    report = await collector.generate_and_save_report(
                        student_id=message.student_id,
                        analytics_id=analytics.id,
                        alert_id=alert.id if alert else None,
                        report_type="CRISIS"
                    )
                    
                    logger.info("crisis_data_collected_and_reported",
                               student_id=message.student_id,
                               analytics_id=analytics.id,
                               report_id=report.id,
                               alert_id=alert.id if alert else None)
                    
                except Exception as e:
                    # Log error but don't fail the message processing
                    logger.error("crisis_analytics_collection_failed",
                               student_id=message.student_id,
                               error=str(e),
                               exc_info=True)
        
        # Track in hybrid assessment system
        assessment_service = HybridAssessmentService(db, llm_client)
        tier = assessment_service.get_assessment_tier(message.student_id)
        
        if tier == "TIER_1_PASSIVE":
            # Track passive monitoring (await async method)
            await assessment_service.track_passive_monitoring(
                message.student_id,
                message.message_text,
                {
                    "text": message.message_text,
                    "emoji_count": len([c for c in message.message_text if ord(c) > 127]),
                    "sentiment": "neutral",  # Will be calculated by LLM if available
                    "contains_humor": False,  # Will be detected by LLM if available
                    "mood": "neutral"
                }
            )
        
        return analysis
    except Exception as e:
        logger.error("message_processing_failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analysis/{student_id}")
async def get_message_analyses(
    student_id: str,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get recent message analyses for a student."""
    from app.models.analysis import MessageAnalysis as MessageAnalysisModel
    
    analyses = db.query(MessageAnalysisModel).filter(
        MessageAnalysisModel.student_id == student_id
    ).order_by(MessageAnalysisModel.created_at.desc()).limit(limit).all()
    
    return [{
        "message_id": a.message_id,
        "message_text": a.message_text,
        "concern_indicators": a.concern_indicators,
        "safety_flags": a.safety_flags,
        "created_at": a.created_at.isoformat()
    } for a in analyses]


@router.get("/sessions", response_model=List[SessionResponse])
async def get_sessions(
    student_id: str = Query(..., description="Student ID"),
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db)
):
    """Get all sessions for a student."""
    sessions = db.query(SessionModel).filter(
        SessionModel.student_id == student_id
    ).order_by(SessionModel.created_at.desc()).limit(limit).all()
    
    return [SessionResponse(
        id=s.id,
        session_number=s.session_number,
        created_at=s.created_at,
        message_count=len(s.messages) if s.messages else 0
    ) for s in sessions]


@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessage])
async def get_session_messages(
    session_id: int,
    student_id: str = Query(..., description="Student ID"),
    db: Session = Depends(get_db)
):
    """Get all messages from a specific session."""
    session = db.query(SessionModel).filter(
        SessionModel.id == session_id,
        SessionModel.student_id == student_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    messages = session.messages if session.messages else []
    return [ChatMessage(**msg) for msg in messages]




