from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.consult import ConsultationStatus


# =========================================================#
#           BASE
# =========================================================#
class ConsultationBase(BaseModel):
    user_id: int
    scan_id: int
    expert_id: Optional[int] = None
    subject: str
    description: str
    priority: str = "Medium"
    status: ConsultationStatus = ConsultationStatus.OPEN


# =========================================================#
#           CREATE
# =========================================================#
class ConsultationCreate(ConsultationBase):
    pass


# =========================================================#
#           UPDATE
# =========================================================#
class ConsultationUpdate(BaseModel):
    expert_id: Optional[int] = None
    priority: Optional[str] = None
    status: Optional[ConsultationStatus] = None
    resolution_note: Optional[str] = None


# =========================================================#
#           RESPONSE
# =========================================================#
class ConsultationOut(ConsultationBase):
    consult_id: int
    created_at: datetime
    updated_at: datetime
    resolution_note: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# =========================================================#
#           MESSAGE BEFORE ACCEPT (NEW!)
# =========================================================#
class AcceptConsultation(BaseModel):
    """Required message before expert can accept"""
    message: str = Field(
        ..., 
        min_length=10, 
        max_length=500,
        description="Intro/welcome message to user"
    )


class MessageCreate(BaseModel):
    """Message for chat system"""
    consultation_id: int
    sender_id: int
    content: str = Field(..., max_length=1000)
    message_type: str = "text"


# =========================================================#
#           RESOLVE WITH NOTES (OPTIONAL)
# =========================================================#
class ResolveConsultation(BaseModel):
    """Optional notes when resolving"""
    resolution_notes: Optional[str] = Field(
        None, 
        max_length=2000,
        description="Final notes/analysis for user"
    )