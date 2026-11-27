import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => {
      // Tránh hiển thị trùng cùng một nội dung liên tiếp và giữ tối đa 3 toast
      if (prev.some(t => t.message === message)) return prev;
      return [...prev.slice(-2), { id, message, type }];
    });

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = useMemo(() => ({
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    showSuccess: (msg, dur) => addToast(msg, 'success', dur),
    showError: (msg, dur) => addToast(msg, 'error', dur),
    showInfo: (msg, dur) => addToast(msg, 'info', dur),
    showWarning: (msg, dur) => addToast(msg, 'warning', dur)
  }), [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Global Toast Notification Container - Clean, Basic & Professional */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-xs sm:max-w-sm w-full pointer-events-none px-3 sm:px-0">
        {toasts.map(t => {
          let styleClass = 'bg-[#FFFDF8] border-emerald-200 text-ink-800';
          let Icon = CheckCircle2;
          let iconColor = 'text-emerald-600';

          if (t.type === 'success') {
            styleClass = 'bg-[#FFFDF8] border-emerald-200 text-ink-800';
            Icon = CheckCircle2;
            iconColor = 'text-emerald-600';
          } else if (t.type === 'error') {
            styleClass = 'bg-[#FFFDF8] border-rose-200 text-ink-800';
            Icon = AlertCircle;
            iconColor = 'text-rose-600';
          } else if (t.type === 'info') {
            styleClass = 'bg-[#FFFDF8] border-clay-200 text-ink-800';
            Icon = Info;
            iconColor = 'text-clay-600';
          } else if (t.type === 'warning') {
            styleClass = 'bg-[#FFFDF8] border-amber-200 text-ink-800';
            Icon = AlertTriangle;
            iconColor = 'text-amber-600';
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border shadow-md transition-all animate-in slide-in-from-top-2 duration-200 ${styleClass}`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
              <div className="flex-1 text-[12px] font-medium leading-snug">
                {t.message}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="p-0.5 text-ink-400 hover:text-ink-700 rounded transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
