from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base

class Admin(Base):
    __tablename__ = "admins"

    admin_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(30), nullable=False)
    mid_name = Column(String(30), nullable=True)
    last_name = Column(String(30), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(Text, nullable=False)
    telephone = Column(String(20), unique=True, nullable=False, index=True)
    role = Column(String(20), default="Admin")
    image_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    last_login = Column(DateTime(timezone=True))


    # Admin verifies experts
    verified_experts = relationship("Expert", back_populates="verified_by_admin", passive_deletes=True)