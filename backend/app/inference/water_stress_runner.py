"""
ResNet-50 Water Stress / Irrigation classifier.

Predicts one of 4 irrigation classes from an RGB olive leaf image:
  Class 0 → 100% irrigation  (Healthy / No Water Stress)
  Class 1 → 50%  irrigation  (Mild Water Stress)
  Class 2 → 25%  irrigation  (Moderate Water Stress)
  Class 3 → 0%   irrigation  (Severe Water Stress / Rainfed)

Loaded once at startup. Completely independent from the disease pipeline.
"""
from __future__ import annotations

import logging
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image

from app.core.config import settings

logger = logging.getLogger(__name__)

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
IMG_SIZE = 224
NUM_CLASSES = 4

# ── Label mappings ─────────────────────────────────────────────────────────────

IRRIGATION_CLASSES = ["100%", "50%", "25%", "0%"]

STRESS_LEVELS = {
    0: "Healthy / No Water Stress",
    1: "Mild Water Stress",
    2: "Moderate Water Stress",
    3: "Severe Water Stress",
}

STRESS_LEVELS_FR = {
    0: "Sain — Aucun stress hydrique",
    1: "Stress hydrique léger",
    2: "Stress hydrique modéré",
    3: "Stress hydrique sévère",
}

STRESS_LEVELS_AR = {
    0: "سليم — لا يوجد إجهاد مائي",
    1: "إجهاد مائي خفيف",
    2: "إجهاد مائي متوسط",
    3: "إجهاد مائي شديد",
}


class WaterStressRunner:
    """Standalone water-stress classifier — loaded once at app startup."""

    def __init__(self) -> None:
        self._model: nn.Module | None = None
        self._ready = False

    # ── Lifecycle ─────────────────────────────────────────────────────────

    def load(self) -> None:
        weights: Path = settings.WATER_STRESS_WEIGHTS
        if not weights.exists():
            logger.warning(
                "Water-stress weights not found at %s — MOCK mode.", weights
            )
            self._ready = False
            return

        try:
            import torchvision.models as tv_models

            model = tv_models.resnet50(weights=None)
            model.fc = nn.Linear(model.fc.in_features, NUM_CLASSES)

            state = torch.load(str(weights), map_location=DEVICE, weights_only=True)
            model.load_state_dict(state, strict=False)
            model = model.to(DEVICE).eval()

            self._model = model
            self._ready = True
            logger.info("Water-stress ResNet-50 loaded from %s on %s", weights, DEVICE)
        except Exception as exc:
            logger.error("Failed to load water-stress model: %s", exc)
            self._ready = False

    # ── Inference ─────────────────────────────────────────────────────────

    def predict(self, image: Image.Image) -> dict:
        """
        Returns a dict with water stress prediction:
          {
            "irrigation_class": "25%",
            "stress_level": "Moderate Water Stress",
            "stress_level_fr": "Stress hydrique modéré",
            "stress_level_ar": "إجهاد مائي متوسط",
            "class_id": 2,
            "confidence": 0.94
          }
        """
        if not self._ready:
            return self._mock_predict()

        import torchvision.transforms.functional as TF

        rgb = image.convert("RGB").resize((IMG_SIZE, IMG_SIZE))
        tensor = TF.to_tensor(rgb).unsqueeze(0).to(DEVICE)

        with torch.no_grad():
            logits = self._model(tensor)
            probs = F.softmax(logits, dim=1)
            class_id = int(probs.argmax(dim=1))
            confidence = float(probs[0, class_id])

        return {
            "irrigation_class": IRRIGATION_CLASSES[class_id],
            "stress_level": STRESS_LEVELS[class_id],
            "stress_level_fr": STRESS_LEVELS_FR[class_id],
            "stress_level_ar": STRESS_LEVELS_AR[class_id],
            "class_id": class_id,
            "confidence": round(confidence, 4),
        }

    # ── Mock (dev / no weights) ────────────────────────────────────────────

    @staticmethod
    def _mock_predict() -> dict:
        """Return a plausible mock result for development without weights."""
        return {
            "irrigation_class": "50%",
            "stress_level": "Mild Water Stress",
            "stress_level_fr": "Stress hydrique léger",
            "stress_level_ar": "إجهاد مائي خفيف",
            "class_id": 1,
            "confidence": 0.82,
        }
