# app/seed_requirements.py
"""
Seeds the requirements table with diagnostic criteria for each disease.

Run:
    python -m app.seed_requirements
"""

from app.db import SessionLocal
from app.models.disease_requirement import Requirement
from app.models.disease import Disease
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ================================================================
# REQUIREMENTS PER DISEASE
# Keys must match your SymptomInput field names exactly
# ================================================================

DISEASE_REQUIREMENTS = {
    "Black_Pod_Disease": [
        "black_pods",
        "pod_rot",
        "spots",
        "pod_color",
    ],
    "Frosty_Pod_Rot": [
        "frosty_pod",
        "pod_rot",
        "spots",
        "swelling",
    ],
    "Healthy": [
        "healthy",
    ],
}

# ================================================================
# SEED
# ================================================================

def seed():
    db = SessionLocal()
    try:
        # Check if already seeded
        existing = db.query(Requirement).count()
        if existing > 0:
            logger.info("⚠️  Requirements table already has %d rows — skipping.", existing)
            return

        total = 0
        for disease_name, requirements in DISEASE_REQUIREMENTS.items():

            # Find disease in DB
            disease = db.query(Disease).filter(
                Disease.name.ilike(f"%{disease_name.replace('_', '%')}%")
            ).first()

            if not disease:
                logger.warning("⚠️  Disease not found in DB: %s — skipping.", disease_name)
                continue

            logger.info("Seeding requirements for: %s (id=%d)", disease.name, disease.disease_id)

            for req_text in requirements:
                req = Requirement(
                    disease_id  = disease.disease_id,
                    requirement = req_text,
                )
                db.add(req)
                total += 1

        db.commit()
        logger.info("✅ Seeded %d requirements successfully.", total)

        # Print summary
        print("\n📊 REQUIREMENTS SEEDED:")
        print(f"  {'Disease':<30} {'Count':>6}")
        print("  " + "-"*38)
        for disease_name in DISEASE_REQUIREMENTS:
            disease = db.query(Disease).filter(
                Disease.name.ilike(f"%{disease_name.replace('_', '%')}%")
            ).first()
            if disease:
                count = db.query(Requirement).filter(
                    Requirement.disease_id == disease.disease_id
                ).count()
                print(f"  {disease.name:<30} {count:>6}")

    except Exception as e:
        db.rollback()
        logger.exception("❌ Seeding failed: %s", e)
    finally:
        db.close()


if __name__ == "__main__":
    seed()