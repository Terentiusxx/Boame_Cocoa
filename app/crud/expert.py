from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from sqlalchemy import func
from datetime import datetime
from app.models.expert import Expert
from app.schemas.expert import ExpertCreate, ExpertUpdate, ExpertVerify
from app.auth.auth_handler import hash_password
from app.crud.notification import create_notification
import random
from math import radians, cos, sin, sqrt, atan2

# =========================================
# CREATE EXPERT
# =========================================
async def create_expert(db: Session, expert: ExpertCreate):
    email_normalized = expert.email.strip().lower()

    if db.query(Expert).filter(Expert.email == email_normalized).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    db_expert = Expert(
        first_name=expert.first_name.strip(),
        mid_name=expert.mid_name.strip() if expert.mid_name else None,
        last_name=expert.last_name.strip(),
        email=email_normalized,
        telephone=expert.telephone.strip(),
        password_hash=hash_password(expert.password),
        specialization=expert.specialization,
        organization=expert.organization,
        bio=expert.bio,
        years_experienced=expert.years_experienced,
        license_id=expert.license_id,
        license_doc_url =expert.license_doc_url,
        city=expert.city,
        region=expert.region,
        country=expert.country,
        image_url=expert.image_url,      
        latitude=expert.latitude,       
        longitude=expert.longitude  
    )

    try:
        db.add(db_expert)
        db.commit()
        db.refresh(db_expert)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create expert (duplicate email, telephone or license_id)"
        )

    return db_expert


# =========================================
# GET UNVERIFIED EXPERTS
# =========================================
def get_unverified_experts(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Expert).filter(Expert.is_verified == False).offset(skip).limit(limit).all()


# =========================================
# GET ALL EXPERTS
# =========================================
def get_all_experts(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Expert).offset(skip).limit(limit).all()


# =========================================
# GET EXPERT BY ID
# =========================================
def get_expert_by_id(db: Session, expert_id: int):
    expert = db.query(Expert).filter(Expert.expert_id == expert_id).first()
    if not expert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expert not found"
        )
    return expert


# =========================================
# GET EXPERT BY EMAIL
# =========================================
def get_expert_by_email(db: Session, email: str):
    email_normalized = email.strip().lower()
    return db.query(Expert).filter(Expert.email == email_normalized).first()


# =========================================
# UPDATE EXPERT
# =========================================
def update_expert(db: Session, expert_id: int, expert_update: ExpertUpdate):
    expert = db.query(Expert).filter(Expert.expert_id == expert_id).first()
    if not expert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expert not found"
        )

    update_data = expert_update.dict(exclude_unset=True)
    if "email" in update_data:
        update_data["email"] = update_data["email"].strip().lower()

    for key, value in update_data.items():
        if isinstance(value, str):
            value = value.strip()
        if key == "password":
            setattr(expert, "password_hash", hash_password(value))
        else:
            setattr(expert, key, value)

    try:
        db.commit()
        db.refresh(expert)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Update failed (possible duplicate email, telephone, or license_id)"
        )

    return expert


# =========================================
# VERIFY EXPERT (ADMIN)
# =========================================
async def verify_expert(db: Session, expert_id: int, admin_id: int, verification: ExpertVerify):
    expert = db.query(Expert).filter(Expert.expert_id == expert_id).first()
    if not expert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expert not found"
        )

    expert.is_verified = verification.is_verified
    expert.verified_by_admin_id = admin_id
    expert.verified_at = datetime.utcnow() if verification.is_verified else None

    db.commit()
    db.refresh(expert)

    # SEND REAL-TIME NOTIFICATION
    if verification.is_verified:
        await create_notification(
            db=db,
            user_id=expert_id,
            role="expert",
            title="Account Verified!",
            content="Congratulations! Your profile has been approved by an admin."
        )

    return expert


# =========================================
# DELETE EXPERT
# =========================================
def delete_expert(db: Session, expert_id: int):
    expert = db.query(Expert).filter(Expert.expert_id == expert_id).first()
    if not expert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expert not found"
        )

    db.delete(expert)
    db.commit()
    return {"message": "Expert deleted successfully"}


# =========================================
# DISTANCE CALCULATION
# =========================================
def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c


# =========================================
# SMART EXPERT SELECTION
# =========================================
def get_smart_expert(db: Session, user_lat: float, user_lon: float, specialization: str = None, max_distance_km: float = 50):
    experts = db.query(Expert).filter(
        Expert.is_verified == True,
        Expert.latitude != None,
        Expert.longitude != None
    )

    if specialization:
        experts = experts.filter(Expert.specialization.ilike(f"%{specialization}%"))

    scored_experts = []
    for expert in experts:
        if expert.latitude and expert.longitude:
            distance = calculate_distance(user_lat, user_lon, expert.latitude, expert.longitude)
            score = (
                (5 - expert.rating) * 2 +   # rating priority
                expert.current_workload +   # workload balance
                distance * 0.1              # distance weight
            )
            scored_experts.append((expert, score))

    scored_experts.sort(key=lambda x: x[1])
    return scored_experts[0][0] if scored_experts else None


# =========================================
# ALIASES for backward compatibility
# =========================================
get_smart_experts = get_smart_expert
get_nearby_experts = get_smart_expert