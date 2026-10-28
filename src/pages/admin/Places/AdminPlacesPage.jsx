import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '../../../components/common/Toast';
import { useApp } from '../../../context/AppContext';
import { placeApi, reportApi } from '../../../services/api';
import { 
  MapPin, Check, X, Search, Star, Clock, ChevronRight, Eye, Trash2, 
  RefreshCw, ShieldCheck, Phone, AlertCircle, Plus, ExternalLink, 
  Filter, ChevronLeft, Building2, Tag, Compass, DollarSign, Image, 
  Navigation, CheckCircle2, AlertTriangle, EyeOff, Sparkles, Flag, Edit3
} from 'lucide-react';

export const AdminPlacesPage = () => {
  const toast = useToast();
  const { currentUser } = useApp();

  // Tab & Filter States
  const [activeTab, setActiveTab] = useState('Đang hoạt động'); // 'Đang hoạt động' | 'Chờ duyệt' | 'Tất cả'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Data States with Instant SWR Cache Hydration
  const [pendingPlaces, setPendingPlaces] = useState(() => {
    try {
      const cached = sessionStorage.getItem('wayfare_admin_pending_places');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [allPlaces, setAllPlaces] = useState(() => {
    try {
      const cached = sessionStorage.getItem('wayfare_admin_all_places');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  // Real-time Community Reports against Places (Batch 1 #74)
  const [placeReports, setPlaceReports] = useState([]);
  const [selectedEvidenceModal, setSelectedEvidenceModal] = useState(null);

  const handleResolvePlaceReport = async (reportId, action, notes = '') => {
    try {
      await reportApi.resolveReport(reportId, action, notes);
      toast.success(`Đã cập nhật trạng thái báo cáo #${reportId} (${action})!`);
      const repRes = await reportApi.getAdminReports('ALL', 'PLACE').catch(() => []);
      setPlaceReports(Array.isArray(repRes) ? repRes : []);
    } catch (err) {
      toast.error('Lỗi khi cập nhật báo cáo: ' + err.message);
    }
  };

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(() => {
    return !sessionStorage.getItem('wayfare_admin_all_places');
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [rejectModalData, setRejectModalData] = useState(null); // { id, name }
  const [rejectReason, setRejectReason] = useState('Thông tin địa chỉ hoặc định vị chưa chính xác');
  const [deleteModalData, setDeleteModalData] = useState(null); // { id, name }
  const [editPlaceModalData, setEditPlaceModalData] = useState(null);
  const [editPlaceForm, setEditPlaceForm] = useState(null);

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

  // Fetch real data directly from backend database (Single Source of Truth + SWR)
  const loadData = useCallback(async (isManual = false) => {
    if (isManual || allPlaces.length === 0) {
      setIsLoading(true);
    }
    try {
      const [pendingRes, allRes, repRes] = await Promise.all([
        placeApi.getPendingPlaces().catch(() => []),
        placeApi.getPlaces({ status: 'ALL' }).catch(() => []),
        reportApi.getAdminReports('ALL', 'PLACE').catch(() => [])
      ]);
      
      const pendingList = Array.isArray(pendingRes) ? pendingRes : [];
      const fullList = Array.isArray(allRes) ? allRes : [];
      const reportList = Array.isArray(repRes) ? repRes : [];

      setPendingPlaces(pendingList);
      setAllPlaces(fullList);
      setPlaceReports(reportList);
      try {
        sessionStorage.setItem('wayfare_admin_pending_places', JSON.stringify(pendingList));
        sessionStorage.setItem('wayfare_admin_all_places', JSON.stringify(fullList));
      } catch {
        // ignore
      }

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

  // Đồng bộ GPS cho toàn bộ địa điểm còn thiếu tọa độ trong CSDL
  const handleGeocodeMissing = async () => {
    setIsSubmitting(true);
    try {
      const res = await placeApi.geocodeMissingPlaces();
      toast.success(res?.fixedCount > 0 
        ? `Đã tự động gắn tọa độ GPS cho ${res.fixedCount} địa điểm thành công! 📍` 
        : 'Tất cả các địa điểm đều đã có đầy đủ tọa độ bản đồ.');
      await loadData(true);
    } catch (err) {
      toast.error('Lỗi đồng bộ GPS: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Badge "Xác thực": cấp/gỡ cờ is_verified_host ngay từ bảng
  const handleToggleVerified = async (place) => {
    setIsSubmitting(true);
    try {
      const updated = await placeApi.setPlaceVerified(place.id, !place.isVerifiedHost);
      toast.success(updated?.isVerifiedHost
        ? `Đã cấp badge Xác thực cho "${updated.name}".`
        : `Đã gỡ badge Xác thực của "${updated.name}".`);
      setAllPlaces(prev => prev.map(x => (x.id === updated.id ? { ...x, isVerifiedHost: updated.isVerifiedHost } : x)));
      setPendingPlaces(prev => prev.map(x => (x.id === updated.id ? { ...x, isVerifiedHost: updated.isVerifiedHost } : x)));
    } catch (err) {
      toast.error('Lỗi cập nhật badge Xác thực: ' + err.message);
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
    const trimmedAddr = newPlaceForm.address.trim();
    if (!trimmedAddr) {
      toast.error('Vui lòng nhập địa chỉ địa điểm!');
      return;
    }
    const hasDelimiter = trimmedAddr.includes('-') || trimmedAddr.includes(',') || trimmedAddr.includes('/');
    const hasAdminLevel = /quận|huyện|phường|xã|thị xã|tp|thành phố/i.test(trimmedAddr);
    if (!hasDelimiter && !hasAdminLevel && trimmedAddr.length < 16) {
      toast.warning('⚠️ Địa chỉ chưa đủ cụ thể! Vui lòng ghi đầy đủ: Số nhà/Đường - Phường/Quận/Huyện - Tỉnh/Thành phố.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...newPlaceForm,
        status: 'ACTIVE',
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

  // Open Edit Modal with populated data
  const handleOpenEditModal = (p) => {
    if (!p) return;
    setEditPlaceModalData(p);
    setEditPlaceForm({
      id: p.id,
      name: p.name || '',
      city: p.city || 'Đà Nẵng',
      categoryName: p.categoryName || 'Danh lam thắng cảnh',
      address: p.address || '',
      latitude: p.latitude != null ? String(p.latitude) : '',
      longitude: p.longitude != null ? String(p.longitude) : '',
      ticketPrice: p.ticketPrice != null ? String(p.ticketPrice) : '',
      priceRange: p.priceRange || 'Miễn phí',
      openHours: p.openHours || '07:00 - 22:00',
      phoneNumber: p.phoneNumber || '',
      coverImageUrl: p.coverImageUrl || '',
      imagesText: Array.isArray(p.images) && p.images.length > 0 ? p.images.join('\n') : '',
      amenities: p.amenities || 'Wifi miễn phí, Chỗ đậu xe, Thanh toán thẻ, Chụp ảnh check-in',
      description: p.description || '',
      status: p.status || 'ACTIVE',
      isVerifiedHost: Boolean(p.isVerifiedHost)
    });
  };

  // Handle Submit Edit Place
  const handleUpdatePlace = async (e) => {
    e.preventDefault();
    if (!editPlaceForm.name.trim()) {
      toast.error('Vui lòng nhập tên địa điểm!');
      return;
    }
    const trimmedAddr = editPlaceForm.address.trim();
    if (!trimmedAddr) {
      toast.error('Vui lòng nhập địa chỉ địa điểm!');
      return;
    }

    setIsSubmitting(true);
    try {
      const imagesList = editPlaceForm.imagesText
        ? editPlaceForm.imagesText.split('\n').map(s => s.trim()).filter(Boolean)
        : [];

      const payload = {
        name: editPlaceForm.name.trim(),
        city: editPlaceForm.city.trim(),
        categoryName: editPlaceForm.categoryName,
        address: trimmedAddr,
        latitude: editPlaceForm.latitude ? parseFloat(editPlaceForm.latitude) : null,
        longitude: editPlaceForm.longitude ? parseFloat(editPlaceForm.longitude) : null,
        ticketPrice: editPlaceForm.ticketPrice !== '' ? parseFloat(editPlaceForm.ticketPrice) : 0,
        priceRange: editPlaceForm.priceRange?.trim() || 'Miễn phí',
        openHours: editPlaceForm.openHours?.trim() || null,
        phoneNumber: editPlaceForm.phoneNumber?.trim() || null,
        coverImageUrl: editPlaceForm.coverImageUrl?.trim() || null,
        images: imagesList,
        amenities: editPlaceForm.amenities?.trim() || null,
        description: editPlaceForm.description?.trim() || null,
        status: editPlaceForm.status || 'ACTIVE',
        isVerifiedHost: Boolean(editPlaceForm.isVerifiedHost)
      };

      const updated = await placeApi.updatePlace(editPlaceForm.id, payload);
      toast.success(`Đã cập nhật thông tin địa điểm "${payload.name}" thành công!`);

      // Update local state
      setAllPlaces(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
      setPendingPlaces(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
      if (selectedPlace?.id === updated.id) {
        setSelectedPlace(prev => ({ ...prev, ...updated }));
      }
      setEditPlaceModalData(null);
      setEditPlaceForm(null);
    } catch (err) {
      toast.error('Lỗi khi cập nhật địa điểm: ' + (err.message || 'Thao tác thất bại'));
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
    } else if (activeTab === 'Bị báo cáo vi phạm') {
      const reportedTargetIds = new Set(
        placeReports.map(r => String(r.targetId))
      );
      const combined = [...allPlaces];
      pendingPlaces.forEach(p => {
        if (!combined.some(cp => String(cp.id) === String(p.id))) combined.push(p);
      });
      // Fallback: If a place in reports is not found in allPlaces or pendingPlaces, synthesize a placeholder
      placeReports.forEach(r => {
        if (!combined.some(cp => String(cp.id) === String(r.targetId))) {
          combined.push({
            id: r.targetId,
            name: r.targetTitle || `Địa điểm #${r.targetId}`,
            city: 'Chưa cập nhật',
            address: 'Địa điểm từ báo cáo vi phạm',
            categoryName: 'Bị báo cáo',
            status: 'ACTIVE',
            coverImageUrl: r.evidenceImageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
            description: r.description
          });
        }
      });
      sourceList = combined.filter(p => reportedTargetIds.has(String(p.id)));
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
  }, [activeTab, pendingPlaces, allPlaces, placeReports, searchQuery, selectedCity, selectedCategory]);

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
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* ─── 1. BREADCRUMB & HEADER ACTION TOOLBAR ─────────────────────────────── */}
      <div className="bg-[#FFFDF8] p-5 sm:p-6 rounded-[6px] border border-ink-200/80 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1">
          <nav className="flex items-center gap-2 text-xs font-semibold text-ink-400">
            <span>Quản trị hệ thống</span>
            <ChevronRight className="w-3.5 h-3.5 text-ink-300" />
            <span className="text-clay-700 font-bold">Địa điểm & Điểm tham quan</span>
          </nav>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-2xl sm:text-3xl font-black text-ink-800 tracking-tight">
              Quản lý Địa điểm & Phê duyệt Điểm Đến
            </h1>
            <span className="px-2.5 py-0.5 rounded-[4px] bg-[#F8F4EC] text-ink-700 font-bold text-xs border border-ink-200/80 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Đồng bộ CSDL thực tế
            </span>
          </div>
          <p className="text-xs text-ink-400">
            Hệ thống đang quản lý <strong className="text-ink-800 font-bold">{allPlaces.length}</strong> địa điểm du lịch, trong đó có <strong className="text-clay-700 font-bold">{pendingPlaces.length}</strong> yêu cầu gửi lên đang chờ kiểm duyệt.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 xl:pt-0">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-[5px] bg-[#FFFDF8] hover:bg-[#F8F4EC] text-ink-700 font-bold text-xs border border-ink-200/80 transition-colors cursor-pointer disabled:opacity-50"
            title="Làm mới dữ liệu từ CSDL"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-ink-400 ${isLoading ? 'animate-spin text-clay-600' : ''}`} />
            <span>{isLoading ? 'Đang tải...' : 'Làm mới CSDL'}</span>
          </button>

          <button
            type="button"
            onClick={handleGeocodeMissing}
            disabled={isSubmitting || isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-[5px] bg-[#FFFDF8] hover:bg-[#F8F4EC] text-sky-700 font-bold text-xs border border-sky-300 transition-colors cursor-pointer disabled:opacity-50"
            title="Tự động đồng bộ tọa độ GPS cho các địa điểm còn thiếu"
          >
            <Compass className="w-3.5 h-3.5 text-sky-600" />
            <span>Đồng bộ GPS thiếu</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-[5px] bg-clay-600 hover:bg-clay-700 text-[#FFFDF8] font-bold text-xs border border-clay-600 transition-colors cursor-pointer"
            title="Thêm địa điểm mới"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm địa điểm mới</span>
          </button>
        </div>
      </div>

      {/* ─── 2. 4 METRIC CARDS GRID ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Metric 1: Pending Moderation */}
        <div className="p-5 rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 space-y-3 transition-colors hover:border-ink-300">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 text-clay-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            {pendingPlaces.length > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-rose-50 text-rose-800 text-[10px] font-bold border border-rose-200 animate-pulse">
                Cần xử lý gấp
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                Đã xử lý hết
              </span>
            )}
          </div>
          <div>
            <span className="text-xs text-ink-400 font-medium block">Địa điểm chờ phê duyệt</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-3xl font-black text-clay-700">{pendingPlaces.length}</span>
              <span className="text-xs text-ink-400 font-medium">yêu cầu mới</span>
            </div>
            <p className="text-[11px] text-ink-400 mt-2">Được gửi từ chủ quán & cộng đồng</p>
          </div>
        </div>

        {/* Metric 2: Active Places */}
        <div className="p-5 rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 space-y-3 transition-colors hover:border-ink-300">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
              Đang công khai
            </span>
          </div>
          <div>
            <span className="text-xs text-ink-400 font-medium block">Địa điểm chính thức (Active)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-3xl font-black text-ink-800">{totalActive}</span>
              <span className="text-xs text-ink-400 font-medium">điểm đến</span>
            </div>
            <p className="text-[11px] text-ink-400 mt-2">Hiển thị cho du khách trên bản đồ</p>
          </div>
        </div>

        {/* Metric 3: City Coverage */}
        <div className="p-5 rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 space-y-3 transition-colors hover:border-ink-300">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 text-clay-700 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#F8F4EC] text-ink-700 text-[10px] font-bold border border-ink-200/80">
              Toàn quốc
            </span>
          </div>
          <div>
            <span className="text-xs text-ink-400 font-medium block">Độ phủ sóng địa lý</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-3xl font-black text-ink-800">{dynamicCities.length}</span>
              <span className="text-xs text-ink-400 font-medium">tỉnh thành</span>
            </div>
            <p className="text-[11px] text-ink-400 mt-2">Trải dài khắp 3 miền Bắc - Trung - Nam</p>
          </div>
        </div>

        {/* Metric 4: Average Rating */}
        <div className="p-5 rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 space-y-3 transition-colors hover:border-ink-300">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-300" />
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
              Chất lượng cao
            </span>
          </div>
          <div>
            <span className="text-xs text-ink-400 font-medium block">Đánh giá trung bình</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-3xl font-black text-ink-800 flex items-center gap-1">
                {avgRating} <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              </span>
              <span className="text-xs text-ink-400 font-medium">/ 5.0</span>
            </div>
            <p className="text-[11px] text-ink-400 mt-2">Dựa trên nhận xét từ cộng đồng du khách</p>
          </div>
        </div>

      </div>

      {/* ─── 3. STATUS TABS & SMART SEARCH / FILTER BAR ───────────────────────── */}
      <div className="space-y-3">
        {/* Status Tabs */}
        <div className="inline-flex items-center p-1 bg-[#F8F4EC] rounded-[5px] border border-ink-200/80 shrink-0 text-xs font-semibold overflow-x-auto max-w-full">
          {[
            { label: 'Đang hoạt động', count: totalActive, badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
            { label: 'Chờ duyệt', count: pendingPlaces.length, badgeBg: 'bg-clay-50 text-clay-800 border-clay-200' },
            { 
              label: 'Bị báo cáo vi phạm', 
              count: placeReports.filter(r => r.status === 'PENDING').length, 
              badgeBg: placeReports.some(r => r.status === 'PENDING') ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold' : 'bg-ink-100 text-ink-600 border-ink-200' 
            },
            { label: 'Tất cả', count: allPlaces.length, badgeBg: 'bg-ink-100 text-ink-700 border-ink-200' }
          ].map(tab => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActiveTab(tab.label)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[5px] font-bold text-xs whitespace-nowrap transition-all duration-150 cursor-pointer ${
                activeTab === tab.label
                  ? 'bg-[#FFFDF8] text-clay-700 border border-ink-200/80 shadow-none'
                  : 'text-ink-500 hover:text-ink-800 hover:bg-[#FFFDF8]/60 border border-transparent'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold border ${
                activeTab === tab.label ? 'bg-clay-50 text-clay-800 border-clay-200' : tab.badgeBg
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 flex flex-col md:flex-row items-center gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Tìm theo tên địa điểm, địa chỉ, số điện thoại, người gửi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F8F4EC] text-ink-800 rounded-[5px] text-xs placeholder:text-ink-300 outline-none focus:border-clay-600 border border-ink-200/80 transition-all"
            />
          </div>

          {/* Dynamic City Filter */}
          <div className="w-full sm:w-48">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8F4EC] text-ink-700 rounded-[5px] text-xs font-bold outline-none border border-ink-200/80 hover:bg-[#F8F4EC]/80 cursor-pointer transition-colors"
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
              className="w-full px-3 py-2 bg-[#F8F4EC] text-ink-700 rounded-[5px] text-xs font-bold outline-none border border-ink-200/80 hover:bg-[#F8F4EC]/80 cursor-pointer transition-colors"
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
        <div className="lg:col-span-7 bg-[#FFFDF8] rounded-[6px] border border-ink-200/80 overflow-hidden flex flex-col space-y-4 p-5">
          <div className="flex items-center justify-between pb-2 border-b border-ink-200/60">
            <span className="font-display font-black text-base text-ink-800">
              Danh sách địa điểm ({filteredPlaces.length})
            </span>
            <span className="text-xs text-ink-400">
              Nhấp vào một dòng để xem chi tiết bên phải
            </span>
          </div>

          <div className="overflow-x-auto rounded-[5px] border border-ink-200/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F4EC] text-ink-600 font-bold border-b border-ink-200/80 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tên Địa Điểm</th>
                  <th className="py-3 px-4">Tỉnh / Thành</th>
                  <th className="py-3 px-4">Đánh Giá</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-200/60 bg-[#FFFDF8]">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-ink-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-clay-600" />
                      Đang tải danh sách địa điểm từ cơ sở dữ liệu...
                    </td>
                  </tr>
                ) : paginatedPlaces.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-ink-400">
                      {activeTab === 'Chờ duyệt' ? (
                        <div className="space-y-2">
                          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                          <p className="font-display font-bold text-ink-800 text-sm">Không có địa điểm nào đang chờ phê duyệt!</p>
                          <p className="text-xs text-ink-400">Tất cả yêu cầu gửi lên đã được xử lý xong.</p>
                          <button
                            type="button"
                            onClick={() => setActiveTab('Đang hoạt động')}
                            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-[5px] bg-clay-600 hover:bg-clay-700 text-[#FFFDF8] font-bold text-xs transition-colors cursor-pointer"
                          >
                            Xem {totalActive} địa điểm đang hoạt động →
                          </button>
                        </div>
                      ) : activeTab === 'Bị báo cáo vi phạm' ? (
                        <div className="space-y-2">
                          <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                          <p className="font-display font-bold text-ink-800 text-sm">Không có địa điểm nào bị báo cáo vi phạm!</p>
                          <p className="text-xs text-ink-400">Tất cả địa điểm đều trong trạng thái hoạt động an toàn và tích cực.</p>
                          <button
                            type="button"
                            onClick={() => setActiveTab('Đang hoạt động')}
                            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-[5px] bg-clay-600 hover:bg-clay-700 text-[#FFFDF8] font-bold text-xs transition-colors cursor-pointer"
                          >
                            Xem {totalActive} địa điểm đang hoạt động →
                          </button>
                        </div>
                      ) : (
                        <div>
                          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-ink-300" />
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
                          isSelected ? 'bg-clay-50/70 border-l-4 border-l-clay-600' : 'hover:bg-[#F8F4EC]/50'
                        }`}
                      >
                        {/* Place Name & Thumbnail */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-[4px] overflow-hidden bg-[#F8F4EC] shrink-0 border border-ink-200/80">
                              <img
                                src={p.coverImageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=150&q=80'}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="space-y-0.5 min-w-0">
                              <h4 className="font-display font-bold text-ink-800 truncate max-w-[170px] sm:max-w-[200px]">{p.name}</h4>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-1.5 py-0.5 rounded-[4px] bg-[#F8F4EC] text-ink-600 text-[10px] font-bold border border-ink-200/60">
                                  {p.categoryName || 'Tọa độ du lịch'}
                                </span>
                                {p.isVerifiedHost && (
                                  <span className="px-1.5 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-800 text-[9px] font-bold border border-emerald-200">
                                    Đã xác thực
                                  </span>
                                )}
                                {p.aiModerationStatus === 'DUPLICATE_FLAGGED' && (
                                  <span className="px-1.5 py-0.5 rounded-[4px] bg-rose-50 text-rose-800 text-[9px] font-bold border border-rose-200 flex items-center gap-1">
                                    <AlertTriangle className="w-2.5 h-2.5" /> AI: Trùng lặp
                                  </span>
                                )}
                                {p.aiModerationStatus === 'UNVERIFIED_SUSPECTED' && (
                                  <span className="px-1.5 py-0.5 rounded-[4px] bg-amber-50 text-amber-800 text-[9px] font-bold border border-amber-200 flex items-center gap-1">
                                    <AlertCircle className="w-2.5 h-2.5" /> AI: Nghi vấn
                                  </span>
                                )}
                                {p.aiModerationStatus === 'APPROVED_BY_AI' && (
                                  <span className="px-1.5 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-800 text-[9px] font-bold border border-emerald-200 flex items-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5" /> AI: Hợp lệ
                                  </span>
                                )}
                                {(() => {
                                  const pendingReps = placeReports.filter(r => String(r.targetId) === String(p.id) && r.status === 'PENDING');
                                  if (pendingReps.length > 0) {
                                    return (
                                      <span className="px-1.5 py-0.5 rounded-[4px] bg-rose-100 text-rose-800 text-[9px] font-bold border border-rose-300 flex items-center gap-1 animate-pulse">
                                        <Flag className="w-2.5 h-2.5 fill-rose-600 text-rose-600" /> Bị báo cáo ({pendingReps.length})
                                      </span>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* City & Address */}
                        <td className="py-3 px-4">
                          <span className="font-bold text-ink-800 block truncate max-w-[120px]">{p.city || 'Việt Nam'}</span>
                          <span className="text-[10px] text-ink-400 truncate block max-w-[140px]">{p.address}</span>
                        </td>

                        {/* Rating */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 font-bold text-amber-600">
                            <Star className="w-3.5 h-3.5 fill-amber-300" />
                            <span>{p.averageRating ? Number(p.averageRating).toFixed(1) : '5.0'}</span>
                          </div>
                          <span className="text-[10px] text-ink-400">{p.reviewCount || 0} đánh giá</span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold whitespace-nowrap inline-flex items-center gap-1 border ${
                            isPending
                              ? 'bg-clay-50 text-clay-800 border-clay-200'
                              : p.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
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
                                  className="p-1.5 rounded-[4px] bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition-colors cursor-pointer"
                                  title="Phê duyệt nhanh"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRejectModalData({ id: p.id, name: p.name })}
                                  disabled={isSubmitting}
                                  className="p-1.5 rounded-[4px] bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white border border-amber-200 transition-colors cursor-pointer"
                                  title="Từ chối duyệt"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => handleToggleVerified(p)}
                              disabled={isSubmitting}
                              className={`p-1.5 rounded-[4px] border transition-colors cursor-pointer disabled:opacity-40 ${
                                p.isVerifiedHost
                                  ? 'bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-800'
                                  : 'bg-[#F8F4EC] text-ink-600 border-ink-200 hover:bg-emerald-600 hover:text-white'
                              }`}
                              title={p.isVerifiedHost ? 'Gỡ badge Xác thực' : 'Cấp badge Xác thực'}
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(p)}
                              disabled={isSubmitting}
                              className="p-1.5 rounded-[4px] bg-[#F8F4EC] text-ink-600 hover:bg-clay-600 hover:text-white border border-ink-200 transition-colors cursor-pointer"
                              title="Chỉnh sửa thông tin địa điểm"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteModalData({ id: p.id, name: p.name })}
                              disabled={isSubmitting}
                              className="p-1.5 rounded-[4px] bg-rose-50 text-rose-700 hover:bg-rose-700 hover:text-white border border-rose-200 transition-colors cursor-pointer"
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
            <div className="flex items-center justify-between pt-2 text-xs text-ink-500">
              <span>
                Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredPlaces.length)} trong số {filteredPlaces.length} địa điểm
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-[5px] border border-ink-200/80 bg-[#FFFDF8] hover:bg-[#F8F4EC] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-ink-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 font-bold text-ink-800">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-[5px] border border-ink-200/80 bg-[#FFFDF8] hover:bg-[#F8F4EC] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-ink-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Preview Drawer (5 Cols - Sticky) */}
        <div className="lg:col-span-5 bg-[#FFFDF8] p-5 sm:p-6 rounded-[6px] border border-ink-200/80 space-y-4 sticky top-20">
          <div className="flex items-center justify-between border-b border-ink-200/60 pb-3">
            <span className="font-display font-black text-base text-ink-800 flex items-center gap-2">
              <Eye className="w-4 h-4 text-clay-600" />
              Chi Tiết Địa Điểm
            </span>
            {selectedPlace && (
              <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold border ${
                selectedPlace.status === 'PENDING_APPROVAL'
                  ? 'bg-clay-50 text-clay-800 border-clay-200'
                  : selectedPlace.status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                {selectedPlace.status === 'PENDING_APPROVAL' ? 'Chờ phê duyệt' : selectedPlace.status === 'ACTIVE' ? 'Đã công khai' : 'Tạm ẩn'}
              </span>
            )}
          </div>

          {selectedPlace ? (
            <div className="space-y-3.5 text-xs">
              {/* Photo Cover */}
              <div className="h-44 rounded-[5px] overflow-hidden relative border border-ink-200/80 bg-[#F8F4EC]">
                <img
                  src={selectedPlace.coverImageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'}
                  alt={selectedPlace.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-[4px] bg-ink-900/80 text-[#FFFDF8] text-[10px] font-bold border border-ink-800">
                  {selectedPlace.categoryName || 'Tọa độ du lịch'}
                </span>
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-[4px] bg-ink-900/80 text-amber-300 text-[10px] font-bold flex items-center gap-1 border border-ink-800">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {selectedPlace.averageRating ? Number(selectedPlace.averageRating).toFixed(1) : '5.0'} ({selectedPlace.reviewCount || 0})
                </span>
              </div>

              {/* Title, Address & GPS */}
              <div>
                <h3 className="font-display font-black text-lg text-ink-800 leading-snug">{selectedPlace.name}</h3>
                <p className="text-ink-600 mt-1 flex items-start gap-1.5 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-clay-600 shrink-0 mt-0.5" />
                  <span>{selectedPlace.address || selectedPlace.city || 'Chưa cập nhật địa chỉ'}</span>
                </p>

                {/* Google Maps External Link */}
                {selectedPlace.latitude && selectedPlace.longitude ? (
                  <div className="mt-2 flex items-center gap-2">
                    <a
                      href={`https://www.google.com/maps?q=${selectedPlace.latitude},${selectedPlace.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#F8F4EC] hover:bg-clay-50 text-clay-700 text-[11px] font-bold transition-colors border border-ink-200/80"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Xem trên Google Maps ({selectedPlace.latitude}, {selectedPlace.longitude})</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <p className="text-[11px] text-ink-400 mt-1">Chưa cập nhật tọa độ GPS</p>
                )}

                {/* WanderAI Shield Verification Details */}
                <div className={`mt-3 p-3 rounded-[5px] border text-xs space-y-1.5 ${
                  selectedPlace.aiModerationStatus === 'DUPLICATE_FLAGGED'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : selectedPlace.aiModerationStatus === 'UNVERIFIED_SUSPECTED'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                      <Sparkles className="w-3.5 h-3.5" />
                      WanderAI Thẩm định & Xác thực
                    </span>
                    <span className={`px-2 py-0.5 rounded-[4px] font-bold text-[10px] border ${
                      selectedPlace.aiModerationStatus === 'DUPLICATE_FLAGGED'
                        ? 'bg-rose-100 text-rose-800 border-rose-200'
                        : selectedPlace.aiModerationStatus === 'UNVERIFIED_SUSPECTED'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}>
                      {selectedPlace.aiModerationStatus === 'DUPLICATE_FLAGGED'
                        ? 'Trùng lặp'
                        : selectedPlace.aiModerationStatus === 'UNVERIFIED_SUSPECTED'
                        ? 'Cần xác minh'
                        : 'Hợp lệ'}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {selectedPlace.aiModerationNote || 'Địa điểm đã qua hệ thống đối soát dữ liệu và kiểm tra tính xác thực.'}
                  </p>
                </div>

                {/* Community Reports on Selected Place */}
                {(() => {
                  const currentPlaceReports = placeReports.filter(r => String(r.targetId) === String(selectedPlace.id));
                  if (currentPlaceReports.length === 0) return null;

                  return (
                    <div className="mt-3 p-3.5 rounded-[5px] border border-rose-300 bg-rose-50/70 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-rose-200 pb-2">
                        <span className="font-bold flex items-center gap-1.5 text-xs text-rose-900 uppercase tracking-wide">
                          <Flag className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                          Báo cáo vi phạm từ cộng đồng ({currentPlaceReports.length})
                        </span>
                        <span className="px-2 py-0.5 rounded-[4px] bg-rose-200 text-rose-900 text-[10px] font-black">
                          CẦN DUYỆT
                        </span>
                      </div>

                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {currentPlaceReports.map((rep) => (
                          <div key={rep.id} className="p-2.5 rounded-[4px] bg-[#FFFDF8] border border-rose-200 space-y-1.5 text-[11px]">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-rose-800 truncate">
                                Lý do: {rep.reason || rep.category || 'Nội dung vi phạm'}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                rep.status === 'PENDING' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                              }`}>
                                {rep.status === 'PENDING' ? 'Chưa xử lý' : 'Đã xử lý'}
                              </span>
                            </div>

                            <p className="text-ink-600 leading-snug">
                              {rep.description || 'Không có mô tả chi tiết từ người báo cáo.'}
                            </p>

                            <div className="text-[10px] text-ink-400 flex items-center justify-between">
                              <span>Người báo: <strong className="text-ink-700">{rep.reporterName || rep.reporterEmail || 'Du khách'}</strong></span>
                              <span>{rep.createdAt ? new Date(rep.createdAt).toLocaleDateString('vi-VN') : ''}</span>
                            </div>

                            {rep.evidenceImageUrl && (
                              <div className="pt-1">
                                <button
                                  type="button"
                                  onClick={() => setSelectedEvidenceModal(rep.evidenceImageUrl)}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-clay-700 hover:text-clay-900 underline cursor-pointer"
                                >
                                  <Eye className="w-3 h-3" /> Xem ảnh bằng chứng vi phạm
                                </button>
                              </div>
                            )}

                            {rep.status === 'PENDING' && (
                              <div className="flex items-center gap-1.5 pt-1.5 border-t border-ink-100">
                                <button
                                  type="button"
                                  onClick={() => handleResolvePlaceReport(rep.id, 'RESOLVE', 'Đã xử lý và nhắc nhở địa điểm')}
                                  className="flex-1 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors cursor-pointer"
                                >
                                  Đánh dấu Đã xử lý
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleResolvePlaceReport(rep.id, 'DISMISS', 'Báo cáo sai sự thật hoặc không hợp lệ')}
                                  className="px-2.5 py-1 rounded bg-[#F8F4EC] hover:bg-ink-200 text-ink-700 font-bold text-[10px] border border-ink-200 transition-colors cursor-pointer"
                                >
                                  Bác bỏ
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Business Stats Grid */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-[#F8F4EC] rounded-[5px] border border-ink-200/60">
                <div>
                  <span className="text-[10px] text-ink-400 font-bold uppercase block">Giờ mở cửa</span>
                  <span className="font-bold text-ink-800">{selectedPlace.openHours || '07:00 - 22:00'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-ink-400 font-bold uppercase block">Điện thoại liên hệ</span>
                  <span className="font-bold text-ink-800">{selectedPlace.phoneNumber || 'Chưa cập nhật'}</span>
                </div>
                <div className="pt-1">
                  <span className="text-[10px] text-ink-400 font-bold uppercase block">Giá vé / Chi phí</span>
                  <span className="font-display font-black text-clay-700">
                    {selectedPlace.ticketPrice ? `${Number(selectedPlace.ticketPrice).toLocaleString('vi-VN')} đ` : (selectedPlace.priceRange || 'Miễn phí')}
                  </span>
                </div>
                <div className="pt-1">
                  <span className="text-[10px] text-ink-400 font-bold uppercase block">Người gửi / Host</span>
                  <span className="font-bold text-ink-800 truncate block">
                    {selectedPlace.ownerName || 'Ban Quản trị'}
                  </span>
                </div>
              </div>

              {/* Amenities */}
              {selectedPlace.amenities && (
                <div>
                  <span className="text-[10px] text-ink-400 font-bold uppercase block mb-1">Tiện ích & Dịch vụ</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedPlace.amenities.split(',').map((am, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-[4px] bg-[#F8F4EC] text-ink-700 text-[10px] font-bold border border-ink-200/60">
                        {am.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <span className="text-[10px] text-ink-400 font-bold uppercase block mb-1">Mô tả chi tiết</span>
                <p className="text-ink-600 bg-[#F8F4EC] p-3 rounded-[5px] border border-ink-200/60 leading-relaxed text-[11px] max-h-32 overflow-y-auto">
                  {selectedPlace.description || 'Chưa có thông tin mô tả chi tiết từ người đăng.'}
                </p>
              </div>

              {/* Action Buttons in Drawer */}
              <div className="pt-2 border-t border-ink-200/60 space-y-2">
                {selectedPlace.status === 'PENDING_APPROVAL' ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedPlace.id, selectedPlace.name)}
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 rounded-[5px] bg-emerald-700 hover:bg-emerald-800 text-[#FFFDF8] font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" /> Phê duyệt lên bản đồ
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectModalData({ id: selectedPlace.id, name: selectedPlace.name })}
                      disabled={isSubmitting}
                      className="px-4 py-2.5 rounded-[5px] bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Từ chối
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(selectedPlace)}
                      disabled={isSubmitting}
                      className="px-3 py-2.5 rounded-[5px] bg-[#F8F4EC] hover:bg-clay-50 text-clay-700 hover:text-clay-800 border border-ink-200/80 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                      title="Chỉnh sửa thông tin"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-clay-600" />
                      <span>Sửa</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(selectedPlace)}
                      disabled={isSubmitting}
                      className={`flex-1 py-2.5 rounded-[5px] font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 border ${
                        selectedPlace.status === 'ACTIVE'
                          ? 'bg-[#F8F4EC] hover:bg-ink-100 text-ink-700 border-ink-200/80'
                          : 'bg-emerald-700 hover:bg-emerald-800 text-[#FFFDF8] border-emerald-700'
                      }`}
                    >
                      {selectedPlace.status === 'ACTIVE' ? (
                        <>
                          <EyeOff className="w-4 h-4 text-ink-500" /> Tạm ẩn địa điểm
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Mở công khai lại
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(selectedPlace)}
                      disabled={isSubmitting}
                      className="px-3 py-2.5 rounded-[5px] bg-[#F8F4EC] hover:bg-clay-50 text-clay-700 hover:text-clay-800 border border-ink-200/80 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      title="Chỉnh sửa thông tin"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-clay-600" />
                      <span>Sửa</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteModalData({ id: selectedPlace.id, name: selectedPlace.name })}
                      disabled={isSubmitting}
                      className="px-3.5 py-2.5 rounded-[5px] bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs transition-colors cursor-pointer"
                      title="Xóa địa điểm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="py-16 text-center text-ink-400 text-xs">
              <Compass className="w-8 h-8 mx-auto mb-2 text-ink-300" />
              Chọn một địa điểm ở bảng bên trái để xem đầy đủ thông tin chi tiết.
            </div>
          )}
        </div>

      </div>

      {/* ─── 5. MODAL: CREATE NEW PLACE ───────────────────────────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FFFDF8] rounded-[6px] max-w-2xl w-full p-6 border border-ink-200 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-ink-200/60 pb-3">
              <div>
                <span className="text-[11px] font-bold text-clay-700 uppercase tracking-wider block">
                  Quản lý Địa điểm Du lịch
                </span>
                <h3 className="font-display font-black text-xl text-ink-800 mt-0.5">
                  Thêm mới Địa điểm
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-[5px] hover:bg-[#F8F4EC] text-ink-400 hover:text-ink-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlace} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-ink-700 block mb-1">Tên địa điểm *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Bà Nà Hills, Phố cổ Hội An, Bánh Mì Phượng..."
                    value={newPlaceForm.name}
                    onChange={(e) => setNewPlaceForm({ ...newPlaceForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none focus:border-clay-600 text-xs text-ink-800"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="font-bold text-ink-700 block mb-1">Tỉnh / Thành phố *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Đà Nẵng, Quảng Nam, Lâm Đồng..."
                    value={newPlaceForm.city}
                    onChange={(e) => setNewPlaceForm({ ...newPlaceForm, city: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none focus:border-clay-600 text-xs text-ink-800"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="font-bold text-ink-700 block mb-1">Danh mục phân loại *</label>
                  <select
                    value={newPlaceForm.categoryName}
                    onChange={(e) => setNewPlaceForm({ ...newPlaceForm, categoryName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none focus:border-clay-600 text-xs cursor-pointer font-bold text-ink-700"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-ink-700 block">Địa chỉ cụ thể *</label>
                    <span className="text-[10px] text-clay-700 font-bold bg-clay-50 px-2 py-0.5 rounded-[4px] border border-clay-200">
                      Bắt buộc kèm Quận/Huyện & Tỉnh/Thành
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 202 Chương Dương - Sơn Trà - Đà Nẵng"
                    value={newPlaceForm.address}
                    onChange={(e) => setNewPlaceForm({ ...newPlaceForm, address: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none focus:border-clay-600 text-xs text-ink-800 font-medium"
                  />
                  <p className="text-[11px] text-ink-400 mt-1">
                    💡 Quy chuẩn: Phải ghi rõ Số nhà/Đường - Phường/Quận/Huyện - Tỉnh/Thành phố.
                  </p>
                </div>

                {/* Open Hours */}
                <div>
                  <label className="font-bold text-ink-700 block mb-1">Giờ mở cửa</label>
                  <input
                    type="text"
                    placeholder="07:00 - 22:00 hoặc Mở cả ngày"
                    value={newPlaceForm.openHours}
                    onChange={(e) => setNewPlaceForm({ ...newPlaceForm, openHours: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none focus:border-clay-600 text-xs text-ink-800"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="font-bold text-ink-700 block mb-1">Số điện thoại liên hệ</label>
                  <input
                    type="text"
                    placeholder="0987 654 321 hoặc Hotline"
                    value={newPlaceForm.phoneNumber}
                    onChange={(e) => setNewPlaceForm({ ...newPlaceForm, phoneNumber: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none focus:border-clay-600 text-xs text-ink-800"
                  />
                </div>

                {/* Ticket Price */}
                <div>
                  <label className="font-bold text-ink-700 block mb-1">Giá vé tham quan (VNĐ)</label>
                  <input
                    type="number"
                    placeholder="0 (nếu miễn phí)"
                    value={newPlaceForm.ticketPrice}
                    onChange={(e) => setNewPlaceForm({ ...newPlaceForm, ticketPrice: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none focus:border-clay-600 text-xs text-ink-800"
                  />
                </div>

                {/* Price Range */}
                <div>
                  <label className="font-bold text-ink-700 block mb-1">Khoảng giá dự kiến</label>
                  <input
                    type="text"
                    placeholder="Miễn phí, hoặc 50.000đ - 150.000đ"
                    value={newPlaceForm.priceRange}
                    onChange={(e) => setNewPlaceForm({ ...newPlaceForm, priceRange: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none focus:border-clay-600 text-xs text-ink-800"
                  />
                </div>

                {/* Latitude & Longitude */}
                <div>
                  <label className="font-bold text-ink-700 block mb-1">Vĩ độ (Latitude)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Ví dụ: 16.0544"
                    value={newPlaceForm.latitude}
                    onChange={(e) => setNewPlaceForm({ ...newPlaceForm, latitude: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none focus:border-clay-600 text-xs font-mono text-ink-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-700 block mb-1">Kinh độ (Longitude)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Ví dụ: 108.2022"
                    value={newPlaceForm.longitude}
                    onChange={(e) => setNewPlaceForm({ ...newPlaceForm, longitude: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none focus:border-clay-600 text-xs font-mono text-ink-800"
                  />
                </div>

                {/* Image URL */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-ink-700 block mb-1">Đường dẫn ảnh bìa (Cover Image URL)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newPlaceForm.coverImageUrl}
                    onChange={(e) => setNewPlaceForm({ ...newPlaceForm, coverImageUrl: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none focus:border-clay-600 text-xs text-ink-800"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-ink-700 block mb-1">Mô tả giới thiệu</label>
                  <textarea
                    rows={3}
                    placeholder="Chia sẻ điểm đặc biệt, kinh nghiệm tham quan, gợi ý góc chụp ảnh đẹp..."
                    value={newPlaceForm.description}
                    onChange={(e) => setNewPlaceForm({ ...newPlaceForm, description: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none focus:border-clay-600 text-xs text-ink-800 resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-ink-200/60">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-[5px] bg-[#F8F4EC] hover:bg-ink-100 text-ink-700 font-bold border border-ink-200/80 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-[5px] bg-clay-600 hover:bg-clay-700 text-[#FFFDF8] font-bold border border-clay-600 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu & Đưa lên bản đồ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 5.1. MODAL: EDIT PLACE ─────────────────────────────────────────── */}
      {editPlaceModalData && editPlaceForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FFFDF8] rounded-[6px] max-w-2xl w-full max-h-[90vh] flex flex-col border border-ink-200 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-200/60 bg-[#F8F4EC]/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[5px] bg-clay-100 text-clay-700 flex items-center justify-center border border-clay-200">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm text-ink-800">Chỉnh sửa Địa điểm Du lịch</h3>
                  <p className="text-[11px] text-ink-400">Mã #{editPlaceForm.id} • {editPlaceForm.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditPlaceModalData(null);
                  setEditPlaceForm(null);
                }}
                className="w-7 h-7 rounded-[4px] hover:bg-ink-100 text-ink-400 hover:text-ink-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdatePlace} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-ink-700 block mb-1">
                    Tên địa điểm <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editPlaceForm.name}
                    onChange={(e) => setEditPlaceForm({ ...editPlaceForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none focus:border-clay-600 text-xs text-ink-800 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink-700 block mb-1">
                    Tỉnh / Thành phố <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editPlaceForm.city}
                    onChange={(e) => setEditPlaceForm({ ...editPlaceForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none focus:border-clay-600 text-xs text-ink-800 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink-700 block mb-1">
                    Danh mục phân loại <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editPlaceForm.categoryName}
                    onChange={(e) => setEditPlaceForm({ ...editPlaceForm, categoryName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none focus:border-clay-600 text-xs text-ink-800 cursor-pointer"
                  >
                    <option value="Danh lam thắng cảnh">Danh lam thắng cảnh</option>
                    <option value="Di tích lịch sử">Di tích lịch sử</option>
                    <option value="Bãi biển">Bãi biển</option>
                    <option value="Ẩm thực">Ẩm thực</option>
                    <option value="Văn hóa - Nghệ thuật">Văn hóa - Nghệ thuật</option>
                    <option value="Khu vui chơi giải trí">Khu vui chơi giải trí</option>
                    <option value="Tự nhiên & Sinh thái">Tự nhiên & Sinh thái</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-ink-700 block mb-1">
                    Trạng thái hiển thị <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editPlaceForm.status}
                    onChange={(e) => setEditPlaceForm({ ...editPlaceForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none focus:border-clay-600 text-xs text-ink-800 font-semibold cursor-pointer"
                  >
                    <option value="ACTIVE">Hoạt động (ACTIVE - Công khai)</option>
                    <option value="PENDING_APPROVAL">Chờ duyệt (PENDING_APPROVAL)</option>
                    <option value="HIDDEN">Tạm ẩn (HIDDEN - Đã khóa/ẩn)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="font-bold text-ink-700 block mb-1">
                    Địa chỉ chi tiết <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editPlaceForm.address}
                    onChange={(e) => setEditPlaceForm({ ...editPlaceForm, address: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none focus:border-clay-600 text-xs text-ink-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink-700 block mb-1">Vĩ độ (Latitude)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="VD: 16.0544"
                    value={editPlaceForm.latitude}
                    onChange={(e) => setEditPlaceForm({ ...editPlaceForm, latitude: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none focus:border-clay-600 text-xs text-ink-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink-700 block mb-1">Kinh độ (Longitude)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="VD: 108.2022"
                    value={editPlaceForm.longitude}
                    onChange={(e) => setEditPlaceForm({ ...editPlaceForm, longitude: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none focus:border-clay-600 text-xs text-ink-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink-700 block mb-1">Giá vé (VNĐ - 0 nếu miễn phí)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={editPlaceForm.ticketPrice}
                    onChange={(e) => setEditPlaceForm({ ...editPlaceForm, ticketPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none focus:border-clay-600 text-xs text-ink-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink-700 block mb-1">Khoảng giá</label>
                  <select
                    value={editPlaceForm.priceRange}
                    onChange={(e) => setEditPlaceForm({ ...editPlaceForm, priceRange: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none focus:border-clay-600 text-xs text-ink-800 cursor-pointer"
                  >
                    <option value="Miễn phí">Miễn phí</option>
                    <option value="Dưới 50k">Dưới 50.000 VNĐ</option>
                    <option value="50k - 200k">50.000 - 200.000 VNĐ</option>
                    <option value="200k - 500k">200.000 - 500.000 VNĐ</option>
                    <option value="Trên 500k">Trên 500.000 VNĐ</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-ink-700 block mb-1">Giờ mở cửa</label>
                  <input
                    type="text"
                    value={editPlaceForm.openHours}
                    onChange={(e) => setEditPlaceForm({ ...editPlaceForm, openHours: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none focus:border-clay-600 text-xs text-ink-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink-700 block mb-1">Số điện thoại liên hệ</label>
                  <input
                    type="text"
                    value={editPlaceForm.phoneNumber}
                    onChange={(e) => setEditPlaceForm({ ...editPlaceForm, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none focus:border-clay-600 text-xs text-ink-800"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="font-bold text-ink-700 block mb-1">Link Ảnh bìa chính (Cover Image URL)</label>
                  <input
                    type="url"
                    value={editPlaceForm.coverImageUrl}
                    onChange={(e) => setEditPlaceForm({ ...editPlaceForm, coverImageUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none focus:border-clay-600 text-xs text-ink-800"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="font-bold text-ink-700 block mb-1">
                    Album nhiều ảnh (Mỗi dòng 1 link URL ảnh)
                  </label>
                  <textarea
                    rows={3}
                    placeholder={"https://example.com/photo1.jpg\nhttps://example.com/photo2.jpg"}
                    value={editPlaceForm.imagesText}
                    onChange={(e) => setEditPlaceForm({ ...editPlaceForm, imagesText: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none focus:border-clay-600 text-xs text-ink-800 font-mono resize-none"
                  ></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="font-bold text-ink-700 block mb-1">Tiện ích & Dịch vụ</label>
                  <input
                    type="text"
                    value={editPlaceForm.amenities}
                    onChange={(e) => setEditPlaceForm({ ...editPlaceForm, amenities: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none focus:border-clay-600 text-xs text-ink-800"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="font-bold text-ink-700 block mb-1">Mô tả giới thiệu chi tiết</label>
                  <textarea
                    rows={4}
                    value={editPlaceForm.description}
                    onChange={(e) => setEditPlaceForm({ ...editPlaceForm, description: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none focus:border-clay-600 text-xs text-ink-800 resize-none"
                  ></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2.5 p-3 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editPlaceForm.isVerifiedHost}
                      onChange={(e) => setEditPlaceForm({ ...editPlaceForm, isVerifiedHost: e.target.checked })}
                      className="w-4 h-4 rounded text-clay-600 focus:ring-clay-500 border-ink-300 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-ink-800 block">Địa điểm chính chủ / Đã xác thực (Verified Host)</span>
                      <span className="text-[11px] text-ink-400">Hiển thị huy hiệu tích xanh uy tín của ban quản trị Wayfare</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-ink-200/60">
                <button
                  type="button"
                  onClick={() => {
                    setEditPlaceModalData(null);
                    setEditPlaceForm(null);
                  }}
                  className="px-4 py-2.5 rounded-[5px] bg-[#F8F4EC] hover:bg-ink-100 text-ink-700 font-bold border border-ink-200/80 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-[5px] bg-clay-600 hover:bg-clay-700 text-[#FFFDF8] font-bold border border-clay-600 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 6. MODAL: REJECT CONFIRMATION ───────────────────────────────────── */}
      {rejectModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FFFDF8] rounded-[6px] max-w-md w-full p-6 border border-ink-200 shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-[5px] bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-ink-800">Từ chối phê duyệt địa điểm</h3>
                <p className="text-xs text-ink-400 mt-0.5">
                  Địa điểm: <strong className="text-ink-800">{rejectModalData.name}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-ink-700 block">Lý do từ chối gửi đến người đăng:</label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none font-bold text-ink-700 cursor-pointer"
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
                className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none text-xs text-ink-800 resize-none mt-2"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-200/60">
              <button
                type="button"
                onClick={() => setRejectModalData(null)}
                className="px-4 py-2 rounded-[5px] bg-[#F8F4EC] hover:bg-ink-100 text-ink-700 font-bold text-xs border border-ink-200/80 transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={confirmReject}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-[5px] bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 7. MODAL: DELETE CONFIRMATION ───────────────────────────────────── */}
      {deleteModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FFFDF8] rounded-[6px] max-w-md w-full p-6 border border-ink-200 shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-[5px] bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-ink-800">Xóa vĩnh viễn địa điểm?</h3>
                <p className="text-xs text-ink-400 mt-1 leading-relaxed">
                  Bạn có chắc chắn muốn xóa địa điểm <strong className="text-ink-800 font-bold">"{deleteModalData.name}"</strong>? Dữ liệu đánh giá và hình ảnh liên quan sẽ bị xóa khỏi cơ sở dữ liệu và không thể hoàn tác.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-200/60">
              <button
                type="button"
                onClick={() => setDeleteModalData(null)}
                className="px-4 py-2 rounded-[5px] bg-[#F8F4EC] hover:bg-ink-100 text-ink-700 font-bold text-xs border border-ink-200/80 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-[5px] bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Đang xóa...' : 'Xác nhận xóa vĩnh viễn'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 8. MODAL: EVIDENCE IMAGE PREVIEW ─────────────────────────────────── */}
      {selectedEvidenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#FFFDF8] rounded-[6px] max-w-lg w-full p-4 border border-ink-200 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-ink-200/60 pb-2">
              <span className="font-display font-black text-sm text-ink-800 flex items-center gap-1.5">
                <Flag className="w-4 h-4 text-rose-600" />
                Ảnh bằng chứng vi phạm của địa điểm
              </span>
              <button
                type="button"
                onClick={() => setSelectedEvidenceModal(null)}
                className="p-1 rounded text-ink-400 hover:text-ink-800 hover:bg-[#F8F4EC] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-[4px] overflow-hidden bg-black/5 flex items-center justify-center max-h-[70vh]">
              <img
                src={selectedEvidenceModal}
                alt="Evidence preview"
                className="max-w-full max-h-[65vh] object-contain rounded"
              />
            </div>
            <div className="text-right">
              <button
                type="button"
                onClick={() => setSelectedEvidenceModal(null)}
                className="px-4 py-1.5 rounded-[5px] bg-ink-800 text-[#FFFDF8] text-xs font-bold hover:bg-ink-900 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPlacesPage;
