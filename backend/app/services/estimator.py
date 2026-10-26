import math
from typing import List, Dict, Any
from app.schemas import PremiumEstimateRequest, PremiumEstimateResponse

class PremiumEstimator:
    def estimate(self, req: PremiumEstimateRequest) -> PremiumEstimateResponse:
        """
        Actuarially sound premium estimation formula based on:
        - Insurance category baseline
        - Sum insured non-linear power scale
        - Age exponential risk curve
        - Smoker multiplier
        - Pre-existing conditions risk loading
        - City medical inflation tier
        """
        category = req.category.lower()
        age = req.age
        sum_insured = req.sum_insured
        smoker = req.smoker
        conditions = [c for c in req.pre_existing_conditions if c and c.lower() != "none"]
        city_tier = req.city_tier

        # Baseline reference parameters per category for standard ₹5,00,000 cover at age 25
        base_rates = {
            "health": 9500,
            "term": 6800,
            "life": 38000,
            "motor": 8500,
            "travel": 2400
        }
        baseline = base_rates.get(category, 9000)

        # 1. Sum Insured Elasticity Scaling:
        # Sum insured doesn't double premium linearly due to risk pooling; elasticity ~ 0.72
        ref_sum = 500000 if category in ["health", "term", "motor"] else (1000000 if category == "life" else 2500000)
        si_ratio = max(0.1, sum_insured / ref_sum)
        si_factor = math.pow(si_ratio, 0.70)

        # 2. Age Loading Curve:
        # Health risk doubles every ~15-20 years; term risk curves steeper after age 40
        if category in ["health", "term", "life"]:
            if age <= 25:
                age_loading = 1.0
            elif age <= 35:
                age_loading = 1.0 + (age - 25) * 0.025
            elif age <= 50:
                age_loading = 1.25 + (age - 35) * 0.038
            else:
                age_loading = 1.82 + (age - 50) * 0.055
        else:
            # Motor / Travel: age impact is mild
            age_loading = 1.0 if (25 <= age <= 65) else 1.15

        # 3. Tobacco / Smoker Risk Loading:
        if smoker:
            if category in ["term", "life"]:
                smoker_factor = 1.45 # +45% higher mortality risk
            elif category == "health":
                smoker_factor = 1.25 # +25% higher respiratory/cardiac morbidity
            else:
                smoker_factor = 1.0
        else:
            smoker_factor = 1.0

        # 4. Pre-existing Conditions Loading:
        pe_count = len(conditions)
        if category == "health":
            pe_factor = 1.0 + min(0.60, pe_count * 0.15)
        elif category in ["term", "life"]:
            pe_factor = 1.0 + min(0.40, pe_count * 0.10)
        else:
            pe_factor = 1.0

        # 5. City Tier Cost Multiplier:
        city_factors = {
            "Tier 1": 1.10, # Metros: higher hospital bed charges
            "Tier 2": 1.04,
            "Tier 3": 0.98
        }
        city_factor = city_factors.get(city_tier, 1.0)

        # Compute benchmark annual premium
        raw_annual = baseline * si_factor * age_loading * smoker_factor * pe_factor * city_factor
        annual_estimate = int(round(raw_annual, -1))
        monthly_estimate = int(round(annual_estimate / 12))

        # Reasonable market variance band (-10% to +15% depending on specific insurer)
        range_min = int(round(annual_estimate * 0.90, -1))
        range_max = int(round(annual_estimate * 1.15, -1))

        # Human-readable breakdown explanation
        notes = []
        if age > 35:
            notes.append(f"Age loading of +{int((age_loading - 1.0)*100)}% applied based on demographic health risk curves.")
        else:
            notes.append("Standard base age bracket with favorable baseline rates.")

        if smoker:
            notes.append(f"Smoker status increases premium by +{int((smoker_factor - 1.0)*100)}% due to elevated underwriting risk.")
        else:
            notes.append("Non-smoker preferred rate discount applied.")

        if pe_count > 0:
            notes.append(f"Pre-existing health disclosure ({', '.join(conditions)}) adds +{int((pe_factor - 1.0)*100)}% risk buffer.")

        if city_tier == "Tier 1":
            notes.append("Tier 1 Metro healthcare indexing applies to match local hospital room rent tariffs.")

        return PremiumEstimateResponse(
            annual_estimate=annual_estimate,
            monthly_estimate=monthly_estimate,
            range_min=range_min,
            range_max=range_max,
            base_rate=int(baseline),
            age_loading_factor=round(age_loading, 2),
            smoker_loading_factor=round(smoker_factor, 2),
            health_risk_loading_factor=round(pe_factor, 2),
            city_factor=round(city_factor, 2),
            breakdown_notes=notes
        )

estimator_service = PremiumEstimator()
