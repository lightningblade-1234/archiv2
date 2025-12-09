"""Script to create crisis analytics and reports for user shreeyan."""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.database import SessionLocal
from app.models.student import Student
from app.models.analysis import Alert
from app.services.crisis.analytics_collector import CrisisAnalyticsCollector
from app.core.llm_client import LLMClient
import structlog

logger = structlog.get_logger()


def find_student_by_name(name: str, db):
    """Find student by name (case-insensitive partial match)."""
    # Try exact match first
    student = db.query(Student).filter(
        Student.name.ilike(f"%{name}%")
    ).first()
    
    if not student:
        # Try by email
        student = db.query(Student).filter(
            Student.email.ilike(f"%{name}%")
        ).first()
    
    return student


async def create_analytics_for_shreeyan():
    """Create crisis analytics and reports for shreeyan."""
    db = SessionLocal()
    
    try:
        # Find student
        student = find_student_by_name("shreeyan", db)
        
        if not student:
            logger.error("student_not_found", search_term="shreeyan")
            print("❌ Student 'shreeyan' not found in database.")
            print("\nAvailable students:")
            all_students = db.query(Student).all()
            for s in all_students:
                print(f"  - {s.student_id}: {s.name} ({s.email})")
            return
        
        print(f"✅ Found student: {student.student_id} - {student.name} ({student.email})")
        
        # Initialize LLM client
        llm_client = LLMClient()
        
        # Initialize collector
        collector = CrisisAnalyticsCollector(db, llm_client)
        
        # Get or create an alert (if none exists, we'll create analytics without alert_id)
        alert = db.query(Alert).filter(
            Alert.student_id == student.student_id
        ).order_by(Alert.created_at.desc()).first()
        
        alert_id = alert.id if alert else None
        
        # Create current risk profile (mock if none exists)
        current_risk_profile = {
            "overall_risk": "HIGH",
            "confidence": 0.85,
            "risk_factors": {
                "suicidal_ideation": "moderate",
                "depression_severity": "high",
                "behavior_change": "significant"
            },
            "recommended_action": "Immediate counselor contact required"
        }
        
        # Collect and save analytics
        print("\n📊 Collecting analytics data...")
        analytics = await collector.collect_and_save_analytics(
            student_id=student.student_id,
            alert_id=alert_id,
            trigger_reason="Manual analytics generation for admin dashboard",
            trigger_message="Analytics generated via script for user shreeyan",
            current_risk_profile=current_risk_profile,
            priority="HIGH"
        )
        
        print(f"✅ Analytics created with ID: {analytics.id}")
        
        # Generate and save report
        print("\n📝 Generating report...")
        report = await collector.generate_and_save_report(
            student_id=student.student_id,
            analytics_id=analytics.id,
            alert_id=alert_id,
            report_type="CRISIS"
        )
        
        print(f"✅ Report created with ID: {report.id}")
        print(f"\n📋 Summary preview: {report.summary[:200]}...")
        
        print("\n✅ Successfully created analytics and reports for shreeyan!")
        print(f"   Analytics ID: {analytics.id}")
        print(f"   Report ID: {report.id}")
        print(f"   Student ID: {student.student_id}")
        
    except Exception as e:
        logger.error("script_failed", error=str(e), exc_info=True)
        print(f"❌ Error: {str(e)}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import asyncio
    asyncio.run(create_analytics_for_shreeyan())

