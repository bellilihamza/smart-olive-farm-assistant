"""
Central application configuration loaded from environment variables.
All secrets must be supplied via .env or Docker environment — never hard-coded.
"""
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[2]   # /backend


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=[BASE_DIR / ".env", BASE_DIR.parent / ".env"],
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── App ──────────────────────────────────────────────────────
    APP_NAME: str = "Smart Olive Farm Assistant"
    APP_ENV: str = "development"
    DEBUG: bool = True
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost"]

    # ── Database ─────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://olive:olive_secret@db:5432/olive_farm"

    # ── JWT Auth ─────────────────────────────────────────────────
    JWT_SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION_USE_OPENSSL_RAND"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 h

    # ── Model Weights ─────────────────────────────────────────────
    YOLO_WEIGHTS: Path = BASE_DIR / "weights" / "best.pt"
    UNET_WEIGHTS: Path = BASE_DIR / "weights" / "unet_severity.pth"
    RESNET_WEIGHTS: Path = BASE_DIR / "weights" / "resnet18_disease_classifier.pth"
    LSTM_WEIGHTS: Path = BASE_DIR / "weights" / "lstm_risk.pth"
    WATER_STRESS_WEIGHTS: Path = BASE_DIR / "weights" / "resnet_water_stress.pth"

    # ── FAISS ─────────────────────────────────────────────────────
    FAISS_INDEX_PATH: Path = BASE_DIR / "data" / "faiss_index"
    PROTOCOLS_JSON_PATH: Path = BASE_DIR / "data" / "treatment_protocols.json"

    # ── Mistral AI ───────────────────────────────────────────────
    MISTRAL_API_KEY: str = ""
    MISTRAL_MODEL: str = "mistral-small-latest"

    # ── Inference ─────────────────────────────────────────────────
    MAX_IMAGE_SIZE_MB: int = 10
    INFERENCE_TIMEOUT_S: float = 8.0

    # ── YOLO class names ─────────────────────────────────────────
    # IMPORTANT: must match the exact class order used when training the ResNet model
    DISEASE_CLASSES: list[str] = [
        "Healthy",
        "Peacock Spot",
        "Aculus Olearius",
    ]


settings = Settings()
