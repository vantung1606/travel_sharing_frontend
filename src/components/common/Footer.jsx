import React from 'react';
import { Compass, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#0b1320] text-slate-200 py-10 sm:py-14 border-t border-slate-800">
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-10">
          {/* Brand & Intro */}
          <div>
            <div className="mb-3 sm:mb-4">
              <img
                src="/wayfare-logo-white.png"
                alt="Wayfare"
                className="h-9 sm:h-10 w-auto object-contain drop-shadow-sm"
              />
            </div>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 font-normal">
              Nền tảng du lịch cá tính & chia sẻ trải nghiệm lữ hành thông minh hàng đầu Việt Nam.
            </p>
          </div>

          {/* Quick Links 1 */}
          <div>
            <h4 className="font-bold text-white text-xs sm:text-base mb-2.5 sm:mb-3.5 tracking-tight uppercase sm:normal-case">Khám Phá</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><a href="#kham-pha" className="text-slate-300 hover:text-white hover:underline transition-colors">Lịch trình gợi ý nổi bật</a></li>
              <li><a href="/explore" className="text-slate-300 hover:text-white hover:underline transition-colors">Top điểm đến hot nhất</a></li>
              <li><a href="/community" className="text-slate-300 hover:text-white hover:underline transition-colors">Cộng đồng du lịch</a></li>
              <li><a href="/explore" className="text-slate-300 hover:text-white hover:underline transition-colors">Review điểm check-in</a></li>
            </ul>
          </div>

          {/* Quick Links 2 */}
          <div>
            <h4 className="font-bold text-white text-xs sm:text-base mb-2.5 sm:mb-3.5 tracking-tight uppercase sm:normal-case">Tính Năng Nổi Bật</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><a href="#ai-dock" className="text-slate-300 hover:text-white hover:underline transition-colors">Lên lịch trình tự động</a></li>
              <li><a href="#ai-dock" className="text-slate-300 hover:text-white hover:underline transition-colors">Tối ưu hoá ngân sách</a></li>
              <li><a href="/explore" className="text-slate-300 hover:text-white hover:underline transition-colors">Khám phá điểm đến bí mật</a></li>
              <li><a href="/community" className="text-slate-300 hover:text-white hover:underline transition-colors">Chia sẻ trải nghiệm thực tế</a></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="font-bold text-white text-xs sm:text-base mb-2.5 sm:mb-3.5 tracking-tight uppercase sm:normal-case">Liên Hệ & Hỗ Trợ</h4>
            <p className="text-slate-300 text-xs sm:text-sm mb-1.5 sm:mb-2">Email: <span className="text-white font-medium">contact@wayfare.vn</span></p>
            <p className="text-slate-300 text-xs sm:text-sm mb-3 sm:mb-4">Hotline: <span className="text-white font-medium">1900 6868</span></p>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30 text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                <Compass className="w-3.5 h-3.5 text-sky-300" /> Wayfare Authentic Travel
              </span>
            </div>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="pt-6 sm:pt-8 border-t border-slate-800 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between text-slate-300 font-medium gap-2 sm:gap-0">
          <p className="text-slate-200 font-semibold text-center sm:text-left">© Nguyễn Văn Tùng.</p>
          <p className="flex items-center justify-center gap-1.5 text-slate-300 text-center">
            Thiết kế với <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 fill-rose-500 shrink-0 inline" /> cho cộng đồng yêu du lịch Việt Nam
          </p>
        </div>
      </div>
    </footer>
  );
};
