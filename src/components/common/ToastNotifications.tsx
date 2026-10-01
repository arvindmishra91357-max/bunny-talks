import React from 'react';
import { useChat } from '../../context/ChatContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastNotifications: React.FC = () => {
  const { toasts, removeToast } = useChat();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[999] flex flex-col items-center gap-2 pointer-events-none px-4 max-w-md w-full">
      {toasts.map((toast) => {
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#1e1b2d]/95 text-white text-xs font-semibold shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md border border-white/10 animate-in fade-in slide-in-from-bottom-3 duration-200"
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
            {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
            {(!toast.type || toast.type === 'info') && <Info className="w-4 h-4 text-[#ff607d] flex-shrink-0" />}
            
            <span className="truncate max-w-[260px] md:max-w-xs">{toast.message}</span>

            <button
              onClick={() => removeToast(toast.id)}
              className="ml-1 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
