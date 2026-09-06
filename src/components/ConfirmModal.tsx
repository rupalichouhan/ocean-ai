import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <GlassCard className="w-full max-w-md p-6 relative border-slate-300 shadow-lg">
        <button
          onClick={onCancel}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isDestructive
                ? 'bg-rose-50 border border-rose-200 text-rose-600'
                : 'bg-slate-100 border border-slate-200 text-slate-700'
            }`}
          >
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 mt-6">
          <button
            onClick={onCancel}
            className="px-3.5 py-2 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all shadow-xs active:scale-98 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

