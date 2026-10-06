import React, { useState } from 'react';
import { X, Lock, Phone, ShieldCheck, AlertCircle } from 'lucide-react';
import { AdminUser } from '../types/record';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (admin: AdminUser) => void;
  onOpenSupabaseAuth?: () => void;
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

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onOpenSupabaseAuth
}) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/[\s\-\+]/g, '');
    const matched = AUTHORIZED_ADMINS.find((admin) => {
      const adminClean = admin.phone.replace(/[\s\-\+]/g, '');
      return adminClean === cleanPhone && admin.password === password;
    });

    if (matched) {
      onLoginSuccess({
        phone: matched.phone,
        name: matched.name,
        role: matched.role
      });
      onClose();
    } else {
      setError('فون نمبر یا پاس ورڈ غلط ہے۔ برائے مہربانی درست ایڈمن تفصیلات درج کریں۔');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-emerald-800/20 overflow-hidden text-right">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-emerald-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-amber-200 font-amiri">ایڈمن لاگ ان (Admin Portal)</h3>
              <p className="text-xs text-emerald-200">شعبہ کفاءت السادات کنٹرول پینل</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ایڈمن موبائل نمبر:
            </label>
            <div className="relative">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="03XXXXXXXXX"
                required
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-mono text-left"
                dir="ltr"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              پاس ورڈ (Password):
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="پاس ورڈ درج کریں"
                required
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-left font-mono"
                dir="ltr"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-amber-200 font-bold py-2.5 rounded-xl shadow-md transition hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>ڈیش بورڈ میں داخل ہوں</span>
          </button>

          {onOpenSupabaseAuth && (
            <div className="pt-3 border-t border-slate-200 text-center">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSupabaseAuth();
                }}
                className="text-xs text-emerald-800 hover:text-emerald-950 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>یا عام صارف / نیا سُپابیس اکاؤنٹ (Sign Up / Sign In) استعمال کریں</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
