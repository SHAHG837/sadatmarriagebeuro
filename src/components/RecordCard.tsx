import React, { useState } from 'react';
import { 
  SadatRecord, 
  AdminUser 
} from '../types/record';
import { 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Share2, 
  Eye, 
  Check, 
  Edit3, 
  Trash2, 
  Lock, 
  UserCheck, 
  Heart,
  Calendar,
  Sparkles,
  Bookmark,
  Send,
  FileDown,
  Loader2,
  FileJson
} from 'lucide-react';
import { formatWhatsAppRecord } from '../utils/whatsappHelper';
import { exportSingleRecordToPdf, exportSingleRecordToJson } from '../utils/pdfExportHelper';
import { PdfExportPreviewModal } from './PdfExportPreviewModal';

interface RecordCardProps {
  record: SadatRecord;
  currentAdmin: AdminUser | null;
  onViewDetails: (record: SadatRecord) => void;
  onEdit?: (record: SadatRecord) => void;
  onDelete?: (id: string) => void;
  onFindMatch?: (record: SadatRecord) => void;
  isSaved?: boolean;
  onToggleSave?: (record: SadatRecord) => void;
  onApplyProposal?: (record: SadatRecord) => void;
}

export const RecordCard: React.FC<RecordCardProps> = ({
  record,
  currentAdmin,
  onViewDetails,
  onEdit,
  onDelete,
  onFindMatch,
  isSaved,
  onToggleSave,
  onApplyProposal
}) => {
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isPreviewPdfOpen, setIsPreviewPdfOpen] = useState(false);
  const isFemale = record.gender === 'لڑکی';

  // Privacy rule:
  // female record me sirf information ho g name.phone no nhi shamil krna.
  // male k liye information ho g nur name b ho ga.
  const displayName = isFemale
    ? currentAdmin 
      ? `${record.name} (خفیہ ایڈمن منظر)` 
      : 'سیدہ (مستورات - نام صیغہ راز میں ہے)'
    : record.name;

  const handleCopyWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = formatWhatsAppRecord(record, !!currentAdmin);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      onClick={() => onViewDetails(record)}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200/80 hover:border-emerald-600/40 overflow-hidden flex flex-col justify-between cursor-pointer group relative"
    >
      {/* Top Banner Stripe */}
      <div className={`h-2 w-full ${isFemale ? 'bg-gradient-to-r from-rose-500 via-pink-400 to-amber-300' : 'bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-500'}`} />

      <div className="p-5">
        {/* Serial, Gender & Status Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm bg-slate-900 text-amber-300 px-3 py-1 rounded-xl shadow-xs">
              #{record.serialNumber}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              isFemale 
                ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {record.gender}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {onToggleSave && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(record);
                }}
                title={isSaved ? 'محفوظ فہرست سے نکالیں' : 'رشتہ محفوظ کریں (Bookmark)'}
                className={`p-1.5 rounded-lg border transition ${
                  isSaved 
                    ? 'bg-rose-50 text-rose-600 border-rose-200' 
                    : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500' : ''}`} />
              </button>
            )}

            <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
              record.status === 'طے پا گیا'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {record.status}
            </span>
          </div>
        </div>

        {/* Name & Identity */}
        <div className="mb-3">
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-base md:text-lg text-slate-900 font-amiri group-hover:text-emerald-800 transition">
              {displayName}
            </h4>
            {isFemale && (
              <span title="خواتین کا نام و رابطہ صیغہ راز میں ہے" className="text-rose-500">
                <Lock className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              عمر: <strong>{record.age} سال</strong>
            </span>
            <span>•</span>
            <span>قد: <strong>{record.height || 'معمول'}</strong></span>
            <span>•</span>
            <span className="text-emerald-700 font-medium">{record.maritalStatus}</span>
          </div>
        </div>

        {/* Key Info Grid */}
        <div className="space-y-2 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100 mb-3">
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <span>موجودہ شہر: <strong className="text-slate-800 font-bold">{record.currentCity}</strong></span>
              {record.nativeCity && (
                <span className="text-slate-400 mr-1.5">(آبائی: {record.nativeCity})</span>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2">
            <GraduationCap className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
            <span className="truncate">
              تعلیم: <strong className="text-slate-800">{record.qualification}</strong>
            </span>
          </div>

          <div className="flex items-start gap-2">
            <Briefcase className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
            <span className="truncate">
              ملازمت: <strong className="text-slate-800">{record.rankPosition || 'زیر تعلیم / گھریلو'}</strong>
              {record.income && <span className="text-emerald-700 mr-1 font-mono">({record.income})</span>}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
            <span className="bg-emerald-100/70 text-emerald-800 px-2 py-0.5 rounded font-medium">
              مسلک: {record.maslak || 'اہلسنت'}
            </span>
            <span className="bg-amber-100/70 text-amber-800 px-2 py-0.5 rounded font-medium">
              شجرہ: {record.caste || 'سید'}
            </span>
          </div>
        </div>

        {/* Requirements Snippet */}
        <div className="text-[11px] text-slate-500 bg-emerald-950/5 p-2 rounded-lg line-clamp-2 mb-3">
          <span className="font-semibold text-emerald-900">مطلوبہ رشتہ: </span>
          {record.reqQualification || record.reqAgeRange ? (
            <span>
              عمر {record.reqAgeRange || 'مناسب'}، مطلوبہ شہر {record.reqCity || 'کھلا'}، اہلیت {record.reqQualification || 'تعلیم یافتہ'}
            </span>
          ) : (
            <span>نیک سیرت و دیندار باوقار سادات فیملی</span>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(record);
          }}
          className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-amber-200 text-xs font-semibold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>مکمل ریکارڈ دیکھیں</span>
        </button>

        {onFindMatch && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFindMatch(record);
            }}
            title="خودکار AI رشتہ میچنگ (Auto Match)"
            className="px-2.5 py-2 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-900 border border-purple-200 rounded-xl transition flex items-center gap-1 text-[11px] font-bold shadow-xs cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>AI میچ</span>
          </button>
        )}

        <button
          onClick={handleCopyWhatsApp}
          title="واٹس ایپ فارمیٹ کاپی کریں"
          className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl transition flex items-center justify-center"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
        </button>

        {onApplyProposal && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onApplyProposal(record);
            }}
            title="رشتہ درخواست / رابطہ فارم جمع کروائیں"
            className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl transition flex items-center justify-center cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        )}

        {/* Admin Controls & File Downloads (Only for Admins) */}
        {currentAdmin && (
          <div className="flex items-center gap-1">
            {/* PDF Preview before download */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPreviewPdfOpen(true);
              }}
              title={`پی ڈی ایف پیش منظر (Preview PDF #${record.serialNumber})`}
              className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl transition flex items-center justify-center cursor-pointer shadow-2xs"
            >
              <Eye className="w-4 h-4 text-amber-700" />
            </button>

            {/* Individual PDF Download for Admin */}
            <button
              onClick={async (e) => {
                e.stopPropagation();
                setIsExportingPdf(true);
                await exportSingleRecordToPdf(record, true);
                setIsExportingPdf(false);
              }}
              disabled={isExportingPdf}
              title={`ایڈمن: پی ڈی ایف فائل ڈاؤن لوڈ کریں (#${record.serialNumber}_Sadat_Record.pdf)`}
              className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl transition flex items-center justify-center cursor-pointer shadow-2xs"
            >
              {isExportingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
            </button>

            {/* Individual JSON Download for Admin */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                exportSingleRecordToJson(record);
              }}
              title={`ایڈمن: جے سن فائل ڈاؤن لوڈ کریں (#${record.serialNumber}_Sadat_Record.json)`}
              className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl transition flex items-center justify-center cursor-pointer shadow-2xs"
            >
              <FileJson className="w-4 h-4" />
            </button>

            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(record);
                }}
                title="ریکارڈ ترمیم کریں"
                className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl transition cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(record.id);
                }}
                title="ریکارڈ حذف کریں"
                className="p-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* PDF Document Preview & Export Manager Modal */}
      {isPreviewPdfOpen && (
        <PdfExportPreviewModal
          isOpen={isPreviewPdfOpen}
          onClose={() => setIsPreviewPdfOpen(false)}
          records={[record]}
          initialRecord={record}
          initialScope="single"
        />
      )}
    </div>
  );
};
