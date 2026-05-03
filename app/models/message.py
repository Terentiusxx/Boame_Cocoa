
from sqlalchemy import Column, Integer, String, Text, Boolean, TIMESTAMP, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.types import Enum
from enum import Enum as PyEnum
from app.db import Base


class MessageType(str, PyEnum):
    TEXT = "text"
    IMAGE = "image"
    VOICE = "voice"



class Message(Base):
    __tablename__ = "messages"

    message_id = Column(Integer, primary_key=True, index=True)
    consultation_id = Column(Integer, ForeignKey("consultations.consult_id", ondelete="CASCADE"), nullable=False)
    sender_id = Column(Integer)
    content = Column(Text)
    message_type = Column(String(20), default="text")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


    consultation = relationship("Consultation", back_populates="messages")


#     -- Add these indexes for performance
# CREATE INDEX idx_messages_consultation_read ON messages(consultation_id, is_read);
# CREATE INDEX idx_messages_consultation_time ON messages(consultation_id, created_at);
# CREATE INDEX idx_consultations_user ON consultations(user_id);
