import { Gender, SadatRecord } from '../types/record';

/**
 * Calculates the next serial number according to gender rules:
 * - Females: FM001, FM002, FM003, ...
 * - Males: M001, M002, M003, ...
 */
export function getNextSerialForGender(gender: Gender, records: SadatRecord[]): string {
  const isFemale = gender === 'لڑکی';
  const prefix = isFemale ? 'FM' : 'M';

  let maxNum = 0;

  for (const r of records) {
    if (!r.serialNumber) continue;
    const clean = r.serialNumber.trim().toUpperCase();

    if (isFemale) {
      // Look for FM001, FM1, etc.
      const match = clean.match(/^FM(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    } else {
      // Look for M001, M1, etc. But NOT FM
      if (!clean.startsWith('FM')) {
        const match = clean.match(/^M(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
    }
  }

  const nextVal = maxNum + 1;
  const padded = nextVal.toString().padStart(3, '0');
  return `${prefix}${padded}`;
}

/**
 * Checks if a given record is a dummy/sample record.
 * Specifically purges "سیدہ زینب نقوی", "سیدہ زینب زہرا زیدی", and legacy mock data.
 */
export function isDummyRecord(r: { id?: string; name?: string; serialNumber?: string }): boolean {
  if (!r) return true;

  // Legacy mock ID pattern
  if (r.id && r.id.startsWith('rec-00')) {
    return true;
  }

  const name = (r.name || '').trim().toLowerCase();

  // Known dummy names to remove completely
  const dummyNames = [
    'سیدہ زینب نقوی',
    'سیدہ زینب',
    'زینب نقوی',
    'سیدہ زانب نقوی',
    'زانب نقوی',
    'syeda zainab naqvi',
    'syeda zanab naqvi',
    'zainab naqvi',
    'zanab naqvi',
    'سیدہ زینب زہرا زیدی',
    'سید علی رضا نقوی',
    'سیدہ فاطمہ بتول رضوی',
    'سید محمد حسن کاظمی',
    'سید عباس حیدر بخاری',
    'سیدہ مریم نقوی'
  ];

  for (const dName of dummyNames) {
    if (name.includes(dName.toLowerCase())) {
      return true;
    }
  }

  // Check specific substrings for Zainab / Zanab
  if (name.includes('زینب') || name.includes('زانب')) {
    return true;
  }

  return false;
}
