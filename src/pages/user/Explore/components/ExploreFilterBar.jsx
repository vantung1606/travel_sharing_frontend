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
    <div className="bg-[#FFFDF8] rounded-[6px] p-3 sm:p-4 border border-ink-200/80 space-y-3">
      {/* 1. Discovery tabs + view mode */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 border-b border-ink-200/70">
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

        {/* View mode: segmented, flat */}
        <div className="grid grid-cols-3 lg:flex items-center gap-0.5 p-0.5 rounded-[5px] shrink-0 border border-ink-200 bg-[#F8F4EC] w-full lg:w-auto">
          <button
            onClick={() => setViewMode('split')}
            title="Chế độ chia đôi (Danh sách + Bản đồ)"
            className={`px-2.5 py-1.5 rounded-[4px] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'split'
                ? 'bg-[#FFFDF8] text-clay-700 border border-ink-200/70'
                : 'text-ink-400 hover:text-ink-800 border border-transparent'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chia đôi</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            title="Chế độ lưới toàn cảnh"
            className={`px-2.5 py-1.5 rounded-[4px] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[#FFFDF8] text-clay-700 border border-ink-200/70'
                : 'text-ink-400 hover:text-ink-800 border border-transparent'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lưới card</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            title="Bản đồ tọa độ toàn cảnh"
            className={`px-2.5 py-1.5 rounded-[4px] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'map'
                ? 'bg-[#FFFDF8] text-clay-700 border border-ink-200/70'
                : 'text-ink-400 hover:text-ink-800 border border-transparent'
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
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            type="text"
            placeholder={
              exploreLayer === 'spots'
                ? 'Tìm quán cafe, homestay, quán ăn ngon, tọa độ săn mây, Đà Lạt, Hà Giang...'
                : 'Tìm tỉnh thành, điểm đến nổi tiếng: Sa Pa, Phú Quốc, Ninh Bình...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-9 rounded-[5px] bg-[#F8F4EC] hover:bg-[#F5F0E6] focus:bg-[#FFFDF8] border border-ink-200 focus:border-clay-500 text-xs font-semibold text-ink-800 outline-none transition-colors placeholder:text-ink-300"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-[4px] text-ink-400 hover:text-ink-700 flex items-center justify-center cursor-pointer"
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
              className="w-9 h-9 rounded-[5px] text-ink-400 hover:text-clay-700 hover:bg-clay-50 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onOpenFilterDrawer}
            className={`h-9 px-3.5 rounded-[5px] text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer shrink-0 ${
              activeFilterCount > 0
                ? 'bg-clay-50 text-clay-700 border-clay-400'
                : 'bg-[#FFFDF8] text-ink-700 border-ink-200 hover:bg-clay-50 hover:border-clay-300'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-clay-600" />
            <span className="hidden sm:inline">Bộ lọc</span>
            {activeFilterCount > 0 && (
              <span className="min-w-4 h-4 px-1 rounded-[3px] bg-clay-600 text-white text-[10px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3. Category chips */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-[5px] text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 border ${
                active
                  ? 'bg-clay-600 text-[#FFFDF8] border-clay-600 font-bold'
                  : 'bg-[#F8F4EC] text-ink-500 border-ink-200 hover:border-clay-300 hover:text-clay-700'
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
