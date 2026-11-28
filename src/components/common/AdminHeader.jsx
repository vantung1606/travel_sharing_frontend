import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, Menu, X, ExternalLink } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { NotificationDropdown } from './NotificationDropdown';
import { BASE_URL } from '../../services/api';
import { getStaffPageTitle, getStaffPresentation } from '../../utils/staffPresentation';

export const AdminHeader = () => {
  const { setPortalMode, adminTab, unreadNotificationsCount, currentUser } = useApp();
  const presentation = getStaffPresentation(currentUser);
  const pageTitle = getStaffPageTitle(adminTab, currentUser);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [serverHealth, setServerHealth] = useState('checking'); // checking | online | offline
  const mobileDialog = useRef(null);

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
      <header className="admin-topbar fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-ink-200/80 bg-white px-3 shadow-[0_1px_4px_rgba(30,26,21,0.03)] sm:px-6 md:left-[260px]">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[4px] border border-ink-200 bg-ink-50 text-ink-600 transition-colors hover:border-clay-200 hover:bg-clay-50 hover:text-clay-700 md:hidden"
            title={`Mở menu ${presentation.menuLabel}`}
            aria-label={`Mở menu ${presentation.menuLabel}`}
            aria-expanded={isMobileMenuOpen}
            aria-controls={isMobileMenuOpen ? 'admin-mobile-navigation' : undefined}
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink-400" title={presentation.workspaceLabel}>{presentation.roleLabel}</p>
            <p className="truncate text-[13px] font-bold leading-snug text-ink-800 sm:text-[15px]" title={pageTitle}>
              {pageTitle}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <div role="status" aria-label={serverHealth === 'online' ? 'Máy chủ đang kết nối' : serverHealth === 'checking' ? 'Đang kiểm tra kết nối' : 'Máy chủ mất kết nối'} className="hidden items-center gap-2 border-r border-ink-200 pr-3 text-[12px] text-ink-500 lg:inline-flex">
            <span className={`h-1.5 w-1.5 rounded-full ${serverHealth === 'online' ? 'bg-emerald-600' : serverHealth === 'checking' ? 'bg-amber-500' : 'bg-rose-500'}`} />
            <span>{serverHealth === 'online' ? 'Đã kết nối' : serverHealth === 'checking' ? 'Đang kiểm tra' : 'Mất kết nối'}</span>
          </div>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsNotificationOpen(prev => !prev)}
              className="relative flex h-11 w-11 items-center justify-center rounded-[4px] border border-transparent text-ink-500 transition-colors hover:border-ink-200 hover:bg-ink-50 hover:text-clay-700"
              title="Thông báo hệ thống"
              aria-label="Thông báo hệ thống"
              aria-expanded={isNotificationOpen}
            >
              <Bell className="h-4 w-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute right-1 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-[3px] bg-clay-600 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>
            <NotificationDropdown adminView isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
          </div>

          <button
            type="button"
            onClick={() => setPortalMode('user')}
            className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-[4px] border border-ink-200/80 bg-white px-3 text-[12px] font-semibold text-ink-600 transition-colors hover:border-clay-300 hover:bg-clay-50 hover:text-clay-700"
            title="Về trang du lịch"
            aria-label="Về trang du lịch"
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden xl:inline">Trang du lịch</span>
          </button>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer for Admin Menu */}
      {isMobileMenuOpen && (
        <dialog id="admin-mobile-navigation" ref={mobileDialog} aria-label={presentation.navigationLabel} onCancel={() => setIsMobileMenuOpen(false)} className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-black/35 backdrop:backdrop-blur-[2px]">
          <button type="button" tabIndex={-1} aria-label="Đóng menu" className="absolute inset-0 h-full w-full" onClick={() => setIsMobileMenuOpen(false)} />
          <AdminSidebar onNavigate={() => setIsMobileMenuOpen(false)} />
          <button autoFocus type="button" aria-label={`Đóng menu ${presentation.menuLabel}`} className="fixed right-3 top-3 z-[60] flex h-11 w-11 items-center justify-center rounded-[4px] bg-white border border-ink-200/80 text-ink-800 shadow-lg cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-4 w-4" />
          </button>
        </dialog>
      )}
    </>
  );
};
