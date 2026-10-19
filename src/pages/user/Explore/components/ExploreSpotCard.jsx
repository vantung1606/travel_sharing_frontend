import React from 'react';
import { Star, MapPin, Navigation, Heart, Plus, Compass } from 'lucide-react';
import { getEstimatedWeatherByCity } from '../../../../utils/weatherUtils';
import { pickFallbackImage, SHARED_PLACEHOLDER_IMAGE } from '../../../../utils/placeImages';

// Ảnh lỗi (404 do sai mã hoá '%') tự đổi sang ảnh thật dự phòng từ kho Wayfare
const handleImageError = (e, item) => {
  const img = e.currentTarget;
  const fallback = pickFallbackImage(item?.rawId ?? 0);
  if (img.src !== fallback) {
    img.src = fallback;
  } else {
    img.src = SHARED_PLACEHOLDER_IMAGE;
  }
};

// Chuẩn hóa hiển thị giá ngắn gọn, thẩm mỹ, không bao giờ bị vỡ dòng
const formatShortPrice = (priceStr = '') => {
  if (!priceStr) return { text: 'Miễn phí', isFree: true };
  const lower = priceStr.toLowerCase().trim();
  if (lower.includes('miễn phí')) return { text: 'Miễn phí', isFree: true };
  const clean = priceStr
    .replace(/vé vào cổng:?/gi, '')
    .replace(/khoảng:?/gi, '')
    .trim();
  return { text: clean || 'Miễn phí', isFree: false };
};

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
  const priceInfo = formatShortPrice(item.priceEstimate || item.priceRange);

  return (
    <div
      id={`explore-card-${item.id}`}
      onClick={() => onOpenDetail(item)}
      className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 hover:border-sky-400 shadow-2xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col group relative"
    >
      {/* 1. Panoramic Image Cover - Compact height on mobile */}
      <div className="relative h-32 sm:h-52 w-full overflow-hidden bg-slate-900 shrink-0">
        <img
          src={item.image}
          alt={item.name}
          onError={(e) => handleImageError(e, item)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-95"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Top Badges Row */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          {/* Category Pill Tag */}
          <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-slate-950/75 backdrop-blur-md text-[9px] sm:text-[10px] font-bold text-white shadow-xs border border-white/15 tracking-wide">
            {item.category}
          </span>

          {/* Wishlist Heart Button (pointer-events-auto) */}
          <button
            onClick={(e) => onToggleSave(item, e)}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer pointer-events-auto ${
              isSaved
                ? 'bg-rose-500 text-white shadow-md scale-105'
                : 'bg-black/40 text-white hover:bg-black/60'
            }`}
            title={isSaved ? 'Gỡ khỏi yêu thích' : 'Lưu vào yêu thích'}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Badges on Image: Weather Vibe + GPS */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white pointer-events-none">
          {/* Weather Tag */}
          <span className="px-2 py-0.5 rounded-full bg-slate-950/75 backdrop-blur-md text-[9px] sm:text-[10px] font-semibold text-sky-200 flex items-center gap-1 border border-sky-400/25 shadow-xs">
            <span>{weather.icon}</span>
            <span>{weather.temp}°C • {weather.label}</span>
          </span>

          {/* GPS Distance (if radar active) */}
          {item.distanceKm && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-600/90 backdrop-blur-md text-[9px] sm:text-[10px] font-bold text-white flex items-center gap-1 shadow-xs">
              <Navigation className="w-2.5 h-2.5 text-white" />
              <span>{item.distanceKm} km</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Content Info Details */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-1.5 sm:space-y-2.5">
        <div>
          {/* City & Rating Row */}
          <div className="flex items-center justify-between gap-1.5 text-[11px] sm:text-xs">
            <span className="font-bold text-slate-500 flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-600 shrink-0" />
              <span className="truncate">{item.city}</span>
              {item.region && <span className="text-slate-400 font-normal shrink-0">• {item.region}</span>}
            </span>

            {item.rating && item.reviewsCount > 0 ? (
              <div className="flex items-center gap-1 font-black text-amber-600 bg-amber-50 px-1.5 sm:px-2 py-0.5 rounded-lg border border-amber-200/60 shrink-0">
                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
                <span>{item.rating}</span>
                <span className="text-[10px] text-slate-400 font-normal">({item.reviewsCount})</span>
              </div>
            ) : null}
          </div>

          {/* Place Title */}
          <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-900 mt-1 line-clamp-1 group-hover:text-sky-600 transition-colors">
            {item.name}
          </h3>

          {/* Short Description */}
          <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 mt-0.5 sm:mt-1 leading-relaxed">
            {item.description || item.tagline}
          </p>
        </div>

        {/* 3. Footer: Refined, Spacious & Zero Overflow */}
        <div className="pt-2 sm:pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Price Tag */}
          <div className="min-w-0 flex items-center">
            {priceInfo.isFree ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70 shrink-0 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Miễn phí vé
              </span>
            ) : (
              <div className="min-w-0">
                <span className="block text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Chi phí</span>
                <span className="font-extrabold text-sky-800 text-xs truncate block max-w-[110px]" title={item.priceEstimate || item.priceRange}>
                  {priceInfo.text}
                </span>
              </div>
            )}
          </div>

          {/* Actions Cluster: Add To Trip (+) + View Map */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Add To Trip (+) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToTrip(item);
              }}
              title="Thêm vào lịch trình chuyến đi"
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* View Map / Detail */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail(item);
              }}
              className="px-3 py-1.5 rounded-xl bg-sky-50 group-hover:bg-sky-600 text-sky-700 group-hover:text-white font-bold text-xs border border-sky-200 group-hover:border-sky-600 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-2xs"
            >
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span>Bản đồ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
