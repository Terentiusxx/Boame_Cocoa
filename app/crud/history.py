from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from app.models.history import History
from app.models.scan import Scan
from app.schemas.history import HistoryItem


def add_history(db: Session, user_id: int, scan_id: int):
    existing = db.query(History).filter(History.user_id == user_id, History.scan_id == scan_id).first()
    if existing:
        return db.query(History).options(
            joinedload(History.scan).joinedload(Scan.disease)
        ).filter(History.history_id == existing.history_id).first()
    history_entry = History(user_id=user_id, scan_id=scan_id)
    db.add(history_entry)
    db.commit()
    return db.query(History).options(
        joinedload(History.scan).joinedload(Scan.disease)
    ).filter(History.history_id == history_entry.history_id).first()


def get_history_by_user(db: Session, user_id: int, limit: int = 50):
    return (
        db.query(History)
        .options(joinedload(History.scan).joinedload(Scan.disease))
        .filter(History.user_id == user_id)
        .order_by(History.viewed_at.desc())
        .limit(limit)
        .all()
    )


def delete_history(db: Session, history_id: int):
    entry = db.query(History).filter(History.history_id == history_id).first()
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="History entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "History entry deleted successfully"}