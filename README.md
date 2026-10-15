# Smart Olive Farm Assistant 🌿

A production-grade, full-stack AI web application for diagnosing olive tree diseases, providing RAG-based treatment protocols, and aggregating epidemiological data for national surveillance.

## Architecture

*   **Frontend**: Next.js 14, React 18, Tailwind CSS, Leaflet (Map), Recharts. Mobile-first design for farmers, desktop dashboard for inspectors.
*   **Backend**: FastAPI, SQLAlchemy (async), WebSocket, LangChain, FAISS.
*   **AI Inference Layer**: PyTorch + Ultralytics (YOLOv8 → U-Net → ResNet-50 → LSTM).
*   **Database**: PostgreSQL + PostGIS (for geospatial analytics).

## Project Structure

*   `/backend` - FastAPI server and PyTorch AI runners.
*   `/frontend` - Next.js web application.
*   `/weights` - Directory for AI model weights.
*   `docker-compose.yml` - Orchestrates the full stack.

## Setup Instructions

### 1. Model Weights
Before starting the application, you must place your trained model weights in the `weights/` directory at the root of the project:

```
PFA/
├── weights/
│   ├── yolo_disease.pt        # YOLOv8 model
│   ├── unet_severity.pth      # U-Net PyTorch state_dict
│   ├── resnet_classifier.pth  # ResNet-50 PyTorch state_dict
│   └── lstm_risk.pth          # LSTM PyTorch state_dict
```
*(If weights are missing, the backend will automatically fallback to "MOCK" mode for development/testing).*

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in your details:
```bash
cp .env.example .env
```
Ensure you add your `MISTRAL_API_KEY` for the LangChain RAG Chatbot to function.

### 3. Build FAISS Index (Chatbot)
Before running the backend, build the local FAISS vector store for the chatbot protocols.
*Requires Python 3.10+ locally.*

```bash
cd backend
pip install langchain langchain-community sentence-transformers faiss-cpu
python scripts/build_faiss.py
```
This will generate `backend/data/faiss_index`.

### 4. Run with Docker Compose
To spin up the PostgreSQL database, FastAPI backend, and Next.js frontend simultaneously:

```bash
docker-compose up --build
```

### Accessing the Application
*   **Farmer Web App (Mobile UI)**: `http://localhost:3000`
*   **CRDA Inspector Dashboard**: `http://localhost:3000/dashboard`
*   **Backend API Docs (Swagger)**: `http://localhost:8000/docs`

## Data Privacy (INPDP Compliance)
The system strictly adheres to INPDP regulations.
1. Precise GPS coordinates are **never** stored.
2. Location data is aggregated at the Governorate and Delegation level.
3. The `diagnosis_events` table stores no personally identifiable information (PII).
4. Chatbot logs are fully anonymised for quality assurance only.
