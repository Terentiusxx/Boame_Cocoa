from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app.schemas.consult import ConsultationCreate, ConsultationUpdate, ConsultationOut
from app.crud.consult import (
    create_consultation,
    get_all_consultations,
    get_consultation_by_id,
    update_consultation,
    delete_consultation,
    get_consultations_by_user
)
from app.schemas.response import APIResponse
from app.auth.auth_bearer import get_current_user
from app.models.scan import Scan

router = APIRouter()


# =========================================================
# STATIC ROUTES FIRST — before /{consult_id}
# =========================================================

#==============================================================#
#                 CREATE CONSULTATION                          #
#==============================================================#
@router.post("/", response_model=APIResponse[ConsultationOut])
def route_create_consultation(
    consult: ConsultationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        scan = db.query(Scan).filter(Scan.scan_id == consult.scan_id).first()
        if not scan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")

        #new_consult = create_consultation(db, current_user.consult_id, consult)
        new_consult = create_consultation(db, current_user.user_id, consult)
        return APIResponse(success=True, message="Consultation created successfully", data=new_consult)

    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=f"Consultation creation failed: {str(e)}", data=None)


#==============================================================#
#                 GET ALL CONSULTATIONS                        #
#==============================================================#
@router.get("/", response_model=List[ConsultationOut])
def route_get_all_consultations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        return get_all_consultations(db, skip=skip, limit=limit)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch consultations: {str(e)}"
        )


#==============================================================#
#         GET CONSULTATIONS BY USER  ← BEFORE /{consult_id}   #
#==============================================================#
@router.get("/user/{user_id}", response_model=List[ConsultationOut])
def route_get_user_consultations(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        return get_consultations_by_user(db, user_id, skip=skip, limit=limit)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user consultations: {str(e)}"
        )


# =========================================================
# PARAMETERIZED ROUTES LAST
# =========================================================

#==============================================================#
#                 GET CONSULTATION BY ID                       #
#==============================================================#
@router.get("/{consult_id}", response_model=ConsultationOut)
def route_get_consultation(
    consult_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        return get_consultation_by_id(db, consult_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch consultation: {str(e)}"
        )


#==============================================================#
#                 UPDATE CONSULTATION                          #
#==============================================================#
@router.put("/{consult_id}", response_model=APIResponse[ConsultationOut])
def route_update_consultation(
    consult_id: int,
    consult_update: ConsultationUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        updated_consult = update_consultation(db, consult_id, consult_update)
        return APIResponse(success=True, message="Consultation updated successfully", data=updated_consult)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=f"Consultation update failed: {str(e)}", data=None)


#==============================================================#
#                 DELETE CONSULTATION                          #
#==============================================================#
@router.delete("/{consult_id}", response_model=APIResponse)
def route_delete_consultation(
    consult_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        delete_consultation(db, consult_id)
        return APIResponse(success=True, message="Consultation deleted successfully", data=None)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=f"Consultation deletion failed: {str(e)}", data=None)