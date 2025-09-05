-- =============================================================================
-- Toodl Database Schema & Row Level Security Policies
-- Execute these SQL commands in your Supabase SQL Editor
-- =============================================================================

-- Drop existing tables if they exist (CAUTION: This will delete all data!)
-- Uncomment the following lines only if you want to start fresh:
-- DROP TABLE IF EXISTS reading_progress CASCADE;
-- DROP TABLE IF EXISTS story_shares CASCADE;
-- DROP TABLE IF EXISTS tts_tracks CASCADE;
-- DROP TABLE IF EXISTS media_assets CASCADE;
-- DROP TABLE IF EXISTS choices CASCADE;
-- DROP TABLE IF EXISTS story_nodes CASCADE;
-- DROP TABLE IF EXISTS stories CASCADE;
-- DROP TABLE IF EXISTS children CASCADE;
-- DROP TABLE IF EXISTS user_profiles CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- =============================================================================
-- TABLE DEFINITIONS
-- =============================================================================

-- 1. PROFILES TABLE (User profiles linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- 2. CHILDREN TABLE (Child profiles linked to parent users)
CREATE TABLE IF NOT EXISTS children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age <= 18),
  interests TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  voice_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. STORIES TABLE (Generated stories for children)
CREATE TABLE IF NOT EXISTS stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  audio_url TEXT,
  image_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- INDEXES FOR BETTER PERFORMANCE
-- =============================================================================

-- Index for profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Indexes for children table
CREATE INDEX IF NOT EXISTS idx_children_parent_id ON children(parent_id);

-- Indexes for stories table
CREATE INDEX IF NOT EXISTS idx_stories_child_id ON stories(child_id);
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- PROFILES TABLE POLICIES
-- =============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

-- Create new RLS policies for profiles table
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" 
ON profiles FOR DELETE 
USING (auth.uid() = user_id);

-- =============================================================================
-- CHILDREN TABLE POLICIES
-- =============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own children" ON children;
DROP POLICY IF EXISTS "Users can insert own children" ON children;
DROP POLICY IF EXISTS "Users can update own children" ON children;
DROP POLICY IF EXISTS "Users can delete own children" ON children;

-- Create RLS policies for children table
CREATE POLICY "Users can view own children" 
ON children FOR SELECT 
USING (parent_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can insert own children" 
ON children FOR INSERT 
WITH CHECK (parent_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update own children" 
ON children FOR UPDATE 
USING (parent_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
)) 
WITH CHECK (parent_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can delete own children" 
ON children FOR DELETE 
USING (parent_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

-- =============================================================================
-- STORIES TABLE POLICIES
-- =============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own stories" ON stories;
DROP POLICY IF EXISTS "Users can insert own stories" ON stories;
DROP POLICY IF EXISTS "Users can update own stories" ON stories;
DROP POLICY IF EXISTS "Users can delete own stories" ON stories;

-- Create RLS policies for stories table
CREATE POLICY "Users can view own stories" 
ON stories FOR SELECT 
USING (child_id IN (
  SELECT c.id FROM children c 
  JOIN profiles p ON c.parent_id = p.id 
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Users can insert own stories" 
ON stories FOR INSERT 
WITH CHECK (child_id IN (
  SELECT c.id FROM children c 
  JOIN profiles p ON c.parent_id = p.id 
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Users can update own stories" 
ON stories FOR UPDATE 
USING (child_id IN (
  SELECT c.id FROM children c 
  JOIN profiles p ON c.parent_id = p.id 
  WHERE p.user_id = auth.uid()
)) 
WITH CHECK (child_id IN (
  SELECT c.id FROM children c 
  JOIN profiles p ON c.parent_id = p.id 
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Users can delete own stories" 
ON stories FOR DELETE 
USING (child_id IN (
  SELECT c.id FROM children c 
  JOIN profiles p ON c.parent_id = p.id 
  WHERE p.user_id = auth.uid()
));

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_updated_at ON profiles;
DROP TRIGGER IF EXISTS handle_updated_at ON children;
DROP TRIGGER IF EXISTS handle_updated_at ON stories;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Triggers for updated_at timestamp
CREATE TRIGGER handle_updated_at 
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at 
  BEFORE UPDATE ON children
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at 
  BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- =============================================================================
-- VALIDATION & TESTING
-- =============================================================================

-- Test RLS policies (uncomment to verify after running the above)
-- These should return empty results when run as authenticated users
-- who don't own the data:

-- SELECT 'Testing profiles RLS' AS test_name;
-- SELECT 'Testing children RLS' AS test_name; 
-- SELECT 'Testing stories RLS' AS test_name;

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant permissions on tables
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON children TO authenticated;
GRANT ALL ON stories TO authenticated;

-- Grant select for anon users (for public content if needed)
GRANT SELECT ON profiles TO anon;

-- =============================================================================
-- SCHEMA COMPLETE
-- =============================================================================

-- This schema includes:
-- ✅ profiles table with proper auth.users reference
-- ✅ children table with parent relationship to profiles
-- ✅ stories table with child relationship
-- ✅ Comprehensive Row Level Security policies
-- ✅ Proper indexes for performance
-- ✅ Automatic timestamp updates
-- ✅ Automatic profile creation on user signup
-- ✅ Data validation constraints
-- ✅ Proper permissions setup

-- Next steps after running this schema:
-- 1. Verify tables are created in your Supabase dashboard
-- 2. Test authentication and RLS policies
-- 3. Update your TypeScript types in lib/supabase.ts
-- 4. Test creating profiles, children, and stories through your app