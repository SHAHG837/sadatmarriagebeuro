import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  PlusCircle, 
  Upload, 
  Trash2, 
  Edit3, 
  Eye, 
  Sparkles, 
  Phone, 
  Share2, 
  RefreshCw, 
  FileDown, 
  AlertCircle,
  Database,
  CheckCircle2,
  Users,
  Loader2,
  FileText,
  FileJson
} from 'lucide-react';
import { SadatRecord, AdminUser } from '../types/record';
import { PAKISTAN_CITIES } from '../data/initialRecords';
import { 
  exportSingleRecordToPdf, 
  exportBulkRecordsToPdf,
  exportSingleRecordToJson,
  exportBulkRecordsToJson
} from '../utils/pdfExportHelper';

interface AdminMasterRegisterViewProps {
  records: SadatRecord[];
  currentAdmin: AdminUser | null;
  onViewRecord: (record: SadatRecord) => void;
  onEditRecord: (record: SadatRecord) => void;
  onDeleteRecord: (id: string) => void;
  onOpenNewRecord: () => void;
  onOpenWhatsAppImport: () => void;
  onOpenTextUpload: () => void;
  onResetData: () => void;
  onExportJson: () => void;
  onRefreshBackend: () => void;
  onFindMatch: (record: SadatRecord) => void;
  onUpdateStatus?: (record: SadatRecord, newStatus: 'فعال' | 'زیر غور' | 'طے پا گیا') => void;
}

export const AdminMasterRegisterView: React.FC<AdminMasterRegisterViewProps> = ({
  records,
  currentAdmin,
  onViewRecord,
  onEditRecord,
  onDeleteRecord,
  onOpenNewRecord,
  onOpenWhatsAppImport,
  onOpenTextUpload,
  onResetData,
  onExportJson,
  onRefreshBackend,
  onFindMatch,
  onUpdateStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'لڑکا' | 'لڑکی'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'فعال' | 'زیر غور' | 'طے پا گیا'>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [maslakFilter, setMaslakFilter] = useState<string>('all');
  const [isExportingBulk, setIsExportingBulk] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<string>('');
  const [exportingRowId, setExportingRowId] = useState<string | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 4000);
  };

  const handleDownloadSinglePdf = async (record: SadatRecord) => {
    setExportingRowId(record.id);
    const res = await exportSingleRecordToPdf(record, true);
    setExportingRowId(null);
    if (res.success) {
      showNotice(`سیریل نمبر #${record.serialNumber} کا پی ڈی ایف (${res.filename}) ڈاؤن لوڈ ہو گیا!`);
    } else {
      showNotice(`پی ڈی ایف بنانے میں خرابی: ${res.error}`);
    }
  };

  const handleBulkPdfExport = async (category: 'female' | 'male' | 'all') => {
    if (records.length === 0) {
      showNotice('کوئی ریکارڈ موجود نہیں ہے!');
      return;
    }
    setIsExportingBulk(true);
    setBulkProgress('پی ڈی ایف کی تیاری شروع ہو رہی ہے...');
    const res = await exportBulkRecordsToPdf(records, category, true, (text) => {
      setBulkProgress(text);
    });
    setIsExportingBulk(false);
    setBulkProgress('');
    if (res.success) {
      showNotice(`بلک پی ڈی ایف (${res.count} سادات ریکارڈز) کامیابی سے ڈاؤن لوڈ ہو گئی!`);
    } else {
      showNotice(`بلک پی ڈی ایف خرابی: ${res.error}`);
    }
  };

  const handleBulkJsonExport = (category: 'female' | 'male' | 'all') => {
    if (records.length === 0) {
      showNotice('کوئی ریکارڈ موجود نہیں ہے!');
      return;
    }
    const res = exportBulkRecordsToJson(records, category);
    showNotice(`بلک جے سن فائل (${res.count} ریکارڈز) کامیابی سے ڈاؤن لوڈ ہو گئی!`);
  };

  const handleDownloadSingleJson = (record: SadatRecord) => {
    const res = exportSingleRecordToJson(record);
    showNotice(`سیریل نمبر #${record.serialNumber} کی جے سن فائل (${res.filename}) ڈاؤن لوڈ ہو گئی!`);
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (genderFilter !== 'all' && r.gender !== genderFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (cityFilter !== 'all' && r.currentCity !== cityFilter && !r.nativeCity?.includes(cityFilter)) return false;
      if (maslakFilter !== 'all' && !r.maslak?.includes(maslakFilter)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const sMatch = r.serialNumber.toLowerCase().includes(q);
        const nameMatch = r.name.toLowerCase().includes(q);
        const fatherMatch = r.fatherName?.toLowerCase().includes(q);
        const cityMatch = r.currentCity.toLowerCase().includes(q) || (r.nativeCity && r.nativeCity.toLowerCase().includes(q));
        const qualMatch = r.qualification?.toLowerCase().includes(q);
        const jobMatch = r.rankPosition?.toLowerCase().includes(q);
        const casteMatch = r.caste?.toLowerCase().includes(q);
        const maslakMatch = r.maslak?.toLowerCase().includes(q);
        const phoneMatch = r.contactNumber ? r.contactNumber.replace(/[\s\-]/g, '').includes(q.replace(/[\s\-]/g, '')) : false;
        const reqMatch = r.reqQualification?.toLowerCase().includes(q) || r.reqCity?.toLowerCase().includes(q);
        const ageMatch = r.age?.toString() === q || r.age?.toString().includes(q);
        const remarksMatch = r.remarks?.toLowerCase().includes(q);

        if (!sMatch && !nameMatch && !fatherMatch && !cityMatch && !qualMatch && !jobMatch && !casteMatch && !maslakMatch && !phoneMatch && !reqMatch && !ageMatch && !remarksMatch) {
          return false;
        }
      }

      return true;
    });
  }, [records, genderFilter, statusFilter, cityFilter, maslakFilter, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: records.length,
      boys: records.filter((r) => r.gender === 'لڑکا').length,
      girls: records.filter((r) => r.gender === 'لڑکی').length,
      active: records.filter((r) => r.status === 'فعال').length,
      underReview: records.filter((r) => r.status === 'زیر غور').length,
      settled: records.filter((r) => r.status === 'طے پا گیا').length
    };
  }, [records]);

  return (
    <div className="bg-white rounded-3xl p-5 md:p-7 shadow-sm border border-slate-200/90 mb-8 font-arabic">
      {/* Header bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-emerald-950 font-amiri">
                ایڈمن ماسٹر رجسٹر و معائنہ ڈیسک
              </h3>
              <p className="text-xs text-slate-500">
                تمام رجسٹرڈ سادات ریکارڈز کا مکمل جائزہ، لائیو تلاش، مستورات کے اصل نام اور رابطہ نمبرز
              </p>
            </div>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenNewRecord}
            className="bg-emerald-800 hover:bg-emerald-900 text-amber-200 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>نیا رشتہ اندراج</span>
          </button>

          <button
            onClick={onOpenWhatsAppImport}
            className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            title="واٹس ایپ میسج سے خودکار اندراج"
          >
            <Share2 className="w-4 h-4 text-teal-200" />
            <span>واٹس ایپ امپورٹ</span>
          </button>

          <button
            onClick={onOpenTextUpload}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            title="ٹیکسٹ فائل اپلوڈ"
          >
            <Upload className="w-3.5 h-3.5 text-amber-200" />
            <span>ٹیکسٹ فائل</span>
          </button>

          <button
            onClick={onRefreshBackend}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
            title="سُپابیس لائیو ڈیٹا ریفریش کریں"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>ریفریش</span>
          </button>

          <button
            onClick={onResetData}
            className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
            title="تمام ڈمی ڈیٹا اور عارضی ریکارڈز صاف کریں"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>ڈمی ڈیٹا ری سیٹ</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5 text-xs">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
          <span className="text-slate-500 block text-[11px]">کل اندراج شدہ:</span>
          <strong className="text-lg text-slate-900 font-bold">{stats.total}</strong>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3">
          <span className="text-blue-700 block text-[11px]">حصہ مردانہ (لڑکے):</span>
          <strong className="text-lg text-blue-950 font-bold">{stats.boys}</strong>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3">
          <span className="text-rose-700 block text-[11px]">حصہ مستورات (لڑکیاں):</span>
          <strong className="text-lg text-rose-950 font-bold">{stats.girls}</strong>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
          <span className="text-emerald-700 block text-[11px]">فعال رشتے:</span>
          <strong className="text-lg text-emerald-950 font-bold">{stats.active}</strong>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
          <span className="text-amber-700 block text-[11px]">زیر غور:</span>
          <strong className="text-lg text-amber-950 font-bold">{stats.underReview}</strong>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3">
          <span className="text-purple-700 block text-[11px]">طے پا گیا (مبارکباد):</span>
          <strong className="text-lg text-purple-950 font-bold">{stats.settled}</strong>
        </div>
      </div>

      {/* Admin PDF Export Control Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white rounded-2xl p-4 mb-5 border border-amber-400/30 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileDown className="w-5 h-5 text-amber-300" />
              <h4 className="font-bold text-sm text-amber-200 font-amiri">
                ایڈمن فائل ایکسپورٹ سینٹر (Official PDF & JSON Center)
              </h4>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              خواتین (FM سیریز) اور مرد حضرات (M سیریز) کی انفرادی و بلک پی ڈی ایف اور جے سن (JSON) فائلز ڈاؤن لوڈ کریں
            </p>
          </div>

          {/* Bulk Export Action Buttons (PDF & JSON) */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* PDF Bulk */}
            <button
              onClick={() => handleBulkPdfExport('female')}
              disabled={isExportingBulk || stats.girls === 0}
              className="bg-rose-700 hover:bg-rose-800 disabled:bg-slate-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:cursor-not-allowed active:scale-95"
              title="خواتین کے تمام ریکارڈز کی بلک پی ڈی ایف بک ڈاؤن لوڈ کریں (FM Series PDF)"
            >
              <FileText className="w-3.5 h-3.5 text-rose-200" />
              <span>خواتین PDF (FM)</span>
              <span className="bg-white/20 text-[10px] px-1.5 py-0.2 rounded-full font-mono">{stats.girls}</span>
            </button>

            <button
              onClick={() => handleBulkPdfExport('male')}
              disabled={isExportingBulk || stats.boys === 0}
              className="bg-blue-700 hover:bg-blue-800 disabled:bg-slate-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:cursor-not-allowed active:scale-95"
              title="مرد حضرات کے تمام ریکارڈز کی بلک پی ڈی ایف بک ڈاؤن لوڈ کریں (M Series PDF)"
            >
              <FileText className="w-3.5 h-3.5 text-blue-200" />
              <span>مردانہ PDF (M)</span>
              <span className="bg-white/20 text-[10px] px-1.5 py-0.2 rounded-full font-mono">{stats.boys}</span>
            </button>

            <button
              onClick={() => handleBulkPdfExport('all')}
              disabled={isExportingBulk || stats.total === 0}
              className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 text-emerald-950 disabled:text-slate-400 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:cursor-not-allowed active:scale-95"
              title="تمام سادات ریکارڈز کی مکمل ماسٹر بک پی ڈی ایف ڈاؤن لوڈ کریں"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>ماسٹر بک PDF</span>
              <span className="bg-emerald-950/20 text-[10px] px-1.5 py-0.2 rounded-full font-mono">{stats.total}</span>
            </button>

            {/* JSON Bulk */}
            <div className="h-6 w-px bg-white/20 mx-1 hidden sm:block"></div>

            <button
              onClick={() => handleBulkJsonExport('female')}
              disabled={stats.girls === 0}
              className="bg-purple-800 hover:bg-purple-900 disabled:bg-slate-700 text-amber-200 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:cursor-not-allowed active:scale-95"
              title="خواتین کے تمام ریکارڈز کی بلک JSON فائل ڈاؤن لوڈ کریں"
            >
              <FileJson className="w-3.5 h-3.5 text-purple-300" />
              <span>خواتین JSON</span>
            </button>

            <button
              onClick={() => handleBulkJsonExport('male')}
              disabled={stats.boys === 0}
              className="bg-indigo-800 hover:bg-indigo-900 disabled:bg-slate-700 text-amber-200 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:cursor-not-allowed active:scale-95"
              title="مرد حضرات کے تمام ریکارڈز کی بلک JSON فائل ڈاؤن لوڈ کریں"
            >
              <FileJson className="w-3.5 h-3.5 text-indigo-300" />
              <span>مردانہ JSON</span>
            </button>

            <button
              onClick={() => handleBulkJsonExport('all')}
              disabled={stats.total === 0}
              className="bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-700 text-amber-200 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:cursor-not-allowed active:scale-95"
              title="تمام سادات ریکارڈز کی مکمل ماسٹر JSON بیک اپ فائل ڈاؤن لوڈ کریں"
            >
              <FileJson className="w-3.5 h-3.5 text-emerald-300" />
              <span>مکمل JSON</span>
            </button>
          </div>
        </div>

        {/* Bulk Generation Progress Indicator */}
        {isExportingBulk && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between bg-black/20 p-2.5 rounded-xl">
            <div className="flex items-center gap-2 text-xs text-amber-200 font-bold">
              <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
              <span>{bulkProgress || 'پی ڈی ایف بلک فائل تیار ہو رہی ہے، برائے مہربانی انتظار فرمائیں...'}</span>
            </div>
            <span className="text-[11px] text-slate-300">A4 فارمیٹ • سادات لوگو و اردو ڈیزائن</span>
          </div>
        )}
      </div>

      {/* Temporary Notice */}
      {toastNotice && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastNotice}</span>
          </div>
          <button onClick={() => setToastNotice(null)} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* Search and Filters Toolbar */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ایڈمن جامع تلاش: سیریل نمبر، نام، فون نمبر، والد کا نام، شہر، تعلیم، ملازمت، مسلک یا ریمارکس..."
            className="w-full pr-9 pl-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Gender */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">جنس:</span>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value as any)}
              className="px-2.5 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
            >
              <option value="all">سبھی</option>
              <option value="لڑکا">لڑکے ({stats.boys})</option>
              <option value="لڑکی">لڑکیاں ({stats.girls})</option>
            </select>
          </div>

          {/* City */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">شہر:</span>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-2.5 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
            >
              <option value="all">تمام شہر</option>
              {PAKISTAN_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Maslak */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">مسلک:</span>
            <select
              value={maslakFilter}
              onChange={(e) => setMaslakFilter(e.target.value)}
              className="px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-800"
            >
              <option value="all">تمام مسالک</option>
              <option value="اہلسنت">اہلسنت</option>
              <option value="اہل تشیع">اہل تشیع</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">اسٹیٹس:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-800"
            >
              <option value="all">تمام اسٹیٹس</option>
              <option value="فعال">فعال</option>
              <option value="زیر غور">زیر غور</option>
              <option value="طے پا گیا">طے پا گیا</option>
            </select>
          </div>

          {(searchQuery || genderFilter !== 'all' || cityFilter !== 'all' || maslakFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setGenderFilter('all');
                setCityFilter('all');
                setMaslakFilter('all');
                setStatusFilter('all');
              }}
              className="text-red-600 hover:text-red-700 bg-red-50 px-2.5 py-2 rounded-xl border border-red-200 font-medium"
            >
              صاف کریں
            </button>
          )}
        </div>
      </div>

      {/* Main Records Table */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h4 className="text-base font-bold text-slate-700">کوئی ریکارڈ نہیں ملا</h4>
          <p className="mt-1">
            دیے گئے فلٹرز کے مطابق کوئی سادات ریکارڈ موجود نہیں ہے۔ نیا ریکارڈ درج کرنے کے لیے اوپر بٹن استعمال کریں۔
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-right text-xs">
            <thead className="bg-emerald-950 text-amber-200 font-bold uppercase border-b border-emerald-900">
              <tr>
                <th className="py-3 px-3">سیریل #</th>
                <th className="py-3 px-3">امیدوار کا نام</th>
                <th className="py-3 px-3">جنس</th>
                <th className="py-3 px-3">عمر و قد</th>
                <th className="py-3 px-3">شہر و آبائی</th>
                <th className="py-3 px-3">مسلک و کاسٹ</th>
                <th className="py-3 px-3">تعلیم و ادارہ</th>
                <th className="py-3 px-3">ملازمت / پیشہ</th>
                <th className="py-3 px-3">رابطہ نمبر</th>
                <th className="py-3 px-3">اسٹیٹس</th>
                <th className="py-3 px-3 text-center">کارروائی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredRecords.map((r) => {
                const isFemale = r.gender === 'لڑکی';
                const cleanPhone = r.contactNumber ? r.contactNumber.replace(/[^0-9]/g, '') : '';
                const waPhone = cleanPhone.startsWith('0') ? `92${cleanPhone.slice(1)}` : cleanPhone;

                return (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    {/* Serial */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono font-bold text-emerald-900">
                      #{r.serialNumber}
                    </td>

                    {/* Name */}
                    <td className="py-3 px-3 whitespace-nowrap font-bold text-slate-900 font-amiri text-sm">
                      <div>{r.name}</div>
                      {r.fatherName && (
                        <span className="text-[11px] text-slate-400 font-normal block">
                          ولد: {r.fatherName}
                        </span>
                      )}
                    </td>

                    {/* Gender */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        isFemale ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {r.gender}
                      </span>
                    </td>

                    {/* Age & Height */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                      <strong>{r.age} سال</strong>
                      {r.height && <span className="text-slate-400 text-[11px] block">{r.height}</span>}
                    </td>

                    {/* City */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                      <strong>{r.currentCity}</strong>
                      {r.nativeCity && r.nativeCity !== r.currentCity && (
                        <span className="text-slate-400 text-[11px] block">آبائی: {r.nativeCity}</span>
                      )}
                    </td>

                    {/* Maslak & Caste */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-bold text-emerald-800">{r.maslak}</span>
                      <span className="text-slate-400 text-[11px] block">{r.caste}</span>
                    </td>

                    {/* Qualification */}
                    <td className="py-3 px-3 text-slate-700 max-w-xs truncate" title={r.qualification}>
                      {r.qualification}
                    </td>

                    {/* Job */}
                    <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                      {r.rankPosition || '—'}
                      {r.income && <span className="text-emerald-700 text-[11px] block">آمدنی: {r.income}</span>}
                    </td>

                    {/* Contact Number */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono text-xs">
                      {r.contactNumber ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-800 font-bold">{r.contactNumber}</span>
                          <a
                            href={`https://wa.me/${waPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 p-1 bg-emerald-50 rounded-md"
                            title="واٹس ایپ پر میسج بھیجیں"
                          >
                            <Phone className="w-3 h-3" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {onUpdateStatus ? (
                        <select
                          value={r.status}
                          onChange={(e) => onUpdateStatus(r, e.target.value as any)}
                          className={`text-xs font-bold rounded-lg px-2 py-1 border focus:outline-none ${
                            r.status === 'فعال'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : r.status === 'زیر غور'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-purple-50 text-purple-800 border-purple-300'
                          }`}
                        >
                          <option value="فعال">فعال</option>
                          <option value="زیر غور">زیر غور</option>
                          <option value="طے پا گیا">طے پا گیا</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded-lg text-[11px] font-bold ${
                          r.status === 'فعال'
                            ? 'bg-emerald-50 text-emerald-800'
                            : r.status === 'زیر غور'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-purple-50 text-purple-800'
                        }`}>
                          {r.status}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onViewRecord(r)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                          title="مکمل فائل ملاحظہ کریں"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onFindMatch(r)}
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition"
                          title="خودکار رشتہ کفاءت میچنگ"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onEditRecord(r)}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition"
                          title="ترمیم کریں"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDownloadSinglePdf(r)}
                          disabled={exportingRowId === r.id}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg transition"
                          title={`پی ڈی ایف فائل ڈاؤن لوڈ کریں (#${r.serialNumber}_Sadat_Record.pdf)`}
                        >
                          {exportingRowId === r.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                          ) : (
                            <FileDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => handleDownloadSingleJson(r)}
                          className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg transition"
                          title={`جے سن فائل ڈاؤن لوڈ کریں (#${r.serialNumber}_Sadat_Record.json)`}
                        >
                          <FileJson className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteRecord(r.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition"
                          title="حذف کریں"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer bar */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
        <div>
          کل دکھائے گئے ریکارڈز: <strong>{filteredRecords.length}</strong> از <strong>{records.length}</strong>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onExportJson}
            className="text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>بیک اپ ڈاؤن لوڈ (JSON)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
