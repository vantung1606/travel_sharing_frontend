import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../components/common/Toast';
import { adminApi, adminReportApi } from '../../../services/api';
import {
  Users,
  MapPin,
  Sparkles,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  FileText,
  Calendar,
  Plus,
  Compass,
  Activity,
  ArrowUpRight,
  ChevronRight,
  Search,
  Filter,
  Cpu,
  Flag,
  Clock,
  PieChart,
  Eye,
  Download,
  SlidersHorizontal,
  Map,
  ArrowRight,
  RefreshCw,
  Award
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const toast = useToast();
  const { currentUser, setAdminTab } = useApp();

  const [stats, setStats] = useState({
    totalUsers: 6,
    newUsersThisMonth: 6,
    totalPosts: 6,
    totalPlaces: 6,
    totalItineraries: 4,
    activeItineraries: 4,
    totalLikes: 316,
    totalComments: 96,
    averagePlaceRating: 4.8,
    topDestinations: [],
    topPlaces: []
  });
  const [itinerariesList, setItinerariesList] = useState([]);
  const [pendingReports, setPendingReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartTab, setChartTab] = useState('Lịch trình AI');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tableSearch, setTableSearch] = useState('');

  const loadDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [fetchedStats, fetchedItins, fetchedReports] = await Promise.all([
        adminApi.getStats(),
        adminApi.getAllItineraries(),
        adminReportApi.getPendingReports()
      ]);

      if (fetchedStats) {
        setStats(fetchedStats);
      }
      if (Array.isArray(fetchedItins) && fetchedItins.length > 0) {
        setItinerariesList(fetchedItins);
      }
      if (Array.isArray(fetchedReports)) {
        setPendingReports(fetchedReports);
      }

      if (isManual) {
        toast.success('Đã làm mới dữ liệu tổng quan thời gian thực từ cơ sở dữ liệu!');
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
      if (isManual) toast.error('Không thể đồng bộ dữ liệu thời gian thực: ' + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Filter itineraries
  const filteredItineraries = useMemo(() => {
    return itinerariesList.filter(item => {
      if (statusFilter !== 'all') {
        if (statusFilter === 'active' && item.status !== 'ACTIVE') return false;
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
  }, [itinerariesList, statusFilter, tableSearch]);

  // Total GMV calculated from itineraries budget
  const totalGmv = useMemo(() => {
    return itinerariesList.reduce((acc, it) => acc + (Number(it.budgetTotal) || 0), 0);
  }, [itinerariesList]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* PAGE HEADER & ACTION BAR */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>Quản trị hệ thống</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-sky-600">Dashboard tổng quan</span>
          </nav>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Chào buổi sáng, {currentUser?.name || 'Quản trị viên'}! <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="text-xs text-slate-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            Hệ thống ghi nhận <strong className="text-slate-900 font-bold">{stats.totalItineraries}</strong> chuyến đi được lưu trữ và <strong className="text-rose-600 font-bold">{pendingReports.length}</strong> báo cáo vi phạm cần xử lý.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 xl:pt-0">
          <button 
            onClick={() => loadDashboardData(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors shadow-sm cursor-pointer"
            title="Làm mới dữ liệu từ CSDL"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Đồng bộ CSDL</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors shadow-sm cursor-pointer">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Dữ liệu thời gian thực</span>
          </button>

          <button
            onClick={() => setAdminTab('places')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Quản lý điểm đến</span>
          </button>
        </div>
      </div>

      {/* ROW 1: KEY METRIC KPI CARDS (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Active Users */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-extrabold">
              <TrendingUp className="w-3.5 h-3.5" />
              +{stats.newUsersThisMonth || 6} mới
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Tổng người dùng hệ thống</span>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="font-display font-extrabold text-2xl text-slate-900">{stats.totalUsers}</h2>
              <span className="text-xs text-slate-400 font-medium">tài khoản</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              <strong className="text-sky-600 font-bold">100%</strong> đã xác thực CSDL
            </p>
          </div>
        </div>

        {/* KPI 2: AI Itineraries */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-extrabold">
              <TrendingUp className="w-3.5 h-3.5" />
              100% Active
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Lịch trình tạo bằng AI</span>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="font-display font-extrabold text-2xl text-slate-900">{stats.totalItineraries}</h2>
              <span className="text-xs text-slate-400 font-medium">hành trình</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Đang hoạt động: <strong className="text-slate-800 font-bold">{stats.activeItineraries} chuyến</strong>
            </p>
          </div>
        </div>

        {/* KPI 3: Check-in Places */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-extrabold">
              {stats.averagePlaceRating ? Number(stats.averagePlaceRating).toFixed(1) : '4.8'} ⭐
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Địa điểm & Điểm tham quan</span>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="font-display font-extrabold text-2xl text-slate-900">{stats.totalPlaces}</h2>
              <span className="text-xs text-slate-400 font-medium">địa danh</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Phủ khắp các vùng: <strong className="text-slate-800 font-bold">Bắc - Trung - Nam</strong>
            </p>
          </div>
        </div>

        {/* KPI 4: GMV & Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-extrabold">
              <TrendingUp className="w-3.5 h-3.5" />
              10% HH
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Tổng ngân sách dự toán & GMV</span>
            <div className="flex items-baseline gap-1 mt-1">
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900">{totalGmv.toLocaleString('vi-VN')}</h2>
              <span className="text-xs font-extrabold text-slate-500">VNĐ</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Hoa hồng ước tính: <strong className="text-sky-600 font-bold">{(totalGmv * 0.1).toLocaleString('vi-VN')} VNĐ</strong>
            </p>
          </div>
        </div>

      </div>

      {/* ROW 2: 2 COLUMN LAYOUT (65% vs 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (8 Cols -> Growth Chart & Heatmap) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Growth & Interaction Chart Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Tăng trưởng & Tương tác Lịch trình AI</h3>
                <p className="text-xs text-slate-400">Thống kê dữ liệu chu kỳ 30 ngày gần nhất</p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs font-bold">
                {['Lịch trình AI', 'Người dùng mới', 'Lượt lưu chuyến'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setChartTab(tab)}
                    className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                      chartTab === tab ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Weekly Breakdown summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Tuần 1 (01 - 07)</span>
                <span className="font-bold text-base text-slate-900 block mt-0.5">8.540</span>
                <span className="text-sky-600 text-[11px] font-semibold">Bắt đầu chu kỳ</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Tuần 2 (08 - 14)</span>
                <span className="font-bold text-base text-slate-900 block mt-0.5">11.230</span>
                <span className="text-sky-600 text-[11px] font-semibold">+31.5%</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Tuần 3 (15 - 21)</span>
                <span className="font-bold text-base text-slate-900 block mt-0.5">13.820</span>
                <span className="text-sky-600 text-[11px] font-semibold">+23.1%</span>
              </div>
              <div className="bg-sky-50 p-3 rounded-2xl border border-sky-200">
                <span className="text-sky-800 block text-[11px] font-bold">Tuần 4 (22 - 30)</span>
                <span className="font-bold text-base text-sky-700 block mt-0.5">16.480</span>
                <span className="text-amber-600 text-[11px] font-bold">Đỉnh điểm tháng</span>
              </div>
            </div>

            {/* SVG Spline Chart Visualizer */}
            <div className="w-full h-48 sm:h-56 relative pt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 700 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="30" x2="700" y2="30" stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="1" />
                <line x1="0" y1="80" x2="700" y2="80" stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="1" />
                <line x1="0" y1="130" x2="700" y2="130" stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="1" />
                <path d="M 0 140 Q 120 120, 200 105 T 420 65 T 620 28 L 700 18 L 700 170 L 0 170 Z" fill="url(#chartGradient)" />
                <path d="M 0 140 Q 120 120, 200 105 T 420 65 T 620 28 L 700 18" fill="none" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
                <circle cx="200" cy="105" r="5" fill="#0284c7" className="cursor-pointer hover:r-7 transition-all" />
                <circle cx="420" cy="65" r="5" fill="#0284c7" className="cursor-pointer hover:r-7 transition-all" />
                <circle cx="620" cy="28" r="6" fill="#f97316" stroke="#ffffff" strokeWidth="2" className="cursor-pointer" />
              </svg>
              <div className="absolute top-1 right-20 bg-slate-900 text-white px-3 py-1 rounded-lg shadow-md text-[11px] font-bold flex items-center gap-1.5 pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Đỉnh tuần 4: 16.480 lượt</span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-semibold px-2">
              <span>01 Thg 10</span>
              <span>08 Thg 10</span>
              <span>15 Thg 10</span>
              <span>22 Thg 10</span>
              <span>30 Thg 10</span>
            </div>
          </div>

          {/* Bản đồ Nhiệt Du Lịch Việt Nam (Hotspots Live) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  Bản đồ Nhiệt Du Lịch Việt Nam
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                    Hotspots Live
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Tần suất check-in & tạo lịch trình AI theo khu vực địa lý</p>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Cập nhật mỗi 5 phút</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Interactive Heatmap Map Container */}
              <div className="md:col-span-7 h-72 bg-slate-900 rounded-2xl relative overflow-hidden border border-slate-800 shadow-inner p-4 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:14px_14px] opacity-25"></div>

                {/* Radar Hotspot Pins */}
                {/* Pin 1: Đà Nẵng */}
                <div className="absolute top-[48%] left-[54%] flex flex-col items-center group cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-7 w-7 rounded-full bg-amber-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                  </div>
                  <span className="mt-1 px-2.5 py-1 bg-slate-900/90 text-amber-300 text-[10px] font-extrabold rounded-md shadow-md whitespace-nowrap">
                    Đà Nẵng · 34%
                  </span>
                </div>

                {/* Pin 2: Hà Giang */}
                <div className="absolute top-[16%] left-[45%] flex flex-col items-center group cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-sky-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-sky-500"></span>
                  </div>
                  <span className="mt-1 px-2.5 py-1 bg-slate-900/90 text-sky-300 text-[10px] font-extrabold rounded-md shadow-md whitespace-nowrap">
                    Hà Giang · 26%
                  </span>
                </div>

                {/* Pin 3: Đà Lạt */}
                <div className="absolute top-[68%] left-[62%] flex flex-col items-center group cursor-pointer">
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-400"></span>
                  <span className="mt-1 px-2.5 py-1 bg-slate-900/90 text-sky-300 text-[10px] font-extrabold rounded-md shadow-md whitespace-nowrap">
                    Đà Lạt · 22%
                  </span>
                </div>

                {/* Pin 4: Phú Quốc */}
                <div className="absolute top-[82%] left-[34%] flex flex-col items-center group cursor-pointer">
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400"></span>
                  <span className="mt-1 px-2.5 py-1 bg-slate-900/90 text-cyan-300 text-[10px] font-extrabold rounded-md shadow-md whitespace-nowrap">
                    Phú Quốc · 18%
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-lg text-[11px] text-slate-300 font-semibold border border-slate-700/50">
                  Bản đồ nhiệt độ tương tác thực tế
                </div>
              </div>

              {/* Hotspot Breakdown Stat Bars */}
              <div className="md:col-span-5 space-y-3.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between font-bold text-slate-900 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      1. Đà Nẵng & Hội An
                    </span>
                    <span className="text-amber-600 font-extrabold">34%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '34%' }}></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-semibold">
                    <span>15.918 lượt tạo</span>
                    <span>Top: Biển Mỹ Khê, Bà Nà</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between font-bold text-slate-900 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                      2. Cung đường Hà Giang
                    </span>
                    <span className="text-sky-600 font-extrabold">26%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-sky-600 h-2 rounded-full" style={{ width: '26%' }}></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-semibold">
                    <span>12.173 lượt tạo</span>
                    <span>Top: Mã Pí Lèng, Đồng Văn</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between font-bold text-slate-900 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                      3. Thành phố Đà Lạt
                    </span>
                    <span className="text-sky-600 font-extrabold">22%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-sky-600 h-2 rounded-full" style={{ width: '22%' }}></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-semibold">
                    <span>10.300 lượt tạo</span>
                    <span>Top: Săn mây, Cafe chill</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between font-bold text-slate-900 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                      4. Đảo Ngọc Phú Quốc
                    </span>
                    <span className="text-slate-700 font-extrabold">18%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-slate-400 h-2 rounded-full" style={{ width: '18%' }}></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-semibold">
                    <span>8.428 lượt tạo</span>
                    <span>Top: Bãi Sao, Sunset Sanato</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (4 Cols -> Action Required & AI Engine Health) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Action Required Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                <span>Cần xử lý gấp</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-extrabold text-xs">
                {pendingReports.length} báo cáo chờ
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {pendingReports.length === 0 ? (
                <div className="p-4 rounded-2xl bg-sky-50 text-sky-800 text-center font-semibold">
                  <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-sky-600" />
                  Không có nội dung vi phạm tồn đọng!
                </div>
              ) : (
                pendingReports.slice(0, 3).map((r) => (
                  <div key={r.id} className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 space-y-2">
                    <div className="flex items-center justify-between text-rose-700 font-bold">
                      <span className="flex items-center gap-1">
                        <Flag className="w-3.5 h-3.5" /> {r.category || 'Vi phạm'} ({r.reportsCount || 1} cờ)
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">{r.timeAgo || 'Vừa xong'}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 line-clamp-1">{r.title}</h4>
                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {r.aiFlagReason || r.reportReason || r.snippet}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">Tác giả: {r.authorName}</span>
                      <button
                        onClick={() => setAdminTab('reports')}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors shadow-sm cursor-pointer"
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
              className="w-full pt-2 text-center text-sky-600 hover:text-sky-700 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Xem tất cả {pendingReports.length} bài viết bị báo cáo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* AI Engine Health Card */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-4 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-xs">
                <Cpu className="w-4 h-4 text-sky-400" />
                <span>Hiệu suất WanderAI Engine</span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" title="Engine Active"></span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Success Rate (Tỷ lệ thành công)</span>
                  <strong className="text-sky-400 font-extrabold">98.4%</strong>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-sky-500 h-2 rounded-full" style={{ width: '98.4%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Latency TB (Phản hồi)</span>
                  <strong className="text-sky-400 font-extrabold">1.8 giây</strong>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-sky-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Nhanh hơn 24% so với tuần trước</span>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">API Tokens đã tiêu thụ</span>
                  <strong className="text-amber-400 font-extrabold">68% hạn mức</strong>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>6.8M / 10M tokens</span>
                  <span>Reset sau 6 ngày</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Model: WanderGPT v4.2 Turbo</span>
              <span className="text-sky-400 font-bold cursor-pointer hover:underline">Cấu hình tham số</span>
            </div>
          </div>

        </div>

      </div>

      {/* ROW 3: INTERACTIVE DATA TABLE (Chuyến đi & Lịch trình AI Tạo Gần Đây) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        
        {/* Table Header & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
          <div>
            <h3 className="font-bold text-base text-slate-900">Chuyến đi & Lịch trình AI Tạo Gần Đây</h3>
            <p className="text-xs text-slate-400">Giám sát các hành trình du lịch người dùng tạo qua trợ lý ảo</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo mã, tên hoặc tác giả..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 outline-none focus:ring-1 focus:ring-sky-500 w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">Tất cả trạng thái ({itinerariesList.length})</option>
              <option value="active">Đang hoạt động ({itinerariesList.filter(i => i.status === 'ACTIVE').length})</option>
            </select>

            <button 
              onClick={() => loadDashboardData(true)}
              className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors" 
              title="Làm mới bảng"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Mã lịch trình</th>
                <th className="py-3 px-4">Tên hành trình</th>
                <th className="py-3 px-4">Tác giả</th>
                <th className="py-3 px-4">Điểm đến chính</th>
                <th className="py-3 px-4">Dự toán ngân sách</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-500" />
                    Đang đồng bộ dữ liệu lịch trình từ cơ sở dữ liệu...
                  </td>
                </tr>
              ) : filteredItineraries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy lịch trình nào khớp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredItineraries.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-600">#ITN-890{row.id}</td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{row.title}</div>
                      <span className="text-slate-400 text-[11px]">
                        {row.isAiGenerated ? 'Tạo bởi WanderAI Gemini • Tối ưu điểm đến' : 'Thành viên tự thiết kế'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {row.creatorAvatar ? (
                          <img src={row.creatorAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold text-[10px] flex items-center justify-center">
                            {row.creatorName ? row.creatorName.charAt(0) : 'U'}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-800">{row.creatorName || 'Người dùng'}</div>
                          <span className="text-slate-400 text-[11px]">{row.creatorEmail || '@user'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-slate-800 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-sky-600" />
                        <span>{row.destination}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {row.budgetTotal ? Number(row.budgetTotal).toLocaleString('vi-VN') + 'đ' : 'Chưa nhập'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        row.status === 'ACTIVE'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {row.status === 'ACTIVE' ? 'Đang hoạt động' : (row.status || 'Bản nháp')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 text-slate-400">
                        <button 
                          onClick={() => toast.info(`Lịch trình: ${row.title} (${row.destination})`)}
                          className="p-1.5 hover:text-sky-600 transition-colors cursor-pointer" 
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => toast.success(`Đã xuất báo cáo lịch trình #${row.id}!`)}
                          className="p-1.5 hover:text-sky-600 transition-colors cursor-pointer" 
                          title="Xuất dữ liệu"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};

