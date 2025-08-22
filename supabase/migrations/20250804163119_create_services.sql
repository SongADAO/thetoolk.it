-- Create services table with updated_at column
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  service_id VARCHAR NOT NULL,
  service_enabled BOOLEAN,
  service_credentials JSON,
  service_accounts JSON,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE services
ADD CONSTRAINT unique_user_service UNIQUE (user_id, service_id);

-- Enable RLS on both tables
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- RLS policies for services
CREATE POLICY "Users can view own services" ON services
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create services" ON services
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own services" ON services
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own services" ON services
  FOR DELETE USING (auth.uid() = user_id);


-- Create services table with updated_at column
CREATE TABLE service_authorizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  service_id VARCHAR NOT NULL,
  service_authorization JSON,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE authorizations
ADD CONSTRAINT unique_user_service UNIQUE (user_id, service_id);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;


-- OAuth states table (for temporary auth flow state)
CREATE TABLE service_oauth_states (
  key TEXT PRIMARY KEY,
  value JSON NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_service_oauth_states_user ON service_oauth_states(user_id);

ALTER TABLE service_oauth_states ENABLE ROW LEVEL SECURITY;
