"""
ResNet-50 classification + Grad-CAM heatmap runner.

Returns: disease class name, confidence score, and a base64-encoded
PNG of the Grad-CAM overlay (original image blended with the heatmap).
"""
from __future__ import annotations

import base64
import io
import logging
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
import torchvision.transforms as T

from app.core.config import settings

logger = logging.getLogger(__name__)
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
NUM_CLASSES = len(settings.DISEASE_CLASSES)
IMG_SIZE = 224

# ── ImageNet normalization (required for any pretrained ResNet) ───────────────
_IMAGENET_MEAN = [0.485, 0.456, 0.406]
_IMAGENET_STD  = [0.229, 0.224, 0.225]

_TRANSFORM = T.Compose([
    T.Resize((IMG_SIZE, IMG_SIZE)),
    T.ToTensor(),
    T.Normalize(mean=_IMAGENET_MEAN, std=_IMAGENET_STD),
])


# ── Grad-CAM hook ─────────────────────────────────────────────────────────────

class GradCAM:
    def __init__(self, model: nn.Module, target_layer: nn.Module) -> None:
        self.gradients: torch.Tensor | None = None
        self.activations: torch.Tensor | None = None
        target_layer.register_forward_hook(self._save_activation)
        target_layer.register_full_backward_hook(self._save_gradient)

    def _save_activation(self, _module, _inp, output: torch.Tensor) -> None:
        self.activations = output.detach()

    def _save_gradient(self, _module, _grad_in, grad_out: tuple) -> None:
        self.gradients = grad_out[0].detach()

    def generate(self, class_idx: int) -> np.ndarray:
        """Returns a (H,W) numpy array of the Grad-CAM saliency map (0-1)."""
        weights = self.gradients.mean(dim=(2, 3), keepdim=True)  # GAP
        cam = (weights * self.activations).sum(dim=1, keepdim=True)
        cam = F.relu(cam)
        cam = cam.squeeze().cpu().numpy()
        cam -= cam.min()
        if cam.max() > 0:
            cam /= cam.max()
        return cam


# ── Runner ─────────────────────────────────────────────────────────────────────

class ResNetRunner:
    def __init__(self) -> None:
        self._model: nn.Module | None = None
        self._gradcam: GradCAM | None = None
        self._num_classes: int = NUM_CLASSES   # updated after load()
        self._ready = False

    def load(self) -> None:
        weights: Path = settings.RESNET_WEIGHTS
        if not weights.exists():
            logger.warning("ResNet-50 weights not found at %s — MOCK mode.", weights)
            self._ready = False
            return

        try:
            import torchvision.models as tv_models

            # 1. Load raw checkpoint
            raw_state = torch.load(str(weights), map_location=DEVICE, weights_only=True)

            # 2. Strip "backbone." prefix if model was saved as a wrapper class
            #    e.g.  class DiseaseClassifier: self.backbone = resnet18(...)
            if any(k.startswith("backbone.") for k in raw_state):
                state = {k.removeprefix("backbone."): v for k, v in raw_state.items()
                         if k.startswith("backbone.")}
            else:
                state = raw_state  # already plain ResNet keys

            # 3. Detect actual number of output classes from checkpoint
            detected_classes = int(state["fc.weight"].shape[0])
            if detected_classes != NUM_CLASSES:
                logger.warning(
                    "Checkpoint has %d output classes but config defines %d. "
                    "Using %d classes from checkpoint.",
                    detected_classes, NUM_CLASSES, detected_classes,
                )
            self._num_classes = detected_classes

            # 4. Build ResNet-18 with the correct output size
            model = tv_models.resnet18(weights=None)
            model.fc = nn.Linear(model.fc.in_features, detected_classes)
            model.load_state_dict(state, strict=True)
            model = model.to(DEVICE).eval()

            self._model = model
            self._gradcam = GradCAM(model, model.layer4[-1])
            self._ready = True
            logger.info(
                "ResNet-18 loaded from %s on %s (%d classes)",
                weights, DEVICE, detected_classes,
            )
        except Exception as exc:
            logger.error("Failed to load ResNet-18: %s", exc)
            self._ready = False

    # ── Inference ──────────────────────────────────────────────────────────

    def classify(self, image: Image.Image) -> tuple[int, str, float, str]:
        """
        Returns:
            class_id   — integer index
            class_name — string label
            confidence — float (0-1)
            heatmap_b64 — base64 PNG of Grad-CAM overlay
        """
        if not self._ready:
            return self._mock_classify(image)

        rgb = image.convert("RGB")
        # Apply ImageNet normalization — mandatory for ResNet fine-tuned on ImageNet backbone
        tensor = _TRANSFORM(rgb).unsqueeze(0).to(DEVICE)
        tensor.requires_grad_(True)

        logits = self._model(tensor)
        probs = F.softmax(logits, dim=1)
        class_id = int(probs.argmax(dim=1))
        confidence = float(probs[0, class_id])

        # Grad-CAM backward pass
        self._model.zero_grad()
        logits[0, class_id].backward()
        cam = self._gradcam.generate(class_id)

        # Overlay on original resized image (without normalization, for visualization)
        rgb_display = rgb.resize((IMG_SIZE, IMG_SIZE))
        heatmap_b64 = self._overlay_heatmap(rgb_display, cam)
        # Use only the first self._num_classes labels (checkpoint may have fewer than config)
        labels = settings.DISEASE_CLASSES[: self._num_classes]
        class_name = labels[class_id] if class_id < len(labels) else "Unknown"
        return class_id, class_name, confidence, heatmap_b64

    # ── Helpers ────────────────────────────────────────────────────────────

    @staticmethod
    def _overlay_heatmap(original: Image.Image, cam: np.ndarray) -> str:
        import cv2

        cam_uint8 = (cam * 255).astype(np.uint8)
        cam_resized = cv2.resize(cam_uint8, (original.width, original.height))
        heatmap_bgr = cv2.applyColorMap(cam_resized, cv2.COLORMAP_JET)
        heatmap_rgb = cv2.cvtColor(heatmap_bgr, cv2.COLOR_BGR2RGB)

        orig_np = np.array(original)
        blended = (0.55 * orig_np + 0.45 * heatmap_rgb).clip(0, 255).astype(np.uint8)

        pil_blend = Image.fromarray(blended)
        buf = io.BytesIO()
        pil_blend.save(buf, format="PNG")
        return base64.b64encode(buf.getvalue()).decode()

    @staticmethod
    def _mock_classify(image: Image.Image) -> tuple[int, str, float, str]:
        import cv2

        rgb = image.convert("RGB").resize((IMG_SIZE, IMG_SIZE))
        cam = np.zeros((IMG_SIZE, IMG_SIZE), dtype=np.float32)
        # Fake centred hotspot
        for i in range(IMG_SIZE):
            for j in range(IMG_SIZE):
                cam[i, j] = max(0.0, 1.0 - ((i - IMG_SIZE / 2) ** 2 + (j - IMG_SIZE / 2) ** 2) / (IMG_SIZE * 40))
        cam /= cam.max()
        heatmap_b64 = ResNetRunner._overlay_heatmap(rgb, cam)
        return 2, "Peacock Spot", 0.87, heatmap_b64
