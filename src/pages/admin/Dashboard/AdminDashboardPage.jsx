import React, { useState, useEffect, useMemo, useId } from 'react';
import { useApp, DEFAULT_MODERATOR_PERMISSIONS } from '../../../context/AppContext';
import { useToast } from '../../../components/common/Toast';
import { adminApi, adminReportApi, auditLogApi, adminUserApi } from '../../../services/api';
import { formatVietnamDateOnly } from '../../../utils/dateUtils';
import { formatAdminActionLabel } from '../../../utils/adminPresentation';
import { getStaffPresentation } from '../../../utils/staffPresentation';
import { 
  Users, MapPin, CheckCircle2, Calendar,
  ChevronRight, Search, Flag, Eye, Download, ArrowRight, RefreshCw,
  FileText, Compass, ShieldAlert, Clock, History, ChevronLeft,
  X, Star, ExternalLink, BarChart3
} from 'lucide-react';

const PANEL_CLASS = 'admin-panel min-w-0 rounded-[6px] border border-ink-200/70 bg-white shadow-[0_2px_3px_rgba(30,26,21,0.02),0_8px_24px_-16px_rgba(30,26,21,0.18)]';

const METRIC_TONES = {
  clay: { surface: 'from-clay-50/70 to-white', icon: 'bg-clay-100/70 text-clay-700 ring-clay-200/70', badge: 'bg-clay-50 text-clay-700' },
  ink: { surface: 'from-ink-50 to-white', icon: 'bg-ink-100 text-ink-700 ring-ink-200/70', badge: 'bg-ink-50 text-ink-600' },
  green: { surface: 'from-emerald-50/70 to-white', icon: 'bg-emerald-100/70 text-emerald-700 ring-emerald-200/70', badge: 'bg-emerald-50 text-emerald-700' },
  rose: { surface: 'from-rose-50/70 to-white', icon: 'bg-rose-100/70 text-rose-700 ring-rose-200/70', badge: 'bg-rose-50 text-rose-700' }
};

const DashboardMetric = ({ icon: Icon, label, value, badge, detail, tone = 'clay', onClick }) => {
  const colors = METRIC_TONES[tone];
  const MetricElement = onClick ? 'button' : 'div';
  return (
    <MetricElement
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`${PANEL_CLASS} dashboard-metric group flex w-full flex-col gap-4 bg-gradient-to-br ${colors.surface} p-4 text-left transition duration-200 ${onClick ? 'hover:-translate-y-0.5 hover:border-clay-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-600' : ''} motion-reduce:transform-none sm:p-5`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-semibold text-ink-500">{label}</span>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${colors.icon}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-display text-[30px] font-bold leading-none tracking-tight text-ink-900 tabular-nums sm:text-[32px]">{value}</span>
        <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${colors.badge}`}>{badge}</span>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-ink-200/60 pt-3 text-[12px] leading-relaxed text-ink-500">
        <span>{detail}</span>
        {onClick && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-400 transition-transform group-hover:translate-x-0.5" />}
      </div>
    </MetricElement>
  );
};

const GrowthChart = ({ data, metric }) => {
  const gradientId = useId().replace(/:/g, '');
  if (!data.length) {
    return (
      <div className="flex min-h-52 flex-col items-center justify-center gap-2 text-center text-[13px] text-ink-500">
        <BarChart3 className="h-6 w-6 text-ink-300" />
        <p>Chưa có dữ liệu tăng trưởng.</p>
      </div>
    );
  }
  const width = 640;
  const height = 190;
  const floor = 164;
  const ceiling = Math.ceil(Math.max(...data.map(item => Number(item.count) || 0), 1) / 4) * 4;
  const points = data.map((item, index) => ({
    ...item,
    x: data.length === 1 ? width / 2 : 40 + (index / (data.length - 1)) * 580,
    y: floor - ((Number(item.count) || 0) / ceiling) * 140
  }));
  const line = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
  const area = `${line} L ${points[points.length - 1].x} ${floor} L ${points[0].x} ${floor} Z`;
  const unit = metric === 'users' ? 'thành viên' : 'bài viết';
  return (
    <div className="min-w-0">
      <svg viewBox={`0 0 ${width} ${height}`} className="block w-full" role="img" aria-label={`Tăng trưởng ${unit}: ${data.map(item => `${item.label}, ${item.count}`).join('; ')}`}>
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--wf-primary, #B0522F)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--wf-primary, #B0522F)" stopOpacity="0.015" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map(tick => {
          const y = floor - tick * 35;
          return (
            <g key={tick}>
              <line x1="40" x2="620" y1={y} y2={y} className="stroke-ink-200/70" strokeDasharray={tick ? '3 5' : undefined} />
              <text x="30" y={y + 4} textAnchor="end" className="hidden fill-ink-400 text-[11px] sm:block">
                {Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(ceiling * tick / 4)}
              </text>
            </g>
          );
        })}
        <path d={area} fill={`url(#${gradientId})`} />
        <path d={line} fill="none" stroke="var(--wf-primary, #B0522F)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((point, index) => (
          <g key={index}>
            <title>{point.label}: {Number(point.count || 0).toLocaleString('vi-VN')} {unit}</title>
            <circle cx={point.x} cy={point.y} r={index === points.length - 1 ? 5 : 3.5} className="fill-white stroke-clay-600" strokeWidth="2" />
          </g>
        ))}
      </svg>
      <div className="flex justify-between gap-1 pl-[6.25%] pr-[3.125%] text-[11px] text-ink-500 sm:text-[12px]">
        {data.map((item, index) => (
          <span key={index} title={item.label} className="min-w-0 flex-1 truncate text-center first:text-left last:text-right">
            {item.label?.replace(/^Th/, 'T')}
          </span>
        ))}
      </div>
    </div>
  );
};

export const AdminDashboardPage = () => {
  const toast = useToast();
  const { currentUser, setAdminTab } = useApp();
  const presentation = getStaffPresentation(currentUser);
  const assignedPermissions = Array.isArray(currentUser?.permissions) ? currentUser.permissions : [];
  const permissions = assignedPermissions.length ? assignedPermissions : DEFAULT_MODERATOR_PERMISSIONS;
  const canView = permission => presentation.role === 'admin'
    || (presentation.role === 'moderator' && permissions.includes(permission));
  const canViewUsers = canView('USERS_VIEW');
  const canViewItineraries = canView('PLACES_VIEW');
  const canViewReports = canView('REPORTS_VIEW');
  const canViewAudit = canView('AUDIT_VIEW');
  const hasSidePanels = canViewReports || canViewAudit;

  // Core Data States with SWR Instant Hydration
  const initialStatsObj = {
    totalUsers: 0,
    newUsersThisMonth: 0,
    totalPosts: 0,
    newPostsThisMonth: 0,
    totalPlaces: 0,
    totalItineraries: 0,
    newItinerariesThisMonth: 0,
    activeItineraries: 0,
    totalLikes: 0,
    totalComments: 0,
    averagePlaceRating: 0,
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    dismissedReports: 0,
    userGrowth: [],
    postGrowth: [],
    topDestinations: [],
    topPlaces: []
  };

  const [stats, setStats] = useState(() => {
    try {
      const cached = sessionStorage.getItem('wayfare_admin_stats');
      return cached ? JSON.parse(cached) : initialStatsObj;
    } catch {
      return initialStatsObj;
    }
  });

  const [itinerariesList, setItinerariesList] = useState(() => {
    if (!canViewItineraries) return [];
    try {
      const cached = sessionStorage.getItem('wayfare_admin_itineraries');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [usersList, setUsersList] = useState([]);
  const [pendingReports, setPendingReports] = useState(() => {
    if (!canViewReports) return [];
    try {
      const cached = sessionStorage.getItem('wayfare_admin_reports');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [recentLogs, setRecentLogs] = useState([]);

  // UI Control States
  const [loading, setLoading] = useState(() => !sessionStorage.getItem('wayfare_admin_stats'));
  const [refreshing, setRefreshing] = useState(false);
  const [chartMetric, setChartMetric] = useState('users'); // 'users' | 'posts'
  const [topTab, setTopTab] = useState('destinations'); // 'destinations' | 'places'
  const [activeTableTab, setActiveTableTab] = useState(canViewItineraries ? 'itineraries' : 'users');
  const [tableSearch, setTableSearch] = useState('');
  const [tableStatusFilter, setTableStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Quick View Modal
  const [selectedItinerary, setSelectedItinerary] = useState(null);

  // Load All Dashboard Data in Parallel (Single Source of Truth + SWR)
  const loadDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else if (!sessionStorage.getItem('wayfare_admin_stats')) setLoading(true);

    try {
      const [fetchedStats, fetchedItins, fetchedReports, fetchedLogs, fetchedUsers] = await Promise.all([
        adminApi.getStats().catch(() => null),
        canViewItineraries ? adminApi.getAllItineraries().catch(() => []) : [],
        canViewReports ? adminReportApi.getPendingReports().catch(() => []) : [],
        canViewAudit ? auditLogApi.getLogs({ page: 0, size: 5 }).catch(() => ({ content: [] })) : { content: [] },
        canViewUsers ? adminUserApi.getUsers().catch(() => []) : []
      ]);

      if (fetchedStats) {
        setStats(fetchedStats);
        try {
          sessionStorage.setItem('wayfare_admin_stats', JSON.stringify(fetchedStats));
        } catch {
          // ignore
        }
      }
      if (Array.isArray(fetchedItins)) {
        setItinerariesList(fetchedItins);
        try {
          sessionStorage.setItem('wayfare_admin_itineraries', JSON.stringify(fetchedItins));
        } catch {
          // ignore
        }
      }
      if (Array.isArray(fetchedReports)) {
        setPendingReports(fetchedReports);
        try {
          sessionStorage.setItem('wayfare_admin_reports', JSON.stringify(fetchedReports));
        } catch {
          // ignore
        }
      }
      if (fetchedLogs && Array.isArray(fetchedLogs.content)) {
        setRecentLogs(fetchedLogs.content);
      }
      if (Array.isArray(fetchedUsers)) {
        setUsersList(fetchedUsers);
      } else if (fetchedUsers && Array.isArray(fetchedUsers.content)) {
        // getUsers nay trả Page<UserDto> phân trang server-side
        setUsersList(fetchedUsers.content);
      }

      if (isManual) {
        toast.success('Dữ liệu thời gian thực đã được đồng bộ từ Cơ sở Dữ liệu!');
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu dashboard admin:', err);
      if (isManual) toast.error('Không thể đồng bộ dữ liệu: ' + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [canViewUsers, canViewItineraries, canViewReports, canViewAudit]);

  // Reset page when switching table tab or filters
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTableTab, tableSearch, tableStatusFilter]);

  useEffect(() => {
    if (!canViewUsers && canViewItineraries) setActiveTableTab('itineraries');
    if (!canViewItineraries && canViewUsers) setActiveTableTab('users');
  }, [canViewUsers, canViewItineraries]);

  // Helper tính toán trạng thái Lịch trình (kết hợp CSDL `status` và Dòng thời gian `startDate`/`endDate`)
  const getItineraryTimelineStatus = (item) => {
    if (!item) return { label: 'Không xác định', subLabel: '', dbStatus: 'N/A', timeline: 'unknown', badgeClass: 'bg-ink-100 text-ink-700 border-ink-200' };

    const dbStatus = (item.status || 'ACTIVE').toUpperCase();

    // 1. Nếu là bản nháp
    if (dbStatus === 'DRAFT') {
      return {
        label: 'Bản nháp',
        subLabel: 'Chưa công bố',
        dbStatus: 'DRAFT',
        timeline: 'draft',
        badgeClass: 'bg-zinc-100 text-zinc-700 border-zinc-300'
      };
    }

    // 2. Nếu đã bị hủy
    if (dbStatus === 'CANCELLED') {
      return {
        label: 'Đã hủy',
        subLabel: 'Không thực hiện',
        dbStatus: 'CANCELLED',
        timeline: 'cancelled',
        badgeClass: 'bg-rose-50 text-rose-800 border-rose-200'
      };
    }

    // 3. Nếu đã đánh dấu COMPLETED trong CSDL
    if (dbStatus === 'COMPLETED') {
      return {
        label: 'Hoàn thành',
        subLabel: 'Đã kết thúc',
        dbStatus: 'COMPLETED',
        timeline: 'completed',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-200'
      };
    }

    // 4. Nếu là ACTIVE: Phân loại theo mốc ngày bắt đầu / kết thúc so với ngày hôm nay
    const todayStr = new Date().toISOString().slice(0, 10);
    const startStr = item.startDate ? String(item.startDate).slice(0, 10) : null;
    const endStr = item.endDate ? String(item.endDate).slice(0, 10) : null;

    if (startStr && startStr > todayStr) {
      return {
        label: 'Sắp tới',
        subLabel: `Khởi hành ${startStr}`,
        dbStatus: 'ACTIVE',
        timeline: 'upcoming',
        badgeClass: 'bg-amber-50 text-amber-900 border-amber-300'
      };
    }

    if (endStr && endStr < todayStr) {
      return {
        label: 'Hoàn thành',
        subLabel: `Kết thúc ${endStr}`,
        dbStatus: 'ACTIVE',
        timeline: 'completed',
        badgeClass: 'bg-sky-50 text-sky-800 border-sky-200'
      };
    }

    if (startStr && endStr && todayStr >= startStr && todayStr <= endStr) {
      return {
        label: 'Đang diễn ra',
        subLabel: 'Hành trình đang đi',
        dbStatus: 'ACTIVE',
        timeline: 'ongoing',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300'
      };
    }

    // Mặc định ACTIVE khi không có ngày cụ thể
    return {
      label: 'Hoạt động',
      subLabel: 'Khả dụng',
      dbStatus: 'ACTIVE',
      timeline: 'active',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    };
  };

  // Helper tính toán số ngày & thời lượng chuẩn xác của lịch trình
  const getItineraryDuration = (item) => {
    if (!item) return { days: 1, label: '1 ngày', shortLabel: '1N' };

    // 1. Trích xuất từ tiêu đề nếu có pattern "3N2Đ", "4N3D", "2 ngày 1 đêm", "5 ngày", "3N"
    if (item.title) {
      const fullMatch = item.title.match(/(\d+)\s*(?:N|n)\s*(\d+)\s*(?:Đ|đ|D|d)/);
      if (fullMatch && Number(fullMatch[1]) > 0) {
        const d = Number(fullMatch[1]);
        const n = Number(fullMatch[2]);
        return { days: d, label: `${d}N${n}Đ`, shortLabel: `${d}N${n}Đ` };
      }
      const simpleMatch = item.title.match(/(\d+)\s*(?:ngày|ngay|N|n)(?!\w)/i);
      if (simpleMatch && Number(simpleMatch[1]) > 0 && Number(simpleMatch[1]) <= 60) {
        const d = Number(simpleMatch[1]);
        return { days: d, label: d > 1 ? `${d}N${d - 1}Đ` : '1 ngày', shortLabel: `${d}N${Math.max(0, d - 1)}Đ` };
      }
    }

    // 2. Tính toán từ khoảng ngày startDate và endDate (endDate = startDate + daysCount - 1)
    if (item.startDate && item.endDate) {
      const start = new Date(item.startDate);
      const end = new Date(item.endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
        const diffMs = end.getTime() - start.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        const calculatedDays = diffDays + 1;
        if (calculatedDays > 1) {
          return {
            days: calculatedDays,
            label: `${calculatedDays}N${calculatedDays - 1}Đ`,
            shortLabel: `${calculatedDays}N${calculatedDays - 1}Đ`
          };
        }
        return { days: 1, label: '1 ngày', shortLabel: '1N' };
      }
    }

    // 3. Nếu có details các ngày
    if (item.details && Array.isArray(item.details) && item.details.length > 0) {
      const maxDay = Math.max(...item.details.map(d => Number(d.dayNumber) || 1));
      if (maxDay > 0) {
        return {
          days: maxDay,
          label: maxDay > 1 ? `${maxDay}N${maxDay - 1}Đ` : '1 ngày',
          shortLabel: `${maxDay}N${Math.max(0, maxDay - 1)}Đ`
        };
      }
    }

    // 4. Nếu có daysCount hoặc durationDays hợp lệ > 0
    if (item.daysCount && Number(item.daysCount) > 0) {
      const d = Number(item.daysCount);
      return { days: d, label: d > 1 ? `${d}N${d - 1}Đ` : '1 ngày', shortLabel: `${d}N${Math.max(0, d - 1)}Đ` };
    }
    if (item.durationDays && Number(item.durationDays) > 0) {
      const d = Number(item.durationDays);
      return { days: d, label: d > 1 ? `${d}N${d - 1}Đ` : '1 ngày', shortLabel: `${d}N${Math.max(0, d - 1)}Đ` };
    }

    return { days: 1, label: '1 ngày', shortLabel: '1N' };
  };

  // Filter Itineraries
  const filteredItineraries = useMemo(() => {
    return itinerariesList.filter(item => {
      const st = getItineraryTimelineStatus(item);
      if (tableStatusFilter !== 'all') {
        if (tableStatusFilter === 'active' && item.status !== 'ACTIVE') return false;
        if (tableStatusFilter === 'upcoming' && st.timeline !== 'upcoming') return false;
        if (tableStatusFilter === 'draft' && item.status === 'ACTIVE') return false;
        if (tableStatusFilter === 'completed' && st.timeline !== 'completed') return false;
      }
      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase();
        const matchTitle = item.title && item.title.toLowerCase().includes(q);
        const matchDest = item.destination && item.destination.toLowerCase().includes(q);
        const matchCreator = item.creatorName && item.creatorName.toLowerCase().includes(q);
        const matchId = item.id && String(item.id).includes(q);
        if (!matchTitle && !matchDest && !matchCreator && !matchId) return false;
      }
      return true;
    });
  }, [itinerariesList, tableStatusFilter, tableSearch]);

  // Filter Users
  const filteredUsers = useMemo(() => {
    return usersList.filter(user => {
      if (tableStatusFilter !== 'all') {
        const isAdminOrMod = (user.roles && user.roles.some(r => r === 'ROLE_ADMIN' || r === 'ROLE_MODERATOR')) || user.role === 'ROLE_ADMIN' || user.role === 'ADMIN' || user.role === 'ROLE_MODERATOR';
        if (tableStatusFilter === 'admin' && !isAdminOrMod) return false;
        if (tableStatusFilter === 'user' && isAdminOrMod) return false;
      }
      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase();
        const matchName = (user.name || user.fullName || '').toLowerCase().includes(q);
        const matchEmail = (user.email || '').toLowerCase().includes(q);
        const matchId = String(user.id || '').includes(q);
        if (!matchName && !matchEmail && !matchId) return false;
      }
      return true;
    });
  }, [usersList, tableStatusFilter, tableSearch]);

  // Active records for pagination
  const currentRecords = activeTableTab === 'itineraries' ? filteredItineraries : filteredUsers;
  const totalPages = Math.max(1, Math.ceil(currentRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return currentRecords.slice(start, start + pageSize);
  }, [currentRecords, currentPage, pageSize]);

  // Growth Chart Data calculation
  const growthData = useMemo(() => {
    const rawList = chartMetric === 'users' ? (stats.userGrowth || []) : (stats.postGrowth || []);
    return Array.isArray(rawList) ? rawList : [];
  }, [stats.userGrowth, stats.postGrowth, chartMetric]);

  // Comprehensive Full Dashboard CSV Exporter (Exports all metrics, charts, trends, moderation, itineraries, and users)
  const handleExportCsv = () => {
    try {
      const escape = (val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const now = new Date();
      const exportTimestamp = now.toLocaleString('vi-VN');
      const lines = [];

      // 1. REPORT HEADER
      lines.push('BÁO CÁO TỔNG QUAN HỆ THỐNG WAYFARE (WAYFARE SYSTEM FULL DASHBOARD REPORT)');
      lines.push(`Thời gian xuất dữ liệu:,${escape(exportTimestamp)}`);
      lines.push(`Người lập báo cáo:,${escape(`${currentUser?.name || presentation.roleLabel} (${currentUser?.email || ''})`)}`);
      lines.push(`Trạng thái máy chủ CSDL:,${escape('Online - Đã đồng bộ trực tiếp từ MySQL')}`);
      lines.push('');

      // 2. KEY PERFORMANCE INDICATORS (KPIs)
      lines.push('=== 1. CHỈ SỐ KPI TỔNG QUAN (KEY METRICS) ===');
      lines.push('Hạng mục chỉ số,Số lượng / Giá trị,Chi tiết & Tăng trưởng thực tế');
      lines.push(`"Cộng đồng thành viên",${stats.totalUsers || 0},${escape(`+${stats.newUsersThisMonth || 0} tài khoản mới trong tháng`)}`);
      lines.push(`"Bài viết & Chia sẻ chuyến đi",${stats.totalPosts || 0},${escape(`+${stats.newPostsThisMonth || 0} bài mới tháng này (${stats.totalLikes || 0} lượt tim, ${stats.totalComments || 0} bình luận)`)}`);
      lines.push(`"Lịch trình du lịch",${stats.totalItineraries || 0},${escape(`Phủ sóng ${stats.totalPlaces || 0} địa điểm (+${stats.newItinerariesThisMonth || 0} lịch trình mới tháng này)`)}`);
      lines.push(`"Kiểm duyệt & Báo cáo vi phạm",${stats.pendingReports || 0},${escape(`Đang chờ xử lý: ${stats.pendingReports || 0} / Tổng số báo cáo: ${stats.totalReports || 0}`)}`);
      lines.push(`"Đánh giá địa danh trung bình",${Number(stats.averagePlaceRating || 5).toFixed(1)},"Sao / 5.0 (Dữ liệu đánh giá từ du khách)"`);
      lines.push('');

      // 3. GROWTH TRENDS (6 MONTHS)
      lines.push('=== 2. XU HƯỚNG TĂNG TRƯỞNG HỆ THỐNG (6 THÁNG GẦN NHẤT) ===');
      lines.push('Chu kỳ tháng,Số người dùng mới đăng ký,Số bài viết mới chia sẻ');
      const months = Array.from(new Set([
        ...(stats.userGrowth || []).map(g => g.label),
        ...(stats.postGrowth || []).map(g => g.label)
      ]));
      if (months.length === 0) {
        growthData.forEach(d => {
          lines.push(`${escape(d.label)},${d.count || 0},0`);
        });
      } else {
        months.forEach(m => {
          const uCount = (stats.userGrowth || []).find(g => g.label === m)?.count || 0;
          const pCount = (stats.postGrowth || []).find(g => g.label === m)?.count || 0;
          lines.push(`${escape(m)},${uCount},${pCount}`);
        });
      }
      lines.push('');

      // 4. TOP DESTINATIONS & HIGHEST RATED PLACES
      lines.push('=== 3. XU HƯỚNG ĐIỂM ĐẾN & ĐỊA DANH HÀNG ĐẦU ===');
      lines.push('Phân loại,Thứ hạng,Tên điểm đến / Địa danh,Khu vực / Tỉnh thành,Số lượt tạo tour / Đánh giá,Điểm số trung bình');
      (stats.topDestinations || []).forEach((dest, idx) => {
        lines.push(`"Top Điểm đến",#${idx + 1},${escape(dest.destination || dest.name || 'Điểm đến')},${escape(dest.province || dest.city || 'Việt Nam')},${dest.count || 0},"N/A"`);
      });
      (stats.topPlaces || []).forEach((place, idx) => {
        lines.push(`"Địa danh đánh giá cao",#${idx + 1},${escape(place.name || 'Địa điểm')},${escape(place.city || place.address || 'Việt Nam')},${escape(`${place.reviewCount || 0} đánh giá`)},${Number(place.averageRating || 5).toFixed(1)}`);
      });
      if ((!stats.topDestinations || stats.topDestinations.length === 0) && (!stats.topPlaces || stats.topPlaces.length === 0)) {
        lines.push('"Dữ liệu xu hướng",N/A,"Đang cập nhật từ dữ liệu du khách",N/A,0,0');
      }
      lines.push('');

      // 5. PENDING REPORTS QUEUE
      lines.push(`=== 4. HÀNG ĐỢI KIỂM DUYỆT BÁO CÁO CẦN XỬ LÝ (${pendingReports.length} mục) ===`);
      lines.push('Mã báo cáo,Loại vi phạm,Tiêu đề nội dung,Tác giả nội dung,Thời gian gửi,Lý do hệ thống cảnh báo / Phân tích');
      if (pendingReports.length === 0) {
        lines.push('N/A,"Không có báo cáo tồn đọng","Hệ thống an toàn 100%",N/A,N/A,"N/A"');
      } else {
        pendingReports.forEach(rep => {
          lines.push(`${rep.id || 'N/A'},${escape(rep.reportType || rep.reason || 'Báo cáo vi phạm')},${escape(rep.targetTitle || rep.title || 'Nội dung bị báo cáo')},${escape(rep.targetAuthorName || rep.authorName || 'Ẩn danh')},${escape(rep.createdAt ? new Date(rep.createdAt).toLocaleString('vi-VN') : 'Mới gửi')},${escape(rep.aiFlagReason || rep.description || 'Chờ quản trị viên xem xét')}`);
        });
      }
      lines.push('');

      // 6. RECENT AUDIT LOGS
      lines.push(`=== 5. NHẬT KÝ HOẠT ĐỘNG KIỂM DUYỆT GẦN NHẤT (${recentLogs.length} thao tác) ===`);
      lines.push('Mã log,Thời gian ghi nhận,Hành động (Action),Người thực hiện,Tài khoản email,Tài nguyên / Chi tiết thao tác');
      if (recentLogs.length === 0) {
        lines.push('N/A,N/A,"Chưa có hoạt động",N/A,N/A,"N/A"');
      } else {
        recentLogs.forEach(logItem => {
          lines.push(`${logItem.id || 'N/A'},${escape(logItem.createdAt ? new Date(logItem.createdAt).toLocaleString('vi-VN') : 'Vừa xong')},${escape(logItem.action || 'THAO_TAC')},${escape(logItem.actorName || 'Hệ thống')},${escape(logItem.actorEmail || 'N/A')},${escape(logItem.details || logItem.targetResource || 'Thực hiện thao tác trong hệ thống')}`);
        });
      }
      lines.push('');

      // 7. ALL ITINERARIES
      lines.push(`=== 6. TOÀN BỘ DANH SÁCH LỊCH TRÌNH DU LỊCH TRÊN HỆ THỐNG (${itinerariesList.length} lịch trình) ===`);
      lines.push('Mã ITN,Tên hành trình,Người tạo,Điểm đến chính,Thời lượng (Ngày),Dự toán ngân sách (VNĐ),Hình thức thiết kế,Trạng thái');
      if (itinerariesList.length === 0) {
        lines.push('N/A,"Chưa có lịch trình",N/A,N/A,0,0,N/A,N/A');
      } else {
        itinerariesList.forEach(item => {
          lines.push(`${item.id},${escape(item.title || 'Không tiêu đề')},${escape(item.creatorName || item.userFullName || 'Thành viên')},${escape(item.destination || 'Việt Nam')},${getItineraryDuration(item).days},${Number(item.budgetTotal || 0).toLocaleString('vi-VN')},${item.isAiGenerated ? '"Hệ thống tạo"' : '"Thành viên tự tạo"'},${escape(item.status || 'ACTIVE')}`);
        });
      }
      lines.push('');

      // 8. ALL USERS & ACCOUNTS
      lines.push(`=== 7. TOÀN BỘ DANH SÁCH THÀNH VIÊN & TÀI KHOẢN (${usersList.length} tài khoản) ===`);
      lines.push('Mã USR,Họ và tên,Email,Số điện thoại,Vai trò hệ thống,Số bài viết đã đăng,Ngày tham gia,Trạng thái tài khoản');
      if (usersList.length === 0) {
        lines.push('N/A,"Chưa có thành viên",N/A,N/A,N/A,0,N/A,N/A');
      } else {
        usersList.forEach(user => {
          const rolesStr = Array.isArray(user.roles) ? user.roles.join(', ') : (user.role || 'ROLE_USER');
          const isBlocked = user.isBlocked || user.blocked || user.status === 'BLOCKED';
          lines.push(`${user.id},${escape(user.name || user.fullName || 'Thành viên')},${escape(user.email || 'N/A')},${escape(user.phoneNumber || user.phone || '—')},${escape(rolesStr)},${user.postsCount || 0},${escape(user.createdAt ? formatVietnamDateOnly(user.createdAt, 'Mới tham gia') : 'Mới tham gia')},${isBlocked ? '"Đã khóa"' : '"Hoạt động bình thường"'}`);
        });
      }

      // Convert to UTF-8 BOM Blob and trigger download
      const fullCsvContent = '\uFEFF' + lines.join('\r\n');
      const blob = new Blob([fullCsvContent], { type: 'text/csv;charset=utf-8;' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileDate = now.toISOString().slice(0, 10);
      link.href = downloadUrl;
      link.setAttribute('download', `Wayfare_Dashboard_Full_Report_${fileDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      toast.success(`Đã xuất toàn bộ dữ liệu Dashboard ra file CSV thành công (${lines.length} dòng dữ liệu tổng hợp)!`);
    } catch (e) {
      console.error('Lỗi khi xuất CSV Dashboard:', e);
      toast.error('Lỗi khi xuất file CSV: ' + e.message);
    }
  };

  // Export Real Detail CSV for a single selected itinerary
  const handleExportSingleItinerary = (itin) => {
    if (!itin) {
      toast.error('Không tìm thấy thông tin lịch trình để xuất file!');
      return;
    }
    try {
      const escape = (val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const now = new Date();
      const statusInfo = getItineraryTimelineStatus(itin);
      const lines = [];

      // Tiêu đề & Thông tin kết xuất
      lines.push('BÁO CÁO HỒ SƠ CHI TIẾT LỊCH TRÌNH DU LỊCH WAYFARE');
      lines.push(`Thời gian trích xuất dữ liệu:,${escape(now.toLocaleString('vi-VN'))}`);
      lines.push(`Người lập báo cáo:,${escape(`${currentUser?.name || presentation.roleLabel} (${currentUser?.email || ''})`)}`);
      lines.push(`Nguồn cơ sở dữ liệu:,${escape('Hệ quản trị CSDL Wayfare MySQL (Single Source of Truth)')}`);
      lines.push('');

      // 1. Thông tin định danh & CSDL
      lines.push('=== 1. THÔNG TIN ĐỊNH DANH & TIẾN ĐỘ HÀNH TRÌNH ===');
      lines.push('Thuộc tính,Chi tiết / Giá trị ghi nhận');
      lines.push(`"Mã số lịch trình (ID)",${itin.id}`);
      lines.push(`"Tên lịch trình du lịch",${escape(itin.title || 'Không có tiêu đề')}`);
      lines.push(`"Điểm đến chính",${escape(itin.destination || 'Việt Nam')}`);
      lines.push(`"Tác giả tạo",${escape(itin.creatorName || itin.userFullName || 'Thành viên')}`);
      lines.push(`"Email tác giả",${escape(itin.creatorEmail || 'N/A')}`);
      lines.push(`"Thời lượng chuyến đi",${escape(getItineraryDuration(itin).label)}`);
      lines.push(`"Ngày bắt đầu (Start Date)",${escape(itin.startDate || 'Chưa định ngày cụ thể')}`);
      lines.push(`"Ngày kết thúc (End Date)",${escape(itin.endDate || 'Chưa định ngày cụ thể')}`);
      lines.push(`"Trạng thái hệ thống CSDL (status)",${escape(statusInfo.dbStatus)}`);
      lines.push(`"Tiến độ hành trình thực tế (Timeline)",${escape(statusInfo.label)}`);
      lines.push(`"Tổng dự toán ngân sách",${escape(itin.budgetTotal ? Number(itin.budgetTotal).toLocaleString('vi-VN') + ' VNĐ' : 'Chưa nhập')}`);
      lines.push(`"Phương thức thiết lập",${escape(itin.isAiGenerated ? 'Hệ thống tạo' : 'Người dùng tự tạo')}`);
      lines.push(`"Chế độ hiển thị",${escape(itin.isPublic === false ? 'Riêng tư (Chỉ tác giả / nhóm xem)' : 'Công khai toàn hệ thống')}`);
      lines.push(`"Phong cách du lịch",${escape(itin.travelStyle || 'Khám phá & Nghỉ dưỡng')}`);
      lines.push(`"Nhóm đối tượng",${escape(itin.groupType || 'Cá nhân')}`);
      lines.push(`"Ngày tạo hồ sơ trên hệ thống",${escape(itin.createdAt ? new Date(itin.createdAt).toLocaleString('vi-VN') : 'N/A')}`);
      lines.push('');

      // 2. Kế hoạch phân rã các ngày hoạt động (details)
      lines.push('=== 2. KẾ HOẠCH LỊCH TRÌNH CHI TIẾT THEO NGÀY ===');
      lines.push('Ngày thứ,Khung giờ,Hoạt động / Điểm tham quan,Địa chỉ cụ thể,Chi phí dự kiến (VNĐ),Ghi chú kinh nghiệm');

      if (itin.details && Array.isArray(itin.details) && itin.details.length > 0) {
        itin.details.forEach(act => {
          lines.push(`"Ngày ${act.dayNumber || 1}",${escape(act.timeSlot || act.time || 'Cả ngày')},${escape(act.activityTitle || act.placeName || 'Tham quan danh lam thắng cảnh')},${escape(act.placeAddress || itin.destination || 'Việt Nam')},${escape(act.estimatedCost ? Number(act.estimatedCost).toLocaleString('vi-VN') : '0')},${escape(act.notes || 'Không có ghi chú')}`);
        });
      } else {
        lines.push(`"Ngày 1","08:30 - 18:00",${escape(`Trải nghiệm khám phá các điểm nổi bật tại ${itin.destination || 'Việt Nam'}`)},${escape(itin.destination || 'Việt Nam')},"Tùy chọn","Lịch trình tổng thể chưa phân rã chi tiết từng giờ."`);
      }

      // Tạo Blob UTF-8 BOM và kích hoạt tải về
      const csvContent = '\uFEFF' + lines.join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const cleanTitle = (itin.title || 'LichTrinh').replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]/g, '_').slice(0, 35);
      link.href = downloadUrl;
      link.setAttribute('download', `Wayfare_Itinerary_${itin.id}_${cleanTitle}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      toast.success(`Đã tải xuống file CSV chi tiết lịch trình #${itin.id} thành công!`);
    } catch (err) {
      console.error('Lỗi khi xuất chi tiết lịch trình:', err);
      toast.error('Không thể xuất file chi tiết: ' + err.message);
    }
  };

  // Helper formatting for Audit Action Badges
  const formatActionBadge = (action) => {
    const act = (action || '').toUpperCase();
    if (act.includes('DELETE') || act.includes('BAN') || act.includes('BLOCK')) {
      return { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: formatAdminActionLabel(action) };
    }
    if (act.includes('UPDATE') || act.includes('ROLE')) {
      return { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: formatAdminActionLabel(action) };
    }
    if (act.includes('CREATE') || act.includes('APPROVE') || act.includes('LOGIN')) {
      return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: formatAdminActionLabel(action) };
    }
    return { bg: 'bg-sky-50 text-sky-700 border-sky-200', label: formatAdminActionLabel(action) };
  };

  return (
    <div className="admin-page admin-dashboard-depth min-w-0 space-y-5 pb-8 sm:space-y-6">
      <nav className="flex flex-wrap items-center gap-2 text-[12px] font-medium text-ink-400" aria-label="Đường dẫn">
        <Compass className="h-3.5 w-3.5" />
        <span>{presentation.workspaceLabel}</span>
        <ChevronRight className="h-3 w-3 text-ink-300" />
        <span className="text-ink-700">Tổng quan</span>
      </nav>

      <section className="admin-page-header flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div className="min-w-0 space-y-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">{presentation.dashboardLabel}</h1>
            <p className="max-w-xl text-[13px] leading-relaxed text-ink-500">
              {presentation.role === 'moderator'
                ? 'Theo dõi nội dung được phân công, hàng đợi kiểm duyệt và báo cáo cần xử lý.'
                : 'Theo dõi hoạt động cộng đồng, tăng trưởng và nội dung cần xử lý.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => loadDashboardData(true)} disabled={refreshing} title="Đồng bộ dữ liệu mới nhất"
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[4px] border border-ink-200 bg-white px-4 text-[13px] font-semibold text-ink-700 transition hover:border-clay-300 hover:bg-clay-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-clay-600 disabled:opacity-50 sm:flex-none">
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Đang đồng bộ...' : 'Làm mới'}
            </button>
            <button type="button" onClick={handleExportCsv} title="Xuất báo cáo tổng quan ra file CSV"
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[4px] border border-clay-600 bg-clay-600 px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-clay-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-clay-600 sm:flex-none">
              <Download className="h-3.5 w-3.5" />Xuất báo cáo
            </button>
          </div>
      </section>

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 sm:gap-4" aria-label="Chỉ số tổng quan">
        <DashboardMetric icon={Users} label="Thành viên" tone="ink"
          value={loading ? '—' : Number(stats.totalUsers || 0).toLocaleString('vi-VN')}
          badge={`+${stats.newUsersThisMonth || 0} tháng này`}
          detail={canViewUsers ? 'Xem cộng đồng thành viên' : 'Tài khoản trên hệ thống'} onClick={canViewUsers ? () => setAdminTab('users') : undefined} />
        <DashboardMetric icon={FileText} label="Bài viết cộng đồng" tone="clay"
          value={loading ? '—' : Number(stats.totalPosts || 0).toLocaleString('vi-VN')}
          badge={`+${stats.newPostsThisMonth || 0} tháng này`}
          detail={`${Number(stats.totalLikes || 0).toLocaleString('vi-VN')} lượt thích · ${Number(stats.totalComments || 0).toLocaleString('vi-VN')} bình luận`}
          onClick={canViewReports ? () => setAdminTab('reports') : undefined} />
        <DashboardMetric icon={Compass} label="Lịch trình du lịch" tone="green"
          value={loading ? '—' : Number(stats.totalItineraries || 0).toLocaleString('vi-VN')}
          badge={`${stats.activeItineraries || 0} hoạt động`}
          detail={`${Number(stats.totalPlaces || 0).toLocaleString('vi-VN')} địa điểm khám phá`}
          onClick={canViewItineraries ? () => setAdminTab('itineraries') : undefined} />
        <DashboardMetric icon={ShieldAlert} label="Báo cáo chờ xử lý" tone={(stats.pendingReports ?? pendingReports.length) > 0 ? 'rose' : 'green'}
          value={loading ? '—' : Number(stats.pendingReports ?? pendingReports.length).toLocaleString('vi-VN')}
          badge={(stats.pendingReports ?? pendingReports.length) > 0 ? 'Cần chú ý' : 'Đã xử lý hết'}
          detail={`Trong tổng số ${Number(stats.totalReports || 0).toLocaleString('vi-VN')} báo cáo`}
          onClick={canViewReports ? () => setAdminTab('reports') : undefined} />
      </div>

      {/* ─── ROW 2: REAL CHARTS & INTELLIGENCE WIDGETS ────────────────────── */}
      <div className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-12">
        
        {/* LEFT COLUMN: REAL DATA CHARTS & TOP TRENDS (8 Cols) */}
        <div className={`min-w-0 space-y-5 ${hasSidePanels ? 'xl:col-span-8' : 'xl:col-span-12'}`}>
          
          {/* Dynamic Growth Chart */}
          <section className={`${PANEL_CLASS} space-y-4 p-4 sm:p-5`} aria-label="Biểu đồ tăng trưởng">
            <div className="flex flex-col justify-between gap-3 border-b border-ink-100 pb-4 sm:flex-row sm:flex-wrap sm:items-center">
              <div>
                <h3 className="font-display font-bold text-[18px] text-ink-800 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-clay-600" />
                  Nhịp tăng trưởng
                </h3>
                <p className="text-[12px] text-ink-400 mt-1">Hoạt động cộng đồng trong 6 tháng gần nhất</p>
              </div>

              {/* Metric Toggle Tabs */}
              <div className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-start p-1 bg-ink-50 rounded-xl shrink-0 text-[12px]">
                <button
                  type="button"
                  onClick={() => setChartMetric('users')}
                  className={`flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 min-h-10 px-3 py-2 rounded-lg font-semibold text-[12px] whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    chartMetric === 'users'
                      ? 'bg-white text-clay-700 border border-ink-200/60 shadow-sm'
                      : 'text-ink-500 hover:text-ink-800 hover:bg-[#FFFDF8]/60 border border-transparent'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Người dùng</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric('posts')}
                  className={`flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 min-h-10 px-3 py-2 rounded-lg font-semibold text-[12px] whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    chartMetric === 'posts'
                      ? 'bg-white text-clay-700 border border-ink-200/60 shadow-sm'
                      : 'text-ink-500 hover:text-ink-800 hover:bg-[#FFFDF8]/60 border border-transparent'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Bài viết</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-[30px] font-bold leading-tight tracking-tight text-ink-900 tabular-nums">{Number(growthData[growthData.length - 1]?.count || 0).toLocaleString('vi-VN')}</span>
                  <span className="text-[12px] text-ink-500">{chartMetric === 'users' ? 'thành viên mới' : 'bài viết mới'}</span>
                </div>
                <p className="mt-1 text-[12px] text-ink-400">Tháng gần nhất trong kỳ</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-500"><span className="h-2 w-2 rounded-full bg-clay-600" />{chartMetric === 'users' ? 'Thành viên' : 'Bài viết'}</span>
            </div>
            <GrowthChart data={growthData} metric={chartMetric} />
            <div className="grid grid-cols-1 gap-3 border-t border-ink-100 pt-4 sm:grid-cols-3">
              <div className="min-w-0 rounded-xl bg-ink-50/70 px-3 py-2.5">
                <span className="block text-[11px] text-ink-500">Tổng trong kỳ</span>
                <span className="mt-1 block text-[18px] font-bold text-ink-800 tabular-nums">{growthData.reduce((acc, cur) => acc + (Number(cur.count) || 0), 0).toLocaleString('vi-VN')}</span>
              </div>
              <div className="min-w-0 rounded-xl bg-clay-50/70 px-3 py-2.5">
                <span className="block text-[11px] text-ink-500">Tháng cao nhất</span>
                <span className="mt-1 block text-[18px] font-bold text-clay-700 tabular-nums">{Math.max(0, ...growthData.map(item => Number(item.count) || 0)).toLocaleString('vi-VN')}</span>
              </div>
              <div className="min-w-0 rounded-xl bg-emerald-50/60 px-3 py-2.5">
                <span className="block text-[11px] text-ink-500">Tháng gần nhất</span>
                <span className="mt-1 block text-[18px] font-bold text-emerald-700 tabular-nums">+{growthData[growthData.length - 1]?.count || 0} mới</span>
              </div>
            </div>
          </section>

          {/* Top Trends & Places */}
          <div className={`${PANEL_CLASS} space-y-4 p-4 sm:p-5`}>
            <div className="flex flex-col justify-between gap-3 border-b border-ink-100 pb-4 sm:flex-row sm:flex-wrap sm:items-center">
              <div>
                <h3 className="font-display font-bold text-[18px] text-ink-800 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-clay-600" />
                  Điểm đến & Địa danh nổi bật
                </h3>
                <p className="text-[12px] text-ink-400 mt-1">Xếp hạng theo lượt tạo lịch trình và đánh giá thực tế</p>
              </div>

              {/* Subtabs for Trends */}
              <div className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-start p-1 bg-ink-50 rounded-xl shrink-0 text-[12px]">
                <button
                  type="button"
                  onClick={() => setTopTab('destinations')}
                  className={`flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 min-h-10 px-3 py-2 rounded-lg font-semibold text-[12px] whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    topTab === 'destinations'
                      ? 'bg-white text-clay-700 border border-ink-200/60 shadow-sm'
                      : 'text-ink-500 hover:text-ink-800 hover:bg-[#FFFDF8]/60 border border-transparent'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Điểm đến ({stats.topDestinations?.length || 0})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTopTab('places')}
                  className={`flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 min-h-10 px-3 py-2 rounded-lg font-semibold text-[12px] whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    topTab === 'places'
                      ? 'bg-white text-clay-700 border border-ink-200/60 shadow-sm'
                      : 'text-ink-500 hover:text-ink-800 hover:bg-[#FFFDF8]/60 border border-transparent'
                  }`}
                >
                  <Star className="w-3.5 h-3.5" />
                  <span>Đánh giá cao ({stats.topPlaces?.length || 0})</span>
                </button>
              </div>
            </div>

            {/* Content for Trends */}
            {topTab === 'destinations' ? (
              <div className="space-y-3">
                {(!stats.topDestinations || stats.topDestinations.length === 0) ? (
                  <div className="p-8 text-center text-ink-400 text-xs">
                    Chưa có dữ liệu điểm đến.
                  </div>
                ) : (
                  stats.topDestinations.map((dest, idx) => {
                    const highestCount = Number(stats.topDestinations[0]?.count) || 1;
                    const percent = Math.min(100, Math.round((Number(dest.count) / highestCount) * 100));
                    return (
                      <div key={idx} className="min-w-0 p-3.5 rounded-xl bg-ink-50/50 border border-ink-200/50 hover:bg-[#F8F4EC] transition-colors">
                        <div className="flex flex-wrap items-center justify-between gap-2 font-semibold text-[13px] text-ink-800 mb-2.5">
                          <span className="flex min-w-0 flex-1 items-center gap-2">
                            <span className={`w-6 h-6 shrink-0 rounded-lg flex items-center justify-center text-[11px] font-semibold border ${
                              idx === 0 ? 'bg-amber-100 text-amber-800 border-amber-300' :
                              idx === 1 ? 'bg-ink-100 text-ink-700 border-ink-300' :
                              idx === 2 ? 'bg-clay-100 text-clay-800 border-clay-300' : 'bg-[#FFFDF8] text-ink-600 border-ink-200'
                            }`}>
                              #{idx + 1}
                            </span>
                            <span className="min-w-0 break-words font-display font-bold text-ink-800">{dest.destination || 'Không xác định'}</span>
                          </span>
                          <span className="shrink-0 text-clay-700 font-semibold tabular-nums">{dest.count} chuyến đi</span>
                        </div>
                        <div className="w-full bg-ink-200/60 rounded-full h-1">
                          <div 
                            className="bg-clay-500 h-1 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(!stats.topPlaces || stats.topPlaces.length === 0) ? (
                  <div className="sm:col-span-2 p-8 text-center text-ink-400 text-xs">
                    Chưa có đánh giá địa danh.
                  </div>
                ) : (
                  stats.topPlaces.map((place, idx) => (
                    <div key={idx} className="min-w-0 p-3.5 rounded-xl bg-ink-50/50 border border-ink-200/50 flex items-center justify-between gap-3 hover:bg-[#F8F4EC] transition-colors">
                      <div className="min-w-0">
                        <div className="font-display font-bold text-xs text-ink-800 truncate">{place.name}</div>
                        <div className="text-[11px] text-ink-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-clay-600 shrink-0" />
                          <span className="truncate">{place.city || 'Việt Nam'}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#FFFDF8] text-ink-800 font-bold text-xs border border-ink-200/80">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{Number(place.rating || 0).toFixed(1)}</span>
                        </div>
                        <span className="block text-[10px] text-ink-400 mt-0.5">{place.reviewCount || 0} đánh giá</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: ACTION REQUIRED & RECENT AUDIT LOGS (4 Cols) */}
        {hasSidePanels && <div className="min-w-0 space-y-5 xl:col-span-4">
          
          {/* Action Required: Pending Moderation Reports */}
          {canViewReports && <div className={`${PANEL_CLASS} space-y-4 p-4 sm:p-5`}>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-ink-100">
              <div className="flex items-center gap-2 font-display font-bold text-[17px] text-ink-800">
                <span className={`w-2 h-2 rounded-full ${(stats.pendingReports > 0 || pendingReports.length > 0) ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                <span>Cần kiểm duyệt</span>
              </div>
              <span className={`px-2 py-0.5 rounded-[4px] font-bold text-xs border ${
                (stats.pendingReports > 0 || pendingReports.length > 0) ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                {(stats.pendingReports ?? pendingReports.length) > 0 ? `${stats.pendingReports ?? pendingReports.length} chờ xử lý` : 'Bình thường'}
              </span>
            </div>

            <div className="space-y-3 text-[13px]">
              {pendingReports.length === 0 ? (
                <div className="p-5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-800 text-center font-semibold space-y-1">
                  <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
                  <div className="font-bold">Hệ thống an toàn</div>
                  <p className="text-[11px] text-emerald-700 font-normal">Không có báo cáo vi phạm chờ duyệt.</p>
                </div>
              ) : (
                pendingReports.slice(0, 3).map((r) => (
                  <div key={r.id} className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-1.5 text-rose-800 font-semibold">
                      <span className="flex items-center gap-1">
                        <Flag className="w-3.5 h-3.5 text-rose-600" /> {r.category || 'Vi phạm'}
                      </span>
                      <span className="text-[10px] text-ink-400 font-normal">{r.timeAgo || 'Gần đây'}</span>
                    </div>
                    <h4 className="font-display font-bold text-ink-800 line-clamp-2">{r.title || 'Bài viết báo cáo'}</h4>
                    <p className="text-[12px] leading-relaxed text-ink-500 line-clamp-2">
                      {r.aiFlagReason || r.reportReason || r.snippet || 'Dấu hiệu vi phạm tiêu chuẩn cộng đồng.'}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-ink-500 truncate max-w-[130px]">{r.authorName || 'Ẩn danh'}</span>
                      <button
                        onClick={() => setAdminTab('reports')}
                        className="min-h-9 px-3 py-1 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-semibold text-[12px] transition-colors cursor-pointer"
                      >
                        Kiểm duyệt
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setAdminTab('reports')}
              className="w-full min-h-10 rounded-xl border border-clay-200/60 bg-clay-50/50 text-center text-clay-700 hover:bg-clay-50 font-semibold text-[12px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <span>Xem tất cả báo cáo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>}

          {/* Recent Audit Logs Feed */}
          {canViewAudit && <div className={`${PANEL_CLASS} space-y-4 p-4 sm:p-5`}>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-ink-100">
              <div className="flex items-center gap-2 font-display font-bold text-[17px] text-ink-800">
                <History className="w-4 h-4 text-clay-600" />
                <span>Nhật ký hoạt động</span>
              </div>
              <button 
                onClick={() => setAdminTab('audit-logs')}
                className="text-[11px] text-clay-700 hover:text-clay-800 font-bold hover:underline cursor-pointer"
              >
                Tất cả →
              </button>
            </div>

            <div className="space-y-2.5">
              {recentLogs.length === 0 ? (
                <div className="p-4 text-center text-ink-400 text-xs">
                  Chưa có hoạt động gần đây.
                </div>
              ) : (
                recentLogs.map((logItem) => {
                  const badge = formatActionBadge(logItem.action);
                  return (
                    <div key={logItem.id} className="relative ml-1 border-l border-ink-200 py-1 pl-4 text-[12px] space-y-1.5 before:absolute before:-left-[4px] before:top-3 before:h-[7px] before:w-[7px] before:rounded-full before:bg-clay-400 before:ring-4 before:ring-white">
                      <div className="flex items-center justify-between">
                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="text-[10px] text-ink-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {logItem.createdAt ? new Date(logItem.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'}
                        </span>
                      </div>
                      <div className="font-semibold text-ink-700 line-clamp-1 text-[13px]">
                        {logItem.actorName || logItem.actorEmail || 'Hệ thống'}
                      </div>
                      <p className="text-[12px] leading-relaxed text-ink-400 line-clamp-2">
                        {logItem.details || logItem.targetResource || 'Thực hiện thao tác trong hệ thống'}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => setAdminTab('audit-logs')}
              className="w-full min-h-10 rounded-xl bg-ink-50/70 text-center text-ink-500 hover:bg-ink-100 hover:text-ink-800 font-semibold text-[12px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <span>Xem tất cả nhật ký</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>}

        </div>}

      </div>

      {/* ─── ROW 3: CENTRAL DATA TABLE ────────────────────────────────────── */}
      {(canViewItineraries || canViewUsers) && <div className={`${PANEL_CLASS} space-y-5 p-4 sm:p-5`}>
        
        {/* Table Header & Functional Bar */}
        <div className="flex flex-col justify-between gap-4 border-b border-ink-100 pb-4 xl:flex-row xl:flex-wrap xl:items-center">
          <div className="flex flex-wrap items-center gap-3">
            {canViewItineraries && <button
              onClick={() => setActiveTableTab('itineraries')}
              className={`font-display font-bold text-[17px] transition-colors cursor-pointer pb-2 -mb-2 border-b-2 ${
                activeTableTab === 'itineraries' 
                  ? 'text-clay-700 border-clay-600' 
                  : 'text-ink-400 border-transparent hover:text-ink-700'
              }`}
            >
              Lịch trình ({filteredItineraries.length})
            </button>}
            {canViewItineraries && canViewUsers && <span className="text-ink-200">|</span>}
            {canViewUsers && <button
              onClick={() => setActiveTableTab('users')}
              className={`font-display font-bold text-[17px] transition-colors cursor-pointer pb-2 -mb-2 border-b-2 ${
                activeTableTab === 'users' 
                  ? 'text-clay-700 border-clay-600' 
                  : 'text-ink-400 border-transparent hover:text-ink-700'
              }`}
            >
              Thành viên ({filteredUsers.length})
            </button>}
          </div>

          <div className="flex min-w-0 w-full flex-col gap-2.5 sm:flex-row sm:items-center xl:w-auto">
            {/* Search Input */}
            <div className="relative min-w-0 w-full sm:flex-1 xl:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                placeholder={activeTableTab === 'itineraries' ? "Tìm theo tên, điểm đến, tác giả..." : "Tìm tên, email thành viên..."}
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="min-h-11 pl-8 pr-3 py-2 bg-ink-50/50 border border-ink-200/80 rounded-xl text-[13px] text-ink-800 placeholder:text-ink-300 outline-none focus:border-clay-600 w-full transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Filter Dropdown */}
              <select
                value={tableStatusFilter}
                onChange={(e) => setTableStatusFilter(e.target.value)}
                className="flex-1 sm:flex-none min-h-11 px-3 py-2 bg-ink-50/50 border border-ink-200/80 rounded-xl text-[13px] font-bold text-ink-700 outline-none cursor-pointer hover:bg-[#F8F4EC]/80 transition-colors"
              >
                {activeTableTab === 'itineraries' ? (
                  <>
                    <option value="all">Tất cả trạng thái</option>
                    <option value="upcoming">Sắp tới</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="completed">Đã hoàn thành</option>
                    <option value="draft">Bản nháp</option>
                  </>
                ) : (
                  <>
                    <option value="all">Tất cả vai trò</option>
                    <option value="user">Người dùng</option>
                    <option value="admin">Quản trị viên</option>
                  </>
                )}
              </select>

              <button 
                onClick={() => loadDashboardData(true)}
                disabled={refreshing}
                className="p-2 rounded-[5px] bg-[#FFFDF8] border border-ink-200/80 text-ink-600 hover:text-clay-700 hover:bg-[#F8F4EC] transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                title="Làm mới bảng"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-clay-600' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Data Table Container */}
        <div className="overflow-x-auto rounded-xl border border-ink-200/70">
          {activeTableTab === 'itineraries' ? (
            /* ITINERARIES TABLE */
            <table className="w-full min-w-[760px] text-left text-[13px]">
              <thead className="bg-ink-50 text-ink-500 font-semibold border-b border-ink-200/70 text-[12px]">
                <tr>
                  <th className="py-3 px-4">Mã</th>
                  <th className="py-3 px-4">Lịch trình</th>
                  <th className="py-3 px-4">Tác giả</th>
                  <th className="py-3 px-4">Điểm đến</th>
                  <th className="py-3 px-4">Ngân sách</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-ink-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-clay-600" />
                      Đang đồng bộ dữ liệu lịch trình...
                    </td>
                  </tr>
                ) : paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-ink-400">
                      Không tìm thấy lịch trình nào khớp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((row) => (
                    <tr key={row.id} className="even:bg-ink-50/30 hover:bg-clay-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-clay-700">#{row.id}</td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-display font-bold text-ink-800 truncate">{row.title}</div>
                        <span className="text-ink-400 text-[11px] flex items-center gap-1">
                          {row.isAiGenerated ? (
                            <span className="text-clay-600 font-bold flex items-center gap-0.5">
                              <Compass className="w-2.5 h-2.5" /> Hệ thống tạo
                            </span>
                          ) : (
                            'Tự tạo'
                          )}
                          <span>• {getItineraryDuration(row).shortLabel}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {row.creatorAvatar ? (
                            <img 
                              src={row.creatorAvatar} 
                              alt="" 
                              crossOrigin="anonymous" 
                              referrerPolicy="no-referrer" 
                              className="w-6 h-6 rounded-full object-cover shrink-0 border border-ink-200/80"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-clay-700 text-[#FFFDF8] font-bold text-[10px] flex items-center justify-center shrink-0">
                              {row.creatorName ? row.creatorName.charAt(0) : 'U'}
                            </div>
                          )}
                          <span className="font-bold text-ink-800 truncate max-w-[130px]">{row.creatorName || 'Người dùng'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-ink-800 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-clay-600 shrink-0" />
                          <span className="truncate">{row.destination || 'Chưa cập nhật'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-bold text-ink-800">
                        {row.budgetTotal ? Number(row.budgetTotal).toLocaleString('vi-VN') + ' đ' : 'Chưa nhập'}
                      </td>

                      <td className="py-3 px-4">
                        {(() => {
                          const st = getItineraryTimelineStatus(row);
                          return (
                            <div className="space-y-0.5">
                              <span 
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-bold border ${st.badgeClass}`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                {st.label}
                              </span>
                              {row.startDate && (
                                <div className="text-[10px] text-ink-400 font-mono flex items-center gap-1">
                                  <Calendar className="w-2.5 h-2.5 text-ink-400 shrink-0" />
                                  <span>{row.startDate}</span>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 text-ink-400">
                          <button 
                            onClick={() => setSelectedItinerary(row)}
                            className="p-1.5 hover:text-clay-700 hover:bg-clay-50 rounded-[4px] transition-colors cursor-pointer" 
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            /* USERS TABLE */
            <table className="w-full min-w-[760px] text-left text-[13px]">
              <thead className="bg-ink-50 text-ink-500 font-semibold border-b border-ink-200/70 text-[12px]">
                <tr>
                  <th className="py-3 px-4">Mã</th>
                  <th className="py-3 px-4">Thành viên</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Vai trò</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Ngày tham gia</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-ink-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-clay-600" />
                      Đang đồng bộ danh sách thành viên...
                    </td>
                  </tr>
                ) : paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-ink-400">
                      Không tìm thấy thành viên nào khớp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((user) => (
                    <tr key={user.id} className="even:bg-ink-50/30 hover:bg-clay-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-clay-700">#{user.id}</td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt="" 
                              crossOrigin="anonymous" 
                              referrerPolicy="no-referrer" 
                              className="w-7 h-7 rounded-full object-cover shrink-0 border border-ink-200/80"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-ink-800 text-[#FFFDF8] font-bold text-[10px] flex items-center justify-center shrink-0">
                              {(user.name || user.fullName || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-bold text-ink-800">{user.name || user.fullName || 'Thành viên'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-ink-600 font-mono text-[11px]">{user.email}</td>

                      <td className="py-3 px-4">
                        {(() => {
                          const isAdmin = (user.roles && user.roles.includes('ROLE_ADMIN')) || user.role === 'ROLE_ADMIN' || user.role === 'ADMIN';
                          const isMod = (user.roles && user.roles.includes('ROLE_MODERATOR')) || user.role === 'ROLE_MODERATOR';
                          if (isAdmin) {
                            return (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold border bg-amber-50 text-amber-900 border-amber-300">
                                ADMIN
                              </span>
                            );
                          }
                          if (isMod) {
                            return (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold border bg-clay-50 text-clay-800 border-clay-300">
                                MODERATOR
                              </span>
                            );
                          }
                          return (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold border bg-[#F8F4EC] text-ink-700 border-ink-200">
                              USER
                            </span>
                          );
                        })()}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold border ${
                          user.isBlocked
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {user.isBlocked ? 'Đã khóa' : 'Hoạt động'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-ink-500 text-[11px]">
                        {user.createdAt ? formatVietnamDateOnly(user.createdAt, 'Mới tham gia') : 'Mới tham gia'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setAdminTab('users')}
                          className="px-2.5 py-1 rounded-[5px] bg-[#F8F4EC] hover:bg-clay-50 text-ink-700 hover:text-clay-700 font-bold text-[11px] border border-ink-200/80 transition-colors cursor-pointer"
                        >
                          Quản lý
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-ink-500">
            <span className="text-center sm:text-left">
              Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, currentRecords.length)} trong số {currentRecords.length} kết quả
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-[5px] border border-ink-200/80 bg-[#FFFDF8] hover:bg-[#F8F4EC] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-ink-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-bold text-ink-800">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-[5px] border border-ink-200/80 bg-[#FFFDF8] hover:bg-[#F8F4EC] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-ink-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>}

      {/* ─── QUICK VIEW ITINERARY MODAL ────────────────────────────────────── */}
      {selectedItinerary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="admin-panel bg-[#FFFDF8] rounded-[6px] max-w-lg w-full p-6 border border-ink-200 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-clay-700 uppercase tracking-wider block">
                  #ITN-{selectedItinerary.id}
                </span>
                <h3 className="font-display font-black text-xl text-ink-800 mt-0.5">
                  {selectedItinerary.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItinerary(null)}
                className="p-1.5 rounded-[5px] hover:bg-[#F8F4EC] text-ink-400 hover:text-ink-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 py-2 text-xs border-y border-ink-200/60">
              <div className="flex justify-between py-1">
                <span className="text-ink-400">Điểm đến:</span>
                <strong className="text-ink-800 font-bold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-clay-600" />
                  {selectedItinerary.destination || 'Chưa cập nhật'}
                </strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ink-400">Tác giả:</span>
                <strong className="text-ink-800 font-bold">{selectedItinerary.creatorName || selectedItinerary.userFullName || 'Người dùng'}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ink-400">Thời lượng:</span>
                <strong className="text-ink-800 font-bold">{getItineraryDuration(selectedItinerary).label}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ink-400">Khởi hành:</span>
                <span className="font-mono font-bold text-ink-800 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-clay-600" />
                  {selectedItinerary.startDate ? `${selectedItinerary.startDate} ${selectedItinerary.endDate ? '➜ ' + selectedItinerary.endDate : ''}` : 'Chưa định ngày cụ thể'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ink-400">Ngân sách dự kiến:</span>
                <strong className="text-clay-700 font-display font-black text-sm">
                  {selectedItinerary.budgetTotal ? Number(selectedItinerary.budgetTotal).toLocaleString('vi-VN') + ' đ' : 'Chưa nhập'}
                </strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ink-400">Hình thức tạo:</span>
                <span className={`px-2 py-0.5 rounded-[4px] font-bold text-[10px] border ${
                  selectedItinerary.isAiGenerated ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-ink-100 text-ink-700 border-ink-200'
                }`}>
                  {selectedItinerary.isAiGenerated ? 'Hệ thống tạo' : 'Tự tạo'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ink-400">Trạng thái:</span>
                <span className={`px-2 py-0.5 rounded-[4px] font-bold text-[10px] border ${
                  (selectedItinerary.status || 'ACTIVE') === 'ACTIVE' 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-zinc-100 text-zinc-700 border-zinc-300'
                }`}>
                  {selectedItinerary.status || 'ACTIVE'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ink-400">Tiến độ:</span>
                {(() => {
                  const st = getItineraryTimelineStatus(selectedItinerary);
                  return (
                    <span className={`px-2 py-0.5 rounded-[4px] font-bold text-[10px] border ${st.badgeClass}`}>
                      {st.label}
                    </span>
                  );
                })()}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <a
                href={`/itinerary/${selectedItinerary.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-[5px] bg-[#F8F4EC] hover:bg-clay-50 text-ink-700 hover:text-clay-700 font-bold text-xs border border-ink-200/80 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Mở xem trang chi tiết"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Xem trên web</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedItinerary(null)}
                  className="px-4 py-2 rounded-[5px] bg-[#F8F4EC] hover:bg-ink-100 text-ink-700 font-bold text-xs border border-ink-200/80 transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  onClick={() => handleExportSingleItinerary(selectedItinerary)}
                  className="px-4 py-2 rounded-[5px] bg-clay-600 hover:bg-clay-700 text-[#FFFDF8] font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Xuất CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboardPage;
