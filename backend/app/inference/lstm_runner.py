"""
LSTM climate-risk prediction runner.

Accepts a sequence of 7 climate feature vectors and returns a risk score
per day (0.0–1.0), where ≥0.7 is considered high risk.

Expected input shape: (7, num_features) where features are e.g.
[temperature, humidity, rainfall, wind_speed, dew_point].
"""
from __future__ import annotations

import logging
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn

from app.core.config import settings

logger = logging.getLogger(__name__)
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

NUM_FEATURES = 3   # match your training config
HIDDEN_SIZE = 32
NUM_LAYERS = 2
SEQUENCE_LEN = 7


class OliveRiskLSTM(nn.Module):
    """Must match the architecture used during training."""

    def __init__(self) -> None:
        super().__init__()
        self.lstm = nn.LSTM(
            input_size=NUM_FEATURES,
            hidden_size=HIDDEN_SIZE,
            num_layers=NUM_LAYERS,
            batch_first=True,
            dropout=0.2,
        )
        self.fc = nn.Sequential(
            nn.Linear(HIDDEN_SIZE, 64),
            nn.ReLU(),
            nn.Linear(64, 1),
            nn.Sigmoid(),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        out, _ = self.lstm(x)          # (batch, seq, hidden)
        return self.fc(out).squeeze(-1)  # (batch, seq)


class LSTMRunner:
    def __init__(self) -> None:
        self._model: nn.Module | None = None
        self._ready = False

    def load(self) -> None:
        weights: Path = settings.LSTM_WEIGHTS
        if not weights.exists():
            logger.warning(
                "LSTM weights '%s' not found in %s — MOCK mode: risk forecast is fake.",
                weights.name, weights.parent,
            )
            self._ready = False
            return

        try:
            self._model = OliveRiskLSTM().to(DEVICE)
            state = torch.load(str(weights), map_location=DEVICE, weights_only=True)
            self._model.load_state_dict(state, strict=False)
            self._model.eval()
            self._ready = True
            logger.info("LSTM loaded from %s on %s", weights, DEVICE)
        except Exception as exc:
            logger.error("Failed to load LSTM: %s", exc)
            self._ready = False

    @property
    def ready(self) -> bool:
        """False when the weight file was missing or failed to load (MOCK mode)."""
        return self._ready

    def predict(
        self,
        climate_sequence: list[list[float]] | None = None,
    ) -> list[float]:
        """
        Args:
            climate_sequence: list of 7 feature vectors, each of length NUM_FEATURES.
                              If None, uses mock sine-wave data.

        Returns:
            List of 7 daily risk scores (float 0-1).
        """
        if not self._ready or climate_sequence is None:
            return self._mock_predict()

        arr = np.array(climate_sequence, dtype=np.float32)  # (7, F)
        if arr.shape != (SEQUENCE_LEN, NUM_FEATURES):
            logger.warning("Unexpected sequence shape %s — using mock.", arr.shape)
            return self._mock_predict()

        tensor = torch.tensor(arr).unsqueeze(0).to(DEVICE)  # (1,7,F)
        with torch.no_grad():
            scores = self._model(tensor).squeeze(0).cpu().tolist()
        return [round(float(s), 4) for s in scores]

    @staticmethod
    def _mock_predict() -> list[float]:
        """Realistic-looking risk curve for demo purposes."""
        import math
        return [round(0.45 + 0.30 * math.sin(i * 0.9 + 1.2), 4) for i in range(7)]
