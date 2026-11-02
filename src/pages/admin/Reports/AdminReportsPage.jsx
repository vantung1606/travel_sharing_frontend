import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../../components/common/Toast';
import { adminReportApi, auditLogApi, reportApi } from '../../../services/api';
import { 
  AlertTriangle, Flame, ShieldAlert, Search, Filter, Download, CheckCircle2, 
  Eye, EyeOff, UserX, Trash2, RefreshCw, TrendingUp, FileText, ShieldCheck, 
  Bot, History, X, MapPin, Sparkles, ExternalLink, ChevronLeft, ChevronRight,
  Shield, Globe, Laptop, Clock, ArrowRight, Flag, Image as ImageIcon
} from 'lucide-react';

// Helper to sanitize media image URLs and prevent Mixed Content on production HTTPS
const getSafeImageUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';
  if (url.startsWith('http://localhost:8081') || url.startsWith('http://localhost:')) {
    const backendHost = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '');
    if (backendHost && !backendHost.includes('localhost')) {
      return url.replace(/^http:\/\/localhost(:\d+)?/, backendHost);
    }
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';
  }
  return url;
};

export const AdminReportsPage = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'all' | 'hidden' | 'audit'
  const [pendingSubFilter, setPendingSubFilter] = useState('all'); // 'all' | 'ai_pending' | 'user_reported'
  const [searchQuery, setSearchQuery] = useState('');

  // Real Database States
  const [reports, setReports] = useState([]);
  const [articles, setArticles] = useState([]);
  const [metrics, setMetrics] = useState({
    totalPostsToday: 0,
    pendingReportsCount: 0,
    hiddenPostsCount: 0,
    safeRate: 98.4,
    growthPercent: 12,
    totalArticlesCount: 0
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPostModal, setSelectedPostModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  // Real Audit Logs States
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditFilterAction, setAuditFilterAction] = useState('ALL');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [auditPage, setAuditPage] = useState(0);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [auditTotalElements, setAuditTotalElements] = useState(0);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditStats, setAuditStats] = useState({ totalLogs: 0, logsToday: 0, securityCount: 0 });

  // System Reports (Place, User, Review) States (Batch 1 #74, #75, #76)
  const [systemReports, setSystemReports] = useState([]);
  const [systemReportStatusFilter, setSystemReportStatusFilter] = useState('ALL');
  const [systemReportTypeFilter, setSystemReportTypeFilter] = useState('ALL');
  const [systemReportLoading, setSystemReportLoading] = useState(false);
  const [selectedEvidenceImage, setSelectedEvidenceImage] = useState(null);

  const fetchSystemReports = async (status = systemReportStatusFilter, type = systemReportTypeFilter) => {
    setSystemReportLoading(true);
    try {
      const data = await reportApi.getAdminReports(status, type);
      setSystemReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load reports:', err);
      toast.error('Không thể tải danh sách báo cáo vi phạm');
    } finally {
      setSystemReportLoading(false);
    }
  };

  const handleResolveSystemReport = async (id, action, notes = '') => {
    try {
      await reportApi.resolveReport(id, action, notes);
      toast.success(`Đã cập nhật trạng thái báo cáo #${id} (${action})!`);
      await fetchSystemReports();
    } catch (err) {
      toast.error('Lỗi khi cập nhật trạng thái báo cáo: ' + err.message);
    }
  };

  // Fetch Audit Logs with Filtering & Pagination
  const fetchAuditLogs = async (pageNum = 0, query = auditSearchQuery, actionFilter = auditFilterAction) => {
    setAuditLoading(true);
    try {
      const act = actionFilter === 'ALL' ? '' : actionFilter;
      const res = await auditLogApi.getLogs({
        keyword: query,
        action: act,
        category: actionFilter === 'ALL' ? 'SECURITY' : '',
        page: pageNum,
        size: 15
      });

      if (res && Array.isArray(res.content)) {
        if (res.content.length === 0 && actionFilter === 'ALL' && !query) {
          // Fallback to fetch without category constraint if empty
          const fallback = await auditLogApi.getLogs({ page: pageNum, size: 15 });
          if (fallback && Array.isArray(fallback.content)) {
            setAuditLogs(fallback.content);
            setAuditTotalPages(fallback.totalPages || 1);
            setAuditTotalElements(fallback.totalElements || 0);
          } else {
            setAuditLogs([]);
            setAuditTotalPages(1);
            setAuditTotalElements(0);
          }
        } else {
          setAuditLogs(res.content);
          setAuditTotalPages(res.totalPages || 1);
          setAuditTotalElements(res.totalElements || 0);
        }
      } else {
        setAuditLogs([]);
        setAuditTotalPages(1);
        setAuditTotalElements(0);
      }
      setAuditPage(pageNum);

      // Load stats
      const stats = await auditLogApi.getStats().catch(() => null);
      if (stats) {
        setAuditStats({
          totalLogs: stats.totalLogs || 0,
          logsToday: stats.logsToday || 0,
          securityCount: stats.securityCount || 0
        });
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  // Load Real Data from Backend
  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const targetStatus = activeTab === 'pending' ? 'all' : activeTab;
      const [metricsData, pendingReportsData, allArticlesData] = await Promise.all([
        adminReportApi.getMetrics(),
        adminReportApi.getPendingReports(searchQuery),
        adminReportApi.getAllArticles({ keyword: searchQuery, status: targetStatus })
      ]);

      setMetrics(metricsData);
      setReports(pendingReportsData);
      setArticles(allArticlesData);

      if (activeTab === 'audit') {
        await fetchAuditLogs(auditPage);
      }

      if (isManual) {
        toast.success('Đã đồng bộ dữ liệu bài viết & báo cáo thời gian thực!');
      }
    } catch (err) {
      console.error('Failed to load reports data:', err);
      toast.error('Không thể kết nối máy chủ kiểm duyệt bài viết');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs(0);
    } else if (activeTab === 'system_reports') {
      fetchSystemReports(systemReportStatusFilter, systemReportTypeFilter);
    } else {
      loadData();
    }
  }, [activeTab, auditFilterAction, systemReportStatusFilter, systemReportTypeFilter]);

  // Actions on Reported Posts
  const handleApprovePost = async (id, title = '') => {
    try {
      setReports(prev => prev.filter(r => r.id !== id));
      await adminReportApi.approvePost(id);
      await loadData();
      toast.success(`Đã phê duyệt xuất bản bài viết #${id} thành công! Hệ thống đã gửi thông báo đến tác giả.`);
      if (selectedPostModal && selectedPostModal.id === id) {
        setSelectedPostModal(null);
      }
    } catch (err) {
      toast.error('Lỗi khi phê duyệt bài viết: ' + err.message);
      await loadData();
    }
  };

  const handleDismissReport = async (id, title = '') => {
    try {
      setReports(prev => prev.filter(r => r.id !== id));
      await adminReportApi.dismissReport(id);
      await loadData();
      toast.info(`Đã bác bỏ báo cáo bài viết #${id} (Nội dung hợp lệ). Hệ thống đã gửi thông báo xác nhận đến tác giả.`);
      if (selectedPostModal && selectedPostModal.id === id) {
        setSelectedPostModal(null);
      }
    } catch (err) {
      toast.error('Lỗi khi bác bỏ báo cáo: ' + err.message);
      await loadData();
    }
  };

  const executeHidePost = async (id, title = '') => {
    try {
      setReports(prev => prev.filter(r => r.id !== id));
      await adminReportApi.hidePost(id);
      await loadData();
      toast.warning(`Đã tạm ẩn bài viết #${id} khỏi cộng đồng! Hệ thống đã gửi thông báo cảnh báo đến tác giả.`);
      if (selectedPostModal && selectedPostModal.id === id) {
        setSelectedPostModal(null);
      }
      setConfirmModal(null);
    } catch (err) {
      toast.error('Lỗi khi tạm ẩn bài viết: ' + err.message);
      await loadData();
    }
  };

  const executeUnhidePost = async (id, title = '') => {
    try {
      await adminReportApi.unhidePost(id);
      await loadData();
      toast.success(`Đã chuyển bài viết #${id} quay trở lại hàng đợi chờ duyệt thành công!`);
      if (selectedPostModal && selectedPostModal.id === id) {
        setSelectedPostModal(null);
      }
      setConfirmModal(null);
      setActiveTab('pending');
    } catch (err) {
      toast.error('Lỗi khi chuyển bài viết về chờ duyệt: ' + err.message);
    }
  };

  const executeBanUser = async (id, authorName, title = '') => {
    try {
      await adminReportApi.removePostAndBanAuthor(id);
      await loadData();
      toast.error(`Đã gỡ bài #${id}, khóa tài khoản ${authorName} và gửi thông báo cảnh cáo chính thức.`);
      if (selectedPostModal && selectedPostModal.id === id) {
        setSelectedPostModal(null);
      }
      setConfirmModal(null);
    } catch (err) {
      toast.error('Lỗi khi gỡ bài và khóa tài khoản: ' + err.message);
    }
  };

  const executeDeletePost = async (id, title = '') => {
    try {
      await adminReportApi.deletePost(id);
      setArticles(prev => prev.filter(a => a.id !== id));
      setReports(prev => prev.filter(r => r.id !== id));
      toast.success(`Đã xóa vĩnh viễn bài viết #${id} và gửi thông báo đến tác giả.`);
      if (selectedPostModal && selectedPostModal.id === id) {
        setSelectedPostModal(null);
      }
      setConfirmModal(null);
    } catch (err) {
      toast.error('Không thể xóa bài viết: ' + err.message);
    }
  };

  // Formatters & Helpers for Moderation Audit Logs
  const getAuditActionStyle = (action) => {
    const act = (action || '').toUpperCase();
    if (act.includes('APPROVE')) {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        badge: 'bg-emerald-600',
        icon: CheckCircle2,
        label: 'Phê duyệt xuất bản'
      };
    }
    if (act.includes('DISMISS')) {
      return {
        bg: 'bg-clay-50 text-clay-800 border-clay-200',
        badge: 'bg-clay-600',
        icon: ShieldCheck,
        label: 'Bác bỏ báo cáo'
      };
    }
    if (act.includes('UNHIDE')) {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        badge: 'bg-emerald-600',
        icon: RefreshCw,
        label: 'Bỏ ẩn bài viết'
      };
    }
    if (act.includes('HIDE')) {
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        badge: 'bg-amber-600',
        icon: EyeOff,
        label: 'Tạm ẩn bài viết'
      };
    }
    if (act.includes('BAN') || act.includes('LOCK')) {
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        badge: 'bg-rose-600',
        icon: UserX,
        label: 'Gỡ bài & Khóa TK'
      };
    }
    if (act.includes('DELETE')) {
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        badge: 'bg-rose-600',
        icon: Trash2,
        label: 'Xóa vĩnh viễn'
      };
    }
    if (act.includes('REPORT')) {
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        badge: 'bg-amber-600',
        icon: AlertTriangle,
        label: 'Báo cáo vi phạm'
      };
    }
    if (act.includes('FLAG') || act.includes('AI')) {
      return {
        bg: 'bg-clay-50 text-clay-800 border-clay-200',
        badge: 'bg-clay-600',
        icon: Bot,
        label: 'AI gắn cờ'
      };
    }
    return {
      bg: 'bg-[#F8F4EC] text-ink-700 border-ink-200/80',
      badge: 'bg-ink-600',
      icon: History,
      label: action || 'Thao tác hệ thống'
    };
  };

  const formatAuditTime = (dateStr) => {
    if (!dateStr) return 'Vừa xong';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' - ' + d.toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  const formatAuditRelative = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const diff = Math.floor((Date.now() - d.getTime()) / 1000);
      if (diff < 60) return 'Vừa xong';
      if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
      if (diff < 86400 * 2) return 'Hôm qua';
      return `${Math.floor(diff / 86400)} ngày trước`;
    } catch {
      return '';
    }
  };

  const parseClientDevice = (userAgent) => {
    if (!userAgent) return 'Web Client';
    const ua = userAgent.toLowerCase();
    if (ua.includes('console')) return 'Admin Console';
    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('android') || ua.includes('mobile')) return 'Mobile App';
    return 'Web Browser';
  };

  // Export CSV
  const handleExportCSV = () => {
    if (activeTab === 'audit') {
      if (auditLogs.length === 0) {
        toast.info('Không có dữ liệu nhật ký kiểm duyệt để xuất file');
        return;
      }
      const headers = ['Mã ID', 'Người Thực Hiện', 'Email', 'Vai Trò', 'Hành Động', 'Chi Tiết Thao Tác', 'Địa Chỉ IP', 'Thiết Bị', 'Thời Gian'];
      const rows = auditLogs.map(l => [
        l.id,
        `"${(l.userName || '').replace(/"/g, '""')}"`,
        `"${(l.userEmail || '').replace(/"/g, '""')}"`,
        `"${l.userRole || 'ADMIN'}"`,
        `"${l.action || ''}"`,
        `"${(l.details || '').replace(/"/g, '""')}"`,
        `"${l.ipAddress || ''}"`,
        `"${(l.userAgent || '').replace(/"/g, '""')}"`,
        l.createdAt || ''
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `wayfare_moderation_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Đã xuất toàn bộ nhật ký kiểm duyệt ra file CSV thành công! 📊');
      return;
    }

    const listToExport = activeTab === 'pending' ? reports : articles;
    if (listToExport.length === 0) {
      toast.info('Không có dữ liệu bài viết để xuất file');
      return;
    }

    const headers = ['ID', 'Tieu De', 'Tac Gia', 'Chuyen Muc', 'AI Safety Score', 'Luot Bao Cao', 'Trang Thai', 'Ngay Tao'];
    const rows = listToExport.map(p => [
      p.id,
      `"${(p.title || '').replace(/"/g, '""')}"`,
      `"${p.authorName || ''}"`,
      `"${p.category || ''}"`,
      p.aiSafetyScore || 98,
      p.reportsCount || 0,
      p.status || 'ACTIVE',
      p.createdAt || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `wayfare_reports_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Đã xuất báo cáo kiểm duyệt ra file CSV thành công! 📊');
  };

  // Filtered lists based on search
  const filteredReports = reports.filter(r => {
    const isAi = r.flagSource ? (r.flagSource === 'AI') : (r.isAiPending != null ? r.isAiPending : (r.status === 'PENDING_REVIEW'));
    if (pendingSubFilter === 'ai_pending' && !isAi) return false;
    if (pendingSubFilter === 'user_reported' && isAi) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.title && r.title.toLowerCase().includes(q)) ||
      (r.authorName && r.authorName.toLowerCase().includes(q)) ||
      (r.locationTag && r.locationTag.toLowerCase().includes(q)) ||
      String(r.id).includes(q)
    );
  });

  const filteredArticles = articles.filter(a => {
    if (activeTab === 'hidden' && a.status !== 'HIDDEN' && a.status !== 'REMOVED') return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.authorName && a.authorName.toLowerCase().includes(q)) ||
      String(a.id).includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* 1. Header Toolbar */}
      <div className="bg-[#FFFDF8] rounded-[6px] p-5 sm:p-6 border border-ink-200/80 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-[4px] bg-clay-50 text-clay-700 font-bold text-[10px] uppercase tracking-wider border border-clay-200/60">
              Ban Quản Trị Cộng Đồng
            </span>
            <span className="text-ink-200">/</span>
            <span className="font-bold text-xs text-clay-700">Khối kiểm duyệt & xử lý vi phạm</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-ink-800 tracking-tight">
            Kiểm duyệt Bài viết & Xử lý Báo cáo
          </h1>
          <p className="text-xs text-ink-400 mt-1">
            Giám sát nội dung cộng đồng, kiểm duyệt các bài viết check-in và xử lý khiếu nại báo cáo vi phạm với WanderAI Moderation Engine.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Tìm ID bài, từ khóa, tác giả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] text-xs text-ink-800 placeholder:text-ink-300 focus:border-clay-600 outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FFFDF8] hover:bg-[#F8F4EC] text-ink-700 border border-ink-200/80 rounded-[5px] text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-ink-400 ${refreshing ? 'animate-spin text-clay-600' : ''}`} />
            <span>Đồng bộ</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-clay-600 hover:bg-clay-700 text-[#FFFDF8] rounded-[5px] text-xs font-bold border border-clay-600 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards (4 Thẻ Thống Kê Nhanh từ DB) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1 */}
        <div className="bg-[#FFFDF8] p-5 rounded-[6px] border border-ink-200/80 flex flex-col justify-between hover:border-ink-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-ink-400">Tổng bài viết hôm nay</span>
            <div className="w-9 h-9 rounded-[5px] bg-[#F8F4EC] text-clay-700 border border-ink-200/80 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-display font-black text-3xl text-ink-800 leading-none mb-1.5">
              {metrics.totalPostsToday}
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-clay-700">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{metrics.growthPercent}%</span>
              <span className="text-ink-400 font-normal">so với hôm qua</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#FFFDF8] p-5 rounded-[6px] border border-ink-200/80 flex flex-col justify-between hover:border-ink-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-ink-400">Báo cáo chờ xử lý</span>
            <div className="w-9 h-9 rounded-[5px] bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center font-bold">
              <AlertTriangle className={`w-4 h-4 ${metrics.pendingReportsCount > 0 ? 'animate-pulse' : ''}`} />
            </div>
          </div>
          <div>
            <div className="font-display font-black text-3xl text-rose-700 leading-none mb-1.5">
              {metrics.pendingReportsCount}
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-rose-700">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Cần duyệt</span>
              <span className="text-ink-400 font-normal">({metrics.pendingReportsCount} trọng điểm)</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#FFFDF8] p-5 rounded-[6px] border border-ink-200/80 flex flex-col justify-between hover:border-ink-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-ink-400">Đã gỡ / Tạm ẩn</span>
            <div className="w-9 h-9 rounded-[5px] bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
              <EyeOff className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-display font-black text-3xl text-ink-800 leading-none mb-1.5">
              {metrics.hiddenPostsCount}
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Vi phạm quy chuẩn</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#FFFDF8] p-5 rounded-[6px] border border-ink-200/80 flex flex-col justify-between hover:border-ink-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-ink-400">Tỷ lệ nội dung an toàn</span>
            <div className="w-9 h-9 rounded-[5px] bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-display font-black text-3xl text-emerald-700 leading-none mb-1.5">
              {metrics.safeRate}%
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>WanderAI lọc tự động</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Navigation Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F8F4EC] rounded-[5px] border border-ink-200/80">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[5px] text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-[#FFFDF8] text-rose-800 border border-ink-200/80 shadow-none'
              : 'text-ink-600 hover:text-ink-800 hover:bg-[#FFFDF8]/60 border border-transparent'
          }`}
        >
          {metrics.pendingReportsCount > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
          )}
          <span>Kiểm duyệt Bài viết</span>
          <span className="px-2 py-0.5 rounded-[4px] bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold">
            {metrics.pendingReportsCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[5px] text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#FFFDF8] text-ink-800 border border-ink-200/80 shadow-none'
              : 'text-ink-600 hover:text-ink-800 hover:bg-[#FFFDF8]/60 border border-transparent'
          }`}
        >
          <span>Tất cả bài viết cộng đồng</span>
          <span className="px-2 py-0.5 rounded-[4px] bg-ink-100 text-ink-700 border border-ink-200 text-[10px] font-bold">
            {metrics.totalArticlesCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('hidden')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[5px] text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'hidden'
              ? 'bg-[#FFFDF8] text-ink-800 border border-ink-200/80 shadow-none'
              : 'text-ink-600 hover:text-ink-800 hover:bg-[#FFFDF8]/60 border border-transparent'
          }`}
        >
          <span>Bài viết đã ẩn / Vi phạm</span>
          <span className="px-2 py-0.5 rounded-[4px] bg-ink-100 text-ink-700 border border-ink-200 text-[10px] font-bold">
            {metrics.hiddenPostsCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[5px] text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-[#FFFDF8] text-clay-700 border border-ink-200/80 shadow-none'
              : 'text-ink-600 hover:text-ink-800 hover:bg-[#FFFDF8]/60 border border-transparent'
          }`}
        >
          <History className="w-3.5 h-3.5 text-clay-600" />
          <span>Nhật ký kiểm duyệt (Audit Log)</span>
        </button>

        <button
          onClick={() => setActiveTab('system_reports')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[5px] text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'system_reports'
              ? 'bg-[#FFFDF8] text-amber-800 border border-ink-200/80 shadow-none'
              : 'text-ink-600 hover:text-ink-800 hover:bg-[#FFFDF8]/60 border border-transparent'
          }`}
        >
          <Flag className="w-3.5 h-3.5 text-amber-600" />
          <span>Báo cáo Đa đối tượng (Địa điểm / Du khách / Review)</span>
        </button>
      </div>

      {/* 4. Tab Content: Pending Reports */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFDF8] p-4 rounded-[6px] border border-ink-200/80">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <h2 className="font-display font-black text-base text-ink-800">
                  Hàng đợi kiểm duyệt bài viết & Xử lý khiếu nại
                </h2>
                <p className="text-xs text-ink-400">
                  Xem xét bài viết người dùng mới đăng bị AI giữ lại chờ duyệt hoặc khiếu nại từ cộng đồng
                </p>
              </div>
            </div>

            {/* Sub Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-[#F8F4EC] rounded-[5px] border border-ink-200/80 shrink-0">
              <button
                type="button"
                onClick={() => setPendingSubFilter('all')}
                className={`px-3 py-1 rounded-[5px] text-xs font-bold transition-all cursor-pointer ${
                  pendingSubFilter === 'all' ? 'bg-[#FFFDF8] text-ink-800 border border-ink-200/80' : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                Tất cả ({reports.length})
              </button>
              <button
                type="button"
                onClick={() => setPendingSubFilter('ai_pending')}
                className={`px-3 py-1 rounded-[5px] text-xs font-bold transition-all cursor-pointer ${
                  pendingSubFilter === 'ai_pending' ? 'bg-[#FFFDF8] text-amber-800 border border-ink-200/80' : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                Chờ AI duyệt ({reports.filter(r => r.flagSource ? (r.flagSource === 'AI') : (r.isAiPending != null ? r.isAiPending : (r.status === 'PENDING_REVIEW'))).length})
              </button>
              <button
                type="button"
                onClick={() => setPendingSubFilter('user_reported')}
                className={`px-3 py-1 rounded-[5px] text-xs font-bold transition-all cursor-pointer ${
                  pendingSubFilter === 'user_reported' ? 'bg-[#FFFDF8] text-rose-800 border border-ink-200/80' : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                Báo cáo vi phạm ({reports.filter(r => !(r.flagSource ? (r.flagSource === 'AI') : (r.isAiPending != null ? r.isAiPending : (r.status === 'PENDING_REVIEW')))).length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-[#FFFDF8] rounded-[6px] p-12 text-center border border-ink-200/80">
              <RefreshCw className="w-8 h-8 text-clay-600 animate-spin mx-auto mb-2" />
              <p className="text-xs text-ink-400">Đang tải danh sách bài viết từ máy chủ...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="bg-[#FFFDF8] rounded-[6px] p-12 text-center border border-ink-200/80">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h3 className="font-display font-black text-base text-ink-800">Không có bài viết nào cần duyệt!</h3>
              <p className="text-xs text-ink-400 mt-1">Tất cả bài viết và báo cáo vi phạm đã được xử lý hoàn tất.</p>
            </div>
          ) : (
            filteredReports.map(report => {
              const isAiPending = report.flagSource ? (report.flagSource === 'AI') : (report.isAiPending != null ? report.isAiPending : (report.status === 'PENDING_REVIEW'));
              return (
                <article
                  key={report.id}
                  className="bg-[#FFFDF8] rounded-[6px] p-5 sm:p-6 border border-ink-200/80 hover:border-ink-300 transition-colors relative flex flex-col md:flex-row gap-6 overflow-hidden"
                >
                  {/* Left Accent Bar */}
                  <div className={`absolute top-0 left-0 bottom-0 w-1.5 rounded-l-[5px] ${
                    isAiPending ? 'bg-amber-500' : report.categoryType === 'error' ? 'bg-rose-600' : 'bg-clay-600'
                  }`}></div>

                  {/* Image Preview */}
                  <div className="w-full md:w-64 lg:w-72 shrink-0">
                    <div className="relative rounded-[5px] overflow-hidden w-full h-48 md:h-full min-h-[190px] max-h-[280px] bg-[#F8F4EC] border border-ink-200/80">
                      <img 
                        src={getSafeImageUrl(report.imageUrl)} 
                        alt={report.title} 
                        className="w-full h-full object-cover block" 
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      {isAiPending ? (
                        <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-[4px] bg-amber-600 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm z-10">
                          <Sparkles className="w-3 h-3" />
                          <span>AI Gắn Cờ - Chờ Duyệt</span>
                        </span>
                      ) : (
                        <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-[4px] bg-rose-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm z-10">
                          <Flame className="w-3 h-3" />
                          <span>{report.badgeText || (report.reportsCount + ' Lượt báo cáo')}</span>
                        </span>
                      )}
                      {report.locationTag && (
                        <span className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-[4px] bg-ink-900/80 text-[#FFFDF8] font-bold text-[10px] border border-ink-800 z-10">
                          {report.locationTag}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Report Content Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-[4px] font-bold text-[10px] border ${
                            isAiPending
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : report.categoryType === 'error'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-clay-50 text-clay-800 border-clay-200'
                          }`}>
                            {report.category}
                          </span>
                          <span className="text-xs font-mono text-ink-400">Mã bài: #{report.postCode || report.id}</span>
                        </div>
                        <span className="text-xs text-ink-400">{report.timeAgo}</span>
                      </div>

                      <h3 className="font-display font-black text-lg text-ink-800 mb-2">
                        {report.title}
                      </h3>

                      {/* Author Meta */}
                      <div className="flex items-center gap-2 mb-3 text-xs text-ink-600">
                        <span className="font-bold text-ink-800">{report.authorName}</span>
                        <span className="text-ink-400">{report.authorHandle}</span>
                        <span className="w-1 h-1 rounded-full bg-ink-300"></span>
                        <span className="text-ink-400 font-medium">{report.authorAccountAge}</span>
                      </div>

                      {/* Flag Reason Detail Box */}
                      <div className="p-3.5 rounded-[5px] bg-[#F8F4EC] border border-ink-200/60 mb-3 space-y-1">
                        <div className="flex items-start gap-2 text-xs">
                          {isAiPending ? (
                            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <strong className="font-bold text-ink-800">
                              {isAiPending ? 'Đánh giá AI & Lý do giữ bài: ' : 'Lý do báo cáo từ cộng đồng: '}
                            </strong>
                            <span className="text-ink-700">{isAiPending ? (report.aiFlagReason || report.reportReason) : (report.reportReason || report.aiFlagReason)}</span>
                            {!isAiPending && report.reporterName && (
                              <p className="text-[11px] text-ink-500 mt-1 flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-ink-700">Người gửi báo cáo:</span>
                                <span className="font-bold text-rose-700">{report.reporterName}</span>
                                {report.reporterEmail && <span className="text-ink-400">({report.reporterEmail})</span>}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-ink-600 line-clamp-2 italic">
                        "{report.snippet}"
                      </p>
                    </div>

                    {/* Admin Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-ink-200/60">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPostModal(report)}
                          className="px-3.5 py-1.5 rounded-[5px] bg-[#F8F4EC] hover:bg-ink-100 text-ink-700 font-bold text-xs flex items-center gap-1.5 border border-ink-200/80 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem toàn bộ</span>
                        </button>
                        {isAiPending ? (
                          <button
                            type="button"
                            onClick={() => handleApprovePost(report.id, report.title)}
                            className="px-3.5 py-1.5 rounded-[5px] bg-clay-600 hover:bg-clay-700 text-[#FFFDF8] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Phê duyệt bài viết để hiển thị công khai trên cộng đồng"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Duyệt xuất bản</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDismissReport(report.id, report.title)}
                            className="px-3.5 py-1.5 rounded-[5px] bg-emerald-700 hover:bg-emerald-800 text-[#FFFDF8] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Bác bỏ báo cáo và giữ lại bài viết hợp lệ"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Bác bỏ báo cáo (Hợp lệ)</span>
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmModal({ type: 'hide', post: report })}
                          className="px-3.5 py-1.5 rounded-[5px] bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Tạm thời ẩn bài viết khỏi cộng đồng"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Tạm ẩn bài</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmModal({ type: 'delete', post: report })}
                          className="px-3.5 py-1.5 rounded-[5px] bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Xóa vĩnh viễn bài viết khỏi hệ thống CSDL"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa vĩnh viễn</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}

      {/* 5. Data Table Section for All & Hidden Articles */}
      {(activeTab === 'all' || activeTab === 'hidden') && (
        <div className="bg-[#FFFDF8] rounded-[6px] border border-ink-200/80 overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-ink-200/60">
            <div>
              <h3 className="font-display font-black text-base text-ink-800">
                {activeTab === 'hidden' ? 'Danh sách bài viết đã ẩn / Vi phạm' : 'Toàn bộ bài viết cộng đồng gần đây'}
              </h3>
              <p className="text-xs text-ink-400">Kiểm toán tự động theo thời gian thực kết hợp WanderAI Moderation</p>
            </div>
            <button
              onClick={() => loadData(true)}
              className="p-2 rounded-[5px] bg-[#FFFDF8] hover:bg-[#F8F4EC] border border-ink-200/80 text-ink-700 transition-colors cursor-pointer shrink-0"
              title="Làm mới bảng"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-ink-400 ${refreshing ? 'animate-spin text-clay-600' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto rounded-[5px] border border-ink-200/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F4EC] text-ink-600 font-bold text-[11px] uppercase tracking-wider border-b border-ink-200/80">
                <tr>
                  <th className="py-3 px-4">Mã ID</th>
                  <th className="py-3 px-4">Tiêu đề bài viết</th>
                  <th className="py-3 px-4">Tác giả</th>
                  <th className="py-3 px-4">{activeTab === 'hidden' ? 'Thời gian ẩn' : 'Thời gian'}</th>
                  <th className="py-3 px-4">Trạng thái AI</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-200/60 bg-[#FFFDF8]">
                {filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-ink-400 text-xs">
                      Không có bài viết nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map(art => (
                    <tr key={art.id} className="hover:bg-[#F8F4EC]/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-clay-700 font-bold">#{art.postCode || art.id}</td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-display font-bold text-ink-800 truncate">{art.title}</p>
                        <span className="text-[11px] text-ink-400">{art.locationTag}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-bold text-ink-800">{art.authorName}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-ink-400">{art.timeAgo}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold border ${
                          art.status === 'HIDDEN' || art.status === 'REMOVED'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : (art.aiSafetyScore || 100) >= 80
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>
                            {art.status === 'HIDDEN' ? 'Đã ẩn (Hidden)' : art.status === 'REMOVED' ? 'Đã gỡ (Removed)' : `Safe (${art.aiSafetyScore || 98}%)`}
                          </span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedPostModal(art)}
                          className="p-1.5 rounded-[4px] text-ink-400 hover:text-clay-700 hover:bg-clay-50 border border-ink-200/80 transition-colors cursor-pointer mr-1"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {art.status === 'HIDDEN' || art.status === 'REMOVED' ? (
                          <button
                            onClick={() => setConfirmModal({ type: 'unhide', post: art })}
                            className="p-1.5 rounded-[4px] text-clay-700 hover:bg-clay-50 border border-ink-200/80 transition-colors cursor-pointer mr-1"
                            title="Bỏ ẩn (Đưa về hàng đợi chờ duyệt)"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirmModal({ type: 'hide', post: art })}
                            className="p-1.5 rounded-[4px] text-amber-700 hover:bg-amber-50 border border-amber-200 transition-colors cursor-pointer mr-1"
                            title="Tạm ẩn bài viết khỏi cộng đồng"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmModal({ type: 'delete', post: art })}
                          className="p-1.5 rounded-[4px] text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                          title="Xóa bài viết vĩnh viễn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Audit Log Tab Content */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Audit Header Banner */}
          <div className="bg-[#FFFDF8] rounded-[6px] border border-ink-200/80 p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-[5px] bg-[#F8F4EC] text-clay-700 flex items-center justify-center font-bold shrink-0 border border-ink-200/80">
                <History className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-black text-lg text-ink-800">
                    Nhật ký kiểm duyệt nội dung & Hành động Quản trị
                  </h3>
                  <span className="px-2 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                    Realtime Sync
                  </span>
                </div>
                <p className="text-xs text-ink-400 max-w-2xl">
                  Lưu vết 100% thời gian thực toàn bộ quyết định kiểm duyệt: Phê duyệt bài viết, Bác bỏ báo cáo, Tạm ẩn/Bỏ ẩn, Gỡ bỏ & Khóa tài khoản, và Báo cáo vi phạm từ du khách.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
              <button
                onClick={() => fetchAuditLogs(auditPage)}
                disabled={auditLoading}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-[5px] bg-[#FFFDF8] hover:bg-[#F8F4EC] border border-ink-200/80 text-ink-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
                title="Tải lại nhật ký"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-ink-400 ${auditLoading ? 'animate-spin text-clay-600' : ''}`} />
                <span>Làm mới</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-[5px] bg-[#FFFDF8] border border-ink-200/80 hover:bg-[#F8F4EC] text-ink-700 text-xs font-bold transition-colors cursor-pointer"
                title="Xuất file CSV"
              >
                <Download className="w-3.5 h-3.5 text-ink-400" />
                <span>Xuất CSV</span>
              </button>

              <Link
                to="/admin/audit-logs"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-[5px] bg-clay-600 hover:bg-clay-700 text-[#FFFDF8] text-xs font-bold border border-clay-600 transition-colors"
                title="Mở toàn bộ hệ thống Audit Logs"
              >
                <span>Tất cả Audit Logs</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#FFFDF8] p-4 rounded-[6px] border border-ink-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-ink-400 uppercase tracking-wider">Tổng bản ghi kiểm duyệt</span>
                <div className="font-display font-black text-2xl text-ink-800 mt-0.5">{auditTotalElements}</div>
              </div>
              <div className="w-9 h-9 rounded-[5px] bg-[#F8F4EC] text-clay-700 border border-ink-200/80 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-[#FFFDF8] p-4 rounded-[6px] border border-ink-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-ink-400 uppercase tracking-wider">Hoạt động hôm nay</span>
                <div className="font-display font-black text-2xl text-emerald-700 mt-0.5">{auditStats.logsToday}</div>
              </div>
              <div className="w-9 h-9 rounded-[5px] bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-[#FFFDF8] p-4 rounded-[6px] border border-ink-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-ink-400 uppercase tracking-wider">Sự kiện An toàn & Bảo mật</span>
                <div className="font-display font-black text-2xl text-rose-700 mt-0.5">{auditStats.securityCount || auditTotalElements}</div>
              </div>
              <div className="w-9 h-9 rounded-[5px] bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Search Bar & Action Filter Tabs */}
          <div className="bg-[#FFFDF8] rounded-[6px] border border-ink-200/80 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={auditSearchQuery}
                  onChange={(e) => setAuditSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchAuditLogs(0, e.target.value, auditFilterAction)}
                  placeholder="Tìm kiếm theo tiêu đề bài viết, mã #ID, admin..."
                  className="w-full pl-9 pr-20 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] text-xs text-ink-800 placeholder:text-ink-300 focus:border-clay-600 outline-none transition-all"
                />
                <button
                  onClick={() => fetchAuditLogs(0, auditSearchQuery, auditFilterAction)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-[4px] bg-clay-600 hover:bg-clay-700 text-[#FFFDF8] text-[11px] font-bold cursor-pointer transition-colors"
                >
                  Tìm
                </button>
              </div>

              {/* Page Indicator */}
              <div className="text-xs text-ink-500 font-medium">
                Trang <span className="font-bold text-ink-800">{auditPage + 1}</span> / {auditTotalPages || 1} ({auditTotalElements} bản ghi)
              </div>
            </div>

            {/* Action Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-ink-200/60">
              <span className="text-[11px] font-bold text-ink-400 uppercase tracking-wider mr-1">Bộ lọc thao tác:</span>
              {[
                { id: 'ALL', label: 'Tất cả' },
                { id: 'MODERATION_APPROVE', label: 'Phê duyệt' },
                { id: 'MODERATION_DISMISS', label: 'Bác bỏ báo cáo' },
                { id: 'MODERATION_HIDE', label: 'Tạm ẩn' },
                { id: 'MODERATION_UNHIDE', label: 'Bỏ ẩn' },
                { id: 'MODERATION_REMOVE_BAN', label: 'Gỡ bài & Khóa TK' },
                { id: 'MODERATION_DELETE', label: 'Xóa vĩnh viễn' },
                { id: 'USER_REPORT_POST', label: 'Báo cáo từ du khách' },
                { id: 'AI_FLAG_POST', label: 'AI gắn cờ' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setAuditFilterAction(tab.id);
                    fetchAuditLogs(0, auditSearchQuery, tab.id);
                  }}
                  className={`px-3 py-1 rounded-[5px] text-xs font-bold transition-all cursor-pointer ${
                    auditFilterAction === tab.id
                      ? 'bg-clay-600 text-[#FFFDF8] border border-clay-600'
                      : 'bg-[#F8F4EC] text-ink-600 hover:bg-[#F8F4EC]/80 border border-ink-200/80'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-[#FFFDF8] rounded-[6px] border border-ink-200/80 overflow-hidden">
            {auditLoading ? (
              <div className="p-12 text-center text-ink-400 space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-clay-600" />
                <p className="text-xs font-medium">Đang truy vấn nhật ký kiểm duyệt thời gian thực...</p>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="p-12 text-center text-ink-400 space-y-3">
                <div className="w-12 h-12 rounded-[5px] bg-[#F8F4EC] text-ink-400 flex items-center justify-center mx-auto border border-ink-200/80">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-ink-800 text-sm">Chưa có bản ghi nhật ký phù hợp</h4>
                  <p className="text-xs text-ink-400 mt-1">Các thao tác kiểm duyệt mới của Quản trị viên sẽ lập tức được lưu vết tại đây.</p>
                </div>
                <button
                  onClick={() => {
                    setAuditFilterAction('ALL');
                    setAuditSearchQuery('');
                    fetchAuditLogs(0, '', 'ALL');
                  }}
                  className="px-4 py-1.5 rounded-[5px] bg-[#F8F4EC] hover:bg-ink-100 text-ink-700 text-xs font-bold border border-ink-200/80 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Xóa bộ lọc & Tải lại</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F4EC] text-ink-600 font-bold text-[11px] uppercase tracking-wider border-b border-ink-200/80">
                    <tr>
                      <th className="py-3 px-4 w-16">#ID</th>
                      <th className="py-3 px-4 w-44">Hành động</th>
                      <th className="py-3 px-4 w-52">Người thực hiện</th>
                      <th className="py-3 px-4 min-w-[280px]">Nội dung chi tiết thao tác</th>
                      <th className="py-3 px-4 w-36">Thiết bị & IP</th>
                      <th className="py-3 px-4 w-40 text-right">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-200/60 bg-[#FFFDF8]">
                    {auditLogs.map((log) => {
                      const style = getAuditActionStyle(log.action);
                      const ActionIcon = style.icon;
                      const isActorAdmin = (log.userRole || '').toUpperCase().includes('ADMIN');

                      return (
                        <tr key={log.id} className="hover:bg-[#F8F4EC]/50 transition-colors">
                          {/* ID */}
                          <td className="py-3.5 px-4 font-mono text-clay-700 font-bold">
                            #{log.id}
                          </td>

                          {/* Action Badge */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold border ${style.bg}`}>
                              <ActionIcon className="w-3 h-3 shrink-0" />
                              <span>{style.label}</span>
                            </span>
                          </td>

                          {/* Actor */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              {log.userAvatar ? (
                                <img
                                  src={getSafeImageUrl(log.userAvatar)}
                                  alt={log.userName || 'User'}
                                  className="w-7 h-7 rounded-full object-cover border border-ink-200/80 shrink-0"
                                />
                              ) : (
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isActorAdmin ? 'bg-clay-700 text-[#FFFDF8]' : 'bg-ink-800 text-[#FFFDF8]'
                                }`}>
                                  {(log.userName || 'A').charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="font-bold text-ink-800 truncate text-xs">{log.userName || 'Quản Trị Viên'}</p>
                                  {isActorAdmin && (
                                    <span className="px-1.5 py-0.2 rounded-[4px] bg-clay-50 text-clay-800 font-bold text-[9px] uppercase border border-clay-200">
                                      Admin
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-ink-400 truncate">{log.userEmail || '@system'}</p>
                              </div>
                            </div>
                          </td>

                          {/* Details */}
                          <td className="py-3.5 px-4">
                            <div className="max-w-xl text-ink-800 leading-relaxed font-normal text-xs">
                              {log.details}
                            </div>
                          </td>

                          {/* Device & IP */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-ink-500">
                            <div className="flex items-center gap-1 font-mono text-[11px] text-ink-700 font-bold">
                              <Globe className="w-3 h-3 text-ink-400" />
                              <span>{log.ipAddress || '118.69.190.10'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-ink-400 mt-0.5">
                              <Laptop className="w-3 h-3 text-ink-400" />
                              <span>{parseClientDevice(log.userAgent)}</span>
                            </div>
                          </td>

                          {/* Timestamp */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-right">
                            <p className="font-bold text-ink-800 text-xs">{formatAuditRelative(log.createdAt)}</p>
                            <p className="text-[10px] text-ink-400 font-mono mt-0.5">{formatAuditTime(log.createdAt)}</p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {auditTotalPages > 1 && (
              <div className="p-3.5 bg-[#F8F4EC]/60 border-t border-ink-200/60 flex items-center justify-between text-xs text-ink-500">
                <span>
                  Hiển thị trang <strong className="text-ink-800">{auditPage + 1}</strong> trên <strong className="text-ink-800">{auditTotalPages}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchAuditLogs(Math.max(0, auditPage - 1))}
                    disabled={auditPage === 0 || auditLoading}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-[5px] bg-[#FFFDF8] border border-ink-200/80 text-xs font-bold text-ink-700 hover:bg-[#F8F4EC] disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Trước</span>
                  </button>

                  <button
                    onClick={() => fetchAuditLogs(Math.min(auditTotalPages - 1, auditPage + 1))}
                    disabled={auditPage >= auditTotalPages - 1 || auditLoading}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-[5px] bg-[#FFFDF8] border border-ink-200/80 text-xs font-bold text-ink-700 hover:bg-[#F8F4EC] disabled:opacity-40 cursor-pointer"
                  >
                    <span>Tiếp theo</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6.5. Tab Content: System Reports (Batch 1: Places, Users, Reviews, Posts) */}
      {activeTab === 'system_reports' && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="bg-[#FFFDF8] rounded-[6px] p-4 border border-ink-200/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-ink-700">Bộ lọc loại đối tượng:</span>
                {['ALL', 'PLACE', 'USER', 'POST', 'REVIEW'].map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      setSystemReportTypeFilter(type);
                      fetchSystemReports(systemReportStatusFilter, type);
                    }}
                    className={`px-2.5 py-1 rounded-[4px] text-xs font-bold cursor-pointer transition-colors ${
                      systemReportTypeFilter === type
                        ? 'bg-ink-800 text-[#FFFDF8]'
                        : 'bg-[#F8F4EC] text-ink-600 hover:bg-ink-200'
                    }`}
                  >
                    {type === 'ALL' ? 'Tất cả đối tượng' : type === 'PLACE' ? 'Địa điểm' : type === 'USER' ? 'Người dùng' : type === 'POST' ? 'Bài viết' : 'Đánh giá'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-ink-700">Trạng thái:</span>
                {['ALL', 'PENDING', 'RESOLVED', 'DISMISSED'].map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      setSystemReportStatusFilter(status);
                      fetchSystemReports(status, systemReportTypeFilter);
                    }}
                    className={`px-2.5 py-1 rounded-[4px] text-xs font-bold cursor-pointer transition-colors ${
                      systemReportStatusFilter === status
                        ? 'bg-amber-700 text-[#FFFDF8]'
                        : 'bg-[#F8F4EC] text-ink-600 hover:bg-ink-200'
                    }`}
                  >
                    {status === 'ALL' ? 'Tất cả' : status === 'PENDING' ? 'Chờ xử lý' : status === 'RESOLVED' ? 'Đã xử lý' : 'Đã bác bỏ'}
                  </button>
                ))}

                <button
                  onClick={() => fetchSystemReports(systemReportStatusFilter, systemReportTypeFilter)}
                  className="p-1.5 rounded-[4px] bg-[#F8F4EC] hover:bg-ink-200 text-ink-700 cursor-pointer"
                  title="Tải lại"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${systemReportLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* System Reports Table */}
          <div className="bg-[#FFFDF8] rounded-[6px] border border-ink-200/80 overflow-hidden">
            {systemReportLoading ? (
              <div className="p-12 text-center text-ink-400 space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-amber-600" />
                <p className="text-xs font-medium">Đang tải danh sách báo cáo hệ thống...</p>
              </div>
            ) : systemReports.length === 0 ? (
              <div className="p-12 text-center text-ink-400 space-y-3">
                <div className="w-12 h-12 rounded-[5px] bg-[#F8F4EC] text-ink-400 flex items-center justify-center mx-auto border border-ink-200/80">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-ink-800 text-sm">Không có báo cáo vi phạm nào</h4>
                  <p className="text-xs text-ink-400 mt-1">Không có khiếu nại hoặc báo cáo vi phạm nào phù hợp với bộ lọc hiện tại.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-ink-700">
                  <thead className="bg-[#F8F4EC] border-b border-ink-200/80 text-[11px] font-bold text-ink-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Mã BC</th>
                      <th className="py-3 px-4">Đối tượng</th>
                      <th className="py-3 px-4">Người gửi</th>
                      <th className="py-3 px-4">Lý do & Mô tả</th>
                      <th className="py-3 px-4">Bằng chứng</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-200/60">
                    {systemReports.map(rep => (
                      <tr key={rep.id} className="hover:bg-[#F8F4EC]/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-ink-500">#{rep.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold border ${
                              rep.targetType === 'PLACE'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : rep.targetType === 'USER'
                                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                                  : rep.targetType === 'REVIEW'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-sky-50 text-sky-800 border-sky-200'
                            }`}>
                              {rep.targetType}
                            </span>
                            <span className="font-semibold text-ink-800 max-w-[160px] truncate" title={rep.targetTitle || `ID: ${rep.targetId}`}>
                              {rep.targetTitle || `ID: ${rep.targetId}`}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-ink-800">{rep.reporterName || 'Du khách'}</div>
                          <div className="text-[10px] text-ink-400">{rep.reporterEmail || 'Không có email'}</div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-bold text-rose-700">{rep.category || rep.reason}</div>
                          <div className="text-ink-500 text-[11px] line-clamp-2 mt-0.5">{rep.description || 'Không có mô tả chi tiết'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          {rep.evidenceImageUrl ? (
                            <button
                              onClick={() => setSelectedEvidenceImage(rep.evidenceImageUrl)}
                              className="group relative w-10 h-10 rounded-[4px] overflow-hidden border border-ink-200 inline-block cursor-pointer"
                              title="Bấm để xem ảnh bằng chứng"
                            >
                              <img src={rep.evidenceImageUrl} alt="Bằng chứng" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                              <div className="absolute inset-0 bg-ink-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Eye className="w-3.5 h-3.5 text-white" />
                              </div>
                            </button>
                          ) : (
                            <span className="text-ink-400 text-[11px]">Không có</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold border ${
                            rep.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : rep.status === 'RESOLVED'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-ink-100 text-ink-600 border-ink-200'
                          }`}>
                            {rep.status === 'PENDING' ? 'Chờ duyệt' : rep.status === 'RESOLVED' ? 'Đã xử lý' : 'Đã bác bỏ'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {rep.status === 'PENDING' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleResolveSystemReport(rep.id, 'RESOLVE', 'Đã xử lý xác minh vi phạm')}
                                className="px-2.5 py-1 rounded-[4px] bg-emerald-600 hover:bg-emerald-700 text-[#FFFDF8] text-[11px] font-bold cursor-pointer transition-colors"
                              >
                                Xử lý xong
                              </button>
                              <button
                                onClick={() => handleResolveSystemReport(rep.id, 'DISMISS', 'Báo cáo không có căn cứ')}
                                className="px-2.5 py-1 rounded-[4px] bg-[#F8F4EC] hover:bg-ink-200 text-ink-700 text-[11px] font-bold border border-ink-200 cursor-pointer transition-colors"
                              >
                                Bác bỏ
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-ink-400 font-mono">Đã đóng</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal xem ảnh bằng chứng báo cáo */}
      {selectedEvidenceImage && (
        <div className="fixed inset-0 z-50 bg-ink-900/70 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setSelectedEvidenceImage(null)}>
          <div className="bg-[#FFFDF8] rounded-[6px] max-w-lg w-full p-4 border border-ink-200 shadow-2xl space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-2 border-b border-ink-200/60">
              <h4 className="font-display font-bold text-ink-800 text-sm flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                <span>Ảnh bằng chứng vi phạm</span>
              </h4>
              <button onClick={() => setSelectedEvidenceImage(null)} className="w-6 h-6 rounded hover:bg-ink-100 flex items-center justify-center cursor-pointer">
                <X className="w-4 h-4 text-ink-400" />
              </button>
            </div>
            <img src={selectedEvidenceImage} alt="Ảnh bằng chứng" className="w-full max-h-[70vh] object-contain rounded border border-ink-200" />
            <div className="text-right">
              <button onClick={() => setSelectedEvidenceImage(null)} className="px-3 py-1 rounded bg-[#F8F4EC] text-ink-700 text-xs font-bold border border-ink-200 hover:bg-ink-200 cursor-pointer">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal: Xem chi tiết bài viết (Post Preview Modal) */}
      {selectedPostModal && (
        <div className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF8] rounded-[6px] max-w-2xl w-full p-6 border border-ink-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-ink-200/60">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-[4px] bg-clay-50 text-clay-700 border border-clay-200 text-[10px] font-bold">
                  #{selectedPostModal.postCode || selectedPostModal.id}
                </span>
                <h3 className="font-display font-black text-ink-800 text-base">Chi tiết bài viết cộng đồng</h3>
              </div>
              <button 
                onClick={() => setSelectedPostModal(null)}
                className="w-7 h-7 rounded-[5px] hover:bg-[#F8F4EC] text-ink-400 hover:text-ink-700 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedPostModal.imageUrl && (
              <img 
                src={getSafeImageUrl(selectedPostModal.imageUrl)} 
                alt={selectedPostModal.title} 
                className="w-full h-56 object-cover rounded-[5px] border border-ink-200/80"
              />
            )}

            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-[4px] bg-[#F8F4EC] text-ink-700 border border-ink-200/60 text-xs font-bold">
                  {selectedPostModal.category}
                </span>
                <span className="text-xs text-ink-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-clay-600" /> {selectedPostModal.locationTag}
                </span>
              </div>
              <h2 className="text-xl font-display font-black text-ink-800 mb-2">
                {selectedPostModal.title}
              </h2>
              <p className="text-xs text-ink-700 leading-relaxed whitespace-pre-line bg-[#F8F4EC] p-4 rounded-[5px] border border-ink-200/60">
                {selectedPostModal.content || selectedPostModal.snippet}
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-[5px] border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> WanderAI Security Analysis
                </span>
                <span>Điểm an toàn: {selectedPostModal.aiSafetyScore || 98}/100</span>
              </div>
              <p className="text-[11px] text-ink-600">
                {selectedPostModal.aiFlagReason || 'Nội dung phù hợp quy chuẩn cộng đồng Wayfare.'}
              </p>
            </div>

            {!(selectedPostModal.flagSource ? (selectedPostModal.flagSource === 'AI') : (selectedPostModal.isAiPending != null ? selectedPostModal.isAiPending : (selectedPostModal.status === 'PENDING_REVIEW'))) && selectedPostModal.reportReason && (
              <div className="p-3 bg-rose-50 rounded-[5px] border border-rose-200 text-xs text-rose-900 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1 text-rose-700">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Lý do báo cáo từ người dùng
                  </span>
                  <span className="text-[11px] font-semibold text-rose-600">{selectedPostModal.reportsCount || 1} lượt báo cáo</span>
                </div>
                <p className="text-[11px] text-ink-700 leading-relaxed font-medium">
                  {selectedPostModal.reportReason}
                </p>
                {selectedPostModal.reporterName && (
                  <p className="text-[10px] text-ink-500 pt-0.5">
                    Người gửi báo cáo: <strong className="text-ink-800">{selectedPostModal.reporterName}</strong> {selectedPostModal.reporterEmail && `(${selectedPostModal.reporterEmail})`}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-ink-200/60">
              <div className="flex flex-wrap items-center gap-2">
                {selectedPostModal.status === 'HIDDEN' || selectedPostModal.status === 'REMOVED' ? (
                  <button
                    type="button"
                    onClick={() => setConfirmModal({ type: 'unhide', post: selectedPostModal })}
                    className="px-3.5 py-1.5 rounded-[5px] text-xs font-bold bg-clay-600 hover:bg-clay-700 text-[#FFFDF8] flex items-center gap-1.5 border border-clay-600 transition-colors cursor-pointer"
                    title="Bỏ ẩn và chuyển bài viết quay trở lại hàng đợi chờ duyệt"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Bỏ ẩn (Đưa về chờ duyệt)</span>
                  </button>
                ) : (selectedPostModal.flagSource ? (selectedPostModal.flagSource === 'AI') : (selectedPostModal.isAiPending != null ? selectedPostModal.isAiPending : (selectedPostModal.status === 'PENDING_REVIEW'))) ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleApprovePost(selectedPostModal.id, selectedPostModal.title)}
                      className="px-3.5 py-1.5 rounded-[5px] text-xs font-bold bg-clay-600 hover:bg-clay-700 text-[#FFFDF8] flex items-center gap-1.5 border border-clay-600 transition-colors cursor-pointer"
                      title="Phê duyệt bài viết để công khai trên cộng đồng"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Duyệt xuất bản</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmModal({ type: 'hide', post: selectedPostModal })}
                      className="px-3.5 py-1.5 rounded-[5px] text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Tạm ẩn bài viết"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Tạm ẩn bài</span>
                    </button>
                  </>
                ) : (
                  <>
                    {(selectedPostModal.reportsCount > 0 || selectedPostModal.status === 'PENDING_REPORT') && (
                      <button
                        type="button"
                        onClick={() => handleDismissReport(selectedPostModal.id, selectedPostModal.title)}
                        className="px-3.5 py-1.5 rounded-[5px] text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-[#FFFDF8] flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Bác bỏ báo cáo và giữ lại bài viết hợp lệ"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Bác bỏ báo cáo (Hợp lệ)</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setConfirmModal({ type: 'hide', post: selectedPostModal })}
                      className="px-3.5 py-1.5 rounded-[5px] text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Tạm ẩn bài viết khỏi cộng đồng"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Tạm ẩn bài</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setConfirmModal({ type: 'delete', post: selectedPostModal })}
                  className="px-3.5 py-1.5 rounded-[5px] text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Xóa vĩnh viễn bài viết khỏi hệ thống"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa vĩnh viễn</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPostModal(null)}
                className="px-3.5 py-1.5 rounded-[5px] text-xs font-bold bg-[#F8F4EC] hover:bg-ink-100 text-ink-700 border border-ink-200/80 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Action Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-[9998] bg-ink-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF8] rounded-[6px] max-w-md w-full p-6 border border-ink-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-[5px] shrink-0 border ${
                confirmModal.type === 'unhide'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : confirmModal.type === 'hide'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                {confirmModal.type === 'unhide' && <RefreshCw className="w-5 h-5" />}
                {confirmModal.type === 'hide' && <EyeOff className="w-5 h-5" />}
                {confirmModal.type === 'delete' && <Trash2 className="w-5 h-5" />}
                {confirmModal.type === 'ban' && <ShieldAlert className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-black text-base text-ink-800 mb-1">
                  {confirmModal.type === 'unhide' && 'Xác nhận Bỏ ẩn (Đưa về hàng đợi chờ duyệt)'}
                  {confirmModal.type === 'hide' && 'Xác nhận Tạm ẩn bài viết'}
                  {confirmModal.type === 'delete' && 'Xác nhận Xóa bài viết vĩnh viễn'}
                  {confirmModal.type === 'ban' && 'Xác nhận Khóa bài & Cảnh cáo'}
                </h3>
                <p className="text-xs text-ink-400 leading-relaxed">
                  {confirmModal.type === 'unhide' && (
                    <>
                      Bài viết <strong className="text-ink-800 font-bold">#{confirmModal.post?.id}</strong> sẽ được bỏ ẩn và chuyển quay trở lại trang <strong className="text-ink-800 font-bold">Chờ duyệt & Báo cáo</strong> để quản trị viên xem xét phê duyệt xuất bản.
                    </>
                  )}
                  {confirmModal.type === 'hide' && (
                    <>
                      Bài viết <strong className="text-ink-800 font-bold">#{confirmModal.post?.id}</strong> sẽ bị tạm ẩn khỏi không gian công cộng. Hệ thống sẽ gửi thông báo đến tác giả.
                    </>
                  )}
                  {confirmModal.type === 'delete' && (
                    <>
                      Bài viết <strong className="text-ink-800 font-bold">#{confirmModal.post?.id}</strong> sẽ bị xóa vĩnh viễn khỏi hệ thống CSDL. Thao tác này không thể hoàn tác và hệ thống sẽ gửi thông báo đến tác giả.
                    </>
                  )}
                  {confirmModal.type === 'ban' && (
                    <>
                      Bạn có chắc muốn gỡ bài viết <strong className="text-ink-800 font-bold">#{confirmModal.post?.id}</strong> và tạm khóa tài khoản của tác giả <strong className="text-ink-800 font-bold">{confirmModal.post?.authorName}</strong>?
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-ink-200/60">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-[5px] text-xs font-bold bg-[#F8F4EC] hover:bg-ink-100 text-ink-700 border border-ink-200/80 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmModal.type === 'unhide') {
                    executeUnhidePost(confirmModal.post?.id, confirmModal.post?.title);
                  } else if (confirmModal.type === 'hide') {
                    executeHidePost(confirmModal.post?.id, confirmModal.post?.title);
                  } else if (confirmModal.type === 'delete') {
                    executeDeletePost(confirmModal.post?.id, confirmModal.post?.title);
                  } else if (confirmModal.type === 'ban') {
                    executeBanUser(confirmModal.post?.id, confirmModal.post?.authorName, confirmModal.post?.title);
                  }
                }}
                className={`px-4 py-2 rounded-[5px] text-xs font-bold text-white transition-colors cursor-pointer ${
                  confirmModal.type === 'unhide'
                    ? 'bg-clay-600 hover:bg-clay-700'
                    : confirmModal.type === 'hide'
                      ? 'bg-amber-700 hover:bg-amber-800'
                      : 'bg-rose-700 hover:bg-rose-800'
                }`}
              >
                {confirmModal.type === 'unhide' && 'Đưa về chờ duyệt'}
                {confirmModal.type === 'hide' && 'Xác nhận Ẩn bài'}
                {confirmModal.type === 'delete' && 'Xóa vĩnh viễn'}
                {confirmModal.type === 'ban' && 'Khóa bài & Cảnh cáo'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminReportsPage;
