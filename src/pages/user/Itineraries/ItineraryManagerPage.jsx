import React, { useState, useMemo, useEffect } from 'react';

import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../components/common/Toast';
import { ItineraryDetailModal } from '../../../components/itinerary/ItineraryDetailModal';
import { ItineraryExportModal } from '../../../components/itinerary/ItineraryExportModal';
import { EditItineraryModal } from '../../../components/itinerary/EditItineraryModal';
import { MapPin, Calendar, Clock, DollarSign, Users, Search, SlidersHorizontal, ChevronRight, Share2, Plus, Compass, X, ArrowRight, Layers, Trash2, Check, Filter, Navigation, Download, Upload, Camera, Globe, Lock, Edit3, Sparkles, ShieldCheck, Coffee, Hotel, Bus, FileText } from 'lucide-react';

export const ItineraryManagerPage = () => {
  const {
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
  const [manualModalTab, setManualModalTab] = useState('basic'); // 'basic' | 'tourStandard'
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

  // 15 Tiêu Chuẩn Tour Lữ Hành Thương Mại
  const [manualTourCode, setManualTourCode] = useState('');
  const [manualTheme, setManualTheme] = useState('');
  const [manualDepartureLocation, setManualDepartureLocation] = useState('Hà Nội / TP. Hồ Chí Minh');
  const [manualEndingLocation, setManualEndingLocation] = useState('');
  const [manualTargetAudience, setManualTargetAudience] = useState('Đa dạng đối tượng (Gia đình, Thanh niên, Bạn bè)');
  const [manualMaxGroupSize, setManualMaxGroupSize] = useState(20);
  const [manualTransportation, setManualTransportation] = useState('Ô tô du lịch đời mới / Máy bay');
  const [manualMealPlan, setManualMealPlan] = useState('');
  const [manualAccommodationInfo, setManualAccommodationInfo] = useState('');
  const [manualTourGuideInfo, setManualTourGuideInfo] = useState('Hướng dẫn viên tiếng Việt chuyên nghiệp, nhiệt tình thuyết minh suốt tuyến');
  const [manualChildPrice, setManualChildPrice] = useState('');
  const [manualSingleRoomSurcharge, setManualSingleRoomSurcharge] = useState('');
  const [manualServicesIncluded, setManualServicesIncluded] = useState('');
  const [manualServicesExcluded, setManualServicesExcluded] = useState('');
  const [manualCancellationPolicy, setManualCancellationPolicy] = useState('');
  const [manualPackingNotes, setManualPackingNotes] = useState('');

  // Auto-fill thông minh chuẩn tour lữ hành
  const handleAutoFillManualTourStandard = () => {
    const dest = manualDest.trim() || 'Việt Nam';
    const destCode = dest.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'VN') || 'TRIP';
    const code = manualTourCode.trim() || `TOUR-${destCode}-${Math.floor(1000 + Math.random() * 9000)}`;

    setManualTourCode(code);
    setManualTheme(manualTravelStyle || 'Khám phá & Nghỉ dưỡng');
    setManualDepartureLocation('Sân bay Nội Bài (Hà Nội) / Tân Sơn Nhất (TP.HCM)');
    setManualEndingLocation(dest);
    setManualTargetAudience('Khách du lịch tự do, Gia đình có trẻ em, Nhóm bạn trẻ yêu thích khám phá');
    setManualMaxGroupSize(20);
    setManualTransportation('Vé máy bay khứ hồi (Vietnam Airlines / Vietjet Air) + Xe du lịch Universe 29-45 chỗ máy lạnh đón tiễn');
    setManualMealPlan(`• Bữa sáng: Buffet tiêu chuẩn tại khách sạn\n• Bữa trưa & tối: Thưởng thức đặc sản ${dest} tại nhà hàng tiêu chuẩn (150.000đ - 250.000đ/suất)\n• Nước suối tinh khiết: 01 chai 500ml/người/ngày`);
    setManualAccommodationInfo(`Khách sạn tiêu chuẩn 3 - 4 sao trung tâm ${dest} (hoặc resort ven biển), phòng 2 khách/phòng (tiện nghi cao cấp)`);
    setManualTourGuideInfo('Hướng dẫn viên tiếng Việt chuyên nghiệp, kinh nghiệm, nhiệt tình và am hiểu văn hóa bản địa phục vụ đoàn suốt tuyến');
    
    const rawChild = Math.round(Number(manualBudget) * 0.75);
    setManualChildPrice(rawChild.toLocaleString('en-US'));
    setManualSingleRoomSurcharge(Math.round(Number(manualBudget) * 0.35).toLocaleString('en-US'));

    setManualServicesIncluded(`✅ Vé máy bay khứ hồi kèm hành lý tiêu chuẩn\n✅ Khách sạn tiêu chuẩn 3-4 sao tiện nghi (2 khách/phòng)\n✅ Các bữa ăn theo chương trình ẩm thực địa phương phong phú\n✅ Vé vào cổng tham quan tất cả các điểm trong lịch trình\n✅ Xe du lịch đời mới máy lạnh đưa đón đúng giờ\n✅ Hướng dẫn viên chu đáo, giàu kinh nghiệm\n✅ Bảo hiểm du lịch nội địa mức bồi thường tối đa 50.000.000đ/vụ\n✅ Quà tặng nón du lịch Wayfare`);
    
    setManualServicesExcluded(`❌ Thuế VAT 8% (nếu lấy hóa đơn đỏ)\n❌ Chi phí cá nhân: giặt là, điện thoại, đồ uống trong bữa ăn, minibar\n❌ Phụ thu phòng đơn (nếu yêu cầu ở 1 mình/phòng)\n❌ Tiền tip bồi dưỡng cho Hướng dẫn viên và tài xế (tùy tâm)\n❌ Vé các trò chơi giải trí cảm giác mạnh hoặc chi phí tự túc ngoài chương trình`);

    setManualCancellationPolicy(`• Hủy trước ngày khởi hành 07 ngày: Hoàn lại 100% chi phí cọc\n• Hủy trước ngày khởi hành 03 - 06 ngày: Phí phạt 50% tổng giá trị tour\n• Hủy trong vòng 24 - 48 giờ trước giờ khởi hành: Phí phạt 80% tổng giá trị\n• Hủy vào ngày khởi hành hoặc vắng mặt: Phí phạt 100% giá trị tour`);

    setManualPackingNotes(`• Giấy tờ tùy thân bắt buộc: CCCD/Hộ chiếu bản gốc còn hạn trên 6 tháng\n• Trang phục: Mang trang phục gọn nhẹ, giày thể thao êm chân; trang phục lịch sự kín đáo khi viếng đền chùa, di tích tôn nghiêm\n• Đồ dùng cá nhân: Kem chống nắng, kính râm, thuốc chống say xe, sạc dự phòng`);

    toast.showSuccess(`✨ WanderAI đã tự động chuẩn hóa đầy đủ 15 tiêu chí tour cho ${dest}! 🎉`);
  };

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

      // 15 Tiêu Chuẩn Tour Lữ Hành Thương Mại
      tourCode: manualTourCode.trim() || `TOUR-${(manualDest.trim().substring(0, 3) || 'VN').toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      theme: manualTheme.trim() || manualTravelStyle,
      departureLocation: manualDepartureLocation.trim() || 'Hà Nội / TP. Hồ Chí Minh',
      endingLocation: manualEndingLocation.trim() || manualDest.trim(),
      targetAudience: manualTargetAudience.trim() || 'Đa dạng đối tượng (Gia đình, Thanh niên, Bạn bè)',
      maxGroupSize: Number(manualMaxGroupSize) || 20,
      transportation: manualTransportation.trim() || 'Ô tô du lịch đời mới / Máy bay',
      mealPlan: manualMealPlan.trim() || null,
      accommodationInfo: manualAccommodationInfo.trim() || null,
      tourGuideInfo: manualTourGuideInfo.trim() || null,
      childPrice: manualChildPrice ? Number(String(manualChildPrice).replace(/\D/g, '')) : null,
      singleRoomSurcharge: manualSingleRoomSurcharge ? Number(String(manualSingleRoomSurcharge).replace(/\D/g, '')) : null,
      servicesIncluded: manualServicesIncluded.trim() || null,
      servicesExcluded: manualServicesExcluded.trim() || null,
      cancellationPolicy: manualCancellationPolicy.trim() || null,
      packingNotes: manualPackingNotes.trim() || null,

      days: finalDays
    };

    setIsManualCreateOpen(false);
    setSelectedItinerary(newTrip);
    toast.showSuccess(`Đã tạo thành công chuyến đi mới: ${newTrip.title}! 🎉`);

    setManualTitle('');
    setManualDest('');
    setManualNote('');
    setManualDaysSchedule([]);
    setManualTourCode('');
    setManualTheme('');
    setManualDepartureLocation('Hà Nội / TP. Hồ Chí Minh');
    setManualEndingLocation('');
    setManualTargetAudience('Đa dạng đối tượng (Gia đình, Thanh niên, Bạn bè)');
    setManualMaxGroupSize(20);
    setManualTransportation('Ô tô du lịch đời mới / Máy bay');
    setManualMealPlan('');
    setManualAccommodationInfo('');
    setManualTourGuideInfo('Hướng dẫn viên tiếng Việt chuyên nghiệp, nhiệt tình thuyết minh suốt tuyến');
    setManualChildPrice('');
    setManualSingleRoomSurcharge('');
    setManualServicesIncluded('');
    setManualServicesExcluded('');
    setManualCancellationPolicy('');
    setManualPackingNotes('');
    setManualModalTab('basic');

    // Persist to MySQL backend database
    if (createManualItinerary) {
      await createManualItinerary(newTrip);
    } else {
      setItineraries(prev => [newTrip, ...prev]);
    }
  };

  return (
    <div className="itinerary-page w-full min-h-screen bg-[#F8F4EC] text-[#1E1A15] pb-24">
      {/* ─── 1. PAGE HEADER GỌN: TIÊU ĐỀ + HÀNH ĐỘNG ─── */}
      <section className="relative w-full overflow-hidden bg-[#F8F4EC] text-[#1E1A15] border-b border-[#1E1A15]/10">
        <div className="relative z-10 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-6 pb-6 sm:pt-7 sm:pb-7 lg:pt-8 lg:pb-8">
          {/* Breadcrumb */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="flex items-center gap-1.5 text-clay-700 font-semibold">
              <Compass className="w-3.5 h-3.5 text-clay-600" />
              <span>Wayfare</span>
            </span>
            <ChevronRight className="w-3 h-3 text-[#1E1A15]/30" />
            <span className="text-[#1E1A15] font-bold">Kế Hoạch & Lịch Trình</span>
          </div>

          <div className="mt-4 flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-5 2xl:gap-8">
            {/* Main Headline */}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] 2xl:text-5xl font-extrabold tracking-tight text-[#1E1A15] leading-[1.08]">
              Lịch Trình Du Lịch{' '}
              <span className="text-clay-700">Của Bạn</span>
            </h1>

            {/* Action CTA Cluster */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {/* AI CTA Button */}
              <button
                type="button"
                onClick={() => {
                  if (!requireAuth('lập lịch trình bằng AI')) return;
                  setIsAIGeneratorOpen(true);
                }}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-sm bg-clay-600 hover:bg-clay-700 text-white text-sm font-extrabold transition-colors duration-200 cursor-pointer"
              >
                <span>Lập Tour Bằng AI (30s)</span>
                <span className="px-2 py-0.5 rounded-sm bg-[#17130F]/25 text-[10px] font-black uppercase tracking-wider">
                  Miễn phí
                </span>
              </button>

              {/* Manual Trip CTA */}
              <button
                type="button"
                onClick={() => {
                  if (!requireAuth('tạo chuyến đi mới')) return;
                  setIsManualCreateOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-sm bg-transparent hover:bg-[#1E1A15]/5 text-[#1E1A15] font-bold text-sm transition-colors border border-[#1E1A15]/25 hover:border-clay-600/70 cursor-pointer"
              >
                <span>+ Tạo Thủ Công</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. DASHBOARD LAYER ─── */}
      <div className="relative mt-6 sm:mt-8 z-20 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-5">
        {/* Guest Restriction Banner (Nếu chưa đăng nhập) */}
        {!isLoggedIn && (
          <div className="bg-[#FFFDF8] border border-clay-600/30 rounded-sm p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-sm bg-clay-600 text-white flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#1E1A15]">
                  Chế độ khách: Xem lịch trình mẫu
                </h3>
                <p className="text-xs sm:text-sm text-[#6B6154] leading-relaxed mt-0.5">
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
              className="shrink-0 px-6 py-2.5 rounded-sm bg-clay-600 hover:bg-clay-700 text-white text-xs sm:text-sm font-extrabold transition-colors cursor-pointer whitespace-nowrap"
            >
              Đăng nhập ngay
            </button>
          </div>
        )}

        {/* STATS KPI DASHBOARD (4 METRIC CARDS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Tổng số chuyến */}
          <div className="bg-[#FFFDF8] rounded-sm p-5 sm:p-6 border border-[#1E1A15]/12 hover:border-clay-600/50 transition-colors flex items-center gap-4">
            <div className="w-12 h-12 rounded-sm border border-clay-600/30 bg-clay-50 text-clay-700 flex items-center justify-center shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#8A7E6E] uppercase tracking-[0.1em] whitespace-nowrap">Tổng Chuyến Đi</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display text-2xl sm:text-3xl font-extrabold text-[#1E1A15]">
                  {(itineraries || []).length}
                </span>
                <span className="text-xs text-[#7A6F60] font-medium">chuyến đã tạo</span>
              </div>
            </div>
          </div>

          {/* Card 2: Điểm đến đã lên kế hoạch */}
          <div className="bg-[#FFFDF8] rounded-sm p-5 sm:p-6 border border-[#1E1A15]/12 hover:border-clay-600/50 transition-colors flex items-center gap-4">
            <div className="w-12 h-12 rounded-sm border border-clay-600/30 bg-clay-50 text-clay-700 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#8A7E6E] uppercase tracking-[0.1em] whitespace-nowrap">Điểm Dừng Chân</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display text-2xl sm:text-3xl font-extrabold text-[#1E1A15]">
                  {(itineraries || []).reduce((acc, curr) => acc + (curr.placesCount || (curr.placesList ? curr.placesList.length : 3)), 0)}
                </span>
                <span className="text-xs text-[#7A6F60] font-medium">địa danh kết nối</span>
              </div>
            </div>
          </div>

          {/* Card 3: Ngân sách ước tính */}
          <div className="bg-[#FFFDF8] rounded-sm p-5 sm:p-6 border border-[#1E1A15]/12 hover:border-clay-600/50 transition-colors flex items-center gap-4">
            <div className="w-12 h-12 rounded-sm border border-clay-600/30 bg-clay-50 text-clay-700 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#8A7E6E] uppercase tracking-[0.1em] whitespace-nowrap">Tổng Dự Toán Chi Phí</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display text-xl sm:text-2xl font-extrabold text-clay-700">
                  {((itineraries || []).reduce((acc, curr) => acc + (curr.totalBudget || (curr.budgetPerPerson ? curr.budgetPerPerson * 2 : 4000000)), 0) / 1000000).toFixed(1)}M
                </span>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-sm bg-clay-50 text-clay-700 border border-clay-200 whitespace-nowrap">
                  Ước tính
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Hành trình gần nhất */}
          <div className="bg-[#1E1A15] rounded-sm p-5 sm:p-6 border border-[#1E1A15] flex items-center gap-4">
            <div className="w-12 h-12 rounded-sm bg-clay-600 text-white flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-clay-200 uppercase tracking-[0.1em] whitespace-nowrap">Kế Hoạch Sắp Tới</p>
              <p className="font-display text-base sm:text-lg font-extrabold text-white truncate mt-0.5">
                {(itineraries && itineraries[0]) ? itineraries[0].destination : 'Sắp khởi hành'}
              </p>
              <p className="text-xs text-[#B8AD9C] truncate">
                {(itineraries && itineraries[0]) ? (itineraries[0].duration || '3N2Đ') : 'Chưa có lịch'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4. FILTER WORKSPACE & TABS TOOLBAR ─────────────────────────────────── */}
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-6">
        <div className="bg-[#FFFDF8] rounded-sm p-5 sm:p-6 border border-[#1E1A15]/12 space-y-4">
          
          {/* Row 1: Tabs & Layout Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1E1A15]/10">
            <div className="flex items-center gap-5 sm:gap-7 overflow-x-auto scrollbar-none">
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
                    className={`px-0 pb-3 text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer border-b-2 -mb-px ${
                      isActive
                        ? 'border-clay-600 text-[#1E1A15]'
                        : 'border-transparent text-[#8A7E6E] hover:text-[#1E1A15]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-sm text-[10px] font-extrabold ${
                        isActive ? 'bg-clay-600 text-white' : 'bg-[#1E1A15]/5 text-[#6B6154]'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Layout Mode Switcher */}
            <div className="flex items-center gap-1 bg-[#F8F4EC] p-1 rounded-sm border border-[#1E1A15]/10 self-end sm:self-auto shrink-0 mb-2">
              <button
                type="button"
                onClick={() => setLayoutMode('grid')}
                className={`p-2 rounded-sm transition-colors cursor-pointer ${
                  layoutMode === 'grid' ? 'bg-[#1E1A15] text-white' : 'text-[#8A7E6E] hover:text-[#1E1A15]'
                }`}
                title="Dạng lưới thẻ"
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('list')}
                className={`p-2 rounded-sm transition-colors cursor-pointer ${
                  layoutMode === 'list' ? 'bg-[#1E1A15] text-white' : 'text-[#8A7E6E] hover:text-[#1E1A15]'
                }`}
                title="Dạng danh sách"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Row 2: Search Input & Sorting */}
          <div className="grid grid-cols-1 md:grid-cols-8 gap-3.5 items-center">
            {/* Search Box */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-[#9A8F7F] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm chuyến đi theo tên, thành phố, điểm check-in..."
                className="w-full pl-11 pr-4 py-2.5 rounded-sm bg-[#F8F4EC] border border-[#1E1A15]/15 text-xs sm:text-sm text-[#1E1A15] outline-none focus:border-clay-600 focus:bg-[#FFFDF8] transition-colors font-medium"
              />
            </div>

            {/* Sort Select */}
            <div className="md:col-span-3">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full px-4 py-2.5 rounded-sm bg-[#F8F4EC] border border-[#1E1A15]/15 text-xs sm:text-sm font-semibold text-[#3A332B] outline-none focus:border-clay-600 focus:bg-[#FFFDF8] cursor-pointer"
              >
                <option value="nearest">Sắp xếp: Khởi hành gần nhất</option>
                <option value="newest">Sắp xếp: Mới tạo gần đây</option>
                <option value="budget_low">Sắp xếp: Ngân sách tiết kiệm</option>
                <option value="duration">Sắp xếp: Số ngày dài nhất</option>
              </select>
            </div>
          </div>

          {/* Filter Tags */}
          <div className="flex flex-wrap items-center gap-1.5">
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
                  className={`px-3 py-1.5 rounded-sm text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 border ${
                    isSelected
                      ? 'bg-[#1E1A15] text-white border-[#1E1A15]'
                      : 'bg-transparent text-[#6B6154] border-[#1E1A15]/15 hover:border-clay-600/60 hover:text-[#1E1A15]'
                  }`}
                >
                  <span>{tag.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── 5. ITINERARIES GRID / LIST CONTAINER ──────────────────────────────── */}
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-6">
        {filteredItineraries.length === 0 ? (
          /* Empty State */
          <div className="bg-[#FFFDF8] rounded-sm p-12 sm:p-16 text-center border border-[#1E1A15]/12 space-y-5">
            <div className="w-16 h-16 rounded-sm border border-clay-600/30 bg-clay-50 text-clay-700 flex items-center justify-center mx-auto">
              <Compass className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="font-display text-xl font-bold text-[#1E1A15]">
                Chưa có chuyến đi nào phù hợp
              </h3>
              <p className="text-xs sm:text-sm text-[#7A6F60] leading-relaxed">
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
                className="px-6 py-3 rounded-sm bg-clay-600 hover:bg-clay-700 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>Khởi Tạo Bằng AI</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!requireAuth('tạo chuyến đi thủ công')) return;
                  setIsManualCreateOpen(true);
                }}
                className="px-5 py-3 rounded-sm bg-transparent border border-[#1E1A15]/20 hover:bg-[#1E1A15]/5 text-[#3A332B] text-xs sm:text-sm font-bold transition-colors cursor-pointer"
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
                  className="group bg-[#FFFDF8] rounded-sm overflow-hidden border border-[#1E1A15]/12 hover:border-clay-600/60 transition-colors duration-200 flex flex-col cursor-pointer relative"
                >
                  {/* Photo Cover Header */}
                  <div className="relative h-60 w-full overflow-hidden bg-[#F2ECE1] border-b border-[#1E1A15]/10">
                    <img
                      src={itin.coverImage || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80'}
                      alt={itin.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#17130F]/90 via-[#17130F]/25 to-transparent"></div>

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {itin.countdown && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#17130F]/85 text-white text-[11px] font-bold border border-white/15">
                            <span className="w-1.5 h-1.5 rounded-sm bg-clay-300 "></span>
                            {itin.countdown}
                          </span>
                        )}

                        {itin.isAiGenerated && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-clay-600 text-white text-[11px] font-bold border border-clay-400/40">
                            <span>WanderAI</span>
                          </span>
                        )}
                      </div>

                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[11px] font-bold border backdrop-blur-xs ${
                        itin.isPublic !== false
                          ? 'bg-emerald-700/90 text-white border-emerald-400/40'
                          : 'bg-[#17130F]/90 text-amber-300 border-amber-400/40'
                      }`}>
                        {itin.isPublic !== false ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        <span>{itin.isPublic !== false ? 'Công khai' : 'Riêng tư'}</span>
                      </span>
                    </div>

                    {/* Destination & Days Floating on Image Bottom */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                      <div className="min-w-0 pr-2">
                        <p className="text-[10px] font-extrabold text-clay-200 uppercase tracking-[0.12em]">
                          {itin.region || 'Điểm Đến Việt Nam'}
                        </p>
                        <div className="flex items-center gap-1.5 font-extrabold text-sm sm:text-base truncate">
                          <MapPin className="w-4 h-4 text-clay-300 shrink-0" />
                          <span className="truncate">{itin.destination}</span>
                        </div>
                      </div>
                      
                      <div className="shrink-0 px-3 py-1 rounded-sm bg-[#F8F4EC] text-[#1E1A15] text-xs font-extrabold">
                        {itin.duration || `${itin.daysCount || 3}N${Math.max(1, (itin.daysCount || 3) - 1)}Đ`}
                      </div>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 sm:p-6 flex flex-col flex-1 space-y-4">
                    {/* Title */}
                    <h3 className="font-display font-extrabold text-base sm:text-lg text-[#1E1A15] group-hover:text-clay-700 transition-colors line-clamp-2 leading-snug">
                      {itin.title}
                    </h3>

                    {/* Schedule Metadata */}
                    <div className="space-y-2 text-xs text-[#7A6F60]">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-clay-600 shrink-0" />
                        <span className="font-semibold text-[#3A332B]">{itin.departureDate || 'Ngày khởi hành linh hoạt'}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#9A8F7F] shrink-0" />
                          <span>{itin.groupType || 'Cặp đôi / Bạn bè'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-clay-700 font-bold text-xs">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{itin.placesCount || (itin.placesList ? itin.placesList.length : 3)} điểm dừng chân</span>
                        </div>
                      </div>
                    </div>

                    {/* Places Chips Preview */}
                    {itin.placesList && itin.placesList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {itin.placesList.slice(0, 3).map((place, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-sm bg-[#F8F4EC] text-[11px] font-semibold text-[#6B6154] border border-[#1E1A15]/10">
                            {place}
                          </span>
                        ))}
                        {itin.placesList.length > 3 && (
                          <span className="px-2 py-1 rounded-sm bg-clay-50 text-[11px] font-extrabold text-clay-700 border border-clay-200">
                            +{itin.placesList.length - 3} điểm nữa
                          </span>
                        )}
                      </div>
                    )}

                    {/* Simplified Budget Estimate */}
                    <div className="mt-auto pt-3.5 border-t border-[#1E1A15]/10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-[#7A6F60]">
                        <DollarSign className="w-4 h-4 text-clay-600" />
                        <span className="font-semibold text-[#6B6154]">Dự toán chi phí:</span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-clay-700 text-sm">
                          {itin.budgetPerPerson ? `${itin.budgetPerPerson.toLocaleString('vi-VN')}đ` : (itin.totalBudget ? `${itin.totalBudget.toLocaleString('vi-VN')}đ` : '3.500.000đ')}
                        </span>
                        <span className="font-normal text-[11px] text-[#9A8F7F] ml-1">/người</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedItinerary(itin)}
                        className="flex-1 py-2.5 px-3 rounded-sm bg-clay-600 hover:bg-clay-700 text-white text-xs font-extrabold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                      >
                        <span>Mở Lịch Trình</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

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
                        className={`w-9 h-9 rounded-sm border flex items-center justify-center transition-colors cursor-pointer ${
                          itin.isPublic !== false
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`}
                        title={itin.isPublic !== false ? 'Lịch trình đang Công khai. Bấm để chuyển sang Riêng tư.' : 'Lịch trình đang Riêng tư. Bấm để Công khai.'}
                      >
                        {itin.isPublic !== false ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingItinerary(itin);
                        }}
                        className="w-9 h-9 rounded-sm border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 flex items-center justify-center transition-colors cursor-pointer"
                        title="Chỉnh sửa thông tin chuyến đi"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExportModalItinerary(itin);
                        }}
                        className="w-9 h-9 rounded-sm border border-[#1E1A15]/12 bg-transparent hover:bg-clay-50 text-[#6B6154] hover:text-clay-700 flex items-center justify-center transition-colors cursor-pointer"
                        title="Tải lịch trình (PDF, Lịch Google, In ấn)"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleShareItinerary(itin, e)}
                        className="w-9 h-9 rounded-sm border border-[#1E1A15]/12 bg-transparent hover:bg-[#1E1A15]/5 text-[#6B6154] flex items-center justify-center transition-colors cursor-pointer"
                        title="Chia sẻ chuyến đi"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteItinerary(itin.id, itin.title, e)}
                        className="w-9 h-9 rounded-sm border border-[#1E1A15]/12 bg-transparent hover:bg-rose-50 text-[#9A8F7F] hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
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
            <div className="bg-[#1E1A15] text-white rounded-sm p-6 sm:p-8 border border-[#1E1A15] md:col-span-2 lg:col-span-3 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="inline-block px-3 py-1 rounded-sm bg-clay-600/15 text-clay-200 border border-clay-500/40 text-[11px] font-bold">
                    Khám phá AI 1 chạm
                  </div>
                </div>

                <h3 className="font-display font-extrabold text-lg text-white leading-snug">
                  Chưa biết đi đâu? Hãy để WanderAI lên lịch giúp bạn!
                </h3>

                <p className="text-xs text-[#B8AD9C] leading-relaxed">
                  Trí tuệ nhân tạo tra cứu thực tế các địa danh, quán ăn bản địa của 63 tỉnh thành để tạo hành trình từng giờ tối ưu ngân sách.
                </p>
              </div>

              <div className="lg:col-span-5 space-y-2">
                {/* Quick Suggestion Pills */}
                <button
                  type="button"
                  onClick={() => {
                    if (!requireAuth('lập lịch trình bằng AI')) return;
                    setIsAIGeneratorOpen(true);
                  }}
                  className="w-full text-left px-4 py-3 rounded-sm bg-[#FFFDF8]/5 hover:bg-[#FFFDF8]/10 border border-white/10 text-xs font-semibold text-[#E6DED2] flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>🏖️ Đà Nẵng - Hội An 3N2Đ &lt; 4.5M</span>
                  <ChevronRight className="w-4 h-4 text-clay-300" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!requireAuth('lập lịch trình bằng AI')) return;
                    setIsAIGeneratorOpen(true);
                  }}
                  className="w-full text-left px-4 py-3 rounded-sm bg-[#FFFDF8]/5 hover:bg-[#FFFDF8]/10 border border-white/10 text-xs font-semibold text-[#E6DED2] flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>🏔️ Phượt Hà Giang Mùa Tam Giác Mạch</span>
                  <ChevronRight className="w-4 h-4 text-clay-300" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!requireAuth('lập lịch trình bằng AI')) return;
                    setIsAIGeneratorOpen(true);
                  }}
                  className="mt-2 w-full py-3 px-4 rounded-sm bg-clay-600 hover:bg-clay-700 text-white text-xs font-extrabold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Khởi Tạo Lịch Trình Ngay</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── 6. INTERACTIVE ITINERARY DETAIL MODAL (M10 MODAL) ───────────────────── */}
      {selectedItinerary && (
        <ItineraryDetailModal
          itinerary={selectedItinerary}
          onClose={() => setSelectedItinerary(null)}
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

      {/* ─── 7. MODAL TẠO CHUYẾN ĐI THỦ CÔNG (LUXURY 2-TAB POPUP) ─────────────────────── */}
      {isManualCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#17130F]/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#FFFDF8] rounded-xl sm:rounded-2xl max-w-3xl w-full border border-[#1E1A15]/15 overflow-hidden my-auto max-h-[92vh] flex flex-col shadow-2xl">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#1E1A15]/10 flex items-center justify-between shrink-0 bg-[#F8F4EC]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-clay-600 text-white flex items-center justify-center shadow-xs">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base sm:text-lg text-[#1E1A15]">
                    Thiết Kế Chuyến Đi & Chuẩn Tour Lữ Hành
                  </h3>
                  <p className="text-xs text-[#7A6F60]">Tự do lên kế hoạch hoặc áp dụng trọn vẹn 15 tiêu chuẩn tour chuyên nghiệp</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsManualCreateOpen(false)}
                className="w-8 h-8 rounded-full bg-[#E7DFD2] hover:bg-[#D9CFC0] text-[#5A5145] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Navigator */}
            <div className="px-6 pt-2.5 pb-2 bg-[#F2ECE1]/80 border-b border-[#1E1A15]/10 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setManualModalTab('basic')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    manualModalTab === 'basic'
                      ? 'bg-white text-[#1E1A15] shadow-xs border border-[#1E1A15]/15'
                      : 'text-[#5A5145] hover:text-[#1E1A15]'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-clay-600" />
                  <span>1. Thông Tin Cơ Bản</span>
                </button>
                <button
                  type="button"
                  onClick={() => setManualModalTab('tourStandard')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    manualModalTab === 'tourStandard'
                      ? 'bg-white text-clay-700 shadow-xs border border-clay-300'
                      : 'text-[#5A5145] hover:text-[#1E1A15]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>2. Chuẩn Lữ Hành (15 Tiêu Chí)</span>
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-extrabold">Đề xuất</span>
                </button>
              </div>

              {/* Smart Auto-fill Button */}
              <button
                type="button"
                onClick={handleAutoFillManualTourStandard}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-clay-600 hover:from-amber-600 hover:to-clay-700 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Tự động điền nhanh các tiêu chuẩn lữ hành theo điểm đến"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>✨ WanderAI Điền Nhanh Chuẩn Tour</span>
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateManualTrip} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">
              
              {/* TAB 1: THÔNG TIN CƠ BẢN */}
              {manualModalTab === 'basic' && (
                <div className="space-y-4 animate-in fade-in duration-150">
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
                          className="w-full px-3.5 py-2 rounded-sm border border-[#1E1A15]/12 bg-[#F8F4EC] text-[#2A241D] font-medium outline-none focus:bg-[#FFFDF8] focus:border-clay-600 text-xs"
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
                          className="w-full px-3.5 py-2 rounded-sm border border-[#1E1A15]/12 bg-[#F8F4EC] text-[#2A241D] font-medium outline-none focus:bg-[#FFFDF8] focus:border-clay-600 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Group Type, Travel Style & Budget */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="font-bold text-[#3A332B] flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-clay-600" />
                        <span>Hình thức nhóm</span>
                      </label>
                      <select
                        value={manualGroup}
                        onChange={(e) => setManualGroup(e.target.value)}
                        className="w-full px-3 py-2 rounded-sm border border-[#1E1A15]/12 bg-[#F8F4EC] text-[#1E1A15] font-medium outline-none focus:bg-[#FFFDF8] focus:border-clay-600 cursor-pointer text-xs"
                      >
                        <option value="Cá nhân">Cá nhân (Solo)</option>
                        <option value="Cặp đôi">Cặp đôi</option>
                        <option value="Nhóm bạn">Nhóm bạn</option>
                        <option value="Gia đình">Gia đình</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-[#3A332B] flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Phong cách</span>
                      </label>
                      <select
                        value={manualTravelStyle}
                        onChange={(e) => setManualTravelStyle(e.target.value)}
                        className="w-full px-3 py-2 rounded-sm border border-[#1E1A15]/12 bg-[#F8F4EC] text-[#1E1A15] font-medium outline-none focus:bg-[#FFFDF8] focus:border-clay-600 cursor-pointer text-xs"
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
                        <DollarSign className="w-3.5 h-3.5 text-clay-600" />
                        <span>Dự toán (VNĐ)</span>
                      </label>
                      <input
                        type="text"
                        value={manualBudgetFormatted}
                        onChange={handleManualBudgetChange}
                        placeholder="Ví dụ: 5,000,000"
                        className="w-full px-3 py-2 rounded-sm border border-[#1E1A15]/12 bg-[#F8F4EC] text-[#1E1A15] font-semibold outline-none focus:bg-[#FFFDF8] focus:border-clay-600 text-xs"
                      />
                    </div>
                  </div>

                  {/* ─── Lập Lịch Trình Chi Tiết Từng Ngày ─── */}
                  <div className="space-y-3 pt-3 border-t border-[#1E1A15]/12">
                    <div className="flex items-center justify-between">
                      <label className="font-extrabold text-[#2A241D] flex items-center gap-1.5 text-xs sm:text-sm">
                        <Clock className="w-4 h-4 text-clay-600" />
                        <span>Thiết kế lịch trình từng ngày ({manualDaysCount} ngày)</span>
                      </label>
                      <span className="text-[11px] text-[#7A6F60] font-medium">Tự do điền mốc giờ và hoạt động</span>
                    </div>

                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
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
                                  <div key={act.id || actIdx} className="p-2.5 rounded-sm bg-[#FFFDF8] border border-[#1E1A15]/12 space-y-2 text-xs">
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

                  {/* Cover Photo */}
                  <div className="space-y-2 pt-2 border-t border-[#1E1A15]/12">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-[#3A332B] flex items-center gap-1.5 text-xs">
                        <Camera className="w-3.5 h-3.5 text-clay-600" />
                        <span>Ảnh bìa đại diện chuyến đi</span>
                      </label>
                      <label className="px-3 py-1 rounded-sm bg-clay-50 text-clay-700 hover:bg-clay-100 border border-clay-200 font-bold text-xs cursor-pointer transition-colors flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Chọn ảnh từ máy</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                setManualCover(ev.target.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>

                    {manualCover && (
                      <div className="relative h-28 rounded-sm overflow-hidden border border-[#1E1A15]/12 bg-[#F2ECE1]">
                        <img src={manualCover} alt="Cover preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#17130F]/70 to-transparent flex items-end p-2.5">
                          <span className="text-white text-xs font-semibold">Xem trước ảnh bìa đã chọn</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-1">
                      <label className="flex items-center gap-2.5 p-2.5 rounded-sm bg-[#F8F4EC] border border-[#1E1A15]/12 cursor-pointer select-none">
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
                </div>
              )}

              {/* TAB 2: CHUẨN TOUR LỮ HÀNH 15 TIÊU CHÍ */}
              {manualModalTab === 'tourStandard' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Banner giới thiệu chuẩn tour */}
                  <div className="p-3.5 rounded-lg bg-gradient-to-r from-amber-50 to-clay-50 border border-amber-200/80 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs">
                      <h4 className="font-extrabold text-amber-950">Bộ 15 Tiêu Chuẩn Tour Lữ Hành Thương Mại</h4>
                      <p className="text-amber-800 mt-0.5 leading-relaxed">
                        Điền đầy đủ thông tin bên dưới để lịch trình được chuẩn hóa theo quy chuẩn lữ hành chuyên nghiệp, hỗ trợ in cẩm nang du lịch và tổ chức đoàn. Bạn có thể nhấn nút <strong className="text-clay-800">✨ WanderAI Điền Nhanh Chuẩn Tour</strong> ở trên để tự động điền mẫu chuẩn!
                      </p>
                    </div>
                  </div>

                  {/* Khối 1: Định Danh & Tuyến Điểm */}
                  <div className="p-4 rounded-xl bg-white border border-[#1E1A15]/10 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#1E1A15]/10 text-xs font-extrabold text-[#1E1A15]">
                      <Compass className="w-4 h-4 text-clay-600" />
                      <span>1. Định Danh & Tuyến Điểm Khởi Hành - Kết Thúc</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#5A5145]">Mã Tour (Tour Code)</label>
                        <input
                          type="text"
                          value={manualTourCode}
                          onChange={(e) => setManualTourCode(e.target.value)}
                          placeholder="Ví dụ: TOUR-DNG-3N2D"
                          className="w-full px-3 py-2 rounded-lg border border-[#1E1A15]/12 bg-[#F8F4EC] text-xs font-semibold text-[#1E1A15] outline-none focus:border-clay-600 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#5A5145]">Chủ Đề Tour</label>
                        <input
                          type="text"
                          value={manualTheme}
                          onChange={(e) => setManualTheme(e.target.value)}
                          placeholder="Ví dụ: Nghỉ dưỡng biển cao cấp, Khám phá di sản..."
                          className="w-full px-3 py-2 rounded-lg border border-[#1E1A15]/12 bg-[#F8F4EC] text-xs font-semibold text-[#1E1A15] outline-none focus:border-clay-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#5A5145]">Điểm Đón / Khởi Hành</label>
                        <input
                          type="text"
                          value={manualDepartureLocation}
                          onChange={(e) => setManualDepartureLocation(e.target.value)}
                          placeholder="Ví dụ: Sân bay Nội Bài / Đà Nẵng"
                          className="w-full px-3 py-2 rounded-lg border border-[#1E1A15]/12 bg-[#F8F4EC] text-xs font-semibold text-[#1E1A15] outline-none focus:border-clay-600"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#5A5145]">Điểm Kết Thúc Chuyến Đi</label>
                        <input
                          type="text"
                          value={manualEndingLocation}
                          onChange={(e) => setManualEndingLocation(e.target.value)}
                          placeholder="Ví dụ: TP. Hồ Chí Minh / Hà Nội"
                          className="w-full px-3 py-2 rounded-lg border border-[#1E1A15]/12 bg-[#F8F4EC] text-xs font-semibold text-[#1E1A15] outline-none focus:border-clay-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Khối 2: Đối Tượng Khách & Phương Tiện */}
                  <div className="p-4 rounded-xl bg-white border border-[#1E1A15]/10 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#1E1A15]/10 text-xs font-extrabold text-[#1E1A15]">
                      <Bus className="w-4 h-4 text-clay-600" />
                      <span>2. Đối Tượng Khách & Phương Tiện Di Chuyển</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[11px] font-bold text-[#5A5145]">Đối Tượng Khách & Phân Khúc</label>
                        <input
                          type="text"
                          value={manualTargetAudience}
                          onChange={(e) => setManualTargetAudience(e.target.value)}
                          placeholder="Ví dụ: Gia đình có trẻ nhỏ, Cặp đôi, Nhóm bạn trẻ..."
                          className="w-full px-3 py-2 rounded-lg border border-[#1E1A15]/12 bg-[#F8F4EC] text-xs font-semibold text-[#1E1A15] outline-none focus:border-clay-600"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#5A5145]">Số Khách Tối Đa</label>
                        <input
                          type="number"
                          value={manualMaxGroupSize}
                          onChange={(e) => setManualMaxGroupSize(Number(e.target.value))}
                          placeholder="20"
                          className="w-full px-3 py-2 rounded-lg border border-[#1E1A15]/12 bg-[#F8F4EC] text-xs font-semibold text-[#1E1A15] outline-none focus:border-clay-600"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#5A5145]">Phương Tiện Di Chuyển Chính</label>
                      <input
                        type="text"
                        value={manualTransportation}
                        onChange={(e) => setManualTransportation(e.target.value)}
                        placeholder="Ví dụ: Máy bay khứ hồi + Xe du lịch Universe đời mới 29-45 chỗ..."
                        className="w-full px-3 py-2 rounded-lg border border-[#1E1A15]/12 bg-[#F8F4EC] text-xs font-semibold text-[#1E1A15] outline-none focus:border-clay-600"
                      />
                    </div>
                  </div>

                  {/* Khối 3: Ẩm Thực & Lưu Trú */}
                  <div className="p-4 rounded-xl bg-white border border-[#1E1A15]/10 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#1E1A15]/10 text-xs font-extrabold text-[#1E1A15]">
                      <Coffee className="w-4 h-4 text-clay-600" />
                      <span>3. Ẩm Thực & Tiêu Chuẩn Lưu Trú</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#5A5145]">Kế Hoạch & Thực Đơn Ăn Uống (Sáng, Trưa, Tối)</label>
                      <textarea
                        rows={2}
                        value={manualMealPlan}
                        onChange={(e) => setManualMealPlan(e.target.value)}
                        placeholder="Ví dụ: Bữa sáng buffet tại khách sạn, bữa trưa thưởng thức đặc sản 150.000đ/suất..."
                        className="w-full px-3 py-2 rounded-lg border border-[#1E1A15]/12 bg-[#F8F4EC] text-xs font-medium text-[#1E1A15] outline-none focus:border-clay-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#5A5145]">Thông Tin Khách Sạn & Loại Phòng</label>
                      <textarea
                        rows={2}
                        value={manualAccommodationInfo}
                        onChange={(e) => setManualAccommodationInfo(e.target.value)}
                        placeholder="Ví dụ: Khách sạn 4 sao gần biển, phòng Deluxe 2 khách/phòng tiện nghi hiện đại..."
                        className="w-full px-3 py-2 rounded-lg border border-[#1E1A15]/12 bg-[#F8F4EC] text-xs font-medium text-[#1E1A15] outline-none focus:border-clay-600"
                      />
                    </div>
                  </div>

                  {/* Khối 4: Chi Phí Phụ Thu */}
                  <div className="p-4 rounded-xl bg-white border border-[#1E1A15]/10 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#1E1A15]/10 text-xs font-extrabold text-[#1E1A15]">
                      <DollarSign className="w-4 h-4 text-clay-600" />
                      <span>4. Chính Sách Giá Trẻ Em & Phụ Thu Phòng Đơn</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#5A5145]">Giá Tour Trẻ Em (VNĐ)</label>
                        <input
                          type="text"
                          value={manualChildPrice}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, '');
                            setManualChildPrice(raw ? Number(raw).toLocaleString('en-US') : '');
                          }}
                          placeholder="Ví dụ: 3,500,000"
                          className="w-full px-3 py-2 rounded-lg border border-[#1E1A15]/12 bg-[#F8F4EC] text-xs font-semibold text-[#1E1A15] outline-none focus:border-clay-600"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#5A5145]">Phụ Thu Phòng Đơn (VNĐ)</label>
                        <input
                          type="text"
                          value={manualSingleRoomSurcharge}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, '');
                            setManualSingleRoomSurcharge(raw ? Number(raw).toLocaleString('en-US') : '');
                          }}
                          placeholder="Ví dụ: 1,200,000"
                          className="w-full px-3 py-2 rounded-lg border border-[#1E1A15]/12 bg-[#F8F4EC] text-xs font-semibold text-[#1E1A15] outline-none focus:border-clay-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Khối 5: Dịch Vụ Bao Gồm & Không Bao Gồm */}
                  <div className="p-4 rounded-xl bg-white border border-[#1E1A15]/10 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#1E1A15]/10 text-xs font-extrabold text-[#1E1A15]">
                      <FileText className="w-4 h-4 text-clay-600" />
                      <span>5. Danh Mục Dịch Vụ Đi Kèm</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#5A5145]">Dịch Vụ Bao Gồm (Inclusions)</label>
                      <textarea
                        rows={3}
                        value={manualServicesIncluded}
                        onChange={(e) => setManualServicesIncluded(e.target.value)}
                        placeholder="✅ Vé máy bay, khách sạn, vé tham quan, ăn uống theo tour, bảo hiểm du lịch..."
                        className="w-full px-3 py-2 rounded-lg border border-[#1E1A15]/12 bg-[#F8F4EC] text-xs font-medium text-[#1E1A15] outline-none focus:border-clay-600 font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#5A5145]">Dịch Vụ Không Bao Gồm (Exclusions)</label>
                      <textarea
                        rows={3}
                        value={manualServicesExcluded}
                        onChange={(e) => setManualServicesExcluded(e.target.value)}
                        placeholder="❌ Thuế VAT, chi phí cá nhân, đồ uống minibar, tiền tip HDV & tài xế..."
                        className="w-full px-3 py-2 rounded-lg border border-[#1E1A15]/12 bg-[#F8F4EC] text-xs font-medium text-[#1E1A15] outline-none focus:border-clay-600 font-sans"
                      />
                    </div>
                  </div>

                  {/* Khối 6: Hướng Dẫn Viên & Chính Sách */}
                  <div className="p-4 rounded-xl bg-white border border-[#1E1A15]/10 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#1E1A15]/10 text-xs font-extrabold text-[#1E1A15]">
                      <ShieldCheck className="w-4 h-4 text-clay-600" />
                      <span>6. Hướng Dẫn Viên, Chính Sách Hủy Tour & Hành Lý</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#5A5145]">Thông Tin & Nhiệm Vụ Hướng Dẫn Viên</label>
                      <input
                        type="text"
                        value={manualTourGuideInfo}
                        onChange={(e) => setManualTourGuideInfo(e.target.value)}
                        placeholder="Ví dụ: Hướng dẫn viên thẻ quốc tế nhiệt tình, thuyết minh suốt tuyến..."
                        className="w-full px-3 py-2 rounded-lg border border-[#1E1A15]/12 bg-[#F8F4EC] text-xs font-semibold text-[#1E1A15] outline-none focus:border-clay-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#5A5145]">Chính Sách Đặt Cọc, Thanh Toán & Hủy Tour</label>
                      <textarea
                        rows={2}
                        value={manualCancellationPolicy}
                        onChange={(e) => setManualCancellationPolicy(e.target.value)}
                        placeholder="Ví dụ: Cọc 50% khi đăng ký. Hủy trước 7 ngày hoàn 100%, hủy trước 3 ngày phạt 50%..."
                        className="w-full px-3 py-2 rounded-lg border border-[#1E1A15]/12 bg-[#F8F4EC] text-xs font-medium text-[#1E1A15] outline-none focus:border-clay-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#5A5145]">Lưu Ý Hành Lý, Giấy Tờ & Trang Phục</label>
                      <textarea
                        rows={2}
                        value={manualPackingNotes}
                        onChange={(e) => setManualPackingNotes(e.target.value)}
                        placeholder="Ví dụ: Mang CCCD/Hộ chiếu gốc còn hạn, trang phục kín đáo khi viếng chùa, kem chống nắng..."
                        className="w-full px-3 py-2 rounded-lg border border-[#1E1A15]/12 bg-[#F8F4EC] text-xs font-medium text-[#1E1A15] outline-none focus:border-clay-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-[#1E1A15]/10 flex items-center justify-between gap-3">
                {manualModalTab === 'basic' ? (
                  <button
                    type="button"
                    onClick={() => setManualModalTab('tourStandard')}
                    className="px-4 py-2 rounded-lg bg-clay-50 hover:bg-clay-100 text-clay-700 font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-clay-200"
                  >
                    <span>Điền chuẩn lữ hành 15 tiêu chuẩn</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setManualModalTab('basic')}
                    className="px-4 py-2 rounded-lg bg-[#F2ECE1] hover:bg-[#E7DFD2] text-[#5A5145] font-extrabold text-xs transition-colors cursor-pointer"
                  >
                    ← Quay lại thông tin cơ bản
                  </button>
                )}

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsManualCreateOpen(false)}
                    className="px-4 py-2.5 rounded-lg bg-[#F2ECE1] hover:bg-[#E7DFD2] text-[#5A5145] font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-clay-600 hover:bg-clay-700 text-white font-extrabold text-xs sm:text-sm transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tạo Chuyến Đi Ngay 🎉</span>
                  </button>
                </div>
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
