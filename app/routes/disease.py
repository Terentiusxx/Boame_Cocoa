# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.orm import Session
# from typing import List
# from app.schemas.disease import DiseaseCreate, DiseaseUpdate, DiseaseOut
# from app.db import get_db
# from app.schemas.response import APIResponse
# from app.auth.auth_bearer import get_current_user
# from app.auth.role_checker import role_checker
# import app.crud.disease as crud

# router = APIRouter()


# # ---------------------------------------------------------
# # Get All Diseases (Public - anyone can view)
# # ---------------------------------------------------------
# @router.get("/", response_model=APIResponse[List[DiseaseOut]])
# def list_diseases(
#     skip: int = 0,
#     limit: int = 100,
#     db: Session = Depends(get_db)
# ):
#     try:
#         diseases = crud.get_diseases(db, skip=skip, limit=limit)
#         return APIResponse(
#             success=True,
#             message="Diseases fetched successfully",
#             data=diseases
#         )
#     except HTTPException:
#         raise
#     except Exception as e:
#         return APIResponse(
#             success=False,
#             message=f"Failed to fetch diseases: {str(e)}",
#             data=None
#         )


# # ---------------------------------------------------------
# # Search Disease by Name
# # Used by the frontend to search diseases
# # ---------------------------------------------------------
# @router.get("/search", response_model=APIResponse[List[DiseaseOut]])
# def search_diseases(
#     name: str,
#     db: Session = Depends(get_db)
# ):
#     try:
#         from app.models.disease import Disease
#         diseases = db.query(Disease).filter(
#             Disease.name.ilike(f"%{name}%")
#         ).all()

#         return APIResponse(
#             success=True,
#             message=f"Found {len(diseases)} diseases",
#             data=diseases
#         )
#     except HTTPException:
#         raise
#     except Exception as e:
#         return APIResponse(
#             success=False,
#             message=f"Search failed: {str(e)}",
#             data=None
#         )


# # ---------------------------------------------------------
# # Get Disease by ID (Public)
# # ---------------------------------------------------------
# @router.get("/{disease_id}", response_model=APIResponse[DiseaseOut])
# def get_disease(
#     disease_id: int,
#     db: Session = Depends(get_db)
# ):
#     try:
#         disease = crud.get_disease(db, disease_id)
#         if not disease:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="Disease not found"
#             )
#         return APIResponse(
#             success=True,
#             message="Disease fetched successfully",
#             data=disease
#         )
#     except HTTPException:
#         raise
#     except Exception as e:
#         return APIResponse(
#             success=False,
#             message=f"Failed to fetch disease: {str(e)}",
#             data=None
#         )


# # ---------------------------------------------------------
# # Create Disease (Admin Only)
# # ---------------------------------------------------------
# @router.post(
#     "/",
#     response_model=APIResponse[DiseaseOut],
#     dependencies=[Depends(role_checker(["admin"]))]
# )
# def create_disease(
#     disease: DiseaseCreate,
#     db: Session = Depends(get_db)
# ):
#     try:
#         existing = crud.get_disease_by_name(db, disease.name)
#         if existing:
#             return APIResponse(
#                 success=False,
#                 message="Disease with this name already exists",
#                 data=None
#             )
#         new_disease = crud.create_disease(db, disease)
#         return APIResponse(
#             success=True,
#             message="Disease created successfully",
#             data=new_disease
#         )
#     except HTTPException:
#         raise
#     except Exception as e:
#         return APIResponse(
#             success=False,
#             message=f"Disease creation failed: {str(e)}",
#             data=None
#         )


# # ---------------------------------------------------------
# # Update Disease (Admin Only)
# # ---------------------------------------------------------
# @router.patch(
#     "/{disease_id}",
#     response_model=APIResponse[DiseaseOut],
#     dependencies=[Depends(role_checker(["admin"]))]
# )
# def update_disease(
#     disease_id: int,
#     disease: DiseaseUpdate,
#     db: Session = Depends(get_db)
# ):
#     try:
#         updated = crud.update_disease(db, disease_id, disease)
#         if not updated:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="Disease not found"
#             )
#         return APIResponse(
#             success=True,
#             message="Disease updated successfully",
#             data=updated
#         )
#     except HTTPException:
#         raise
#     except Exception as e:
#         return APIResponse(
#             success=False,
#             message=f"Disease update failed: {str(e)}",
#             data=None
#         )


# # ---------------------------------------------------------
# # Delete Disease (Admin Only)
# # ---------------------------------------------------------
# @router.delete(
#     "/{disease_id}",
#     response_model=APIResponse,
#     dependencies=[Depends(role_checker(["admin"]))]
# )
# def delete_disease(
#     disease_id: int,
#     db: Session = Depends(get_db)
# ):
#     try:
#         deleted = crud.delete_disease(db, disease_id)
#         if not deleted:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="Disease not found"
#             )
#         return APIResponse(
#             success=True,
#             message="Disease deleted successfully",
#             data=None
#         )
#     except HTTPException:
#         raise
#     except Exception as e:
#         return APIResponse(
#             success=False,
#             message=f"Disease deletion failed: {str(e)}",
#             data=None
#         )



from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.schemas.disease import DiseaseCreate, DiseaseUpdate, DiseaseOut
from app.models.disease import Disease  # ✅ moved to top
from app.db import get_db
from app.schemas.response import APIResponse
from app.auth.auth_bearer import get_current_user
from app.auth.role_checker import role_checker
import app.crud.disease as crud

router = APIRouter()


@router.get("/", response_model=APIResponse[List[DiseaseOut]])
def list_diseases(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        diseases = crud.get_diseases(db, skip=skip, limit=limit)
        return APIResponse(success=True, message="Diseases fetched successfully", data=diseases)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=f"Failed to fetch diseases: {str(e)}", data=None)


@router.get("/search", response_model=APIResponse[List[DiseaseOut]])
def search_diseases(name: str, db: Session = Depends(get_db)):
    try:
        diseases = db.query(Disease).filter(Disease.name.ilike(f"%{name}%")).all()
        return APIResponse(success=True, message=f"Found {len(diseases)} diseases", data=diseases)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=f"Search failed: {str(e)}", data=None)


@router.get("/{disease_id}", response_model=APIResponse[DiseaseOut])
def get_disease(disease_id: int, db: Session = Depends(get_db)):
    try:
        disease = crud.get_disease(db, disease_id)
        if not disease:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Disease not found")
        return APIResponse(success=True, message="Disease fetched successfully", data=disease)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=f"Failed to fetch disease: {str(e)}", data=None)


@router.post("/", response_model=APIResponse[DiseaseOut], dependencies=[Depends(role_checker(["admin"]))])
def create_disease(disease: DiseaseCreate, db: Session = Depends(get_db)):
    try:
        existing = crud.get_disease_by_name(db, disease.name)
        if existing:
            return APIResponse(success=False, message="Disease with this name already exists", data=None)
        new_disease = crud.create_disease(db, disease)
        return APIResponse(success=True, message="Disease created successfully", data=new_disease)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=f"Disease creation failed: {str(e)}", data=None)


@router.patch("/{disease_id}", response_model=APIResponse[DiseaseOut], dependencies=[Depends(role_checker(["admin"]))])
def update_disease(disease_id: int, disease: DiseaseUpdate, db: Session = Depends(get_db)):
    try:
        updated = crud.update_disease(db, disease_id, disease)
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Disease not found")
        return APIResponse(success=True, message="Disease updated successfully", data=updated)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=f"Disease update failed: {str(e)}", data=None)


@router.delete("/{disease_id}", response_model=APIResponse, dependencies=[Depends(role_checker(["admin"]))])
def delete_disease(disease_id: int, db: Session = Depends(get_db)):
    try:
        deleted = crud.delete_disease(db, disease_id)
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Disease not found")
        return APIResponse(success=True, message="Disease deleted successfully", data=None)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=f"Disease deletion failed: {str(e)}", data=None)