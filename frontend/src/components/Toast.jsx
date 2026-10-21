import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export const ToastContainer = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-3 ${
              isSuccess
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100 shadow-emerald-950/50'
                : isError
                ? 'bg-[#2b0c13]/95 border-[#f84464]/60 text-red-100 shadow-[#f84464]/20'
                : isWarning
                ? 'bg-amber-950/90 border-amber-500/50 text-amber-100 shadow-amber-950/50'
                : 'bg-[#121622]/95 border-white/10 text-slate-100'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {isError && <AlertCircle className="w-5 h-5 text-[#f84464] shrink-0 mt-0.5" />}
            {isWarning && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-[#06b6d4] shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs">
              {toast.title && <p className="font-black text-sm text-white">{toast.title}</p>}
              <p className="opacity-90 mt-0.5">{toast.message}</p>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-white/60 hover:text-white transition p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
