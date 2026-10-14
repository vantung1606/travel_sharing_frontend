import React from 'react';
import { Star, MapPin, Navigation, Heart, Plus, Compass } from 'lucide-react';
import { getEstimatedWeatherByCity } from '../../../../utils/weatherUtils';

export const ExploreSpotCard = ({
  item,
  isActive = false,
  isSaved = false,
  onSelect = () => {},
  onToggleSave = () => {},
  onOpenDetail = () => {},
  onAddToTrip = () => {}
}) => {
  const weather = getEstimatedWeatherByCity(item.city || item.name);

  return (
    <div
      id={`explore-card-${item.id}`}
      onClick={() => onOpenDetail(item)}
      className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 hover:border-sky-300 shadow-2xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col group relative"
    >
      {/* 1. Panoramic Image Cover 16:9 */}
      <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-slate-900 shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-95"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Top Badges Row */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Category Pill Tag */}
          <span className="px-3 py-1 rounded-full bg-black/55 backdrop-blur-md text-[11px] font-bold text-white shadow-xs border border-white/10">
            {item.category}
          </span>

          {/* Wishlist Heart Button (pointer-events-auto) */}
          <button
            onClick={(e) => onToggleSave(item, e)}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer pointer-events-auto ${
              isSaved
                ? 'bg-rose-500 text-white shadow-md scale-105'
                : 'bg-black/40 text-white hover:bg-black/60'
            }`}
            title={isSaved ? 'Gỡ khỏi yêu thích' : 'Lưu vào yêu thích'}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Badges on Image: Weather Vibe + GPS */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white pointer-events-none">
          {/* Weather Tag */}
          <span className="px-2.5 py-1 rounded-xl bg-sky-950/80 backdrop-blur-md text-[11px] font-bold text-sky-200 flex items-center gap-1.5 border border-sky-400/30">
            <span>{weather.icon}</span>
            <span>{weather.temp}°C • {weather.label}</span>
          </span>

          {/* GPS Distance (if radar active) */}
          {item.distanceKm && (
            <span className="px-2.5 py-1 rounded-xl bg-emerald-600/90 backdrop-blur-md text-[11px] font-bold text-white flex items-center gap-1 shadow-xs">
              <Navigation className="w-3 h-3 text-white" />
              <span>{item.distanceKm} km</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Content Info Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* City & Rating Row */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-bold text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>{item.city}</span>
              {item.region && <span className="text-slate-400 font-normal">• {item.region}</span>}
            </span>

            <div className="flex items-center gap-1 font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{item.rating || '4.9'}</span>
              <span className="text-[10px] text-slate-400 font-normal">({item.reviewsCount || 120})</span>
            </div>
          </div>

          {/* Place Title */}
          <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-900 mt-1 line-clamp-1 group-hover:text-sky-600 transition-colors">
            {item.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {item.description || item.tagline}
          </p>
        </div>

        {/* Footer: Price & Quick Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
          <div>
            <span className="block text-[10px] text-slate-400 font-semibold">Khoảng giá</span>
            <span className="font-extrabold text-sky-700 text-xs sm:text-sm">
              {item.priceEstimate || 'Miễn phí'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Add To Trip */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToTrip(item);
              }}
              title="Thêm vào lịch trình của bạn"
              className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 hover:border-emerald-200 border border-transparent transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* View Detail & Map */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail(item);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-sky-50 group-hover:bg-sky-600 text-sky-700 group-hover:text-white font-bold text-xs border border-sky-200 group-hover:border-sky-600 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Bản đồ & Chi tiết</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
