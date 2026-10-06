import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Sparkles, 
  Download, 
  ShieldCheck,
  Eye
} from 'lucide-react';
import { SadatRecord, Gender } from '../types/record';
import { parseMultipleRecordsFromText } from '../utils/whatsappHelper';
import { getNextSerialForGender } from '../utils/serialHelper';

interface TextFileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportRecords: (newRecords: SadatRecord[]) => void;
  nextSerialNumber?: string;
  existingRecords?: SadatRecord[];
}

export const TextFileUploadModal: React.FC<TextFileUploadModalProps> = ({
  isOpen,
  onClose,
  onImportRecords,
  nextSerialNumber,
  existingRecords = []
}) => {
  const [fileName, setFileName] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [parsedRecords, setParsedRecords] = useState<Partial<SadatRecord>[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processFile = (file: File) => {
    setErrorMsg('');
    if (!file) return;

    if (!file.name.endsWith('.txt') && !file.type.includes('text') && !file.name.endsWith('.doc')) {
      setErrorMsg('برائے مہربانی صرف ٹیکسٹ فائل (.txt) منتخب کریں۔');
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      setFileContent(text);
      
      const parsed = parseMultipleRecordsFromText(text, nextSerialNumber);
      if (parsed.length === 0 || Object.keys(parsed[0]).length <= 1) {
        setErrorMsg('فائل میں سے سادات کوائف نہیں مل سکے۔ برائے مہربانی درست فارمیٹ والی فائل منتخب کریں۔');
        setParsedRecords([]);
      } else {
        setParsedRecords(parsed);
      }
    };
    reader.onerror = () => {
      setErrorMsg('فائل پڑھنے میں مسئلہ پیش آیا۔ دوبارہ کوشش کریں۔');
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDownloadSampleTxt = () => {
    const sample = `*بسم اللہ الرحمن الرحیم*
سیریل نمبر، ${nextSerialNumber}
1⃣ *ذاتی معلومات*
1: جنس:لڑکی
2: نام:سیدہ فاطمہ
3: عمر:24
4: والد:سید مختار حسین
6: قد :5 فٹ 4 انچ
7: خدانخوستہ کوئی معذوری ♿:نہیں
5: ازدواجی حیثیت:غیر شادی شدہ

➖➖➖➖➖➖➖
2⃣ *تعلیم کی تفصیلات*
1: اہلیت:۔ ایم ایس سی
2: کالج:۔ گورنمنٹ کالج
3: یونیورسٹی:پنجاب یونیورسٹی لاہور
➖➖➖➖➖➖➖
3⃣ *ملازمت کی تفصیلات*
1: رینک/پوزیشن:۔ لیکچرر
2: آمدنی:۔ 55,000
3: ملازمت کی نوعیت:تعلیمی ادارہ
4: مستقبل کے منصوبے:۔ ایم فل
➖➖➖➖➖➖➖
4⃣ *مذہب کی تفصیلات*
1: مذہب: اسلام
2: کاسٹ:.سید نقوی
3: مسلک:.اہلسنت
➖➖➖➖➖➖➖
5⃣ *پراپرٹی کی تفصیلات*
1: گھر: ذاتی
2: سائز: 10 مرلہ
.3: مقام:. لاہور
4: دیگر خواص اگر کوئی ہیں:۔ کوئی نہیں
➖➖➖➖➖➖➖
6⃣ *خاندانی تفصیلات*
1: والد کا پیشہ:. سرکاری ملازم
2: بہنوں کی تعداد:2
3: بھائیوں کی تعداد:1
4: شادی شدہ: 1 بہن شادی شدہ
➖➖➖➖➖➖➖
7⃣ *پتہ*
1: موجودہ شہر:. لاہور
2: آبائی علاقہ یا شہر: اوچ شریف
➖➖➖➖➖➖➖
*ضروریات*
1: ازدواجی حیثیت: غیر شادی شدہ
2: عمر کی حد: 26 تا 30
3: قد: 5 فٹ 8 یا زائد
4: شہر: لاہور
5: مسلک: اہلسنت
6: مادری زبان:. اردو
7: اہلیت:۔ ماسٹرز / انجینئر
8: رہائش: ذاتی
9: کوئی اور مطالبہ: صوم و صلوٰۃ کے پابند سادات
10: ریمارکس اگر کچھ: نیک سیرت
11: رابطہ نمبر: 03001234567
➖➖➖➖➖➖➖
*میں اللہ تعالیٰ کے حضور گواہی دیتا ھوں/ دیتی ھوں کہ اوپر دی گئی معلومات میرے علم کے مطابق درست ھیں*
➖➖➖➖➖➖➖
*سادات کے بچوں کے رشتے خالصتاً اللہ کی رضا کے لیے کروائے جاتے ھیں، جس کا کسی قسم کا کوئی معاوضہ یا فیس نہیں ھے۔*

*ضرورت رشتہ کی پروفائل جمع کروانے، یا کسی فرد کی طرف سے کسی قسم کی فیس کا تقاضا کئے جانے صورت میں نیچے دئے گئے فون نمبرز پر رابطہ کریں۔*

*سید نذیر مختار نقوی البخاری*
*+92 303 2880555*

*سید محمد صفدر نواز نقوی ترمذی*
*0300 8658360*

*سید محمد ندیم شاہ*
*0346 7791264*

*سید عابد حسین شاہ*
*0306 6238755*

*بشکریہ iso*
*بین الاقوامی تنظیم السادات*
*INTERNATIONAL SADAT ORGANIZATION*`;

    const blob = new Blob([sample], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sadat_profile_sample_${nextSerialNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleConfirmImport = () => {
    if (parsedRecords.length === 0) return;

    let workingList: SadatRecord[] = [...existingRecords];

    const fullRecords: SadatRecord[] = parsedRecords.map((parsed, idx) => {
      const g = (parsed.gender as Gender) || 'لڑکی';
      let finalSerial = parsed.serialNumber;
      if (!finalSerial) {
        finalSerial = getNextSerialForGender(g, workingList);
      }

      const newRec: SadatRecord = {
        id: `rec-${Date.now()}-${idx}`,
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

      workingList.push(newRec);
      return newRec;
    });

    onImportRecords(fullRecords);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-emerald-800/30 overflow-hidden my-auto max-h-[92vh] flex flex-col text-right">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 to-teal-950 text-white p-5 flex items-center justify-between border-b border-amber-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-amiri text-amber-200">
                  سادات کوائف ٹیکسٹ فائل اپلوڈ (.txt File Upload)
                </h2>
                <span className="text-[10px] bg-amber-400 text-emerald-950 font-bold px-2 py-0.5 rounded-full">
                  صرف ایڈمن
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                اپنے کمپیوٹر یا موبائل سے ٹیکسٹ فائل منتخب کریں، سسٹم خودکار تمام کوائف داخل کر لے گا
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm font-arabic">
          
          {/* Admin Exclusive Badge */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                یہ سہولت خالصتاً ایڈمن کے لیے ہے تاکہ موصول شدہ ٹیکسٹ فائل ایک کلک پر ریکارڈ میں شامل ہو جائے۔
              </span>
            </div>
            <button
              onClick={handleDownloadSampleTxt}
              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg border border-emerald-300 flex items-center gap-1 transition shrink-0 mr-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>سیمپل .txt فائل</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Drag & Drop Upload Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-emerald-600 bg-emerald-50 scale-102'
                : 'border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".txt,text/plain"
              className="hidden"
            />

            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <FileText className="w-8 h-8 text-emerald-700" />
            </div>

            <h4 className="font-bold text-base text-slate-800 font-amiri mb-1">
              {fileName ? fileName : 'ٹیکسٹ فائل (.txt) یہاں ڈریگ کریں یا کلک کر کے چنیں'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              سادات فیملی کے کوائف پر مشتمل سادہ ٹیکسٹ فائل منتخب کریں۔ سسٹم فوری طور پر سیریل نمبر اور تمام فیلڈز خودکار پہچان لے گا۔
            </p>

            <button
              type="button"
              className="mt-4 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-amber-200 text-xs font-bold rounded-xl shadow-xs transition"
            >
              کمپیوٹر / موبائل سے فائل منتخب کریں
            </button>
          </div>

          {/* Parsing Results Preview */}
          {parsedRecords.length > 0 && (
            <div className="bg-emerald-50/80 border border-emerald-300 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-950 border-b border-emerald-200 pb-2">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>فائل سے اخذ کردہ سادات ریکارڈ ({parsedRecords.length})</span>
                </span>
                <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded text-[11px]">
                  دریافت شدہ
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {parsedRecords.map((r, i) => (
                  <div key={i} className="bg-white p-3 rounded-xl border border-emerald-100 text-xs flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold bg-slate-900 text-amber-300 px-2 py-0.5 rounded text-[11px]">
                          #{r.serialNumber || nextSerialNumber}
                        </span>
                        <strong className="text-slate-800">{r.name || 'سیدہ / سید'}</strong>
                        <span className="text-[11px] text-slate-500">
                          ({r.gender || 'لڑکی'} • {r.age || 24} سال • {r.currentCity || 'لاہور'})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                        <span>تعلیم: <strong>{r.qualification || '—'}</strong></span>
                        <span>•</span>
                        <span>مسلک: <strong>{r.maslak || 'اہلسنت'}</strong></span>
                        <span>•</span>
                        <span>فون: <strong className="font-mono" dir="ltr">{r.contactNumber || 'دفتر رابطہ'}</strong></span>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Text Preview Collapsible */}
          {fileContent && (
            <details className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <summary className="font-bold text-slate-700 cursor-pointer">
                اصل فائل کا متن ملاحظہ کریں ({fileContent.length} حروف)
              </summary>
              <pre className="mt-2 p-3 bg-white border border-slate-200 rounded-lg max-h-40 overflow-y-auto font-mono text-[11px] whitespace-pre-wrap text-right" dir="rtl">
                {fileContent}
              </pre>
            </details>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 bg-white hover:bg-slate-200 rounded-xl text-xs font-semibold border transition"
          >
            منسوخ کریں
          </button>

          <button
            type="button"
            disabled={parsedRecords.length === 0}
            onClick={handleConfirmImport}
            className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-300 text-amber-200 disabled:text-slate-500 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ریکارڈ روم میں داخل کریں (Add to Record Room)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
