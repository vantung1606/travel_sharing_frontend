import React, { useState, useEffect } from 'react';
import { Compass, Clock, Shield, Lock, RefreshCw, Sparkles, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MaintenanceScreen = ({ maintenanceData }) => {
  const { setIsAuthModalOpen, setAuthMode } = useApp();

  const title = maintenanceData?.title || 'Hệ thống đang bảo trì nâng cấp';
  const message = maintenanceData?.message || 'Wayfare đang tối ưu hóa hệ thống máy chủ để mang đến trải nghiệm khám phá du lịch mượt mà nhất cho bạn. Chúng tôi sẽ sớm quay trở lại!';
  const estimatedEndTime = maintenanceData?.estimatedEndTime;

  // Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    if (!estimatedEndTime) return undefined;

    const calculateTime = () => {
      const target = new Date(estimatedEndTime).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds, isPast: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [estimatedEndTime]);

  return (
    <div className="min-h-screen bg-[#F8F4EC] text-ink-900 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      
      {/* Background Decorative Rings & Gradient */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-clay-200/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-amber-200/40 blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="p-6 sm:px-12 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <img
            src="/wayfare-logo.png"
            alt="Wayfare"
            className="h-8 w-auto object-contain"
          />
          <div className="flex flex-col">
            <span className="font-serif font-black text-sm tracking-wide text-clay-800">
              WAYFARE
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-ink-400">
              Travel Sharing System
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            setAuthMode('login');
            setIsAuthModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[5px] bg-[#FFFDF8] hover:bg-[#F3EFE6] text-ink-700 font-serif font-bold text-xs border border-ink-200/80 shadow-2xs transition-colors cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5 text-clay-600" />
          <span>Đăng nhập Quản trị</span>
        </button>
      </header>

      {/* Center Main Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="max-w-xl w-full bg-[#FFFDF8] rounded-[8px] border border-ink-200/80 shadow-xl p-8 sm:p-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Animated Compass Icon */}
          <div className="relative mx-auto w-20 h-20">
            <div className="w-20 h-20 rounded-full bg-clay-50 border border-clay-200 flex items-center justify-center text-clay-700 shadow-inner">
              <Compass className="w-10 h-10 animate-[spin_12s_linear_infinite]" />
            </div>
            <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-amber-400 text-ink-900 text-[10px] font-bold flex items-center justify-center ring-2 ring-[#FFFDF8]">
              ⚡
            </span>
          </div>

          {/* Heading & Notice */}
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-mono text-[10px] font-bold uppercase tracking-wider border border-amber-300 inline-block">
              Hệ thống đang bảo trì định kỳ
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-ink-900 tracking-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-ink-500 font-sans leading-relaxed max-w-md mx-auto pt-1">
              {message}
            </p>
          </div>

          {/* Countdown Timer (if set) */}
          {estimatedEndTime && !timeLeft.isPast && (
            <div className="p-4 rounded-[6px] bg-[#F8F4EC] border border-ink-200/80 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-ink-400 block">
                Thời gian dự kiến hoàn tất
              </span>
              <div className="flex items-center justify-center gap-3">
                <div className="px-3 py-2 rounded-[5px] bg-[#FFFDF8] border border-ink-200/80 shadow-2xs min-w-[64px]">
                  <span className="font-mono text-xl font-black text-clay-700 block">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] font-serif text-ink-400 uppercase">Giờ</span>
                </div>
                <span className="font-mono font-bold text-ink-400 text-lg">:</span>
                <div className="px-3 py-2 rounded-[5px] bg-[#FFFDF8] border border-ink-200/80 shadow-2xs min-w-[64px]">
                  <span className="font-mono text-xl font-black text-clay-700 block">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] font-serif text-ink-400 uppercase">Phút</span>
                </div>
                <span className="font-mono font-bold text-ink-400 text-lg">:</span>
                <div className="px-3 py-2 rounded-[5px] bg-[#FFFDF8] border border-ink-200/80 shadow-2xs min-w-[64px]">
                  <span className="font-mono text-xl font-black text-clay-700 block">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] font-serif text-ink-400 uppercase">Giây</span>
                </div>
              </div>
            </div>
          )}

          {/* Reassurance Footer */}
          <div className="pt-2 flex items-center justify-center gap-2 text-xs font-serif text-ink-400">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Trang sẽ tự động mở lại ngay khi việc bảo trì kết thúc.</span>
          </div>

        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="p-6 text-center text-xs font-mono text-ink-400 relative z-10">
        © 2026 Wayfare Travel Sharing Platform • Hệ thống tự động phục hồi
      </footer>

    </div>
  );
};
