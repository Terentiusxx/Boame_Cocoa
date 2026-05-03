

import os
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.expert import ExpertOut, ExpertCreate, ExpertUpdate
from app.schemas.consult import ConsultationOut
from app.schemas.response import APIResponse
from app.crud.expert import (
    create_expert, get_all_experts, get_expert_by_id, update_expert,
    delete_expert, get_unverified_experts, get_nearby_experts,
    get_smart_experts, verify_expert
)
from app.crud.consult import (
    get_expert_consultations, get_consultation_by_id,
    accept_consultation, resolve_consultation
)
from app.auth.auth_bearer import get_current_user
from app.auth.auth_handler import verify_password, hash_password
from app.security import validate_password_strength
from app.services.cloudinary_service import upload_image, upload_bytes_to_cloudinary
from app.crud.check_account import check_email_exists
# Add these imports:
from app.schemas.consult import AcceptConsultation, MessageCreate  # Message schema
from app.crud.message import create_message  # Message CRUD

router = APIRouter()


# =========================================================
# STATIC ROUTES FIRST
# =========================================================

#=========================================================#
#                     EXPERT DASHBOARD                    #
#=========================================================#
@router.get("/dashboard", response_model=APIResponse[dict])
def expert_dashboard(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        expert = get_expert_by_id(db, current_user.expert_id)
        return APIResponse(success=True, message=f"Welcome {expert.first_name}", data={"expert_id": expert.expert_id})
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=f"Dashboard failed: {str(e)}", data=None)


#=========================================================#
#                  GET MY PROFILE                         #
#=========================================================#
@router.get("/me", response_model=APIResponse[ExpertOut])
def route_get_my_profile(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        expert = get_expert_by_id(db, current_user.expert_id)
        return APIResponse(success=True, message="Profile fetched", data=expert)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=str(e), data=None)


#=========================================================#
#                 CHANGE PASSWORD                         #
#=========================================================#
@router.put("/me/password")
def change_expert_password(
    current_password: str = Form(...),
    new_password: str = Form(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        expert = get_expert_by_id(db, current_user.expert_id)

        if not verify_password(current_password, expert.password_hash):
            raise HTTPException(
                status_code=400,
                detail="Current password is incorrect"
            )

        new_password = validate_password_strength(new_password)
        expert.password_hash = hash_password(new_password)

        db.commit()

        return {"success": True, "message": "Password updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        return {"success": False, "message": f"Password update failed: {str(e)}"}


#=========================================================#
#              GET NEARBY EXPERTS                         #
#=========================================================#
@router.get("/nearby", response_model=APIResponse[List[ExpertOut]])
def route_get_nearby_experts(lat: float, lng: float, db: Session = Depends(get_db)):
    try:
        experts = get_nearby_experts(db, lat, lng)
        return APIResponse(success=True, message="Nearby experts fetched", data=experts)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=str(e), data=None)


#=========================================================#
#              GET SMART EXPERTS                          #
#=========================================================#
@router.get("/smart", response_model=APIResponse[List[ExpertOut]])
def route_get_smart_experts(db: Session = Depends(get_db)):
    try:
        experts = get_smart_experts(db)
        return APIResponse(success=True, message="Smart experts fetched", data=experts)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=str(e), data=None)


#=========================================================#
#             GET UNVERIFIED EXPERTS                      #
#=========================================================#
@router.get("/unverified", response_model=APIResponse[List[ExpertOut]])
def route_get_unverified_experts(db: Session = Depends(get_db)):
    try:
        experts = get_unverified_experts(db)
        return APIResponse(success=True, message="Unverified experts fetched", data=experts)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=str(e), data=None)


#=========================================================#
#            EXPERT CONSULTATIONS                         #
#=========================================================#
@router.get("/consultations/my", response_model=APIResponse[List[ConsultationOut]])
def route_get_my_consultations(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        print(f"[DEBUG] current_user type: {type(current_user).__name__}")
        print(f"[DEBUG] current_user role: {current_user.role}")
        consultations = get_expert_consultations(db, current_user.expert_id)
        return APIResponse(success=True, message="My consultations fetched", data=consultations)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=str(e), data=None)


@router.get("/consultations/{consult_id}", response_model=APIResponse[ConsultationOut])
def route_get_consultation(consult_id: int, db: Session = Depends(get_db)):
    try:
        consult = get_consultation_by_id(db, consult_id)
        return APIResponse(success=True, message="Consultation fetched", data=consult)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=str(e), data=None)


# @router.patch("/consultations/{consult_id}/accept", response_model=APIResponse[ConsultationOut])
# def route_accept_consultation(consult_id: int, db: Session = Depends(get_db)):
#     try:
#         consult = accept_consultation(db, consult_id)
#         return APIResponse(success=True, message="Consultation accepted", data=consult)
#     except HTTPException:
#         raise
#     except Exception as e:
#         return APIResponse(success=False, message=str(e), data=None)


# @router.patch("/consultations/{consult_id}/resolve", response_model=APIResponse[ConsultationOut])
# def route_resolve_consultation(consult_id: int, db: Session = Depends(get_db)):
#     try:
#         consult = resolve_consultation(db, consult_id)
#         return APIResponse(success=True, message="Consultation resolved", data=consult)
#     except HTTPException:
#         raise
#     except Exception as e:
#         return APIResponse(success=False, message=str(e), data=None)
# @router.patch("/consultations/{consult_id}/accept", response_model=APIResponse[ConsultationOut])
# def route_accept_consultation(
#     consult_id: int, 
#     db: Session = Depends(get_db),
#     current_user=Depends(get_current_user)  # ← ADD THIS LINE
# ):
#     try:
#         consult = accept_consultation(db, consult_id, current_user.expert_id)  # ← PASS expert_id
#         return APIResponse(success=True, message="Consultation accepted", data=consult)
#     except HTTPException:
#         raise
#     except Exception as e:
#         return APIResponse(success=False, message=str(e), data=None)
from app.schemas.consult import AcceptConsultation  # Add import

# @router.patch("/consultations/{consult_id}/accept", response_model=APIResponse[ConsultationOut])
# def route_accept_consultation(
#     consult_id: int,
#     accept_data: AcceptConsultation,  # ← Message required!
#     db: Session = Depends(get_db),
#     current_user=Depends(get_current_user)
# ):
#     try:
#         # 🔥 STEP 1: Create welcome message FIRST
#         welcome_message = MessageCreate(
#             consultation_id=consult_id,
#             sender_id=current_user.expert_id,
#             content=f"Hi! {accept_data.message}",  # Use their message
#             message_type="text"
#         )
#         create_message(db, welcome_message)  # Notifies user instantly!
        
#         # 🔥 STEP 2: Accept consultation (your existing function)
#         consult = accept_consultation(db, consult_id, current_user.expert_id)
        
#         return APIResponse(
#             success=True,
#             message="✅ Accepted with welcome message!",
#             data=consult
#         )
#     except HTTPException:
#         raise
#     except Exception as e:
#         return APIResponse(success=False, message=str(e), data=None)
@router.patch("/consultations/{consult_id}/accept", response_model=APIResponse[ConsultationOut])
def route_accept_consultation(
    consult_id: int,
    accept_data: AcceptConsultation,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        # 1. Send welcome message (notifies user)
        welcome_msg = MessageCreate(
            consultation_id=consult_id,
            sender_id=current_user.expert_id,
            content=f"Hi! {accept_data.message}"
        )
        create_message(db, welcome_msg)
        
        # 2. Accept consultation (your notification)
        consult = accept_consultation(db, consult_id, current_user.expert_id)
        
        return APIResponse(
            success=True,
            message="✅ Accepted with welcome message!",
            data=consult
        )
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=str(e), data=None)

# @router.patch("/consultations/{consult_id}/resolve", response_model=APIResponse[ConsultationOut])
# def route_resolve_consultation(
#     consult_id: int, 
#     db: Session = Depends(get_db),
#     current_user=Depends(get_current_user)  # ← ADD THIS LINE
# ):
#     try:
#         consult = resolve_consultation(db, consult_id, current_user.expert_id)  # ← PASS expert_id
#         return APIResponse(success=True, message="Consultation resolved", data=consult)
#     except HTTPException:
#         raise
#     except Exception as e:
#         return APIResponse(success=False, message=str(e), data=None)
@router.patch("/consultations/{consult_id}/resolve", response_model=APIResponse[ConsultationOut])
def route_resolve_consultation(
    consult_id: int,
    resolution_notes: Optional[str] = None,  # ← Add optional notes
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        consult = resolve_consultation(
            db, 
            consult_id, 
            current_user.expert_id,
            resolution_notes  # ← Pass notes
        )
        return APIResponse(success=True, message="Consultation resolved", data=consult)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=str(e), data=None)

#=========================================================#
#                 CREATE EXPERT                           #
#=========================================================#
@router.post("/", response_model=APIResponse[ExpertOut])
async def route_create_expert(
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    telephone: str = Form(...),
    password: str = Form(...),
    city: Optional[str] = Form(None),
    specialization: str = Form(...),
    organization: str = Form(...),
    bio: str = Form(...),
    years_experienced: int = Form(...),
    license_id: str = Form(...),
    region: Optional[str] = Form(None),
    country: Optional[str] = Form(None),
    latitude: Optional[float] = Form(0.0),
    longitude: Optional[float] = Form(0.0),
    image_file: Optional[UploadFile] = File(None),
    license_document: UploadFile = File(...),
    db: Session = Depends(get_db)
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
                raise HTTPException(status_code=400, detail="Invalid image file. Only images are allowed.")
            image_url = await upload_image(image_file, folder="boa_mi_cocoa/experts")

        # ── License document upload ─────────────────────────
        license_doc_url = None
        if license_document:
            allowed_types = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
            if license_document.content_type not in allowed_types:
                raise HTTPException(
                    status_code=400,
                    detail="License document must be a PDF or image (JPG, PNG)."
                )
            doc_bytes = await license_document.read()
            resource_type = "raw" if license_document.content_type == "application/pdf" else "image"
            license_doc_url = upload_bytes_to_cloudinary(
                doc_bytes,
                folder="boa_mi_cocoa/experts/licenses",
                resource_type=resource_type
            )
        # ────────────────────────────────────────────────────

        expert_data = ExpertCreate(
            first_name=first_name,
            last_name=last_name,
            email=email,
            telephone=telephone,
            password=password,
            city=city,
            specialization=specialization,
            organization=organization,
            bio=bio,
            years_experienced=years_experienced,
            license_id=license_id,
            region=region,
            country=country,
            latitude=latitude,
            longitude=longitude,
            image_url=image_url,
            license_doc_url=license_doc_url
        )

        new_expert = await create_expert(db, expert_data)
        return APIResponse(success=True, message="Expert created", data=new_expert)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=f"Creation failed: {str(e)}", data=None)


#=========================================================#
#                GET ALL EXPERTS                          #
#=========================================================#
@router.get("/", response_model=APIResponse[List[ExpertOut]])
def route_get_all_experts(db: Session = Depends(get_db)):
    try:
        experts = get_all_experts(db)
        return APIResponse(success=True, message="Experts list fetched", data=experts)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=str(e), data=None)


# =========================================================
# PARAMETERIZED ROUTES LAST
# =========================================================

#=========================================================#
#                GET EXPERT BY ID                         #
#=========================================================#
@router.get("/{expert_id}", response_model=APIResponse[ExpertOut])
def route_get_expert(expert_id: int, db: Session = Depends(get_db)):
    try:
        expert = get_expert_by_id(db, expert_id)
        return APIResponse(success=True, message="Expert fetched", data=expert)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=str(e), data=None)


#=========================================================#
#                UPDATE EXPERT                            #
#=========================================================#
@router.put("/{expert_id}", response_model=APIResponse[ExpertOut])
async def route_update_expert(
    expert_id: int,
    first_name: Optional[str] = Form(None),
    last_name: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    telephone: Optional[str] = Form(None),
    password: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    specialization: Optional[str] = Form(None),
    organization: Optional[str] = Form(None),
    bio: Optional[str] = Form(None),
    years_experienced: Optional[int] = Form(None),
    license_id: Optional[str] = Form(None),
    region: Optional[str] = Form(None),
    country: Optional[str] = Form(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    image_file: Optional[UploadFile] = File(None),
    license_document: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        if current_user.role != "admin" and current_user.expert_id != expert_id:
            raise HTTPException(status_code=403, detail="Cannot update other experts")

        update_data = {k: v for k, v in {
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "telephone": telephone,
            "password": password,
            "city": city,
            "specialization": specialization,
            "organization": organization,
            "bio": bio,
            "years_experienced": years_experienced,
            "license_id": license_id,
            "region": region,
            "country": country,
            "latitude": latitude,
            "longitude": longitude
        }.items() if v is not None}

        if image_file:
            if not image_file.content_type.startswith("image/"):
                raise HTTPException(status_code=400, detail="Invalid image file. Only images are allowed.")
            update_data["image_url"] = await upload_image(image_file, folder="boa_mi_cocoa/experts")

        if license_document:
            allowed_types = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
            if license_document.content_type not in allowed_types:
                raise HTTPException(
                    status_code=400,
                    detail="License document must be a PDF or image (JPG, PNG)."
                )
            doc_bytes = await license_document.read()
            resource_type = "raw" if license_document.content_type == "application/pdf" else "image"
            update_data["license_doc_url"] = upload_bytes_to_cloudinary(
                doc_bytes,
                folder="boa_mi_cocoa/experts/licenses",
                resource_type=resource_type
            )

        updated_expert = await update_expert(db, expert_id, ExpertUpdate(**update_data))
        return APIResponse(success=True, message="Expert updated", data=updated_expert)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=f"Update failed: {str(e)}", data=None)


#=========================================================#
#                DELETE EXPERT                            #
#=========================================================#
@router.delete("/{expert_id}", response_model=APIResponse[bool])
def route_delete_expert(expert_id: int, db: Session = Depends(get_db)):
    try:
        delete_expert(db, expert_id)
        return APIResponse(success=True, message="Expert deleted", data=True)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=str(e), data=False)


#=========================================================#
#             VERIFY EXPERT                               #
#=========================================================#
@router.patch("/{expert_id}/verify", response_model=APIResponse[ExpertOut])
def route_verify_expert(expert_id: int, db: Session = Depends(get_db)):
    try:
        expert = verify_expert(db, expert_id)
        return APIResponse(success=True, message="Expert verified", data=expert)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=str(e), data=None)