-- ====================================================================
-- SUPABASE POSTGRESQL PRODUCTION SCHEMA FOR SHOBA KAFAATU SADAT
-- Project: https://supabase.com/dashboard/project/kctqwhekftnanwpooavq
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/kctqwhekftnanwpooavq/sql/new
--
-- This script configures:
-- 1. Automatic user profile creation on sign-up (auth.users trigger)
-- 2. Tables: profiles, opportunities, sadat_records, saved_opportunities, applications
-- 3. Relationships, Foreign Keys, Unique constraints & Performance Indexes
-- 4. Row Level Security (RLS) permissive policies for instant web app access
-- 5. Storage bucket 'sadat-documents' for uploads and documents
-- 6. Initial seed records for Pakistani Sadat families
-- ====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 1. PROFILES TABLE (Linked with Supabase auth.users)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT NOT NULL DEFAULT 'سید صاحب',
  phone TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('super_admin', 'admin', 'moderator', 'member')),
  avatar_url TEXT,
  city TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- 2. OPPORTUNITIES TABLE (Matrimonial Rishtey & Matchmaking Records)
-- ====================================================================
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

  -- AI Readiness Fields
  ai_compatibility_cache JSONB DEFAULT '{}'::jsonb,
  ai_tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for sadat_records (backward-compatibility alias & storage)
CREATE TABLE IF NOT EXISTS public.sadat_records (
  id TEXT PRIMARY KEY,
  serial_number TEXT NOT NULL,
  gender TEXT NOT NULL,
  name TEXT,
  age INTEGER,
  father_name TEXT,
  height TEXT,
  disability TEXT,
  marital_status TEXT,
  qualification TEXT,
  college TEXT,
  university TEXT,
  rank_position TEXT,
  income TEXT,
  job_nature TEXT,
  future_plans TEXT,
  religion TEXT DEFAULT 'اسلام',
  caste TEXT DEFAULT 'سید',
  maslak TEXT DEFAULT 'اہلسنت',
  house TEXT,
  house_size TEXT,
  house_location TEXT,
  other_properties TEXT,
  father_occupation TEXT,
  sisters_count INTEGER DEFAULT 0,
  brothers_count INTEGER DEFAULT 0,
  married_siblings TEXT,
  current_city TEXT NOT NULL,
  native_city TEXT,
  req_marital_status TEXT,
  req_age_range TEXT,
  req_height TEXT,
  req_city TEXT,
  req_maslak TEXT,
  req_mother_tongue TEXT,
  req_qualification TEXT,
  req_residence TEXT,
  req_other_demands TEXT,
  remarks TEXT,
  contact_number TEXT,
  status TEXT DEFAULT 'فعال',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- 3. SAVED OPPORTUNITIES TABLE (User bookmarks & favorites)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.saved_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opportunity_id TEXT NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, opportunity_id)
);

-- ====================================================================
-- 4. APPLICATIONS TABLE (Matrimonial Proposals / Inquiries submitted)
-- ====================================================================
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
-- 5. INDEXES FOR PERFORMANCE
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
-- 6. AUTOMATIC AUTH USER TRIGGER (Creates profile when user signs up)
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(
      NULLIF(new.raw_user_meta_data->>'full_name', ''), 
      split_part(COALESCE(new.email, 'user@sadat.org'), '@', 1)
    ),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(NULLIF(new.raw_user_meta_data->>'role', ''), 'member')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE 
      WHEN EXCLUDED.full_name IS NOT NULL AND EXCLUDED.full_name <> '' 
      THEN EXCLUDED.full_name 
      ELSE public.profiles.full_name 
    END,
    phone = CASE 
      WHEN EXCLUDED.phone IS NOT NULL AND EXCLUDED.phone <> '' 
      THEN EXCLUDED.phone 
      ELSE public.profiles.phone 
    END,
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger firing on every new user registration in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto update timestamp trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_opportunities_updated_at ON public.opportunities;
CREATE TRIGGER set_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_applications_updated_at ON public.applications;
CREATE TRIGGER set_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ====================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sadat_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Permissive policies so web app functions smoothly for all users
DROP POLICY IF EXISTS "Public can view basic profiles" ON public.profiles;
CREATE POLICY "Public can view basic profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert to profiles" ON public.profiles;
CREATE POLICY "Allow insert to profiles" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (true);

-- Opportunities Policies
DROP POLICY IF EXISTS "Anyone can view opportunities" ON public.opportunities;
CREATE POLICY "Anyone can view opportunities" ON public.opportunities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert opportunities" ON public.opportunities;
CREATE POLICY "Anyone can insert opportunities" ON public.opportunities FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update opportunities" ON public.opportunities;
CREATE POLICY "Anyone can update opportunities" ON public.opportunities FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete opportunities" ON public.opportunities;
CREATE POLICY "Anyone can delete opportunities" ON public.opportunities FOR DELETE USING (true);

-- sadat_records Policies
DROP POLICY IF EXISTS "Allow all on sadat_records" ON public.sadat_records;
CREATE POLICY "Allow all on sadat_records" ON public.sadat_records FOR ALL USING (true) WITH CHECK (true);

-- Saved Opportunities Policies
DROP POLICY IF EXISTS "Users can view saved opportunities" ON public.saved_opportunities;
CREATE POLICY "Users can view saved opportunities" ON public.saved_opportunities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can save opportunities" ON public.saved_opportunities;
CREATE POLICY "Users can save opportunities" ON public.saved_opportunities FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can remove saved opportunities" ON public.saved_opportunities;
CREATE POLICY "Users can remove saved opportunities" ON public.saved_opportunities FOR DELETE USING (true);

-- Applications Policies
DROP POLICY IF EXISTS "Anyone can submit applications" ON public.applications;
CREATE POLICY "Anyone can submit applications" ON public.applications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view applications" ON public.applications;
CREATE POLICY "Anyone can view applications" ON public.applications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can update applications" ON public.applications;
CREATE POLICY "Anyone can update applications" ON public.applications FOR UPDATE USING (true);

-- ====================================================================
-- 8. STORAGE BUCKET CREATION & POLICIES
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('sadat-documents', 'sadat-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Access to sadat-documents" ON storage.objects;
CREATE POLICY "Public Access to sadat-documents" ON storage.objects 
  FOR SELECT USING (bucket_id = 'sadat-documents');

DROP POLICY IF EXISTS "Upload Access to sadat-documents" ON storage.objects;
CREATE POLICY "Upload Access to sadat-documents" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'sadat-documents');

DROP POLICY IF EXISTS "Update Access to sadat-documents" ON storage.objects;
CREATE POLICY "Update Access to sadat-documents" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'sadat-documents');

-- ====================================================================
-- 9. SEED DATA (INITIAL PAKISTANI SADAAT RECORDS)
-- ====================================================================
INSERT INTO public.opportunities (
  id, serial_number, gender, name, age, father_name, height, disability, marital_status,
  qualification, college, university, rank_position, income, job_nature, future_plans,
  religion, caste, maslak, house, house_size, house_location, other_properties,
  father_occupation, sisters_count, brothers_count, married_siblings, current_city, native_city,
  req_marital_status, req_age_range, req_height, req_city, req_maslak, req_mother_tongue,
  req_qualification, req_residence, req_other_demands, remarks, contact_number, status
)
VALUES
(
  'rec-003', '003', 'لڑکی', 'سیدہ فاطمہ نقوی', 24, 'سید محمد علی نقوی', '5 فٹ 4 انچ', 'نہیں / الحمدللہ تندرست', 'غیر شادی شدہ',
  'بی ایس سی ایس (BS Computer Science)', 'پنجاب یونیورسٹی کالج آف انفارمیشن ٹیکنالوجی', 'پنجاب یونیورسٹی لاہور', 'سافٹ ویئر انجینئر', '150,000 ماہانہ', 'ملازمت (پرائیویٹ IT کمپنی)', 'مزید ایم ایس اور پروفیشنل کیریئر',
  'اسلام', 'سید (نقوی البخاری)', 'اہلسنت', 'ذاتی', '10 مرلہ', 'ڈیفنس فیز 5، لاہور', 'زرعی اراضی فیصل آباد',
  'ریٹائرڈ گورنمنٹ آفیسر (گریڈ 19)', 1, 2, 'ایک بھائی شادی شدہ', 'لاہور', 'لاہور / جھنگ',
  'غیر شادی شدہ', '25 تا 29 سال', '5 فٹ 8 انچ یا زائد', 'لاہور / اسلام آباد', 'اہلسنت', 'اردو / پنجابی',
  'کم از کم گریجویٹ / انجینئر / ڈاکٹر / معقول برسرِ روزگار', 'ذاتی رہائش ترجیح', 'بااخلاق، باکردار، دیندار اور سادات گھرانہ', 'پردہ دار اور سلیقہ مند بچی ہے', '03008658360', 'فعال'
),
(
  'rec-001', '001', 'لڑکا', 'سید عثمان حیدر کاظمی', 27, 'سید مظہر حسین کاظمی', '5 فٹ 10 انچ', 'نہیں / بالکل صحت مند', 'غیر شادی شدہ',
  'ایم بی بی ایس (MBBS) - رجسٹرڈ PMDC', 'علامہ اقبال میڈیکل کالج لاہور', 'یونیورسٹی آف ہیلتھ سائنسز لاہور', 'میڈیکل آفیسر (Medical Officer)', '180,000 ماہانہ', 'سرکاری ہسپتال + پرائیویٹ پریکٹس', 'ایف سی پی ایس (FCPS پارٹ 2 ٹریننگ جاری)',
  'اسلام', 'سید (کاظمی)', 'اہلسنت', 'ذاتی', '1 کنال کوٹھی', 'گلبرگ 3، لاہور', 'کمرشل پلازہ اور زرعی رقبہ گوجرانوالہ',
  'ڈاکٹر / کنسلٹنٹ فزیشن', 2, 1, 'دونوں بہنیں شادی شدہ ہیں', 'لاہور', 'گوجرانوالہ',
  'غیر شادی شدہ', '21 تا 25 سال', '5 فٹ 3 انچ تا 5 فٹ 6 انچ', 'لاہور / اسلام آباد / گوجرانوالہ', 'اہلسنت', 'اردو',
  'ڈاکٹر (MBBS/BDS) یا کم از کم ماسٹرز / باوقار تعلیم یافتہ', 'ہمراہ سسرال (مشترکہ خاندانی نظام)', 'خالص سادات فیملی، نماز و روزے کی پابند، باحیا سلیقہ مند', 'مذہبی و باوقار گھرانہ', '03467791264', 'فعال'
),
(
  'rec-002', '002', 'لڑکا', 'سید زین العابدین رضوی', 29, 'سید ذوالفقار رضوی مرحوم', '5 فٹ 9 انچ', 'نہیں / تندرست و توانا', 'غیر شادی شدہ',
  'چارٹرڈ اکاؤنٹنٹ (CA Qualified)', 'SKANS لا کالج و اکیڈمی', 'ICAP پاکستان', 'سینئر مینیجر آڈٹ و فنانس', '320,000 ماہانہ', 'ملٹی نیشنل فرم (MNC)', 'بیرون ملک یا پارٹنرشپ فرم',
  'اسلام', 'سید (رضوی)', 'اہلسنت', 'ذاتی', '12 مرلہ', 'بحرین ٹاؤن فیز 7، راولپنڈی', 'اسلام آباد میں 1 فلیٹ کرایہ پر دیا ہوا ہے',
  'سابقہ بینکر (مرحوم)', 1, 1, 'بہن شادی شدہ ہے، اپنے گھر خوش و خرم', 'راولپنڈی', 'چکوال',
  'غیر شادی شدہ', '23 تا 27 سال', '5 فٹ 2 انچ تا 5 فٹ 6 انچ', 'راولپنڈی / اسلام آباد / لاہور', 'اہلسنت', 'اردو / پنجابی',
  'کم از کم گریجویشن / ماسٹرز', 'ذاتی گھر میں رہائش ہوگی', 'نمازی، پردہ دار اور خاندانی رکھ رکھاؤ والی سادات لڑکی', 'صاحبِ جائیداد اور سلجھا ہوا نوجوان', '03066238755', 'فعال'
)
ON CONFLICT (id) DO NOTHING;

-- Mirror into sadat_records for full compatibility
INSERT INTO public.sadat_records 
SELECT 
  id, serial_number, gender, name, age, father_name, height, disability, marital_status,
  qualification, college, university, rank_position, income, job_nature, future_plans,
  religion, caste, maslak, house, house_size, house_location, other_properties,
  father_occupation, sisters_count, brothers_count, married_siblings, current_city, native_city,
  req_marital_status, req_age_range, req_height, req_city, req_maslak, req_mother_tongue,
  req_qualification, req_residence, req_other_demands, remarks, contact_number, status,
  created_at, updated_at
FROM public.opportunities
ON CONFLICT (id) DO NOTHING;
