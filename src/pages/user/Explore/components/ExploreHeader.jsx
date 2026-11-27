import React from 'react';
import { Navigation, PlusCircle } from 'lucide-react';

export const ExploreHeader = ({
  placesCount = 0,
  provincesCount = 0,
  userCoords = null,
  isLocating = false,
  onGetLiveLocation = () => {},
  onOpenAddPlaceModal = () => {}
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Khám phá điểm đến
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {placesCount} địa điểm · {provincesCount} tỉnh thành trên toàn quốc
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onGetLiveLocation}
          disabled={isLocating}
          className={`h-9 px-3.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-colors cursor-pointer disabled:opacity-60 shadow-2xs ${
            userCoords
              ? 'bg-clay-50 text-clay-700 border-clay-400'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
          }`}
        >
          <Navigation className={`w-3.5 h-3.5 shrink-0 ${isLocating ? 'animate-spin text-clay-600' : 'text-clay-600'}`} />
          <span>{userCoords ? 'Đang dùng GPS' : 'Gần tôi'}</span>
        </button>

        <button
          type="button"
          onClick={onOpenAddPlaceModal}
          className="h-9 px-3.5 rounded-lg bg-clay-600 hover:bg-clay-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <PlusCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Đăng địa điểm</span>
        </button>
      </div>
    </div>
  );
};
