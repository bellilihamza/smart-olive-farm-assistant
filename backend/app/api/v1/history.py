"""
History endpoints — per-user diagnosis and grouped chat conversations.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select, desc, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.security import get_optional_user_id
from app.models.db_models import DiagnosisEvent, ChatSession

router = APIRouter()


# ── Schemas ────────────────────────────────────────────────────────────────────

class DiagnosisHistoryItem(BaseModel):
    id: int
    disease_class: str
    confidence: float
    severity_level: int
    severity_index: float
    risk_score: float | None
    governorate: str
    timestamp: str


class ChatMessage(BaseModel):
    id: int
    question: str
    answer: str
    timestamp: str


class ConversationSummary(BaseModel):
    conversation_id: str
    first_question: str
    message_count: int
    last_timestamp: str
    messages: list[ChatMessage]


# ── Diagnosis History ──────────────────────────────────────────────────────────

@router.get("/history/diagnoses", response_model=list[DiagnosisHistoryItem])
async def get_diagnosis_history(
    session: AsyncSession = Depends(get_session),
    user_id: int | None = Depends(get_optional_user_id),
) -> list[DiagnosisHistoryItem]:
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to view history."
        )
    result = await session.execute(
        select(DiagnosisEvent)
        .where(DiagnosisEvent.user_id == user_id)
        .order_by(desc(DiagnosisEvent.timestamp))
        .limit(50)
    )
    events = result.scalars().all()
    return [
        DiagnosisHistoryItem(
            id=e.id,
            disease_class=e.disease_class,
            confidence=e.confidence,
            severity_level=e.severity_level,
            severity_index=e.severity_index,
            risk_score=e.risk_score,
            governorate=e.governorate,
            timestamp=e.timestamp.isoformat() if e.timestamp else "",
        )
        for e in events
    ]


# ── Chat Conversations History ─────────────────────────────────────────────────

@router.get("/history/conversations", response_model=list[ConversationSummary])
async def get_conversations(
    session: AsyncSession = Depends(get_session),
    user_id: int | None = Depends(get_optional_user_id),
) -> list[ConversationSummary]:
    """
    Returns the user's chat conversations grouped by conversation_id.
    Each conversation includes all its messages sorted oldest first.
    """
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required."
        )

    # Fetch all chat sessions for this user with a conversation_id
    result = await session.execute(
        select(ChatSession)
        .where(
            ChatSession.user_id == user_id,
            ChatSession.conversation_id.isnot(None),
        )
        .order_by(desc(ChatSession.timestamp))
        .limit(200)
    )
    sessions = result.scalars().all()

    # Group by conversation_id
    grouped: dict[str, list[ChatSession]] = {}
    for s in sessions:
        cid = s.conversation_id or "unknown"
        grouped.setdefault(cid, []).append(s)

    # Sort each group oldest-first for display
    conversations = []
    for cid, msgs in grouped.items():
        msgs_sorted = sorted(msgs, key=lambda m: m.timestamp)
        last_msg = max(msgs, key=lambda m: m.timestamp)
        conversations.append(
            ConversationSummary(
                conversation_id=cid,
                first_question=msgs_sorted[0].question[:80],
                message_count=len(msgs_sorted),
                last_timestamp=last_msg.timestamp.isoformat() if last_msg.timestamp else "",
                messages=[
                    ChatMessage(
                        id=m.id,
                        question=m.question,
                        answer=m.answer,
                        timestamp=m.timestamp.isoformat() if m.timestamp else "",
                    )
                    for m in msgs_sorted
                ],
            )
        )

    # Sort conversations newest-first
    conversations.sort(key=lambda c: c.last_timestamp, reverse=True)
    return conversations[:20]  # Max 20 conversations
