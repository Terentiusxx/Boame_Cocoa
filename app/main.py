# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles

# # ---------------- Settings & DB ---------------- #
# from app.settings import settings
# from app.db import engine, Base
# from app import models  # Ensures all models are imported for table creation

# # ---------------- Routers ---------------- #
# from app.routes.auth import router as auth_router
# from app.routes.user import router as user_router
# from app.routes.admin import router as admin_router
# from app.routes.expert import router as expert_router
# app.include_router(expert_router, prefix="/experts", tags=["Experts"])
# from app.routes.disease import router as disease_router
# from app.routes.disease_requirement import router as disease_requirement_router
# from app.routes.scan import router as scan_router
# from app.routes.consult import router as consultation_router
# from app.routes.message import router as message_router
# from app.routes.history import router as history_router
# from app.routes.chat_socket import router as websocket_router
# from app.routes.notification import router as notification_router
# from app.routes.treatment import router as treatment_router
# from app.routes.chat_socket import router as socket_router
# from app.routes.ai import router as ai_router


# # ---------------- Initialize FastAPI ---------------- #
# app = FastAPI(
#     title=settings.APP_NAME,
#     version=settings.API_VERSION,
#     description="API for cocoa disease detection, expert consultation, and management"
# )

# # ---------------- Create DB Tables ---------------- #
# Base.metadata.create_all(bind=engine)

# # ---------------- CORS Configuration ---------------- #
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=settings.BACKEND_CORS_ORIGINS,  # Can restrict in production
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ---------------- Include Routers ---------------- #
# app.include_router(auth_router, prefix="/auth", tags=["Auth"])
# app.include_router(user_router, prefix="/users", tags=["Users"])
# app.include_router(admin_router, prefix="/admins", tags=["Admins"])
# app.include_router(expert_router, prefix="/experts", tags=["Experts"])
# app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
# app.include_router(disease_router, prefix="/diseases", tags=["Diseases"])
# app.include_router(disease_requirement_router, prefix="/requirement", tags=["Requirement"])
# app.include_router(scan_router, prefix="/scans", tags=["Scans"])
# app.include_router(consultation_router, prefix="/consultations", tags=["Consultations"])
# app.include_router(message_router, prefix="/messages", tags=["Messages"])
# app.include_router(history_router, prefix="/history", tags=["History"])
# app.include_router(websocket_router, prefix="/websocket", tags=["WebSocket"])
# app.include_router(notification_router, prefix="/notification", tags=["Notification"])
# app.include_router(treatment_router, prefix="/treatments", tags=["Treatments"])
# app.include_router(socket_router, tags=["WebSocket"])
# app.include_router(ai_router, prefix="/ai", tags=["AI"])



# # ---------------- Root Endpoint ---------------- #
# @app.get("/", tags=["Root"])
# def root():
#     return {"message": "Welcome to Boa Mi Cocoa API 🚀"}


# #uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# #for f in app/ai/train.py app/ai/hybrid_dygnosis_model.py app/ai/predictor.py app/ai/model_loader.py app/ai/image_predictor.py app/ai/utils.py; do echo "========== $f =========="; cat "$f"; echo; done

# """// Connect as a farmer
# const ws = new WebSocket("wss://your-ngrok-url/ws/user/5")

# // Connect as an expert
# const ws = new WebSocket("wss://your-ngrok-url/ws/expert/3")

# // Listen for messages
# ws.onmessage = (event) => {
#     const data = JSON.parse(event.data)
#     console.log("Received:", data)
# }

# // Send a message to an expert
# ws.send(JSON.stringify({
#     receiver_role: "expert",
#     receiver_id: 3,
#     content: "Hello doctor my cocoa has black pod disease"
# }))

# // Keep connection alive
# setInterval(() => {
#     ws.send(JSON.stringify({ type: "ping" }))
# }, 30000)"""












# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles
# import os

# # ---------------- Settings & DB ---------------- #
# from app.settings import settings
# from app.db import engine, Base
# from app import models  # Ensures all models are imported for table creation

# # ---------------- Routers ---------------- #
# from app.routes.auth import router as auth_router
# from app.routes.user import router as user_router
# from app.routes.admin import router as admin_router
# from app.routes.expert import router as expert_router
# from app.routes.disease import router as disease_router
# from app.routes.disease_requirement import router as disease_requirement_router
# from app.routes.scan import router as scan_router
# from app.routes.consult import router as consultation_router
# from app.routes.message import router as message_router
# from app.routes.history import router as history_router
# from app.routes.chat_socket import router as websocket_router
# from app.routes.notification import router as notification_router
# from app.routes.treatment import router as treatment_router
# from app.routes.ai import router as ai_router

# # ---------------- Initialize FastAPI ---------------- #
# app = FastAPI(
#     title=settings.APP_NAME,
#     version=settings.API_VERSION,
#     description="API for cocoa disease detection, expert consultation, and management"
# )

# # ---------------- Create DB Tables ---------------- #
# Base.metadata.create_all(bind=engine)

# # ---------------- CORS Configuration ---------------- #
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=settings.BACKEND_CORS_ORIGINS,  # Can restrict in production
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ---------------- Ensure Uploads Folder Exists ---------------- #
# UPLOADS_DIR = "uploads"
# if not os.path.exists(UPLOADS_DIR):
#     os.makedirs(UPLOADS_DIR)

# # ---------------- Mount Static Files ---------------- #
# app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# # ---------------- Include Routers ---------------- #
# app.include_router(auth_router, prefix="/auth", tags=["Auth"])
# app.include_router(user_router, prefix="/users", tags=["Users"])
# app.include_router(admin_router, prefix="/admins", tags=["Admins"])
# app.include_router(expert_router, prefix="/experts", tags=["Experts"])
# app.include_router(disease_router, prefix="/diseases", tags=["Diseases"])
# app.include_router(disease_requirement_router, prefix="/requirement", tags=["Requirement"])
# app.include_router(scan_router, prefix="/scans", tags=["Scans"])
# app.include_router(consultation_router, prefix="/consultations", tags=["Consultations"])
# app.include_router(message_router, prefix="/messages", tags=["Messages"])
# app.include_router(history_router, prefix="/history", tags=["History"])
# app.include_router(websocket_router, prefix="/websocket", tags=["WebSocket"])
# app.include_router(notification_router, prefix="/notification", tags=["Notification"])
# app.include_router(treatment_router, prefix="/treatments", tags=["Treatments"])
# app.include_router(ai_router, prefix="/ai", tags=["AI"])

# # ---------------- Root Endpoint ---------------- #
# @app.get("/", tags=["Root"])
# def root():
#     return {"message": "Welcome to Boa Mi Cocoa API 🚀"}

# ---------------- Run Command ---------------- #
# uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# alembic revision --autogenerate -m "initial migration"
# alembic upgrade head
# alembic revision --autogenerate -m "add mid_name to admin"
# alembic upgrade head





from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# ---------------- Settings & DB ---------------- #
from app.settings import settings
from app.db import engine, Base
from app import models

# ---------------- Routers ---------------- #
from app.routes.auth import router as auth_router
from app.routes.user import router as user_router
from app.routes.admin import router as admin_router
from app.routes.expert import router as expert_router
from app.routes.disease import router as disease_router
from app.routes.disease_requirement import router as disease_requirement_router
from app.routes.scan import router as scan_router
from app.routes.consult import router as consultation_router
from app.routes.message import router as message_router
from app.routes.history import router as history_router
from app.routes.chat_socket import router as websocket_router
from app.routes.notification import router as notification_router
from app.routes.treatment import router as treatment_router
from app.routes.ai import router as ai_router

# ---------------- Initialize FastAPI ---------------- #
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.API_VERSION,
    description="API for cocoa disease detection, expert consultation, and management"
)

# ---------------- Create DB Tables ---------------- #
Base.metadata.create_all(bind=engine)

# ---------------- CORS Configuration ---------------- #
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Ensure Uploads Folder Exists ---------------- #
UPLOADS_DIR = "uploads"
if not os.path.exists(UPLOADS_DIR):
    os.makedirs(UPLOADS_DIR)

# ---------------- Mount Static Files ---------------- #
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# ---------------- Include Routers ---------------- #
app.include_router(auth_router,                 prefix="/auth",          tags=["Auth"])
app.include_router(user_router,                 prefix="/users",         tags=["Users"])
app.include_router(admin_router,                prefix="/admins",        tags=["Admins"])
app.include_router(expert_router,               prefix="/experts",       tags=["Experts"])
app.include_router(disease_router,              prefix="/diseases",      tags=["Diseases"])
app.include_router(disease_requirement_router,  prefix="/requirement",   tags=["Requirement"])
app.include_router(scan_router,                 prefix="/scans",         tags=["Scans"])
app.include_router(consultation_router,         prefix="/consultations", tags=["Consultations"])
app.include_router(message_router,              prefix="/messages",      tags=["Messages"])
app.include_router(history_router,              prefix="/history",       tags=["History"])
app.include_router(notification_router,         prefix="/notification",  tags=["Notification"])
app.include_router(treatment_router,            prefix="/treatments",    tags=["Treatments"])
app.include_router(ai_router,                   prefix="/ai",            tags=["AI"])
app.include_router(websocket_router,            tags=["WebSocket"])  # ✅ no prefix — path is already /ws/{role}/{user_id}

# ---------------- Root Endpoint ---------------- #
@app.get("/", tags=["Root"])
def root():
    return {"message": "Welcome to Boa Mi Cocoa API 🚀"}
