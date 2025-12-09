"""Standalone script to generate analytics for shreeyan using local LLM."""
import sys
import os
import asyncio

# Add app to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.db.database import SessionLocal
from app.models.student import Student
from app.models.analysis import Alert
from app.services.crisis.analytics_collector import CrisisAnalyticsCollector
from app.core.llm_client import LLMClient
from app.core.config import settings

print("🔍 Looking for student 'shreeyan'...")

db = SessionLocal()
try:
    # Find student
    student = db.query(Student).filter(
        (Student.name.ilike("%shreeyan%")) |
        (Student.email.ilike("%shreeyan%")) |
        (Student.student_id.ilike("%shreeyan%"))
    ).first()
    
    if not student:
        print("❌ Student not found. Available students:")
        for s in db.query(Student).all():
            print(f"   - {s.student_id}: {s.name} ({s.email})")
        sys.exit(1)
    
    print(f"✅ Found: {student.student_id} - {student.name}")
    
    # Force LOCAL LLM
    print(f"\n🤖 Using LOCAL LLM: {settings.local_llm_model} at {settings.local_llm_base_url}")
    llm_client = LLMClient(
        provider="local",
        base_url=settings.local_llm_base_url,
        model=settings.local_llm_model
    )
    
    collector = CrisisAnalyticsCollector(db, llm_client)
    
    alert = db.query(Alert).filter(Alert.student_id == student.student_id).order_by(Alert.created_at.desc()).first()
    alert_id = alert.id if alert else None
    
    current_risk_profile = {
        "overall_risk": "HIGH",
        "confidence": 0.85,
        "risk_factors": {"suicidal_ideation": "moderate", "depression_severity": "high"},
        "recommended_action": "Immediate counselor contact required"
    }
    
    print("\n📊 Collecting analytics...")
    analytics = asyncio.run(collector.collect_and_save_analytics(
        student_id=student.student_id,
        alert_id=alert_id,
        trigger_reason="Manual generation for admin dashboard",
        trigger_message="Generated for shreeyan",
        current_risk_profile=current_risk_profile,
        priority="HIGH"
    ))
    print(f"✅ Analytics ID: {analytics.id}")
    
    print("\n📝 Generating report with LOCAL LLM...")
    report = asyncio.run(collector.generate_and_save_report(
        student_id=student.student_id,
        analytics_id=analytics.id,
        alert_id=alert_id,
        report_type="CRISIS"
    ))
    print(f"✅ Report ID: {report.id}")
    print(f"\n📋 Summary: {report.summary[:300]}...")
    print("\n✅ Done! Check Admin Dashboard.")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
finally:
    db.close()


