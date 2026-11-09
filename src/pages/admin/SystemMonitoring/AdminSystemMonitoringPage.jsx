import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Activity, 
  Database, 
  Server, 
  Cpu, 
  Clock, 
  RefreshCw, 
  Search, 
  HardDrive, 
  Layers, 
  ShieldCheck, 
  Terminal, 
  Table as TableIcon, 
  FileText, 
  Zap, 
  Info, 
  ArrowUpDown, 
  Key, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Boxes
} from 'lucide-react';
import { adminSystemApi } from '../../../services/api';
import { useToast } from '../../../components/common/Toast';

export const AdminSystemMonitoringPage = () => {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [gcLoading, setGcLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('database'); // 'database' | 'versions' | 'jvm'
  const [systemData, setSystemData] = useState(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(new Date());
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(0); // 0 (off), 15, 30, 60 seconds

  // Table filtering & search
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rows_desc'); // 'name_asc', 'name_desc', 'rows_desc', 'size_desc'
  const [tableFilter, setTableFilter] = useState('all'); // 'all', 'has_data', 'empty'

  // Table Detail Modal
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableDetail, setTableDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch system data
  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const data = await adminSystemApi.getOverview();
      setSystemData(data);
      setLastRefreshedAt(new Date());
    } catch (err) {
      console.error('[AdminSystemMonitoring] Failed to fetch system info:', err);
      toast.showError('Không thể tải dữ liệu giám sát hệ thống: ' + (err.message || 'Lỗi kết nối'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh timer
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;
    const intervalId = setInterval(() => {
      fetchData(true);
    }, autoRefreshInterval * 1000);
    return () => clearInterval(intervalId);
  }, [autoRefreshInterval, fetchData]);

  // Trigger GC
  const handleTriggerGc = async () => {
    if (!window.confirm('Bạn có chắc muốn gửi yêu cầu JVM thu dọn rác bộ nhớ (Garbage Collection)? Thao tác này sẽ giải phóng RAM không sử dụng.')) {
      return;
    }
    setGcLoading(true);
    try {
      await adminSystemApi.triggerGc();
      toast.showSuccess('Đã gửi yêu cầu thu dọn rác (GC) thành công!');
      setTimeout(() => fetchData(true), 1500);
    } catch (err) {
      toast.showError('Lỗi khi kích hoạt GC: ' + (err.message || 'Lỗi hệ thống'));
    } finally {
      setGcLoading(false);
    }
  };

  // Inspect Table Details
  const handleOpenTableDetails = async (tableName) => {
    setSelectedTable(tableName);
    setDetailLoading(true);
    try {
      const detail = await adminSystemApi.getTableDetails(tableName);
      setTableDetail(detail);
    } catch (err) {
      toast.showError(`Không thể lấy chi tiết bảng ${tableName}: ` + (err.message || ''));
      setSelectedTable(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseTableDetails = () => {
    setSelectedTable(null);
    setTableDetail(null);
  };

  // Filtered & Sorted Tables
  const filteredTables = useMemo(() => {
    if (!systemData?.tables) return [];
    let list = [...systemData.tables];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(t => 
        (t.tableName && t.tableName.toLowerCase().includes(q)) ||
        (t.comment && t.comment.toLowerCase().includes(q))
      );
    }

    // Filter
    if (tableFilter === 'has_data') {
      list = list.filter(t => (t.rowCount || 0) > 0);
    } else if (tableFilter === 'empty') {
      list = list.filter(t => (t.rowCount || 0) === 0);
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'name_asc') return (a.tableName || '').localeCompare(b.tableName || '');
      if (sortBy === 'name_desc') return (b.tableName || '').localeCompare(a.tableName || '');
      if (sortBy === 'rows_desc') return (b.rowCount || 0) - (a.rowCount || 0);
      if (sortBy === 'size_desc') return (b.totalSizeBytes || 0) - (a.totalSizeBytes || 0);
      return 0;
    });

    return list;
  }, [systemData?.tables, searchQuery, tableFilter, sortBy]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-clay-200 border-t-clay-600 animate-spin" />
        <p className="text-sm font-serif font-bold text-ink-700 animate-pulse">
          Đang truy xuất thông số hệ thống, JVM & cấu trúc CSDL...
        </p>
      </div>
    );
  }

  const { serverInfo, memoryInfo, threadInfo, databaseInfo, garbageCollectors } = systemData || {};

  return (
    <div className="space-y-6 pb-12">
      {/* ─── 1. TOP HEADER & ACTIONS ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-ink-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[6px] bg-clay-700 text-white flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-serif text-ink-900 tracking-tight">
                  Giám Sát Hệ Thống & Cơ Sở Dữ Liệu
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                  ONLINE
                </span>
              </div>
              <p className="text-xs text-ink-500 font-sans mt-0.5">
                Cập nhật lần cuối: <span className="font-mono font-semibold">{lastRefreshedAt.toLocaleTimeString('vi-VN')}</span> • Server: <span className="font-mono font-bold text-clay-700">{serverInfo?.appName || 'wayfare-backend'}</span> (Port: {serverInfo?.serverPort})
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Auto Refresh Select */}
          <div className="flex items-center gap-1.5 bg-[#FFFDF8] border border-ink-200/90 rounded-[5px] px-2.5 py-1.5 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-ink-400" />
            <span className="text-[11px] font-serif text-ink-600 font-semibold">Tự động:</span>
            <select
              value={autoRefreshInterval}
              onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
              className="bg-transparent text-[11px] font-mono font-bold text-clay-700 focus:outline-none cursor-pointer"
            >
              <option value={0}>Tắt</option>
              <option value={15}>15s</option>
              <option value={30}>30s</option>
              <option value={60}>60s</option>
            </select>
          </div>

          {/* Trigger GC Button */}
          <button
            type="button"
            onClick={handleTriggerGc}
            disabled={gcLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-serif font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-[5px] transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
            title="Kích hoạt Garbage Collector giải phóng bộ nhớ heap không sử dụng"
          >
            <Zap className={`w-3.5 h-3.5 text-amber-600 ${gcLoading ? 'animate-bounce' : ''}`} />
            <span>{gcLoading ? 'Đang dọn...' : 'Dọn RAM (GC)'}</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => fetchData()}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-serif font-bold text-white bg-clay-700 hover:bg-clay-800 rounded-[5px] shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Đang tải...' : 'Làm Mới'}</span>
          </button>
        </div>
      </div>

      {/* ─── 2. TOP METRIC SUMMARY CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Database Stats */}
        <div className="p-4 rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold text-ink-400 uppercase tracking-wider">Cơ sở dữ liệu</span>
            <div className="w-8 h-8 rounded-[5px] bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-serif text-ink-900">{databaseInfo?.totalTables || 0}</span>
              <span className="text-xs font-serif font-medium text-ink-500">bảng lưu trữ</span>
            </div>
            <p className="text-[11px] font-mono text-ink-600 mt-1">
              {databaseInfo?.totalRows?.toLocaleString() || 0} dòng • {databaseInfo?.totalSizeFormatted || '0 B'}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-ink-100 flex items-center justify-between text-[11px]">
            <span className="text-ink-500 font-sans">Động cơ:</span>
            <span className="font-mono font-bold text-emerald-800">{databaseInfo?.productName} {databaseInfo?.productVersion?.split('-')[0]}</span>
          </div>
        </div>

        {/* Card 2: JVM Memory Heap */}
        <div className="p-4 rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold text-ink-400 uppercase tracking-wider">Bộ nhớ JVM Heap</span>
            <div className="w-8 h-8 rounded-[5px] bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-serif text-ink-900">{memoryInfo?.usedMemoryFormatted || '0 B'}</span>
              <span className="text-xs font-mono font-bold text-clay-700">{memoryInfo?.usagePercent || 0}%</span>
            </div>
            {/* Memory Bar */}
            <div className="w-full bg-ink-100 h-2 rounded-full overflow-hidden mt-1.5">
              <div 
                className={`h-full transition-all duration-500 ${
                  (memoryInfo?.usagePercent || 0) > 85 ? 'bg-rose-500' :
                  (memoryInfo?.usagePercent || 0) > 70 ? 'bg-amber-500' : 'bg-emerald-600'
                }`}
                style={{ width: `${Math.min(100, Math.max(2, memoryInfo?.usagePercent || 0))}%` }}
              />
            </div>
            <p className="text-[11px] font-mono text-ink-500 mt-1">
              Tối đa: {memoryInfo?.maxMemoryFormatted || '0 B'} • Còn trống: {memoryInfo?.freeMemoryFormatted || '0 B'}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-ink-100 flex items-center justify-between text-[11px]">
            <span className="text-ink-500 font-sans">Trạng thái:</span>
            <span className="font-serif font-bold text-emerald-800">Hoạt động ổn định</span>
          </div>
        </div>

        {/* Card 3: Uptime */}
        <div className="p-4 rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold text-ink-400 uppercase tracking-wider">Thời gian hoạt động</span>
            <div className="w-8 h-8 rounded-[5px] bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg font-bold font-serif text-ink-900 leading-snug line-clamp-1">
              {serverInfo?.formattedUptime || 'Đang cập nhật...'}
            </span>
            <p className="text-[11px] font-sans text-ink-500 mt-1 line-clamp-1">
              Từ: <span className="font-mono">{serverInfo?.startTime ? new Date(serverInfo.startTime).toLocaleString('vi-VN') : 'N/A'}</span>
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-ink-100 flex items-center justify-between text-[11px]">
            <span className="text-ink-500 font-sans">Múi giờ:</span>
            <span className="font-mono font-bold text-blue-800">{serverInfo?.timeZone || 'Asia/Ho_Chi_Minh'}</span>
          </div>
        </div>

        {/* Card 4: Runtime Environment */}
        <div className="p-4 rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold text-ink-400 uppercase tracking-wider">Môi trường máy chủ</span>
            <div className="w-8 h-8 rounded-[5px] bg-clay-50 text-clay-700 flex items-center justify-center border border-clay-200">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-serif text-clay-900">Java {serverInfo?.javaVersion?.split('.')[0] || '21'}</span>
              <span className="text-xs font-mono font-medium text-ink-500">v{serverInfo?.javaVersion}</span>
            </div>
            <p className="text-[11px] font-sans text-ink-600 mt-1">
              Spring Boot <span className="font-mono font-bold">{serverInfo?.springBootVersion}</span>
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-ink-100 flex items-center justify-between text-[11px]">
            <span className="text-ink-500 font-sans">Hệ điều hành:</span>
            <span className="font-mono font-bold text-ink-800">{serverInfo?.osName} ({serverInfo?.availableProcessors} CPU)</span>
          </div>
        </div>
      </div>

      {/* ─── 3. SUB-TABS NAVIGATION ──────────────────────────────────────── */}
      <div className="flex border-b border-ink-200">
        <button
          type="button"
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-serif font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'database'
              ? 'border-clay-700 text-clay-800 bg-[#FFFDF8]'
              : 'border-transparent text-ink-500 hover:text-ink-800 hover:bg-[#F8F4EC]'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Danh Sách Bảng CSDL ({databaseInfo?.totalTables || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('versions')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-serif font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'versions'
              ? 'border-clay-700 text-clay-800 bg-[#FFFDF8]'
              : 'border-transparent text-ink-500 hover:text-ink-800 hover:bg-[#F8F4EC]'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Chi Tiết Phiên Bản & Môi Trường</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('jvm')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-serif font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'jvm'
              ? 'border-clay-700 text-clay-800 bg-[#FFFDF8]'
              : 'border-transparent text-ink-500 hover:text-ink-800 hover:bg-[#F8F4EC]'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Hiệu Năng JVM & Bộ Nhớ Heap</span>
        </button>
      </div>

      {/* ─── TAB 1: DATABASE TABLES ──────────────────────────────────────── */}
      {activeTab === 'database' && (
        <div className="space-y-4">
          {/* Connection Pool Banner */}
          {databaseInfo?.connectionPool && (
            <div className="p-3.5 rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-[4px] bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-serif font-bold text-ink-900">HikariCP Connection Pool:</span>{' '}
                  <span className="font-mono text-ink-600">{databaseInfo.connectionPool.poolName}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-mono">
                <span className="text-ink-600">Đang hoạt động: <strong className="text-emerald-700">{databaseInfo.connectionPool.activeConnections}</strong></span>
                <span className="text-ink-600">Đang rảnh: <strong className="text-blue-700">{databaseInfo.connectionPool.idleConnections}</strong></span>
                <span className="text-ink-600">Tổng kết nối: <strong className="text-ink-900">{databaseInfo.connectionPool.totalConnections} / {databaseInfo.connectionPool.maxPoolSize}</strong></span>
                <span className="text-ink-600">Chờ kết nối: <strong className="text-amber-700">{databaseInfo.connectionPool.threadsAwaitingConnection || 0}</strong></span>
              </div>
            </div>
          )}

          {/* Search, Filter & Controls */}
          <div className="p-4 rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm bảng theo tên hoặc mô tả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-sans bg-[#F8F4EC] border border-ink-200 rounded-[5px] focus:outline-none focus:border-clay-600 focus:bg-white text-ink-800"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Filter Pills */}
              <div className="inline-flex rounded-[5px] bg-[#F8F4EC] p-0.5 border border-ink-200">
                <button
                  type="button"
                  onClick={() => setTableFilter('all')}
                  className={`px-2.5 py-1 text-[11px] font-serif rounded-[4px] transition-colors cursor-pointer ${
                    tableFilter === 'all' ? 'bg-white text-clay-800 font-bold shadow-2xs' : 'text-ink-600 hover:text-ink-900'
                  }`}
                >
                  Tất cả ({systemData?.tables?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setTableFilter('has_data')}
                  className={`px-2.5 py-1 text-[11px] font-serif rounded-[4px] transition-colors cursor-pointer ${
                    tableFilter === 'has_data' ? 'bg-white text-clay-800 font-bold shadow-2xs' : 'text-ink-600 hover:text-ink-900'
                  }`}
                >
                  Có dữ liệu
                </button>
                <button
                  type="button"
                  onClick={() => setTableFilter('empty')}
                  className={`px-2.5 py-1 text-[11px] font-serif rounded-[4px] transition-colors cursor-pointer ${
                    tableFilter === 'empty' ? 'bg-white text-clay-800 font-bold shadow-2xs' : 'text-ink-600 hover:text-ink-900'
                  }`}
                >
                  Bảng trống (0 dòng)
                </button>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 bg-[#F8F4EC] border border-ink-200 rounded-[5px] px-2.5 py-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-ink-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-[11px] font-serif font-bold text-ink-700 focus:outline-none cursor-pointer"
                >
                  <option value="rows_desc">Số dòng (nhiều nhất)</option>
                  <option value="size_desc">Dung lượng (lớn nhất)</option>
                  <option value="name_asc">Tên bảng (A - Z)</option>
                  <option value="name_desc">Tên bảng (Z - A)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tables List */}
          <div className="rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-ink-200/80 bg-[#F8F4EC] text-ink-500 font-mono text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-4 font-bold">STT</th>
                    <th className="py-3 px-4 font-bold">Tên Bảng (MySQL Table)</th>
                    <th className="py-3 px-4 font-bold text-right">Số Bản Ghi</th>
                    <th className="py-3 px-4 font-bold text-right">Dữ Liệu</th>
                    <th className="py-3 px-4 font-bold text-right">Chỉ Mục (Index)</th>
                    <th className="py-3 px-4 font-bold text-right">Tổng Dung Lượng</th>
                    <th className="py-3 px-4 font-bold text-center">Số Cột</th>
                    <th className="py-3 px-4 font-bold">Engine</th>
                    <th className="py-3 px-4 font-bold">Collation</th>
                    <th className="py-3 px-4 font-bold text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100 text-xs">
                  {filteredTables.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-ink-400 font-serif">
                        Không tìm thấy bảng CSDL nào khớp với điều kiện tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filteredTables.map((table, idx) => (
                      <tr 
                        key={table.tableName} 
                        className="hover:bg-[#F8F4EC]/60 transition-colors group cursor-pointer"
                        onClick={() => handleOpenTableDetails(table.tableName)}
                      >
                        <td className="py-3 px-4 font-mono text-ink-400 text-[11px]">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-clay-600 shrink-0" />
                            <span className="font-mono font-bold text-clay-800 text-[13px] group-hover:text-clay-600 transition-colors">
                              {table.tableName}
                            </span>
                            {table.comment && (
                              <span className="text-[10px] text-ink-400 font-sans italic max-w-xs truncate" title={table.comment}>
                                ({table.comment})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold">
                          {table.rowCount > 0 ? (
                            <span className="px-2 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {table.rowCount.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-ink-400 font-normal">0</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-ink-600 text-[11px]">
                          {table.dataSizeFormatted}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-ink-500 text-[11px]">
                          {table.indexSizeFormatted}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-ink-800 text-[11px]">
                          {table.totalSizeFormatted}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          <span className="px-1.5 py-0.5 rounded bg-ink-100 text-ink-700 text-[10px] font-bold">
                            {table.columnCount || 0} cột
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-ink-500">
                          {table.engine}
                        </td>
                        <td className="py-3 px-4 font-mono text-[10px] text-ink-400">
                          {table.collation}
                        </td>
                        <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleOpenTableDetails(table.tableName)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-serif font-bold text-clay-700 bg-clay-50 hover:bg-clay-100 border border-clay-300 rounded-[4px] transition-colors cursor-pointer"
                          >
                            <span>Chi tiết</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer info */}
            <div className="py-2.5 px-4 bg-[#F8F4EC] border-t border-ink-200/80 flex items-center justify-between text-xs text-ink-500 font-serif">
              <span>Hiển thị <strong>{filteredTables.length}</strong> / <strong>{systemData?.tables?.length || 0}</strong> bảng</span>
              <span>CSDL: <strong className="font-mono text-ink-800">{databaseInfo?.databaseName || 'wayfare_db'}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: VERSIONS & RUNTIME ENVIRONMENT ───────────────────────── */}
      {activeTab === 'versions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Software Stack Versions */}
          <div className="p-5 rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-ink-200">
              <Boxes className="w-5 h-5 text-clay-700" />
              <h2 className="text-base font-bold font-serif text-ink-900">
                Phiên Bản Phần Mềm & Thư Viện
              </h2>
            </div>

            <div className="divide-y divide-ink-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-serif text-ink-600 font-semibold">Ngôn ngữ Java (JDK):</span>
                <span className="font-mono font-bold text-clay-800 bg-clay-50 px-2 py-0.5 rounded border border-clay-200">
                  Java {serverInfo?.javaVersion}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-serif text-ink-600 font-semibold">Nhà cung cấp JDK (Vendor):</span>
                <span className="font-mono text-ink-800">{serverInfo?.javaVendor}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-serif text-ink-600 font-semibold">Java Virtual Machine (JVM):</span>
                <span className="font-mono text-ink-800">{serverInfo?.javaVmName} ({serverInfo?.javaVmVersion})</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-serif text-ink-600 font-semibold">Spring Boot Framework:</span>
                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Spring Boot {serverInfo?.springBootVersion}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-serif text-ink-600 font-semibold">Spring Framework Core:</span>
                <span className="font-mono text-ink-800">v{serverInfo?.springFrameworkVersion}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-serif text-ink-600 font-semibold">Hibernate ORM / JPA:</span>
                <span className="font-mono text-ink-800">{serverInfo?.hibernateVersion || '6.4.x'}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-serif text-ink-600 font-semibold">Hệ thống Cơ sở Dữ liệu:</span>
                <span className="font-mono font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {databaseInfo?.productName} {databaseInfo?.productVersion}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-serif text-ink-600 font-semibold">Driver JDBC MySQL:</span>
                <span className="font-mono text-ink-800">{databaseInfo?.driverName} ({databaseInfo?.driverVersion})</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-serif text-ink-600 font-semibold">Frontend Client:</span>
                <span className="font-mono text-ink-800">React 18.x • Vite 5.x • TailwindCSS 3.x</span>
              </div>
            </div>
          </div>

          {/* Operating System & Server Environment */}
          <div className="p-5 rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-ink-200">
              <Server className="w-5 h-5 text-clay-700" />
              <h2 className="text-base font-bold font-serif text-ink-900">
                Hạ Tầng Máy Chủ & Môi Trường Máy Ảo
              </h2>
            </div>

            <div className="divide-y divide-ink-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-serif text-ink-600 font-semibold">Hệ điều hành (OS):</span>
                <span className="font-mono font-bold text-ink-800">
                  {serverInfo?.osName} (Phiên bản {serverInfo?.osVersion})
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-serif text-ink-600 font-semibold">Kiến trúc vi xử lý (Arch):</span>
                <span className="font-mono text-ink-800">{serverInfo?.osArch}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-serif text-ink-600 font-semibold">Số nhân CPU (Processors):</span>
                <span className="font-mono font-bold text-clay-700">{serverInfo?.availableProcessors} Logical Cores</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-serif text-ink-600 font-semibold">Múi giờ hệ thống (Timezone):</span>
                <span className="font-mono text-ink-800">{serverInfo?.timeZone}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-serif text-ink-600 font-semibold">Cổng mạng máy chủ (Port):</span>
                <span className="font-mono font-bold text-ink-800">{serverInfo?.serverPort}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-serif text-ink-600 font-semibold">Spring Active Profiles:</span>
                <span className="font-mono text-emerald-800 font-bold">
                  {serverInfo?.activeProfiles?.join(', ') || 'default'}
                </span>
              </div>
              <div className="py-2.5 flex flex-col gap-1">
                <span className="font-serif text-ink-600 font-semibold">Thư mục cài đặt Java (JAVA_HOME):</span>
                <span className="font-mono text-[10px] text-ink-500 break-all bg-ink-50 p-1.5 rounded border border-ink-100">
                  {serverInfo?.javaHome || 'N/A'}
                </span>
              </div>
              <div className="py-2.5 flex flex-col gap-1">
                <span className="font-serif text-ink-600 font-semibold">Chuỗi kết nối CSDL (Sanitized JDBC URL):</span>
                <span className="font-mono text-[10px] text-ink-500 break-all bg-ink-50 p-1.5 rounded border border-ink-100">
                  {databaseInfo?.sanitizedUrl}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: JVM PERFORMANCE & THREADS ────────────────────────────── */}
      {activeTab === 'jvm' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Memory Heap Breakdown */}
            <div className="p-5 rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-ink-200">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-amber-700" />
                  <h2 className="text-base font-bold font-serif text-ink-900">Chi Tiết Bộ Nhớ Heap JVM</h2>
                </div>
                <button
                  type="button"
                  onClick={handleTriggerGc}
                  disabled={gcLoading}
                  className="px-2.5 py-1 text-[11px] font-serif font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded cursor-pointer"
                >
                  {gcLoading ? 'Đang dọn...' : 'Dọn RAM (GC)'}
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-serif text-ink-600">Đã sử dụng: <strong>{memoryInfo?.usedMemoryFormatted}</strong></span>
                    <span className="font-mono font-bold text-clay-700">{memoryInfo?.usagePercent}%</span>
                  </div>
                  <div className="w-full bg-ink-100 h-3 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        (memoryInfo?.usagePercent || 0) > 85 ? 'bg-rose-500' :
                        (memoryInfo?.usagePercent || 0) > 70 ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(2, memoryInfo?.usagePercent || 0))}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-2.5 rounded bg-[#F8F4EC] border border-ink-200">
                    <span className="text-[10px] text-ink-500 font-mono uppercase block">Max Memory</span>
                    <span className="font-mono font-bold text-ink-900 text-sm">{memoryInfo?.maxMemoryFormatted}</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#F8F4EC] border border-ink-200">
                    <span className="text-[10px] text-ink-500 font-mono uppercase block">Total Allocated</span>
                    <span className="font-mono font-bold text-ink-900 text-sm">{memoryInfo?.totalMemoryFormatted}</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#F8F4EC] border border-ink-200">
                    <span className="text-[10px] text-ink-500 font-mono uppercase block">Used Memory</span>
                    <span className="font-mono font-bold text-clay-700 text-sm">{memoryInfo?.usedMemoryFormatted}</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#F8F4EC] border border-ink-200">
                    <span className="text-[10px] text-ink-500 font-mono uppercase block">Free Memory</span>
                    <span className="font-mono font-bold text-emerald-700 text-sm">{memoryInfo?.freeMemoryFormatted}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* JVM Threads Breakdown */}
            <div className="p-5 rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-ink-200">
                <Activity className="w-5 h-5 text-blue-700" />
                <h2 className="text-base font-bold font-serif text-ink-900">Luồng Xử Lý (JVM Threads)</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded bg-[#F8F4EC] border border-ink-200">
                  <span className="text-[10px] text-ink-500 font-mono uppercase block">Active Threads</span>
                  <span className="font-mono font-bold text-blue-800 text-lg">{threadInfo?.threadCount || 0}</span>
                  <span className="text-[10px] text-ink-400 block mt-0.5">Đang chạy đồng thời</span>
                </div>
                <div className="p-3 rounded bg-[#F8F4EC] border border-ink-200">
                  <span className="text-[10px] text-ink-500 font-mono uppercase block">Peak Threads</span>
                  <span className="font-mono font-bold text-ink-900 text-lg">{threadInfo?.peakThreadCount || 0}</span>
                  <span className="text-[10px] text-ink-400 block mt-0.5">Mức đỉnh đạt tới</span>
                </div>
                <div className="p-3 rounded bg-[#F8F4EC] border border-ink-200">
                  <span className="text-[10px] text-ink-500 font-mono uppercase block">Daemon Threads</span>
                  <span className="font-mono font-bold text-ink-700 text-lg">{threadInfo?.daemonThreadCount || 0}</span>
                  <span className="text-[10px] text-ink-400 block mt-0.5">Luồng chạy nền JVM</span>
                </div>
                <div className="p-3 rounded bg-[#F8F4EC] border border-ink-200">
                  <span className="text-[10px] text-ink-500 font-mono uppercase block">Total Started</span>
                  <span className="font-mono font-bold text-ink-700 text-lg">{threadInfo?.totalStartedThreadCount || 0}</span>
                  <span className="text-[10px] text-ink-400 block mt-0.5">Kể từ khi khởi động</span>
                </div>
              </div>
            </div>
          </div>

          {/* Garbage Collector Metrics */}
          {garbageCollectors && garbageCollectors.length > 0 && (
            <div className="p-5 rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-ink-200">
                <Zap className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-bold font-serif text-ink-900">Bộ Thu Gom Rác (Garbage Collectors)</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-ink-200 bg-[#F8F4EC] text-ink-500 font-mono text-[10px] uppercase">
                      <th className="py-2.5 px-3">Tên Thuật Toán GC</th>
                      <th className="py-2.5 px-3 text-right">Số Lần Thu Gom</th>
                      <th className="py-2.5 px-3 text-right">Tổng Thời Gian Chiếm Dụng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    {garbageCollectors.map((gc, i) => (
                      <tr key={i} className="hover:bg-[#F8F4EC]">
                        <td className="py-2.5 px-3 font-mono font-bold text-ink-800">{gc.name}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-800 font-semibold">{gc.collectionCount?.toLocaleString()} lần</td>
                        <td className="py-2.5 px-3 text-right font-mono text-ink-600">{gc.collectionTimeMillis} ms ({((gc.collectionTimeMillis || 0) / 1000).toFixed(2)}s)</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── MODAL: TABLE SCHEMA INSPECTOR ───────────────────────────────── */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-4xl max-h-[85vh] bg-[#FFFDF8] rounded-[8px] border border-ink-200 shadow-xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-ink-200 bg-[#F8F4EC] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[6px] bg-clay-700 text-white flex items-center justify-center shadow-xs">
                  <TableIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-ink-400 uppercase">Cấu trúc bảng</span>
                    <span className="font-mono font-bold text-lg text-clay-800">{selectedTable}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-ink-700 border border-ink-200 font-bold">
                      {tableDetail?.rowCount?.toLocaleString() || 0} dòng
                    </span>
                  </div>
                  <p className="text-xs text-ink-500 font-sans mt-0.5">
                    Engine: <strong className="font-mono">{tableDetail?.engine || 'InnoDB'}</strong> • Collation: <strong className="font-mono">{tableDetail?.collation}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseTableDetails}
                className="w-8 h-8 rounded-[4px] bg-white hover:bg-ink-100 border border-ink-200 text-ink-600 hover:text-ink-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {detailLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-clay-200 border-t-clay-600 animate-spin" />
                  <span className="text-xs font-serif text-ink-600">Đang đọc cấu trúc các cột (schema) từ CSDL...</span>
                </div>
              ) : tableDetail?.columns ? (
                <div className="border border-ink-200 rounded-[6px] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-ink-200 bg-[#F8F4EC] text-ink-500 font-mono text-[10px] uppercase">
                          <th className="py-2.5 px-3">Tên Cột (Column)</th>
                          <th className="py-2.5 px-3">Kiểu Dữ Liệu</th>
                          <th className="py-2.5 px-3 text-center">Khóa (Key)</th>
                          <th className="py-2.5 px-3 text-center">Nullable</th>
                          <th className="py-2.5 px-3">Mặc Định</th>
                          <th className="py-2.5 px-3">Bổ Sung (Extra)</th>
                          <th className="py-2.5 px-3">Mô Tả / Comment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-100 font-mono text-[11px]">
                        {tableDetail.columns.map((col, idx) => (
                          <tr key={idx} className="hover:bg-[#F8F4EC]/60 transition-colors">
                            <td className="py-2.5 px-3 font-bold text-ink-900">
                              <div className="flex items-center gap-1.5">
                                {col.columnKey === 'PRI' && <Key className="w-3 h-3 text-amber-600" />}
                                <span>{col.columnName}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-clay-700 font-semibold">{col.columnType || col.dataType}</td>
                            <td className="py-2.5 px-3 text-center">
                              {col.columnKey === 'PRI' ? (
                                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[9px] font-bold border border-amber-300">
                                  PRIMARY
                                </span>
                              ) : col.columnKey === 'UNI' ? (
                                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 text-[9px] font-bold border border-blue-300">
                                  UNIQUE
                                </span>
                              ) : col.columnKey === 'MUL' ? (
                                <span className="px-1.5 py-0.5 rounded bg-ink-100 text-ink-700 text-[9px] font-bold">
                                  INDEX
                                </span>
                              ) : (
                                <span className="text-ink-300">-</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {col.isNullable ? (
                                <span className="text-emerald-700 font-bold">YES</span>
                              ) : (
                                <span className="text-rose-700 font-bold">NO</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-ink-600">
                              {col.columnDefault !== null ? (
                                <span className="px-1.5 py-0.5 rounded bg-ink-100 text-ink-800 text-[10px]">
                                  {col.columnDefault}
                                </span>
                              ) : (
                                <span className="text-ink-400 italic">NULL</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-amber-800 text-[10px]">{col.extra || '-'}</td>
                            <td className="py-2.5 px-3 text-ink-500 font-sans text-[11px]">{col.comment || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-center text-ink-400 py-8">Không có thông tin chi tiết.</p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-ink-200 bg-[#F8F4EC] flex items-center justify-between">
              <span className="text-xs text-ink-500 font-serif">
                Tổng cộng: <strong>{tableDetail?.columns?.length || 0}</strong> cột
              </span>
              <button
                type="button"
                onClick={handleCloseTableDetails}
                className="px-4 py-1.5 text-xs font-serif font-bold text-ink-700 bg-white hover:bg-ink-100 border border-ink-200 rounded-[5px] transition-colors cursor-pointer"
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

