# Smart Olive Farm Assistant — Full-Stack Web App

A production-grade, mobile-first web application integrating four pre-trained AI models (YOLOv8, U-Net/EfficientNet-B4, ResNet-50, LSTM) into a seamless full-stack solution for Tunisian olive farmers and CRDA inspectors.

---

## User Review Required

> [!IMPORTANT]
> **Before execution begins, please answer the open questions below.** Several architectural decisions (chatbot serving, map data, dialect support) depend on your choices and will significantly affect build time and complexity.

> [!WARNING]
> **Scope & Time Estimate:** This is a very large project (~5,000–8,000 lines of production code across 30+ files). I will build it in **phases** to keep each step verifiable. Full build will take multiple sessions.

> [!CAUTION]
> **Model weight files are not yet in the workspace.** The backend inference code will be written to load from configurable paths (e.g., `./models/yolo_disease.pt`). You will need to place your `.pt`/`.pth`/`.onnx` files there before running.

---

## Open Questions

> [!IMPORTANT]
> **Q1 — Chatbot serving strategy:** Do you want Mistral-7B served **locally** via `llama.cpp` (requires a GPU/CPU with ≥8 GB RAM), or via an **external API** (e.g., Mistral AI API key, OpenRouter)? The local option is free but hardware-intensive; the API option is simpler to deploy.

> [!IMPORTANT]
> **Q2 — Tunisia GeoJSON:** For the choropleth map, I need a GeoJSON file with Tunisia's governorate boundaries. Should I download a public one from OpenStreetMap/Natural Earth, or do you have a custom one?

> [!IMPORTANT]
> **Q3 — FAISS vector store:** Do you have a pre-built FAISS index (the 24 treatment protocols already embedded), or do I generate placeholder content and a build script for you to run after embedding your documents?

> [!IMPORTANT]
> **Q4 — Framework: React vs Next.js?** The prompt mentions both. I recommend **Next.js 14 (App Router)** for SSR/SEO and simpler API proxying, but pure React + Vite is faster to scaffold. Which do you prefer?

> [!IMPORTANT]
> **Q5 — Authentication scope:** JWT auth is required. Should registration be **open** (any farmer can sign up), **invite-only**, or **admin-created accounts only**? This affects the auth flow design.

> [!IMPORTANT]
> **Q6 — Arabic dialect UI:** Do you want me to create the `i18n/ar-TN.json` translation file with placeholder strings in **Tunisian Arabic dialect** (Darija), or do you prefer to fill in translations yourself and I only set up the i18n structure?

---

## Proposed Changes

### Folder Structure

```
PFA/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── analyze.py          # Multimodal inference endpoint
│   │   │   │   ├── auth.py             # JWT register/login
│   │   │   │   ├── chat.py             # RAG chatbot endpoint
│   │   │   │   └── dashboard.py        # Surveillance data endpoint
│   │   ├── core/
│   │   │   ├── config.py               # Pydantic settings
│   │   │   ├── security.py             # JWT helpers
│   │   │   └── database.py             # SQLAlchemy + PostGIS setup
│   │   ├── models/
│   │   │   └── db_models.py            # SQLAlchemy ORM models
│   │   ├── inference/
│   │   │   ├── yolo_runner.py          # YOLOv8 inference wrapper
│   │   │   ├── unet_runner.py          # U-Net segmentation wrapper
│   │   │   ├── resnet_runner.py        # ResNet-50 + Grad-CAM wrapper
│   │   │   ├── lstm_runner.py          # LSTM risk prediction wrapper
│   │   │   └── pipeline.py             # Orchestrates all 4 models → severity
│   │   ├── chatbot/
│   │   │   ├── rag_chain.py            # LangChain FAISS + Mistral pipeline
│   │   │   └── vector_store/           # FAISS index files (gitignored)
│   │   ├── websocket/
│   │   │   └── events.py               # WebSocket manager for dashboard
│   │   └── main.py                     # FastAPI app entry point
│   ├── weights/                        # Model weight files (gitignored)
│   │   ├── yolo_disease.pt
│   │   ├── unet_severity.pth
│   │   ├── resnet_classifier.pth
│   │   └── lstm_risk.pth
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/                        # Next.js App Router
│   │   │   ├── page.tsx                # Home / Upload page
│   │   │   ├── dashboard/page.tsx      # CRDA Inspector Dashboard
│   │   │   ├── result/page.tsx         # Diagnosis result page
│   │   │   └── layout.tsx              # Root layout
│   │   ├── components/
│   │   │   ├── UploadCard.tsx          # Camera/file upload with drag-drop
│   │   │   ├── DiagnosisResult.tsx     # Heatmap + severity badge + index
│   │   │   ├── SeverityBadge.tsx       # Color-coded badge
│   │   │   ├── ChatWidget.tsx          # Floating chatbot widget
│   │   │   ├── ChoroMap.tsx            # Leaflet choropleth map
│   │   │   ├── RiskForecast.tsx        # LSTM 7-day bar chart (Recharts)
│   │   │   └── Skeleton.tsx            # Loading skeleton screens
│   │   ├── hooks/
│   │   │   ├── useAnalysis.ts          # Upload + polling logic
│   │   │   └── useWebSocket.ts         # Dashboard real-time feed
│   │   ├── i18n/
│   │   │   ├── ar-TN.json              # Tunisian Arabic translations
│   │   │   └── fr.json                 # French fallback
│   │   ├── lib/
│   │   │   └── api.ts                  # Axios/fetch API client
│   │   └── service-worker.ts           # PWA offline caching
│   ├── public/
│   │   ├── manifest.json               # PWA manifest
│   │   └── tunisia-governorates.geojson
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

### Phase 1 — Backend Foundation & AI Router (Day 1)

#### [NEW] `backend/app/main.py`
FastAPI entry point with CORS, lifespan events (model warm-up), and router registration.

#### [NEW] `backend/app/core/config.py`
Pydantic `BaseSettings` for all env vars (DB URL, JWT secret, model paths, FAISS path).

#### [NEW] `backend/app/core/database.py`
SQLAlchemy async engine + PostGIS integration + Alembic migration setup.

#### [NEW] `backend/app/models/db_models.py`
`DiagnosisEvent` table: `id, timestamp, governorate, delegation, disease_class, severity_level, risk_score` (NO GPS coords).

#### [NEW] `backend/app/inference/yolo_runner.py`
Loads YOLOv8 via `ultralytics` (ONNX or `.pt`), returns bounding boxes + confidence.

#### [NEW] `backend/app/inference/unet_runner.py`
Loads U-Net checkpoint via PyTorch, runs segmentation on cropped region, returns infected pixel ratio.

#### [NEW] `backend/app/inference/resnet_runner.py`
Loads ResNet-50, runs forward pass, applies Grad-CAM, returns class + heatmap as base64 PNG.

#### [NEW] `backend/app/inference/lstm_runner.py`
Loads LSTM `.pth`, accepts 7-day climate features, returns risk scores per day.

#### [NEW] `backend/app/inference/pipeline.py`
Orchestrates all four runners:
1. YOLO → detect bounding box
2. Crop → pass to U-Net → infected pixel ratio
3. ResNet → classification + Grad-CAM
4. Severity Index = (infected_pixels / total_leaf_area) × 100 → Level 1–4
5. Return full JSON response

#### [NEW] `backend/app/api/v1/analyze.py`
`POST /api/v1/analyze` — accepts multipart image, calls pipeline, persists anonymized event, broadcasts via WebSocket.

#### [NEW] `backend/app/api/v1/auth.py`
`POST /auth/register`, `POST /auth/login` with bcrypt + JWT.

#### [NEW] `backend/requirements.txt`
```
fastapi, uvicorn[standard], sqlalchemy[asyncio], asyncpg, geoalchemy2, alembic,
python-multipart, python-jose[cryptography], passlib[bcrypt], 
torch, torchvision, ultralytics, onnxruntime, opencv-python-headless,
langchain, langchain-community, faiss-cpu, sentence-transformers,
numpy, pillow, pydantic-settings
```

#### [NEW] `backend/Dockerfile`

---

### Phase 2 — Frontend: Mobile-First Farmer Interface (Day 2)

#### [NEW] `frontend/src/app/page.tsx`
Home page: hero section in Tunisian Arabic, large touch-optimized upload button (camera + file picker), PWA install prompt.

#### [NEW] `frontend/src/components/UploadCard.tsx`
Drag-and-drop zone + `react-webcam` capture. Compresses image client-side before upload. Shows "Analyzing…" skeleton on submit.

#### [NEW] `frontend/src/app/result/page.tsx`
Diagnosis Result page:
- Original image with Grad-CAM overlay (CSS blend mode)
- `SeverityBadge` (Green/Yellow/Orange/Red)
- Severity Index percentage ring chart
- "Chat with Assistant" button → opens `ChatWidget` with diagnosis pre-injected

#### [NEW] `frontend/src/components/ChatWidget.tsx`
Floating chat bubble → full-screen panel on mobile. Supports RTL Arabic text. Calls `POST /api/v1/chat`.

#### [NEW] `frontend/src/service-worker.ts`
Workbox-based Service Worker: caches shell, intercepts upload requests offline → stores in IndexedDB → syncs on reconnect.

---

### Phase 3 — CRDA Dashboard (Day 2–3)

#### [NEW] `frontend/src/app/dashboard/page.tsx`
Protected route (JWT check). Layout: map (60%) + panels (40%).

#### [NEW] `frontend/src/components/ChoroMap.tsx`
Leaflet choropleth using Tunisia GeoJSON. Color scale: green → red by intensity. Click governorate → drill-down panel.

#### [NEW] `frontend/src/components/RiskForecast.tsx`
Recharts `BarChart` showing LSTM 7-day risk per governorate. Animated bars with threshold line at 0.7.

#### [NEW] `frontend/src/hooks/useWebSocket.ts`
Connects to `ws://api/ws/events`. Appends new diagnosis events to the dashboard store in real-time.

---

### Phase 4 — Chatbot RAG Pipeline (Day 3)

#### [NEW] `backend/app/chatbot/rag_chain.py`
LangChain pipeline:
1. `SentenceTransformerEmbeddings` → FAISS similarity search (top-3 protocols)
2. Combine retrieved docs + diagnosis JSON → prompt template
3. Mistral-7B (via `ChatMistralAI` API or local `llama-cpp-python`)
4. Stream response via SSE

#### [NEW] `backend/app/api/v1/chat.py`
`POST /api/v1/chat` — accepts `{question, diagnosis_context}`, returns streamed Mistral response.

---

### Phase 5 — Docker Compose & Deployment (Day 3–4)

#### [NEW] `docker-compose.yml`
Three services: `db` (postgres:16-postgis), `api` (FastAPI/uvicorn), `web` (Next.js/Nginx).

#### [NEW] `.env.example`
All required environment variables with placeholder values.

#### [NEW] `README.md`
Step-by-step: place model weights → `docker compose up` → access at localhost.

---

## Verification Plan

### Automated Tests
- `pytest` on `POST /api/v1/analyze` with a sample olive leaf image (mocked model runners to avoid GPU dependency in CI)
- `pytest` on auth endpoints (register/login/token validation)
- Cypress or Playwright E2E test: upload image → verify result page renders severity badge

### Manual Verification
- Open the app on a 360px-wide mobile viewport and verify upload button ≥ 44px, Arabic text renders RTL
- Open `/dashboard` and verify choropleth map loads with mock data
- Send a chat message and verify the RAG response includes a treatment protocol
- Run `docker compose up` and verify all 3 services start without errors

---

## Execution Order

| Phase | Deliverable | Est. Time |
|-------|-------------|-----------|
| 1 | Backend: FastAPI + all 4 inference runners + `/analyze` endpoint | Session 1 |
| 2 | Frontend: Home page + Upload + Diagnosis Result + ChatWidget | Session 2 |
| 3 | Frontend: CRDA Dashboard + Leaflet map + LSTM chart | Session 2–3 |
| 4 | Chatbot: LangChain RAG chain + streaming chat endpoint | Session 3 |
| 5 | Docker Compose + README + .env + final polish | Session 3–4 |
