import { supabase, rowToSadatRecord, sadatRecordToRow } from '../lib/supabase';
import { SadatRecord } from '../types/record';
import { SavedOpportunity, Application, AiMatchRecommendation } from '../types/supabase';
import { calculateMatches } from '../utils/matchingEngine';

/**
 * Fetch all opportunities from Supabase
 */
export async function fetchOpportunities(): Promise<{
  opportunities: SadatRecord[];
  error?: string;
}> {
  try {
    // Try opportunities table first, then fallback to sadat_records
    let { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('serial_number', { ascending: true });

    if (error) {
      const fallback = await supabase
        .from('sadat_records')
        .select('*')
        .order('serial_number', { ascending: true });

      if (fallback.error) {
        return { opportunities: [], error: fallback.error.message };
      }
      data = fallback.data;
    }

    const records = (data || []).map(rowToSadatRecord);
    return { opportunities: records };
  } catch (err: any) {
    return { opportunities: [], error: err?.message };
  }
}

/**
 * Save an opportunity to user's favorites/bookmarks
 */
export async function saveOpportunityBookmark(
  userId: string,
  opportunityId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('saved_opportunities')
      .upsert({
        user_id: userId,
        opportunity_id: opportunityId,
        notes: notes || null
      }, { onConflict: 'user_id,opportunity_id' });

    if (error) {
      // If table doesn't exist yet, store in localStorage
      const localSaved = JSON.parse(localStorage.getItem(`saved_opps_${userId}`) || '[]');
      if (!localSaved.includes(opportunityId)) {
        localSaved.push(opportunityId);
        localStorage.setItem(`saved_opps_${userId}`, JSON.stringify(localSaved));
      }
      return { success: true };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Remove an opportunity bookmark
 */
export async function removeOpportunityBookmark(
  userId: string,
  opportunityId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await supabase
      .from('saved_opportunities')
      .delete()
      .match({ user_id: userId, opportunity_id: opportunityId });

    const localSaved = JSON.parse(localStorage.getItem(`saved_opps_${userId}`) || '[]');
    const filtered = localSaved.filter((id: string) => id !== opportunityId);
    localStorage.setItem(`saved_opps_${userId}`, JSON.stringify(filtered));

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Fetch saved opportunity IDs for user
 */
export async function fetchUserSavedOpportunityIds(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('saved_opportunities')
      .select('opportunity_id')
      .eq('user_id', userId);

    if (error || !data) {
      return JSON.parse(localStorage.getItem(`saved_opps_${userId}`) || '[]');
    }

    return data.map((d: any) => d.opportunity_id);
  } catch (err) {
    return JSON.parse(localStorage.getItem(`saved_opps_${userId}`) || '[]');
  }
}

/**
 * Submit a matrimonial proposal/application
 */
export async function submitMatrimonialApplication(payload: {
  opportunityId: string;
  applicantId?: string | null;
  candidateSerial?: string;
  candidateName?: string;
  candidateCity?: string;
  candidatePhone?: string;
  proposalNotes: string;
  familyDetails?: string;
}): Promise<{ application: Application | null; error?: string }> {
  try {
    const appData = {
      opportunity_id: payload.opportunityId,
      applicant_id: payload.applicantId || null,
      candidate_serial: payload.candidateSerial || null,
      candidate_name: payload.candidateName || null,
      candidate_city: payload.candidateCity || null,
      candidate_phone: payload.candidatePhone || null,
      proposal_notes: payload.proposalNotes,
      family_details: payload.familyDetails || null,
      status: 'زیر غور'
    };

    const { data, error } = await supabase
      .from('applications')
      .insert(appData)
      .select()
      .single();

    if (error) {
      // Local fallback
      const localApps = JSON.parse(localStorage.getItem('local_applications') || '[]');
      const newApp: Application = {
        id: `app-${Date.now()}`,
        applicantId: payload.applicantId || null,
        opportunityId: payload.opportunityId,
        candidateSerial: payload.candidateSerial,
        candidateName: payload.candidateName,
        candidateCity: payload.candidateCity,
        candidatePhone: payload.candidatePhone,
        proposalNotes: payload.proposalNotes,
        familyDetails: payload.familyDetails,
        status: 'زیر غور',
        createdAt: new Date().toISOString()
      };
      localApps.unshift(newApp);
      localStorage.setItem('local_applications', JSON.stringify(localApps));
      return { application: newApp };
    }

    return {
      application: {
        id: data.id,
        applicantId: data.applicant_id,
        opportunityId: data.opportunity_id,
        candidateSerial: data.candidate_serial,
        candidateName: data.candidate_name,
        candidateCity: data.candidate_city,
        candidatePhone: data.candidate_phone,
        proposalNotes: data.proposal_notes,
        familyDetails: data.family_details,
        status: data.status,
        adminNotes: data.admin_notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    };
  } catch (err: any) {
    return { application: null, error: err?.message };
  }
}

/**
 * Fetch all applications (for Admins)
 */
export async function fetchAllApplications(): Promise<Application[]> {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return JSON.parse(localStorage.getItem('local_applications') || '[]');
    }

    return data.map((d: any) => ({
      id: d.id,
      applicantId: d.applicant_id,
      opportunityId: d.opportunity_id,
      candidateSerial: d.candidate_serial,
      candidateName: d.candidate_name,
      candidateCity: d.candidate_city,
      candidatePhone: d.candidate_phone,
      proposalNotes: d.proposal_notes,
      familyDetails: d.family_details,
      status: d.status,
      adminNotes: d.admin_notes,
      createdAt: d.created_at,
      updatedAt: d.updated_at
    }));
  } catch (err) {
    return JSON.parse(localStorage.getItem('local_applications') || '[]');
  }
}

/**
 * Update application status (for Admins)
 */
export async function updateApplicationStatus(
  id: string,
  status: 'زیر غور' | 'منظور شدہ' | 'رابطہ قائم' | 'مسترد' | 'طے پا گیا',
  adminNotes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await supabase
      .from('applications')
      .update({ status, admin_notes: adminNotes || null, updated_at: new Date().toISOString() })
      .eq('id', id);

    const localApps = JSON.parse(localStorage.getItem('local_applications') || '[]');
    const updated = localApps.map((a: Application) => a.id === id ? { ...a, status, adminNotes } : a);
    localStorage.setItem('local_applications', JSON.stringify(updated));

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Future AI Match Recommendations helper:
 * Computes deep compatibility and structure for AI LLM semantic scoring
 */
export function getAiReadyMatchRecommendations(
  target: SadatRecord,
  allCandidates: SadatRecord[]
): AiMatchRecommendation[] {
  const basicMatches = calculateMatches(target, allCandidates);

  return basicMatches.map((m) => {
    const c = m.record;
    const maslakMatch = target.maslak === c.maslak;
    const cityProximity = target.currentCity === c.currentCity ? 'ایک ہی شہر' : 'مختلف شہر';
    const ageDiff = target.gender === 'لڑکا' ? target.age - c.age : c.age - target.age;
    const ageSuitability = (ageDiff >= 1 && ageDiff <= 7) ? 'مثالی عمر مطابقت' : 'قابل قبول';

    return {
      candidate: c,
      compatibilityScore: m.score,
      aiExplanation: m.matchReasons,
      matchedDimensions: {
        maslakMatch,
        cityProximity,
        ageSuitability,
        educationAlignment: c.qualification,
        casteSyedPurity: true
      }
    };
  });
}
