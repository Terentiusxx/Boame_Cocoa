# create_tables.py
from sqlalchemy import text
from app.db import engine, Base

# -----------------------------
# Import all models in dependency order
# -----------------------------
from app.models.admin import Admin
from app.models.user import User
from app.models.expert import Expert
from app.models.disease import Disease
from app.models.scan import Scan
from app.models.consult import Consultation
from app.models.history import History
from app.models.treatment import Treatment
from app.models.notification import Notification
from app.models.disease_requirement import Requirement
from app.models.message import Message

def main():
    print("Using database:", engine.url)

    # -----------------------------
    # Drop all tables safely
    # -----------------------------
    with engine.connect() as conn:
        print("Dropping all tables with CASCADE...")
        conn.execute(text("DROP SCHEMA public CASCADE;"))
        conn.execute(text("CREATE SCHEMA public;"))
        conn.commit()

    # -----------------------------
    # Recreate all tables
    # -----------------------------
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)

    # -----------------------------
    # Reset sequences for serial IDs (only if they exist)
    # -----------------------------
    with engine.connect() as conn:
        print("Resetting sequences...")
        sequences = [
            "admins_admin_id_seq",
            "users_user_id_seq",
            "experts_expert_id_seq",
            "diseases_disease_id_seq",
            "scans_scan_id_seq",
            "consultations_consultation_id_seq",
            "history_history_id_seq",
            "treatments_treatment_id_seq",
            "notifications_notification_id_seq",
            "disease_requirements_id_seq",
            "message_message_id"
        ]
        for seq in sequences:
            try:
                conn.execute(text(f"ALTER SEQUENCE {seq} RESTART WITH 1;"))
            except Exception:
                print(f"⚠️ Sequence {seq} does not exist, skipping.")
        conn.commit()

    print("All tables created successfully ✅")
    print("Sequences reset to 1 ✅")

if __name__ == "__main__":
    main()