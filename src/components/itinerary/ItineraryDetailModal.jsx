import React, { useState } from 'react';
import { useToast } from '../common/Toast';
import {
  X,
  Calendar,
  MapPin,
  Clock,
  Car,
  Utensils,
  Navigation,
  DollarSign,
  Share2,
  Download,
  Users,
  ExternalLink,
  FileText,
  CheckCircle2,
  Square,
  CheckSquare,
  Compass,
  Info
} from 'lucide-react';
import { ItineraryExportModal } from './ItineraryExportModal';

export const ItineraryDetailModal = ({ itinerary, onClose }) => {
  const toast = useToast();
  // 'all' hoặc index 0, 1, 2...
  const [activeTab, setActiveTab] = useState('all');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Checklist chuẩn bị hành trang cơ bản
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'CCCD / Hộ chiếu bản gốc còn hạn', done: true },
    { id: 2, text: 'Trang phục & phụ kiện phù hợp thời tiết', done: true },
    { id: 3, text: 'Sạc pin dự phòng & dây sạc thiết bị', done: true },
    { id: 4, text: 'Thuốc cá nhân cơ bản (dị ứng, đau đầu, tiêu hóa)', done: false }
  ]);

  if (!itinerary) return null;

  const days = itinerary.days && itinerary.days.length > 0 ? itinerary.days : [
    {
      dayNumber: 1,
      title: 'Ngày 1: Khám phá các điểm dừng chân nổi bật',
      activities: [
        {
          time: '08:30 – 10:30',
          category: 'Tham quan danh thắng',
          title: `Khám phá trung tâm ${itinerary.destination || 'Điểm đến'}`,
          location: `${itinerary.destination || 'Trung tâm'}`,
          address: `Khu trung tâm ${itinerary.destination || 'Điểm đến'}, Việt Nam`,
          note: 'Dạo quanh các điểm nhấn văn hóa, kiến trúc và cảnh quan nổi bật.',
          cost: '100.000đ/người',
          transit: 'Di chuyển nội đô: ~15 phút'
        },
        {
          time: '11:30 – 13:00',
          category: 'Ẩm thực bản địa',
          title: `Thưởng thức đặc sản truyền thống`,
          location: `Quán ăn đặc sản địa phương`,
          address: `Khu ẩm thực ${itinerary.destination || 'Điểm đến'}, Việt Nam`,
          note: 'Trải nghiệm văn hóa ẩm thực đậm đà bản sắc địa phương.',
          cost: '120.000đ/người',
          transit: 'Di chuyển: ~10 phút'
        }
      ]
    }
  ];

  // Chuẩn hóa tên điểm đến viết hoa lịch sự
  const formatDestination = (str) => {
    if (!str) return 'Việt Nam';
    return str
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const destinationName = formatDestination(itinerary.destination || 'Điểm Đến');

  const toggleChecklist = (id) => {
    setChecklist(prev =>
      prev.map(item => item.id === id ? { ...item, done: !item.done } : item)
    );
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.showSuccess(`Đã sao chép liên kết lịch trình "${itinerary.title || destinationName}"!`);
    } else {
      toast.showInfo('Đã tạo liên kết chia sẻ lịch trình!');
    }
  };

  // Tính tổng số địa điểm dừng chân
  const totalPlaces = days.reduce((acc, d) => acc + (d.activities?.length || 0), 0);

  // Danh sách hiển thị theo tab
  const displayedDays = activeTab === 'all'
    ? days
    : [days[Number(activeTab)] || days[0]];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in font-display">
      {/* MODAL CARD CHÍNH - GỌN GÀNG, SẮC NÉT, RÕ RÀNG */}
      <div className="relative w-full max-w-5xl bg-white text-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 my-auto">
        
        {/* ─── 1. HEADER RÕ RÀNG, CHUYÊN NGHIỆP ─────────────────────────────────── */}
        <div className="px-6 sm:px-8 py-5 bg-white border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">
                Kế Hoạch Du Lịch
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                <span>{destinationName}</span>
              </span>
              <span>•</span>
              <span>{itinerary.duration || `${days.length}N${Math.max(1, days.length - 1)}Đ`}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {itinerary.title || `Hành Trình Khám Phá ${destinationName}`}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-0.5">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>{itinerary.departureDate || 'Ngày dự kiến trong năm'}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <Users className="w-4 h-4 text-slate-500" />
                <span>{itinerary.groupType || 'Cặp đôi'}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5 font-semibold text-sky-700">
                <DollarSign className="w-4 h-4 text-sky-600" />
                <span>Ngân sách dự kiến: {Number(itinerary.totalBudget || 11000000).toLocaleString('vi-VN')}đ</span>
              </span>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/60"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Tải PDF / In</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/60"
            >
              <Share2 className="w-4 h-4 text-slate-600" />
              <span>Chia sẻ</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer ml-1"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ─── 2. THÔNG SỐ BAO QUÁT (TỐI GIẢN, KHÔNG MÀU MÈ) ───────────────────── */}
        <div className="px-6 sm:px-8 py-3 bg-slate-50/90 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0">
          <div className="space-y-0.5">
            <span className="text-slate-500 text-[11px] font-medium block">Thời lượng</span>
            <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
              {days.length} Ngày {days.length > 1 ? `(${days.length - 1} Đêm)` : ''}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-slate-500 text-[11px] font-medium block">Tổng số trạm dừng</span>
            <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
              {totalPlaces} điểm trải nghiệm
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-slate-500 text-[11px] font-medium block">Chi phí mỗi người</span>
            <span className="font-extrabold text-sky-700 text-xs sm:text-sm">
              ~{Number(itinerary.budgetPerPerson || Math.round(Number(itinerary.totalBudget || 11000000) / 2)).toLocaleString('vi-VN')}đ
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-slate-500 text-[11px] font-medium block">Hình thức di chuyển</span>
            <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
              Tuyến đường tối ưu liên tục
            </span>
          </div>
        </div>

        {/* ─── 3. THANH ĐIỀU HƯỚNG TỪNG NGÀY & BAO QUÁT TOÀN BỘ ───────────────── */}
        <div className="px-6 sm:px-8 py-2.5 bg-white border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            📋 Tất cả các ngày (Bao quát toàn bộ)
          </button>

          {days.map((d, index) => {
            const isSelected = activeTab === String(index);
            return (
              <button
                key={index}
                type="button"
                onClick={() => setActiveTab(String(index))}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>Ngày {index + 1}</span>
                {d.title && (
                  <span className="ml-1 opacity-80 hidden md:inline">
                    : {d.title.replace(/^Ngày \d+[:\- ]*/, '')}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ─── 4. NỘI DUNG CHÍNH (2 CỘT RÕ RÀNG, DỄ QUAN SÁT) ─────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-50/40">
          
          {/* CỘT TRÁI (7 CỘT): LỊCH TRÌNH CHI TIẾT TỪNG HOẠT ĐỘNG */}
          <div className="lg:col-span-7 space-y-6">
            {displayedDays.map((dayItem, dayIdx) => (
              <div key={dayIdx} className="space-y-4">
                
                {/* Tiêu đề Ngày */}
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
                  <span className="w-7 h-7 rounded-lg bg-sky-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    {dayItem.dayNumber || dayIdx + 1}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                      {dayItem.title || `Ngày ${dayItem.dayNumber || dayIdx + 1}`}
                    </h3>
                  </div>
                </div>

                {/* Danh sách hoạt động trong ngày */}
                <div className="space-y-3.5">
                  {dayItem.activities && dayItem.activities.map((act, actIdx) => {
                    const mapQueryUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${act.address || act.location || act.title}, ${destinationName}`
                    )}`;

                    return (
                      <div
                        key={actIdx}
                        className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 hover:border-slate-300 transition-colors"
                      >
                        {/* Hàng 1: Thời gian & Danh mục */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>{act.time || '08:00 – 10:00'}</span>
                          </span>

                          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                            {act.category || 'Hoạt động trải nghiệm'}
                          </span>
                        </div>

                        {/* Hàng 2: Tên hoạt động & địa danh */}
                        <div>
                          <h4 className="font-extrabold text-base text-slate-900 leading-snug">
                            {act.title}
                          </h4>
                        </div>

                        {/* Hàng 3: Địa chỉ cụ thể & Link Google Maps */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 text-xs">
                          <div className="flex items-start gap-2 min-w-0">
                            <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <span className="font-bold text-slate-800 block text-xs">
                                {act.location || act.title}
                              </span>
                              <span className="text-slate-600 text-xs leading-normal block mt-0.5">
                                {act.address || `Khu vực ${destinationName}, Việt Nam`}
                              </span>
                            </div>
                          </div>

                          <a
                            href={mapQueryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-sky-700 text-xs font-bold flex items-center gap-1 shrink-0 border border-slate-200 transition-colors cursor-pointer"
                            title="Mở trên Google Maps"
                          >
                            <span>Bản đồ</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        </div>

                        {/* Hàng 4: Mô tả chi tiết & Kinh nghiệm */}
                        {act.note && (
                          <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                            {act.note}
                          </p>
                        )}

                        {/* Hàng 5: Chi phí & Di chuyển */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <span>
                            Chi phí: <strong className="text-slate-800">{act.cost || 'Theo thực tế'}</strong>
                          </span>

                          {act.transit && (
                            <span className="flex items-center gap-1 text-slate-500 font-medium">
                              <Car className="w-3.5 h-3.5 text-slate-400" />
                              <span>{act.transit}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>

          {/* CỘT PHẢI (5 CỘT): BAO QUÁT LỘ TRÌNH & THỰC ĐỊA */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* 1. LỘ TRÌNH TRẠM DỪNG TUYẾN ĐƯỜNG */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-sky-600" />
                  <span>Trình tự các trạm dừng</span>
                </h4>
                <span className="text-[11px] font-semibold text-slate-400">
                  {totalPlaces} điểm
                </span>
              </div>

              <div className="space-y-2">
                {days.map((d, dIdx) => (
                  <div key={dIdx} className="space-y-1.5">
                    <span className="text-[11px] font-extrabold text-slate-700 block bg-slate-50 px-2 py-1 rounded-md">
                      Ngày {dIdx + 1}
                    </span>
                    <div className="pl-3 space-y-1.5 border-l-2 border-slate-200 ml-1">
                      {d.activities && d.activities.map((a, aIdx) => (
                        <div key={aIdx} className="flex items-center justify-between text-xs text-slate-700 py-0.5">
                          <span className="truncate pr-2 font-medium">
                            {aIdx + 1}. {a.location || a.title}
                          </span>
                          <span className="text-[11px] text-slate-400 shrink-0 font-mono">
                            {a.time?.split('–')[0]?.trim()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Du lịch ${destinationName}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 text-sky-600" />
                  <span>Mở Google Maps toàn khu vực</span>
                </a>
              </div>
            </div>

            {/* 2. DỰ TOÁN NGÂN SÁCH RÕ RÀNG */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-sky-600" />
                <span>Dự trù kinh phí cơ bản</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Lưu trú ({days.length - 1} đêm)</span>
                  <span className="font-bold text-slate-800">40% (~{(Number(itinerary.totalBudget || 11000000) * 0.4).toLocaleString('vi-VN')}đ)</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Ẩm thực & Đặc sản</span>
                  <span className="font-bold text-slate-800">30% (~{(Number(itinerary.totalBudget || 11000000) * 0.3).toLocaleString('vi-VN')}đ)</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Vé tham quan & Trải nghiệm</span>
                  <span className="font-bold text-slate-800">20% (~{(Number(itinerary.totalBudget || 11000000) * 0.2).toLocaleString('vi-VN')}đ)</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Di chuyển & Chi phí dự phòng</span>
                  <span className="font-bold text-slate-800">10% (~{(Number(itinerary.totalBudget || 11000000) * 0.1).toLocaleString('vi-VN')}đ)</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-extrabold text-slate-900">
                  <span>Tổng cộng dự kiến:</span>
                  <span className="text-sky-700">{Number(itinerary.totalBudget || 11000000).toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </div>

            {/* 3. LƯU Ý & CHECKLIST CHUẨN BỊ */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-slate-600" />
                  <span>Checklist chuẩn bị</span>
                </h4>
                <span className="text-[11px] text-slate-500 font-semibold">
                  {checklist.filter(c => c.done).length}/{checklist.length} mục
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {checklist.map(item => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className="flex items-center gap-2 cursor-pointer select-none py-1 hover:text-sky-600 transition-colors"
                  >
                    {item.done ? (
                      <CheckSquare className="w-4 h-4 text-sky-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span className={item.done ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>

              {itinerary.aiTipNote && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2 mt-2">
                  <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Ghi chú:</strong> {itinerary.aiTipNote}
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* ─── 5. FOOTER RÕ RÀNG, TINH GỌN ────────────────────────────────────── */}
        <div className="px-6 sm:px-8 py-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>In & Tải Toàn Bộ Lịch Trình (PDF)</span>
            </button>
          </div>
        </div>

      </div>

      {/* Modal xuất PDF khi cần */}
      {isExportModalOpen && (
        <ItineraryExportModal
          itinerary={itinerary}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </div>
  );
};
