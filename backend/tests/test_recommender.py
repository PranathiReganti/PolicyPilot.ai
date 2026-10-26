import pytest
from app.database import Base, SessionLocal, engine
from app.seed import seed_database
from app.schemas import UserProfileInput
from app.services.recommender import recommender_service
from app.services.estimator import estimator_service
from app.schemas import PremiumEstimateRequest

@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    seed_database()
    db = SessionLocal()
    yield db
    db.close()

def test_health_recommendation_filters_and_ranking(db_session):
    profile = UserProfileInput(
        age=32,
        gender="female",
        city="Mumbai",
        annual_income=1200000,
        dependents=1,
        smoker=False,
        pre_existing_conditions=["hypertension"],
        budget_annual=25000,
        insurance_type="health",
        coverage_priority="balanced"
    )

    recs = recommender_service.recommend(db_session, profile)
    assert len(recs) > 0
    assert len(recs) <= 5

    # Check top recommendation properties
    top = recs[0]
    assert top.match_percentage >= 70.0
    assert top.match_percentage <= 100.0
    assert len(top.why_recommended) >= 2
    assert top.policy.category == "health"
    assert top.score_breakdown.coverage_match > 0
    assert top.score_breakdown.csr > 0

def test_senior_citizen_health_recommendation(db_session):
    profile = UserProfileInput(
        age=68,
        gender="male",
        city="Bangalore",
        annual_income=800000,
        dependents=1,
        smoker=False,
        pre_existing_conditions=["diabetes", "cardiac"],
        budget_annual=35000,
        insurance_type="health",
        coverage_priority="critical_illness"
    )

    recs = recommender_service.recommend(db_session, profile)
    assert len(recs) > 0
    # Must be eligible for age 68
    for r in recs:
        assert r.policy.min_age <= 68 <= r.policy.max_age

def test_term_insurance_smoker_loading(db_session):
    profile_non_smoker = UserProfileInput(
        age=30,
        gender="male",
        city="Delhi",
        annual_income=1500000,
        dependents=2,
        smoker=False,
        pre_existing_conditions=[],
        budget_annual=15000,
        insurance_type="term",
        coverage_priority="claim_settlement"
    )
    profile_smoker = UserProfileInput(
        age=30,
        gender="male",
        city="Delhi",
        annual_income=1500000,
        dependents=2,
        smoker=True,
        pre_existing_conditions=[],
        budget_annual=15000,
        insurance_type="term",
        coverage_priority="claim_settlement"
    )

    recs_non = recommender_service.recommend(db_session, profile_non_smoker)
    recs_smoke = recommender_service.recommend(db_session, profile_smoker)

    assert len(recs_non) > 0
    assert len(recs_smoke) > 0

    # Smoker premium must be higher than non-smoker
    assert recs_smoke[0].estimated_premium > recs_non[0].estimated_premium

def test_premium_estimator_formula():
    req = PremiumEstimateRequest(
        category="health",
        age=35,
        sum_insured=1000000,
        smoker=False,
        pre_existing_conditions=["diabetes"],
        city_tier="Tier 1"
    )
    res = estimator_service.estimate(req)
    assert res.annual_estimate > 0
    assert res.monthly_estimate == int(round(res.annual_estimate / 12))
    assert res.range_min < res.annual_estimate < res.range_max
    assert len(res.breakdown_notes) >= 2
