



from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from app.models.consult import Consultation
from app.schemas.consult import ConsultationCreate, ConsultationUpdate

from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from app.models.consult import Consultation
from app.schemas.consult import ConsultationCreate, ConsultationUpdate
from app.models.notification import Notification 
import asyncio  # Add this import at top
# At top of file - add:
from app.crud.message import create_message


# 🔥 NEW IMPORTS FOR NOTIFICATIONS + WEBSOCKET
try:
    from app.crud.notification import create_notification
    from app.websocket.connect_manager import manager
    NOTIFICATIONS_ENABLED = True
except ImportError:
    print("⚠️  Notifications/WebSocket not available - disabling")
    NOTIFICATIONS_ENABLED = False

# -----------------------------
# CREATE
# -----------------------------
def create_consultation(db: Session, user_id: int, consultation: ConsultationCreate):
    db_consult = Consultation(
        user_id=user_id,
        scan_id=consultation.scan_id,
        expert_id=consultation.expert_id,
        subject=consultation.subject.strip(),
        description=consultation.description.strip(),
        priority=consultation.priority,
        status="Open"   # ✅ ALWAYS START HERE
    )

    try:
        db.add(db_consult)
        db.commit()
        db.refresh(db_consult)
        return db_consult

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create consultation"
        )


# -----------------------------
# READ
# -----------------------------
def get_consultation_by_id(db: Session, id: int):
    consult = db.query(Consultation).filter(Consultation.consult_id == id).first()
    if not consult:
        raise HTTPException(status_code=404, detail="Consultation not found")
    return consult


def get_all_consultations(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Consultation).offset(skip).limit(limit).all()


def get_consultations_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(Consultation).filter(Consultation.user_id == user_id).offset(skip).limit(limit).all()


def get_expert_consultations(db: Session, expert_id: int, skip: int = 0, limit: int = 100):
    return db.query(Consultation).filter(Consultation.expert_id == expert_id).offset(skip).limit(limit).all()


# -----------------------------
# UPDATE
# -----------------------------
def update_consultation(db: Session, consult_id: int, updates: ConsultationUpdate):
    consult = get_consultation_by_id(db, consult_id)

    update_data = updates.dict(exclude_unset=True)

    for key, value in update_data.items():
        if isinstance(value, str):
            value = value.strip()
        setattr(consult, key, value)

    try:
        db.commit()
        db.refresh(consult)
        return consult

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Update failed"
        )


# -----------------------------
# STATUS WORKFLOW (ENHANCED WITH NOTIFICATIONS)
# -----------------------------



def accept_consultation(db: Session, consult_id: int, expert_id: int):
    consult = get_consultation_by_id(db, consult_id)
    consult.expert_id = expert_id
    consult.status = "In-Progress"

    # 🔥 DIRECT NOTIFICATION
    notification = Notification(
        title="✅ Consultation Accepted!",
        content=f"Consultation #{consult_id} accepted by expert",
        user_id=consult.user_id,  # Direct field
        is_read=False
    )
    db.add(notification)
    
    db.commit()
    db.refresh(consult)
    return consult

def resolve_consultation(db: Session, consult_id: int, expert_id: int, resolution_notes: str = None):
    consult = get_consultation_by_id(db, consult_id)
    
    # 🔐 Authorization check
    if consult.expert_id != expert_id:
        raise HTTPException(status_code=403, detail="Not authorized to resolve this consultation")

    consult.status = "Resolved"
    if resolution_notes:
        consult.resolution_note = resolution_notes.strip()

    # 🔥 OPTIONAL: Notify user when resolved
    if NOTIFICATIONS_ENABLED:
        try:
            create_notification(
                db=db,
                user_id=consult.user_id,
                role="user",
                title="🏁 Consultation Resolved",
                content=f"Your consultation '{consult.subject}' (#{consult_id}) has been resolved!",
                type="consultation_resolved",
                consultation_id=consult_id
            )
            
            # Real-time WebSocket
            manager.send_message(f"user_{consult.user_id}", {
                "type": "consultation_resolved",
                "consultation_id": consult_id,
                "status": "Resolved"
            })
        except Exception as e:
            print(f"Resolve notification failed: {e}")

    db.commit()
    db.refresh(consult)
    return consult


def close_consultation(db: Session, consult_id: int):
    consult = get_consultation_by_id(db, consult_id)
    consult.status = "Closed"
    db.commit()
    db.refresh(consult)
    return consult


# -----------------------------
# DELETE
# -----------------------------
def delete_consultation(db: Session, consult_id: int):
    consult = get_consultation_by_id(db, consult_id)
    db.delete(consult)
    db.commit()
    return {"message": "Consultation deleted successfully"}