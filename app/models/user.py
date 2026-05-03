from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(30), nullable=False)
    mid_name = Column(String(30))
    last_name = Column(String(30), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    telephone = Column(String(20), unique=True, nullable=False, index=True)
    password_hash = Column(Text, nullable=False)
    role = Column(String(20), default="Customer")
    city = Column(String(100), nullable=True)
    region = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    image_url = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), index=True)
    last_login = Column(TIMESTAMP(timezone=True))

    # Relationships
    scans = relationship("Scan", back_populates="user", cascade="all, delete")
    consultations = relationship("Consultation", back_populates="user", cascade="all, delete")
    history = relationship("History", back_populates="user", cascade="all, delete")