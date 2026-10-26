import json
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, ChatMessageHistory
from app.schemas import ChatRequest, ChatResponse
from app.auth import get_optional_user
from app.services.rag import rag_advisor

router = APIRouter(prefix="/chat", tags=["AI Advisor"])

@router.post("", response_model=ChatResponse)
def chat_with_advisor(
    req: ChatRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    RAG-driven insurance conversational assistant. Retrieves policy terms,
    clauses, waiting periods, and citations to deliver explainable answers.
    """
    response = rag_advisor.answer_query(db, req.message, req.session_id)

    # Persist chat history
    user_msg = ChatMessageHistory(
        session_id=response.session_id,
        user_id=current_user.id if current_user else None,
        role="user",
        message=req.message,
        sources=None
    )
    db.add(user_msg)

    sources_json = json.dumps([s.model_dump() for s in response.sources])
    ai_msg = ChatMessageHistory(
        session_id=response.session_id,
        user_id=current_user.id if current_user else None,
        role="assistant",
        message=response.answer,
        sources=sources_json
    )
    db.add(ai_msg)
    db.commit()

    return response
