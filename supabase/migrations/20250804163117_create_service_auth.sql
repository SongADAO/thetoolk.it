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

-- Create service_auths table with updated_at column
CREATE TABLE service_auths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add updated_at triggers to both tables using our helper function
SELECT add_updated_at_trigger('service_auths');

-- Enable RLS on both tables
ALTER TABLE service_auths ENABLE ROW LEVEL SECURITY;

-- RLS policies for service_auths
CREATE POLICY "Users can view own service_auths" ON service_auths
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create service_auths" ON service_auths
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own service_auths" ON service_auths
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own service_auths" ON service_auths
  FOR DELETE USING (auth.uid() = user_id);
