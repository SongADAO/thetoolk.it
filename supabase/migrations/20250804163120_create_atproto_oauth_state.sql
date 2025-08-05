-- OAuth states table (for temporary auth flow state)
CREATE TABLE atproto_oauth_states (
  key TEXT PRIMARY KEY,
  value JSON NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cleanup expired records automatically
CREATE INDEX idx_atproto_oauth_states_expires ON atproto_oauth_states(expires_at);

-- Add indexes for user-based queries
CREATE INDEX idx_atproto_oauth_states_user ON atproto_oauth_states(user_id);

