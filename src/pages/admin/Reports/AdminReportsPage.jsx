import React, { useState, useEffect } from 'react';
import { useToast } from '../../../components/common/Toast';
import { adminReportApi } from '../../../services/api';
import {
  MessageSquare,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  UserX,
  Trash2,
  RefreshCw,
  TrendingUp,
  FileText,
  ShieldCheck,
  Bot,
  ExternalLink,
  History,
  Building,
  X,
  MapPin,
  Calendar,
  Sparkles
} from 'lucide-react';

export const AdminReportsPage = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'all' | 'hidden' | 'audit'
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

  // Local Audit Log session
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 1,
      admin: 'Quản Trị Viên (Admin)',
      action: 'Khởi tạo hệ thống',
      target: 'WanderAI Moderation Shield v2.4 Active',
      time: 'Vừa xong',
      type: 'system'
    }
  ]);

  // Load Real Data from Backend
  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [metricsData, pendingReportsData, allArticlesData] = await Promise.all([
        adminReportApi.getMetrics(),
        adminReportApi.getPendingReports(searchQuery),
        adminReportApi.getAllArticles({ keyword: searchQuery, status: activeTab })
      ]);

      setMetrics(metricsData);
      setReports(pendingReportsData);
      setArticles(allArticlesData);

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
    loadData();
  }, [activeTab]);

  // Actions on Reported Posts
  const handleApprovePost = async (id, title = '') => {
    try {
      await adminReportApi.approvePost(id);
      setReports(prev => prev.filter(r => r.id !== id));
      setMetrics(prev => ({
        ...prev,
        pendingReportsCount: Math.max(0, prev.pendingReportsCount - 1)
      }));
      setAuditLogs(prev => [
        {
          id: Date.now(),
          admin: 'Quản Trị Viên (Admin)',
          action: 'Phê duyệt xuất bản bài viết',
          target: `Bài viết #${id} ${title ? `("${title}")` : ''}`,
          time: 'Vừa xong',
          type: 'success'
        },
        ...prev
      ]);
      toast.success(`Đã phê duyệt xuất bản bài viết #${id} thành công! Hệ thống đã gửi thông báo đến tác giả.`);
      if (selectedPostModal && selectedPostModal.id === id) {
        setSelectedPostModal(null);
      }
    } catch (err) {
      toast.error('Lỗi khi phê duyệt bài viết: ' + err.message);
    }
  };

  const handleDismissReport = async (id, title = '') => {
    try {
      await adminReportApi.dismissReport(id);
      setReports(prev => prev.filter(r => r.id !== id));
      setMetrics(prev => ({
        ...prev,
        pendingReportsCount: Math.max(0, prev.pendingReportsCount - 1)
      }));
      setAuditLogs(prev => [
        {
          id: Date.now(),
          admin: 'Quản Trị Viên (Admin)',
          action: 'Bác bỏ báo cáo (Hợp lệ)',
          target: `Bài viết #${id} ${title ? `("${title}")` : ''}`,
          time: 'Vừa xong',
          type: 'info'
        },
        ...prev
      ]);
      toast.info(`Đã bác bỏ báo cáo bài viết #${id} (Nội dung hợp lệ). Hệ thống đã gửi thông báo xác nhận đến tác giả.`);
      if (selectedPostModal && selectedPostModal.id === id) {
        setSelectedPostModal(null);
      }
    } catch (err) {
      toast.error('Lỗi khi bác bỏ báo cáo: ' + err.message);
    }
  };

  const executeHidePost = async (id, title = '') => {
    try {
      await adminReportApi.hidePost(id);
      setReports(prev => prev.filter(r => r.id !== id));
      setMetrics(prev => ({
        ...prev,
        pendingReportsCount: Math.max(0, prev.pendingReportsCount - 1),
        hiddenPostsCount: prev.hiddenPostsCount + 1
      }));
      setAuditLogs(prev => [
        {
          id: Date.now(),
          admin: 'Quản Trị Viên (Admin)',
          action: 'Tạm ẩn bài viết',
          target: `Bài viết #${id} ${title ? `("${title}")` : ''}`,
          time: 'Vừa xong',
          type: 'warning'
        },
        ...prev
      ]);
      toast.warning(`Đã tạm ẩn bài viết #${id} khỏi cộng đồng! Hệ thống đã gửi thông báo cảnh báo đến tác giả.`);
      if (selectedPostModal && selectedPostModal.id === id) {
        setSelectedPostModal(null);
      }
      setConfirmModal(null);
    } catch (err) {
      toast.error('Lỗi khi tạm ẩn bài viết: ' + err.message);
    }
  };

  const executeBanUser = async (id, authorName, title = '') => {
    try {
      await adminReportApi.removePostAndBanAuthor(id);
      setReports(prev => prev.filter(r => r.id !== id));
      setMetrics(prev => ({
        ...prev,
        pendingReportsCount: Math.max(0, prev.pendingReportsCount - 1),
        hiddenPostsCount: prev.hiddenPostsCount + 1
      }));
      setAuditLogs(prev => [
        {
          id: Date.now(),
          admin: 'Quản Trị Viên (Admin)',
          action: 'Gỡ bài & Khóa tài khoản',
          target: `Tác giả: ${authorName} (Bài #${id})`,
          time: 'Vừa xong',
          type: 'error'
        },
        ...prev
      ]);
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

  // Export CSV
  const handleExportCSV = () => {
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
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* 1. Header Toolbar */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full bg-sky-50 text-sky-700 font-extrabold text-[11px] uppercase tracking-wide border border-sky-100">
              Ban Quản Trị Cộng Đồng
            </span>
            <span className="text-slate-300">/</span>
            <span className="font-extrabold text-xs text-orange-600">Khối xử lý vi phạm (Real-time DB)</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">
            Kiểm duyệt Bài viết & Xử lý Báo cáo
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Giám sát nội dung cộng đồng, kiểm duyệt các bài viết check-in và xử lý khiếu nại báo cáo vi phạm từ người dùng với AI Moderation Engine.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm ID bài, từ khóa, tác giả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Đồng bộ</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-full text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards (4 Thẻ Thống Kê Nhanh từ DB) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">Tổng bài viết hôm nay</span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="font-display font-extrabold text-3xl text-slate-900 leading-none mb-1.5">
              {metrics.totalPostsToday}
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-sky-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{metrics.growthPercent}%</span>
              <span className="text-slate-400 font-normal">so với hôm qua</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">Báo cáo chờ xử lý</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className={`w-5 h-5 ${metrics.pendingReportsCount > 0 ? 'animate-pulse' : ''}`} />
            </div>
          </div>
          <div>
            <div className="font-display font-extrabold text-3xl text-rose-600 leading-none mb-1.5">
              {metrics.pendingReportsCount}
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-rose-600">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Cần duyệt</span>
              <span className="text-slate-400 font-normal">({metrics.pendingReportsCount} trọng điểm)</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">Đã gỡ / Tạm ẩn</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <EyeOff className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="font-display font-extrabold text-3xl text-slate-900 leading-none mb-1.5">
              {metrics.hiddenPostsCount}
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Vi phạm quy chuẩn</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">Tỷ lệ nội dung an toàn</span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="font-display font-extrabold text-3xl text-sky-600 leading-none mb-1.5">
              {metrics.safeRate}%
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-sky-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>AI Auto-filter tự động</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Navigation Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-white text-rose-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {metrics.pendingReportsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          )}
          <span>Chờ xử lý báo cáo</span>
          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px]">
            {metrics.pendingReportsCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-white text-slate-900 shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Tất cả bài viết cộng đồng</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px]">
            {metrics.totalArticlesCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('hidden')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'hidden'
              ? 'bg-white text-slate-900 shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Bài viết đã ẩn / Vi phạm</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px]">
            {metrics.hiddenPostsCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-white text-slate-900 shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5 text-slate-500" />
          <span>Nhật ký kiểm duyệt (Audit Log)</span>
        </button>
      </div>

      {/* 4. Tab Content */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <h2 className="font-display font-extrabold text-lg text-slate-900">
                Danh sách báo cáo trọng điểm cần xử lý ngay
              </h2>
            </div>
            <span className="text-xs text-slate-400">Ưu tiên xử lý</span>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
              <RefreshCw className="w-8 h-8 text-sky-500 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Đang tải danh sách báo cáo từ máy chủ...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
              <CheckCircle2 className="w-12 h-12 text-sky-500 mx-auto mb-3" />
              <h3 className="font-bold text-base text-slate-800">Không còn báo cáo vi phạm nào!</h3>
              <p className="text-xs text-slate-400 mt-1">Tất cả bài viết báo cáo đã được ban quản trị xử lý sạch sẽ.</p>
            </div>
          ) : (
            filteredReports.map(report => (
              <article
                key={report.id}
                className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80 hover:shadow-md transition-shadow relative flex flex-col md:flex-row gap-6 overflow-hidden"
              >
                {/* Left Accent Bar */}
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 rounded-l-2xl ${
                  report.categoryType === 'error' ? 'bg-rose-500' : report.categoryType === 'warning' ? 'bg-amber-500' : 'bg-sky-500'
                }`}></div>

                {/* Image Preview */}
                <div className="w-full md:w-64 lg:w-72 shrink-0">
                  <div className="relative rounded-xl overflow-hidden w-full h-48 md:h-full min-h-[190px] max-h-[280px] bg-slate-100">
                    <img 
                      src={report.imageUrl} 
                      alt={report.title} 
                      className="w-full h-full object-cover block" 
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-rose-600 text-white font-extrabold text-[10px] flex items-center gap-1 shadow-sm z-10">
                      <Flame className="w-3 h-3" />
                      <span>{report.badgeText || (report.reportsCount + ' Lượt báo cáo')}</span>
                    </span>
                    {report.locationTag && (
                      <span className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-slate-950/80 text-white font-bold text-[10px] backdrop-blur-md z-10">
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
                        <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                          report.categoryType === 'error'
                            ? 'bg-rose-100 text-rose-700'
                            : report.categoryType === 'warning'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-sky-100 text-sky-800'
                        }`}>
                          {report.category}
                        </span>
                        <span className="text-xs font-mono text-slate-400">Mã bài: #{report.postCode || report.id}</span>
                      </div>
                      <span className="text-xs text-slate-400">{report.timeAgo}</span>
                    </div>

                    <h3 className="font-display font-extrabold text-base text-slate-900 mb-2">
                      {report.title}
                    </h3>

                    {/* Author Meta */}
                    <div className="flex items-center gap-2 mb-3 text-xs text-slate-600">
                      <span className="font-bold text-slate-900">{report.authorName}</span>
                      <span className="text-slate-400">{report.authorHandle}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="text-slate-500 font-medium">{report.authorAccountAge}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="text-sky-600 font-semibold">Trust: {report.authorTrustScore || 80}/100</span>
                    </div>

                    {/* Flag Reason Detail Box */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-3 space-y-1">
                      <div className="flex items-start gap-2 text-xs">
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold text-slate-900">Lý do báo cáo & Cảnh báo AI: </strong>
                          <span className="text-slate-600">{report.reportReason || report.aiFlagReason}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 italic">
                      "{report.snippet}"
                    </p>
                  </div>

                  {/* Admin Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPostModal(report)}
                        className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem toàn bộ</span>
                      </button>
                      <button
                        onClick={() => handleApprovePost(report.id, report.title)}
                        className="px-3.5 py-1.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Duyệt xuất bản</span>
                      </button>
                      <button
                        onClick={() => handleDismissReport(report.id, report.title)}
                        className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Bỏ qua (Hợp lệ)
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setConfirmModal({ type: 'hide', post: report })}
                        className="px-3.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Tạm ẩn bài</span>
                      </button>
                      <button
                        onClick={() => setConfirmModal({ type: 'ban', post: report })}
                        className="px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Khóa bài & Cảnh cáo</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {/* 5. Data Table Section for All & Hidden Articles */}
      {(activeTab === 'all' || activeTab === 'hidden') && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
            <div>
              <h3 className="font-display font-extrabold text-base text-slate-900">
                {activeTab === 'hidden' ? 'Danh sách bài viết đã ẩn / Vi phạm' : 'Toàn bộ bài viết cộng đồng gần đây'}
              </h3>
              <p className="text-xs text-slate-400">Kiểm toán tự động theo thời gian thực kết hợp AI Auto-Tagger</p>
            </div>
            <button
              onClick={() => loadData(true)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer shrink-0"
              title="Làm mới bảng"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200/80">
                  <th className="py-3 px-4">Mã ID</th>
                  <th className="py-3 px-4">Tiêu đề bài viết</th>
                  <th className="py-3 px-4">Tác giả</th>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Trạng thái AI</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                {filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      Không có bài viết nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map(art => (
                    <tr key={art.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-400 font-bold">#{art.postCode || art.id}</td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-bold text-slate-900 truncate">{art.title}</p>
                        <span className="text-[11px] text-slate-400">{art.locationTag}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-800">{art.authorName}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">{art.timeAgo}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          art.status === 'HIDDEN' || art.status === 'REMOVED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : (art.aiSafetyScore || 100) >= 80
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
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
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer mr-1"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmModal({ type: 'delete', post: art })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Xóa bài viết"
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
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <History className="w-5 h-5 text-sky-600" />
            <h3 className="font-display font-extrabold text-base text-slate-900">
              Nhật ký kiểm toán vi phạm & Thao tác Quản trị
            </h3>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div 
                key={log.id} 
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    log.type === 'error' ? 'bg-rose-500' : log.type === 'warning' ? 'bg-amber-500' : 'bg-sky-500'
                  }`}></span>
                  <div>
                    <span className="font-bold text-slate-900">{log.action}: </span>
                    <span className="text-slate-600">{log.target}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <span className="font-semibold text-slate-500">{log.admin}</span>
                  <span>•</span>
                  <span>{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Modal: Xem chi tiết bài viết (Post Preview Modal) */}
      {selectedPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">
                  #{selectedPostModal.postCode || selectedPostModal.id}
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Chi tiết bài viết cộng đồng</h3>
              </div>
              <button 
                onClick={() => setSelectedPostModal(null)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedPostModal.imageUrl && (
              <img 
                src={selectedPostModal.imageUrl} 
                alt={selectedPostModal.title}
                className="w-full h-56 object-cover rounded-2xl border border-slate-200"
              />
            )}

            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                  {selectedPostModal.category}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-500" /> {selectedPostModal.locationTag}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 font-display mb-2">
                {selectedPostModal.title}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {selectedPostModal.content || selectedPostModal.snippet}
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/60 text-xs text-amber-900 space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> WanderAI Security Analysis
                </span>
                <span>Điểm an toàn: {selectedPostModal.aiSafetyScore || 98}/100</span>
              </div>
              <p className="text-[11px] text-slate-600">
                {selectedPostModal.aiFlagReason || 'Nội dung phù hợp quy chuẩn cộng đồng Wayfare.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleApprovePost(selectedPostModal.id, selectedPostModal.title)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Duyệt xuất bản</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDismissReport(selectedPostModal.id, selectedPostModal.title)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  Bỏ qua (Hợp lệ)
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmModal({ type: 'hide', post: selectedPostModal })}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Tạm ẩn bài</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmModal({ type: 'ban', post: selectedPostModal })}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Khóa bài & Cảnh cáo</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPostModal(null)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Action Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-[9998] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 border border-slate-100">
            <div className="flex items-start gap-3">
              <div className={`p-3 rounded-2xl shrink-0 ${
                confirmModal.type === 'ban' 
                  ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                  : confirmModal.type === 'hide'
                    ? 'bg-amber-50 text-amber-600 border border-amber-100'
                    : 'bg-rose-50 text-rose-600 border border-rose-100'
              }`}>
                {confirmModal.type === 'ban' && <ShieldAlert className="w-6 h-6" />}
                {confirmModal.type === 'hide' && <EyeOff className="w-6 h-6" />}
                {confirmModal.type === 'delete' && <Trash2 className="w-6 h-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-extrabold text-base text-slate-900 mb-1">
                  {confirmModal.type === 'ban' && 'Xác nhận Khóa bài & Cảnh cáo'}
                  {confirmModal.type === 'hide' && 'Xác nhận Tạm ẩn bài viết'}
                  {confirmModal.type === 'delete' && 'Xác nhận Xóa bài viết vĩnh viễn'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {confirmModal.type === 'ban' && (
                    <>
                      Bạn có chắc muốn gỡ bài viết <strong className="text-slate-800">#{confirmModal.post?.id}</strong> và tạm khóa tài khoản của tác giả <strong className="text-slate-800">{confirmModal.post?.authorName}</strong>? Hệ thống sẽ gửi thông báo cảnh cáo vi phạm đến người dùng.
                    </>
                  )}
                  {confirmModal.type === 'hide' && (
                    <>
                      Bài viết <strong className="text-slate-800">#{confirmModal.post?.id}</strong> sẽ bị tạm ẩn khỏi không gian công cộng. Hệ thống sẽ gửi thông báo đến tác giả.
                    </>
                  )}
                  {confirmModal.type === 'delete' && (
                    <>
                      Bài viết <strong className="text-slate-800">#{confirmModal.post?.id}</strong> sẽ bị xóa vĩnh viễn khỏi hệ thống. Thao tác này không thể hoàn tác và hệ thống sẽ gửi thông báo đến tác giả.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmModal.type === 'ban') {
                    executeBanUser(confirmModal.post?.id, confirmModal.post?.authorName, confirmModal.post?.title);
                  } else if (confirmModal.type === 'hide') {
                    executeHidePost(confirmModal.post?.id, confirmModal.post?.title);
                  } else if (confirmModal.type === 'delete') {
                    executeDeletePost(confirmModal.post?.id, confirmModal.post?.title);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer shadow-xs ${
                  confirmModal.type === 'ban' || confirmModal.type === 'delete'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {confirmModal.type === 'ban' && 'Khóa bài & Cảnh cáo'}
                {confirmModal.type === 'hide' && 'Xác nhận Ẩn bài'}
                {confirmModal.type === 'delete' && 'Xóa vĩnh viễn'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

