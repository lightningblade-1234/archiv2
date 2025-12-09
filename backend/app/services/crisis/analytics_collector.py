"""Crisis Analytics Collector - Collects and stores comprehensive user data when crisis protocol is triggered."""
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.models.analysis import CrisisAnalytics, CrisisReport, Alert
from app.models.student import Student, Session
from app.models.assessment import Assessment, RiskProfile
from app.models.analysis import MessageAnalysis, TemporalPattern
import structlog

logger = structlog.get_logger()


class CrisisAnalyticsCollector:
    """Collects comprehensive user data when crisis protocol is triggered."""
    
    def __init__(self, db_session, llm_client):
        self.db = db_session
        self.llm = llm_client
    
    async def collect_and_save_analytics(
        self, 
        student_id: str, 
        alert_id: Optional[int],
        trigger_reason: str,
        trigger_message: Optional[str],
        current_risk_profile: Optional[Dict[str, Any]],
        priority: str = "HIGH"
    ) -> CrisisAnalytics:
        """Collect all user data and save to analytics table."""
        try:
            # Collect student profile
            student_profile = self._collect_student_profile(student_id)
            
            # Collect recent messages and analyses
            recent_messages, message_analyses = self._collect_message_data(student_id)
            
            # Collect risk profiles
            risk_profiles = self._collect_risk_profiles(student_id)
            
            # Collect assessments
            assessments = self._collect_assessments(student_id)
            
            # Collect temporal patterns
            temporal_patterns = self._collect_temporal_patterns(student_id)
            
            # Collect session summary
            session_summary = self._collect_session_summary(student_id)
            
            # Collect behavioral metadata
            behavioral_metadata = self._collect_behavioral_metadata(student_id)
            
            # Create analytics record
            analytics = CrisisAnalytics(
                student_id=student_id,
                alert_id=alert_id,
                student_profile=student_profile,
                recent_messages=recent_messages,
                message_analyses=message_analyses,
                risk_profiles=risk_profiles,
                current_risk_profile=current_risk_profile,
                assessments=assessments,
                temporal_patterns=temporal_patterns,
                session_summary=session_summary,
                behavioral_metadata=behavioral_metadata,
                priority=priority,
                trigger_reason=trigger_reason,
                trigger_message=trigger_message
            )
            
            self.db.add(analytics)
            self.db.commit()
            self.db.refresh(analytics)
            
            logger.info("crisis_analytics_saved",
                       student_id=student_id,
                       analytics_id=analytics.id,
                       alert_id=alert_id)
            
            return analytics
            
        except Exception as e:
            logger.error("crisis_analytics_collection_failed",
                        student_id=student_id,
                        error=str(e),
                        exc_info=True)
            raise
    
    def _collect_student_profile(self, student_id: str) -> Dict[str, Any]:
        """Collect complete student profile information."""
        student = self.db.query(Student).filter(
            Student.student_id == student_id
        ).first()
        
        if not student:
            return {"student_id": student_id, "error": "Student not found"}
        
        return {
            "student_id": student.student_id,
            "name": student.name,
            "email": student.email,
            "anonymized_name": student.anonymized_name,
            "major": student.major,
            "bio": student.bio,
            "baseline_profile": student.baseline_profile or {},
            "session_count": student.session_count or 0,
            "last_checkpoint_date": student.last_checkpoint_date,
            "created_at": student.created_at.isoformat() if student.created_at else None,
            "updated_at": student.updated_at.isoformat() if student.updated_at else None
        }
    
    def _collect_message_data(self, student_id: str) -> tuple[List[Dict], List[Dict]]:
        """Collect recent messages and their analyses."""
        # Get recent messages from sessions (last 30 messages)
        sessions = self.db.query(Session).filter(
            Session.student_id == student_id
        ).order_by(Session.created_at.desc()).limit(5).all()
        
        recent_messages = []
        for session in sessions:
            if session.messages:
                recent_messages.extend(session.messages[-10:])  # Last 10 messages per session
        
        # Limit to last 30 messages total
        recent_messages = recent_messages[-30:]
        
        # Get message analyses
        message_analyses = self.db.query(MessageAnalysis).filter(
            MessageAnalysis.student_id == student_id
        ).order_by(MessageAnalysis.created_at.desc()).limit(30).all()
        
        analyses_data = []
        for analysis in message_analyses:
            analyses_data.append({
                "message_id": analysis.message_id,
                "message_text": analysis.message_text,
                "emoji_analysis": analysis.emoji_analysis,
                "sentiment_score": analysis.sentiment_score,
                "concern_indicators": analysis.concern_indicators,
                "safety_flags": analysis.safety_flags,
                "checkpoint_results": analysis.checkpoint_results,
                "created_at": analysis.created_at.isoformat() if analysis.created_at else None
            })
        
        return recent_messages, analyses_data
    
    def _collect_risk_profiles(self, student_id: str) -> List[Dict[str, Any]]:
        """Collect all risk profiles for the student."""
        profiles = self.db.query(RiskProfile).filter(
            RiskProfile.student_id == student_id
        ).order_by(RiskProfile.created_at.desc()).limit(20).all()
        
        profiles_data = []
        for profile in profiles:
            profiles_data.append({
                "id": profile.id,
                "overall_risk": profile.overall_risk,
                "confidence": profile.confidence,
                "risk_factors": profile.risk_factors,
                "recommended_action": profile.recommended_action,
                "created_at": profile.created_at.isoformat() if profile.created_at else None
            })
        
        return profiles_data
    
    def _collect_assessments(self, student_id: str) -> List[Dict[str, Any]]:
        """Collect all assessments (PHQ-9, GAD-7, C-SSRS)."""
        assessments = self.db.query(Assessment).filter(
            Assessment.student_id == student_id
        ).order_by(Assessment.administered_at.desc()).limit(20).all()
        
        assessments_data = []
        for assessment in assessments:
            assessments_data.append({
                "id": assessment.id,
                "assessment_type": assessment.assessment_type,
                "score": assessment.score,
                "responses": assessment.responses,
                "administered_at": assessment.administered_at.isoformat() if assessment.administered_at else None,
                "trigger_reason": assessment.trigger_reason
            })
        
        return assessments_data
    
    def _collect_temporal_patterns(self, student_id: str) -> List[Dict[str, Any]]:
        """Collect detected temporal patterns."""
        patterns = self.db.query(TemporalPattern).filter(
            TemporalPattern.student_id == student_id
        ).order_by(TemporalPattern.detected_at.desc()).limit(10).all()
        
        patterns_data = []
        for pattern in patterns:
            patterns_data.append({
                "pattern_type": pattern.pattern_type,
                "detected_at": pattern.detected_at.isoformat() if pattern.detected_at else None,
                "pattern_data": pattern.pattern_data,
                "risk_multiplier": pattern.risk_multiplier,
                "alert_generated": pattern.alert_generated
            })
        
        return patterns_data
    
    def _collect_session_summary(self, student_id: str) -> Dict[str, Any]:
        """Collect session summary statistics."""
        sessions = self.db.query(Session).filter(
            Session.student_id == student_id
        ).all()
        
        total_sessions = len(sessions)
        total_messages = sum(len(s.messages or []) for s in sessions)
        
        # Calculate engagement metrics
        if sessions:
            first_session = min(sessions, key=lambda s: s.created_at)
            last_session = max(sessions, key=lambda s: s.created_at)
            days_active = (last_session.created_at - first_session.created_at).days + 1
        else:
            days_active = 0
        
        return {
            "total_sessions": total_sessions,
            "total_messages": total_messages,
            "days_active": days_active,
            "average_messages_per_session": total_messages / total_sessions if total_sessions > 0 else 0,
            "last_session_date": sessions[-1].created_at.isoformat() if sessions else None
        }
    
    def _collect_behavioral_metadata(self, student_id: str) -> Dict[str, Any]:
        """Collect behavioral metadata (engagement patterns, response times, etc.)."""
        sessions = self.db.query(Session).filter(
            Session.student_id == student_id
        ).order_by(Session.created_at.desc()).limit(10).all()
        
        session_times = []
        for session in sessions:
            if session.created_at:
                session_times.append({
                    "date": session.created_at.isoformat(),
                    "message_count": len(session.messages or [])
                })
        
        return {
            "recent_session_times": session_times,
            "engagement_trend": "increasing" if len(sessions) > 5 else "stable"
        }
    
    async def generate_and_save_report(
        self,
        student_id: str,
        analytics_id: int,
        alert_id: Optional[int],
        report_type: str = "CRISIS"
    ) -> CrisisReport:
        """Generate word summary using LLM and save to reports table."""
        try:
            # Get the analytics data
            analytics = self.db.query(CrisisAnalytics).filter(
                CrisisAnalytics.id == analytics_id
            ).first()
            
            if not analytics:
                raise ValueError(f"Analytics record {analytics_id} not found")
            
            # Build prompt for LLM to generate summary
            prompt = self._build_summary_prompt(analytics)
            
            # Generate summary using LLM
            summary = await self.llm.generate(
                prompt=prompt,
                max_tokens=1000,
                system_message="You are a clinical mental health report writer. Generate concise, professional summaries of student mental health data for counselors and administrators."
            )
            
            # Extract key findings and recommended actions
            key_findings = self._extract_key_findings(analytics)
            recommended_actions = self._extract_recommended_actions(analytics)
            
            # Create report
            report = CrisisReport(
                student_id=student_id,
                analytics_id=analytics_id,
                alert_id=alert_id,
                summary=summary,
                key_findings=key_findings,
                recommended_actions=recommended_actions,
                report_type=report_type,
                generated_by="SYSTEM"
            )
            
            self.db.add(report)
            self.db.commit()
            self.db.refresh(report)
            
            logger.info("crisis_report_generated",
                       student_id=student_id,
                       report_id=report.id,
                       analytics_id=analytics_id)
            
            return report
            
        except Exception as e:
            logger.error("crisis_report_generation_failed",
                        student_id=student_id,
                        analytics_id=analytics_id,
                        error=str(e),
                        exc_info=True)
            raise
    
    def _build_summary_prompt(self, analytics: CrisisAnalytics) -> str:
        """Build prompt for LLM to generate comprehensive summary."""
        student_profile = analytics.student_profile
        risk_profile = analytics.current_risk_profile or {}
        recent_messages = analytics.recent_messages[-10:] if analytics.recent_messages else []
        
        prompt = f"""Generate a comprehensive word summary report for a student mental health crisis case.

Student Information:
- Name: {student_profile.get('name', 'N/A')}
- Student ID: {student_profile.get('student_id', 'N/A')}
- Email: {student_profile.get('email', 'N/A')}
- Major: {student_profile.get('major', 'N/A')}
- Total Sessions: {student_profile.get('session_count', 0)}

Current Risk Profile:
- Overall Risk: {risk_profile.get('overall_risk', 'N/A')}
- Confidence: {risk_profile.get('confidence', 'N/A')}
- Risk Factors: {risk_profile.get('risk_factors', {})}

Recent Activity:
{self._format_recent_messages(recent_messages)}

Trigger Information:
- Reason: {analytics.trigger_reason}
- Trigger Message: {analytics.trigger_message or 'N/A'}

Generate a professional, concise summary (300-500 words) that includes:
1. Overview of the student's situation
2. Key risk indicators and concerns
3. Patterns observed in recent interactions
4. Immediate concerns requiring attention
5. Recommended next steps for intervention

Write in a clear, professional tone suitable for counselors and administrators."""

        return prompt
    
    def _format_recent_messages(self, messages: List[Dict]) -> str:
        """Format recent messages for prompt."""
        if not messages:
            return "No recent messages available."
        
        formatted = []
        for msg in messages[-10:]:  # Last 10 messages
            sender = msg.get('sender', 'unknown')
            content = msg.get('content', '')[:200]  # Limit length
            timestamp = msg.get('timestamp', 'N/A')
            formatted.append(f"[{timestamp}] {sender}: {content}")
        
        return "\n".join(formatted)
    
    def _extract_key_findings(self, analytics: CrisisAnalytics) -> List[str]:
        """Extract key findings from analytics data."""
        findings = []
        
        # Risk level finding
        if analytics.current_risk_profile:
            risk = analytics.current_risk_profile.get('overall_risk', 'UNKNOWN')
            findings.append(f"Current risk level: {risk}")
        
        # Concern indicators
        if analytics.message_analyses:
            all_indicators = []
            for analysis in analytics.message_analyses[-5:]:  # Last 5 analyses
                indicators = analysis.get('concern_indicators', [])
                all_indicators.extend(indicators)
            
            if all_indicators:
                unique_indicators = list(set(all_indicators))
                findings.append(f"Concern indicators detected: {', '.join(unique_indicators[:5])}")
        
        # Session activity
        if analytics.session_summary:
            session_count = analytics.session_summary.get('total_sessions', 0)
            findings.append(f"Total counseling sessions: {session_count}")
        
        # Temporal patterns
        if analytics.temporal_patterns:
            pattern_types = [p.get('pattern_type') for p in analytics.temporal_patterns]
            if pattern_types:
                findings.append(f"Detected patterns: {', '.join(set(pattern_types))}")
        
        return findings if findings else ["No specific findings available"]
    
    def _extract_recommended_actions(self, analytics: CrisisAnalytics) -> List[str]:
        """Extract recommended actions based on analytics."""
        actions = []
        
        # Immediate actions based on risk level
        if analytics.current_risk_profile:
            risk = analytics.current_risk_profile.get('overall_risk', '')
            if risk in ['CRISIS', 'HIGH']:
                actions.append("Immediate counselor contact required")
                actions.append("Consider crisis intervention protocol")
        
        # Assessment recommendations
        if not analytics.assessments or len(analytics.assessments) == 0:
            actions.append("Consider administering PHQ-9 and GAD-7 assessments")
        
        # Follow-up actions
        actions.append("Schedule follow-up session within 24-48 hours")
        actions.append("Monitor student engagement and response patterns")
        
        return actions
