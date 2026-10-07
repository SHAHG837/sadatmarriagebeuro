import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SadatRecord } from '../types/record';
import logoImage from '../assets/images/shoba_kafaatu_sadat_logo_1791109262101.jpg';

/**
 * Builds HTML template for an individual Sadat record with pure standard sRGB / Hex CSS
 */
function buildRecordHtml(record: SadatRecord, isAdmin: boolean, isBulk = false): string {
  const isFemale = record.gender === 'لڑکی';
  const themeColor = isFemale ? '#9f1239' : '#1e3a8a';
  const badgeBg = isFemale ? '#ffe4e6' : '#dbeafe';
  const badgeBorder = isFemale ? '#f43f5e' : '#3b82f6';
  const displayName = isFemale && !isAdmin ? 'سیدہ (مستورات - نام صیغہ راز میں ہے)' : record.name || (isFemale ? 'سیدہ' : 'سید');
  const displayContact = isFemale && !isAdmin ? 'دفتر السادات کے ذریعے' : (record.contactNumber || 'دفتر السادات سے رابطہ کریں');

  return `
    <div style="width: 794px; min-height: 1120px; padding: 40px; background: #ffffff; color: #0f172a; font-family: 'Amiri', 'Noto Sans Arabic', Tahoma, Arial, sans-serif; direction: rtl; text-align: right; box-sizing: border-box; position: relative; ${isBulk ? 'page-break-after: always; margin-bottom: 20px;' : ''}">
      
      <!-- Top Decorative Bar -->
      <div style="height: 6px; background: #064e3b; border-radius: 3px; margin-bottom: 20px;"></div>

      <!-- Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 18px; margin-bottom: 22px;">
        <div style="display: flex; align-items: center; gap: 15px;">
          <img src="${logoImage}" style="width: 70px; height: 70px; border-radius: 12px; border: 2px solid #d97706; object-fit: cover;" alt="Logo" />
          <div>
            <div style="font-size: 13px; color: #78350f; font-weight: bold; letter-spacing: 0.5px;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
            <h1 style="font-size: 22px; font-weight: 800; color: #064e3b; margin: 4px 0 2px 0;">شعبہ کفاءت السادات پاکستان</h1>
            <div style="font-size: 12px; color: #475569;">زیر اہتمام: انٹرنیشنل سادات آرگنائزیشن (ISO) پاکستان • رجسٹرڈ ریکارڈ روم</div>
          </div>
        </div>

        <!-- File Code Badge -->
        <div style="text-align: left;">
          <div style="background: ${badgeBg}; border: 2px solid ${badgeBorder}; border-radius: 14px; padding: 8px 16px; display: inline-block; text-align: center;">
            <div style="font-size: 11px; font-weight: bold; color: ${themeColor}; text-transform: uppercase;">فائل کوڈ / سیریل نمبر</div>
            <div style="font-size: 26px; font-weight: 900; font-family: monospace; color: ${themeColor}; direction: ltr;">#${record.serialNumber}</div>
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px; text-align: center;">
            ${isFemale ? 'حصہ مستورات (خواتین)' : 'حصہ مردانہ (مرد)'} • حیثیت: ${record.status || 'فعال'}
          </div>
        </div>
      </div>

      <!-- Candidate Main Banner -->
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 14px; padding: 14px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 12px; color: #64748b;">امیدوار کا نام و ولدیت:</div>
          <div style="font-size: 20px; font-weight: bold; color: #0f172a; margin-top: 2px;">
            ${displayName} ${record.fatherName ? `<span style="font-size: 14px; color: #475569; font-weight: normal;">(ولد/بنت: ${record.fatherName})</span>` : ''}
          </div>
        </div>
        <div style="display: flex; gap: 15px; font-size: 13px;">
          <div style="background: #ffffff; padding: 6px 14px; border-radius: 10px; border: 1px solid #e2e8f0;">
            <strong style="color: #64748b;">عمر:</strong> <span style="font-weight: bold; color: #064e3b;">${record.age} سال</span>
          </div>
          <div style="background: #ffffff; padding: 6px 14px; border-radius: 10px; border: 1px solid #e2e8f0;">
            <strong style="color: #64748b;">شہر:</strong> <span style="font-weight: bold; color: #064e3b;">${record.currentCity || 'لاہور'}</span>
          </div>
          <div style="background: #ffffff; padding: 6px 14px; border-radius: 10px; border: 1px solid #e2e8f0;">
            <strong style="color: #64748b;">مسلک:</strong> <span style="font-weight: bold; color: #064e3b;">${record.maslak || 'اہلسنت'}</span>
          </div>
        </div>
      </div>

      <!-- Detail Grid Sections -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
        
        <!-- 1: ذاتی معلومات -->
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px; background: #ffffff;">
          <div style="font-size: 13px; font-weight: bold; color: #064e3b; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; margin-bottom: 8px;">
            1️⃣ ذاتی کوائف
          </div>
          <table style="width: 100%; font-size: 12px; line-height: 1.8;">
            <tr><td style="color: #64748b; width: 45%;">قد:</td><td style="font-weight: 600;">${record.height || 'معلوم نہیں'}</td></tr>
            <tr><td style="color: #64748b;">ازدواجی حیثیت:</td><td style="font-weight: 600;">${record.maritalStatus || 'غیر شادی شدہ'}</td></tr>
            <tr><td style="color: #64748b;">معذوری / صحت:</td><td style="font-weight: 600;">${record.disability || 'الحمدللہ تندرست'}</td></tr>
            <tr><td style="color: #64748b;">کاسٹ / قبیلہ:</td><td style="font-weight: 600;">${record.caste || 'سید'}</td></tr>
          </table>
        </div>

        <!-- 2: تعلیم کی تفصیلات -->
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px; background: #ffffff;">
          <div style="font-size: 13px; font-weight: bold; color: #064e3b; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; margin-bottom: 8px;">
            2️⃣ تعلیم و قابلیت
          </div>
          <table style="width: 100%; font-size: 12px; line-height: 1.8;">
            <tr><td style="color: #64748b; width: 45%;">ڈگری / اہلیت:</td><td style="font-weight: 600;">${record.qualification || 'گریجویشن'}</td></tr>
            <tr><td style="color: #64748b;">کالج:</td><td style="font-weight: 600;">${record.college || '—'}</td></tr>
            <tr><td style="color: #64748b;">یونیورسٹی:</td><td style="font-weight: 600;">${record.university || '—'}</td></tr>
          </table>
        </div>

        <!-- 3: ملازمت و آمدنی -->
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px; background: #ffffff;">
          <div style="font-size: 13px; font-weight: bold; color: #064e3b; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; margin-bottom: 8px;">
            3️⃣ ملازمت و پیشہ ورانہ تفصیلات
          </div>
          <table style="width: 100%; font-size: 12px; line-height: 1.8;">
            <tr><td style="color: #64748b; width: 45%;">عہدہ / رینک:</td><td style="font-weight: 600;">${record.rankPosition || '—'}</td></tr>
            <tr><td style="color: #64748b;">ماہانہ آمدنی:</td><td style="font-weight: 600;">${record.income || 'مناسب'}</td></tr>
            <tr><td style="color: #64748b;">ملازمت کی نوعیت:</td><td style="font-weight: 600;">${record.jobNature || '—'}</td></tr>
            <tr><td style="color: #64748b;">مستقبل کے منصوبے:</td><td style="font-weight: 600;">${record.futurePlans || '—'}</td></tr>
          </table>
        </div>

        <!-- 4: رہائش و جائیداد -->
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px; background: #ffffff;">
          <div style="font-size: 13px; font-weight: bold; color: #064e3b; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; margin-bottom: 8px;">
            4️⃣ رہائش و خاندانی پس منظر
          </div>
          <table style="width: 100%; font-size: 12px; line-height: 1.8;">
            <tr><td style="color: #64748b; width: 45%;">رہائش کی حیثیت:</td><td style="font-weight: 600;">${record.house || 'ذاتی'} (${record.houseSize || 'مناسب'})</td></tr>
            <tr><td style="color: #64748b;">رہائشی علاقہ:</td><td style="font-weight: 600;">${record.houseLocation || record.currentCity || '—'}</td></tr>
            <tr><td style="color: #64748b;">والد کا پیشہ:</td><td style="font-weight: 600;">${record.fatherOccupation || '—'}</td></tr>
            <tr><td style="color: #64748b;">بہن بھائی:</td><td style="font-weight: 600;">بھائی: ${record.brothersCount || 0} • بہنیں: ${record.sistersCount || 0}</td></tr>
          </table>
        </div>
      </div>

      <!-- 5: رشتہ کے لیے مطلوبہ شرائط -->
      <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; background: #fdfbf7; margin-bottom: 20px;">
        <div style="font-size: 13px; font-weight: bold; color: #b45309; border-bottom: 1px solid #fed7aa; padding-bottom: 6px; margin-bottom: 10px;">
          5️⃣ شرائط و ضروریات برائے رشتہ
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px;">
          <div><strong style="color: #78350f;">مطلوبہ عمر:</strong> ${record.reqAgeRange || 'مناسب'}</div>
          <div><strong style="color: #78350f;">مطلوبہ تعلیم:</strong> ${record.reqQualification || 'گریجویشن / ہم پلہ'}</div>
          <div><strong style="color: #78350f;">مطلوبہ مسلک:</strong> ${record.reqMaslak || record.maslak || 'اہلسنت'}</div>
          <div><strong style="color: #78350f;">مطلوبہ شہر / رہائش:</strong> ${record.reqCity || record.currentCity || 'کوئی قید نہیں'}</div>
          <div><strong style="color: #78350f;">ازدواجی حیثیت ترجیح:</strong> ${record.reqMaritalStatus || 'غیر شادی شدہ'}</div>
          <div><strong style="color: #78350f;">دیگر مطالبات:</strong> ${record.reqOtherDemands || 'شریف النفس سادات خاندان'}</div>
        </div>
        ${record.remarks ? `<div style="margin-top: 8px; font-size: 11.5px; color: #475569; border-top: 1px dashed #fed7aa; padding-top: 6px;"><strong>ریمارکس:</strong> ${record.remarks}</div>` : ''}
      </div>

      <!-- Confidential Contact & Office Information -->
      <div style="background: #ecfdf5; border: 1.5px solid #a7f3d0; border-radius: 12px; padding: 12px 18px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
        <div>
          <strong style="color: #065f46;">رابطہ نمبر برائے ریکارڈ (#${record.serialNumber}):</strong>
          <span style="font-family: monospace; font-weight: bold; font-size: 13px; color: #047857; margin-right: 8px; direction: ltr; display: inline-block;">
            ${displayContact}
          </span>
        </div>
        <div style="font-size: 11px; color: #065f46;">
          مرکزی رابطہ: 03323475431 / 03008658360
        </div>
      </div>

      <!-- Official Footer Stamp -->
      <div style="border-top: 2px solid #e2e8f0; padding-top: 14px; display: flex; justify-content: space-between; align-items: center; font-size: 10.5px; color: #64748b;">
        <div>
          <div><strong>تصدیق شدہ برائے:</strong> شعبہ کفاءت السادات - انٹرنیشنل سادات آرگنائزیشن پاکستان</div>
          <div>تیار کردہ: سید محمد عامر شاہ نقوی البخاری (چیئرمین آئی ٹی سپورٹ کونسل) • رابطہ: 03323475431</div>
        </div>
        <div style="text-align: left; font-family: monospace;">
          تاریخِ اجراء: ${new Date().toLocaleDateString('ur-PK')}<br />
          فائل کوڈ: #${record.serialNumber}
        </div>
      </div>

    </div>
  `;
}

/**
 * Builds HTML template for Cover page of Bulk PDF
 */
function buildBulkCoverHtml(title: string, count: number, typeName: string, serialRange: string): string {
  return `
    <div style="width: 794px; min-height: 1120px; padding: 60px 40px; background: #ffffff; color: #0f172a; font-family: 'Amiri', 'Noto Sans Arabic', Tahoma, Arial, sans-serif; direction: rtl; text-align: center; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; margin-bottom: 20px;">
      
      <div>
        <!-- Top Bar -->
        <div style="height: 6px; background: #064e3b; border-radius: 3px; margin-bottom: 40px;"></div>
        
        <img src="${logoImage}" style="width: 110px; height: 110px; border-radius: 20px; border: 3px solid #d97706; margin: 0 auto 20px auto; object-fit: cover;" alt="Logo" />
        
        <div style="font-size: 16px; color: #78350f; font-weight: bold;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
        <h1 style="font-size: 32px; font-weight: 900; color: #064e3b; margin: 10px 0 5px 0;">شعبہ کفاءت السادات پاکستان</h1>
        <h2 style="font-size: 18px; color: #d97706; margin: 0 0 10px 0;">انٹرنیشنل سادات آرگنائزیشن (ISO) پاکستان</h2>
        <p style="font-size: 13px; color: #64748b; max-width: 500px; margin: 0 auto 30px auto;">
          مرکزی ریکارڈ روم برائے سادات رشتہ جات • آفیشل ماسٹر رجسٹر بلک فائل
        </p>

        <!-- Category Card -->
        <div style="background: #f8fafc; border: 2px solid #cbd5e1; border-radius: 20px; padding: 30px; max-width: 600px; margin: 0 auto 30px auto;">
          <div style="font-size: 14px; color: #64748b;">دستاویز کی نوعیت:</div>
          <div style="font-size: 26px; font-weight: bold; color: #0f172a; margin: 6px 0 12px 0;">${title}</div>
          
          <div style="display: flex; justify-content: center; gap: 20px; margin-top: 15px;">
            <div style="background: #ffffff; padding: 10px 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
              <div style="font-size: 11px; color: #64748b;">کل ریکارڈز</div>
              <div style="font-size: 22px; font-weight: bold; color: #064e3b;">${count}</div>
            </div>
            <div style="background: #ffffff; padding: 10px 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
              <div style="font-size: 11px; color: #64748b;">سیریز / درجہ بندی</div>
              <div style="font-size: 22px; font-weight: bold; color: #d97706;">${typeName}</div>
            </div>
            <div style="background: #ffffff; padding: 10px 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
              <div style="font-size: 11px; color: #64748b;">فائل کوڈز کی حدود</div>
              <div style="font-size: 22px; font-weight: bold; color: #1e3a8a; font-family: monospace;">${serialRange}</div>
            </div>
          </div>
        </div>

        <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 12px; padding: 12px 20px; max-width: 600px; margin: 0 auto; font-size: 12px; color: #92400e; line-height: 1.6;">
          ⚠️ <strong>تنبیہ و رازداری:</strong> یہ ریکارڈ روم فائل صرف اور صرف انتظامیہ السادات کے آفیشل استعمال برائے رشتہ جوڑنے اور کفاءت کے لیے ہے۔ خواتین کے نام و کوائف کی حفاظت ہم سب پر شرعی و اخلاقی فریضہ ہے۔
        </div>
      </div>

      <!-- Bottom Credits -->
      <div style="border-top: 2px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #64748b;">
        <div><strong>تیار کردہ و نگران:</strong> سید محمد عامر شاہ نقوی البخاری (چیئرمین آئی ٹی سپورٹ کونسل)</div>
        <div style="margin-top: 4px;">سرپرست: سید نذیر مختار نقوی البخاری • چیف ایڈمن: سید محمد صفدر نواز نقوی ترمذی</div>
        <div style="margin-top: 4px; font-family: monospace;">تاریخِ ڈاؤن لوڈ: ${new Date().toLocaleDateString('ur-PK')}</div>
      </div>

    </div>
  `;
}

/**
 * Renders HTML inside an isolated hidden iframe with NO Tailwind v4 stylesheets.
 * This completely prevents the `Attempting to parse an unsupported color function "oklab"` error!
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
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background: #ffffff;
            color: #0f172a;
            font-family: 'Amiri', 'Noto Sans Arabic', Tahoma, Arial, sans-serif;
            direction: rtl;
            text-align: right;
            width: 794px;
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

    // Allow browser time to layout and resolve images
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Convert iframe document body to high-DPI canvas
    const canvas = await html2canvas(doc.body, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794
    });

    return canvas;
  } finally {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }
}

/**
 * Exports a single Sadat Record into a high quality PDF
 * File name matches file code: e.g. FM001_Sadat_Record.pdf or M001_Sadat_Record.pdf
 */
export async function exportSingleRecordToPdf(
  record: SadatRecord, 
  isAdmin = false
): Promise<{ success: boolean; filename?: string; error?: string }> {
  try {
    const filename = `${record.serialNumber}_Sadat_Record.pdf`;
    const html = buildRecordHtml(record, isAdmin, false);

    const canvas = await renderHtmlToCanvas(html);
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
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

    onProgress?.('ٹائٹل پیج تیار ہو رہا ہے...');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // 1. Generate Cover Page
    const coverHtml = buildBulkCoverHtml(title, targetRecords.length, typeName, serialRange);
    const coverCanvas = await renderHtmlToCanvas(coverHtml);
    pdf.addImage(coverCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pdfWidth, pdfHeight);

    // 2. Append each record page
    for (let i = 0; i < targetRecords.length; i++) {
      const rec = targetRecords[i];
      onProgress?.(`ریکارڈ #${rec.serialNumber} شامل ہو رہا ہے (${i + 1} از ${targetRecords.length})...`);

      const recHtml = buildRecordHtml(rec, isAdmin, true);
      const recCanvas = await renderHtmlToCanvas(recHtml);

      pdf.addPage();
      pdf.addImage(recCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pdfWidth, pdfHeight);
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
