"""
U-Net (EfficientNet-B4 encoder) segmentation runner.

Segments the cropped disease region and computes the infected-pixel ratio
used to derive the Severity Index.
"""
from __future__ import annotations

import logging
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from PIL import Image

from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Lightweight U-Net definition (matches your training architecture) ─────────
# Replace this with your actual architecture if it differs.


class DoubleConv(nn.Module):
    def __init__(self, in_ch: int, out_ch: int) -> None:
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(in_ch, out_ch, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


class UNetStub(nn.Module):
    """
    Stub architecture — replace with your real UNet(EfficientNet-B4) class.
    The output is a single-channel sigmoid mask.
    """

    def __init__(self) -> None:
        super().__init__()
        self.enc = DoubleConv(3, 64)
        self.pool = nn.MaxPool2d(2)
        self.dec = DoubleConv(64, 64)
        self.out = nn.Conv2d(64, 1, 1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        e = self.enc(x)
        p = self.pool(e)
        d = self.dec(p)
        d = torch.nn.functional.interpolate(d, size=x.shape[2:], mode="bilinear", align_corners=False)
        return torch.sigmoid(self.out(d))


# ── Runner ───────────────────────────────────────────────────────────────────

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
IMG_SIZE = 256


class UNetRunner:
    def __init__(self) -> None:
        self._model: nn.Module | None = None
        self._ready = False

    def load(self) -> None:
        weights: Path = settings.UNET_WEIGHTS
        if not weights.exists():
            logger.warning(
                "U-Net weights '%s' not found in %s — MOCK mode: segmentation is fake.",
                weights.name, weights.parent,
            )
            self._ready = False
            return

        try:
            self._model = UNetStub().to(DEVICE)
            state = torch.load(str(weights), map_location=DEVICE, weights_only=True)
            self._model.load_state_dict(state, strict=False)
            self._model.eval()
            self._ready = True
            logger.info("U-Net loaded from %s on %s", weights, DEVICE)
        except Exception as exc:
            logger.error("Failed to load U-Net: %s", exc)
            self._ready = False

    @property
    def ready(self) -> bool:
        """False when the weight file was missing or failed to load (MOCK mode)."""
        return self._ready

    def segment(self, crop: Image.Image) -> tuple[np.ndarray, float]:
        """
        Returns:
            mask   — binary numpy array (H×W) where 1 = infected pixel
            ratio  — infected_pixels / total_pixels  (0.0 – 1.0)
        """
        if not self._ready:
            return self._mock_segment(crop)

        import torchvision.transforms.functional as TF

        tensor = TF.to_tensor(crop.convert("RGB").resize((IMG_SIZE, IMG_SIZE)))
        tensor = tensor.unsqueeze(0).to(DEVICE)

        with torch.no_grad():
            pred = self._model(tensor)  # (1,1,H,W)

        mask = (pred.squeeze().cpu().numpy() > 0.5).astype(np.uint8)
        ratio = float(mask.sum()) / mask.size
        return mask, ratio

    @staticmethod
    def _mock_segment(crop: Image.Image) -> tuple[np.ndarray, float]:
        h, w = IMG_SIZE, IMG_SIZE
        mask = np.zeros((h, w), dtype=np.uint8)
        # Simulate ~35 % infection
        mask[int(h * 0.2):int(h * 0.55), int(w * 0.25):int(w * 0.75)] = 1
        ratio = float(mask.sum()) / mask.size
        return mask, ratio
