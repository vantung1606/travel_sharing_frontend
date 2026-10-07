import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../components/common/Toast';
import { ItineraryDetailModal } from '../../../components/itinerary/ItineraryDetailModal';
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
  Plus,
  Compass,
  CheckCircle2,
  Heart,
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
  AlertCircle,
  Filter,
  Navigation,
  Bookmark,
  ChevronDown
} from 'lucide-react';

export const ItineraryManagerPage = () => {
  const {
    itineraries,
    setItineraries,
    setIsAIGeneratorOpen,
    isLoggedIn,
    setIsAuthModalOpen,
    setAuthMode
  } = useApp();
  const toast = useToast();

  // Guard helper for unauthenticated guest actions
  const requireAuth = (actionName = 'thực hiện thao tác này') => {
    if (!isLoggedIn) {
      toast.showInfo(`Vui lòng đăng nhập để ${actionName}!`);
      setAuthMode('login');
      setIsAuthModalOpen(true);
      return false;
    }
    return true;
  };

  // Navigation & Filter States
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'completed' | 'drafts' | 'cancelled'
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('nearest'); // 'nearest' | 'newest' | 'budget_low' | 'duration'
  const [activeFilterTag, setActiveFilterTag] = useState('all'); // 'all' | 'ai' | 'group' | 'family'

  // Selected Itinerary for Detail Modal
  const [selectedItinerary, setSelectedItinerary] = useState(null);

  // Manual Trip Creator Modal State
  const [isManualCreateOpen, setIsManualCreateOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualDest, setManualDest] = useState('');
  const [manualRegion, setManualRegion] = useState('Tây Nguyên');
  const [manualStartDate, setManualStartDate] = useState('');
  const [manualEndDate, setManualEndDate] = useState('');
  const [manualDays, setManualDays] = useState(3);
  const [manualGroup, setManualGroup] = useState('Nhóm bạn (3-5 người)');
  const [manualBudget, setManualBudget] = useState(5000000);
  const [manualCover, setManualCover] = useState('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80');
  const [manualPlaces, setManualPlaces] = useState('');
  const [manualNote, setManualNote] = useState('');

  const COVER_PRESETS = [
    { label: 'Đà Lạt Săn Mây', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Đà Nẵng Biển Xanh', url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Phú Quốc Hoàng Hôn', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Hà Giang Hùng Vĩ', url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Ninh Bình Non Nước', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Sa Pa Ruộng Bậc Thang', url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80' }
  ];

  // Filter and Sort Logic
  const filteredItineraries = useMemo(() => {
    return (itineraries || []).filter(itin => {
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
    const list = itineraries || [];
    return {
      upcoming: list.filter(i => i.status === 'upcoming').length,
      completed: list.filter(i => i.status === 'completed').length,
      drafts: list.filter(i => i.status === 'drafts').length,
      cancelled: list.filter(i => i.status === 'cancelled').length
    };
  }, [itineraries]);

  // Handle Share
  const handleShareItinerary = (itin, e) => {
    e.stopPropagation();
    if (!requireAuth('chia sẻ lịch trình')) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + `/itineraries?id=${itin.id}`);
      toast.showSuccess(`Đã sao chép liên kết chia sẻ: "${itin.title}"`);
    } else {
      toast.showInfo('Đã tạo liên kết chia sẻ nhóm thành công!');
    }
  };

  // Handle Delete Trip
  const handleDeleteItinerary = (itinId, itinTitle, e) => {
    e.stopPropagation();
    if (!requireAuth('xóa lịch trình')) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa lịch trình "${itinTitle}" không?`)) {
      setItineraries(prev => prev.filter(item => item.id !== itinId));
      toast.showSuccess(`Đã xóa chuyến đi "${itinTitle}" thành công.`);
    }
  };

  // Handle Manual Trip Creation
  const handleCreateManualTrip = (e) => {
    e.preventDefault();
    if (!requireAuth('tạo chuyến đi mới')) return;
    if (!manualTitle.trim() || !manualDest.trim()) {
      toast.showWarning('Vui lòng nhập tên chuyến đi và điểm đến chính!');
      return;
    }

    const calculatedDays = Number(manualDays) || 3;
    const places = manualPlaces.trim()
      ? manualPlaces.split(',').map(p => p.trim()).filter(Boolean)
      : [manualDest + ' City Tour', 'Điểm Check-in Đặc Sắc', 'Khu Ẩm Thực Bản Địa'];

    const newTrip = {
      id: `itin-${Date.now()}`,
      title: manualTitle.trim(),
      destination: manualDest.trim(),
      region: manualRegion,
      coverImage: manualCover,
      duration: `${calculatedDays}N${Math.max(1, calculatedDays - 1)}Đ`,
      daysCount: calculatedDays,
      status: 'upcoming',
      isAiGenerated: false,
      countdown: manualStartDate ? `Khởi hành ${manualStartDate.split('-').reverse().join('/')}` : 'Sắp khởi hành',
      departureDate: manualStartDate && manualEndDate
        ? `${manualStartDate.split('-').reverse().join('/')} – ${manualEndDate.split('-').reverse().join('/')}`
        : 'Khởi hành trong tháng tới',
      groupType: manualGroup,
      placesCount: places.length,
      placesList: places,
      budgetPerPerson: Math.round(Number(manualBudget) / (manualGroup.includes('Nhóm') ? 4 : manualGroup.includes('Cặp đôi') ? 2 : 1)),
      totalBudget: Number(manualBudget),
      budgetProgress: 25,
      budgetNote: `Ngân sách tự lập: ${Number(manualBudget).toLocaleString('vi-VN')}đ`,
      pace: 'Tự do',
      style: 'Lịch trình tự thiết kế',
      aiTipNote: manualNote || 'Lịch trình thủ công do bạn tự tạo và quản lý trên Wayfare.',
      days: Array.from({ length: calculatedDays }).map((_, i) => ({
        dayNumber: i + 1,
        title: `Ngày ${i + 1}: Kế hoạch khám phá ${manualDest}`,
        activities: [
          { time: '08:30', title: `Bắt đầu hoạt động ngày ${i + 1}`, note: 'Điểm dừng chân tự do', cost: 'Tùy chi tiêu' },
          { time: '11:30', title: `Ăn trưa & Thưởng thức ẩm thực địa phương`, note: 'Ghé quán ngon gần điểm đến', cost: '150.000đ' },
          { time: '14:30', title: `Khám phá & tham quan trải nghiệm`, note: 'Tự do trải nghiệm và chụp ảnh', cost: 'Tùy chi tiêu' },
          { time: '18:30', title: `Ăn tối và dạo phố đêm`, note: 'Thư giãn ngắm cảnh về đêm', cost: 'Tùy chi tiêu' }
        ]
      }))
    };

    setItineraries(prev => [newTrip, ...prev]);
    setIsManualCreateOpen(false);
    setSelectedItinerary(newTrip);
    toast.showSuccess(`Đã tạo thành công chuyến đi mới: ${newTrip.title}! 🎉`);

    setManualTitle('');
    setManualDest('');
    setManualPlaces('');
    setManualNote('');
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] text-slate-900 pb-24">
      {/* ─── 1. TOP AMBIENT HERO BANNER (UI/UX CONSISTENCY: px-4 sm:px-6 lg:px-8 xl:px-12) ─── */}
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-6 sm:pt-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white p-7 sm:p-10 lg:p-12 shadow-xl shadow-sky-950/20 border border-slate-800/80">
          {/* Ambient Glow Orbs */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

          {/* Breadcrumb Header */}
          <div className="relative z-10 flex items-center gap-2 text-xs font-semibold text-slate-400 mb-4">
            <span className="flex items-center gap-1.5 hover:text-sky-300 transition-colors cursor-pointer">
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span>Wayfare</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-sky-400 font-bold">Kế Hoạch & Lịch Trình</span>
          </div>

          {/* Hero Content & CTA Buttons */}
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 text-xs font-bold shadow-inner">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Trợ lý WanderAI Trip Engine • Tối ưu 63 tỉnh thành</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Lịch Trình Của Bạn
              </h1>
              
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
                Quản lý các chuyến đi sắp tới, đồng bộ điểm dừng chân từ Khám phá, kiểm soát ngân sách chi tiêu và kiến tạo hành trình trọn vẹn trong tích tắc cùng AI.
              </p>
            </div>

            {/* Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5">
              {/* AI Generator CTA */}
              <button
                type="button"
                onClick={() => {
                  if (!requireAuth('lập lịch trình bằng AI')) return;
                  setIsAIGeneratorOpen(true);
                }}
                className="group relative inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-sm font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-200 group-hover:rotate-12 transition-transform duration-300" />
                <span>Lập Tour Bằng AI (30s) ✨</span>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              </button>

              {/* Manual Trip CTA */}
              <button
                type="button"
                onClick={() => {
                  if (!requireAuth('tạo chuyến đi mới')) return;
                  setIsManualCreateOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/15 backdrop-blur-md text-sm font-bold shadow-sm hover:border-white/30 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-sky-400" />
                <span>Tạo Thủ Công</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. GUEST RESTRICTION BANNER (NẾU CHƯA ĐĂNG NHẬP) ────────────────────── */}
      {!isLoggedIn && (
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-6">
          <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border border-sky-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-600/20">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Chế độ khách: Xem lịch trình mẫu
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-0.5">
                  Đăng nhập tài khoản để tự do chỉnh sửa lịch trình, liên kết điểm tham quan và đồng bộ kế hoạch du lịch trên mọi thiết bị.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setIsAuthModalOpen(true);
              }}
              className="shrink-0 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-extrabold shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      )}

      {/* ─── 3. STATS KPI DASHBOARD (4 METRIC CARDS) ─────────────────────────── */}
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Tổng số chuyến */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-sky-300 transition-all flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Compass className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Chuyến Đi</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {(itineraries || []).length}
                </span>
                <span className="text-xs text-slate-500 font-medium">chuyến đã tạo</span>
              </div>
            </div>
          </div>

          {/* Card 2: Điểm đến đã lên kế hoạch */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-sky-300 transition-all flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <MapPin className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Điểm Dừng Chân</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {(itineraries || []).reduce((acc, curr) => acc + (curr.placesCount || (curr.placesList ? curr.placesList.length : 3)), 0)}
                </span>
                <span className="text-xs text-slate-500 font-medium">địa danh kết nối</span>
              </div>
            </div>
          </div>

          {/* Card 3: Ngân sách ước tính */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-sky-300 transition-all flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ngân Sách Tích Lũy</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl sm:text-2xl font-extrabold text-sky-700">
                  {((itineraries || []).reduce((acc, curr) => acc + (curr.totalBudget || (curr.budgetPerPerson ? curr.budgetPerPerson * 2 : 4000000)), 0) / 1000000).toFixed(1)}M
                </span>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700">
                  Tối ưu chi phí
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Hành trình gần nhất */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-2xl p-5 sm:p-6 border border-amber-200 shadow-xs hover:shadow-md transition-all flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Clock className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Kế Hoạch Sắp Tới</p>
              <p className="text-base sm:text-lg font-extrabold text-slate-900 truncate mt-0.5">
                {(itineraries && itineraries[0]) ? itineraries[0].destination : 'Sắp khởi hành'}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {(itineraries && itineraries[0]) ? (itineraries[0].duration || '3N2Đ') : 'Chưa có lịch'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4. FILTER WORKSPACE & TABS TOOLBAR ─────────────────────────────────── */}
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-6">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
          
          {/* Row 1: Segmented Tabs & Grid/List switcher */}
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
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
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

            {/* Layout Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-end sm:self-auto shrink-0">
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

          {/* Row 2: Search Input, Sorting & Filter Chips */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
            {/* Search Box */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm chuyến đi theo tên, thành phố, điểm check-in..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/10 transition-all font-medium"
              />
            </div>

            {/* Sort Select */}
            <div className="md:col-span-3">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:border-sky-500 focus:bg-white cursor-pointer"
              >
                <option value="nearest">Sắp xếp: Khởi hành gần nhất</option>
                <option value="newest">Sắp xếp: Mới tạo gần đây</option>
                <option value="budget_low">Sắp xếp: Ngân sách tiết kiệm</option>
                <option value="duration">Sắp xếp: Số ngày dài nhất</option>
              </select>
            </div>

            {/* Filter Tags */}
            <div className="md:col-span-4 flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 md:justify-end">
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
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
      </div>

      {/* ─── 5. ITINERARIES GRID / LIST CONTAINER ──────────────────────────────── */}
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-6">
        {filteredItineraries.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-slate-200/80 shadow-sm space-y-5">
            <div className="w-20 h-20 rounded-3xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto shadow-inner">
              <Compass className="w-10 h-10 animate-spin-slow" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-slate-900">
                Chưa có chuyến đi nào phù hợp
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Bạn chưa có lịch trình nào trong mục này. Hãy thử thay đổi bộ lọc hoặc để WanderAI tự động lập kế hoạch hoàn hảo chỉ trong 30 giây!
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!requireAuth('tạo lịch trình bằng AI')) return;
                  setIsAIGeneratorOpen(true);
                }}
                className="px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-sky-600/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Khởi Tạo Bằng AI ✨</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!requireAuth('tạo chuyến đi thủ công')) return;
                  setIsManualCreateOpen(true);
                }}
                className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
              >
                + Tự Lập Lịch Trình
              </button>
            </div>
          </div>
        ) : (
          /* Grid / List Cards */
          <div className={`grid gap-6 sm:gap-7 ${layoutMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredItineraries.map((itin) => {
              return (
                <div
                  key={itin.id}
                  onClick={() => setSelectedItinerary(itin)}
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col hover:-translate-y-1.5 cursor-pointer relative"
                >
                  {/* Photo Cover Header */}
                  <div className="relative h-60 w-full overflow-hidden bg-slate-100">
                    <img
                      src={itin.coverImage || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80'}
                      alt={itin.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent"></div>

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 flex-wrap">
                      {itin.countdown && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 text-white text-[11px] font-bold shadow-sm backdrop-blur-md border border-white/10">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          {itin.countdown}
                        </span>
                      )}

                      {itin.isAiGenerated && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white text-[11px] font-bold backdrop-blur-md shadow-sm border border-amber-300/30">
                          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                          <span>WanderAI ✨</span>
                        </span>
                      )}
                    </div>

                    {/* Destination & Days Floating on Image Bottom */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                      <div className="min-w-0 pr-2">
                        <p className="text-[10px] font-extrabold text-sky-300 uppercase tracking-wider">
                          {itin.region || 'Điểm Đến Việt Nam'}
                        </p>
                        <div className="flex items-center gap-1.5 font-extrabold text-sm sm:text-base drop-shadow-sm truncate">
                          <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                          <span className="truncate">{itin.destination}</span>
                        </div>
                      </div>
                      
                      <div className="shrink-0 px-3 py-1 rounded-xl bg-white/95 backdrop-blur-md text-sky-900 text-xs font-extrabold shadow-sm">
                        {itin.duration || `${itin.daysCount || 3}N${Math.max(1, (itin.daysCount || 3) - 1)}Đ`}
                      </div>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 sm:p-6 flex flex-col flex-1 space-y-4">
                    {/* Title */}
                    <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2 leading-snug">
                      {itin.title}
                    </h3>

                    {/* Schedule Metadata */}
                    <div className="space-y-2 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
                        <span className="font-semibold text-slate-700">{itin.departureDate || 'Ngày khởi hành linh hoạt'}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{itin.groupType || 'Cặp đôi / Bạn bè'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sky-700 font-bold text-xs">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{itin.placesCount || (itin.placesList ? itin.placesList.length : 3)} điểm dừng chân</span>
                        </div>
                      </div>
                    </div>

                    {/* Places Chips Preview */}
                    {itin.placesList && itin.placesList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {itin.placesList.slice(0, 3).map((place, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-semibold text-slate-600 border border-slate-200/50">
                            {place}
                          </span>
                        ))}
                        {itin.placesList.length > 3 && (
                          <span className="px-2 py-1 rounded-lg bg-sky-50 text-[11px] font-extrabold text-sky-700 border border-sky-100">
                            +{itin.placesList.length - 3} điểm nữa
                          </span>
                        )}
                      </div>
                    )}

                    {/* Budget Progress Bar */}
                    <div className="mt-auto pt-4 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Ngân sách dự kiến:</span>
                        <span className="font-extrabold text-sky-700 text-sm">
                          {itin.budgetPerPerson ? `${itin.budgetPerPerson.toLocaleString('vi-VN')}đ` : '3.500.000đ'}
                          <span className="font-normal text-[11px] text-slate-400 ml-1">/người</span>
                        </span>
                      </div>

                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full"
                          style={{ width: `${itin.budgetProgress || 45}%` }}
                        ></div>
                      </div>

                      {itin.budgetNote && (
                        <p className="text-[10px] text-slate-400 text-right truncate">{itin.budgetNote}</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedItinerary(itin)}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <span>Mở Lịch Trình</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleShareItinerary(itin, e)}
                        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                        title="Chia sẻ chuyến đi"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteItinerary(itin.id, itin.title, e)}
                        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                        title="Xóa lịch trình"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* AI Prompter Inspiration Card */}
            <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 flex flex-col justify-between shadow-md relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>

              <div className="space-y-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>

                <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                  Khám phá AI 1 chạm
                </div>

                <h3 className="font-display font-extrabold text-lg text-white leading-snug">
                  Chưa biết đi đâu? Hãy để WanderAI lên lịch giúp bạn!
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Trí tuệ nhân tạo tra cứu thực tế các địa danh, quán ăn bản địa của 63 tỉnh thành để tạo hành trình từng giờ tối ưu ngân sách.
                </p>

                {/* Quick Suggestion Pills */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!requireAuth('lập lịch trình bằng AI')) return;
                      setIsAIGeneratorOpen(true);
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-slate-200 flex items-center justify-between transition-colors cursor-pointer backdrop-blur-sm"
                  >
                    <span>🏖️ Đà Nẵng - Hội An 3N2Đ &lt; 4.5M</span>
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!requireAuth('lập lịch trình bằng AI')) return;
                      setIsAIGeneratorOpen(true);
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-slate-200 flex items-center justify-between transition-colors cursor-pointer backdrop-blur-sm"
                  >
                    <span>🏔️ Phượt Hà Giang Mùa Tam Giác Mạch</span>
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!requireAuth('lập lịch trình bằng AI')) return;
                  setIsAIGeneratorOpen(true);
                }}
                className="mt-6 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-extrabold shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 relative z-10"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Khởi Tạo Lịch Trình Ngay</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── 6. INTERACTIVE ITINERARY DETAIL MODAL (M10 MODAL) ───────────────────── */}
      {selectedItinerary && (
        <ItineraryDetailModal
          itinerary={selectedItinerary}
          onClose={() => setSelectedItinerary(null)}
        />
      )}

      {/* ─── 7. MODAL TẠO CHUYẾN ĐI THỦ CÔNG (LUXURY POPUP) ─────────────────────── */}
      {isManualCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/80">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/20">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-lg text-slate-900">
                    Tạo Chuyến Đi Mới
                  </h3>
                  <p className="text-xs text-slate-500">Tự do lên kế hoạch, điểm dừng chân và dự toán ngân sách</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsManualCreateOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateManualTrip} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">
              
              {/* Trip Title */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <span>Tên chuyến đi / Tiêu đề hành trình</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="Ví dụ: Nghỉ dưỡng biển Mỹ Khê 3N2Đ, Phượt săn mây Đà Lạt..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
                />
              </div>

              {/* Destination & Region */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-sky-600" />
                    <span>Điểm đến chính</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={manualDest}
                    onChange={(e) => setManualDest(e.target.value)}
                    placeholder="Ví dụ: Đà Nẵng, Hà Giang, Phú Quốc..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <Compass className="w-4 h-4 text-indigo-600" />
                    <span>Khu vực</span>
                  </label>
                  <select
                    value={manualRegion}
                    onChange={(e) => setManualRegion(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium outline-none focus:bg-white focus:border-sky-500 cursor-pointer"
                  >
                    <option value="Miền Trung">Miền Trung di sản</option>
                    <option value="Tây Nguyên">Tây Nguyên đại ngàn</option>
                    <option value="Miền Bắc">Miền Bắc & Vòng cung Tây Bắc</option>
                    <option value="Miền Nam">Miền Nam & Đảo ngọc</option>
                  </select>
                </div>
              </div>

              {/* Dates & Number of Days */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Ngày khởi hành</label>
                  <input
                    type="date"
                    value={manualStartDate}
                    onChange={(e) => setManualStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium outline-none focus:bg-white focus:border-sky-500 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={manualEndDate}
                    onChange={(e) => setManualEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium outline-none focus:bg-white focus:border-sky-500 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Số ngày đi</label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={manualDays}
                    onChange={(e) => setManualDays(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium outline-none focus:bg-white focus:border-sky-500 text-xs"
                  />
                </div>
              </div>

              {/* Group Type & Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>Hình thức nhóm</span>
                  </label>
                  <select
                    value={manualGroup}
                    onChange={(e) => setManualGroup(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium outline-none focus:bg-white focus:border-sky-500 cursor-pointer"
                  >
                    <option value="Cá nhân (Solo traveler)">Cá nhân (Solo traveler)</option>
                    <option value="Cặp đôi (2 người)">Cặp đôi (2 người)</option>
                    <option value="Nhóm bạn (3-5 người)">Nhóm bạn (3-5 người)</option>
                    <option value="Gia đình có trẻ em">Gia đình có trẻ em</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-sky-600" />
                    <span>Dự toán ngân sách (VNĐ)</span>
                  </label>
                  <input
                    type="number"
                    step="500000"
                    value={manualBudget}
                    onChange={(e) => setManualBudget(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Waypoint Places (Danh sách điểm dừng chân) */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>Điểm dừng chân dự kiến (ngăn cách bằng dấu phẩy)</span>
                </label>
                <input
                  type="text"
                  value={manualPlaces}
                  onChange={(e) => setManualPlaces(e.target.value)}
                  placeholder="Ví dụ: Bãi biển Mỹ Khê, Chùa Linh Ứng, Phố cổ Hội An, Bán đảo Sơn Trà..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              {/* Cover Photo Presets */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">Chọn ảnh bìa đại diện</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {COVER_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setManualCover(preset.url)}
                      className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        manualCover === preset.url ? 'border-sky-600 ring-2 ring-sky-600/20 scale-95' : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-950/40 flex items-end p-1">
                        <span className="text-[9px] text-white font-bold truncate leading-tight">{preset.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsManualCreateOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-sky-600/20 transition-all cursor-pointer active:scale-95"
                >
                  Tạo Chuyến Đi Ngay 🎉
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
