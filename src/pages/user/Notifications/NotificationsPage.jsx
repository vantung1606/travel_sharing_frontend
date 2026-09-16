import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../components/common/Toast';
import {
  Bell,
  Sparkles,
  Heart,
  MessageCircle,
  Users,
  MapPin,
  ShieldCheck,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  ChevronRight,
  ExternalLink,
  Clock,
  Send,
  PlusCircle,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  X
} from 'lucide-react';

export const NotificationsPage = () => {
  const toast = useToast();
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    addTestNotification,
    setUserTab,
    setPortalMode,
    isNotificationLiveBackend
  } = useApp();

  // Filter States
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'ai' | 'social' | 'trips' | 'system'
  const [searchQuery, setSearchQuery] = useState('');
  const [isTestDispatcherOpen, setIsTestDispatcherOpen] = useState(false);

  // Test Notification Form States
  const [testType, setTestType] = useState('AI_READY');
  const [testActorName, setTestActorName] = useState('Trợ Lý WanderAI');
  const [testActorHandle, setTestActorHandle] = useState('@wanderai_assistant');
  const [testMessage, setTestMessage] = useState('Lịch trình thông minh của bạn đã sẵn sàng với 5 điểm check-in tối ưu!');
  const [testTargetUrl, setTestTargetUrl] = useState('/itineraries');
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);

  // Icon Resolver
  const getTypeMeta = (type) => {
    switch (type) {
      case 'AI_READY':
        return {
          icon: Sparkles,
          color: 'text-amber-500 bg-amber-50 border-amber-200',
          badgeText: 'AI Planner',
          actionText: 'Xem Lịch Trình'
        };
      case 'LIKE':
        return {
          icon: Heart,
          color: 'text-rose-500 bg-rose-50 border-rose-200',
          badgeText: 'Yêu Thích',
          actionText: 'Xem Bài Viết'
        };
      case 'COMMENT':
        return {
          icon: MessageCircle,
          color: 'text-sky-500 bg-sky-50 border-sky-200',
          badgeText: 'Bình Luận',
          actionText: 'Trả Lời Ngay'
        };
      case 'CHAT_INVITE':
        return {
          icon: Users,
          color: 'text-indigo-500 bg-indigo-50 border-indigo-200',
          badgeText: 'Nhóm Chuyến Đi',
          actionText: 'Vào Phòng Chat'
        };
      case 'PLACE_APPROVED':
        return {
          icon: MapPin,
          color: 'text-teal-500 bg-teal-50 border-teal-200',
          badgeText: 'Địa Điểm',
          actionText: 'Xem Địa Điểm'
        };
      case 'SYSTEM':
      default:
        return {
          icon: ShieldCheck,
          color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
          badgeText: 'Hệ Thống',
          actionText: 'Chi Tiết'
        };
    }
  };

  const formatRelativeTime = (isoString) => {
    if (!isoString) return 'Vừa xong';
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  };

  // Filter Logic
  const filteredNotifications = useMemo(() => {
    return notifications.filter(item => {
      // Tab matching
      let tabMatch = true;
      if (activeTab === 'unread') {
        tabMatch = !item.isRead;
      } else if (activeTab === 'ai') {
        tabMatch = item.type === 'AI_READY';
      } else if (activeTab === 'social') {
        tabMatch = item.type === 'LIKE' || item.type === 'COMMENT';
      } else if (activeTab === 'trips') {
        tabMatch = item.type === 'CHAT_INVITE' || item.type === 'ITINERARY_SHARED';
      } else if (activeTab === 'system') {
        tabMatch = item.type === 'SYSTEM' || item.type === 'PLACE_APPROVED';
      }

      // Search matching
      const query = searchQuery.trim().toLowerCase();
      const searchMatch = !query ||
        item.message?.toLowerCase().includes(query) ||
        item.actorName?.toLowerCase().includes(query) ||
        item.actorHandle?.toLowerCase().includes(query);

      return tabMatch && searchMatch;
    });
  }, [notifications, activeTab, searchQuery]);

  const handleActionClick = (item) => {
    if (!item.isRead) {
      markNotificationAsRead(item.id);
    }

    if (item.targetUrl) {
      if (item.targetUrl.includes('itinerar')) {
        setPortalMode('user');
        setUserTab('itineraries');
      } else if (item.targetUrl.includes('community')) {
        setPortalMode('user');
        setUserTab('community');
      } else if (item.targetUrl.includes('messages')) {
        setPortalMode('user');
        setUserTab('messages');
      } else if (item.targetUrl.includes('explore')) {
        setPortalMode('user');
        setUserTab('explore');
      } else if (item.targetUrl.includes('ai-config')) {
        setPortalMode('admin');
      }
    }
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
    toast.success('Đã đánh dấu tất cả thông báo là đã đọc! ✓');
  };

  const handleDeleteRead = () => {
    const readItems = notifications.filter(n => n.isRead);
    readItems.forEach(n => deleteNotification(n.id));
    toast.info(`Đã dọn dẹp ${readItems.length} thông báo đã đọc.`);
  };

  const handleCreateTestPush = async (e) => {
    e.preventDefault();
    setIsSubmittingTest(true);

    const payload = {
      type: testType,
      actorName: testActorName,
      actorHandle: testActorHandle,
      message: testMessage,
      targetUrl: testTargetUrl
    };

    try {
      await addTestNotification(payload);
      toast.success('Đã gửi thông báo mới thành công! 🔔');
      setIsTestDispatcherOpen(false);
    } catch {
      toast.error('Gửi thông báo thất bại.');
    } finally {
      setIsSubmittingTest(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fade-in">
      
      {/* ─── 1. BREADCRUMB & PAGE HEADER ────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span
              onClick={() => setUserTab('home')}
              className="hover:text-sky-600 transition-colors cursor-pointer"
            >
              Trang chủ
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-sky-600 font-bold">M08. Trung tâm Thông Báo</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Trung Tâm Thông Báo & Cảnh Báo Hành Trình
            </h1>
            {unreadNotificationsCount > 0 ? (
              <span className="px-3 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-xs shadow-xs">
                {unreadNotificationsCount} chưa đọc
              </span>
            ) : (
              <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-xs">
                Đã cập nhật hết
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-2">
            <span>Theo dõi các gợi ý thông minh từ AI, tương tác bạn bè và cập nhật trạng thái địa điểm.</span>
            {isNotificationLiveBackend && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Kết nối MySQL
              </span>
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
          <button
            type="button"
            onClick={() => setIsTestDispatcherOpen(!isTestDispatcherOpen)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-all shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-sky-600" />
            <span>Gửi thông báo thật / Test</span>
          </button>

          {unreadNotificationsCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Đọc tất cả</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDeleteRead}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-rose-600 transition-colors shadow-xs"
            title="Dọn dẹp thông báo đã đọc"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── 2. LIVE PUSH / TEST NOTIFICATION DISPATCHER CARD ─────────────────── */}
      {isTestDispatcherOpen && (
        <div className="bg-gradient-to-br from-sky-50 via-white to-orange-50/30 rounded-3xl p-6 border-2 border-sky-300/80 shadow-md animate-in fade-in slide-in-from-top-3 duration-200 space-y-4">
          <div className="flex items-center justify-between border-b border-sky-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-sm">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-900">
                  Khu vực kiểm thử & Bắn thông báo thật (Live Dispatcher)
                </h3>
                <p className="text-xs text-slate-500">
                  Gửi trực tiếp thông báo mới vào CSDL Backend và hiển thị ngay trên màn hình.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsTestDispatcherOpen(false)}
              className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-500 flex items-center justify-center border border-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateTestPush} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Loại thông báo (Type)</label>
              <select
                value={testType}
                onChange={(e) => {
                  setTestType(e.target.value);
                  if (e.target.value === 'AI_READY') {
                    setTestActorName('Trợ Lý WanderAI');
                    setTestActorHandle('@wanderai_assistant');
                    setTestMessage('Lịch trình du lịch mới của bạn đã hoàn tất!');
                    setTestTargetUrl('/itineraries');
                  } else if (e.target.value === 'LIKE') {
                    setTestActorName('Hoàng Nam');
                    setTestActorHandle('@namwanderer');
                    setTestMessage('Hoàng Nam đã thích bài viết chia sẻ hành trình của bạn.');
                    setTestTargetUrl('/community');
                  } else if (e.target.value === 'CHAT_INVITE') {
                    setTestActorName('Minh Anh');
                    setTestActorHandle('@minh_anh');
                    setTestMessage('Bạn nhận được lời mời tham gia nhóm chuyến đi biển Đà Nẵng.');
                    setTestTargetUrl('/messages');
                  }
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-sky-500"
              >
                <option value="AI_READY">✨ AI_READY (Trợ lý AI tạo lịch trình)</option>
                <option value="LIKE">❤️ LIKE (Thích bài viết)</option>
                <option value="COMMENT">💬 COMMENT (Bình luận bài viết)</option>
                <option value="CHAT_INVITE">👥 CHAT_INVITE (Mời vào nhóm chat)</option>
                <option value="PLACE_APPROVED">📍 PLACE_APPROVED (Địa điểm được duyệt)</option>
                <option value="SYSTEM">🛡️ SYSTEM (Thông báo hệ thống)</option>
              </select>
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Tên người gửi (Actor Name)</label>
              <input
                type="text"
                value={testActorName}
                onChange={(e) => setTestActorName(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-sky-500"
              />
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Đường dẫn điều hướng (Target URL)</label>
              <input
                type="text"
                value={testTargetUrl}
                onChange={(e) => setTestTargetUrl(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-sky-500"
              />
            </div>

            <div className="md:col-span-12 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Nội dung thông báo (Message)</label>
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-sky-500"
              />
            </div>

            <div className="md:col-span-12 flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsTestDispatcherOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={isSubmittingTest}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingTest ? 'Đang gửi...' : 'Bắn thông báo ngay'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── 3. FILTER TABS & SEARCH BAR ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'unread', label: 'Chưa đọc' },
            { id: 'ai', label: 'Trợ lý AI' },
            { id: 'social', label: 'Cộng đồng' },
            { id: 'trips', label: 'Chuyến đi' },
            { id: 'system', label: 'Hệ thống' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Filter */}
        <div className="relative min-w-0 md:w-64 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo từ khóa, người gửi..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-500 focus:bg-white"
          />
        </div>
      </div>

      {/* ─── 4. NOTIFICATION CARDS LIST ─────────────────────────────────────────── */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(item => {
            const meta = getTypeMeta(item.type);
            const Icon = meta.icon;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group relative ${
                  !item.isRead
                    ? 'border-sky-200/90 bg-sky-50/20 shadow-xs'
                    : 'border-slate-200/80'
                }`}
              >
                {/* Left Side: Avatar & Message Details */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* Avatar + Badge */}
                  <div className="relative shrink-0 mt-0.5">
                    <img
                      src={item.actorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                      alt={item.actorName || 'User'}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100"
                    />
                    <span className={`absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full border-2 border-white shadow-xs flex items-center justify-center ${meta.color}`}>
                      <Icon className="w-3 h-3" />
                    </span>
                  </div>

                  {/* Main Info */}
                  <div className="space-y-1 min-w-0 pr-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                        {item.actorName}
                      </span>
                      {item.actorHandle && (
                        <span className="text-[11px] font-semibold text-slate-400">
                          {item.actorHandle}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${meta.color}`}>
                        {meta.badgeText}
                      </span>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-sky-600 inline-block"></span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      {item.message}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(item.createdAt)}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[10px]">
                        {new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleActionClick(item)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs transition-colors shadow-xs"
                  >
                    <span>{meta.actionText}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!item.isRead) {
                        markNotificationAsRead(item.id);
                        toast.info('Đã đánh dấu đã đọc.');
                      }
                    }}
                    disabled={item.isRead}
                    className={`p-2 rounded-xl border text-xs transition-colors ${
                      item.isRead
                        ? 'border-transparent text-slate-300 cursor-default'
                        : 'border-slate-200 bg-white text-slate-600 hover:text-sky-600 shadow-xs'
                    }`}
                    title={item.isRead ? 'Đã đọc' : 'Đánh dấu đã đọc'}
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      deleteNotification(item.id);
                      toast.info('Đã xóa thông báo.');
                    }}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors shadow-xs"
                    title="Xóa thông báo này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          /* Empty state */
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto shadow-inner">
              <Bell className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-extrabold text-base text-slate-800">
                Không tìm thấy thông báo nào
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Không có thông báo phù hợp với bộ lọc hiện tại. Thử chọn danh mục khác hoặc bấm nút "Gửi thông báo thật / Test" ở trên.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveTab('all');
                setSearchQuery('');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Xem tất cả thông báo</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
