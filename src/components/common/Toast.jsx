import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur)
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Global Toast Floating Notification Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map(t => {
          let bgClass = 'bg-slate-900 border-slate-700 text-white';
          let Icon = CheckCircle2;
          let iconColor = 'text-emerald-400';

          if (t.type === 'success') {
            bgClass = 'bg-slate-900/95 border-emerald-500/30 text-white shadow-emerald-500/10';
            Icon = CheckCircle2;
            iconColor = 'text-emerald-400';
          } else if (t.type === 'error') {
            bgClass = 'bg-rose-950/95 border-rose-500/30 text-white shadow-rose-500/10';
            Icon = AlertCircle;
            iconColor = 'text-rose-400';
          } else if (t.type === 'info') {
            bgClass = 'bg-slate-900/95 border-sky-500/30 text-white shadow-sky-500/10';
            Icon = Info;
            iconColor = 'text-sky-400';
          } else if (t.type === 'warning') {
            bgClass = 'bg-slate-900/95 border-amber-500/30 text-white shadow-amber-500/10';
            Icon = AlertTriangle;
            iconColor = 'text-amber-400';
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all transform animate-in slide-in-from-top-3 duration-300 ${bgClass}`}
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 text-xs font-semibold leading-relaxed">
                {t.message}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
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
