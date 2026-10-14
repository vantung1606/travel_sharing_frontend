import React from 'react';
import { Search, X, SlidersHorizontal, List, Grid, Map as MapIcon, Store, Compass, RotateCcw, Heart } from 'lucide-react';

export const ExploreFilterBar = ({
  exploreLayer = 'spots',
  setExploreLayer = () => {},
  placesCount = 0,
  destinationsCount = 0,
  savedCount = 0,
  searchQuery = '',
  setSearchQuery = () => {},
  categories = [],
  selectedCategory = 'Tất cả',
  setSelectedCategory = () => {},
  viewMode = 'split',
  setViewMode = () => {},
  onOpenFilterDrawer = () => {},
  activeFilterCount = 0,
  onResetFilters = () => {}
}) => {
  return (
    <div className="bg-white rounded-2xl p-3.5 sm:p-4.5 shadow-xs border border-slate-200/80 space-y-3">
      {/* 1. TOP ROW: PRIMARY DISCOVERY TABS & SAVED TAB + VIEW MODE SWITCHER */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
          {/* Tab: Local Spots */}
          <button
            onClick={() => {
              setExploreLayer('spots');
              setSelectedCategory('Tất cả');
            }}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              exploreLayer === 'spots'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <Store className="w-3.5 h-3.5 shrink-0" />
            <span>Tọa độ bản địa</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              exploreLayer === 'spots' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {placesCount}
            </span>
          </button>

          {/* Tab: Destinations */}
          <button
            onClick={() => {
              setExploreLayer('destinations');
              setSelectedCategory('Tất cả');
            }}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              exploreLayer === 'destinations'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span>Cẩm nang Tỉnh thành</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              exploreLayer === 'destinations' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {destinationsCount}
            </span>
          </button>

          {/* Tab: Saved Wishlist */}
          <button
            onClick={() => {
              setExploreLayer('saved');
              setSelectedCategory('Tất cả');
            }}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              exploreLayer === 'saved'
                ? 'bg-rose-600 text-white shadow-xs'
                : savedCount > 0
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/80 shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 shrink-0 ${exploreLayer === 'saved' ? 'fill-current' : 'text-rose-500 fill-rose-500/20'}`} />
            <span>Địa điểm đã lưu</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              exploreLayer === 'saved' ? 'bg-white/20 text-white' : savedCount > 0 ? 'bg-rose-500 text-white shadow-2xs' : 'bg-slate-200 text-slate-700'
            }`}>
              {savedCount}
            </span>
          </button>
        </div>

        {/* View Mode Switcher (Split | Grid | Map) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0 self-end sm:self-auto border border-slate-200/60">
          <button
            onClick={() => setViewMode('split')}
            title="Chế độ chia đôi (Danh sách + Bản đồ)"
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              viewMode === 'split' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Chia đôi</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            title="Chế độ lưới toàn cảnh"
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              viewMode === 'grid' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Lưới card</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            title="Bản đồ tọa độ toàn cảnh"
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              viewMode === 'map' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Bản đồ</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH BAR & FILTER TRIGGER ROW */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Input Box */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={
              exploreLayer === 'spots'
                ? 'Tìm quán cafe, homestay, quán ăn ngon, tọa độ săn mây, Đà Lạt, Hà Giang...'
                : 'Tìm tỉnh thành, điểm đến nổi tiếng: Sa Pa, Phú Quốc, Ninh Bình...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-sky-500 text-xs font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Drawer Trigger & Reset Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          {activeFilterCount > 0 && (
            <button
              onClick={onResetFilters}
              title="Đặt lại toàn bộ bộ lọc"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onOpenFilterDrawer}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shrink-0 shadow-2xs ${
              activeFilterCount > 0
                ? 'bg-sky-50 text-sky-700 border-sky-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600" />
            <span>Bộ lọc</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-sky-600 text-white text-[10px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3. DEDICATED FULL-WIDTH CATEGORY CHIPS SCROLLBAR */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        {categories.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                active
                  ? 'bg-sky-100 text-sky-900 border border-sky-300 font-extrabold shadow-2xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 border border-transparent'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};
