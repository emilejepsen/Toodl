# Supabase Authentication Configuration Guide

This guide provides complete setup instructions for configuring Supabase authentication for the Toodl Next.js application.

## Overview

The authentication system includes:
- ✅ Email/password authentication
- ✅ Google OAuth provider
- ✅ Protected routes with middleware
- ✅ Row Level Security (RLS) policies
- ✅ Email confirmation and password reset

## 1. Environment Setup

### Step 1: Copy Environment Variables

```bash
cp .env.local.example .env.local
```

### Step 2: Update Environment Variables

Edit `.env.local` with your Supabase project details:

```env
NEXT_PUBLIC_SUPABASE_URL=https://kplsiuxbkpfndvhoxxjm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**To get your keys:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `kplsiuxbkpfndvhoxxjm`
3. Go to Settings → API
4. Copy the Project URL and anon/public key

## 2. Supabase Dashboard Configuration

### Step 1: Enable Authentication Providers

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Enable **Email** provider:
   - ✅ Enable email provider
   - ✅ Enable email confirmations (recommended)
   - Set **Site URL**: `http://localhost:3000` (development) / `https://yourdomain.com` (production)
   - Add redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `https://yourdomain.com/auth/callback` (for production)

3. Enable **Google** provider:
   - ✅ Enable Google provider
   - Add your Google OAuth credentials (see Google OAuth Setup below)

### Step 2: Configure Email Templates (Optional)

Go to **Authentication** → **Email Templates** to customize:
- Confirmation email
- Password reset email
- Magic link email

### Step 3: Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Add authorized origins:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
7. Add authorized redirect URIs:
   - `https://kplsiuxbkpfndvhoxxjm.supabase.co/auth/v1/callback`
8. Copy Client ID and Client Secret
9. In Supabase Dashboard → Authentication → Providers → Google:
   - Paste Client ID and Client Secret
   - ✅ Enable Google provider

## 3. Database Setup

### Step 1: Create Database Tables

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  gender TEXT,
  interests TEXT[],
  marketing_consent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Create children table
CREATE TABLE children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT,
  interests TEXT[],
  reading_level TEXT,
  avatar_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create stories table
CREATE TABLE stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_age INTEGER,
  genre TEXT,
  theme TEXT,
  difficulty TEXT,
  status TEXT DEFAULT 'draft',
  language TEXT DEFAULT 'da',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add other tables as needed...
```

### Step 2: Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- User profiles: users can only access their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Children: users can only access their own children
CREATE POLICY "Users can view own children" ON children
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own children" ON children
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own children" ON children
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own children" ON children
  FOR DELETE USING (auth.uid() = user_id);

-- Stories: users can only access their own stories
CREATE POLICY "Users can view own stories" ON stories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stories" ON stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stories" ON stories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stories" ON stories
  FOR DELETE USING (auth.uid() = user_id);
```

### Step 3: Create Database Functions (Optional)

```sql
-- Function to automatically create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name, marketing_consent)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON children
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
```

## 4. Installation and Dependencies

Install the required packages:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## 5. Application Structure

The authentication system includes these files:

```
/lib
  ├── supabase.ts          # Supabase client configuration
  └── auth.ts              # Authentication utilities and hooks

/app
  ├── middleware.ts        # Route protection middleware
  ├── login/page.tsx       # Login page
  └── auth/
      ├── callback/route.ts         # OAuth callback handler
      └── auth-code-error/page.tsx  # Error page

/components/screens
  └── LoginScreen.tsx      # Updated login form with Supabase integration
```

## 6. Authentication Features

### ✅ Implemented Features

1. **Email/Password Authentication**
   - User registration with email confirmation
   - Login with email and password
   - Password validation (minimum 6 characters)

2. **Google OAuth**
   - One-click Google login
   - Automatic account creation
   - Profile information sync

3. **Password Management**
   - Password reset via email
   - Secure password updates

4. **Route Protection**
   - Middleware-based authentication
   - Automatic redirects
   - Protected and public routes

5. **User Experience**
   - Loading states
   - Error handling
   - Form validation

## 7. Testing the Setup

### Step 1: Start Development Server

```bash
npm run dev
```

### Step 2: Test Authentication Flow

1. **Visit** `http://localhost:3000/login`
2. **Register** a new account with email/password
3. **Check email** for confirmation (if enabled)
4. **Login** with credentials
5. **Test Google OAuth** with the "Continue with Google" button
6. **Try password reset** functionality

### Step 3: Verify Database

Check your Supabase dashboard:
- **Authentication** → **Users** (should show new users)
- **Table Editor** → **user_profiles** (should show profile data)

## 8. Production Deployment

### Environment Variables for Production

Update your production environment with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://kplsiuxbkpfndvhoxxjm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Update Supabase Settings

1. **Site URL**: Change to your production domain
2. **Redirect URLs**: Add your production callback URL
3. **Google OAuth**: Add production domain to authorized origins

## 9. Next Steps

After completing this setup, you can:

1. **Create user onboarding flow** (already started in `/app/onboarding/`)
2. **Add profile management** features
3. **Implement story creation** with user authentication
4. **Add role-based permissions** if needed
5. **Set up email templates** for branding

## 10. Troubleshooting

### Common Issues

1. **"Invalid API key"**
   - Verify your environment variables are correct
   - Check that `.env.local` is not committed to git

2. **OAuth redirect errors**
   - Verify redirect URLs in both Google Console and Supabase
   - Check that callback route is accessible

3. **Database permission errors**
   - Verify RLS policies are created
   - Check that user authentication is working

4. **Email confirmation not working**
   - Check email provider settings
   - Verify SMTP configuration in Supabase

### Support Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js with Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [Google OAuth Setup Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)

---

**Configuration completed successfully!** 🎉

Your Toodl application now has fully functional authentication with email/password and Google OAuth support, plus proper security policies and route protection.