from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict
import datetime

# --- Auth Schemas ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Minimum 6 characters")
    full_name: str = Field(..., min_length=2)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr
    full_name: str
    created_at: datetime.datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None


# --- Policy Schemas ---
class PolicyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    policy_name: str
    insurer: str
    category: str
    min_age: int
    max_age: int
    min_sum_insured: int
    max_sum_insured: int
    base_premium_annual: int
    coverage_features: str
    exclusions: Optional[str] = None
    waiting_period_months: int
    claim_settlement_ratio: float
    network_hospitals_or_garages: int
    rating: float
    cashless_facility: bool
    room_rent_limit: str
    copay_percentage: int
    best_suited_for: Optional[str] = None
    policy_description: Optional[str] = None


# --- Recommendation Schemas ---
class UserProfileInput(BaseModel):
    age: int = Field(..., ge=18, le=100, description="Age between 18 and 100")
    gender: str = Field(default="male", description="male, female, other")
    city: str = Field(default="Mumbai", description="City of residence")
    annual_income: float = Field(..., ge=100000, description="Annual income in INR")
    dependents: int = Field(default=0, ge=0, le=10, description="Number of financial dependents")
    smoker: bool = Field(default=False, description="Tobacco/Nicotine user")
    pre_existing_conditions: List[str] = Field(default=[], description="List of pre-existing conditions like diabetes, hypertension, asthma, cardiac, thyroid, etc.")
    budget_annual: float = Field(..., ge=1000, description="Annual maximum budget in INR")
    insurance_type: str = Field(..., description="health, term, life, motor, travel")
    coverage_priority: str = Field(
        default="balanced",
        description="Priority: balanced, budget, maximum_coverage, critical_illness, claim_settlement, family_protection"
    )
    sum_insured_preference: Optional[int] = Field(default=None, description="Preferred sum insured")

class ScoreBreakdown(BaseModel):
    coverage_match: float
    affordability: float
    csr: float
    rating: float
    waiting_period: float
    profile_similarity: float

class PolicyRecommendation(BaseModel):
    policy: PolicyResponse
    match_percentage: float
    total_score: float
    score_breakdown: ScoreBreakdown
    why_recommended: List[str]
    estimated_premium: int

class RecommendationResponse(BaseModel):
    session_id: str
    insurance_type: str
    total_candidates_analyzed: int
    recommendations: List[PolicyRecommendation]
    profile_summary: Dict[str, Any]
    disclaimer: str = "Informational only, not financial advice. Rates and terms subject to insurer underwriting."


# --- Comparison Schemas ---
class CompareRequest(BaseModel):
    policy_ids: List[int] = Field(..., min_length=2, max_length=4, description="2 to 4 policy IDs to compare")

class CompareResponse(BaseModel):
    policies: List[PolicyResponse]
    metrics_table: List[Dict[str, Any]]
    radar_data: List[Dict[str, Any]]


# --- Premium Estimator Schemas ---
class PremiumEstimateRequest(BaseModel):
    category: str = Field(..., description="health, term, life, motor, travel")
    age: int = Field(..., ge=18, le=100)
    sum_insured: int = Field(..., ge=25000)
    smoker: bool = Field(default=False)
    pre_existing_conditions: List[str] = Field(default=[])
    city_tier: str = Field(default="Tier 1", description="Tier 1 (Metro), Tier 2, Tier 3")

class PremiumEstimateResponse(BaseModel):
    annual_estimate: int
    monthly_estimate: int
    range_min: int
    range_max: int
    base_rate: int
    age_loading_factor: float
    smoker_loading_factor: float
    health_risk_loading_factor: float
    city_factor: float
    breakdown_notes: List[str]


# --- Chat & RAG Schemas ---
class ChatCitation(BaseModel):
    policy_id: int
    policy_name: str
    insurer: str
    category: str
    relevance_score: float
    relevant_clause: str

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=2)
    session_id: Optional[str] = None
    policy_context_id: Optional[int] = None

class ChatResponse(BaseModel):
    session_id: str
    answer: str
    sources: List[ChatCitation]
    suggested_questions: List[str]


# --- History Schemas ---
class HistoryItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    session_id: str
    insurance_type: str
    created_at: datetime.datetime
    input_profile: Dict[str, Any]
    recommended_policies: List[Dict[str, Any]]
