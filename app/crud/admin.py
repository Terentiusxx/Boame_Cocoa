from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from app.models.admin import Admin
from app.schemas.admin import AdminCreate, AdminUpdate
from app.auth.auth_handler import hash_password
from app.crud.notification import create_notification  # Import for alerts

# =========================================
# CREATE ADMIN (Async for Notifications)
# =========================================
# async def create_admin(db: Session, admin: AdminCreate):
#     email_normalized = admin.email.strip().lower()

#     if db.query(Admin).filter(Admin.email == email_normalized).first():
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Email already registered"
#         )

#     db_admin = Admin(
#         first_name=admin.first_name.strip(),
#         last_name=admin.last_name.strip(),
#         email=email_normalized,
#         password_hash=hash_password(admin.password)
#     )

#     try:
#         db.add(db_admin)
#         db.commit()
#         db.refresh(db_admin)
        
#         # Optional: Send a WebSocket welcome to the new Admin
#         await create_notification(
#             db=db,
#             user_id=db_admin.admin_id,
#             role="admin",  # Important prefix for ConnectionManager
#             title="System Access",
#             content="Your Admin account has been activated."
#         )
        
#         return db_admin
#     except IntegrityError:
#         db.rollback()
#         raise HTTPException(status_code=400, detail="Failed to create admin")

async def create_admin(db: Session, admin: AdminCreate):
    email_normalized = admin.email.strip().lower()
    
    if db.query(Admin).filter(Admin.email == email_normalized).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    db_admin = Admin(
        first_name=admin.first_name.strip(),
        mid_name=admin.mid_name.strip() if admin.mid_name else None,  # ✅ added
        last_name=admin.last_name.strip(),
        email=email_normalized,
        telephone=admin.telephone.strip(),  # ✅ added
        password_hash=hash_password(admin.password),
        image_url=admin.image_url if hasattr(admin, 'image_url') else None  # ✅ added
    )

    try:
        db.add(db_admin)
        db.commit()
        db.refresh(db_admin)

        await create_notification(
            db=db,
            user_id=db_admin.admin_id,
            role="admin",
            title="System Access",
            content="Your Admin account has been activated."
        )
        return db_admin

    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create admin: {str(e.orig)}"  # ✅ shows real error
        )

# =========================================
# GET ALL ADMINS
# =========================================
def get_all_admins(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Admin).offset(skip).limit(limit).all()

# =========================================
# GET ADMIN BY ID
# =========================================
def get_admin_by_id(db: Session, admin_id: int):
    admin = db.query(Admin).filter(Admin.admin_id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    return admin

# =========================================
# UPDATE ADMIN
# =========================================
def update_admin(db: Session, admin_id: int, admin_update: AdminUpdate):
    admin = db.query(Admin).filter(Admin.admin_id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    # Use model_dump (Pydantic V2) to get updated fields
    update_data = admin_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        if key == "password":
            setattr(admin, "password_hash", hash_password(value))
        else:
            setattr(admin, key, value)

    try:
        db.commit()
        db.refresh(admin)
        return admin
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Update failed")

# =========================================
# DELETE ADMIN
# =========================================
def delete_admin(db: Session, admin_id: int):
    admin = db.query(Admin).filter(Admin.admin_id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    db.delete(admin)
    db.commit()
    return True
