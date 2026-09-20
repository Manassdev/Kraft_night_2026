import os
import sqlite3

# Database configuration via environment variables (PostgreSQL standard)
DB_HOST = os.environ.get('COJOURNEY_DB_HOST', 'localhost')
DB_PORT = os.environ.get('COJOURNEY_DB_PORT', '5432')
DB_NAME = os.environ.get('COJOURNEY_DB_NAME', 'cojourney_db')
DB_USER = os.environ.get('COJOURNEY_DB_USER', 'postgres')
DB_PASSWORD = os.environ.get('COJOURNEY_DB_PASSWORD', '')

SQL_INIT_SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    gender TEXT,
    trust_score INTEGER DEFAULT 70,
    verified BOOLEAN DEFAULT TRUE,
    completed_journeys INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS journeys (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    start_location TEXT NOT NULL,
    destination TEXT NOT NULL,
    travel_time TEXT NOT NULL,
    travel_type TEXT,
    cooperation_type TEXT NOT NULL,
    status TEXT DEFAULT 'scheduled'
);

CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL REFERENCES users(id),
    receiver_id TEXT NOT NULL REFERENCES users(id),
    journey_id TEXT NOT NULL REFERENCES journeys(id),
    request_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES users(id),
    journey_id TEXT NOT NULL REFERENCES journeys(id),
    description TEXT,
    size TEXT,
    suggested_tip REAL,
    status TEXT DEFAULT 'available'
);

CREATE TABLE IF NOT EXISTS vehicle_details (
    id TEXT PRIMARY KEY,
    journey_id TEXT NOT NULL REFERENCES journeys(id),
    vehicle_type TEXT,
    available_seats INTEGER,
    travel_contribution REAL
);

CREATE TABLE IF NOT EXISTS ratings (
    id TEXT PRIMARY KEY,
    from_user TEXT NOT NULL REFERENCES users(id),
    to_user TEXT NOT NULL REFERENCES users(id),
    journey_id TEXT NOT NULL REFERENCES journeys(id),
    rating INTEGER NOT NULL,
    comment TEXT
);

CREATE TABLE IF NOT EXISTS trusted_connections (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    trusted_user_id TEXT NOT NULL REFERENCES users(id),
    status TEXT DEFAULT 'active'
);
"""

class Database:
    def __init__(self):
        self.conn = None
        self.is_postgres = False
        self._init_connection()

    def _init_connection(self):
        # Try connecting to PostgreSQL if driver & service are available
        try:
            import psycopg2
            self.conn = psycopg2.connect(
                host=DB_HOST,
                port=DB_PORT,
                dbname=DB_NAME,
                user=DB_USER,
                password=DB_PASSWORD,
                connect_timeout=2
            )
            self.is_postgres = True
            print(f"[DB] Connected to PostgreSQL at {DB_HOST}:{DB_PORT}/{DB_NAME}")
        except Exception as e:
            # Fallback to local SQLite database for instant zero-config hackathon execution
            db_file = os.path.join(os.path.dirname(__file__), "cojourney_local.db")
            self.conn = sqlite3.connect(db_file, check_same_thread=False)
            self.conn.row_factory = sqlite3.Row
            self.is_postgres = False
            print(f"[DB] PostgreSQL unavailable ({e}). Using embedded DB: {db_file}")

        self._create_tables()

    def _create_tables(self):
        cur = self.conn.cursor()
        for statement in SQL_INIT_SCHEMA.split(";"):
            statement = statement.strip()
            if statement:
                cur.execute(statement)
        self.conn.commit()

    def execute(self, query, params=()):
        cur = self.conn.cursor()
        # Adapt parameter placeholder if using postgres ($ or %s) vs sqlite (?)
        if self.is_postgres:
            query = query.replace("?", "%s")
        cur.execute(query, params)
        self.conn.commit()
        return cur

    def fetchall(self, query, params=()):
        cur = self.conn.cursor()
        if self.is_postgres:
            query = query.replace("?", "%s")
        cur.execute(query, params)
        return [dict(row) for row in cur.fetchall()]

    def fetchone(self, query, params=()):
        cur = self.conn.cursor()
        if self.is_postgres:
            query = query.replace("?", "%s")
        cur.execute(query, params)
        row = cur.fetchone()
        return dict(row) if row else None

db = Database()
