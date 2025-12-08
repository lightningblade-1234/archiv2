"""Add is_admin field to students

Revision ID: a1b2c3d4e5f6
Revises: 7a7c8fd9ab99
Create Date: 2025-11-17 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '7a7c8fd9ab99'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add is_admin column to students table
    op.add_column('students', sa.Column('is_admin', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    # Remove is_admin column
    op.drop_column('students', 'is_admin')



