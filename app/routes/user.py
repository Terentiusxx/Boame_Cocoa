
import os
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.user import UserOut, UserCreate, UserUpdate, PasswordUpdate
from app.schemas.response import APIResponse
from app.crud.user import (
    create_user,
    get_all_users as fetch_all_users,
    get_user_by_id,
    update_user,
    delete_user
)

from app.auth.auth_bearer import get_current_user
from app.auth.auth_handler import verify_password, hash_password
from app.security import validate_password_strength
from app.services.cloudinary_service import upload_image
from app.crud.check_account import check_email_exists

router = APIRouter()


# ========================================================= #
#                     USER DASHBOARD                        #
# ========================================================= #
@router.get("/dashboard", response_model=APIResponse[dict])
def user_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return APIResponse(
        success=True,
        message=f"Welcome {current_user.first_name}",
        data={
            "user_id": current_user.user_id,
            "name": f"{current_user.first_name} {current_user.last_name}",
            "email": current_user.email,
            "role": current_user.role,
            "city": current_user.city,
            "region": current_user.region,
            "country": current_user.country,
            "image_url": current_user.image_url
        }
    )


# # ========================================================= #
# #                 GET CURRENT USER (ME)                     #
# # ========================================================= #


@router.get("/me", response_model=APIResponse[UserOut])
def get_me(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        user = get_user_by_id(db, current_user.user_id)

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        return APIResponse(
            success=True,
            message="User fetched successfully",
            data=user
        )

    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(
            success=False,
            message=f"User fetch failed: {str(e)}",
            data=None
        )


# ========================================================= #
#                 CHANGE PASSWORD                           #
# ========================================================= #

@router.put("/me/password")
def change_password(
    current_password: str = Form(...),
    new_password: str = Form(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        user = get_user_by_id(db, current_user.user_id)

        if not verify_password(current_password, user.password_hash):
            raise HTTPException(
                status_code=400,
                detail="Current password is incorrect"
            )

        new_password = validate_password_strength(new_password)
        user.password_hash = hash_password(new_password)

        db.commit()

        return {
            "success": True,
            "message": "Password updated successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        return {
            "success": False,
            "message": f"Password update failed: {str(e)}"
        }



# ========================================================= #
#                 CREATE NEW USER                          #
# ========================================================= #

@router.post("/", response_model=APIResponse[UserOut])
async def create_new_user(
    first_name: str = Form(...),
    mid_name: Optional[str] = Form(None),
    last_name: str = Form(...),
    email: str = Form(...),
    telephone: str = Form(...),
    password: str = Form(...),
    city: Optional[str] = Form(None),
    region: Optional[str] = Form(None),
    country: Optional[str] = Form(None),
    latitude: Optional[float] = Form(0.0),
    longitude: Optional[float] = Form(0.0),
    image_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    try:
        existing_role = check_email_exists(db, email)

        if existing_role:
            raise HTTPException(
        status_code=400,
        detail=f"Email already registered as {existing_role}"
    )

        # -----------------------------
        # IMAGE VALIDATION + UPLOAD
        # -----------------------------
        image_url = None

        if image_file:
            # ✅ Validate file type
            if not image_file.content_type.startswith("image/"):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid image file. Only images are allowed."
                )

            # Upload to Cloudinary
            # Upload to Cloudinary
            image_url = await upload_image(image_file)
      

        # -----------------------------
        # CREATE USER DATA
        # -----------------------------
        user_data = UserCreate(
            first_name=first_name,
            mid_name=mid_name,
            last_name=last_name,
            email=email,
            telephone=telephone,
            password=password,
            city=city,
            region=region,
            country=country,
            latitude=latitude,
            longitude=longitude,
            image_url=image_url
        )

        new_user = await create_user(db, user_data)
    

   
        return APIResponse(
            success=True,
            message="User created successfully",
            data=new_user
        )

    except HTTPException:
        raise

    except Exception as e:
        return APIResponse(
            success=False,
            message=f"User creation failed: {str(e)}",
            data=None
        )

# ========================================================= #
#                 GET ALL USERS (ADMIN ONLY)               #
# ========================================================= #
@router.get("/", response_model=APIResponse[list[UserOut]])
def get_all_users_route(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        if current_user.role.lower() != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Admins only"
            )

        users = fetch_all_users(db)

        return APIResponse(
            success=True,
            message="Users fetched successfully",
            data=users
        )

    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(
            success=False,
            message=f"Fetch failed: {str(e)}",
            data=None
        )


# ========================================================= #
#                 GET USER BY ID                           #
# ========================================================= #
@router.get("/{user_id}", response_model=APIResponse[UserOut])
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        if current_user.role.lower() != "admin" and current_user.user_id != user_id:
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )

        user = get_user_by_id(db, user_id)

        return APIResponse(
            success=True,
            message="User fetched successfully",
            data=user
        )

    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(
            success=False,
            message=f"Fetch failed: {str(e)}",
            data=None
        )


# ========================================================= #
#                 UPDATE USER                              #
# ========================================================= #

@router.patch("/{user_id}", response_model=APIResponse[UserOut])
async def update_existing_user(
    user_id: int,
    first_name: Optional[str] = Form(None),
    mid_name: Optional[str] = Form(None),
    last_name: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    telephone: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    region: Optional[str] = Form(None),
    country: Optional[str] = Form(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    image_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:

        # -----------------------------
        # IMAGE HANDLING
        # -----------------------------
        update_data = {
            k: v for k, v in {
                "first_name": first_name,
                "mid_name": mid_name,
                "last_name": last_name,
                "email": email,
                "telephone": telephone,
                "city": city,
                "region": region,
                "country": country,
                "latitude": latitude,
                "longitude": longitude
            }.items() if v is not None
        }

        if image_file:
            # ✅ Validate file type
            if not image_file.content_type.startswith("image/"):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid image file. Only images are allowed."
                )

            # Upload to Cloudinary
            image_url = await upload_image(image_file)
            update_data["image_url"] = image_url

        updated_user = await update_user(
            db,
            user_id,
            UserUpdate(**update_data)
        )

        return APIResponse(
            success=True,
            message="User updated successfully",
            data=updated_user
        )

    except HTTPException:
        raise

    except Exception as e:
        return APIResponse(
            success=False,
            message=f"Update failed: {str(e)}",
            data=None
        )

# ========================================================= #
#                 DELETE USER                              #
# ========================================================= #
@router.delete("/{user_id}", response_model=APIResponse[bool])
def delete_existing_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    print("Current user:", current_user)
    try:
        if current_user.role.lower() != "admin" and current_user.user_id != user_id:
            raise HTTPException(
                status_code=403,
                detail="Permission denied"
            )

        delete_user(db, user_id)

        return APIResponse(
            success=True,
            message="User deleted successfully",
            data=True
        )

    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(
            success=False,
            message=f"Delete failed: {str(e)}",
            data=False
        )