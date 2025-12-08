"""add_outcome_tracking_to_alerts

Revision ID: f3d48bb5a1aa
Revises: a1b2c3d4e5f6
Create Date: 2025-12-08 00:44:43.329918

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'f3d48bb5a1aa'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add outcome tracking columns to alerts table
    op.add_column('alerts', sa.Column('counseling_appointment_scheduled', sa.Boolean(), nullable=True, server_default=sa.text('false')))
    op.add_column('alerts', sa.Column('counseling_appointment_attended', sa.Boolean(), nullable=True))
    op.add_column('alerts', sa.Column('appointment_scheduled_at', sa.DateTime(), nullable=True))
    op.add_column('alerts', sa.Column('appointment_attended_at', sa.DateTime(), nullable=True))


def downgrade() -> None:
    # Remove outcome tracking columns from alerts table
    op.drop_column('alerts', 'appointment_attended_at')
    op.drop_column('alerts', 'appointment_scheduled_at')
    op.drop_column('alerts', 'counseling_appointment_attended')
    op.drop_column('alerts', 'counseling_appointment_scheduled')
