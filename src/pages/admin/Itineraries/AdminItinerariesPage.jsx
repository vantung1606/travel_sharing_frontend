import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '../../../components/common/Toast';
import { useApp } from '../../../context/AppContext';
import { itineraryApi } from '../../../services/api';
import { UserAvatar } from '../../../components/common/UserAvatar';
import { ItineraryDetailModal } from '../../../components/itinerary/ItineraryDetailModal';
import { 
  Route, Search, Calendar, MapPin, Eye, Trash2, RefreshCw, 
  Download, Globe, Lock, Sparkles, Compass, DollarSign, 
  ChevronLeft, ChevronRight, Check, X, Users, Tag, Loader2
} from 'lucide-react';

export const AdminItinerariesPage = () => {
  const toast = useToast();
  const { currentUser } = useApp();

  // Data & Loading States
  const [itineraries, setItineraries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('ALL'); // 'ALL' | 'PUBLIC' | 'PRIVATE'
  const [sourceFilter, setSourceFilter] = useState('ALL'); // 'ALL' | 'AI' | 'MANUAL'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'COMPLETED' | 'DRAFT' | 'CANCELLED'
  const [budgetFilter, setBudgetFilter] = useState('ALL'); // 'ALL' | 'HAS_BUDGET' | 'NO_BUDGET'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'budget_desc' | 'budget_asc'

  // Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState([]);

  // Detail & Delete Modals
  const [loadingDetailId, setLoadingDetailId] = useState(null);
  const [selectedItineraryModal, setSelectedItineraryModal] = useState(null);
  const [deleteConfirmItinerary, setDeleteConfirmItinerary] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all system itineraries from Database
  const fetchItineraries = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const data = await itineraryApi.getAllItineraries();
      setItineraries(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách lịch trình: ' + (err.message || 'Không thể kết nối đến máy chủ.'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchItineraries();
  }, [fetchItineraries]);

  // Statistics KPIs based on real Database Schema
  const stats = useMemo(() => {
    const total = itineraries.length;
    const publicCount = itineraries.filter(it => it.isPublic).length;
    const privateCount = total - publicCount;
    const aiCount = itineraries.filter(it => it.isAiGenerated || (it.title && it.title.toLowerCase().includes('ai'))).length;
    const hasBudgetCount = itineraries.filter(it => it.budgetTotal && Number(it.budgetTotal) > 0).length;
    const totalBudget = itineraries.reduce((sum, it) => sum + (Number(it.budgetTotal) || 0), 0);

    return { total, publicCount, privateCount, aiCount, hasBudgetCount, totalBudget };
  }, [itineraries]);

  // Filtered & Sorted Itineraries
  const filteredItineraries = useMemo(() => {
    return itineraries.filter(it => {
      // Visibility Filter
      if (visibilityFilter === 'PUBLIC' && !it.isPublic) return false;
      if (visibilityFilter === 'PRIVATE' && it.isPublic) return false;

      // Source Filter
      const isAi = it.isAiGenerated || (it.title && it.title.toLowerCase().includes('ai'));
      if (sourceFilter === 'AI' && !isAi) return false;
      if (sourceFilter === 'MANUAL' && isAi) return false;

      // Status Filter (ACTIVE, COMPLETED, DRAFT, CANCELLED)
      if (statusFilter !== 'ALL') {
        const itemStatus = (it.status || 'ACTIVE').toUpperCase();
        if (itemStatus !== statusFilter) return false;
      }

      // Budget Filter (HAS_BUDGET vs NO_BUDGET)
      const hasBudget = it.budgetTotal && Number(it.budgetTotal) > 0;
      if (budgetFilter === 'HAS_BUDGET' && !hasBudget) return false;
      if (budgetFilter === 'NO_BUDGET' && hasBudget) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = it.title?.toLowerCase().includes(q);
        const destMatch = it.destination?.toLowerCase().includes(q);
        const creatorMatch = it.creatorName?.toLowerCase().includes(q) || it.creatorEmail?.toLowerCase().includes(q);
        const styleMatch = it.travelStyle?.toLowerCase().includes(q);
        const groupMatch = it.groupType?.toLowerCase().includes(q);
        const idMatch = String(it.id).includes(q);
        if (!titleMatch && !destMatch && !creatorMatch && !idMatch && !styleMatch && !groupMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (sortBy === 'budget_desc') {
        return (Number(b.budgetTotal) || 0) - (Number(a.budgetTotal) || 0);
      }
      if (sortBy === 'budget_asc') {
        return (Number(a.budgetTotal) || 0) - (Number(b.budgetTotal) || 0);
      }
      return 0;
    });
  }, [itineraries, visibilityFilter, sourceFilter, statusFilter, budgetFilter, searchQuery, sortBy]);

  // Paginated Data
  const totalPages = Math.ceil(filteredItineraries.length / itemsPerPage) || 1;
  const paginatedItineraries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItineraries.slice(start, start + itemsPerPage);
  }, [filteredItineraries, currentPage]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [searchQuery, visibilityFilter, sourceFilter, statusFilter, budgetFilter, sortBy]);

  // Transform Backend DTO into Modal-compatible Itinerary object
  const mapDtoToModalItinerary = useCallback((dto) => {
    if (!dto) return null;

    // Calculate days from details or durationDays
    const details = Array.isArray(dto.details) ? dto.details : [];
    const dayNumbers = details.map(d => d.dayNumber).filter(Boolean);
    const daysCount = dto.durationDays || (dayNumbers.length > 0 ? Math.max(...dayNumbers, 1) : 1);

    const dayMap = {};
    for (let i = 1; i <= daysCount; i++) {
      dayMap[i] = {
        dayNumber: i,
        title: `Ngày ${i}: Khám phá ${dto.destination || 'Điểm đến'}`,
        activities: []
      };
    }

    details.forEach(d => {
      const dayNum = d.dayNumber || 1;
      if (!dayMap[dayNum]) {
        dayMap[dayNum] = {
          dayNumber: dayNum,
          title: `Ngày ${dayNum}: Khám phá ${dto.destination || 'Điểm đến'}`,
          activities: []
        };
      }
      dayMap[dayNum].activities.push({
        id: d.id || Math.random(),
        time: d.startTime ? d.startTime.substring(0, 5) : '08:30',
        title: d.locationName || 'Điểm tham quan',
        location: d.locationName || dto.destination,
        address: d.locationAddress || `${dto.destination || 'Việt Nam'}`,
        category: d.category || 'Khám phá',
        note: d.note || d.transitInfo || '',
        cost: d.estimatedCost ? `${Number(d.estimatedCost).toLocaleString('vi-VN')} ₫` : ''
      });
    });

    const days = Object.values(dayMap).sort((a, b) => a.dayNumber - b.dayNumber);

    return {
      id: dto.id,
      title: dto.title,
      destination: dto.destination,
      region: dto.destination,
      coverImage: dto.coverImageUrl || null,
      coverImageUrl: dto.coverImageUrl || null,
      duration: `${daysCount}N${Math.max(1, daysCount - 1)}Đ`,
      daysCount: daysCount,
      status: (dto.status || 'ACTIVE').toLowerCase(),
      isAiGenerated: Boolean(dto.isAiGenerated),
      isPublic: dto.isPublic !== false,
      creatorId: dto.creatorId,
      creatorName: dto.creatorName,
      creatorEmail: dto.creatorEmail,
      creatorAvatar: dto.creatorAvatar,
      startDate: dto.startDate || null,
      endDate: dto.endDate || null,
      groupType: dto.groupType || 'Cá nhân',
      travelStyle: dto.travelStyle || 'Nghỉ dưỡng & Khám phá',
      totalBudget: dto.budgetTotal ? Number(dto.budgetTotal) : 0,
      budgetTotal: dto.budgetTotal ? Number(dto.budgetTotal) : 0,
      budgetNote: dto.budgetTotal ? `Dự toán: ${Number(dto.budgetTotal).toLocaleString('vi-VN')} ₫` : 'Chưa thiết lập dự toán',
      days: days.length > 0 ? days : [
        {
          dayNumber: 1,
          title: `Ngày 1: Khám phá ${dto.destination || 'Việt Nam'}`,
          activities: []
        }
      ],
      members: dto.members || [],
      expenses: dto.expenses || [],
      budgetSummary: dto.budgetSummary || null
    };
  }, []);

  // Handle View Detail (Con mắt): Fetch full detail from backend and open modal
  const handleOpenDetailModal = async (itinerarySummary) => {
    if (!itinerarySummary?.id) return;
    setLoadingDetailId(itinerarySummary.id);
    try {
      // Gọi API lấy dữ liệu đầy đủ chi tiết từ CSDL
      const fullDto = await itineraryApi.getItineraryById(itinerarySummary.id, currentUser?.email);
      const mapped = mapDtoToModalItinerary(fullDto || itinerarySummary);
      setSelectedItineraryModal(mapped);
    } catch (err) {
      console.warn('Could not fetch full itinerary details, using summary data:', err);
      // Fallback: sử dụng dữ liệu summary hiện có
      const mappedFallback = mapDtoToModalItinerary(itinerarySummary);
      setSelectedItineraryModal(mappedFallback);
    } finally {
      setLoadingDetailId(null);
    }
  };

  // Toggle Visibility for a single itinerary
  const handleToggleVisibility = async (itinerary) => {
    try {
      const updated = await itineraryApi.toggleVisibility(itinerary.id, !itinerary.isPublic);
      setItineraries(prev => prev.map(item => item.id === itinerary.id ? { ...item, isPublic: updated?.isPublic ?? !item.isPublic } : item));
      toast.success(`Đã chuyển lịch trình "${itinerary.title}" sang chế độ ${!itinerary.isPublic ? 'CÔNG KHAI' : 'RIÊNG TƯ'}!`);
    } catch (err) {
      toast.error('Lỗi khi thay đổi trạng thái: ' + (err.message || 'Thao tác thất bại'));
    }
  };

  // Delete a single itinerary
  const handleDeleteItinerary = async () => {
    if (!deleteConfirmItinerary) return;
    setIsSubmitting(true);
    try {
      await itineraryApi.deleteItinerary(deleteConfirmItinerary.id);
      setItineraries(prev => prev.filter(item => item.id !== deleteConfirmItinerary.id));
      setSelectedIds(prev => prev.filter(id => id !== deleteConfirmItinerary.id));
      toast.success(`Đã xóa vĩnh viễn lịch trình "${deleteConfirmItinerary.title}" thành công!`);
      setDeleteConfirmItinerary(null);
    } catch (err) {
      toast.error('Lỗi khi xóa lịch trình: ' + (err.message || 'Thao tác thất bại'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk Actions
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedItineraries.map(it => it.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkToggleVisibility = async (makePublic) => {
    if (selectedIds.length === 0) return;
    setIsSubmitting(true);
    try {
      let count = 0;
      for (const id of selectedIds) {
        try {
          await itineraryApi.toggleVisibility(id, makePublic);
          count++;
        } catch (e) {
          console.warn(`Bulk toggle failed for id ${id}:`, e);
        }
      }
      toast.success(`Đã cập nhật chế độ cho ${count} lịch trình thành công!`);
      fetchItineraries(true);
      setSelectedIds([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedIds.length} lịch trình đã chọn khỏi hệ thống CSDL?`)) return;

    setIsSubmitting(true);
    try {
      let count = 0;
      for (const id of selectedIds) {
        try {
          await itineraryApi.deleteItinerary(id);
          count++;
        } catch (e) {
          console.warn(`Bulk delete failed for id ${id}:`, e);
        }
      }
      toast.success(`Đã xóa ${count} lịch trình thành công!`);
      fetchItineraries(true);
      setSelectedIds([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export Full CSV matching real Database Columns with UTF-8 BOM
  const handleExportCSV = () => {
    if (filteredItineraries.length === 0) {
      toast.error('Không có dữ liệu lịch trình để xuất.');
      return;
    }

    const headers = [
      'Mã Lịch Trình (ID)',
      'Tiêu Đề',
      'Điểm Đến',
      'Người Tạo',
      'Email Người Tạo',
      'Ngày Bắt Đầu',
      'Ngày Kết Thúc',
      'Số Ngày',
      'Trạng Thái Chuyến Đi',
      'Kiểu Nhóm',
      'Phong Cách Du Lịch',
      'Dự Toán Ngân Sách (VND)',
      'Chế Độ Hiển Thị',
      'Nguồn Khởi Tạo',
      'Ngày Tạo'
    ];

    const rows = filteredItineraries.map(it => [
      `"${it.id}"`,
      `"${(it.title || '').replace(/"/g, '""')}"`,
      `"${(it.destination || '').replace(/"/g, '""')}"`,
      `"${(it.creatorName || it.creator?.fullName || 'Ẩn danh').replace(/"/g, '""')}"`,
      `"${(it.creatorEmail || it.creator?.email || '').replace(/"/g, '""')}"`,
      `"${it.startDate || ''}"`,
      `"${it.endDate || ''}"`,
      `"${it.durationDays || 1}"`,
      `"${it.status || 'ACTIVE'}"`,
      `"${(it.groupType || 'Cá nhân').replace(/"/g, '""')}"`,
      `"${(it.travelStyle || 'Khám phá').replace(/"/g, '""')}"`,
      `"${it.budgetTotal ? Number(it.budgetTotal) : 'Chưa thiết lập'}"`,
      `"${it.isPublic ? 'Công khai' : 'Riêng tư'}"`,
      `"${it.isAiGenerated || (it.title && it.title.toLowerCase().includes('ai')) ? 'AI Khởi tạo' : 'Du khách tự tạo'}"`,
      `"${it.createdAt ? new Date(it.createdAt).toLocaleString('vi-VN') : ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `wayfare_itineraries_db_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Đã xuất ${filteredItineraries.length} bản ghi lịch trình ra CSV thành công!`);
  };

  const formatVND = (num) => {
    if (!num || Number(num) <= 0) return null;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(num));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  // Helper for Status Badge matching CSDL
  const renderStatusBadge = (status) => {
    const s = (status || 'ACTIVE').toUpperCase();
    switch (s) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
            Hoạt động
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold">
            Hoàn thành
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
            Bản nháp
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ─── 1. HEADER SECTION ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-ink-200/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-serif text-clay-700 font-bold uppercase tracking-wider mb-1">
            <span>Hệ Thống Quản Trị</span>
            <span>•</span>
            <span>Quản Lý Nội Dung</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-ink-900 tracking-tight flex items-center gap-3">
            <Route className="w-7 h-7 text-clay-600" />
            <span>Quản Lý Lịch Trình Du Lịch</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-500 font-serif mt-1">
            Theo dõi, kiểm duyệt và quản lý toàn bộ các lộ trình du lịch thực tế lưu trữ trong CSDL MySQL.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => fetchItineraries(true)}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-[5px] bg-[#FFFDF8] hover:bg-[#F8F4EC] text-ink-700 font-bold text-xs border border-ink-200/80 flex items-center gap-2 transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
            title="Đồng bộ dữ liệu trực tiếp từ CSDL"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-clay-600' : ''}`} />
            <span className="hidden sm:inline">Làm mới CSDL</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-[5px] bg-clay-700 hover:bg-clay-800 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Danh Sách CSV</span>
          </button>
        </div>
      </div>

      {/* ─── 2. STATISTIC KPI CARDS (MATCHING CSDL) ────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-ink-400 uppercase tracking-wider block">Tổng Lịch Trình</span>
          <p className="text-xl sm:text-2xl font-black text-ink-900 font-display">{stats.total}</p>
          <span className="text-[10px] text-ink-500 font-sans">Bản ghi trong CSDL</span>
        </div>

        <div className="p-4 rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block flex items-center gap-1">
            <Globe className="w-3 h-3" /> Công Khai
          </span>
          <p className="text-xl sm:text-2xl font-black text-emerald-800 font-display">{stats.publicCount}</p>
          <span className="text-[10px] text-emerald-600 font-sans">Hiển thị cộng đồng</span>
        </div>

        <div className="p-4 rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block flex items-center gap-1">
            <Lock className="w-3 h-3" /> Riêng Tư
          </span>
          <p className="text-xl sm:text-2xl font-black text-slate-800 font-display">{stats.privateCount}</p>
          <span className="text-[10px] text-slate-500 font-sans">Chỉ tác giả & đoàn</span>
        </div>

        <div className="p-4 rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> AI Khởi Tạo
          </span>
          <p className="text-xl sm:text-2xl font-black text-amber-800 font-display">{stats.aiCount}</p>
          <span className="text-[10px] text-amber-600 font-sans">Sinh tự động qua AI</span>
        </div>

        <div className="p-4 rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-clay-700 uppercase tracking-wider block flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> Có Dự Toán
          </span>
          <p className="text-xl sm:text-2xl font-black text-clay-800 font-display">{stats.hasBudgetCount}</p>
          <span className="text-[10px] text-clay-600 font-sans">Đã nhập ngân sách</span>
        </div>

        <div className="p-4 rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-ink-400 uppercase tracking-wider block flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> Tổng Ngân Sách
          </span>
          <p className="text-sm sm:text-base font-black text-ink-900 font-display truncate" title={formatVND(stats.totalBudget) || '0 ₫'}>
            {formatVND(stats.totalBudget) || '0 ₫'}
          </p>
          <span className="text-[10px] text-ink-500 font-sans">Tổng giá trị dự toán</span>
        </div>
      </div>

      {/* ─── 3. FILTER & SEARCH CONTROLS ───────────────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          
          {/* Search Bar */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tiêu đề, điểm đến, tác giả..."
              className="w-full pl-9 pr-8 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] text-xs font-sans text-ink-800 placeholder:text-ink-400 outline-none focus:border-clay-500 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Visibility Filter */}
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="px-3 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] text-xs font-sans font-bold text-ink-700 outline-none cursor-pointer focus:border-clay-500 focus:bg-white"
          >
            <option value="ALL">Hiển thị: Tất cả</option>
            <option value="PUBLIC">🌐 Công khai</option>
            <option value="PRIVATE">🔒 Riêng tư</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] text-xs font-sans font-bold text-ink-700 outline-none cursor-pointer focus:border-clay-500 focus:bg-white"
          >
            <option value="ALL">Nguồn: Tất cả</option>
            <option value="AI">✨ AI Khởi tạo</option>
            <option value="MANUAL">🧭 Du khách tự tạo</option>
          </select>

          {/* Budget Filter (Có dự toán hay không có) */}
          <select
            value={budgetFilter}
            onChange={(e) => setBudgetFilter(e.target.value)}
            className="px-3 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] text-xs font-sans font-bold text-ink-700 outline-none cursor-pointer focus:border-clay-500 focus:bg-white"
          >
            <option value="ALL">Dự toán: Tất cả</option>
            <option value="HAS_BUDGET">💰 Có dự toán</option>
            <option value="NO_BUDGET">⚪ Chưa thiết lập</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] text-xs font-sans font-bold text-ink-700 outline-none cursor-pointer focus:border-clay-500 focus:bg-white"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="budget_desc">Ngân sách cao</option>
            <option value="budget_asc">Ngân sách thấp</option>
          </select>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-clay-50 border border-clay-200 rounded-[5px] flex items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
            <span className="font-bold text-clay-800 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-clay-700" />
              Đã chọn {selectedIds.length} lịch trình
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleBulkToggleVisibility(true)}
                disabled={isSubmitting}
                className="px-2.5 py-1 rounded bg-emerald-700 text-white font-bold text-[11px] hover:bg-emerald-800 transition cursor-pointer disabled:opacity-50"
              >
                Chuyển Công Khai
              </button>
              <button
                type="button"
                onClick={() => handleBulkToggleVisibility(false)}
                disabled={isSubmitting}
                className="px-2.5 py-1 rounded bg-slate-700 text-white font-bold text-[11px] hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
              >
                Chuyển Riêng Tư
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={isSubmitting}
                className="px-2.5 py-1 rounded bg-rose-700 text-white font-bold text-[11px] hover:bg-rose-800 transition cursor-pointer disabled:opacity-50"
              >
                Xóa Vĩnh Viễn
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── 4. DATA TABLE (MATCHING REAL CSDL COLUMNS) ────────────────────── */}
      <div className="rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-clay-600 animate-spin mx-auto" />
            <p className="text-xs font-sans text-ink-500 font-bold">Đang tải danh sách lịch trình từ cơ sở dữ liệu MySQL...</p>
          </div>
        ) : filteredItineraries.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Route className="w-10 h-10 text-ink-300 mx-auto" />
            <p className="text-sm font-serif font-bold text-ink-700">Không tìm thấy lịch trình nào phù hợp</p>
            <p className="text-xs font-sans text-ink-400">Hãy thử thay đổi từ khóa tìm kiếm hoặc các tiêu chí bộ lọc.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans border-collapse">
              <thead>
                <tr className="border-b border-ink-200/80 bg-[#F8F4EC] text-ink-700 font-bold text-[11px] uppercase tracking-wider">
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedIds.length === paginatedItineraries.length && paginatedItineraries.length > 0}
                      className="rounded accent-clay-600 cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5 min-w-[260px]">Lịch Trình & Điểm Đến</th>
                  <th className="p-3.5 min-w-[190px]">Người Tạo</th>
                  <th className="p-3.5 min-w-[140px]">Thời Gian Chuyến Đi</th>
                  <th className="p-3.5 min-w-[120px]">Trạng Thái CSDL</th>
                  <th className="p-3.5 text-right min-w-[140px]">Dự Toán Ngân Sách</th>
                  <th className="p-3.5 text-center min-w-[110px]">Hiển Thị</th>
                  <th className="p-3.5 text-center min-w-[100px]">Nguồn</th>
                  <th className="p-3.5 text-right min-w-[110px]">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {paginatedItineraries.map((it) => {
                  const isAi = it.isAiGenerated || (it.title && it.title.toLowerCase().includes('ai'));
                  const isSelected = selectedIds.includes(it.id);
                  const formattedBudget = formatVND(it.budgetTotal);
                  const isDetailLoading = loadingDetailId === it.id;

                  return (
                    <tr
                      key={it.id}
                      className={`hover:bg-[#F8F4EC]/60 transition-colors ${isSelected ? 'bg-clay-50/50' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(it.id)}
                          className="rounded accent-clay-600 cursor-pointer"
                        />
                      </td>

                      {/* Title & Destination */}
                      <td className="p-3.5">
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-[5px] bg-ink-100 overflow-hidden shrink-0 border border-ink-200/60 relative">
                            {it.coverImageUrl ? (
                              <img
                                src={it.coverImageUrl}
                                alt={it.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-clay-50 text-clay-600">
                                <Route className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] text-ink-400 font-bold">#{it.id}</span>
                              <h4
                                onClick={() => handleOpenDetailModal(it)}
                                className="font-display font-black text-ink-900 text-xs sm:text-sm hover:text-clay-700 cursor-pointer truncate max-w-[240px]"
                                title={it.title}
                              >
                                {it.title}
                              </h4>
                            </div>
                            <p className="text-[11px] text-ink-500 flex items-center gap-1 truncate max-w-[240px]">
                              <MapPin className="w-3 h-3 text-clay-600 shrink-0" />
                              <span>{it.destination || 'Chưa cập nhật điểm đến'}</span>
                            </p>
                            {(it.groupType || it.travelStyle) && (
                              <div className="flex items-center gap-1 text-[10px] text-ink-400">
                                {it.groupType && <span className="bg-[#F8F4EC] px-1.5 py-0.2 rounded border border-ink-200/60">{it.groupType}</span>}
                                {it.travelStyle && <span className="bg-[#F8F4EC] px-1.5 py-0.2 rounded border border-ink-200/60">{it.travelStyle}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Creator */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            user={{
                              name: it.creatorName || it.creator?.fullName || 'Ẩn danh',
                              avatar: it.creatorAvatar || it.creator?.avatar
                            }}
                            size={28}
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-ink-800 text-[11px] truncate">
                              {it.creatorName || it.creator?.fullName || 'Ẩn danh'}
                            </p>
                            <p className="text-[10px] text-ink-400 truncate font-mono">
                              {it.creatorEmail || it.creator?.email || '—'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Duration / Dates */}
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-ink-800 text-xs">
                            {it.durationDays ? `${it.durationDays} ngày` : '1 ngày'}
                          </span>
                          <p className="text-[10px] text-ink-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(it.startDate)}</span>
                          </p>
                        </div>
                      </td>

                      {/* Status CSDL */}
                      <td className="p-3.5">
                        {renderStatusBadge(it.status)}
                      </td>

                      {/* Budget Total (Có hoặc Không Có) */}
                      <td className="p-3.5 text-right font-mono font-bold">
                        {formattedBudget ? (
                          <span className="text-ink-800">{formattedBudget}</span>
                        ) : (
                          <span className="text-ink-400 font-sans italic text-xs font-normal">Chưa thiết lập</span>
                        )}
                      </td>

                      {/* Visibility Toggle Badge */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(it)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] text-[11px] font-bold border transition-colors cursor-pointer ${
                            it.isPublic
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                          }`}
                          title="Bấm để chuyển đổi trạng thái Công khai / Riêng tư"
                        >
                          {it.isPublic ? (
                            <>
                              <Globe className="w-3 h-3 text-emerald-600" />
                              <span>Công khai</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3 text-slate-500" />
                              <span>Riêng tư</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Source Badge */}
                      <td className="p-3.5 text-center">
                        {isAi ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-amber-50 text-amber-800 border border-amber-300 font-bold text-[10px]">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            <span>AI Sinh</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#F8F4EC] text-ink-600 border border-ink-200/80 font-bold text-[10px]">
                            <Compass className="w-3 h-3 text-clay-600" />
                            <span>Tự tạo</span>
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Nút Con Mắt xem chi tiết */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetailModal(it)}
                            disabled={isDetailLoading}
                            className="p-1.5 rounded-[4px] text-ink-600 hover:text-ink-900 hover:bg-[#F8F4EC] border border-transparent hover:border-ink-200/60 transition cursor-pointer disabled:opacity-50"
                            title="Bấm vào để xem toàn bộ chi tiết lịch trình, bản đồ và các ngày khám phá"
                          >
                            {isDetailLoading ? (
                              <Loader2 className="w-4 h-4 text-clay-600 animate-spin" />
                            ) : (
                              <Eye className="w-4 h-4 text-clay-600" />
                            )}
                          </button>

                          {/* Nút Xóa lịch trình */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmItinerary(it)}
                            className="p-1.5 rounded-[4px] text-ink-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                            title="Xóa vĩnh viễn lịch trình khỏi CSDL"
                          >
                            <Trash2 className="w-4 h-4 text-rose-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!isLoading && filteredItineraries.length > 0 && (
          <div className="p-4 border-t border-ink-200/80 bg-[#F8F4EC]/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-600">
            <div>
              Hiển thị <b>{(currentPage - 1) * itemsPerPage + 1}</b> - <b>{Math.min(currentPage * itemsPerPage, filteredItineraries.length)}</b> trong tổng số <b>{filteredItineraries.length}</b> lịch trình
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-[4px] bg-[#FFFDF8] border border-ink-200/80 hover:bg-[#F8F4EC] disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="px-3 py-1 font-bold text-ink-800">
                Trang {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-[4px] bg-[#FFFDF8] border border-ink-200/80 hover:bg-[#F8F4EC] disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── 5. ITINERARY DETAIL MODAL (CON MẮT THAO TÁC XEM) ──────────────── */}
      {selectedItineraryModal && (
        <ItineraryDetailModal
          itinerary={selectedItineraryModal}
          onClose={() => setSelectedItineraryModal(null)}
          onUpdate={(updatedItin) => {
            setSelectedItineraryModal(updatedItin);
            setItineraries(prev => prev.map(item => String(item.id) === String(updatedItin.id) ? { ...item, ...updatedItin } : item));
          }}
        />
      )}

      {/* ─── 6. DELETE CONFIRMATION MODAL (SOFT TRANSLUCENT BLUR) ─────────── */}
      {deleteConfirmItinerary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-[#FFFDF8] rounded-[6px] max-w-md w-full p-6 border border-ink-200 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-[5px] bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-black text-base text-ink-800">
                  Xóa vĩnh viễn lịch trình?
                </h3>
                <p className="text-xs text-ink-500 leading-relaxed font-sans">
                  Bạn có chắc chắn muốn xóa lịch trình <strong className="text-ink-900 font-bold">"{deleteConfirmItinerary.title}"</strong> (Điểm đến: {deleteConfirmItinerary.destination})?
                </p>
                <p className="text-[11px] text-rose-600 font-bold font-sans">
                  ⚠️ Toàn bộ các điểm dừng chân, ngân sách và liên kết bài viết sẽ bị xóa vĩnh viễn khỏi CSDL MySQL và không thể hoàn tác.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-ink-200/60 font-sans">
              <button
                type="button"
                onClick={() => setDeleteConfirmItinerary(null)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-[5px] bg-[#F8F4EC] hover:bg-ink-100 text-ink-700 font-bold text-xs border border-ink-200/80 transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteItinerary}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-[5px] bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <span>Xác Nhận Xóa</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
