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
        adminUserApi.getUsers({ size: 100 })
      ]);
      setStats(statsData || { totalLogs: 0, logsToday: 0, distinctActionsCount: 0 });
      setActionsList(Array.isArray(actionsData) ? actionsData : []);
      // usersData is Page<UserDto> object: { content: [...] } or array
      const safeUsers = Array.isArray(usersData)
        ? usersData
        : (usersData && Array.isArray(usersData.content) ? usersData.content : []);
      setUsersList(safeUsers);
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

  // Helper for action badges in Paper-Ink-Clay style
  const getActionBadge = (action) => {
    const act = (action || '').toUpperCase();
    if (act.includes('LOGIN')) {
      return {
        bg: 'bg-[#F8F4EC] text-ink-700 border-ink-200/80',
        icon: KeyRound,
        label: 'Đăng nhập'
      };
    }
    if (act.includes('REGISTER')) {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-300/80',
        icon: UserPlus,
        label: 'Đăng ký'
      };
    }
    if (act.includes('ITINERARY')) {
      return {
        bg: 'bg-clay-50 text-clay-800 border-clay-300/80',
        icon: Compass,
        label: 'Lịch trình'
      };
    }
    if (act.includes('POST')) {
      return {
        bg: 'bg-[#F8F4EC] text-ink-700 border-ink-200/80',
        icon: FileText,
        label: 'Bài viết'
      };
    }
    if (act.includes('LOCK') || act.includes('BAN')) {
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-300/80',
        icon: AlertTriangle,
        label: 'Khóa / Chặn'
      };
    }
    if (act.includes('MODERATION_APPROVE')) {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-300/80',
        icon: ShieldCheck,
        label: 'Duyệt xuất bản'
      };
    }
    if (act.includes('MODERATION_DISMISS')) {
      return {
        bg: 'bg-[#F8F4EC] text-ink-600 border-ink-200/80',
        icon: ShieldCheck,
        label: 'Bác bỏ báo cáo'
      };
    }
    if (act.includes('MODERATION_HIDE')) {
      return {
        bg: 'bg-amber-50 text-amber-900 border-amber-300/80',
        icon: AlertTriangle,
        label: 'Tạm ẩn bài'
      };
    }
    if (act.includes('MODERATION_UNHIDE')) {
      return {
        bg: 'bg-clay-50 text-clay-800 border-clay-300/80',
        icon: RefreshCw,
        label: 'Bỏ ẩn bài'
      };
    }
    if (act.includes('MODERATION_REMOVE_BAN') || act.includes('MODERATION_DELETE')) {
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-300/80',
        icon: AlertTriangle,
        label: 'Gỡ bài / Vi phạm'
      };
    }
    if (act.includes('ROLE') || act.includes('MANAGEMENT')) {
      return {
        bg: 'bg-amber-50 text-amber-900 border-amber-300/80',
        icon: Shield,
        label: 'Phân quyền'
      };
    }
    if (act.includes('AI')) {
      return {
        bg: 'bg-clay-50 text-clay-800 border-clay-300/80',
        icon: Cpu,
        label: 'Trợ lý AI'
      };
    }
    return {
      bg: 'bg-[#F8F4EC] text-ink-700 border-ink-200/80',
      icon: Layers,
      label: action
    };
  };

  const getCategoryBadge = (category) => {
    const cat = (category || 'ACTIVITY').toUpperCase();
    switch (cat) {
      case 'AUTH':
        return {
          bg: 'bg-[#F8F4EC] text-ink-700 border-ink-200/80',
          label: 'AUTH',
          title: 'Nhật ký Xác thực & Tài khoản'
        };
      case 'SECURITY':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          label: 'SECURITY',
          title: 'Nhật ký An toàn & Kiểm duyệt'
        };
      case 'SYSTEM':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-200',
          label: 'SYSTEM',
          title: 'Nhật ký Cấu hình & Hệ thống'
        };
      case 'ACTIVITY':
      default:
        return {
          bg: 'bg-clay-50 text-clay-800 border-clay-200',
          label: 'ACTIVITY',
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

  // Safe selected user lookup (avoids TypeError: usersList.find is not a function)
  const selectedUserObj = Array.isArray(usersList)
    ? usersList.find(u => String(u.id) === String(selectedUserId))
    : null;

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
      {/* 1. Header & Title (Paper-Ink-Clay) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-200/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-ink-500 mb-1">
            <History className="w-3.5 h-3.5 text-clay-600" />
            <span>Audit & Compliance Center</span>
            <span>•</span>
            <span className="text-clay-600 font-bold">Nhật ký hệ thống</span>
          </div>
          <h1 className="font-display font-black text-2xl lg:text-3xl text-ink-800 tracking-tight flex items-center gap-3">
            Nhật Ký Hệ Thống & Hoạt Động
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] text-[10px] font-mono uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
              Live Audit Stream
            </span>
          </h1>
          <p className="text-xs text-ink-500 mt-1 max-w-2xl">
            Theo dõi chi tiết toàn bộ lịch sử đăng nhập, phân quyền RBAC, kiểm duyệt an toàn nội dung và thao tác của người dùng.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[5px] bg-[#FFFDF8] hover:bg-[#F3EFE6] text-ink-700 font-serif font-bold text-xs border border-ink-200/80 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Tải lại nhật ký"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-clay-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Đồng bộ</span>
          </button>

          <button
            onClick={() => handleDownloadFile(selectedCategory)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[5px] bg-[#FFFDF8] hover:bg-[#F3EFE6] text-ink-700 font-serif font-bold text-xs border border-ink-200/80 shadow-xs transition-colors cursor-pointer"
            title="Tải xuống tệp nhật ký nguyên bản (.log)"
          >
            <Download className="w-3.5 h-3.5 text-ink-500" />
            <span>Tải File Log (.log)</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[5px] bg-clay-600 hover:bg-clay-700 text-white font-serif font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards (Paper-Ink-Clay) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-[5px] bg-[#F8F4EC] border border-ink-200/60 text-clay-600 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-500">Tổng bản ghi nhật ký</p>
            <p className="font-display font-black text-2xl lg:text-3xl text-ink-800 mt-0.5">
              {stats.totalLogs?.toLocaleString() || 0}
            </p>
            <span className="font-mono text-[10px] text-emerald-700 font-bold">Lưu trữ Rolling File</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-[5px] bg-[#F8F4EC] border border-ink-200/60 text-clay-600 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-500">Hoạt động hôm nay</p>
            <p className="font-display font-black text-2xl lg:text-3xl text-clay-700 mt-0.5">
              {stats.logsToday?.toLocaleString() || 0}
            </p>
            <span className="font-mono text-[10px] text-ink-500">Theo thời gian thực</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-[5px] bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-500">Phân loại hành động</p>
            <p className="font-display font-black text-2xl lg:text-3xl text-ink-800 mt-0.5">
              {stats.distinctActionsCount || actionsList.length || 0} <span className="text-xs font-serif font-normal text-ink-400">loại</span>
            </p>
            <span className="font-mono text-[10px] text-amber-800 font-bold">4 file phân loại độc lập</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-[5px] bg-clay-50 border border-clay-200/80 text-clay-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-500">Cơ chế File Rolling</p>
            <p className="font-serif font-bold text-sm text-ink-800 mt-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
              Xoay vòng 30 ngày
            </p>
            <span className="font-mono text-[10px] text-ink-400">Tự động nén .gz</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] p-4 shadow-xs space-y-3.5">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-ink-200/80">
          {[
            { id: 'ALL', label: 'Tất cả phân loại', count: stats.totalLogs, icon: Layers },
            { id: 'AUTH', label: 'Xác thực (AUTH)', count: stats.authCount, icon: KeyRound },
            { id: 'SECURITY', label: 'An ninh & Kiểm duyệt', count: stats.securityCount, icon: ShieldCheck },
            { id: 'ACTIVITY', label: 'Nghiệp vụ (ACTIVITY)', count: stats.activityCount, icon: Compass },
            { id: 'SYSTEM', label: 'Hệ thống (SYSTEM)', count: stats.systemCount, icon: Cpu }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setSelectedCategory(tab.id); setPage(0); }}
                className={`px-3 py-1.5 rounded-[4px] font-serif text-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-clay-600 text-white font-bold shadow-xs'
                    : 'bg-[#F8F4EC] text-ink-700 hover:bg-[#EBE5D8] border border-ink-200/80 font-medium'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span className={`px-1.5 py-0.2 rounded-[3px] font-mono text-[10px] ${active ? 'bg-white/20 text-white font-bold' : 'bg-ink-100 text-ink-700'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search & Select Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          
          {/* Keyword Search Input */}
          <div className="sm:col-span-5 relative">
            <Search className="w-3.5 h-3.5 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
              placeholder="Tìm hành động, nội dung, IP, tên hoặc email..."
              className="w-full pl-8 pr-3 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] text-xs text-ink-800 placeholder:text-ink-400 outline-none focus:border-clay-600 font-sans"
            />
          </div>

          {/* User Selector Dropdown */}
          <div className="sm:col-span-4 relative">
            <div className="relative">
              <User className="w-3.5 h-3.5 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedUserId}
                onChange={(e) => { setSelectedUserId(e.target.value); setPage(0); }}
                className="w-full pl-8 pr-8 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] text-xs font-serif font-semibold text-ink-700 outline-none focus:border-clay-600 cursor-pointer appearance-none"
              >
                <option value="">— Lọc theo tất cả người dùng —</option>
                {(Array.isArray(usersList) ? usersList : []).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName || u.email} ({u.email})
                  </option>
                ))}
              </select>
              <Filter className="w-3 h-3 text-ink-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Action Type Dropdown */}
          <div className="sm:col-span-3 relative">
            <select
              value={selectedAction}
              onChange={(e) => { setSelectedAction(e.target.value); setPage(0); }}
              className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] text-xs font-serif font-semibold text-ink-700 outline-none focus:border-clay-600 cursor-pointer"
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
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-ink-200/80">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500 font-bold">Bộ lọc đang bật:</span>

            {selectedCategory !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#F8F4EC] text-ink-800 border border-ink-200/80 font-mono text-xs">
                <span>Phân loại: {selectedCategory}</span>
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className="hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedUserObj && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#F8F4EC] text-ink-800 border border-ink-200/80 font-serif font-bold text-xs">
                <User className="w-3 h-3 text-clay-600" />
                <span>Người dùng: {selectedUserObj.fullName || selectedUserObj.email}</span>
                <button
                  onClick={() => setSelectedUserId('')}
                  className="hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedAction !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#F8F4EC] text-ink-800 border border-ink-200/80 font-mono text-xs">
                <span>Hành động: {selectedAction}</span>
                <button
                  onClick={() => setSelectedAction('ALL')}
                  className="hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {keyword && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#F8F4EC] text-ink-800 border border-ink-200/80 font-sans text-xs">
                <span>Từ khóa: "{keyword}"</span>
                <button
                  onClick={() => setKeyword('')}
                  className="hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="font-serif text-xs font-bold text-rose-700 hover:text-rose-800 hover:underline cursor-pointer ml-auto"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* 4. Logs Data Table (Paper-Ink-Clay) */}
      <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8F4EC] border-b border-ink-200/80 font-mono text-[10px] font-bold text-ink-500 uppercase tracking-wider">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3 min-w-[150px]">Thời gian</th>
                <th className="py-2.5 px-3 min-w-[190px]">Người dùng phát sinh</th>
                <th className="py-2.5 px-3 min-w-[110px]">Phân loại</th>
                <th className="py-2.5 px-3 min-w-[140px]">Hành động</th>
                <th className="py-2.5 px-3 min-w-[260px]">Nội dung & Chi tiết nghiệp vụ</th>
                <th className="py-2.5 px-3 min-w-[140px]">IP & Thiết bị</th>
                <th className="py-2.5 px-3 w-16 text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 text-ink-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center">
                    <div className="inline-flex flex-col items-center gap-2 text-ink-400">
                      <RefreshCw className="w-5 h-5 animate-spin text-clay-600" />
                      <span className="font-serif">Đang đồng bộ nhật ký hệ thống...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-ink-400">
                    <div className="inline-flex flex-col items-center gap-1.5">
                      <Info className="w-7 h-7 text-ink-300" />
                      <p className="font-serif font-bold text-ink-700">Không tìm thấy bản ghi nhật ký phù hợp</p>
                      <p className="font-sans text-[11px] text-ink-400">Thử thay đổi từ khóa hoặc xóa bớt bộ lọc tìm kiếm</p>
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
                      className="hover:bg-[#F8F4EC]/70 transition-colors"
                    >
                      {/* Index */}
                      <td className="py-2.5 px-3 text-center font-mono text-[10px] text-ink-400">
                        {page * pageSize + idx + 1}
                      </td>

                      {/* Created At */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 font-serif font-bold text-ink-800 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-clay-600"></span>
                            <span>{formatRelativeTime(logItem.createdAt) || 'Vừa xong'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-ink-400 font-mono">
                            <Calendar className="w-2.5 h-2.5" />
                            <span>{formatDate(logItem.createdAt)}</span>
                          </div>
                        </div>
                      </td>

                      {/* User Cell */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              logItem.userAvatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                            }
                            alt={logItem.userName}
                            className="w-7 h-7 rounded-[4px] object-cover border border-ink-200/80 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-serif font-bold text-ink-800 truncate">
                                {logItem.userName || 'Hệ thống'}
                              </span>
                              {logItem.userId && (
                                <button
                                  type="button"
                                  onClick={() => handleSelectUserFilter(logItem.userId)}
                                  className={`text-[9px] px-1 py-0.2 rounded-[3px] font-mono font-bold transition-colors cursor-pointer ${
                                    isCurrentFilterUser
                                      ? 'bg-clay-600 text-white'
                                      : 'bg-[#F8F4EC] text-ink-600 hover:bg-clay-100 hover:text-clay-800'
                                  }`}
                                  title="Lọc hiển thị nhật ký người dùng này"
                                >
                                  {isCurrentFilterUser ? 'Đang lọc' : 'Lọc user'}
                                </button>
                              )}
                            </div>
                            <p className="text-[10px] font-mono text-ink-400 truncate">
                              {logItem.userEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {(() => {
                          const catBadge = getCategoryBadge(logItem.category || logItem.action);
                          return (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-[4px] font-mono text-[9px] font-bold border ${catBadge.bg}`}
                              title={catBadge.title}
                            >
                              {catBadge.label}
                            </span>
                          );
                        })()}
                      </td>

                      {/* Action Badge */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] font-serif text-[10px] font-bold border ${badge.bg}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{logItem.action}</span>
                        </span>
                      </td>

                      {/* Details */}
                      <td className="py-2.5 px-3">
                        <p className="line-clamp-2 text-ink-700 font-sans text-xs leading-relaxed">
                          {logItem.details || '—'}
                        </p>
                      </td>

                      {/* IP & User Agent */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.2 rounded-[3px] bg-[#F8F4EC] text-ink-700 border border-ink-200/60 font-bold">
                            <Globe className="w-2.5 h-2.5 text-clay-600" />
                            {logItem.ipAddress || '127.0.0.1'}
                          </span>
                          <p className="text-[10px] text-ink-400 flex items-center gap-1 font-mono truncate max-w-[150px]" title={logItem.userAgent}>
                            <Monitor className="w-2.5 h-2.5 shrink-0" />
                            <span>{parseDevice(logItem.userAgent)}</span>
                          </p>
                        </div>
                      </td>

                      {/* Action Button */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => setSelectedLog(logItem)}
                          className="w-7 h-7 rounded-[4px] hover:bg-[#EBE5D8] text-ink-500 hover:text-clay-600 inline-flex items-center justify-center transition-colors cursor-pointer"
                          title="Xem chi tiết bản ghi nhật ký"
                        >
                          <Eye className="w-3.5 h-3.5" />
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 bg-[#F8F4EC] border-t border-ink-200/80 text-xs text-ink-500 font-mono">
          <div>
            Hiển thị <strong className="text-ink-800">{logs.length}</strong> / <strong className="text-ink-800">{totalElements}</strong> bản ghi nhật ký
            {totalPages > 1 && (
              <span className="ml-1.5 font-bold">
                (Trang {page + 1} / {totalPages})
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 0))}
              disabled={page === 0 || loading}
              className="w-7 h-7 rounded-[4px] bg-[#FFFDF8] border border-ink-200/80 flex items-center justify-center text-ink-700 hover:bg-[#F3EFE6] disabled:opacity-40 cursor-pointer"
              title="Trang trước"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <span className="px-2.5 py-1 rounded-[4px] bg-clay-600 text-white font-mono font-bold text-xs">
              {page + 1}
            </span>

            <button
              onClick={() => setPage(p => (p + 1 < totalPages ? p + 1 : p))}
              disabled={page + 1 >= totalPages || loading}
              className="w-7 h-7 rounded-[4px] bg-[#FFFDF8] border border-ink-200/80 flex items-center justify-center text-ink-700 hover:bg-[#F3EFE6] disabled:opacity-40 cursor-pointer"
              title="Trang sau"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Log Detail Modal (Paper-Ink-Clay) */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] max-w-lg w-full p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-ink-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[4px] bg-clay-100 text-clay-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-ink-800">
                    Chi Tiết Nhật Ký Hệ Thống #{selectedLog.id}
                  </h3>
                  <p className="font-mono text-[10px] text-ink-400">
                    Ghi nhận: {formatDate(selectedLog.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-7 h-7 rounded-[4px] hover:bg-[#F8F4EC] text-ink-400 hover:text-ink-700 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-3.5 text-xs">
              {/* User info */}
              <div className="p-3 rounded-[5px] bg-[#F8F4EC] border border-ink-200/60 flex items-center gap-3">
                <img
                  src={
                    selectedLog.userAvatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                  }
                  alt={selectedLog.userName}
                  className="w-10 h-10 rounded-[4px] object-cover border border-ink-200/80 shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-serif font-bold text-ink-800 text-sm">
                    {selectedLog.userName || 'Hệ thống (System)'}
                  </p>
                  <p className="font-mono text-[10px] text-ink-500 truncate">
                    {selectedLog.userEmail} {selectedLog.userHandle ? `• @${selectedLog.userHandle}` : ''}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.2 rounded-[3px] font-mono text-[9px] font-bold bg-[#EBE5D8] text-ink-700 border border-ink-200/60">
                    Vai trò: {selectedLog.userRole || 'MEMBER'}
                  </span>
                </div>
              </div>

              {/* Category & Action type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-500 block mb-1">
                    Phân loại
                  </label>
                  <div className="p-2 rounded-[5px] bg-[#F8F4EC] border border-ink-200/60 flex items-center">
                    {(() => {
                      const cb = getCategoryBadge(selectedLog.category || selectedLog.action);
                      return (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-[3px] font-mono text-[10px] font-bold border ${cb.bg}`}>
                          {cb.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <div>
                  <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-500 block mb-1">
                    Hành động
                  </label>
                  <div className="p-2 rounded-[5px] bg-[#F8F4EC] border border-ink-200/60 font-mono font-bold text-clay-700 text-xs truncate">
                    {selectedLog.action}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div>
                <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-500 block mb-1">
                  Nội dung chi tiết (Audit Details)
                </label>
                <div className="p-3 rounded-[5px] bg-[#F8F4EC] border border-ink-200/60 text-ink-800 leading-relaxed font-sans text-xs">
                  {selectedLog.details || 'Không có chi tiết bổ sung'}
                </div>
              </div>

              {/* Network & Device Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-500 block mb-1">
                    Địa chỉ IP
                  </label>
                  <div className="p-2 rounded-[5px] bg-[#F8F4EC] border border-ink-200/60 font-mono text-ink-800 text-xs">
                    {selectedLog.ipAddress || '127.0.0.1'}
                  </div>
                </div>
                <div>
                  <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-500 block mb-1">
                    Mã bản ghi ID
                  </label>
                  <div className="p-2 rounded-[5px] bg-[#F8F4EC] border border-ink-200/60 font-mono text-ink-800 text-xs">
                    #{selectedLog.id}
                  </div>
                </div>
              </div>

              {/* User Agent */}
              <div>
                <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-500 block mb-1">
                  User Agent
                </label>
                <div className="p-2 rounded-[5px] bg-[#F8F4EC] border border-ink-200/60 font-mono text-[10px] text-ink-600 break-all">
                  {selectedLog.userAgent || 'Internal System'}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-ink-200/80 flex items-center justify-between">
              {selectedLog.userId && (
                <button
                  type="button"
                  onClick={() => {
                    handleSelectUserFilter(selectedLog.userId);
                    setSelectedLog(null);
                  }}
                  className="px-3 py-1.5 rounded-[5px] bg-[#F8F4EC] text-clay-700 font-serif font-bold text-xs hover:bg-clay-100 border border-ink-200/80 transition-colors cursor-pointer"
                >
                  Lọc tất cả nhật ký của user này
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="ml-auto px-4 py-2 rounded-[5px] bg-clay-600 text-white font-serif font-bold text-xs hover:bg-clay-700 transition-colors cursor-pointer shadow-xs"
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
