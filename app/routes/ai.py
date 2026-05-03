



# from fastapi import APIRouter, Depends, UploadFile, File
# from sqlalchemy.orm import Session
# from typing import Optional
# import logging

# from app.db import get_db
# from app.auth.auth_bearer import get_current_user
# from app.models.disease import Disease
# from app.schemas.scan import ScanCreate
# from app.crud.scan import create_scan
# from app.schemas.response import APIResponse
# from app.services.cloudinary_service import upload_bytes_to_cloudinary
# from app._ai.ai_services import AIService

# logger = logging.getLogger(__name__)
# router = APIRouter()

# # ---------------- HELPERS ---------------- #

# def get_urgency(confidence: float) -> str:
#     if confidence >= 0.75:
#         return "High"
#     elif confidence >= 0.45:
#         return "Medium"
#     return "Low"


# # def normalize_label(label: str) -> str:
# #     return label.replace("_", "").replace(" ", "").upper()
# def normalize_label(label: str) -> str:
#     if not label:  # handles None and empty string
#         return ""
#     return label.replace("_", "").replace(" ", "").upper()


# # ✅ FIXED MATCHING (IMPORTANT FIX YOU ASKED ABOUT)
# def find_matching_disease(db: Session, predicted_name: str):
#     predicted_clean = normalize_label(predicted_name)
#     diseases = db.query(Disease).all()

#     return next(
#         (
#             d for d in diseases
#             if normalize_label(d.name) in predicted_clean
#             or predicted_clean in normalize_label(d.name)
#         ),
#         None
#     )


# # ---------------- IMAGE PREDICTION ---------------- #
# @router.post("/predict", response_model=APIResponse)
# async def predict_disease(
#     file: UploadFile = File(...),
#     latitude: Optional[float] = None,
#     longitude: Optional[float] = None,
#     db: Session = Depends(get_db),
#     current_user=Depends(get_current_user)
# ):
#     try:
#         image_bytes = await file.read()

#         # =========================
#         # 1. YOLO PREDICTION
#         # =========================
#         model = AIService.image_model()
#         prediction = model.predict(image_bytes)
        
#         # print("ANNOTATED TYPE:", type(prediction.get("annotated_image")))
#         # print("ANNOTATED SIZE:", len(prediction.get("annotated_image") or b""))
#         print("ANNOTATED TYPE:", type(prediction.get("annotated_image")))
#         print("ANNOTATED SIZE:", len(prediction.get("annotated_image") or b""))
#         print("FULL PREDICTION KEYS:", prediction.keys())

#         predicted_name = prediction.get("disease", "Unknown")
#         confidence = prediction.get("confidence", 0.0)
#         annotated_image = prediction.get("annotated_image")

#         # =========================
#         # 2. ORIGINAL IMAGE UPLOAD
#         # =========================
#         original_url = upload_bytes_to_cloudinary(
#             image_bytes,
#             folder="boa_mi_cocoa/scans/original"
#         )

#         # =========================
#         # 3. ANNOTATED IMAGE UPLOAD (FIXED SAFELY)
#         # =========================
#         annotated_url = None

#         if annotated_image:
#             try:
#                 annotated_url = upload_bytes_to_cloudinary(
#                     annotated_image,
#                     folder="boa_mi_cocoa/scans/annotated"
#                 )
#             except Exception as e:
#                 logger.warning(f"Annotated upload failed: {e}")
#                 annotated_url = None

#         # =========================
#         # 4. MATCH DISEASE (FIXED LOGIC)
#         # =========================
#         disease = find_matching_disease(db, predicted_name)
#         # 🔥 DEBUG CHECK (ADD THIS)
#         # print("DISEASE:", disease)
#         # print("TREATMENTS:", disease.treatments if disease else None)
#         print("DISEASE:", disease.name if disease else None)

#         print(
#     "TREATMENTS:",
#     [
#         t.treatment_name for t in disease.treatments
#     ] if disease else None
# )

#         # =========================
#         # 5. FIXED TREATMENTS (IMPORTANT FIX)
#         # =========================
        
#         treatments = []

#         if disease and disease.treatments and predicted_name:  # ← add "and predicted_name"
#             treatments = [
#         {
#             "treatment_name": t.treatment_name,
#             "dosage": t.dosage,
#             "duration": t.duration,
#             "application_method": t.application_method
#         }
#         for t in disease.treatments
#         if t.treatment_name
#     ]
#         # =========================
#         # 6. SAVE SCAN
#         # =========================
#         scan_data = ScanCreate(
#             user_id=int(current_user.user_id),
#             image_url=original_url,
#             disease_id=disease.disease_id if disease else None,
#             custom_label="image",
#             confidence_score=confidence,
#             urgency_level=get_urgency(confidence),
#             latitude=latitude,
#             longitude=longitude,
#             description=f"Image scan: {predicted_name or 'Healthy'}"
#         )

#         saved_scan = create_scan(db, scan_data)

#         # =========================
#         # 7. RESPONSE
#         # =========================
#         return APIResponse(
#             success=True,
#             message="Prediction successful",
#             data={
#                 "scan_id": saved_scan.scan_id,
#                 "original_image": original_url,
#                 "annotated_image": annotated_url,
#                 "predicted_disease": predicted_name,
#                 "status": prediction.get("status"),
#                 "confidence": confidence,
#                 "urgency": get_urgency(confidence),
#                 "treatments": treatments
#             }
#         )

#     except Exception as e:
#         logger.exception("Prediction failed")
#         return APIResponse(success=False, message=str(e), data=None)





# app/routes/ai.py

from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
import logging

from app.db import get_db
from app.auth.auth_bearer import get_current_user
from app.models.disease import Disease
from app.models.scan import Scan
from app.schemas.scan import ScanCreate
from app.crud.scan import create_scan, update_scan
from app.schemas.response import APIResponse
from app.services.cloudinary_service import upload_bytes_to_cloudinary
from app._ai.ai_services import AIService

logger = logging.getLogger(__name__)
router = APIRouter()


# ================================================================
# SCHEMAS
# ================================================================

class SymptomInput(BaseModel):
    humidity:      Optional[float] = 0.0
    temperature:   Optional[float] = 0.0
    spots:         Optional[str]   = "no"
    pod_color:     Optional[str]   = "normal"
    leaf_curl:     Optional[str]   = "no"
    swelling:      Optional[str]   = "no"
    yellow_leaf:   Optional[str]   = "no"
    pod_rot:       Optional[str]   = "no"
    black_pods:    Optional[str]   = "no"
    witches_broom: Optional[str]   = "no"
    pod_borer:     Optional[str]   = "no"
    frosty_pod:    Optional[str]   = "no"


# ================================================================
# HELPERS
# ================================================================

def get_urgency(confidence: float) -> str:
    if confidence >= 0.75:
        return "High"
    elif confidence >= 0.45:
        return "Medium"
    return "Low"


def normalize_label(label: str) -> str:
    if not label:
        return ""
    return label.replace("_", "").replace(" ", "").upper()


def find_matching_disease(db: Session, predicted_name: str):
    if not predicted_name:
        return None
    predicted_clean = normalize_label(predicted_name)
    diseases = db.query(Disease).all()
    return next(
        (
            d for d in diseases
            if normalize_label(d.name) in predicted_clean
            or predicted_clean in normalize_label(d.name)
        ),
        None,
    )


def format_treatments(disease, predicted_name: str) -> list:
    if not disease or not disease.treatments or not predicted_name:
        return []
    return [
        {
            "treatment_name":     t.treatment_name,
            "dosage":             t.dosage,
            "duration":           t.duration,
            "application_method": t.application_method,
        }
        for t in disease.treatments
        if t.treatment_name
    ]


# ================================================================
# 1. IMAGE PREDICTION  →  POST /ai/predict
# ================================================================

@router.post("/predict", response_model=APIResponse)
async def predict_disease(
    file: UploadFile = File(...),
    latitude:  Optional[float] = None,
    longitude: Optional[float] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        image_bytes = await file.read()

        # --- YOLO prediction ---
        model      = AIService.image_model()
        prediction = model.predict(image_bytes)
        #Debuging
        print("ANNOTATED TYPE:", type(prediction.get("annotated_image")))
        print("ANNOTATED SIZE:", len(prediction.get("annotated_image") or b""))
        print("ANNOTATED TYPE:", type(prediction.get("annotated_image")))
        print("ANNOTATED SIZE:", len(prediction.get("annotated_image") or b""))
        print("FULL PREDICTION KEYS:", prediction.keys())

        predicted_name   = prediction.get("disease")        # None if Healthy
        confidence       = prediction.get("confidence", 0.0)
        status           = prediction.get("status", "Unknown")
        annotated_image  = prediction.get("annotated_image")

        # --- Upload original ---
        original_url = upload_bytes_to_cloudinary(
            image_bytes, folder="boa_mi_cocoa/scans/original"
        )

        # --- Upload annotated ---
        annotated_url = None
        if annotated_image:
            try:
                annotated_url = upload_bytes_to_cloudinary(
                    annotated_image, folder="boa_mi_cocoa/scans/annotated"
                )
            except Exception as e:
                logger.warning("Annotated upload failed: %s", e)

        # --- Match disease in DB ---
        disease    = find_matching_disease(db, predicted_name)
        treatments = format_treatments(disease, predicted_name)

        # --- Save scan ---
        scan_data = ScanCreate(
            user_id          = int(current_user.user_id),
            image_url        = original_url,
            disease_id       = disease.disease_id if disease else None,
            custom_label     = "image",
            confidence_score = confidence,
            urgency_level    = get_urgency(confidence),
            latitude         = latitude,
            longitude        = longitude,
            description      = f"Image scan: {predicted_name or 'Healthy'}",
        )
        saved_scan = create_scan(db, scan_data)

        return APIResponse(
            success=True,
            message="Prediction successful",
            data={
                "scan_id":          saved_scan.scan_id,
                "original_image":   original_url,
                "annotated_image":  annotated_url,
                "predicted_disease": predicted_name,
                "status":           status,
                "confidence":       confidence,
                "urgency":          get_urgency(confidence),
                "treatments":       treatments,
            },
        )

    except Exception as e:
        logger.exception("Image prediction failed")
        return APIResponse(success=False, message=str(e), data=None)


# ================================================================
# 2. VOICE DIAGNOSIS  →  POST /ai/voice-diagnose
#    Farmer records voice note → Whisper transcribes →
#    Hybrid model diagnoses → Updates existing scan
# ================================================================

@router.post("/voice-diagnose", response_model=APIResponse)
async def voice_diagnosis(
    scan_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        audio_bytes = await file.read()

        # --- Transcribe + extract symptoms ---
        voice_proc  = AIService.voice_model()
        voice_data  = voice_proc.process_voice(audio_bytes)

        transcript  = voice_data.get("transcript", "")
        language    = voice_data.get("language", "unknown")
        symptoms    = voice_data.get("symptoms", {})

        # --- Upload audio to Cloudinary ---
        audio_url = None
        try:
            audio_url = upload_bytes_to_cloudinary(
                audio_bytes,
                folder        = "boa_mi_cocoa/scans/voice",
                resource_type = "video",   # Cloudinary uses "video" for audio
            )
        except Exception as e:
            logger.warning("Audio upload failed: %s", e)

        # --- Hybrid diagnosis from symptoms ---
        hybrid    = AIService.hybrid_model()
        diagnosis = hybrid.diagnose(symptoms, db)

        predicted_name = diagnosis.get("predicted_disease")
        confidence     = diagnosis.get("confidence", 0.0)
        urgency        = diagnosis.get("urgency_level", get_urgency(confidence))

        # --- Match disease in DB ---
        disease    = find_matching_disease(db, predicted_name)
        treatments = format_treatments(disease, predicted_name)

        # --- Update existing scan ---
        if scan_id:
            existing_scan = db.query(Scan).filter(Scan.scan_id == scan_id).first()
            if existing_scan:
                update_scan(
                    db,
                    scan_id,
                    {
                        "audio_url":       audio_url,
                        "confidence_score": confidence,
                        "urgency_level":   urgency,
                        "description":     f"Voice: {transcript[:100]}",
                    },
                )

        return APIResponse(
            success=True,
            message="Voice diagnosis complete",
            data={
                "scan_id":           scan_id,
                "audio_url":         audio_url,
                "transcript":        transcript,
                "language_detected": language,
                "symptoms_detected": symptoms,
                "predicted_disease": predicted_name,
                "confidence":        confidence,
                "urgency":           urgency,
                "treatments":        treatments,
            },
        )

    except Exception as e:
        logger.exception("Voice diagnosis failed")
        return APIResponse(success=False, message=str(e), data=None)


# ================================================================
# 3. SYMPTOM FORM  →  POST /ai/predict/symptoms
#    Farmer fills symptom checklist → Hybrid model diagnoses →
#    Updates existing scan
# ================================================================

@router.post("/predict/symptoms", response_model=APIResponse)
async def predict_from_symptoms(
    scan_id:  int,
    symptoms: SymptomInput,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        # --- Hybrid diagnosis ---
        hybrid    = AIService.hybrid_model()
        diagnosis = hybrid.diagnose(symptoms.dict(), db)

        predicted_name = diagnosis.get("predicted_disease")
        confidence     = diagnosis.get("confidence", 0.0)
        urgency        = diagnosis.get("urgency_level", get_urgency(confidence))

        # --- Match disease in DB ---
        disease    = find_matching_disease(db, predicted_name)
        treatments = format_treatments(disease, predicted_name)

        # --- Update existing scan ---
        if scan_id:
            existing_scan = db.query(Scan).filter(Scan.scan_id == scan_id).first()
            if existing_scan:
                update_scan(
                    db,
                    scan_id,
                    {
                        "confidence_score": confidence,
                        "urgency_level":    urgency,
                        "description":      f"Symptoms: {predicted_name or 'Unknown'}",
                    },
                )

        return APIResponse(
            success=True,
            message="Symptom diagnosis complete",
            data={
                "scan_id":           scan_id,
                "predicted_disease": predicted_name,
                "confidence":        confidence,
                "urgency":           urgency,
                "treatments":        treatments,
                "ai_confidence":     diagnosis.get("ai_confidence", 0.0),
                "rule_score":        diagnosis.get("rule_score", 0.0),
            },
        )

    except Exception as e:
        logger.exception("Symptom diagnosis failed")
        return APIResponse(success=False, message=str(e), data=None)


# ================================================================
# 4. MODEL INFO  →  GET /ai/info
#    Useful for your examiner demo
# ================================================================

@router.get("/info", response_model=APIResponse)
async def model_info(current_user=Depends(get_current_user)):
    try:
        image_model = AIService.image_model()
        voice_model = AIService.voice_model()

        return APIResponse(
            success=True,
            message="Model info",
            data={
                "image_model": image_model.get_model_info(),
                "voice_model": voice_model.get_model_info(),
            },
        )
    except Exception as e:
        logger.exception("Model info failed")
        return APIResponse(success=False, message=str(e), data=None)