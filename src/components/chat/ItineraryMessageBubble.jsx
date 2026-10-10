import React, { useMemo } from 'react';
import { Route, Sparkles, MapPin, DollarSign, Eye, Compass, ArrowRight } from 'lucide-react';

export const ItineraryMessageBubble = ({ content, isMe, onViewItinerary }) => {
  const itin = useMemo(() => {
    try {
      if (typeof content === 'object' && content !== null) return content;
      return JSON.parse(content);
    } catch {
      return null;
    }
  }, [content]);

  if (!itin) {
    return (
      <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
        isMe ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-800'
      }`}>
        {typeof content === 'string' ? content : 'Lịch trình du lịch'}
      </div>
    );
  }

  const coverUrl = itin.coverImageUrl || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80';
  const duration = itin.duration || (itin.days ? `${itin.days} ngày` : '3 ngày 2 đêm');
  const budget = itin.budgetTotal ? Number(itin.budgetTotal).toLocaleString('vi-VN') + ' đ' : null;

  return (
    <div className={`rounded-2xl overflow-hidden border shadow-sm transition-all max-w-[280px] sm:max-w-[320px] select-none text-left ${
      isMe
        ? 'bg-gradient-to-br from-sky-900 to-blue-900 border-sky-700/60 text-white'
        : 'bg-white border-slate-200 text-slate-900'
    }`}>
      {/* Cover Image & Destination Tag */}
      <div className="relative h-28 sm:h-32 w-full overflow-hidden group">
        <img
          src={coverUrl}
          alt={itin.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-600/90 text-white text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-xs shadow-xs">
            <Sparkles className="w-2.5 h-2.5 text-amber-300" />
            Lịch trình AI
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/90 text-slate-900 text-[9px] font-extrabold backdrop-blur-xs">
            {duration}
          </span>
        </div>

        {/* Destination label on bottom left of image */}
        <div className="absolute bottom-2 left-2 right-2 text-white">
          <span className="text-[10px] font-bold text-sky-200 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
            {itin.destination || 'Việt Nam'}
          </span>
        </div>
      </div>

      {/* Content Details */}
      <div className="p-3 space-y-2">
        <h4 className={`font-extrabold text-xs sm:text-sm line-clamp-2 leading-snug ${
          isMe ? 'text-white' : 'text-slate-900'
        }`}>
          {itin.title || 'Lịch trình khám phá'}
        </h4>

        {/* Budget and stops row */}
        <div className="flex items-center justify-between text-[11px] pt-0.5">
          {budget && (
            <span className={`font-black flex items-center gap-1 ${
              isMe ? 'text-amber-300' : 'text-sky-600'
            }`}>
              <DollarSign className="w-3 h-3 shrink-0" />
              {budget}
            </span>
          )}
          {itin.placesCount > 0 && (
            <span className={`text-[10px] ${isMe ? 'text-slate-300' : 'text-slate-500'}`}>
              {itin.placesCount} điểm dừng chân
            </span>
          )}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onViewItinerary) onViewItinerary(itin);
          }}
          className={`w-full py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
            isMe
              ? 'bg-white hover:bg-sky-50 text-sky-900'
              : 'bg-sky-600 hover:bg-sky-700 text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Xem chi tiết lịch trình</span>
        </button>
      </div>
    </div>
  );
};
