import React, { useState, useMemo } from 'react';
import { useToast } from '../common/Toast';
import {
  X,
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  Car,
  Utensils,
  Camera,
  Navigation,
  CheckCircle2,
  DollarSign,
  Share2,
  Download,
  Users,
  ChevronRight,
  ExternalLink,
  Lightbulb,
  Sun,
  Coffee,
  Receipt,
  CheckSquare,
  Square,
  FileText,
  Send,
  Compass,
  ArrowRight,
  UserPlus
} from 'lucide-react';

export const ItineraryDetailModal = ({ itinerary, onClose }) => {
  const toast = useToast();
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // Checklist interactive state
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'CCCD / Hộ chiếu gốc cho các thành viên', done: true },
    { id: 2, text: 'Kem chống nắng SPF50+ & kính râm chống tia UV', done: true },
    { id: 3, text: 'Trang phục bơi biển & đồ gọn nhẹ thoáng mát', done: true },
    { id: 4, text: 'Sạc pin dự phòng 20.000mAh & cáp sạc nhanh', done: true },
    { id: 5, text: 'Vé QR tham quan / voucher lưu trú (tải offline)', done: false }
  ]);

  if (!itinerary) return null;

  const days = itinerary.days && itinerary.days.length > 0 ? itinerary.days : [
    {
      dayNumber: 1,
      title: 'Ngày 1: Khám phá các điểm dừng chân nổi bật',
      activities: [
        {
          time: '08:30 – 10:30',
          category: 'Văn hóa & Danh lam',
          title: `Khám phá trung tâm ${itinerary.destination}`,
          location: `${itinerary.destination} Landmark`,
          address: `Trung tâm thành phố ${itinerary.destination}, Việt Nam`,
          note: 'Bắt đầu ngày mới bằng chuyến dạo quanh các điểm nhấn kiến trúc và cảnh quan nổi bật.',
          aiTip: 'Nên khởi hành sớm để tận hưởng bầu không khí mát mẻ và ánh sáng đẹp nhất.',
          cost: '100.000đ/người',
          image: itinerary.coverImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
          transit: 'Di chuyển trung tâm: 5 km ~ 12 phút'
        },
        {
          time: '12:00 – 13:30',
          category: 'Ẩm thực địa phương',
          title: `Thưởng thức đặc sản truyền thống tại ${itinerary.destination}`,
          location: `Quán ăn đặc sản ${itinerary.destination}`,
          address: `Khu ẩm thực phố cổ ${itinerary.destination}, Việt Nam`,
          note: 'Trải nghiệm văn hóa ẩm thực đậm đà bản sắc địa phương.',
          aiTip: 'Đừng quên thử các món nước dùng thảo mộc đặc sản.',
          cost: '120.000đ/người',
          image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
          transit: 'Di chuyển 3.5 km ~ 8 phút'
        }
      ]
    }
  ];

  const currentDay = days[activeDayIndex] || days[0];
  const completedChecklistCount = checklist.filter(item => item.done).length;

  const toggleChecklistItem = (id) => {
    setChecklist(prev =>
      prev.map(item => item.id === id ? { ...item, done: !item.done } : item)
    );
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success(`Đã sao chép liên kết chia sẻ chuyến đi "${itinerary.title}"!`);
    } else {
      toast.info('Đã tạo liên kết chia sẻ nhóm thành công!');
    }
  };

  const handleDownloadPDF = () => {
    toast.info('Hệ thống đang xuất bản file PDF lịch trình chi tiết kèm bản đồ offline...');
    setTimeout(() => {
      toast.success(`Đã tải xuống cẩm nang PDF cho chuyến đi ${itinerary.destination}!`);
    }, 1200);
  };

  const handleWeatherOptimize = () => {
    toast.info('WanderAI đang quét lại dự báo mây & mưa thực tế: Lộ trình hiện tại hoàn toàn khô ráo!');
  };

  const handleSuggestCafes = () => {
    toast.success('Trợ lý AI gợi ý 3 quán cafe view đỉnh cách bạn <800m: 1. Gió Biển Coffee, 2. Mây Garden, 3. The Local Hideout.');
  };

  const handleBillSplit = () => {
    const total = itinerary.totalBudget || 15400000;
    const perPerson = itinerary.budgetPerPerson || Math.round(total / 4);
    toast.info(`Bill Splitter AI: Tổng ${total.toLocaleString('vi-VN')}đ chia đều mỗi thành viên là ${perPerson.toLocaleString('vi-VN')}đ.`);
  };

  const handleStartOnTheGo = () => {
    toast.success('Đã kích hoạt Chế Độ Đi Đường (On-the-Go Mode)! Bản đồ đang đồng bộ GPS thời gian thực 🚀');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-md overflow-y-auto animate-fade-in">
      {/* MODAL CARD: Stitch Screen M10 Max-w-6xl */}
      <div className="relative w-full max-w-6xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200/80 my-auto">
        
        {/* Top Gradient Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-sky-600 via-teal-500 to-amber-500 shrink-0" />

        {/* ─── 1. MODAL HEADER ─────────────────────────────────────────────────── */}
        <div className="px-6 py-5 bg-white border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="space-y-1.5 min-w-0">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-extrabold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>{itinerary.countdown || 'Sắp khởi hành · Còn 4 ngày'}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/60 text-sky-800 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>{itinerary.isAiGenerated ? '✨ Khởi tạo bởi WanderAI Pro' : '📌 Lịch trình tự lên kế hoạch'}</span>
              </span>
            </div>

            {/* Title */}
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight line-clamp-1">
              {itinerary.title}
            </h2>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-0.5">
              <span className="flex items-center gap-1.5 font-semibold">
                <Calendar className="w-4 h-4 text-sky-600" />
                <span>{itinerary.departureDate || '15/11/2026 – 18/11/2026'}</span>
              </span>
              <span className="text-slate-300">•</span>
              
              {/* Group members */}
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-500">{itinerary.groupType || 'Nhóm 4 thành viên'}:</span>
                <div className="flex items-center -space-x-1.5">
                  <img
                    alt="Member 1"
                    className="w-6 h-6 rounded-full ring-2 ring-white object-cover shadow-2xs"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                  />
                  <div className="w-6 h-6 rounded-full ring-2 ring-white bg-sky-100 text-sky-700 font-extrabold text-[10px] flex items-center justify-center shadow-2xs">
                    TN
                  </div>
                  <div className="w-6 h-6 rounded-full ring-2 ring-white bg-teal-100 text-teal-700 font-extrabold text-[10px] flex items-center justify-center shadow-2xs">
                    HL
                  </div>
                  <div className="w-6 h-6 rounded-full ring-2 ring-white bg-amber-100 text-amber-800 font-extrabold text-[10px] flex items-center justify-center shadow-2xs">
                    MH
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toast.info('Đã mở hộp thoại mời bạn bè tham gia nhóm hành trình!')}
                  className="px-2 py-0.5 rounded-full bg-slate-100 text-sky-700 hover:bg-slate-200 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>+ Mời</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-sky-600" />
              <span className="hidden sm:inline">Tải PDF</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-teal-600" />
              <span className="hidden sm:inline">Chia sẻ cộng đồng</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer ml-1"
              title="Đóng modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ─── 2. STATS & OVERVIEW RIBBON (3 KPI PANELS) ────────────────────────── */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200/70 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs shrink-0">
          
          {/* Panel 1: Budget */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-sky-600 flex items-center justify-center flex-shrink-0 shadow-2xs border border-slate-200/60">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Ngân sách ước tính</span>
                <span className="font-extrabold text-sky-600">
                  {Number(itinerary.totalBudget || 15400000).toLocaleString('vi-VN')}đ
                  <span className="text-[10px] font-normal text-slate-400 ml-1">
                    (~{(Number(itinerary.budgetPerPerson || 3850000) / 1000000).toFixed(2)}tr/người)
                  </span>
                </span>
              </div>
              {/* Segmented bar */}
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex mt-1.5">
                <div className="bg-sky-600 h-full" style={{ width: '40%' }} title="Lưu trú 40%"></div>
                <div className="bg-teal-500 h-full" style={{ width: '30%' }} title="Ăn uống 30%"></div>
                <div className="bg-amber-500 h-full" style={{ width: '20%' }} title="Vé tham quan 20%"></div>
                <div className="bg-slate-400 h-full" style={{ width: '10%' }} title="Đi lại 10%"></div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-sky-600 inline-block"></span>Ở 40%</span>
                <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block"></span>Ăn 30%</span>
                <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>Vé 20%</span>
                <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block"></span>Xe 10%</span>
              </div>
            </div>
          </div>

          {/* Panel 2: Route Optimization */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-teal-600 flex items-center justify-center flex-shrink-0 shadow-2xs border border-slate-200/60">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-500 font-medium">Hành trình di chuyển</p>
              <p className="font-extrabold text-slate-900 text-xs sm:text-sm">
                {itinerary.placesCount || 12} địa điểm <span className="font-normal text-slate-500 text-xs">· ~86 km tối ưu</span>
              </p>
              <p className="text-[11px] text-teal-700 font-semibold mt-0.5">
                ⚡ Giảm 22% thời gian chờ kẹt xe bằng AI
              </p>
            </div>
          </div>

          {/* Panel 3: Weather Grounding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-amber-600 flex items-center justify-center flex-shrink-0 shadow-2xs border border-slate-200/60">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Thời tiết AI Grounding:</span>
                <span className="font-extrabold text-amber-700">25°C – 28°C</span>
              </div>
              <p className="font-semibold text-slate-800 text-xs">Nắng nhẹ rực rỡ, gió mát trong lành</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Lý tưởng tham quan & săn ảnh hoàng hôn 17:30</p>
            </div>
          </div>

        </div>

        {/* ─── 3. MAIN BODY: 2-COLUMN SCROLLABLE WORKSPACE ─────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/50">
          
          {/* ─── CỘT TRÁI (7 COLS): TIMELINE HOẠT ĐỘNG & ĐỊA CHỈ CHI TIẾT ──────── */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            
            {/* Day Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {days.map((d, index) => {
                const isActive = activeDayIndex === index;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveDayIndex(index)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80 hover:text-slate-900'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-sky-500'}`}></span>
                    <span>{d.title || `Ngày ${index + 1}`}</span>
                  </button>
                );
              })}
            </div>

            {/* Timeline Vertical Track */}
            <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              
              {currentDay.activities && currentDay.activities.map((act, actIdx) => {
                const colors = [
                  { dot: 'bg-sky-600', badge: 'text-sky-700 bg-sky-50 border-sky-200' },
                  { dot: 'bg-teal-600', badge: 'text-teal-700 bg-teal-50 border-teal-200' },
                  { dot: 'bg-amber-500', badge: 'text-amber-800 bg-amber-50 border-amber-200' },
                  { dot: 'bg-purple-600', badge: 'text-purple-700 bg-purple-50 border-purple-200' }
                ];
                const theme = colors[actIdx % colors.length];
                const mapQueryUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  act.address || act.location || act.title
                )}`;

                return (
                  <React.Fragment key={actIdx}>
                    
                    {/* Activity Card */}
                    <div className="relative group bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80 hover:shadow-md transition-all">
                      {/* Timeline Pin Dot */}
                      <span className={`absolute -left-[1.85rem] top-5 w-3.5 h-3.5 rounded-full ${theme.dot} ring-4 ring-white shadow-2xs`}></span>

                      <div className="flex flex-col sm:flex-row gap-4 items-start">
                        
                        {/* Thumbnail photo */}
                        {act.image && (
                          <div className="w-full sm:w-28 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200/60 shadow-2xs">
                            <img
                              src={act.image}
                              alt={act.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}

                        {/* Card Info */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          
                          {/* Time & Category */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-md border ${theme.badge}`}>
                              {act.time || '08:30 – 10:30'}
                            </span>
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-bold">
                              {act.category || 'Điểm tham quan'}
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className="font-display font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                            {act.title}
                          </h4>

                          {/* ─── EXPLICIT ADDRESS SECTION (USER REQUIREMENT) ─── */}
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start justify-between gap-2 text-xs">
                            <div className="flex items-start gap-1.5 min-w-0">
                              <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <span className="font-bold text-slate-800 block text-xs">
                                  {act.location || act.title}
                                </span>
                                <span className="text-slate-600 text-[11px] leading-tight block mt-0.5">
                                  {act.address || `Khu du lịch ${itinerary.destination}, Việt Nam`}
                                </span>
                              </div>
                            </div>

                            <a
                              href={mapQueryUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer border border-sky-200/60"
                              title="Mở Google Maps chỉ đường"
                            >
                              <span>Google Maps</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                          {/* Note / Description */}
                          {act.note && (
                            <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                              {act.note}
                            </p>
                          )}

                          {/* AI Tip Box */}
                          {act.aiTip && (
                            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-[11px] text-amber-900 flex items-start gap-1.5">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <span>
                                <strong>Mẹo WanderAI:</strong> {act.aiTip}
                              </span>
                            </div>
                          )}

                          {/* Footer details & micro-actions */}
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
                            <span className="text-[11px] text-slate-500">
                              Chi phí dự kiến: <strong className="text-sky-700">{act.cost || 'Miễn phí vé'}</strong>
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  toast.info(`WanderAI đang tìm điểm tương tự gần ${act.location || act.title}...`);
                                  setTimeout(() => {
                                    toast.success('Đã gợi ý điểm check-in thay thế lý tưởng!');
                                  }, 800);
                                }}
                                className="text-sky-600 hover:text-sky-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>Đổi điểm bằng AI</span>
                              </button>
                            </div>
                          </div>

                        </div>

                      </div>
                    </div>

                    {/* Transit connector strip between cards */}
                    {act.transit && (
                      <div className="flex items-center gap-2 text-slate-500 text-[11px] bg-slate-100/80 px-3 py-1.5 rounded-xl w-fit border border-slate-200/60 ml-2">
                        <Car className="w-3.5 h-3.5 text-teal-600" />
                        <span>{act.transit}</span>
                      </div>
                    )}

                  </React.Fragment>
                );
              })}

            </div>

          </div>

          {/* ─── CỘT PHẢI (5 COLS): BẢN ĐỒ GPS & TRỢ LÝ ON-THE-GO ───────────────── */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            
            {/* 1. Map Card with Numbered Waypoints */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                  <Navigation className="w-4 h-4 text-sky-600" />
                  <span>Bản đồ GPS & Lộ trình Ngày {activeDayIndex + 1}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-[10px] font-extrabold">
                  Đồng bộ GPS thực
                </span>
              </div>

              {/* Map Canvas Graphic */}
              <div className="relative w-full h-60 rounded-xl overflow-hidden bg-slate-900 border border-slate-200/60 group">
                <img
                  alt="Bản đồ số lộ trình"
                  className="w-full h-full object-cover opacity-65 group-hover:scale-105 transition-transform duration-500"
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80"
                />
                <div className="absolute inset-0 bg-sky-950/20 backdrop-blur-[0.5px]"></div>

                {/* Numbered Pins */}
                {currentDay.activities && currentDay.activities.slice(0, 4).map((a, i) => {
                  const pos = [
                    'top-4 left-6',
                    'top-16 right-8',
                    'bottom-16 left-12',
                    'bottom-4 right-10'
                  ][i] || 'top-10 left-10';

                  const colors = ['bg-sky-600', 'bg-teal-600', 'bg-amber-600', 'bg-purple-600'];

                  return (
                    <div
                      key={i}
                      className={`absolute ${pos} flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 text-slate-900 text-[10px] font-bold shadow-md backdrop-blur-xs`}
                    >
                      <span className={`w-4 h-4 rounded-full ${colors[i % colors.length]} text-white text-[9px] font-extrabold flex items-center justify-center`}>
                        {i + 1}
                      </span>
                      <span className="truncate max-w-[110px]">{a.location || a.title}</span>
                    </div>
                  );
                })}

                {/* SVG Route Connector */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-sky-400 stroke-[3] fill-none stroke-dasharray-[4_4]">
                  <path d="M 60 30 Q 140 80 180 100 T 110 170 T 260 210"></path>
                </svg>

                {/* Live Distance Footer Overlay */}
                <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md text-white flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-sky-400" />
                    <span>Lộ trình tối ưu vòng tròn</span>
                  </span>
                  <span className="font-bold text-sky-300">Không đi lặp lại</span>
                </div>
              </div>

              {/* Waypoints List with exact addresses */}
              <div className="space-y-1 pt-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Danh sách trạm dừng:</p>
                {currentDay.activities && currentDay.activities.map((act, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <div className="truncate">
                        <span className="font-bold text-slate-800">{act.location || act.title}</span>
                        <span className="text-slate-400 text-[10px] block truncate">{act.address}</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0 ml-2">{act.time?.split('–')[0]?.trim()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Trợ lý AI On-the-Go */}
            <div className="bg-gradient-to-br from-slate-50 via-sky-50/40 to-teal-50/40 p-4 rounded-2xl shadow-xs border border-slate-200/80 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-xs text-slate-900">
                  Trợ lý AI On-the-Go
                </h4>
              </div>
              <p className="text-slate-600 text-[11px]">
                Xử lý nhanh các tình huống thực tế bằng trí tuệ nhân tạo:
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleWeatherOptimize}
                  className="w-full px-3 py-2 rounded-xl bg-white hover:bg-sky-50/80 text-slate-800 text-xs font-semibold flex items-center justify-between transition-colors shadow-2xs border border-slate-200/60 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-sky-600" />
                    <span>Tối ưu lại nếu có mưa rào</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={handleSuggestCafes}
                  className="w-full px-3 py-2 rounded-xl bg-white hover:bg-sky-50/80 text-slate-800 text-xs font-semibold flex items-center justify-between transition-colors shadow-2xs border border-slate-200/60 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-amber-600" />
                    <span>Gợi ý quán cafe chill gần đây (&lt;1km)</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={handleBillSplit}
                  className="w-full px-3 py-2 rounded-xl bg-white hover:bg-sky-50/80 text-slate-800 text-xs font-semibold flex items-center justify-between transition-colors shadow-2xs border border-slate-200/60 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-teal-600" />
                    <span>Chia tiền nhóm tự động (Bill Splitter)</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* 3. Checklist hành trang chuẩn bị */}
            <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Checklist hành trang chuẩn bị</span>
                </h4>
                <span className="text-[11px] text-sky-600 font-extrabold">
                  {completedChecklistCount}/{checklist.length} sẵn sàng
                </span>
              </div>

              {/* Progress */}
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all duration-300"
                  style={{ width: `${(completedChecklistCount / checklist.length) * 100}%` }}
                />
              </div>

              {/* Checklist items */}
              <div className="space-y-1.5 text-xs text-slate-700">
                {checklist.map(item => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    className="flex items-center gap-2 cursor-pointer select-none py-1 hover:text-sky-600 transition-colors"
                  >
                    {item.done ? (
                      <CheckSquare className="w-4 h-4 text-sky-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span className={item.done ? 'line-through text-slate-400' : 'font-medium'}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* ─── 4. MODAL FOOTER ACTION BAR (STITCH SCREEN M10) ─────────────────── */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => toast.info('Đang mở chế độ chỉnh sửa toàn diện lịch trình...')}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Chỉnh sửa lịch trình</span>
            </button>

            <button
              type="button"
              onClick={() => toast.success('Đã đồng bộ lịch trình thành công sang Google Calendar!')}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4 text-sky-600" />
              <span>Gửi sang Zalo / Lịch Google</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleStartOnTheGo}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
          >
            <span>Bắt đầu Chế Độ Đi Đường (On-the-Go Mode) 🚀</span>
            <Navigation className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
