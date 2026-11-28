import React from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { DEFAULT_MODERATOR_PERMISSIONS } from './RouteGuards';
import { getStaffPageTitle, getStaffPresentation } from '../../utils/staffPresentation';
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

  const presentation = getStaffPresentation(currentUser);
  const isAdminUser = presentation.role === 'admin';
  const isModeratorUser = presentation.role === 'moderator';
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
          label: presentation.dashboardLabel,
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
      title: isModeratorUser ? 'GIÁM SÁT NỘI DUNG' : 'QUẢN LÝ NỘI DUNG',
      items: [
        { 
          id: 'places', 
          label: getStaffPageTitle('places', currentUser),
          icon: MapPin, 
          badge: pendingPlacesCount,
          badgeColor: 'clay',
          badgeLabel: 'Chờ duyệt',
          permission: 'PLACES_VIEW'
        },
        { 
          id: 'itineraries', 
          label: getStaffPageTitle('itineraries', currentUser),
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
      title: isModeratorUser ? 'CÔNG CỤ GIÁM SÁT' : 'HỆ THỐNG & AN TOÀN',
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
          label: 'Phân quyền giám sát viên',
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
      return isModeratorUser && (!item.permission || userPerms.includes(item.permission));
    })
  })).filter(sec => sec.items.length > 0);
  const visibleItems = filteredSections.flatMap(section => section.items);
  const homeItem = visibleItems.find(item => item.id === 'dashboard') || visibleItems[0];

  return (
    <aside className="admin-sidebar fixed left-0 top-0 z-50 flex h-dvh w-[260px] max-w-[calc(100vw-4rem)] flex-col border-r border-ink-700 bg-ink-800 text-white select-none md:max-w-none">
      {/* Top Section */}
      <div className="flex min-h-0 flex-1 flex-col">
        
        {/* Brand Header */}
        <button
          type="button"
          onClick={() => { if (homeItem) setAdminTab(homeItem.id); onNavigate?.(); }}
          disabled={!homeItem}
          className="group flex h-16 w-full shrink-0 items-center gap-3 border-b border-white/10 bg-ink-900 px-4 text-left transition-colors hover:bg-ink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-clay-300"
          aria-label={homeItem ? `Về ${homeItem.label.toLowerCase()}` : presentation.workspaceName}
        >
          <img
            src={branding?.logoWhiteUrl || '/wayfare-logo-white.png'}
            alt={branding?.siteTitle || 'Wayfare'}
            onError={(e) => {
              if (!e.currentTarget.src.endsWith('/wayfare-logo-white.png')) {
                e.currentTarget.src = '/wayfare-logo-white.png';
              }
            }}
            className="admin-sidebar-logo h-10 w-[96px] shrink-0 object-contain transition-transform group-hover:scale-105"
          />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-[9px] font-semibold uppercase tracking-[0.04em] text-ink-300">
              {presentation.workspaceName}
            </span>
            <span className="truncate font-display text-[15px] font-bold leading-tight text-white">
              {branding?.siteTitle || 'Wayfare'}
            </span>
          </div>
        </button>

        {/* Navigation Sections */}
        <nav aria-label={presentation.navigationLabel} className="min-h-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-3 py-4 sidebar-scrollbar">
          {filteredSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {/* Section Header */}
              <div className="flex items-center gap-3 px-2 pb-1.5">
                <h2 className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-ink-300">
                  {section.title}
                </h2>
                <span aria-hidden="true" className="h-px flex-1 bg-white/10" />
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
                      className={`group relative flex min-h-11 w-full items-center justify-between gap-2 rounded-[4px] border px-2.5 py-2 text-left text-[13px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-clay-300 ${
                        active
                          ? 'border-clay-500 bg-clay-600 font-bold text-white shadow-md before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:bg-white/70'
                          : 'border-transparent font-semibold text-white/80 hover:border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {/* Icon + Label */}
                      <div className="flex items-center gap-2.5 min-w-0 pr-1">
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] transition-colors ${
                          active
                            ? 'bg-white/15 text-white'
                            : 'text-ink-300 group-hover:bg-white/10 group-hover:text-white'
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
                            ? 'bg-white text-clay-800 border-white'
                            : item.badgeColor === 'rose'
                            ? 'bg-rose-400/10 text-rose-200 border-rose-300/20 font-extrabold'
                            : item.badgeColor === 'amber'
                            ? 'bg-amber-400/10 text-amber-200 border-amber-300/20 font-bold'
                            : 'bg-white/10 text-ink-100 border-white/15 font-bold'
                        }`}>
                          {item.badge}
                        </span>
                      ) : active ? (
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/80" />
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
      <div className="shrink-0 space-y-2 border-t border-white/10 bg-ink-900 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {/* User Card */}
        <div className="flex items-center justify-between gap-2.5 rounded-[4px] border border-white/10 bg-white/5 p-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              {currentUser?.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name || 'Admin'} 
                  className="w-8 h-8 rounded-[4px] object-cover border border-white/20"
                />
              ) : (
                <div className="w-8 h-8 rounded-[4px] bg-clay-600 text-white flex items-center justify-center font-display font-black text-xs shadow-xs">
                  {currentUser?.name?.charAt(0) || 'A'}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-ink-800"></span>
            </div>

            <div className="truncate min-w-0">
              <p className="font-serif font-bold text-xs text-white truncate leading-tight">
                {currentUser?.name || presentation.roleLabel}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-clay-300 shrink-0" />
                <span className="font-mono text-[9px] text-ink-300 font-semibold truncate">
                  {presentation.roleLabel}
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
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] border border-white/10 bg-white/5 text-ink-200 transition-colors hover:border-white/25 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </aside>
  );
};
