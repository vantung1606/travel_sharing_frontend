import React from 'react';
import { Sparkles, Store, Compass, Navigation, PlusCircle, CloudSun } from 'lucide-react';

export const ExploreHeader = ({
  placesCount = 0,
  destinationsCount = 0,
  userCoords = null,
  isLocating = false,
  onGetLiveLocation = () => {},
  onOpenAddPlaceModal = () => {},
  onOpenAIGenerator = () => {},
  onQuickFilterCity = () => {}
}) => {
  // Trạm thời tiết du lịch nhanh của các vùng đất tiêu biểu
  const weatherTickers = [
    { city: 'Đà Lạt', temp: '18°C', icon: '🌫️', status: 'Se lạnh săn mây' },
    { city: 'Sa Pa', temp: '16°C', icon: '⛅', status: 'Sương mù mây ngàn' },
    { city: 'Phú Quốc', temp: '29°C', icon: '☀️', status: 'Nắng ấm biển êm' },
    { city: 'Đà Nẵng', temp: '26°C', icon: '🌤️', status: 'Gió biển dễ chịu' },
    { city: 'Hà Giang', temp: '21°C', icon: '🌾', status: 'Mát mẻ view đèo' },
    { city: 'Ninh Bình', temp: '23°C', icon: '🛶', status: 'Non nước thanh bình' }
  ];

  return (
    <div className="space-y-4">
      {/* 1. Breadcrumb Navigation - Chuẩn UI/UX Consistency */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <a href="/" className="hover:text-sky-600 transition-colors flex items-center gap-1">
          <Compass className="w-3.5 h-3.5" />
          <span>Trang chủ</span>
        </a>
        <span>/</span>
        <span className="text-slate-900 font-bold">Khám phá & Tọa độ Du lịch</span>
      </div>

      {/* 2. Modern Clean & Breathable Header Card (Giao diện Sáng, Tinh tế, Không đen tối thô kệch) */}
      <div className="bg-gradient-to-br from-white via-slate-50/60 to-sky-50/40 rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs relative overflow-hidden">
        {/* Soft Decorative Ambient Background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-64 h-64 bg-amber-100/30 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Title & Subtitle */}
          <div className="space-y-2.5 max-w-2xl">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200/80 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Wayfare Explorer • Bản Đồ Du Lịch Bản Địa Việt Nam</span>
            </div>

            {/* Page Heading */}
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-snug">
              Khám Phá Điểm Đến & Khí Hậu Du Lịch
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-xs sm:text-sm font-normal leading-relaxed">
              Theo dõi thời tiết thực tế, duyệt danh thắng kỳ vĩ và tọa độ săn mây trên khắp 63 tỉnh thành. Bấm chọn địa điểm để xem bản đồ chi tiết và lộ trình di chuyển.
            </p>

            {/* Live Metrics Row */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500 font-medium">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 text-slate-700 shadow-2xs font-semibold">
                <Store className="w-3.5 h-3.5 text-sky-600" />
                <strong className="text-slate-900 font-bold">{placesCount}+</strong> Tọa độ & Điểm đến
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 text-slate-700 shadow-2xs font-semibold">
                <CloudSun className="w-3.5 h-3.5 text-amber-500" />
                <span>Dự báo Open-Meteo vệ tinh</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Tự động cập nhật
              </span>
            </div>
          </div>

          {/* Right: Harmonized Quick Action Buttons */}
          <div className="relative z-10 shrink-0 flex flex-wrap items-center gap-2.5">
            {/* GPS Radar Button */}
            <button
              onClick={onGetLiveLocation}
              disabled={isLocating}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border shadow-2xs ${
                userCoords
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-sky-500' : 'text-emerald-600'}`} />
              <span>{userCoords ? '📍 Đang dùng GPS' : 'Bật Radar GPS'}</span>
            </button>

            {/* AI Generator Button */}
            <button
              onClick={onOpenAIGenerator}
              className="px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 text-amber-800 font-bold text-xs flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Tour AI</span>
            </button>

            {/* Add Place Button - Brand Sky color instead of clashing neon orange */}
            <button
              onClick={onOpenAddPlaceModal}
              className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Đăng địa điểm</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Live Weather Stations Ribbon (Thanh Thời Tiết Du Lịch Trực Tiếp) */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 shrink-0 flex items-center gap-1 pl-1">
          <CloudSun className="w-3.5 h-3.5 text-sky-600" />
          <span>Thời tiết nhanh:</span>
        </span>
        {weatherTickers.map((station) => (
          <button
            key={station.city}
            onClick={() => onQuickFilterCity(station.city)}
            className="px-3 py-1.5 rounded-2xl bg-white hover:bg-sky-50 border border-slate-200/80 hover:border-sky-300 shadow-2xs text-xs font-semibold flex items-center gap-2 shrink-0 transition-all cursor-pointer group"
          >
            <span className="text-base select-none">{station.icon}</span>
            <span className="font-bold text-slate-800 group-hover:text-sky-600 transition-colors">{station.city}</span>
            <span className="font-extrabold text-sky-700">{station.temp}</span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">• {station.status}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
