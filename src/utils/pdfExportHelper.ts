import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SadatRecord } from '../types/record';
import logoImage from '../assets/images/shoba_kafaatu_sadat_logo_1791109262101.jpg';

/**
 * Builds HTML template for an individual Sadat record with pure standard sRGB / Hex CSS.
 * Strict A4 dimensions: 794px width, 1123px height. Fits cleanly on 1 page without vertical stretching.
 */
export function buildRecordHtml(record: SadatRecord, isAdmin = true, isBulk = false): string {
  const isFemale = record.gender === 'لڑکی';
  const themeColor = isFemale ? '#be123c' : '#1d4ed8';
  const badgeBg = isFemale ? '#fff1f2' : '#eff6ff';
  const badgeBorder = isFemale ? '#fb7185' : '#60a5fa';
  const displayName = isFemale && !isAdmin ? 'سیدہ (مستورات - نام صیغہ راز میں ہے)' : record.name || (isFemale ? 'سیدہ' : 'سید');
  const displayContact = isFemale && !isAdmin ? 'دفتر السادات کے ذریعے' : (record.contactNumber || 'دفتر السادات سے رابطہ کریں');

  return `
    <div style="width: 794px; height: 1123px; max-height: 1123px; overflow: hidden; padding: 24px 30px; background: #ffffff; color: #0f172a; font-family: 'Amiri', 'Noto Sans Arabic', Tahoma, Arial, sans-serif; direction: rtl; text-align: right; box-sizing: border-box; position: relative; border: 3px double #064e3b; outline: 1px solid #d97706; outline-offset: -7px; ${isBulk ? 'page-break-after: always;' : ''}">
      
      <!-- Top Decorative Islamic Header Bar -->
      <div style="height: 5px; background: linear-gradient(90deg, #064e3b, #d97706, #064e3b); border-radius: 3px; margin-bottom: 12px;"></div>

      <!-- Header with Logo, Bureau Title & File Code Badge -->
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 14px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <img src="${logoImage}" style="width: 66px; height: 66px; border-radius: 12px; border: 2px solid #d97706; object-fit: cover; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" alt="ISO Logo" />
          <div>
            <div style="font-size: 13px; color: #78350f; font-weight: bold; letter-spacing: 0.5px;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
            <h1 style="font-size: 20px; font-weight: 800; color: #064e3b; margin: 2px 0 1px 0; font-family: 'Amiri', serif;">شعبہ کفاءت السادات پاکستان</h1>
            <div style="font-size: 11px; color: #475569;">زیر اہتمام: بین الاقوامی تنظیم السادات (ISO) • مرکزی رجسٹرڈ ریکارڈ روم</div>
          </div>
        </div>

        <!-- File Code Badge (FM001 / M001) -->
        <div style="text-align: left;">
          <div style="background: ${badgeBg}; border: 2px solid ${badgeBorder}; border-radius: 12px; padding: 6px 14px; display: inline-block; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <div style="font-size: 10px; font-weight: bold; color: ${themeColor}; text-transform: uppercase;">فائل کوڈ / سیریل نمبر</div>
            <div style="font-size: 24px; font-weight: 900; font-family: monospace; color: ${themeColor}; direction: ltr; line-height: 1.1;">#${record.serialNumber}</div>
          </div>
          <div style="font-size: 10.5px; color: #64748b; margin-top: 3px; text-align: center; font-weight: 600;">
            ${isFemale ? 'حصہ مستورات (FM Series)' : 'حصہ مردانہ (M Series)'} • <span style="color: #047857;">${record.status || 'فعال'}</span>
          </div>
        </div>
      </div>

      <!-- Candidate Main Banner -->
      <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 10px 16px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 11px; color: #64748b; font-weight: 600;">امیدوار کا نام و ولدیت:</div>
          <div style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 1px;">
            ${displayName} ${record.fatherName ? `<span style="font-size: 13px; color: #475569; font-weight: normal;">(ولد/بنت: ${record.fatherName})</span>` : ''}
          </div>
        </div>
        <div style="display: flex; gap: 8px; font-size: 11.5px;">
          <div style="background: #ffffff; padding: 4px 10px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center;">
            <span style="color: #64748b; font-size: 10px; display: block;">عمر</span>
            <strong style="color: #064e3b; font-size: 13px;">${record.age} سال</strong>
          </div>
          <div style="background: #ffffff; padding: 4px 10px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center;">
            <span style="color: #64748b; font-size: 10px; display: block;">شہر</span>
            <strong style="color: #064e3b; font-size: 13px;">${record.currentCity || 'لاہور'}</strong>
          </div>
          <div style="background: #ffffff; padding: 4px 10px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center;">
            <span style="color: #64748b; font-size: 10px; display: block;">مسلک</span>
            <strong style="color: #064e3b; font-size: 13px;">${record.maslak || 'اہلسنت'}</strong>
          </div>
          <div style="background: #ffffff; padding: 4px 10px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center;">
            <span style="color: #64748b; font-size: 10px; display: block;">قبیلہ/شجرہ</span>
            <strong style="color: #064e3b; font-size: 13px;">${record.caste || 'سید'}</strong>
          </div>
        </div>
      </div>

      <!-- Detail Grid Sections (4 Quadrants) -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
        
        <!-- 1: ذاتی معلومات -->
        <div style="border: 1px solid #e2e8f0; border-radius: 10px; padding: 9px 13px; background: #ffffff;">
          <div style="font-size: 12px; font-weight: bold; color: #064e3b; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; margin-bottom: 6px;">
            1️⃣ ذاتی کوائف و ظاہری خدوخال
          </div>
          <table style="width: 100%; font-size: 11px; line-height: 1.6; border-collapse: collapse;">
            <tr><td style="color: #64748b; width: 44%; padding: 2px 0;">قد:</td><td style="font-weight: 600; color: #0f172a;">${record.height || 'معلوم نہیں'}</td></tr>
            <tr><td style="color: #64748b; padding: 2px 0;">ازدواجی حیثیت:</td><td style="font-weight: 600; color: #0f172a;">${record.maritalStatus || 'غیر شادی شدہ'}</td></tr>
            <tr><td style="color: #64748b; padding: 2px 0;">صحت / معذوری:</td><td style="font-weight: 600; color: #0f172a;">${record.disability || 'الحمدللہ تندرست'}</td></tr>
            <tr><td style="color: #64748b; padding: 2px 0;">آبائی علاقہ:</td><td style="font-weight: 600; color: #0f172a;">${record.nativeCity || record.currentCity || 'پاکستان'}</td></tr>
          </table>
        </div>

        <!-- 2: تعلیم کی تفصیلات -->
        <div style="border: 1px solid #e2e8f0; border-radius: 10px; padding: 9px 13px; background: #ffffff;">
          <div style="font-size: 12px; font-weight: bold; color: #064e3b; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; margin-bottom: 6px;">
            2️⃣ تعلیمی قابلیت و اسناد
          </div>
          <table style="width: 100%; font-size: 11px; line-height: 1.6; border-collapse: collapse;">
            <tr><td style="color: #64748b; width: 44%; padding: 2px 0;">ڈگری / اہلیت:</td><td style="font-weight: 600; color: #0f172a;">${record.qualification || 'گریجویشن'}</td></tr>
            <tr><td style="color: #64748b; padding: 2px 0;">کالج:</td><td style="font-weight: 600; color: #0f172a;">${record.college || '—'}</td></tr>
            <tr><td style="color: #64748b; padding: 2px 0;">یونیورسٹی:</td><td style="font-weight: 600; color: #0f172a;">${record.university || '—'}</td></tr>
            <tr><td style="color: #64748b; padding: 2px 0;">مذہبی تعلیم / دیگر:</td><td style="font-weight: 600; color: #0f172a;">${record.religion || 'اسلام'}</td></tr>
          </table>
        </div>

        <!-- 3: ملازمت و آمدنی -->
        <div style="border: 1px solid #e2e8f0; border-radius: 10px; padding: 9px 13px; background: #ffffff;">
          <div style="font-size: 12px; font-weight: bold; color: #064e3b; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; margin-bottom: 6px;">
            3️⃣ ملازمت، کاروبار و معاشی حیثیت
          </div>
          <table style="width: 100%; font-size: 11px; line-height: 1.6; border-collapse: collapse;">
            <tr><td style="color: #64748b; width: 44%; padding: 2px 0;">عہدہ / پیشہ:</td><td style="font-weight: 600; color: #0f172a;">${record.rankPosition || '—'}</td></tr>
            <tr><td style="color: #64748b; padding: 2px 0;">ماہانہ آمدنی:</td><td style="font-weight: 600; color: #047857;">${record.income || 'مناسب'}</td></tr>
            <tr><td style="color: #64748b; padding: 2px 0;">نوعیتِ ملازمت:</td><td style="font-weight: 600; color: #0f172a;">${record.jobNature || '—'}</td></tr>
            <tr><td style="color: #64748b; padding: 2px 0;">مستقبل کے ارادے:</td><td style="font-weight: 600; color: #0f172a;">${record.futurePlans || '—'}</td></tr>
          </table>
        </div>

        <!-- 4: رہائش و خاندانی پس منظر -->
        <div style="border: 1px solid #e2e8f0; border-radius: 10px; padding: 9px 13px; background: #ffffff;">
          <div style="font-size: 12px; font-weight: bold; color: #064e3b; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; margin-bottom: 6px;">
            4️⃣ خاندانی پس منظر و رہائش
          </div>
          <table style="width: 100%; font-size: 11px; line-height: 1.6; border-collapse: collapse;">
            <tr><td style="color: #64748b; width: 44%; padding: 2px 0;">رہائش کی نوعیت:</td><td style="font-weight: 600; color: #0f172a;">${record.house || 'ذاتی'} (${record.houseSize || 'مناسب'})</td></tr>
            <tr><td style="color: #64748b; padding: 2px 0;">رہائشی پتہ/شہر:</td><td style="font-weight: 600; color: #0f172a;">${record.houseLocation || record.currentCity || '—'}</td></tr>
            <tr><td style="color: #64748b; padding: 2px 0;">والد صاحب کا پیشہ:</td><td style="font-weight: 600; color: #0f172a;">${record.fatherOccupation || '—'}</td></tr>
            <tr><td style="color: #64748b; padding: 2px 0;">بہن بھائی کی تعداد:</td><td style="font-weight: 600; color: #0f172a;">بھائی: ${record.brothersCount || 0} • بہنیں: ${record.sistersCount || 0}</td></tr>
          </table>
        </div>
      </div>

      <!-- 5: رشتہ کے لیے مطلوبہ شرائط (Requirements) -->
      <div style="border: 1.5px solid #fed7aa; border-radius: 10px; padding: 10px 14px; background: #fffbeb; margin-bottom: 12px;">
        <div style="font-size: 12px; font-weight: bold; color: #9a3412; border-bottom: 1px solid #fde68a; padding-bottom: 4px; margin-bottom: 6px; display: flex; justify-content: space-between;">
          <span>5️⃣ شرائط، ترجیحات و مطالبات برائے رشتہ</span>
          <span style="font-size: 10.5px; color: #b45309; font-weight: normal;">کفاءت السادات کے معیار کے مطابق</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
          <div><strong style="color: #9a3412;">مطلوبہ عمر:</strong> <span style="font-weight: 600; color: #1e293b;">${record.reqAgeRange || 'مناسب'}</span></div>
          <div><strong style="color: #9a3412;">مطلوبہ تعلیم:</strong> <span style="font-weight: 600; color: #1e293b;">${record.reqQualification || 'گریجویشن / ہم پلہ'}</span></div>
          <div><strong style="color: #9a3412;">مطلوبہ مسلک:</strong> <span style="font-weight: 600; color: #1e293b;">${record.reqMaslak || record.maslak || 'اہلسنت'}</span></div>
          <div><strong style="color: #9a3412;">مطلوبہ رہائش / شہر:</strong> <span style="font-weight: 600; color: #1e293b;">${record.reqCity || record.currentCity || 'کوئی قید نہیں'}</span></div>
          <div><strong style="color: #9a3412;">ازدواجی ترجیح:</strong> <span style="font-weight: 600; color: #1e293b;">${record.reqMaritalStatus || 'غیر شادی شدہ'}</span></div>
          <div><strong style="color: #9a3412;">دیگر شرائط:</strong> <span style="font-weight: 600; color: #1e293b;">${record.reqOtherDemands || 'شریف النفس سادات خاندان'}</span></div>
        </div>
        ${record.remarks ? `<div style="margin-top: 6px; font-size: 10.5px; color: #475569; border-top: 1px dashed #fde68a; padding-top: 4px;"><strong>اضافی نوٹس / ریمارکس:</strong> ${record.remarks}</div>` : ''}
      </div>

      <!-- Confidential Contact & Office Information -->
      <div style="background: #ecfdf5; border: 1.5px solid #a7f3d0; border-radius: 10px; padding: 9px 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; font-size: 11.5px;">
        <div>
          <strong style="color: #065f46;">رابطہ نمبر برائے ریکارڈ (#${record.serialNumber}):</strong>
          <span style="font-family: monospace; font-weight: bold; font-size: 12.5px; color: #047857; margin-right: 8px; direction: ltr; display: inline-block;">
            ${displayContact}
          </span>
        </div>
        <div style="font-size: 10.5px; color: #065f46;">
          مرکزی ہیلپ لائن: <span style="font-family: monospace; font-weight: bold;">03323475431 / 03008658360</span>
        </div>
      </div>

      <!-- Official ISO Stamp & Signatures Verification Footer -->
      <div style="border-top: 1.5px solid #e2e8f0; padding-top: 10px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 10px; color: #64748b;">
        <div style="max-width: 480px; line-height: 1.5;">
          <div><strong style="color: #064e3b;">تصدیق شدہ برائے:</strong> شعبہ کفاءت السادات - بین الاقوامی تنظیم السادات (ISO) پاکستان</div>
          <div><strong>نگران و تکنیکی معاون:</strong> سید محمد عامر شاہ نقوی البخاری (چیئرمین آئی ٹی سپورٹ کونسل) • 03323475431</div>
          <div><strong>سرپرست اعلیٰ:</strong> سید نذیر مختار نقوی البخاری • <strong>چیف ایڈمن:</strong> سید محمد صفدر نواز نقوی ترمذی</div>
        </div>

        <!-- Official Seal Graphic & Issuance Data -->
        <div style="text-align: left; display: flex; align-items: center; gap: 12px;">
          <div style="border: 2px dashed #059669; border-radius: 50%; width: 56px; height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; font-size: 8px; color: #047857; font-weight: bold; line-height: 1.1; background: #f0fdf4;">
            <span>شعبہ کفاءت</span>
            <span style="font-size: 9px; color: #d97706;">★ ISO ★</span>
            <span>تصدیق شدہ</span>
          </div>
          <div style="font-family: monospace; font-size: 9.5px; color: #475569; line-height: 1.4;">
            تاریخ: ${new Date().toLocaleDateString('ur-PK')}<br />
            فائل: #${record.serialNumber}<br />
            سند رشتہ سادات
          </div>
        </div>
      </div>

    </div>
  `;
}

/**
 * Builds HTML template for Cover page of Bulk PDF
 * Strict A4 dimensions: 794px width, 1123px height. Fits cleanly on 1 page without vertical stretching.
 */
export function buildBulkCoverHtml(title: string, count: number, typeName: string, serialRange: string): string {
  return `
    <div style="width: 794px; height: 1123px; max-height: 1123px; overflow: hidden; padding: 40px 36px; background: #ffffff; color: #0f172a; font-family: 'Amiri', 'Noto Sans Arabic', Tahoma, Arial, sans-serif; direction: rtl; text-align: center; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; border: 4px double #064e3b; outline: 2px solid #d97706; outline-offset: -10px; page-break-after: always;">
      
      <div>
        <!-- Top Ornamental Bar -->
        <div style="height: 6px; background: linear-gradient(90deg, #064e3b, #d97706, #064e3b); border-radius: 3px; margin-bottom: 24px;"></div>
        
        <div style="display: inline-block; padding: 4px; border: 3px solid #d97706; border-radius: 20px; background: #ffffff; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); margin-bottom: 16px;">
          <img src="${logoImage}" style="width: 100px; height: 100px; border-radius: 16px; object-fit: cover; display: block;" alt="Logo" />
        </div>
        
        <div style="font-size: 15px; color: #78350f; font-weight: bold; letter-spacing: 0.5px;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
        <h1 style="font-size: 28px; font-weight: 900; color: #064e3b; margin: 6px 0 2px 0; font-family: 'Amiri', serif;">شعبہ کفاءت السادات پاکستان</h1>
        <h2 style="font-size: 16px; color: #d97706; margin: 0 0 6px 0; font-weight: bold;">بین الاقوامی تنظیم السادات (ISO) پاکستان</h2>
        <p style="font-size: 12px; color: #64748b; max-width: 520px; margin: 0 auto 24px auto;">
          مرکزی ریکارڈ روم برائے سادات رشتہ جات • آفیشل ماسٹر رجسٹر بلک فائل
        </p>

        <!-- Category Card -->
        <div style="background: #f8fafc; border: 2px solid #cbd5e1; border-radius: 16px; padding: 20px 24px; max-width: 580px; margin: 0 auto 20px auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="font-size: 13px; color: #64748b; font-weight: 600;">دستاویز کی آفیشل نوعیت:</div>
          <div style="font-size: 23px; font-weight: bold; color: #064e3b; margin: 4px 0 12px 0;">${title}</div>
          
          <div style="display: flex; justify-content: center; gap: 14px; margin-top: 10px;">
            <div style="background: #ffffff; padding: 8px 16px; border-radius: 12px; border: 1px solid #e2e8f0; min-width: 120px;">
              <div style="font-size: 10px; color: #64748b; font-weight: bold;">کل سادات ریکارڈز</div>
              <div style="font-size: 20px; font-weight: bold; color: #064e3b; font-family: monospace;">${count}</div>
            </div>
            <div style="background: #ffffff; padding: 8px 16px; border-radius: 12px; border: 1px solid #e2e8f0; min-width: 140px;">
              <div style="font-size: 10px; color: #64748b; font-weight: bold;">سیریز / درجہ بندی</div>
              <div style="font-size: 15px; font-weight: bold; color: #d97706;">${typeName}</div>
            </div>
            <div style="background: #ffffff; padding: 8px 16px; border-radius: 12px; border: 1px solid #e2e8f0; min-width: 140px;">
              <div style="font-size: 10px; color: #64748b; font-weight: bold;">فائل کوڈز کی حدود</div>
              <div style="font-size: 16px; font-weight: bold; color: #1e3a8a; font-family: monospace;">${serialRange}</div>
            </div>
          </div>
        </div>

        <div style="background: #fef3c7; border: 1.5px solid #fde68a; border-radius: 12px; padding: 12px 18px; max-width: 580px; margin: 0 auto; font-size: 11.5px; color: #92400e; line-height: 1.6; text-align: right;">
          ⚠️ <strong>تنبیہ و شرعی رازداری:</strong> یہ ریکارڈ بک بین الاقوامی تنظیم السادات پاکستان کی آفیشل امانت ہے۔ مستورات کے نام، پتے اور ذاتی فون نمبرز کی مکمل رازداری برقرار رکھنا تمام اراکین پر لازم ہے۔
        </div>
      </div>

      <!-- Bottom Credits & Signatures -->
      <div style="border-top: 2px solid #e2e8f0; padding-top: 14px; font-size: 11px; color: #64748b; line-height: 1.6;">
        <div><strong>تیار کردہ و نگرانِ نظام:</strong> سید محمد عامر شاہ نقوی البخاری (چیئرمین آئی ٹی سپورٹ کونسل • 03323475431)</div>
        <div>سرپرستِ اعلیٰ: سید نذیر مختار نقوی البخاری • چیف ایڈمن: سید محمد صفدر نواز نقوی ترمذی (03008658360)</div>
        <div style="margin-top: 3px; font-family: monospace; font-size: 10px; color: #94a3b8;">تاریخِ جاری و ڈاؤن لوڈ: ${new Date().toLocaleDateString('ur-PK')} • ISO PAKISTAN</div>
      </div>

    </div>
  `;
}

/**
 * Renders HTML inside an isolated hidden iframe with explicit Google Fonts loaded.
 * Ensures strict 794px × 1123px rendering, preventing aspect ratio distortion and oklab parser errors.
 */
async function renderHtmlToCanvas(htmlContent: string): Promise<HTMLCanvasElement> {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-10000px';
  iframe.style.top = '0';
  iframe.style.width = '794px';
  iframe.style.height = '1123px';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  iframe.style.zIndex = '-9999';
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      throw new Error('Unable to create rendering sandbox document');
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="ur" dir="rtl">
      <head>
        <meta charset="utf-8">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Sans+Arabic:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body {
            background: #ffffff;
            color: #0f172a;
            font-family: 'Amiri', 'Noto Sans Arabic', Tahoma, Arial, sans-serif;
            direction: rtl;
            text-align: right;
            width: 794px;
            height: 1123px;
            overflow: hidden;
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `);
    doc.close();

    // Allow browser time to resolve fonts and images
    try {
      if ((doc as any).fonts) {
        await (doc as any).fonts.ready;
      }
    } catch {
      // Fallback timer
    }
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Convert iframe document body to high-DPI canvas
    const canvas = await html2canvas(doc.body, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      height: 1123,
      windowWidth: 794,
      windowHeight: 1123
    });

    return canvas;
  } finally {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }
}

/**
 * Adds a canvas to a jsPDF document strictly preserving the aspect ratio.
 * Never crushes or squashes the canvas vertically!
 */
function addCanvasToPdf(pdf: jsPDF, canvas: HTMLCanvasElement, isFirstPage: boolean) {
  const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
  const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // True rendered height in mm based on natural aspect ratio:
  const renderedHeightMm = (canvasHeight * pdfWidth) / canvasWidth;

  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  if (!isFirstPage) {
    pdf.addPage();
  }

  // If fits on 1 page (within 2mm tolerance of standard A4 297mm)
  if (renderedHeightMm <= pdfHeight + 2) {
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(renderedHeightMm, pdfHeight), undefined, 'FAST');
  } else {
    // Paginate gracefully across multiple pages preserving aspect ratio
    let heightLeft = renderedHeightMm;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, renderedHeightMm, undefined, 'FAST');
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - renderedHeightMm;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, renderedHeightMm, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }
  }
}

/**
 * Exports a single Sadat Record into a high quality, crisp, beautifully paginated A4 PDF
 * File name matches file code: e.g. FM001_Sadat_Record.pdf or M001_Sadat_Record.pdf
 */
export async function exportSingleRecordToPdf(
  record: SadatRecord, 
  isAdmin = true
): Promise<{ success: boolean; filename?: string; error?: string }> {
  try {
    const filename = `${record.serialNumber}_Sadat_Record.pdf`;
    const html = buildRecordHtml(record, isAdmin, false);

    const canvas = await renderHtmlToCanvas(html);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    addCanvasToPdf(pdf, canvas, true);
    pdf.save(filename);

    return { success: true, filename };
  } catch (err: any) {
    console.error('Failed to export single record to PDF:', err);
    return { success: false, error: err?.message || 'PDF بنانے میں خرابی پیش آگئی' };
  }
}

/**
 * Exports multiple Sadat Records into a bulk PDF document with cover page
 * - Female bulk: Sadat_Female_Records_FM_Bulk.pdf
 * - Male bulk: Sadat_Male_Records_M_Bulk.pdf
 * - All records: Sadat_All_Records_Master_Book.pdf
 */
export async function exportBulkRecordsToPdf(
  records: SadatRecord[],
  category: 'female' | 'male' | 'all',
  isAdmin = true,
  onProgress?: (progressText: string) => void
): Promise<{ success: boolean; filename?: string; count?: number; error?: string }> {
  try {
    if (!records || records.length === 0) {
      return { success: false, error: 'کوئی ریکارڈ موجود نہیں ہے' };
    }

    // Filter by category
    let targetRecords = records;
    let title = 'سادات ماسٹر ریکارڈز رجسٹر (مکمل بک)';
    let typeName = 'مردانہ و مستورات یکجا';
    let defaultFilename = `Sadat_All_Records_Master_Book_${new Date().toISOString().slice(0, 10)}.pdf`;

    if (category === 'female') {
      targetRecords = records.filter((r) => r.gender === 'لڑکی');
      title = 'سادات مستورات ریکارڈز بک (FM سیریز)';
      typeName = 'صرف مستورات (FM Series)';
      defaultFilename = `Sadat_Female_Records_FM_Bulk_${new Date().toISOString().slice(0, 10)}.pdf`;
    } else if (category === 'male') {
      targetRecords = records.filter((r) => r.gender === 'لڑکا');
      title = 'سادات مردانہ امیدواران ریکارڈز بک (M سیریز)';
      typeName = 'صرف مرد حضرات (M Series)';
      defaultFilename = `Sadat_Male_Records_M_Bulk_${new Date().toISOString().slice(0, 10)}.pdf`;
    }

    if (targetRecords.length === 0) {
      return { success: false, error: 'منتخب کردہ زمرے کے لیے کوئی ریکارڈ موجود نہیں ہے' };
    }

    // Sort by serial number
    targetRecords.sort((a, b) => a.serialNumber.localeCompare(b.serialNumber));

    const serialRange = targetRecords.length > 0 
      ? `${targetRecords[0].serialNumber} تا ${targetRecords[targetRecords.length - 1].serialNumber}`
      : '—';

    onProgress?.('ٹائٹل کور پیج تیار ہو رہا ہے...');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // 1. Generate Cover Page
    const coverHtml = buildBulkCoverHtml(title, targetRecords.length, typeName, serialRange);
    const coverCanvas = await renderHtmlToCanvas(coverHtml);
    addCanvasToPdf(pdf, coverCanvas, true);

    // 2. Append each individual record page separately
    for (let i = 0; i < targetRecords.length; i++) {
      const rec = targetRecords[i];
      onProgress?.(`ریکارڈ #${rec.serialNumber} صفحہ بن رہا ہے (${i + 1} از ${targetRecords.length})...`);

      const recHtml = buildRecordHtml(rec, isAdmin, true);
      const recCanvas = await renderHtmlToCanvas(recHtml);
      addCanvasToPdf(pdf, recCanvas, false);
    }

    onProgress?.('پی ڈی ایف فائل محفوظ ہو رہی ہے...');
    pdf.save(defaultFilename);

    return { success: true, filename: defaultFilename, count: targetRecords.length };
  } catch (err: any) {
    console.error('Failed to export bulk records to PDF:', err);
    return { success: false, error: err?.message || 'بلک پی ڈی ایف بنانے میں خرابی پیش آگئی' };
  }
}

/**
 * Exports a single Sadat Record into a JSON file
 * File name matches file code: e.g. FM001_Sadat_Record.json or M001_Sadat_Record.json
 */
export function exportSingleRecordToJson(record: SadatRecord): { success: boolean; filename: string } {
  const filename = `${record.serialNumber}_Sadat_Record.json`;
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(record, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  return { success: true, filename };
}

/**
 * Exports multiple Sadat Records into a JSON file (Bulk)
 * - Female bulk: Sadat_Female_Records_FM_Bulk.json
 * - Male bulk: Sadat_Male_Records_M_Bulk.json
 * - All records: Sadat_All_Records_Master_Book.json
 */
export function exportBulkRecordsToJson(
  records: SadatRecord[],
  category: 'female' | 'male' | 'all'
): { success: boolean; filename: string; count: number } {
  let target = records;
  let filename = `Sadat_All_Records_Master_Book_${new Date().toISOString().slice(0, 10)}.json`;

  if (category === 'female') {
    target = records.filter((r) => r.gender === 'لڑکی');
    filename = `Sadat_Female_Records_FM_Bulk_${new Date().toISOString().slice(0, 10)}.json`;
  } else if (category === 'male') {
    target = records.filter((r) => r.gender === 'لڑکا');
    filename = `Sadat_Male_Records_M_Bulk_${new Date().toISOString().slice(0, 10)}.json`;
  }

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(target, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  return { success: true, filename, count: target.length };
}
