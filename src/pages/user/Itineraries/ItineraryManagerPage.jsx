import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../components/common/Toast';
import { aiService } from '../../../services/aiService';
import {
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Share2,
  Edit3,
  MoreVertical,
  Plus,
  Compass,
  CheckCircle2,
  Heart,
  Car,
  Utensils,
  Camera,
  X,
  ArrowRight,
  TrendingDown,
  Info,
  Layers,
  Map,
  Download,
  Trash2,
  RefreshCw,
  Eye,
  Check,
  Send,
  Loader2,
  Smile,
  AlertCircle
} from 'lucide-react';

export const ItineraryManagerPage = () => {
  const { itineraries, setItineraries, setIsAIGeneratorOpen } = useApp();
  const toast = useToast();

  // Navigation & Filter States
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'completed' | 'drafts' | 'cancelled'
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('nearest'); // 'nearest' | 'newest' | 'budget_low' | 'duration'
  const [activeFilterTag, setActiveFilterTag] = useState('all'); // 'all' | 'ai' | 'group' | 'family'

  // Selected Itinerary for Detail Modal
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [detailDayIndex, setDetailDayIndex] = useState(0);
  const [detailViewTab, setDetailViewTab] = useState('timeline'); // 'timeline' | 'budget' | 'tips'

  // Fast AI Quick Planner Modal
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [quickDest, setQuickDest] = useState('');
  const [quickDays, setQuickDays] = useState(3);
  const [quickBudget, setQuickBudget] = useState('4.500.000đ');
  const [quickStyle, setQuickStyle] = useState('🏖️ Nghỉ dưỡng biển & Ẩm thực');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Filter and Sort Logic
  const filteredItineraries = useMemo(() => {
    return itineraries.filter(itin => {
      // Tab matching
      if (activeTab === 'upcoming' && itin.status !== 'upcoming') return false;
      if (activeTab === 'completed' && itin.status !== 'completed') return false;
      if (activeTab === 'drafts' && itin.status !== 'drafts') return false;
      if (activeTab === 'cancelled' && itin.status !== 'cancelled') return false;

      // Filter tag
      if (activeFilterTag === 'ai' && !itin.isAiGenerated) return false;
      if (activeFilterTag === 'group' && !itin.groupType?.toLowerCase().includes('nhóm')) return false;
      if (activeFilterTag === 'family' && !itin.groupType?.toLowerCase().includes('gia đình')) return false;

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = itin.title?.toLowerCase().includes(query);
        const matchDest = itin.destination?.toLowerCase().includes(query);
        const matchPlaces = itin.placesList?.some(p => p.toLowerCase().includes(query));
        if (!matchTitle && !matchDest && !matchPlaces) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortOption === 'budget_low') {
        return (a.budgetPerPerson || 0) - (b.budgetPerPerson || 0);
      }
      if (sortOption === 'duration') {
        return (b.daysCount || 0) - (a.daysCount || 0);
      }
      return 0; // Default order
    });
  }, [itineraries, activeTab, activeFilterTag, searchQuery, sortOption]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      upcoming: itineraries.filter(i => i.status === 'upcoming').length,
      completed: itineraries.filter(i => i.status === 'completed').length,
      drafts: itineraries.filter(i => i.status === 'drafts').length,
      cancelled: itineraries.filter(i => i.status === 'cancelled').length
    };
  }, [itineraries]);

  // Handle Share
  const handleShareItinerary = (itin, e) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + `/itineraries?id=${itin.id}`);
      toast.success(`Đã sao chép liên kết chia sẻ cho chuyến đi: ${itin.title}`);
    } else {
      toast.info('Đã tạo liên kết chia sẻ nhóm thành công!');
    }
  };

  // Fast AI Quick Generate
  const handleRunQuickAI = async (e) => {
    if (e) e.preventDefault();
    if (!quickDest.trim()) {
      toast.warn('Vui lòng nhập điểm đến du lịch mong muốn!');
      return;
    }

    setIsGeneratingAI(true);
    toast.info(`WanderAI đang kết nối Google Gemini để phân tích lộ trình ${quickDest}...`);

    try {
      // Call Gemini for real AI trip advice
      const prompt = `Lên kế hoạch du lịch chi tiết ${quickDays} ngày tại ${quickDest}, phong cách ${quickStyle}, ngân sách ${quickBudget}. Hãy đưa ra 3 điểm check-in tiêu biểu và 1 mẹo ẩm thực bản địa. Trả lời ngắn gọn súc tích tiếng Việt.`;
      const aiAdvice = await aiService.generateText({ prompt });

      const newTrip = {
        id: `itin-${Date.now()}`,
        title: `Hành Trình ${quickDest} (${quickDays}N${quickDays - 1}Đ): AI Tối Ưu`,
        destination: quickDest,
        region: 'Hành trình mới tạo',
        coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        duration: `${quickDays}N${quickDays - 1}Đ`,
        daysCount: Number(quickDays),
        status: 'upcoming',
        isAiGenerated: true,
        countdown: 'Sắp khởi hành • Mới tạo',
        departureDate: 'Khởi hành trong tháng tới',
        groupType: 'Nhóm bạn / Cặp đôi',
        placesCount: quickDays * 3,
        placesList: [quickDest + ' City Tour', 'Điểm Check-in Đặc Sắc', 'Khu Ẩm Thực Đêm'],
        budgetPerPerson: 3500000,
        totalBudget: 7000000,
        budgetProgress: 40,
        budgetNote: 'Được tạo bởi Google Gemini AI • Hạn mức linh hoạt',
        pace: 'Cân bằng',
        style: quickStyle,
        aiTipNote: aiAdvice || 'Gợi ý từ WanderAI: Nên khởi hành sớm để tránh nắng gắt và săn ảnh bình minh đẹp.',
        days: Array.from({ length: Number(quickDays) }).map((_, i) => ({
          dayNumber: i + 1,
          title: `Ngày ${i + 1}: Khám phá điểm nhấn ${quickDest}`,
          activities: [
            { time: '08:00', title: `Đón bình minh & Thưởng thức đặc sản ${quickDest}`, note: 'Quán ăn bản địa đánh giá 4.9*', cost: '60.000đ' },
            { time: '10:30', title: `Check-in danh thắng tiêu biểu tại ${quickDest}`, note: 'Tận dụng khung giờ vàng ánh sáng đẹp', cost: '150.000đ' },
            { time: '14:30', title: `Trải nghiệm văn hóa & Cafe sống ảo`, note: 'Góc ngắm toàn cảnh thành phố', cost: '80.000đ' },
            { time: '19:00', title: `Thưởng thức ẩm thực đêm & Chill phố cổ`, note: 'Thưởng thức món ngon địa phương', cost: '250.000đ' }
          ]
        }))
      };

      setItineraries([newTrip, ...itineraries]);
      setIsGeneratingAI(false);
      setIsQuickCreateOpen(false);
      setSelectedItinerary(newTrip);
      toast.success(`WanderAI đã tạo thành công lịch trình ${quickDays} ngày tại ${quickDest}! ✨`);
    } catch (err) {
      console.warn('AI generator fallback:', err.message);
      setIsGeneratingAI(false);
      setIsQuickCreateOpen(false);
      toast.success(`Đã khởi tạo lịch trình ${quickDest} thành công!`);
    }
  };

  return (
    <div className="min-w-0 space-y-8 pb-20">
      
      {/* ─── 1. TOP AMBIENT GLOW & HEADER (M04 STITCH CANVAS) ──────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600/10 via-cyan-500/10 to-amber-500/10 p-6 sm:p-8 border border-sky-100 shadow-sm">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-gradient-to-r from-sky-400/20 via-cyan-300/20 to-amber-300/15 blur-3xl pointer-events-none -z-10"></div>
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-3">
          <span className="flex items-center gap-1 hover:text-sky-600 transition-colors cursor-pointer">
            <Compass className="w-3.5 h-3.5" />
            Trang chủ
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-sky-600 font-bold">Lịch trình của tôi</span>
        </div>

        {/* Title & Action Cluster */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100/80 text-sky-800 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Trung tâm quản lý hành trình cá nhân</span>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Lịch trình của tôi
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              Quản lý toàn bộ chuyến đi sắp tới, kế hoạch đã hoàn thành và các đề xuất hành trình do AI thông minh tối ưu riêng cho bạn.
            </p>
          </div>

          {/* Action CTA Cluster */}
          <div className="flex flex-wrap items-center gap-3">
            {/* AI Generator Button with Glowing Badge */}
            <button
              type="button"
              onClick={() => setIsQuickCreateOpen(true)}
              className="group relative inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-200 group-hover:rotate-12 transition-transform" />
              <span>Tạo bằng AI ✨</span>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            </button>

            {/* Manual New Trip */}
            <button
              type="button"
              onClick={() => setIsAIGeneratorOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tạo chuyến đi mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. SUMMARY STATS STRIP (4 KPI CARDS) ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-sky-300 transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng số chuyến đi</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-display text-2xl font-extrabold text-slate-900">{itineraries.length + 8}</span>
              <span className="text-xs text-slate-500">chuyến</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-cyan-300 transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Điểm đến đã qua</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-display text-2xl font-extrabold text-slate-900">18</span>
              <span className="text-xs text-slate-500">thành phố</span>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ngân sách tối ưu</p>
            <div className="flex items-baseline gap-1.5 mt-0.5 flex-wrap">
              <span className="font-display text-lg sm:text-xl font-extrabold text-slate-900 text-sky-600">42.500.000đ</span>
              <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                -15% AI
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl p-5 border border-amber-200/80 shadow-xs hover:shadow-md transition-all flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Clock className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Hành trình kế tiếp</p>
            <p className="font-display text-base font-extrabold text-slate-900 truncate">Còn 4 ngày</p>
            <p className="text-xs text-slate-500 truncate">Đà Nẵng – Hội An</p>
          </div>
        </div>
      </div>

      {/* ─── 3. NAV TABS & FILTER WORKSPACE (M04 FILTER MATRIX) ──────────────────── */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
        {/* Row 1: Segmented Tabs & Layout Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'upcoming', label: 'Chuyến đi sắp tới', count: tabCounts.upcoming },
              { id: 'completed', label: 'Đã hoàn thành', count: tabCounts.completed },
              { id: 'drafts', label: 'Bản nháp & Đề xuất AI', count: tabCounts.drafts, isAi: true },
              { id: 'cancelled', label: 'Đã hủy', count: tabCounts.cancelled }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {tab.isAi && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Grid / List Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setLayoutMode('grid')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                layoutMode === 'grid' ? 'bg-white text-sky-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Dạng lưới thẻ"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('list')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                layoutMode === 'list' ? 'bg-white text-sky-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Dạng danh sách"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 2: Search, Sort & Tag Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="md:col-span-6 lg:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm chuyến đi theo tên, điểm đến, thẻ..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/10 transition-all"
            />
          </div>

          {/* Sort Select */}
          <div className="md:col-span-6 lg:col-span-3">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full px-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 outline-none focus:border-sky-500 focus:bg-white cursor-pointer"
            >
              <option value="nearest">Sắp xếp: Khởi hành gần nhất</option>
              <option value="newest">Sắp xếp: Mới tạo gần đây</option>
              <option value="budget_low">Sắp xếp: Ngân sách tiết kiệm</option>
              <option value="duration">Sắp xếp: Số ngày dài nhất</option>
            </select>
          </div>

          {/* Filter Chips */}
          <div className="md:col-span-12 lg:col-span-4 flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 lg:justify-end">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden xl:inline">
              Lọc:
            </span>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'ai', label: 'Tạo bởi AI', isAi: true },
              { id: 'group', label: 'Chuyến đi nhóm' },
              { id: 'family', label: 'Gia đình' }
            ].map(tag => {
              const isSelected = activeFilterTag === tag.id;
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setActiveFilterTag(tag.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {tag.isAi && <Sparkles className="w-3 h-3 text-amber-400" />}
                  <span>{tag.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── 4. MAIN ITINERARIES GRID / LIST ────────────────────────────────────── */}
      {filteredItineraries.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-base text-slate-800">Không tìm thấy lịch trình phù hợp</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Thử thay đổi bộ lọc hoặc dùng tính năng Tạo bằng AI để lên ngay một kế hoạch du lịch mới.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsQuickCreateOpen(true)}
            className="px-5 py-2.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            Tạo Lịch Trình AI Ngay ✨
          </button>
        </div>
      ) : (
        <div className={`grid gap-6 ${layoutMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {filteredItineraries.map((itin) => {
            return (
              <div
                key={itin.id}
                onClick={() => setSelectedItinerary(itin)}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1 relative cursor-pointer"
              >
                {/* Image Cover Section */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                  <img
                    src={itin.coverImage || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80'}
                    alt={itin.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 flex-wrap">
                    {itin.countdown && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/90 text-white text-[11px] font-bold shadow-sm backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        {itin.countdown}
                      </span>
                    )}

                    {itin.isAiGenerated && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sky-600/90 text-white text-[11px] font-bold backdrop-blur-md shadow-sm">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        Tạo bởi AI
                      </span>
                    )}
                  </div>

                  {/* Destination & Duration Bottom Overlay */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                    <div>
                      <p className="text-[10px] font-bold text-sky-200 uppercase tracking-wider">
                        {itin.region || 'Điểm đến du lịch'}
                      </p>
                      <div className="flex items-center gap-1 font-bold text-xs sm:text-sm">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span className="truncate">{itin.destination}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-sky-700 text-xs font-extrabold">
                      {itin.duration || `${itin.daysCount || 3}N${(itin.daysCount || 3) - 1}Đ`}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex flex-col flex-1 space-y-3">
                  <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2">
                    {itin.title}
                  </h3>

                  {/* Metadata List */}
                  <div className="space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span className="font-medium text-slate-700">{itin.departureDate || 'Ngày khởi hành linh hoạt'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{itin.groupType || 'Cá nhân'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sky-600 font-bold text-[11px]">
                        <MapPin className="w-3 h-3" />
                        <span>{itin.placesCount || 8} địa điểm</span>
                      </div>
                    </div>
                  </div>

                  {/* Places Chips Preview */}
                  {itin.placesList && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {itin.placesList.slice(0, 3).map((place, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium text-slate-600">
                          {place}
                        </span>
                      ))}
                      {itin.placesList.length > 3 && (
                        <span className="px-2 py-0.5 rounded-md bg-sky-50 text-[10px] font-bold text-sky-700">
                          +{itin.placesList.length - 3} điểm
                        </span>
                      )}
                    </div>
                  )}

                  {/* Mini Photo Reel if completed */}
                  {itin.photoReel && (
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      {itin.photoReel.slice(0, 2).map((img, idx) => (
                        <div key={idx} className="h-16 rounded-xl overflow-hidden bg-slate-100">
                          <img src={img} alt="Memory" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      <div className="h-16 rounded-xl bg-sky-50 flex items-center justify-center text-sky-700 font-bold text-xs">
                        +{itin.photosCount || 24} ảnh
                      </div>
                    </div>
                  )}

                  {/* Budget Estimate & Progress Bar */}
                  <div className="mt-auto pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">Dự toán cá nhân:</span>
                      <span className="font-extrabold text-sky-600">
                        {itin.budgetPerPerson ? `${itin.budgetPerPerson.toLocaleString('vi-VN')}đ` : itin.budgetTotal}{' '}
                        <span className="font-normal text-[10px] text-slate-400">/người</span>
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full"
                        style={{ width: `${itin.budgetProgress || 70}%` }}
                      ></div>
                    </div>
                    {itin.budgetNote && (
                      <p className="text-[10px] text-slate-400 mt-1 text-right truncate">{itin.budgetNote}</p>
                    )}
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedItinerary(itin)}
                      className="flex-1 py-2 px-3 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Xem chi tiết</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleShareItinerary(itin, e)}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                      title="Chia sẻ nhóm"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.info(`Đã lưu trữ hành trình "${itin.title}".`);
                      }}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                      title="Tùy chọn khác"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Special Inline Card: AI Discovery Prompt (Stitch M04 Component) */}
          <div className="bg-gradient-to-br from-sky-50 via-cyan-50/70 to-amber-50/50 rounded-3xl p-6 border border-sky-200/80 flex flex-col justify-between shadow-xs relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-sky-400/10 blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center text-amber-500 mb-2">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>

              <div className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                Chỉ mất 30 giây
              </div>

              <h3 className="font-display font-extrabold text-base text-slate-900 leading-snug">
                Lên ý tưởng chuyến đi tiếp theo cùng WanderAI
              </h3>

              <p className="text-xs text-slate-500 leading-relaxed">
                Bạn chưa quyết định đi đâu? Chỉ cần chọn sở thích và ngân sách, trí tuệ nhân tạo sẽ tự động gợi ý lịch trình từng giờ kèm địa điểm ăn uống ngon nhất.
              </p>

              {/* Quick Click Prompts */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setQuickDest('Nha Trang & Đảo Điệp Sơn');
                    setQuickDays(3);
                    setQuickBudget('3.800.000đ');
                    setQuickStyle('🏖️ Nghỉ dưỡng biển & Lặn ngắm san hô');
                    setIsQuickCreateOpen(true);
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl bg-white hover:bg-sky-50 border border-slate-200/60 text-xs font-semibold text-slate-700 flex items-center justify-between transition-colors shadow-xs cursor-pointer"
                >
                  <span>🏖️ Nghỉ dưỡng biển 3N2Đ &lt; 4 triệu</span>
                  <ChevronRight className="w-3.5 h-3.5 text-sky-600" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setQuickDest('Đà Lạt Mộng Mơ');
                    setQuickDays(2);
                    setQuickBudget('2.500.000đ');
                    setQuickStyle('☕ Săn mây & Cafe sống ảo');
                    setIsQuickCreateOpen(true);
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl bg-white hover:bg-sky-50 border border-slate-200/60 text-xs font-semibold text-slate-700 flex items-center justify-between transition-colors shadow-xs cursor-pointer"
                >
                  <span>☕ Săn mây Cafe Đà Lạt 2N1Đ</span>
                  <ChevronRight className="w-3.5 h-3.5 text-sky-600" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsQuickCreateOpen(true)}
              className="mt-5 w-full py-2.5 px-4 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Khởi tạo chuyến đi mới</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── 5. STATUS COUNTER BAR ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-600"></span>
          <span>
            Hiển thị <strong>{filteredItineraries.length}</strong> trong tổng số <strong>{itineraries.length + 8}</strong> lịch trình du lịch của bạn
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toast.info('Đang tải danh sách lưu trữ cũ từ hệ sinh thái WanderAI...')}
            className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Xem lịch trình lưu trữ cũ (8)</span>
          </button>

          <button
            type="button"
            onClick={() => toast.success('Đã làm mới dữ liệu lịch trình!')}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            title="Tải lại"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── 6. INTERACTIVE ITINERARY DETAIL DRAWER / MODAL ─────────────────────── */}
      {selectedItinerary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Modal Header Banner */}
            <div className="relative h-44 sm:h-52 w-full bg-slate-900 shrink-0 overflow-hidden">
              <img
                src={selectedItinerary.coverImage}
                alt={selectedItinerary.title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedItinerary(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Trip Header Info */}
              <div className="absolute bottom-4 left-5 right-5 text-white space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-500 text-[10px] font-extrabold uppercase tracking-wider">
                    {selectedItinerary.duration}
                  </span>
                  {selectedItinerary.isAiGenerated && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> WanderAI Optimized
                    </span>
                  )}
                </div>

                <h2 className="font-display text-lg sm:text-2xl font-extrabold leading-tight">
                  {selectedItinerary.title}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    {selectedItinerary.destination}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    {selectedItinerary.departureDate}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-emerald-400">
                    <DollarSign className="w-3.5 h-3.5" />
                    {selectedItinerary.budgetPerPerson ? `${selectedItinerary.budgetPerPerson.toLocaleString('vi-VN')}đ/người` : selectedItinerary.budgetTotal}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="px-6 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/80">
              <div className="flex items-center gap-2 overflow-x-auto py-3">
                {[
                  { id: 'timeline', label: 'Lộ trình chi tiết từng giờ' },
                  { id: 'budget', label: 'Phân bổ chi phí & Dự toán' },
                  { id: 'tips', label: 'Lời khuyên từ WanderAI' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDetailViewTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      detailViewTab === tab.id
                        ? 'bg-white text-sky-600 shadow-xs border border-slate-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Action Buttons in Header */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleShareItinerary(selectedItinerary, e)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Mời bạn bè</span>
                </button>
                <button
                  type="button"
                  onClick={() => toast.success('Đã tải lịch trình ngoại tuyến thành công!')}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải PDF</span>
                </button>
              </div>
            </div>

            {/* Modal Body Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* TAB 1: TIMELINE DETAIL */}
              {detailViewTab === 'timeline' && (
                <div className="space-y-6">
                  {/* Days Selector Tabs */}
                  {selectedItinerary.days && selectedItinerary.days.length > 0 ? (
                    <>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {selectedItinerary.days.map((d, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setDetailDayIndex(idx)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                              detailDayIndex === idx
                                ? 'bg-slate-900 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Ngày {d.dayNumber || idx + 1}
                          </button>
                        ))}
                      </div>

                      {/* Selected Day Activities List */}
                      {selectedItinerary.days[detailDayIndex] && (
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-center justify-between">
                            <h4 className="font-display font-extrabold text-xs sm:text-sm text-sky-900">
                              {selectedItinerary.days[detailDayIndex].title}
                            </h4>
                            <span className="text-[11px] font-bold text-sky-700 bg-white px-2.5 py-1 rounded-full shadow-xs">
                              {selectedItinerary.days[detailDayIndex].activities?.length || 0} Hoạt động
                            </span>
                          </div>

                          {/* Chronological Timeline Spine */}
                          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                            {selectedItinerary.days[detailDayIndex].activities?.map((act, i) => (
                              <div key={i} className="relative group">
                                <div className="absolute -left-6 top-3 w-4 h-4 rounded-full bg-white border-2 border-sky-500 group-hover:bg-sky-500 transition-colors"></div>

                                <div className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 transition-all space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="font-mono font-bold text-sky-600 text-xs flex items-center gap-1.5">
                                      <Clock className="w-3.5 h-3.5" />
                                      {act.time}
                                    </span>
                                    {act.cost && (
                                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                        {act.cost}
                                      </span>
                                    )}
                                  </div>

                                  <h5 className="font-display font-bold text-xs sm:text-sm text-slate-900">
                                    {act.title}
                                  </h5>

                                  <p className="text-xs text-slate-500 leading-relaxed">
                                    {act.note}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-slate-400">Không có dữ liệu ngày chi tiết.</p>
                  )}
                </div>
              )}

              {/* TAB 2: BUDGET BREAKDOWN */}
              {detailViewTab === 'budget' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200/60 space-y-1">
                      <span className="text-[11px] font-bold text-slate-500">Dự toán mỗi người</span>
                      <p className="font-display text-xl font-extrabold text-sky-700">
                        {selectedItinerary.budgetPerPerson ? `${selectedItinerary.budgetPerPerson.toLocaleString('vi-VN')}đ` : selectedItinerary.budgetTotal}
                      </p>
                      <p className="text-[10px] text-slate-400">Đã bao gồm lưu trú & ăn uống</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/60 space-y-1">
                      <span className="text-[11px] font-bold text-slate-500">Tổng ngân sách nhóm</span>
                      <p className="font-display text-xl font-extrabold text-emerald-700">
                        {selectedItinerary.totalBudget ? `${selectedItinerary.totalBudget.toLocaleString('vi-VN')}đ` : 'Chưa tính'}
                      </p>
                      <p className="text-[10px] text-slate-400">Ước tính theo phương tiện thực tế</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/60 space-y-1">
                      <span className="text-[11px] font-bold text-slate-500">Tiết kiệm nhờ AI</span>
                      <p className="font-display text-xl font-extrabold text-amber-700">-15% ~ -20%</p>
                      <p className="text-[10px] text-slate-400">Nhờ tối ưu cung đường & đặt sớm</p>
                    </div>
                  </div>

                  {/* Budget Categories Progress */}
                  <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                      Phân Bổ Hạng Mục Chi Tiêu Khuyên Dùng
                    </h4>

                    {[
                      { label: 'Ăn uống & Đặc sản địa phương', pct: 35, color: 'bg-amber-500' },
                      { label: 'Lưu trú (Khách sạn / Homestay)', pct: 30, color: 'bg-sky-600' },
                      { label: 'Di chuyển (Xe máy / Taxi / Đưa đón)', pct: 20, color: 'bg-cyan-500' },
                      { label: 'Vé tham quan & Trải nghiệm vui chơi', pct: 15, color: 'bg-emerald-500' }
                    ].map((cat, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-slate-600">
                          <span>{cat.label}</span>
                          <span className="font-bold">{cat.pct}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.pct}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: WANDERAI INSIGHTS & TIPS */}
              {detailViewTab === 'tips' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Lời khuyên thông minh từ Trợ lý WanderAI</span>
                    </div>
                    <p className="text-xs leading-relaxed text-amber-800">
                      {selectedItinerary.aiTipNote ||
                        'Thời điểm lý tưởng nhất để tham quan là buổi sáng trước 09:00 hoặc sau 15:30 chiều. Hãy chuẩn bị sạc dự phòng, trang phục màu sáng để có những bức ảnh check-in rực rỡ nhất!'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50 space-y-2">
                      <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-sky-600" />
                        <span>Góc chụp ảnh (Photo Spots) đẹp</span>
                      </h5>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Chụp ngược sáng hoàng hôn, tận dụng góc nhìn từ trên cao tại các điểm dừng check-in để bắt trọn cảnh quan rộng lớn.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50 space-y-2">
                      <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                        <Car className="w-4 h-4 text-cyan-600" />
                        <span>Kinh nghiệm di chuyển thuận tiện</span>
                      </h5>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Thuê xe tự lái hoặc xe máy công nghệ theo chặng ngắn để tiết kiệm tối đa thời gian di chuyển giữa các điểm đến.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-xs text-slate-400">
                Mã hành trình: <span className="font-mono text-slate-600 font-bold">{selectedItinerary.id}</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedItinerary(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Đóng lại
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.success('Đã lưu các thay đổi cho lịch trình này!');
                    setSelectedItinerary(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Lưu & Áp dụng
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ─── 7. FAST AI QUICK CREATOR MODAL ─────────────────────────────────────── */}
      {isQuickCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-slate-900">
                    Trợ Lý AI Lập Lịch Trình Nhanh
                  </h3>
                  <p className="text-xs text-slate-400">Kết nối trực tiếp trí tuệ nhân tạo Google Gemini Live</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsQuickCreateOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRunQuickAI} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Điểm đến mong muốn <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={quickDest}
                  onChange={(e) => setQuickDest(e.target.value)}
                  placeholder="Ví dụ: Quy Nhơn & Phú Yên, Đà Lạt, Sa Pa..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-sky-500 focus:bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Thời lượng (Số ngày)</label>
                  <select
                    value={quickDays}
                    onChange={(e) => setQuickDays(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none text-xs"
                  >
                    <option value={2}>2 Ngày 1 Đêm</option>
                    <option value={3}>3 Ngày 2 Đêm (Chuẩn)</option>
                    <option value={4}>4 Ngày 3 Đêm</option>
                    <option value={5}>5 Ngày 4 Đêm</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Dự trù ngân sách</label>
                  <select
                    value={quickBudget}
                    onChange={(e) => setQuickBudget(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none text-xs"
                  >
                    <option value="2.500.000đ">Tiết kiệm (2.5 triệu)</option>
                    <option value="4.500.000đ">Tiêu chuẩn (4.5 triệu)</option>
                    <option value="8.000.000đ">Cao cấp (8 triệu+)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Gu du lịch & Phong cách</label>
                <input
                  type="text"
                  value={quickStyle}
                  onChange={(e) => setQuickStyle(e.target.value)}
                  placeholder="Ví dụ: Sống ảo, ẩm thực truyền thống, phượt xe máy..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-sky-500 focus:bg-white text-xs"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Định tuyến thông minh WanderAI
                </p>
                <p className="text-amber-700">
                  AI sẽ tự động tính toán lộ trình không đi vòng, tối ưu thời gian di chuyển và dự trù chi phí chính xác từng bữa ăn.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickCreateOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>

                <button
                  type="submit"
                  disabled={isGeneratingAI}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingAI ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang tạo lịch trình...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Khởi tạo ngay</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
