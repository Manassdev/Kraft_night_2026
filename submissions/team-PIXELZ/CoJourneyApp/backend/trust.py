"""
Trust score calculation engine for CoJourney (Python Backend)

Trust Score is out of 100 points:
- Verification: 30 pts
- Completed journeys: 25 pts
- Cooperation history: 20 pts
- Ratings: 15 pts
- Safety record: 10 pts

IMPORTANT:
Trust score is a community reputation metric and is NOT a safety guarantee.
"""

def calculate_trust_score(user: dict) -> dict:
    # 1. Verification (30 pts)
    verification = 30 if user.get("verified", True) else 0

    # 2. Completed journeys (max 25 pts: ~2.5 pts per journey)
    completed_count = user.get("completed_journeys", 0)
    completed_score = min(25, round(completed_count * 2.5))

    # 3. Cooperation history (max 20 pts: ~4 pts per cooperation)
    history_count = user.get("cooperation_history_count", completed_count)
    history_score = min(20, round(history_count * 4))

    # 4. Ratings (max 15 pts: based on 5-star scale)
    avg_rating = user.get("ratings_average", 4.8)
    ratings_score = min(15, round((avg_rating / 5.0) * 15))

    # 5. Safety record (max 10 pts)
    safety_score = min(10, user.get("safety_score", 10))

    total = min(100, verification + completed_score + history_score + ratings_score + safety_score)

    if total >= 90:
        label = "Trusted"
    elif total >= 60 or user.get("verified", True):
        label = "Verified"
    else:
        label = "New user"

    return {
        "verification": verification,
        "completed_journeys": completed_score,
        "cooperation_history": history_score,
        "ratings": ratings_score,
        "safety_record": safety_score,
        "total": total,
        "label": label,
        "disclaimer": "Trust score is a cooperative community reputation metric and is not a safety guarantee."
    }
