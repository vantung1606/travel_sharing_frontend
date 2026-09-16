import React, { useState } from 'react';
import { useToast } from '../../../components/common/Toast';
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
  Building
} from 'lucide-react';

export const AdminReportsPage = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'all' | 'hidden' | 'audit'
  const [searchQuery, setSearchQuery] = useState('');

  // Sample Reports Data for escalation cards
  const [reports, setReports] = useState([
    {
      id: 'PST-89021',
      title: 'Bí kíp cắm trại cấm lửa tại Vườn Quốc Gia Cát Tiên',
      category: 'Nguy cơ an toàn & Pháp luật',
      categoryType: 'error',
      reportsCount: 5,
      location: 'Vườn QG Cát Tiên',
      author: {
        name: 'Hoàng Long',
        handle: '@long_trekker',
        trustScore: '74/100',
        accountAge: '3 năm'
      },
      timeAgo: '24 phút trước',
      reason: 'Thông tin nguy hiểm, tuyên truyền cắm trại ở khu bảo tồn nghiêm ngặt không được phép, khuyến khích tự ý đốt lửa trại trong rừng mùa khô gây nguy cơ cháy rừng.',
      snippet: '“Tối qua nhóm mình lách chốt kiểm lâm vào khu sâu suối Đắc Bông, tìm chỗ cỏ lau hạ lều nhóm lửa cực chill, không ai phát hiện được nhé cả nhà. Nhớ mang theo củi khô chút...”',
      image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
      badgeText: '5 Lượt báo cáo'
    },
    {
      id: 'PST-89014',
      title: 'Dịch vụ làm visa & bán tour giá rẻ không cọc',
      category: 'Spam Thương Mại & Nghi vấn Scam',
      categoryType: 'warning',
      reportsCount: 12,
      location: 'Bot Spammer',
      author: {
        name: 'Du Lịch Giá Rẻ',
        handle: '@dulichgiare88',
        trustScore: '12/100',
        accountAge: 'Mới tạo 2 giờ'
      },
      timeAgo: '1 giờ trước',
      reason: 'Hệ thống AI Moderation gắn cờ: Phát hiện cấu trúc câu hàng loạt chứa 3 liên kết rút gọn độc hại lạ và 4 số điện thoại Zalo ảo không qua đăng ký đối tác.',
      snippet: '“Cam kết bao đậu visa Schengen 100% không chứng minh tài chính, bao gồm vé bay khứ hồi giá 50%. Nhắn tin Zalo 0909xxx để nhận quà tặng ngay hôm nay...”',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
      badgeText: 'AI Scam 92%'
    },
    {
      id: 'PST-88990',
      title: 'Review homestay Sa Pa cực tệ, bị mất đồ',
      category: 'Khiếu nại Đánh giá & Bôi nhọ',
      categoryType: 'info',
      reportsCount: 3,
      location: 'Sa Pa, Lào Cai',
      author: {
        name: 'Linh Đan',
        handle: '@linh_dan',
        trustScore: '88/100',
        accountAge: 'Thành viên Bạc'
      },
      timeAgo: '3 giờ trước',
      reason: 'Khiếu nại từ Chủ homestay “Mây Valley Sa Pa”: Khách không có hóa đơn cư trú trùng ngày trên bài đăng. Yêu cầu kiểm tra tính xác thực để tránh gây thiệt hại danh tiếng.',
      snippet: '“Phòng ốc ẩm mốc, thái độ nhân viên cực kỳ thiếu tôn trọng. Đặc biệt mình để quên tai nghe AirPods tại bàn lễ tân khi trả phòng và nhân viên chối hoàn toàn...”',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      badgeText: 'Tranh chấp Đối tác'
    }
  ]);

  // Sample Table Articles Data
  const recentArticles = [
    { id: '#PST-89025', title: 'Top 5 quán cà phê ngắm hoàng hôn đỉnh nhất bán đảo Sơn Trà', author: 'Thanh Mai', time: '5 phút trước', status: 'Safe (100%)', likes: 45 },
    { id: '#PST-89024', title: 'Kinh nghiệm phượt Hà Giang mùa hoa tam giác mạch 3N2Đ', author: 'Hùng Phượt', time: '12 phút trước', status: 'Safe (98%)', likes: 128 },
    { id: '#PST-89022', title: 'Nhận kéo tương tác tour du lịch giá rẻ chiết khấu 70%', author: 'SpamUser99', time: '18 phút trước', status: 'AI Flagged (89%)', likes: 2 },
    { id: '#PST-89019', title: 'Lịch trình khám phá Phú Quốc tự túc tiết kiệm cho nhóm bạn', author: 'Minh Trang', time: '35 phút trước', status: 'Safe (100%)', likes: 89 }
  ];

  const handleDismissReport = (id) => {
    setReports(prev => prev.filter(r => r.id !== id));
    toast.info(`Đã bác bỏ báo cáo bài viết #${id} (Nội dung hợp lệ)`);
  };

  const handleHidePost = (id) => {
    setReports(prev => prev.filter(r => r.id !== id));
    toast.warning(`Đã tạm ẩn bài viết #${id} khỏi cộng đồng!`);
  };

  const handleBanUser = (id, authorName) => {
    setReports(prev => prev.filter(r => r.id !== id));
    toast.error(`Đã gỡ bài #${id} và khóa tài khoản ${authorName} trong 7 ngày!`);
  };

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
            <span className="font-extrabold text-xs text-orange-600">Khối xử lý vi phạm</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">
            Kiểm duyệt Bài viết & Xử lý Báo cáo (Screen A04)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Giám sát nội dung cộng đồng, kiểm duyệt các bài viết check-in và xử lý khiếu nại báo cáo vi phạm từ người dùng.
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
          </div>

          <button
            onClick={() => toast.info('Bộ lọc nâng cao đã được áp dụng')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold transition-all cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Bộ lọc</span>
          </button>

          <button
            onClick={() => toast.success('Đã xuất báo cáo kiểm duyệt ra file Excel!')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-full text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards (4 Thẻ Thống Kê Nhanh) */}
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
            <div className="font-display font-extrabold text-3xl text-slate-900 leading-none mb-1.5">342</div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12%</span>
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
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="font-display font-extrabold text-3xl text-rose-600 leading-none mb-1.5">{reports.length}</div>
            <div className="flex items-center gap-1 text-xs font-bold text-rose-600">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Cần duyệt gấp</span>
              <span className="text-slate-400 font-normal">(5 nguy cấp)</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">Đã gỡ/Ẩn tuần này</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <EyeOff className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="font-display font-extrabold text-3xl text-slate-900 leading-none mb-1.5">24</div>
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
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="font-display font-extrabold text-3xl text-emerald-600 leading-none mb-1.5">98.4%</div>
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
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span>Chờ xử lý báo cáo</span>
          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px]">
            {reports.length}
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
          <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px]">1,420</span>
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
          <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px]">86</span>
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

      {/* 4. Escalation Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <h2 className="font-display font-extrabold text-lg text-slate-900">
              Danh sách báo cáo trọng điểm cần xử lý ngay
            </h2>
          </div>
          <span className="text-xs text-slate-400">Ưu tiên cao nhất</span>
        </div>

        {reports.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-800">Không còn báo cáo vi phạm nào!</h3>
            <p className="text-xs text-slate-400 mt-1">Tất cả bài viết báo cáo đã được ban quản trị xử lý sạch sẽ.</p>
          </div>
        ) : (
          reports.map(report => (
            <article
              key={report.id}
              className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 hover:shadow-md transition-shadow relative flex flex-col xl:flex-row gap-6"
            >
              {/* Left Accent Bar */}
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-rose-500 rounded-l-2xl"></div>

              {/* Image Preview */}
              <div className="w-full xl:w-72 shrink-0">
                <div className="relative rounded-xl overflow-hidden aspect-video xl:h-full bg-slate-100">
                  <img src={report.image} alt={report.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-rose-600 text-white font-extrabold text-[10px] flex items-center gap-1 shadow-sm">
                    <Flame className="w-3 h-3" />
                    <span>{report.badgeText}</span>
                  </span>
                  <span className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-slate-950/80 text-white font-bold text-[10px] backdrop-blur-md">
                    {report.location}
                  </span>
                </div>
              </div>

              {/* Report Content Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-extrabold text-[10px]">
                        {report.category}
                      </span>
                      <span className="text-xs font-mono text-slate-400">Mã bài: #{report.id}</span>
                    </div>
                    <span className="text-xs text-slate-400">{report.timeAgo}</span>
                  </div>

                  <h3 className="font-display font-extrabold text-base text-slate-900 mb-2">
                    {report.title}
                  </h3>

                  {/* Author Meta */}
                  <div className="flex items-center gap-2 mb-3 text-xs text-slate-600">
                    <span className="font-bold text-slate-900">{report.author.name}</span>
                    <span className="text-slate-400">{report.author.handle}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="text-slate-500 font-medium">{report.author.accountAge}</span>
                  </div>

                  {/* Flag Reason Detail Box */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-3 space-y-1">
                    <div className="flex items-start gap-2 text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold text-slate-900">Lý do báo cáo: </strong>
                        <span className="text-slate-600">{report.reason}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 italic">
                    {report.snippet}
                  </p>
                </div>

                {/* Admin Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toast.info(`Mở xem bài viết #${report.id}`)}
                      className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem bài viết</span>
                    </button>
                    <button
                      onClick={() => handleDismissReport(report.id)}
                      className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Bỏ qua (Hợp lệ)
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleHidePost(report.id)}
                      className="px-3.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Tạm ẩn bài</span>
                    </button>
                    <button
                      onClick={() => handleBanUser(report.id, report.author.name)}
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

      {/* 5. Data Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
          <div>
            <h3 className="font-display font-extrabold text-base text-slate-900">
              Toàn bộ bài viết cộng đồng gần đây
            </h3>
            <p className="text-xs text-slate-400">Kiểm toán tự động theo thời gian thực kết hợp AI Auto-Tagger</p>
          </div>
          <button
            onClick={() => toast.success('Đã cập nhật danh sách bài viết mới')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer shrink-0"
            title="Làm mới bảng"
          >
            <RefreshCw className="w-4 h-4" />
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
              {recentArticles.map(art => (
                <tr key={art.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-400 font-bold">{art.id}</td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="font-bold text-slate-900 truncate">{art.title}</p>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-800">{art.author}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">{art.time}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      art.status.includes('Safe')
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{art.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => toast.info(`Đang xem chi tiết bài ${art.id}`)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toast.error(`Đã gỡ bài ${art.id}`)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
