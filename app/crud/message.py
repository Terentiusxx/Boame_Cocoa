# from sqlalchemy.orm import Session
# from sqlalchemy.exc import IntegrityError
# from sqlalchemy.sql import func
from fastapi import HTTPException, status
# from app.models.message import Message
# from app.models.consult import Consultation
# from app.schemas.message import MessageCreate


# # -----------------------------
# # CREATE MESSAGE
# # -----------------------------
# def create_message(db: Session, message: MessageCreate):
#     db_message = Message(
#         consultation_id=message.consultation_id,
#         sender_id=message.sender_id,
#         content=message.content.strip(),
#         message_type=message.message_type
#     )

#     try:
#         db.add(db_message)
#         # update consultation updated_at timestamp
#         consultation = db.query(Consultation).filter(Consultation.consult_id == message.consultation_id).first()
#         if consultation:
#             consultation.updated_at = func.now()
#         db.commit()
#         db.refresh(db_message)
#     except IntegrityError:
#         db.rollback()
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create message")

#     return db_message


# # -----------------------------
# # GET MESSAGES BY CONSULTATION
# # -----------------------------
# def get_messages_by_consultation(db: Session, consult_id: int):
#     return db.query(Message).filter(Message.consultation_id == consult_id).order_by(Message.created_at.asc()).all()


# # -----------------------------
# # MARK MESSAGE AS READ
# # -----------------------------
# def mark_message_as_read(db: Session, message_id: int):
#     message = db.query(Message).filter(Message.message_id == message_id).first()
#     if not message:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
#     message.is_read = True
#     db.commit()
#     db.refresh(message)
#     return message




from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.message import Message
from app.schemas.message import MessageCreate
from app.auth.auth_bearer import get_current_user
from typing import List, Optional

def create_message(db: Session, message: MessageCreate) -> Message:
    db_message = Message(**message.dict())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def get_messages_by_consultation(
    db: Session, 
    consult_id: int, 
    skip: int = 0, 
    limit: int = None,
    count_only: bool = False
) -> List[Message] | int:
    query = db.query(Message).filter(Message.consultation_id == consult_id).order_by(Message.created_at.asc())
    
    if count_only:
        return query.count()
    
    if limit is not None:
        query = query.offset(skip).limit(limit)
    
    return query.all()

def mark_message_as_read(
    db: Session, 
    message_id: int, 
    current_user
) -> Message:
    caller_id = getattr(current_user, 'user_id', None) or getattr(current_user, 'expert_id', None)
    
    message = db.query(Message).filter(
        Message.message_id == message_id,
        Message.sender_id != caller_id  # Only mark others' messages as read
    ).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found or already read")
    
    message.is_read = True
    db.commit()
    db.refresh(message)
    return message