import React from 'react';
import { Phone, ShieldCheck, Award } from 'lucide-react';

export const RunningTicker: React.FC = () => {
  const tickerText = 
    "✦ This portal is prepared by Syed Muhammad Aamir Shah Naqvi Al-Bukhari, Chairman IT Support Council, International Sadat Organization Pakistan. For more information contact: 03323475431 ✦ یہ پورٹل سید محمد عامر شاہ نقوی البخاری، چیئرمین آئی ٹی سپورٹ کونسل، انٹرنیشنل سادات آرگنائزیشن پاکستان نے تیار کیا ہے۔ برائے رابطہ و معلومات: 03323475431 ✦";

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-950 text-amber-300 py-2 border-b border-amber-500/30 overflow-hidden shadow-inner font-arabic">
      <div className="max-w-7xl mx-auto px-2 flex items-center gap-2">
        <div className="bg-amber-400 text-emerald-950 px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-bold shrink-0 flex items-center gap-1 shadow-xs uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" />
          <span>اہم اعلان</span>
        </div>

        <div className="overflow-hidden whitespace-nowrap flex-1 relative">
          <div className="animate-marquee inline-block text-xs md:text-sm font-medium tracking-wide">
            <span className="mx-4">{tickerText}</span>
            <span className="mx-4">{tickerText}</span>
          </div>
        </div>

        <a
          href="tel:03323475431"
          className="bg-emerald-900/90 hover:bg-emerald-800 text-amber-200 border border-amber-400/40 px-2.5 py-0.5 rounded-full text-[11px] font-mono shrink-0 hidden sm:flex items-center gap-1 transition"
          title="ڈائریکٹ رابطہ کریں"
        >
          <Phone className="w-3 h-3 text-emerald-400" />
          <span>03323475431</span>
        </a>
      </div>
    </div>
  );
};
