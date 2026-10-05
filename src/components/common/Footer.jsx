import React from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { WayfarePlaneLogo } from './WayfarePlaneLogo';

export const Footer = () => {
  return (
    <footer className="bg-[#0b1320] text-slate-200 py-14 border-t border-slate-800">
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Intro */}
          <div>
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-9 h-9 rounded-xl sky-gradient flex items-center justify-center text-white shadow-md shadow-sky-950/30">
                <WayfarePlaneLogo className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white tracking-tight">
                Way<span className="text-sky-400">fare</span>
              </span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-4 font-normal">
              Nền tảng du lịch cá tính & chia sẻ trải nghiệm lữ hành thông minh hàng đầu Việt Nam.
            </p>
          </div>

          {/* Quick Links 1 */}
          <div>
            <h4 className="font-bold text-white text-sm sm:text-base mb-3.5 tracking-tight">Khám Phá</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#kham-pha" className="text-slate-300 hover:text-white hover:underline transition-colors">Lịch trình gợi ý nổi bật</a></li>
              <li><a href="/explore" className="text-slate-300 hover:text-white hover:underline transition-colors">Top điểm đến hot nhất</a></li>
              <li><a href="/community" className="text-slate-300 hover:text-white hover:underline transition-colors">Cộng đồng du lịch</a></li>
              <li><a href="/explore" className="text-slate-300 hover:text-white hover:underline transition-colors">Review điểm check-in</a></li>
            </ul>
          </div>

          {/* Quick Links 2 */}
          <div>
            <h4 className="font-bold text-white text-sm sm:text-base mb-3.5 tracking-tight">Tính Năng Nổi Bật</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#ai-dock" className="text-slate-300 hover:text-white hover:underline transition-colors">Tạo tour tự động với AI</a></li>
              <li><a href="#ai-dock" className="text-slate-300 hover:text-white hover:underline transition-colors">Tối ưu hoá ngân sách</a></li>
              <li><a href="/explore" className="text-slate-300 hover:text-white hover:underline transition-colors">Radar vệ tinh điểm bí mật</a></li>
              <li><a href="/community" className="text-slate-300 hover:text-white hover:underline transition-colors">Chia sẻ trải nghiệm thực tế</a></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="font-bold text-white text-sm sm:text-base mb-3.5 tracking-tight">Liên Hệ & Hỗ Trợ</h4>
            <p className="text-slate-300 text-sm mb-2">Email: <span className="text-white font-medium">contact@wayfare.vn</span></p>
            <p className="text-slate-300 text-sm mb-4">Hotline: <span className="text-white font-medium">1900 6868</span></p>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" /> Wayfare Authentic Platform
              </span>
            </div>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="pt-8 border-t border-slate-800 text-sm flex flex-col sm:flex-row items-center justify-between text-slate-300 font-medium">
          <p className="text-slate-200 font-semibold text-sm">© Nguyễn Văn Tùng.</p>
          <p className="flex items-center justify-center gap-1.5 mt-2 sm:mt-0 text-slate-300">
            Thiết kế với <Heart className="w-4 h-4 text-rose-500 fill-rose-500 inline" /> cho cộng đồng yêu du lịch Việt Nam
          </p>
        </div>
      </div>
    </footer>
  );
};
