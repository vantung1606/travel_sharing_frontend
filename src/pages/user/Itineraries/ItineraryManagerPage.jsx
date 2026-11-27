import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../components/common/Toast';
import { itineraryApi, uploadApi } from '../../../services/api';
import { ItineraryDetailModal } from '../../../components/itinerary/ItineraryDetailModal';
import { ItineraryExportModal } from '../../../components/itinerary/ItineraryExportModal';
import { EditItineraryModal } from '../../../components/itinerary/EditItineraryModal';
import { computeItineraryStatus } from '../../../utils/itineraryUtils';
import { MapPin, Calendar, Clock, DollarSign, Users, Search, SlidersHorizontal, ChevronRight, Share2, Plus, Compass, X, ArrowRight, Layers, Trash2, Check, Filter, Navigation, Download, Upload, Camera, Globe, Lock, Edit3, Sparkles } from 'lucide-react';

export const ItineraryManagerPage = () => {
  const {
    currentUser,
    itineraries,
    setItineraries,
    setIsAIGeneratorOpen,
    isLoggedIn,
    setIsAuthModalOpen,
    setAuthMode,
    activeViewingItinerary,
    setActiveViewingItinerary,
    aiGeneratingStatus,
    setAiGeneratingStatus,
    fetchItineraries,
    createManualItinerary,
    deleteItineraryFromBackend,
    toggleItineraryVisibility
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
  const [exportModalItinerary, setExportModalItinerary] = useState(null);
  const [editingItinerary, setEditingItinerary] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const lastOpenedItineraryIdRef = useRef(null);

  const handleOpenItineraryDetail = useCallback((targetItinId) => {
    if (!targetItinId) return;
    const found = itineraries.find(i => String(i.id) === String(targetItinId));
    if (found) {
      setSelectedItinerary(found);
    } else {
      itineraryApi.getItineraryById(targetItinId)
        .then(data => {
          if (data) setSelectedItinerary(data);
        })
        .catch(err => console.warn('Could not fetch target itinerary deep link:', err));
    }
  }, [itineraries]);

  useEffect(() => {
    const onOpenItinEvent = (e) => {
      if (e.detail?.itineraryId) {
        handleOpenItineraryDetail(e.detail.itineraryId);
      }
    };
    window.addEventListener('wayfare_open_itinerary', onOpenItinEvent);
    return () => window.removeEventListener('wayfare_open_itinerary', onOpenItinEvent);
  }, [handleOpenItineraryDetail]);

  useEffect(() => {
    const targetId = searchParams.get('itineraryId') || searchParams.get('id');
    if (targetId) {
      if (lastOpenedItineraryIdRef.current === targetId && selectedItinerary?.id === Number(targetId)) {
        return;
      }
      lastOpenedItineraryIdRef.current = targetId;
      handleOpenItineraryDetail(targetId);
    }
  }, [searchParams, handleOpenItineraryDetail, selectedItinerary?.id]);

  // Đồng bộ danh sách lịch trình mới nhất từ Backend mỗi khi vào trang kho lịch trình
  useEffect(() => {
    if (isLoggedIn) {
      fetchItineraries();
    }
  }, [isLoggedIn, fetchItineraries]);

  // Tự động mở xem chi tiết lịch trình khi WanderAI vừa khởi tạo xong
  useEffect(() => {
    if (activeViewingItinerary) {
      setSelectedItinerary(activeViewingItinerary);
      setActiveViewingItinerary(null);
    }
  }, [activeViewingItinerary, setActiveViewingItinerary]);

  // Manual Trip Creator Modal State
  const defaultManualStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  }, []);

  const defaultManualEnd = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  }, []);

  const [isManualCreateOpen, setIsManualCreateOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualDest, setManualDest] = useState('');
  const [manualStartDate, setManualStartDate] = useState(defaultManualStart);
  const [manualEndDate, setManualEndDate] = useState(defaultManualEnd);
  const [manualGroup, setManualGroup] = useState('Cá nhân');
  const [manualBudget, setManualBudget] = useState(5000000);
  const [manualBudgetFormatted, setManualBudgetFormatted] = useState('5,000,000');
  const [manualCover, setManualCover] = useState('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80');
  const [manualNote, setManualNote] = useState('');
  const [manualIsPublic, setManualIsPublic] = useState(true);
  const [manualTravelStyle, setManualTravelStyle] = useState('Nghỉ dưỡng & Khám phá');

  // Tự động tính toán số ngày giữa ngày bắt đầu và kết thúc
  const manualDaysCount = useMemo(() => {
    if (!manualStartDate || !manualEndDate) return 1;
    const s = new Date(manualStartDate);
    const e = new Date(manualEndDate);
    const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diff);
  }, [manualStartDate, manualEndDate]);

  // Lịch trình chi tiết từng ngày do người dùng tự thiết kế (hoàn toàn không điền sẵn dữ liệu ảo)
  const [manualDaysSchedule, setManualDaysSchedule] = useState([]);

  // Đồng bộ số ngày khi ngày bắt đầu hoặc kết thúc thay đổi
  useEffect(() => {
    setManualDaysSchedule(prev => {
      const next = [];
      for (let i = 0; i < manualDaysCount; i++) {
        const existing = prev[i];
        if (existing) {
          next.push(existing);
        } else {
          next.push({
            dayNumber: i + 1,
            title: '',
            activities: []
          });
        }
      }
      return next;
    });
  }, [manualDaysCount]);

  const handleAddActivityToDay = (dayIndex) => {
    setManualDaysSchedule(prev => {
      const copy = [...prev];
      const day = copy[dayIndex] || { dayNumber: dayIndex + 1, title: '', activities: [] };
      const currentActs = day.activities || [];
      const newAct = {
        id: Date.now() + Math.random(),
        time: '',
        title: '',
        note: '',
        cost: '',
        location: ''
      };
      copy[dayIndex] = {
        ...day,
        activities: [...currentActs, newAct]
      };
      return copy;
    });
  };

  const handleUpdateActivityField = (dayIndex, actIndex, field, value) => {
    setManualDaysSchedule(prev => {
      const copy = [...prev];
      const day = copy[dayIndex];
      if (!day) return prev;
      const acts = [...(day.activities || [])];
      acts[actIndex] = {
        ...acts[actIndex],
        [field]: value
      };
      copy[dayIndex] = { ...day, activities: acts };
      return copy;
    });
  };

  const handleRemoveActivityFromDay = (dayIndex, actIndex) => {
    setManualDaysSchedule(prev => {
      const copy = [...prev];
      const day = copy[dayIndex];
      if (!day) return prev;
      const acts = (day.activities || []).filter((_, idx) => idx !== actIndex);
      copy[dayIndex] = { ...day, activities: acts };
      return copy;
    });
  };

  const handleUpdateDayTitle = (dayIndex, title) => {
    setManualDaysSchedule(prev => {
      const copy = [...prev];
      if (copy[dayIndex]) {
        copy[dayIndex] = { ...copy[dayIndex], title };
      }
      return copy;
    });
  };

  const handleManualBudgetChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setManualBudgetFormatted(raw ? Number(raw).toLocaleString('en-US') : '');
    setManualBudget(raw ? Number(raw) : 0);
  };

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
      const { statusKey } = computeItineraryStatus(itin);

      // Tab matching: Chuyến đi sắp tới bao gồm cả chuyến đi tương lai và đang diễn ra
      if (activeTab === 'upcoming' && statusKey !== 'upcoming' && statusKey !== 'ongoing') return false;
      if (activeTab === 'completed' && statusKey !== 'completed') return false;
      if (activeTab === 'drafts' && statusKey !== 'drafts') return false;
      if (activeTab === 'cancelled' && statusKey !== 'cancelled') return false;

      // Filter tag
      if (activeFilterTag === 'ai' && !itin.isAiGenerated) return false;
      const groupLower = (itin.groupType || '').toLowerCase();
      if (activeFilterTag === 'group' && !groupLower.includes('nhóm') && !groupLower.includes('bạn bè')) return false;
      if (activeFilterTag === 'family' && !groupLower.includes('gia đình')) return false;

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
        return (a.budgetPerPerson || a.totalBudget || 0) - (b.budgetPerPerson || b.totalBudget || 0);
      }
      if (sortOption === 'duration') {
        return (b.daysCount || 0) - (a.daysCount || 0);
      }
      if (sortOption === 'nearest') {
        const tA = a.startDate ? new Date(a.startDate).getTime() : Number.MAX_SAFE_INTEGER;
        const tB = b.startDate ? new Date(b.startDate).getTime() : Number.MAX_SAFE_INTEGER;
        return tA - tB;
      }
      if (sortOption === 'newest') {
        const cA = a.createdAt ? new Date(a.createdAt).getTime() : Number(a.id) || 0;
        const cB = b.createdAt ? new Date(b.createdAt).getTime() : Number(b.id) || 0;
        return cB - cA;
      }
      return 0;
    });
  }, [itineraries, activeTab, activeFilterTag, searchQuery, sortOption]);

  const nextUpcomingTrip = useMemo(() => {
    const candidates = (itineraries || []).filter((i) => {
      const { statusKey } = computeItineraryStatus(i);
      return statusKey === 'upcoming' || statusKey === 'ongoing';
    });
    if (candidates.length === 0) return null;
    return [...candidates].sort((a, b) => {
      const tA = a.startDate ? new Date(a.startDate).getTime() : Number.MAX_SAFE_INTEGER;
      const tB = b.startDate ? new Date(b.startDate).getTime() : Number.MAX_SAFE_INTEGER;
      return tA - tB;
    })[0];
  }, [itineraries]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const list = itineraries || [];
    let upcomingCount = 0;
    let completedCount = 0;
    let draftsCount = 0;
    let cancelledCount = 0;

    list.forEach(i => {
      const { statusKey } = computeItineraryStatus(i);
      if (statusKey === 'completed') completedCount++;
      else if (statusKey === 'upcoming' || statusKey === 'ongoing') upcomingCount++;
      else if (statusKey === 'drafts') draftsCount++;
      else if (statusKey === 'cancelled') cancelledCount++;
    });

    return {
      upcoming: upcomingCount,
      completed: completedCount,
      drafts: draftsCount,
      cancelled: cancelledCount
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
  const handleDeleteItinerary = async (itinId, itinTitle, e) => {
    e.stopPropagation();
    if (!requireAuth('xóa lịch trình')) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa lịch trình "${itinTitle}" không?`)) {
      if (deleteItineraryFromBackend) {
        await deleteItineraryFromBackend(itinId);
      } else {
        setItineraries(prev => prev.filter(item => item.id !== itinId));
      }
      toast.showSuccess(`Đã xóa chuyến đi "${itinTitle}" thành công.`);
    }
  };

  // Handle Manual Trip Creation
  const handleCreateManualTrip = async (e) => {
    e.preventDefault();
    if (!requireAuth('tạo chuyến đi mới')) return;
    if (!manualTitle.trim() || !manualDest.trim()) {
      toast.showWarning('Vui lòng nhập tên chuyến đi và điểm đến chính!');
      return;
    }

    const calculatedDays = manualDaysCount;

    // Lấy chính xác dữ liệu do người dùng tự điền, tuyệt đối KHÔNG tự động chèn hoạt động ảo/giả
    const finalDays = manualDaysSchedule.slice(0, calculatedDays).map((d, i) => ({
      dayNumber: i + 1,
      title: d.title?.trim() || `Ngày ${i + 1}: Kế hoạch tại ${manualDest.trim()}`,
      activities: (d.activities || [])
        .filter(act => act.title && act.title.trim())
        .map(act => ({
          time: act.time?.trim() || '08:00',
          title: act.title.trim(),
          location: act.location?.trim() || act.title.trim(),
          address: act.location?.trim() ? `${act.location.trim()}, ${manualDest.trim()}` : `${manualDest.trim()}, Việt Nam`,
          note: act.note?.trim() || '',
          cost: act.cost?.trim() || 'Theo chi tiêu',
          category: 'Tự lên kế hoạch'
        }))
    }));

    const totalPlaces = finalDays.reduce((acc, d) => acc + d.activities.length, 0);
    const placesList = finalDays.flatMap(d => d.activities.map(a => a.location || a.title)).filter(Boolean);

    const newTrip = {
      id: `itin-${Date.now()}`,
      title: manualTitle.trim(),
      destination: manualDest.trim(),
      startDate: manualStartDate,
      endDate: manualEndDate,
      coverImage: manualCover,
      duration: `${calculatedDays}N${Math.max(1, calculatedDays - 1)}Đ`,
      daysCount: calculatedDays,
      status: 'upcoming',
      isAiGenerated: false,
      isPublic: manualIsPublic,
      countdown: manualStartDate ? `Khởi hành ${manualStartDate.split('-').reverse().join('/')}` : 'Sắp khởi hành',
      departureDate: `${manualStartDate.split('-').reverse().join('/')} – ${manualEndDate.split('-').reverse().join('/')}`,
      groupType: manualGroup,
      placesCount: totalPlaces,
      placesList: placesList.length > 0 ? placesList : [manualDest.trim()],
      budgetPerPerson: Math.round(Number(manualBudget) / 2),
      totalBudget: Number(manualBudget),
      budgetProgress: 0,
      budgetNote: `Dự toán: ~${Number(manualBudget).toLocaleString('vi-VN')}đ`,
      style: manualTravelStyle,
      travelStyle: manualTravelStyle,
      aiTipNote: manualNote || 'Lịch trình thủ công do bạn tự tạo và quản lý trên Wayfare.',
      days: finalDays
    };

    setIsManualCreateOpen(false);
    setSelectedItinerary(newTrip);
    toast.showSuccess(`Đã tạo thành công chuyến đi mới: ${newTrip.title}! 🎉`);

    setManualTitle('');
    setManualDest('');
    setManualNote('');
    setManualDaysSchedule([]);

    // Persist to MySQL backend database
    if (createManualItinerary) {
      const persisted = await createManualItinerary(newTrip);
      if (persisted && persisted.id) {
        setSelectedItinerary(persisted);
      }
    } else {
      setItineraries(prev => [newTrip, ...prev]);
    }
  };

  return (
    <div className="itinerary-page w-full min-h-screen bg-[#F8F4EC] text-slate-900 pb-20">
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-6 space-y-5">

        {/* ─── 1. HEADER GỌN GÀNG: TIÊU ĐỀ + 2 NÚT TẠO ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Lịch trình của tôi
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {(itineraries || []).length} chuyến đi
              {nextUpcomingTrip ? ` · Sắp khởi hành: ${nextUpcomingTrip.destination}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (!requireAuth('lập lịch trình bằng AI')) return;
                setIsAIGeneratorOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-clay-600 hover:bg-clay-700 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>Tạo bằng AI</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!requireAuth('tạo chuyến đi mới')) return;
                setIsManualCreateOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm transition-colors border border-slate-300 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo thủ công</span>
            </button>
          </div>
        </div>

        {/* Guest Banner */}
        {!isLoggedIn && (
          <div className="bg-white border border-slate-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <p className="text-xs sm:text-sm text-slate-600">
              Đăng nhập để tạo, chỉnh sửa và đồng bộ lịch trình của bạn trên mọi thiết bị.
            </p>
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setIsAuthModalOpen(true);
              }}
              className="shrink-0 px-4 py-2 rounded-lg bg-clay-600 hover:bg-clay-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Đăng nhập
            </button>
          </div>
        )}

        {/* ─── 2. THANH LỌC & TÌM KIẾM 1 HÀNG GỌN ─── */}
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-300/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {[
              { id: 'upcoming', label: 'Sắp tới', count: tabCounts.upcoming },
              { id: 'completed', label: 'Hoàn thành', count: tabCounts.completed },
              { id: 'drafts', label: 'Bản nháp', count: tabCounts.drafts },
              { id: 'cancelled', label: 'Đã hủy', count: tabCounts.cancelled }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer border ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[11px] font-bold ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 lg:w-[460px] shrink-0">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên, điểm đến..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-clay-600 focus:bg-white transition-colors"
              />
            </div>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:border-clay-600 focus:bg-white cursor-pointer"
            >
              <option value="nearest">Khởi hành gần nhất</option>
              <option value="newest">Mới tạo gần đây</option>
              <option value="budget_low">Ngân sách thấp nhất</option>
              <option value="duration">Nhiều ngày nhất</option>
            </select>
          </div>
        </div>

        {/* ─── 3. DANH SÁCH LỊCH TRÌNH (TRỌNG TÂM) ─── */}
        {filteredItineraries.length === 0 ? (
          <div className="bg-white rounded-xl p-10 sm:p-14 text-center border border-slate-300/90 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <Compass className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-display text-lg font-bold text-slate-900">
                Chưa có chuyến đi nào
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Tạo chuyến đi đầu tiên bằng AI hoặc tự lên lịch trình thủ công.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (!requireAuth('tạo lịch trình bằng AI')) return;
                  setIsAIGeneratorOpen(true);
                }}
                className="px-4 py-2 rounded-lg bg-clay-600 hover:bg-clay-700 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                Tạo bằng AI
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!requireAuth('tạo chuyến đi thủ công')) return;
                  setIsManualCreateOpen(true);
                }}
                className="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                + Tạo thủ công
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredItineraries.map((itin) => {
              const statusInfo = computeItineraryStatus(itin);
              const isCardOwner = Boolean(
                !currentUser ||
                (!itin.creatorEmail && itin.creatorId == null) ||
                (itin.creatorEmail && currentUser.email && itin.creatorEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
                (itin.creatorId != null && currentUser.id != null && String(itin.creatorId) === String(currentUser.id))
              );
              const displayBudget = Number(itin.totalBudget || 0) > 0
                ? `${Number(itin.totalBudget).toLocaleString('vi-VN')}đ`
                : (itin.budgetPerPerson ? `${Number(itin.budgetPerPerson).toLocaleString('vi-VN')}đ/người` : 'Chưa đặt ngân sách');

              return (
                <div
                  key={itin.id}
                  onClick={() => setSelectedItinerary(itin)}
                  className="group bg-white rounded-xl overflow-hidden border border-slate-300/90 shadow-sm hover:shadow-md hover:border-slate-400 transition-all duration-200 flex flex-col cursor-pointer"
                >
                  {/* Ảnh bìa gọn gàng */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100 border-b border-slate-200">
                    <img
                      src={itin.coverImage || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80'}
                      alt={itin.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                    {/* 2 nhãn tối giản góc trên */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                        statusInfo.statusKey === 'ongoing'
                          ? 'bg-blue-600 text-white'
                          : statusInfo.statusKey === 'completed'
                          ? 'bg-slate-800 text-slate-100'
                          : statusInfo.statusKey === 'cancelled'
                          ? 'bg-rose-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}>
                        {statusInfo.label}
                      </span>

                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        itin.isPublic !== false
                          ? 'bg-white/95 text-slate-800'
                          : 'bg-slate-900/85 text-amber-300'
                      }`}>
                        {itin.isPublic !== false ? <Globe className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3" />}
                        <span>{itin.isPublic !== false ? 'Công khai' : 'Riêng tư'}</span>
                      </span>
                    </div>

                    {/* Điểm đến & Thời lượng */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 text-white">
                      <div className="flex items-center gap-1.5 font-bold text-sm truncate">
                        <MapPin className="w-3.5 h-3.5 text-clay-300 shrink-0" />
                        <span className="truncate">{itin.destination}</span>
                      </div>
                      <span className="shrink-0 px-2.5 py-0.5 rounded-md bg-white/95 text-slate-900 text-xs font-extrabold">
                        {itin.duration || `${itin.daysCount || 1} ngày`}
                      </span>
                    </div>
                  </div>

                  {/* Nội dung thẻ */}
                  <div className="p-4 sm:p-5 flex flex-col flex-1 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-display font-bold text-base text-slate-900 group-hover:text-clay-700 transition-colors line-clamp-1">
                          {itin.title}
                        </h3>
                        {!isCardOwner && (
                          <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold shrink-0">
                            Được mời
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {itin.departureDate || 'Linh hoạt'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {itin.placesCount || (itin.placesList ? itin.placesList.length : 0)} điểm dừng
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Ngân sách dự kiến</span>
                      <span className="font-bold text-slate-900">{displayBudget}</span>
                    </div>

                    {/* Hành động */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedItinerary(itin)}
                        className="flex-1 py-2 px-3 rounded-lg bg-clay-600 hover:bg-clay-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                      >
                        <span>Mở lịch trình</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      {isCardOwner && (
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const nextPublic = !(itin.isPublic !== false);
                              await toggleItineraryVisibility(itin.id, nextPublic);
                              toast.showSuccess(nextPublic ? 'Đã bật chế độ CÔNG KHAI!' : 'Đã chuyển sang RIÊNG TƯ!');
                            } catch (err) {
                              toast.showError('Lỗi cập nhật hiển thị: ' + (err.message || 'Thất bại'));
                            }
                          }}
                          className="w-8 h-8 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                          title={itin.isPublic !== false ? 'Đang Công khai — bấm để chuyển Riêng tư' : 'Đang Riêng tư — bấm để Công khai'}
                        >
                          {itin.isPublic !== false ? <Globe className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-amber-600" />}
                        </button>
                      )}

                      {isCardOwner && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingItinerary(itin);
                          }}
                          className="w-8 h-8 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="Chỉnh sửa thông tin chuyến đi"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExportModalItinerary(itin);
                        }}
                        className="w-8 h-8 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                        title="Tải lịch trình (PDF, Lịch, In ấn)"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleShareItinerary(itin, e)}
                        className="w-8 h-8 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                        title="Chia sẻ chuyến đi"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      {isCardOwner && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteItinerary(itin.id, itin.title, e)}
                          className="w-8 h-8 rounded-lg border border-slate-300 bg-white hover:bg-rose-50 hover:border-rose-300 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="Xóa lịch trình"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── 6. INTERACTIVE ITINERARY DETAIL MODAL (M10 MODAL) ───────────────────── */}
      {selectedItinerary && (
        <ItineraryDetailModal
          itinerary={selectedItinerary}
          onClose={() => {
            setSelectedItinerary(null);
            lastOpenedItineraryIdRef.current = null;
            setSearchParams(prev => {
              const next = new URLSearchParams(prev);
              next.delete('itineraryId');
              next.delete('id');
              return next;
            }, { replace: true });
          }}
          onUpdate={(updatedItin) => {
            setSelectedItinerary(updatedItin);
            setItineraries(prev => prev.map(item => String(item.id) === String(updatedItin.id) ? updatedItin : item));
          }}
        />
      )}

      {/* Modal Xuất Lịch Trình (PDF, iCal, Print) Trực Tiếp */}
      {exportModalItinerary && (
        <ItineraryExportModal
          itinerary={exportModalItinerary}
          onClose={() => setExportModalItinerary(null)}
        />
      )}

      {/* ─── 7. MODAL TẠO CHUYẾN ĐI THỦ CÔNG (LUXURY POPUP) ─────────────────────── */}
      {isManualCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-[2px] overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#FFFDF8] rounded-sm max-w-2xl w-full border border-[#1E1A15]/15 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-[#1E1A15]/10 flex items-center justify-between shrink-0 bg-[#F8F4EC]">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-sm bg-clay-600 text-white flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-lg text-[#1E1A15]">
                    Tạo Chuyến Đi Mới
                  </h3>
                  <p className="text-xs text-[#7A6F60]">Tự do lên kế hoạch, điểm dừng chân và dự toán ngân sách</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsManualCreateOpen(false)}
                className="w-9 h-9 rounded-sm bg-[#E7DFD2] hover:bg-[#D9CFC0] text-[#5A5145] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateManualTrip} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">
              
              {/* Trip Title */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#3A332B] flex items-center gap-1">
                  <span>Tên chuyến đi / Tiêu đề hành trình</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="Ví dụ: Nghỉ dưỡng biển Mỹ Khê 3N2Đ, Phượt săn mây Đà Lạt..."
                  className="w-full px-4 py-2.5 rounded-sm border border-[#1E1A15]/12 bg-[#F8F4EC] text-[#1E1A15] font-medium outline-none focus:bg-[#FFFDF8] focus:border-clay-600 focus:ring-2 focus:ring-clay-600/15 transition-all"
                />
              </div>

              {/* Destination */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#3A332B] flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-clay-600" />
                  <span>Điểm đến chính</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={manualDest}
                  onChange={(e) => setManualDest(e.target.value)}
                  placeholder="Ví dụ: Đà Nẵng, Hà Giang, Phú Quốc, Sa Pa..."
                  className="w-full px-4 py-2.5 rounded-sm border border-[#1E1A15]/12 bg-[#F8F4EC] text-[#1E1A15] font-medium outline-none focus:bg-[#FFFDF8] focus:border-clay-600"
                />
              </div>

              {/* Dates & Auto-calculated Days */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#3A332B] flex items-center gap-1.5 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-clay-600" />
                    <span>Thời gian chuyến đi</span>
                  </label>
                  <div className="px-3 py-1 rounded-sm bg-clay-50 border border-clay-200 text-clay-800 font-bold text-xs">
                    {manualDaysCount} Ngày {manualDaysCount > 1 ? `(${manualDaysCount}N${manualDaysCount - 1}Đ)` : '(Đi về trong ngày)'}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-[#7A6F60] block">Ngày khởi hành</span>
                    <input
                      type="date"
                      required
                      value={manualStartDate}
                      onChange={(e) => {
                        setManualStartDate(e.target.value);
                        if (manualEndDate && new Date(e.target.value) > new Date(manualEndDate)) {
                          setManualEndDate(e.target.value);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-sm border border-[#1E1A15]/12 bg-[#F8F4EC] text-[#2A241D] font-medium outline-none focus:bg-[#FFFDF8] focus:border-clay-600 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-[#7A6F60] block">Ngày kết thúc</span>
                    <input
                      type="date"
                      required
                      min={manualStartDate}
                      value={manualEndDate}
                      onChange={(e) => {
                        if (manualStartDate && new Date(e.target.value) < new Date(manualStartDate)) {
                          setManualEndDate(manualStartDate);
                        } else {
                          setManualEndDate(e.target.value);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-sm border border-[#1E1A15]/12 bg-[#F8F4EC] text-[#2A241D] font-medium outline-none focus:bg-[#FFFDF8] focus:border-clay-600 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Group Type & Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#3A332B] flex items-center gap-1">
                    <Users className="w-4 h-4 text-clay-600" />
                    <span>Hình thức nhóm</span>
                  </label>
                  <select
                    value={manualGroup}
                    onChange={(e) => setManualGroup(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-sm border border-[#1E1A15]/12 bg-[#F8F4EC] text-[#1E1A15] font-medium outline-none focus:bg-[#FFFDF8] focus:border-clay-600 cursor-pointer"
                  >
                    <option value="Cá nhân">Cá nhân (Solo)</option>
                    <option value="Cặp đôi">Cặp đôi</option>
                    <option value="Nhóm bạn">Nhóm bạn</option>
                    <option value="Gia đình">Gia đình</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#3A332B] flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Phong cách du lịch</span>
                  </label>
                  <select
                    value={manualTravelStyle}
                    onChange={(e) => setManualTravelStyle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-sm border border-[#1E1A15]/12 bg-[#F8F4EC] text-[#1E1A15] font-medium outline-none focus:bg-[#FFFDF8] focus:border-clay-600 cursor-pointer"
                  >
                    <option value="Nghỉ dưỡng & Khám phá">Nghỉ dưỡng & Khám phá</option>
                    <option value="Phượt bụi & Khám phá mạo hiểm">Phượt bụi & Mạo hiểm</option>
                    <option value="Ẩm thực & Check-in sống ảo">Ẩm thực & Check-in</option>
                    <option value="Văn hóa & Di sản lịch sử">Văn hóa & Lịch sử</option>
                    <option value="Gia đình & Thư giãn">Gia đình & Thư giãn</option>
                    <option value="Sinh thái & Thiên nhiên">Sinh thái & Thiên nhiên</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#3A332B] flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-clay-600" />
                    <span>Dự toán ngân sách (VNĐ)</span>
                  </label>
                  <input
                    type="text"
                    value={manualBudgetFormatted}
                    onChange={handleManualBudgetChange}
                    placeholder="Ví dụ: 5,000,000"
                    className="w-full px-4 py-2.5 rounded-sm border border-[#1E1A15]/12 bg-[#F8F4EC] text-[#1E1A15] font-semibold outline-none focus:bg-[#FFFDF8] focus:border-clay-600"
                  />
                </div>
              </div>

              {/* ─── Lập Lịch Trình Chi Tiết Từng Ngày (Tự điền mốc giờ & địa điểm) ─── */}
              <div className="space-y-3 pt-3 border-t border-[#1E1A15]/12">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-[#2A241D] flex items-center gap-1.5 text-xs sm:text-sm">
                    <Clock className="w-4 h-4 text-clay-600" />
                    <span>Thiết kế lịch trình từng ngày ({manualDaysCount} ngày)</span>
                  </label>
                  <span className="text-[11px] text-[#7A6F60] font-medium">Tự do điền mốc giờ và hoạt động</span>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {manualDaysSchedule.map((dayItem, dayIdx) => (
                    <div key={dayIdx} className="p-3.5 rounded-sm bg-[#F8F4EC] border border-[#1E1A15]/12 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-sm bg-clay-600 text-white font-extrabold text-xs shrink-0">
                          Ngày {dayIdx + 1}
                        </span>
                        <input
                          type="text"
                          placeholder={`Tiêu đề ngày ${dayIdx + 1} (vd: Khám phá trung tâm, Check-in đồi chè...)`}
                          value={dayItem.title || ''}
                          onChange={(e) => handleUpdateDayTitle(dayIdx, e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-sm border border-[#1E1A15]/12 bg-[#FFFDF8] text-xs font-semibold text-[#2A241D] outline-none focus:border-clay-600"
                        />
                      </div>

                      {/* Danh sách hoạt động tự điền của ngày */}
                      <div className="space-y-2 pl-2 border-l-2 border-clay-300">
                        {(!dayItem.activities || dayItem.activities.length === 0) ? (
                          <div className="py-2 px-3 rounded-sm bg-[#FFFDF8]/70 border border-dashed border-[#1E1A15]/20 text-[#9A8F7F] text-xs italic flex items-center justify-between">
                            <span>Chưa có hoạt động nào trong Ngày {dayIdx + 1}.</span>
                            <button
                              type="button"
                              onClick={() => handleAddActivityToDay(dayIdx)}
                              className="inline-flex items-center gap-1 text-clay-600 font-bold hover:underline not-italic cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Thêm mốc giờ</span>
                            </button>
                          </div>
                        ) : (
                          <>
                            {dayItem.activities.map((act, actIdx) => (
                              <div key={act.id || actIdx} className="p-2.5 rounded-sm bg-[#FFFDF8] border border-[#1E1A15]/12  space-y-2 text-xs">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    placeholder="Giờ (vd: 08:30)"
                                    value={act.time || ''}
                                    onChange={(e) => handleUpdateActivityField(dayIdx, actIdx, 'time', e.target.value)}
                                    className="w-24 px-2 py-1 rounded-sm border border-[#1E1A15]/12 font-mono text-xs font-bold outline-none focus:border-clay-600"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Tên hoạt động / Địa điểm (Bắt buộc)"
                                    value={act.title || ''}
                                    onChange={(e) => handleUpdateActivityField(dayIdx, actIdx, 'title', e.target.value)}
                                    className="flex-1 px-2.5 py-1 rounded-sm border border-[#1E1A15]/12 font-semibold text-xs text-[#1E1A15] outline-none focus:border-clay-600"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveActivityFromDay(dayIdx, actIdx)}
                                    className="p-1 rounded-sm text-[#9A8F7F] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                    title="Xóa hoạt động này"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    placeholder="Ghi chú (vd: Mua vé trước, ăn sáng quán ngon...)"
                                    value={act.note || ''}
                                    onChange={(e) => handleUpdateActivityField(dayIdx, actIdx, 'note', e.target.value)}
                                    className="px-2.5 py-1 rounded-sm border border-[#1E1A15]/12 text-[11px] text-[#5A5145] outline-none focus:border-clay-600"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Chi phí (vd: 50.000đ)"
                                    value={act.cost || ''}
                                    onChange={(e) => handleUpdateActivityField(dayIdx, actIdx, 'cost', e.target.value)}
                                    className="px-2.5 py-1 rounded-sm border border-[#1E1A15]/12 text-[11px] text-[#5A5145] outline-none focus:border-clay-600"
                                  />
                                </div>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => handleAddActivityToDay(dayIdx)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-clay-50 hover:bg-clay-100 text-clay-700 text-xs font-bold transition-all cursor-pointer border border-clay-200/60"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Thêm mốc giờ cho Ngày {dayIdx + 1}</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cover Photo: Chọn từ máy */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#3A332B] flex items-center gap-1.5 text-xs">
                    <Camera className="w-3.5 h-3.5 text-clay-600" />
                    <span>Ảnh bìa đại diện chuyến đi</span>
                  </label>
                  <label className="px-3 py-1.5 rounded-sm bg-clay-50 text-clay-700 hover:bg-clay-100 border border-clay-200 font-bold text-xs cursor-pointer transition-colors flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Chọn ảnh từ máy</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 10 * 1024 * 1024) {
                          toast.showError('Ảnh bìa vượt quá 10MB. Vui lòng chọn ảnh nhẹ hơn.');
                          return;
                        }
                        try {
                          toast.showInfo('Đang tải ảnh bìa lên Cloudinary...');
                          const res = await uploadApi.uploadSingle(file);
                          const uploadedUrl = typeof res === 'string' ? res : (res?.url || res?.secure_url || res?.data?.url);
                          if (uploadedUrl) {
                            setManualCover(uploadedUrl);
                            toast.showSuccess('Đã tải ảnh bìa thành công!');
                          } else {
                            toast.showError('Không nhận được URL ảnh từ máy chủ.');
                          }
                        } catch (err) {
                          toast.showError(err?.message || 'Lỗi tải ảnh bìa lên máy chủ.');
                        }
                      }}
                    />
                  </label>
                </div>

                {manualCover && (
                  <div className="relative h-32 rounded-sm overflow-hidden border border-[#1E1A15]/12 bg-[#F2ECE1] ">
                    <img src={manualCover} alt="Cover preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#17130F]/70 to-transparent flex items-end p-2.5">
                      <span className="text-white text-xs font-semibold">Xem trước ảnh bìa đã chọn</span>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <label className="flex items-center gap-2.5 p-3 rounded-sm bg-[#F8F4EC] border border-[#1E1A15]/12 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={manualIsPublic}
                      onChange={(e) => setManualIsPublic(e.target.checked)}
                      className="w-4 h-4 rounded text-clay-600 focus:ring-clay-500 border-[#1E1A15]/20 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-[#1E1A15] block text-xs">Chia sẻ công khai lịch trình (Public)</span>
                      <span className="text-[11px] text-[#7A6F60]">Cho phép cộng đồng du khách xem và sao chép chuyến đi</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-[#1E1A15]/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsManualCreateOpen(false)}
                  className="px-5 py-2.5 rounded-sm bg-[#F2ECE1] hover:bg-[#E7DFD2] text-[#5A5145] font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-sm bg-clay-600 hover:bg-clay-700 text-white font-extrabold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Tạo Chuyến Đi Ngay 🎉
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CHỈNH SỬA TOÀN BỘ CHUYẾN ĐI */}
      <EditItineraryModal
        itinerary={editingItinerary}
        isOpen={Boolean(editingItinerary)}
        onClose={() => setEditingItinerary(null)}
        onSuccess={(updated) => {
          if (updated) {
            setItineraries(prev => prev.map(item => String(item.id) === String(updated.id) ? { ...item, ...updated } : item));
            if (selectedItinerary && String(selectedItinerary.id) === String(updated.id)) {
              setSelectedItinerary(prev => ({ ...prev, ...updated }));
            }
          }
        }}
      />
    </div>
  );
};
