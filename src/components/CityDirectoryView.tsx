import React from 'react';
import { MapPin, Users, ArrowLeft } from 'lucide-react';
import { SadatRecord } from '../types/record';
import { PAKISTAN_CITIES } from '../data/initialRecords';

interface CityDirectoryViewProps {
  records: SadatRecord[];
  selectedCity: string | null;
  onSelectCity: (city: string | null) => void;
}

export const CityDirectoryView: React.FC<CityDirectoryViewProps> = ({
  records,
  selectedCity,
  onSelectCity
}) => {
  // Aggregate counts per city
  const cityStats = PAKISTAN_CITIES.map((city) => {
    const cityRecords = records.filter(
      (r) => r.currentCity === city || (r.nativeCity && r.nativeCity.includes(city))
    );
    const maleCount = cityRecords.filter((r) => r.gender === 'لڑکا').length;
    const femaleCount = cityRecords.filter((r) => r.gender === 'لڑکی').length;
    return {
      cityName: city,
      total: cityRecords.length,
      male: maleCount,
      female: femaleCount
    };
  });

  // Filter cities that have at least 1 record to the top, but show all
  const sortedStats = [...cityStats].sort((a, b) => b.total - a.total);

  return (
    <div className="bg-white rounded-3xl p-5 md:p-7 shadow-sm border border-slate-200/80 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <MapPin className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-bold text-lg md:text-xl text-emerald-950 font-amiri">
                شہر وار تفریق و ڈائریکٹری (All Pakistan City Segregation)
              </h3>
              <p className="text-xs text-slate-500">
                پورے پاکستان کے تمام شہروں میں مردانہ و مستورات سادات رشتوں کی تقسیم
              </p>
            </div>
          </div>
        </div>

        {/* Selected city indicator / clear */}
        <div className="flex items-center gap-2">
          {selectedCity && (
            <button
              onClick={() => onSelectCity(null)}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-300 transition flex items-center gap-1.5"
            >
              <span>تمام شہر دکھائیں</span>
              <span className="font-bold">✕</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Cities */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {sortedStats.map((item) => {
          const isSelected = selectedCity === item.cityName;
          return (
            <div
              key={item.cityName}
              onClick={() => onSelectCity(isSelected ? null : item.cityName)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-right flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-900 text-white border-emerald-950 shadow-md ring-2 ring-amber-400'
                  : item.total > 0
                  ? 'bg-gradient-to-br from-slate-50 to-emerald-50/30 hover:bg-emerald-50/70 border-emerald-800/15 hover:border-emerald-600 shadow-xs'
                  : 'bg-slate-50/40 hover:bg-slate-50 border-slate-200 text-slate-400 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className={`font-bold text-sm ${isSelected ? 'text-amber-300' : 'text-slate-800'}`}>
                  {item.cityName}
                </span>
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  isSelected 
                    ? 'bg-amber-400 text-emerald-950' 
                    : item.total > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {item.total}
                </span>
              </div>

              {/* Counts Breakdown */}
              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-black/5">
                <span className={isSelected ? 'text-blue-200' : 'text-blue-700 font-medium'}>
                  مردانہ: <strong>{item.male}</strong>
                </span>
                <span className={isSelected ? 'text-rose-200' : 'text-rose-700 font-medium'}>
                  مستورات: <strong>{item.female}</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
