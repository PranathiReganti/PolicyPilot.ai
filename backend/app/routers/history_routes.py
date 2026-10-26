import json
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, RecommendationHistory
from app.auth import get_optional_user

router = APIRouter(prefix="/history", tags=["Search History & Dashboard"])

@router.get("")
def get_user_history(
    limit: int = 15,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Retrieves past recommendation sessions for the current authenticated user,
    or recent public sessions if browsing as a guest.
    """
    query = db.query(RecommendationHistory)
    if current_user:
        query = query.filter(RecommendationHistory.user_id == current_user.id)
    
    records = query.order_by(RecommendationHistory.created_at.desc()).limit(limit).all()

    results = []
    for r in records:
        try:
            profile_dict = json.loads(r.input_profile) if r.input_profile else {}
            recs_dict = json.loads(r.recommended_policies) if r.recommended_policies else []
        except Exception:
            profile_dict = {}
            recs_dict = []

        results.append({
            "id": r.id,
            "session_id": r.session_id,
            "insurance_type": r.insurance_type,
            "created_at": r.created_at.isoformat() if r.created_at else "",
            "input_profile": profile_dict,
            "top_policy_name": recs_dict[0]["policy_name"] if recs_dict else "N/A",
            "top_match_percentage": recs_dict[0]["match_percentage"] if recs_dict else 0,
            "recommended_count": len(recs_dict),
            "recommendations": recs_dict
        })

    return results

@router.get("/{session_id}")
def get_history_by_session(session_id: str, db: Session = Depends(get_db)):
    """Retrieves full profile and recommendation history for a specific session."""
    record = db.query(RecommendationHistory).filter(RecommendationHistory.session_id == session_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session record not found.")

    try:
        profile_dict = json.loads(record.input_profile) if record.input_profile else {}
        recs_dict = json.loads(record.recommended_policies) if record.recommended_policies else []
    except Exception:
        profile_dict = {}
        recs_dict = []

    return {
        "id": record.id,
        "session_id": record.session_id,
        "insurance_type": record.insurance_type,
        "created_at": record.created_at.isoformat() if record.created_at else "",
        "input_profile": profile_dict,
        "recommendations": recs_dict
    }
