import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.seed import seed_database
from app.database import Base, engine

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield

def test_health_check_endpoint():
    resp = client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert "health" in data["supported_categories"]

def test_get_policies():
    resp = client.get("/policies?category=health&limit=5")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["category"] == "health"

def test_auth_registration_and_login():
    import uuid
    test_email = f"test_{uuid.uuid4().hex[:6]}@example.com"
    reg_payload = {
        "email": test_email,
        "password": "strongPassword123",
        "full_name": "Rohan Sharma"
    }
    # Register
    reg_resp = client.post("/auth/register", json=reg_payload)
    assert reg_resp.status_code == 201
    reg_data = reg_resp.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == test_email

    # Login
    login_payload = {
        "email": test_email,
        "password": "strongPassword123"
    }
    login_resp = client.post("/auth/login", json=login_payload)
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert "access_token" in login_data

def test_recommendation_api():
    payload = {
        "age": 28,
        "gender": "male",
        "city": "Pune",
        "annual_income": 900000,
        "dependents": 0,
        "smoker": False,
        "pre_existing_conditions": [],
        "budget_annual": 18000,
        "insurance_type": "health",
        "coverage_priority": "budget"
    }
    resp = client.post("/recommend", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "session_id" in data
    assert len(data["recommendations"]) > 0
    assert "why_recommended" in data["recommendations"][0]

def test_compare_api():
    # Compare policy 1 and 2
    payload = {"policy_ids": [1, 2]}
    resp = client.post("/compare", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["policies"]) == 2
    assert len(data["radar_data"]) == 5
    assert len(data["metrics_table"]) > 5

def test_chat_advisor_api():
    payload = {
        "message": "Does Star Health cover maternity expenses?"
    }
    resp = client.post("/chat", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "answer" in data
    assert len(data["answer"]) > 10
    assert "sources" in data
    assert len(data["sources"]) > 0
