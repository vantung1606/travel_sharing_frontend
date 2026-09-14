import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Plus, Bell, Menu, X, Compass, Shield } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';

export const AdminHeader = () => {
  const { setPortalMode, setAdminTab } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 md:left-[260px] right-0 h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 z-40 flex items-center justify-between px-4 sm:px-6 shadow-sm">
        
        {/* Mobile Hamburger & Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          {/* Mobile Hamburger Drawer Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Mở menu Admin"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng, địa điểm, bài viết, mã vé..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100/80 text-slate-800 rounded-full text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            onClick={() => setAdminTab('places')}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm địa điểm</span>
          </button>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Server 1: OK</span>
          </div>

          <button
            className="relative p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Thông báo báo cáo"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center font-extrabold shadow-sm">
              5
            </span>
          </button>

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
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          ></div>
          <div className="relative w-[260px] max-w-full z-50">
            <AdminSidebar />
          </div>
        </div>
      )}
    </>
  );
};
