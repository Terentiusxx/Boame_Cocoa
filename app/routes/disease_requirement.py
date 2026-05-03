from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app.schemas.disease_requirement import RequirementCreate, RequirementOut
from app.schemas.response import APIResponse
from app.auth.role_checker import role_checker
import app.crud.disease_requirement as crud

router = APIRouter()


# ---------------------------------------------------------
# Get All Requirements (Public)
# ---------------------------------------------------------
@router.get("/", response_model=APIResponse[List[RequirementOut]])
def list_requirements(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    try:
        requirements = crud.get_requirements(db, skip=skip, limit=limit)
        return APIResponse(
            success=True,
            message="Requirements fetched successfully",
            data=requirements
        )
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(
            success=False,
            message=f"Failed to fetch requirements: {str(e)}",
            data=None
        )


# ---------------------------------------------------------
# Get Requirements by Disease ID (Public)
# ---------------------------------------------------------
@router.get("/disease/{disease_id}", response_model=APIResponse[List[RequirementOut]])
def list_requirements_by_disease(
    disease_id: int,
    db: Session = Depends(get_db)
):
    try:
        requirements = crud.get_requirements_by_disease(db, disease_id)
        return APIResponse(
            success=True,
            message=f"Found {len(requirements)} requirements",
            data=requirements
        )
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(
            success=False,
            message=f"Failed: {str(e)}",
            data=None
        )


# ---------------------------------------------------------
# Get Single Requirement by ID (Public)
# ---------------------------------------------------------
@router.get("/{requirement_id}", response_model=APIResponse[RequirementOut])
def get_requirement(
    requirement_id: int,
    db: Session = Depends(get_db)
):
    try:
        req = crud.get_requirement(db, requirement_id)
        if not req:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Requirement not found"
            )
        return APIResponse(
            success=True,
            message="Requirement fetched successfully",
            data=req
        )
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(
            success=False,
            message=f"Failed: {str(e)}",
            data=None
        )


# ---------------------------------------------------------
# Create Requirement (Admin Only)
# ---------------------------------------------------------
@router.post(
    "/",
    response_model=APIResponse[RequirementOut],
    dependencies=[Depends(role_checker(["admin"]))]
)
def create_requirement(
    requirement: RequirementCreate,
    db: Session = Depends(get_db)
):
    try:
        new_req = crud.create_requirement(db, requirement)
        return APIResponse(
            success=True,
            message="Requirement created successfully",
            data=new_req
        )
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(
            success=False,
            message=f"Requirement creation failed: {str(e)}",
            data=None
        )


# ---------------------------------------------------------
# Update Requirement (Admin Only)
# ---------------------------------------------------------
@router.patch(
    "/{requirement_id}",
    response_model=APIResponse[RequirementOut],
    dependencies=[Depends(role_checker(["admin"]))]
)
def update_requirement(
    requirement_id: int,
    requirement_text: str,
    db: Session = Depends(get_db)
):
    try:
        updated = crud.update_requirement(db, requirement_id, requirement_text)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Requirement not found"
            )
        return APIResponse(
            success=True,
            message="Requirement updated successfully",
            data=updated
        )
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(
            success=False,
            message=f"Update failed: {str(e)}",
            data=None
        )


# ---------------------------------------------------------
# Delete Requirement (Admin Only)
# ---------------------------------------------------------
@router.delete(
    "/{requirement_id}",
    response_model=APIResponse,
    dependencies=[Depends(role_checker(["admin"]))]
)
def delete_requirement(
    requirement_id: int,
    db: Session = Depends(get_db)
):
    try:
        deleted = crud.delete_requirement(db, requirement_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Requirement not found"
            )
        return APIResponse(
            success=True,
            message="Requirement deleted successfully",
            data=None
        )
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(
            success=False,
            message=f"Deletion failed: {str(e)}",
            data=None
        )
