import React, { useState, useMemo } from 'react';
import { 
  X, 
  FileDown, 
  Monitor, 
  Tablet, 
  Smartphone, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  FileJson, 
  Eye, 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Printer, 
  CheckCircle, 
  Loader2,
  Users,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { SadatRecord } from '../types/record';
import { 
  buildRecordHtml, 
  buildBulkCoverHtml, 
  exportSingleRecordToPdf, 
  exportBulkRecordsToPdf,
  exportSingleRecordToJson,
  exportBulkRecordsToJson 
} from '../utils/pdfExportHelper';

export type PreviewDeviceMode = 'desktop' | 'tablet' | 'mobile';
export type ExportScope = 'single' | 'female' | 'male' | 'all';

interface PdfExportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: SadatRecord[];
  initialRecord?: SadatRecord | null;
  initialScope?: ExportScope;
}

export const PdfExportPreviewModal: React.FC<PdfExportPreviewModalProps> = ({
  isOpen,
  onClose,
  records,
  initialRecord,
  initialScope = 'single'
}) => {
  // Device simulation state
  const [deviceMode, setDeviceMode] = useState<PreviewDeviceMode>('desktop');
  
  // Scope: 'single' | 'female' | 'male' | 'all'
  const [scope, setScope] = useState<ExportScope>(initialScope);
  
  // Selected single record
  const [selectedRecordId, setSelectedRecordId] = useState<string>(() => {
    if (initialRecord) return initialRecord.id;
    if (records.length > 0) return records[0].id;
    return '';
  });

  // Current page index for multi-page bulk documents
  // Page 0: Cover page (for bulk), Page 1..N: Records
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

  // Zoom scale in desktop mode (0.6, 0.8, 1.0)
  const [zoomScale, setZoomScale] = useState<number>(0.85);

  // Admin confidential details toggle
  const [includeAdminConfidential, setIncludeAdminConfidential] = useState<boolean>(true);

  // Export progress
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered records for bulk views
  const bulkRecords = useMemo(() => {
    if (scope === 'female') {
      return records.filter((r) => r.gender === 'لڑکی').sort((a, b) => a.serialNumber.localeCompare(b.serialNumber));
    }
    if (scope === 'male') {
      return records.filter((r) => r.gender === 'لڑکا').sort((a, b) => a.serialNumber.localeCompare(b.serialNumber));
    }
    if (scope === 'all') {
      return [...records].sort((a, b) => a.serialNumber.localeCompare(b.serialNumber));
    }
    return [];
  }, [records, scope]);

  // Active single record
  const currentRecord = useMemo(() => {
    const found = records.find((r) => r.id === selectedRecordId);
    return found || records[0] || null;
  }, [records, selectedRecordId]);

  // Total pages for current view
  const totalPages = useMemo(() => {
    if (scope === 'single') return 1;
    // 1 cover page + N records
    return bulkRecords.length + 1;
  }, [scope, bulkRecords]);

  // Current page HTML
  const currentHtml = useMemo(() => {
    if (scope === 'single') {
      if (!currentRecord) return '<div style="padding: 40px; text-align: center;">کوئی ریکارڈ منتخب نہیں ہے</div>';
      return buildRecordHtml(currentRecord, includeAdminConfidential, false);
    }

    // Bulk scope
    if (currentPageIndex === 0) {
      // Cover page
      let title = 'سادات ماسٹر ریکارڈز رجسٹر (مکمل بک)';
      let typeName = 'مردانہ و مستورات یکجا';
      if (scope === 'female') {
        title = 'سادات مستورات ریکارڈز بک (FM سیریز)';
        typeName = 'صرف مستورات (FM Series)';
      } else if (scope === 'male') {
        title = 'سادات مردانہ امیدواران ریکارڈز بک (M سیریز)';
        typeName = 'صرف مرد حضرات (M Series)';
      }
      const serialRange = bulkRecords.length > 0 
        ? `${bulkRecords[0].serialNumber} تا ${bulkRecords[bulkRecords.length - 1].serialNumber}`
        : '—';
      return buildBulkCoverHtml(title, bulkRecords.length, typeName, serialRange);
    } else {
      // Record page
      const targetRecord = bulkRecords[currentPageIndex - 1];
      if (!targetRecord) return '<div style="padding: 40px; text-align: center;">صفحہ دستیاب نہیں ہے</div>';
      return buildRecordHtml(targetRecord, includeAdminConfidential, true);
    }
  }, [scope, currentRecord, currentPageIndex, bulkRecords, includeAdminConfidential]);

  if (!isOpen) return null;

  // Handle PDF Download
  const handleDownloadPdf = async () => {
    setIsExporting(true);
    setExportProgress('پی ڈی ایف کی تیاری شروع ہو رہی ہے...');

    try {
      if (scope === 'single' && currentRecord) {
        const res = await exportSingleRecordToPdf(currentRecord, includeAdminConfidential);
        if (res.success) {
          showToast(`پی ڈی ایف فائل #${currentRecord.serialNumber} ڈاؤن لوڈ ہو گئی!`);
        } else {
          showToast(`خرابی: ${res.error}`);
        }
      } else if (scope !== 'single') {
        const res = await exportBulkRecordsToPdf(
          records, 
          scope as any, 
          includeAdminConfidential, 
          (txt) => setExportProgress(txt)
        );
        if (res.success) {
          showToast(`بلک پی ڈی ایف (${res.count} ریکارڈز) کامیابی سے ڈاؤن لوڈ ہو گئی!`);
        } else {
          showToast(`خرابی: ${res.error}`);
        }
      }
    } finally {
      setIsExporting(false);
      setExportProgress('');
    }
  };

  // Handle JSON Download
  const handleDownloadJson = () => {
    if (scope === 'single' && currentRecord) {
      const res = exportSingleRecordToJson(currentRecord);
      showToast(`جے سن فائل #${currentRecord.serialNumber} ڈاؤن لوڈ ہو گئی!`);
    } else if (scope !== 'single') {
      const res = exportBulkRecordsToJson(records, scope as any);
      showToast(`بلک جے سن فائل (${res.count} ریکارڈز) ڈاؤن لوڈ ہو گئی!`);
    }
  };

  // Direct Print
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ur" dir="rtl">
      <head>
        <meta charset="utf-8">
        <title>شعبہ کفاءت السادات - پرنٹ</title>
        <style>
          @page { size: A4 portrait; margin: 0; }
          body { margin: 0; padding: 0; background: #fff; }
        </style>
      </head>
      <body>
        ${currentHtml}
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col font-arabic select-none text-slate-100 overflow-hidden">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-emerald-950 text-amber-200 border-2 border-amber-400 px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Scope Selector */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        
        {/* Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-950 border border-amber-400/60 flex items-center justify-center text-amber-300 shadow-sm">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-amber-300 font-amiri">
                دستاویز پیش منظر و ایکسپورٹ مینیجر (PDF Preview Mode)
              </h3>
              <span className="bg-emerald-900/80 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-700 font-mono">
                A4 • 100% Readable
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              ڈاؤن لوڈ سے پہلے موبائل، ٹیبلٹ اور ڈیسک ٹاپ اسکرین سائز پر دستاویز کا براہِ راست معائنہ کریں
            </p>
          </div>
        </div>

        {/* Scope Selector (Single / Female Bulk / Male Bulk / All Master) */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => {
              setScope('single');
              setCurrentPageIndex(0);
            }}
            className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
              scope === 'single'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>انفرادی فائل</span>
            {currentRecord && (
              <span className="font-mono text-[10px] bg-black/30 px-1 rounded">#{currentRecord.serialNumber}</span>
            )}
          </button>

          <button
            onClick={() => {
              setScope('female');
              setCurrentPageIndex(0);
            }}
            className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
              scope === 'female'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>خواتین بلک (FM)</span>
            <span className="font-mono text-[10px] bg-black/30 px-1 rounded">
              {records.filter((r) => r.gender === 'لڑکی').length}
            </span>
          </button>

          <button
            onClick={() => {
              setScope('male');
              setCurrentPageIndex(0);
            }}
            className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
              scope === 'male'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>مردانہ بلک (M)</span>
            <span className="font-mono text-[10px] bg-black/30 px-1 rounded">
              {records.filter((r) => r.gender === 'لڑکا').length}
            </span>
          </button>

          <button
            onClick={() => {
              setScope('all');
              setCurrentPageIndex(0);
            }}
            className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
              scope === 'all'
                ? 'bg-amber-600 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>مکمل ماسٹر رجسٹر</span>
            <span className="font-mono text-[10px] bg-black/30 px-1 rounded">{records.length}</span>
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          title="بند کریں"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Middle Simulation Toolbar: Device Switcher (Desktop, Tablet, Mobile) & Page Controls */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        
        {/* Device Mode Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold text-[11px] hidden sm:inline">
            اسکرین پیش منظر (Simulated Viewport):
          </span>
          <div className="bg-slate-900 p-0.5 rounded-xl border border-slate-700 flex items-center gap-1">
            {/* Desktop Screen */}
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                deviceMode === 'desktop'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="ڈیسک ٹاپ اسکرین سائز (Desktop / Full Viewport)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>ڈیسک ٹاپ (Desktop)</span>
            </button>

            {/* Tablet Screen */}
            <button
              onClick={() => setDeviceMode('tablet')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                deviceMode === 'tablet'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="ٹیبلٹ اسکرین پیش منظر (iPad / Tablet 768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>ٹیبلٹ (Tablet 768px)</span>
            </button>

            {/* Mobile Screen */}
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                deviceMode === 'mobile'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="موبائل اسکرین پیش منظر (Smartphone ~390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>موبائل (Mobile 390px)</span>
            </button>
          </div>
        </div>

        {/* Record Jump Selector (if Single) or Page Navigation (if Bulk) */}
        {scope === 'single' ? (
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">امیدوار منتخب کریں:</span>
            <select
              value={selectedRecordId}
              onChange={(e) => setSelectedRecordId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-amber-200 text-xs px-3 py-1.5 rounded-xl font-bold focus:outline-none focus:border-amber-400"
            >
              {records.map((r) => (
                <option key={r.id} value={r.id}>
                  #{r.serialNumber} — {r.name || 'سیدہ/سید'} ({r.gender} • {r.currentCity})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">
              صفحہ {currentPageIndex + 1} از {totalPages}
            </span>
            <div className="flex items-center gap-1 bg-slate-900 rounded-xl p-0.5 border border-slate-700">
              <button
                onClick={() => setCurrentPageIndex((p) => Math.max(0, p - 1))}
                disabled={currentPageIndex === 0}
                className="p-1 rounded-lg text-slate-300 hover:text-white disabled:text-slate-600 hover:bg-slate-800 transition cursor-pointer disabled:cursor-not-allowed"
                title="پچھلا صفحہ"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono text-xs text-amber-300 font-bold">
                {currentPageIndex === 0 ? 'ٹائٹل کور پیج' : `ریکارڈ #${bulkRecords[currentPageIndex - 1]?.serialNumber}`}
              </span>
              <button
                onClick={() => setCurrentPageIndex((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPageIndex === totalPages - 1}
                className="p-1 rounded-lg text-slate-300 hover:text-white disabled:text-slate-600 hover:bg-slate-800 transition cursor-pointer disabled:cursor-not-allowed"
                title="اگلا صفحہ"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Viewport Zoom & Admin Options */}
        <div className="flex items-center gap-2">
          {deviceMode === 'desktop' && (
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-xl border border-slate-700">
              <button
                onClick={() => setZoomScale((s) => Math.max(0.5, Number((s - 0.1).toFixed(2))))}
                className="p-1 text-slate-400 hover:text-white transition"
                title="چھوٹا کریں"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1.5 text-slate-300 font-bold">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={() => setZoomScale((s) => Math.min(1.2, Number((s + 0.1).toFixed(2))))}
                className="p-1 text-slate-400 hover:text-white transition"
                title="بڑا کریں"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer bg-slate-900 px-2 py-1 rounded-xl border border-slate-700">
            <input
              type="checkbox"
              checked={includeAdminConfidential}
              onChange={(e) => setIncludeAdminConfidential(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-0 cursor-pointer"
            />
            <span>ایڈمن رازداری شامل</span>
          </label>
        </div>
      </div>

      {/* Main Document Preview Stage */}
      <div className="flex-1 bg-slate-950/90 overflow-auto p-4 flex items-center justify-center relative overscroll-contain">
        
        {/* DESKTOP SIMULATION */}
        {deviceMode === 'desktop' && (
          <div 
            className="transition-transform duration-200 ease-out flex flex-col items-center my-auto"
            style={{ transform: `scale(${zoomScale})`, transformOrigin: 'top center' }}
          >
            <div 
              className="bg-white rounded-md shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-slate-300 overflow-hidden"
              style={{ width: '794px', height: '1123px' }}
              dangerouslySetInnerHTML={{ __html: currentHtml }}
            />
            <div className="text-[11px] text-slate-400 font-mono mt-3 text-center">
              A4 استاندارد پیپر سائز • 210 × 297 mm • 100% اصل پہلو کا تناسب (No Squash)
            </div>
          </div>
        )}

        {/* TABLET SIMULATION (~768px with realistic bezel) */}
        {deviceMode === 'tablet' && (
          <div className="w-full max-w-[768px] my-auto flex flex-col items-center">
            <div className="w-full bg-slate-900 rounded-[34px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-4 border-slate-700 ring-2 ring-amber-400/20 flex flex-col">
              
              {/* Tablet Hardware Top Bezel */}
              <div className="flex items-center justify-between px-4 py-1 text-[11px] text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-600 inline-block shadow-inner" />
                  <span>iPad / Tablet (768px)</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span>100% 🔋</span>
                  <span>📶 Wi-Fi</span>
                </div>
              </div>

              {/* Tablet Screen Content Viewport (Scrollable scaled document) */}
              <div className="w-full max-h-[72vh] overflow-y-auto bg-slate-200 rounded-[22px] p-2 flex justify-center shadow-inner border border-slate-300">
                <div 
                  className="bg-white shadow-lg origin-top"
                  style={{
                    width: '794px',
                    height: '1123px',
                    transform: 'scale(0.88)',
                    marginBottom: '-130px'
                  }}
                  dangerouslySetInnerHTML={{ __html: currentHtml }}
                />
              </div>

              {/* Tablet Home Bar */}
              <div className="flex justify-center py-2">
                <div className="w-36 h-1.5 bg-slate-600 rounded-full" />
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono mt-2 text-center">
              ٹیبلٹ پیش منظر • 768 × 1024 px ویو پورٹ • اسکرول ایبل معائنہ
            </div>
          </div>
        )}

        {/* MOBILE SIMULATION (~390px with realistic smartphone bezel) */}
        {deviceMode === 'mobile' && (
          <div className="w-full max-w-[400px] my-auto flex flex-col items-center">
            <div className="w-full bg-slate-900 rounded-[44px] p-2.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] border-4 border-slate-800 ring-2 ring-amber-400/20 flex flex-col">
              
              {/* Smartphone Dynamic Island / Notch */}
              <div className="flex items-center justify-between px-3 py-1.5 text-[11px] text-slate-400 font-mono">
                <span className="font-bold text-slate-300">9:41</span>
                <div className="w-24 h-4 bg-slate-950 rounded-full flex items-center justify-center gap-1.5 border border-slate-800 shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800" />
                </div>
                <span className="text-[10px] text-slate-400">5G • 100%</span>
              </div>

              {/* Mobile Screen Content Viewport */}
              <div className="w-full max-h-[70vh] overflow-y-auto bg-slate-200 rounded-[30px] p-1.5 flex justify-center shadow-inner border border-slate-300">
                <div 
                  className="bg-white shadow-lg origin-top"
                  style={{
                    width: '794px',
                    height: '1123px',
                    transform: 'scale(0.46)',
                    marginBottom: '-600px'
                  }}
                  dangerouslySetInnerHTML={{ __html: currentHtml }}
                />
              </div>

              {/* Smartphone Home Swipe Bar */}
              <div className="flex justify-center py-2">
                <div className="w-28 h-1.5 bg-slate-600 rounded-full" />
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono mt-2 text-center">
              موبائل اسکرین پیش منظر • 390 × 844 px ویو پورٹ • اسمارٹ فون ڈسپلے
            </div>
          </div>
        )}

      </div>

      {/* Bottom Footer Actions (Download PDF, JSON, Print, Close) */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        
        {/* Status / Scope description */}
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-slate-300">
            {scope === 'single' ? (
              <>
                فائل نام: <strong className="font-mono text-amber-300">{currentRecord?.serialNumber}_Sadat_Record.pdf</strong>
              </>
            ) : scope === 'female' ? (
              <>
                بلک خواتین بک: <strong className="font-mono text-rose-300">Sadat_Female_Records_FM_Bulk.pdf</strong> ({bulkRecords.length} صفحات)
              </>
            ) : scope === 'male' ? (
              <>
                بلک مردانہ بک: <strong className="font-mono text-blue-300">Sadat_Male_Records_M_Bulk.pdf</strong> ({bulkRecords.length} صفحات)
              </>
            ) : (
              <>
                مکمل ماسٹر رجسٹر بک: <strong className="font-mono text-amber-300">Sadat_All_Records_Master_Book.pdf</strong> ({bulkRecords.length} صفحات)
              </>
            )}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          
          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer font-bold"
            title="براہ راست پرنٹ کریں"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>پرنٹ (Print)</span>
          </button>

          {/* JSON Export */}
          <button
            onClick={handleDownloadJson}
            className="bg-purple-900/80 hover:bg-purple-800 text-purple-200 px-3 py-2 rounded-xl border border-purple-700/60 transition flex items-center gap-1.5 cursor-pointer font-bold"
            title="جے سن فائل ڈاؤن لوڈ کریں"
          >
            <FileJson className="w-4 h-4 text-purple-300" />
            <span>جے سن (JSON)</span>
          </button>

          {/* Final PDF Download Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 disabled:from-slate-700 disabled:to-slate-800 text-white font-bold px-4 py-2 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed active:scale-95"
            title="فائل کو اعلیٰ کوالٹی پی ڈی ایف میں ڈاؤن لوڈ کریں"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                <span>{exportProgress || 'پی ڈی ایف تیار ہو رہی ہے...'}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-amber-300" />
                <span>ڈاؤن لوڈ پی ڈی ایف (Download PDF)</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};
