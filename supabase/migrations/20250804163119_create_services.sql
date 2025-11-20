-- Create services table with updated_at column
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  service_id VARCHAR NOT NULL,
  service_enabled BOOLEAN,
  service_credentials JSONB,
  service_expiration JSONB,
  service_accounts JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE services
ADD CONSTRAINT unique_user_service UNIQUE (user_id, service_id);

-- Enable RLS on both tables
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- RLS policies for services
-- CREATE POLICY "Users can view own services" ON services
--   FOR SELECT USING (auth.uid() = user_id);

-- CREATE POLICY "Users can create services" ON services
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can update own services" ON services
--   FOR UPDATE USING (auth.uid() = user_id);

-- CREATE POLICY "Users can delete own services" ON services
--   FOR DELETE USING (auth.uid() = user_id);


-- Create services table with updated_at column
CREATE TABLE service_authorizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  service_id VARCHAR NOT NULL,
  service_authorization JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE service_authorizations
ADD CONSTRAINT unique_service_authorization UNIQUE (user_id, service_id);

ALTER TABLE service_authorizations ENABLE ROW LEVEL SECURITY;


-- OAuth states table (for temporary auth flow state)
CREATE TABLE service_oauth_states (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_service_oauth_states_user ON service_oauth_states(user_id);

ALTER TABLE service_oauth_states ENABLE ROW LEVEL SECURITY;

-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT,
  price_id TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscriptions
-- CREATE POLICY "Users can view own subscriptions" ON subscriptions
--   FOR SELECT USING (auth.uid() = user_id);

-- CREATE POLICY "Users can update own subscriptions" ON subscriptions
--   FOR UPDATE USING (auth.uid() = user_id);

-- Create posts table
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  service_id VARCHAR NOT NULL,
  status_id UNSIGNED INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_posts_user_id ON posts(user_id);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create logs table
CREATE TABLE client_event_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id VARCHAR NOT NULL,
  event_type VARCHAR NOT NULL,
  event_data JSONB,
  ip_address VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE client_event_logs ENABLE ROW LEVEL SECURITY;

