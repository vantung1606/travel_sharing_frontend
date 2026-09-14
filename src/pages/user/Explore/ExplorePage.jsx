import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Search, MapPin, Filter, Star, Sparkles, Navigation, Layers, List, Map } from 'lucide-react';

export const ExplorePage = () => {
  const { destinations, setIsAIGeneratorOpen } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePlace, setActivePlace] = useState(destinations[0]);
  const [mobileViewMode, setMobileViewMode] = useState('list'); // 'list' | 'map'

  const categories = ['Tất cả', 'Biển & Văn Hoá', 'Nghỉ Dưỡng Sang Trọng', 'Mạo Hiểm & Khám Phá', 'Núi & Sinh Thái'];

  const filteredPlaces = destinations.filter(item => {
    const matchesCat = selectedCategory === 'Tất cả' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6">
      
      {/* Header & Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Khám Phá Địa Điểm Du Lịch HOT
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Tìm kiếm địa danh nổi tiếng, bãi biển đẹp và tọa độ check-in độc đáo trên bản đồ
            </p>
          </div>

          <button
            onClick={() => setIsAIGeneratorOpen(true)}
            className="sparkle-btn text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 self-start md:self-auto cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>AI Gợi Ý Theo Sở Thích</span>
          </button>
        </div>

        {/* Search & Categories */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên điểm đến, từ khoá..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 sm:pb-0 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-sky-600 text-white shadow-sm font-bold'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile View Switcher (Danh Sách vs Bản Đồ) */}
        <div className="flex lg:hidden items-center justify-center p-1 rounded-2xl bg-slate-200/80 w-fit mx-auto text-xs font-bold">
          <button
            onClick={() => setMobileViewMode('list')}
            className={`px-4 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              mobileViewMode === 'list' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            <List className="w-4 h-4" /> Danh sách ({filteredPlaces.length})
          </button>
          <button
            onClick={() => setMobileViewMode('map')}
            className={`px-4 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              mobileViewMode === 'map' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600'
            }`}
          >
            <Map className="w-4 h-4 text-amber-400" /> Bản đồ Live
          </button>
        </div>
      </div>

      {/* SPLIT SCREEN VIEW: Cards + Interactive Map Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        
        {/* Left Side: Destination Cards List */}
        <div className={`lg:col-span-6 space-y-4 lg:max-h-[650px] lg:overflow-y-auto pr-1 ${
          mobileViewMode === 'map' ? 'hidden lg:block' : 'block'
        }`}>
          {filteredPlaces.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center text-slate-500 border border-slate-200">
              Không tìm thấy địa điểm phù hợp với từ khoá.
            </div>
          ) : (
            filteredPlaces.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  setActivePlace(item);
                  if (window.innerWidth < 1024) setMobileViewMode('map');
                }}
                className={`bg-white p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 ${
                  activePlace?.id === item.id
                    ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-md'
                    : 'border-slate-200/80 hover:border-slate-300 shadow-sm'
                }`}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl object-cover flex-shrink-0"
                />

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[10px] font-bold">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-extrabold text-amber-500">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{item.rating} ({item.reviewsCount})</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 mt-1">{item.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{item.tagline}</p>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 mt-2">
                    <span className="text-slate-500 font-medium">{item.duration}</span>
                    <span className="font-bold text-sky-600">{item.priceEstimate}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Side: Interactive Virtual Map Viewport */}
        <div className={`lg:col-span-6 bg-slate-900 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between border border-slate-800 text-white min-h-[450px] ${
          mobileViewMode === 'list' ? 'hidden lg:flex' : 'flex'
        }`}>
          
          {/* Map Grid Pattern background */}
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>

          {/* Top Bar */}
          <div className="relative z-10 flex items-center justify-between bg-slate-800/80 backdrop-blur-md p-3 rounded-2xl border border-slate-700">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
              <Navigation className="w-4 h-4 text-sky-400 animate-pulse" />
              <span>Bản Đồ Tọa Độ AI Live Map</span>
            </div>
            <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-mono">
              GPS Lat: {activePlace?.coordinates.lat.toFixed(4)} | Lng: {activePlace?.coordinates.lng.toFixed(4)}
            </span>
          </div>

          {/* Center Pin & Active Detail Card */}
          <div className="relative z-10 my-auto text-center space-y-4 py-6">
            <div className="inline-flex p-4 rounded-full bg-sky-500/20 text-sky-400 border border-sky-400/30 animate-bounce">
              <MapPin className="w-8 h-8 fill-sky-500 text-white" />
            </div>

            {activePlace && (
              <div className="max-w-md mx-auto bg-slate-800/90 backdrop-blur-md p-5 rounded-2xl border border-slate-700 text-left space-y-2 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white">{activePlace.name}</h4>
                  <span className="text-xs font-bold text-emerald-400">{activePlace.priceEstimate}</span>
                </div>
                <p className="text-xs text-slate-300">{activePlace.aiHighlights}</p>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">📍 GPS Synced</span>
                  <button
                    onClick={() => setIsAIGeneratorOpen(true)}
                    className="sparkle-btn px-3 py-1.5 rounded-lg text-[11px] font-bold text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-200" />
                    Tạo Tour Điểm Này
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Info */}
          <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span>Tự động tối ưu tuyến đường di chuyển ngắn nhất</span>
            <span className="text-amber-400 font-semibold">★ AI Smart Route Sync</span>
          </div>

        </div>

      </div>

    </div>
  );
};
