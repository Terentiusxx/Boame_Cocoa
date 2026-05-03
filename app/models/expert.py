from sqlalchemy import Column, Integer, String, Text, Boolean, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base

class Expert(Base):
    __tablename__ = "experts"

    expert_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(30), nullable=False)
    mid_name = Column(String(30))
    last_name = Column(String(30), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    telephone = Column(String(20), unique=True, nullable=False, index=True)
    password_hash = Column(Text, nullable=False)
    specialization = Column(String(100))
    organization = Column(String(120))
    bio = Column(Text)
    years_experienced = Column(Integer, default=0)
    license_id = Column(String(100), unique=True)
    license_doc_url = Column(String(500), nullable=True) 
    city = Column(String(100), nullable=True)
    region = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    image_url = Column(String(255), nullable=True)
    is_online = Column(Boolean, default=False)
    total_cases = Column(Integer, default=0)
    current_workload = Column(Integer, default=0)

    # verification system
    is_verified = Column(Boolean, default=False)
    verified_by_admin_id = Column(Integer, ForeignKey("admins.admin_id", ondelete="SET NULL"))
    verified_at = Column(DateTime)
    rating = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Relationships
    verified_by_admin = relationship("Admin", back_populates="verified_experts")
    consultations = relationship("Consultation", back_populates="expert", cascade="all, delete-orphan")