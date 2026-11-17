import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Home, ArrowLeft, MapPin } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[#F8F4EC]">
      <div className="max-w-md w-full text-center">
        {/* Animated Icon Badge */}
        <div className="relative inline-flex items-center justify-center w-28 h-28 mb-8 rounded-full bg-[#B0522F]/10 border-2 border-[#B0522F]/20 shadow-sm">
          <Compass className="w-14 h-14 text-[#B0522F] animate-spin" style={{ animationDuration: '20s' }} />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#B0522F] flex items-center justify-center shadow-md text-white">
            <MapPin className="w-4 h-4" />
          </div>
        </div>

        {/* 404 Large Display */}
        <h1 className="text-7xl font-extrabold tracking-tight text-[#1E1A15] mb-2 font-serif">
          404
        </h1>

        <h2 className="text-2xl font-bold text-[#1E1A15] mb-3">
          Lạc đường rồi, Nhà thám hiểm!
        </h2>

        <p className="text-[#6B6258] text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          Trang bạn đang tìm kiếm không tồn tại, đã bị xóa hoặc liên kết hành trình đã thay đổi. Hãy quay lại để tiếp tục khám phá thế giới nhé!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-[#E5DED2] bg-white text-[#1E1A15] text-sm font-semibold hover:bg-[#F2EDE4] transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại trang trước
          </button>

          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#B0522F] hover:bg-[#93422A] text-white text-sm font-semibold transition-all shadow-md cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Về Trang chủ Wayfare
          </Link>
        </div>

        {/* Travel quote footer */}
        <div className="mt-12 pt-6 border-t border-[#E5DED2]/80">
          <p className="text-xs italic text-[#6B6258]">
            "Không phải tất cả những ai lang thang đều bị lạc lối."
          </p>
        </div>
      </div>
    </div>
  );
}
