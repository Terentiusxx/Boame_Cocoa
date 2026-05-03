from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.websocket.connect_manager import manager

# Helper to get the correct filter based on role
def get_role_filter(user_id: int, role: str):
    if role == "admin":
        return Notification.admin_id == user_id
    elif role == "expert":
        return Notification.expert_id == user_id
    return Notification.user_id == user_id

async def create_notification(db: Session, user_id: int, role: str, title: str, content: str):
    notif_data = {"title": title, "content": content}
    
    if role == "admin":
        notif_data["admin_id"] = user_id
    elif role == "expert":
        notif_data["expert_id"] = user_id
    else:
        notif_data["user_id"] = user_id

    db_notif = Notification(**notif_data)
    db.add(db_notif)
    db.commit()
    db.refresh(db_notif)

    unread_count = db.query(Notification).filter(
        get_role_filter(user_id, role),
        Notification.is_read == False
    ).count()

    client_id = f"{role}_{user_id}"
    await manager.send_message(client_id, {
        "type": "NEW_NOTIFICATION",
        "data": {"id": db_notif.id, "title": title, "content": content},
        "unread_count": unread_count
    })
    return db_notif

def get_user_notifications(db: Session, user_id: int, role: str):
    return db.query(Notification).filter(
        get_role_filter(user_id, role)
    ).order_by(Notification.created_at.desc()).all()

async def mark_all_user_notifications_read(db: Session, user_id: int, role: str):
    # Perform bulk update using role-specific filter
    db.query(Notification).filter(
        get_role_filter(user_id, role),
        Notification.is_read == False
    ).update({"is_read": True}, synchronize_session=False)
    
    db.commit()

    # Alert frontend that badge count is now 0
    client_id = f"{role}_{user_id}"
    await manager.send_message(client_id, {
        "type": "ALL_READ",
        "unread_count": 0
    })
    return True

async def delete_all_user_notifications(db: Session, user_id: int, role: str):
    # Perform bulk delete using role-specific filter
    db.query(Notification).filter(
        get_role_filter(user_id, role)
    ).delete(synchronize_session=False)
    
    db.commit()

    # Update UI instantly
    client_id = f"{role}_{user_id}"
    await manager.send_message(client_id, {
        "type": "NOTIFICATIONS_CLEARED",
        "unread_count": 0
    })
    return True
