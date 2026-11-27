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
    <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-300/90 shadow-sm space-y-3">
      {/* 1. Discovery tabs + view mode */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 border-b border-slate-200 pb-2.5">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              setExploreLayer('spots');
              setSelectedCategory('Tất cả');
            }}
            className={`pb-2.5 -mb-px border-b-2 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              exploreLayer === 'spots'
                ? 'border-clay-600 text-clay-700'
                : 'border-transparent text-ink-400 hover:text-ink-800'
            }`}
          >
            <Store className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Tọa độ bản địa</span>
            <span className="inline sm:hidden">Tọa độ</span>
            <span className={`text-[10px] font-semibold ${exploreLayer === 'spots' ? 'text-clay-500' : 'text-ink-300'}`}>
              {placesCount}
            </span>
          </button>

          <button
            onClick={() => {
              setExploreLayer('destinations');
              setSelectedCategory('Tất cả');
            }}
            className={`pb-2.5 -mb-px border-b-2 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              exploreLayer === 'destinations'
                ? 'border-clay-600 text-clay-700'
                : 'border-transparent text-ink-400 hover:text-ink-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Cẩm nang tỉnh thành</span>
            <span className="inline sm:hidden">Tỉnh thành</span>
            <span className={`text-[10px] font-semibold ${exploreLayer === 'destinations' ? 'text-clay-500' : 'text-ink-300'}`}>
              {destinationsCount}
            </span>
          </button>

          <button
            onClick={() => {
              setExploreLayer('saved');
              setSelectedCategory('Tất cả');
            }}
            className={`pb-2.5 -mb-px border-b-2 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              exploreLayer === 'saved'
                ? 'border-clay-600 text-clay-700'
                : 'border-transparent text-ink-400 hover:text-ink-800'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 shrink-0 ${exploreLayer === 'saved' ? 'fill-current text-clay-600' : 'text-clay-500'}`} />
            <span className="hidden sm:inline">Địa điểm đã lưu</span>
            <span className="inline sm:hidden">Đã lưu</span>
            <span className={`text-[10px] font-semibold ${exploreLayer === 'saved' ? 'text-clay-500' : 'text-ink-300'}`}>
              {savedCount}
            </span>
          </button>
        </div>

        {/* View mode: segmented, crisp */}
        <div className="grid grid-cols-3 lg:flex items-center gap-0.5 p-0.5 rounded-lg shrink-0 border border-slate-300 bg-slate-100 w-full lg:w-auto">
          <button
            onClick={() => setViewMode('split')}
            title="Chế độ chia đôi (Danh sách + Bản đồ)"
            className={`px-2.5 py-1.5 rounded-md text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'split'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chia đôi</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            title="Chế độ lưới toàn cảnh"
            className={`px-2.5 py-1.5 rounded-md text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lưới card</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            title="Bản đồ tọa độ toàn cảnh"
            className={`px-2.5 py-1.5 rounded-md text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'map'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bản đồ</span>
          </button>
        </div>
      </div>

      {/* 2. Search + filter trigger */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              exploreLayer === 'spots'
                ? 'Tìm quán cafe, homestay, điểm tham quan, Đà Lạt, Hà Giang...'
                : 'Tìm tỉnh thành, điểm đến nổi tiếng: Sa Pa, Phú Quốc, Ninh Bình...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-9 rounded-lg bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-clay-600 text-xs font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
              title="Xóa từ khóa"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {activeFilterCount > 0 && (
            <button
              onClick={onResetFilters}
              title="Đặt lại toàn bộ bộ lọc"
              className="w-9 h-9 rounded-lg text-slate-500 hover:text-clay-700 hover:bg-slate-100 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onOpenFilterDrawer}
            className={`h-9 px-3.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer shrink-0 ${
              activeFilterCount > 0
                ? 'bg-clay-50 text-clay-700 border-clay-400'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-clay-600" />
            <span className="hidden sm:inline">Bộ lọc</span>
            {activeFilterCount > 0 && (
              <span className="min-w-4 h-4 px-1 rounded bg-clay-600 text-white text-[10px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3. Category chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        {categories.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 border ${
                active
                  ? 'bg-slate-900 text-white border-slate-900 font-bold'
                  : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-white hover:text-slate-900'
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
