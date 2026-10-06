import { SadatRecord } from './record';

export interface UserProfile {
  id: string; // references auth.users
  email: string | null;
  fullName: string;
  phone: string | null;
  role: 'super_admin' | 'admin' | 'moderator' | 'member';
  avatarUrl: string | null;
  city: string | null;
  preferences?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export type Opportunity = SadatRecord;

export interface SavedOpportunity {
  id: string;
  userId: string;
  opportunityId: string;
  notes?: string;
  createdAt: string;
  opportunity?: SadatRecord;
}

export interface Application {
  id: string;
  applicantId?: string | null;
  opportunityId: string;
  candidateSerial?: string;
  candidateName?: string;
  candidateCity?: string;
  candidatePhone?: string;
  proposalNotes: string;
  familyDetails?: string;
  status: 'زیر غور' | 'منظور شدہ' | 'رابطہ قائم' | 'مسترد' | 'طے پا گیا';
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
  opportunity?: SadatRecord;
}

export interface AiMatchRecommendation {
  candidate: SadatRecord;
  compatibilityScore: number;
  aiExplanation: string[];
  matchedDimensions: {
    maslakMatch: boolean;
    cityProximity: string;
    ageSuitability: string;
    educationAlignment: string;
    casteSyedPurity: boolean;
  };
}
