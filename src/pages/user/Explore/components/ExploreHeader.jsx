import React, { useState, useEffect } from 'react';
import { Calendar, Compass, Navigation, PlusCircle, CloudSun } from 'lucide-react';
import { fetchLiveWeatherBatch } from '../../../../utils/weatherUtils';

// Tọa độ TRUNG TÂM các thành phố (địa lý cố định — không phải dữ liệu ảo)
const WEATHER_STATIONS = [
  { city: 'Đà Lạt', lat: 11.94, lng: 108.44 },
  { city: 'Sa Pa', lat: 22.34, lng: 103.84 },
  { city: 'Phú Quốc', lat: 10.29, lng: 103.96 },
  { city: 'Đà Nẵng', lat: 16.05, lng: 108.2 },
  { city: 'Hà Giang', lat: 22.82, lng: 104.98 },
  { city: 'Ninh Bình', lat: 20.25, lng: 105.97 }
];

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
  // Trạm thời tiết DU LỊCH THẬT (Open-Meteo, 1 request batch cho cả 6 trạm)
  const [stations, setStations] = useState(() =>
    WEATHER_STATIONS.map(s => ({ ...s, temp: null, label: null, icon: null }))
  );

  useEffect(() => {
    let alive = true;
    fetchLiveWeatherBatch(WEATHER_STATIONS).then((res) => {
      if (!alive) return;
      setStations(s => s.map(st => {
        const r = res[`${st.lat.toFixed(2)},${st.lng.toFixed(2)}`];
        return r ? { ...st, temp: `${r.temp}°C`, label: r.label, icon: r.icon } : st;
      }));
    });
    return () => { alive = false; };
  }, []);

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

        {/* Right: Quick Action Buttons - 3 columns grid on mobile so they fit in 1 neat row */}
        <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2 w-full sm:w-auto shrink-0">
          {/* GPS Radar Button */}
          <button
            onClick={onGetLiveLocation}
            disabled={isLocating}
            className={`w-full sm:w-auto px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border shadow-2xs ${
              userCoords
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 shrink-0 ${isLocating ? 'animate-spin text-sky-500' : 'text-emerald-600'}`} />
            <span className="truncate">{userCoords ? '📍 Đang dùng' : 'Gần tôi'}</span>
          </button>

          {/* Quick Itinerary Planner Button */}
          <button
            onClick={onOpenAIGenerator}
            className="w-full sm:w-auto px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="truncate">Lịch trình</span>
          </button>

          {/* Add Place Button */}
          <button
            onClick={onOpenAddPlaceModal}
            className="w-full sm:w-auto px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 shadow-xs hover:shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">+ Đăng địa điểm</span>
          </button>
        </div>
      </div>

      {/* 3. Live Weather Stations Tickers Ribbon (Cuộn ngang mượt mà bằng chuột) */}
      <div
        onWheel={(e) => {
          if (e.deltaY !== 0) {
            e.currentTarget.scrollLeft += e.deltaY;
          }
        }}
        className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar pt-0.5 scroll-smooth"
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1 pl-0.5">
          <CloudSun className="w-3.5 h-3.5 text-sky-500 shrink-0" />
          <span className="hidden sm:inline">Thời tiết:</span>
        </span>
        {stations.map((station) => (
          <button
            key={station.city}
            onClick={() => onQuickFilterCity(station.city)}
            disabled={!station.temp}
            className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-white hover:bg-sky-50 border border-slate-200/80 hover:border-sky-300 shadow-2xs text-[11px] sm:text-xs font-semibold flex items-center gap-1 shrink-0 transition-all cursor-pointer group"
          >
            <span className="text-xs sm:text-sm select-none">{station.icon || '☁️'}</span>
            <span className="font-bold text-slate-700 group-hover:text-sky-600 transition-colors">{station.city}</span>
            {station.temp ? (
              <span className="font-extrabold text-sky-700 text-[11px] sm:text-xs">{station.temp}</span>
            ) : (
              <span className="text-[10px] text-slate-400 animate-pulse">...</span>
            )}
            {station.label && (
              <span className="text-[10px] text-slate-400 hidden lg:inline">• {station.label}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
