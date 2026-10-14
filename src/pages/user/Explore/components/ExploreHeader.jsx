import React from 'react';
import { Sparkles, Compass, Navigation, PlusCircle, CloudSun } from 'lucide-react';

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
      {/* 1. Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <a href="/" className="hover:text-sky-600 transition-colors flex items-center gap-1 text-slate-500">
          <Compass className="w-3.5 h-3.5" />
          <span>Trang chủ</span>
        </a>
        <span>/</span>
        <span className="text-slate-800 font-bold">Khám phá</span>
      </div>

      {/* 2. Minimalist Header Row (Phong cách Airbnb/Google Travel: Không banner cồng kềnh, đẩy nội dung lên ngay) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-1">
        {/* Left: Clean Heading & Subtitle */}
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Khám Phá Điểm Đến
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Theo dõi thời tiết thực tế & tọa độ du lịch trên khắp 63 tỉnh thành Việt Nam
          </p>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* GPS Radar Button */}
          <button
            onClick={onGetLiveLocation}
            disabled={isLocating}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border shadow-2xs ${
              userCoords
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-sky-500' : 'text-emerald-600'}`} />
            <span>{userCoords ? '📍 Đang dùng GPS' : 'Gần tôi'}</span>
          </button>

          {/* AI Generator Button */}
          <button
            onClick={onOpenAIGenerator}
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 text-amber-800 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Lên lịch AI</span>
          </button>

          {/* Add Place Button */}
          <button
            onClick={onOpenAddPlaceModal}
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs hover:shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Đăng địa điểm</span>
          </button>
        </div>
      </div>

      {/* 3. Live Weather Stations Tickers Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-0.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1 pl-0.5">
          <CloudSun className="w-3.5 h-3.5 text-sky-500" />
          <span>Thời tiết:</span>
        </span>
        {weatherTickers.map((station) => (
          <button
            key={station.city}
            onClick={() => onQuickFilterCity(station.city)}
            className="px-2.5 py-1 rounded-xl bg-white hover:bg-sky-50 border border-slate-200/80 hover:border-sky-300 shadow-2xs text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer group"
          >
            <span className="text-sm select-none">{station.icon}</span>
            <span className="font-bold text-slate-700 group-hover:text-sky-600 transition-colors">{station.city}</span>
            <span className="font-extrabold text-sky-700 text-xs">{station.temp}</span>
            <span className="text-[10px] text-slate-400 hidden lg:inline">• {station.status}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
