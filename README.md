# 🌿 Boa Mi Cocoa — Backend API

> **"Boa Mi Cocoa"** means **"Help Me Cocoa"** in Twi 🇬🇭  
> An AI-powered cocoa disease detection system built for Ghanaian farmers.

---

## 📖 Project Overview

Boa Mi Cocoa is a final year project that helps cocoa farmers in Ghana detect diseases early using their smartphones. Farmers can:

- 📸 **Scan a cocoa pod or leaf** with their phone camera
- 🎙️ **Describe symptoms by voice** in English or Twi
- 📝 **Fill a symptom form** for additional diagnosis
- 💬 **Consult an expert** in real-time via chat
- 📊 **Track scan history** over time

The system uses a YOLO object detection model trained on cocoa disease images, combined with a hybrid rule-based AI system for symptom-based diagnosis.

---

## ✨ Features

- 🔍 **Image Detection** — YOLO model detects cocoa diseases from phone photos with bounding box annotations
- 🎙️ **Voice Diagnosis** — Whisper AI transcribes farmer voice notes (supports Twi, English, Fante, Ga)
- 📝 **Symptom Form** — Hybrid AI (ML + rule-based) diagnosis from symptom checklist
- 🗺️ **GeoTagging** — Scan location recorded for disease mapping
- 💬 **Expert Chat** — Real-time WebSocket chat between farmers and experts
- 📊 **Scan History** — Full history of all scans per farmer
- 🔔 **Notifications** — Push notifications for scan results and expert replies
- 🔐 **Role-based Auth** — Separate roles for farmers, experts, and admins
- ☁️ **Cloudinary** — All images and audio stored in the cloud
- 🐳 **Docker** — Fully containerized for easy deployment

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend Framework** | FastAPI (Python) |
| **Database** | PostgreSQL |
| **ORM** | SQLAlchemy + Alembic |
| **AI - Image Detection** | YOLOv8 (Ultralytics) |
| **AI - Voice** | OpenAI Whisper |
| **AI - Symptoms** | Hybrid ML + Rule-based |
| **Image Storage** | Cloudinary |
| **Authentication** | JWT (python-jose) |
| **Real-time Chat** | WebSockets |
| **Containerization** | Docker + Docker Compose |
| **Server** | Uvicorn |

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.11+
- PostgreSQL
- Git

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/boa-mi-cocoa-backend.git
cd boa-mi-cocoa-backend
```

### 2. Create virtual environment
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Set up environment variables
```bash
cp .env.example .env
nano .env  # Fill in your values
```

Required variables:
```
SECRET_KEY=your-secret-key
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=boa_mi_cocoa
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 5. Create database
```bash
psql -U postgres -c "CREATE DATABASE boa_mi_cocoa;"
psql -U postgres -c "CREATE USER boa_user WITH PASSWORD 'yourpassword';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE boa_mi_cocoa TO boa_user;"
```

### 6. Run migrations
```bash
alembic upgrade head
```

### 7. Seed database
```bash
python -m app.seed_requirements
```

### 8. Start the server
```bash
uvicorn app.main:app --reload
```

Visit: **http://localhost:8000/docs**

---

## 🐳 Docker Setup

The easiest way to run the project is with Docker.

### Prerequisites
- Docker
- Docker Compose

### 1. Clone and configure
```bash
git clone https://github.com/yourusername/boa-mi-cocoa-backend.git
cd boa-mi-cocoa-backend
cp .env.example .env
# Edit .env with your values
```

### 2. Build and run
```bash
docker-compose up --build
```

### 3. Set up database (first time only)
```bash
# In a new terminal
docker-compose exec api python -c "
from app.db import engine, Base
from app import models
Base.metadata.create_all(bind=engine)
print('Tables created')
"

# Seed diseases and requirements
docker-compose exec api python -m app.seed_requirements
```

### 4. Access the API
Visit: **http://localhost:8000/docs**

### Docker Commands
```bash
# Start
docker-compose up

# Stop
docker-compose down

# Rebuild after code changes
docker-compose up --build

# View logs
docker-compose logs -f api
```

---

## 📡 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get JWT token |

### 🤖 AI Diagnosis
| Method | Endpoint | Description |
|---|---|---|
| POST | `/ai/predict` | Image scan → YOLO disease detection |
| POST | `/ai/voice-diagnose` | Voice note → Whisper → diagnosis |
| POST | `/ai/predict/symptoms` | Symptom form → hybrid diagnosis |
| GET | `/ai/info` | Model information |

### 📋 Scans
| Method | Endpoint | Description |
|---|---|---|
| GET | `/scans/me` | Get my scan history |
| GET | `/scans/{scan_id}` | Get single scan |
| DELETE | `/scans/{scan_id}` | Delete scan |

### 🌿 Diseases
| Method | Endpoint | Description |
|---|---|---|
| GET | `/diseases/` | List all diseases |
| GET | `/diseases/{id}` | Get disease details |
| POST | `/diseases/` | Add disease (admin) |

### 💊 Treatments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/treatments/` | List all treatments |
| POST | `/treatments/` | Add treatment (admin) |

### 💬 Consultations
| Method | Endpoint | Description |
|---|---|---|
| POST | `/consultations/` | Request expert consultation |
| GET | `/consultations/me` | My consultations |
| WS | `/ws/farmer/{user_id}` | WebSocket chat |

### 👥 Users & Experts
| Method | Endpoint | Description |
|---|---|---|
| GET | `/users/me` | Get my profile |
| PUT | `/users/me` | Update profile |
| GET | `/experts/` | List all experts |

---

## 🧠 AI Model Details

### Image Detection — YOLOv8
- **Model:** YOLOv8 custom trained (`best.pt`)
- **Input:** Phone camera image (JPEG/PNG)
- **Output:** Disease label + confidence + annotated image with bounding boxes
- **Classes:**
  - `Black_Pod_Disease` — Phytophthora pod rot
  - `Frosty_Pod_Rot` — Moniliophthora roreri
  - `Healthy` — No disease detected
- **Confidence threshold:** 0.25 (raw YOLO)
- **Annotated output:** Uploaded to Cloudinary with color-coded bounding boxes

### Voice Diagnosis — Whisper
- **Model:** OpenAI Whisper `base`
- **Languages:** Auto-detect (English, Twi, Fante, Ga, Hausa)
- **Process:** Audio → Transcription → Symptom keyword extraction → Hybrid diagnosis
- **Twi keywords supported:** `tuntum` (black), `popo` (rot), `aboa` (insect), `fitaa` (white)

### Hybrid Symptom Diagnosis
- **Inputs:** humidity, temperature, spots, pod_color, leaf_curl, swelling, yellow_leaf, pod_rot, black_pods, witches_broom, pod_borer, frosty_pod
- **Logic:** AI confidence (60%) + Rule score (30%) + Symptom boost (10%)
- **Urgency levels:** High (≥75%), Medium (≥45%), Low (<45%)

---

## 📸 Screenshots

> _Add screenshots of your mobile app and Swagger UI here_

| Swagger UI | Image Scan Result | Voice Diagnosis |
|---|---|---|
| ![Swagger](screenshots/swagger.png) | ![Scan](screenshots/scan.png) | ![Voice](screenshots/voice.png) |

---

## 👨‍💻 Team / Author

**David** — Final Year Computer Science Student  
Institution: _[Your University Name]_  
Year: 2026  

> Supervised by: _[Your Supervisor's Name]_

---

## 📄 License

This project was developed as a final year project.  
© 2026 Boa Mi Cocoa. All rights reserved.