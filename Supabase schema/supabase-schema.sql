-- =====================================================
-- OMEGLE CLONE - COMPLETE SUPABASE SCHEMA
-- =====================================================
-- This schema includes:
-- 1. User Connections Tracking
-- 2. Chat Sessions Management
-- 3. Chat Messages Storage
-- 4. Analytics Views
-- 5. Useful Functions
-- =====================================================

-- =====================================================
-- 1. TABLES
-- =====================================================

-- Create users connections table
CREATE TABLE IF NOT EXISTS user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  socket_id TEXT NOT NULL,
  country TEXT,
  ip_address TEXT,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  disconnected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  user1_id TEXT NOT NULL,
  user2_id TEXT NOT NULL,
  user1_country TEXT,
  user2_country TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  message_text TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  has_image BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_socket_id ON user_connections(socket_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_started_at ON chat_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_user_connections_country ON user_connections(country);
CREATE INDEX IF NOT EXISTS idx_user_connections_connected_at ON user_connections(connected_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sent_at ON chat_messages(sent_at);
CREATE INDEX IF NOT EXISTS idx_user_connections_disconnected_at ON user_connections(disconnected_at);

-- =====================================================
-- 3. FOREIGN KEY CONSTRAINTS
-- =====================================================

ALTER TABLE chat_messages 
ADD CONSTRAINT fk_chat_messages_session 
FOREIGN KEY (session_id) 
REFERENCES chat_sessions(session_id) 
ON DELETE CASCADE;

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now - adjust based on your needs)
CREATE POLICY "Allow all operations on user_connections" ON user_connections FOR ALL USING (true);
CREATE POLICY "Allow all operations on chat_sessions" ON chat_sessions FOR ALL USING (true);
CREATE POLICY "Allow all operations on chat_messages" ON chat_messages FOR ALL USING (true);

-- =====================================================
-- 5. ANALYTICS VIEWS
-- =====================================================

-- View: Active Users (connected in last 5 minutes)
CREATE OR REPLACE VIEW active_users AS
SELECT 
  country,
  COUNT(*) as active_count
FROM user_connections
WHERE connected_at >= NOW() - INTERVAL '5 minutes'
  AND disconnected_at IS NULL
GROUP BY country
ORDER BY active_count DESC;

-- View: Daily Chat Statistics
CREATE OR REPLACE VIEW daily_chat_stats AS
SELECT 
  DATE(started_at) as date,
  COUNT(*) as total_chats,
  AVG(duration_seconds) as avg_duration_seconds,
  MAX(duration_seconds) as max_duration_seconds,
  MIN(duration_seconds) as min_duration_seconds
FROM chat_sessions
WHERE started_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(started_at)
ORDER BY date DESC;

-- View: Country Statistics
CREATE OR REPLACE VIEW country_stats AS
SELECT 
  COALESCE(user1_country, 'Unknown') as country,
  COUNT(*) as total_chats,
  AVG(duration_seconds) as avg_duration
FROM chat_sessions
GROUP BY user1_country
ORDER BY total_chats DESC;

-- View: Hourly Activity
CREATE OR REPLACE VIEW hourly_activity AS
SELECT 
  EXTRACT(HOUR FROM started_at) as hour,
  COUNT(*) as chat_count
FROM chat_sessions
WHERE started_at >= CURRENT_DATE
GROUP BY EXTRACT(HOUR FROM started_at)
ORDER BY hour;

-- View: Message Statistics
CREATE OR REPLACE VIEW message_stats AS
SELECT 
  session_id,
  COUNT(*) as message_count,
  SUM(CASE WHEN has_image THEN 1 ELSE 0 END) as image_count,
  MIN(sent_at) as first_message,
  MAX(sent_at) as last_message
FROM chat_messages
GROUP BY session_id;

-- =====================================================
-- 6. USEFUL FUNCTIONS
-- =====================================================

-- Function: Get online users count
CREATE OR REPLACE FUNCTION get_online_users_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM user_connections
    WHERE connected_at >= NOW() - INTERVAL '5 minutes'
      AND disconnected_at IS NULL
  );
END;
$$ LANGUAGE plpgsql;

-- Function: Get today's chat count
CREATE OR REPLACE FUNCTION get_today_chat_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM chat_sessions
    WHERE started_at >= CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql;

-- Function: Get popular countries (top 10)
CREATE OR REPLACE FUNCTION get_popular_countries()
RETURNS TABLE(country TEXT, chat_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(user1_country, 'Unknown') as country,
    COUNT(*) as chat_count
  FROM chat_sessions
  WHERE started_at >= CURRENT_DATE - INTERVAL '7 days'
  GROUP BY user1_country
  ORDER BY chat_count DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. SAMPLE QUERIES (COMMENTED OUT)
-- =====================================================

-- Get all active users by country:
-- SELECT * FROM active_users;

-- Get today's chat statistics:
-- SELECT * FROM daily_chat_stats WHERE date = CURRENT_DATE;

-- Get top 10 countries by chat count:
-- SELECT * FROM country_stats LIMIT 10;

-- Get average chat duration:
-- SELECT AVG(duration_seconds) FROM chat_sessions WHERE ended_at IS NOT NULL;

-- Get total messages sent today:
-- SELECT COUNT(*) FROM chat_messages WHERE sent_at >= CURRENT_DATE;

-- Get chats with images:
-- SELECT session_id, COUNT(*) as image_count
-- FROM chat_messages
-- WHERE has_image = true
-- GROUP BY session_id
-- ORDER BY image_count DESC;

-- Get busiest hours today:
-- SELECT * FROM hourly_activity;

-- Get longest chat sessions:
-- SELECT session_id, duration_seconds, user1_country, user2_country
-- FROM chat_sessions
-- WHERE duration_seconds IS NOT NULL
-- ORDER BY duration_seconds DESC
-- LIMIT 10;

-- =====================================================
-- SCHEMA SETUP COMPLETE!
-- =====================================================
-- Next steps:
-- 1. Copy this entire file
-- 2. Go to Supabase Dashboard > SQL Editor
-- 3. Paste and run this script
-- 4. All tables, indexes, views, and functions will be created
-- =====================================================
