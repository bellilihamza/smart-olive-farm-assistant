"""
POST /api/v1/chat
Forwards a farmer's question + optional diagnosis context to the RAG chain.
Stores interaction grouped by conversation_id for history continuity.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.chatbot.rag_chain import rag_chain
from app.core.database import get_session
from app.core.security import get_optional_user_id
from app.models.db_models import ChatSession

router = APIRouter()


class ChatRequest(BaseModel):
    question: str
    diagnosis_context: dict | None = None
    diagnosis_event_id: int | None = None
    conversation_id: str | None = None  # UUID to group messages


class ChatResponse(BaseModel):
    answer: str
    retrieved_protocol_ids: list[str]
    conversation_id: str | None = None


@router.post("/chat", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    session: AsyncSession = Depends(get_session),
    _user_id: int | None = Depends(get_optional_user_id),
) -> ChatResponse:
    answer, protocol_ids = await rag_chain.answer(
        question=body.question,
        diagnosis_context=body.diagnosis_context,
    )

    # Persist for QA & User History
    chat_log = ChatSession(
        user_id=_user_id,
        conversation_id=body.conversation_id,
        diagnosis_event_id=body.diagnosis_event_id,
        question=body.question[:2000],
        answer=answer[:4000],
        retrieved_protocol_ids=",".join(protocol_ids),
    )
    session.add(chat_log)
    await session.commit()

    return ChatResponse(
        answer=answer,
        retrieved_protocol_ids=protocol_ids,
        conversation_id=body.conversation_id,
    )
