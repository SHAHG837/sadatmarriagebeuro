import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Heart, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  MapPin, 
  BrainCircuit, 
  Bot, 
  Copy, 
  Check, 
  GraduationCap, 
  Briefcase,
  Share2,
  PlusCircle,
  ArrowRightLeft,
  Filter,
  RefreshCw
} from 'lucide-react';
import { SadatRecord, AdminUser } from '../types/record';
import { calculateMatches, autoMatchAllRishtey } from '../utils/matchingEngine';

interface CompatibilityMatchViewProps {
  records: SadatRecord[];
  currentAdmin: AdminUser | null;
  targetRecordId?: string | null;
  onViewRecord: (record: SadatRecord) => void;
  onOpenNewRecord?: () => void;
}

export const CompatibilityMatchView: React.FC<CompatibilityMatchViewProps> = ({
  records,
  currentAdmin,
  targetRecordId,
  onViewRecord,
  onOpenNewRecord
}) => {
  // Main engine view: 'all_pairs' (Auto-Match All Rishtey) | 'single' (Candidate-by-Candidate)
  const [engineMode, setEngineMode] = useState<'all_pairs' | 'single'>('all_pairs');
  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    targetRecordId || records[0]?.id || ''
  );
  const [viewMode, setViewMode] = useState<'standard' | 'ai'>('ai');
  const [copiedJointProposal, setCopiedJointProposal] = useState<string | null>(null);
  const [copiedAiPrompt, setCopiedAiPrompt] = useState<string | null>(null);
  const [minScoreFilter, setMinScoreFilter] = useState<number>(60);

  useEffect(() => {
    if (targetRecordId && records.some((r) => r.id === targetRecordId)) {
      setSelectedRecordId(targetRecordId);
      setEngineMode('single');
    } else if (records.length > 0 && !records.some((r) => r.id === selectedRecordId)) {
      setSelectedRecordId(records[0].id);
    }
  }, [targetRecordId, records]);

  // Global pairs computed by AI
  const allMatchedPairs = useMemo(() => {
    return autoMatchAllRishtey(records);
  }, [records]);

  const filteredPairs = useMemo(() => {
    return allMatchedPairs.filter((p) => p.score >= minScoreFilter);
  }, [allMatchedPairs, minScoreFilter]);

  const boysCount = useMemo(() => records.filter((r) => r.gender === 'لڑکا').length, [records]);
  const girlsCount = useMemo(() => records.filter((r) => r.gender === 'لڑکی').length, [records]);

  const selectedRecord = records.find((r) => r.id === selectedRecordId) || records[0];
  const singleCandidateMatches = selectedRecord ? calculateMatches(selectedRecord, records) : [];

  const handleCopyJointProposal = (pair: {
    boy: SadatRecord;
    girl: SadatRecord;
    score: number;
    matchReasons: string[];
    aiSummary: string;
  }) => {
    const text = `*بسم اللہ الرحمن الرحیم*
*شعبہ کفاءت السادات - بین الاقوامی تنظیم السادات (ISO)*
*AI خودکار رشتہ کفاءت تجویز و میچنگ رپورٹ*
---------------------------------------
💍 *کفاءت و مطابقت اسکور:* ${pair.score}% (انتہائی موزوں)

🤵 *امیدوار لڑکا (#${pair.boy.serialNumber}):*
• نام: ${pair.boy.name}
• عمر: ${pair.boy.age} سال | قد: ${pair.boy.height || 'معمول'}
• شہر: ${pair.boy.currentCity} (آبائی: ${pair.boy.nativeCity || pair.boy.currentCity})
• تعلیم: ${pair.boy.qualification}
• پیشہ/ملازمت: ${pair.boy.rankPosition || 'برسرِ روزگار'}
• مسلک و کاسٹ: ${pair.boy.maslak} (${pair.boy.caste})

👰 *امیدوار لڑکی (#${pair.girl.serialNumber}):*
• نام: ${currentAdmin ? pair.girl.name : 'سیدہ (مستورات)'}
• عمر: ${pair.girl.age} سال | قد: ${pair.girl.height || 'معمول'}
• شہر: ${pair.girl.currentCity} (آبائی: ${pair.girl.nativeCity || pair.girl.currentCity})
• تعلیم: ${pair.girl.qualification}
• مسلک و کاسٹ: ${pair.girl.maslak} (${pair.girl.caste})

🌟 *اہم وجوہاتِ کفاءت و مطابقت:*
${pair.matchReasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}

🤖 *AI تجزیاتی رائے:*
${pair.aiSummary}
---------------------------------------
رابطہ برائے تصدیق و گفتگو:
شعبہ کفاءت السادات رابطہ ڈیسک
0300 8658360 / 0300 6667500 / 0306 6238755`;

    navigator.clipboard.writeText(text);
    setCopiedJointProposal(`${pair.boy.id}_${pair.girl.id}`);
    setTimeout(() => setCopiedJointProposal(null), 3000);
  };

  const handleCopyAiAnalysis = (cand: SadatRecord, score: number, reasons: string[]) => {
    const promptText = `سادات رشتہ مطابقت برائے AI تجزیہ:
امیدوار 1: #${selectedRecord.serialNumber} (${selectedRecord.gender}) - عمر: ${selectedRecord.age} سال، شہر: ${selectedRecord.currentCity}، مسلک: ${selectedRecord.maslak}، تعلیم: ${selectedRecord.qualification}
امیدوار 2: #${cand.serialNumber} (${cand.gender}) - عمر: ${cand.age} سال، شہر: ${cand.currentCity}، مسلک: ${cand.maslak}، تعلیم: ${cand.qualification}
کفاءت اسکور: ${score}%
عواملِ مطابقت:
${reasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}
خلاصہ برائے شعبہ کفاءت السادات (بین الاقوامی تنظیم السادات ISO)`;

    navigator.clipboard.writeText(promptText);
    setCopiedAiPrompt(cand.id);
    setTimeout(() => setCopiedAiPrompt(null), 2500);
  };

  // If no records in database
  if (records.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 text-center mb-8">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-emerald-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-200">
          <BrainCircuit className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 font-amiri mb-2">
          خودکار AI رشتہ و کفاءت میچنگ انجن (Auto AI Matchmaker)
        </h3>
        <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed mb-6 font-arabic">
          تمام ڈمی ریکارڈز ری سیٹ کر دیے گئے ہیں اور ڈیش بورڈ فی الحال بالکل خالی ہے۔ جیسے ہی ایڈمن لڑکوں اور لڑکیوں کے سادات ریکارڈز درج کرے گا، AI انجن خودکار طور پر دونوں اطراف کے کوائف جانچ کر فوری رشتے میچ کر دے گا۔
        </p>
        {onOpenNewRecord && currentAdmin && (
          <button
            onClick={onOpenNewRecord}
            className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-amber-200 text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>پہلا سادات رشتہ درج کریں</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-slate-200/80 mb-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xl text-emerald-950 font-amiri">
                خودکار AI رشتہ و کفاءت میچنگ انجن
              </h3>
              <span className="text-[10px] bg-gradient-to-r from-purple-700 to-indigo-700 text-white font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                <BrainCircuit className="w-3 h-3 text-amber-300" />
                <span>AI Auto-Matchmaker</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              لڑکے اور لڑکیوں کے کوائف (مسلک، عمر، شہر، تعلیم، شجرہ) کا خودکار AI تجزیہ اور باہم موزوں ترین رشتے
            </p>
          </div>
        </div>

        {/* Engine Mode Tabs & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Engine mode switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setEngineMode('all_pairs')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                engineMode === 'all_pairs'
                  ? 'bg-gradient-to-r from-purple-700 to-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-300" />
              <span>خودکار باہمی رشتے ({filteredPairs.length})</span>
            </button>
            <button
              onClick={() => setEngineMode('single')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                engineMode === 'single'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-700" />
              <span>انفرادی امیدوار وار</span>
            </button>
          </div>

          {/* AI vs Standard Details */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('ai')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                viewMode === 'ai' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI سفارشات</span>
            </button>
            <button
              onClick={() => setViewMode('standard')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                viewMode === 'standard' ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-600'
              }`}
            >
              مختصر جائزہ
            </button>
          </div>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-xs">
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3 flex items-center justify-between">
          <span className="text-blue-900 font-medium">رجسٹرڈ لڑکے:</span>
          <strong className="text-base text-blue-950 font-bold">{boysCount}</strong>
        </div>
        <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-3 flex items-center justify-between">
          <span className="text-rose-900 font-medium">رجسٹرڈ لڑکیاں:</span>
          <strong className="text-base text-rose-950 font-bold">{girlsCount}</strong>
        </div>
        <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-3 flex items-center justify-between">
          <span className="text-purple-900 font-medium">AI خودکار تجاویز:</span>
          <strong className="text-base text-purple-950 font-bold">{allMatchedPairs.length} جوڑے</strong>
        </div>
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 flex items-center justify-between">
          <span className="text-emerald-900 font-medium">کفاءت معیار فلٹر:</span>
          <select
            value={minScoreFilter}
            onChange={(e) => setMinScoreFilter(Number(e.target.value))}
            className="bg-white border border-emerald-300 rounded-lg px-2 py-0.5 text-xs font-bold text-emerald-950 focus:outline-none"
          >
            <option value={50}>50% یا زائد</option>
            <option value={60}>60% یا زائد</option>
            <option value={70}>70% یا زائد</option>
            <option value={80}>80% یا زائد (اعلیٰ ترین)</option>
          </select>
        </div>
      </div>

      {/* ALL PAIRS MODE (AI AUTO-MATCHMAKER) */}
      {engineMode === 'all_pairs' ? (
        <div>
          {boysCount === 0 || girlsCount === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 text-xs">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="font-bold text-slate-700 text-sm">باہمی رشتہ میچنگ کے لیے دونوں حصوں میں اندراج ضروری ہے</p>
              <p className="mt-1">
                اس وقت {boysCount === 0 ? 'لڑکوں' : 'لڑکیوں'} کا کوئی ریکارڈ موجود نہیں ہے۔ جیسے ہی ایڈمن دونوں اصناف کے سادات ریکارڈز درج کرے گا، AI فوری طور پر ہم آہنگ رشتے تجویز کر دے گا۔
              </p>
            </div>
          ) : filteredPairs.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 text-xs">
              <Filter className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-bold text-slate-700">اس فلٹر ({minScoreFilter}%) پر کوئی جوڑا نہیں ملا</p>
              <p className="mt-1">برائے مہربانی کفاءت معیار کا تناسب 50% یا 60% کر کے دیکھیں۔</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2">
                <span>
                  دکھائے جا رہے ہیں: <strong>{filteredPairs.length}</strong> خودکار AI رشتہ تجاویز (سب سے زیادہ مطابقت پہلے)
                </span>
                <span className="text-[11px] text-purple-700 font-medium">
                  ایک کلک سے مشترکہ واٹس ایپ پروپوزل تیار کریں
                </span>
              </div>

              {filteredPairs.map((pair, index) => {
                const pairKey = `${pair.boy.id}_${pair.girl.id}`;
                const isCopied = copiedJointProposal === pairKey;
                const ageDiff = pair.boy.age - pair.girl.age;

                return (
                  <div
                    key={pair.id}
                    className="bg-white rounded-2xl p-5 border-2 border-slate-200/90 hover:border-purple-400 shadow-sm hover:shadow-md transition relative overflow-hidden"
                  >
                    {/* Top Ribbon */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold bg-slate-900 text-amber-300 px-2.5 py-1 rounded-xl">
                          تجویز #{index + 1}
                        </span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-xl text-white ${
                          pair.score >= 85
                            ? 'bg-emerald-600'
                            : pair.score >= 70
                            ? 'bg-purple-700'
                            : 'bg-amber-600'
                        }`}>
                          کفاءت اسکور: {pair.score}%
                        </span>
                        {pair.boy.currentCity === pair.girl.currentCity && (
                          <span className="text-[11px] bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-lg font-medium">
                            ایک ہی شہر ({pair.boy.currentCity})
                          </span>
                        )}
                        {pair.boy.maslak === pair.girl.maslak && (
                          <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg font-medium">
                            یکساں مسلک ({pair.boy.maslak})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyJointProposal(pair)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                            isCopied
                              ? 'bg-emerald-700 text-white'
                              : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200'
                          }`}
                          title="مشترکہ رشتہ رپورٹ کاپی کریں"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>کاپی ہو گیا!</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3.5 h-3.5 text-purple-600" />
                              <span>واٹس ایپ رشتہ تجویز</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Both Profiles Side-by-Side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Boy Column */}
                      <div className="bg-blue-50/50 border border-blue-200/80 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold bg-blue-700 text-white px-2 py-0.5 rounded-lg">
                              #{pair.boy.serialNumber}
                            </span>
                            <span className="text-xs font-bold text-blue-900">لڑکا (امیدوار)</span>
                          </div>
                          <button
                            onClick={() => onViewRecord(pair.boy)}
                            className="text-[11px] text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>فائل کھولیں</span>
                          </button>
                        </div>

                        <h4 className="font-bold text-base text-slate-900 font-amiri mb-1">
                          {pair.boy.name}
                        </h4>

                        <div className="text-xs text-slate-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <span>عمر: <strong>{pair.boy.age} سال</strong></span>
                            <span>•</span>
                            <span>شہر: <strong>{pair.boy.currentCity}</strong></span>
                            <span>•</span>
                            <span>قد: <strong>{pair.boy.height || 'معمول'}</strong></span>
                          </div>
                          <div>تعلیم: <strong>{pair.boy.qualification}</strong></div>
                          <div>پیشہ/رینک: <strong>{pair.boy.rankPosition || 'برسرِ روزگار'}</strong></div>
                          <div>مسلک و کاسٹ: <strong className="text-emerald-800">{pair.boy.maslak} • {pair.boy.caste}</strong></div>
                        </div>
                      </div>

                      {/* Girl Column */}
                      <div className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold bg-rose-700 text-white px-2 py-0.5 rounded-lg">
                              #{pair.girl.serialNumber}
                            </span>
                            <span className="text-xs font-bold text-rose-900">لڑکی (امیدوار)</span>
                          </div>
                          <button
                            onClick={() => onViewRecord(pair.girl)}
                            className="text-[11px] text-rose-700 hover:text-rose-900 font-bold flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>فائل کھولیں</span>
                          </button>
                        </div>

                        <h4 className="font-bold text-base text-slate-900 font-amiri mb-1">
                          {currentAdmin ? pair.girl.name : 'سیدہ (مستورات)'}
                        </h4>

                        <div className="text-xs text-slate-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <span>عمر: <strong>{pair.girl.age} سال</strong></span>
                            <span>•</span>
                            <span>شہر: <strong>{pair.girl.currentCity}</strong></span>
                            <span>•</span>
                            <span>قد: <strong>{pair.girl.height || 'معمول'}</strong></span>
                          </div>
                          <div>تعلیم: <strong>{pair.girl.qualification}</strong></div>
                          <div>حیثیت: <strong>{pair.girl.maritalStatus}</strong></div>
                          <div>مسلک و کاسٹ: <strong className="text-emerald-800">{pair.girl.maslak} • {pair.girl.caste}</strong></div>
                        </div>
                      </div>
                    </div>

                    {/* AI Insights & Reasons */}
                    <div className="bg-purple-50/50 border border-purple-200/60 rounded-xl p-3.5 text-xs text-purple-950">
                      <div className="flex items-center justify-between font-bold text-purple-900 mb-2 border-b border-purple-200/50 pb-1">
                        <span className="flex items-center gap-1.5">
                          <Bot className="w-4 h-4 text-purple-700" />
                          <span>AI کفاءت و مطابقت تجزیہ:</span>
                        </span>
                        <span className="text-[11px] font-normal text-purple-800">
                          عمر میں فرق: <strong>{Math.abs(ageDiff)} سال</strong> ({ageDiff >= 1 && ageDiff <= 7 ? 'مثالی تفاوت' : 'قابل قبول'})
                        </span>
                      </div>

                      <div className="space-y-1 mb-2">
                        {pair.matchReasons.map((reason, rIdx) => (
                          <div key={rIdx} className="flex items-center gap-1.5 text-emerald-900 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>

                      <p className="text-[11px] text-purple-900/90 leading-relaxed bg-white/80 p-2 rounded-lg border border-purple-100">
                        {pair.aiSummary}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* SINGLE CANDIDATE MATCHER MODE */
        <div>
          {/* Target Selector */}
          <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700">امیدوار منتخب کریں:</label>
              <select
                value={selectedRecordId}
                onChange={(e) => setSelectedRecordId(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                {records.map((r) => (
                  <option key={r.id} value={r.id}>
                    #{r.serialNumber} - {r.gender === 'لڑکی' && !currentAdmin ? 'سیدہ (مستورات)' : r.name} ({r.gender} • {r.currentCity} • {r.age} سال)
                  </option>
                ))}
              </select>
            </div>

            {selectedRecord && (
              <div className="text-xs text-slate-500">
                مخالف صنف کے دستیاب ریکارڈز: <strong>{singleCandidateMatches.length}</strong>
              </div>
            )}
          </div>

          {selectedRecord && (
            <div className="space-y-6">
              {/* Target Profile Summary Strip */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold bg-amber-400 text-emerald-950 px-3 py-1 rounded-xl shadow-xs">
                    #{selectedRecord.serialNumber}
                  </span>
                  <div>
                    <h4 className="font-bold text-base text-amber-200">
                      {selectedRecord.gender === 'لڑکی' && !currentAdmin ? 'سیدہ (مستورات)' : selectedRecord.name}
                    </h4>
                    <div className="text-xs text-emerald-100 flex items-center gap-3 mt-0.5 flex-wrap">
                      <span>جنس: <strong>{selectedRecord.gender}</strong></span>
                      <span>•</span>
                      <span>عمر: <strong>{selectedRecord.age} سال</strong></span>
                      <span>•</span>
                      <span>شہر: <strong>{selectedRecord.currentCity}</strong></span>
                      <span>•</span>
                      <span>مسلک: <strong>{selectedRecord.maslak}</strong></span>
                      <span>•</span>
                      <span>تعلیم: <strong>{selectedRecord.qualification}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="text-xs bg-black/25 p-2.5 rounded-xl border border-white/10 text-emerald-200 max-w-md">
                  <span className="font-bold text-amber-300 block mb-0.5">مطلوبہ ترجیحات:</span>
                  <span className="line-clamp-2">
                    عمر: {selectedRecord.reqAgeRange || 'مناسب'} | شہر: {selectedRecord.reqCity || 'کھلا'} | تعلیم: {selectedRecord.reqQualification || 'تعلیم یافتہ'}
                  </span>
                </div>
              </div>

              {/* Single Matches List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {singleCandidateMatches.map((item) => {
                  const cand = item.record;
                  const isFemaleCand = cand.gender === 'لڑکی';
                  const candDisplayName = isFemaleCand && !currentAdmin ? 'سیدہ (مستورات)' : cand.name;
                  const ageDifference = selectedRecord.gender === 'لڑکا' 
                    ? selectedRecord.age - cand.age 
                    : cand.age - selectedRecord.age;

                  return (
                    <div
                      key={cand.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-600/60 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        {/* Top bar with score badge */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold bg-slate-900 text-amber-300 px-2.5 py-0.5 rounded-lg">
                              #{cand.serialNumber}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                              isFemaleCand ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
                            }`}>
                              {cand.gender}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold px-3 py-1 rounded-xl shadow-xs ${
                              item.score >= 85
                                ? 'bg-emerald-600 text-white'
                                : item.score >= 70
                                ? 'bg-amber-500 text-white'
                                : 'bg-slate-600 text-white'
                            }`}>
                              {item.score}% کفاءت و مطابقت
                            </span>
                          </div>
                        </div>

                        {/* Candidate info */}
                        <div className="mb-3">
                          <h5 className="font-bold text-base text-slate-900 font-amiri">
                            {candDisplayName}
                          </h5>
                          <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                            <span>عمر: <strong>{cand.age} سال</strong></span>
                            <span>•</span>
                            <span>شہر: <strong>{cand.currentCity}</strong></span>
                            <span>•</span>
                            <span>قد: <strong>{cand.height || '—'}</strong></span>
                          </div>
                        </div>

                        {/* AI Analysis Box */}
                        {viewMode === 'ai' && (
                          <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-100 mb-3 space-y-2 text-xs">
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div className="bg-white p-2 rounded-lg border border-purple-100">
                                <span className="text-slate-400 block text-[10px]">مسلک ہم آہنگی:</span>
                                <strong className="text-emerald-700">
                                  {selectedRecord.maslak === cand.maslak ? 'مکمل مطابقت (۱۰۰٪)' : 'قابل غور'}
                                </strong>
                              </div>
                              <div className="bg-white p-2 rounded-lg border border-purple-100">
                                <span className="text-slate-400 block text-[10px]">عمر کا تناسب:</span>
                                <strong className="text-slate-800">
                                  {Math.abs(ageDifference)} سال فرق
                                </strong>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Match reasons */}
                        <div className="space-y-1 text-xs mb-4">
                          <div className="text-[11px] font-bold text-emerald-900">وجوہاتِ موافقت:</div>
                          {item.matchReasons.map((reason, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-emerald-800 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewRecord(cand)}
                          className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-amber-200 text-xs font-bold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>مکمل فائل ملاحظہ کریں</span>
                        </button>

                        <button
                          onClick={() => handleCopyAiAnalysis(cand, item.score, item.matchReasons)}
                          title="AI سفارش خلاصہ کاپی کریں"
                          className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0"
                        >
                          {copiedAiPrompt === cand.id ? (
                            <Check className="w-3.5 h-3.5 text-purple-700" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
