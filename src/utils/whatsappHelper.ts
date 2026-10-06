import { SadatRecord } from '../types/record';

/**
 * Generates formatted Urdu WhatsApp message matching the user's exact template
 */
export function formatWhatsAppRecord(record: SadatRecord, isForAdmin = false): string {
  const isFemale = record.gender === 'لڑکی';

  // Female privacy rules:
  // In public view: name is generic or masked, and contact number is kept confidential through the bureau admins.
  const displayName = isFemale && !isForAdmin
    ? 'سیدہ (نام صیغہ راز میں ہے)'
    : record.name;

  const displayPhone = isFemale && !isForAdmin
    ? 'خواتین کا رابطہ نمبر صیغہ راز میں ہے (دفتر السادات سے رابطہ کریں)'
    : (record.contactNumber || 'دفتر السادات سے رابطہ کریں');

  const displayFather = isFemale && !isForAdmin
    ? 'سید صاحب'
    : record.fatherName;

  return `*بسم اللہ الرحمن الرحیم*
سیریل نمبر، ${record.serialNumber}
1⃣ *ذاتی معلومات*
1: جنس: ${record.gender}
2: نام: ${displayName}
3: عمر: ${record.age ? `${record.age} سال` : ''}
4: والد: ${displayFather}
6: قد : ${record.height || ''}
7: خدانخوستہ کوئی معذوری ♿: ${record.disability || 'نہیں'}
5: ازدواجی حیثیت: ${record.maritalStatus || 'غیر شادی شدہ'}

➖➖➖➖➖➖➖
2⃣ *تعلیم کی تفصیلات*
1: اہلیت: ${record.qualification || ''}
2: کالج: ${record.college || ''}
3: یونیورسٹی: ${record.university || ''}
➖➖➖➖➖➖➖
3⃣ *ملازمت کی تفصیلات*
1: رینک/پوزیشن: ${record.rankPosition || ''}
2: آمدنی: ${record.income || ''}
3: ملازمت کی نوعیت: ${record.jobNature || ''}
4: مستقبل کے منصوبے: ${record.futurePlans || ''}

➖➖➖➖➖➖➖
4⃣ *مذہب کی تفصیلات*
1: مذہب: ${record.religion || 'اسلام'}
2: کاسٹ: ${record.caste || 'سید'}
3: مسلک: ${record.maslak || 'اہلسنت'}
➖➖➖➖➖➖➖
5⃣ *پراپرٹی کی تفصیلات*
1: گھر: ${record.house || 'ذاتی'}
2: سائز: ${record.houseSize || ''}
3: مقام: ${record.houseLocation || ''}
4: دیگر خواص اگر کوئی ہیں: ${record.otherProperties || 'کوئی نہیں'}
➖➖➖➖➖➖➖
6⃣ *خاندانی تفصیلات*
1: والد کا پیشہ: ${record.fatherOccupation || ''}
2: بہنوں کی تعداد: ${record.sistersCount ?? 0}
3: بھائیوں کی تعداد: ${record.brothersCount ?? 0}
4: شادی شدہ: ${record.marriedSiblings || ''}
➖➖➖➖➖➖➖
7⃣ *پتہ*
1: موجودہ شہر: ${record.currentCity || ''}
2: آبائی علاقہ یا شہر: ${record.nativeCity || ''}
➖➖➖➖➖➖➖
*ضروریات*
1: ازدواجی حیثیت: ${record.reqMaritalStatus || 'غیر شادی شدہ'}
2: عمر کی حد: ${record.reqAgeRange || ''}
3: قد: ${record.reqHeight || ''}
4: شہر: ${record.reqCity || ''}
5: مسلک: ${record.reqMaslak || 'اہلسنت'}
6: مادری زبان: ${record.reqMotherTongue || 'اردو'}
7: اہلیت: ${record.reqQualification || ''}
8: رہائش: ${record.reqResidence || ''}
9: کوئی اور مطالبہ: ${record.reqOtherDemands || ''}
10: ریمارکس اگر کچھ: ${record.remarks || ''}
11: رابطہ نمبر: ${displayPhone}
➖➖➖➖➖➖➖
*میں اللہ تعالیٰ کے حضور گواہی دیتا ھوں/ دیتی ھوں کہ اوپر دی گئی معلومات میرے علم کے مطابق درست ھیں*
➖➖➖➖➖➖➖
*سادات کے بچوں کے رشتے خالصتاً اللہ کی رضا کے لیے کروائے جاتے ھیں، جس کا کسی قسم کا کوئی معاوضہ یا فیس نہیں ھے۔*

*ضرورت رشتہ کی پروفائل جمع کروانے، یا کسی فرد کی طرف سے کسی قسم کی فیس کا تقاضا کئے جانے صورت میں نیچے دئے گئے فون نمبرز پر رابطہ کریں۔*

*سید نذیر مختار نقوی البخاری*
*+92 303 2880555*

*سید محمد صفدر نواز نقوی ترمذی*
*0300 8658360*

*سید محمد ندیم شاہ*
*0346 7791264*

*سید عابد حسین شاہ*
*0306 6238755*

*بشکریہ iso*
*بین الاقوامی تنظیم السادات*
*INTERNATIONAL SADAT ORGANIZATION*`;
}

/**
 * Intelligent WhatsApp Text Parser to auto-fill form when user pastes raw WhatsApp template!
 */
export function parseWhatsAppText(rawText: string): Partial<SadatRecord> {
  const result: Partial<SadatRecord> = {};

  const cleanText = rawText.replace(/\*/g, '');

  const extractMatch = (patterns: RegExp[]): string => {
    for (const pattern of patterns) {
      const match = cleanText.match(pattern);
      if (match && match[1]) {
        return match[1].trim().replace(/^[:؛۔\-\s]+/, '').replace(/[:؛۔\-\s]+$/, '');
      }
    }
    return '';
  };

  // Serial Number
  const serial = extractMatch([
    /سیریل\s*نمبر[،,:\s]*([0-9A-Za-z\u0660-\u0669\-]+)/i,
    /Serial\s*(?:No|Number)?[:\s]*([0-9A-Za-z\-]+)/i
  ]);
  if (serial) result.serialNumber = serial;

  // Gender
  const genderMatch = extractMatch([
    /جنس[:\s]*([^\n\r]+)/,
    /Gender[:\s]*([^\n\r]+)/i
  ]);
  if (genderMatch) {
    if (genderMatch.includes('لڑکی') || genderMatch.includes('مستور') || genderMatch.includes('عورت') || genderMatch.includes('فی میل') || genderMatch.toLowerCase().includes('female')) {
      result.gender = 'لڑکی';
    } else {
      result.gender = 'لڑکا';
    }
  }

  // Name
  const name = extractMatch([
    /2:\s*نام[:\s]*([^\n\r]+)/,
    /نام[:\s]*([^\n\r]+)/
  ]);
  if (name) result.name = name;

  // Age
  const ageStr = extractMatch([
    /3:\s*عمر[:\s]*([0-9\u0660-\u0669]+)/,
    /عمر[:\s]*([0-9\u0660-\u0669]+)/
  ]);
  if (ageStr) {
    const parsedAge = parseInt(ageStr.replace(/[^\d]/g, ''), 10);
    if (!isNaN(parsedAge)) result.age = parsedAge;
  }

  // Father
  const father = extractMatch([
    /4:\s*والد[:\s۔]*([^\n\r]+)/,
    /والد[:\s۔]*([^\n\r]+)/
  ]);
  if (father) result.fatherName = father;

  // Height
  const height = extractMatch([
    /6:\s*قد\s*[:\s۔]*([^\n\r]+)/,
    /قد\s*[:\s۔]*([^\n\r]+)/
  ]);
  if (height) result.height = height;

  // Disability
  const disability = extractMatch([
    /7:\s*خدانخوستہ\s*کوئی\s*معذوری[^\n\r]*[:\s۔]*([^\n\r]+)/,
    /معذوری[:\s۔]*([^\n\r]+)/
  ]);
  if (disability) result.disability = disability;

  // Marital status
  const marital = extractMatch([
    /5:\s*ازدواجی\s*حیثیت[:\s۔]*([^\n\r]+)/,
    /ازدواجی\s*حیثیت[:\s۔]*([^\n\r]+)/
  ]);
  if (marital) result.maritalStatus = marital;

  // Education: Qualification
  const qual = extractMatch([
    /1:\s*اہلیت[:\s۔]*([^\n\r]+)/,
    /اہلیت[:\s۔]*([^\n\r]+)/
  ]);
  if (qual) result.qualification = qual;

  // College
  const college = extractMatch([
    /2:\s*کالج[:\s۔]*([^\n\r]+)/,
    /کالج[:\s۔]*([^\n\r]+)/
  ]);
  if (college) result.college = college;

  // University
  const uni = extractMatch([
    /3:\s*یونیورسٹی[:\s۔]*([^\n\r]+)/,
    /یونیورسٹی[:\s۔]*([^\n\r]+)/
  ]);
  if (uni) result.university = uni;

  // Job: Rank/Position
  const rank = extractMatch([
    /1:\s*رینک\/پوزیشن[:\s۔]*([^\n\r]+)/,
    /رینک[:\s۔]*([^\n\r]+)/
  ]);
  if (rank) result.rankPosition = rank;

  // Income
  const income = extractMatch([
    /2:\s*آمدنی[:\s۔]*([^\n\r]+)/,
    /آمدنی[:\s۔]*([^\n\r]+)/
  ]);
  if (income) result.income = income;

  // Job nature
  const jobNature = extractMatch([
    /3:\s*ملازمت\s*کی\s*نوعیت[:\s۔]*([^\n\r]+)/,
    /نوعیت[:\s۔]*([^\n\r]+)/
  ]);
  if (jobNature) result.jobNature = jobNature;

  // Future plans
  const futurePlans = extractMatch([
    /4:\s*مستقبل\s*کے\s*منصوبے[:\s۔]*([^\n\r]+)/
  ]);
  if (futurePlans) result.futurePlans = futurePlans;

  // Religion
  const rel = extractMatch([/1:\s*مذہب[:\s۔]*([^\n\r]+)/]);
  if (rel) result.religion = rel;

  // Caste
  const caste = extractMatch([
    /2:\s*کاسٹ[:\s۔]*([^\n\r]+)/,
    /کاسٹ[:\s۔]*([^\n\r]+)/
  ]);
  if (caste) result.caste = caste;

  // Maslak
  const maslak = extractMatch([
    /3:\s*مسلک[:\s۔]*([^\n\r]+)/,
    /مسلک[:\s۔]*([^\n\r]+)/
  ]);
  if (maslak) result.maslak = maslak;

  // Property: House
  const house = extractMatch([
    /1:\s*گھر[:\s۔]*([^\n\r]+)/,
    /گھر[:\s۔]*([^\n\r]+)/
  ]);
  if (house) result.house = house;

  // House Size
  const houseSize = extractMatch([
    /2:\s*سائز[:\s۔]*([^\n\r]+)/,
    /سائز[:\s۔]*([^\n\r]+)/
  ]);
  if (houseSize) result.houseSize = houseSize;

  // House Location
  const loc = extractMatch([
    /\.3:\s*مقام[:\s۔]*([^\n\r]+)/,
    /3:\s*مقام[:\s۔]*([^\n\r]+)/
  ]);
  if (loc) result.houseLocation = loc;

  // Other properties
  const otherProp = extractMatch([
    /4:\s*دیگر\s*خواص[^\n\r]*[:\s۔]*([^\n\r]+)/
  ]);
  if (otherProp) result.otherProperties = otherProp;

  // Family details
  const fOcc = extractMatch([/1:\s*والد\s*کا\s*پیشہ[:\s۔]*([^\n\r]+)/]);
  if (fOcc) result.fatherOccupation = fOcc;

  const sisStr = extractMatch([/2:\s*بہنوں\s*کی\s*تعداد[:\s۔]*([0-9\u0660-\u0669]+)/]);
  if (sisStr) {
    const parsed = parseInt(sisStr.replace(/[^\d]/g, ''), 10);
    if (!isNaN(parsed)) result.sistersCount = parsed;
  }

  const broStr = extractMatch([/3:\s*بھائیوں\s*کی\s*تعداد[:\s۔]*([0-9\u0660-\u0669]+)/]);
  if (broStr) {
    const parsed = parseInt(broStr.replace(/[^\d]/g, ''), 10);
    if (!isNaN(parsed)) result.brothersCount = parsed;
  }

  const married = extractMatch([/4:\s*شادی\s*شدہ[:\s۔]*([^\n\r]+)/]);
  if (married) result.marriedSiblings = married;

  // Address
  const curCity = extractMatch([/1:\s*موجودہ\s*شہر[:\s۔]*([^\n\r]+)/]);
  if (curCity) result.currentCity = curCity;

  const natCity = extractMatch([/2:\s*آبائی\s*علاقہ[^\n\r]*[:\s۔]*([^\n\r]+)/]);
  if (natCity) result.nativeCity = natCity;

  // Requirements section
  const reqPart = cleanText.split(/ضروریات/i)[1] || '';
  if (reqPart) {
    const reqStatus = reqPart.match(/1:\s*ازدواجی\s*حیثیت[:\s۔]*([^\n\r]+)/);
    if (reqStatus) result.reqMaritalStatus = reqStatus[1].trim();

    const reqAge = reqPart.match(/2:\s*عمر\s*کی\s*حد[:\s۔]*([^\n\r]+)/);
    if (reqAge) result.reqAgeRange = reqAge[1].trim();

    const reqHeight = reqPart.match(/3:\s*قد[:\s۔]*([^\n\r]+)/);
    if (reqHeight) result.reqHeight = reqHeight[1].trim();

    const reqCity = reqPart.match(/4:\s*شہر[:\s۔]*([^\n\r]+)/);
    if (reqCity) result.reqCity = reqCity[1].trim();

    const reqMaslak = reqPart.match(/5:\s*مسلک[:\s۔]*([^\n\r]+)/);
    if (reqMaslak) result.reqMaslak = reqMaslak[1].trim();

    const reqLang = reqPart.match(/6:\s*مادری\s*زبان[:\s۔]*([^\n\r]+)/);
    if (reqLang) result.reqMotherTongue = reqLang[1].trim();

    const reqQual = reqPart.match(/7:\s*اہلیت[:\s۔]*([^\n\r]+)/);
    if (reqQual) result.reqQualification = reqQual[1].trim();

    const reqRes = reqPart.match(/8:\s*رہائش[:\s۔]*([^\n\r]+)/);
    if (reqRes) result.reqResidence = reqRes[1].trim();

    const reqDemands = reqPart.match(/9:\s*کوئی\s*اور\s*مطالبہ[:\s۔]*([^\n\r]+)/);
    if (reqDemands) result.reqOtherDemands = reqDemands[1].trim();

    const remarks = reqPart.match(/10:\s*ریمارکس[^\n\r]*[:\s۔]*([^\n\r]+)/);
    if (remarks) result.remarks = remarks[1].trim();

    const phone = reqPart.match(/11:\s*رابطہ\s*نمبر[:\s۔]*([0-9\+\-\s]+)/);
    if (phone) result.contactNumber = phone[1].trim();
  }

  return result;
}

/**
 * Parses either a single record or multiple records from a raw text file (.txt)
 */
export function parseMultipleRecordsFromText(fileContent: string, startingSerial = '001'): Partial<SadatRecord>[] {
  const text = fileContent.trim();
  if (!text) return [];

  // Check if text has multiple Bismillah or Serial marks
  const bismillahSplit = text.split(/(?=\*?بسم\s*اللہ\s*الرحمن\s*الرحیم\*?)/i).filter((chunk) => chunk.trim().length > 30);
  
  if (bismillahSplit.length > 1) {
    return bismillahSplit.map((chunk) => parseWhatsAppText(chunk)).filter((r) => Object.keys(r).length > 2);
  }

  const serialSplit = text.split(/(?=سیریل\s*نمبر)/i).filter((chunk) => chunk.trim().length > 30);
  if (serialSplit.length > 1) {
    return serialSplit.map((chunk) => parseWhatsAppText(chunk)).filter((r) => Object.keys(r).length > 2);
  }

  // Single record
  const single = parseWhatsAppText(text);
  return [single];
}

