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
  Megaphone,
  X,
  Share2,
  EyeOff,
  ShieldAlert,
  Flag,
  Inbox
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
    broadcastNotification,
    fetchNotifications,
    currentUser,
    setUserTab,
    setPortalMode,
    isNotificationLiveBackend
  } = useApp();

  // Filter States
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'ai' | 'social' | 'trips' | 'system'
  const [searchQuery, setSearchQuery] = useState('');
  const [isTestDispatcherOpen, setIsTestDispatcherOpen] = useState(false);
  const [dispatchMode, setDispatchMode] = useState('test'); // 'test' | 'broadcast'
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Test Notification Form States
  const [testType, setTestType] = useState('AI_READY');
  const [testActorName, setTestActorName] = useState('Trợ Lý WanderAI');
  const [testActorHandle, setTestActorHandle] = useState('@wanderai_assistant');
  const [testMessage, setTestMessage] = useState('Lịch trình thông minh của bạn đã sẵn sàng với 5 điểm check-in tối ưu!');
  const [testTargetUrl, setTestTargetUrl] = useState('/itineraries');
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);

  // Icon Resolver (Paper-Ink-Clay palette)
  const getTypeMeta = (type) => {
    switch (type) {
      case 'AI_READY':
        return {
          icon: Sparkles,
          color: 'text-amber-800 bg-amber-50 border-amber-300/80',
          badgeText: 'AI Planner',
          actionText: 'Xem Lịch Trình'
        };
      case 'LIKE':
        return {
          icon: Heart,
          color: 'text-rose-700 bg-rose-50 border-rose-300/80',
          badgeText: 'Yêu Thích',
          actionText: 'Xem Bài Viết'
        };
      case 'COMMENT':
        return {
          icon: MessageCircle,
          color: 'text-clay-800 bg-clay-50 border-clay-300/80',
          badgeText: 'Bình Luận',
          actionText: 'Trả Lời'
        };
      case 'COMMENT_REPLY':
        return {
          icon: MessageCircle,
          color: 'text-clay-800 bg-clay-50 border-clay-300/80',
          badgeText: 'Phản Hồi',
          actionText: 'Trả Lời'
        };
      case 'CHAT_MESSAGE':
        return {
          icon: MessageCircle,
          color: 'text-ink-700 bg-[#F8F4EC] border-ink-200/80',
          badgeText: 'Tin Nhắn Mới',
          actionText: 'Vào Trò Chuyện'
        };
      case 'FOLLOW':
        return {
          icon: Users,
          color: 'text-emerald-800 bg-emerald-50 border-emerald-300/80',
          badgeText: 'Người Theo Dõi',
          actionText: 'Xem Cộng Đồng'
        };
      case 'SHARE':
      case 'COMMUNITY_SHARE':
        return {
          icon: Share2,
          color: 'text-clay-800 bg-clay-50 border-clay-300/80',
          badgeText: 'Chia Sẻ',
          actionText: 'Xem Bài Viết'
        };
      case 'ITINERARY_SHARED':
        return {
          icon: ExternalLink,
          color: 'text-amber-800 bg-amber-50 border-amber-300/80',
          badgeText: 'Sao Chép Tour',
          actionText: 'Xem Lịch Trình'
        };
      case 'CHAT_INVITE':
        return {
          icon: Users,
          color: 'text-clay-800 bg-clay-50 border-clay-300/80',
          badgeText: 'Nhóm Chuyến Đi',
          actionText: 'Vào Phòng Chat'
        };
      case 'PLACE_APPROVED':
        return {
          icon: MapPin,
          color: 'text-emerald-800 bg-emerald-50 border-emerald-300/80',
          badgeText: 'Địa Điểm',
          actionText: 'Xem Địa Điểm'
        };
      case 'POST_APPROVED':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-800 bg-emerald-50 border-emerald-300/80',
          badgeText: 'Duyệt Bài Viết',
          actionText: 'Xem Bài Viết'
        };
      case 'POST_HIDDEN':
        return {
          icon: EyeOff,
          color: 'text-amber-800 bg-amber-50 border-amber-300/80',
          badgeText: 'Tạm Ẩn Bài',
          actionText: 'Xem Chi Tiết'
        };
      case 'POST_LOCKED':
        return {
          icon: ShieldAlert,
          color: 'text-rose-800 bg-rose-50 border-rose-300/80',
          badgeText: 'Khóa & Cảnh Cáo',
          actionText: 'Xem Chi Tiết'
        };
      case 'REPORT_DISMISSED':
        return {
          icon: ShieldCheck,
          color: 'text-ink-700 bg-[#F8F4EC] border-ink-200/80',
          badgeText: 'Bác Bỏ Báo Cáo',
          actionText: 'Xem Bài Viết'
        };
      case 'POST_DELETED':
        return {
          icon: Trash2,
          color: 'text-rose-800 bg-rose-50 border-rose-300/80',
          badgeText: 'Xóa Bài Viết',
          actionText: 'Chi Tiết'
        };
      case 'REPORT_ALERT':
        return {
          icon: Flag,
          color: 'text-rose-800 bg-rose-50 border-rose-300/80',
          badgeText: 'Báo Cáo Vi Phạm',
          actionText: 'Xử Lý Báo Cáo'
        };
      case 'SYSTEM':
      default:
        return {
          icon: ShieldCheck,
          color: 'text-clay-800 bg-clay-50 border-clay-300/80',
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
        tabMatch = ['LIKE', 'COMMENT', 'COMMENT_REPLY', 'SHARE', 'COMMUNITY_SHARE', 'FOLLOW'].includes(item.type);
      } else if (activeTab === 'trips') {
        tabMatch = item.type === 'CHAT_INVITE' || item.type === 'ITINERARY_SHARED';
      } else if (activeTab === 'system') {
        tabMatch = item.type === 'SYSTEM' || item.type === 'PLACE_APPROVED' || item.type === 'POST_APPROVED' || item.type === 'POST_HIDDEN' || item.type === 'POST_LOCKED';
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
        window.location.href = '/admin/audit-logs';
      } else if (item.targetUrl.includes('admin/reports') || item.targetUrl.includes('reports')) {
        setPortalMode('admin');
        window.location.href = '/admin/reports';
      }
    }
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
    toast.success('Đã đánh dấu tất cả thông báo là đã đọc!');
  };

  const handleDeleteRead = () => {
    const readItems = notifications.filter(n => n.isRead);
    readItems.forEach(n => deleteNotification(n.id));
    toast.info(`Đã dọn dẹp ${readItems.length} thông báo đã đọc.`);
  };

  const handleCreateTestPush = async (e) => {
    e.preventDefault();
    setIsSubmittingTest(true);

    try {
      if (dispatchMode === 'broadcast') {
        await broadcastNotification({
          type: testType,
          message: testMessage,
          targetUrl: testTargetUrl
        });
        toast.success('Đã phát thông báo toàn hệ thống thành công! 📢');
      } else {
        const payload = {
          type: testType,
          actorName: testActorName,
          actorHandle: testActorHandle,
          message: testMessage,
          targetUrl: testTargetUrl
        };
        await addTestNotification(payload);
        toast.success('Đã gửi thông báo mới thành công! 🔔');
      }
      setIsTestDispatcherOpen(false);
    } catch {
      toast.error('Gửi thông báo thất bại.');
    } finally {
      setIsSubmittingTest(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchNotifications();
      toast.info('Đã đồng bộ thông báo mới nhất từ CSDL! 🔄');
    } catch {
      toast.error('Không thể đồng bộ thông báo.');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 space-y-6 animate-fade-in">
      
      {/* ─── 1. BREADCRUMB & PAGE HEADER (Paper-Ink-Clay) ───────────────────────── */}
      <div className="bg-[#FFFDF8] rounded-[6px] p-5 sm:p-6 border border-ink-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-ink-500 font-bold">
            <span
              onClick={() => setUserTab('home')}
              className="hover:text-clay-600 transition-colors cursor-pointer"
            >
              Trang chủ
            </span>
            <ChevronRight className="w-3 h-3 text-ink-300" />
            <span className="text-clay-600">Trung tâm Thông Báo</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-ink-800 tracking-tight">
              Trung Tâm Thông Báo & Cảnh Báo Hành Trình
            </h1>
            {unreadNotificationsCount > 0 ? (
              <span className="px-2.5 py-0.5 rounded-[4px] bg-rose-50 text-rose-800 border border-rose-200 font-mono text-xs font-bold">
                {unreadNotificationsCount} chưa đọc
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono text-xs font-bold">
                Đã cập nhật hết
              </span>
            )}
          </div>

          <p className="text-xs text-ink-500 flex flex-wrap items-center gap-2">
            <span>Theo dõi các gợi ý thông minh từ AI, tương tác bạn bè và cập nhật trạng thái địa điểm.</span>
            {isNotificationLiveBackend && (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded-[3px] border border-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Kết nối MySQL
              </span>
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-[5px] border border-ink-200/80 bg-[#FFFDF8] hover:bg-[#F3EFE6] text-ink-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            title="Đồng bộ lại thông báo từ CSDL"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-clay-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsTestDispatcherOpen(!isTestDispatcherOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[5px] border border-ink-200/80 bg-[#FFFDF8] hover:bg-[#F3EFE6] text-ink-700 font-serif font-bold text-xs transition-colors shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-clay-600" />
            <span>Phát tin / Thử nghiệm</span>
          </button>

          {unreadNotificationsCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[5px] bg-clay-600 hover:bg-clay-700 text-white font-serif font-bold text-xs transition-colors shadow-xs cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Đọc tất cả</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDeleteRead}
            className="p-2 rounded-[5px] border border-ink-200/80 bg-[#FFFDF8] hover:bg-rose-50 text-ink-500 hover:text-rose-700 transition-colors shadow-xs cursor-pointer"
            title="Dọn dẹp thông báo đã đọc"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─── 2. LIVE PUSH / DISPATCHER CARD ────────────────────────────────────── */}
      {isTestDispatcherOpen && (
        <div className="bg-[#FFFDF8] rounded-[6px] p-5 border border-ink-200/80 shadow-xs animate-in fade-in slide-in-from-top-2 duration-150 space-y-4">
          <div className="flex items-center justify-between border-b border-ink-200/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[4px] bg-clay-100 text-clay-700 flex items-center justify-center font-bold">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-ink-800">
                  Khu vực thử nghiệm & Phát thông báo hệ thống (Live Dispatcher)
                </h3>
                <p className="font-mono text-[10px] text-ink-500">
                  Gửi trực tiếp thông báo mới vào CSDL Backend và kích hoạt hiển thị thời gian thực.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsTestDispatcherOpen(false)}
              className="w-7 h-7 rounded-[4px] bg-[#F8F4EC] hover:bg-[#EBE5D8] text-ink-500 flex items-center justify-center border border-ink-200/80 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-b border-ink-200/80 pb-3">
            <button
              type="button"
              onClick={() => setDispatchMode('test')}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-serif transition-colors flex items-center gap-1.5 cursor-pointer ${
                dispatchMode === 'test'
                  ? 'bg-clay-600 text-white font-bold shadow-xs'
                  : 'bg-[#F8F4EC] text-ink-700 border border-ink-200/80 hover:bg-[#EBE5D8] font-medium'
              }`}
            >
              <Send className="w-3 h-3" />
              <span>Thông báo thử nghiệm (Cá nhân)</span>
            </button>
            <button
              type="button"
              onClick={() => setDispatchMode('broadcast')}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-serif transition-colors flex items-center gap-1.5 cursor-pointer ${
                dispatchMode === 'broadcast'
                  ? 'bg-clay-600 text-white font-bold shadow-xs'
                  : 'bg-[#F8F4EC] text-ink-700 border border-ink-200/80 hover:bg-[#EBE5D8] font-medium'
              }`}
            >
              <Megaphone className="w-3 h-3" />
              <span>Phát thông báo toàn hệ thống (Broadcast All)</span>
            </button>
          </div>

          <form onSubmit={handleCreateTestPush} className="grid grid-cols-1 md:grid-cols-12 gap-3.5 text-xs">
            <div className="md:col-span-4 space-y-1">
              <label className="font-serif font-bold text-ink-700 block">Loại thông báo (Type)</label>
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
                className="w-full rounded-[5px] border border-ink-200/80 bg-[#F8F4EC] px-3 py-2 text-ink-800 font-serif font-semibold outline-none focus:border-clay-600 cursor-pointer"
              >
                <option value="AI_READY">✨ AI_READY (Trợ lý AI tạo lịch trình)</option>
                <option value="SHARE">🔗 SHARE (Chia sẻ bài viết)</option>
                <option value="LIKE">❤️ LIKE (Lượt thích bài viết)</option>
                <option value="COMMENT">💬 COMMENT (Bình luận bài viết)</option>
                <option value="CHAT_INVITE">👥 CHAT_INVITE (Mời vào nhóm chat)</option>
                <option value="PLACE_APPROVED">📍 PLACE_APPROVED (Địa điểm được duyệt)</option>
                <option value="SYSTEM">🛡️ SYSTEM (Thông báo hệ thống)</option>
              </select>
            </div>

            {dispatchMode === 'test' && (
              <div className="md:col-span-4 space-y-1">
                <label className="font-serif font-bold text-ink-700 block">Tên người gửi (Actor Name)</label>
                <input
                  type="text"
                  value={testActorName}
                  onChange={(e) => setTestActorName(e.target.value)}
                  required
                  className="w-full rounded-[5px] border border-ink-200/80 bg-[#F8F4EC] px-3 py-2 text-ink-800 outline-none focus:border-clay-600 font-sans"
                />
              </div>
            )}

            <div className={`${dispatchMode === 'test' ? 'md:col-span-4' : 'md:col-span-8'} space-y-1`}>
              <label className="font-serif font-bold text-ink-700 block">Đường dẫn điều hướng (Target URL)</label>
              <input
                type="text"
                value={testTargetUrl}
                onChange={(e) => setTestTargetUrl(e.target.value)}
                required
                className="w-full rounded-[5px] border border-ink-200/80 bg-[#F8F4EC] px-3 py-2 text-ink-800 outline-none focus:border-clay-600 font-sans"
              />
            </div>

            <div className="md:col-span-12 space-y-1">
              <label className="font-serif font-bold text-ink-700 block">Nội dung thông báo (Message)</label>
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                required
                placeholder={dispatchMode === 'broadcast' ? 'Nhập thông báo gửi đến toàn thể cộng đồng du khách Wayfare...' : 'Nhập nội dung thông báo...'}
                className="w-full rounded-[5px] border border-ink-200/80 bg-[#F8F4EC] px-3.5 py-2 text-ink-800 outline-none focus:border-clay-600 font-sans"
              />
            </div>

            <div className="md:col-span-12 flex justify-end gap-2 pt-1 border-t border-ink-200/80">
              <button
                type="button"
                onClick={() => setIsTestDispatcherOpen(false)}
                className="px-3.5 py-2 rounded-[5px] border border-ink-200/80 bg-[#F8F4EC] text-ink-700 font-serif font-bold hover:bg-[#EBE5D8] cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmittingTest}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[5px] bg-clay-600 hover:bg-clay-700 text-white font-serif font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {dispatchMode === 'broadcast' ? <Megaphone className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                <span>
                  {isSubmittingTest
                    ? 'Đang gửi...'
                    : dispatchMode === 'broadcast'
                    ? 'Phát thông báo toàn hệ thống'
                    : 'Bắn thông báo ngay'}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── 3. FILTER TABS & SEARCH BAR ────────────────────────────────────────── */}
      <div className="bg-[#FFFDF8] rounded-[6px] p-3 border border-ink-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#EBE5D8] p-1 rounded-[5px] overflow-x-auto">
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
              className={`px-3 py-1.5 rounded-[4px] font-serif text-xs transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#FFFDF8] text-ink-800 font-bold shadow-xs border border-ink-200/80'
                  : 'text-ink-600 hover:text-ink-900 hover:bg-[#E2DACB] font-medium'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Filter */}
        <div className="relative min-w-0 md:w-72 shrink-0">
          <Search className="w-3.5 h-3.5 text-ink-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo từ khóa, người gửi..."
            className="w-full rounded-[5px] border border-ink-200/80 bg-[#F8F4EC] pl-8 pr-3 py-1.5 text-xs text-ink-800 placeholder:text-ink-400 outline-none focus:border-clay-600 focus:bg-[#FFFDF8] font-sans"
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
                className={`bg-[#FFFDF8] rounded-[6px] p-4 sm:p-5 border transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative shadow-2xs ${
                  !item.isRead
                    ? 'border-clay-300/80 bg-clay-50/15 border-l-4 border-l-clay-600'
                    : 'border-ink-200/80 hover:bg-[#FDFBF7]'
                }`}
              >
                {/* Left Side: Avatar & Message Details */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* Avatar + Badge */}
                  <div className="relative shrink-0 mt-0.5">
                    {item.type === 'SYSTEM' || !item.actorId ? (
                      <div className="w-11 h-11 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 text-clay-700 flex items-center justify-center shadow-xs">
                        <ShieldCheck className="w-5 h-5 text-clay-600" />
                      </div>
                    ) : (
                      <>
                        <img
                          src={item.actorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                          alt={item.actorName || 'User'}
                          className="w-11 h-11 rounded-[5px] object-cover border border-ink-200/80"
                        />
                        <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-[3px] border border-ink-200/80 shadow-xs flex items-center justify-center ${meta.color}`}>
                          <Icon className="w-2.5 h-2.5" />
                        </span>
                      </>
                    )}
                  </div>

                  {/* Main Info */}
                  <div className="space-y-1 min-w-0 pr-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-serif font-bold text-xs sm:text-sm text-ink-800">
                        {item.type === 'SYSTEM' || !item.actorId ? 'Hệ Thống Wayfare (WanderAI Shield)' : item.actorName}
                      </span>
                      {item.type !== 'SYSTEM' && item.actorId && item.actorHandle && (
                        <span className="font-mono text-[10px] text-ink-400">
                          {item.actorHandle}
                        </span>
                      )}
                      <span className={`px-1.5 py-0.2 rounded-[3px] font-mono text-[9px] font-bold border ${meta.color}`}>
                        {meta.badgeText}
                      </span>
                      {!item.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-clay-600 inline-block animate-pulse" title="Chưa đọc"></span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-ink-700 leading-relaxed font-sans">
                      {item.message}
                    </p>

                    <div className="flex items-center gap-2 font-mono text-[10px] text-ink-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formatRelativeTime(item.createdAt)}
                      </span>
                      <span>•</span>
                      <span>
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[#F8F4EC] hover:bg-clay-100 text-clay-700 hover:text-clay-800 font-serif font-bold text-xs border border-ink-200/80 transition-colors shadow-2xs cursor-pointer"
                  >
                    <span>{meta.actionText}</span>
                    <ExternalLink className="w-3 h-3" />
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
                    className={`w-7 h-7 rounded-[4px] border flex items-center justify-center transition-colors cursor-pointer ${
                      item.isRead
                        ? 'border-transparent text-ink-300 cursor-default'
                        : 'border-ink-200/80 bg-[#FFFDF8] hover:bg-[#F8F4EC] text-ink-600 hover:text-emerald-700 shadow-2xs'
                    }`}
                    title={item.isRead ? 'Đã đọc' : 'Đánh dấu đã đọc'}
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      deleteNotification(item.id);
                      toast.info('Đã xóa thông báo.');
                    }}
                    className="w-7 h-7 rounded-[4px] border border-ink-200/80 bg-[#FFFDF8] hover:bg-rose-50 text-ink-400 hover:text-rose-700 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                    title="Xóa thông báo này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          /* Empty state */
          <div className="bg-[#FFFDF8] rounded-[6px] p-12 text-center border border-ink-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 text-clay-600 flex items-center justify-center mx-auto shadow-2xs">
              <Inbox className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-black text-base text-ink-800">
                Không tìm thấy thông báo nào
              </h3>
              <p className="text-xs text-ink-400 max-w-sm mx-auto">
                Không có thông báo phù hợp với bộ lọc hiện tại. Thử chọn danh mục khác hoặc bấm nút "Phát tin / Thử nghiệm" ở trên.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveTab('all');
                setSearchQuery('');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[5px] bg-[#F8F4EC] hover:bg-[#EBE5D8] text-ink-700 font-serif font-bold text-xs border border-ink-200/80 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-clay-600" />
              <span>Xem tất cả thông báo</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default NotificationsPage;
