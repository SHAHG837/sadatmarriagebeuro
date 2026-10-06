import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { SadatRecord } from '../types/record';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  record: SadatRecord | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  record,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-md w-full border border-red-200 shadow-2xl overflow-hidden font-arabic text-right"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">ریکارڈ حذف کرنے کی تصدیق</h3>
              <p className="text-xs text-red-100">یہ عمل ناقابلِ واپسی ہے</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-red-100 hover:text-white p-2 rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              کیا آپ واقعی سیریل نمبر <span className="font-bold font-mono text-sm text-red-700">#{record.serialNumber}</span> کا ریکارڈ سسٹم اور لائیو ڈیٹا بیس سے مستقل حذف کرنا چاہتے ہیں؟
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500">امیدوار:</span>
              <span className="font-bold text-slate-900">{record.name || 'سادات امیدوار'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">سیریل نمبر:</span>
              <span className="font-bold font-mono text-emerald-800">#{record.serialNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">حصہ / جنس:</span>
              <span className="font-bold">{record.gender} ({record.age} سال)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">شہر:</span>
              <span>{record.currentCity}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 text-center">
            تصدیق پر یہ ریکارڈ فوری طور پر لائیو سرور اور ڈیش بورڈ سے ہٹا دیا جائے گا۔
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                onConfirm(record.id);
                onClose();
              }}
              className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold rounded-2xl text-sm transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>ہاں، مکمل حذف کریں</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition"
            >
              منسوخ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
