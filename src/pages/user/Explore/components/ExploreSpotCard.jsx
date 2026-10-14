import React from 'react';
import { Star, MapPin, Navigation, Heart, Plus, Store, Clock, ExternalLink } from 'lucide-react';

export const ExploreSpotCard = ({
  item,
  isActive = false,
  isSaved = false,
  onSelect = () => {},
  onToggleSave = () => {},
  onOpenDetail = () => {},
  onAddToTrip = () => {}
}) => {
  return (
    <div
      id={`explore-card-${item.id}`}
      onClick={() => onSelect(item)}
      className={`bg-white rounded-3xl p-4 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row gap-4 border group ${
        isActive
          ? 'border-sky-500 ring-2 ring-sky-500/25 shadow-lg scale-[1.01]'
          : 'border-slate-200/80 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* 1. Thumbnail Image with Overlay Badges */}
      <div className="relative w-full sm:w-48 h-44 sm:h-auto rounded-2xl overflow-hidden shrink-0 bg-slate-100">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Category Pill Tag */}
        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white shadow-sm flex items-center gap-1">
          <Store className="w-3 h-3 text-amber-300" />
          <span>{item.category}</span>
        </span>

        {/* GPS Distance Badge (if live location active) */}
        {item.distanceKm && (
          <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-lg bg-emerald-600/90 backdrop-blur-md text-[10px] font-bold text-white shadow-sm flex items-center gap-1">
            <Navigation className="w-3 h-3 text-white" />
            <span>{item.distanceKm} km</span>
          </span>
        )}

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => onToggleSave(item, e)}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer ${
            isSaved
              ? 'bg-rose-500 text-white shadow-md scale-110'
              : 'bg-black/40 text-white hover:bg-black/60'
          }`}
          title={isSaved ? 'Gỡ khỏi yêu thích' : 'Lưu vào yêu thích'}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* 2. Content Info Details */}
      <div className="flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          {/* City & Rating Row */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>{item.city}</span>
              {item.region && <span className="text-slate-400">• {item.region}</span>}
            </span>

            <div className="flex items-center gap-1 font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{item.rating}</span>
              <span className="text-[10px] text-slate-400 font-normal">({item.reviewsCount})</span>
            </div>
          </div>

          {/* Place Title */}
          <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 mt-1 line-clamp-1 group-hover:text-sky-600 transition-colors">
            {item.name}
          </h3>

          {/* Short Address or Description */}
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {item.address ? `${item.address} — ` : ''}
            {item.tagline || item.description}
          </p>
        </div>

        {/* Price & Action Footer Row */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Estimated Price & Hours */}
          <div className="text-xs">
            <span className="block text-[10px] text-slate-400 font-semibold">Khoảng giá</span>
            <span className="font-bold text-sky-700 text-xs sm:text-sm">
              {item.priceEstimate || 'Miễn phí'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Add To Trip Button */}
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

            {/* View Details Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail(item);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white font-bold text-xs border border-sky-200 hover:border-sky-600 transition-all cursor-pointer"
            >
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
