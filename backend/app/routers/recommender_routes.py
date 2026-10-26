import uuid
import json
from typing import Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, RecommendationHistory
from app.schemas import UserProfileInput, RecommendationResponse
from app.auth import get_optional_user
from app.services.recommender import recommender_service

router = APIRouter(prefix="/recommend", tags=["Recommendation Engine"])

@router.post("", response_model=RecommendationResponse)
def get_recommendations(
    profile: UserProfileInput,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Evaluates user profile across hard eligibility filters and multi-criteria
    scoring algorithms to return top-5 ranked, explainable policy recommendations.
    """
    # 1. Run recommendation engine
    recommendations = recommender_service.recommend(db, profile)

    session_id = str(uuid.uuid4())

    # 2. Persist recommendation session to database
    recs_serialized = [
        {
            "policy_id": r.policy.id,
            "policy_name": r.policy.policy_name,
            "insurer": r.policy.insurer,
            "match_percentage": r.match_percentage,
            "estimated_premium": r.estimated_premium,
            "why_recommended": r.why_recommended,
            "score_breakdown": r.score_breakdown.model_dump()
        }
        for r in recommendations
    ]

    history_entry = RecommendationHistory(
        session_id=session_id,
        user_id=current_user.id if current_user else None,
        insurance_type=profile.insurance_type,
        input_profile=json.dumps(profile.model_dump()),
        recommended_policies=json.dumps(recs_serialized)
    )
    db.add(history_entry)
    db.commit()

    return RecommendationResponse(
        session_id=session_id,
        insurance_type=profile.insurance_type,
        total_candidates_analyzed=len(recommendations),
        recommendations=recommendations,
        profile_summary={
            "age": profile.age,
            "city": profile.city,
            "budget": profile.budget_annual,
            "insurance_type": profile.insurance_type,
            "coverage_priority": profile.coverage_priority,
            "smoker": profile.smoker,
            "conditions_count": len(profile.pre_existing_conditions)
        }
    )
