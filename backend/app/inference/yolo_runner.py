"""
YOLOv8 Nano inference runner.

Accepts a PIL Image, returns bounding boxes for detected disease regions.
Falls back to a dummy detection if the weight file is not present (dev mode).
"""
from __future__ import annotations

import logging
from pathlib import Path
from typing import NamedTuple

import numpy as np
from PIL import Image

from app.core.config import settings

logger = logging.getLogger(__name__)


class Detection(NamedTuple):
    class_id: int
    class_name: str
    confidence: float
    bbox: tuple[int, int, int, int]  # x1, y1, x2, y2 (pixel coords)


class YOLORunner:
    def __init__(self) -> None:
        self._model = None
        self._ready = False

    # ── Lifecycle ─────────────────────────────────────────────────────────

    def load(self) -> None:
        weights: Path = settings.YOLO_WEIGHTS
        if not weights.exists():
            logger.warning(
                "YOLOv8 weights not found at %s — running in MOCK mode.", weights
            )
            self._ready = False
            return

        try:
            from ultralytics import YOLO  # lazy import to avoid startup cost
            self._model = YOLO(str(weights))
            self._ready = True
            logger.info("YOLOv8 loaded from %s", weights)
        except Exception as exc:
            logger.error("Failed to load YOLOv8: %s", exc)
            self._ready = False

    # ── Inference ─────────────────────────────────────────────────────────

    def predict(self, image: Image.Image) -> list[Detection]:
        """Return a list of detections sorted by confidence (highest first)."""
        if not self._ready:
            return self._mock_predict(image)

        img_np = np.array(image.convert("RGB"))
        results = self._model.predict(
            source=img_np,
            conf=0.25,
            iou=0.45,
            verbose=False,
        )

        detections: list[Detection] = []
        for result in results:
            for box in result.boxes:
                cls_id = int(box.cls[0])
                cls_name = settings.DISEASE_CLASSES[cls_id] if cls_id < len(settings.DISEASE_CLASSES) else "Unknown"
                conf = float(box.conf[0])
                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                detections.append(Detection(cls_id, cls_name, conf, (x1, y1, x2, y2)))

        detections.sort(key=lambda d: d.confidence, reverse=True)
        return detections

    # ── Mock (dev / no weights) ────────────────────────────────────────────

    @staticmethod
    def _mock_predict(image: Image.Image) -> list[Detection]:
        w, h = image.size
        return [
            Detection(
                class_id=2,
                class_name="Peacock Spot",
                confidence=0.87,
                bbox=(int(w * 0.2), int(h * 0.2), int(w * 0.8), int(h * 0.8)),
            )
        ]
