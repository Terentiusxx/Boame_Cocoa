from sqlalchemy import Column, Integer, String, Float, Text, TIMESTAMP, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base

class Scan(Base):
    __tablename__ = "scans"

    scan_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    disease_id = Column(Integer, ForeignKey("diseases.disease_id", ondelete="SET NULL"))
    image_url = Column(Text, nullable=True, default=None)
    audio_url = Column(String, nullable=True)
    custom_label = Column(String(120))
    confidence_score = Column(Float)
    urgency_level = Column(String(20))
    latitude = Column(Float)
    longitude = Column(Float)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), index=True)

    # Relationships
    user = relationship("User", back_populates="scans")
    disease = relationship("Disease", back_populates="scans")
    consultations = relationship("Consultation", back_populates="scan", cascade="all, delete")
    history = relationship("History", back_populates="scan", cascade="all, delete")



