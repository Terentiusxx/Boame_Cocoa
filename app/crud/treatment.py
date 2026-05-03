from sqlalchemy.orm import Session
from app.models.treatment import Treatment
from app.schemas.treatment import TreatmentCreate, TreatmentUpdate


def get_treatment(db: Session, treatment_id: int):
    return db.query(Treatment).filter(Treatment.treatment_id == treatment_id).first()


def get_treatments_by_disease(db: Session, disease_id: int):
    return db.query(Treatment).filter(Treatment.disease_id == disease_id).all()


def get_treatments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Treatment).offset(skip).limit(limit).all()


def create_treatment(db: Session, treatment: TreatmentCreate):
    db_treatment = Treatment(**treatment.model_dump())
    db.add(db_treatment)
    db.commit()
    db.refresh(db_treatment)
    return db_treatment


def update_treatment(db: Session, treatment_id: int, treatment: TreatmentUpdate):
    db_treatment = db.query(Treatment).filter(Treatment.treatment_id == treatment_id).first()
    if not db_treatment:
        return None
    update_data = treatment.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_treatment, key, value)
    db.commit()
    db.refresh(db_treatment)
    return db_treatment


def delete_treatment(db: Session, treatment_id: int):
    db_treatment = db.query(Treatment).filter(Treatment.treatment_id == treatment_id).first()
    if not db_treatment:
        return None
    db.delete(db_treatment)
    db.commit()
    return db_treatment