-- ====================================================================
-- SUPABASE MIGRATION: Production Database Schema for Shoba Kafaatu Sadat
-- Tables: profiles, opportunities, saved_opportunities, applications, sadat_records
-- Includes: RLS, Triggers, Indexes, Foreign Keys, Storage Policies
-- ====================================================================

-- 1. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('super_admin', 'admin', 'moderator', 'member')),
  avatar_url TEXT,
  city TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. OPPORTUNITIES TABLE (Matrimonial Rishtey & Matchmaking Opportunities)
CREATE TABLE IF NOT EXISTS public.opportunities (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  serial_number TEXT NOT NULL UNIQUE,
  gender TEXT NOT NULL CHECK (gender IN ('لڑکا', 'لڑکی')),
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 16 AND age <= 80),
  father_name TEXT,
  height TEXT,
  disability TEXT DEFAULT 'نہیں',
  marital_status TEXT NOT NULL DEFAULT 'غیر شادی شدہ',
  
  -- Education
  qualification TEXT NOT NULL,
  college TEXT,
  university TEXT,

  -- Employment / Career
  rank_position TEXT,
  income TEXT,
  job_nature TEXT,
  future_plans TEXT,

  -- Lineage & Religion
  religion TEXT DEFAULT 'اسلام',
  caste TEXT DEFAULT 'سید',
  maslak TEXT DEFAULT 'اہلسنت',

  -- Property & Housing
  house TEXT DEFAULT 'ذاتی',
  house_size TEXT,
  house_location TEXT,
  other_properties TEXT,

  -- Family details
  father_occupation TEXT,
  sisters_count INTEGER DEFAULT 0,
  brothers_count INTEGER DEFAULT 0,
  married_siblings TEXT,

  -- Location
  current_city TEXT NOT NULL,
  native_city TEXT,

  -- Requirements for Matching
  req_marital_status TEXT DEFAULT 'غیر شادی شدہ',
  req_age_range TEXT,
  req_height TEXT,
  req_city TEXT,
  req_maslak TEXT DEFAULT 'اہلسنت',
  req_mother_tongue TEXT DEFAULT 'اردو',
  req_qualification TEXT,
  req_residence TEXT,
  req_other_demands TEXT,
  remarks TEXT,

  -- Contact & Confidentiality
  contact_number TEXT,
  status TEXT NOT NULL DEFAULT 'فعال' CHECK (status IN ('فعال', 'زیر غور', 'طے پا گیا', 'غیر فعال')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- AI Readiness Metadata
  ai_compatibility_cache JSONB DEFAULT '{}'::jsonb,
  ai_tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Backwards compatibility alias view for sadat_records
CREATE OR REPLACE VIEW public.sadat_records AS 
  SELECT * FROM public.opportunities;

-- 3. SAVED OPPORTUNITIES TABLE (User bookmarks & favorites)
CREATE TABLE IF NOT EXISTS public.saved_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opportunity_id TEXT NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, opportunity_id)
);

-- 4. APPLICATIONS TABLE (Matrimonial Proposals / Inquiries submitted)
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  opportunity_id TEXT NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  candidate_serial TEXT,
  candidate_name TEXT,
  candidate_city TEXT,
  candidate_phone TEXT,
  proposal_notes TEXT NOT NULL,
  family_details TEXT,
  status TEXT NOT NULL DEFAULT 'زیر غور' CHECK (status IN ('زیر غور', 'منظور شدہ', 'رابطہ قائم', 'مسترد', 'طے پا گیا')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_opportunities_serial ON public.opportunities(serial_number);
CREATE INDEX IF NOT EXISTS idx_opportunities_gender ON public.opportunities(gender);
CREATE INDEX IF NOT EXISTS idx_opportunities_city ON public.opportunities(current_city);
CREATE INDEX IF NOT EXISTS idx_opportunities_maslak ON public.opportunities(maslak);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON public.opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_age ON public.opportunities(age);
CREATE INDEX IF NOT EXISTS idx_saved_opps_user ON public.saved_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_opp ON public.applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON public.applications(applicant_id);

-- ====================================================================
-- AUTO-SYNC NEW AUTH USERS INTO PROFILES TRIGGER
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'member')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto update timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_opportunities_updated_at ON public.opportunities;
CREATE TRIGGER set_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_applications_updated_at ON public.applications;
CREATE TRIGGER set_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public can view basic profiles" ON public.profiles;
CREATE POLICY "Public can view basic profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins have full profile access" ON public.profiles;
CREATE POLICY "Admins have full profile access" ON public.profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
);

-- Opportunities Policies (Public and Auth access)
DROP POLICY IF EXISTS "Anyone can view opportunities" ON public.opportunities;
CREATE POLICY "Anyone can view opportunities" ON public.opportunities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert opportunities" ON public.opportunities;
CREATE POLICY "Anyone can insert opportunities" ON public.opportunities FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update opportunities" ON public.opportunities;
CREATE POLICY "Anyone can update opportunities" ON public.opportunities FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete opportunities" ON public.opportunities;
CREATE POLICY "Anyone can delete opportunities" ON public.opportunities FOR DELETE USING (true);

-- Saved Opportunities Policies
DROP POLICY IF EXISTS "Users can view own saved opportunities" ON public.saved_opportunities;
CREATE POLICY "Users can view own saved opportunities" ON public.saved_opportunities 
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users can save opportunities" ON public.saved_opportunities;
CREATE POLICY "Users can save opportunities" ON public.saved_opportunities 
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users can remove saved opportunities" ON public.saved_opportunities;
CREATE POLICY "Users can remove saved opportunities" ON public.saved_opportunities 
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Applications Policies
DROP POLICY IF EXISTS "Anyone can submit applications" ON public.applications;
CREATE POLICY "Anyone can submit applications" ON public.applications 
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view applications" ON public.applications;
CREATE POLICY "Anyone can view applications" ON public.applications 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can update applications" ON public.applications;
CREATE POLICY "Anyone can update applications" ON public.applications 
  FOR UPDATE USING (true);

-- ====================================================================
-- STORAGE BUCKET CREATION & POLICIES
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('sadat-documents', 'sadat-documents', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access to sadat-documents" ON storage.objects;
CREATE POLICY "Public Access to sadat-documents" ON storage.objects 
  FOR SELECT USING (bucket_id = 'sadat-documents');

DROP POLICY IF EXISTS "Upload Access to sadat-documents" ON storage.objects;
CREATE POLICY "Upload Access to sadat-documents" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'sadat-documents');
