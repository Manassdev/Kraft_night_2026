import json
import time
from database import db
from matching import calculate_cooperation_match
from trust import calculate_trust_score

def handle_register(body):
    user_id = f"user_{int(time.time()*1000)}"
    name = body.get("name", "New User")
    email = body.get("email", f"{user_id}@cojourney.app")
    password = body.get("password", "secret")
    gender = body.get("gender", "Male")
    db.execute(
        "INSERT INTO users (id, name, email, password, gender, trust_score, verified) VALUES (?, ?, ?, ?, ?, 70, 1)",
        (user_id, name, email, password, gender)
    )
    user = db.fetchone("SELECT * FROM users WHERE id = ?", (user_id,))
    return {"status": 200, "data": user}

def handle_login(body):
    email = body.get("email", "").lower().strip()
    user = db.fetchone("SELECT * FROM users WHERE LOWER(email) = ?", (email,))
    if not user:
        # Create default demo user if not existing
        return handle_register({"name": email.split("@")[0] or "Rahul", "email": email})
    return {"status": 200, "data": user}

def handle_get_journeys():
    journeys = db.fetchall("SELECT j.*, u.name as user_name, u.trust_score as user_trust_score, u.verified as user_verified FROM journeys j JOIN users u ON j.user_id = u.id")
    # If table is empty, seed demo journeys
    if not journeys:
        seed_demo_data()
        journeys = db.fetchall("SELECT j.*, u.name as user_name, u.trust_score as user_trust_score, u.verified as user_verified FROM journeys j JOIN users u ON j.user_id = u.id")
    return {"status": 200, "data": journeys}

def handle_create_journey(body):
    j_id = f"journey_{int(time.time()*1000)}"
    user_id = body.get("user_id") or body.get("userId") or "user_rahul"
    start_loc = body.get("start_location") or body.get("from", "College")
    dest = body.get("destination") or body.get("to", "Kollam")
    time_val = body.get("travel_time") or body.get("time", "5:00 PM")
    travel_type = body.get("travel_type", "Car")
    coop_type = body.get("cooperation_type", "share_vehicle")

    db.execute(
        "INSERT INTO journeys (id, user_id, start_location, destination, travel_time, travel_type, cooperation_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')",
        (j_id, user_id, start_loc, dest, time_val, travel_type, coop_type)
    )

    if coop_type == "share_vehicle" and body.get("vehicle_details"):
        vd = body["vehicle_details"]
        v_id = f"veh_{int(time.time()*1000)}"
        db.execute(
            "INSERT INTO vehicle_details (id, journey_id, vehicle_type, available_seats, travel_contribution) VALUES (?, ?, ?, ?, ?)",
            (v_id, j_id, vd.get("vehicleType", "Car"), vd.get("availableSeats", 2), vd.get("travelContribution", 50))
        )

    if coop_type == "carry_along" and body.get("item_details"):
        it = body["item_details"]
        it_id = f"item_{int(time.time()*1000)}"
        db.execute(
            "INSERT INTO items (id, owner_id, journey_id, description, size, suggested_tip, status) VALUES (?, ?, ?, ?, ?, ?, 'available')",
            (it_id, user_id, j_id, it.get("description", "Sealed packet"), it.get("size", "Small"), it.get("suggestedTip", 20))
        )

    created = db.fetchone("SELECT * FROM journeys WHERE id = ?", (j_id,))
    return {"status": 201, "data": created}

def handle_get_matches(journey_id):
    target = db.fetchone("SELECT * FROM journeys WHERE id = ?", (journey_id,))
    if not target:
        target = {"start_location": "College", "destination": "Kollam", "travel_time": "5:00 PM"}
    candidates = db.fetchall("SELECT j.*, u.name as user_name, u.trust_score as user_trust_score, u.verified as user_verified FROM journeys j JOIN users u ON j.user_id = u.id WHERE j.id != ?", (journey_id,))
    matches = [calculate_cooperation_match(target, c) for c in candidates]
    matches.sort(key=lambda x: x["match_percentage"], reverse=True)
    return {"status": 200, "data": matches}

def handle_create_request(body):
    req_id = f"req_{int(time.time()*1000)}"
    sender_id = body.get("sender_id", "user_rahul")
    receiver_id = body.get("receiver_id", "user_anjali")
    journey_id = body.get("journey_id", "journey_1")
    req_type = body.get("request_type", "share_vehicle")

    db.execute(
        "INSERT INTO requests (id, sender_id, receiver_id, journey_id, request_type, status) VALUES (?, ?, ?, ?, ?, 'pending')",
        (req_id, sender_id, receiver_id, journey_id, req_type)
    )
    req = db.fetchone("SELECT * FROM requests WHERE id = ?", (req_id,))
    return {"status": 201, "data": req}

def handle_accept_request(req_id):
    db.execute("UPDATE requests SET status = 'accepted' WHERE id = ?", (req_id,))
    return {"status": 200, "data": {"success": True, "message": "Request accepted"}}

def handle_reject_request(req_id):
    db.execute("UPDATE requests SET status = 'rejected' WHERE id = ?", (req_id,))
    return {"status": 200, "data": {"success": True, "message": "Request rejected"}}

def handle_submit_rating(body):
    rate_id = f"rate_{int(time.time()*1000)}"
    from_user = body.get("from_user", "user_rahul")
    to_user = body.get("to_user", "user_anjali")
    journey_id = body.get("journey_id", "journey_1")
    rating = int(body.get("rating", 5))
    comment = body.get("comment", "Great cooperation!")

    db.execute(
        "INSERT INTO ratings (id, from_user, to_user, journey_id, rating, comment) VALUES (?, ?, ?, ?, ?, ?)",
        (rate_id, from_user, to_user, journey_id, rating, comment)
    )

    # Increment completed journeys and recalculate trust
    db.execute("UPDATE users SET completed_journeys = completed_journeys + 1 WHERE id = ?", (to_user,))
    return {"status": 201, "data": {"success": True, "id": rate_id}}

def handle_get_trust(user_id):
    user = db.fetchone("SELECT * FROM users WHERE id = ?", (user_id,))
    if not user:
        user = {"name": "User", "trust_score": 90, "verified": True, "completed_journeys": 6}
    breakdown = calculate_trust_score(user)
    return {"status": 200, "data": breakdown}

def handle_get_trusted(user_id="user_rahul"):
    trusted = db.fetchall("SELECT t.*, u.name, u.trust_score, u.verified FROM trusted_connections t JOIN users u ON t.trusted_user_id = u.id WHERE t.user_id = ?", (user_id,))
    return {"status": 200, "data": trusted}

def handle_add_trusted(body):
    conn_id = f"trust_{int(time.time()*1000)}"
    user_id = body.get("user_id", "user_rahul")
    trusted_user_id = body.get("trusted_user_id", "user_anjali")

    db.execute(
        "INSERT INTO trusted_connections (id, user_id, trusted_user_id, status) VALUES (?, ?, ?, 'active')",
        (conn_id, user_id, trusted_user_id)
    )
    return {"status": 201, "data": {"success": True, "id": conn_id}}

def seed_demo_data():
    # Insert demo users if not present
    users = [
        ("user_rahul", "Rahul", "rahul@cojourney.app", "pass123", "Male", 92, 1, 8),
        ("user_anjali", "Anjali", "anjali@cojourney.app", "pass123", "Female", 94, 1, 12),
        ("user_arjun", "Arjun", "arjun@cojourney.app", "pass123", "Male", 78, 1, 4),
        ("user_meera", "Meera", "meera@cojourney.app", "pass123", "Female", 88, 1, 6),
    ]
    for u in users:
        try:
            db.execute("INSERT INTO users (id, name, email, password, gender, trust_score, verified, completed_journeys) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", u)
        except Exception:
            pass

    journeys = [
        ("journey_1", "user_anjali", "College", "Kollam", "5:00 PM", "Car", "share_vehicle", "scheduled"),
        ("journey_2", "user_meera", "Station", "College", "9:00 AM", "Walk", "carry_along", "scheduled"),
        ("journey_3", "user_arjun", "College", "Town", "5:15 PM", "Walk", "daily_walk", "scheduled"),
    ]
    for j in journeys:
        try:
            db.execute("INSERT INTO journeys (id, user_id, start_location, destination, travel_time, travel_type, cooperation_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", j)
        except Exception:
            pass
