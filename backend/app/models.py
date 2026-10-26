import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    policy_name = Column(String(255), nullable=False, index=True)
    insurer = Column(String(100), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True) # health, term, life, motor, travel
    min_age = Column(Integer, default=18)
    max_age = Column(Integer, default=65)
    min_sum_insured = Column(Integer, default=500000)
    max_sum_insured = Column(Integer, default=10000000)
    base_premium_annual = Column(Integer, nullable=False)
    coverage_features = Column(Text, nullable=False) # Semicolon-delimited features
    exclusions = Column(Text, nullable=True) # Semicolon-delimited exclusions
    waiting_period_months = Column(Integer, default=0)
    claim_settlement_ratio = Column(Float, default=95.0)
    network_hospitals_or_garages = Column(Integer, default=0)
    rating = Column(Float, default=4.5)
    cashless_facility = Column(Boolean, default=True)
    room_rent_limit = Column(String(100), default="No Limit")
    copay_percentage = Column(Integer, default=0)
    best_suited_for = Column(Text, nullable=True)
    policy_description = Column(Text, nullable=True)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    recommendations = relationship("RecommendationHistory", back_populates="user", cascade="all, delete-orphan")

class RecommendationHistory(Base):
    __tablename__ = "recommendation_histories"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    insurance_type = Column(String(50), nullable=False)
    input_profile = Column(Text, nullable=False) # JSON encoded profile
    recommended_policies = Column(Text, nullable=False) # JSON encoded top ranked items
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="recommendations")

class ChatMessageHistory(Base):
    __tablename__ = "chat_message_histories"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), index=True, nullable=False)
    user_id = Column(Integer, nullable=True)
    role = Column(String(20), nullable=False) # user or assistant
    message = Column(Text, nullable=False)
    sources = Column(Text, nullable=True) # JSON encoded source policy references
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
