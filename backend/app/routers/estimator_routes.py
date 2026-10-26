from fastapi import APIRouter
from app.schemas import PremiumEstimateRequest, PremiumEstimateResponse
from app.services.estimator import estimator_service

router = APIRouter(prefix="/premium-estimate", tags=["Premium Estimator"])

@router.post("", response_model=PremiumEstimateResponse)
def estimate_premium(req: PremiumEstimateRequest):
    """
    Computes an actuarially calibrated premium estimate using interactive sliders
    for age, tobacco status, sum insured, city tier, and pre-existing conditions.
    """
    return estimator_service.estimate(req)
