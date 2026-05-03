from pydantic import BaseModel, Field, ConfigDict
from typing import Literal, List
from datetime import datetime
from sqlalchemy import func
from app.models.consult import Consultation

class MessageBase(BaseModel):
    consultation_id: int = Field(..., gt=0)
    content: str = Field(..., max_length=5000, min_length=1)
    message_type: Literal["text", "image", "voice"] = "text"

class MessageCreate(MessageBase):
    sender_id: int = Field(..., gt=0)

class ConversationSummary(BaseModel):
    """List of conversations for frontend"""
    messageId: int          # consult_id
    expert_id: int | None
    lastMessage: str
    timestamp: datetime
    unreadCount: int

    model_config = ConfigDict(from_attributes=True)

class MessageOut(MessageBase):
    message_id: int
    sender_id: int
    is_read: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)