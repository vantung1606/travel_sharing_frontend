import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  MapPin,
  Users,
  FileText,
  BarChart3,
  Cpu,
  LogOut,
  Compass,
  MessageSquare,
  DollarSign,
  History
} from 'lucide-react';
import { WayfarePlaneLogo } from './WayfarePlaneLogo';

export const AdminSidebar = ({ onNavigate }) => {
  const { adminTab, setAdminTab, setPortalMode, stats, currentUser } = useApp();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard tổng quan', icon: LayoutDashboard },
    { id: 'places', label: 'Địa điểm & Check-in', icon: MapPin, badge: stats.pendingCheckins },
    { id: 'users', label: 'Người dùng & Phân quyền', icon: Users, badge: stats.reportedContent },
    { id: 'reports', label: 'Bài viết & Báo cáo', icon: MessageSquare },
    { id: 'analytics', label: 'Thống kê hệ thống', icon: BarChart3 },
    { id: 'audit-logs', label: 'Nhật ký hệ thống', icon: History },
    { id: 'revenue', label: 'Mô hình Doanh thu', icon: DollarSign, isDev: true },
    { id: 'ai-config', label: 'Cấu hình Hệ thống AI', icon: Cpu }
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-[#283044] text-[#eef0ff] z-50 flex flex-col justify-between shadow-xl border-r border-slate-700/50 select-none">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div 
          onClick={() => setAdminTab('dashboard')}
          className="h-16 px-5 flex items-center justify-between bg-[#283044] border-b border-slate-700/40 cursor-pointer hover:bg-slate-800/50 transition-colors"
        >
          <img
            src="/wayfare-logo.png"
            alt="Wayfare"
            className="h-8 w-auto object-contain brightness-0 invert"
          />
          <span className="text-[9px] font-extrabold text-sky-300 uppercase tracking-widest px-2 py-0.5 rounded-md bg-sky-900/60 border border-sky-500/30">
            Admin
          </span>
        </div>

        {/* AI Engine Status Banner */}
        <div className="px-4 py-3">
          <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-300 text-[11px] font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
              AI Engine Status
            </span>
            <span className="text-sky-400 font-extrabold text-[11px]">99.9%</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="px-3 space-y-1 mt-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const active = adminTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setAdminTab(item.id); onNavigate?.(); }}
                aria-current={active ? 'page' : undefined}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-950/30'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-500 text-slate-950">
                    {item.badge}
                  </span>
                )}
                {item.isDev && (
                  <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    Đang phát triển
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile Footer */}
      <div className="p-4 bg-black/10 border-t border-slate-700/40">
        <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
          <div className="flex items-center gap-2.5 min-w-0">
            {currentUser?.avatar ? (
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-sky-500/30"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0 font-extrabold text-xs shadow-sm">
                {currentUser?.name?.charAt(0) || 'A'}
              </div>
            )}
            <div className="truncate">
              <p className="font-bold text-xs text-white truncate">{currentUser?.name || 'Quản Trị Viên'}</p>
              <p className="text-[10px] text-sky-300 font-semibold truncate">Super Admin</p>
            </div>
          </div>

          <button
            onClick={() => setPortalMode('user')}
            title="Thoát về giao diện Người dùng"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
