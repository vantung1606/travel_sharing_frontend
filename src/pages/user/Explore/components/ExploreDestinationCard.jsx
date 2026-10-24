import React from 'react';
import { Compass, MapPin, Calendar, ArrowRight, Utensils } from 'lucide-react';

export const ExploreDestinationCard = ({
  destination,
  onExploreSpotsAtCity = () => {},
  onOpenAIGenerator = () => {}
}) => {
  return (
    <div className="bg-[#FFFDF8] rounded-[6px] overflow-hidden border border-ink-200/80 hover:border-clay-400 transition-colors duration-200 flex flex-col group">
      {/* Image cover */}
      <div className="relative h-40 sm:h-44 w-full overflow-hidden bg-ink-100">
        <img
          src={destination.image}
          alt={destination.name}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <span className="absolute top-2 left-2 px-2 py-1 rounded-[3px] bg-[#F8F4EC]/95 text-[10px] font-bold text-ink-700 border border-ink-200/80">
          {destination.region || 'Việt Nam'}
        </span>
      </div>

      {/* Content */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col gap-2 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase tracking-[0.14em] text-clay-700 font-bold flex items-center gap-1">
            <Compass className="w-3 h-3" />
            Cẩm nang
          </span>
          <span className="text-[10px] text-ink-300 flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 text-clay-500 shrink-0" />
            {destination.region || 'Việt Nam'}
          </span>
        </div>

        <h3 className="font-display font-bold text-lg sm:text-xl text-ink-800 tracking-tight group-hover:text-clay-700 transition-colors">
          {destination.name}
        </h3>

        <p className="text-[11px] text-ink-400 line-clamp-2 leading-relaxed">
          {destination.tagline || destination.description || 'Thành phố du lịch nổi tiếng với cảnh quan thiên nhiên trác tuyệt.'}
        </p>

        {destination.amenities && destination.amenities.length > 0 && (
          <div className="space-y-1.5 pt-0.5">
            <span className="text-[9px] font-bold text-ink-300 uppercase tracking-[0.14em] flex items-center gap-1">
              <Utensils className="w-3 h-3 text-clay-500" />
              Đặc sắc & trải nghiệm
            </span>
            <div className="flex flex-wrap gap-1">
              {destination.amenities.slice(0, 3).map((item, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 rounded-[3px] bg-[#F8F4EC] text-ink-500 border border-ink-200/70 font-semibold text-[10px]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto pt-2.5 border-t border-ink-200/70 flex items-center gap-1.5">
          <button
            onClick={() => onExploreSpotsAtCity(destination.name)}
            className="flex-1 h-8 px-2.5 rounded-[5px] bg-clay-50 hover:bg-clay-600 text-clay-700 hover:text-[#FFFDF8] font-bold text-[11px] flex items-center justify-center gap-1.5 border border-clay-600/30 hover:border-clay-600 transition-colors cursor-pointer min-w-0"
          >
            <span className="truncate">Tọa độ tại {destination.name}</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>

          <button
            onClick={() => onOpenAIGenerator(destination)}
            title="Lên kế hoạch cho điểm đến này"
            className="w-8 h-8 rounded-[5px] bg-[#F8F4EC] hover:bg-clay-50 text-ink-500 hover:text-clay-700 border border-ink-200 hover:border-clay-300 transition-colors cursor-pointer flex items-center justify-center shrink-0"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
