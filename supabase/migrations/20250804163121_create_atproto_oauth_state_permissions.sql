-- Enable RLS on both tables
ALTER TABLE atproto_oauth_states ENABLE ROW LEVEL SECURITY;

-- RLS policies for services
CREATE POLICY "Users can view own atproto_oauth_states" ON atproto_oauth_states
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create atproto_oauth_states" ON atproto_oauth_states
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own atproto_oauth_states" ON atproto_oauth_states
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own atproto_oauth_states" ON atproto_oauth_states
  FOR DELETE USING (auth.uid() = user_id);
