import React, { useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Sparkles,
  Heart,
  MessageCircle,
  Users,
  MapPin,
  ShieldCheck,
  CheckCheck,
  ExternalLink,
  ChevronRight,
  Clock3,
  Trash2,
  Share2,
  CheckCircle2,
  EyeOff,
  ShieldAlert,
  Flag
} from 'lucide-react';

export const NotificationDropdown = ({ isOpen, onClose }) => {
  const dropdownRef = useRef(null);
  const {
    isLoggedIn,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    setUserTab,
    setPortalMode,
    isNotificationLiveBackend
  } = useApp();

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen || !isLoggedIn) return null;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'AI_READY':
        return <Sparkles className="w-3.5 h-3.5 text-amber-700" />;
      case 'LIKE':
        return <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />;
      case 'COMMENT':
      case 'COMMENT_REPLY':
        return <MessageCircle className="w-3.5 h-3.5 text-clay-700" />;
      case 'CHAT_MESSAGE':
        return <MessageCircle className="w-3.5 h-3.5 text-clay-700" />;
      case 'FOLLOW':
        return <Users className="w-3.5 h-3.5 text-emerald-700" />;
      case 'SHARE':
      case 'COMMUNITY_SHARE':
        return <Share2 className="w-3.5 h-3.5 text-clay-700" />;
      case 'ITINERARY_SHARED':
        return <ExternalLink className="w-3.5 h-3.5 text-amber-700" />;
      case 'CHAT_INVITE':
        return <Users className="w-3.5 h-3.5 text-clay-700" />;
      case 'PLACE_APPROVED':
        return <MapPin className="w-3.5 h-3.5 text-emerald-700" />;
      case 'POST_APPROVED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />;
      case 'POST_HIDDEN':
        return <EyeOff className="w-3.5 h-3.5 text-amber-700" />;
      case 'POST_LOCKED':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />;
      case 'REPORT_DISMISSED':
        return <ShieldCheck className="w-3.5 h-3.5 text-ink-600" />;
      case 'POST_DELETED':
        return <Trash2 className="w-3.5 h-3.5 text-rose-600" />;
      case 'REPORT_ALERT':
        return <Flag className="w-3.5 h-3.5 text-rose-600" />;
      case 'SYSTEM':
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-clay-700" />;
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

  const handleNotificationClick = (item) => {
    if (!item.isRead) {
      markNotificationAsRead(item.id);
    }
    onClose();

    // Route depending on targetUrl
    if (item.targetUrl) {
      if (item.targetUrl.includes('admin/reports') || item.targetUrl.includes('reports')) {
        setPortalMode('admin');
        window.location.href = '/admin/reports';
      } else if (item.targetUrl.includes('itinerar')) {
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
      } else {
        setPortalMode('user');
        setUserTab('notifications');
      }
    }
  };

  const handleViewAll = () => {
    setPortalMode('user');
    setUserTab('notifications');
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="fixed left-3 right-3 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-[#FFFDF8] rounded-[6px] shadow-xl border border-ink-200/80 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 pb-3 border-b border-ink-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-serif font-bold text-sm text-ink-800">
            Thông báo
          </h3>
          {unreadNotificationsCount > 0 && (
            <span className="px-2 py-0.2 rounded-[3px] bg-rose-50 text-rose-800 border border-rose-200 font-mono font-bold text-[10px]">
              {unreadNotificationsCount} mới
            </span>
          )}
          {isNotificationLiveBackend && (
            <span className="px-1.5 py-0.2 rounded-[3px] bg-emerald-50 text-emerald-800 font-mono font-bold text-[9px] border border-emerald-300">
              Live DB
            </span>
          )}
        </div>

        {unreadNotificationsCount > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsAsRead}
            className="inline-flex items-center gap-1 text-[11px] font-serif font-bold text-clay-700 hover:text-clay-800 transition-colors cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Đã đọc tất cả</span>
          </button>
        )}
      </div>

      {/* Notification List (Top 5 items) */}
      <div className="max-h-[360px] overflow-y-auto divide-y divide-ink-100">
        {notifications.length > 0 ? (
          notifications.slice(0, 5).map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`p-3.5 flex items-start gap-3 hover:bg-[#F8F4EC] transition-colors cursor-pointer group relative ${
                !item.isRead ? 'bg-clay-50/20' : ''
              }`}
            >
              {/* Actor Avatar with Type Badge */}
              <div className="relative shrink-0 mt-0.5">
                {item.type === 'SYSTEM' || !item.actorId ? (
                  <div className="w-10 h-10 rounded-[4px] bg-[#F8F4EC] border border-ink-200/80 text-clay-700 flex items-center justify-center shadow-2xs">
                    <ShieldCheck className="w-5 h-5 text-clay-600" />
                  </div>
                ) : (
                  <>
                    <img
                      src={item.actorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                      alt={item.actorName || 'User'}
                      className="w-10 h-10 rounded-[4px] object-cover border border-ink-200/80"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-[3px] bg-[#FFFDF8] shadow-2xs border border-ink-200/80 flex items-center justify-center">
                      {getNotificationIcon(item.type)}
                    </span>
                  </>
                )}
              </div>

              {/* Message Details */}
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-xs text-ink-700 leading-snug font-sans line-clamp-2">
                  {(() => {
                    if (item.type === 'SYSTEM' || !item.actorId || !item.actorName) {
                      return item.message;
                    }
                    if (item.message && item.message.startsWith(item.actorName)) {
                      const rest = item.message.substring(item.actorName.length).trim();
                      return (
                        <>
                          <strong className="font-serif font-bold text-ink-900">{item.actorName} </strong>
                          <span>{rest}</span>
                        </>
                      );
                    }
                    return (
                      <>
                        <strong className="font-serif font-bold text-ink-900">{item.actorName} </strong>
                        <span>{item.message}</span>
                      </>
                    );
                  })()}
                </p>
                <span className="flex items-center gap-1 font-mono text-[10px] text-ink-400 mt-1">
                  <Clock3 className="w-2.5 h-2.5" />
                  {formatRelativeTime(item.createdAt)}
                </span>
              </div>

              {/* Unread indicator or Delete button */}
              <div className="shrink-0 flex items-center gap-1 self-center">
                {!item.isRead ? (
                  <span className="w-2 h-2 rounded-full bg-clay-600 block animate-pulse"></span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-ink-400 hover:text-rose-600 p-1 rounded-[3px] transition-opacity cursor-pointer"
                    title="Xóa thông báo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 px-4 text-center space-y-1">
            <Bell className="w-7 h-7 text-ink-300 mx-auto mb-1" />
            <p className="font-serif font-bold text-xs text-ink-800">Bạn chưa có thông báo nào</p>
            <p className="font-sans text-[11px] text-ink-400">Các hoạt động và gợi ý từ AI sẽ hiển thị ở đây.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 px-3 border-t border-ink-200/80">
        <button
          type="button"
          onClick={handleViewAll}
          className="w-full py-1.5 rounded-[4px] bg-[#F8F4EC] hover:bg-[#EBE5D8] text-clay-700 font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Xem tất cả thông báo</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
