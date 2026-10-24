import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  MapPin, 
  Users, 
  BarChart3, 
  LogOut, 
  MessageSquare, 
  History, 
  Star, 
  Shield, 
  Sparkles, 
  Layers, 
  Compass, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const AdminSidebar = ({ onNavigate }) => {
  const { adminTab, setAdminTab, setPortalMode, stats = {}, currentUser } = useApp();

  const roles = Array.isArray(currentUser?.roles) ? currentUser.roles : [];
  const isAdminUser = roles.includes('ROLE_ADMIN');
  const isModeratorUsersOnly = !isAdminUser && roles.includes('ROLE_MODERATOR');

  const pendingPlacesCount = stats?.pendingPlaces || 0;
  const hiddenReviewsCount = stats?.hiddenReviews || 0;
  const reportedContentCount = stats?.reportedContent || 0;

  // Grouped Navigation for even, harmonious visual balance
  const navigationSections = [
    {
      title: 'TỔNG QUAN',
      items: [
        { 
          id: 'dashboard', 
          label: 'Dashboard tổng quan', 
          icon: LayoutDashboard,
          description: 'Chỉ số & hoạt động chính'
        },
        { 
          id: 'analytics', 
          label: 'Thống kê hệ thống', 
          icon: BarChart3,
          description: 'Báo cáo tăng trưởng'
        }
      ]
    },
    {
      title: 'QUẢN LÝ NỘI DUNG',
      items: [
        { 
          id: 'places', 
          label: 'Quản lý Địa điểm', 
          icon: MapPin, 
          badge: pendingPlacesCount,
          badgeColor: 'amber',
          badgeLabel: 'Chờ duyệt'
        },
        { 
          id: 'reviews', 
          label: 'Kiểm duyệt Đánh giá', 
          icon: Star, 
          badge: hiddenReviewsCount,
          badgeColor: 'purple',
          badgeLabel: 'Đã ẩn'
        },
        { 
          id: 'reports', 
          label: 'Bài viết & Báo cáo', 
          icon: MessageSquare, 
          badge: reportedContentCount,
          badgeColor: 'rose',
          badgeLabel: 'Cần xử lý'
        }
      ]
    },
    {
      title: 'HỆ THỐNG & AN TOÀN',
      items: [
        { 
          id: 'users', 
          label: 'Người dùng & Quyền', 
          icon: Users,
          description: 'Phân quyền & Khóa TK'
        },
        { 
          id: 'audit-logs', 
          label: 'Nhật ký kiểm duyệt', 
          icon: History,
          description: 'Lịch sử thao tác (Audit)'
        }
      ]
    }
  ];

  // Filter sections if moderator
  const filteredSections = navigationSections.map(sec => ({
    ...sec,
    items: sec.items.filter(item => {
      return isModeratorUsersOnly
        ? ['places', 'reviews', 'reports'].includes(item.id)
        : true;
    })
  })).filter(sec => sec.items.length > 0);

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-gradient-to-b from-slate-900 via-[#0c1322] to-[#070b14] text-slate-200 z-50 flex flex-col justify-between border-r border-slate-800/80 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.35)] select-none">
      {/* Top Section */}
      <div className="flex flex-col min-h-0">
        
        {/* Brand Header */}
        <div 
          onClick={() => { setAdminTab('dashboard'); onNavigate?.(); }}
          className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md cursor-pointer hover:bg-slate-800/40 transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img
                src="/wayfare-logo-white.png"
                alt="Wayfare"
                className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase leading-none">
                ADMIN CONSOLE
              </span>
              <span className="text-[9px] font-bold text-sky-400 font-mono leading-tight">
                Wayfare Portal
              </span>
            </div>
          </div>

          <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-xs ${
            isAdminUser 
              ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}>
            {isAdminUser ? 'Admin' : 'Moderator'}
          </span>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-3 space-y-4 sidebar-scrollbar">
          {filteredSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {/* Section Header */}
              <div className="px-3 pt-1 pb-1 flex items-center justify-between">
                <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                  {section.title}
                </span>
                <span className="w-8 h-[1px] bg-slate-700/60"></span>
              </div>

              {/* Section Items */}
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const active = adminTab === item.id;
                  const hasBadge = item.badge > 0;

                  return (
                    <button
                      key={item.id}
                      onClick={() => { setAdminTab(item.id); onNavigate?.(); }}
                      aria-current={active ? 'page' : undefined}
                      className={`group relative w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer text-left ${
                        active
                          ? 'bg-gradient-to-r from-sky-500/15 via-sky-500/10 to-transparent text-white border border-sky-500/30 shadow-xs'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                      }`}
                    >
                      {/* Active indicator bar */}
                      {active && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-gradient-to-b from-sky-400 to-sky-600 shadow-[0_0_8px_rgba(14,165,233,0.8)]"></span>
                      )}

                      {/* Icon + Label */}
                      <div className="flex items-center gap-2.5 min-w-0 pr-1">
                        <div className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                          active
                            ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-xs'
                            : 'bg-slate-800/40 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800/80 border border-slate-700/40'
                        }`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className={`truncate ${active ? 'font-extrabold text-white' : 'font-semibold'}`}>
                          {item.label}
                        </span>
                      </div>

                      {/* Badge / Pill */}
                      {hasBadge ? (
                        <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-black rounded-full font-mono shrink-0 shadow-xs border ${
                          item.badgeColor === 'rose'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                            : item.badgeColor === 'purple'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {item.badge}
                        </span>
                      ) : active ? (
                        <ChevronRight className="w-3.5 h-3.5 text-sky-400/80 shrink-0" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Profile Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-sm space-y-2.5 shrink-0">
        {/* User Card */}
        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-slate-800/70 via-slate-850/80 to-slate-900/90 border border-slate-700/50 shadow-sm flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              {currentUser?.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name || 'Admin'} 
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-sky-500/40 shadow-xs"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-600 to-sky-400 text-white flex items-center justify-center font-extrabold text-xs shadow-xs ring-1 ring-white/20">
                  {currentUser?.name?.charAt(0) || 'A'}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900"></span>
            </div>

            <div className="truncate min-w-0">
              <p className="font-extrabold text-xs text-white truncate leading-tight">
                {currentUser?.name || 'Quản Trị Viên'}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-sky-400 shrink-0" />
                <span className="text-[10px] text-sky-300/90 font-medium truncate">
                  {isAdminUser ? 'Quản trị viên' : 'Kiểm duyệt viên'}
                </span>
              </div>
            </div>
          </div>

          {/* Switch to User Portal */}
          <button
            onClick={() => setPortalMode('user')}
            title="Chuyển về giao diện Khách du lịch (User Mode)"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/15 hover:text-rose-400 text-slate-400 border border-slate-700/60 hover:border-rose-500/30 transition-all shrink-0 cursor-pointer group shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* System Sub-Footer Info */}
        <div className="px-2 flex items-center justify-between text-[10px] text-slate-400/80 font-mono">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Wayfare Engine v2.5</span>
          </span>
          <span className="font-semibold text-slate-400">Secure</span>
        </div>
      </div>
    </aside>
  );
};

