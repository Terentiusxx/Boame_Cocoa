


from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app.schemas.treatment import TreatmentCreate, TreatmentUpdate, TreatmentOut
from app.schemas.response import APIResponse
from app.auth.auth_bearer import get_current_user
from app.auth.role_checker import role_checker
from app.models.treatment import Treatment
from app.models.disease import Disease
from app.models.scan import Scan
import app.crud.treatment as crud

router = APIRouter()


# =========================================================
# STATIC ROUTES FIRST
# =========================================================

#==============================================================#
#                     GET ALL TREATMENTS                       #
#==============================================================#
@router.get("/", response_model=APIResponse[List[TreatmentOut]])
def list_treatments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        treatments = crud.get_treatments(db, skip=skip, limit=limit)
        return APIResponse(success=True, message="Treatments fetched successfully", data=treatments)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=f"Failed: {str(e)}", data=None)


#==============================================================#
# GET TREATMENTS BY DISEASE NAME  ← MUST BE BEFORE /disease/{disease_id}
#==============================================================#
@router.get("/disease/name/{disease_name}", response_model=APIResponse[dict])
def get_treatments_by_disease_name(disease_name: str, db: Session = Depends(get_db)):
    try:
        disease = db.query(Disease).filter(
            Disease.name.ilike(f"%{disease_name}%")
        ).first()

        if not disease:
            return APIResponse(
                success=False,
                message=f"Disease '{disease_name}' not found in database",
                data=None
            )

        treatments = crud.get_treatments_by_disease(db, disease.disease_id)

        return APIResponse(
            success=True,
            message=f"Treatments for {disease.name} fetched successfully",
            data={
                "disease_id": disease.disease_id,
                "disease_name": disease.name,
                "description": disease.description,
                "treatments": [
                    {
                        "treatment_id": t.treatment_id,
                        "treatment_name": t.treatment_name,
                        "dosage": t.dosage,
                        "duration": t.duration,
                        "application_method": t.application_method
                    }
                    for t in treatments
                ]
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=f"Failed: {str(e)}", data=None)


#==============================================================#
#                 GET TREATMENT BY DISEASE ID                  #
#==============================================================#
@router.get("/disease/{disease_id}", response_model=APIResponse[List[TreatmentOut]])
def list_treatments_by_disease(disease_id: int, db: Session = Depends(get_db)):
    try:
        treatments = crud.get_treatments_by_disease(db, disease_id)
        return APIResponse(success=True, message="Treatments fetched successfully", data=treatments)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=f"Failed: {str(e)}", data=None)


#==============================================================#
# GET TREATMENTS BY SCAN ID                                    #
#==============================================================#
@router.get("/scan/{scan_id}", response_model=APIResponse[dict])
def get_treatments_by_scan(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        scan = db.query(Scan).filter(Scan.scan_id == scan_id).first()
        if not scan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")

        if not scan.disease_id:
            return APIResponse(success=False, message="No disease linked to this scan yet", data=None)

        disease = db.query(Disease).filter(Disease.disease_id == scan.disease_id).first()
        if not disease:
            return APIResponse(success=False, message="Disease not found in database", data=None)

        treatments = crud.get_treatments_by_disease(db, disease.disease_id)

        return APIResponse(
            success=True,
            message=f"Treatments for {disease.name} fetched successfully",
            data={
                "scan_id": scan_id,
                "disease_id": disease.disease_id,
                "disease_name": disease.name,
                "disease_description": disease.description,
                "confidence_score": scan.confidence_score,
                "urgency_level": scan.urgency_level,
                "treatments": [
                    {
                        "treatment_id": t.treatment_id,
                        "treatment_name": t.treatment_name,
                        "dosage": t.dosage,
                        "duration": t.duration,
                        "application_method": t.application_method
                    }
                    for t in treatments
                ],
                "total_treatments": len(treatments)
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=f"Failed: {str(e)}", data=None)


#==============================================================#
#           TREATMENT CAN ONLY BE CREATED BY ADMIN             #
#==============================================================#
@router.post("/", response_model=APIResponse[TreatmentOut], dependencies=[Depends(role_checker(["admin"]))])
def create_treatment(treatment: TreatmentCreate, db: Session = Depends(get_db)):
    try:
        new_treatment = crud.create_treatment(db, treatment)
        return APIResponse(success=True, message="Treatment created successfully", data=new_treatment)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=f"Treatment creation failed: {str(e)}", data=None)


# =========================================================
# PARAMETERIZED ROUTES LAST
# =========================================================

#==============================================================#
#                    GET SINGLE TREATMENT BY ID                #
#==============================================================#
@router.get("/{treatment_id}", response_model=APIResponse[TreatmentOut])
def get_treatment(treatment_id: int, db: Session = Depends(get_db)):
    try:
        treatment = crud.get_treatment(db, treatment_id)
        if not treatment:
            return APIResponse(success=False, message="Treatment not found", data=None)
        return APIResponse(success=True, message="Treatment fetched successfully", data=treatment)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=f"Failed: {str(e)}", data=None)


#==============================================================#
#           TREATMENT CAN ONLY BE UPDATED BY ADMIN             #
#==============================================================#
@router.patch("/{treatment_id}", response_model=APIResponse[TreatmentOut], dependencies=[Depends(role_checker(["admin"]))])
def update_treatment(treatment_id: int, treatment: TreatmentUpdate, db: Session = Depends(get_db)):
    try:
        updated = crud.update_treatment(db, treatment_id, treatment)
        if not updated:
            return APIResponse(success=False, message="Treatment not found", data=None)
        return APIResponse(success=True, message="Treatment updated successfully", data=updated)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=f"Update failed: {str(e)}", data=None)


#==============================================================#
#           TREATMENT CAN ONLY BE DELETED BY ADMIN             #
#==============================================================#
@router.delete("/{treatment_id}", response_model=APIResponse, dependencies=[Depends(role_checker(["admin"]))])
def delete_treatment(treatment_id: int, db: Session = Depends(get_db)):
    try:
        deleted = crud.delete_treatment(db, treatment_id)
        if not deleted:
            return APIResponse(success=False, message="Treatment not found", data=None)
        return APIResponse(success=True, message="Treatment deleted successfully", data=None)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=f"Deletion failed: {str(e)}", data=None)