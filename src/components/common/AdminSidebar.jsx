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
  ShieldCheck, 
  ChevronRight,
  ExternalLink
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
          badgeColor: 'clay',
          badgeLabel: 'Chờ duyệt'
        },
        { 
          id: 'reviews', 
          label: 'Kiểm duyệt Đánh giá', 
          icon: Star, 
          badge: hiddenReviewsCount,
          badgeColor: 'amber',
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
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-[#FFFDF8] text-ink-800 z-50 flex flex-col justify-between border-r border-ink-200/80 shadow-xs select-none">
      {/* Top Section */}
      <div className="flex flex-col min-h-0">
        
        {/* Brand Header */}
        <div 
          onClick={() => { setAdminTab(isModeratorUsersOnly ? 'places' : 'dashboard'); onNavigate?.(); }}
          className="h-16 px-4 flex items-center justify-between border-b border-ink-200/80 bg-[#FFFDF8] cursor-pointer hover:bg-[#F8F4EC] transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img
                src="/wayfare-logo.png"
                alt="Wayfare"
                className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[9px] font-bold tracking-widest text-ink-500 uppercase leading-none">
                ADMIN CONSOLE
              </span>
              <span className="font-serif text-[11px] font-bold text-clay-700 leading-tight">
                Wayfare Portal
              </span>
            </div>
          </div>

          <span className="font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] bg-clay-50 text-clay-800 border border-clay-300/70 shadow-2xs">
            {isAdminUser ? 'Admin' : 'Moderator'}
          </span>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-3 space-y-4 sidebar-scrollbar">
          {filteredSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {/* Section Header */}
              <div className="px-2 pt-1 pb-1 flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold tracking-wider text-ink-400 uppercase">
                  {section.title}
                </span>
                <span className="w-8 h-[1px] bg-ink-200/70"></span>
              </div>

              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const active = adminTab === item.id;
                  const hasBadge = item.badge > 0;

                  return (
                    <button
                      key={item.id}
                      onClick={() => { setAdminTab(item.id); onNavigate?.(); }}
                      aria-current={active ? 'page' : undefined}
                      className={`group relative w-full flex items-center justify-between px-3 py-2 rounded-[5px] text-xs transition-colors cursor-pointer text-left ${
                        active
                          ? 'bg-clay-600 text-white font-serif font-bold shadow-xs'
                          : 'text-ink-600 hover:text-ink-900 hover:bg-[#F8F4EC] font-serif font-medium'
                      }`}
                    >
                      {/* Icon + Label */}
                      <div className="flex items-center gap-2.5 min-w-0 pr-1">
                        <div className={`w-6 h-6 rounded-[4px] flex items-center justify-center shrink-0 transition-colors ${
                          active
                            ? 'bg-clay-700 text-white'
                            : 'bg-[#F8F4EC] text-ink-500 border border-ink-200/60 group-hover:text-clay-700 group-hover:border-clay-300'
                        }`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">
                          {item.label}
                        </span>
                      </div>

                      {/* Badge / Pill */}
                      {hasBadge ? (
                        <span className={`inline-flex items-center justify-center min-w-[18px] h-4.5 px-1.5 text-[9px] font-mono font-bold rounded-[3px] shrink-0 border ${
                          active
                            ? 'bg-white text-clay-700 border-white'
                            : item.badgeColor === 'rose'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 font-extrabold'
                            : item.badgeColor === 'amber'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-clay-50 text-clay-800 border-clay-200'
                        }`}>
                          {item.badge}
                        </span>
                      ) : active ? (
                        <ChevronRight className="w-3.5 h-3.5 text-white/80 shrink-0" />
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
      <div className="p-3 border-t border-ink-200/80 bg-[#FFFDF8] space-y-2 shrink-0">
        {/* User Card */}
        <div className="p-2.5 rounded-[6px] bg-[#F8F4EC] border border-ink-200/80 shadow-2xs flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              {currentUser?.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name || 'Admin'} 
                  className="w-8 h-8 rounded-[4px] object-cover border border-ink-200/80 shadow-xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-[4px] bg-clay-600 text-white flex items-center justify-center font-display font-black text-xs shadow-xs">
                  {currentUser?.name?.charAt(0) || 'A'}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-[#F8F4EC]"></span>
            </div>

            <div className="truncate min-w-0">
              <p className="font-serif font-bold text-xs text-ink-800 truncate leading-tight">
                {currentUser?.name || 'Quản Trị Viên'}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-clay-600 shrink-0" />
                <span className="font-mono text-[9px] text-ink-500 font-semibold truncate">
                  {isAdminUser ? 'Quản trị viên' : 'Kiểm duyệt viên'}
                </span>
              </div>
            </div>
          </div>

          {/* Switch to User Portal */}
          <button
            onClick={() => setPortalMode('user')}
            title="Chuyển về giao diện Khách du lịch (User Mode)"
            className="w-7 h-7 rounded-[4px] bg-[#FFFDF8] hover:bg-clay-50 hover:text-clay-700 text-ink-500 border border-ink-200/80 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* System Sub-Footer Info */}
        <div className="px-1 flex items-center justify-between font-mono text-[9px] text-ink-400">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span>Wayfare Engine v2.5</span>
          </span>
          <span className="font-semibold text-ink-500 uppercase">Secure</span>
        </div>
      </div>
    </aside>
  );
};
