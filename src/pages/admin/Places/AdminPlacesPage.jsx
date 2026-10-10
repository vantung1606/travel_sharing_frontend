import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '../../../components/common/Toast';
import { placeApi } from '../../../services/api';
import { MapPin, Check, X, Search, Star, Clock, ChevronRight, Eye, Trash2, RefreshCw, ShieldCheck, Phone, AlertCircle } from 'lucide-react';

export const AdminPlacesPage = () => {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('Chờ duyệt'); // 'Chờ duyệt' | 'Đang hoạt động' | 'Tất cả'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [pendingPlaces, setPendingPlaces] = useState([]);
  const [allPlaces, setAllPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real data from backend
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pendingRes, allRes] = await Promise.all([
        placeApi.getPendingPlaces(),
        placeApi.getPlaces({ status: 'ALL' })
      ]);
      setPendingPlaces(pendingRes || []);
      setAllPlaces(allRes || []);
      if (pendingRes?.length > 0) {
        setSelectedPlace(pendingRes[0]);
      } else if (allRes?.length > 0) {
        setSelectedPlace(allRes[0]);
      }
    } catch (err) {
      console.error('Error fetching admin places:', err);
      toast.error('Không thể tải danh sách địa điểm: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Approve
  const handleApprove = async (id, name) => {
    try {
      await placeApi.approvePlace(id);
      toast.success(`Đã phê duyệt "${name || 'địa điểm'}" lên bản đồ du lịch thành công!`);
      await loadData();
    } catch (err) {
      toast.error('Lỗi phê duyệt: ' + err.message);
    }
  };

  // Handle Reject
  const handleReject = async (id, name) => {
    const reason = window.prompt('Nhập lý do từ chối (tùy chọn):', 'Thông tin địa chỉ chưa chính xác');
    if (reason === null) return; // User cancelled prompt
    try {
      await placeApi.rejectPlace(id, reason);
      toast.info(`Đã từ chối "${name || 'địa điểm'}".`);
      await loadData();
    } catch (err) {
      toast.error('Lỗi từ chối: ' + err.message);
    }
  };

  // Handle Delete
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn địa điểm "${name || ''}" khỏi hệ thống?`)) {
      return;
    }
    try {
      await placeApi.deletePlace(id);
      toast.success(`Đã xóa địa điểm "${name || ''}".`);
      await loadData();
    } catch (err) {
      toast.error('Lỗi xóa địa điểm: ' + err.message);
    }
  };

  // Filtered dataset
  const displayedPlaces = useMemo(() => {
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
        p.ownerName?.toLowerCase().includes(q);

      const matchCity = !selectedCity || p.city?.toLowerCase().includes(selectedCity.toLowerCase());

      return matchQuery && matchCity;
    });
  }, [activeTab, pendingPlaces, allPlaces, searchQuery, selectedCity]);

  // Stats calculation
  const totalActive = allPlaces.filter(p => p.status === 'ACTIVE').length;
  const avgRating = allPlaces.length > 0
    ? (allPlaces.reduce((sum, p) => sum + (Number(p.averageRating) || 0), 0) / allPlaces.length).toFixed(1)
    : '5.0';

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* 1. BREADCRUMB & TOP HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <span>Quản trị hệ thống</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-sky-600">Kiểm duyệt & Quản lý địa điểm</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
              Quản lý Địa điểm & Phê duyệt Điểm Đến
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
              Spring Boot Live API
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Làm mới dữ liệu</span>
          </button>
        </div>
      </div>

      {/* 2. METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Pending */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-slate-400 font-semibold">Cơ sở / Điểm chờ duyệt</p>
                {pendingPlaces.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-extrabold text-amber-600">
                  {pendingPlaces.length}
                </span>
                {pendingPlaces.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                    Cần duyệt
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">Yêu cầu từ doanh nghiệp & cộng đồng</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Metric 2: Active */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-semibold">Địa điểm chính thức (Active)</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-extrabold text-slate-900">{totalActive}</span>
                <span className="text-xs font-bold text-emerald-600">Đang hiển thị</span>
              </div>
              <p className="text-[11px] text-slate-400">Phục vụ khách du lịch trên bản đồ</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Metric 3: Rating */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-semibold">Đánh giá trung bình hệ thống</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-extrabold text-sky-600">{avgRating} ★</span>
                <span className="text-xs font-bold text-slate-400">Độ tin cậy</span>
              </div>
              <p className="text-[11px] text-slate-400">Dựa trên reviews từ du khách</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. STATUS TABS & SEARCH TOOLBAR */}
      <div className="space-y-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
          {[
            { label: 'Chờ duyệt', count: pendingPlaces.length },
            { label: 'Đang hoạt động', count: totalActive },
            { label: 'Tất cả', count: allPlaces.length }
          ].map(tab => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActiveTab(tab.label)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === tab.label
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                activeTab === tab.label ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên cơ sở, địa chỉ, tỉnh thành, người gửi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 text-slate-800 rounded-full text-xs placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-sky-500/20 border border-slate-200"
            />
          </div>

          <div className="w-full sm:w-56">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 text-slate-800 rounded-full text-xs font-semibold outline-none border border-slate-200 cursor-pointer"
            >
              <option value="">Tất cả tỉnh thành</option>
              <option value="Hà Tĩnh">Hà Tĩnh</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
              <option value="Đà Lạt">Đà Lạt</option>
              <option value="Hà Giang">Hà Giang</option>
              <option value="Hội An">Hội An</option>
              <option value="Phú Quốc">Phú Quốc</option>
              <option value="Ninh Bình">Ninh Bình</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. MAIN DATA TABLE & RIGHT PREVIEW DRAWER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Table Column (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Tên Địa Điểm</th>
                  <th className="py-3.5 px-4">Khu Vực</th>
                  <th className="py-3.5 px-4">Đánh Giá</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedPlaces.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-slate-400">
                      <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                      Không có địa điểm nào trong danh mục này.
                    </td>
                  </tr>
                ) : (
                  displayedPlaces.map(p => {
                    const isSelected = selectedPlace?.id === p.id;
                    const isPending = p.status === 'PENDING_APPROVAL';

                    return (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedPlace(p)}
                        className={`transition-colors cursor-pointer ${
                          isSelected ? 'bg-sky-50/70 border-l-4 border-l-sky-600' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 shadow-sm">
                              <img
                                src={p.coverImageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=150&q=80'}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="space-y-0.5 min-w-0">
                              <h4 className="font-bold text-slate-900 truncate max-w-[180px]">{p.name}</h4>
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                                  {p.categoryName || 'Tọa độ bản địa'}
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

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800 block truncate max-w-[120px]">{p.city || 'Việt Nam'}</span>
                          <span className="text-[10px] text-slate-400 truncate block max-w-[140px]">{p.address}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 font-bold text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{p.averageRating ? Number(p.averageRating).toFixed(1) : '5.0'}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{p.reviewCount || 0} đánh giá</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                            isPending
                              ? 'bg-amber-100 text-amber-800'
                              : p.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isPending ? 'Chờ duyệt' : p.status === 'ACTIVE' ? 'Đã duyệt' : 'Từ chối'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex items-center gap-1">
                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApprove(p.id, p.name)}
                                  className="p-1.5 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                                  title="Phê duyệt"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReject(p.id, p.name)}
                                  className="p-1.5 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-colors cursor-pointer"
                                  title="Từ chối"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDelete(p.id, p.name)}
                              className="p-1.5 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                              title="Xóa vĩnh viễn"
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
        </div>

        {/* Right Preview Drawer (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 sticky top-20">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-sky-600" /> Chi Tiết Cơ Sở / Điểm Đến
            </span>
            {selectedPlace && (
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                selectedPlace.status === 'PENDING_APPROVAL'
                  ? 'bg-amber-100 text-amber-800'
                  : selectedPlace.status === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {selectedPlace.status === 'PENDING_APPROVAL' ? 'Chờ phê duyệt' : selectedPlace.status === 'ACTIVE' ? 'Đã công khai' : 'Từ chối'}
              </span>
            )}
          </div>

          {selectedPlace ? (
            <div className="space-y-3 text-xs">
              {/* Photo */}
              <div className="h-44 rounded-2xl overflow-hidden relative shadow-sm bg-slate-100">
                <img
                  src={selectedPlace.coverImageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'}
                  alt={selectedPlace.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/70 text-white text-[10px] font-bold">
                  {selectedPlace.categoryName || 'Tọa độ bản địa'}
                </span>
              </div>

              {/* Title & Info */}
              <div>
                <h3 className="font-bold text-base text-slate-900">{selectedPlace.name}</h3>
                <p className="text-slate-600 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>{selectedPlace.address || selectedPlace.city || 'Chưa cập nhật địa chỉ'}</span>
                </p>
                {selectedPlace.latitude && selectedPlace.longitude && (
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5 pl-4.5">
                    GPS: {selectedPlace.latitude}, {selectedPlace.longitude}
                  </p>
                )}
              </div>

              {/* Open Hours & Phone */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Giờ mở cửa</span>
                  <span className="font-bold text-slate-800">{selectedPlace.openHours || '07:00 - 22:00'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Liên hệ</span>
                  <span className="font-bold text-slate-800">{selectedPlace.phoneNumber || 'Chưa cập nhật'}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Mô tả chi tiết</span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed text-[11px]">
                  {selectedPlace.description || 'Chưa có thông tin mô tả chi tiết từ người đăng.'}
                </p>
              </div>

              {/* Creator Info */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Người đăng:</span>
                <span className="font-bold text-slate-900">
                  {selectedPlace.ownerName || selectedPlace.ownerHandle || 'Hệ thống'}
                </span>
              </div>

              {/* Action Buttons if Pending */}
              {selectedPlace.status === 'PENDING_APPROVAL' && (
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedPlace.id, selectedPlace.name)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Phê duyệt lên bản đồ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(selectedPlace.id, selectedPlace.name)}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Từ chối
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Chọn một địa điểm ở bảng bên trái để xem thông tin chi tiết.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default AdminPlacesPage;
