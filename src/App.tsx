import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  MapPin, 
  Heart, 
  Sparkles, 
  Search, 
  Filter, 
  PlusCircle, 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle,
  AlertCircle,
  Upload,
  Database, 
  FileText,
  Share2,
  Lock
} from 'lucide-react';

import { SadatRecord, AdminUser } from './types/record';
import { INITIAL_RECORDS, PAKISTAN_CITIES } from './data/initialRecords';
import { Header } from './components/Header';
import { BureauInfoBanner } from './components/BureauInfoBanner';
import { SerialLookupBar } from './components/SerialLookupBar';
import { RecordCard } from './components/RecordCard';
import { RecordDetailModal } from './components/RecordDetailModal';
import { RecordFormModal } from './components/RecordFormModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { WhatsAppImportModal } from './components/WhatsAppImportModal';
import { TextFileUploadModal } from './components/TextFileUploadModal';
import { SupabaseStatusModal } from './components/SupabaseStatusModal';
import { AuthModal } from './components/AuthModal';
import { SavedOpportunitiesDrawer } from './components/SavedOpportunitiesDrawer';
import { ProposalApplicationModal } from './components/ProposalApplicationModal';
import { ApplicationsAdminView } from './components/ApplicationsAdminView';
import { CityDirectoryView } from './components/CityDirectoryView';
import { CompatibilityMatchView } from './components/CompatibilityMatchView';
import { AdminMasterRegisterView } from './components/AdminMasterRegisterView';
import { LandingAuthGate } from './components/LandingAuthGate';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { isDummyRecord, getNextSerialForGender } from './utils/serialHelper';
import { UserProfile, Application } from './types/supabase';
import { 
  getRecordsFromBackend, 
  saveRecordToBackend, 
  deleteRecordFromBackend, 
  subscribeToRecordsChanges,
  clearAllRecordsFromBackend,
  syncAllRecordsToBackend,
  SyncStatus 
} from './services/recordService';
import { 
  saveOpportunityBookmark, 
  removeOpportunityBookmark, 
  fetchUserSavedOpportunityIds, 
  fetchAllApplications 
} from './services/opportunityService';
import { getCurrentUserProfile, signOutUser } from './services/authService';

// Immediate purge of any legacy dummy data
try {
  const currentSaved = localStorage.getItem('sadat_records_v1');
  if (currentSaved) {
    const parsed = JSON.parse(currentSaved);
    if (Array.isArray(parsed)) {
      const cleanList = parsed.filter((r: any) => !isDummyRecord(r));
      localStorage.setItem('sadat_records_v1', JSON.stringify(cleanList));
    }
  }
} catch {
  // Ignore
}

export default function App() {
  // Persistence for records - resets to empty array, purging any legacy dummy records
  const [records, setRecords] = useState<SadatRecord[]>(() => {
    const saved = localStorage.getItem('sadat_records_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Strict filter: purge any legacy dummy records including Syeda Zainab Naqvi
          const userRecords = parsed.filter((r: any) => !isDummyRecord(r));
          return userRecords;
        }
      } catch (e) {
        console.error('Failed to parse saved records', e);
      }
    }
    return [];
  });

  // Admin and User authentication state
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('sadat_admin_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse admin session', e);
      }
    }
    return null;
  });

  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [savedRecordIds, setSavedRecordIds] = useState<string[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  // Active view tab: 'all' | 'male' | 'female' | 'matcher' | 'cities' | 'applications' | 'admin_register'
  const [activeTab, setActiveTab] = useState<'all' | 'male' | 'female' | 'matcher' | 'cities' | 'applications' | 'admin_register'>('all');
  const [matcherTargetRecordId, setMatcherTargetRecordId] = useState<string | null>(null);

  // Filters
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'فعال' | 'زیر غور' | 'طے پا گیا'>('all');
  const [maslakFilter, setMaslakFilter] = useState<'all' | 'اہلسنت' | 'اہل تشیع'>('all');

  // Modals state
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<SadatRecord | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SadatRecord | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWhatsAppImportOpen, setIsWhatsAppImportOpen] = useState(false);
  const [isTextUploadOpen, setIsTextUploadOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [proposalTargetRecord, setProposalTargetRecord] = useState<SadatRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<SadatRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Supabase sync status
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    connected: true,
    tableReady: false,
    message: 'سُپابیس سے رابطہ ہو رہا ہے...'
  });

  const refreshFromBackend = () => {
    getRecordsFromBackend().then((res) => {
      setRecords(res.records);
      setSyncStatus(res.status);
    });

    fetchAllApplications().then((apps) => {
      setApplications(apps);
    });
  };

  // Initial load and Realtime Live Subscription
  useEffect(() => {
    refreshFromBackend();

    // Auto-update frontend whenever changes happen in Supabase backend in real-time
    const unsubscribe = subscribeToRecordsChanges(() => {
      refreshFromBackend();
    });

    // Periodic auto-check every 15s to guarantee fresh sync with backend
    const interval = setInterval(() => {
      refreshFromBackend();
    }, 15000);

    getCurrentUserProfile().then((prof) => {
      if (prof) {
        setCurrentUserProfile(prof);
        if (prof.role === 'admin' || prof.role === 'super_admin') {
          setCurrentAdmin({
            phone: prof.phone || prof.email || '03008658360',
            name: prof.fullName,
            role: prof.role === 'super_admin' ? 'main_admin' : 'admin'
          });
        }
        fetchUserSavedOpportunityIds(prof.id).then((ids) => setSavedRecordIds(ids));
      } else {
        fetchUserSavedOpportunityIds('guest').then((ids) => setSavedRecordIds(ids));
      }
    });

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Auto save to localStorage
  useEffect(() => {
    localStorage.setItem('sadat_records_v1', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    if (currentAdmin) {
      localStorage.setItem('sadat_admin_session', JSON.stringify(currentAdmin));
    } else {
      localStorage.removeItem('sadat_admin_session');
    }
  }, [currentAdmin]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Next calculated serial numbers:
  // Females: FM001..., Males: M001...
  const nextFemaleSerial = useMemo(() => getNextSerialForGender('لڑکی', records), [records]);
  const nextMaleSerial = useMemo(() => getNextSerialForGender('لڑکا', records), [records]);
  const nextSerialNumber = useMemo(() => {
    return activeTab === 'male' ? nextMaleSerial : nextFemaleSerial;
  }, [activeTab, nextMaleSerial, nextFemaleSerial]);

  // Statistics
  const stats = useMemo(() => {
    const male = records.filter((r) => r.gender === 'لڑکا').length;
    const female = records.filter((r) => r.gender === 'لڑکی').length;
    return {
      total: records.length,
      male,
      female
    };
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Tab filter (two portions)
      if (activeTab === 'male' && r.gender !== 'لڑکا') return false;
      if (activeTab === 'female' && r.gender !== 'لڑکی') return false;

      // City filter
      if (selectedCity && r.currentCity !== selectedCity && !r.nativeCity?.includes(selectedCity)) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;

      // Maslak filter
      if (maslakFilter !== 'all' && !r.maslak?.includes(maslakFilter)) return false;

      // Text query filter (Comprehensive Search for Admin & Users)
      if (filterQuery.trim()) {
        const q = filterQuery.toLowerCase().trim();
        const sMatch = r.serialNumber.toLowerCase().includes(q);
        const nameMatch = r.gender === 'لڑکا' || currentAdmin ? r.name.toLowerCase().includes(q) : false;
        const phoneMatch = currentAdmin && r.contactNumber ? r.contactNumber.replace(/[\s\-]/g, '').includes(q.replace(/[\s\-]/g, '')) : false;
        const fatherMatch = r.fatherName?.toLowerCase().includes(q);
        const cityMatch = r.currentCity.toLowerCase().includes(q) || (r.nativeCity && r.nativeCity.toLowerCase().includes(q));
        const qualMatch = r.qualification.toLowerCase().includes(q);
        const jobMatch = r.rankPosition?.toLowerCase().includes(q);
        const casteMatch = r.caste.toLowerCase().includes(q);
        const maslakMatch = r.maslak?.toLowerCase().includes(q);
        const reqMatch = r.reqQualification?.toLowerCase().includes(q) || r.reqCity?.toLowerCase().includes(q);
        const ageMatch = r.age?.toString() === q || r.age?.toString().includes(q);

        if (!sMatch && !nameMatch && !phoneMatch && !fatherMatch && !cityMatch && !qualMatch && !jobMatch && !casteMatch && !maslakMatch && !reqMatch && !ageMatch) {
          return false;
        }
      }

      return true;
    });
  }, [records, activeTab, selectedCity, statusFilter, maslakFilter, filterQuery, currentAdmin]);

  // Handlers
  const handleSaveRecord = (record: SadatRecord) => {
    if (editingRecord) {
      setRecords((prev) => prev.map((r) => (r.id === record.id ? record : r)));
      showToast(`سیریل نمبر #${record.serialNumber} کا ریکارڈ کامیابی سے اپ ڈیٹ ہو گیا!`);
    } else {
      setRecords((prev) => [record, ...prev]);
      showToast(`نیا ریکارڈ #${record.serialNumber} کامیابی سے محفوظ کر لیا گیا!`);
    }
    setEditingRecord(null);

    // Save to Supabase backend live
    saveRecordToBackend(record).then((res) => {
      if (res.success) {
        setSyncStatus((prev) => ({ ...prev, tableReady: true, connected: true }));
      }
    });
  };

  const handleDeleteRecord = async (id: string) => {
    // 1. Update state immediately
    setRecords((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      try {
        localStorage.setItem('sadat_records_v1', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    if (selectedRecordForDetail?.id === id) {
      setSelectedRecordForDetail(null);
    }

    showToast('ریکارڈ کامیابی سے حذف کر دیا گیا اور لائیو سرور سے ہٹا دیا گیا');

    // 2. Delete from Supabase backend live
    try {
      await deleteRecordFromBackend(id);
    } catch (err) {
      console.error('Failed to delete from backend:', err);
    }
  };

  const handleUpdateStatus = (record: SadatRecord, newStatus: 'فعال' | 'زیر غور' | 'طے پا گیا') => {
    const updated: SadatRecord = { ...record, status: newStatus, updatedAt: new Date().toISOString() };
    setRecords((prev) => prev.map((r) => (r.id === record.id ? updated : r)));
    saveRecordToBackend(updated);
    showToast(`سیریل #${record.serialNumber} کا اسٹیٹس "${newStatus}" کر دیا گیا اور لائیو محفوظ ہو گیا!`);
  };

  const handleResetData = async () => {
    try {
      await clearAllRecordsFromBackend();
    } catch (e) {
      console.error(e);
    }
    setRecords([]);
    localStorage.setItem('sadat_records_v1', JSON.stringify([]));
    showToast('ڈیش بورڈ مکمل صاف (Reset) کر دیا گیا ہے۔ تمام ڈمی ڈیٹا ختم ہو چکا ہے!');
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sadat_marriage_records_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('بیک اپ فائل ڈاؤن لوڈ ہو گئی');
  };

  const handleAutoSelectSerial = (record: SadatRecord) => {
    setSelectedRecordForDetail(record);
    showToast(`سیریل نمبر #${record.serialNumber} کی فائل فوری کھول دی گئی`);
  };

  const handleToggleSave = (record: SadatRecord) => {
    const isCurrentlySaved = savedRecordIds.includes(record.id);
    const userId = currentUserProfile?.id || 'guest';

    if (isCurrentlySaved) {
      setSavedRecordIds((prev) => prev.filter((id) => id !== record.id));
      removeOpportunityBookmark(userId, record.id);
      showToast(`سیریل نمبر #${record.serialNumber} کو محفوظ فہرست سے نکال دیا گیا`);
    } else {
      setSavedRecordIds((prev) => [...prev, record.id]);
      saveOpportunityBookmark(userId, record.id);
      showToast(`سیریل نمبر #${record.serialNumber} کامیابی سے محفوظ (Bookmark) ہو گیا!`);
    }
  };

  const handleOpenProposal = (record: SadatRecord) => {
    setProposalTargetRecord(record);
    setIsProposalModalOpen(true);
  };

  const handleTabClick = (tab: 'all' | 'male' | 'female' | 'matcher' | 'cities' | 'applications' | 'admin_register') => {
    if ((tab === 'all' || tab === 'male' || tab === 'female' || tab === 'admin_register') && !currentAdmin) {
      showToast('یہ حصہ اور ریکارڈ روم صرف مجاز ایڈمنز کے معائنے کے لیے مخصوص ہے!');
      return;
    }
    setActiveTab(tab);
  };

  // When published or shared, show ONLY the Login / Sign Up Gate if not authenticated
  if (!currentUserProfile && !currentAdmin) {
    return (
      <LandingAuthGate
        onAuthSuccess={(profile) => {
          setCurrentUserProfile(profile);
          if (profile.role === 'admin' || profile.role === 'super_admin') {
            setCurrentAdmin({
              phone: profile.phone || profile.email || '03008658360',
              name: profile.fullName,
              role: profile.role === 'super_admin' ? 'main_admin' : 'admin'
            });
            setActiveTab('all');
          } else {
            setActiveTab('matcher');
          }
          fetchUserSavedOpportunityIds(profile.id).then((ids) => setSavedRecordIds(ids));
          showToast(`خوش آمدید! ${profile.fullName} سائن ان مکمل`);
        }}
        onAdminSuccess={(admin) => {
          setCurrentAdmin(admin);
          setActiveTab('all');
          showToast(`خوش آمدید! ${admin.name} بحیثیت ایڈمن لاگ ان ہیں`);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 pb-16 font-arabic selection:bg-amber-400 selection:text-emerald-950">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-emerald-950 text-amber-200 border border-amber-400/40 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-bounce text-xs font-bold">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header with Admin controls */}
      <Header
        currentAdmin={currentAdmin}
        userProfile={currentUserProfile}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={async () => {
          await signOutUser();
          setCurrentAdmin(null);
          setCurrentUserProfile(null);
          localStorage.removeItem('sadat_admin_session');
          showToast('اکاؤنٹ سے لاگ آؤٹ ہو گیا');
        }}
        onOpenNewRecord={() => {
          setEditingRecord(null);
          setIsFormOpen(true);
        }}
        onOpenWhatsAppImport={() => setIsWhatsAppImportOpen(true)}
        onOpenTextUpload={() => setIsTextUploadOpen(true)}
        onOpenSupabaseStatus={() => setIsSupabaseModalOpen(true)}
        isSupabaseReady={syncStatus.tableReady}
        onOpenSaved={() => setIsSavedDrawerOpen(true)}
        savedCount={savedRecordIds.length}
        onOpenApplications={() => setActiveTab('applications')}
        applicationsCount={applications.length}
        onResetData={handleResetData}
        onExportJson={handleExportJson}
        onSelectTab={handleTabClick}
        stats={stats}
      />

      <main className="max-w-7xl mx-auto px-4 pt-4">
        
        {/* Bureau Official Information Banner */}
        <BureauInfoBanner />

        {/* Instant Auto Serial Lookup Bar */}
        <SerialLookupBar
          records={records}
          onSelectRecord={handleAutoSelectSerial}
        />

        {/* Admin Bar notice if logged in */}
        {currentAdmin && (
          <div className="bg-amber-50 border-2 border-amber-300 text-amber-950 p-4 rounded-2xl mb-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>
                آپ اس وقت بحیثیت <strong>{currentAdmin.name}</strong> لاگ ان ہیں۔ آپ کو مستورات کے خفیہ نام، فون نمبرز دیکھنے، نیا ریکارڈ درج کرنے اور ٹیکسٹ فائل اپلوڈ کا مکمل اختیار حاصل ہے۔
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                onClick={() => setActiveTab('admin_register')}
                className="bg-purple-800 hover:bg-purple-900 text-amber-200 font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                title="ایڈمن ماسٹر رجسٹر اور معائنہ جدول کھولیں"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>ایڈمن ماسٹر رجسٹر</span>
              </button>

              <button
                onClick={() => setIsTextUploadOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                title="سادات فیملی کوائف کی ٹیکسٹ فائل (.txt) اپلوڈ کریں"
              >
                <Upload className="w-3.5 h-3.5 text-amber-200" />
                <span>ٹیکسٹ فائل اپلوڈ (.txt)</span>
              </button>

              <button
                onClick={() => {
                  setEditingRecord(null);
                  setIsFormOpen(true);
                }}
                className="bg-emerald-800 hover:bg-emerald-900 text-amber-200 font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>نیا رشتہ درج کریں</span>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs (Two Portions Segregation) */}
        <div className="bg-white rounded-2xl p-2 shadow-xs border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Total Records Tab - Clickable only for Admin */}
            <button
              onClick={() => handleTabClick('all')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-emerald-800 text-amber-200 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title={!currentAdmin ? 'یہ پورشن صرف ایڈمن کے لیے قابلِ کلک ہے' : undefined}
            >
              <Users className="w-4 h-4" />
              <span>تمام ریکارڈ روم ({stats.total})</span>
              {!currentAdmin && <Lock className="w-3 h-3 text-slate-400" />}
            </button>

            {/* Male Portion Tab - Clickable only for Admin */}
            <button
              onClick={() => handleTabClick('male')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'male'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-blue-800 hover:bg-blue-50'
              }`}
              title={!currentAdmin ? 'یہ پورشن صرف ایڈمن کے لیے قابلِ کلک ہے' : undefined}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>حصہ مردانہ - لڑکے ({stats.male})</span>
              {!currentAdmin && <Lock className="w-3 h-3 text-slate-400" />}
            </button>

            {/* Female Portion Tab - Clickable only for Admin */}
            <button
              onClick={() => handleTabClick('female')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'female'
                  ? 'bg-rose-700 text-white shadow-sm'
                  : 'text-rose-800 hover:bg-rose-50'
              }`}
              title={!currentAdmin ? 'یہ پورشن صرف ایڈمن کے لیے قابلِ کلک ہے' : undefined}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span>حصہ مستورات - لڑکیاں ({stats.female})</span>
              {!currentAdmin && <Lock className="w-3 h-3 text-slate-400" />}
            </button>

            {/* Compatibility Matcher Tab */}
            <button
              onClick={() => setActiveTab('matcher')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'matcher'
                  ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-sm'
                  : 'text-amber-800 hover:bg-amber-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>خودکار کفاءت میچنگ انجن</span>
            </button>

            {/* City Segregation Tab */}
            <button
              onClick={() => setActiveTab('cities')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'cities'
                  ? 'bg-teal-800 text-white shadow-sm'
                  : 'text-teal-800 hover:bg-teal-50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>شہر وار تفریق (All Pakistan)</span>
            </button>

            {/* Applications Tab */}
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'applications'
                  ? 'bg-emerald-950 text-amber-200 shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>درخواست ہائے رشتہ ({applications.length})</span>
            </button>

            {/* Admin Master Register Tab (if Admin is logged in) */}
            {currentAdmin && (
              <button
                onClick={() => setActiveTab('admin_register')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'admin_register'
                    ? 'bg-purple-800 text-amber-200 shadow-sm'
                    : 'text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-700" />
                <span>ایڈمن ماسٹر رجسٹر ({records.length})</span>
              </button>
            )}
          </div>

          {/* City Filter badge if active */}
          {selectedCity && (
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs">
              <span>منتخب شہر: <strong>{selectedCity}</strong></span>
              <button
                onClick={() => setSelectedCity(null)}
                className="text-emerald-700 hover:text-red-600 font-bold ml-1 text-sm"
                title="شہر فلٹر ختم کریں"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Views Rendering */}
        {activeTab === 'admin_register' && currentAdmin ? (
          <AdminMasterRegisterView
            records={records}
            currentAdmin={currentAdmin}
            onViewRecord={(r) => setSelectedRecordForDetail(r)}
            onEditRecord={(r) => {
              setEditingRecord(r);
              setIsFormOpen(true);
            }}
            onDeleteRecord={(id) => {
              const rec = records.find((r) => r.id === id);
              if (rec) setRecordToDelete(rec);
              else handleDeleteRecord(id);
            }}
            onOpenNewRecord={() => {
              setEditingRecord(null);
              setIsFormOpen(true);
            }}
            onOpenWhatsAppImport={() => setIsWhatsAppImportOpen(true)}
            onOpenTextUpload={() => setIsTextUploadOpen(true)}
            onResetData={handleResetData}
            onExportJson={handleExportJson}
            onRefreshBackend={refreshFromBackend}
            onFindMatch={(r) => {
              setMatcherTargetRecordId(r.id);
              setActiveTab('matcher');
            }}
            onUpdateStatus={handleUpdateStatus}
          />
        ) : activeTab === 'applications' ? (
          <ApplicationsAdminView
            applications={applications}
            records={records}
            onRefresh={refreshFromBackend}
            onViewRecord={(r) => setSelectedRecordForDetail(r)}
          />
        ) : activeTab === 'cities' ? (
          <CityDirectoryView
            records={records}
            selectedCity={selectedCity}
            onSelectCity={(city) => {
              setSelectedCity(city);
              if (city) {
                setActiveTab('all');
                showToast(`شہر ${city} کے ریکارڈز فلٹر ہو گئے`);
              }
            }}
          />
        ) : activeTab === 'matcher' ? (
          <CompatibilityMatchView
            records={records}
            currentAdmin={currentAdmin}
            targetRecordId={matcherTargetRecordId}
            onViewRecord={(r) => setSelectedRecordForDetail(r)}
            onOpenNewRecord={() => {
              setEditingRecord(null);
              setIsFormOpen(true);
            }}
          />
        ) : !currentAdmin ? (
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 text-center shadow-xs mb-8">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 font-amiri mb-2">
              سادات ریکارڈ روم صرف مجاز ایڈمنز کے معائنے کے لیے مخصوص ہے
            </h3>
            <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed mb-6">
              سادات خاندانوں اور مستورات کے کوائف کی رازداری کے پیشِ نظر تمام کوائف، لسٹیں اور تفصیلی معائنہ صرف مجاز ایڈمنز کے لیے ہے۔ آپ خودکار AI کفاءت میچنگ انجن سے مناسب ترین رشتے تلاش کر سکتے ہیں یا رشتہ کی درخواست جمع کروا سکتے ہیں۔
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setActiveTab('matcher')}
                className="bg-emerald-800 hover:bg-emerald-900 text-amber-200 text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
              >
                خودکار AI کفاءت میچنگ انجن کھولیں
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Filter and Search Toolbar */}
            <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="تلاش کریں: سیریل نمبر، نام، تعلیم، کاسٹ یا مطلوبہ اہلیت..."
                  className="w-full pr-9 pl-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 font-medium">شہر:</span>
                  <select
                    value={selectedCity || ''}
                    onChange={(e) => setSelectedCity(e.target.value || null)}
                    className="px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                  >
                    <option value="">تمام پاکستان</option>
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-slate-500 font-medium">مسلک:</span>
                  <select
                    value={maslakFilter}
                    onChange={(e) => setMaslakFilter(e.target.value as any)}
                    className="px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  >
                    <option value="all">تمام مسالک</option>
                    <option value="اہلسنت">اہلسنت</option>
                    <option value="اہل تشیع">اہل تشیع</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-slate-500 font-medium">حیثیت:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  >
                    <option value="all">تمام ریکارڈز</option>
                    <option value="فعال">صرف فعال</option>
                    <option value="زیر غور">زیر غور</option>
                    <option value="طے پا گیا">طے پا گیا</option>
                  </select>
                </div>

                {(filterQuery || selectedCity || statusFilter !== 'all' || maslakFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setFilterQuery('');
                      setSelectedCity(null);
                      setStatusFilter('all');
                      setMaslakFilter('all');
                    }}
                    className="text-red-600 hover:text-red-700 bg-red-50 px-2.5 py-2 rounded-xl border border-red-200"
                  >
                    فلٹرز صاف کریں
                  </button>
                )}
              </div>
            </div>

            {/* Records Grid */}
            <div className="mb-4 flex items-center justify-between text-xs text-slate-600">
              <div>
                دکھائے جا رہے ہیں: <strong className="text-slate-900 font-bold">{filteredRecords.length}</strong> ریکارڈز
                {activeTab === 'male' && <span className="text-blue-700 font-medium mr-1">(حصہ مردانہ)</span>}
                {activeTab === 'female' && <span className="text-rose-700 font-medium mr-1">(حصہ مستورات)</span>}
                {selectedCity && <span className="text-emerald-800 font-medium mr-1">شہر: {selectedCity}</span>}
              </div>
              <div className="text-[11px] text-slate-400">
                سیریل نمبر پر کلک کر کے مکمل فائل بمع واٹس ایپ کاپی کھولیں
              </div>
            </div>

            {records.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-xs">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-800 font-amiri mb-2">
                  ڈیش بورڈ بالکل صاف ہے (کوئی ڈمی ریکارڈ نہیں ہے)
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto leading-relaxed">
                  تمام ڈمی ریکارڈز ری سیٹ کر دیے گئے ہیں۔ فی الوقت ڈیش بورڈ پر کوئی ڈمی اندراج موجود نہیں ہے۔ جیسے ہی ایڈمن 'نیا رشتہ درج کریں'، واٹس ایپ یا ٹیکسٹ فائل سے اندراج کرے گا، تمام ڈیٹا سُپابیس لائیو بیک اینڈ پر محفوظ ہو کر یہاں خودکار طور پر ظاہر ہوگا۔
                </p>
                {currentAdmin ? (
                  <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
                    <button
                      onClick={() => {
                        setEditingRecord(null);
                        setIsFormOpen(true);
                      }}
                      className="bg-emerald-800 hover:bg-emerald-900 text-amber-200 text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>پہلا سادات رشتہ درج کریں (فارم)</span>
                    </button>
                    <button
                      onClick={() => setIsWhatsAppImportOpen(true)}
                      className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Share2 className="w-4 h-4 text-teal-200" />
                      <span>واٹس ایپ میسج سے درآمد</span>
                    </button>
                    <button
                      onClick={() => setIsTextUploadOpen(true)}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Upload className="w-4 h-4 text-amber-200" />
                      <span>ٹیکسٹ فائل (.txt) اپلوڈ</span>
                    </button>
                  </div>
                ) : (
                  <div className="mt-5">
                    <button
                      onClick={() => setIsLoginOpen(true)}
                      className="bg-emerald-800 hover:bg-emerald-900 text-amber-200 text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition inline-flex items-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>ایڈمن لاگ ان کر کے پہلا ریکارڈ شامل کریں</span>
                    </button>
                  </div>
                )}
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-700 font-amiri">کوئی ریکارڈ نہیں ملا</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  دیے گئے فلٹرز یا سیریل نمبر کے مطابق کوئی سادات ریکارڈ موجود نہیں۔ برائے مہربانی تلاش کا دائرہ تبدیل کریں۔
                </p>
                <button
                  onClick={() => {
                    setFilterQuery('');
                    setSelectedCity(null);
                    setStatusFilter('all');
                    setMaslakFilter('all');
                  }}
                  className="mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  فلٹرز صاف کریں
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredRecords.map((record) => (
                  <RecordCard
                    key={record.id}
                    record={record}
                    currentAdmin={currentAdmin}
                    onViewDetails={(r) => setSelectedRecordForDetail(r)}
                    onEdit={(r) => {
                      setEditingRecord(r);
                      setIsFormOpen(true);
                    }}
                    onDelete={(id) => {
                      const rec = records.find((r) => r.id === id);
                      if (rec) setRecordToDelete(rec);
                      else handleDeleteRecord(id);
                    }}
                    onFindMatch={(r) => {
                      setMatcherTargetRecordId(r.id);
                      setActiveTab('matcher');
                    }}
                    isSaved={savedRecordIds.includes(record.id)}
                    onToggleSave={handleToggleSave}
                    onApplyProposal={handleOpenProposal}
                  />
                ))}
              </div>
            )}
          </>
        )}

      </main>

      {/* Modals */}
      <RecordDetailModal
        record={selectedRecordForDetail}
        allRecords={records}
        currentAdmin={currentAdmin}
        onClose={() => setSelectedRecordForDetail(null)}
        onSelectCandidate={(cand) => setSelectedRecordForDetail(cand)}
        onEdit={(r) => {
          setEditingRecord(r);
          setIsFormOpen(true);
        }}
        onDelete={(id) => {
          setSelectedRecordForDetail(null);
          const rec = records.find((r) => r.id === id);
          if (rec) setRecordToDelete(rec);
          else handleDeleteRecord(id);
        }}
      />

      <RecordFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveRecord}
        initialData={editingRecord}
        existingRecords={records}
        nextSerialNumber={nextSerialNumber}
        defaultGender={activeTab === 'male' ? 'لڑکا' : 'لڑکی'}
      />

      <AdminLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(admin) => {
          setCurrentAdmin(admin);
          showToast(`خوش آمدید! ${admin.name} بحیثیت ایڈمن لاگ ان ہیں`);
        }}
        onOpenSupabaseAuth={() => setIsAuthModalOpen(true)}
      />

      <WhatsAppImportModal
        isOpen={isWhatsAppImportOpen}
        onClose={() => setIsWhatsAppImportOpen(false)}
        onImportParsed={(newRec) => {
          setRecords((prev) => [newRec, ...prev]);
          saveRecordToBackend(newRec);
          showToast(`سیریل نمبر #${newRec.serialNumber} کا ریکارڈ واٹس ایپ میسج سے کامیابی سے درآمد کر لیا گیا!`);
          setSelectedRecordForDetail(newRec);
        }}
        existingRecords={records}
        nextSerialNumber={nextSerialNumber}
      />

      <TextFileUploadModal
        isOpen={isTextUploadOpen}
        onClose={() => setIsTextUploadOpen(false)}
        onImportRecords={(importedList) => {
          setRecords((prev) => [...importedList, ...prev]);
          syncAllRecordsToBackend(importedList);
          if (importedList.length === 1) {
            showToast(`سیریل نمبر #${importedList[0].serialNumber} کا سادات ریکارڈ ٹیکسٹ فائل سے کامیابی سے داخل ہو گیا اور لائیو محفوظ ہوا!`);
            setSelectedRecordForDetail(importedList[0]);
          } else {
            showToast(`ٹیکسٹ فائل سے کل ${importedList.length} سادات ریکارڈز کامیابی سے داخل ہو گئے اور لائیو محفوظ ہوئے!`);
          }
        }}
        existingRecords={records}
        nextSerialNumber={nextSerialNumber}
      />

      <DeleteConfirmModal
        isOpen={!!recordToDelete}
        record={recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirm={(id) => {
          handleDeleteRecord(id);
          setRecordToDelete(null);
        }}
      />

      <SupabaseStatusModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        syncStatus={syncStatus}
        records={records}
        onRefreshFromBackend={refreshFromBackend}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(profile) => {
          setCurrentUserProfile(profile);
          if (profile.role === 'admin' || profile.role === 'super_admin') {
            setCurrentAdmin({
              phone: profile.phone || profile.email || '03008658360',
              name: profile.fullName,
              role: profile.role === 'super_admin' ? 'main_admin' : 'admin'
            });
          }
          fetchUserSavedOpportunityIds(profile.id).then((ids) => setSavedRecordIds(ids));
          showToast(`خوش آمدید! ${profile.fullName} سُپابیس سائن ان مکمل`);
        }}
      />

      <SavedOpportunitiesDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedRecords={records.filter((r) => savedRecordIds.includes(r.id))}
        onRemoveBookmark={(id) => {
          const userId = currentUserProfile?.id || 'guest';
          removeOpportunityBookmark(userId, id);
          setSavedRecordIds((prev) => prev.filter((item) => item !== id));
          showToast('محفوظ فہرست سے رشتہ نکال دیا گیا');
        }}
        onViewRecord={(rec) => {
          setIsSavedDrawerOpen(false);
          setSelectedRecordForDetail(rec);
        }}
      />

      <ProposalApplicationModal
        isOpen={isProposalModalOpen}
        onClose={() => {
          setIsProposalModalOpen(false);
          setProposalTargetRecord(null);
        }}
        targetRecord={proposalTargetRecord}
        currentUser={currentUserProfile}
        onSuccess={() => {
          fetchAllApplications().then((apps) => setApplications(apps));
          showToast('رشتہ کی درخواست سُپابیس میں کامیابی سے جمع ہو گئی!');
        }}
      />
    </div>
  );
}
