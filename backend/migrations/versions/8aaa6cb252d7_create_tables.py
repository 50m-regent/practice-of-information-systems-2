"""create tables

Revision ID: 8aaa6cb252d7
Revises: 
Create Date: 2025-06-24 14:55:27.875792

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision: str = '8aaa6cb252d7'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False, primary_key=True, autoincrement=True),
    sa.Column('email', sa.String(), nullable=False),
    sa.Column('username', sa.String(), nullable=False),
    sa.Column('date_of_birth', sa.DateTime(), nullable=True),
    sa.Column('sex', sa.Boolean(), nullable=True),
    sa.Column('friends', sqlite.JSON(), nullable=True),
    sa.Column('objective', sqlite.JSON(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('vitaldataname',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('objective',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('start_date', sa.DateTime(), nullable=False),
    sa.Column('end_date', sa.DateTime(), nullable=False),
    sa.Column('name_id', sa.Integer(), nullable=False),
    sa.Column('value', sa.Float(), nullable=False),
    sa.ForeignKeyConstraint(['name_id'], ['vitaldataname.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('otpcodes',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('otp_code', sa.String(), nullable=False),
    sa.Column('expires_at', sa.DateTime(), nullable=False),
    sa.Column('is_used', sa.Boolean(), nullable=False),
    sa.ForeignKeyConstraint(['id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('vitaldata',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('date', sa.DateTime(), nullable=False),
    sa.Column('name_id', sa.Integer(), nullable=False),
    sa.Column('value', sa.Float(), nullable=False),
    sa.Column('is_accumulating', sa.Boolean(), nullable=False),
    sa.Column('is_public', sa.Boolean(), nullable=False),
    sa.ForeignKeyConstraint(['name_id'], ['vitaldataname.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('vitaldata')
    op.drop_table('otpcodes')
    op.drop_table('objective')
    op.drop_table('vitaldataname')
    op.drop_table('users')
    # ### end Alembic commands ###
