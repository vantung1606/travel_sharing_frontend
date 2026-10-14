import React from 'react';
import { Compass, MapPin, Calendar, ArrowRight, Sun, Utensils } from 'lucide-react';

export const ExploreDestinationCard = ({
  destination,
  onExploreSpotsAtCity = () => {},
  onOpenAIGenerator = () => {}
}) => {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group">
      {/* 1. Panoramic Image Cover */}
      <div className="relative h-36 sm:h-56 w-full overflow-hidden bg-slate-100">
        <img
          src={destination.image}
          alt={destination.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

        {/* Region Badge */}
        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold border border-white/20">
          {destination.region || 'Việt Nam'}
        </span>

        {/* Title & Tagline in Overlay */}
        <div className="absolute bottom-2.5 left-3 right-3 text-white space-y-0.5">
          <div className="flex items-center gap-1 text-sky-300 text-[11px] sm:text-xs font-bold">
            <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Điểm đến du lịch</span>
          </div>
          <h3 className="font-display font-black text-lg sm:text-2xl text-white tracking-tight">
            {destination.name}
          </h3>
        </div>
      </div>

      {/* 2. Destination Insights & Highlights */}
      <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between space-y-3 text-xs">
        <div className="space-y-2">
          {/* Tagline */}
          <p className="text-slate-600 line-clamp-2 leading-relaxed font-medium text-[11px] sm:text-xs">
            {destination.tagline || destination.description || 'Thành phố du lịch nổi tiếng với cảnh quan thiên nhiên trác tuyệt.'}
          </p>

          {/* Specialties / Highlights */}
          {destination.amenities && destination.amenities.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Utensils className="w-3 h-3 text-amber-500" />
                Đặc sắc & Trải nghiệm:
              </span>
              <div className="flex flex-wrap gap-1">
                {destination.amenities.slice(0, 3).map((item, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[10px] sm:text-[11px]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Action Buttons */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Smart Switch: Explore Spots at this City */}
          <button
            onClick={() => onExploreSpotsAtCity(destination.name)}
            className="flex-1 py-1.5 sm:py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-sky-200 hover:border-sky-600 transition-all cursor-pointer"
          >
            <span>Tọa độ tại {destination.name}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Tour planner for this destination */}
          <button
            onClick={() => onOpenAIGenerator(destination)}
            title="Lên kế hoạch cho điểm đến này"
            className="p-1.5 sm:p-2 rounded-xl bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white border border-sky-200 hover:border-sky-600 transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
