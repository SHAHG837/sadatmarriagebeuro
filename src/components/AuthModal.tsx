import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  ShieldCheck, 
  AlertCircle, 
  LogIn, 
  UserPlus, 
  CheckCircle2
} from 'lucide-react';
import { 
  signInWithEmail, 
  signUpWithEmail
} from '../services/authService';
import { UserProfile } from '../types/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (profile: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess
}) => {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'member' | 'admin'>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    if (tab === 'signin') {
      const res = await signInWithEmail(email, password);
      setLoading(false);
      if (res.error) {
        setError(res.error);
      } else if (res.profile) {
        onAuthSuccess(res.profile);
        onClose();
      }
    } else {
      if (!fullName.trim()) {
        setError('برائے مہربانی اپنا مکمل نام درج کریں۔');
        setLoading(false);
        return;
      }
      const res = await signUpWithEmail(email, password, fullName, phone, role);
      setLoading(false);
      if (res.error) {
        setError(res.error);
      } else if (res.profile) {
        if (res.requiresConfirmation) {
          setSuccessMsg('اکاؤنٹ بن گیا ہے! براہِ کرم لاگ ان کریں یا تصدیقی ای میل چیک کریں۔');
          setTimeout(() => {
            setTab('signin');
            setSuccessMsg(null);
          }, 2500);
        } else {
          setSuccessMsg('اکاؤنٹ کامیابی سے بن گیا!');
          setTimeout(() => {
            if (res.profile) onAuthSuccess(res.profile);
            onClose();
          }, 1200);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-emerald-800/30 overflow-hidden my-auto text-right">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white p-5 flex items-center justify-between border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-amber-200 font-amiri">
                {tab === 'signin' ? 'سُپابیس لاگ ان پورٹل' : 'سادات فیملی اکاؤنٹ رجسٹریشن'}
              </h3>
              <p className="text-xs text-emerald-200">
                Supabase Authentication & Row Level Security
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

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setTab('signin'); setError(null); }}
            className={`flex-1 py-3 text-center transition flex items-center justify-center gap-1.5 ${
              tab === 'signin' 
                ? 'bg-white text-emerald-900 border-b-2 border-emerald-700 shadow-xs' 
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>لاگ ان (Sign In)</span>
          </button>
          <button
            type="button"
            onClick={() => { setTab('signup'); setError(null); }}
            className={`flex-1 py-3 text-center transition flex items-center justify-center gap-1.5 ${
              tab === 'signup' 
                ? 'bg-white text-emerald-900 border-b-2 border-emerald-700 shadow-xs' 
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>نیا اکاؤنٹ بنائیں (Sign Up)</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-arabic">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {tab === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                مکمل نام (Full Name):
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثلاً: سید عاطف رضوی"
                  required
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ای میل ایڈریس:
            </label>
            <div className="relative">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={tab === 'signin' ? 'ای میل یا فون نمبر درج کریں' : 'name@example.com'}
                required
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-mono text-left"
                dir="ltr"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>
          </div>

          {tab === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رابطہ فون نمبر (موبائل):
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03XXXXXXXXX"
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-mono text-left"
                  dir="ltr"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              پاس ورڈ (Password):
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="پاس ورڈ درج کریں"
                required
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-left font-mono"
                dir="ltr"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-400 text-amber-200 font-bold py-2.5 rounded-xl shadow-md transition hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>جاری ہے...</span>
            ) : tab === 'signin' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>سُپابیس سیشن لاگ ان</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>رجسٹریشن مکمل کریں</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
