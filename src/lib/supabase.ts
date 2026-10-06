import { createClient } from '@supabase/supabase-js';
import { SadatRecord } from '../types/record';
import { UserProfile, SavedOpportunity, Application } from '../types/supabase';

export const SUPABASE_URL = 
  import.meta.env.VITE_SUPABASE_URL || 'https://kctqwhekftnanwpooavq.supabase.co';

export const SUPABASE_ANON_KEY = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_d7SV271onkxWyM8es0QDjQ_IKNNQspX';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export const SUPABASE_FULL_MIGRATION_SQL = `-- ====================================================================
-- FULL DATABASE MIGRATION FOR SHOBA KAFAATU SADAT
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/kctqwhekftnanwpooavq/sql/new
-- ====================================================================

-- 1. PROFILES TABLE
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

-- 2. OPPORTUNITIES TABLE (Matrimonial Matchmaking Records)
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

  -- Career
  rank_position TEXT,
  income TEXT,
  job_nature TEXT,
  future_plans TEXT,

  -- Religion & Lineage
  religion TEXT DEFAULT 'اسلام',
  caste TEXT DEFAULT 'سید',
  maslak TEXT DEFAULT 'اہلسنت',

  -- Housing
  house TEXT DEFAULT 'ذاتی',
  house_size TEXT,
  house_location TEXT,
  other_properties TEXT,

  -- Family
  father_occupation TEXT,
  sisters_count INTEGER DEFAULT 0,
  brothers_count INTEGER DEFAULT 0,
  married_siblings TEXT,

  -- Location
  current_city TEXT NOT NULL,
  native_city TEXT,

  -- Matchmaking Requirements
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

  -- Contact details
  contact_number TEXT,
  status TEXT NOT NULL DEFAULT 'فعال' CHECK (status IN ('فعال', 'زیر غور', 'طے پا گیا', 'غیر فعال')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- AI Readiness Fields
  ai_compatibility_cache JSONB DEFAULT '{}'::jsonb,
  ai_tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create table/view alias sadat_records for full backwards compatibility
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

-- 3. SAVED OPPORTUNITIES TABLE (User bookmarks)
CREATE TABLE IF NOT EXISTS public.saved_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opportunity_id TEXT NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, opportunity_id)
);

-- 4. APPLICATIONS TABLE (Proposals submitted)
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

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_opportunities_serial ON public.opportunities(serial_number);
CREATE INDEX IF NOT EXISTS idx_opportunities_gender ON public.opportunities(gender);
CREATE INDEX IF NOT EXISTS idx_opportunities_city ON public.opportunities(current_city);
CREATE INDEX IF NOT EXISTS idx_saved_opps_user ON public.saved_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_opp ON public.applications(opportunity_id);

-- 6. AUTOMATIC AUTH USER TRIGGER (Creates profile when user signs up)
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sadat_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Permissive bureau policies for seamless web app access
DROP POLICY IF EXISTS "Allow all on profiles" ON public.profiles;
CREATE POLICY "Allow all on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on opportunities" ON public.opportunities;
CREATE POLICY "Allow all on opportunities" ON public.opportunities FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on sadat_records" ON public.sadat_records;
CREATE POLICY "Allow all on sadat_records" ON public.sadat_records FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on saved_opportunities" ON public.saved_opportunities;
CREATE POLICY "Allow all on saved_opportunities" ON public.saved_opportunities FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on applications" ON public.applications;
CREATE POLICY "Allow all on applications" ON public.applications FOR ALL USING (true) WITH CHECK (true);

-- 8. STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public)
VALUES ('sadat-documents', 'sadat-documents', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public uploads to sadat-documents" ON storage.objects;
CREATE POLICY "Allow public uploads to sadat-documents" ON storage.objects 
  FOR ALL USING (bucket_id = 'sadat-documents') WITH CHECK (bucket_id = 'sadat-documents');
`;

export const SUPABASE_SQL_SETUP = SUPABASE_FULL_MIGRATION_SQL;

/**
 * Uploads a document, image, or text file to Supabase Storage
 */
export async function uploadFileToStorage(
  file: File, 
  bucket = 'sadat-documents'
): Promise<{ publicUrl?: string; path?: string; error?: string }> {
  try {
    const fileExt = file.name.split('.').pop() || 'txt';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      return { error: error.message };
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      path: filePath,
      publicUrl: urlData?.publicUrl
    };
  } catch (err: any) {
    return { error: err?.message || 'Storage upload error' };
  }
}

/**
 * Transforms a Supabase row into a frontend SadatRecord
 */
export function rowToSadatRecord(row: any): SadatRecord {
  return {
    id: row.id,
    serialNumber: row.serial_number || '000',
    gender: row.gender,
    name: row.name || (row.gender === 'لڑکی' ? 'سیدہ' : 'سید'),
    age: row.age || 24,
    fatherName: row.father_name || 'سید صاحب',
    height: row.height || '',
    disability: row.disability || 'نہیں',
    maritalStatus: row.marital_status || 'غیر شادی شدہ',
    qualification: row.qualification || '',
    college: row.college || '',
    university: row.university || '',
    rankPosition: row.rank_position || '',
    income: row.income || '',
    jobNature: row.job_nature || '',
    futurePlans: row.future_plans || '',
    religion: row.religion || 'اسلام',
    caste: row.caste || 'سید',
    maslak: row.maslak || 'اہلسنت',
    house: row.house || 'ذاتی',
    houseSize: row.house_size || '',
    houseLocation: row.house_location || '',
    otherProperties: row.other_properties || '',
    fatherOccupation: row.father_occupation || '',
    sistersCount: row.sisters_count ?? 0,
    brothersCount: row.brothers_count ?? 0,
    marriedSiblings: row.married_siblings || '',
    currentCity: row.current_city || 'لاہور',
    nativeCity: row.native_city || '',
    reqMaritalStatus: row.req_marital_status || 'غیر شادی شدہ',
    reqAgeRange: row.req_age_range || '',
    reqHeight: row.req_height || '',
    reqCity: row.req_city || '',
    reqMaslak: row.req_maslak || 'اہلسنت',
    reqMotherTongue: row.req_mother_tongue || 'اردو',
    reqQualification: row.req_qualification || '',
    reqResidence: row.req_residence || '',
    reqOtherDemands: row.req_other_demands || '',
    remarks: row.remarks || '',
    contactNumber: row.contact_number || '',
    status: row.status || 'فعال',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString()
  };
}

/**
 * Transforms frontend SadatRecord into a Supabase row
 */
export function sadatRecordToRow(rec: SadatRecord): Record<string, any> {
  return {
    id: rec.id,
    serial_number: rec.serialNumber,
    gender: rec.gender,
    name: rec.name,
    age: rec.age,
    father_name: rec.fatherName,
    height: rec.height,
    disability: rec.disability,
    marital_status: rec.maritalStatus,
    qualification: rec.qualification,
    college: rec.college,
    university: rec.university,
    rank_position: rec.rankPosition,
    income: rec.income,
    job_nature: rec.jobNature,
    future_plans: rec.futurePlans,
    religion: rec.religion,
    caste: rec.caste,
    maslak: rec.maslak,
    house: rec.house,
    house_size: rec.houseSize,
    house_location: rec.houseLocation,
    other_properties: rec.otherProperties,
    father_occupation: rec.fatherOccupation,
    sisters_count: rec.sistersCount,
    brothers_count: rec.brothersCount,
    married_siblings: rec.marriedSiblings,
    current_city: rec.currentCity,
    native_city: rec.nativeCity,
    req_marital_status: rec.reqMaritalStatus,
    req_age_range: rec.reqAgeRange,
    req_height: rec.reqHeight,
    req_city: rec.reqCity,
    req_maslak: rec.reqMaslak,
    req_mother_tongue: rec.reqMotherTongue,
    req_qualification: rec.reqQualification,
    req_residence: rec.reqResidence,
    req_other_demands: rec.reqOtherDemands,
    remarks: rec.remarks,
    contact_number: rec.contactNumber,
    status: rec.status,
    created_at: rec.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}
