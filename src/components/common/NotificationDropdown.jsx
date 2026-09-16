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
  Trash2
} from 'lucide-react';

export const NotificationDropdown = ({ isOpen, onClose }) => {
  const dropdownRef = useRef(null);
  const {
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

  if (!isOpen) return null;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'AI_READY':
        return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
      case 'LIKE':
        return <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />;
      case 'COMMENT':
        return <MessageCircle className="w-3.5 h-3.5 text-sky-500" />;
      case 'CHAT_INVITE':
        return <Users className="w-3.5 h-3.5 text-indigo-500" />;
      case 'PLACE_APPROVED':
        return <MapPin className="w-3.5 h-3.5 text-teal-500" />;
      case 'SYSTEM':
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />;
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
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200/90 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 pb-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-900">
            Thông báo
          </h3>
          {unreadNotificationsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-[10px]">
              {unreadNotificationsCount} mới
            </span>
          )}
          {isNotificationLiveBackend && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[9px] border border-emerald-200">
              Live DB
            </span>
          )}
        </div>

        {unreadNotificationsCount > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsAsRead}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-700 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Đã đọc tất cả</span>
          </button>
        )}
      </div>

      {/* Notification List (Top 5 items) */}
      <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
        {notifications.length > 0 ? (
          notifications.slice(0, 5).map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer group relative ${
                !item.isRead ? 'bg-sky-50/40' : ''
              }`}
            >
              {/* Actor Avatar with Type Badge */}
              <div className="relative shrink-0 mt-0.5">
                <img
                  src={item.actorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                  alt={item.actorName || 'User'}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                  {getNotificationIcon(item.type)}
                </span>
              </div>

              {/* Message Details */}
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-xs text-slate-800 leading-snug font-medium line-clamp-2">
                  <strong className="font-bold text-slate-900">{item.actorName} </strong>
                  {item.message}
                </p>
                <span className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                  <Clock3 className="w-3 h-3" />
                  {formatRelativeTime(item.createdAt)}
                </span>
              </div>

              {/* Unread indicator or Delete button */}
              <div className="shrink-0 flex items-center gap-1 self-center">
                {!item.isRead ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-600 block"></span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1 rounded-md transition-opacity"
                    title="Xóa thông báo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 px-4 text-center">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">Bạn chưa có thông báo nào</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Các hoạt động và gợi ý từ AI sẽ hiển thị ở đây.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 px-3 border-t border-slate-100">
        <button
          type="button"
          onClick={handleViewAll}
          className="w-full py-2 rounded-xl bg-slate-50 hover:bg-sky-50 text-sky-700 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>Xem tất cả thông báo (Trung tâm M08)</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
