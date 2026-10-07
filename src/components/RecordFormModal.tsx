import React, { useState, useEffect, useRef } from 'react';
import { X, Save, ShieldAlert, Sparkles, User, GraduationCap, Briefcase, Home, Users, MapPin, Heart, Upload, FileText } from 'lucide-react';
import { SadatRecord, Gender } from '../types/record';
import { PAKISTAN_CITIES } from '../data/initialRecords';
import { parseWhatsAppText } from '../utils/whatsappHelper';
import { getNextSerialForGender } from '../utils/serialHelper';

interface RecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: SadatRecord) => void;
  initialData?: SadatRecord | null;
  existingRecords?: SadatRecord[];
  nextSerialNumber?: string;
  defaultGender?: Gender;
}

export const RecordFormModal: React.FC<RecordFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingRecords = [],
  nextSerialNumber,
  defaultGender = 'لڑکی'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateInitialSerial = (gender: Gender) => {
    return getNextSerialForGender(gender, existingRecords);
  };

  const [formData, setFormData] = useState<Partial<SadatRecord>>({
    serialNumber: calculateInitialSerial(defaultGender),
    gender: defaultGender,
    name: '',
    age: 24,
    fatherName: '',
    height: '5 فٹ 4 انچ',
    disability: 'نہیں',
    maritalStatus: 'غیر شادی شدہ',
    qualification: '',
    college: '',
    university: '',
    rankPosition: '',
    income: '',
    jobNature: '',
    futurePlans: '',
    religion: 'اسلام',
    caste: 'سید',
    maslak: 'اہلسنت',
    house: 'ذاتی',
    houseSize: '10 مرلہ',
    houseLocation: '',
    otherProperties: '',
    fatherOccupation: '',
    sistersCount: 0,
    brothersCount: 0,
    marriedSiblings: '',
    currentCity: 'لاہور',
    nativeCity: '',
    reqMaritalStatus: 'غیر شادی شدہ',
    reqAgeRange: '',
    reqHeight: '',
    reqCity: '',
    reqMaslak: 'اہلسنت',
    reqMotherTongue: 'اردو',
    reqQualification: '',
    reqResidence: '',
    reqOtherDemands: '',
    remarks: '',
    contactNumber: '',
    status: 'فعال'
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      const g = defaultGender || 'لڑکی';
      const serial = calculateInitialSerial(g);
      setFormData({
        serialNumber: serial,
        gender: g,
        name: '',
        age: 24,
        fatherName: '',
        height: '5 فٹ 4 انچ',
        disability: 'نہیں',
        maritalStatus: 'غیر شادی شدہ',
        qualification: '',
        college: '',
        university: '',
        rankPosition: '',
        income: '',
        jobNature: '',
        futurePlans: '',
        religion: 'اسلام',
        caste: 'سید',
        maslak: 'اہلسنت',
        house: 'ذاتی',
        houseSize: '10 مرلہ',
        houseLocation: '',
        otherProperties: '',
        fatherOccupation: '',
        sistersCount: 0,
        brothersCount: 0,
        marriedSiblings: '',
        currentCity: 'لاہور',
        nativeCity: '',
        reqMaritalStatus: 'غیر شادی شدہ',
        reqAgeRange: '',
        reqHeight: '',
        reqCity: '',
        reqMaslak: 'اہلسنت',
        reqMotherTongue: 'اردو',
        reqQualification: '',
        reqResidence: '',
        reqOtherDemands: '',
        remarks: '',
        contactNumber: '',
        status: 'فعال'
      });
    }
  }, [initialData, defaultGender, isOpen, existingRecords.length]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const recordToSave: SadatRecord = {
      id: initialData?.id || `rec-${Date.now()}`,
      serialNumber: formData.serialNumber || nextSerialNumber || getNextSerialForGender((formData.gender as Gender) || 'لڑکی', existingRecords),
      gender: (formData.gender as Gender) || 'لڑکی',
      name: formData.name || (formData.gender === 'لڑکی' ? 'سیدہ' : 'سید'),
      age: Number(formData.age) || 24,
      fatherName: formData.fatherName || 'سید صاحب',
      height: formData.height || '',
      disability: formData.disability || 'نہیں',
      maritalStatus: formData.maritalStatus || 'غیر شادی شدہ',
      qualification: formData.qualification || 'گریجویشن',
      college: formData.college || '',
      university: formData.university || '',
      rankPosition: formData.rankPosition || '',
      income: formData.income || '',
      jobNature: formData.jobNature || '',
      futurePlans: formData.futurePlans || '',
      religion: formData.religion || 'اسلام',
      caste: formData.caste || 'سید',
      maslak: formData.maslak || 'اہلسنت',
      house: formData.house || 'ذاتی',
      houseSize: formData.houseSize || '',
      houseLocation: formData.houseLocation || '',
      otherProperties: formData.otherProperties || '',
      fatherOccupation: formData.fatherOccupation || '',
      sistersCount: Number(formData.sistersCount) || 0,
      brothersCount: Number(formData.brothersCount) || 0,
      marriedSiblings: formData.marriedSiblings || '',
      currentCity: formData.currentCity || 'لاہور',
      nativeCity: formData.nativeCity || '',
      reqMaritalStatus: formData.reqMaritalStatus || 'غیر شادی شدہ',
      reqAgeRange: formData.reqAgeRange || '',
      reqHeight: formData.reqHeight || '',
      reqCity: formData.reqCity || '',
      reqMaslak: formData.reqMaslak || 'اہلسنت',
      reqMotherTongue: formData.reqMotherTongue || 'اردو',
      reqQualification: formData.reqQualification || '',
      reqResidence: formData.reqResidence || '',
      reqOtherDemands: formData.reqOtherDemands || '',
      remarks: formData.remarks || '',
      contactNumber: formData.contactNumber || '',
      status: formData.status || 'فعال',
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(recordToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-emerald-800/30 overflow-hidden my-auto max-h-[92vh] flex flex-col text-right">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-5 flex items-center justify-between border-b border-amber-500/30 shrink-0">
          <div>
            <h2 className="text-lg md:text-xl font-bold font-amiri text-amber-200">
              {initialData ? `ریکارڈ ترمیم کریں: #${initialData.serialNumber}` : 'شعبہ کفاءت السادات - نیا ریکارڈ اندراج'}
            </h2>
            <p className="text-xs text-emerald-200">
              سادات فیملی کے کوائف بمع ضروریات و مطابقت فارم
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".txt,text/plain"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const text = (event.target?.result as string) || '';
                    const parsed = parseWhatsAppText(text);
                    setFormData((prev) => ({
                      ...prev,
                      ...parsed,
                      serialNumber: parsed.serialNumber || prev.serialNumber || nextSerialNumber
                    }));
                  };
                  reader.readAsText(file);
                }
              }}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="ٹیکسٹ فائل منتخب کر کے تمام خانے خودکار پر کریں"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>ٹیکسٹ فائل (.txt) سے بھریں</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-2 rounded-xl hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-sm font-arabic">
          
          {/* Top Basic Controls */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                سیریل نمبر (Serial No):
              </label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                dir="ltr"
              />
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                خواتین برائے FM001 اور مرد حضرات برائے M001
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                پورشن / جنس (Portion):
              </label>
              <select
                value={formData.gender}
                onChange={(e) => {
                  const newGender = e.target.value as Gender;
                  const newSerial = !initialData 
                    ? getNextSerialForGender(newGender, existingRecords) 
                    : formData.serialNumber;
                  setFormData({ 
                    ...formData, 
                    gender: newGender,
                    serialNumber: newSerial 
                  });
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none text-emerald-950"
              >
                <option value="لڑکی">حصہ مستورات (لڑکی / خاتون - FM)</option>
                <option value="لڑکا">حصہ مردانہ (لڑکا / مرد - M)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                حیثیت ریکارڈ (Status):
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="فعال">فعال (Active)</option>
                <option value="زیر غور">زیر غور (In Progress)</option>
                <option value="طے پا گیا">طے پا گیا (Completed)</option>
              </select>
            </div>
          </div>

          {/* 1⃣ ذاتی معلومات */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="font-bold text-emerald-900 border-b pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-700" />
              <span>1⃣ ذاتی معلومات</span>
              {formData.gender === 'لڑکی' && (
                <span className="text-[11px] font-normal text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  خواتین کا نام و فون پبلک منظر میں صیغہ راز میں رہتا ہے
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1">2: نام (سید / سیدہ):</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثلاً: سیدہ فاطمہ نقوی / سید علی رضا"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">3: عمر (سال):</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">4: والد محترم کا نام:</label>
                <input
                  type="text"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  placeholder="سید مختار حسین"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">6: قد:</label>
                <input
                  type="text"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="مثلاً: 5 فٹ 4 انچ"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">7: معذوری ♿:</label>
                <input
                  type="text"
                  value={formData.disability}
                  onChange={(e) => setFormData({ ...formData, disability: e.target.value })}
                  placeholder="نہیں، الحمدللہ تندرست"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">5: ازدواجی حیثیت:</label>
                <select
                  value={formData.maritalStatus}
                  onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="غیر شادی شدہ">غیر شادی شدہ</option>
                  <option value="طلاق یافتہ">طلاق یافتہ</option>
                  <option value="بیوہ / رنڈوا">بیوہ / رنڈوا</option>
                  <option value="خلع یافتہ">خلع یافتہ</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2⃣ تعلیم کی تفصیلات */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="font-bold text-emerald-900 border-b pb-2 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>2⃣ تعلیم کی تفصیلات</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1">1: اہلیت (ڈگری):</label>
                <input
                  type="text"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="مثلاً: ایم ایس سی / بی ایس / ایم بی بی ایس"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">2: کالج:</label>
                <input
                  type="text"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  placeholder="کالج کا نام"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">3: یونیورسٹی:</label>
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  placeholder="یونیورسٹی کا نام"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* 3⃣ ملازمت کی تفصیلات */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="font-bold text-emerald-900 border-b pb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-600" />
              <span>3⃣ ملازمت کی تفصیلات</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1">1: رینک/پوزیشن:</label>
                <input
                  type="text"
                  value={formData.rankPosition}
                  onChange={(e) => setFormData({ ...formData, rankPosition: e.target.value })}
                  placeholder="سافٹ ویئر انجینئر / ٹیچر / بزنس"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">2: ماہانہ آمدنی:</label>
                <input
                  type="text"
                  value={formData.income}
                  onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                  placeholder="مثلاً: 1,50,000 روپے"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">3: نوعیت:</label>
                <input
                  type="text"
                  value={formData.jobNature}
                  onChange={(e) => setFormData({ ...formData, jobNature: e.target.value })}
                  placeholder="سرکاری / پرائیویٹ / کاروبار"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">4: مستقبل کے منصوبے:</label>
                <input
                  type="text"
                  value={formData.futurePlans}
                  onChange={(e) => setFormData({ ...formData, futurePlans: e.target.value })}
                  placeholder="مستقبل کے منصوبے"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* 4⃣ مذہب و شجرہ */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="font-bold text-emerald-900 border-b pb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>4⃣ مذہب و شجرہ نسب</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1">1: مذہب:</label>
                <input
                  type="text"
                  value={formData.religion}
                  onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">2: کاسٹ (سادات شجرہ):</label>
                <input
                  type="text"
                  value={formData.caste}
                  onChange={(e) => setFormData({ ...formData, caste: e.target.value })}
                  placeholder="سید نقوی / بخاری / کاظمی / رضوی"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">3: مسلک:</label>
                <select
                  value={formData.maslak}
                  onChange={(e) => setFormData({ ...formData, maslak: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="اہلسنت">اہلسنت</option>
                  <option value="اہل تشیع">اہل تشیع</option>
                </select>
              </div>
            </div>
          </div>

          {/* 5⃣ پراپرٹی و رہائش */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="font-bold text-emerald-900 border-b pb-2 flex items-center gap-2">
              <Home className="w-4 h-4 text-indigo-600" />
              <span>5⃣ پراپرٹی کی تفصیلات</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1">1: گھر:</label>
                <select
                  value={formData.house}
                  onChange={(e) => setFormData({ ...formData, house: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="ذاتی">ذاتی</option>
                  <option value="کرایہ">کرایہ</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">2: سائز:</label>
                <input
                  type="text"
                  value={formData.houseSize}
                  onChange={(e) => setFormData({ ...formData, houseSize: e.target.value })}
                  placeholder="10 مرلہ / 1 کنال"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">3: مقام:</label>
                <input
                  type="text"
                  value={formData.houseLocation}
                  onChange={(e) => setFormData({ ...formData, houseLocation: e.target.value })}
                  placeholder="علاقہ / کالونی"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">4: دیگر خواص:</label>
                <input
                  type="text"
                  value={formData.otherProperties}
                  onChange={(e) => setFormData({ ...formData, otherProperties: e.target.value })}
                  placeholder="زرعی زمین یا دکان وغیرہ"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* 6⃣ خاندانی تفصیلات */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="font-bold text-emerald-900 border-b pb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              <span>6⃣ خاندانی تفصیلات</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1">1: والد کا پیشہ:</label>
                <input
                  type="text"
                  value={formData.fatherOccupation}
                  onChange={(e) => setFormData({ ...formData, fatherOccupation: e.target.value })}
                  placeholder="ریٹائرڈ جج / بزنس / زمیندار"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">2: بہنوں کی تعداد:</label>
                <input
                  type="number"
                  value={formData.sistersCount}
                  onChange={(e) => setFormData({ ...formData, sistersCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">3: بھائیوں کی تعداد:</label>
                <input
                  type="number"
                  value={formData.brothersCount}
                  onChange={(e) => setFormData({ ...formData, brothersCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">4: شادی شدہ تفصیل:</label>
                <input
                  type="text"
                  value={formData.marriedSiblings}
                  onChange={(e) => setFormData({ ...formData, marriedSiblings: e.target.value })}
                  placeholder="1 بہن شادی شدہ"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* 7⃣ پتہ (شہر تفریق) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="font-bold text-emerald-900 border-b pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-600" />
              <span>7⃣ پتہ (پاکستان کے شہروں کی تقسیم)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1">1: موجودہ شہر (پاکستان):</label>
                <select
                  value={formData.currentCity}
                  onChange={(e) => setFormData({ ...formData, currentCity: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-emerald-950 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                >
                  {PAKISTAN_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">2: آبائی علاقہ یا شہر:</label>
                <input
                  type="text"
                  value={formData.nativeCity}
                  onChange={(e) => setFormData({ ...formData, nativeCity: e.target.value })}
                  placeholder="اوچ شریف، چکوال، تونسہ، وغیرہ"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* ضروریات برائے رشتہ (Requirements) */}
          <div className="bg-emerald-950/5 p-5 rounded-2xl border border-emerald-800/20 space-y-4">
            <div className="font-bold text-emerald-950 border-b border-emerald-900/15 pb-2 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-600 fill-rose-100" />
              <span>ضروریات برائے رشتہ (Requirements for Matching)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1">1: مطلوبہ ازدواجی حیثیت:</label>
                <input
                  type="text"
                  value={formData.reqMaritalStatus}
                  onChange={(e) => setFormData({ ...formData, reqMaritalStatus: e.target.value })}
                  placeholder="صرف غیر شادی شدہ"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">2: عمر کی حد:</label>
                <input
                  type="text"
                  value={formData.reqAgeRange}
                  onChange={(e) => setFormData({ ...formData, reqAgeRange: e.target.value })}
                  placeholder="25 تا 29 سال"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">3: قد:</label>
                <input
                  type="text"
                  value={formData.reqHeight}
                  onChange={(e) => setFormData({ ...formData, reqHeight: e.target.value })}
                  placeholder="5 فٹ 8 انچ یا زائد"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">4: مطلوبہ شہر:</label>
                <input
                  type="text"
                  value={formData.reqCity}
                  onChange={(e) => setFormData({ ...formData, reqCity: e.target.value })}
                  placeholder="لاہور، اسلام آباد یا کوئی بھی بڑا شہر"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">5: مسلک:</label>
                <select
                  value={formData.reqMaslak}
                  onChange={(e) => setFormData({ ...formData, reqMaslak: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="اہلسنت">اہلسنت</option>
                  <option value="اہل تشیع">اہل تشیع</option>
                  <option value="اہلسنت / اہل تشیع دونوں">دونوں قابل قبول</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">6: مادری زبان:</label>
                <input
                  type="text"
                  value={formData.reqMotherTongue}
                  onChange={(e) => setFormData({ ...formData, reqMotherTongue: e.target.value })}
                  placeholder="اردو / پنجابی"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">7: اہلیت:</label>
                <input
                  type="text"
                  value={formData.reqQualification}
                  onChange={(e) => setFormData({ ...formData, reqQualification: e.target.value })}
                  placeholder="گریجویشن، ماسٹرز یا پروفیشنل"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">8: رہائش:</label>
                <input
                  type="text"
                  value={formData.reqResidence}
                  onChange={(e) => setFormData({ ...formData, reqResidence: e.target.value })}
                  placeholder="ذاتی مکان"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">11: رابطہ نمبر (Admin Only for females):</label>
                <input
                  type="text"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  placeholder="03001234567"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-600"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1">9: کوئی اور مطالبہ:</label>
                <input
                  type="text"
                  value={formData.reqOtherDemands}
                  onChange={(e) => setFormData({ ...formData, reqOtherDemands: e.target.value })}
                  placeholder="دیندار، صوم و صلوٰۃ کا پابند"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">10: ریمارکس:</label>
                <input
                  type="text"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="معزز خاندانی سادات"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold transition"
            >
              منسوخ کریں
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-amber-200 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>ریکارڈ محفوظ کریں</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
