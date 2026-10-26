import os
import csv
from sqlalchemy.orm import Session
from app.models import Policy
from app.database import engine, Base, SessionLocal

def get_csv_path() -> str:
    # Check common relative locations for data/policies.csv
    current_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.join(current_dir, "..", "..", "data", "policies.csv"),
        os.path.join(current_dir, "..", "data", "policies.csv"),
        os.path.join(os.getcwd(), "data", "policies.csv"),
        os.path.join(os.getcwd(), "..", "data", "policies.csv")
    ]
    for c in candidates:
        abs_c = os.path.abspath(c)
        if os.path.exists(abs_c):
            return abs_c
    raise FileNotFoundError("Could not locate data/policies.csv in any standard directory.")

def seed_database(db: Session = None):
    """Loads policies from CSV and populates database."""
    Base.metadata.create_all(bind=engine)
    
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        csv_path = get_csv_path()
        with open(csv_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                policy_id = int(row["id"])
                existing = db.query(Policy).filter(Policy.id == policy_id).first()
                
                cashless_val = str(row.get("cashless_facility", "True")).strip().lower() in ("true", "1", "yes")

                policy_data = {
                    "id": policy_id,
                    "policy_name": row["policy_name"],
                    "insurer": row["insurer"],
                    "category": row["category"].strip().lower(),
                    "min_age": int(row["min_age"]),
                    "max_age": int(row["max_age"]),
                    "min_sum_insured": int(row["min_sum_insured"]),
                    "max_sum_insured": int(row["max_sum_insured"]),
                    "base_premium_annual": int(row["base_premium_annual"]),
                    "coverage_features": row["coverage_features"],
                    "exclusions": row.get("exclusions", ""),
                    "waiting_period_months": int(row.get("waiting_period_months", 0)),
                    "claim_settlement_ratio": float(row.get("claim_settlement_ratio", 95.0)),
                    "network_hospitals_or_garages": int(row.get("network_hospitals_or_garages", 0)),
                    "rating": float(row.get("rating", 4.5)),
                    "cashless_facility": cashless_val,
                    "room_rent_limit": row.get("room_rent_limit", "No Limit"),
                    "copay_percentage": int(row.get("copay_percentage", 0)),
                    "best_suited_for": row.get("best_suited_for", ""),
                    "policy_description": row.get("policy_description", "")
                }

                if existing:
                    for k, v in policy_data.items():
                        setattr(existing, k, v)
                else:
                    new_policy = Policy(**policy_data)
                    db.add(new_policy)
                count += 1
            
            db.commit()
            print(f"Successfully seeded/verified {count} policies into database.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        if close_db:
            db.close()

if __name__ == "__main__":
    seed_database()
