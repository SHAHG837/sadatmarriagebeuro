import React from 'react';
import { 
  X, 
  Bookmark, 
  Trash2, 
  Eye, 
  Sparkles, 
  Share2, 
  MapPin, 
  GraduationCap 
} from 'lucide-react';
import { SadatRecord } from '../types/record';

interface SavedOpportunitiesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedRecords: SadatRecord[];
  onRemoveBookmark: (id: string) => void;
  onViewRecord: (record: SadatRecord) => void;
}

export const SavedOpportunitiesDrawer: React.FC<SavedOpportunitiesDrawerProps> = ({
  isOpen,
  onClose,
  savedRecords,
  onRemoveBookmark,
  onViewRecord
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-start bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col text-right overflow-hidden border-l border-emerald-800/20">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white p-5 flex items-center justify-between border-b border-amber-500/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Bookmark className="w-5 h-5 fill-amber-300/40" />
            </div>
            <div>
              <h3 className="font-bold text-base text-amber-200 font-amiri">
                محفوظ شدہ رشتے (Saved Opportunities)
              </h3>
              <p className="text-[11px] text-emerald-200">
                کل محفوظ کوائف: {savedRecords.length}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 font-arabic">
          {savedRecords.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <Bookmark className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
              <div className="font-bold text-slate-600 text-sm">کوئی رشتہ محفوظ نہیں کیا گیا</div>
              <p className="text-xs max-w-xs mx-auto text-slate-400">
                کسی بھی سادات پروفائل کارڈ پر لگے دل یا بک مارک بٹن پر کلک کر کے آپ اسے یہاں محفوظ کر سکتے ہیں۔
              </p>
            </div>
          ) : (
            savedRecords.map((rec) => (
              <div
                key={rec.id}
                className="bg-slate-50 hover:bg-emerald-50/50 p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-600/40 transition flex flex-col justify-between shadow-2xs group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-slate-900 text-amber-300 px-2 py-0.5 rounded">
                      #{rec.serialNumber}
                    </span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                      rec.gender === 'لڑکی' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {rec.gender}
                    </span>
                  </div>

                  <button
                    onClick={() => onRemoveBookmark(rec.id)}
                    className="text-slate-400 hover:text-red-600 p-1 rounded-md transition"
                    title="محفوظ فہرست سے نکالیں"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mb-2">
                  <h4 className="font-bold text-sm text-slate-800">
                    {rec.gender === 'لڑکی' ? 'سیدہ (مستورات)' : rec.name}
                  </h4>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                    <span>عمر: <strong>{rec.age} سال</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      <strong>{rec.currentCity}</strong>
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-100 mb-2 truncate">
                  تعلیم: {rec.qualification}
                </div>

                <button
                  onClick={() => {
                    onViewRecord(rec);
                    onClose();
                  }}
                  className="w-full bg-emerald-800 hover:bg-emerald-900 text-amber-200 text-xs font-bold py-1.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>مکمل فائل کھولیں</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500">سُپابیس کلاؤڈ محفوظ بک مارکس</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-700 font-semibold"
          >
            بند کریں
          </button>
        </div>
      </div>
    </div>
  );
};
