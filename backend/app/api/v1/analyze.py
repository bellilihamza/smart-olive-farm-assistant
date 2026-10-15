"""
POST /api/v1/analyze
Accepts a multipart image upload, runs the 4-model pipeline,
persists an anonymised event, broadcasts via WebSocket, and
returns the full diagnostic JSON.
"""
from __future__ import annotations

import logging
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_session
from app.core.security import get_optional_user_id
from app.models.db_models import DiagnosisEvent
from app.websocket.events import manager

logger = logging.getLogger(__name__)

router = APIRouter()

_MAX_BYTES = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024
_ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}


# ── Response schema ────────────────────────────────────────────────────────────

class DiagnosisResponse(BaseModel):
    disease_class: str
    bbox_coords: tuple[int, int, int, int]
    severity_index: float
    severity_level: int
    severity_label: str
    confidence: float
    grad_cam_heatmap: str     # base64 PNG
    risk_score: float
    daily_risk_scores: list[float]
    image_hash: str


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.post(
    "/analyze",
    response_model=DiagnosisResponse,
    summary="Upload a leaf image for multimodal AI diagnosis",
)
async def analyze(
    request: Request,
    file: Annotated[UploadFile, File(description="Olive leaf image (JPEG/PNG/WEBP)")],
    governorate: Annotated[str, Form()] = "Unknown",
    delegation: Annotated[Optional[str], Form()] = None,
    session: AsyncSession = Depends(get_session),
    _user_id: Optional[int] = Depends(get_optional_user_id),
) -> DiagnosisResponse:

    # ── Validate ──────────────────────────────────────────────────────────
    if file.content_type not in _ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type: {file.content_type}",
        )

    image_bytes = await file.read()
    if len(image_bytes) > _MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image exceeds {settings.MAX_IMAGE_SIZE_MB} MB limit.",
        )

    # ── Run pipeline ──────────────────────────────────────────────────────
    pipeline = request.app.state.pipeline
    try:
        result = await pipeline.run(image_bytes)
    except Exception as exc:
        logger.exception("Inference pipeline error")
        raise HTTPException(status_code=500, detail=f"Inference failed: {exc}") from exc

    # ── Persist event ───────────────────────────────────────────────────────
    event = DiagnosisEvent(
        user_id=_user_id,
        governorate=governorate,
        delegation=delegation,
        disease_class=result.disease_class,
        confidence=result.confidence,
        severity_index=result.severity_index,
        severity_level=result.severity_level,
        risk_score=result.risk_score,
        image_hash=result.image_hash,
    )
    session.add(event)
    await session.flush()
    await session.refresh(event)

    # ── Broadcast to dashboard via WebSocket ──────────────────────────────
    await manager.broadcast({
        "type": "new_diagnosis",
        "id": event.id,
        "timestamp": str(event.timestamp),
        "governorate": governorate,
        "delegation": delegation,
        "disease_class": result.disease_class,
        "severity_level": result.severity_level,
        "risk_score": result.risk_score,
    })

    return DiagnosisResponse(
        disease_class=result.disease_class,
        bbox_coords=result.bbox_coords,
        severity_index=result.severity_index,
        severity_level=result.severity_level,
        severity_label=result.severity_label,
        confidence=result.confidence,
        grad_cam_heatmap=result.grad_cam_heatmap,
        risk_score=result.risk_score,
        daily_risk_scores=result.daily_risk_scores,
        image_hash=result.image_hash,
    )
