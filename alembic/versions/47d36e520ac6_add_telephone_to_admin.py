"""add telephone to admin

Revision ID: 47d36e520ac6
Revises: 3970c835536e
Create Date: 2026-03-31 19:26:20.739632

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '47d36e520ac6'
down_revision: Union[str, Sequence[str], None] = '3970c835536e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('admins', sa.Column('telephone', sa.String(length=20), nullable=True))
    op.execute("UPDATE admins SET telephone = '0000000000' WHERE telephone IS NULL")
    op.alter_column('admins', 'telephone', nullable=False)
    op.create_index(op.f('ix_admins_telephone'), 'admins', ['telephone'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_admins_telephone'), table_name='admins')
    op.drop_column('admins', 'telephone')
