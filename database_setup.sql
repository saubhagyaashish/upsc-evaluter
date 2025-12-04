-- ============================================
-- UPSC EVALUATOR - COMPLETE DATABASE SETUP
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions Bank Table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_text TEXT NOT NULL,
  category TEXT NOT NULL, -- GS1, GS2, GS3, GS4, Essay
  subject TEXT, -- History, Geography, Polity, etc.
  year INTEGER,
  word_limit INTEGER DEFAULT 250,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Answers Table
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  question_source TEXT NOT NULL CHECK (question_source IN ('manual', 'bank', 'ocr')),
  image_url TEXT NOT NULL,
  extracted_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evaluations Table
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  answer_id UUID REFERENCES answers(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  structure_feedback TEXT,
  points_missed TEXT[],
  suggestions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. AUTO-CREATE PROFILE ON SIGNUP (TRIGGER)
-- ============================================

-- Function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger that runs after a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USER_PROFILES POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- QUESTIONS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Anyone can view questions" ON questions;

-- All authenticated users can view questions
CREATE POLICY "Anyone can view questions" ON questions
  FOR SELECT TO authenticated USING (true);

-- ============================================
-- ANSWERS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own answers" ON answers;
DROP POLICY IF EXISTS "Users can insert own answers" ON answers;
DROP POLICY IF EXISTS "Users can update own answers" ON answers;

-- Users can view their own answers
CREATE POLICY "Users can view own answers" ON answers
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own answers
CREATE POLICY "Users can insert own answers" ON answers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own answers
CREATE POLICY "Users can update own answers" ON answers
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- EVALUATIONS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own evaluations" ON evaluations;
DROP POLICY IF EXISTS "Service role can insert evaluations" ON evaluations;

-- Users can view evaluations for their own answers
CREATE POLICY "Users can view own evaluations" ON evaluations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM answers
      WHERE answers.id = evaluations.answer_id
      AND answers.user_id = auth.uid()
    )
  );

-- Service role can insert evaluations (API routes)
CREATE POLICY "Service role can insert evaluations" ON evaluations
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 4. INSERT SAMPLE QUESTIONS (OPTIONAL)
-- ============================================

INSERT INTO questions (question_text, category, subject, year, word_limit) VALUES
('Discuss the impact of climate change on agricultural productivity in India.', 'GS3', 'Environment', 2024, 250),
('Analyze the role of women in India''s freedom struggle.', 'GS1', 'History', 2024, 250),
('Evaluate the effectiveness of Public Distribution System in India.', 'GS3', 'Economics', 2024, 250),
('Discuss the challenges and opportunities of Digital India initiative.', 'GS2', 'Governance', 2024, 250),
('What is the significance of the Indian Constitution''s Preamble?', 'GS2', 'Polity', 2024, 150),
('Examine the impact of globalization on Indian culture.', 'GS1', 'Culture', 2023, 250),
('Critically analyze the implementation of Swachh Bharat Mission.', 'GS2', 'Governance', 2023, 250),
('Discuss the role of microfinance in rural development.', 'GS3', 'Economics', 2023, 250),
('Evaluate India''s foreign policy towards neighboring countries.', 'GS2', 'International Relations', 2023, 250),
('Analyze the challenges of urban planning in metropolitan cities.', 'GS3', 'Urban Development', 2023, 250)
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. VERIFICATION QUERIES
-- ============================================

-- Check if tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'questions', 'answers', 'evaluations');

-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'questions', 'answers', 'evaluations');

-- Count sample questions
SELECT COUNT(*) as question_count FROM questions;

-- ============================================
-- SETUP COMPLETE! ✅
-- ============================================
-- Next Steps:
-- 1. Go to Storage and create 'answer-images' bucket (make it public)
-- 2. Set storage policies (see SUPABASE_SETUP.md)
-- 3. Copy your credentials to .env.local
-- 4. Run: npm run dev
-- 5. Test signup at http://localhost:3000/signup
-- ============================================
