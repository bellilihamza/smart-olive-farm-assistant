"""
Multimodal inference pipeline.

Orchestrates: YOLO → Crop → U-Net → ResNet+GradCAM → Severity computation.
Returns the unified DiagnosisResult dataclass consumed by the API layer.
"""
from __future__ import annotations

import hashlib
import io
import logging
from dataclasses import dataclass

from PIL import Image

from app.inference.yolo_runner import YOLORunner, Detection
from app.inference.unet_runner import UNetRunner
from app.inference.resnet_runner import ResNetRunner
from app.inference.lstm_runner import LSTMRunner
from app.inference.water_stress_runner import WaterStressRunner

logger = logging.getLogger(__name__)


# ── Severity mapping ───────────────────────────────────────────────────────────
# Severity Index = (infected_pixels / total_leaf_area) × 100
# Maps to levels 1–4 per agronomic thresholds.

def _severity_level(index_pct: float) -> int:
    if index_pct < 10:
        return 1   # Minor
    elif index_pct < 30:
        return 2   # Moderate
    elif index_pct < 60:
        return 3   # Severe
    else:
        return 4   # Critical


SEVERITY_LABELS = {1: "Minor", 2: "Moderate", 3: "Severe", 4: "Critical"}


@dataclass
class DiagnosisResult:
    disease_class: str
    class_id: int
    confidence: float
    bbox_coords: tuple[int, int, int, int]
    severity_index: float        # 0–100 %
    severity_level: int          # 1–4
    severity_label: str
    grad_cam_heatmap: str        # base64 PNG
    risk_score: float            # LSTM 7-day avg (0–1)
    daily_risk_scores: list[float]
    image_hash: str


class InferencePipeline:
    """Singleton loaded at app startup via FastAPI lifespan."""

    def __init__(self) -> None:
        self.yolo = YOLORunner()
        self.unet = UNetRunner()
        self.resnet = ResNetRunner()
        self.lstm = LSTMRunner()
        self.water_stress = WaterStressRunner()   # independent model

    async def load_models(self) -> None:
        """Warm-up: load all model weights into memory."""
        logger.info("Loading AI models …")
        self.yolo.load()
        self.unet.load()
        self.resnet.load()
        self.lstm.load()
        self.water_stress.load()                  # load water-stress model
        logger.info("All models ready.")

    async def run(
        self,
        image_bytes: bytes,
        climate_sequence: list[list[float]] | None = None,
    ) -> DiagnosisResult:
        """
        Full pipeline:
        1. Decode image
        2. YOLO  → bounding box of primary lesion
        3. Crop  → isolate lesion region
        4. U-Net → infected-pixel ratio
        5. ResNet + Grad-CAM → class, confidence, heatmap
        6. Severity Index & Level
        7. LSTM  → 7-day risk scores
        """
        # ── 1. Decode ──────────────────────────────────────────────────────
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image_hash = hashlib.sha256(image_bytes).hexdigest()[:16]

        # ── 2. YOLO detection ──────────────────────────────────────────────
        detections = self.yolo.predict(image)
        if detections:
            best: Detection = detections[0]
            bbox = best.bbox
        else:
            # No detection → treat full image as region of interest
            bbox = (0, 0, image.width, image.height)

        # ── 3. Crop ────────────────────────────────────────────────────────
        crop = image.crop(bbox)

        # ── 4. U-Net segmentation ──────────────────────────────────────────
        _mask, infected_ratio = self.unet.segment(crop)

        # ── 5. ResNet classification + Grad-CAM ───────────────────────────
        class_id, class_name, confidence, heatmap_b64 = self.resnet.classify(image)

        # ── 6. Severity ────────────────────────────────────────────────────
        severity_index = round(infected_ratio * 100, 2)
        severity_level = _severity_level(severity_index)
        severity_label = SEVERITY_LABELS[severity_level]
        
        if class_name == "Healthy":
            severity_index = 0.0
            severity_level = 0
            severity_label = "None"

        # ── 7. LSTM risk forecast ──────────────────────────────────────────
        daily_risks = self.lstm.predict(climate_sequence)
        risk_score = round(sum(daily_risks) / len(daily_risks), 4)

        return DiagnosisResult(
            disease_class=class_name,
            class_id=class_id,
            confidence=round(confidence, 4),
            bbox_coords=bbox,
            severity_index=severity_index,
            severity_level=severity_level,
            severity_label=severity_label,
            grad_cam_heatmap=heatmap_b64,
            risk_score=risk_score,
            daily_risk_scores=daily_risks,
            image_hash=image_hash,
        )
