from sqlalchemy.orm import Session
from app.models.user import User
from app.models.expert import Expert
from app.models.admin import Admin


def check_email_exists(db: Session, email: str):
    """
    Checks if an email exists in ANY account table.
    Returns role if found, otherwise None.
    """

    user = db.query(User).filter(User.email == email).first()
    if user:
        return "user"

    expert = db.query(Expert).filter(Expert.email == email).first()
    if expert:
        return "expert"

    admin = db.query(Admin).filter(Admin.email == email).first()
    if admin:
        return "admin"

    return None