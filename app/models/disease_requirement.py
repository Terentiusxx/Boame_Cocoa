from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base

class Requirement(Base):
    __tablename__ = "requirements"
    requirement_id = Column(Integer, primary_key=True)
    disease_id = Column(Integer, ForeignKey("diseases.disease_id"))
    requirement = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    #Relationship
    disease = relationship("Disease", back_populates="requirement")