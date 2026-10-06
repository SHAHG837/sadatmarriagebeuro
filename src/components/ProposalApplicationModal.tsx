import React, { useState } from 'react';
import { 
  X, 
  Send, 
  HeartHandshake, 
  User, 
  Phone, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { SadatRecord } from '../types/record';
import { submitMatrimonialApplication } from '../services/opportunityService';
import { UserProfile } from '../types/supabase';

interface ProposalApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRecord: SadatRecord | null;
  currentUser: UserProfile | null;
  onSuccess: () => void;
}

export const ProposalApplicationModal: React.FC<ProposalApplicationModalProps> = ({
  isOpen,
  onClose,
  targetRecord,
  currentUser,
  onSuccess
}) => {
  const [candidateName, setCandidateName] = useState(currentUser?.fullName || '');
  const [candidateCity, setCandidateCity] = useState(currentUser?.city || '');
  const [candidatePhone, setCandidatePhone] = useState(currentUser?.phone || '');
  const [candidateSerial, setCandidateSerial] = useState('');
  const [proposalNotes, setProposalNotes] = useState('');
  const [familyDetails, setFamilyDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !targetRecord) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalNotes.trim()) {
      setError('برائے مہربانی رشتہ کے لیے تعارفی پیغام یا ریمارکس ضرور درج کریں۔');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await submitMatrimonialApplication({
      opportunityId: targetRecord.id,
      applicantId: currentUser?.id,
      candidateSerial,
      candidateName,
      candidateCity,
      candidatePhone,
      proposalNotes,
      familyDetails
    });

    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-emerald-800/30 overflow-hidden my-auto max-h-[92vh] flex flex-col text-right">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white p-5 flex items-center justify-between border-b border-amber-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-amber-200 font-amiri">
                رشتہ درخواست / رابطہ فارم (Match Application)
              </h3>
              <p className="text-xs text-emerald-200">
                برائے سیریل نمبر: #{targetRecord.serialNumber} ({targetRecord.gender})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-2 rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Profile Brief Strip */}
        <div className="bg-slate-50 border-b border-slate-200 p-3.5 flex items-center justify-between text-xs font-arabic shrink-0">
          <div>
            <span className="font-bold text-slate-800">
              {targetRecord.gender === 'لڑکی' ? 'سیدہ (مستورات)' : targetRecord.name}
            </span>
            <span className="text-slate-500 mr-2">
              • {targetRecord.age} سال • {targetRecord.currentCity} • {targetRecord.qualification}
            </span>
          </div>
          <span className="font-mono font-bold bg-slate-900 text-amber-300 px-2 py-0.5 rounded text-[11px]">
            #{targetRecord.serialNumber}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs font-arabic">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                امیدوار کا نام یا سرپرست:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="سید صاحب / سیدہ"
                  required
                  className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
                <User className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رابطہ فون نمبر:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={candidatePhone}
                  onChange={(e) => setCandidatePhone(e.target.value)}
                  placeholder="03001234567"
                  required
                  className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-left focus:bg-white focus:ring-2 focus:ring-emerald-600"
                  dir="ltr"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                امیدوار کا شہر:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={candidateCity}
                  onChange={(e) => setCandidateCity(e.target.value)}
                  placeholder="لاہور، اسلام آباد، کراچی، وغیرہ"
                  className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                اگر پہلے سے رجسٹرڈ ہیں (سیریل نمبر):
              </label>
              <input
                type="text"
                value={candidateSerial}
                onChange={(e) => setCandidateSerial(e.target.value)}
                placeholder="مثلاً: 001 یا 005"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-left focus:bg-white focus:ring-2 focus:ring-emerald-600"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              پیغام برائے بیورو / رشتہ کی وجوہات و تعارف:
            </label>
            <textarea
              rows={3}
              value={proposalNotes}
              onChange={(e) => setProposalNotes(e.target.value)}
              placeholder="مثلاً: ہم اس رشتے میں دلچسپی رکھتے ہیں، ہمارا تعلق سید خاندان سے ہے اور لڑکا سافٹ ویئر انجینئر ہے۔ برائے مہربانی دفتر السادات سے رابطہ کر کے بات آگے بڑھائیں۔"
              required
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              خاندانی پس منظر و دیگر کوائف (اختیاری):
            </label>
            <textarea
              rows={2}
              value={familyDetails}
              onChange={(e) => setFamilyDetails(e.target.value)}
              placeholder="تعلیم، ملازمت، آبائی علاقہ اور دیگر ضروری معلومات"
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 leading-relaxed">
            ✓ یہ درخواست براہ راست شعبہ کفاءت السادات کے ڈیٹا بیس میں جمع ہو گی اور بیورو کے مجاز ایڈمنز دونوں خاندانوں کے شایانِ شان رابطہ قائم کروائیں گے۔
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold"
            >
              منسوخ کریں
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-300 text-amber-200 rounded-xl font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'درخواست بھیجی جا رہی ہے...' : 'درخواست جمع کروائیں'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
