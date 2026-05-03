from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base

class Treatment(Base):
    __tablename__ = "treatments"
    treatment_id = Column(Integer, primary_key=True, index=True)
    disease_id = Column(Integer, ForeignKey("diseases.disease_id", ondelete="CASCADE"), nullable=False)
    treatment_name = Column(String(120), nullable=False)
    dosage = Column(String(100))
    duration = Column(String(100))
    application_method = Column(String(200))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    disease = relationship("Disease", back_populates="treatments")