import React from 'react';
import { Star, MapPin, Navigation, Heart, Plus, Compass, BadgeCheck } from 'lucide-react';
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
  liveWeather = null,
  onSelect = () => {},
  onToggleSave = () => {},
  onOpenDetail = () => {},
  onAddToTrip = () => {}
}) => {
  // Thời tiết THẬT theo toạ độ GPS (prop từ ExplorePage, batch Open-Meteo).
  // Không có dữ liệu thật -> KHÔNG hiện chip (tuyệt đối không ước lượng).
  const weather = liveWeather;
  const priceInfo = formatShortPrice(item.priceEstimate || item.priceRange);

  return (
    <div
      id={`explore-card-${item.id}`}
      onClick={() => onOpenDetail(item)}
      className={`bg-[#FFFDF8] rounded-[6px] overflow-hidden border transition-colors duration-200 cursor-pointer flex flex-col group relative ${
        isActive ? 'border-clay-500' : 'border-ink-200/80 hover:border-clay-400'
      }`}
    >
      {/* 1. Image cover */}
      <div className="relative h-40 sm:h-44 w-full overflow-hidden bg-ink-100 shrink-0">
        <img
          src={item.image}
          alt={item.name}
          onError={(e) => handleImageError(e, item)}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />

        {/* Top badges */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="max-w-[190px] px-2 py-1 rounded-[3px] bg-[#F8F4EC]/95 text-[9px] sm:text-[10px] font-bold text-ink-700 border border-ink-200/80 truncate">
              {item.category}
            </span>
            {item.isVerifiedHost && (
              <span
                title="Cơ sở / người đăng đã được xác thực"
                className="w-5 h-5 rounded-[3px] bg-clay-600 flex items-center justify-center shrink-0"
              >
                <BadgeCheck className="w-3.5 h-3.5 text-[#FFFDF8]" />
              </span>
            )}
          </div>

          <button
            onClick={(e) => onToggleSave(item, e)}
            className={`w-7 h-7 rounded-[5px] flex items-center justify-center transition-colors cursor-pointer pointer-events-auto border ${
              isSaved
                ? 'bg-clay-600 text-[#FFFDF8] border-clay-600'
                : 'bg-[#F8F4EC]/95 text-ink-500 border-ink-200 hover:text-clay-700'
            }`}
            title={isSaved ? 'Gỡ khỏi yêu thích' : 'Lưu vào yêu thích'}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom badges: real weather + GPS distance */}
        <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-2 pointer-events-none">
          {weather && (
            <span className="px-2 py-1 rounded-[3px] bg-ink-800/85 text-[9px] font-semibold text-[#F8F4EC] flex items-center gap-1">
              <span>{weather.icon}</span>
              <span>{weather.temp}°C • {weather.label}</span>
            </span>
          )}
          {item.distanceKm && (
            <span className="px-2 py-1 rounded-[3px] bg-clay-600/90 text-[9px] font-bold text-[#FFFDF8] flex items-center gap-1 ml-auto">
              <Navigation className="w-2.5 h-2.5" />
              <span>{item.distanceKm} km</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Content */}
      <div className="p-3.5 flex-1 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="font-semibold text-ink-400 flex items-center gap-1 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-clay-600 shrink-0" />
            <span className="truncate">{item.city}</span>
            {item.region && <span className="text-ink-300 font-normal shrink-0">• {item.region}</span>}
          </span>

          {item.rating && item.reviewsCount > 0 ? (
            <span className="flex items-center gap-1 font-bold text-ink-700 shrink-0">
              <Star className="w-3.5 h-3.5 fill-clay-500 text-clay-500" />
              <span>{item.rating}</span>
              <span className="text-[10px] text-ink-300 font-normal">({item.reviewsCount})</span>
            </span>
          ) : null}
        </div>

        <h3 className="font-display font-bold text-[15px] text-ink-800 mt-0.5 line-clamp-1 group-hover:text-clay-700 transition-colors">
          {item.name}
        </h3>

        <p className="text-[11px] text-ink-400 line-clamp-2 leading-relaxed">
          {item.description || item.tagline}
        </p>

        <div className="mt-auto pt-2.5 border-t border-ink-200/70 flex items-center justify-between gap-2">
          <div className="min-w-0">
            {priceInfo.isFree ? (
              <span className="text-xs font-bold text-clay-700 whitespace-nowrap">Miễn phí vé</span>
            ) : (
              <>
                <span className="block text-[9px] text-ink-300 font-semibold uppercase tracking-wider">Chi phí</span>
                <span className="font-bold text-clay-700 text-xs truncate block max-w-[120px]" title={item.priceEstimate || item.priceRange}>
                  {priceInfo.text}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToTrip(item);
              }}
              title="Thêm vào lịch trình chuyến đi"
              className="w-8 h-8 rounded-[5px] bg-[#F8F4EC] hover:bg-clay-50 text-ink-500 hover:text-clay-700 border border-ink-200 hover:border-clay-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail(item);
              }}
              className="h-8 px-2.5 rounded-[5px] bg-clay-50 text-clay-700 border border-clay-600/30 hover:bg-clay-600 hover:text-[#FFFDF8] hover:border-clay-600 font-bold text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
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
