-- ============================================
-- AI ANSWER GENERATOR - DATABASE SCHEMA
-- Add these tables to your existing database
-- ============================================

-- Generated Answers Table
CREATE TABLE IF NOT EXISTS generated_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Question details
  question_text TEXT NOT NULL,
  question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
  category TEXT, -- GS1, GS2, GS3, GS4, Essay
  word_limit INTEGER DEFAULT 250,
  
  -- Generated content (structured)
  answer_text TEXT NOT NULL,
  introduction TEXT,
  body_points JSONB, -- Structured body with headings and mark-worthy metadata
  conclusion TEXT,
  
  -- Highlighting metadata
  mark_worthy_points JSONB, -- Array of {position, type, explanation, marks_value}
  
  -- Quality metrics
  word_count INTEGER,
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  prompt_version TEXT DEFAULT 'v1',
  access_count INTEGER DEFAULT 1
);

-- User Generation Requests (for rate limiting and analytics)
CREATE TABLE IF NOT EXISTS generation_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  generated_answer_id UUID REFERENCES generated_answers(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Answers (User's personal library)
CREATE TABLE IF NOT EXISTS saved_generated_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  generated_answer_id UUID REFERENCES generated_answers(id) ON DELETE CASCADE NOT NULL,
  notes TEXT, -- User's personal notes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, generated_answer_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_generated_answers_question ON generated_answers(question_text);
CREATE INDEX idx_generated_answers_category ON generated_answers(category);
CREATE INDEX idx_generated_answers_accessed ON generated_answers(last_accessed_at DESC);

CREATE INDEX idx_generation_requests_user ON generation_requests(user_id);
CREATE INDEX idx_generation_requests_date ON generation_requests(created_at DESC);
CREATE INDEX idx_generation_requests_user_date ON generation_requests(user_id, created_at);

CREATE INDEX idx_saved_answers_user ON saved_generated_answers(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE generated_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_generated_answers ENABLE ROW LEVEL SECURITY;

-- Generated answers are viewable by all authenticated users (public knowledge)
CREATE POLICY "Anyone can view generated answers" ON generated_answers
  FOR SELECT TO authenticated USING (true);

-- Only service role can insert (via API)
CREATE POLICY "Service role can insert generated answers" ON generated_answers
  FOR INSERT WITH CHECK (true);

-- Users can view their own generation requests
CREATE POLICY "Users can view own requests" ON generation_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own requests (tracked by API)
CREATE POLICY "Users can insert own requests" ON generation_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can manage their saved answers
CREATE POLICY "Users can view own saved answers" ON saved_generated_answers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save answers" ON saved_generated_answers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete saved answers" ON saved_generated_answers  
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTION: Check Daily Limit
-- ============================================

CREATE OR REPLACE FUNCTION check_daily_generation_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  request_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO request_count
  FROM generation_requests
  WHERE user_id = p_user_id
    AND created_at >= CURRENT_DATE;
  
  RETURN request_count < 3; -- Free tier: 3 per day
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check if tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('generated_answers', 'generation_requests', 'saved_generated_answers');

-- ============================================
-- SETUP COMPLETE! ✅
-- ============================================
