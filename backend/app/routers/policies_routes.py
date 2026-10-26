from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Policy
from app.schemas import PolicyResponse

router = APIRouter(prefix="/policies", tags=["Policies"])

@router.get("", response_model=List[PolicyResponse])
def get_all_policies(
    category: Optional[str] = Query(None, description="Filter by category: health, term, life, motor, travel"),
    search: Optional[str] = Query(None, description="Search term in policy name or insurer"),
    max_premium: Optional[int] = Query(None, description="Max benchmark annual premium"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Retrieves policies with optional category, search, and budget filters."""
    query = db.query(Policy)

    if category:
        query = query.filter(Policy.category == category.strip().lower())

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            (Policy.policy_name.ilike(search_pattern)) |
            (Policy.insurer.ilike(search_pattern)) |
            (Policy.coverage_features.ilike(search_pattern))
        )

    if max_premium:
        query = query.filter(Policy.base_premium_annual <= max_premium)

    policies = query.order_by(Policy.rating.desc(), Policy.claim_settlement_ratio.desc()).limit(limit).all()
    return [PolicyResponse.model_validate(p) for p in policies]

@router.get("/meta/categories")
def get_policy_categories(db: Session = Depends(get_db)):
    """Returns available policy categories and count of plans in each."""
    counts = db.query(Policy.category, func.count(Policy.id)).group_by(Policy.category).all()
    return [{"category": c, "count": count} for c, count in counts]

@router.get("/{policy_id}", response_model=PolicyResponse)
def get_policy_by_id(policy_id: int, db: Session = Depends(get_db)):
    """Retrieves detailed information for a single policy by ID."""
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Policy with ID {policy_id} not found."
        )
    return PolicyResponse.model_validate(policy)
