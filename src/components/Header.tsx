import React from 'react';
import { 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  PlusCircle, 
  FileText, 
  Users, 
  Sparkles, 
  Download, 
  RotateCcw, 
  Upload, 
  Database,
  Bookmark,
  Monitor,
  Tablet,
  Smartphone
} from 'lucide-react';
import { AdminUser } from '../types/record';
import { UserProfile } from '../types/supabase';
import { DevicePreviewMode } from './DevicePreviewSwitcher';
import logoImage from '../assets/images/shoba_kafaatu_sadat_logo_1791109262101.jpg';
import { RunningTicker } from './RunningTicker';

interface HeaderProps {
  currentAdmin: AdminUser | null;
  userProfile?: UserProfile | null;
  onOpenLogin: () => void;
  onOpenAuthModal?: () => void;
  onLogout: () => void;
  onOpenNewRecord: () => void;
  onOpenWhatsAppImport: () => void;
  onOpenTextUpload: () => void;
  onOpenSupabaseStatus: () => void;
  onOpenSaved: () => void;
  savedCount: number;
  onOpenApplications: () => void;
  applicationsCount: number;
  isSupabaseReady?: boolean;
  onResetData: () => void;
  onExportJson: () => void;
  onSelectTab?: (tab: 'all' | 'male' | 'female') => void;
  previewMode?: DevicePreviewMode;
  onChangePreviewMode?: (mode: DevicePreviewMode) => void;
  stats: {
    total: number;
    male: number;
    female: number;
  };
}

export const Header: React.FC<HeaderProps> = ({
  currentAdmin,
  userProfile,
  onOpenLogin,
  onOpenAuthModal,
  onLogout,
  onOpenNewRecord,
  onOpenWhatsAppImport,
  onOpenTextUpload,
  onOpenSupabaseStatus,
  onOpenSaved,
  savedCount,
  onOpenApplications,
  applicationsCount,
  isSupabaseReady,
  onResetData,
  onExportJson,
  onSelectTab,
  previewMode = 'current',
  onChangePreviewMode,
  stats
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-800/15 shadow-sm transition">
      {/* Running Announcement Ticker */}
      <RunningTicker />

      {/* Top Bismillah strip */}
      <div className="bg-emerald-950 text-amber-200 text-center py-1 text-xs md:text-sm font-amiri font-bold tracking-wider border-b border-amber-500/20">
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ • شُعْبَةُ كَفَاءَةِ السَّادَاتِ (بین الاقوامی تنظیم السادات ISO)
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Brand & Logo */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden shadow-md border-2 border-amber-500/60 bg-emerald-900 shrink-0">
              <img 
                src={logoImage} 
                alt="شعبہ کفاءت السادات" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold font-amiri text-emerald-950">
                  شعبہ کفاءت السادات
                </h1>
                <span className="bg-amber-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                  ریکارڈ روم
                </span>
              </div>
              <p className="text-xs text-slate-500">
                مرکزی نظام برائے رشتہ سادات، تصدیق و خودکار ہم آہنگی
              </p>
            </div>
          </div>

          {/* Counts & Quick Summary - Clickable only for Admin */}
          <div className="flex items-center gap-2 text-xs">
            {currentAdmin ? (
              <>
                <button
                  type="button"
                  onClick={() => onSelectTab?.('all')}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-300 font-medium flex items-center gap-1.5 shadow-xs cursor-pointer transition active:scale-95"
                  title="ایڈمن: تمام ریکارڈ روم کھولیں"
                >
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>کل ریکارڈز: <strong className="font-bold text-sm text-emerald-950">{stats.total}</strong></span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTab?.('male')}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-800 px-3 py-1.5 rounded-xl border border-blue-300 font-medium flex items-center gap-1.5 shadow-xs cursor-pointer transition active:scale-95"
                  title="ایڈمن: حصہ مردانہ (لڑکے) کھولیں"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>مردانہ: <strong className="font-bold text-sm text-blue-950">{stats.male}</strong></span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTab?.('female')}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-800 px-3 py-1.5 rounded-xl border border-rose-300 font-medium flex items-center gap-1.5 shadow-xs cursor-pointer transition active:scale-95"
                  title="ایڈمن: حصہ مستورات (لڑکیاں) کھولیں"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>مستورات: <strong className="font-bold text-sm text-rose-950">{stats.female}</strong></span>
                </button>
              </>
            ) : (
              <>
                <div 
                  className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200/80 font-medium flex items-center gap-1.5 shadow-xs opacity-90 cursor-not-allowed"
                  title="معائنہ صرف ایڈمنز کے لیے مخصوص ہے"
                >
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>کل ریکارڈز: <strong className="font-bold text-sm text-emerald-950">{stats.total}</strong></span>
                </div>

                <div 
                  className="bg-blue-50 text-blue-800 px-3 py-1.5 rounded-xl border border-blue-200/80 font-medium flex items-center gap-1.5 shadow-xs opacity-90 cursor-not-allowed"
                  title="مردانہ ریکارڈز معائنہ صرف ایڈمنز کے لیے مخصوص ہے"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>مردانہ: <strong className="font-bold text-sm text-blue-950">{stats.male}</strong></span>
                </div>

                <div 
                  className="bg-rose-50 text-rose-800 px-3 py-1.5 rounded-xl border border-rose-200/80 font-medium flex items-center gap-1.5 shadow-xs opacity-90 cursor-not-allowed"
                  title="مستورات ریکارڈز معائنہ صرف ایڈمنز کے لیے مخصوص ہے"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>مستورات: <strong className="font-bold text-sm text-rose-950">{stats.female}</strong></span>
                </div>
              </>
            )}

            {/* Supabase status button */}
            <button
              onClick={onOpenSupabaseStatus}
              className={`px-3 py-1.5 rounded-xl border font-medium flex items-center gap-1.5 shadow-xs transition cursor-pointer text-xs ${
                isSupabaseReady
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              }`}
              title="سُپابیس لائیو ڈیٹا بیس کنکشن"
            >
              <Database className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">سُپابیس DB</span>
              <span className={`w-2 h-2 rounded-full ${isSupabaseReady ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            </button>

            {/* Saved Bookmarks button */}
            <button
              onClick={onOpenSaved}
              className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 font-medium flex items-center gap-1.5 shadow-xs transition cursor-pointer text-xs"
              title="محفوظ شدہ رشتے (Bookmarks)"
            >
              <Bookmark className="w-3.5 h-3.5 fill-rose-500" />
              <span className="hidden sm:inline">محفوظ ({savedCount})</span>
            </button>

            {/* Applications button */}
            <button
              onClick={onOpenApplications}
              className="px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 font-medium flex items-center gap-1.5 shadow-xs transition cursor-pointer text-xs"
              title="موصول شدہ رشتہ درخواستیں"
            >
              <FileText className="w-3.5 h-3.5 text-teal-700" />
              <span className="hidden sm:inline">درخواستیں</span>
              {applicationsCount > 0 && (
                <span className="font-mono text-[10px] bg-teal-200 text-teal-950 px-1.5 py-0.2 rounded-full font-bold">
                  {applicationsCount}
                </span>
              )}
            </button>

            {/* Device Screen Preview Options in Header */}
            {onChangePreviewMode && (
              <div 
                className="bg-slate-100/90 p-0.5 rounded-xl border border-slate-300 flex items-center gap-0.5 shadow-xs"
                title="اسکرین پیش منظر: موجودہ اسکرین سائز، ٹیبلٹ یا موبائل"
              >
                <button
                  type="button"
                  onClick={() => onChangePreviewMode('current')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    previewMode === 'current'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                  title="موجودہ اسکرین سائز (Current Screen Size)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">موجودہ اسکرین</span>
                </button>

                <button
                  type="button"
                  onClick={() => onChangePreviewMode('tablet')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    previewMode === 'tablet'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                  title="ٹیبلٹ اسکرین پیش منظر (Tablet 768px)"
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">ٹیبلٹ</span>
                </button>

                <button
                  type="button"
                  onClick={() => onChangePreviewMode('mobile')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    previewMode === 'mobile'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                  title="موبائل اسکرین پیش منظر (Mobile 390px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">موبائل</span>
                </button>
              </div>
            )}
          </div>

          {/* Action buttons & Admin auth */}
          <div className="flex flex-wrap items-center gap-2">
            {currentAdmin ? (
              <>
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-xl text-xs font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>ایڈمن لاگ ان: <strong>{currentAdmin.name || currentAdmin.phone}</strong></span>
                </div>

                <button
                  onClick={onOpenNewRecord}
                  className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition hover:shadow cursor-pointer active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>نیا ریکارڈ شامل کریں</span>
                </button>

                <button
                  onClick={onOpenWhatsAppImport}
                  className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm transition hover:shadow cursor-pointer active:scale-95"
                  title="واٹس ایپ میسج پیسٹ کر کے خودکار فارم پر کریں"
                >
                  <FileText className="w-4 h-4" />
                  <span>واٹس ایپ سے امپورٹ</span>
                </button>

                <button
                  onClick={onOpenTextUpload}
                  className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm transition hover:shadow cursor-pointer active:scale-95"
                  title="سادات فیملی کوائف کی ٹیکسٹ فائل (.txt) اپلوڈ کریں"
                >
                  <Upload className="w-4 h-4 text-amber-200" />
                  <span>ٹیکسٹ فائل اپلوڈ (.txt)</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={onExportJson}
                    title="ڈیٹا بیک اپ محفوظ کریں"
                    className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-slate-200 transition"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onResetData}
                    title="پہلے سے موجود سیمپل ڈیٹا بحال کریں"
                    className="p-2 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg border border-slate-200 transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={onLogout}
                  className="inline-flex items-center gap-1 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 text-xs px-2.5 py-2 rounded-xl border border-slate-300 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>لاگ آؤٹ</span>
                </button>
              </>
            ) : userProfile ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-950 px-3 py-1.5 rounded-xl text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span>خوش آمدید: <strong>{userProfile.fullName}</strong></span>
                  <span className="text-[10px] bg-emerald-200 px-1.5 py-0.2 rounded font-bold font-mono">
                    {userProfile.role}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="inline-flex items-center gap-1 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 text-xs px-2.5 py-2 rounded-xl border border-slate-300 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>لاگ آؤٹ</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenLogin}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-700 hover:to-emerald-900 text-amber-200 text-xs font-semibold px-3.5 py-2 rounded-xl shadow-md border border-amber-500/30 transition hover:shadow-lg cursor-pointer active:scale-95"
                >
                  <LogIn className="w-4 h-4 text-amber-400" />
                  <span>ایڈمن لاگ ان</span>
                </button>

                {onOpenAuthModal && (
                  <button
                    onClick={onOpenAuthModal}
                    className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-emerald-50 text-emerald-900 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 hover:border-emerald-400 transition cursor-pointer active:scale-95"
                    title="سُپابیس یوزر سائن ان یا نیا اکاؤنٹ بنائیں"
                  >
                    <span>سائن ان / رجسٹریشن</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
