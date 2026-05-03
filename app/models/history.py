from sqlalchemy import Column, Integer, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base

class History(Base):
    __tablename__ = "history"

    history_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    scan_id = Column(Integer, ForeignKey("scans.scan_id", ondelete="CASCADE"), nullable=False)
    viewed_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), index=True)

    user = relationship("User", back_populates="history")
    scan = relationship("Scan", back_populates="history")
