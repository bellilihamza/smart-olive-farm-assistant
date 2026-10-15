"""
FastAPI application entry point.
Configures lifespan (model + DB warm-up), CORS, and router registration.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.inference.pipeline import InferencePipeline
from app.chatbot.rag_chain import rag_chain

# API routers
from app.api.v1.analyze import router as analyze_router
from app.api.v1.analyze_water_stress import router as water_stress_router
from app.api.v1.auth import router as auth_router
from app.api.v1.chat import router as chat_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.history import router as history_router
from app.websocket.events import websocket_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ───────────────────────────────────────────────────────────
    pipeline = InferencePipeline()
    await pipeline.load_models()
    app.state.pipeline = pipeline

    rag_chain.load()

    await init_db()

    yield

    # ── Shutdown ──────────────────────────────────────────────────────────
    # Nothing to explicitly close for asyncpg — handled by SQLAlchemy


app = FastAPI(
    title=settings.APP_NAME,
    description="Smart Olive Farm AI Assistant — Backend API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(auth_router,       prefix="/api/v1/auth",      tags=["Auth"])
app.include_router(analyze_router,    prefix="/api/v1",           tags=["Inference"])
app.include_router(water_stress_router, prefix="/api/v1",           tags=["Water Stress"])
app.include_router(chat_router,       prefix="/api/v1",           tags=["Chatbot"])
app.include_router(dashboard_router,  prefix="/api/v1",           tags=["Dashboard"])
app.include_router(history_router,    prefix="/api/v1",           tags=["History"])
app.include_router(websocket_router,  prefix="/ws",               tags=["WebSocket"])


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "app": settings.APP_NAME}
