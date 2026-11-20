import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../components/common/Toast';
import { adminApi, adminReportApi, auditLogApi, adminUserApi } from '../../../services/api';
import { formatVietnamDateOnly } from '../../../utils/dateUtils';
import { 
  Users, MapPin, Sparkles, TrendingUp, CheckCircle2, Calendar, 
  ChevronRight, Search, Filter, Flag, Eye, Download, ArrowRight, RefreshCw, 
  FileText, Compass, ShieldAlert, Clock, History, UserCheck, ChevronLeft, 
  X, Star, ExternalLink, BarChart3, AlertTriangle
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const toast = useToast();
  const { currentUser, setAdminTab } = useApp();

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
    try {
      const cached = sessionStorage.getItem('wayfare_admin_itineraries');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [usersList, setUsersList] = useState([]);
  const [pendingReports, setPendingReports] = useState(() => {
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
  const [activeTableTab, setActiveTableTab] = useState('itineraries'); // 'itineraries' | 'users'
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
        adminApi.getAllItineraries().catch(() => []),
        adminReportApi.getPendingReports().catch(() => []),
        auditLogApi.getLogs({ page: 0, size: 5 }).catch(() => ({ content: [] })),
        adminUserApi.getUsers().catch(() => [])
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
  }, []);

  // Reset page when switching table tab or filters
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTableTab, tableSearch, tableStatusFilter]);

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
    if (!rawList || rawList.length === 0) {
      return [
        { label: 'Th5/26', count: 0 },
        { label: 'Th6/26', count: 0 },
        { label: 'Th7/26', count: 0 },
        { label: 'Th8/26', count: 0 },
        { label: 'Th9/26', count: 0 },
        { label: 'Th10/26', count: 0 }
      ];
    }
    return rawList;
  }, [stats.userGrowth, stats.postGrowth, chartMetric]);

  const maxChartValue = useMemo(() => {
    const max = Math.max(...growthData.map(d => Number(d.count) || 0), 1);
    return Math.ceil(max * 1.25);
  }, [growthData]);

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
      lines.push(`Người lập báo cáo:,${escape(`${currentUser?.name || 'Quản trị viên'} (${currentUser?.email || 'admin@wayfare.com'})`)}`);
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
          lines.push(`${item.id},${escape(item.title || 'Không tiêu đề')},${escape(item.creatorName || item.userFullName || 'Thành viên')},${escape(item.destination || 'Việt Nam')},${getItineraryDuration(item).days},${Number(item.budgetTotal || 0).toLocaleString('vi-VN')},${item.isAiGenerated ? '"Trợ lý AI thiết kế"' : '"Thành viên tự tạo"'},${escape(item.status || 'ACTIVE')}`);
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
      lines.push(`Cán bộ kiểm tra / Quản trị viên:,${escape(`${currentUser?.name || 'Quản trị viên'} (${currentUser?.email || 'admin@wayfare.com'})`)}`);
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
      lines.push(`"Phương thức thiết lập",${escape(itin.isAiGenerated ? 'Trợ lý AI Gemini thiết kế' : 'Người dùng tự tạo')}`);
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
      return { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: action };
    }
    if (act.includes('UPDATE') || act.includes('ROLE')) {
      return { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: action };
    }
    if (act.includes('CREATE') || act.includes('APPROVE') || act.includes('LOGIN')) {
      return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: action };
    }
    return { bg: 'bg-sky-50 text-sky-700 border-sky-200', label: action || 'ACTION' };
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* ─── PAGE HEADER & ACTION TOOLBAR ────────────────────────────────────── */}
      <div className="bg-white p-5 sm:p-6 rounded-[8px] border border-ink-200 shadow-sm border-l-4 border-l-clay-600 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <nav className="flex items-center gap-2 text-[11px] font-semibold text-ink-500">
            <Compass className="w-3.5 h-3.5 text-clay-600 shrink-0" />
            <span>Quản trị hệ thống</span>
            <span className="text-ink-300">/</span>
            <span className="text-clay-700 font-bold">Tổng quan</span>
          </nav>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-ink-900 tracking-tight flex items-center gap-2">
            Chào mừng trở lại, {currentUser?.name || 'Quản trị viên'}! <span>👋</span>
          </h1>
          <p className="text-xs text-ink-500 flex items-center gap-2 flex-wrap font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 animate-pulse"></span>
            <span className="text-emerald-800 font-semibold">Hệ thống hoạt động ổn định</span>
            <span className="text-ink-300">•</span>
            <span>Dữ liệu thời gian thực từ CSDL</span>
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 pt-2 xl:pt-0 w-full sm:w-auto">
          <button 
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
            className="flex-1 sm:flex-none h-9 flex items-center justify-center gap-1.5 px-4 rounded-[6px] bg-[#FAF7F0] hover:bg-clay-50 text-ink-800 font-bold text-xs border border-ink-200 hover:border-clay-400 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Đồng bộ dữ liệu mới nhất"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-clay-600 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Đang đồng bộ...' : 'Làm mới'}</span>
          </button>

          <button 
            onClick={handleExportCsv}
            className="flex-1 sm:flex-none h-9 flex items-center justify-center gap-1.5 px-4 rounded-[6px] bg-clay-700 hover:bg-clay-800 text-white font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer"
            title="Xuất báo cáo tổng quan ra file CSV"
          >
            <Download className="w-3.5 h-3.5 text-white/90" />
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* ─── ROW 1: 4 KEY METRIC KPI CARDS (ĐỊNH DANH MÀU SẮC NÉT RIÊNG TỪNG PHẦN) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Users Metric (SẮC XANH DƯƠNG / BLUE) */}
        <div className="bg-white p-5 rounded-[8px] border border-blue-200/90 border-t-[3.5px] border-t-blue-600 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-[6px] bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200">
              <TrendingUp className="w-3 h-3 text-blue-600" />
              +{stats.newUsersThisMonth} tháng này
            </span>
          </div>
          <div>
            <span className="text-xs text-blue-900/70 font-bold uppercase tracking-wider block">Thành viên</span>
            <div className="mt-1">
              <h2 className="font-display font-black text-2xl sm:text-3xl text-ink-900 tracking-tight">{stats.totalUsers.toLocaleString('vi-VN')}</h2>
            </div>
            <p className="text-[11px] text-ink-500 mt-2 flex items-center gap-1.5 pt-2 border-t border-blue-100">
              <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Tài khoản trên hệ thống</span>
            </p>
          </div>
        </div>

        {/* KPI 2: Community Posts & Engagement Metric (SẮC XANH LÁ / EMERALD) */}
        <div className="bg-white p-5 rounded-[8px] border border-emerald-200/90 border-t-[3.5px] border-t-emerald-600 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-[6px] bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              +{stats.newPostsThisMonth} tháng này
            </span>
          </div>
          <div>
            <span className="text-xs text-emerald-900/70 font-bold uppercase tracking-wider block">Bài viết cộng đồng</span>
            <div className="mt-1">
              <h2 className="font-display font-black text-2xl sm:text-3xl text-ink-900 tracking-tight">{stats.totalPosts.toLocaleString('vi-VN')}</h2>
            </div>
            <p className="text-[11px] text-ink-500 mt-2 flex items-center gap-1.5 pt-2 border-t border-emerald-100">
              <span className="font-bold text-emerald-800">{(stats.totalLikes || 0).toLocaleString('vi-VN')}</span> thích
              <span className="text-ink-300">•</span>
              <span className="font-bold text-emerald-800">{(stats.totalComments || 0).toLocaleString('vi-VN')}</span> bình luận
            </p>
          </div>
        </div>

        {/* KPI 3: Itineraries & Places Metric (SẮC ĐẤT NUNG / CLAY ĐẶC TRƯNG WAYFARE) */}
        <div className="bg-white p-5 rounded-[8px] border border-amber-300/80 border-t-[3.5px] border-t-clay-600 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-[6px] bg-clay-100 text-clay-800 border border-clay-300 flex items-center justify-center shrink-0 shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-amber-50 text-clay-800 text-[10px] font-bold border border-amber-200">
              <Compass className="w-3 h-3 text-clay-600" />
              {stats.activeItineraries} đang chạy
            </span>
          </div>
          <div>
            <span className="text-xs text-clay-900/70 font-bold uppercase tracking-wider block">Lịch trình du lịch</span>
            <div className="mt-1">
              <h2 className="font-display font-black text-2xl sm:text-3xl text-ink-900 tracking-tight">{stats.totalItineraries.toLocaleString('vi-VN')}</h2>
            </div>
            <p className="text-[11px] text-ink-500 mt-2 flex items-center gap-1.5 pt-2 border-t border-amber-100">
              <MapPin className="w-3.5 h-3.5 text-clay-600 shrink-0" />
              <span className="font-semibold text-clay-800">{stats.totalPlaces}</span>
              <span>địa điểm tham quan</span>
            </p>
          </div>
        </div>

        {/* KPI 4: Moderation & Quality Rating (SẮC ĐỎ CẢNH BÁO / ROSE HOẶC TEAL AN TOÀN) */}
        {(() => {
          const pendingCount = stats.pendingReports ?? pendingReports.length;
          const totalCount = stats.totalReports ?? Math.max(pendingCount, 0);
          const isWarning = pendingCount > 0;
          return (
            <div className={`bg-white p-5 rounded-[8px] border shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 ${
              isWarning 
                ? 'border-rose-300 border-t-[3.5px] border-t-rose-600' 
                : 'border-teal-200 border-t-[3.5px] border-t-teal-600'
            }`}>
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-[6px] flex items-center justify-center shrink-0 border shadow-xs ${
                  isWarning ? 'bg-rose-100 text-rose-700 border-rose-300' : 'bg-teal-50 text-teal-700 border-teal-200'
                }`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] text-[10px] font-bold border ${
                  isWarning 
                    ? 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse' 
                    : 'bg-teal-50 text-teal-800 border-teal-200'
                }`}>
                  {isWarning ? `${pendingCount} chờ xử lý` : 'An toàn'}
                </span>
              </div>
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider block ${isWarning ? 'text-rose-900/80' : 'text-teal-900/80'}`}>
                  Kiểm duyệt nội dung
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight flex items-baseline gap-1.5">
                    <span className={isWarning ? 'text-rose-600' : 'text-ink-900'}>{pendingCount}</span>
                    <span className="text-sm font-semibold text-ink-400">/ {totalCount}</span>
                  </h2>
                </div>
                <p className="text-[11px] text-ink-500 mt-2 flex items-center justify-between pt-2 border-t border-ink-100">
                  <span>{totalCount > 0 ? `${totalCount} báo cáo tổng số` : 'Không có vi phạm'}</span>
                  <button 
                    onClick={() => setAdminTab('reports')}
                    className="text-rose-700 hover:text-rose-900 font-bold hover:underline cursor-pointer"
                  >
                    Xem báo cáo →
                  </button>
                </p>
              </div>
            </div>
          );
        })()}

      </div>

      {/* ─── ROW 2: REAL CHARTS & INTELLIGENCE WIDGETS ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: REAL DATA CHARTS & TOP TRENDS (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Dynamic Growth Chart */}
          <div className="bg-white p-5 sm:p-6 rounded-[8px] border border-ink-200/90 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ink-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[6px] bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0 shadow-xs">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-black text-lg text-ink-900 tracking-tight">
                    Tăng trưởng 6 tháng gần nhất
                  </h3>
                  <p className="text-xs text-ink-500 mt-0.5">Số lượng người dùng và bài viết mới theo từng tháng</p>
                </div>
              </div>

              {/* Metric Toggle Tabs */}
              <div className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-start p-1 bg-[#F4EFE6] rounded-[6px] border border-ink-200/80 shrink-0 text-xs">
                <button
                  type="button"
                  onClick={() => setChartMetric('users')}
                  className={`flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[5px] font-bold text-xs whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    chartMetric === 'users'
                      ? 'bg-white text-indigo-950 border border-indigo-200 shadow-xs font-black'
                      : 'text-ink-600 hover:text-ink-900 hover:bg-white/60 border border-transparent'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Người dùng</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric('posts')}
                  className={`flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[5px] font-bold text-xs whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    chartMetric === 'posts'
                      ? 'bg-white text-emerald-950 border border-emerald-200 shadow-xs font-black'
                      : 'text-ink-600 hover:text-ink-900 hover:bg-white/60 border border-transparent'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Bài viết</span>
                </button>
              </div>
            </div>

            {/* Dynamic Interactive Bar & Gradient Chart Container */}
            <div className="pt-2">
              <div className="h-52 w-full flex items-end justify-between gap-2 sm:gap-6 px-2 sm:px-4 border-b border-ink-200/80 pb-2">
                {growthData.map((item, idx) => {
                  const count = Number(item.count) || 0;
                  const percent = Math.min(100, Math.max(12, Math.round((count / maxChartValue) * 100)));
                  const isLatest = idx === growthData.length - 1;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                      {/* Floating Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-ink-900 text-white px-2.5 py-1 rounded-[4px] text-[10px] font-bold whitespace-nowrap pointer-events-none z-10 shadow-md">
                        {count.toLocaleString('vi-VN')} {chartMetric === 'users' ? 'thành viên' : 'bài viết'}
                      </div>

                      {/* Bar Value Header */}
                      <span className={`text-[11px] font-bold mb-1 transition-colors ${
                        isLatest ? 'text-clay-700 font-black' : 'text-ink-400 group-hover:text-ink-800'
                      }`}>
                        {count}
                      </span>

                      {/* Bar Column Graphic */}
                      <div className="w-full max-w-[48px] bg-[#F4EFE6] rounded-t-[4px] border-t border-x border-ink-200/80 overflow-hidden flex flex-col justify-end h-full shadow-inner">
                        <div 
                          className={`w-full rounded-t-[4px] transition-all duration-500 ease-out ${
                            isLatest 
                              ? 'bg-gradient-to-t from-clay-700 via-clay-600 to-clay-500 group-hover:brightness-110 shadow-sm' 
                              : 'bg-gradient-to-t from-slate-400 to-slate-300 group-hover:from-clay-400 group-hover:to-clay-300'
                          }`}
                          style={{ height: `${percent}%` }}
                        ></div>
                      </div>

                      {/* Month Label */}
                      <span className="text-[11px] text-ink-600 font-bold mt-2.5 block text-center truncate w-full">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Chart Footer Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mt-4 pt-1">
                <div className="p-3 bg-[#FAF7F0] rounded-[6px] border border-ink-200/80 text-center shadow-xs">
                  <span className="text-[11px] text-ink-500 block font-semibold uppercase tracking-wider">Tổng 6 tháng</span>
                  <span className="text-base font-display font-black text-ink-900 mt-0.5 block">
                    {growthData.reduce((acc, cur) => acc + (Number(cur.count) || 0), 0).toLocaleString('vi-VN')}
                  </span>
                </div>
                <div className="p-3 bg-amber-50/70 rounded-[6px] border border-amber-200/80 text-center shadow-xs">
                  <span className="text-[11px] text-amber-900/80 block font-semibold uppercase tracking-wider">Cao điểm nhất</span>
                  <span className="text-base font-display font-black text-amber-900 mt-0.5 block">
                    {Math.max(...growthData.map(d => Number(d.count) || 0)).toLocaleString('vi-VN')}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50/70 rounded-[6px] border border-emerald-200/80 text-center shadow-xs">
                  <span className="text-[11px] text-emerald-900/80 block font-semibold uppercase tracking-wider">Tháng này</span>
                  <span className="text-base font-display font-black text-emerald-800 mt-0.5 block">
                    +{growthData[growthData.length - 1]?.count || 0} mới
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Trends & Places */}
          <div className="bg-white p-5 sm:p-6 rounded-[8px] border border-ink-200/90 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ink-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[6px] bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0 shadow-xs">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-black text-lg text-ink-900 tracking-tight">
                    Điểm đến & Địa danh nổi bật
                  </h3>
                  <p className="text-xs text-ink-500 mt-0.5">Xếp hạng theo lượt tạo lịch trình và đánh giá thực tế</p>
                </div>
              </div>

              {/* Subtabs for Trends */}
              <div className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-start p-1 bg-[#F4EFE6] rounded-[6px] border border-ink-200/80 shrink-0 text-xs">
                <button
                  type="button"
                  onClick={() => setTopTab('destinations')}
                  className={`flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[5px] font-bold text-xs whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    topTab === 'destinations'
                      ? 'bg-white text-clay-800 border border-clay-300 shadow-xs font-black'
                      : 'text-ink-600 hover:text-ink-900 hover:bg-white/60 border border-transparent'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-clay-600" />
                  <span>Điểm đến ({stats.topDestinations?.length || 0})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTopTab('places')}
                  className={`flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[5px] font-bold text-xs whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    topTab === 'places'
                      ? 'bg-white text-amber-800 border border-amber-300 shadow-xs font-black'
                      : 'text-ink-600 hover:text-ink-900 hover:bg-white/60 border border-transparent'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 text-amber-500" />
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
                      <div key={idx} className="p-3.5 rounded-[6px] bg-[#FAF7F0] border border-ink-200/70 hover:bg-white hover:border-clay-300 transition-all shadow-xs">
                        <div className="flex items-center justify-between font-bold text-xs text-ink-900 mb-1.5">
                          <span className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-[4px] flex items-center justify-center text-[10px] font-black border shadow-xs ${
                              idx === 0 ? 'bg-amber-100 text-amber-900 border-amber-400' :
                              idx === 1 ? 'bg-slate-100 text-slate-800 border-slate-300' :
                              idx === 2 ? 'bg-clay-100 text-clay-900 border-clay-300' : 'bg-white text-ink-700 border-ink-200'
                            }`}>
                              #{idx + 1}
                            </span>
                            <span className="font-display font-bold text-ink-900">{dest.destination || 'Không xác định'}</span>
                          </span>
                          <span className="text-clay-700 font-black">{dest.count} chuyến đi</span>
                        </div>
                        <div className="w-full bg-ink-200/50 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              idx === 0 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                              idx === 1 ? 'bg-gradient-to-r from-slate-500 to-slate-600' :
                              'bg-gradient-to-r from-clay-500 to-clay-600'
                            }`} 
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
                  <div className="col-span-2 p-8 text-center text-ink-400 text-xs">
                    Chưa có đánh giá địa danh.
                  </div>
                ) : (
                  stats.topPlaces.map((place, idx) => (
                    <div key={idx} className="p-3.5 rounded-[6px] bg-[#FAF7F0] border border-ink-200/70 flex items-center justify-between gap-3 hover:bg-white hover:border-amber-300 transition-all shadow-xs">
                      <div className="min-w-0">
                        <div className="font-display font-bold text-xs text-ink-900 truncate">{place.name}</div>
                        <div className="text-[11px] text-ink-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-clay-600 shrink-0" />
                          <span className="truncate">{place.city || 'Việt Nam'}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-white text-ink-900 font-black text-xs border border-ink-200/90 shadow-xs">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{Number(place.rating || 0).toFixed(1)}</span>
                        </div>
                        <span className="block text-[10px] text-ink-500 font-semibold mt-0.5">{place.reviewCount || 0} đánh giá</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: ACTION REQUIRED & RECENT AUDIT LOGS (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Action Required: Pending Moderation Reports (ĐỈNH ĐỎ CẢNH BÁO NỔI BẬT) */}
          <div className="bg-white p-5 sm:p-6 rounded-[8px] border border-rose-200 border-t-[3.5px] border-t-rose-600 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[6px] bg-rose-100 text-rose-700 border border-rose-300 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="font-display font-black text-base text-rose-950">
                  Cần kiểm duyệt
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-[4px] font-bold text-xs border ${
                (stats.pendingReports > 0 || pendingReports.length > 0) ? 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                {(stats.pendingReports ?? pendingReports.length) > 0 ? `${stats.pendingReports ?? pendingReports.length} chờ xử lý` : 'Bình thường'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {pendingReports.length === 0 ? (
                <div className="p-5 rounded-[6px] bg-emerald-50/70 border border-emerald-200 text-emerald-800 text-center font-semibold space-y-1">
                  <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
                  <div className="font-bold text-emerald-900">Hệ thống an toàn</div>
                  <p className="text-[11px] text-emerald-700 font-normal">Không có báo cáo vi phạm chờ duyệt.</p>
                </div>
              ) : (
                pendingReports.slice(0, 3).map((r) => (
                  <div key={r.id} className="p-3.5 rounded-[6px] bg-rose-50/60 border border-rose-200 hover:border-rose-300 transition-colors space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between text-rose-800 font-bold">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Flag className="w-3.5 h-3.5 text-rose-600" /> {r.category || 'Vi phạm'}
                      </span>
                      <span className="text-[10px] text-ink-400 font-normal">{r.timeAgo || 'Gần đây'}</span>
                    </div>
                    <h4 className="font-display font-bold text-ink-900 line-clamp-1">{r.title || 'Bài viết báo cáo'}</h4>
                    <p className="text-[11px] text-ink-600 line-clamp-1">
                      {r.aiFlagReason || r.reportReason || r.snippet || 'Dấu hiệu vi phạm tiêu chuẩn cộng đồng.'}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-ink-500 truncate max-w-[130px] font-medium">{r.authorName || 'Ẩn danh'}</span>
                      <button
                        onClick={() => setAdminTab('reports')}
                        className="px-3 py-1 rounded-[4px] bg-rose-700 hover:bg-rose-800 text-white font-bold text-[10px] shadow-xs transition-colors cursor-pointer"
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
              className="w-full pt-1 text-center text-rose-700 hover:text-rose-900 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <span>Xem tất cả báo cáo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Recent Audit Logs Feed (ĐỈNH XANH TRỜI ĐỊNH DANH NHẬT KÝ) */}
          <div className="bg-white p-5 sm:p-6 rounded-[8px] border border-sky-200 border-t-[3.5px] border-t-sky-600 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[6px] bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center shrink-0">
                  <History className="w-4 h-4" />
                </div>
                <div className="font-display font-black text-base text-sky-950">
                  Nhật ký hoạt động
                </div>
              </div>
              <button 
                onClick={() => setAdminTab('audit-logs')}
                className="text-[11px] text-sky-700 hover:text-sky-900 font-bold hover:underline cursor-pointer"
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
                    <div key={logItem.id} className="p-2.5 rounded-[6px] bg-[#FAF7F0] border border-ink-200/70 text-xs space-y-1 hover:bg-white hover:border-sky-300 transition-all shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className={`px-1.5 py-0.5 rounded-[3px] font-mono text-[9px] font-bold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="text-[10px] text-ink-500 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-ink-400" />
                          {logItem.createdAt ? new Date(logItem.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'}
                        </span>
                      </div>
                      <div className="font-bold text-ink-900 line-clamp-1 text-[11px]">
                        {logItem.actorName || logItem.actorEmail || 'Hệ thống'}
                      </div>
                      <p className="text-[10px] text-ink-500 line-clamp-1">
                        {logItem.details || logItem.targetResource || 'Thực hiện thao tác trong hệ thống'}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => setAdminTab('audit-logs')}
              className="w-full pt-1 text-center text-sky-700 hover:text-sky-900 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <span>Xem tất cả nhật ký</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* ─── ROW 3: CENTRAL DATA TABLE (PHÂN TÁCH RÕ RÀNG VỚI SEGMENTED PILL TABS) ─── */}
      <div className="bg-white p-5 sm:p-6 rounded-[8px] border border-ink-200/90 shadow-sm space-y-5">
        
        {/* Table Header & Functional Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-ink-200">
          {/* Segmented Pill Tabs */}
          <div className="inline-flex items-center p-1 bg-[#F4EFE6] rounded-[6px] border border-ink-200/90 shrink-0">
            <button
              onClick={() => setActiveTableTab('itineraries')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-[5px] font-display font-black text-xs transition-all cursor-pointer ${
                activeTableTab === 'itineraries' 
                  ? 'bg-clay-700 text-white shadow-xs' 
                  : 'text-ink-600 hover:text-ink-900 hover:bg-white/50'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Lịch trình ({filteredItineraries.length})</span>
            </button>
            <button
              onClick={() => setActiveTableTab('users')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-[5px] font-display font-black text-xs transition-all cursor-pointer ${
                activeTableTab === 'users' 
                  ? 'bg-clay-700 text-white shadow-xs' 
                  : 'text-ink-600 hover:text-ink-900 hover:bg-white/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Thành viên ({filteredUsers.length})</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                placeholder={activeTableTab === 'itineraries' ? "Tìm theo tên, điểm đến, tác giả..." : "Tìm tên, email thành viên..."}
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-[#FAF7F0] border border-ink-200 rounded-[5px] text-xs text-ink-900 placeholder:text-ink-400 outline-none focus:border-clay-600 focus:bg-white w-full transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Filter Dropdown */}
              <select
                value={tableStatusFilter}
                onChange={(e) => setTableStatusFilter(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-1.5 bg-[#FAF7F0] border border-ink-200 rounded-[5px] text-xs font-bold text-ink-800 outline-none cursor-pointer hover:bg-white transition-colors"
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
                className="p-2 rounded-[5px] bg-[#FAF7F0] border border-ink-200 text-ink-700 hover:text-clay-700 hover:bg-white transition-colors cursor-pointer disabled:opacity-50 shrink-0 shadow-xs" 
                title="Làm mới bảng"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-clay-600' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Data Table Container */}
        <div className="overflow-x-auto rounded-[6px] border border-ink-200 shadow-xs">
          {activeTableTab === 'itineraries' ? (
            /* ITINERARIES TABLE */
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4EFE6] text-ink-800 font-display font-black border-b-2 border-ink-300 uppercase text-[11px] tracking-wider">
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
                    <tr key={row.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-clay-700">#{row.id}</td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-display font-bold text-ink-900 truncate">{row.title}</div>
                        <span className="text-ink-500 text-[11px] flex items-center gap-1 mt-0.5">
                          {row.isAiGenerated ? (
                            <span className="text-clay-600 font-bold flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" /> WanderAI
                            </span>
                          ) : (
                            'Tự tạo'
                          )}
                          <span>• {getItineraryDuration(row).shortLabel}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {row.creatorAvatar ? (
                            <img 
                              src={row.creatorAvatar} 
                              alt="" 
                              crossOrigin="anonymous" 
                              referrerPolicy="no-referrer" 
                              className="w-6 h-6 rounded-full object-cover shrink-0 border border-ink-200" 
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-clay-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                              {row.creatorName ? row.creatorName.charAt(0) : 'U'}
                            </div>
                          )}
                          <span className="font-bold text-ink-900 truncate max-w-[130px]">{row.creatorName || 'Người dùng'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-ink-900 font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-clay-600 shrink-0" />
                          <span className="truncate">{row.destination || 'Chưa cập nhật'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-black text-ink-900">
                        {row.budgetTotal ? Number(row.budgetTotal).toLocaleString('vi-VN') + ' đ' : 'Chưa nhập'}
                      </td>

                      <td className="py-3.5 px-4">
                        {(() => {
                          const st = getItineraryTimelineStatus(row);
                          return (
                            <div className="space-y-0.5">
                              <span 
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold border ${st.badgeClass}`} 
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                {st.label}
                              </span>
                              {row.startDate && (
                                <div className="text-[10px] text-ink-500 font-mono flex items-center gap-1 font-medium">
                                  <Calendar className="w-2.5 h-2.5 text-ink-400 shrink-0" />
                                  <span>{row.startDate}</span>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => setSelectedItinerary(row)}
                            className="p-1.5 hover:text-clay-800 hover:bg-clay-100 rounded-[4px] transition-colors cursor-pointer text-ink-500" 
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
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4EFE6] text-ink-800 font-display font-black border-b-2 border-ink-300 uppercase text-[11px] tracking-wider">
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
                    <tr key={user.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-clay-700">#{user.id}</td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt="" 
                              crossOrigin="anonymous" 
                              referrerPolicy="no-referrer" 
                              className="w-7 h-7 rounded-full object-cover shrink-0 border border-ink-200" 
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-ink-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                              {(user.name || user.fullName || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-bold text-ink-900">{user.name || user.fullName || 'Thành viên'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-ink-600 font-mono text-[11px]">{user.email}</td>

                      <td className="py-3.5 px-4">
                        {(() => {
                          const isAdmin = (user.roles && user.roles.includes('ROLE_ADMIN')) || user.role === 'ROLE_ADMIN' || user.role === 'ADMIN';
                          const isMod = (user.roles && user.roles.includes('ROLE_MODERATOR')) || user.role === 'ROLE_MODERATOR';
                          if (isAdmin) {
                            return (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-[4px] text-[10px] font-black border bg-amber-50 text-amber-900 border-amber-300">
                                ADMIN
                              </span>
                            );
                          }
                          if (isMod) {
                            return (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-[4px] text-[10px] font-black border bg-clay-50 text-clay-800 border-clay-300">
                                MODERATOR
                              </span>
                            );
                          }
                          return (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold border bg-[#FAF7F0] text-ink-700 border-ink-200">
                              USER
                            </span>
                          );
                        })()}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold border ${
                          user.isBlocked
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {user.isBlocked ? 'Đã khóa' : 'Hoạt động'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-ink-500 font-medium text-[11px]">
                        {user.createdAt ? formatVietnamDateOnly(user.createdAt, 'Mới tham gia') : 'Mới tham gia'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setAdminTab('users')}
                          className="px-3 py-1 rounded-[5px] bg-[#FAF7F0] hover:bg-clay-100 text-ink-800 hover:text-clay-800 font-bold text-[11px] border border-ink-200 transition-colors cursor-pointer shadow-xs"
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-ink-500 font-medium">
            <span className="text-center sm:text-left">
              Hiển thị <strong className="text-ink-900">{(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, currentRecords.length)}</strong> trong số <strong className="text-ink-900">{currentRecords.length}</strong> kết quả
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-[5px] border border-ink-200 bg-white hover:bg-clay-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-ink-700 shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 rounded-[5px] bg-clay-700 text-white font-mono font-bold text-xs shadow-xs">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-[5px] border border-ink-200 bg-white hover:bg-clay-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-ink-700 shadow-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ─── QUICK VIEW ITINERARY MODAL ────────────────────────────────────── */}
      {selectedItinerary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white rounded-[8px] max-w-lg w-full p-6 border border-ink-200 shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-2 border-b border-ink-100">
              <div>
                <span className="text-[11px] font-mono font-bold text-clay-700 uppercase tracking-wider block">
                  #ITN-{selectedItinerary.id}
                </span>
                <h3 className="font-display font-black text-xl text-ink-900 mt-0.5">
                  {selectedItinerary.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItinerary(null)}
                className="p-1.5 rounded-[5px] hover:bg-[#FAF7F0] text-ink-400 hover:text-ink-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 py-2 text-xs divide-y divide-ink-100">
              <div className="flex justify-between py-1.5">
                <span className="text-ink-500 font-medium">Điểm đến:</span>
                <strong className="text-ink-900 font-bold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-clay-600" />
                  {selectedItinerary.destination || 'Chưa cập nhật'}
                </strong>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-ink-500 font-medium">Tác giả:</span>
                <strong className="text-ink-900 font-bold">{selectedItinerary.creatorName || selectedItinerary.userFullName || 'Người dùng'}</strong>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-ink-500 font-medium">Thời lượng:</span>
                <strong className="text-ink-900 font-bold">{getItineraryDuration(selectedItinerary).label}</strong>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-ink-500 font-medium">Khởi hành:</span>
                <span className="font-mono font-bold text-ink-900 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-clay-600" />
                  {selectedItinerary.startDate ? `${selectedItinerary.startDate} ${selectedItinerary.endDate ? '➜ ' + selectedItinerary.endDate : ''}` : 'Chưa định ngày cụ thể'}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-ink-500 font-medium">Ngân sách dự kiến:</span>
                <strong className="text-clay-700 font-display font-black text-sm">
                  {selectedItinerary.budgetTotal ? Number(selectedItinerary.budgetTotal).toLocaleString('vi-VN') + ' đ' : 'Chưa nhập'}
                </strong>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-ink-500 font-medium">Hình thức tạo:</span>
                <span className={`px-2 py-0.5 rounded-[4px] font-bold text-[10px] border ${
                  selectedItinerary.isAiGenerated ? 'bg-amber-50 text-amber-900 border-amber-300' : 'bg-[#FAF7F0] text-ink-700 border-ink-200'
                }`}>
                  {selectedItinerary.isAiGenerated ? 'WanderAI' : 'Tự tạo'}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-ink-500 font-medium">Trạng thái:</span>
                <span className={`px-2 py-0.5 rounded-[4px] font-bold text-[10px] border ${
                  (selectedItinerary.status || 'ACTIVE') === 'ACTIVE' 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-zinc-100 text-zinc-700 border-zinc-300'
                }`}>
                  {selectedItinerary.status || 'ACTIVE'}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-ink-500 font-medium">Tiến độ:</span>
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

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-ink-100">
              <a
                href={`/itinerary/${selectedItinerary.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-[5px] bg-[#FAF7F0] hover:bg-clay-50 text-ink-800 hover:text-clay-800 font-bold text-xs border border-ink-200 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                title="Mở xem trang chi tiết"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Xem trên web</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedItinerary(null)}
                  className="px-4 py-2 rounded-[5px] bg-[#FAF7F0] hover:bg-ink-100 text-ink-700 font-bold text-xs border border-ink-200 transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  onClick={() => handleExportSingleItinerary(selectedItinerary)}
                  className="px-4 py-2 rounded-[5px] bg-clay-700 hover:bg-clay-800 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
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
