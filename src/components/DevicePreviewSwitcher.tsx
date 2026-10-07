import React from 'react';
import { Monitor, Smartphone, Tablet, X, RotateCcw } from 'lucide-react';

export type DevicePreviewMode = 'current' | 'mobile' | 'tablet';

interface DevicePreviewSwitcherProps {
  mode: DevicePreviewMode;
  onChangeMode: (mode: DevicePreviewMode) => void;
}

export const DevicePreviewSwitcher: React.FC<DevicePreviewSwitcherProps> = ({
  mode,
  onChangeMode,
}) => {
  return (
    <div className="bg-slate-900 text-slate-100 py-1.5 px-3 border-b border-slate-800 shadow-md flex items-center justify-between text-xs font-arabic z-40 sticky top-0 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="text-amber-400 font-bold hidden sm:inline text-[11px] uppercase tracking-wide">
          پیش منظر (Device Preview):
        </span>
        <div className="bg-slate-800/90 p-0.5 rounded-xl border border-slate-700/80 flex items-center gap-1">
          {/* Current Screen Size */}
          <button
            type="button"
            onClick={() => onChangeMode('current')}
            className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              mode === 'current'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
            title="موجودہ اسکرین سائز (Current Screen Size)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>موجودہ اسکرین سائز (Current)</span>
          </button>

          {/* Tablet Size */}
          <button
            type="button"
            onClick={() => onChangeMode('tablet')}
            className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              mode === 'tablet'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
            title="ٹیبلٹ اسکرین سائز (Tablet 768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>ٹیبلٹ (Tablet)</span>
          </button>

          {/* Mobile Size */}
          <button
            type="button"
            onClick={() => onChangeMode('mobile')}
            className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              mode === 'mobile'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
            title="موبائل اسکرین سائز (Mobile 390px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>موبائل (Mobile)</span>
          </button>
        </div>
      </div>

      {/* Info & Reset badge */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
          {mode === 'current' && 'فل ویو پورٹ • 100% چوڑائی'}
          {mode === 'tablet' && '768 × 1024 px • درمیانی اسکرین'}
          {mode === 'mobile' && '390 × 844 px • اسمارٹ فون'}
        </span>

        {mode !== 'current' && (
          <button
            type="button"
            onClick={() => onChangeMode('current')}
            className="bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-[11px] px-2.5 py-1 rounded-lg border border-slate-700 transition flex items-center gap-1 cursor-pointer"
            title="موجودہ فل اسکرین پر واپس جائیں"
          >
            <RotateCcw className="w-3 h-3" />
            <span>فل اسکرین</span>
          </button>
        )}
      </div>
    </div>
  );
};
