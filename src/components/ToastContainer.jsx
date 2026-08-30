import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        return (
          <div
            key={toast.id}
            className="pointer-events-auto p-3.5 rounded-2xl glass-dropdown border border-white/15 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200"
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
            {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
            
            <p className="text-xs text-slate-100 font-medium leading-snug flex-1">
              {toast.message}
            </p>
          </div>
        );
      })}
    </div>
  );
}
