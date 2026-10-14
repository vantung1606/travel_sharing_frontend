import React from 'react';
import { Sparkles, Store, Compass, Navigation, PlusCircle, MapPin, CloudSun } from 'lucide-react';

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
    { city: 'Đà Lạt', temp: '18°C', icon: '🌫️', status: 'Se lạnh săn mây', bg: 'hover:border-sky-400' },
    { city: 'Sa Pa', temp: '16°C', icon: '⛅', status: 'Sương mù mây ngàn', bg: 'hover:border-emerald-400' },
    { city: 'Phú Quốc', temp: '29°C', icon: '☀️', status: 'Nắng ấm biển êm', bg: 'hover:border-amber-400' },
    { city: 'Đà Nẵng', temp: '26°C', icon: '🌤️', status: 'Gió biển dễ chịu', bg: 'hover:border-cyan-400' },
    { city: 'Hà Giang', temp: '21°C', icon: '🌾', status: 'Mát mẻ view đèo', bg: 'hover:border-orange-400' },
    { city: 'Ninh Bình', temp: '23°C', icon: '🛶', status: 'Non nước thanh bình', bg: 'hover:border-indigo-400' }
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

      {/* 2. Modern Compact Header Ribbon */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-5 sm:p-7 text-white relative overflow-hidden shadow-xl border border-sky-500/20">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-sky-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-8 left-1/4 w-60 h-60 bg-amber-500/10 rounded-full blur-[70px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Title & Live Highlights */}
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-sky-300 text-xs font-bold border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
              <span>Wayfare Explorer • Bản Đồ Du Lịch Bản Địa Việt Nam</span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Khám Phá Điểm Đến & Khí Hậu Du Lịch
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm font-normal leading-relaxed">
              Theo dõi thời tiết thời gian thực, duyệt danh thắng kỳ vĩ và tọa độ săn mây trên khắp 63 tỉnh thành. Bấm chọn bất kỳ địa điểm nào để mở bản đồ chi tiết và lộ trình di chuyển.
            </p>

            {/* Micro Live Metrics */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-sky-200/90 font-medium">
              <span className="flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-emerald-400" />
                <strong className="text-white font-bold">{placesCount}+</strong> Tọa độ & Điểm đến
              </span>
              <span className="text-sky-500">•</span>
              <span className="flex items-center gap-1.5">
                <CloudSun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-200 font-bold">Dự báo vệ tinh Open-Meteo</span>
              </span>
              <span className="text-sky-500">•</span>
              <span className="text-emerald-300 font-semibold">Tự động cập nhật</span>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="relative z-10 shrink-0 flex flex-wrap items-center gap-2.5">
            {/* GPS Radar Button */}
            <button
              onClick={onGetLiveLocation}
              disabled={isLocating}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                userCoords
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-sm'
                  : 'bg-white/10 text-slate-200 border-white/15 hover:bg-white/15'
              }`}
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-sky-400' : 'text-emerald-400'}`} />
              <span>{userCoords ? '📍 Đang dùng GPS' : 'Bật Radar GPS'}</span>
            </button>

            {/* AI Generator Button */}
            <button
              onClick={onOpenAIGenerator}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Tour AI</span>
            </button>

            {/* Add Place Button */}
            <button
              onClick={onOpenAddPlaceModal}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Đăng địa điểm</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Live Weather Stations Ribbon (Thanh Thời Tiết Du Lịch Trực Tiếp) */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 shrink-0 flex items-center gap-1 pl-1">
          <CloudSun className="w-3.5 h-3.5 text-sky-600" />
          <span>Thời tiết nhanh:</span>
        </span>
        {weatherTickers.map((station) => (
          <button
            key={station.city}
            onClick={() => onQuickFilterCity(station.city)}
            className={`px-3 py-1.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs text-xs font-semibold flex items-center gap-2 shrink-0 transition-all cursor-pointer group ${station.bg}`}
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
