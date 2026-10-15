<div align="center">

# 🌿 Smart Olive Farm Assistant

**AI-powered olive tree disease diagnosis, treatment guidance, and epidemiological surveillance for Tunisian olive growers.**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.3-EE4C2C?logo=pytorch&logoColor=white)](https://pytorch.org/)
[![PostGIS](https://img.shields.io/badge/PostgreSQL-PostGIS%2016-336791?logo=postgresql&logoColor=white)](https://postgis.net/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)

</div>

---

## Overview

Olive farming is central to Tunisian agriculture, yet disease diagnosis still depends on scarce agronomic expertise. **Smart Olive Farm Assistant** puts a four-model AI pipeline in a grower's pocket: photograph a leaf, get a diagnosis with severity grading, a localised treatment protocol, and a 7-day risk forecast — while CRDA inspectors see the same data aggregated into a national surveillance dashboard.

The system serves two distinct audiences from one codebase:

| Audience | Interface | Purpose |
|---|---|---|
| **Farmers** | Mobile-first web app (`/diagnose`) | Photograph a leaf, receive diagnosis, severity, treatment and risk forecast |
| **CRDA inspectors** | Desktop dashboard (`/dashboard`) | Governorate-level choropleth map, disease trends, live alerts |

---

## Features

### 🔬 Multi-stage AI diagnosis

A single uploaded image flows through a seven-step pipeline:

```
Image → YOLOv8 (detect leaf) → crop → U-Net (lesion segmentation)
      → ResNet (classification + Grad-CAM) → severity index
      → LSTM (7-day risk forecast)
```

Detected classes: **Healthy**, **Peacock Spot**, **Aculus Olearius**. The response carries the predicted class, confidence, a lesion-coverage severity index with a discrete level, a Grad-CAM overlay for explainability, and daily risk scores.

### 💧 Water-stress estimation

A dedicated endpoint grades irrigation deficit into four classes (`100%`, `50%`, `25%`, `0%` of water requirement), returned with labels in English, French and Arabic.

### 💬 RAG treatment chatbot

LangChain + Mistral (`mistral-small-latest`) over a FAISS vector store built from **24 curated treatment protocols**, so advice is grounded in the protocol corpus rather than free-form generation.

### 📊 Surveillance dashboard

Leaflet choropleth over Tunisia's governorate boundaries, Recharts trend panels, and a WebSocket channel pushing live diagnosis events as they arrive.

### 🌍 Trilingual, mobile-first

French (`fr-FR`) and Tunisian Arabic (`ar-TN`) translation bundles with RTL-aware layout, served through a React language context.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Next.js 14 (App Router)  ·  Tailwind  ·  Leaflet       │
│  /diagnose   /dashboard   /services   /login   /about   │
└────────────────────┬────────────────────────────────────┘
                     │  REST  +  WebSocket
┌────────────────────┴────────────────────────────────────┐
│  FastAPI  ·  JWT auth  ·  SQLAlchemy (async)            │
│  ┌───────────────────────┐  ┌────────────────────────┐  │
│  │ InferencePipeline     │  │ RAG chain              │  │
│  │ YOLOv8 → U-Net →      │  │ Mistral + FAISS        │  │
│  │ ResNet → LSTM         │  │ 24 protocols           │  │
│  └───────────────────────┘  └────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
         PostgreSQL + PostGIS (geospatial aggregation)
```

**Stack**

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, Leaflet, Recharts, Radix UI |
| Backend | FastAPI 0.111, SQLAlchemy 2.0 (async), WebSockets, python-jose (JWT), passlib |
| AI | PyTorch 2.3, Ultralytics 8.2 (YOLOv8), ONNX Runtime, OpenCV |
| Chatbot | LangChain 0.2, langchain-mistralai, FAISS, sentence-transformers |
| Database | PostgreSQL 16 + PostGIS 3.4 (SQLite via aiosqlite for local dev) |
| Deployment | Docker Compose |

---

## Project structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/v1/          # analyze, water stress, auth, chat, dashboard, history
│   │   ├── chatbot/         # LangChain RAG chain
│   │   ├── core/            # settings, async DB session, JWT security
│   │   ├── inference/       # per-model runners + orchestrating pipeline
│   │   ├── models/          # SQLAlchemy ORM models
│   │   └── websocket/       # live event channel
│   ├── data/                # treatment_protocols.json, FAISS index (generated)
│   ├── scripts/build_faiss.py
│   └── weights/             # model weights (not in git)
├── frontend/
│   └── src/
│       ├── app/             # App Router pages
│       ├── components/      # UploadCard, ResultView, ChoroMap, ChatWidget, …
│       ├── context/         # language context
│       └── i18n/            # fr-FR.json, ar-TN.json
└── docker-compose.yml
```

---

## Getting started

### Prerequisites

- Docker and Docker Compose — or Python 3.10+ and Node.js 18+ for local development
- A [Mistral AI](https://console.mistral.ai/) API key (chatbot)
- An [OpenWeather](https://openweathermap.org/api) API key (weather widget)

### 1. Configure environment

```bash
cp .env.example .env
```

| Variable | Used by | Notes |
|---|---|---|
| `MISTRAL_API_KEY` | Backend | Required for the RAG chatbot |
| `MISTRAL_MODEL` | Backend | Defaults to `mistral-small-latest` |
| `DATABASE_URL` | Backend | Compose injects the PostGIS URL automatically |
| `NEXT_PUBLIC_OPENWEATHER_API_KEY` | Frontend | Exposed to the browser by design |

> [!IMPORTANT]
> `JWT_SECRET_KEY` in `backend/app/core/config.py` ships with a placeholder default. Set a real secret before any deployment — generate one with `openssl rand -hex 32`.

### 2. Add model weights

Place trained weights in `backend/weights/` using exactly these filenames:

| File | Model | Role |
|---|---|---|
| `best.pt` | YOLOv8 | Leaf / lesion detection |
| `unet_severity.pth` | U-Net | Lesion segmentation |
| `resnet18_disease_classifier.pth` | ResNet-18 | Disease classification |
| `lstm_risk.pth` | LSTM | 7-day risk forecast |
| `resnet_water_stress.pth` | ResNet | Water-stress grading |

> [!NOTE]
> Weights are gitignored. If a file is missing, the corresponding runner falls back to **MOCK mode**, so the full stack still boots and the UI stays explorable without them.

### 3. Build the FAISS index

```bash
cd backend
pip install -r requirements.txt
python scripts/build_faiss.py
```

This embeds the 24 protocols in `data/treatment_protocols.json` into `data/faiss_index`. The chatbot answers from this index, so build it before the first run.

### 4. Run

**With Docker Compose (recommended)**

```bash
docker-compose up --build
```

**Locally, in two terminals**

```bash
cd backend && uvicorn app.main:app --reload --port 8000
```

```bash
cd frontend && npm install && npm run dev
```

| Service | URL |
|---|---|
| Farmer web app | http://localhost:3000 |
| Inspector dashboard | http://localhost:3000/dashboard |
| Swagger API docs | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |
| Health check | http://localhost:8000/health |

---

## API reference

Base path `/api/v1`. Full interactive schema at `/docs`.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Create an account, returns a JWT |
| `POST` | `/auth/login` | Exchange credentials for a JWT |
| `POST` | `/analyze` | Leaf image (+ `governorate`, `delegation`) to full diagnosis |
| `POST` | `/analyze-water-stress` | Tree image to water-stress class and labels |
| `POST` | `/chat` | Ask the RAG chatbot a treatment question |
| `GET` | `/dashboard/stats` | Aggregated statistics for the inspector dashboard |
| `GET` | `/history/diagnoses` | Past diagnoses for the authenticated user |
| `GET` | `/history/conversations` | Chatbot conversation summaries |
| `WS` | `/ws/events` | Live diagnosis event stream |

Authentication is bearer-token JWT. `/analyze` accepts an optional token: anonymous submissions still feed national surveillance without being linked to a user.

Accepted image types: JPEG, PNG and WEBP.

---

## Data privacy (INPDP compliance)

The system is built to comply with Tunisia's INPDP personal-data regulations:

1. Precise GPS coordinates are **never** stored.
2. Location is aggregated to **governorate** and **delegation** level only.
3. The `diagnosis_events` table holds **no personally identifiable information**.
4. Chatbot logs are anonymised and retained for quality assurance only.

---

## Roadmap

- [ ] Offline-first PWA for low-connectivity rural areas
- [ ] Expand disease classes beyond the current three
- [ ] SMS/USSD fallback for feature phones
- [ ] Alembic migrations wired into container start-up
- [ ] Automated test suite and CI

---

## License

No license has been declared yet. Until one is added, all rights are reserved and the code is not licensed for reuse.

---

<div align="center">
<sub>Built for Tunisian olive growers and CRDA agricultural inspectors.</sub>
</div>
