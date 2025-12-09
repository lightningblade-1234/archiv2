"""add_crisis_analytics_and_reports

Revision ID: bc4668787e80
Revises: 18f62f9a7915
Create Date: 2025-12-09 15:58:23.314939

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'bc4668787e80'
down_revision = '18f62f9a7915'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create crisis_analytics table
    op.create_table('crisis_analytics',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('student_id', sa.String(), nullable=False),
    sa.Column('alert_id', sa.Integer(), nullable=True),
    sa.Column('student_profile', postgresql.JSON(astext_type=sa.Text()), nullable=False),
    sa.Column('recent_messages', postgresql.JSON(astext_type=sa.Text()), nullable=True),
    sa.Column('message_analyses', postgresql.JSON(astext_type=sa.Text()), nullable=True),
    sa.Column('risk_profiles', postgresql.JSON(astext_type=sa.Text()), nullable=True),
    sa.Column('current_risk_profile', postgresql.JSON(astext_type=sa.Text()), nullable=True),
    sa.Column('assessments', postgresql.JSON(astext_type=sa.Text()), nullable=True),
    sa.Column('temporal_patterns', postgresql.JSON(astext_type=sa.Text()), nullable=True),
    sa.Column('session_summary', postgresql.JSON(astext_type=sa.Text()), nullable=True),
    sa.Column('behavioral_metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
    sa.Column('priority', sa.String(), nullable=True),
    sa.Column('trigger_reason', sa.String(), nullable=False),
    sa.Column('trigger_message', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['alert_id'], ['alerts.id'], ),
    sa.ForeignKeyConstraint(['student_id'], ['students.student_id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_crisis_analytics_id'), 'crisis_analytics', ['id'], unique=False)
    op.create_index(op.f('ix_crisis_analytics_student_id'), 'crisis_analytics', ['student_id'], unique=False)
    
    # Create crisis_reports table
    op.create_table('crisis_reports',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('student_id', sa.String(), nullable=False),
    sa.Column('analytics_id', sa.Integer(), nullable=True),
    sa.Column('alert_id', sa.Integer(), nullable=True),
    sa.Column('summary', sa.String(), nullable=False),
    sa.Column('key_findings', postgresql.JSON(astext_type=sa.Text()), nullable=True),
    sa.Column('recommended_actions', postgresql.JSON(astext_type=sa.Text()), nullable=True),
    sa.Column('report_type', sa.String(), nullable=True),
    sa.Column('generated_by', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['alert_id'], ['alerts.id'], ),
    sa.ForeignKeyConstraint(['analytics_id'], ['crisis_analytics.id'], ),
    sa.ForeignKeyConstraint(['student_id'], ['students.student_id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_crisis_reports_id'), 'crisis_reports', ['id'], unique=False)
    op.create_index(op.f('ix_crisis_reports_student_id'), 'crisis_reports', ['student_id'], unique=False)


def downgrade() -> None:
    # Drop crisis_reports table
    op.drop_index(op.f('ix_crisis_reports_student_id'), table_name='crisis_reports')
    op.drop_index(op.f('ix_crisis_reports_id'), table_name='crisis_reports')
    op.drop_table('crisis_reports')
    
    # Drop crisis_analytics table
    op.drop_index(op.f('ix_crisis_analytics_student_id'), table_name='crisis_analytics')
    op.drop_index(op.f('ix_crisis_analytics_id'), table_name='crisis_analytics')
    op.drop_table('crisis_analytics')




