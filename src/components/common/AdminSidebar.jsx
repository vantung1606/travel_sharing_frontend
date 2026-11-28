import React from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { DEFAULT_MODERATOR_PERMISSIONS } from './RouteGuards';
import { 
  LayoutDashboard, 
  MapPin, 
  Route,
  Users, 
  BarChart3, 
  LogOut, 
  MessageSquare, 
  History, 
  Star, 
  ShieldCheck, 
  ChevronRight,
  ExternalLink,
  Palette,
  Megaphone,
  Wrench,
  Activity
} from 'lucide-react';

export const AdminSidebar = ({ onNavigate }) => {
  const { branding } = useTheme();
  const { adminTab, setAdminTab, setPortalMode, stats = {}, currentUser } = useApp();

  const roles = Array.isArray(currentUser?.roles) ? currentUser.roles : [];
  const isAdminUser = roles.includes('ROLE_ADMIN') || (currentUser?.email && currentUser.email.toLowerCase().includes('admin'));
  const isModeratorUser = !isAdminUser && (roles.includes('ROLE_MODERATOR') || (currentUser?.email && (currentUser.email.toLowerCase().includes('mod') || currentUser.email.toLowerCase().includes('manager'))));
  const rawPerms = Array.isArray(currentUser?.permissions) ? currentUser.permissions : [];
  const userPerms = rawPerms.length > 0 ? rawPerms : (isModeratorUser ? DEFAULT_MODERATOR_PERMISSIONS : []);

  const pendingPlacesCount = stats?.pendingPlaces || 0;
  const hiddenReviewsCount = stats?.hiddenReviews || 0;
  const reportedContentCount = stats?.reportedContent || 0;

  // Grouped Navigation with attached permission codes
  const navigationSections = [
    {
      title: 'TỔNG QUAN',
      items: [
        { 
          id: 'dashboard', 
          label: 'Dashboard tổng quan', 
          icon: LayoutDashboard,
          description: 'Chỉ số & hoạt động chính',
          permission: 'DASHBOARD_VIEW'
        },
        { 
          id: 'analytics', 
          label: 'Thống kê hệ thống', 
          icon: BarChart3,
          description: 'Báo cáo tăng trưởng',
          permission: 'STATISTICS_VIEW'
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
          badgeLabel: 'Chờ duyệt',
          permission: 'PLACES_VIEW'
        },
        { 
          id: 'itineraries', 
          label: 'Quản lý Lịch trình', 
          icon: Route,
          description: 'Lộ trình và kế hoạch chuyến đi',
          permission: 'PLACES_VIEW'
        },
        { 
          id: 'reviews', 
          label: 'Kiểm duyệt Đánh giá', 
          icon: Star, 
          badge: hiddenReviewsCount,
          badgeColor: 'amber',
          badgeLabel: 'Đã ẩn',
          permission: 'REVIEWS_VIEW'
        },
        { 
          id: 'reports', 
          label: 'Bài viết & Báo cáo', 
          icon: MessageSquare, 
          badge: reportedContentCount,
          badgeColor: 'rose',
          badgeLabel: 'Cần xử lý',
          permission: 'REPORTS_VIEW'
        }
      ]
    },
    {
      title: 'HỆ THỐNG & AN TOÀN',
      items: [
        { 
          id: 'users', 
          label: 'Người dùng & Tài khoản', 
          icon: Users,
          description: 'Quản lý thành viên & Khóa TK',
          permission: 'USERS_VIEW'
        },
        { 
          id: 'moderators', 
          label: 'Phân quyền Giám sát', 
          icon: ShieldCheck,
          description: 'Bật/tắt quyền cho Moderator',
          permission: 'USERS_VIEW',
          adminOnly: true
        },
        { 
          id: 'appearance', 
          label: 'Giao diện & Thương hiệu', 
          icon: Palette,
          description: 'Màu sắc, logo & tokens',
          permission: 'THEME_VIEW'
        },
        { 
          id: 'system', 
          label: 'Giám Sát Hệ Thống', 
          icon: Activity,
          description: 'Phiên bản Java, JVM & Bảng CSDL',
          permission: 'USERS_VIEW',
          adminOnly: true
        },
        { 
          id: 'broadcast', 
          label: 'Phát Thông Báo', 
          icon: Megaphone,
          description: 'Gửi tin tức tới toàn thể du khách',
          permission: 'USERS_VIEW',
          adminOnly: true
        },
        { 
          id: 'maintenance', 
          label: 'Bảo Trì Hệ Thống', 
          icon: Wrench,
          description: 'Bật/tắt bảo trì & đếm ngược',
          permission: 'USERS_VIEW',
          adminOnly: true
        },
        { 
          id: 'audit-logs', 
          label: 'Nhật ký kiểm duyệt', 
          icon: History,
          description: 'Lịch sử thao tác (Audit)',
          permission: 'AUDIT_VIEW'
        }
      ]
    }
  ];

  // Dynamic RBAC Filter: SuperAdmin sees all; Moderator sees only items permitted to them
  const filteredSections = navigationSections.map(sec => ({
    ...sec,
    items: sec.items.filter(item => {
      if (item.adminOnly && !isAdminUser) return false;
      if (isAdminUser) return true;
      return item.permission ? userPerms.includes(item.permission) : true;
    })
  })).filter(sec => sec.items.length > 0);

  return (
    <aside className="admin-sidebar fixed left-0 top-0 z-50 flex h-dvh w-[260px] max-w-[calc(100vw-4rem)] flex-col border-r border-ink-200 bg-ink-50 text-ink-800 select-none md:max-w-none">
      {/* Top Section */}
      <div className="flex min-h-0 flex-1 flex-col">
        
        {/* Brand Header */}
        <button
          type="button"
          onClick={() => { setAdminTab('dashboard'); onNavigate?.(); }}
          className="group flex h-16 w-full shrink-0 items-center gap-3 border-b border-ink-200 bg-ink-50 px-4 text-left transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-clay-600"
          aria-label="Về dashboard quản trị"
        >
          <div className="flex h-9 w-[66px] shrink-0 items-center justify-center rounded-[4px] border border-ink-200/70 bg-white px-1.5">
            <img
              src={branding?.logoUrl || "/wayfare-logo.png"}
              alt={branding?.siteTitle || "Wayfare"}
              onError={(e) => { e.currentTarget.src = '/wayfare-logo.png'; }}
              className="max-h-7 max-w-full object-contain transition-transform group-hover:scale-105"
            />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-400">
              Không gian quản trị
            </span>
            <span className="truncate font-display text-[16px] font-bold leading-tight text-ink-800">
              {branding?.siteTitle || 'Wayfare'}
            </span>
          </div>
        </button>

        {/* Navigation Sections */}
        <nav aria-label="Các mục quản trị" className="min-h-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-3 py-4 sidebar-scrollbar">
          {filteredSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {/* Section Header */}
              <div className="flex items-center gap-3 px-2 pb-1.5">
                <h2 className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                  {section.title}
                </h2>
                <span aria-hidden="true" className="h-px flex-1 bg-ink-200/70" />
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
                      type="button"
                      data-admin-nav={item.id}
                      onClick={() => { setAdminTab(item.id); onNavigate?.(); }}
                      aria-current={active ? 'page' : undefined}
                      title={item.label}
                      className={`group relative flex min-h-11 w-full items-center justify-between gap-2 rounded-[4px] border px-2.5 py-2 text-left text-[13px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-clay-600 ${
                        active
                          ? 'border-ink-200/80 bg-white font-bold text-clay-800 shadow-sm before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:bg-clay-600'
                          : 'border-transparent font-semibold text-ink-600 hover:border-ink-200/70 hover:bg-white/80 hover:text-ink-900'
                      }`}
                    >
                      {/* Icon + Label */}
                      <div className="flex items-center gap-2.5 min-w-0 pr-1">
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] transition-colors ${
                          active
                            ? 'bg-clay-600 text-white'
                            : 'text-ink-400 group-hover:bg-clay-50 group-hover:text-clay-700'
                        }`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">
                          {item.label}
                        </span>
                      </div>

                      {/* Navigation counts */}
                      {hasBadge ? (
                        <span className={`inline-flex items-center justify-center min-w-[18px] h-4.5 px-1.5 text-[9px] font-mono font-bold rounded-[3px] shrink-0 border ${
                          active
                            ? 'bg-clay-50 text-clay-700 border-clay-200'
                            : item.badgeColor === 'rose'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 font-extrabold'
                            : item.badgeColor === 'amber'
                            ? 'bg-amber-50 text-amber-800 border-amber-200 font-bold'
                            : 'bg-clay-50 text-clay-800 border-clay-200 font-bold'
                        }`}>
                          {item.badge}
                        </span>
                      ) : active ? (
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-clay-600" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Profile Footer */}
      <div className="shrink-0 space-y-2 border-t border-ink-200 bg-ink-50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {/* User Card */}
        <div className="flex items-center justify-between gap-2.5 rounded-[4px] border border-ink-200/80 bg-white p-2.5 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              {currentUser?.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name || 'Admin'} 
                  className="w-8 h-8 rounded-[4px] object-cover border border-ink-200/90 shadow-xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-[4px] bg-clay-600 text-white flex items-center justify-center font-display font-black text-xs shadow-xs">
                  {currentUser?.name?.charAt(0) || 'A'}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-[#F8F4EC]"></span>
            </div>

            <div className="truncate min-w-0">
              <p className="font-serif font-bold text-xs text-ink-900 truncate leading-tight">
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
            type="button"
            onClick={() => setPortalMode('user')}
            title="Chuyển về giao diện Khách du lịch (User Mode)"
            aria-label="Về trang du lịch"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] border border-ink-200/70 bg-ink-50 text-ink-500 transition-colors hover:border-clay-200 hover:bg-clay-50 hover:text-clay-700"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </aside>
  );
};
