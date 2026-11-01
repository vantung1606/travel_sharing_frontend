import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Clock, 
  Shield, 
  Lock, 
  RefreshCw, 
  Sparkles, 
  Plane, 
  Server, 
  Database, 
  Cpu, 
  Phone, 
  Mail, 
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { publicConfigApi } from '../../services/api';
import { useToast } from './Toast';

export const MaintenanceScreen = ({ maintenanceData, onAdminBypass }) => {
  const { setIsAuthModalOpen, setAuthMode, currentUser, isLoggedIn } = useApp();
  const toast = useToast();

  const title = maintenanceData?.title || 'Hệ thống đang bảo trì & nâng cấp trải nghiệm';
  const message = maintenanceData?.message || 'Wayfare đang thực hiện đợt bảo dưỡng máy chủ định kỳ nhằm mang đến tốc độ duyệt web mượt mà và khả năng lên lịch trình AI chính xác nhất cho bạn. Chúng tôi sẽ sớm mở cửa trở lại!';
  const estimatedEndTime = maintenanceData?.estimatedEndTime;
  const allowAdminBypass = maintenanceData?.allowAdminBypass ?? true;

  const userRoles = Array.isArray(currentUser?.roles) ? currentUser.roles : [];
  const isAdmin = isLoggedIn && (userRoles.includes('ROLE_ADMIN') || userRoles.includes('ROLE_MODERATOR'));

  // Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!estimatedEndTime) return undefined;

    const calculateTime = () => {
      const target = new Date(estimatedEndTime).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [estimatedEndTime]);

  // Thử kết nối lại để xem bảo trì đã xong chưa
  const handleCheckStatus = async () => {
    try {
      setChecking(true);
      const config = await publicConfigApi.getSiteConfig();
      if (!config?.maintenance?.enabled) {
        toast.success('Hệ thống bảo trì đã kết thúc! Đang đưa bạn vào trang web... 🎉');
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        toast.info('Hệ thống vẫn đang trong quá trình bảo dưỡng. Đội ngũ kỹ thuật đang hoàn tất các bước cuối cùng!');
      }
    } catch {
      toast.info('Chưa thể kết nối tới máy chủ. Vui lòng thử lại sau giây lát!');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F4EC] text-ink-900 flex flex-col justify-between relative overflow-hidden font-sans select-none px-4 sm:px-6 lg:px-8 xl:px-12">
      
      {/* Background Decorative Rings & Ambient Gradients */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-clay-200/35 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-amber-200/35 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-clay-100/20 blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="py-6 flex items-center justify-between relative z-10 border-b border-ink-200/60">
        <div className="flex items-center gap-3">
          <img
            src="/wayfare-logo.png"
            alt="Wayfare Logo"
            className="h-9 w-auto object-contain"
          />
          <div className="flex flex-col">
            <span className="font-serif font-black text-base tracking-wide text-clay-800">
              WAYFARE
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-ink-400">
              Travel Sharing Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin ? (
            <button
              onClick={() => {
                if (typeof onAdminBypass === 'function') {
                  onAdminBypass();
                } else {
                  window.location.href = '/admin';
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[5px] bg-clay-700 hover:bg-clay-800 text-white font-serif font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-amber-300" />
              <span>Vào Cổng Quản Trị (Admin Portal)</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            allowAdminBypass && (
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
            )
          )}
        </div>
      </header>

      {/* Center Main Card */}
      <main className="flex-1 flex items-center justify-center py-10 relative z-10">
        <div className="max-w-2xl w-full bg-[#FFFDF8] rounded-[10px] border border-ink-200/90 shadow-xl p-6 sm:p-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Animated Travel Compass & Plane Motif */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            {/* Glowing Pulse Halo */}
            <div className="absolute inset-0 rounded-full bg-clay-200/60 animate-ping opacity-25" />
            
            {/* Compass Container */}
            <div className="w-24 h-24 rounded-full bg-clay-50 border-2 border-clay-200/90 flex items-center justify-center text-clay-700 shadow-inner relative z-10">
              <Compass className="w-12 h-12 animate-[spin_16s_linear_infinite]" />
            </div>

            {/* Orbiting Plane Badge */}
            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center ring-4 ring-[#FFFDF8] shadow-sm z-20">
              <Plane className="w-3.5 h-3.5 -rotate-45" />
            </div>
          </div>

          {/* Heading & Notice */}
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 font-mono text-[11px] font-bold uppercase tracking-wider border border-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Chuyến Bay Tạm Dừng Nâng Cấp Định Kỳ</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-ink-900 tracking-tight leading-snug">
              {title}
            </h1>
            
            <p className="text-xs sm:text-sm text-ink-600 font-sans leading-relaxed max-w-lg mx-auto pt-1">
              {message}
            </p>
          </div>

          {/* Countdown Clock (if estimatedEndTime exists) */}
          {estimatedEndTime && !timeLeft.isPast && (
            <div className="p-4 sm:p-5 rounded-[8px] bg-[#F8F4EC]/90 border border-ink-200/90 space-y-3">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-ink-500">
                <Clock className="w-3.5 h-3.5 text-clay-700" />
                <span>Thời gian dự kiến hoàn tất</span>
              </div>
              
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {timeLeft.days > 0 && (
                  <>
                    <div className="px-3 sm:px-4 py-2.5 rounded-[6px] bg-[#FFFDF8] border border-ink-200/90 shadow-xs min-w-[60px] sm:min-w-[72px]">
                      <span className="font-mono text-2xl sm:text-3xl font-black text-clay-800 block">
                        {String(timeLeft.days).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] font-serif text-ink-400 uppercase tracking-wider">Ngày</span>
                    </div>
                    <span className="font-mono font-bold text-ink-400 text-xl">:</span>
                  </>
                )}

                <div className="px-3 sm:px-4 py-2.5 rounded-[6px] bg-[#FFFDF8] border border-ink-200/90 shadow-xs min-w-[60px] sm:min-w-[72px]">
                  <span className="font-mono text-2xl sm:text-3xl font-black text-clay-800 block">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-serif text-ink-400 uppercase tracking-wider">Giờ</span>
                </div>
                
                <span className="font-mono font-bold text-ink-400 text-xl">:</span>
                
                <div className="px-3 sm:px-4 py-2.5 rounded-[6px] bg-[#FFFDF8] border border-ink-200/90 shadow-xs min-w-[60px] sm:min-w-[72px]">
                  <span className="font-mono text-2xl sm:text-3xl font-black text-clay-800 block">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-serif text-ink-400 uppercase tracking-wider">Phút</span>
                </div>
                
                <span className="font-mono font-bold text-ink-400 text-xl">:</span>
                
                <div className="px-3 sm:px-4 py-2.5 rounded-[6px] bg-[#FFFDF8] border border-ink-200/90 shadow-xs min-w-[60px] sm:min-w-[72px]">
                  <span className="font-mono text-2xl sm:text-3xl font-black text-clay-800 block animate-pulse">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-serif text-ink-400 uppercase tracking-wider">Giây</span>
                </div>
              </div>

              <p className="text-[11px] font-mono text-ink-400 pt-1">
                Mốc giờ ước tính: {new Date(estimatedEndTime).toLocaleString('vi-VN')}
              </p>
            </div>
          )}

          {/* 3 Core System Upgrades Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-left">
            <div className="p-3 rounded-[6px] bg-[#F8F4EC]/60 border border-ink-200/60 flex items-start gap-2.5">
              <Server className="w-4 h-4 text-clay-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-serif font-bold text-xs text-ink-900 block">Tối ưu máy chủ</span>
                <span className="text-[10px] text-ink-500 font-sans leading-tight block mt-0.5">
                  Tăng tốc tải trang và xử lý dữ liệu lớn
                </span>
              </div>
            </div>

            <div className="p-3 rounded-[6px] bg-[#F8F4EC]/60 border border-ink-200/60 flex items-start gap-2.5">
              <Cpu className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-serif font-bold text-xs text-ink-900 block">Nâng cấp Lịch trình AI</span>
                <span className="text-[10px] text-ink-500 font-sans leading-tight block mt-0.5">
                  Gợi ý điểm dừng thông minh & thực tế hơn
                </span>
              </div>
            </div>

            <div className="p-3 rounded-[6px] bg-[#F8F4EC]/60 border border-ink-200/60 flex items-start gap-2.5">
              <Database className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-serif font-bold text-xs text-ink-900 block">Sao lưu bảo mật</span>
                <span className="text-[10px] text-ink-500 font-sans leading-tight block mt-0.5">
                  Đảm bảo 100% dữ liệu du khách an toàn
                </span>
              </div>
            </div>
          </div>

          {/* Manual Recheck Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleCheckStatus}
              disabled={checking}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[5px] bg-clay-700 hover:bg-clay-800 text-white font-serif font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50 w-full sm:w-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              <span>{checking ? 'Đang kiểm tra kết nối...' : 'Kiểm Tra Trạng Thái Hệ Thống'}</span>
            </button>

            <span className="text-xs text-ink-400 font-serif">
              Hệ thống sẽ tự động khôi phục ngay khi quá trình hoàn tất.
            </span>
          </div>

          {/* Emergency Support Contacts */}
          <div className="pt-3 border-t border-ink-100 flex flex-wrap items-center justify-center gap-4 text-xs font-sans text-ink-500">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-clay-700" />
              Tổng đài hỗ trợ: <strong className="text-ink-800">1900 6868</strong> (Miễn phí)
            </span>
            <span className="text-ink-300">•</span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-clay-700" />
              Hòm thư: <strong className="text-ink-800">support@wayfare.vn</strong>
            </span>
          </div>

        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="py-6 text-center text-xs font-mono text-ink-400 relative z-10 border-t border-ink-200/60 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2026 Wayfare Travel Sharing Platform • All Rights Reserved</span>
        <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Máy chủ dự phòng đang sẵn sàng khôi phục
        </span>
      </footer>

    </div>
  );
};
