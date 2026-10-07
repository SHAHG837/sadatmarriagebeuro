import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Printer, 
  ShieldCheck, 
  Heart, 
  Lock, 
  Check, 
  Sparkles, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Home, 
  Users, 
  Phone,
  Eye,
  AlertTriangle,
  Trash2,
  FileDown,
  Loader2,
  FileJson
} from 'lucide-react';
import { SadatRecord, AdminUser, MatchResult } from '../types/record';
import { formatWhatsAppRecord } from '../utils/whatsappHelper';
import { calculateMatches } from '../utils/matchingEngine';
import { exportSingleRecordToPdf, exportSingleRecordToJson } from '../utils/pdfExportHelper';
import logoImage from '../assets/images/shoba_kafaatu_sadat_logo_1791109262101.jpg';

interface RecordDetailModalProps {
  record: SadatRecord | null;
  allRecords: SadatRecord[];
  currentAdmin: AdminUser | null;
  onClose: () => void;
  onSelectCandidate: (candidate: SadatRecord) => void;
  onEdit?: (record: SadatRecord) => void;
  onDelete?: (id: string) => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  record,
  allRecords,
  currentAdmin,
  onClose,
  onSelectCandidate,
  onEdit,
  onDelete
}) => {
  const [copied, setCopied] = useState(false);
  const [showAdminSecret, setShowAdminSecret] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  if (!record) return null;

  const isFemale = record.gender === 'لڑکی';

  // Female privacy rules:
  // female record me sirf information ho g name.phone no nhi shamil krna.male k liye information ho g nur name b ho ga.
  const canSeeConfidential = !!currentAdmin || showAdminSecret;

  const displayName = isFemale
    ? canSeeConfidential 
      ? `${record.name} (ایڈمن منظر)` 
      : 'سیدہ (مستورات - نام صیغہ راز میں ہے)'
    : record.name;

  const displayPhone = isFemale
    ? canSeeConfidential 
      ? record.contactNumber || 'نمبر درج نہیں'
      : 'خواتین کا رابطہ نمبر صیغہ راز میں ہے (دفتر السادات سے رابطہ کریں)'
    : (record.contactNumber || 'دفتر السادات کے ذریعے');

  const matches = calculateMatches(record, allRecords).slice(0, 4);

  const handleCopyWhatsApp = () => {
    const text = formatWhatsAppRecord(record, canSeeConfidential);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-emerald-800/30 overflow-hidden my-auto max-h-[92vh] flex flex-col text-right">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-5 flex items-center justify-between border-b border-amber-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-400 bg-emerald-900 shrink-0 shadow-md">
              <img src={logoImage} alt="شعبہ کفاءت السادات" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono bg-amber-400 text-emerald-950 text-xs font-black px-2.5 py-0.5 rounded-lg">
                  سیریل نمبر: #{record.serialNumber}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  isFemale ? 'bg-rose-500/30 text-rose-200 border border-rose-400/40' : 'bg-blue-500/30 text-blue-200 border border-blue-400/40'
                }`}>
                  {record.gender}
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-bold font-amiri text-amber-200 mt-1">
                {displayName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyWhatsApp}
              className="bg-emerald-800 hover:bg-emerald-700 text-amber-200 text-xs font-semibold px-3 py-1.5 rounded-xl border border-emerald-600 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="واٹس ایپ میسج کاپی کریں"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'کاپی ہو گیا!' : 'واٹس ایپ کاپی'}</span>
            </button>

            {/* Admin File Downloads (PDF & JSON) */}
            {currentAdmin && (
              <>
                <button
                  onClick={async () => {
                    setIsExportingPdf(true);
                    await exportSingleRecordToPdf(record, true);
                    setIsExportingPdf(false);
                  }}
                  disabled={isExportingPdf}
                  className="bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title={`ایڈمن: پی ڈی ایف فائل ڈاؤن لوڈ کریں (#${record.serialNumber}_Sadat_Record.pdf)`}
                >
                  {isExportingPdf ? (
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-950" />
                  ) : (
                    <FileDown className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{isExportingPdf ? 'ڈاؤن لوڈ...' : 'پی ڈی ایف فائل'}</span>
                </button>

                <button
                  onClick={() => exportSingleRecordToJson(record)}
                  className="bg-purple-800 hover:bg-purple-700 text-amber-200 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title={`ایڈمن: جے سن فائل ڈاؤن لوڈ کریں (#${record.serialNumber}_Sadat_Record.json)`}
                >
                  <FileJson className="w-4 h-4" />
                  <span className="hidden sm:inline">JSON</span>
                </button>
              </>
            )}

            <button
              onClick={handlePrint}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition"
              title="پرنٹ کریں"
            >
              <Printer className="w-4 h-4" />
            </button>

            {currentAdmin && onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(record);
                }}
                className="bg-amber-400 text-emerald-950 hover:bg-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl transition"
              >
                ترمیم کریں
              </button>
            )}

            {currentAdmin && onDelete && (
              <button
                onClick={() => {
                  onDelete(record.id);
                }}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 shadow-xs"
                title="ریکارڈ حذف کریں"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">حذف کریں</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-2 rounded-xl hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm font-arabic">
          
          {/* Female Confidentiality Banner */}
          {isFemale && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  <strong>رازداری کی ضمانت:</strong> سادات بچیوں کے احترام و حیا کے پیش نظر نام اور رابطہ نمبر صیغہ راز میں رکھا جاتا ہے۔
                </span>
              </div>
              {currentAdmin && (
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                  مجاز ایڈمن رسائی
                </span>
              )}
            </div>
          )}

          {/* Card Layout matching user's template */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-inner">
            <div className="text-center pb-3 border-b border-slate-200 font-amiri font-bold text-emerald-900 text-base">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ • سیریل نمبر: {record.serialNumber}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              
              {/* 1⃣ ذاتی معلومات */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs space-y-2">
                <div className="font-bold text-emerald-900 border-b border-slate-100 pb-1 flex items-center gap-1.5 text-sm">
                  <span className="text-amber-600">1⃣</span>
                  <span>ذاتی معلومات</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">جنس:</span><strong className="text-slate-800">{record.gender}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">نام:</span><strong className="text-slate-800">{displayName}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">عمر:</span><strong className="text-slate-800">{record.age} سال</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">والد کا نام:</span><strong className="text-slate-800">{isFemale && !canSeeConfidential ? 'سید صاحب' : record.fatherName}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">قد:</span><strong className="text-slate-800">{record.height || 'غیر معین'}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">خدانخوستہ کوئی معذوری ♿:</span><strong className="text-emerald-700">{record.disability || 'نہیں'}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">ازدواجی حیثیت:</span><strong className="text-slate-800">{record.maritalStatus || 'غیر شادی شدہ'}</strong></div>
                </div>
              </div>

              {/* 2⃣ تعلیم کی تفصیلات */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs space-y-2">
                <div className="font-bold text-emerald-900 border-b border-slate-100 pb-1 flex items-center gap-1.5 text-sm">
                  <span className="text-blue-600">2⃣</span>
                  <span>تعلیم کی تفصیلات</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">اہلیت (ڈگری):</span><strong className="text-slate-800">{record.qualification || 'غیر معین'}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">کالج:</span><strong className="text-slate-800">{record.college || '—'}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">یونیورسٹی:</span><strong className="text-slate-800">{record.university || '—'}</strong></div>
                </div>
              </div>

              {/* 3⃣ ملازمت کی تفصیلات */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs space-y-2">
                <div className="font-bold text-emerald-900 border-b border-slate-100 pb-1 flex items-center gap-1.5 text-sm">
                  <span className="text-amber-600">3⃣</span>
                  <span>ملازمت و کیریئر</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">رینک/پوزیشن:</span><strong className="text-slate-800">{record.rankPosition || '—'}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">آمدنی:</span><strong className="text-emerald-700 font-mono">{record.income || '—'}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">ملازمت کی نوعیت:</span><strong className="text-slate-800">{record.jobNature || '—'}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">مستقبل کے منصوبے:</span><strong className="text-slate-800">{record.futurePlans || '—'}</strong></div>
                </div>
              </div>

              {/* 4⃣ مذہب کی تفصیلات */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs space-y-2">
                <div className="font-bold text-emerald-900 border-b border-slate-100 pb-1 flex items-center gap-1.5 text-sm">
                  <span className="text-emerald-600">4⃣</span>
                  <span>مذہب و سادات شجرہ</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">مذہب:</span><strong className="text-slate-800">{record.religion || 'اسلام'}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">کاسٹ (شجرہ):</span><strong className="text-amber-700">{record.caste || 'سید'}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">مسلک:</span><strong className="text-emerald-800">{record.maslak || 'اہلسنت'}</strong></div>
                </div>
              </div>

              {/* 5⃣ پراپرٹی کی تفصیلات */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs space-y-2">
                <div className="font-bold text-emerald-900 border-b border-slate-100 pb-1 flex items-center gap-1.5 text-sm">
                  <span className="text-indigo-600">5⃣</span>
                  <span>پراپرٹی کی تفصیلات</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">گھر:</span><strong className="text-slate-800">{record.house || 'ذاتی'}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">سائز:</span><strong className="text-slate-800">{record.houseSize || '—'}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">مقام:</span><strong className="text-slate-800">{record.houseLocation || '—'}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">دیگر خواص:</span><strong className="text-slate-800">{record.otherProperties || 'کوئی نہیں'}</strong></div>
                </div>
              </div>

              {/* 6⃣ خاندانی تفصیلات */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs space-y-2">
                <div className="font-bold text-emerald-900 border-b border-slate-100 pb-1 flex items-center gap-1.5 text-sm">
                  <span className="text-teal-600">6⃣</span>
                  <span>خاندانی تفصیلات</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">والد کا پیشہ:</span><strong className="text-slate-800">{record.fatherOccupation || '—'}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">بہنوں کی تعداد:</span><strong className="text-slate-800">{record.sistersCount ?? 0}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">بھائیوں کی تعداد:</span><strong className="text-slate-800">{record.brothersCount ?? 0}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">شادی شدہ:</span><strong className="text-slate-800">{record.marriedSiblings || '—'}</strong></div>
                </div>
              </div>
            </div>

            {/* 7⃣ پتہ */}
            <div className="mt-4 bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
              <div className="font-bold text-emerald-900 border-b border-slate-100 pb-1 mb-2 text-sm flex items-center gap-1.5">
                <span className="text-purple-600">7⃣</span>
                <span>پتہ و سکونت</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">موجودہ شہر:</span><strong className="text-slate-900 font-bold">{record.currentCity}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">آبائی علاقہ یا شہر:</span><strong className="text-slate-800">{record.nativeCity || '—'}</strong></div>
              </div>
            </div>

            {/* ضروریات برائے رشتہ (Requirements) */}
            <div className="mt-4 bg-emerald-900/5 border border-emerald-700/20 p-4 rounded-xl">
              <div className="font-bold text-emerald-950 border-b border-emerald-800/10 pb-2 mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm">
                  <Heart className="w-4 h-4 text-rose-600 fill-rose-100" />
                  <span>ضروریات برائے رشتہ (Requirements & Preferences)</span>
                </span>
                <span className="text-xs text-slate-500">ترجیحات برائے کفاءت</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-slate-400 block text-[11px]">1: ازدواجی حیثیت:</span>
                  <strong className="text-slate-800">{record.reqMaritalStatus || 'غیر شادی شدہ'}</strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-slate-400 block text-[11px]">2: عمر کی حد:</span>
                  <strong className="text-slate-800">{record.reqAgeRange || 'مناسب'}</strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-slate-400 block text-[11px]">3: قد:</span>
                  <strong className="text-slate-800">{record.reqHeight || 'مناسب'}</strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-slate-400 block text-[11px]">4: مطلوبہ شہر:</span>
                  <strong className="text-emerald-800">{record.reqCity || 'کوئی بھی بڑا شہر'}</strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-slate-400 block text-[11px]">5: مسلک:</span>
                  <strong className="text-slate-800">{record.reqMaslak || 'اہلسنت'}</strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-slate-400 block text-[11px]">6: مادری زبان:</span>
                  <strong className="text-slate-800">{record.reqMotherTongue || 'اردو'}</strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 md:col-span-2">
                  <span className="text-slate-400 block text-[11px]">7: اہلیت (تعلیم / کیریئر):</span>
                  <strong className="text-slate-800">{record.reqQualification || 'تعلیم یافتہ'}</strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-slate-400 block text-[11px]">8: رہائش:</span>
                  <strong className="text-slate-800">{record.reqResidence || 'ذاتی گھر'}</strong>
                </div>
              </div>

              {(record.reqOtherDemands || record.remarks) && (
                <div className="mt-3 bg-white p-3 rounded-lg border border-slate-200/80 text-xs space-y-1">
                  {record.reqOtherDemands && (
                    <div><span className="text-slate-400 font-semibold">کوئی اور مطالبہ: </span><span>{record.reqOtherDemands}</span></div>
                  )}
                  {record.remarks && (
                    <div><span className="text-slate-400 font-semibold">ریمارکس: </span><span className="text-slate-700">{record.remarks}</span></div>
                  )}
                </div>
              )}

              {/* Contact Number Display */}
              <div className="mt-3 bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-700" />
                  <span className="text-slate-500 font-semibold">11: رابطہ نمبر:</span>
                  <strong className="font-mono text-emerald-950 text-sm" dir="ltr">
                    {displayPhone}
                  </strong>
                </div>
                {isFemale && !currentAdmin && (
                  <span className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                    صرف دفتر السادات کے مجاز ایڈمنز سے تصدیق کر سکتے ہیں
                  </span>
                )}
              </div>
            </div>

            {/* Official Bureau Solemn Declaration */}
            <div className="mt-5 text-[11px] text-slate-500 leading-relaxed border-t border-slate-200 pt-3 text-center space-y-1">
              <p className="font-semibold text-slate-700">
                *میں اللہ تعالیٰ کے حضور گواہی دیتا ھوں/ دیتی ھوں کہ اوپر دی گئی معلومات میرے علم کے مطابق درست ھیں*
              </p>
              <p className="text-emerald-900">
                *سادات کے بچوں کے رشتے خالصتاً اللہ کی رضا کے لیے کروائے جاتے ھیں، جس کا کسی قسم کا کوئی معاوضہ یا فیس نہیں ھے۔*
              </p>
              <p className="text-slate-600">
                ضرورت رشتہ کی پروفائل جمع کروانے، یا کسی فرد کی طرف سے کسی قسم کی فیس کا تقاضا کئے جانے کی صورت میں نیچے دئے گئے فون نمبرز پر رابطہ کریں۔
              </p>
              <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono font-bold text-slate-800 max-w-xl mx-auto">
                <div className="bg-slate-100/80 p-1.5 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span className="font-arabic font-normal text-slate-700">سید نذیر مختار نقوی البخاری:</span>
                  <span className="text-emerald-800" dir="ltr">+92 303 2880555</span>
                </div>
                <div className="bg-slate-100/80 p-1.5 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span className="font-arabic font-normal text-slate-700">سید محمد صفدر نواز نقوی ترمذی:</span>
                  <span className="text-emerald-800" dir="ltr">0300 8658360</span>
                </div>
                <div className="bg-slate-100/80 p-1.5 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span className="font-arabic font-normal text-slate-700">سید محمد ندیم شاہ:</span>
                  <span className="text-emerald-800" dir="ltr">0346 7791264</span>
                </div>
                <div className="bg-slate-100/80 p-1.5 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span className="font-arabic font-normal text-slate-700">سید عابد حسین شاہ:</span>
                  <span className="text-emerald-800" dir="ltr">0306 6238755</span>
                </div>
              </div>
              <div className="text-[10px] text-amber-700 font-bold uppercase tracking-wider pt-1">
                بشکریہ ISO - بین الاقوامی تنظیم السادات (INTERNATIONAL SADAT ORGANIZATION)
              </div>
            </div>
          </div>

          {/* Compatible Matches Section */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base text-emerald-950 font-amiri">
                  اس پروفائل کے لیے خودکار ہم آہنگ رشتے (Compatible Match Recommendations)
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                مخالف جنس کے سادات ریکارڈز سے جانچ پڑتال
              </span>
            </div>

            {matches.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-2xl text-slate-400 text-xs">
                فی الوقت اس کیٹیگری میں کوئی ہم آہنگ مخالف ریکارڈ دستیاب نہیں ہے۔
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {matches.map((match) => (
                  <div
                    key={match.record.id}
                    onClick={() => onSelectCandidate(match.record)}
                    className="p-3.5 bg-gradient-to-br from-white to-emerald-50/40 rounded-xl border border-emerald-900/15 hover:border-emerald-600 shadow-xs hover:shadow-md cursor-pointer transition group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-slate-900 text-amber-300 px-2 py-0.5 rounded">
                          #{match.record.serialNumber}
                        </span>
                        <span className="font-bold text-xs text-slate-800 group-hover:text-emerald-800 transition">
                          {match.record.gender === 'لڑکی' ? 'سیدہ (مستورات)' : match.record.name}
                        </span>
                      </div>
                      <span className="bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        {match.score}% مطابقت
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex items-center gap-3">
                        <span>عمر: <strong>{match.record.age} سال</strong></span>
                        <span>شہر: <strong>{match.record.currentCity}</strong></span>
                        <span>تعلیم: <strong>{match.record.qualification}</strong></span>
                      </div>
                      <div className="text-[11px] text-emerald-800 line-clamp-1 bg-emerald-100/60 px-2 py-1 rounded">
                        ✓ {match.matchReasons.slice(0, 2).join(' • ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <div className="text-xs text-slate-500">
            فائل کی تیاری بتاریخ: {new Date(record.createdAt).toLocaleDateString('ur-PK')}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyWhatsApp}
              className="bg-emerald-800 hover:bg-emerald-900 text-amber-200 text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>{copied ? 'واٹس ایپ متن کاپی ہو گیا!' : 'واٹس ایپ فارمیٹ کاپی کریں'}</span>
            </button>
            <button
              onClick={onClose}
              className="bg-white hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-300 transition cursor-pointer"
            >
              بند کریں
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
