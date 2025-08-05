-- Create the function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Helper function to add updated_at trigger to any table
CREATE OR REPLACE FUNCTION add_updated_at_trigger(table_name TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('
    CREATE TRIGGER update_%I_updated_at
      BEFORE UPDATE ON %I
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  ', table_name, table_name);
END;
$$ language 'plpgsql';

-- Create services table with updated_at column
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  service_id VARCHAR NOT NULL,
  service_enabled BOOLEAN,
  service_authorization JSON,
  service_credentials JSON,
  service_accounts JSON,
  service_state JSON,
  service_session JSON,
  service_state_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE services
ADD CONSTRAINT unique_user_service UNIQUE (user_id, service_id);

-- Add updated_at triggers to both tables using our helper function
SELECT add_updated_at_trigger('services');

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
