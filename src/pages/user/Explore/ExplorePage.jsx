import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Search,
  MapPin,
  Filter,
  Star,
  Sparkles,
  Navigation,
  Layers,
  List,
  Map as MapIcon,
  Grid,
  Heart,
  Calendar,
  Clock,
  Compass,
  DollarSign,
  Sun,
  Eye,
  X,
  ChevronRight,
  Share2,
  Copy,
  CheckCircle2,
  SlidersHorizontal,
  Flame,
  Umbrella,
  Camera,
  Utensils
} from 'lucide-react';
import { useToast } from '../../../components/common/Toast';

export const ExplorePage = () => {
  const { destinations, setIsAIGeneratorOpen } = useApp();
  const toast = useToast();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('Tất cả');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedBudget, setSelectedBudget] = useState('all'); // 'all' | 'under3m' | '3m-6m' | 'above6m'
  const [selectedDuration, setSelectedDuration] = useState('all'); // 'all' | '2d' | '3d' | '4d+'
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'rating' | 'priceAsc' | 'priceDesc'
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // View Mode: 'split' (Cards + Map) | 'grid' (All Cards Grid) | 'map' (Full Map)
  const [viewMode, setViewMode] = useState('split');
  const [mapLayer, setMapLayer] = useState('terrain'); // 'terrain' | 'satellite' | 'weather'

  // Active Destination for Map & Detail Modal
  const [activePlace, setActivePlace] = useState(destinations[0] || null);
  const [detailModalPlace, setDetailModalPlace] = useState(null);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);

  // Saved / Wishlist
  const [savedDestinations, setSavedDestinations] = useState({});

  const regions = ['Tất cả', 'Miền Bắc', 'Miền Trung', 'Miền Nam', 'Tây Nguyên'];
  const categories = ['Tất cả', 'Biển & Văn Hoá', 'Nghỉ Dưỡng Sang Trọng', 'Mạo Hiểm & Khám Phá', 'Núi & Sinh Thái'];

  // Toggle Save Destination
  const handleToggleSave = (dest, e) => {
    e.stopPropagation();
    const isCurrentlySaved = !!savedDestinations[dest.id];
    setSavedDestinations(prev => ({
      ...prev,
      [dest.id]: !isCurrentlySaved
    }));

    if (!isCurrentlySaved) {
      toast.success(`Đã thêm "${dest.name}" vào danh sách Yêu thích! ❤️`);
    } else {
      toast.info(`Đã gỡ "${dest.name}" khỏi danh sách Yêu thích.`);
    }
  };

  // Copy Coordinates
  const handleCopyGPS = (dest, e) => {
    e?.stopPropagation();
    const coordString = `${dest.coordinates.lat.toFixed(4)}, ${dest.coordinates.lng.toFixed(4)}`;
    navigator.clipboard?.writeText(coordString);
    toast.success(`Đã sao chép tọa độ GPS: ${coordString} 📍`);
  };

  // Launch AI Planner with prefilled destination
  const handlePlanWithAI = (dest, e) => {
    e?.stopPropagation();
    setIsAIGeneratorOpen(true);
    toast.info(`Khởi tạo AI Travel Planner cho "${dest.name}"... ✨`);
  };

  // Filter & Sort Destinations
  const filteredDestinations = useMemo(() => {
    return destinations
      .filter(item => {
        // Search
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          item.name.toLowerCase().includes(q) ||
          item.tagline?.toLowerCase().includes(q) ||
          item.tags?.some(t => t.toLowerCase().includes(q)) ||
          item.region?.toLowerCase().includes(q) ||
          item.specialties?.some(s => s.toLowerCase().includes(q));

        // Region
        const matchesRegion = selectedRegion === 'Tất cả' || item.region === selectedRegion;

        // Category
        const matchesCategory = selectedCategory === 'Tất cả' || item.category === selectedCategory;

        // Budget
        let matchesBudget = true;
        if (selectedBudget === 'under3m') {
          matchesBudget = (item.budgetMin || 0) < 3000000;
        } else if (selectedBudget === '3m-6m') {
          matchesBudget = (item.budgetMin || 0) <= 6000000 && (item.budgetMax || 0) >= 3000000;
        } else if (selectedBudget === 'above6m') {
          matchesBudget = (item.budgetMax || 0) > 6000000;
        }

        // Duration
        let matchesDuration = true;
        if (selectedDuration === '2d') {
          matchesDuration = item.durationDays === 2;
        } else if (selectedDuration === '3d') {
          matchesDuration = item.durationDays === 3;
        } else if (selectedDuration === '4d+') {
          matchesDuration = (item.durationDays || 0) >= 4;
        }

        return matchesSearch && matchesRegion && matchesCategory && matchesBudget && matchesDuration;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'popular') return (b.reviewsCount || 0) - (a.reviewsCount || 0);
        if (sortBy === 'priceAsc') return (a.budgetMin || 0) - (b.budgetMin || 0);
        if (sortBy === 'priceDesc') return (b.budgetMax || 0) - (a.budgetMax || 0);
        return 0;
      });
  }, [destinations, searchQuery, selectedRegion, selectedCategory, selectedBudget, selectedDuration, sortBy]);

  // Featured Collections Data
  const curatedThemes = [
    {
      id: 'theme-1',
      title: 'Thiên Đường Biển Đảo',
      count: '4 Điểm đến',
      icon: Umbrella,
      gradient: 'from-sky-600 via-blue-600 to-indigo-700',
      description: 'Phú Quốc, Quy Nhơn, Mũi Né, Vịnh Hạ Long',
      filterAction: () => { setSelectedCategory('Biển & Văn Hoá'); setSelectedRegion('Tất cả'); }
    },
    {
      id: 'theme-2',
      title: 'Săn Mây & Mùa Lúa Vàng',
      count: '3 Cung đường',
      icon: Camera,
      gradient: 'from-amber-600 via-orange-600 to-rose-700',
      description: 'Hà Giang, Sapa, Cao nguyên Măng Đen',
      filterAction: () => { setSelectedCategory('Núi & Sinh Thái'); setSelectedRegion('Miền Bắc'); }
    },
    {
      id: 'theme-3',
      title: 'Hành Trình Di Sản Cố Đô',
      count: '3 Tọa độ',
      icon: Compass,
      gradient: 'from-teal-600 via-emerald-600 to-cyan-800',
      description: 'Cố đô Huế, Phố cổ Hội An, Tràng An Ninh Bình',
      filterAction: () => { setSelectedRegion('Miền Trung'); setSelectedCategory('Tất cả'); }
    },
    {
      id: 'theme-4',
      title: 'Mạo Hiểm & Phượt Địa Hình',
      count: '3 Trải nghiệm',
      icon: Flame,
      gradient: 'from-indigo-600 via-purple-600 to-pink-700',
      description: 'Đèo Mã Pí Lèng, Sa mạc Bàu Trắng, Đỉnh Fansipan',
      filterAction: () => { setSelectedCategory('Mạo Hiểm & Khám Phá'); setSelectedRegion('Tất cả'); }
    }
  ];

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 space-y-8">
      
      {/* ──────────────────────────────────────────────────────────────────────────
          1. BREADCRUMB & HERO DISCOVERY BANNER
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <a href="/" className="hover:text-sky-600 transition-colors">Trang chủ</a>
          <span>/</span>
          <span className="text-slate-900 font-bold">Khám phá Điểm đến HOT</span>
        </div>

        {/* Hero Title & Live Metrics */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-sky-900 via-[#031726] to-slate-900 rounded-3xl p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden shadow-xl border border-sky-500/20">
          {/* Subtle Ambient Orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/20 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute -bottom-10 left-1/3 w-64 h-64 bg-blue-600/15 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-sky-300 text-xs font-bold border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
              <span>Wayfare Discovery Engine 4.0 • 12+ Tọa Độ Check-in Đỉnh Cao</span>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Bản Đồ Điểm Đến & Tọa Độ Du Lịch
            </h1>

            <p className="text-slate-200 text-sm sm:text-base font-normal leading-relaxed opacity-95">
              Khám phá danh lam thắng cảnh khắp dải đất hình chữ S, tra cứu thời tiết live, bảng giá ước tính
              và gợi ý ẩm thực đặc sản cho từng vùng miền.
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs sm:text-sm font-semibold text-sky-200">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>12 Tọa độ GPS chuẩn xác</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>4.85★ Đánh giá thực tế</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-300" />
                <span>Cập nhật thời tiết theo mùa</span>
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="relative z-10 shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
            <button
              onClick={() => setIsAIGeneratorOpen(true)}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer shimmer-effect"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Lập Tour AI Điểm Này</span>
            </button>
            <span className="text-[11px] text-sky-200/80 text-center lg:text-right">
              Miễn phí • Tối ưu theo ngân sách
            </span>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. MULTI-CRITERIA FILTER & VIEW TOOLBAR
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
        {/* Top Filter Row: Search Input + Region Pills + View Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search Input Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên điểm, tỉnh thành, món ngon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-sky-500 text-xs font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Region Tabs (Vùng Miền) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
            {regions.map(reg => {
              const active = selectedRegion === reg;
              return (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {reg}
                </button>
              );
            })}
          </div>

          {/* View Mode Switcher (Split | Grid | Map) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl shrink-0 self-end lg:self-auto border border-slate-200/60">
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
              <span className="hidden sm:inline">Bản đồ Live</span>
            </button>
          </div>
        </div>

        {/* Secondary Filter Row: Categories + Budget + Duration + Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          
          {/* Categories Pills */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0 no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
              Chủ đề:
            </span>
            {categories.map(cat => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-sky-100 text-sky-900 font-bold border border-sky-300'
                      : 'bg-white text-slate-600 border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Quick Selectors: Budget + Duration + Sort */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Budget Selector */}
            <select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value)}
              className="bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-xl outline-none cursor-pointer"
            >
              <option value="all">Ngân sách: Tất cả</option>
              <option value="under3m">Dưới 3 triệu (Tiết kiệm)</option>
              <option value="3m-6m">3 - 6 triệu (Tiêu chuẩn)</option>
              <option value="above6m">Trên 6 triệu (Nghỉ dưỡng)</option>
            </select>

            {/* Duration Selector */}
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-xl outline-none cursor-pointer"
            >
              <option value="all">Thời lượng: Tất cả</option>
              <option value="2d">2 Ngày 1 Đêm</option>
              <option value="3d">3 Ngày 2 Đêm</option>
              <option value="4d+">4 Ngày 3 Đêm+</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-xl outline-none cursor-pointer"
            >
              <option value="popular">Sắp xếp: Phổ biến nhất</option>
              <option value="rating">Đánh giá cao nhất</option>
              <option value="priceAsc">Giá: Thấp đến Cao</option>
              <option value="priceDesc">Giá: Cao đến Thấp</option>
            </select>
          </div>

        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          3. MAIN CONTENT: BASED ON VIEW MODE (SPLIT | GRID | FULL MAP)
      ────────────────────────────────────────────────────────────────────────── */}

      {/* Count Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>
          Hiển thị <strong className="text-slate-900 font-bold">{filteredDestinations.length}</strong> điểm đến phù hợp
        </span>
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(''); setSelectedRegion('Tất cả'); setSelectedCategory('Tất cả'); }}
            className="text-sky-600 hover:underline font-bold"
          >
            Đặt lại bộ lọc
          </button>
        )}
      </div>

      {/* ─────────────────── A. SPLIT VIEW ─────────────────── */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[650px]">
          
          {/* Left: Scrollable Destination Cards */}
          <div className="lg:col-span-6 space-y-4 max-h-[820px] overflow-y-auto pr-2 sidebar-scrollbar">
            {filteredDestinations.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center space-y-3 border border-slate-200 shadow-sm">
                <Compass className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-base text-slate-900">Không tìm thấy địa điểm phù hợp</h3>
                <p className="text-xs text-slate-500">Hãy thử đổi từ khoá hoặc điều chỉnh lại bộ lọc ngân sách, vùng miền.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedRegion('Tất cả'); setSelectedCategory('Tất cả'); }}
                  className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 transition-colors"
                >
                  Xem lại tất cả
                </button>
              </div>
            ) : (
              filteredDestinations.map(item => {
                const isActive = activePlace?.id === item.id;
                const isSaved = !!savedDestinations[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => setActivePlace(item)}
                    className={`bg-white rounded-3xl p-4 transition-all cursor-pointer flex flex-col sm:flex-row gap-4 border ${
                      isActive
                        ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-lg scale-[1.01]'
                        : 'border-slate-200/80 hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    {/* Image Thumbnail */}
                    <div className="relative w-full sm:w-44 h-44 sm:h-auto rounded-2xl overflow-hidden shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      {/* Weather Tag */}
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white flex items-center gap-1">
                        <Sun className="w-3 h-3 text-amber-300" />
                        {item.weather}
                      </span>
                      {/* Wishlist Heart */}
                      <button
                        onClick={(e) => handleToggleSave(item, e)}
                        className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                          isSaved ? 'bg-rose-500 text-white shadow-md' : 'bg-black/35 text-white hover:bg-black/60'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Details Content */}
                    <div className="flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-800 text-[10px] font-bold">
                            {item.category} • {item.region}
                          </span>
                          <div className="flex items-center gap-1 text-xs font-black text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{item.rating} ({item.reviewsCount})</span>
                          </div>
                        </div>

                        {/* Title & Tagline */}
                        <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 mt-1">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {item.tagline}
                        </p>

                        {/* Hash Tags */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags?.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Pricing & Actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="block text-[10px] text-slate-400 font-semibold">{item.duration}</span>
                          <span className="font-bold text-sm text-sky-700">{item.priceEstimate}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setDetailModalPlace(item); }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Chi tiết</span>
                          </button>
                          <button
                            onClick={(e) => handlePlanWithAI(item, e)}
                            className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-amber-200" />
                            <span>Tạo Tour</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Interactive GPS Map Viewport */}
          <div className="lg:col-span-6 bg-slate-900 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between border border-slate-800 text-white shadow-2xl min-h-[520px]">
            {/* Map Canvas Background Grid */}
            <div className={`absolute inset-0 transition-opacity duration-700 ${
              mapLayer === 'satellite'
                ? 'bg-gradient-to-b from-slate-950 via-[#041624] to-slate-950 opacity-95'
                : 'bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:20px_20px] opacity-25'
            }`} />

            {/* Top Map Layer Controls */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 bg-slate-800/90 backdrop-blur-md p-3 rounded-2xl border border-slate-700/80">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
                <Navigation className="w-4 h-4 text-sky-400 animate-pulse" />
                <span>Bản Đồ Tọa Độ Live Radar</span>
              </div>

              {/* Layer Toggles */}
              <div className="flex items-center gap-1 text-[10px] font-bold">
                <button
                  onClick={() => setMapLayer('terrain')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    mapLayer === 'terrain' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tọa độ Du Lịch
                </button>
                <button
                  onClick={() => setMapLayer('satellite')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    mapLayer === 'satellite' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Vệ Tinh Night Mode
                </button>
              </div>
            </div>

            {/* Vietnam Coordinate Graphic Stage */}
            <div className="relative z-10 my-auto py-8 text-center">
              {/* Vietnam S-Shape Visual Cluster */}
              <div className="relative max-w-sm mx-auto h-72 border border-slate-700/60 rounded-3xl bg-slate-800/40 backdrop-blur-xs p-4 flex flex-col justify-between">
                
                {/* Visual Radar Rings in Center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-sky-500/20 pointer-events-none animate-ping" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-sky-400/30 pointer-events-none" />

                {/* North Pin (Hà Giang / Sapa / Hạ Long) */}
                <div className="flex items-center justify-around">
                  <button
                    onClick={() => setActivePlace(destinations.find(d => d.id === 'dest-3') || destinations[0])}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                      activePlace?.id === 'dest-3'
                        ? 'bg-sky-500 text-white shadow-lg ring-2 ring-sky-300'
                        : 'bg-slate-700/80 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Hà Giang</span>
                  </button>
                  <button
                    onClick={() => setActivePlace(destinations.find(d => d.id === 'dest-5') || destinations[0])}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                      activePlace?.id === 'dest-5'
                        ? 'bg-sky-500 text-white shadow-lg ring-2 ring-sky-300'
                        : 'bg-slate-700/80 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Hạ Long</span>
                  </button>
                </div>

                {/* Central Pin (Đà Nẵng / Huế / Quy Nhơn) */}
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setActivePlace(destinations.find(d => d.id === 'dest-1') || destinations[0])}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      activePlace?.id === 'dest-1'
                        ? 'bg-amber-500 text-white shadow-lg ring-2 ring-amber-300'
                        : 'bg-slate-700/80 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <MapPin className="w-4 h-4 fill-current" />
                    <span>Đà Nẵng - Hội An</span>
                  </button>
                </div>

                {/* South Pin (Phú Quốc / Mũi Né / Cần Thơ) */}
                <div className="flex items-center justify-around">
                  <button
                    onClick={() => setActivePlace(destinations.find(d => d.id === 'dest-2') || destinations[0])}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                      activePlace?.id === 'dest-2'
                        ? 'bg-sky-500 text-white shadow-lg ring-2 ring-sky-300'
                        : 'bg-slate-700/80 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Phú Quốc</span>
                  </button>
                  <button
                    onClick={() => setActivePlace(destinations.find(d => d.id === 'dest-8') || destinations[0])}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                      activePlace?.id === 'dest-8'
                        ? 'bg-sky-500 text-white shadow-lg ring-2 ring-sky-300'
                        : 'bg-slate-700/80 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Đà Lạt</span>
                  </button>
                </div>
              </div>

              {/* Floating Active Details Popover */}
              {activePlace && (
                <div className="mt-4 max-w-md mx-auto bg-slate-800/95 backdrop-blur-xl p-4 rounded-2xl border border-slate-700 text-left space-y-2 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">{activePlace.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        GPS: {activePlace.coordinates.lat.toFixed(4)}, {activePlace.coordinates.lng.toFixed(4)}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-sky-400">{activePlace.priceEstimate}</span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">{activePlace.aiHighlights}</p>

                  <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-700/60">
                    <button
                      onClick={(e) => handleCopyGPS(activePlace, e)}
                      className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      Sao chép GPS
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDetailModalPlace(activePlace)}
                        className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-[11px] font-semibold cursor-pointer"
                      >
                        Xem Chi Tiết
                      </button>
                      <button
                        onClick={(e) => handlePlanWithAI(activePlace, e)}
                        className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-amber-200" />
                        Tạo Tour
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Status Bar */}
            <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 bg-slate-800/80 p-3 rounded-xl border border-slate-700/50">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Vệ tinh định vị thời gian thực
              </span>
              <span className="text-amber-400 font-bold">★ AI Routing Enabled</span>
            </div>
          </div>

        </div>
      )}

      {/* ─────────────────── B. GRID CARDS VIEW ─────────────────── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDestinations.map(item => {
            const isSaved = !!savedDestinations[item.id];
            return (
              <div
                key={item.id}
                onClick={() => setDetailModalPlace(item)}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Card Image */}
                  <div className="relative w-full h-56 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    {/* Top Floating Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-extrabold text-slate-900 shadow-sm">
                        {item.region}
                      </span>
                      <button
                        onClick={(e) => handleToggleSave(item, e)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                          isSaved ? 'bg-rose-500 text-white shadow-md' : 'bg-black/35 text-white hover:bg-black/60'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Bottom Floating Info */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="flex items-center gap-1 font-semibold">
                        <Sun className="w-3.5 h-3.5 text-amber-300" />
                        {item.weather}
                      </span>
                      <span className="flex items-center gap-1 font-black text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {item.rating}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-2.5">
                    <span className="text-[10px] uppercase font-bold text-sky-600 tracking-wider">
                      {item.category}
                    </span>
                    <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-sky-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.tagline}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.tags?.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-semibold">{item.duration}</span>
                    <span className="font-bold text-sm text-sky-700">{item.priceEstimate}</span>
                  </div>

                  <button
                    onClick={(e) => handlePlanWithAI(item, e)}
                    className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>Lập Tour</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─────────────────── C. FULL MAP VIEW ─────────────────── */}
      {viewMode === 'map' && (
        <div className="bg-slate-950 rounded-3xl p-6 relative overflow-hidden border border-slate-800 text-white shadow-2xl min-h-[650px] flex flex-col justify-between">
          <div className="relative z-10 flex items-center justify-between bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="font-bold text-base text-white">Toàn Cảnh Bản Đồ Check-In Việt Nam</h3>
              <p className="text-xs text-slate-400">Bấm vào các điểm ghim để xem chi tiết và tạo lịch trình AI tức thì.</p>
            </div>
            <button
              onClick={() => setViewMode('split')}
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all"
            >
              Chuyển về danh sách
            </button>
          </div>

          {/* Interactive Grid Map representation */}
          <div className="relative z-10 my-auto py-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredDestinations.map(item => (
              <div
                key={item.id}
                onClick={() => setDetailModalPlace(item)}
                className="bg-slate-900/80 hover:bg-slate-800/90 p-4 rounded-2xl border border-slate-700/80 hover:border-sky-500/80 transition-all cursor-pointer group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 group-hover:scale-125 transition-transform" />
                    <h4 className="font-bold text-sm text-white group-hover:text-sky-300 transition-colors">{item.name}</h4>
                  </div>
                  <span className="text-xs font-bold text-amber-400">{item.rating}★</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">{item.region} • {item.duration}</p>
                <span className="block text-xs font-bold text-sky-400">{item.priceEstimate}</span>
              </div>
            ))}
          </div>

          <div className="relative z-10 text-center text-xs text-slate-400">
            Hệ thống GPS AI tự động kết nối và đo khoảng cách di chuyển giữa các điểm đến.
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          4. CURATED SEASONAL COLLECTIONS (CHỦ ĐỀ DU LỊCH ĐỘT PHÁ)
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              Bộ Sưu Tập Du Lịch Theo Mùa
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Tuyển tập hành trình được các travel blogger và AI đề xuất nhiều nhất
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {curatedThemes.map(theme => {
            const Icon = theme.icon;
            return (
              <div
                key={theme.id}
                onClick={theme.filterAction}
                className={`rounded-3xl p-6 text-white bg-gradient-to-br ${theme.gradient} shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between min-h-[190px] relative overflow-hidden group`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                
                <div className="relative z-10 space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-md">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-white pt-2">
                    {theme.title}
                  </h3>
                  <p className="text-xs text-white/80 line-clamp-2">
                    {theme.description}
                  </p>
                </div>

                <div className="relative z-10 pt-4 flex items-center justify-between text-xs font-bold border-t border-white/20">
                  <span className="text-white/90">{theme.count}</span>
                  <span className="flex items-center gap-1 text-white group-hover:translate-x-1 transition-transform">
                    Khám phá ngay <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          5. DESTINATION DETAIL MODAL (MODAL CHI TIẾT SIÊU ĐẦY ĐỦ)
      ────────────────────────────────────────────────────────────────────────── */}
      {detailModalPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div
            onClick={() => setDetailModalPlace(null)}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity"
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 my-auto animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
            {/* Modal Header Gallery */}
            <div className="relative h-64 sm:h-80 w-full shrink-0 overflow-hidden bg-slate-900">
              <img
                src={detailModalPlace.gallery?.[activeGalleryIdx] || detailModalPlace.image}
                alt={detailModalPlace.name}
                className="w-full h-full object-cover transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              {/* Close Button */}
              <button
                onClick={() => setDetailModalPlace(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Gallery Thumbnails */}
              {detailModalPlace.gallery && detailModalPlace.gallery.length > 1 && (
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                  {detailModalPlace.gallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveGalleryIdx(idx)}
                      className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        activeGalleryIdx === idx ? 'border-sky-400 scale-105' : 'border-white/50 opacity-70'
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Title Overlay */}
              <div className="absolute bottom-4 left-6 right-28 text-white space-y-1">
                <span className="px-3 py-1 rounded-full bg-sky-500/90 text-white font-extrabold text-[10px] uppercase tracking-wider">
                  {detailModalPlace.category} • {detailModalPlace.region}
                </span>
                <h2 className="font-display text-xl sm:text-3xl font-extrabold text-white">
                  {detailModalPlace.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 line-clamp-1">{detailModalPlace.tagline}</p>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
              
              {/* Quick Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
                <div>
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase">Đánh giá</span>
                  <span className="font-extrabold text-slate-900 flex items-center gap-1 text-sm mt-0.5">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {detailModalPlace.rating} ({detailModalPlace.reviewsCount})
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase">Thời lượng lý tưởng</span>
                  <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">{detailModalPlace.duration}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase">Mùa đẹp nhất</span>
                  <span className="font-extrabold text-sky-700 text-xs mt-0.5 block">{detailModalPlace.bestSeason}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase">Chi phí dự kiến</span>
                  <span className="font-extrabold text-emerald-700 text-sm mt-0.5 block">{detailModalPlace.priceEstimate}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="font-display font-bold text-base text-slate-900">Giới thiệu & Trải nghiệm tổng quan</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {detailModalPlace.description}
                </p>
              </div>

              {/* Top Attractions Checklist */}
              {detailModalPlace.topAttractions && (
                <div className="space-y-3">
                  <h4 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-sky-600" />
                    Địa Điểm Check-In & Hoạt Động Nổi Bật
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {detailModalPlace.topAttractions.map((act, i) => (
                      <div key={i} className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                          <span>{act.name}</span>
                          <span className="text-[10px] font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{act.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 italic">💡 {act.tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specialties & Food */}
              {detailModalPlace.specialties && (
                <div className="space-y-2.5">
                  <h4 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-amber-500" />
                    Ẩm Thực Đặc Sản Nhất Định Phải Thử
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {detailModalPlace.specialties.map((food, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200/80">
                        🥢 {food}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Expert Advice */}
              {detailModalPlace.expertTips && (
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 text-xs space-y-1">
                  <span className="font-bold text-sky-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    Lời khuyên & Lưu ý từ Chuyên gia du lịch Wayfare:
                  </span>
                  <p className="text-sky-800 leading-relaxed">
                    {detailModalPlace.expertTips}
                  </p>
                </div>
              )}

            </div>

            {/* Modal Footer Controls */}
            <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={(e) => handleCopyGPS(detailModalPlace, e)}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Sao chép tọa độ
                </button>
                <button
                  onClick={(e) => handleToggleSave(detailModalPlace, e)}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    savedDestinations[detailModalPlace.id]
                      ? 'bg-rose-50 border-rose-200 text-rose-600 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${savedDestinations[detailModalPlace.id] ? 'fill-current' : ''}`} />
                  {savedDestinations[detailModalPlace.id] ? 'Đã lưu' : 'Lưu lại'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDetailModalPlace(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  onClick={(e) => {
                    handlePlanWithAI(detailModalPlace, e);
                    setDetailModalPlace(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shimmer-effect"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Lập Tour AI Với Điểm Này</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ExplorePage;
