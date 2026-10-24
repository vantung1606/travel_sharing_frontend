import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Clock, Ticket, ExternalLink, Compass } from 'lucide-react';

export const PlaceAttachCard = ({ post, onNavigatePlace }) => {
  const navigate = useNavigate();

  const placeId = post?.placeId;
  const placeName = post?.placeName;
  if (!placeId && !placeName) return null;

  const placeAddress = post?.placeAddress;
  const placeCity = post?.placeCity;
  const placeCoverImageUrl = post?.placeCoverImageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80';
  const placeAverageRating = post?.placeAverageRating;
  const placeReviewCount = post?.placeReviewCount;
  const placeCategoryName = post?.placeCategoryName;
  const placeTicketPrice = post?.placeTicketPrice;
  const placeOpenHours = post?.placeOpenHours;

  const handleClick = (e) => {
    e.stopPropagation();
    if (onNavigatePlace) {
      onNavigatePlace(placeId);
    } else {
      navigate(`/places/${placeId}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative overflow-hidden bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-sky-50/70 hover:from-emerald-100/80 hover:via-teal-100/60 hover:to-sky-100/80 p-3 sm:p-4 rounded-2xl border border-emerald-200/80 hover:border-emerald-300 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer font-sans"
    >
      <div className="flex items-start gap-3 sm:gap-3.5">
        {/* Thumbnail */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-emerald-200/60 shadow-xs">
          <img
            src={placeCoverImageUrl}
            alt={placeName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80';
            }}
          />
          <div className="absolute top-1 left-1 bg-emerald-600/90 backdrop-blur-xs text-white p-1 rounded-md shadow-xs">
            <MapPin className="w-3 h-3" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Header Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-2xs">
              <Compass className="w-2.5 h-2.5" />
              <span>Check-in địa điểm</span>
            </span>
            {placeCategoryName && (
              <span className="px-2 py-0.5 rounded-full bg-white/90 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                {placeCategoryName}
              </span>
            )}
            {placeCity && (
              <span className="text-[11px] font-medium text-slate-500">
                • {placeCity}
              </span>
            )}
          </div>

          {/* Place Name */}
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
            {placeName}
          </h4>

          {/* Address */}
          {placeAddress && (
            <p className="text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{placeAddress}</span>
            </p>
          )}

          {/* Meta specs: Rating, Price, Hours */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap pt-0.5 text-[10px] sm:text-[11px]">
            {placeAverageRating != null && placeAverageRating > 0 && (
              <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/60">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{placeAverageRating.toFixed(1)}</span>
                {placeReviewCount != null && (
                  <span className="text-slate-400 font-normal">({placeReviewCount})</span>
                )}
              </span>
            )}

            {placeTicketPrice && (
              <span className="inline-flex items-center gap-1 text-slate-600 bg-white/80 px-1.5 py-0.5 rounded-md border border-slate-200/60">
                <Ticket className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>{placeTicketPrice}</span>
              </span>
            )}

            {placeOpenHours && (
              <span className="inline-flex items-center gap-1 text-slate-600 bg-white/80 px-1.5 py-0.5 rounded-md border border-slate-200/60">
                <Clock className="w-3 h-3 text-sky-600 shrink-0" />
                <span>{placeOpenHours}</span>
              </span>
            )}
          </div>
        </div>

        {/* View detail arrow */}
        <div className="hidden sm:flex items-center text-xs font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform shrink-0 pt-1">
          <span>Khám phá</span>
          <ExternalLink className="w-3.5 h-3.5 ml-1" />
        </div>
      </div>
    </div>
  );
};

export default PlaceAttachCard;
