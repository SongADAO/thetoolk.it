-- Create service_credentials table with updated_at column
CREATE TABLE service_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  service_id VARCHAR NOT NULL,
  credentials JSON,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add updated_at triggers to both tables using our helper function
SELECT add_updated_at_trigger('service_credentials');

-- Enable RLS on both tables
ALTER TABLE service_credentials ENABLE ROW LEVEL SECURITY;

-- RLS policies for service_credentials
CREATE POLICY "Users can view own service_credentials" ON service_credentials
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create service_credentials" ON service_credentials
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own service_credentials" ON service_credentials
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own service_credentials" ON service_credentials
  FOR DELETE USING (auth.uid() = user_id);
