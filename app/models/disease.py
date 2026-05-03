from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base

class Disease(Base):
    __tablename__ = "diseases"
    disease_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)
    symtoms = Column(Text, nullable=False)
    urgency_level = Column(String(50), index=True)
    image_url = Column(Text)
    icon_name = Column(String(50), nullable=False)
    color_hex = Column(String(20))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    requirement = relationship("Requirement", back_populates="disease", cascade="all, delete-orphan")
    scans = relationship("Scan", back_populates="disease", cascade="all, delete")
    treatments = relationship("Treatment", back_populates="disease", cascade="all, delete-orphan")