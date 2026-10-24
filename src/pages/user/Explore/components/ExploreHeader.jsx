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
  provincesCount = 0,
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
      {/* 1. Breadcrumb */}
      <div className="flex items-center gap-2 text-[11px] font-semibold text-ink-400">
        <a href="/" className="hover:text-clay-700 transition-colors flex items-center gap-1">
          <Compass className="w-3.5 h-3.5" />
          <span>Trang chủ</span>
        </a>
        <span className="text-ink-300">/</span>
        <span className="text-ink-800">Khám phá</span>
      </div>

      {/* 2. Editorial heading + quick actions */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-ink-800">
            Khám Phá Điểm Đến
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-ink-400 font-medium">
            Thời tiết thực tế và tọa độ du lịch từ cộng đồng Wayfare.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-semibold text-ink-400">
            <span><strong className="text-ink-800 font-bold">{placesCount}</strong> địa điểm</span>
            <span className="h-3 w-px bg-ink-200" />
            <span><strong className="text-ink-800 font-bold">{provincesCount}</strong> tỉnh thành</span>
            {destinationsCount > 0 && (
              <>
                <span className="h-3 w-px bg-ink-200" />
                <span><strong className="text-ink-800 font-bold">{destinationsCount}</strong> danh mục tỉnh</span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 w-full lg:w-auto shrink-0">
          <button
            onClick={onGetLiveLocation}
            disabled={isLocating}
            className={`h-9 w-full lg:w-auto px-2.5 sm:px-3.5 rounded-[5px] text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 border transition-colors cursor-pointer disabled:opacity-60 ${
              userCoords
                ? 'bg-clay-50 text-clay-700 border-clay-400'
                : 'bg-[#FFFDF8] hover:bg-clay-50 text-ink-700 border-ink-200 hover:border-clay-400'
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 shrink-0 ${isLocating ? 'animate-spin text-clay-600' : 'text-clay-600'}`} />
            <span className="truncate">{userCoords ? 'Đang dùng' : 'Gần tôi'}</span>
          </button>

          <button
            onClick={onOpenAIGenerator}
            className="h-9 w-full lg:w-auto px-2.5 sm:px-3.5 rounded-[5px] bg-[#FFFDF8] hover:bg-clay-50 border border-ink-200 hover:border-clay-400 text-ink-700 font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-clay-600 shrink-0" />
            <span className="truncate">Lịch trình</span>
          </button>

          <button
            onClick={onOpenAddPlaceModal}
            className="h-9 w-full lg:w-auto px-2.5 sm:px-3.5 rounded-[5px] bg-clay-600 hover:bg-clay-700 text-[#FFFDF8] font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 border border-clay-600 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Đăng địa điểm</span>
          </button>
        </div>
      </div>

      {/* 3. Live weather ticker */}
      <div
        onWheel={(e) => {
          if (e.deltaY !== 0) {
            e.currentTarget.scrollLeft += e.deltaY;
          }
        }}
        className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth"
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400 shrink-0 flex items-center gap-1.5">
          <CloudSun className="w-3.5 h-3.5 text-clay-600 shrink-0" />
          <span>Thời tiết</span>
        </span>
        {stations.map((station) => (
          <button
            key={station.city}
            onClick={() => onQuickFilterCity(station.city)}
            disabled={!station.temp}
            className="px-2.5 py-1 rounded-[5px] bg-[#FFFDF8] hover:bg-clay-50 border border-ink-200 hover:border-clay-300 text-[11px] font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer disabled:cursor-default disabled:opacity-60"
          >
            <span className="text-xs select-none">{station.icon || '☁️'}</span>
            <span className="font-bold text-ink-600">{station.city}</span>
            {station.temp ? (
              <span className="font-extrabold text-clay-700">{station.temp}</span>
            ) : (
              <span className="text-[10px] text-ink-300">...</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
