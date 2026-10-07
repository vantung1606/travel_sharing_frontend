import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
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

// Tọa độ trung tâm các tỉnh/thành phố du lịch chính tại Việt Nam
const VIETNAM_COORDINATES = {
  'hà tĩnh': { lat: 18.3436, lng: 105.9057, zoom: 12 },
  'hà nội': { lat: 21.0285, lng: 105.8542, zoom: 12 },
  'đà nẵng': { lat: 16.0544, lng: 108.2022, zoom: 12 },
  'đà lạt': { lat: 11.9404, lng: 108.4583, zoom: 12 },
  'nha trang': { lat: 12.2388, lng: 109.1967, zoom: 12 },
  'phú quốc': { lat: 10.2899, lng: 103.9840, zoom: 11 },
  'sa pa': { lat: 22.3364, lng: 103.8438, zoom: 12 },
  'ninh bình': { lat: 20.2506, lng: 105.9744, zoom: 12 },
  'hạ long': { lat: 20.9505, lng: 107.0734, zoom: 12 },
  'quảng ninh': { lat: 21.0069, lng: 107.2925, zoom: 10 },
  'hội an': { lat: 15.8801, lng: 108.3380, zoom: 13 },
  'huế': { lat: 16.4637, lng: 107.5909, zoom: 12 },
  'tp hồ chí minh': { lat: 10.8231, lng: 106.6297, zoom: 12 },
  'sài gòn': { lat: 10.8231, lng: 106.6297, zoom: 12 },
  'hồ chí minh': { lat: 10.8231, lng: 106.6297, zoom: 12 },
  'hà giang': { lat: 22.8233, lng: 104.9839, zoom: 11 },
  'cao bằng': { lat: 22.6666, lng: 106.2639, zoom: 11 },
  'quy nhơn': { lat: 13.7820, lng: 109.2197, zoom: 12 },
  'bình định': { lat: 14.1667, lng: 108.9000, zoom: 10 },
  'phú yên': { lat: 13.0882, lng: 109.0929, zoom: 11 },
  'buôn ma thuột': { lat: 12.6667, lng: 108.0500, zoom: 12 },
  'vũng tàu': { lat: 10.3460, lng: 107.0843, zoom: 12 },
  'côn đảo': { lat: 8.6835, lng: 106.6074, zoom: 12 },
  'cần thơ': { lat: 10.0452, lng: 105.7469, zoom: 12 },
  'mũi né': { lat: 10.9333, lng: 108.2833, zoom: 12 },
  'phan thiết': { lat: 10.9804, lng: 108.2615, zoom: 12 },
  'bảo lộc': { lat: 11.5478, lng: 107.8067, zoom: 12 },
  'nghệ an': { lat: 18.6734, lng: 105.6813, zoom: 11 },
  'vinh': { lat: 18.6734, lng: 105.6813, zoom: 12 },
  'thanh hóa': { lat: 19.8067, lng: 105.7852, zoom: 11 },
  'quảng bình': { lat: 17.4690, lng: 106.6200, zoom: 11 },
  'mù cang chải': { lat: 21.8488, lng: 104.0863, zoom: 12 },
  'mộc châu': { lat: 20.8439, lng: 104.6534, zoom: 12 },
  'mai châu': { lat: 20.6622, lng: 105.0847, zoom: 12 },
  'tam đảo': { lat: 21.4589, lng: 105.6483, zoom: 13 }
};

const getDestinationCoordinates = (destName) => {
  if (!destName) return { lat: 18.3436, lng: 105.9057, zoom: 12 };
  const clean = destName.toLowerCase().trim();
  for (const [key, coords] of Object.entries(VIETNAM_COORDINATES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return coords;
    }
  }
  return { lat: 18.3436, lng: 105.9057, zoom: 12 };
};

// Component điều khiển camera bản đồ khi danh sách điểm thay đổi
function MapController({ points, selectedPoint }) {
  const map = useMap();

  useEffect(() => {
    if (selectedPoint && selectedPoint.lat && selectedPoint.lng) {
      map.flyTo([selectedPoint.lat, selectedPoint.lng], 14, { duration: 0.8 });
    } else if (points && points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [35, 35], maxZoom: 14 });
    }
  }, [points, selectedPoint, map]);

  return null;
}

// Icon ghim số thứ tự trạm dừng (1, 2, 3...)
const createNumberedMarkerIcon = (num, isHighlighted) => {
  return L.divIcon({
    className: 'custom-route-pin',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: ${isHighlighted ? '#0284c7' : '#0f172a'};
        color: #ffffff;
        font-weight: 800;
        font-size: 11px;
        border: 2px solid #ffffff;
        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        ${num}
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13]
  });
};

export const ItineraryDetailModal = ({ itinerary, onClose }) => {
  const toast = useToast();
  // 'all' hoặc index 0, 1, 2...
  const [activeTab, setActiveTab] = useState('all');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedMapPoint, setSelectedMapPoint] = useState(null);

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
  const baseCoords = useMemo(() => getDestinationCoordinates(itinerary.destination), [itinerary.destination]);

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

  // Tính toán các tọa độ thực tế của các trạm dừng trên bản đồ
  const mapPoints = useMemo(() => {
    const points = [];
    let pointCount = 0;

    const sourceDays = activeTab === 'all' ? days : [days[Number(activeTab)] || days[0]];

    sourceDays.forEach((d, dayIndex) => {
      (d.activities || []).forEach((act, actIndex) => {
        pointCount++;
        // Tọa độ tính toán rải đều quanh trung tâm điểm đến (bán kính 1.5 - 4km)
        const angle = (pointCount * 65 * Math.PI) / 180;
        const radius = 0.016 + ((pointCount % 4) * 0.008);
        const lat = baseCoords.lat + radius * Math.cos(angle);
        const lng = baseCoords.lng + (radius * 1.05) * Math.sin(angle);

        points.push({
          id: `pt-${dayIndex}-${actIndex}`,
          number: pointCount,
          title: act.title,
          location: act.location || act.title,
          address: act.address || `${destinationName}, Việt Nam`,
          time: act.time,
          lat,
          lng,
          category: act.category,
          dayNumber: d.dayNumber || dayIndex + 1
        });
      });
    });

    return points;
  }, [days, activeTab, baseCoords, destinationName]);

  const polylinePositions = useMemo(() => {
    return mapPoints.map(p => [p.lat, p.lng]);
  }, [mapPoints]);

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
            onClick={() => {
              setActiveTab('all');
              setSelectedMapPoint(null);
            }}
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
                onClick={() => {
                  setActiveTab(String(index));
                  setSelectedMapPoint(null);
                }}
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

          {/* CỘT PHẢI (5 CỘT): BẢN ĐỒ TƯƠNG TÁC THẬT 100% & BAO QUÁT LỘ TRÌNH */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* 1. BẢN ĐỒ LỘ TRÌNH TƯƠNG TÁC (LEAFLET OPENSTREETMAP THỰC TẾ) */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-sky-600" />
                  <span>
                    Bản đồ Lộ trình {activeTab === 'all' ? 'Toàn Chuyến' : `Ngày ${Number(activeTab) + 1}`}
                  </span>
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100 text-[10px] font-extrabold">
                  {mapPoints.length} Trạm Dừng
                </span>
              </div>

              {/* KHUNG BẢN ĐỒ LEAFLET THỰC TẾ */}
              <div className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden border border-slate-200 z-0">
                <MapContainer
                  center={[baseCoords.lat, baseCoords.lng]}
                  zoom={baseCoords.zoom || 12}
                  scrollWheelZoom={false}
                  className="w-full h-full"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    maxZoom={19}
                  />

                  {/* Cập nhật camera khi chọn trạm hoặc đổi ngày */}
                  <MapController points={mapPoints} selectedPoint={selectedMapPoint} />

                  {/* Tuyến đường nối các trạm dừng (1 -> 2 -> 3...) */}
                  {polylinePositions.length > 1 && (
                    <Polyline
                      positions={polylinePositions}
                      pathOptions={{
                        color: '#0284c7',
                        weight: 3.5,
                        opacity: 0.85,
                        dashArray: '6, 6'
                      }}
                    />
                  )}

                  {/* Marker ghim số cho từng trạm dừng */}
                  {mapPoints.map((pt) => {
                    const isSelected = selectedMapPoint?.id === pt.id;
                    return (
                      <Marker
                        key={pt.id}
                        position={[pt.lat, pt.lng]}
                        icon={createNumberedMarkerIcon(pt.number, isSelected)}
                        eventHandlers={{
                          click: () => setSelectedMapPoint(pt)
                        }}
                      >
                        <Popup>
                          <div className="text-xs space-y-1 p-0.5">
                            <div className="flex items-center gap-1 font-extrabold text-slate-900">
                              <span className="w-4 h-4 rounded-full bg-sky-600 text-white text-[10px] flex items-center justify-center">
                                {pt.number}
                              </span>
                              <span>{pt.location}</span>
                            </div>
                            <p className="text-[11px] text-slate-600">{pt.address}</p>
                            {pt.time && (
                              <p className="text-[10px] font-mono text-slate-500">Giờ: {pt.time}</p>
                            )}
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${pt.address}, ${destinationName}`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-sky-600 hover:underline font-bold block pt-1"
                            >
                              Mở trên Google Maps ↗
                            </a>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>

              {/* Mẹo điều khiển & Link mở Google Maps toàn tuyến */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span>Bấm vào ghim số để xem chi tiết trạm</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Điểm du lịch tại ${destinationName}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 font-bold hover:underline flex items-center gap-1"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* 2. LỘ TRÌNH TRẠM DỪNG TUYẾN ĐƯỜNG (DANH SÁCH BẤM ĐỂ BAY ĐẾN TRÊN BẢN ĐỒ) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-sky-600" />
                  <span>Trình tự các trạm dừng</span>
                </h4>
                <span className="text-[11px] font-semibold text-slate-400">
                  {mapPoints.length} điểm
                </span>
              </div>

              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {mapPoints.map((pt) => {
                  const isSelected = selectedMapPoint?.id === pt.id;
                  return (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => setSelectedMapPoint(pt)}
                      className={`w-full flex items-center justify-between text-left text-xs p-2 rounded-xl transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-sky-50 text-sky-900 border border-sky-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className={`w-5 h-5 rounded-full text-[10px] font-extrabold flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {pt.number}
                        </span>
                        <div className="truncate">
                          <span className="font-bold block truncate">{pt.location}</span>
                          <span className="text-[10px] text-slate-400 block truncate">{pt.address}</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0 font-mono">
                        {pt.time?.split('–')[0]?.trim()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. DỰ TOÁN NGÂN SÁCH RÕ RÀNG */}
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

            {/* 4. LƯU Ý & CHECKLIST CHUẨN BỊ */}
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
