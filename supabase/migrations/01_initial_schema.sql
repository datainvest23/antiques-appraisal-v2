-- Antiques Appraisal Database Schema

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  user_type TEXT DEFAULT 'user',
  first_name TEXT,
  last_name TEXT,
  profile_data JSONB DEFAULT '{}'::jsonb
);

-- 2. Tokens Table
CREATE TABLE IF NOT EXISTS public.tokens (
  user_id UUID PRIMARY KEY REFERENCES public.users(user_id) ON DELETE CASCADE,
  token_balance INTEGER DEFAULT 5,
  transaction_history JSONB DEFAULT '[]'::jsonb
);

-- 3. Valuations Table
CREATE TABLE IF NOT EXISTS public.valuations (
  valuation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_detailed BOOLEAN DEFAULT FALSE,
  valuation_report JSONB NOT NULL
);

-- 4. Referrals Table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  referred_user_id UUID UNIQUE NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reward_granted BOOLEAN DEFAULT FALSE
);

-- Row Level Security (RLS) Policies

-- Users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = user_id);

-- Tokens
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own tokens" ON public.tokens FOR SELECT USING (auth.uid() = user_id);

-- Valuations
ALTER TABLE public.valuations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own valuations" ON public.valuations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own valuations" ON public.valuations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view referrals they are part of" ON public.referrals FOR SELECT 
USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

-- Trigger for new users (as described in docs/supabase_setup.md)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (user_id, email, created_at, user_type)
  VALUES (NEW.id, NEW.email, NEW.created_at, 'user')
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.tokens (user_id, token_balance)
  VALUES (NEW.id, 5)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
