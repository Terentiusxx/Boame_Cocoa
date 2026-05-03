from sqlalchemy.orm import Session
from app.models.disease_requirement import Requirement
from app.schemas.disease_requirement import RequirementCreate





def create_requirement(db: Session, requirement: RequirementCreate):
    db_requirement = Requirement(**requirement.model_dump())
    db.add(db_requirement)
    db.commit()
    db.refresh(db_requirement)
    return db_requirement



def get_requirement(db: Session, requirement_id: int):
    return db.query(Requirement).filter(Requirement.requirement_id == requirement_id).first()


def get_requirements_by_disease(db: Session, disease_id: int):
    return db.query(Requirement).filter(Requirement.disease_id == disease_id).all()


def get_requirements(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Requirement).offset(skip).limit(limit).all()




def update_requirement(db: Session, requirement_id: int, requirement_text: str):
    db_req = db.query(Requirement).filter(Requirement.requirement_id == requirement_id).first()
    if not db_req:
        return None
    db_req.requirement = requirement_text
    db.commit()
    db.refresh(db_req)
    return db_req


def delete_requirement(db: Session, requirement_id: int):
    db_req = db.query(Requirement).filter(Requirement.requirement_id == requirement_id).first()
    if not db_req:
        return None
    db.delete(db_req)
    db.commit()
    return db_req