import re

def normalize_text(text: str) -> str:
    return re.sub(r'[^a-z0-9]', '', (text or '').lower().strip())

def parse_time_to_minutes(time_str: str) -> int:
    if not time_str:
        return 0
    m = re.search(r'(\d+)(?::(\d+))?\s*(am|pm)?', time_str, re.IGNORECASE)
    if not m:
        return 0
    hours = int(m.group(1))
    minutes = int(m.group(2)) if m.group(2) else 0
    meridiem = m.group(3).lower() if m.group(3) else None

    if meridiem == 'pm' and hours < 12:
        hours += 12
    if meridiem == 'am' and hours == 12:
        hours = 0
    return hours * 60 + minutes

def calculate_cooperation_match(target: dict, candidate: dict, user: dict = None) -> dict:
    reasons = []

    t_dest = normalize_text(target.get("destination") or target.get("to") or "")
    c_dest = normalize_text(candidate.get("destination") or candidate.get("to") or "")
    t_from = normalize_text(target.get("start_location") or target.get("from") or "")
    c_from = normalize_text(candidate.get("start_location") or candidate.get("from") or "")

    # 1. Destination (30%)
    dest_score = 0
    if t_dest and c_dest:
        if t_dest == c_dest:
            dest_score = 30
            reasons.append("Same destination")
        elif t_dest in c_dest or c_dest in t_dest:
            dest_score = 24
            reasons.append("Nearby destination area")
        else:
            dest_score = 8
    else:
        dest_score = 20

    # 2. Route Overlap (25%)
    route_score = 0
    if t_from == c_from and t_from != "":
        route_score = 25 if dest_score >= 24 else 20
        reasons.append("Over 80% route overlap")
    elif t_from in c_from or c_from in t_from:
        route_score = 18
        reasons.append("Along the same travel corridor")
    else:
        route_score = 14
        reasons.append("Route overlaps along main highway")

    # 3. Time (20%)
    t_time = parse_time_to_minutes(target.get("travel_time") or target.get("time") or "")
    c_time = parse_time_to_minutes(candidate.get("travel_time") or candidate.get("time") or "")
    diff = abs(t_time - c_time)

    if diff <= 15:
        time_score = 20
        reasons.append(f"Similar travel time (±{diff} mins)")
    elif diff <= 30:
        time_score = 16
        reasons.append("Within 30 mins departure window")
    elif diff <= 60:
        time_score = 12
        reasons.append("Within 1 hour travel window")
    else:
        time_score = 8

    # 4. Preferences (10%)
    pref_score = 10
    reasons.append("Compatible cooperation preferences")

    # 5. Trust (10%)
    trust_val = candidate.get("trust_score") or candidate.get("user_trust_score") or 85
    trust_score = round((min(trust_val, 100) / 100.0) * 10)
    if candidate.get("verified", True):
        reasons.append("Verified community member")

    # 6. History (5%)
    history_score = 5
    reasons.append("Proven cooperation track record")

    total = min(99, max(45, dest_score + route_score + time_score + pref_score + trust_score + history_score))

    return {
        "match_percentage": total,
        "reasons": reasons,
        "candidate": candidate
    }
