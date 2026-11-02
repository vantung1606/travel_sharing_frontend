import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Megaphone, 
  Send, 
  History, 
  Bell, 
  AlertTriangle, 
  Sparkles, 
  Info, 
  Compass, 
  ExternalLink, 
  CheckCircle2, 
  RefreshCw,
  Users,
  Shield,
  Clock,
  MapPin,
  Search,
  Globe,
  Calendar,
  MessageSquare,
  User,
  X,
  Check,
  ChevronRight,
  Filter
} from 'lucide-react';
import { notificationApi } from '../../../services/api';
import { useToast } from '../../../components/common/Toast';
import { useApp } from '../../../context/AppContext';

export const PRESET_SYSTEM_ROUTES = [
  { id: 'home', label: 'Trang chủ', path: '/', icon: Globe, desc: 'Trang chính Wayfare' },
  { id: 'explore', label: 'Khám phá điểm đến', path: '/explore', icon: Compass, desc: 'Bản đồ & 500+ địa điểm du lịch' },
  { id: 'community', label: 'Cộng đồng du lịch', path: '/community', icon: Users, desc: 'Bảng tin chia sẻ bài viết, trải nghiệm' },
  { id: 'itineraries', label: 'Lịch trình du lịch AI', path: '/itineraries', icon: Calendar, desc: 'Kế hoạch hành trình thông minh' },
  { id: 'notifications', label: 'Trung tâm thông báo', path: '/notifications', icon: Bell, desc: 'Hộp thư thông báo của du khách' },
  { id: 'messages', label: 'Hộp thư tin nhắn', path: '/messages', icon: MessageSquare, desc: 'Tin nhắn cá nhân và nhóm phượt' },
  { id: 'profile', label: 'Trang cá nhân', path: '/profile', icon: User, desc: 'Hồ sơ người dùng cá nhân' }
];

const NOTIFICATION_TYPES = [
  {
    id: 'SYSTEM_NEWS',
    label: 'Tin tức & Sự kiện du lịch',
    badgeText: 'Tin tức',
    color: 'sky',
    icon: Compass,
    accentBg: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  {
    id: 'SYSTEM_ALERT',
    label: 'Cảnh báo quan trọng / Thời tiết',
    badgeText: 'Khẩn cấp',
    color: 'rose',
    icon: AlertTriangle,
    accentBg: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  {
    id: 'FEATURE_UPDATE',
    label: 'Cập nhật tính năng & Phiên bản',
    badgeText: 'Cập nhật',
    color: 'emerald',
    icon: Sparkles,
    accentBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    id: 'COMMUNITY_EVENT',
    label: 'Sự kiện cộng đồng phượt thủ',
    badgeText: 'Cộng đồng',
    color: 'purple',
    icon: Users,
    accentBg: 'bg-purple-50 text-purple-700 border-purple-200'
  }
];

export const AdminBroadcastPage = () => {
  const toast = useToast();
  const { currentUser, places, fetchPlaces } = useApp();

  const [form, setForm] = useState({
    title: 'Thông báo từ Ban Quản Trị Wayfare',
    message: '',
    type: 'SYSTEM_NEWS',
    targetUrl: '/explore'
  });

  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Modal gợi ý & tìm kiếm địa điểm / trang hệ thống
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState('places'); // 'places' | 'routes'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');

  // Đảm bảo nạp dữ liệu địa điểm nếu chưa có sẵn
  useEffect(() => {
    if ((!places || places.length === 0) && typeof fetchPlaces === 'function') {
      fetchPlaces();
    }
  }, [places, fetchPlaces]);

  // Danh sách các thành phố độc nhất trong CSDL
  const cities = useMemo(() => {
    if (!Array.isArray(places)) return [];
    return Array.from(new Set(places.map(p => p.city).filter(Boolean))).sort();
  }, [places]);

  // Lọc địa điểm theo từ khóa và thành phố
  const filteredPlaces = useMemo(() => {
    if (!Array.isArray(places)) return [];
    const query = searchQuery.trim().toLowerCase();
    return places.filter(p => {
      const matchCity = selectedCity === 'ALL' || p.city === selectedCity;
      if (!matchCity) return false;
      if (!query) return true;
      const name = (p.name || '').toLowerCase();
      const city = (p.city || '').toLowerCase();
      const cat = (p.categoryName || '').toLowerCase();
      return name.includes(query) || city.includes(query) || cat.includes(query);
    });
  }, [places, searchQuery, selectedCity]);

  // Kiểm tra targetUrl hiện tại có trỏ tới địa điểm cụ thể nào trong CSDL không
  const matchedPlace = useMemo(() => {
    if (!form.targetUrl || !Array.isArray(places)) return null;
    const match = form.targetUrl.match(/^\/places\/(\d+)$/);
    if (!match) return null;
    const placeId = Number(match[1]);
    return places.find(p => p.id === placeId || Number(p.id) === placeId) || null;
  }, [form.targetUrl, places]);

  // Kiểm tra targetUrl có trỏ tới trang hệ thống nào không
  const matchedRoute = useMemo(() => {
    if (!form.targetUrl) return null;
    return PRESET_SYSTEM_ROUTES.find(r => r.path === form.targetUrl) || null;
  }, [form.targetUrl]);

  // Xử lý chọn địa điểm từ picker
  const handleSelectPlace = (place) => {
    setForm(prev => ({
      ...prev,
      targetUrl: `/places/${place.id}`
    }));
    setIsPickerOpen(false);
    toast.success(`Đã chọn địa điểm: ${place.name}`);
  };

  // Xử lý chọn trang hệ thống từ picker
  const handleSelectRoute = (route) => {
    setForm(prev => ({
      ...prev,
      targetUrl: route.path
    }));
    setIsPickerOpen(false);
    toast.success(`Đã chọn: ${route.label}`);
  };

  // Tải lịch sử phát sóng
  const loadHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const res = await notificationApi.getBroadcastHistory();
      setHistory(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Lỗi khi tải lịch sử phát thông báo:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const selectedTypeConfig = NOTIFICATION_TYPES.find(t => t.id === form.type) || NOTIFICATION_TYPES[0];
  const TypeIcon = selectedTypeConfig.icon;

  const handleSendBroadcast = async () => {
    if (!form.message.trim()) {
      toast.error('Vui lòng nhập nội dung thông báo trước khi phát!');
      return;
    }

    try {
      setSending(true);
      const payload = {
        type: form.type,
        message: form.title ? `[${form.title}] ${form.message}` : form.message,
        targetUrl: form.targetUrl || '/',
        senderEmail: currentUser?.email
      };

      const res = await notificationApi.broadcastNotification(payload);
      toast.success(res?.data?.message || 'Đã phát sóng thông báo toàn hệ thống thành công!');
      
      // Reset message
      setForm(prev => ({ ...prev, message: '' }));
      setConfirmModalOpen(false);

      // Reload history
      await loadHistory();
    } catch (err) {
      console.error('Lỗi phát sóng:', err);
      toast.error(err.message || 'Không thể phát sóng thông báo');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* ─── 1. HEADER BANNER ────────────────────────────────────────────── */}
      <div className="p-6 bg-[#FFFDF8] rounded-[6px] border border-ink-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[6px] bg-clay-700 text-white flex items-center justify-center shadow-xs">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-serif text-ink-900 tracking-tight flex items-center gap-2">
              Trung Tâm Phát Thông Báo Toàn Hệ Thống
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                Real-Time STOMP
              </span>
            </h1>
            <p className="text-xs text-ink-500 font-sans mt-0.5">
              Soạn và gửi thông báo trực tiếp đến tất cả thành viên trong cộng đồng du lịch Wayfare theo thời gian thực.
            </p>
          </div>
        </div>

        <button
          onClick={loadHistory}
          disabled={loadingHistory}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-serif font-medium text-ink-600 bg-[#F8F4EC] hover:bg-ink-100 border border-ink-200 rounded-[5px] transition-colors cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
          Làm mới lịch sử
        </button>
      </div>

      {/* ─── 2. MAIN WORKSPACE (Form + Live Preview) ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Composer Form (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#FFFDF8] rounded-[6px] border border-ink-200/80 p-6 shadow-2xs space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-ink-100">
              <span className="font-serif font-bold text-sm text-ink-900">
                Soạn Nội Dung Phát Sóng
              </span>
              <span className="text-[11px] font-mono text-ink-400">
                Gửi tới: Tất cả người dùng đang hoạt động
              </span>
            </div>

            {/* Type selector */}
            <div className="space-y-2">
              <label className="text-xs font-serif font-bold text-ink-800 block">
                Phân loại thông báo
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {NOTIFICATION_TYPES.map(t => {
                  const Icon = t.icon;
                  const isSelected = form.type === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, type: t.id }))}
                      className={`p-3 rounded-[5px] border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-clay-50/80 border-clay-600 ring-1 ring-clay-600' 
                          : 'bg-[#FFFDF8] border-ink-200 hover:bg-[#F8F4EC]'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-[4px] flex items-center justify-center shrink-0 border ${t.accentBg}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-serif font-bold text-ink-900 block truncate">
                          {t.label}
                        </span>
                        <span className="text-[10px] font-mono text-ink-400">
                          Nhãn: {t.badgeText}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-serif font-bold text-ink-800 block">
                Tiêu đề thông báo
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ví dụ: Chào đón Tuần lễ Du lịch Biển Đảo 2026..."
                className="w-full px-3.5 py-2 bg-[#FFFDF8] border border-ink-200 rounded-[5px] text-xs font-sans text-ink-900 focus:outline-hidden focus:border-clay-600 focus:ring-1 focus:ring-clay-600"
              />
            </div>

            {/* Message Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-serif font-bold text-ink-800 block">
                  Nội dung chi tiết thông điệp <span className="text-rose-600">*</span>
                </label>
                <span className="text-[10px] font-mono text-ink-400">
                  {form.message.length} / 500 ký tự
                </span>
              </div>
              <textarea
                rows={4}
                maxLength={500}
                value={form.message}
                onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Nhập nội dung thông điệp bạn muốn gửi đến toàn thể cộng đồng du khách..."
                className="w-full p-3 bg-[#FFFDF8] border border-ink-200 rounded-[5px] text-xs font-sans text-ink-900 focus:outline-hidden focus:border-clay-600 focus:ring-1 focus:ring-clay-600 resize-none leading-relaxed"
              />
            </div>

            {/* Target URL with Smart Suggestions & Place Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-serif font-bold text-ink-800 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-clay-700" />
                  Đường dẫn liên kết khi du khách bấm vào (Target URL)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setPickerTab('places');
                    setIsPickerOpen(true);
                  }}
                  className="text-[11px] font-serif font-bold text-clay-700 hover:text-clay-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <MapPin className="w-3 h-3 text-clay-700" />
                  <span>Tra cứu 500+ địa điểm CSDL</span>
                </button>
              </div>

              {/* Input with Clear & Test Link */}
              <div className="relative flex items-center">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={form.targetUrl}
                  onChange={(e) => setForm(prev => ({ ...prev, targetUrl: e.target.value }))}
                  placeholder="/explore hoặc /places/12 hoặc /community"
                  className="w-full pl-9 pr-24 py-2 bg-[#FFFDF8] border border-ink-200 rounded-[5px] text-xs font-mono text-ink-900 focus:outline-hidden focus:border-clay-600 focus:ring-1 focus:ring-clay-600"
                />
                
                {/* Right utility buttons: Clear & Test Link */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {form.targetUrl && (
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, targetUrl: '' }))}
                      className="p-1 hover:bg-ink-100 rounded text-ink-400 hover:text-ink-600 cursor-pointer"
                      title="Xóa đường dẫn"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {form.targetUrl && (
                    <a
                      href={form.targetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-0.5 rounded bg-[#F8F4EC] hover:bg-ink-100 border border-ink-200 text-[10px] font-mono font-bold text-clay-700 inline-flex items-center gap-1 cursor-pointer"
                      title="Mở thử trang đích trong tab mới"
                    >
                      <span>Mở thử</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Active Destination Badge if targeting a specific place */}
              {matchedPlace && (
                <div className="p-2.5 rounded-[5px] bg-clay-50/90 border border-clay-200 flex items-center justify-between text-xs animate-in fade-in">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={matchedPlace.coverImageUrl || matchedPlace.images?.[0] || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=150&q=80'}
                      alt={matchedPlace.name}
                      className="w-9 h-9 rounded-[4px] object-cover border border-clay-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-serif font-bold text-ink-900 text-xs truncate">
                        {matchedPlace.name}
                      </div>
                      <div className="text-[10px] font-mono text-clay-700 flex items-center gap-2 mt-0.5">
                        <span>📍 {matchedPlace.city}</span>
                        {matchedPlace.categoryName && <span>• {matchedPlace.categoryName}</span>}
                        {matchedPlace.averageRating > 0 && <span>• ⭐ {Number(matchedPlace.averageRating).toFixed(1)}</span>}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-clay-100 text-clay-800 border border-clay-300 shrink-0 ml-2">
                    ID #{matchedPlace.id}
                  </span>
                </div>
              )}

              {/* Quick Preset Route Chips */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-ink-400 block">
                    Gợi ý đường dẫn nhanh 1-chạm:
                  </span>
                  <span className="text-[10px] font-mono text-ink-400">
                    Click vào thẻ để tự động điền
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {PRESET_SYSTEM_ROUTES.map(route => {
                    const isSelected = form.targetUrl === route.path;
                    const Icon = route.icon;
                    return (
                      <button
                        key={route.path}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, targetUrl: route.path }))}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] text-[11px] font-serif transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-clay-700 text-white border-clay-700 font-bold shadow-2xs'
                            : 'bg-[#F8F4EC] text-ink-700 border-ink-200/80 hover:bg-ink-100 hover:text-ink-900'
                        }`}
                        title={route.desc}
                      >
                        <Icon className="w-3 h-3 shrink-0" />
                        <span>{route.label}</span>
                        <span className={`text-[9px] font-mono ${isSelected ? 'text-white/80' : 'text-ink-400'}`}>
                          ({route.path})
                        </span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => {
                      setPickerTab('places');
                      setIsPickerOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-[11px] font-serif font-bold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-all cursor-pointer shadow-2xs"
                  >
                    <MapPin className="w-3 h-3 text-amber-700 shrink-0" />
                    <span>Chọn địa điểm cụ thể...</span>
                    <span className="text-[9px] font-mono px-1 rounded bg-amber-200/70 text-amber-900">
                      {places?.length || 500}+
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-between border-t border-ink-100">
              <span className="text-[11px] text-ink-400 font-sans">
                Thông báo sẽ lập tức hiển thị trên máy tính và điện thoại của du khách.
              </span>

              <button
                type="button"
                onClick={() => setConfirmModalOpen(true)}
                disabled={!form.message.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[5px] bg-clay-700 hover:bg-clay-800 text-white font-serif font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                Phát Sóng Ngay
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: Live Notification Mockup Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-[#FFFDF8] rounded-[6px] border border-ink-200/80 p-5 shadow-2xs space-y-4">
            <span className="font-serif font-bold text-xs text-ink-900 block pb-2 border-b border-ink-100">
              Mô Phỏng Trực Quan Thông Báo (Live Preview)
            </span>

            {/* 1. In-App Notification Center Card Preview */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-ink-400 block">
                1. Hiển thị trong Trung tâm Thông báo (/notifications):
              </span>
              <div className="p-3.5 rounded-[6px] bg-[#F8F4EC] border border-ink-200/80 shadow-2xs flex items-start gap-3">
                <div className={`w-8 h-8 rounded-[4px] flex items-center justify-center shrink-0 border ${selectedTypeConfig.accentBg}`}>
                  <TypeIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-serif font-bold text-xs text-ink-900 truncate">
                      {form.title || 'Thông báo từ Ban Quản Trị'}
                    </span>
                    <span className="text-[10px] font-mono text-ink-400 shrink-0">
                      Vừa xong
                    </span>
                  </div>
                  <p className="text-xs text-ink-600 font-sans mt-1 line-clamp-3 leading-relaxed">
                    {form.message || 'Nội dung thông điệp sẽ hiển thị tại đây khi bạn nhập vào biểu mẫu...'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-1.5 py-0.2 rounded-[2px] text-[9px] font-mono font-bold border ${selectedTypeConfig.accentBg}`}>
                      {selectedTypeConfig.badgeText}
                    </span>
                    <span className="text-[10px] font-mono text-clay-700 truncate">
                      Liên kết: {form.targetUrl || '/'}
                      {matchedPlace ? ` (📍 ${matchedPlace.name})` : matchedRoute ? ` (🌐 ${matchedRoute.label})` : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Floating Pop-up Toast Preview */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-ink-400 block">
                2. Pop-up Toast góc phải màn hình của du khách:
              </span>
              <div className="p-3 rounded-[6px] bg-ink-900 text-white shadow-xl flex items-center gap-3">
                <div className="w-7 h-7 rounded-[4px] bg-clay-600 text-white flex items-center justify-center shrink-0">
                  <Bell className="w-3.5 h-3.5 animate-bounce" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold font-serif text-amber-300 truncate">
                    🔔 {form.title || 'Thông báo mới'}
                  </p>
                  <p className="text-[11px] text-ink-200 font-sans truncate mt-0.5">
                    {form.message || 'Nội dung thông báo nổi...'}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Stats Banner */}
          <div className="p-4 rounded-[6px] bg-amber-50/70 border border-amber-200 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed font-sans">
              <span className="font-bold font-serif">Nguyên tắc phát sóng thông báo:</span>
              <p className="mt-0.5 text-amber-800">
                Các thông báo khẩn cấp hoặc tin tức lớn nên được soạn thảo trang trọng, ngắn gọn và dẫn link chính xác đến điểm đến hoặc bài viết cộng đồng liên quan.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* ─── 3. BROADCAST HISTORY TABLE ──────────────────────────────────── */}
      <div className="bg-[#FFFDF8] rounded-[6px] border border-ink-200/80 shadow-2xs overflow-hidden space-y-3">
        <div className="p-4 border-b border-ink-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-clay-700" />
            <h2 className="font-serif font-bold text-sm text-ink-900">
              Nhật Ký Các Đợt Phát Sóng Gần Nhất ({history.length})
            </h2>
          </div>
          <span className="text-[11px] font-mono text-ink-400">
            Lưu vết tự động bởi Audit Engine
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#F8F4EC]/70 text-ink-500 font-mono text-[10px] uppercase tracking-wider border-b border-ink-200/80">
              <tr>
                <th className="py-2.5 px-4 w-12 text-center">STT</th>
                <th className="py-2.5 px-4">Thông điệp phát sóng</th>
                <th className="py-2.5 px-4">Người thực hiện</th>
                <th className="py-2.5 px-4">Thời gian</th>
                <th className="py-2.5 px-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {loadingHistory ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-400 text-xs">
                    Đang tải nhật ký phát sóng...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-400 text-xs">
                    Chưa có đợt phát sóng thông báo nào được ghi nhận.
                  </td>
                </tr>
              ) : (
                history.map((log, index) => (
                  <tr key={log.id || index} className="hover:bg-[#F8F4EC]/60 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-ink-400">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-serif font-bold text-ink-900">
                        {log.actionDesc || log.message || log.details}
                      </div>
                      <div className="text-[11px] font-mono text-ink-400 mt-0.5">
                        Mã hành động: {log.action || 'BROADCAST_NOTIFICATION'}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-ink-600">
                      {log.userEmail || log.userName || 'Quản trị viên'}
                    </td>
                    <td className="py-3 px-4 font-mono text-ink-500 text-[11px]">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString('vi-VN') : 'Gần đây'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Đã gửi
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 4. CONFIRMATION DIALOG MODAL ─────────────────────────────────── */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-[2px] animate-in fade-in duration-150">
          <div className="bg-[#FFFDF8] rounded-[6px] border border-ink-200/80 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-clay-700">
              <div className="w-10 h-10 rounded-full bg-clay-100 flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5 text-clay-700" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-ink-900">
                  Xác nhận Phát Sóng Thông Báo
                </h3>
                <p className="text-xs text-ink-500 font-sans mt-0.5">
                  Thao tác này sẽ gửi thông báo đến <strong>toàn thể người dùng</strong>.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 text-xs font-sans space-y-1.5">
              <p className="font-serif font-bold text-ink-800">
                {form.title}
              </p>
              <p className="text-ink-600 line-clamp-3 leading-relaxed">
                {form.message}
              </p>
              <p className="text-[11px] font-mono text-clay-700 pt-1 border-t border-ink-200/60">
                Trang đích: {form.targetUrl || '/'} {matchedPlace ? `(${matchedPlace.name})` : ''}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-ink-100">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                disabled={sending}
                className="px-4 py-2 rounded-[5px] text-xs font-serif font-bold text-ink-600 hover:bg-[#F8F4EC] transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSendBroadcast}
                disabled={sending}
                className="px-5 py-2 rounded-[5px] text-xs font-serif font-bold bg-clay-700 hover:bg-clay-800 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className={`w-3.5 h-3.5 ${sending ? 'animate-spin' : ''}`} />
                {sending ? 'Đang phát sóng...' : 'Xác Nhận Phát Sóng'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 5. TARGET URL & PLACE PICKER MODAL ───────────────────────────── */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-[2px] animate-in fade-in duration-150">
          <div className="bg-[#FFFDF8] rounded-[8px] border border-ink-200/90 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-ink-100 flex items-center justify-between bg-[#F8F4EC]/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[6px] bg-clay-700 text-white flex items-center justify-center shadow-xs">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-ink-900">
                    Gợi Ý & Chọn Đường Dẫn Đích Thông Báo
                  </h3>
                  <p className="text-[11px] text-ink-500 font-sans mt-0.5">
                    Chọn nhanh trang hệ thống hoặc tìm kiếm chính xác trong CSDL hơn 500 địa điểm du lịch
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="p-1.5 rounded-[4px] hover:bg-ink-100 text-ink-400 hover:text-ink-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-ink-200 bg-[#FFFDF8] px-4 pt-2 gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setPickerTab('places')}
                className={`pb-2.5 px-3 text-xs font-serif font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                  pickerTab === 'places'
                    ? 'border-clay-700 text-clay-700'
                    : 'border-transparent text-ink-500 hover:text-ink-800'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Địa Điểm Du Lịch CSDL ({filteredPlaces.length}/{places?.length || 0})</span>
              </button>
              <button
                type="button"
                onClick={() => setPickerTab('routes')}
                className={`pb-2.5 px-3 text-xs font-serif font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                  pickerTab === 'routes'
                    ? 'border-clay-700 text-clay-700'
                    : 'border-transparent text-ink-500 hover:text-ink-800'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Trang Hệ Thống ({PRESET_SYSTEM_ROUTES.length})</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
              
              {/* TAB 1: PLACES */}
              {pickerTab === 'places' && (
                <div className="space-y-3">
                  {/* Search and Filters */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm theo tên địa điểm, danh mục hoặc tỉnh thành (ví dụ: Bà Nà, Hà Giang, Cà Phê...)..."
                        className="w-full pl-9 pr-8 py-2 bg-[#FFFDF8] border border-ink-200 rounded-[5px] text-xs font-sans text-ink-900 focus:outline-hidden focus:border-clay-600 focus:ring-1 focus:ring-clay-600"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* City Chips */}
                    {cities.length > 0 && (
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-sans scrollbar-none">
                        <span className="text-[10px] font-mono text-ink-400 shrink-0">Tỉnh thành:</span>
                        <button
                          type="button"
                          onClick={() => setSelectedCity('ALL')}
                          className={`px-2 py-0.5 rounded-[3px] text-[10px] font-mono shrink-0 transition-colors cursor-pointer border ${
                            selectedCity === 'ALL'
                              ? 'bg-clay-700 text-white border-clay-700 font-bold'
                              : 'bg-[#F8F4EC] text-ink-600 border-ink-200 hover:bg-ink-100'
                          }`}
                        >
                          Tất cả ({places?.length || 0})
                        </button>
                        {cities.slice(0, 15).map(city => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => setSelectedCity(city)}
                            className={`px-2 py-0.5 rounded-[3px] text-[10px] font-mono shrink-0 transition-colors cursor-pointer border ${
                              selectedCity === city
                                ? 'bg-clay-700 text-white border-clay-700 font-bold'
                                : 'bg-[#F8F4EC] text-ink-600 border-ink-200 hover:bg-ink-100'
                            }`}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Places Grid */}
                  {filteredPlaces.length === 0 ? (
                    <div className="py-12 text-center text-ink-400 text-xs font-sans">
                      Không tìm thấy địa điểm nào phù hợp với từ khóa "{searchQuery}".
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {filteredPlaces.slice(0, 50).map(place => {
                        const isSelected = form.targetUrl === `/places/${place.id}`;
                        const img = place.coverImageUrl || place.images?.[0] || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80';
                        return (
                          <button
                            key={place.id}
                            type="button"
                            onClick={() => handleSelectPlace(place)}
                            className={`p-2.5 rounded-[6px] border text-left flex items-start gap-3 transition-all cursor-pointer group ${
                              isSelected
                                ? 'bg-clay-50 border-clay-600 ring-1 ring-clay-600'
                                : 'bg-[#FFFDF8] border-ink-200/80 hover:bg-[#F8F4EC] hover:border-ink-300'
                            }`}
                          >
                            <img
                              src={img}
                              alt={place.name}
                              className="w-12 h-12 rounded-[4px] object-cover border border-ink-200 shrink-0 group-hover:scale-105 transition-transform"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-serif font-bold text-xs text-ink-900 truncate block">
                                  {place.name}
                                </span>
                                {isSelected && (
                                  <Check className="w-3.5 h-3.5 text-clay-700 shrink-0" />
                                )}
                              </div>
                              <div className="text-[10px] font-mono text-ink-500 flex items-center gap-1.5 mt-0.5">
                                <span className="text-clay-700 font-medium">{place.city || 'Việt Nam'}</span>
                                {place.categoryName && <span>• {place.categoryName}</span>}
                              </div>
                              <div className="flex items-center justify-between mt-1.5">
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-ink-100 text-ink-600 border border-ink-200">
                                  /places/{place.id}
                                </span>
                                {place.averageRating > 0 && (
                                  <span className="text-[10px] font-mono text-amber-700 font-bold">
                                    ⭐ {Number(place.averageRating).toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {filteredPlaces.length > 50 && (
                    <p className="text-[10px] font-mono text-center text-ink-400 pt-1">
                      Đang hiển thị 50 / {filteredPlaces.length} địa điểm. Nhập thêm từ khóa tìm kiếm để thu hẹp kết quả.
                    </p>
                  )}
                </div>
              )}

              {/* TAB 2: SYSTEM ROUTES */}
              {pickerTab === 'routes' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PRESET_SYSTEM_ROUTES.map(route => {
                    const isSelected = form.targetUrl === route.path;
                    const Icon = route.icon;
                    return (
                      <button
                        key={route.path}
                        type="button"
                        onClick={() => handleSelectRoute(route)}
                        className={`p-3.5 rounded-[6px] border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-clay-50 border-clay-600 ring-1 ring-clay-600'
                            : 'bg-[#FFFDF8] border-ink-200/80 hover:bg-[#F8F4EC] hover:border-ink-300'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-[4px] flex items-center justify-center shrink-0 border ${
                          isSelected ? 'bg-clay-700 text-white border-clay-700' : 'bg-[#F8F4EC] text-ink-700 border-ink-200'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-serif font-bold text-xs text-ink-900 block truncate">
                              {route.label}
                            </span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-clay-700 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-ink-500 font-sans mt-0.5 leading-relaxed">
                            {route.desc}
                          </p>
                          <span className="inline-block text-[9px] font-mono px-1.5 py-0.2 rounded bg-ink-100 text-ink-600 border border-ink-200 mt-1.5">
                            {route.path}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-ink-100 bg-[#F8F4EC]/60 flex items-center justify-between shrink-0">
              <span className="text-[11px] font-mono text-ink-500">
                Đường dẫn hiện tại: <strong className="text-clay-700">{form.targetUrl || '/'}</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="px-4 py-1.5 rounded-[4px] bg-ink-800 hover:bg-ink-900 text-white font-serif font-bold text-xs transition-colors cursor-pointer"
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
