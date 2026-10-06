import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Check, 
  Copy, 
  ExternalLink, 
  CloudUpload, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { SUPABASE_URL, SUPABASE_SQL_SETUP } from '../lib/supabase';
import { syncAllRecordsToBackend, SyncStatus } from '../services/recordService';
import { SadatRecord } from '../types/record';

interface SupabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncStatus: SyncStatus;
  records: SadatRecord[];
  onRefreshFromBackend: () => void;
}

export const SupabaseStatusModal: React.FC<SupabaseStatusModalProps> = ({
  isOpen,
  onClose,
  syncStatus,
  records,
  onRefreshFromBackend
}) => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSyncToBackend = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    const result = await syncAllRecordsToBackend(records);
    setIsSyncing(false);
    if (result.error) {
      setSyncFeedback(`اپلوڈ میں مسئلہ: ${result.error}. برائے مہربانی پہلے SQL ایڈیٹر میں ٹیبل بنائیں۔`);
    } else {
      setSyncFeedback(`کامیابی! تمام ${result.count} سادات ریکارڈز سُپابیس لائیو ڈیٹا بیس میں منتقل ہو گئے۔`);
      onRefreshFromBackend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-emerald-800/30 overflow-hidden my-auto max-h-[92vh] flex flex-col text-right">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white p-5 flex items-center justify-between border-b border-amber-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-amiri text-amber-200">
                  سُپابیس لائیو بیک اینڈ کنکشن (Supabase Database)
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  syncStatus.connected ? 'bg-emerald-400 text-emerald-950' : 'bg-amber-400 text-emerald-950'
                }`}>
                  {syncStatus.tableReady ? 'لائیو فعال' : 'کنیکٹڈ'}
                </span>
              </div>
              <p className="text-xs text-emerald-200 font-mono" dir="ltr">
                kctqwhekftnanwpooavq.supabase.co
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
          
          {/* Status Alert */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
            syncStatus.tableReady 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            {syncStatus.tableReady ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <strong className="block text-sm mb-0.5 font-bold">
                {syncStatus.tableReady ? 'ڈیٹا بیس مکمل طور پر منسلک اور ہم آہنگ ہے' : 'سُپابیس سیٹ اپ رہنمائی'}
              </strong>
              <span>{syncStatus.message}</span>
            </div>
          </div>

          {syncFeedback && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-xl flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{syncFeedback}</span>
            </div>
          )}

          {/* Action Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleSyncToBackend}
              disabled={isSyncing}
              className="p-3.5 bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-300 text-amber-200 rounded-2xl border border-emerald-700 flex items-center justify-between text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <CloudUpload className="w-4 h-4 text-amber-300" />
                <span>{isSyncing ? 'اپلوڈ ہو رہا ہے...' : `تمام ${records.length} ریکارڈز سُپابیس بھیجیں`}</span>
              </div>
              <span className="text-[10px] bg-emerald-700 px-2 py-0.5 rounded text-white">Push to DB</span>
            </button>

            <button
              onClick={onRefreshFromBackend}
              className="p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl border border-slate-300 flex items-center justify-between text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-700" />
                <span>سُپابیس سے تازہ ترین ڈیٹا لوڈ کریں</span>
              </div>
              <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded">Sync Fetch</span>
            </button>
          </div>

          {/* Project Details & Tables List */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2.5">
            <div className="font-bold text-slate-800 border-b pb-1.5 flex items-center justify-between">
              <span>منسلک شدہ سُپابیس پروجیکٹ و ڈیٹا بیس ٹیبلز:</span>
              <span className="text-[11px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-mono">RLS Enabled</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-500">پروجیکٹ ڈیش بورڈ:</span>
              <a
                href="https://supabase.com/dashboard/project/kctqwhekftnanwpooavq"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-emerald-700 hover:underline flex items-center gap-1 font-bold"
                dir="ltr"
              >
                <span>kctqwhekftnanwpooavq</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-arabic">صارفین پروفائلز:</span>
                <strong className="text-slate-800">public.profiles</strong>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-arabic">سادات رشتے و مواقع:</span>
                <strong className="text-slate-800">public.opportunities</strong>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-arabic">محفوظ کوائف:</span>
                <strong className="text-slate-800">public.saved_opportunities</strong>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-arabic">رشتہ درخواستیں:</span>
                <strong className="text-slate-800">public.applications</strong>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t text-[11px]">
              <span className="text-slate-500">اسٹوریج بکٹ (Storage):</span>
              <span className="font-mono font-bold text-emerald-800" dir="ltr">sadat-documents (Public)</span>
            </div>
          </div>

          {/* SQL Setup Instructions */}
          <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">
                سُپابیس اسکیما اسکرپٹ (db/schema.sql):
              </span>
              <button
                onClick={handleCopySql}
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs flex items-center gap-1 transition cursor-pointer"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'کاپی ہو گیا!' : 'db/schema.sql کاپی کریں'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-300">
              یہ مکمل اسکرپٹ <code>/db/schema.sql</code> کے نام سے بھی محفوظ کر دی گئی ہے۔ اس میں <code>auth.users</code> کا خودکار ٹریگر شامل ہے جس کے ذریعے جب بھی کوئی نیا صارف سائن اپ کرے گا تو اس کا ریکارڈ خود بخود <code>profiles</code> ٹیبل میں بن جائے گا۔
            </p>
            <p className="text-[11px] text-slate-400">
              اسے سُپابیس پروجیکٹ میں چلانے کے لیے: 
              <a 
                href="https://supabase.com/dashboard/project/kctqwhekftnanwpooavq/sql/new" 
                target="_blank" 
                rel="noreferrer"
                className="text-amber-400 hover:underline mx-1 inline-flex items-center gap-0.5 font-bold"
              >
                Supabase SQL Editor <ExternalLink className="w-2.5 h-2.5" />
              </a>
              کھولیں اور پیسٹ کر کے Run کریں۔
            </p>
            <pre className="p-3 bg-black/50 rounded-xl max-h-36 overflow-y-auto text-[10px] font-mono text-emerald-300 whitespace-pre-wrap text-left" dir="ltr">
              {SUPABASE_SQL_SETUP}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            Publishable Key: <span className="font-mono">sb_publishable_...IKNNQspX</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition"
          >
            بند کریں
          </button>
        </div>
      </div>
    </div>
  );
};
