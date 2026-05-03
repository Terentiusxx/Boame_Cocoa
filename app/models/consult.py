# from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP
# from sqlalchemy.orm import relationship
# from sqlalchemy.sql import func
# from app.db import Base
# from enum import Enum

# class ConsultationStatus(str, Enum):
#     OPEN = "Open"
#     IN_PROGRESS = "In-Progress"
#     RESOLVED = "Resolved"
#     CLOSED = "Closed"

# class Consultation(Base):
#     __tablename__ = "consultations"

#     consult_id = Column(Integer, primary_key=True, index=True)
#     user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
#     scan_id = Column(Integer, ForeignKey("scans.scan_id", ondelete="CASCADE"), nullable=False)
#     expert_id = Column(Integer, ForeignKey("experts.expert_id", ondelete="SET NULL"))
#     subject = Column(String(200))
#     description = Column(Text)
#     priority = Column(String(20), default="Medium")
#     status = Column(String(20), default="Open")
#     resolution_note = Column(Text)
#     created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), index=True)
#     updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now(), index=True)

#     # Relationships
#     user = relationship("User", back_populates="consultations")
#     expert = relationship("Expert", back_populates="consultations")
#     scan = relationship("Scan", back_populates="consultations")
#     messages = relationship("Message", back_populates="consultation", cascade="all, delete")





from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy import Enum as SAEnum
from app.db import Base
import enum


# =========================================================#
#           CONSULTATION STATUS ENUM (SOURCE OF TRUTH)
# =========================================================#
class ConsultationStatus(str, enum.Enum):
    OPEN = "Open"
    IN_PROGRESS = "In-Progress"
    RESOLVED = "Resolved"
    CLOSED = "Closed"


# =========================================================#
#                   CONSULTATION MODEL
# =========================================================#
class Consultation(Base):
    __tablename__ = "consultations"

    consult_id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False
    )

    scan_id = Column(
        Integer,
        ForeignKey("scans.scan_id", ondelete="CASCADE"),
        nullable=False
    )

    expert_id = Column(
        Integer,
        ForeignKey("experts.expert_id", ondelete="SET NULL"),
        nullable=True
    )

    subject = Column(String(200))
    description = Column(Text)

    priority = Column(String(20), default="Medium")

    # ✅ FIX: enforce enum at DB level
    status = Column(
        SAEnum(ConsultationStatus, name="consultation_status"),
        default=ConsultationStatus.OPEN,
        nullable=False
    )

    resolution_note = Column(Text)

    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        index=True
    )

    updated_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        index=True
    )

    # Relationships
    user = relationship("User", back_populates="consultations")
    expert = relationship("Expert", back_populates="consultations")
    scan = relationship("Scan", back_populates="consultations")
    messages = relationship("Message", back_populates="consultation", cascade="all, delete")