import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Phone, 
  ShieldCheck, 
  AlertCircle, 
  LogIn, 
  UserPlus, 
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { signInWithEmail, signUpWithEmail } from '../services/authService';
import { UserProfile } from '../types/supabase';
import { AdminUser } from '../types/record';
import logoImage from '../assets/images/shoba_kafaatu_sadat_logo_1791109262101.jpg';
import { RunningTicker } from './RunningTicker';
import { PAKISTAN_CITIES } from '../data/initialRecords';

interface LandingAuthGateProps {
  onAuthSuccess: (profile: UserProfile) => void;
  onAdminSuccess: (admin: AdminUser) => void;
}

const AUTHORIZED_ADMINS = [
  {
    phone: '03008658360',
    password: 'admin123',
    name: 'سید محمد صفدر نواز نقوی ترمذی (مین ایڈمن 1)',
    role: 'main_admin' as const
  },
  {
    phone: '03323475431',
    password: 'admin123',
    name: 'سید محمد عامر شاہ نقوی البخاری (چیئرمین آئی ٹی کونسل)',
    role: 'main_admin' as const
  },
  {
    phone: '03467791264',
    password: 'admin123',
    name: 'سید محمد ندیم شاہ (ایڈمن)',
    role: 'admin' as const
  },
  {
    phone: '03066238755',
    password: 'admin123',
    name: 'سید عابد حسین شاہ (ایڈمن)',
    role: 'admin' as const
  }
];

export const LandingAuthGate: React.FC<LandingAuthGateProps> = ({
  onAuthSuccess,
  onAdminSuccess
}) => {
  // Mode: 'signin' | 'signup' | 'admin'
  const [mode, setMode] = useState<'signin' | 'signup' | 'admin'>('signin');
  
  // Member Sign In / Sign Up fields (Strictly empty, no prefilled credentials)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('لاہور');
  const [maslak, setMaslak] = useState<'اہلسنت' | 'اہل تشیع'>('اہلسنت');
  
  // Admin Login fields (Strictly empty, no prefilled credentials)
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle standard member sign-in or sign-up
  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    if (mode === 'signin') {
      const res = await signInWithEmail(email, password);
      setLoading(false);
      if (res.error) {
        setError(res.error);
      } else if (res.profile) {
        onAuthSuccess(res.profile);
      }
    } else {
      if (!fullName.trim()) {
        setError('برائے مہربانی اپنا مکمل نام درج کریں۔');
        setLoading(false);
        return;
      }
      const res = await signUpWithEmail(email, password, fullName, phone, 'member');
      setLoading(false);
      if (res.error) {
        setError(res.error);
      } else if (res.profile) {
        if (res.requiresConfirmation) {
          setSuccessMsg('اکاؤنٹ بن گیا ہے! براہِ کرم لاگ ان کریں یا تصدیقی ای میل دیکھیں۔');
          setTimeout(() => {
            setMode('signin');
            setSuccessMsg(null);
          }, 2500);
        } else {
          setSuccessMsg('خوش آمدید! اکاؤنٹ کامیابی سے بن گیا ہے۔ پورٹل میں داخل کیا جا رہا ہے...');
          setTimeout(() => {
            if (res.profile) onAuthSuccess(res.profile);
          }, 1000);
        }
      }
    }
  };

  // Handle admin login
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = adminPhone.replace(/[\s\-\+]/g, '');
    const matched = AUTHORIZED_ADMINS.find((admin) => {
      const adminClean = admin.phone.replace(/[\s\-\+]/g, '');
      return adminClean === cleanPhone && admin.password === adminPassword;
    });

    if (matched) {
      onAdminSuccess({
        phone: matched.phone,
        name: matched.name,
        role: matched.role
      });
    } else {
      setError('ایڈمن موبائل نمبر یا پاس ورڈ درست نہیں ہے۔ برائے مہربانی درست ایڈمن تفصیلات درج کریں۔');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-arabic selection:bg-amber-400 selection:text-emerald-950 relative overflow-hidden">
      
      {/* 3D Background Lighting & Ambient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Orb 1 - Deep Emerald Velvet */}
        <div className="absolute -top-32 -right-32 w-96 h-96 md:w-[500px] md:h-[500px] rounded-full bg-emerald-600/25 blur-[120px] animate-orb-1" />
        
        {/* Orb 2 - 24k Warm Gold Aura */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 md:w-[500px] md:h-[500px] rounded-full bg-amber-500/20 blur-[130px] animate-orb-2" />
        
        {/* Center Radiant Light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-500/10 blur-[100px] rounded-full" />
        
        {/* Geometric Islamic Star Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.035] bg-repeat"
          style={{
            backgroundImage: `radial-gradient(#fbbf24 1px, transparent 1px)`,
            backgroundSize: '28px 28px'
          }}
        />
      </div>

      {/* Running Notice Ticker */}
      <div className="relative z-20">
        <RunningTicker />
      </div>

      {/* Main 3D Container with Perspective */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10 [perspective:1200px]">
        <div className="w-full max-w-lg animate-float-3d transition-transform duration-700 ease-out">
          
          {/* Brand Header with 3D Holographic Crest */}
          <div className="text-center mb-6">
            <div className="relative inline-block mb-3">
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-3xl overflow-hidden border-2 border-amber-400/90 shadow-2xl bg-emerald-900 animate-gold-glow relative z-10 transform transition duration-500 hover:scale-105 hover:rotate-2">
                <img 
                  src={logoImage} 
                  alt="شعبہ کفاءت السادات" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Subtle 3D Ring Halo */}
              <div className="absolute -inset-2 rounded-3xl border border-amber-400/30 blur-xs -z-0 pointer-events-none" />
            </div>

            <div className="text-amber-300 font-amiri text-sm tracking-widest mb-1 flex items-center justify-center gap-1.5 drop-shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            </div>

            <h1 className="text-2xl md:text-3xl font-bold font-amiri text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 drop-shadow-lg tracking-wide">
              شعبہ کفاءت السادات
            </h1>
            <p className="text-xs text-emerald-200/90 mt-1 max-w-md mx-auto drop-shadow-sm font-medium">
              بین الاقوامی تنظیم السادات (ISO) — رشتہ سادات، کفاءت و باہمی موافقت کا محفوظ پورٹل
            </p>
          </div>

          {/* 3D Glassmorphism Card */}
          <div className="backdrop-blur-2xl bg-white/92 text-slate-900 rounded-3xl shadow-[0_30px_90px_-20px_rgba(6,78,59,0.5),0_0_50px_rgba(245,158,11,0.2)] border-2 border-amber-400/50 overflow-hidden transform transition duration-300">
            
            {/* Mode Switcher: 2 Standard User Tabs at top */}
            {mode !== 'admin' ? (
              <div className="grid grid-cols-2 bg-slate-100/90 border-b border-slate-200 p-1.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`py-2.5 rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-gradient-to-r from-emerald-800 to-emerald-900 text-amber-200 shadow-md border border-amber-400/30'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>سائن ان (لاگ ان)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`py-2.5 rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-gradient-to-r from-emerald-800 to-emerald-900 text-amber-200 shadow-md border border-amber-400/30'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>نیا سادات اکاؤنٹ بنائیں</span>
                </button>
              </div>
            ) : (
              /* Admin Portal Header Bar when opened */
              <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 text-white p-4 flex items-center justify-between border-b border-amber-400/40 shadow-inner">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/60 flex items-center justify-center text-amber-300 shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-amber-200 font-amiri tracking-wide">
                      Admin Portal — شعبہ کفاءت السادات
                    </h3>
                    <p className="text-[11px] text-purple-200/80">
                      برائے مجاز انتظامیہ بین الاقوامی تنظیم السادات (ISO)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                  }}
                  className="text-xs bg-white/10 hover:bg-white/20 text-amber-200 border border-amber-400/30 px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <span>عام لاگ ان</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Error & Success Messages */}
            {error && (
              <div className="mx-6 mt-5 p-3.5 bg-red-50/90 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2.5 text-right shadow-xs animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mx-6 mt-5 p-3.5 bg-emerald-50/90 border border-emerald-300 text-emerald-900 text-xs rounded-2xl flex items-center gap-2.5 text-right shadow-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="leading-relaxed font-medium">{successMsg}</span>
              </div>
            )}

            {/* Form Content */}
            <div className="p-6 md:p-8">
              {mode === 'admin' ? (
                /* ADMIN PORTAL FORM (Completely empty inputs) */
                <form onSubmit={handleAdminSubmit} className="space-y-4 text-right">
                  <div className="bg-purple-50/90 border border-purple-200/80 rounded-2xl p-3 text-xs text-purple-950 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-purple-700 shrink-0" />
                    <span>خوش آمدید ایڈمن صاحب! برائے مہربانی اپنا تصدیق شدہ فون اور پاس ورڈ درج فرمائیں۔</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      ایڈمن موبائل نمبر:
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={adminPhone}
                        onChange={(e) => setAdminPhone(e.target.value)}
                        placeholder="اپنا ایڈمن موبائل نمبر درج کریں"
                        dir="ltr"
                        required
                        className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-purple-700 focus:outline-none text-left"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      ایڈمن سیکیورٹی پاس ورڈ:
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="اپنا پاس ورڈ درج کریں"
                        dir="ltr"
                        required
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-700 focus:outline-none text-left font-mono"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-800 via-indigo-900 to-purple-800 hover:from-purple-900 hover:to-indigo-950 text-amber-200 font-bold py-3 rounded-xl transition text-xs shadow-lg cursor-pointer active:scale-95 flex items-center justify-center gap-2 mt-2 border border-amber-400/40"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                    <span>ایڈمن پورٹل لاگ ان کریں</span>
                  </button>
                </form>
              ) : (
                /* REGULAR MEMBER SIGN IN / SIGN UP FORM (Completely empty inputs) */
                <form onSubmit={handleMemberSubmit} className="space-y-4 text-right">
                  {mode === 'signup' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          مکمل نام (امیدوار یا سرپرست): <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="اپنا مکمل نام درج کریں"
                            required
                            className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                          />
                          <User className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            موبائل / واٹس ایپ نمبر:
                          </label>
                          <div className="relative">
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="03XXXXXXXXX"
                              dir="ltr"
                              className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                            />
                            <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            مسلک:
                          </label>
                          <select
                            value={maslak}
                            onChange={(e) => setMaslak(e.target.value as any)}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none cursor-pointer"
                          >
                            <option value="اہلسنت">اہلسنت</option>
                            <option value="اہل تشیع">اہل تشیع</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          شہر:
                        </label>
                        <select
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none cursor-pointer"
                        >
                          {PAKISTAN_CITIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      ای میل ایڈریس: <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="اپنا ای میل درج کریں"
                        dir="ltr"
                        required
                        className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      پاس ورڈ: <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="کم از کم 6 حروف کا پاس ورڈ"
                        dir="ltr"
                        required
                        minLength={6}
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-900 hover:to-emerald-950 text-amber-200 font-bold py-3 rounded-xl transition text-xs shadow-lg cursor-pointer active:scale-95 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 border border-amber-400/40"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                    ) : mode === 'signin' ? (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>سائن ان کریں اور پورٹل کھولیں</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>اکاؤنٹ بنائیں اور پورٹل میں داخل ہوں</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Bottom Footer - With English "Admin Portal" hidden naturally next to (ISO) */}
            <div className="bg-slate-50/90 px-6 py-3.5 border-t border-slate-200/90 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
              <div className="flex items-center gap-1.5">
                <span>شعبہ کفاءت السادات — بین الاقوامی تنظیم السادات</span>
                
                {/* As requested: Exactly where (ISO) is written, with clickable "Admin Portal" in English */}
                <span className="font-semibold text-slate-600">
                  (ISO)
                </span>
                
                <span className="text-slate-300">•</span>
                
                {/* Subtle, English "Admin Portal" clickable trigger */}
                <button
                  type="button"
                  onClick={() => {
                    setMode('admin');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="font-mono text-[11px] text-slate-400 hover:text-purple-700 hover:font-bold tracking-tight transition cursor-pointer px-1 py-0.5 rounded hover:bg-purple-50"
                  title="ISO Admin Portal Entry"
                >
                  Admin Portal
                </button>
              </div>

              <div className="text-[10px] text-emerald-800/80 font-mono">
                SECURE 256-BIT
              </div>
            </div>
          </div>

          {/* Bureau Helpline note */}
          <div className="mt-5 text-center text-xs text-emerald-200/80 space-y-1 drop-shadow-sm">
            <p>
              کسی بھی رہنمائی یا مسئلے کی صورت میں دفتری واٹس ایپ پر رابطہ کریں:
            </p>
            <div className="font-mono text-amber-300 font-bold flex items-center justify-center gap-3 flex-wrap">
              <span>0300 8658360</span>
              <span>•</span>
              <span>0332 3475431</span>
              <span>•</span>
              <span>0306 6238755</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
