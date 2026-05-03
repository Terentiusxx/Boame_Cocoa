






from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List
from app.schemas.message import MessageCreate, MessageOut
from app.crud.message import create_message, get_messages_by_consultation, mark_message_as_read
from app.db import get_db
from app.schemas.response import APIResponse
from app.websocket.connect_manager import manager
from app.crud.notification import create_notification
from app.models.consult import Consultation
from app.models.message import Message
from app.auth.auth_bearer import get_current_user
from app.schemas.message import ConversationSummary

router = APIRouter(prefix="/messages", tags=["Messages"])


# =========================================================
# HELPERS
# =========================================================
def get_caller_id(current_user) -> int:
    """Get user ID regardless of role"""
    return (
        getattr(current_user, 'user_id', None)
        or getattr(current_user, 'expert_id', None)
        or getattr(current_user, 'admin_id', None)
    )


def validate_consultation_access(db: Session, consult_id: int, current_user) -> Consultation:
    """Ensure user/expert has access to this consultation"""
    caller_id = get_caller_id(current_user)
    consult = db.query(Consultation).filter(
        Consultation.consult_id == consult_id,
        (Consultation.user_id == caller_id) | (Consultation.expert_id == caller_id)
    ).first()
    
    if not consult:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this consultation")
    return consult


# =========================================================
# STATIC ROUTES FIRST
# =========================================================

#==============================================================#
#              CONVERSATIONS LIST (PAGINATED)                  #
#==============================================================#
# @router.get("/conversations", response_model=APIResponse[dict])
# def get_user_conversations(
#     db: Session = Depends(get_db),
#     current_user=Depends(get_current_user),
#     limit: int = Query(50, ge=1, le=100),
#     offset: int = Query(0, ge=0)
# ):
#     try:
#         caller_id = get_caller_id(current_user)

#         # Main query with subquery for unread count (more efficient)
#         conversations = db.query(
#             Consultation.consult_id.label('messageId'),
#             Consultation.expert_id,
#             func.coalesce(func.max(Message.content), 'No messages yet').label('lastMessage'),
#             func.coalesce(func.max(Message.created_at), Consultation.created_at).label('timestamp'),
#             func.coalesce(
#                 db.query(func.count(Message.id))
#                 .filter(
#                     Message.consultation_id == Consultation.consult_id,
#                     Message.is_read == False,
#                     Message.sender_id != caller_id
#                 )
#                 .correlate(Consultation)
#                 .as_scalar(),
#                 0
#             ).label('unreadCount')
#         ).outerjoin(
#             Message, Consultation.consult_id == Message.consultation_id
#         ).filter(
#             Consultation.user_id == caller_id
#         ).group_by(
#             Consultation.consult_id, Consultation.expert_id, Consultation.created_at
#         ).order_by(
#             desc(func.coalesce(func.max(Message.created_at), Consultation.created_at))
#         ).limit(limit).offset(offset).all()
# ... (all your imports and helpers stay the same)

@router.get("/conversations", response_model=APIResponse[dict])
def get_user_conversations(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    try:
        caller_id = get_caller_id(current_user)

        conversations = db.query(
            Consultation.consult_id.label('messageId'),
            Consultation.expert_id,
            func.coalesce(func.max(Message.content), 'No messages yet').label('lastMessage'),
            func.coalesce(func.max(Message.created_at), Consultation.created_at).label('timestamp'),
            func.coalesce(
                # ✅ FIXED: Use message_id (your actual PK)
                db.query(func.count(Message.message_id))
                .filter(
                    Message.consultation_id == Consultation.consult_id,
                    Message.is_read == False,
                    Message.sender_id != caller_id
                )
                .correlate(Consultation)
                .as_scalar(),
                0
            ).label('unreadCount')
        ).outerjoin(
            Message, Consultation.consult_id == Message.consultation_id
        ).filter(
            Consultation.user_id == caller_id
        ).group_by(
            Consultation.consult_id, Consultation.expert_id, Consultation.created_at
        ).order_by(
            desc(func.coalesce(func.max(Message.created_at), Consultation.created_at))
        ).limit(limit).offset(offset).all()

        # ... rest stays the same
        total = db.query(Consultation).filter(
            Consultation.user_id == caller_id
        ).count()

        return APIResponse(
            success=True,
            message=f"Found {len(conversations)} conversations",
            data={
                "conversations": conversations,
                "total": total,
                "limit": limit,
                "offset": offset
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch conversations: {str(e)}")


#==============================================================#
#                        SEND MESSAGE                          #
#==============================================================#
@router.post("/", response_model=APIResponse[MessageOut])
async def route_create_message(
    message: MessageCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        # Validate access
        consultation = validate_consultation_access(db, message.consultation_id, current_user)
        
        # Validate sender
        caller_id = get_caller_id(current_user)
        if message.sender_id != caller_id:
            raise HTTPException(status_code=403, detail="Cannot send as other user")
        
        # Content length validation
        if len(message.content) > 5000:
            raise HTTPException(status_code=400, detail="Message too long (max 5000 chars)")

        new_message = create_message(db, message)

        # WebSocket notifications
        notification_payload = {
            "type": "new_message",
            "consultation_id": message.consultation_id,
            "sender_id": message.sender_id,
            "content": message.content,
            "message_type": message.message_type
        }

        # Notify expert if exists
        if consultation.expert_id and message.sender_id != consultation.expert_id:
            await manager.send_message(f"expert_{consultation.expert_id}", notification_payload)
            await create_notification(
                db=db,
                user_id=consultation.expert_id,
                role="expert",
                title="New Message",
                content=f"New message on consultation #{message.consultation_id}"
            )

        # Notify user
        if message.sender_id != consultation.user_id:
            await manager.send_message(f"user_{consultation.user_id}", notification_payload)
            await create_notification(
                db=db,
                user_id=consultation.user_id,
                role="user",
                title="New Reply",
                content=f"New reply on consultation #{message.consultation_id}"
            )

        return APIResponse(success=True, message="Message sent successfully", data=new_message)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Message creation failed: {str(e)}")


#==============================================================#
#                 GET MESSAGES (PAGINATED)                     #
#==============================================================#
@router.get("/consultation/{consult_id}", response_model=APIResponse[dict])
def get_consultation_messages(
    consult_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        validate_consultation_access(db, consult_id, current_user)
        total = get_messages_by_consultation(db, consult_id, count_only=True)
        messages = get_messages_by_consultation(db, consult_id, skip=skip, limit=limit)
        
        return APIResponse(
            success=True,
            message=f"Found {len(messages)} of {total} messages",
            data={
                "messages": messages,
                "total": total,
                "skip": skip,
                "limit": limit
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch messages: {str(e)}")


#==============================================================#
#      MARK ALL MESSAGES IN CONSULTATION AS READ               #
#==============================================================#
@router.put("/consultation/{consult_id}/read-all", response_model=APIResponse[dict])
async def route_mark_all_messages_read(
    consult_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        validate_consultation_access(db, consult_id, current_user)
        
        caller_id = get_caller_id(current_user)
        unread_messages = db.query(Message).filter(
            Message.consultation_id == consult_id,
            Message.is_read == False,
            Message.sender_id != caller_id
        ).update({"is_read": True})
        db.commit()

        return APIResponse(
            success=True, 
            message=f"{unread_messages} messages marked as read", 
            data={"marked_count": unread_messages}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed: {str(e)}")


#==============================================================#
#     GET UNREAD MESSAGE COUNT                                 #
#==============================================================#
@router.get("/consultation/{consult_id}/unread-count", response_model=APIResponse[dict])
def get_unread_count(
    consult_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        validate_consultation_access(db, consult_id, current_user)
        caller_id = get_caller_id(current_user)

        count = db.query(Message).filter(
            Message.consultation_id == consult_id,
            Message.is_read == False,
            Message.sender_id != caller_id
        ).count()

        return APIResponse(
            success=True, 
            message="Unread count fetched", 
            data={"unread_count": count}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed: {str(e)}")


# =========================================================
# PARAMETERIZED ROUTES
# =========================================================

@router.put("/{message_id}/read", response_model=APIResponse[MessageOut])
async def route_mark_message_read(
    message_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        read_message = mark_message_as_read(db, message_id, current_user)
        return APIResponse(success=True, message="Message marked as read", data=read_message)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to mark message as read: {str(e)}")