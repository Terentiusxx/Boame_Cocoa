






import os
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.admin import Admin
from app.schemas.admin import AdminOut, AdminCreate, AdminUpdate
from app.schemas.response import APIResponse
from app.crud.admin import (
    create_admin,
    get_all_admins as fetch_all_admins,
    get_admin_by_id,
    update_admin,
    delete_admin
)
from app.auth.auth_bearer import get_current_user
from app.auth.auth_handler import verify_password, hash_password
from app.security import validate_password_strength
from app.services.cloudinary_service import upload_image   # ← Cloudinary
from app.crud.check_account import check_email_exists


router = APIRouter()


# ========================================================= #
#                     ADMIN DASHBOARD                       #
# ========================================================= #
@router.get("/dashboard", response_model=APIResponse[dict])
def admin_dashboard(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        if current_user.role != "admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: Admins only")
        return APIResponse(
            success=True,
            message=f"Welcome {current_user.first_name}",
            data={
                "admin_id": current_user._id,
                "name": f"{current_user.first_name} {current_user.last_name}",
                "email": current_user.email,
                "role": current_user.role,
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=f"Dashboard failed: {str(e)}", data=None)


# ========================================================= #
#                 GET MY PROFILE                            #
# ========================================================= #
@router.get("/me", response_model=APIResponse[AdminOut])
def get_my_profile(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        if current_user.role != "admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: Admins only")
        admin = get_admin_by_id(db, current_user._id)
        return APIResponse(success=True, message="Profile fetched successfully", data=admin)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=f"Failed to fetch profile: {str(e)}", data=None)


# ========================================================= #
#                 CHANGE PASSWORD                           #
# ========================================================= #
@router.put("/me/password")
def change_admin_password(
    current_password: str = Form(...),
    new_password: str = Form(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        if current_user.role != "admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: Admins only")

        admin = get_admin_by_id(db, current_user._id)

        if not verify_password(current_password, admin.password_hash):
            raise HTTPException(
                status_code=400,
                detail="Current password is incorrect"
            )

        new_password = validate_password_strength(new_password)
        admin.password_hash = hash_password(new_password)

        db.commit()

        return {"success": True, "message": "Password updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        return {"success": False, "message": f"Password update failed: {str(e)}"}


# =========================================================#
#                 CREATE NEW ADMIN                         #
# =========================================================#
@router.post("/", response_model=APIResponse[AdminOut])
async def create_new_admin(
    first_name: str = Form(...),
    mid_name: Optional[str] = Form(None),
    last_name: str = Form(...),
    email: str = Form(...),
    telephone: str = Form(...),
    password: str = Form(...),
    image_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    try:
        existing_role = check_email_exists(db, email)

        if existing_role:
             raise HTTPException(
        status_code=400,
        detail=f"Email already registered as {existing_role}"
    )

        image_url = None
        if image_file:
            if not image_file.content_type.startswith("image/"):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid image file. Only images are allowed."
                )
            #image_url = await upload_image(image_file)   # ← Cloudinary
            image_url = await upload_image(image_file, folder="boa_mi_cocoa/admins")

        admin_data = AdminCreate(
            first_name=first_name,
            mid_name=mid_name,
            last_name=last_name,
            email=email,
            telephone=telephone,
            password=password,
            image_url=image_url
        )

        new_admin = await create_admin(db, admin_data)
        return APIResponse(success=True, message="Admin created successfully", data=new_admin)

    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=f"Admin creation failed: {str(e)}", data=None)


# ========================================================= #
#                 GET ALL ADMINS  (admin only)              #
# ========================================================= #
@router.get("/", response_model=APIResponse[List[AdminOut]])
def get_all_admins_route(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        if current_user.role != "admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: Admins only")
        admins = fetch_all_admins(db, skip, limit)
        return APIResponse(success=True, message="Admins fetched successfully", data=admins)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=f"Failed to fetch admins: {str(e)}", data=None)


# =========================================================
# PARAMETERIZED ROUTES LAST
# =========================================================

# ========================================================= #
#                 GET ADMIN BY ID                           #
# ========================================================= #
@router.get("/{admin_id}", response_model=APIResponse[AdminOut])
def get_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        if current_user.role != "admin" and current_user._id != admin_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        admin = get_admin_by_id(db, admin_id)
        if not admin:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found")
        return APIResponse(success=True, message="Admin fetched successfully", data=admin)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=f"Failed to fetch admin: {str(e)}", data=None)


# ========================================================= #
#                 UPDATE ADMIN                              #
# ========================================================= #
@router.put("/{admin_id}", response_model=APIResponse[AdminOut])
async def update_existing_admin(
    admin_id: int,
    first_name: Optional[str] = Form(None),
    mid_name: Optional[str] = Form(None),
    last_name: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    telephone: Optional[str] = Form(None),
    password: Optional[str] = Form(None),
    image_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        if current_user.role != "admin" and current_user._id != admin_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")

        update_data = {k: v for k, v in {
            "first_name": first_name,
            "mid_name": mid_name,
            "last_name": last_name,
            "email": email,
            "telephone": telephone,
            "password": password,
        }.items() if v is not None}

        if image_file:
            if not image_file.content_type.startswith("image/"):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid image file. Only images are allowed."
                )
            update_data["image_url"] = await upload_image(image_file)   # ← Cloudinary

        updated_admin = await update_admin(db, admin_id, AdminUpdate(**update_data))
        return APIResponse(success=True, message="Admin updated successfully", data=updated_admin)

    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=f"Admin update failed: {str(e)}", data=None)


# ========================================================= #
#                 DELETE ADMIN                              #
# ========================================================= #
@router.delete("/{admin_id}", response_model=APIResponse[bool])
def delete_existing_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        if current_user.role != "admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: Admins only")
        delete_admin(db, admin_id)
        return APIResponse(success=True, message="Admin deleted successfully", data=True)

    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=f"Admin deletion failed: {str(e)}", data=False)