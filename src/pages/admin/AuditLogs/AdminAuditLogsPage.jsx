import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../components/common/Toast';
import { auditLogApi, adminUserApi } from '../../../services/api';
import {
  History,
  Search,
  Filter,
  RefreshCw,
  User,
  Shield,
  KeyRound,
  UserPlus,
  Compass,
  FileText,
  AlertTriangle,
  CheckCircle,
  Eye,
  X,
  Calendar,
  Globe,
  Monitor,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Download,
  Info
} from 'lucide-react';

export const AdminAuditLogsPage = () => {
  const toast = useToast();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalLogs: 0, logsToday: 0, distinctActionsCount: 0 });
  const [actionsList, setActionsList] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // Filter States
  const [keyword, setKeyword] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Selected Log for Modal
  const [selectedLog, setSelectedLog] = useState(null);

  // Fetch Stats & Filters Meta
  const fetchMetadata = useCallback(async () => {
    try {
      const [statsData, actionsData, usersData] = await Promise.all([
        auditLogApi.getStats(),
        auditLogApi.getActions(),
        adminUserApi.getUsers('', 'ALL', 'ALL')
      ]);
      setStats(statsData || { totalLogs: 0, logsToday: 0, distinctActionsCount: 0 });
      setActionsList(actionsData || []);
      setUsersList(usersData || []);
    } catch (err) {
      console.error('Lỗi khi tải metadata nhật ký:', err);
    }
  }, []);

  // Fetch Logs
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await auditLogApi.getLogs({
        keyword: keyword.trim(),
        userId: selectedUserId,
        action: selectedAction,
        category: selectedCategory,
        page,
        size: pageSize
      });

      if (data && data.content) {
        setLogs(data.content);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else {
        setLogs([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (err) {
      toast.error('Không thể tải danh sách nhật ký hệ thống: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [keyword, selectedUserId, selectedAction, selectedCategory, page, pageSize, toast]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleResetFilters = () => {
    setKeyword('');
    setSelectedUserId('');
    setSelectedAction('ALL');
    setSelectedCategory('ALL');
    setPage(0);
  };

  const handleDownloadFile = async (cat = 'ALL') => {
    try {
      await auditLogApi.downloadLogFile(cat);
      toast.success(`Đã tải xuống file nhật ký wayfare-${cat.toLowerCase()}.log thành công!`);
    } catch (err) {
      toast.error('Không thể tải file log: ' + err.message);
    }
  };

  const handleSelectUserFilter = (uid) => {
    setSelectedUserId(uid === selectedUserId ? '' : uid);
    setPage(0);
  };

  // Helper for action badges
  const getActionBadge = (action) => {
    const act = (action || '').toUpperCase();
    if (act.includes('LOGIN')) {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
        icon: KeyRound,
        label: 'Đăng nhập'
      };
    }
    if (act.includes('REGISTER')) {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
        icon: UserPlus,
        label: 'Đăng ký'
      };
    }
    if (act.includes('ITINERARY')) {
      return {
        bg: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800',
        icon: Compass,
        label: 'Lịch trình'
      };
    }
    if (act.includes('POST')) {
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
        icon: FileText,
        label: 'Bài viết'
      };
    }
    if (act.includes('LOCK') || act.includes('BAN')) {
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
        icon: AlertTriangle,
        label: 'Khóa / Chặn'
      };
    }
    if (act.includes('REPORT') || act.includes('RESOLVE')) {
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
        icon: ShieldCheck,
        label: 'Báo cáo vi phạm'
      };
    }
    if (act.includes('ROLE') || act.includes('MANAGEMENT')) {
      return {
        bg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800',
        icon: Shield,
        label: 'Phân quyền'
      };
    }
    if (act.includes('AI')) {
      return {
        bg: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800',
        icon: Cpu,
        label: 'Trợ lý AI'
      };
    }
    return {
      bg: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      icon: Layers,
      label: action
    };
  };

  const getCategoryBadge = (category) => {
    const cat = (category || 'ACTIVITY').toUpperCase();
    switch (cat) {
      case 'AUTH':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
          label: '🔐 AUTH',
          title: 'Nhật ký Xác thực & Tài khoản'
        };
      case 'SECURITY':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
          label: '🛡️ SECURITY',
          title: 'Nhật ký An toàn & Kiểm duyệt'
        };
      case 'SYSTEM':
        return {
          bg: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800',
          label: '⚙️ SYSTEM',
          title: 'Nhật ký Cấu hình & Hệ thống'
        };
      case 'ACTIVITY':
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
          label: '🧭 ACTIVITY',
          title: 'Nhật ký Hoạt động Nghiệp vụ'
        };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const formatRelativeTime = (dateStr) => {
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

  const parseDevice = (userAgent) => {
    if (!userAgent) return 'Thiết bị Web';
    const ua = userAgent.toLowerCase();
    let os = 'Windows';
    if (ua.includes('iphone')) os = 'iPhone';
    else if (ua.includes('ipad')) os = 'iPad';
    else if (ua.includes('macintosh') || ua.includes('mac os')) os = 'macOS';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('linux')) os = 'Linux';

    let browser = 'Chrome';
    if (ua.includes('edg')) browser = 'Edge';
    else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
    else if (ua.includes('firefox')) browser = 'Firefox';

    return `${os} • ${browser}`;
  };

  const selectedUserObj = usersList.find(u => String(u.id) === String(selectedUserId));

  // Export to CSV
  const handleExportCSV = () => {
    if (!logs.length) {
      toast.error('Không có dữ liệu nhật ký để xuất file');
      return;
    }
    const headers = ['ID', 'Thời gian', 'Người dùng', 'Email', 'Hành động', 'Chi tiết', 'IP', 'User Agent'];
    const rows = logs.map(l => [
      l.id,
      `"${formatDate(l.createdAt)}"`,
      `"${l.userName || ''}"`,
      `"${l.userEmail || ''}"`,
      `"${l.action || ''}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${l.ipAddress || ''}"`,
      `"${(l.userAgent || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `wayfare_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Đã xuất file CSV nhật ký hệ thống thành công!');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                Nhật Ký Hệ Thống & Hoạt Động
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Theo dõi toàn bộ lịch sử đăng nhập, phân quyền, can thiệp quản trị và thao tác người dùng (Audit Logs)
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchLogs}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            title="Tải lại nhật ký"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Làm mới</span>
          </button>

          <button
            onClick={() => handleDownloadFile(selectedCategory)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs hover:shadow-md cursor-pointer"
            title="Tải xuống tệp nhật ký nguyên bản (.log) được phân loại và lưu trữ trên máy chủ"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải File Log (.log)</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs hover:shadow-md cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Lưu trữ File Log</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {stats.totalLogs?.toLocaleString() || 0}
            </p>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">✓ Không tốn CSDL</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Hoạt động hôm nay</p>
            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {stats.logsToday?.toLocaleString() || 0}
            </p>
            <span className="text-[10px] font-bold text-slate-400">Theo thời gian thực</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Phân loại hành động</p>
            <p className="text-xl font-extrabold text-violet-600 dark:text-violet-400 mt-0.5">
              {stats.distinctActionsCount || actionsList.length || 0} loại
            </p>
            <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400">4 file phân loại độc lập</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cơ chế File Rolling</p>
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Xoay vòng 30 ngày
            </p>
            <span className="text-[10px] text-slate-400">Tự động nén .gz</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-4">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-100 dark:border-slate-700/60">
          {[
            { id: 'ALL', label: 'Tất cả phân loại', count: stats.totalLogs, icon: Layers },
            { id: 'AUTH', label: '🔐 Xác thực (AUTH)', count: stats.authCount, icon: KeyRound },
            { id: 'SECURITY', label: '🛡️ An ninh (SECURITY)', count: stats.securityCount, icon: ShieldCheck },
            { id: 'ACTIVITY', label: '🧭 Nghiệp vụ (ACTIVITY)', count: stats.activityCount, icon: Compass },
            { id: 'SYSTEM', label: '⚙️ Hệ thống (SYSTEM)', count: stats.systemCount, icon: Cpu }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setSelectedCategory(tab.id); setPage(0); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-slate-900 text-white shadow-xs dark:bg-emerald-600'
                    : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${active ? 'bg-white/20 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-2xs'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          
          {/* Keyword Search Input */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
              placeholder="Tìm hành động, nội dung, IP, tên hoặc email..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* User Selector Dropdown (Tìm kiếm & Hiển thị theo người dùng) */}
          <div className="sm:col-span-4 relative">
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedUserId}
                onChange={(e) => { setSelectedUserId(e.target.value); setPage(0); }}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
              >
                <option value="">— Lọc theo tất cả người dùng —</option>
                {usersList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.email})
                  </option>
                ))}
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Action Type Dropdown */}
          <div className="sm:col-span-3 relative">
            <select
              value={selectedAction}
              onChange={(e) => { setSelectedAction(e.target.value); setPage(0); }}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="ALL">Tất cả loại hành động</option>
              {actionsList.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Active Filters Pill Bar */}
        {(keyword || selectedUserId || selectedAction !== 'ALL' || selectedCategory !== 'ALL') && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
            <span className="text-[11px] font-semibold text-slate-400">Bộ lọc đang bật:</span>

            {selectedCategory !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
                <span>Phân loại: {selectedCategory}</span>
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className="hover:text-rose-600 transition-colors ml-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedUserObj && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
                <User className="w-3 h-3" />
                <span>Người dùng: {selectedUserObj.fullName}</span>
                <button
                  onClick={() => setSelectedUserId('')}
                  className="hover:text-rose-600 transition-colors ml-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedAction !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 text-xs font-semibold">
                <span>Hành động: {selectedAction}</span>
                <button
                  onClick={() => setSelectedAction('ALL')}
                  className="hover:text-rose-600 transition-colors ml-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {keyword && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold">
                <span>Từ khóa: "{keyword}"</span>
                <button
                  onClick={() => setKeyword('')}
                  className="hover:text-rose-600 transition-colors ml-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:underline cursor-pointer ml-auto"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* 4. Logs Data Table */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-700/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[160px]">Thời gian</th>
                <th className="py-3 px-4 min-w-[200px]">Người dùng phát sinh</th>
                <th className="py-3 px-4 min-w-[120px]">Phân loại</th>
                <th className="py-3 px-4 min-w-[150px]">Hành động</th>
                <th className="py-3 px-4 min-w-[280px]">Nội dung & Chi tiết nghiệp vụ</th>
                <th className="py-3 px-4 min-w-[150px]">IP & Thiết bị</th>
                <th className="py-3 px-4 w-20 text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs text-slate-700 dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center">
                    <div className="inline-flex flex-col items-center gap-2 text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                      <span>Đang tải nhật ký hệ thống...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <div className="inline-flex flex-col items-center gap-2">
                      <Info className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-slate-600 dark:text-slate-300">Không tìm thấy bản ghi nhật ký phù hợp</p>
                      <p className="text-[11px] text-slate-400">Thử thay đổi từ khóa hoặc đặt lại bộ lọc tìm kiếm</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((logItem, idx) => {
                  const badge = getActionBadge(logItem.action);
                  const Icon = badge.icon;
                  const isCurrentFilterUser = selectedUserId && String(selectedUserId) === String(logItem.userId);

                  return (
                    <tr
                      key={logItem.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      {/* Index */}
                      <td className="py-3 px-4 text-center text-[11px] font-mono text-slate-400">
                        {page * pageSize + idx + 1}
                      </td>

                      {/* Created At */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>{formatRelativeTime(logItem.createdAt) || 'Vừa xong'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                            <Calendar className="w-3 h-3 text-slate-300" />
                            <span>{formatDate(logItem.createdAt)}</span>
                          </div>
                        </div>
                      </td>

                      {/* User Cell with Fast Filter Button */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              logItem.userAvatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                            }
                            alt={logItem.userName}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white truncate">
                                {logItem.userName || 'Hệ thống'}
                              </span>
                              {logItem.userId && (
                                <button
                                  type="button"
                                  onClick={() => handleSelectUserFilter(logItem.userId)}
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                                    isCurrentFilterUser
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-emerald-100 hover:text-emerald-700'
                                  }`}
                                  title="Lọc chỉ hiển thị nhật ký người dùng này"
                                >
                                  {isCurrentFilterUser ? 'Đang lọc' : 'Lọc theo user'}
                                </button>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">
                              {logItem.userEmail} • {logItem.userHandle || '@system'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {(() => {
                          const catBadge = getCategoryBadge(logItem.category || logItem.action);
                          return (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${catBadge.bg}`}
                              title={catBadge.title}
                            >
                              {catBadge.label}
                            </span>
                          );
                        })()}
                      </td>

                      {/* Action Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{logItem.action}</span>
                        </span>
                      </td>

                      {/* Details */}
                      <td className="py-3 px-4">
                        <p className="line-clamp-2 text-slate-700 dark:text-slate-200 font-normal leading-relaxed">
                          {logItem.details || '—'}
                        </p>
                      </td>

                      {/* IP & User Agent */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold">
                            <Globe className="w-3 h-3 text-emerald-500" />
                            {logItem.ipAddress || '118.69.190.10'}
                          </span>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium" title={logItem.userAgent}>
                            <Monitor className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[170px]">{parseDevice(logItem.userAgent)}</span>
                          </p>
                        </div>
                      </td>

                      {/* Action Button */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedLog(logItem)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
                          title="Xem chi tiết nhật ký"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-50/60 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-500">
          <div>
            <span>
              Hiển thị {logs.length} / {totalElements} bản ghi nhật ký
            </span>
            {totalPages > 1 && (
              <span className="ml-2 font-semibold">
                (Trang {page + 1} / {totalPages})
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 0))}
              disabled={page === 0 || loading}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Trang trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
              {page + 1}
            </span>

            <button
              onClick={() => setPage(p => (p + 1 < totalPages ? p + 1 : p))}
              disabled={page + 1 >= totalPages || loading}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Trang sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Chi Tiết Nhật Ký Hệ Thống #{selectedLog.id}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Ghi nhận lúc: {formatDate(selectedLog.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs">
              {/* User info */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <img
                  src={
                    selectedLog.userAvatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                  }
                  alt={selectedLog.userName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
                />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    {selectedLog.userName || 'Hệ thống (System)'}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    {selectedLog.userEmail} • {selectedLog.userHandle}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                    Vai trò: {selectedLog.userRole || 'MEMBER'}
                  </span>
                </div>
              </div>

              {/* Category & Action type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Phân loại (Category)
                  </label>
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center">
                    {(() => {
                      const cb = getCategoryBadge(selectedLog.category || selectedLog.action);
                      return (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${cb.bg}`}>
                          {cb.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Hành động (Action)
                  </label>
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                    {selectedLog.action}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Nội dung chi tiết (Audit Details)
                </label>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
                  {selectedLog.details || 'Không có chi tiết bổ sung'}
                </div>
              </div>

              {/* Network & Device Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Địa chỉ IP
                  </label>
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 font-mono text-slate-700 dark:text-slate-300">
                    {selectedLog.ipAddress || '127.0.0.1'}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Mã bản ghi ID
                  </label>
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 font-mono text-slate-700 dark:text-slate-300">
                    #{selectedLog.id}
                  </div>
                </div>
              </div>

              {/* User Agent */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  User Agent
                </label>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-[11px] text-slate-500 font-mono break-all">
                  {selectedLog.userAgent || 'Internal System'}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex items-center justify-between">
              {selectedLog.userId && (
                <button
                  type="button"
                  onClick={() => {
                    handleSelectUserFilter(selectedLog.userId);
                    setSelectedLog(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-xs hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  Lọc tất cả hoạt động của user này
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="ml-auto px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogsPage;

