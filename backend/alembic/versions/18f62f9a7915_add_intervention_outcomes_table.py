"""add_intervention_outcomes_table

Revision ID: 18f62f9a7915
Revises: f3d48bb5a1aa
Create Date: 2025-12-08 00:45:59.773552

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '18f62f9a7915'
down_revision = 'f3d48bb5a1aa'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create intervention_outcomes table
    op.create_table('intervention_outcomes',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('alert_id', sa.Integer(), nullable=False),
    sa.Column('student_id', sa.String(), nullable=False),
    sa.Column('counseling_engaged', sa.Boolean(), nullable=True),
    sa.Column('appointment_scheduled_at', sa.DateTime(), nullable=True),
    sa.Column('appointment_attended_at', sa.DateTime(), nullable=True),
    sa.Column('baseline_phq9', sa.Integer(), nullable=True),
    sa.Column('followup_phq9', sa.Integer(), nullable=True),
    sa.Column('symptom_improved', sa.Boolean(), nullable=True),
    sa.Column('improvement_magnitude', sa.Integer(), nullable=True),
    sa.Column('trajectory_slope', sa.Float(), nullable=True),
    sa.Column('sustained_improvement', sa.Boolean(), nullable=True),
    sa.Column('still_enrolled_next_semester', sa.Boolean(), nullable=True),
    sa.Column('subsequent_crisis_count', sa.Integer(), nullable=True, server_default=sa.text('0')),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['alert_id'], ['alerts.id'], ),
    sa.ForeignKeyConstraint(['student_id'], ['students.student_id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_intervention_outcomes_id'), 'intervention_outcomes', ['id'], unique=False)


def downgrade() -> None:
    # Drop intervention_outcomes table
    op.drop_index(op.f('ix_intervention_outcomes_id'), table_name='intervention_outcomes')
    op.drop_table('intervention_outcomes')
