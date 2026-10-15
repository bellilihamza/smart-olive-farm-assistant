"""
SQLAlchemy ORM models.

PRIVACY NOTE: No GPS coordinates are stored — only aggregated
Governorate + Delegation identifiers per INPDP compliance.
"""
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="farmer")  # "farmer" | "inspector"
    governorate: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    is_active: Mapped[bool] = mapped_column(default=True)


class DiagnosisEvent(Base):
    """
    Record of each AI inference.
    Optionally associated with user_id if logged in.
    INPDP-compliant: no precise GPS, no personal data.
    """
    __tablename__ = "diagnosis_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )

    # ── Location (aggregated only) ───────────────────────────────────────
    governorate: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    delegation: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # ── Diagnosis outputs ────────────────────────────────────────────────
    disease_class: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    severity_index: Mapped[float] = mapped_column(Float, nullable=False)
    severity_level: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-4
    risk_score: Mapped[float] = mapped_column(Float, nullable=True)

    # ── Meta ─────────────────────────────────────────────────────────────
    image_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)


class ChatSession(Base):
    """Stores RAG chatbot interactions grouped by conversation_id."""
    __tablename__ = "chat_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
    conversation_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True, index=True)  # UUID
    diagnosis_event_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    retrieved_protocol_ids: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
