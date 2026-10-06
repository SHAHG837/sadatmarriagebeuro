import React from 'react';
import { Phone, ShieldCheck, HeartHandshake, Info } from 'lucide-react';
import logoImage from '../assets/images/shoba_kafaatu_sadat_logo_1791109262101.jpg';

export const BureauInfoBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-teal-950 text-amber-50 rounded-2xl p-4 md:p-6 shadow-xl border border-amber-500/30 my-4 relative overflow-hidden">
      {/* Decorative Islamic Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
        {/* Emblem Image from Upload */}
        <div className="relative group shrink-0">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400/80 p-0.5 bg-gradient-to-br from-amber-300 via-emerald-600 to-amber-500">
            <img 
              src={logoImage} 
              alt="شعبہ کفاءت السادات - بین الاقوامی تنظیم السادات" 
              className="w-full h-full object-cover rounded-xl transition duration-500 group-hover:scale-105"
            />
          </div>
          <div className="absolute -bottom-2 -right-1 bg-amber-500 text-emerald-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md uppercase tracking-wider">
            ISO سادات
          </div>
        </div>

        {/* Text Details & Islamic Message */}
        <div className="flex-1 text-center md:text-right space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-800/80 px-3 py-1 rounded-full text-xs text-amber-300 border border-amber-400/30">
            <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
            <span>خالصتاً فی سبیل اللہ و برائے رضائے الٰہی</span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold font-amiri text-amber-300 tracking-wide">
            شُعْبَةُ كَفَاءَةِ السَّادَاتِ (بین الاقوامی تنظیم السادات - ISO)
          </h2>
          
          <p className="text-xs md:text-sm text-emerald-100/90 leading-relaxed font-arabic">
            سادات کے بچوں کے رشتے خالصتاً اللہ تعالیٰ کی رضا اور آلِ رسول ﷺ کے شایانِ شان کفاءت کے لیے کروائے جاتے ہیں۔ اس خدمت کا کسی قسم کا کوئی معاوضہ، نذرانہ یا فیس نہیں ہے۔
          </p>

          <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-amber-200/90">
            <span className="flex items-center gap-1 bg-emerald-900/60 px-2.5 py-1 rounded-lg border border-emerald-700/50">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              مستورات (خواتین) کا نام و فون صیغہ راز میں
            </span>
            <span className="flex items-center gap-1 bg-emerald-900/60 px-2.5 py-1 rounded-lg border border-emerald-700/50">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              فیس کا تقاضا ممنوع ہے
            </span>
          </div>
        </div>

        {/* Official Bureau Contacts */}
        <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto bg-black/25 backdrop-blur-sm p-3.5 rounded-xl border border-amber-500/20 text-center md:text-right">
          <div className="text-[11px] font-semibold text-amber-300 mb-1 border-b border-white/10 pb-1 flex items-center justify-center md:justify-start gap-1">
            <Phone className="w-3 h-3 text-amber-400" />
            <span>رابطہ نمبرز برائے رہنمائی و تصدیق:</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2">
            <a
              href="tel:+923032880555"
              className="group flex items-center justify-between gap-3 text-xs bg-emerald-900/50 hover:bg-emerald-800/80 px-3 py-1.5 rounded-lg border border-emerald-700/40 transition"
            >
              <div className="text-right">
                <div className="font-semibold text-amber-200">سید نذیر مختار نقوی البخاری</div>
                <div className="text-slate-300 font-mono text-[11px]" dir="ltr">+92 303 2880555</div>
              </div>
              <Phone className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition" />
            </a>

            <a
              href="tel:03008658360"
              className="group flex items-center justify-between gap-3 text-xs bg-emerald-900/50 hover:bg-emerald-800/80 px-3 py-1.5 rounded-lg border border-emerald-700/40 transition"
            >
              <div className="text-right">
                <div className="font-semibold text-amber-200">سید محمد صفدر نواز نقوی ترمذی</div>
                <div className="text-slate-300 font-mono text-[11px]" dir="ltr">0300 8658360</div>
              </div>
              <Phone className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition" />
            </a>

            <a
              href="tel:03467791264"
              className="group flex items-center justify-between gap-3 text-xs bg-emerald-900/50 hover:bg-emerald-800/80 px-3 py-1.5 rounded-lg border border-emerald-700/40 transition"
            >
              <div className="text-right">
                <div className="font-semibold text-amber-200">سید محمد ندیم شاہ</div>
                <div className="text-slate-300 font-mono text-[11px]" dir="ltr">0346 7791264</div>
              </div>
              <Phone className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition" />
            </a>

            <a
              href="tel:03066238755"
              className="group flex items-center justify-between gap-3 text-xs bg-emerald-900/50 hover:bg-emerald-800/80 px-3 py-1.5 rounded-lg border border-emerald-700/40 transition"
            >
              <div className="text-right">
                <div className="font-semibold text-amber-200">سید عابد حسین شاہ</div>
                <div className="text-slate-300 font-mono text-[11px]" dir="ltr">0306 6238755</div>
              </div>
              <Phone className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
