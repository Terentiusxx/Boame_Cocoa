



from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.auth.auth_handler import hash_password
from app.crud.notification import create_notification  # For alerts


# =========================================
# CREATE USER
# =========================================
async def create_user(db: Session, user: UserCreate, force_role: str = None):
    email_normalized = user.email.strip().lower()

    # Check duplicate email
    if db.query(User).filter(User.email == email_normalized).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    # Check duplicate telephone
    if db.query(User).filter(User.telephone == user.telephone.strip()).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Telephone number already registered")

    role = force_role.capitalize() if force_role else "Customer"

    db_user = User(
        first_name=user.first_name.strip(),
        mid_name=user.mid_name.strip() if user.mid_name else None,
        last_name=user.last_name.strip(),
        email=email_normalized,
        telephone=user.telephone.strip(),
        password_hash=hash_password(user.password),
        role=role,
        city=user.city,
        region=user.region,
        country=user.country,
        image_url=user.image_url,      
        latitude=user.latitude,        
        longitude=user.longitude  
    )

    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        # Optional: Send a Welcome Notification
        await create_notification(
            db=db,
            user_id=db_user.user_id,
            role="user",
            title="Welcome!",
            content="Thanks for signing up to Boa Mi Cocoa!"
        )

        return db_user

    except IntegrityError as e:
        db.rollback()
        error_message = str(e.orig).lower()

        if "telephone" in error_message:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Telephone number already registered")
        elif "email" in error_message:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Database error: {str(e.orig)}")


# =========================================
# READ FUNCTIONS
# =========================================
def get_all_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()


def get_user_by_id(db: Session, user_id: int):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


# =========================================
# UPDATE USER
# =========================================
# async def update_user(db: Session, user_id: int, user_update: UserUpdate):
#     user = db.query(User).filter(User.user_id == user_id).first()
#     if not user:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

#     update_data = user_update.model_dump(exclude_none=True)

#     for key, value in update_data.items():
#         if isinstance(value, str):
#             value = value.strip()
#         if key == "password":
#             setattr(user, "password_hash", hash_password(value))
#         else:
#             setattr(user, key, value)

#     try:
#         db.commit()
#         db.refresh(user)
#         return user
#     except IntegrityError:
#         db.rollback()
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Update failed")

async def update_user(db: Session, user_id: int, user_update: UserUpdate):
    user = db.query(User).filter(User.user_id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # ✅ FIX: only take fields that were actually sent by frontend
    update_data = user_update.model_dump(exclude_unset=True)

    # Optional: normalize values
    cleaned_data = {}
    for key, value in update_data.items():
        if isinstance(value, str):
            value = value.strip()
            # treat empty strings as "not provided"
            if value == "":
                continue

        cleaned_data[key] = value

    # Apply updates
    for key, value in cleaned_data.items():

        # Handle password separately if ever added later
        if key == "password":
            user.password_hash = hash_password(value)
        else:
            setattr(user, key, value)

    try:
        db.commit()
        db.refresh(user)
        return user

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Update failed (possible duplicate email or telephone)"
        )




# =========================================
# DELETE USER
# =========================================
def delete_user(db: Session, user_id: int):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}





# from sqlalchemy.orm import Session
# from sqlalchemy.exc import IntegrityError
# from fastapi import HTTPException, status
# from app.models.user import User
# from app.schemas.user import UserUpdate
# from app.auth.auth_handler import hash_password


# async def update_user(db: Session, user_id: int, user_update: UserUpdate):
#     user = db.query(User).filter(User.user_id == user_id).first()

#     if not user:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="User not found"
#         )

#     # ✅ FIX: only take fields that were actually sent by frontend
#     update_data = user_update.model_dump(exclude_unset=True)

#     # Optional: normalize values
#     cleaned_data = {}
#     for key, value in update_data.items():
#         if isinstance(value, str):
#             value = value.strip()
#             # treat empty strings as "not provided"
#             if value == "":
#                 continue

#         cleaned_data[key] = value

#     # Apply updates
#     for key, value in cleaned_data.items():

#         # Handle password separately if ever added later
#         if key == "password":
#             user.password_hash = hash_password(value)
#         else:
#             setattr(user, key, value)

#     try:
#         db.commit()
#         db.refresh(user)
#         return user

#     except IntegrityError:
#         db.rollback()
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Update failed (possible duplicate email or telephone)"
#         )


