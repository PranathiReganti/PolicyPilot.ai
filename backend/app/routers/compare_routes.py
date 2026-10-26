from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Policy
from app.schemas import CompareRequest, CompareResponse, PolicyResponse

router = APIRouter(prefix="/compare", tags=["Policy Comparison"])

@router.post("", response_model=CompareResponse)
def compare_policies(req: CompareRequest, db: Session = Depends(get_db)):
    """
    Returns side-by-side metrics table and 5-axis radar chart data
    for 2 to 4 selected insurance policies.
    """
    policies = db.query(Policy).filter(Policy.id.in_(req.policy_ids)).all()
    if len(policies) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least 2 valid policy IDs are required for comparison."
        )

    # Sort policies in same order as requested
    policy_map = {p.id: p for p in policies}
    ordered_policies = [policy_map[pid] for pid in req.policy_ids if pid in policy_map]

    # 1. Side-by-Side Comparison Metrics Table
    metrics_table = [
        {
            "metric": "Insurer",
            "values": {p.policy_name: p.insurer for p in ordered_policies}
        },
        {
            "metric": "Category",
            "values": {p.policy_name: p.category.capitalize() for p in ordered_policies}
        },
        {
            "metric": "Base Annual Premium",
            "values": {p.policy_name: f"₹{p.base_premium_annual:,}/yr" for p in ordered_policies}
        },
        {
            "metric": "Sum Insured Range",
            "values": {p.policy_name: f"₹{p.min_sum_insured:,} - ₹{p.max_sum_insured:,}" for p in ordered_policies}
        },
        {
            "metric": "Claim Settlement Ratio",
            "values": {p.policy_name: f"{p.claim_settlement_ratio}%" for p in ordered_policies}
        },
        {
            "metric": "Waiting Period (PED)",
            "values": {p.policy_name: f"{p.waiting_period_months} months" for p in ordered_policies}
        },
        {
            "metric": "Cashless Network",
            "values": {p.policy_name: f"{p.network_hospitals_or_garages:,} partners" if p.network_hospitals_or_garages > 0 else "Worldwide / Direct" for p in ordered_policies}
        },
        {
            "metric": "Room Rent Limit",
            "values": {p.policy_name: p.room_rent_limit for p in ordered_policies}
        },
        {
            "metric": "Co-payment",
            "values": {p.policy_name: f"{p.copay_percentage}%" if p.copay_percentage > 0 else "Zero Co-pay" for p in ordered_policies}
        },
        {
            "metric": "Customer Rating",
            "values": {p.policy_name: f"★ {p.rating} / 5.0" for p in ordered_policies}
        },
        {
            "metric": "Key Inclusions",
            "values": {p.policy_name: p.coverage_features for p in ordered_policies}
        },
        {
            "metric": "Major Exclusions",
            "values": {p.policy_name: p.exclusions or "Standard exclusions apply" for p in ordered_policies}
        }
    ]

    # 2. Recharts Radar Chart Data
    # 5 Dimensions: Affordability, Claim Settlement, Network Reach, Waiting Advantage, Rating
    max_premium = max([p.base_premium_annual for p in ordered_policies]) or 1
    max_network = max([p.network_hospitals_or_garages for p in ordered_policies]) or 1

    dimensions = [
        "Affordability",
        "Claim Settlement",
        "Network Breadth",
        "Waiting Period",
        "Customer Rating"
    ]

    radar_data = []
    for dim in dimensions:
        dim_row: Dict[str, Any] = {"dimension": dim}
        for p in ordered_policies:
            if dim == "Affordability":
                # Lower premium scores higher
                dim_row[p.policy_name] = round(max(40.0, 100.0 - (p.base_premium_annual / max_premium) * 50.0), 1)
            elif dim == "Claim Settlement":
                dim_row[p.policy_name] = round(min(100.0, max(50.0, (p.claim_settlement_ratio - 80.0) * 5.0)), 1)
            elif dim == "Network Breadth":
                val = 90.0 if p.network_hospitals_or_garages == 0 else (p.network_hospitals_or_garages / max(10000, max_network)) * 100.0
                dim_row[p.policy_name] = round(min(100.0, max(40.0, val)), 1)
            elif dim == "Waiting Period":
                dim_row[p.policy_name] = round(max(30.0, 100.0 - (p.waiting_period_months * 1.8)), 1)
            elif dim == "Customer Rating":
                dim_row[p.policy_name] = round((p.rating / 5.0) * 100.0, 1)
        radar_data.append(dim_row)

    return CompareResponse(
        policies=[PolicyResponse.model_validate(p) for p in ordered_policies],
        metrics_table=metrics_table,
        radar_data=radar_data
    )
