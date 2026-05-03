from sqlalchemy.orm import Session
from app.models.disease import Disease
from app.schemas.disease import DiseaseCreate, DiseaseUpdate



def create_disease(db: Session, disease: DiseaseCreate):
    db_disease = Disease(**disease.model_dump())
    db.add(db_disease)
    db.commit()
    db.refresh(db_disease)
    return db_disease


def get_disease(db: Session, disease_id: int):
    return db.query(Disease).filter(Disease.disease_id == disease_id).first()


def get_disease_by_name(db: Session, name: str):
    return db.query(Disease).filter(Disease.name == name).first()


def get_diseases(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Disease).offset(skip).limit(limit).all()



def update_disease(db: Session, disease_id: int, disease: DiseaseUpdate):
    db_disease = db.query(Disease).filter(Disease.disease_id == disease_id).first()
    if not db_disease:
        return None
    update_data = disease.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_disease, key, value)
    db.commit()
    db.refresh(db_disease)
    return db_disease


def delete_disease(db: Session, disease_id: int):
    db_disease = db.query(Disease).filter(Disease.disease_id == disease_id).first()
    if not db_disease:
        return None
    db.delete(db_disease)
    db.commit()
    return db_disease