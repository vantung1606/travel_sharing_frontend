import React from 'react';
import { Search, X, SlidersHorizontal, List, Grid, Map as MapIcon, Store, Compass, RotateCcw } from 'lucide-react';

export const ExploreFilterBar = ({
  exploreLayer = 'spots',
  setExploreLayer = () => {},
  placesCount = 0,
  destinationsCount = 0,
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
    <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-200/80 space-y-4">
      {/* 1. TOP ROW: TWO PRIMARY DISCOVERY TABS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {/* Tab: Local Spots */}
          <button
            onClick={() => {
              setExploreLayer('spots');
              setSelectedCategory('Tất cả');
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              exploreLayer === 'spots'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Tọa độ & Cơ sở bản địa</span>
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
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              exploreLayer === 'destinations'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Cẩm nang Tỉnh thành</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              exploreLayer === 'destinations' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {destinationsCount}
            </span>
          </button>
        </div>

        {/* View Mode Switcher (Split | Grid | Map) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl shrink-0 self-end sm:self-auto border border-slate-200/60">
          <button
            onClick={() => setViewMode('split')}
            title="Chế độ chia đôi (Danh sách + Bản đồ)"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'split' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chia đôi</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            title="Chế độ lưới toàn cảnh"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'grid' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lưới card</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            title="Bản đồ tọa độ toàn cảnh"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'map' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bản đồ</span>
          </button>
        </div>
      </div>

      {/* 2. BOTTOM ROW: SEARCH INPUT + QUICK CATEGORIES + ADVANCED FILTER BUTTON */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Input Box */}
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={
              exploreLayer === 'spots'
                ? 'Tìm quán cafe, homestay, quán ăn ngon, Đà Lạt, Hà Giang...'
                : 'Tìm tỉnh thành, điểm đến nổi tiếng: Sa Pa, Phú Quốc, Ninh Bình...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-sky-500 text-xs font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar flex-1">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
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

        {/* Advanced Filter Drawer Trigger */}
        <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
          {activeFilterCount > 0 && (
            <button
              onClick={onResetFilters}
              title="Đặt lại toàn bộ bộ lọc"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onOpenFilterDrawer}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
              activeFilterCount > 0
                ? 'bg-sky-50 text-sky-700 border-sky-300 shadow-xs'
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
    </div>
  );
};
