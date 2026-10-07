import React from 'react';
import { Monitor, Smartphone, Tablet, RotateCcw, Sparkles } from 'lucide-react';
import { DevicePreviewSwitcher, DevicePreviewMode } from './DevicePreviewSwitcher';

interface DevicePreviewLayoutProps {
  mode: DevicePreviewMode;
  onChangeMode: (mode: DevicePreviewMode) => void;
  children: React.ReactNode;
}

export const DevicePreviewLayout: React.FC<DevicePreviewLayoutProps> = ({
  mode,
  onChangeMode,
  children,
}) => {
  return (
    <div className="min-h-screen flex flex-col font-arabic selection:bg-amber-400 selection:text-emerald-950 bg-slate-100">
      {/* Top sticky device preview switch bar with all three options: current, tablet, mobile */}
      <DevicePreviewSwitcher mode={mode} onChangeMode={onChangeMode} />

      {/* Main View Area based on selected preview mode */}
      {mode === 'current' ? (
        // Option 1: Current Screen Size (Default responsive full screen)
        <div className="flex-1 w-full">{children}</div>
      ) : mode === 'tablet' ? (
        // Option 2: Tablet Preview (iPad / Tablet ~768px)
        <div className="flex-1 bg-slate-950 py-6 px-2 sm:px-4 flex flex-col items-center justify-start overflow-x-auto min-h-[calc(100vh-42px)]">
          <div className="text-center mb-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-blue-900/80 text-blue-200 border border-blue-600/60 px-3 py-1 rounded-full text-xs font-bold shadow-md">
              <Tablet className="w-3.5 h-3.5 text-blue-300" />
              <span>ٹیبلٹ اسکرین پیش منظر (Tablet Preview • 768px)</span>
            </span>
            <button
              onClick={() => onChangeMode('current')}
              className="text-xs text-amber-300 hover:text-amber-200 underline cursor-pointer"
            >
              (موجودہ اسکرین پر واپس جائیں)
            </button>
          </div>

          {/* Realistic Tablet Hardware Bezel */}
          <div className="w-full max-w-[768px] bg-slate-900 rounded-[32px] p-2.5 sm:p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-4 border-slate-700/80 ring-2 ring-amber-400/25 flex flex-col my-auto">
            {/* Tablet Top Camera & Sensor Bar */}
            <div className="flex items-center justify-between px-4 py-1 text-[11px] text-slate-400 font-mono select-none">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-600 inline-block shadow-inner" />
                <span className="text-[10px] text-slate-400">iPad / Tablet (768 × 1024)</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span>100% 🔋</span>
                <span>📶 Wi-Fi</span>
              </div>
            </div>

            {/* Tablet Screen Viewport Container */}
            <div className="w-full overflow-y-auto max-h-[82vh] rounded-[22px] bg-slate-100 text-slate-900 shadow-inner relative border border-slate-300 overscroll-contain">
              {children}
            </div>

            {/* Tablet Home Bar */}
            <div className="flex justify-center py-2 select-none">
              <div className="w-36 h-1.5 bg-slate-600 hover:bg-slate-500 rounded-full transition" />
            </div>
          </div>
        </div>
      ) : (
        // Option 3: Mobile Preview (Smartphone ~390px)
        <div className="flex-1 bg-slate-950 py-6 px-2 flex flex-col items-center justify-start overflow-x-auto min-h-[calc(100vh-42px)]">
          <div className="text-center mb-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-rose-900/80 text-rose-200 border border-rose-600/60 px-3 py-1 rounded-full text-xs font-bold shadow-md">
              <Smartphone className="w-3.5 h-3.5 text-rose-300" />
              <span>موبائل اسکرین پیش منظر (Mobile Preview • 390px)</span>
            </span>
            <button
              onClick={() => onChangeMode('current')}
              className="text-xs text-amber-300 hover:text-amber-200 underline cursor-pointer"
            >
              (موجودہ اسکرین پر واپس جائیں)
            </button>
          </div>

          {/* Realistic Smartphone Hardware Bezel */}
          <div className="w-full max-w-[400px] bg-slate-900 rounded-[44px] p-2.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] border-4 border-slate-800 ring-2 ring-amber-400/25 flex flex-col my-auto">
            {/* Dynamic Island / Camera Notch */}
            <div className="flex items-center justify-between px-3 py-1.5 text-[11px] text-slate-400 font-mono select-none">
              <span className="font-bold text-slate-300">9:41</span>
              <div className="w-24 h-4 bg-slate-950 rounded-full flex items-center justify-center gap-1.5 border border-slate-800 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800" />
              </div>
              <span className="text-[10px] text-slate-400">5G • 100%</span>
            </div>

            {/* Mobile Screen Viewport Container */}
            <div className="w-full overflow-y-auto max-h-[80vh] rounded-[32px] bg-slate-100 text-slate-900 shadow-inner relative border border-slate-300 overscroll-contain">
              {children}
            </div>

            {/* Mobile Home Swipe Indicator */}
            <div className="flex justify-center py-2 select-none">
              <div className="w-28 h-1.5 bg-slate-600 rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* Floating Quick Switcher Pill (Accessible at all times from bottom-left corner) */}
      <div className="fixed bottom-4 left-4 z-40 bg-slate-900/90 text-white rounded-2xl shadow-2xl border border-slate-700/80 p-1 flex items-center gap-1 backdrop-blur-md">
        <button
          type="button"
          onClick={() => onChangeMode('current')}
          className={`px-2.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1 cursor-pointer ${
            mode === 'current'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="موجودہ اسکرین سائز (Current Screen)"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">موجودہ اسکرین</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeMode('tablet')}
          className={`px-2.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1 cursor-pointer ${
            mode === 'tablet'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="ٹیبلٹ پیش منظر (Tablet 768px)"
        >
          <Tablet className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">ٹیبلٹ</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeMode('mobile')}
          className={`px-2.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1 cursor-pointer ${
            mode === 'mobile'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="موبائل پیش منظر (Mobile 390px)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">موبائل</span>
        </button>

        {mode !== 'current' && (
          <button
            type="button"
            onClick={() => onChangeMode('current')}
            className="p-1.5 text-amber-300 hover:text-amber-200 hover:bg-slate-800 rounded-xl transition cursor-pointer"
            title="فل اسکرین واپس کریں"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
