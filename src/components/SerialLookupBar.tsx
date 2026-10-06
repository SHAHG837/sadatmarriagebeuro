import React, { useState } from 'react';
import { Search, Hash, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { SadatRecord } from '../types/record';

interface SerialLookupBarProps {
  records: SadatRecord[];
  onSelectRecord: (record: SadatRecord) => void;
}

export const SerialLookupBar: React.FC<SerialLookupBarProps> = ({
  records,
  onSelectRecord
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Normalize query
  const cleanQ = query.trim().toLowerCase();

  // Find matches
  const matches = cleanQ
    ? records.filter((r) => {
        const s = r.serialNumber.toLowerCase();
        // check direct or padded number: e.g. query "3" matches "003"
        const numOnly = s.replace(/[^\d]/g, '');
        const qNumOnly = cleanQ.replace(/[^\d]/g, '');
        return (
          s.includes(cleanQ) ||
          (qNumOnly && (numOnly === qNumOnly || numOnly.endsWith(qNumOnly))) ||
          r.currentCity.toLowerCase().includes(cleanQ) ||
          r.qualification.toLowerCase().includes(cleanQ)
        );
      })
    : [];

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (matches.length > 0) {
      onSelectRecord(matches[0]);
    }
  };

  // Prevalent serial numbers for quick access chips
  const quickSerials = records.slice(0, 8);

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-md border border-emerald-900/10 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
              <Hash className="w-4 h-4 text-emerald-700" />
            </span>
            <h3 className="font-bold text-base md:text-lg text-emerald-950 font-amiri">
              خودکار سیریل نمبر و تیز رفتار تلاش (Auto Serial Lookup)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            سیریل نمبر درج کریں، سسٹم فوری طور پر متعلقہ مکمل ریکارڈ اور ہم آہنگ رشتے نکال کر پیش کرے گا
          </p>
        </div>

        {/* Quick Serials List */}
        {quickSerials.length > 0 ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-medium ml-1">فوری سیریلز:</span>
            {quickSerials.map((rec) => (
              <button
                key={rec.id}
                onClick={() => onSelectRecord(rec)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-mono font-bold transition flex items-center gap-1 ${
                  rec.gender === 'لڑکی'
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200'
                }`}
              >
                <span>#{rec.serialNumber}</span>
                <span className="text-[10px] opacity-70">
                  ({rec.gender === 'لڑکی' ? 'خاتون' : 'مرد'})
                </span>
              </button>
            ))}
          </div>
        ) : (
          <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
            اندراج کے بعد سیریل نمبرز یہاں ظاہر ہوں گے
          </span>
        )}
      </div>

      {/* Main Search Input */}
      <form onSubmit={handleLookup} className="relative">
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="سیریل نمبر درج کریں (مثلاً: FM001 برائے خاتون، M001 برائے مرد) یا شہر / تعلیم..."
            className="w-full pr-12 pl-32 py-3.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border-2 border-emerald-700/30 focus:border-emerald-700 rounded-xl text-sm md:text-base font-arabic transition shadow-inner focus:outline-none focus:ring-4 focus:ring-emerald-700/15"
          />
          <Search className="w-5 h-5 text-emerald-800 absolute right-4 pointer-events-none" />

          {/* Quick Enter action button */}
          <button
            type="submit"
            disabled={!cleanQ}
            className="absolute left-2.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-300 text-amber-200 disabled:text-slate-500 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-xs"
          >
            <span>فوری دیکھیں</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Auto Dropdown when typing */}
        {cleanQ && matches.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-emerald-800/20 divide-y divide-slate-100 z-30 max-h-80 overflow-y-auto">
            <div className="px-4 py-2 bg-emerald-900/5 text-[11px] font-semibold text-emerald-900 flex items-center justify-between">
              <span>دریافت شدہ ریکارڈز ({matches.length}):</span>
              <span className="text-slate-500 font-normal">کلک کر کے مکمل فائل ملاحظہ کریں</span>
            </div>
            {matches.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectRecord(item);
                  setQuery('');
                }}
                className="p-3.5 hover:bg-emerald-50/80 cursor-pointer flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold ${
                    item.gender === 'لڑکی' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    #{item.serialNumber}
                  </span>
                  <div>
                    <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
                      <span>{item.gender === 'لڑکی' ? 'سیدہ (مستورات)' : item.name}</span>
                      <span className="text-xs font-normal text-slate-500">
                        • {item.age} سال • {item.maritalStatus}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                      <span>شہر: <strong className="text-slate-700">{item.currentCity}</strong></span>
                      <span>تعلیم: <strong className="text-slate-700">{item.qualification}</strong></span>
                      <span>مسلک: <strong className="text-slate-700">{item.maslak}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold group-hover:translate-x-[-4px] transition">
                  <span>فائل کھولیں</span>
                  <ArrowLeft className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};
