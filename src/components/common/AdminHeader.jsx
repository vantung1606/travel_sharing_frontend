import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Plus, Bell, Menu, X, Shield } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { NotificationDropdown } from './NotificationDropdown';
import { BASE_URL } from '../../services/api';

export const AdminHeader = () => {
  const { setPortalMode, setAdminTab, adminTab, unreadNotificationsCount } = useApp();
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
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    const closeOnDesktop = () => { if (window.innerWidth >= 768) setIsMobileMenuOpen(false); };
    window.addEventListener('resize', closeOnDesktop);
    return () => { dialog.close(); document.body.style.overflow = overflow; window.removeEventListener('resize', closeOnDesktop); };
  }, [isMobileMenuOpen]);

  // Kiểm tra trạng thái backend thật: GET /health (public) — khỏi indicator hardcode "Server 1: OK"
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
        
        {/* Mobile Hamburger & Search Bar */}
        <div className="flex min-w-0 items-center gap-3 flex-1 max-w-xl">
          {/* Mobile Hamburger Drawer Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-[5px] text-ink-700 hover:bg-[#F8F4EC] transition-colors cursor-pointer"
            title="Mở menu Admin"
            aria-label="Mở menu Admin"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="relative min-w-0 w-full">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng, địa điểm, bài viết, mã vé..."
              className="w-full pl-9 pr-4 py-2 bg-[#F8F4EC] border border-ink-200 text-ink-800 rounded-[5px] text-xs placeholder:text-ink-300 focus:outline-none focus:border-clay-500 focus:bg-[#FFFDF8] transition-colors"
            />
          </div>
        </div>

        {/* Active Page Breadcrumb Indicator */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 text-xs font-bold text-ink-700">
          <Shield className="w-3.5 h-3.5 text-clay-600" />
          <span>{ADMIN_TAB_NAMES[adminTab] || 'Quản trị hệ thống'}</span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            onClick={() => setAdminTab('places')}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-[5px] bg-clay-600 hover:bg-clay-700 text-[#FFFDF8] text-xs font-bold transition-colors border border-clay-600 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm địa điểm</span>
          </button>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-[5px] bg-[#F8F4EC] border border-ink-200/70 text-ink-600 text-xs font-semibold">
            <span className={`w-2 h-2 rounded-full ${serverHealth === 'online' ? 'bg-emerald-500' : serverHealth === 'checking' ? 'bg-amber-400' : 'bg-rose-500'} ${serverHealth === 'online' ? 'animate-pulse' : ''}`}></span>
            <span>{serverHealth === 'online' ? 'Server: Online' : serverHealth === 'checking' ? 'Đang kiểm tra...' : 'Server: Offline'}</span>
          </div>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Thông báo hệ thống"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center font-extrabold shadow-sm ring-2 ring-white">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>
            <NotificationDropdown
              isOpen={isNotificationOpen}
              onClose={() => setIsNotificationOpen(false)}
            />
          </div>

          {/* Switch Portal Button */}
          <div
            onClick={() => setPortalMode('user')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            title="Bấm để chuyển về Giao diện Người dùng"
          >
            <div className="w-7 h-7 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center">
              MQ
            </div>
            <span className="text-xs font-bold text-slate-700 hidden sm:inline">User Mode</span>
          </div>
        </div>

      </header>

      {/* Mobile Slide-Over Drawer for Admin Menu */}
      {isMobileMenuOpen && (
        <dialog ref={mobileDialog} aria-label="Điều hướng quản trị" onCancel={() => setIsMobileMenuOpen(false)} className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-slate-900/60 backdrop:backdrop-blur-sm">
          <button type="button" tabIndex={-1} aria-label="Đóng menu" className="absolute inset-0 h-full w-full" onClick={() => setIsMobileMenuOpen(false)} />
          <AdminSidebar onNavigate={() => setIsMobileMenuOpen(false)} />
          <button autoFocus type="button" aria-label="Đóng menu Admin" className="fixed right-2 top-3 z-[60] flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg" onClick={() => setIsMobileMenuOpen(false)}><X className="h-5 w-5" /></button>
        </dialog>
      )}
    </>
  );
};

