import React from 'react';
import { useToast } from '../../../components/common/Toast';
import {
  TrendingUp,
  DollarSign,
  Building2,
  Crown,
  CreditCard,
  BarChart3,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  PieChart,
  Target,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const AdminRevenuePage = () => {
  const toast = useToast();

  const revenueStreams = [
    {
      id: 1,
      title: '1. Phí hoa hồng đặt dịch vụ (Booking & Affiliate Commission)',
      type: 'Nguồn thu chính (B2C & B2B)',
      status: 'Đang phát triển tích hợp API',
      statusColor: 'bg-amber-100 text-amber-800 border-amber-200',
      estimate: '5% - 15% / giao dịch',
      icon: DollarSign,
      iconBg: 'bg-emerald-500/10 text-emerald-600',
      description: 'Nhận chiết khấu hoa hồng khi người dùng đặt phòng homestay, khách sạn, vé xe, vé tham quan hoặc bàn ăn trực tiếp từ gợi ý lịch trình AI.',
      keyPoints: [
        'Tích hợp kết nối Affiliate API với Booking.com, Agoda, Traveloka, Klook.',
        'Ký kết hợp tác trực tiếp với các mô hình Homestay & nhà hàng địa phương.',
        'Tự động gắn mã giới thiệu (Affiliate Link) vào chi tiết mốc lịch trình ItineraryDetail.'
      ]
    },
    {
      id: 2,
      title: '2. Phí quảng cáo & Hiển thị ưu tiên cho Đối tác (Sponsored Listings)',
      type: 'Nguồn thu doanh nghiệp (B2B)',
      status: 'Đang thiết kế phân hệ Merchant Portal',
      statusColor: 'bg-sky-100 text-sky-800 border-sky-200',
      estimate: '499.000đ - 1.499.000đ / tháng',
      icon: Building2,
      iconBg: 'bg-sky-500/10 text-sky-600',
      description: 'Các chủ nhà hàng, cafe, homestay trả phí để xuất hiện ở vị trí đầu trang Khám phá hoặc được thuật toán AI ưu tiên gợi ý vào kế hoạch chuyến đi.',
      keyPoints: [
        'Vị trí hiển thị nổi bật với huy hiệu "Đối tác xác thực" hoặc "Được yêu thích".',
        'Thuật toán AI Priority Recommendation đưa địa điểm vào lịch trình tự động.',
        'Cung cấp trang quản trị Merchant Dashboard xem lượt click & lượt ghé thăm thực tế.'
      ]
    },
    {
      id: 3,
      title: '3. Gói thành viên cao cấp (Wayfare Premium / VIP Pass)',
      type: 'Nguồn thu người dùng (B2C Subscription)',
      status: 'Đang kết nối Cổng thanh toán VNPay / Momo',
      statusColor: 'bg-amber-100 text-amber-800 border-amber-200',
      estimate: '49.000đ / tháng (hoặc 399.000đ / năm)',
      icon: Crown,
      iconBg: 'bg-amber-500/10 text-amber-600',
      description: 'Mô hình Freemium cung cấp các đặc quyền vượt trội cho người dùng chuyên đi du lịch và sáng tạo nội dung lữ hành.',
      keyPoints: [
        'Tạo lịch trình AI không giới hạn (tối ưu hóa lộ trình tránh kẹt xe & giờ cao điểm).',
        'Xuất lịch trình dạng file PDF / Excel chuyên nghiệp & đồng bộ Google Calendar.',
        'Tính năng Bản đồ Offline (Offline Maps) phục vụ phượt biển đảo / núi rừng.',
        'Voucher giảm giá 5 - 10% độc quyền tại hệ thống đối tác liên kết Wayfare.'
      ]
    },
    {
      id: 4,
      title: '4. Phí tiện ích quyết toán chi phí nhóm (Group Expense Settlement)',
      type: 'Phí tiện ích FinTech (Micro-transactions)',
      status: 'Đã hoàn thiện Schema CSDL & đang tích hợp VietQR',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      estimate: '1.000đ - 2.000đ / giao dịch',
      icon: CreditCard,
      iconBg: 'bg-purple-500/10 text-purple-600',
      description: 'Tối ưu hóa tính năng ItineraryExpense giúp nhóm bạn đi du lịch tự động tính toán "Ai nợ ai bao nhiêu tiền" và chuyển khoản quyết toán 1-Click.',
      keyPoints: [
        'Thu phí giao dịch tiện ích nhỏ (micro-fee) khi quyết toán ngân sách chuyến đi.',
        'Chiết khấu hoa hồng từ các cổng đối tác trung gian thanh toán (VietQR, ZaloPay, Momo).'
      ]
    },
    {
      id: 5,
      title: '5. Dữ liệu xu hướng & Báo cáo thị trường (B2B Travel Data & Insights)',
      type: 'Nguồn thu dữ liệu (Data Monetization)',
      status: 'Định hướng phát triển Giai đoạn 2',
      statusColor: 'bg-slate-100 text-slate-700 border-slate-200',
      estimate: 'Dự án B2B theo hợp đồng',
      icon: PieChart,
      iconBg: 'bg-slate-500/10 text-slate-600',
      description: 'Tổng hợp dữ liệu xu hướng du lịch (được ẩn danh tính cá nhân) để cung cấp bức tranh tổng thể cho các Sở du lịch & Tập đoàn kinh doanh lữ hành.',
      keyPoints: [
        'Phân tích xu hướng điểm đến đang hot, mức chi tiêu trung bình và sở thích du khách.',
        'Cung cấp báo cáo thị trường du lịch chuyên sâu (Travel Insights Report).'
      ]
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Top Banner with In-Development Badge */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-700/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-extrabold text-xs">
              <Clock className="w-3.5 h-3.5 animate-spin-slow" />
              <span>🚧 ĐANG PHÁT TRIỂN (IN DEVELOPMENT)</span>
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-white leading-tight">
              Mô Hình Khai Thác Doanh Thu & Định Hướng Phát Triển
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Chiến lược mô hình kinh doanh nền tảng (Platform Monetization Strategy) & Các dòng dòng tiền dự kiến cho dự án **Wayfare Travel Sharing System**.
            </p>
          </div>

          <button
            onClick={() => toast.info('Tính năng Thống kê Doanh Thu Real-time đang trong quá trình kết nối API!')}
            className="px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-lg shadow-sky-500/30 transition-all cursor-pointer shrink-0 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Xem lộ trình triển khai</span>
          </button>
        </div>
      </div>

      {/* Target Revenue Projections Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block">Mục tiêu Doanh thu Năm 1</span>
            <span className="font-display font-extrabold text-xl text-slate-900">1.200.000.000 VNĐ</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block">Kênh doanh thu chính</span>
            <span className="font-display font-extrabold text-xl text-sky-600">Affiliate Booking (60%)</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block">Trạng thái phát triển</span>
            <span className="font-display font-extrabold text-xl text-amber-600">Đang hoàn thiện 65%</span>
          </div>
        </div>
      </div>

      {/* Detailed Revenue Streams Grid */}
      <div className="space-y-4">
        <h2 className="font-display font-extrabold text-lg text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-sky-600" />
          <span>Chi Tiết 5 Kênh Tạo Dòng Tiền (Monetization Channels)</span>
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {revenueStreams.map(stream => {
            const Icon = stream.icon;
            return (
              <div
                key={stream.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${stream.iconBg} flex items-center justify-center font-bold shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-base text-slate-900">
                        {stream.title}
                      </h3>
                      <span className="text-xs font-semibold text-slate-400">{stream.type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-3 py-1 rounded-full font-extrabold text-[11px] border ${stream.statusColor}`}>
                      {stream.status}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-900 text-white font-extrabold text-[11px]">
                      Ước tính: {stream.estimate}
                    </span>
                  </div>
                </div>

                {/* Body Description */}
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {stream.description}
                </p>

                {/* Key Execution Points */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 space-y-2">
                  <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
                    Cơ chế vận hành & Triển khai:
                  </span>
                  {stream.keyPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
