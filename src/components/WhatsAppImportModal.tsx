import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle, ArrowLeft, FileText, ClipboardCopy } from 'lucide-react';
import { SadatRecord, Gender } from '../types/record';
import { parseWhatsAppText } from '../utils/whatsappHelper';
import { getNextSerialForGender } from '../utils/serialHelper';

interface WhatsAppImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportParsed: (record: SadatRecord) => void;
  nextSerialNumber?: string;
  existingRecords?: SadatRecord[];
}

export const WhatsAppImportModal: React.FC<WhatsAppImportModalProps> = ({
  isOpen,
  onClose,
  onImportParsed,
  nextSerialNumber,
  existingRecords = []
}) => {
  const [rawText, setRawText] = useState('');
  const [parsed, setParsed] = useState<Partial<SadatRecord> | null>(null);

  if (!isOpen) return null;

  const handleParse = (text: string) => {
    setRawText(text);
    if (!text.trim()) {
      setParsed(null);
      return;
    }
    const result = parseWhatsAppText(text);
    setParsed(result);
  };

  const handlePasteSample = () => {
    const sample = `*بسم اللہ الرحمن الرحیم*
سیریل نمبر، ${nextSerialNumber}
1⃣ *ذاتی معلومات*
1: جنس:لڑکی
2: نام:سیدہ (امیدوار)
3: عمر:24
4: والد:سید امجد حسین
6: قد :5 فٹ 4 انچ
7: خدانخوستہ کوئی معذوری ♿:نہیں
5: ازدواجی حیثیت:غیر شادی شدہ

➖➖➖➖➖➖➖
2⃣ *تعلیم کی تفصیلات*
1: اہلیت:۔ ایم ایس سی بائیو ٹیکنالوجی
2: کالج:۔ کنیئرڈ کالج
3: یونیورسٹی:پنجاب یونیورسٹی لاہور
➖➖➖➖➖➖➖
3⃣ *ملازمت کی تفصیلات*
1: رینک/پوزیشن:۔ ریسرچ ایسوسی ایٹ
2: آمدنی:۔ 60,000 ماہانہ
3: ملازمت کی نوعیت:سرکاری ادارہ
4: مستقبل کے منصوبے:۔ پی ایچ ڈی اسکالرشپ

➖➖➖➖➖➖➖
4⃣ *مذہب کی تفصیلات*
1: مذہب: اسلام
2: کاسٹ:.سید نقوی
3: مسلک:.اہلسنت
➖➖➖➖➖➖➖
5⃣ *پراپرٹی کی تفصیلات*
1: گھر: ذاتی
2: سائز: 10 مرلہ
.3: مقام:. جوہر ٹاؤن لاہور
4: دیگر خواص اگر کوئی ہیں:۔ کوئی نہیں
➖➖➖➖➖➖➖
6⃣ *خاندانی تفصیلات*
1: والد کا پیشہ:. سرکاری ملازم (گریڈ 19)
2: بہنوں کی تعداد:2
3: بھائیوں کی تعداد:1
4: شادی شدہ: 1 بہن شادی شدہ
➖➖➖➖➖➖➖
7⃣ *پتہ*
1: موجودہ شہر:. لاہور
2: آبائی علاقہ یا شہر: ساہیوال
➖➖➖➖➖➖➖
*ضروریات*
1: ازدواجی حیثیت: غیر شادی شدہ
2: عمر کی حد: 26 تا 30
3: قد: 5 فٹ 8 یا زائد
4: شہر: لاہور یا اسلام آباد
5: مسلک: اہلسنت
6: مادری زبان:. اردو
7: اہلیت:۔ ماسٹرز / انجینئر / سی اے
8: رہائش: ذاتی
9: کوئی اور مطالبہ: دیندار بااخلاق سادات
10: ریمارکس اگر کچھ: شریف النفس خاندان
11: رابطہ نمبر: 03001234567`;
    handleParse(sample);
  };

  const handleConfirmImport = () => {
    if (!parsed) return;

    const g = (parsed.gender as Gender) || 'لڑکی';
    const finalSerial = parsed.serialNumber || getNextSerialForGender(g, existingRecords);

    const fullRecord: SadatRecord = {
      id: `rec-${Date.now()}`,
      serialNumber: finalSerial,
      gender: g,
      name: parsed.name || (g === 'لڑکی' ? 'سیدہ' : 'سید'),
      age: Number(parsed.age) || 24,
      fatherName: parsed.fatherName || 'سید صاحب',
      height: parsed.height || '5 فٹ 4 انچ',
      disability: parsed.disability || 'نہیں',
      maritalStatus: parsed.maritalStatus || 'غیر شادی شدہ',
      qualification: parsed.qualification || 'گریجویشن',
      college: parsed.college || '',
      university: parsed.university || '',
      rankPosition: parsed.rankPosition || '',
      income: parsed.income || '',
      jobNature: parsed.jobNature || '',
      futurePlans: parsed.futurePlans || '',
      religion: parsed.religion || 'اسلام',
      caste: parsed.caste || 'سید',
      maslak: parsed.maslak || 'اہلسنت',
      house: parsed.house || 'ذاتی',
      houseSize: parsed.houseSize || '',
      houseLocation: parsed.houseLocation || '',
      otherProperties: parsed.otherProperties || '',
      fatherOccupation: parsed.fatherOccupation || '',
      sistersCount: Number(parsed.sistersCount) || 0,
      brothersCount: Number(parsed.brothersCount) || 0,
      marriedSiblings: parsed.marriedSiblings || '',
      currentCity: parsed.currentCity || 'لاہور',
      nativeCity: parsed.nativeCity || '',
      reqMaritalStatus: parsed.reqMaritalStatus || 'غیر شادی شدہ',
      reqAgeRange: parsed.reqAgeRange || '',
      reqHeight: parsed.reqHeight || '',
      reqCity: parsed.reqCity || '',
      reqMaslak: parsed.reqMaslak || 'اہلسنت',
      reqMotherTongue: parsed.reqMotherTongue || 'اردو',
      reqQualification: parsed.reqQualification || '',
      reqResidence: parsed.reqResidence || '',
      reqOtherDemands: parsed.reqOtherDemands || '',
      remarks: parsed.remarks || '',
      contactNumber: parsed.contactNumber || '',
      status: 'فعال',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onImportParsed(fullRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-emerald-800/30 overflow-hidden my-auto max-h-[92vh] flex flex-col text-right">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 to-teal-950 text-white p-5 flex items-center justify-between border-b border-amber-500/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="text-lg font-bold font-amiri text-amber-200">
                واٹس ایپ پیغام سے خودکار امپورٹ (WhatsApp Text Parser)
              </h2>
              <p className="text-xs text-emerald-200">
                واٹس ایپ پر موصول ہونے والا میسج یہاں پیسٹ کریں، سسٹم خودکار طریقے سے تمام خانے بھر دے گا
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm font-arabic">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700">
              واٹس ایپ میسج کا متن یہاں پیسٹ کریں:
            </label>
            <button
              type="button"
              onClick={handlePasteSample}
              className="text-xs text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 transition"
            >
              <ClipboardCopy className="w-3.5 h-3.5" />
              <span>نمونہ فارمیٹ پیسٹ کریں</span>
            </button>
          </div>

          <textarea
            rows={8}
            value={rawText}
            onChange={(e) => handleParse(e.target.value)}
            placeholder="بسم اللہ الرحمن الرحیم&#10;سیریل نمبر، 003&#10;1⃣ ذاتی معلومات...&#10;2: نام: سیدہ...&#10;3: عمر: 24..."
            className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl text-xs md:text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
            dir="rtl"
          />

          {/* Live Extraction Preview */}
          {parsed && (
            <div className="bg-emerald-50/70 border border-emerald-300/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900 border-b border-emerald-200 pb-2">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>خودکار طریقے سے اخذ کردہ کوائف (Auto Detected Fields):</span>
                </span>
                <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded text-[11px]">
                  سیریل: #{parsed.serialNumber || nextSerialNumber}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-slate-400 block text-[10px]">جنس:</span>
                  <strong className="text-slate-800">{parsed.gender || '—'}</strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-slate-400 block text-[10px]">نام:</span>
                  <strong className="text-slate-800">{parsed.name || '—'}</strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-slate-400 block text-[10px]">عمر:</span>
                  <strong className="text-slate-800">{parsed.age ? `${parsed.age} سال` : '—'}</strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-slate-400 block text-[10px]">شہر:</span>
                  <strong className="text-emerald-800">{parsed.currentCity || '—'}</strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-slate-400 block text-[10px]">تعلیم:</span>
                  <strong className="text-slate-800">{parsed.qualification || '—'}</strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-slate-400 block text-[10px]">ملازمت:</span>
                  <strong className="text-slate-800">{parsed.rankPosition || '—'}</strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-slate-400 block text-[10px]">مسلک:</span>
                  <strong className="text-slate-800">{parsed.maslak || '—'}</strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-slate-400 block text-[10px]">رابطہ نمبر:</span>
                  <strong className="text-slate-800 font-mono" dir="ltr">{parsed.contactNumber || '—'}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 bg-white hover:bg-slate-200 rounded-xl text-xs font-semibold border transition"
          >
            منسوخ کریں
          </button>
          <button
            type="button"
            disabled={!parsed}
            onClick={handleConfirmImport}
            className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-300 text-amber-200 disabled:text-slate-500 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-md"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ریکارڈ میں درآمد کریں (Import Record)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
