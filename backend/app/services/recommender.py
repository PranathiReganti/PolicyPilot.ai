import json
from typing import List, Dict, Any, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session

from app.models import Policy
from app.schemas import UserProfileInput, PolicyRecommendation, PolicyResponse, ScoreBreakdown

class PolicyRecommender:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))

    def estimate_custom_premium(self, policy: Policy, profile: UserProfileInput) -> int:
        """
        Actuarially adjusts baseline premium based on applicant's age,
        tobacco usage, pre-existing health risks, and family dependents.
        """
        base = policy.base_premium_annual
        
        # 1. Age loading factor
        age = profile.age
        if policy.category in ["health", "term", "life"]:
            age_factor = 1.0 + max(0, age - 26) * 0.024
        else:
            age_factor = 1.0

        # 2. Tobacco/Smoker loading
        smoker_factor = 1.0
        if profile.smoker:
            if policy.category in ["term", "life"]:
                smoker_factor = 1.38
            elif policy.category == "health":
                smoker_factor = 1.18

        # 3. Pre-existing condition loading
        pe_count = len([c for c in profile.pre_existing_conditions if c and c.lower() != "none"])
        pe_factor = 1.0
        if policy.category == "health" and pe_count > 0:
            pe_factor = 1.0 + min(0.35, pe_count * 0.12)

        # 4. Dependents factor
        dep_factor = 1.0
        if policy.category == "health" and profile.dependents > 0:
            dep_factor = 1.0 + min(0.80, profile.dependents * 0.22)

        # 5. City cost tier adjustment
        metro_cities = ["mumbai", "delhi", "bangalore", "bengaluru", "hyderabad", "chennai", "kolkata", "pune"]
        city_factor = 1.08 if profile.city.strip().lower() in metro_cities else 1.0

        final_premium = base * age_factor * smoker_factor * pe_factor * dep_factor * city_factor
        return int(round(final_premium, -1)) # round to nearest 10

    def calculate_affordability_score(self, estimated_premium: int, budget: float) -> float:
        """Calculates score based on how well premium aligns with user's annual budget."""
        if budget <= 0:
            return 50.0
        ratio = estimated_premium / budget
        if ratio <= 0.85:
            # Well within budget: top score
            return 100.0 - (ratio * 10.0)
        elif ratio <= 1.0:
            # Right around budget limit
            return 85.0 - ((ratio - 0.85) * 60.0)
        elif ratio <= 1.25:
            # Slightly over budget
            return max(30.0, 75.0 - ((ratio - 1.0) * 150.0))
        else:
            # Significantly over budget
            return max(10.0, 35.0 - min(25.0, (ratio - 1.25) * 40.0))

    def calculate_waiting_period_score(self, policy: Policy, profile: UserProfileInput) -> float:
        """Shorter waiting period is critical for users with pre-existing conditions."""
        months = policy.waiting_period_months
        has_conditions = any(c and c.lower() != "none" for c in profile.pre_existing_conditions)
        
        if policy.category in ["motor", "travel", "term", "life"]:
            return 100.0
            
        if not has_conditions:
            # General applicant: waiting period matters moderately
            return max(40.0, 100.0 - (months * 1.5))
        else:
            # Applicant with conditions: shorter waiting period is heavily rewarded
            if months == 0:
                return 100.0
            elif months <= 12:
                return 92.0
            elif months <= 24:
                return 75.0
            elif months <= 36:
                return 50.0
            else:
                return 25.0

    def calculate_coverage_match(self, policy: Policy, profile: UserProfileInput) -> float:
        """Evaluates feature alignment against user priorities and demographics."""
        score = 70.0
        features = (policy.coverage_features or "").lower()
        desc = (policy.policy_description or "").lower()
        text_corp = f"{features} {desc}"
        
        priority = (profile.coverage_priority or "").lower()
        conditions = [c.lower() for c in profile.pre_existing_conditions if c and c.lower() != "none"]

        # Check conditions
        if any("diabet" in c for c in conditions) and ("diabet" in text_corp or "chronic" in text_corp):
            score += 15.0
        if any("hypertens" in c or "bp" in c or "blood pressure" in c for c in conditions) and ("cardiac" in text_corp or "hypertens" in text_corp or "chronic" in text_corp):
            score += 15.0
        if any("heart" in c or "cardiac" in c for c in conditions) and ("cardiac" in text_corp or "heart" in text_corp or "bypass" in text_corp):
            score += 20.0

        # Check priorities
        if "critical" in priority and ("critical illness" in text_corp or "lump sum" in text_corp):
            score += 18.0
        if "maternity" in priority or (profile.gender == "female" and 21 <= profile.age <= 38 and profile.dependents <= 2):
            if "maternity" in text_corp or "newborn" in text_corp:
                score += 15.0
        if "budget" in priority and policy.base_premium_annual <= 12000:
            score += 12.0
        if "maximum" in priority and ("restoration" in text_corp or "2x" in text_corp or "recharge" in text_corp or "safeguard" in text_corp):
            score += 16.0
        if "claim_settlement" in priority and policy.claim_settlement_ratio >= 98.0:
            score += 14.0

        # Room rent capping bonus
        if "no limit" in (policy.room_rent_limit or "").lower() or "no capping" in (policy.room_rent_limit or "").lower():
            score += 8.0

        # Cashless facility
        if policy.cashless_facility:
            score += 5.0

        return min(100.0, max(20.0, score))

    def generate_why_recommended(
        self,
        policy: Policy,
        profile: UserProfileInput,
        estimated_premium: int,
        breakdown: ScoreBreakdown
    ) -> List[str]:
        """Generates plain-English explainable bullets justifying the match."""
        reasons = []

        # 1. CSR highlight
        if policy.claim_settlement_ratio >= 98.0:
            reasons.append(f"Outstanding {policy.claim_settlement_ratio}% Claim Settlement Ratio guarantees industry-best payout dependability.")
        elif policy.claim_settlement_ratio >= 94.0:
            reasons.append(f"Reliable {policy.claim_settlement_ratio}% Claim Settlement Ratio backed by {policy.insurer}'s proven track record.")

        # 2. Affordability and Budget alignment
        if estimated_premium <= profile.budget_annual:
            savings = int(profile.budget_annual - estimated_premium)
            if savings > 1000:
                reasons.append(f"Fits your ₹{int(profile.budget_annual):,} budget with an estimated premium of ₹{estimated_premium:,}/yr (saves ₹{savings:,}).")
            else:
                reasons.append(f"Optimal budget fit: estimated premium of ₹{estimated_premium:,}/yr closely matches your target allocation.")
        else:
            reasons.append(f"High-tier coverage estimated at ₹{estimated_premium:,}/yr, providing extended protection for your profile.")

        # 3. Waiting period and pre-existing conditions
        has_conditions = any(c and c.lower() != "none" for c in profile.pre_existing_conditions)
        if has_conditions and policy.waiting_period_months <= 24:
            cond_str = ", ".join(profile.pre_existing_conditions)
            reasons.append(f"Short {policy.waiting_period_months}-month waiting period provides accelerated protection for your condition ({cond_str}).")
        elif not has_conditions and policy.waiting_period_months > 0:
            reasons.append(f"Comprehensive preventive health check-up and standard {policy.waiting_period_months}-month waiting period.")

        # 4. Network and Facilities
        if policy.network_hospitals_or_garages > 8000:
            reasons.append(f"Expansive network of {policy.network_hospitals_or_garages:,}+ cashless partners for zero out-of-pocket delays in {profile.city}.")
        elif policy.cashless_facility:
            reasons.append("Hassle-free 100% cashless claims facility with instant digital pre-authorization.")

        # 5. Room rent or unique features
        if "no limit" in (policy.room_rent_limit or "").lower() or "no capping" in (policy.room_rent_limit or "").lower():
            reasons.append("Zero room rent capping, preventing disproportionate deduction penalties during hospitalization.")

        # 6. Customer rating
        if policy.rating >= 4.6:
            reasons.append(f"Top-rated by customers with a {policy.rating}/5.0 satisfaction score.")

        return reasons[:4] # Return 3 to 4 best punchy reasons

    def recommend(self, db: Session, profile: UserProfileInput) -> List[PolicyRecommendation]:
        """Main recommendation pipeline: Filter -> Score -> Rank -> Explain."""
        # 1. Category filter
        query = db.query(Policy).filter(Policy.category == profile.insurance_type.lower())
        candidates = query.all()

        if not candidates:
            # Fallback to all policies if exact category has none
            candidates = db.query(Policy).all()

        # 2. Hard Eligibility Filter: Age
        eligible = []
        for p in candidates:
            if p.min_age <= profile.age <= p.max_age:
                eligible.append(p)
                
        # If age filter was too restrictive, relax slightly so user is never empty-handed
        if not eligible:
            eligible = candidates

        # 3. Content-Based TF-IDF Cosine Similarity
        profile_text = (
            f"Insurance: {profile.insurance_type}. Age {profile.age} {profile.gender} living in {profile.city}. "
            f"Income {profile.annual_income} with {profile.dependents} dependents. Smoker: {profile.smoker}. "
            f"Conditions: {' '.join(profile.pre_existing_conditions)}. Priority: {profile.coverage_priority}."
        )

        doc_texts = [
            f"{p.policy_name} {p.insurer} {p.category} {p.coverage_features} {p.best_suited_for} {p.policy_description}"
            for p in eligible
        ]

        try:
            corpus = [profile_text] + doc_texts
            tfidf_matrix = self.vectorizer.fit_transform(corpus)
            user_vec = tfidf_matrix[0:1]
            doc_vecs = tfidf_matrix[1:]
            sim_scores = cosine_similarity(user_vec, doc_vecs)[0]
        except Exception:
            sim_scores = np.full(len(eligible), 0.5)

        # 4. Multi-Criteria Weighted Scoring
        scored_items = []
        
        # Configure dynamic weights
        priority = (profile.coverage_priority or "").lower()
        has_conditions = any(c and c.lower() != "none" for c in profile.pre_existing_conditions)

        # Baseline weights
        w_cov = 0.25
        w_aff = 0.20
        w_csr = 0.20
        w_rat = 0.15
        w_wait = 0.10
        w_sim = 0.10

        if "budget" in priority:
            w_aff = 0.35
            w_cov = 0.20
            w_csr = 0.15
            w_rat = 0.10
            w_wait = 0.10
            w_sim = 0.10
        elif "claim" in priority:
            w_csr = 0.35
            w_aff = 0.15
            w_cov = 0.20
            w_rat = 0.15
            w_wait = 0.05
            w_sim = 0.10
        elif "maximum" in priority or "critical" in priority:
            w_cov = 0.35
            w_csr = 0.20
            w_aff = 0.15
            w_rat = 0.12
            w_wait = 0.08
            w_sim = 0.10

        if has_conditions and profile.insurance_type == "health":
            # Increase weight on waiting period for applicants with pre-existing conditions
            w_wait += 0.10
            w_cov += 0.05
            w_rat -= 0.10
            w_aff -= 0.05

        for idx, policy in enumerate(eligible):
            est_premium = self.estimate_custom_premium(policy, profile)
            
            s_cov = self.calculate_coverage_match(policy, profile)
            s_aff = self.calculate_affordability_score(est_premium, profile.budget_annual)
            
            # CSR normalized score (e.g. 90-100% maps to 50-100)
            s_csr = min(100.0, max(0.0, (policy.claim_settlement_ratio - 80.0) * 5.0))
            
            # Rating normalized score
            s_rat = (policy.rating / 5.0) * 100.0
            
            s_wait = self.calculate_waiting_period_score(policy, profile)
            s_sim = float(sim_scores[idx]) * 100.0

            total_score = (
                (s_cov * w_cov) +
                (s_aff * w_aff) +
                (s_csr * w_csr) +
                (s_rat * w_rat) +
                (s_wait * w_wait) +
                (s_sim * w_sim)
            )

            # Match percentage scaled cleanly into 70% - 99% range
            match_pct = round(min(99.0, max(68.0, total_score)), 1)

            breakdown = ScoreBreakdown(
                coverage_match=round(s_cov, 1),
                affordability=round(s_aff, 1),
                csr=round(s_csr, 1),
                rating=round(s_rat, 1),
                waiting_period=round(s_wait, 1),
                profile_similarity=round(s_sim, 1)
            )

            why_recs = self.generate_why_recommended(policy, profile, est_premium, breakdown)

            recommendation = PolicyRecommendation(
                policy=PolicyResponse.model_validate(policy),
                match_percentage=match_pct,
                total_score=round(total_score, 2),
                score_breakdown=breakdown,
                why_recommended=why_recs,
                estimated_premium=est_premium
            )
            scored_items.append(recommendation)

        # Sort descending by match percentage / total score
        scored_items.sort(key=lambda x: x.match_percentage, reverse=True)

        # Return Top 5
        return scored_items[:5]

recommender_service = PolicyRecommender()
