from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100))
    content = Column(String(500))
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Multiple Optional Foreign Keys
    admin_id = Column(Integer, ForeignKey("admins.admin_id", ondelete="CASCADE"), nullable=True)
    expert_id = Column(Integer, ForeignKey("experts.expert_id", ondelete="CASCADE"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=True)

    # Relationships (Allows you to do notif.expert.first_name)
    admin = relationship("Admin", backref="notifications")
    expert = relationship("Expert", backref="notifications")
    user = relationship("User", backref="notifications")
