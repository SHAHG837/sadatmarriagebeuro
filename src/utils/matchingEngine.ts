import { MatchResult, SadatRecord } from '../types/record';

/**
 * Calculates compatibility score between target record and candidate records of opposite gender
 */
export function calculateMatches(
  target: SadatRecord,
  allRecords: SadatRecord[]
): MatchResult[] {
  // Only match with opposite gender
  const oppositeGender = target.gender === 'لڑکا' ? 'لڑکی' : 'لڑکا';
  const candidates = allRecords.filter(
    (r) => r.gender === oppositeGender && r.id !== target.id && r.status !== 'طے پا گیا'
  );

  const results: MatchResult[] = candidates.map((candidate) => {
    let score = 0;
    const matchReasons: string[] = [];
    const mismatches: string[] = [];

    // 1. Maslak match (25 points)
    const targetMaslak = target.maslak?.trim() || '';
    const candMaslak = candidate.maslak?.trim() || '';
    const reqMaslak = target.reqMaslak?.trim() || '';

    if (targetMaslak && candMaslak && targetMaslak === candMaslak) {
      score += 25;
      matchReasons.push(`مسلک کی مکمل ہم آہنگی (${candMaslak})`);
    } else if (reqMaslak && candMaslak.includes(reqMaslak)) {
      score += 25;
      matchReasons.push(`مطلوبہ مسلک (${reqMaslak}) سے مطابقت`);
    } else {
      mismatches.push(`مسلک میں فرق (${targetMaslak || 'غیر معین'} بمقابلہ ${candMaslak || 'غیر معین'})`);
    }

    // 2. City match (20 points)
    const targetCity = target.currentCity?.trim() || '';
    const candCity = candidate.currentCity?.trim() || '';
    const reqCity = target.reqCity?.trim() || '';

    if (targetCity && candCity && targetCity === candCity) {
      score += 20;
      matchReasons.push(`ایک ہی شہر (${targetCity}) میں سکونت`);
    } else if (reqCity && (candCity.includes(reqCity) || reqCity.includes(candCity))) {
      score += 20;
      matchReasons.push(`امیدوار کا شہر (${candCity}) مطلوبہ ترجیح کے مطابق ہے`);
    } else if (
      (targetCity === 'راولپنڈی' && candCity === 'اسلام آباد') ||
      (targetCity === 'اسلام آباد' && candCity === 'راولپنڈی')
    ) {
      score += 18;
      matchReasons.push(`جڑواں شہروں (راولپنڈی/اسلام آباد) کا باہمی قرب`);
    } else {
      score += 5;
      mismatches.push(`مختلف شہر (${targetCity} اور ${candCity})`);
    }

    // 3. Marital Status match (20 points)
    const targetMarital = target.maritalStatus?.trim() || 'غیر شادی شدہ';
    const candMarital = candidate.maritalStatus?.trim() || 'غیر شادی شدہ';
    const reqMarital = target.reqMaritalStatus?.trim() || '';

    if (targetMarital === candMarital) {
      score += 20;
      matchReasons.push(`ازدواجی حیثیت ہم آہنگ ہے (${candMarital})`);
    } else if (reqMarital && reqMarital.includes(candMarital)) {
      score += 20;
      matchReasons.push(`مطلوبہ ازدواجی حیثیت کی شرط پر پورا اترتے ہیں`);
    } else {
      score += 5;
      mismatches.push(`ازدواجی حیثیت میں تفاوت`);
    }

    // 4. Age compatibility (20 points)
    const targetAge = target.age;
    const candAge = candidate.age;

    if (targetAge && candAge) {
      if (target.gender === 'لڑکا') {
        // Boy matching with girl: boy usually equal or 1-8 years older
        const diff = targetAge - candAge;
        if (diff >= 1 && diff <= 7) {
          score += 20;
          matchReasons.push(`عمر میں مثالی فرق (${diff} سال لڑکا بڑا ہے)`);
        } else if (diff >= -1 && diff <= 10) {
          score += 14;
          matchReasons.push(`عمر کا فرق مناسب دائرے میں ہے`);
        } else {
          score += 5;
          mismatches.push(`عمر کا تفاوت زیادہ ہے (${candAge} سال)`);
        }
      } else {
        // Girl matching with boy: groom usually equal or 1-8 years older
        const diff = candAge - targetAge;
        if (diff >= 1 && diff <= 7) {
          score += 20;
          matchReasons.push(`عمر میں مثالی فرق (${diff} سال لڑکا بڑا ہے)`);
        } else if (diff >= -1 && diff <= 10) {
          score += 14;
          matchReasons.push(`عمر کا فرق مناسب ہے`);
        } else {
          score += 5;
          mismatches.push(`عمر کا تفاوت (${candAge} سال)`);
        }
      }
    } else {
      score += 10;
    }

    // 5. Qualification compatibility (10 points)
    const targetQual = (target.qualification || '').toLowerCase();
    const candQual = (candidate.qualification || '').toLowerCase();

    const isTargetHigher = targetQual.includes('mbbs') || targetQual.includes('doctor') || targetQual.includes('ڈاکٹر') || targetQual.includes('engineer') || targetQual.includes('انجینئر') || targetQual.includes('m.') || targetQual.includes('ms') || targetQual.includes('phd') || targetQual.includes('ماسٹر');
    const isCandHigher = candQual.includes('mbbs') || candQual.includes('doctor') || candQual.includes('ڈاکٹر') || candQual.includes('engineer') || candQual.includes('انجینئر') || candQual.includes('m.') || candQual.includes('ms') || candQual.includes('phd') || candQual.includes('ماسٹر');

    if (isTargetHigher && isCandHigher) {
      score += 10;
      matchReasons.push(`دونوں اعلیٰ و پیشہ ورانہ تعلیم یافتہ ہیں`);
    } else if (candQual) {
      score += 8;
      matchReasons.push(`امیدوار باصلاحیت اور تعلیم یافتہ ہے`);
    }

    // 6. Sadat lineage (5 points)
    score += 5;
    matchReasons.push(`مستند پاکیزہ سادات شجرہ و خاندان`);

    return {
      record: candidate,
      score: Math.min(100, score),
      matchReasons,
      mismatches
    };
  });

  // Sort descending by score
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Automatically cross-matches all registered boys with girls in the database
 * Returns ranked compatible Rishta pairs with detailed AI analysis
 */
export function autoMatchAllRishtey(allRecords: SadatRecord[]) {
  const boys = allRecords.filter((r) => r.gender === 'لڑکا' && r.status !== 'طے پا گیا');
  const girls = allRecords.filter((r) => r.gender === 'لڑکی' && r.status !== 'طے پا گیا');

  const pairs: {
    id: string;
    boy: SadatRecord;
    girl: SadatRecord;
    score: number;
    matchReasons: string[];
    mismatches: string[];
    aiSummary: string;
  }[] = [];

  for (const boy of boys) {
    const matches = calculateMatches(boy, allRecords);
    for (const match of matches) {
      if (match.score >= 50) {
        const girl = match.record;
        const reasonsText = match.matchReasons.join('، ');
        const aiSummary = `تجزیہ برائے AI: لڑکا #${boy.serialNumber} (${boy.currentCity}، ${boy.age} سال) اور لڑکی #${girl.serialNumber} (${girl.currentCity}، ${girl.age} سال) کے مابین کفاءت کا اسکور ${match.score}% ہے۔ اہم عوامل: ${reasonsText}۔ دونوں خاندانوں کے مابین رشتہ کے لیے نہایت موزوں تجویز ہے۔`;

        pairs.push({
          id: `${boy.id}_${girl.id}`,
          boy,
          girl,
          score: match.score,
          matchReasons: match.matchReasons,
          mismatches: match.mismatches,
          aiSummary
        });
      }
    }
  }

  // Sort highest compatibility first
  return pairs.sort((a, b) => b.score - a.score);
}
