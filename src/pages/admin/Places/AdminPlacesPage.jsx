import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '../../../components/common/Toast';
import { useApp } from '../../../context/AppContext';
import { placeApi } from '../../../services/api';
import { 
  MapPin, Check, X, Search, Star, Clock, ChevronRight, Eye, Trash2, 
  RefreshCw, ShieldCheck, Phone, AlertCircle, Plus, ExternalLink, 
  Filter, ChevronLeft, Building2, Tag, Compass, DollarSign, Image, 
  Navigation, CheckCircle2, AlertTriangle, EyeOff, Sparkles
} from 'lucide-react';

export const AdminPlacesPage = () => {
  const toast = useToast();
  const { currentUser } = useApp();

  // Tab & Filter States
  const [activeTab, setActiveTab] = useState('Đang hoạt động'); // 'Đang hoạt động' | 'Chờ duyệt' | 'Tất cả'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Data States
  const [pendingPlaces, setPendingPlaces] = useState([]);
  const [allPlaces, setAllPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [rejectModalData, setRejectModalData] = useState(null); // { id, name }
  const [rejectReason, setRejectReason] = useState('Thông tin địa chỉ hoặc định vị chưa chính xác');
  const [deleteModalData, setDeleteModalData] = useState(null); // { id, name }

  // New Place Form Data
  const initialFormState = {
    name: '',
    city: 'Đà Nẵng',
    categoryName: 'Danh lam thắng cảnh',
    address: '',
    latitude: '',
    longitude: '',
    ticketPrice: '',
    priceRange: 'Miễn phí',
    openHours: '07:00 - 22:00',
    phoneNumber: '',
    coverImageUrl: '',
    amenities: 'Wifi miễn phí, Chỗ đậu xe, Thanh toán thẻ, Chụp ảnh check-in',
    description: ''
  };
  const [newPlaceForm, setNewPlaceForm] = useState(initialFormState);

  // Common Categories List
  const CATEGORIES = [
    'Danh lam thắng cảnh',
    'Di tích lịch sử',
    'Ẩm thực & Nhà hàng',
    'Quán Cafe & Bar',
    'Khách sạn & Homestay',
    'Điểm check-in chụp ảnh',
    'Trải nghiệm văn hóa bản địa',
    'Khu vui chơi giải trí'
  ];

  // Fetch real data directly from backend database (Single Source of Truth)
  const loadData = useCallback(async (isManual = false) => {
    setIsLoading(true);
    try {
      const [pendingRes, allRes] = await Promise.all([
        placeApi.getPendingPlaces().catch(() => []),
        placeApi.getPlaces({ status: 'ALL' }).catch(() => [])
      ]);
      
      const pendingList = Array.isArray(pendingRes) ? pendingRes : [];
      const fullList = Array.isArray(allRes) ? allRes : [];

      setPendingPlaces(pendingList);
      setAllPlaces(fullList);

      // Preserve or set selected place
      if (selectedPlace) {
        const stillExists = [...pendingList, ...fullList].find(p => p.id === selectedPlace.id);
        if (stillExists) setSelectedPlace(stillExists);
        else setSelectedPlace(fullList[0] || pendingList[0] || null);
      } else {
        setSelectedPlace(fullList[0] || pendingList[0] || null);
      }

      if (isManual) {
        toast.success(`Đã đồng bộ ${fullList.length} địa điểm từ CSDL MySQL!`);
      }
    } catch (err) {
      console.error('Error fetching admin places:', err);
      toast.error('Không thể tải danh sách địa điểm: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPlace, toast]);

  useEffect(() => {
    loadData();
  }, []);

  // Reset page when switching tab or search
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, selectedCity, selectedCategory]);

  // Extract distinct cities from dataset
  const dynamicCities = useMemo(() => {
    const defaultCities = ['Đà Nẵng', 'Hà Giang', 'Hà Tĩnh', 'Đà Lạt', 'Hội An', 'Phú Quốc', 'Ninh Bình', 'Hà Nội', 'TP. Hồ Chí Minh', 'Nha Trang', 'Sa Pa', 'Quy Nhơn'];
    const dbCities = allPlaces.map(p => p.city).filter(Boolean);
    const set = new Set([...defaultCities, ...dbCities]);
    return Array.from(set).sort();
  }, [allPlaces]);

  // Handle Approve
  const handleApprove = async (id, name) => {
    setIsSubmitting(true);
    try {
      await placeApi.approvePlace(id);
      toast.success(`Đã phê duyệt "${name || 'địa điểm'}" lên bản đồ du lịch thành công!`);
      await loadData();
    } catch (err) {
      toast.error('Lỗi phê duyệt: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Submit Reject from Modal
  const confirmReject = async () => {
    if (!rejectModalData) return;
    setIsSubmitting(true);
    try {
      await placeApi.rejectPlace(rejectModalData.id, rejectReason || 'Không đạt tiêu chuẩn kiểm duyệt');
      toast.info(`Đã từ chối duyệt địa điểm "${rejectModalData.name}".`);
      setRejectModalData(null);
      await loadData();
    } catch (err) {
      toast.error('Lỗi từ chối: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Toggle Status (Active <-> Inactive)
  const handleToggleStatus = async (place) => {
    const nextStatus = place.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setIsSubmitting(true);
    try {
      await placeApi.updatePlaceStatus(place.id, nextStatus);
      toast.success(`Đã chuyển trạng thái sang "${nextStatus === 'ACTIVE' ? 'Hoạt động công khai' : 'Tạm ẩn'}"`);
      await loadData();
    } catch (err) {
      toast.error('Lỗi đổi trạng thái: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Confirm Delete from Modal
  const confirmDelete = async () => {
    if (!deleteModalData) return;
    setIsSubmitting(true);
    try {
      await placeApi.deletePlace(deleteModalData.id, currentUser?.email);
      toast.success(`Đã xóa vĩnh viễn địa điểm "${deleteModalData.name}" khỏi hệ thống.`);
      setDeleteModalData(null);
      await loadData();
    } catch (err) {
      toast.error('Lỗi xóa địa điểm: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Create New Place
  const handleCreatePlace = async (e) => {
    e.preventDefault();
    if (!newPlaceForm.name.trim()) {
      toast.error('Vui lòng nhập tên địa điểm!');
      return;
    }
    if (!newPlaceForm.address.trim()) {
      toast.error('Vui lòng nhập địa chỉ địa điểm!');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...newPlaceForm,
        ticketPrice: newPlaceForm.ticketPrice ? Number(newPlaceForm.ticketPrice) : 0,
        latitude: newPlaceForm.latitude ? Number(newPlaceForm.latitude) : null,
        longitude: newPlaceForm.longitude ? Number(newPlaceForm.longitude) : null,
        coverImageUrl: newPlaceForm.coverImageUrl.trim() || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
      };

      await placeApi.createPlace(payload, currentUser?.email);
      toast.success(`Đã thêm mới địa điểm "${newPlaceForm.name}" thành công!`);
      setIsCreateModalOpen(false);
      setNewPlaceForm(initialFormState);
      await loadData();
    } catch (err) {
      toast.error('Lỗi tạo địa điểm: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered dataset
  const filteredPlaces = useMemo(() => {
    let sourceList = [];
    if (activeTab === 'Chờ duyệt') {
      sourceList = pendingPlaces;
    } else if (activeTab === 'Đang hoạt động') {
      sourceList = allPlaces.filter(p => p.status === 'ACTIVE');
    } else {
      sourceList = allPlaces;
    }

    return sourceList.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q ||
        p.name?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.address?.toLowerCase().includes(q) ||
        p.ownerName?.toLowerCase().includes(q) ||
        String(p.id).includes(q);

      const matchCity = !selectedCity || p.city?.toLowerCase().includes(selectedCity.toLowerCase());
      const matchCategory = !selectedCategory || p.categoryName?.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchQuery && matchCity && matchCategory;
    });
  }, [activeTab, pendingPlaces, allPlaces, searchQuery, selectedCity, selectedCategory]);

  // Paginated dataset
  const totalPages = Math.max(1, Math.ceil(filteredPlaces.length / pageSize));
  const paginatedPlaces = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPlaces.slice(start, start + pageSize);
  }, [filteredPlaces, currentPage, pageSize]);

  // Metric stats calculation
  const totalActive = allPlaces.filter(p => p.status === 'ACTIVE').length;
  const avgRating = allPlaces.length > 0
    ? (allPlaces.reduce((sum, p) => sum + (Number(p.averageRating) || 0), 0) / allPlaces.length).toFixed(1)
    : '4.8';

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* ─── 1. BREADCRUMB & HEADER ACTION TOOLBAR ─────────────────────────────── */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>Quản trị hệ thống</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-sky-600 font-bold">Địa điểm & Điểm tham quan</span>
          </nav>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
              Quản lý Địa điểm & Phê duyệt Điểm Đến
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 font-bold text-xs border border-sky-100 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              Đồng bộ dữ liệu thời gian thực
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Hệ thống đang quản lý <strong className="text-slate-900 font-bold">{allPlaces.length}</strong> địa điểm du lịch, trong đó có <strong className="text-amber-600 font-bold">{pendingPlaces.length}</strong> yêu cầu gửi lên đang chờ kiểm duyệt.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 xl:pt-0">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
            title="Làm mới dữ liệu từ CSDL"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Đang tải...' : 'Làm mới'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm địa điểm mới</span>
          </button>
        </div>
      </div>

      {/* ─── 2. 4 METRIC CARDS GRID ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Pending Moderation */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs">
              <Clock className="w-5 h-5" />
            </div>
            {pendingPlaces.length > 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 animate-pulse">
                Cần xử lý gấp
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                Đã xử lý hết
              </span>
            )}
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Địa điểm chờ phê duyệt</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-2xl font-extrabold text-amber-600">{pendingPlaces.length}</span>
              <span className="text-xs text-slate-400 font-medium">yêu cầu mới</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Được gửi từ chủ quán & cộng đồng</p>
          </div>
        </div>

        {/* Metric 2: Active Places */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
              Đang công khai
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Địa điểm chính thức (Active)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-2xl font-extrabold text-slate-900">{totalActive}</span>
              <span className="text-xs text-slate-400 font-medium">điểm đến</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Hiển thị cho du khách trên bản đồ</p>
          </div>
        </div>

        {/* Metric 3: City Coverage */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-2xs">
              <Compass className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold border border-sky-100">
              Toàn quốc
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Độ phủ sóng địa lý</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-2xl font-extrabold text-slate-900">{dynamicCities.length}</span>
              <span className="text-xs text-slate-400 font-medium">tỉnh thành</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Trải dài khắp 3 miền Bắc - Trung - Nam</p>
          </div>
        </div>

        {/* Metric 4: Average Rating */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-2xs">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
              Chất lượng cao
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Đánh giá trung bình</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-2xl font-extrabold text-slate-900 flex items-center gap-1">
                {avgRating} <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </span>
              <span className="text-xs text-slate-400 font-medium">/ 5.0</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Dựa trên đánh giá từ cộng đồng du khách</p>
          </div>
        </div>

      </div>

      {/* ─── 3. STATUS TABS & SMART SEARCH / FILTER BAR ───────────────────────── */}
      <div className="space-y-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
          {[
            { label: 'Đang hoạt động', count: totalActive, badgeBg: 'bg-emerald-100 text-emerald-800' },
            { label: 'Chờ duyệt', count: pendingPlaces.length, badgeBg: 'bg-amber-100 text-amber-800' },
            { label: 'Tất cả', count: allPlaces.length, badgeBg: 'bg-slate-100 text-slate-700' }
          ].map(tab => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActiveTab(tab.label)}
              className={`px-4 py-2.5 rounded-full whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === tab.label
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                activeTab === tab.label ? 'bg-white/20 text-white' : tab.badgeBg
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên địa điểm, địa chỉ, số điện thoại, người gửi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 text-slate-800 rounded-full text-xs placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-sky-500/20 border border-slate-200 transition-all"
            />
          </div>

          {/* Dynamic City Filter */}
          <div className="w-full sm:w-48">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 text-slate-800 rounded-full text-xs font-semibold outline-none border border-slate-200 cursor-pointer"
            >
              <option value="">Tất cả tỉnh thành</option>
              {dynamicCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="w-full sm:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 text-slate-800 rounded-full text-xs font-semibold outline-none border border-slate-200 cursor-pointer"
            >
              <option value="">Tất cả danh mục</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ─── 4. MAIN DATA TABLE (COL 7) & STICKY DETAILS DRAWER (COL 5) ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Table Column (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col space-y-4 p-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-sm text-slate-900">
              Danh sách địa điểm ({filteredPlaces.length})
            </span>
            <span className="text-xs text-slate-400">
              Nhấp vào một dòng để xem chi tiết bên phải
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Tên Địa Điểm</th>
                  <th className="py-3.5 px-4">Tỉnh / Thành</th>
                  <th className="py-3.5 px-4">Đánh Giá</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-sky-500" />
                      Đang tải danh sách địa điểm từ cơ sở dữ liệu...
                    </td>
                  </tr>
                ) : paginatedPlaces.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400">
                      {activeTab === 'Chờ duyệt' ? (
                        <div className="space-y-2">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                          <p className="font-bold text-slate-800 text-sm">Không có địa điểm nào đang chờ phê duyệt!</p>
                          <p className="text-xs text-slate-500">Tất cả yêu cầu gửi lên đã được xử lý xong.</p>
                          <button
                            type="button"
                            onClick={() => setActiveTab('Đang hoạt động')}
                            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                          >
                            Xem {totalActive} địa điểm đang hoạt động →
                          </button>
                        </div>
                      ) : (
                        <div>
                          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                          Không tìm thấy địa điểm nào khớp với tiêu chí lọc.
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedPlaces.map(p => {
                    const isSelected = selectedPlace?.id === p.id;
                    const isPending = p.status === 'PENDING_APPROVAL';

                    return (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedPlace(p)}
                        className={`transition-colors cursor-pointer ${
                          isSelected ? 'bg-sky-50/80 border-l-4 border-l-sky-600' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Place Name & Thumbnail */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 shadow-2xs">
                              <img
                                src={p.coverImageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=150&q=80'}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="space-y-0.5 min-w-0">
                              <h4 className="font-bold text-slate-900 truncate max-w-[170px] sm:max-w-[200px]">{p.name}</h4>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                                  {p.categoryName || 'Tọa độ du lịch'}
                                </span>
                                {p.isVerifiedHost && (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-bold">
                                    Host uy tín
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* City & Address */}
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800 block truncate max-w-[120px]">{p.city || 'Việt Nam'}</span>
                          <span className="text-[10px] text-slate-400 truncate block max-w-[140px]">{p.address}</span>
                        </td>

                        {/* Rating */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 font-bold text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{p.averageRating ? Number(p.averageRating).toFixed(1) : '5.0'}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{p.reviewCount || 0} đánh giá</span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap inline-flex items-center gap-1 ${
                            isPending
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : p.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {isPending ? 'Chờ duyệt' : p.status === 'ACTIVE' ? 'Đã công khai' : 'Tạm ẩn'}
                          </span>
                        </td>

                        {/* Row Quick Actions */}
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex items-center gap-1">
                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApprove(p.id, p.name)}
                                  disabled={isSubmitting}
                                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                                  title="Phê duyệt nhanh"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRejectModalData({ id: p.id, name: p.name })}
                                  disabled={isSubmitting}
                                  className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-colors cursor-pointer"
                                  title="Từ chối duyệt"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => setDeleteModalData({ id: p.id, name: p.name })}
                              disabled={isSubmitting}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                              title="Xóa địa điểm"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
              <span>
                Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredPlaces.length)} trong số {filteredPlaces.length} địa điểm
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 font-bold text-slate-800">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Preview Drawer (5 Cols - Sticky) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 sticky top-20">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-sky-600" />
              Chi Tiết Địa Điểm
            </span>
            {selectedPlace && (
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                selectedPlace.status === 'PENDING_APPROVAL'
                  ? 'bg-amber-100 text-amber-800'
                  : selectedPlace.status === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {selectedPlace.status === 'PENDING_APPROVAL' ? 'Chờ phê duyệt' : selectedPlace.status === 'ACTIVE' ? 'Đã công khai' : 'Tạm ẩn'}
              </span>
            )}
          </div>

          {selectedPlace ? (
            <div className="space-y-3.5 text-xs">
              {/* Photo Cover */}
              <div className="h-44 rounded-2xl overflow-hidden relative shadow-sm bg-slate-100">
                <img
                  src={selectedPlace.coverImageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'}
                  alt={selectedPlace.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold">
                  {selectedPlace.categoryName || 'Tọa độ du lịch'}
                </span>
                <span className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-black/60 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {selectedPlace.averageRating ? Number(selectedPlace.averageRating).toFixed(1) : '5.0'} ({selectedPlace.reviewCount || 0})
                </span>
              </div>

              {/* Title, Address & GPS */}
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 leading-snug">{selectedPlace.name}</h3>
                <p className="text-slate-600 mt-1 flex items-start gap-1.5 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                  <span>{selectedPlace.address || selectedPlace.city || 'Chưa cập nhật địa chỉ'}</span>
                </p>

                {/* Google Maps External Link */}
                {selectedPlace.latitude && selectedPlace.longitude ? (
                  <div className="mt-2 flex items-center gap-2">
                    <a
                      href={`https://www.google.com/maps?q=${selectedPlace.latitude},${selectedPlace.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-700 text-[11px] font-bold transition-colors border border-sky-100"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Xem trên Google Maps ({selectedPlace.latitude}, {selectedPlace.longitude})</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">Chưa cập nhật tọa độ GPS</p>
                )}
              </div>

              {/* Business Stats Grid */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Giờ mở cửa</span>
                  <span className="font-bold text-slate-800">{selectedPlace.openHours || '07:00 - 22:00'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Điện thoại liên hệ</span>
                  <span className="font-bold text-slate-800">{selectedPlace.phoneNumber || 'Chưa cập nhật'}</span>
                </div>
                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Giá vé / Chi phí</span>
                  <span className="font-bold text-emerald-600">
                    {selectedPlace.ticketPrice ? `${Number(selectedPlace.ticketPrice).toLocaleString('vi-VN')} đ` : (selectedPlace.priceRange || 'Miễn phí')}
                  </span>
                </div>
                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Người gửi / Host</span>
                  <span className="font-bold text-slate-800 truncate block">
                    {selectedPlace.ownerName || 'Ban Quản trị'}
                  </span>
                </div>
              </div>

              {/* Amenities */}
              {selectedPlace.amenities && (
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Tiện ích & Dịch vụ</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedPlace.amenities.split(',').map((am, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                        {am.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Mô tả chi tiết</span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed text-[11px] max-h-32 overflow-y-auto">
                  {selectedPlace.description || 'Chưa có thông tin mô tả chi tiết từ người đăng.'}
                </p>
              </div>

              {/* Action Buttons in Drawer */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                {selectedPlace.status === 'PENDING_APPROVAL' ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedPlace.id, selectedPlace.name)}
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Check className="w-4 h-4" /> Phê duyệt lên bản đồ
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectModalData({ id: selectedPlace.id, name: selectedPlace.name })}
                      disabled={isSubmitting}
                      className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs transition-colors cursor-pointer active:scale-95"
                    >
                      Từ chối
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(selectedPlace)}
                      disabled={isSubmitting}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5 ${
                        selectedPlace.status === 'ACTIVE'
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {selectedPlace.status === 'ACTIVE' ? (
                        <>
                          <EyeOff className="w-4 h-4 text-slate-500" /> Tạm ẩn địa điểm
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Mở công khai lại
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteModalData({ id: selectedPlace.id, name: selectedPlace.name })}
                      disabled={isSubmitting}
                      className="px-3.5 py-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs transition-colors cursor-pointer"
                      title="Xóa địa điểm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 text-xs">
              <Compass className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              Chọn một địa điểm ở bảng bên trái để xem đầy đủ thông tin chi tiết.
            </div>
          )}
        </div>

      </div>

      {/* ─── 5. MODAL: CREATE NEW PLACE ───────────────────────────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider block">
                  Quản lý Địa điểm Du lịch
                </span>
                <h3 className="font-display font-bold text-lg text-slate-900 mt-0.5">
                  Thêm mới Địa điểm
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlace} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Tên địa điểm *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Bà Nà Hills, Phố cổ Hội An, Bánh Mì Phượng..."
                    value={newPlaceForm.name}
                    onChange={(e) => setNewPlaceForm({ ...newPlaceForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 text-xs"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tỉnh / Thành phố *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Đà Nẵng, Quảng Nam, Lâm Đồng..."
                    value={newPlaceForm.city}
                    onChange={(e) => setNewPlaceForm({ ...newPlaceForm, city: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 text-xs"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Danh mục phân loại *</label>
                  <select
                    value={newPlaceForm.categoryName}
                    onChange={(e) => setNewPlaceForm({ ...newPlaceForm, categoryName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 text-xs cursor-pointer font-semibold"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Địa chỉ chi tiết *</label>
                  <input
                    type="text"
                    required
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                    value={newPlaceForm.address}
                    onChange={(e) => setNewPlaceForm({ ...newPlaceForm, address: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 text-xs"
                  />
                </div>

                {/* Open Hours */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giờ mở cửa</label>
                  <input
                    type="text"
                    placeholder="07:00 - 22:00 hoặc Mở cả ngày"
                    value={newPlaceForm.openHours}
                    onChange={(e) => setNewPlaceForm({ ...newPlaceForm, openHours: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 text-xs"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số điện thoại liên hệ</label>
                  <input
                    type="text"
                    placeholder="0987 654 321 hoặc Hotline"
                    value={newPlaceForm.phoneNumber}
                    onChange={(e) => setNewPlaceForm({ ...newPlaceForm, phoneNumber: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 text-xs"
                  />
                </div>

                {/* Ticket Price */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giá vé tham quan (VNĐ)</label>
                  <input
                    type="number"
                    placeholder="0 (nếu miễn phí)"
                    value={newPlaceForm.ticketPrice}
                    onChange={(e) => setNewPlaceForm({ ...newPlaceForm, ticketPrice: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 text-xs"
                  />
                </div>

                {/* Price Range */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Khoảng giá dự kiến</label>
                  <input
                    type="text"
                    placeholder="Miễn phí, hoặc 50.000đ - 150.000đ"
                    value={newPlaceForm.priceRange}
                    onChange={(e) => setNewPlaceForm({ ...newPlaceForm, priceRange: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 text-xs"
                  />
                </div>

                {/* Latitude & Longitude */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vĩ độ (Latitude)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Ví dụ: 16.0544"
                    value={newPlaceForm.latitude}
                    onChange={(e) => setNewPlaceForm({ ...newPlaceForm, latitude: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kinh độ (Longitude)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Ví dụ: 108.2022"
                    value={newPlaceForm.longitude}
                    onChange={(e) => setNewPlaceForm({ ...newPlaceForm, longitude: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 text-xs font-mono"
                  />
                </div>

                {/* Image URL */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Đường dẫn ảnh bìa (Cover Image URL)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newPlaceForm.coverImageUrl}
                    onChange={(e) => setNewPlaceForm({ ...newPlaceForm, coverImageUrl: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 text-xs"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Mô tả giới thiệu</label>
                  <textarea
                    rows={3}
                    placeholder="Chia sẻ điểm đặc biệt, kinh nghiệm tham quan, gợi ý góc chụp ảnh đẹp..."
                    value={newPlaceForm.description}
                    onChange={(e) => setNewPlaceForm({ ...newPlaceForm, description: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 text-xs resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu & Đưa lên bản đồ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 6. MODAL: REJECT CONFIRMATION ───────────────────────────────────── */}
      {rejectModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Từ chối phê duyệt địa điểm</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Địa điểm: <strong className="text-slate-800">{rejectModalData.name}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700 block">Lý do từ chối gửi đến người đăng:</label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium cursor-pointer"
              >
                <option value="Thông tin địa chỉ hoặc định vị chưa chính xác">Thông tin địa chỉ hoặc định vị chưa chính xác</option>
                <option value="Hình ảnh không rõ ràng hoặc vi phạm tiêu chuẩn cộng đồng">Hình ảnh không rõ ràng hoặc vi phạm tiêu chuẩn</option>
                <option value="Địa điểm bị trùng lặp với địa điểm đã có trong hệ thống">Địa điểm bị trùng lặp với địa điểm đã có</option>
                <option value="Thiếu thông tin liên hệ hoặc giờ hoạt động">Thiếu thông tin liên hệ hoặc giờ hoạt động</option>
                <option value="Địa điểm không còn hoạt động hoặc thông tin sai lệch">Địa điểm không còn hoạt động hoặc thông tin sai lệch</option>
              </select>

              <textarea
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Hoặc tự nhập lý do chi tiết..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs resize-none mt-2"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectModalData(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={confirmReject}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 7. MODAL: DELETE CONFIRMATION ───────────────────────────────────── */}
      {deleteModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Xóa vĩnh viễn địa điểm?</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Bạn có chắc chắn muốn xóa địa điểm <strong className="text-slate-900">"{deleteModalData.name}"</strong>? Dữ liệu đánh giá và hình ảnh liên quan sẽ bị xóa khỏi cơ sở dữ liệu và không thể hoàn tác.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteModalData(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Đang xóa...' : 'Xác nhận xóa vĩnh viễn'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPlacesPage;
