export type Gender = 'لڑکا' | 'لڑکی';

export interface SadatRecord {
  id: string;
  serialNumber: string; // e.g. '001', '002', '003'
  gender: Gender;
  name: string; // In female record, hidden in public view
  age: number;
  fatherName: string;
  height: string;
  disability: string; // e.g. 'نہیں / الحمدللہ تندرست'
  maritalStatus: string; // e.g. 'غیر شادی شدہ', 'طلاق یافتہ', 'بیوہ / رنڈوا'
  
  // 2: تعلیم کی تفصیلات
  qualification: string; // اہلیت
  college: string; // کالج
  university: string; // یونیورسٹی

  // 3: ملازمت کی تفصیلات
  rankPosition: string; // رینک/پوزیشن
  income: string; // آمدنی
  jobNature: string; // ملازمت کی نوعیت
  futurePlans: string; // مستقبل کے منصوبے

  // 4: مذہب کی تفصیلات
  religion: string; // اسلام
  caste: string; // سید (نقوی، بخاری، کاظمی، رضوی، زیدی، ترمذی، وغیرہ)
  maslak: string; // اہلسنت / اہل تشیع

  // 5: پراپرٹی کی تفصیلات
  house: string; // ذاتی / کرایہ
  houseSize: string; // سائز (مرلہ / کنال)
  houseLocation: string; // مقام
  otherProperties: string; // دیگر خواص

  // 6: خاندانی تفصیلات
  fatherOccupation: string; // والد کا پیشہ
  sistersCount: number; // بہنوں کی تعداد
  brothersCount: number; // بھائیوں کی تعداد
  marriedSiblings: string; // شادی شدہ بہن بھائی

  // 7: پتہ
  currentCity: string; // موجودہ شہر
  nativeCity: string; // آبائی علاقہ یا شہر

  // ضروریات برائے رشتہ
  reqMaritalStatus: string; // ازدواجی حیثیت
  reqAgeRange: string; // عمر کی حد (مثلاً 22 تا 27)
  reqHeight: string; // قد
  reqCity: string; // مطلوبہ شہر
  reqMaslak: string; // مسلک
  reqMotherTongue: string; // مادری زبان
  reqQualification: string; // اہلیت
  reqResidence: string; // رہائش
  reqOtherDemands: string; // کوئی اور مطالبہ
  remarks: string; // ریمارکس
  contactNumber: string; // رابطہ نمبر (خواتین کے لیے پبلک میں مخفی)

  status: 'فعال' | 'زیر غور' | 'طے پا گیا';
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  phone: string;
  name: string;
  role: 'main_admin' | 'admin';
}

export interface MatchResult {
  record: SadatRecord;
  score: number; // 0 - 100
  matchReasons: string[];
  mismatches: string[];
}

export interface AutoMatchPair {
  id: string;
  boy: SadatRecord;
  girl: SadatRecord;
  score: number;
  matchReasons: string[];
  mismatches: string[];
  aiSummary: string;
}
