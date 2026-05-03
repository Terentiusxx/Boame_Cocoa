from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.auth.auth_bearer import JWTBearer
from app.models.user import User
from app.models.expert import Expert
from app.models.admin import Admin


def get_current_user(payload: dict = Depends(JWTBearer), db: Session = Depends(get_db)):

    user_id = payload.get("user_id")
    role = payload.get("role")

    if role == "Customer":
        user = db.query(User).filter(User.user_id == user_id).first()
    elif role == "Expert":
        user = db.query(Expert).filter(Expert.expert_id == user_id).first()
    elif role == "Admin":
        user = db.query(Admin).filter(Admin.admin_id == user_id).first()
    else:
        raise HTTPException(status_code=401, detail="Invalid role")

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user