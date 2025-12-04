# Supabase Database Setup

Follow these steps to set up your Supabase database for the UPSC Answer Evaluation app.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization and enter:
   - Project name: `upsc-evaluator`
   - Database password: (choose a strong password)
   - Region: (choose closest to India for best performance)
4. Click "Create new project"

## Step 2: Create Tables

Go to the SQL Editor in your Supabase dashboard and run these SQL commands:

### User Profiles Table

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
```

### Questions Bank Table

```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_text TEXT NOT NULL,
  category TEXT NOT NULL, -- GS1, GS2, GS3, GS4, Essay
  subject TEXT, -- History, Geography, Polity, etc.
  year INTEGER,
  word_limit INTEGER DEFAULT 250,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Anyone can view questions" ON questions
  FOR SELECT TO authenticated USING (true);
```

### Answers Table

```sql
CREATE TABLE answers (
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

-- Enable Row Level Security
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Users can view their own answers
CREATE POLICY "Users can view own answers" ON answers
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own answers
CREATE POLICY "Users can insert own answers" ON answers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own answers
CREATE POLICY "Users can update own answers" ON answers
  FOR UPDATE USING (auth.uid() = user_id);
```

### Evaluations Table

```sql
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  answer_id UUID REFERENCES answers(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  structure_feedback TEXT,
  points_missed TEXT[],
  suggestions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Users can view evaluations for their own answers
CREATE POLICY "Users can view own evaluations" ON evaluations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM answers
      WHERE answers.id = evaluations.answer_id
      AND answers.user_id = auth.uid()
    )
  );

-- System can insert evaluations (via service role)
CREATE POLICY "Service role can insert evaluations" ON evaluations
  FOR INSERT WITH CHECK (true);
```

## Step 3: Set Up Storage Bucket

1. Go to Storage in your Supabase dashboard
2. Click "Create a new bucket"
3. Enter bucket name: `answer-images`
4. Set it to **Public** bucket
5. Click "Create bucket"

### Set Up Storage Policies

Go to the bucket policies and add:

```sql
-- Allow authenticated users to upload their own images
CREATE POLICY "Users can upload own images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'answer-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to view their own images
CREATE POLICY "Users can view own images" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'answer-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read access (for displaying images in evaluations)
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'answer-images');
```

## Step 4: Insert Sample Questions (Optional)

```sql
INSERT INTO questions (question_text, category, subject, year, word_limit) VALUES
('Discuss the impact of climate change on agricultural productivity in India.', 'GS3', 'Environment', 2024, 250),
('Analyze the role of women in India''s freedom struggle.', 'GS1', 'History', 2024, 250),
('Evaluate the effectiveness of Public Distribution System in India.', 'GS3', 'Economics', 2024, 250),
('Discuss the challenges and opportunities of Digital India initiative.', 'GS2', 'Governance', 2024, 250),
('What is the significance of the Indian Constitution''s Preamble?', 'GS2', 'Polity', 2024, 150);
```

## Step 5: Configure Environment Variables

Copy your Supabase credentials to `.env.local`:

1. Go to Settings > API in your Supabase dashboard
2. Copy the Project URL → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy the `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy the `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

Create `.env.local` file in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

OPENAI_API_KEY=your-openai-api-key

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 6: Test the Setup

1. Start your Next.js app: `npm run dev`
2. Go to http://localhost:3000
3. Sign up with a test account
4. Try uploading an answer
5. Check if data appears in your Supabase tables

## Verification Checklist

- [ ] All 4 tables created (user_profiles, questions, answers, evaluations)
- [ ] RLS policies enabled on all tables
- [ ] Storage bucket `answer-images` created
- [ ] Storage policies configured
- [ ] Sample questions inserted (optional)
- [ ] Environment variables configured
- [ ] Test signup/login working
- [ ] Test answer upload working

## Troubleshooting

### Issue: "Row Level Security policy violation"
- **Solution**: Make sure RLS policies are created for all tables
- Check if user is authenticated before accessing data

### Issue: "Storage upload failed"
- **Solution**: Verify storage bucket is public and policies are configured
- Check file size is under 5MB

### Issue: "Cannot insert into table"
- **Solution**: Check RLS INSERT policies allow the operation
- Verify foreign key constraints are satisfied

## Admin Access

For admin features, you'll need to identify admin users. You can either:

1. Add an `is_admin` column to `user_profiles`:
   ```sql
   ALTER TABLE user_profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
   ```

2. Or create a separate admin route that checks against a list of admin email addresses in your code.

For the MVP, accessing `/admin` route will show stats for all users without authentication checks.
