import React from 'react';
import { Compass, Sparkles, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg ocean-gradient flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-lg text-white tracking-tight">
                Way<span className="text-sky-400">fare</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed mb-4">
              Nền tảng du lịch cá tính & chia sẻ trải nghiệm lữ hành hàng đầu Việt Nam.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3">Khám Phá</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-sky-400">Lịch trình gợi ý</a></li>
              <li><a href="#" className="hover:text-sky-400">Top 100 Điểm Đến HOT</a></li>
              <li><a href="#" className="hover:text-sky-400">Cộng đồng du lịch</a></li>
              <li><a href="#" className="hover:text-sky-400">Review điểm Check-in</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3">Tính Năng Nổi Bật</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-sky-400">Tạo tour tự động</a></li>
              <li><a href="#" className="hover:text-sky-400">Tối ưu hoá ngân sách</a></li>
              <li><a href="#" className="hover:text-sky-400">Dự báo thời tiết & thời gian</a></li>
              <li><a href="#" className="hover:text-sky-400">Bản đồ tương tác nhóm</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3">Liên Hệ & Hỗ Trợ</h4>
            <p className="mb-2">Email: contact@wayfare.vn</p>
            <p className="mb-4">Hotline: 1900 6868</p>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[11px] font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Wayfare Authentic Platform
              </span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between text-slate-500">
          <p>© 2026 Wayfare Platform. Tất cả quyền được bảo lưu.</p>
          <p className="flex items-center justify-center gap-1 mt-2 sm:mt-0">
            Thiết kế với <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> cho cộng đồng yêu du lịch Việt Nam
          </p>
        </div>
      </div>
    </footer>
  );
};
