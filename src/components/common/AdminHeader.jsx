import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Plus, Bell, Menu, X, Shield } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { NotificationDropdown } from './NotificationDropdown';
import { BASE_URL } from '../../services/api';

export const AdminHeader = () => {
  const { setPortalMode, setAdminTab, adminTab, unreadNotificationsCount, currentUser } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [serverHealth, setServerHealth] = useState('checking'); // checking | online | offline
  const mobileDialog = useRef(null);

  const ADMIN_TAB_NAMES = {
    dashboard: 'Dashboard Tổng quan',
    places: 'Quản lý Địa điểm',
    reviews: 'Kiểm duyệt Đánh giá',
    users: 'Người dùng & Phân quyền',
    reports: 'Bài viết & Báo cáo',
    analytics: 'Thống kê Hệ thống',
    'audit-logs': 'Nhật ký Hệ thống & Hoạt động'
  };

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;
    const dialog = mobileDialog.current;
    if (!dialog) return undefined;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    const closeOnDesktop = () => { if (window.innerWidth >= 768) setIsMobileMenuOpen(false); };
    window.addEventListener('resize', closeOnDesktop);
    return () => { dialog.close(); document.body.style.overflow = overflow; window.removeEventListener('resize', closeOnDesktop); };
  }, [isMobileMenuOpen]);

  // Kiểm tra trạng thái backend thật: GET /health
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/health`, { headers: { 'Content-Type': 'application/json' } });
        const json = res.ok ? await res.json() : null;
        if (alive) setServerHealth(res.ok && json?.status === 'UP' ? 'online' : 'offline');
      } catch {
        if (alive) setServerHealth('offline');
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 md:left-[260px] right-0 h-16 bg-[#FFFDF8] border-b border-ink-200/80 z-40 flex items-center justify-between px-4 sm:px-6 shadow-none">
        
        {/* Left Section: Mobile Hamburger & Search Bar with fixed max width to prevent colliding */}
        <div className="flex items-center gap-3 min-w-0 mr-4">
          {/* Mobile Hamburger Drawer Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-[5px] text-ink-700 bg-[#F8F4EC] border border-ink-200/80 hover:bg-[#EBE5D8] transition-colors cursor-pointer shrink-0"
            title="Mở menu Admin"
            aria-label="Mở menu Admin"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Search Box - Distinct width, generous margins */}
          <div className="relative w-56 sm:w-72 md:w-80 lg:w-96">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng, địa điểm, bài viết..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#F8F4EC] border border-ink-200/80 text-ink-800 rounded-[5px] text-xs placeholder:text-ink-400 focus:outline-none focus:border-clay-600 focus:bg-[#FFFDF8] transition-colors font-sans"
            />
          </div>
        </div>

        {/* Center / Breadcrumb: Active Tab Title */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 text-xs font-serif font-bold text-ink-700 shrink-0">
          <Shield className="w-3.5 h-3.5 text-clay-600" />
          <span>{ADMIN_TAB_NAMES[adminTab] || 'Quản trị hệ thống'}</span>
        </div>

        {/* Right Section: Action button, Server status, Notifications, User Mode switcher */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Add Place Quick Action */}
          <button
            onClick={() => setAdminTab('places')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-clay-600 hover:bg-clay-700 text-white text-xs font-serif font-bold transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Thêm địa điểm</span>
          </button>

          {/* Real Backend Server Health */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 text-ink-700 text-xs font-mono font-medium">
            <span className={`w-1.5 h-1.5 rounded-full ${serverHealth === 'online' ? 'bg-emerald-600 animate-pulse' : serverHealth === 'checking' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
            <span>{serverHealth === 'online' ? 'Server: Online' : serverHealth === 'checking' ? 'Kiểm tra...' : 'Offline'}</span>
          </div>

          {/* System Notifications Bell Button */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative w-8 h-8 rounded-[5px] bg-[#F8F4EC] hover:bg-[#EBE5D8] border border-ink-200/80 text-ink-700 flex items-center justify-center transition-colors cursor-pointer"
              title="Thông báo hệ thống"
            >
              <Bell className="w-4 h-4 text-ink-700" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-rose-600 text-white font-mono text-[9px] font-bold rounded-[3px] flex items-center justify-center shadow-xs">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>
            <NotificationDropdown
              isOpen={isNotificationOpen}
              onClose={() => setIsNotificationOpen(false)}
            />
          </div>

          {/* Switch Portal Button (Paper-Ink-Clay style) */}
          <button
            type="button"
            onClick={() => setPortalMode('user')}
            className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-[5px] bg-[#F8F4EC] hover:bg-[#EBE5D8] border border-ink-200/80 text-ink-800 transition-colors cursor-pointer shadow-2xs"
            title="Chuyển về giao diện Người dùng (User Mode)"
          >
            <div className="w-5 h-5 rounded-[3px] bg-clay-600 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
              {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'MQ'}
            </div>
            <span className="font-serif font-bold text-xs text-ink-800 hidden md:inline">
              User Mode
            </span>
          </button>

        </div>

      </header>

      {/* Mobile Slide-Over Drawer for Admin Menu */}
      {isMobileMenuOpen && (
        <dialog ref={mobileDialog} aria-label="Điều hướng quản trị" onCancel={() => setIsMobileMenuOpen(false)} className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-ink-900/60 backdrop:backdrop-blur-xs">
          <button type="button" tabIndex={-1} aria-label="Đóng menu" className="absolute inset-0 h-full w-full" onClick={() => setIsMobileMenuOpen(false)} />
          <AdminSidebar onNavigate={() => setIsMobileMenuOpen(false)} />
          <button autoFocus type="button" aria-label="Đóng menu Admin" className="fixed right-3 top-3 z-[60] flex h-9 w-9 items-center justify-center rounded-[5px] bg-[#FFFDF8] border border-ink-200/80 text-ink-800 shadow-lg cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-4 w-4" />
          </button>
        </dialog>
      )}
    </>
  );
};
