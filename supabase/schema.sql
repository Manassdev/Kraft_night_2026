-- ==============================================================================
-- CoJourney Supabase PostgreSQL Schema & Security Policies
-- Cooperation Platform Built Around Existing Journeys
-- ==============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  gender TEXT DEFAULT 'Male',
  phone TEXT,
  trust_score NUMERIC DEFAULT 70,
  verified BOOLEAN DEFAULT TRUE,
  completed_journeys INTEGER DEFAULT 0,
  cooperation_history_count INTEGER DEFAULT 0,
  ratings_average NUMERIC DEFAULT 5.0,
  ratings_count INTEGER DEFAULT 0,
  safety_score NUMERIC DEFAULT 10,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. JOURNEYS TABLE
CREATE TABLE IF NOT EXISTS public.journeys (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_trust_score INTEGER DEFAULT 70,
  user_verified BOOLEAN DEFAULT TRUE,
  user_gender TEXT DEFAULT 'Male',
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  time TEXT NOT NULL,
  cooperation_type TEXT NOT NULL CHECK (cooperation_type IN ('daily_walk', 'carry_along', 'share_vehicle', 'join_journey')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  companion_preference TEXT,
  travel_type TEXT,
  meeting_point TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. VEHICLE DETAILS TABLE
CREATE TABLE IF NOT EXISTS public.vehicle_details (
  id TEXT PRIMARY KEY,
  journey_id TEXT REFERENCES public.journeys(id) ON DELETE CASCADE,
  vehicle_type TEXT DEFAULT 'Car',
  available_seats INTEGER DEFAULT 1,
  travel_contribution NUMERIC DEFAULT 0
);

-- 4. ITEMS TABLE (Carry Along)
CREATE TABLE IF NOT EXISTS public.items (
  id TEXT PRIMARY KEY,
  journey_id TEXT REFERENCES public.journeys(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  size TEXT DEFAULT 'Small',
  suggested_tip NUMERIC DEFAULT 0,
  is_permitted BOOLEAN DEFAULT TRUE
);

-- 5. REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.requests (
  id TEXT PRIMARY KEY,
  journey_id TEXT REFERENCES public.journeys(id) ON DELETE CASCADE,
  sender_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_trust_score INTEGER DEFAULT 70,
  sender_verified BOOLEAN DEFAULT TRUE,
  receiver_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_name TEXT NOT NULL,
  request_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  message TEXT,
  journey_from TEXT NOT NULL,
  journey_to TEXT NOT NULL,
  journey_time TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RATINGS TABLE
CREATE TABLE IF NOT EXISTS public.ratings (
  id TEXT PRIMARY KEY,
  from_user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  from_user_name TEXT NOT NULL,
  to_user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  to_user_name TEXT NOT NULL,
  journey_id TEXT,
  stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TRUSTED CONNECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.trusted_connections (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  trusted_user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  trusted_user_name TEXT NOT NULL,
  trusted_user_score INTEGER DEFAULT 70,
  verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, trusted_user_id)
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_journeys_user_id ON public.journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_journeys_coop_type ON public.journeys(cooperation_type);
CREATE INDEX IF NOT EXISTS idx_requests_receiver_id ON public.requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_requests_sender_id ON public.requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_ratings_to_user_id ON public.ratings(to_user_id);
CREATE INDEX IF NOT EXISTS idx_trusted_user_id ON public.trusted_connections(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_connections ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users for discovery
CREATE POLICY "Allow public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public read journeys" ON public.journeys FOR SELECT USING (true);
CREATE POLICY "Allow public read vehicle_details" ON public.vehicle_details FOR SELECT USING (true);
CREATE POLICY "Allow public read items" ON public.items FOR SELECT USING (true);
CREATE POLICY "Allow public read requests" ON public.requests FOR SELECT USING (true);
CREATE POLICY "Allow public read ratings" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "Allow public read trusted" ON public.trusted_connections FOR SELECT USING (true);

-- Allow authenticated/anon insert & update for client application
CREATE POLICY "Allow insert users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update users" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Allow insert journeys" ON public.journeys FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update journeys" ON public.journeys FOR UPDATE USING (true);
CREATE POLICY "Allow insert vehicle_details" ON public.vehicle_details FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert items" ON public.items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert requests" ON public.requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update requests" ON public.requests FOR UPDATE USING (true);
CREATE POLICY "Allow insert ratings" ON public.ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert trusted" ON public.trusted_connections FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete trusted" ON public.trusted_connections FOR DELETE USING (true);

-- ==============================================================================
-- SEED DATA (Rahul, Anjali, Sneha, Vikram)
-- ==============================================================================
INSERT INTO public.users (id, name, email, gender, phone, trust_score, verified, completed_journeys, cooperation_history_count, ratings_average, ratings_count, safety_score)
VALUES
  ('user_rahul', 'Rahul', 'rahul@example.com', 'Male', '+91 98765 43210', 92, true, 24, 31, 4.8, 28, 10),
  ('user_anjali', 'Anjali', 'anjali@example.com', 'Female', '+91 98765 43211', 94, true, 32, 45, 4.9, 39, 10),
  ('user_sneha', 'Sneha', 'sneha@example.com', 'Female', '+91 98765 43212', 88, true, 12, 16, 4.7, 14, 10),
  ('user_vikram', 'Vikram', 'vikram@example.com', 'Male', '+91 98765 43213', 85, true, 8, 9, 4.6, 9, 9)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.journeys (id, user_id, user_name, user_trust_score, user_verified, user_gender, from_location, to_location, time, cooperation_type, status, meeting_point)
VALUES
  ('journey_1', 'user_anjali', 'Anjali', 94, true, 'Female', 'College', 'Kollam', '5:00 PM', 'share_vehicle', 'scheduled', 'College Main Gate'),
  ('journey_2', 'user_sneha', 'Sneha', 88, true, 'Female', 'College', 'Karunagappally', '4:20 PM', 'carry_along', 'scheduled', 'Library Block Entrance'),
  ('journey_3', 'user_vikram', 'Vikram', 85, true, 'Male', 'College', 'Kollam', '5:30 PM', 'join_journey', 'scheduled', 'Bus Stop'),
  ('journey_4', 'user_rahul', 'Rahul', 92, true, 'Male', 'Campus Hostels', 'Main Junction', '5:15 PM', 'daily_walk', 'scheduled', 'Hostel Gate 2')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.vehicle_details (id, journey_id, vehicle_type, available_seats, travel_contribution)
VALUES
  ('vd_1', 'journey_1', 'Car', 2, 50)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.items (id, journey_id, item_name, description, size, suggested_tip, is_permitted)
VALUES
  ('item_1', 'journey_2', 'Document', 'Assignment documents in folder', 'Small', 20, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.requests (id, journey_id, sender_id, sender_name, sender_trust_score, sender_verified, receiver_id, receiver_name, request_type, status, message, journey_from, journey_to, journey_time)
VALUES
  ('req_1', 'journey_1', 'user_rahul', 'Rahul', 92, true, 'user_anjali', 'Anjali', 'share_vehicle', 'pending', 'Hi Anjali, leaving from college at 5pm. Would love to join!', 'College', 'Kollam', '5:00 PM'),
  ('req_2', 'journey_4', 'user_vikram', 'Vikram', 85, true, 'user_rahul', 'Rahul', 'daily_walk', 'pending', 'Heading to Main Junction as well, let us walk together.', 'Campus Hostels', 'Main Junction', '5:15 PM')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.trusted_connections (id, user_id, trusted_user_id, trusted_user_name, trusted_user_score, verified)
VALUES
  ('trust_1', 'user_rahul', 'user_anjali', 'Anjali', 94, true),
  ('trust_2', 'user_rahul', 'user_sneha', 'Sneha', 88, true)
ON CONFLICT (id) DO NOTHING;
