"""
POST /api/v1/analyze-water-stress
Accepts a full-tree / potted-plant image and runs ONLY the water-stress
ResNet-50 classifier.  Completely independent from the disease pipeline.
"""
from __future__ import annotations

import logging
from typing import Annotated

from fastapi import APIRouter, File, HTTPException, Request, UploadFile, status
from pydantic import BaseModel

from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

_MAX_BYTES = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024
_ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}


# ── Response schema ────────────────────────────────────────────────────────────

class WaterStressResponse(BaseModel):
    water_stress_class: str          # "100%", "50%", "25%", "0%"
    water_stress_level: str          # EN label
    water_stress_level_fr: str       # FR label
    water_stress_level_ar: str       # AR label
    water_stress_class_id: int       # 0–3
    water_stress_confidence: float   # 0–1


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.post(
    "/analyze-water-stress",
    response_model=WaterStressResponse,
    summary="Upload a tree / plant image for water-stress prediction",
)
async def analyze_water_stress(
    request: Request,
    file: Annotated[UploadFile, File(description="Olive tree image (JPEG/PNG/WEBP)")],
) -> WaterStressResponse:

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

    # ── Run water-stress model only ───────────────────────────────────────
    import io
    from PIL import Image

    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        ws = request.app.state.pipeline.water_stress.predict(image)
    except Exception as exc:
        logger.exception("Water-stress inference error")
        raise HTTPException(status_code=500, detail=f"Water-stress inference failed: {exc}") from exc

    return WaterStressResponse(
        water_stress_class=ws["irrigation_class"],
        water_stress_level=ws["stress_level"],
        water_stress_level_fr=ws["stress_level_fr"],
        water_stress_level_ar=ws["stress_level_ar"],
        water_stress_class_id=ws["class_id"],
        water_stress_confidence=ws["confidence"],
    )
