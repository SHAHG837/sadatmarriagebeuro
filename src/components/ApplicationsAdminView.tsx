import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Phone, 
  MapPin, 
  Eye, 
  MessageSquare, 
  Sparkles, 
  Check, 
  XCircle,
  RefreshCw
} from 'lucide-react';
import { Application } from '../types/supabase';
import { SadatRecord } from '../types/record';
import { updateApplicationStatus } from '../services/opportunityService';

interface ApplicationsAdminViewProps {
  applications: Application[];
  records: SadatRecord[];
  onRefresh: () => void;
  onViewRecord: (record: SadatRecord) => void;
}

export const ApplicationsAdminView: React.FC<ApplicationsAdminViewProps> = ({
  applications,
  records,
  onRefresh,
  onViewRecord
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = applications.filter((app) => {
    if (filterStatus !== 'all' && app.status !== filterStatus) return false;
    return true;
  });

  const handleStatusChange = async (appId: string, newStatus: any) => {
    setUpdatingId(appId);
    await updateApplicationStatus(appId, newStatus);
    setUpdatingId(null);
    onRefresh();
  };

  return (
    <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-slate-200/80 mb-8 font-arabic">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-800 flex items-center justify-center text-amber-300 shadow-md">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-emerald-950 font-amiri">
              موصول شدہ رشتہ درخواستیں (Matrimonial Applications & Proposals)
            </h3>
            <p className="text-xs text-slate-500">
              سُپابیس ڈیٹا بیس ٹیبل (applications) میں موصول ہونے والی رابطہ و رشتہ کی پیشکشیں
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
          >
            <option value="all">تمام درخواستیں ({applications.length})</option>
            <option value="زیر غور">زیر غور</option>
            <option value="منظور شدہ">منظور شدہ</option>
            <option value="رابطہ قائم">رابطہ قائم</option>
            <option value="طے پا گیا">طے پا گیا</option>
            <option value="مسترد">مسترد</option>
          </select>

          <button
            onClick={onRefresh}
            className="p-2 text-slate-600 hover:text-emerald-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            title="تازہ کریں"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl text-slate-400 text-xs">
          فی الوقت کوئی رشتہ درخواست موصول نہیں ہوئی۔
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => {
            const opp = records.find((r) => r.id === app.opportunityId || r.serialNumber === app.candidateSerial);

            return (
              <div
                key={app.id}
                className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 hover:border-emerald-600/40 transition flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">
                      امیدوار: {app.candidateName || 'سید صاحب'}
                    </span>
                    {app.candidatePhone && (
                      <span className="font-mono text-xs bg-slate-200/80 text-slate-800 px-2 py-0.5 rounded" dir="ltr">
                        {app.candidatePhone}
                      </span>
                    )}
                    {app.candidateCity && (
                      <span className="text-xs text-slate-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        {app.candidateCity}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400">
                      بتاریخ: {new Date(app.createdAt).toLocaleDateString('ur-PK')}
                    </span>
                  </div>

                  {/* Target Opportunity */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-slate-500">مطلوبہ رشتہ: </span>
                      <strong className="text-emerald-950 font-bold">
                        {opp ? (opp.gender === 'لڑکی' ? 'سیدہ (مستورات)' : opp.name) : `سیریل #${app.candidateSerial || 'نامعلوم'}`}
                      </strong>
                      {opp && (
                        <span className="text-slate-500 mr-2">
                          ({opp.currentCity} • {opp.age} سال • #{opp.serialNumber})
                        </span>
                      )}
                    </div>
                    {opp && (
                      <button
                        onClick={() => onViewRecord(opp)}
                        className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>فائل دیکھیں</span>
                      </button>
                    )}
                  </div>

                  {/* Proposal text */}
                  <div className="text-xs text-slate-700 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/70">
                    <strong className="block text-emerald-950 mb-1">تعارفی پیغام برائے کفاءت:</strong>
                    <p className="leading-relaxed">{app.proposalNotes}</p>
                    {app.familyDetails && (
                      <p className="mt-2 text-slate-600 pt-2 border-t border-emerald-200/50">
                        <strong>خاندانی تفصیل:</strong> {app.familyDetails}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Switcher for Admin */}
                <div className="shrink-0 flex flex-col gap-2 min-w-44 bg-white p-3 rounded-xl border border-slate-200">
                  <label className="text-[11px] font-bold text-slate-600">حیثیت درخواست (Status):</label>
                  <select
                    value={app.status}
                    disabled={updatingId === app.id}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                  >
                    <option value="زیر غور">زیر غور (Pending)</option>
                    <option value="منظور شدہ">منظور شدہ (Approved)</option>
                    <option value="رابطہ قائم">رابطہ قائم (Contacted)</option>
                    <option value="طے پا گیا">طے پا گیا (Matched)</option>
                    <option value="مسترد">مسترد (Declined)</option>
                  </select>

                  <div className="text-[10px] text-slate-400">
                    {updatingId === app.id ? 'اپ ڈیٹ ہو رہا ہے...' : 'سُپابیس پر محفوظ'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
