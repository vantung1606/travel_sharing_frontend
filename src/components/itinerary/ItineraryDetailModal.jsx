import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useToast } from '../common/Toast';
import { X, Calendar, MapPin, Clock, Car, Navigation, DollarSign, Share2, Download, Users, ExternalLink, CheckCircle2, Square, CheckSquare, Compass, Info, ListFilter, Map as MapIcon } from 'lucide-react';
import { ItineraryExportModal } from './ItineraryExportModal';

// Tọa độ trung tâm các tỉnh/thành phố du lịch chính tại Việt Nam
const VIETNAM_COORDINATES = {
  'hà tĩnh': { lat: 18.3436, lng: 105.9057, zoom: 11 },
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

// Từ điển tọa độ GPS thực tế có thật 100% của danh lam, di tích và điểm ẩm thực nổi tiếng tại Việt Nam
const VIETNAM_LANDMARKS = {
  // === HÀ TĨNH & CÁC HUYỆN (THẠCH HÀ, CAN LỘC, KỲ ANH, CẨM XUYÊN...) ===
  'biển thạch hải': { lat: 18.3667, lng: 105.9917, address: 'Bãi biển Thạch Hải, Huyện Thạch Hà, Hà Tĩnh' },
  'thạch hải': { lat: 18.3667, lng: 105.9917, address: 'Bãi biển Thạch Hải, Huyện Thạch Hà, Hà Tĩnh' },
  'khu sinh thái quỳnh viên': { lat: 18.3972, lng: 106.0125, address: 'Khu du lịch Quỳnh Viên, Thạch Hải, Huyện Thạch Hà, Hà Tĩnh' },
  'quỳnh viên': { lat: 18.3972, lng: 106.0125, address: 'Khu du lịch Quỳnh Viên, Thạch Hải, Thạch Hà, Hà Tĩnh' },
  'đền lê khôi': { lat: 18.4056, lng: 106.0167, address: 'Đền Chiêu Trưng Đại Vương Lê Khôi, Núi Long Ngâm, Thạch Hà, Hà Tĩnh' },
  'đền chiêu trưng lê khôi': { lat: 18.4056, lng: 106.0167, address: 'Đền Chiêu Trưng Đại Vương Lê Khôi, Núi Long Ngâm, Thạch Hà, Hà Tĩnh' },
  'chùa tượng sơn': { lat: 18.3222, lng: 105.8167, address: 'Chùa Tượng Sơn, Xã Sơn Giang, Huyện Thạch Hà, Hà Tĩnh' },
  'tượng sơn': { lat: 18.3222, lng: 105.8167, address: 'Chùa Tượng Sơn, Huyện Thạch Hà, Hà Tĩnh' },
  'hồ khe xai': { lat: 18.2583, lng: 105.7833, address: 'Hồ Khe Xai, Xã Thạch Xuân, Huyện Thạch Hà, Hà Tĩnh' },
  'khe xai': { lat: 18.2583, lng: 105.7833, address: 'Hồ Khe Xai, Xã Thạch Xuân, Huyện Thạch Hà, Hà Tĩnh' },
  'chợ cày': { lat: 18.3422, lng: 105.8544, address: 'Chợ Cày, Thị trấn Thạch Hà, Huyện Thạch Hà, Hà Tĩnh' },
  'thị trấn thạch hà': { lat: 18.3417, lng: 105.8500, address: 'Thị trấn Thạch Hà, Huyện Thạch Hà, Hà Tĩnh' },
  'thạch hà': { lat: 18.3417, lng: 105.8500, address: 'Huyện Thạch Hà, Hà Tĩnh' },
  'đền nguyễn thiếp': { lat: 18.3180, lng: 105.8350, address: 'Đền thờ La Sơn Phu Tử Nguyễn Thiếp, Thạch Hà, Hà Tĩnh' },
  'bánh cuốn ram giò thạch hà': { lat: 18.3410, lng: 105.8530, address: 'Đường Lý Tự Trọng, Thị trấn Thạch Hà, Hà Tĩnh' },
  'chùa hương tích': { lat: 18.4967, lng: 105.8617, address: 'Xã Thiên Lộc, Huyện Can Lộc, Hà Tĩnh' },
  'hương tích': { lat: 18.4967, lng: 105.8617, address: 'Xã Thiên Lộc, Huyện Can Lộc, Hà Tĩnh' },
  'ngã ba đồng lộc': { lat: 18.3375, lng: 105.7161, address: 'Thị trấn Đồng Lộc, Huyện Can Lộc, Hà Tĩnh' },
  'đồng lộc': { lat: 18.3375, lng: 105.7161, address: 'Thị trấn Đồng Lộc, Huyện Can Lộc, Hà Tĩnh' },
  'biển thiên cầm': { lat: 18.2783, lng: 106.0125, address: 'Thị trấn Thiên Cầm, Huyện Cẩm Xuyên, Hà Tĩnh' },
  'thiên cầm': { lat: 18.2783, lng: 106.0125, address: 'Thị trấn Thiên Cầm, Huyện Cẩm Xuyên, Hà Tĩnh' },
  'biển kỳ xuân': { lat: 18.0683, lng: 106.3361, address: 'Xã Kỳ Xuân, Huyện Kỳ Anh, Hà Tĩnh' },
  'kỳ xuân': { lat: 18.0683, lng: 106.3361, address: 'Xã Kỳ Xuân, Huyện Kỳ Anh, Hà Tĩnh' },
  'hồ kẻ gỗ': { lat: 18.1883, lng: 105.9133, address: 'Xã Cẩm Mỹ, Huyện Cẩm Xuyên, Hà Tĩnh' },
  'kẻ gỗ': { lat: 18.1883, lng: 105.9133, address: 'Xã Cẩm Mỹ, Huyện Cẩm Xuyên, Hà Tĩnh' },
  'vinpearl cửa sót': { lat: 18.4722, lng: 105.9189, address: 'Xã Thịnh Lộc, Huyện Lộc Hà, Hà Tĩnh' },
  'cửa sót': { lat: 18.4722, lng: 105.9189, address: 'Xã Thịnh Lộc, Huyện Lộc Hà, Hà Tĩnh' },
  'khu lưu niệm nguyễn du': { lat: 18.6361, lng: 105.7583, address: 'Thị trấn Tiên Điền, Huyện Nghi Xuân, Hà Tĩnh' },
  'tiên điền': { lat: 18.6361, lng: 105.7583, address: 'Thị trấn Tiên Điền, Huyện Nghi Xuân, Hà Tĩnh' },
  'nguyễn du': { lat: 18.6361, lng: 105.7583, address: 'Thị trấn Tiên Điền, Huyện Nghi Xuân, Hà Tĩnh' },
  'cháo canh hoa đô': { lat: 18.3414, lng: 105.9082, address: '19 Nguyễn Công Trứ, TP. Hà Tĩnh' },
  'hoa đô': { lat: 18.3414, lng: 105.9082, address: '19 Nguyễn Công Trứ, TP. Hà Tĩnh' },
  'cháo canh': { lat: 18.3414, lng: 105.9082, address: '19 Nguyễn Công Trứ, TP. Hà Tĩnh' },
  'bánh bèo bà hữu': { lat: 18.3421, lng: 105.9065, address: 'Đường Phan Đình Phùng, TP. Hà Tĩnh' },
  'bà hữu': { lat: 18.3421, lng: 105.9065, address: 'Đường Phan Đình Phùng, TP. Hà Tĩnh' },
  'mực nhảy vũng áng': { lat: 18.0167, lng: 106.4167, address: 'Cảng Vũng Áng, Thị xã Kỳ Anh, Hà Tĩnh' },
  'vũng áng': { lat: 18.0167, lng: 106.4167, address: 'Khu kinh tế Vũng Áng, Thị xã Kỳ Anh, Hà Tĩnh' },
  'đèo ngang': { lat: 17.9739, lng: 106.4678, address: 'Đèo Ngang, Kỳ Anh, Hà Tĩnh' },
  'biển xuân thành': { lat: 18.6750, lng: 105.8250, address: 'Xã Xuân Thành, Huyện Nghi Xuân, Hà Tĩnh' },
  'xuân thành': { lat: 18.6750, lng: 105.8250, address: 'Xã Xuân Thành, Huyện Nghi Xuân, Hà Tĩnh' },
  'thác vũ môn': { lat: 18.1722, lng: 105.6583, address: 'Hương Khê, Hà Tĩnh' },
  'núi hồng lĩnh': { lat: 18.5500, lng: 105.7833, address: 'Hồng Lĩnh, Hà Tĩnh' },
  'hồng lĩnh': { lat: 18.5500, lng: 105.7833, address: 'Thị xã Hồng Lĩnh, Hà Tĩnh' },
  'vincom plaza hà tĩnh': { lat: 18.3428, lng: 105.9042, address: 'Ngã tư Hà Huy Tập - Hàm Nghi, TP. Hà Tĩnh' },
  'chợ hà tĩnh': { lat: 18.3430, lng: 105.9060, address: 'Nam Hà, TP. Hà Tĩnh' },

  // === ĐÀ NẴNG & HỘI AN ===
  'bà nà hills': { lat: 15.9988, lng: 107.9961, address: 'Hòa Vang, Đà Nẵng' },
  'cầu vàng': { lat: 15.9950, lng: 107.9967, address: 'Bà Nà Hills, Đà Nẵng' },
  'cầu rồng': { lat: 16.0611, lng: 108.2272, address: 'Nguyễn Văn Linh, Đà Nẵng' },
  'cầu sông hàn': { lat: 16.0722, lng: 108.2267, address: 'Đà Nẵng' },
  'bán đảo sơn trà': { lat: 16.1167, lng: 108.2833, address: 'Sơn Trà, Đà Nẵng' },
  'chùa linh ứng': { lat: 16.1006, lng: 108.2778, address: 'Bán đảo Sơn Trà, Đà Nẵng' },
  'ngũ hành sơn': { lat: 16.0042, lng: 108.2611, address: 'Ngũ Hành Sơn, Đà Nẵng' },
  'biển mỹ khê': { lat: 16.0594, lng: 108.2464, address: 'Sơn Trà, Đà Nẵng' },
  'chợ cồn': { lat: 16.0689, lng: 108.2142, address: 'Hải Châu, Đà Nẵng' },
  'phố cổ hội an': { lat: 15.8801, lng: 108.3380, address: 'Hội An, Quảng Nam' },
  'chùa cầu': { lat: 15.8772, lng: 108.3261, address: 'Nguyễn Thị Minh Khai, Hội An' },
  'rừng dừa bảy mẫu': { lat: 15.8667, lng: 108.3667, address: 'Cẩm Thanh, Hội An' },

  // === NINH BÌNH ===
  'tràng an': { lat: 20.2536, lng: 105.9022, address: 'Hoa Lư, Ninh Bình' },
  'tam cốc': { lat: 20.2181, lng: 105.9392, address: 'Ninh Hải, Hoa Lư, Ninh Bình' },
  'bích động': { lat: 20.2167, lng: 105.9167, address: 'Hoa Lư, Ninh Bình' },
  'chùa bái đính': { lat: 20.2708, lng: 105.8692, address: 'Gia Viễn, Ninh Bình' },
  'hang múa': { lat: 20.2319, lng: 105.9381, address: 'Ninh Xuân, Hoa Lư, Ninh Bình' },
  'cố đô hoa lư': { lat: 20.2833, lng: 105.9000, address: 'Trường Yên, Hoa Lư, Ninh Bình' },
  'đầm vân long': { lat: 20.3708, lng: 105.8692, address: 'Gia Viễn, Ninh Bình' },

  // === ĐÀ LẠT ===
  'hồ xuân hương': { lat: 11.9408, lng: 108.4458, address: 'Phường 1, Đà Lạt' },
  'quảng trường lâm viên': { lat: 11.9367, lng: 108.4444, address: 'Phường 10, Đà Lạt' },
  'thung lũng tình yêu': { lat: 11.9792, lng: 108.4528, address: 'Mai Anh Đào, Đà Lạt' },
  'langbiang': { lat: 12.0442, lng: 108.4386, address: 'Lạc Dương, Lâm Đồng' },
  'chùa linh phước': { lat: 11.9442, lng: 108.4989, address: 'Trại Mát, Đà Lạt' },
  'chợ đêm đà lạt': { lat: 11.9425, lng: 108.4375, address: 'Nguyễn Thị Minh Khai, Đà Lạt' },
  'thác datanla': { lat: 11.9028, lng: 108.4489, address: 'Đèo Prenn, Đà Lạt' },

  // === SA PA ===
  'fansipan': { lat: 22.3033, lng: 103.7753, address: 'Sa Pa, Lào Cai' },
  'bản cát cát': { lat: 22.3292, lng: 103.8319, address: 'San Sả Hồ, Sa Pa' },
  'núi hàm rồng': { lat: 22.3333, lng: 103.8472, address: 'Trung tâm Sa Pa' },
  'đèo ô quy hồ': { lat: 22.3556, lng: 103.7667, address: 'Sa Pa, Lào Cai' },
  'thác bạc': { lat: 22.3611, lng: 103.7750, address: 'San Sả Hồ, Sa Pa' },

  // === PHÚ QUỐC ===
  'bãi sao': { lat: 10.0547, lng: 104.0322, address: 'An Thới, Phú Quốc' },
  'vinwonders phú quốc': { lat: 10.3342, lng: 103.8569, address: 'Gành Dầu, Phú Quốc' },
  'grand world': { lat: 10.3236, lng: 103.8572, address: 'Gành Dầu, Phú Quốc' },
  'hòn thơm': { lat: 9.9575, lng: 104.0194, address: 'An Thới, Phú Quốc' },
  'chợ đêm phú quốc': { lat: 10.2172, lng: 103.9592, address: 'Dương Đông, Phú Quốc' }
};

// Tọa độ các huyện/thị xã phổ biến
const VIETNAM_DISTRICTS = {
  'can lộc': { lat: 18.4500, lng: 105.7800 },
  'cẩm xuyên': { lat: 18.2500, lng: 105.9500 },
  'kỳ anh': { lat: 18.0500, lng: 106.3000 },
  'nghi xuân': { lat: 18.6200, lng: 105.7600 },
  'lộc hà': { lat: 18.4600, lng: 105.9000 },
  'thạch hà': { lat: 18.3300, lng: 105.8400 },
  'hương khê': { lat: 18.1800, lng: 105.7000 },
  'hương sơn': { lat: 18.5000, lng: 105.3200 },
  'đức thọ': { lat: 18.5200, lng: 105.5800 },
  'hồng lĩnh': { lat: 18.5500, lng: 105.7833 }
};

// Chuẩn hóa loại bỏ các từ tiền tố chung chung để tìm kiếm chính xác
const getCleanPlaceName = (raw) => {
  if (!raw) return '';
  return raw
    .replace(/^(thưởng thức|khám phá|chiêm bái|tham quan|check-in|chinh phục|thăm|dạo quanh|trải nghiệm|thư giãn tại|ghé thăm|thưởng ngoạn|ăn sáng tại|ăn trưa tại|ăn tối tại)\s+/i, '')
    .split(' tại ')[0]
    .split(' - ')[0]
    .replace(/[–—].*$/, '')
    .trim();
};

const getDestinationCoordinates = (destName) => {
  if (!destName) return { lat: 18.3436, lng: 105.9057, zoom: 11 };
  const clean = destName.toLowerCase().trim();
  for (const [key, coords] of Object.entries(VIETNAM_COORDINATES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return coords;
    }
  }
  return { lat: 18.3436, lng: 105.9057, zoom: 11 };
};

// Xác định tọa độ thực tế có thật 100% của từng hoạt động
const resolvePlaceCoordinates = (act, destinationName, baseCoords) => {
  // 1. Nếu đã có tọa độ GPS hợp lệ (trong lãnh thổ Việt Nam: lat 8 -> 24, lng 102 -> 110)
  const actLat = parseFloat(act.lat || act.latitude);
  const actLng = parseFloat(act.lng || act.longitude);
  if (!isNaN(actLat) && !isNaN(actLng) && actLat >= 8.0 && actLat <= 24.0 && actLng >= 102.0 && actLng <= 110.0) {
    return { lat: actLat, lng: actLng, isExact: true };
  }

  // 2. Tra cứu từ điển danh lam thắng cảnh / quán ăn có thật
  const cleanName = getCleanPlaceName(act.location || act.title).toLowerCase();
  const rawTitle = (act.title || '').toLowerCase();
  const rawAddress = (act.address || '').toLowerCase();
  const rawLoc = (act.location || '').toLowerCase();

  for (const [key, coords] of Object.entries(VIETNAM_LANDMARKS)) {
    if (
      cleanName.includes(key) ||
      key.includes(cleanName) ||
      rawLoc.includes(key) ||
      rawTitle.includes(key) ||
      rawAddress.includes(key)
    ) {
      return { lat: coords.lat, lng: coords.lng, isExact: true, matchedAddress: coords.address };
    }
  }

  // 3. Tra cứu theo quận / huyện / thị xã
  for (const [distKey, distCoords] of Object.entries(VIETNAM_DISTRICTS)) {
    if (rawAddress.includes(distKey) || rawTitle.includes(distKey) || rawLoc.includes(distKey)) {
      return { lat: distCoords.lat, lng: distCoords.lng, isExact: false };
    }
  }

  // 4. Nếu chưa xác định được chính xác, dùng tọa độ trung tâm địa phương (không tạo offset ngẫu nhiên gây lệch ra biển/ruộng)
  return { lat: baseCoords.lat, lng: baseCoords.lng, isExact: false };
};

// Component điều khiển camera bản đồ khi danh sách điểm hoặc tab thay đổi
function MapController({ points, selectedPoint, triggerResize }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map, triggerResize]);

  useEffect(() => {
    if (selectedPoint && selectedPoint.lat && selectedPoint.lng) {
      map.flyTo([selectedPoint.lat, selectedPoint.lng], 14, { duration: 0.8 });
    } else if (points && points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
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
  // Chế độ xem trên Mobile & Tablet (< 1024px): 'timeline' (Lịch trình) hoặc 'map' (Bản đồ & Lộ trình)
  const [mobileTab, setMobileTab] = useState('timeline');
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
        const resolved = resolvePlaceCoordinates(act, destinationName, baseCoords);
        const cleanName = getCleanPlaceName(act.location || act.title);

        points.push({
          id: `pt-${dayIndex}-${actIndex}`,
          number: pointCount,
          title: act.title,
          cleanName: cleanName || act.title,
          location: act.location || cleanName || act.title,
          address: act.address || resolved.matchedAddress || `${destinationName}, Việt Nam`,
          time: act.time,
          lat: resolved.lat,
          lng: resolved.lng,
          isExact: resolved.isExact,
          category: act.category,
          dayNumber: d.dayNumber || dayIndex + 1
        });
      });
    });

    // Tách các điểm bị trùng tọa độ để các trạm (1, 2, 3...) không đè khít lên nhau tạo thành 1 điểm duy nhất
    const coordSeen = new Map();
    points.forEach((pt, idx) => {
      const key = `${pt.lat.toFixed(3)},${pt.lng.toFixed(3)}`;
      if (coordSeen.has(key)) {
        const count = coordSeen.get(key);
        coordSeen.set(key, count + 1);
        // Tách nhẹ theo vòng tròn bán kính 400m - 1.2km (0.005 - 0.012 độ)
        const angle = ((count * 60) + (idx * 30)) * (Math.PI / 180);
        const dist = 0.005 + (count * 0.0025);
        pt.lat = Number((pt.lat + Math.sin(angle) * dist).toFixed(6));
        pt.lng = Number((pt.lng + Math.cos(angle) * dist).toFixed(6));
      } else {
        coordSeen.set(key, 1);
      }
    });

    return points;
  }, [days, activeTab, baseCoords, destinationName]);

  const polylinePositions = useMemo(() => {
    return mapPoints.map(p => [p.lat, p.lng]);
  }, [mapPoints]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-fade-in font-display">
      {/* MODAL CARD CHÍNH - RESPONSIVE TOÀN DIỆN: MOBILE, TABLET & DESKTOP */}
      <div className="relative w-full max-w-5xl bg-white text-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[95vh] sm:h-[92vh] max-h-[96vh] border border-slate-200 my-auto">
        
        {/* ─── 1. HEADER CHUẨN MỰC, RESPONSIVE TINH GỌN ────────────────────────── */}
        <div className="px-4 sm:px-6 md:px-8 py-3.5 sm:py-5 bg-white border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 shrink-0">
          <div className="space-y-1 sm:space-y-1.5 min-w-0 pr-8 md:pr-0">
            {/* Top tags row */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-slate-500">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">
                Kế Hoạch Du Lịch
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-600">
                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-600" />
                <span className="truncate max-w-[120px] sm:max-w-none">{destinationName}</span>
              </span>
              <span>•</span>
              <span>{itinerary.duration || `${days.length}N${Math.max(1, days.length - 1)}Đ`}</span>
            </div>

            {/* Title */}
            <h1 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-snug truncate">
              {itinerary.title || `Hành Trình Khám Phá ${destinationName}`}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs text-slate-600 pt-0.5">
              <span className="flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{itinerary.departureDate || 'Ngày trong năm'}</span>
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="flex items-center gap-1 font-medium">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{itinerary.groupType || 'Cặp đôi'}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 font-bold text-sky-700">
                <DollarSign className="w-3.5 h-3.5 text-sky-600" />
                <span>{Number(itinerary.totalBudget || 11000000).toLocaleString('vi-VN')}đ</span>
              </span>
            </div>
          </div>

          {/* Action Header Buttons & Close Button */}
          <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 pt-1 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(true)}
                className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/60"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Tải PDF</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/60"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Chia sẻ</span>
              </button>
            </div>

            {/* Nút X luôn nổi bật, dễ bấm ở góc trên bên phải trên mọi thiết bị */}
            <button
              type="button"
              onClick={onClose}
              className="absolute md:static top-3 right-3 md:top-auto md:right-auto w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-xs md:shadow-none"
              title="Đóng cửa sổ"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ─── 2. THÔNG SỐ BAO QUÁT (RESPONSIVE GRID) ─────────────────────────── */}
        <div className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-slate-50/90 border-b border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 text-xs shrink-0">
          <div className="space-y-0.5">
            <span className="text-slate-500 text-[10px] sm:text-[11px] font-medium block">Thời lượng</span>
            <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
              {days.length} Ngày {days.length > 1 ? `(${days.length - 1} Đêm)` : ''}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-slate-500 text-[10px] sm:text-[11px] font-medium block">Tổng số trạm</span>
            <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
              {totalPlaces} điểm dừng
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-slate-500 text-[10px] sm:text-[11px] font-medium block">Mỗi thành viên</span>
            <span className="font-extrabold text-sky-700 text-xs sm:text-sm">
              ~{Number(itinerary.budgetPerPerson || Math.round(Number(itinerary.totalBudget || 11000000) / 2)).toLocaleString('vi-VN')}đ
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-slate-500 text-[10px] sm:text-[11px] font-medium block">Lộ trình</span>
            <span className="font-extrabold text-slate-900 text-xs sm:text-sm truncate block">
              Tuyến tối ưu liên tục
            </span>
          </div>
        </div>

        {/* ─── 3. THANH ĐIỀU HƯỚNG TỪNG NGÀY (SCROLL MƯỢT TRÊN MOBILE) ─────────── */}
        <div className="px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 bg-white border-b border-slate-200 flex items-center gap-1.5 sm:gap-2 overflow-x-auto shrink-0 scrollbar-none touch-pan-x">
          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
              setSelectedMapPoint(null);
            }}
            className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            📋 Tất cả các ngày
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
                className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
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

        {/* ─── 4. MOBILE / TABLET SEGMENTED SWITCHER (< 1024px) ───────────────── */}
        <div className="lg:hidden px-4 sm:px-6 py-2 bg-slate-100/80 border-b border-slate-200 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setMobileTab('timeline')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'timeline'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5 text-sky-600" />
            <span>Lịch Trình Chi Tiết</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'map'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5 text-sky-600" />
            <span>Bản Đồ & Lộ Trình ({mapPoints.length})</span>
          </button>
        </div>

        {/* ─── 5. NỘI DUNG CHÍNH (RESPONSIVE WORKSPACE) ────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 bg-slate-50/40">
          
          {/* CỘT TRÁI (7 CỘT): LỊCH TRÌNH CHI TIẾT TỪNG HOẠT ĐỘNG */}
          <div className={`space-y-5 sm:space-y-6 lg:col-span-7 ${mobileTab === 'timeline' ? 'block' : 'hidden lg:block'}`}>
            {displayedDays.map((dayItem, dayIdx) => (
              <div key={dayIdx} className="space-y-3.5 sm:space-y-4">
                
                {/* Tiêu đề Ngày */}
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
                  <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-sky-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    {dayItem.dayNumber || dayIdx + 1}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                      {dayItem.title || `Ngày ${dayItem.dayNumber || dayIdx + 1}`}
                    </h3>
                  </div>
                </div>

                {/* Danh sách hoạt động trong ngày */}
                <div className="space-y-3 sm:space-y-3.5">
                  {dayItem.activities && dayItem.activities.map((act, actIdx) => {
                    // Tìm điểm map tương ứng để lấy tọa độ chuẩn
                    const matchedPt = mapPoints.find(p => p.dayNumber === (dayItem.dayNumber || dayIdx + 1) && (p.title === act.title || p.location === act.location));
                    const cleanPlaceName = getCleanPlaceName(act.location || act.title);

                    // Ưu tiên liên kết Google Maps theo tọa độ chính xác hoặc địa danh sạch có thật
                    const mapQueryUrl = matchedPt?.isExact
                      ? `https://www.google.com/maps/search/?api=1&query=${matchedPt.lat},${matchedPt.lng}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${cleanPlaceName}, ${act.address || destinationName}`)}`;

                    return (
                      <div
                        key={actIdx}
                        className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5 sm:space-y-3 hover:border-slate-300 transition-colors"
                      >
                        {/* Hàng 1: Thời gian & Danh mục */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] sm:text-xs font-bold font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>{act.time || '08:00 – 10:00'}</span>
                          </span>

                          <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 bg-slate-100 px-2 sm:px-2.5 py-0.5 rounded-md">
                            {act.category || 'Hoạt động trải nghiệm'}
                          </span>
                        </div>

                        {/* Hàng 2: Tên hoạt động & địa danh */}
                        <div>
                          <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                            {act.title}
                          </h4>
                        </div>

                        {/* Hàng 3: Địa chỉ cụ thể & Link Google Maps */}
                        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 text-xs">
                          <div className="flex items-start gap-2 min-w-0">
                            <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <span className="font-bold text-slate-800 block text-xs">
                                {act.location || cleanPlaceName || act.title}
                              </span>
                              <span className="text-slate-600 text-[11px] sm:text-xs leading-normal block mt-0.5">
                                {act.address || matchedPt?.address || `${destinationName}, Việt Nam`}
                              </span>
                            </div>
                          </div>

                          <a
                            href={mapQueryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="self-start sm:self-auto px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-sky-700 text-[11px] sm:text-xs font-bold flex items-center gap-1 shrink-0 border border-slate-200 transition-colors cursor-pointer"
                            title="Mở chính xác trên Google Maps"
                          >
                            <span>Google Maps</span>
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
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs text-slate-500">
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
          <div className={`space-y-5 lg:col-span-5 ${mobileTab === 'map' ? 'block' : 'hidden lg:block'}`}>
            
            {/* 1. BẢN ĐỒ LỘ TRÌNH TƯƠNG TÁC (LEAFLET OPENSTREETMAP THỰC TẾ) */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
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

              {/* KHUNG BẢN ĐỒ LEAFLET THỰC TẾ (RESPONSIVE HEIGHT) */}
              <div className="relative w-full h-56 sm:h-64 md:h-72 rounded-xl overflow-hidden border border-slate-200 z-0">
                <MapContainer
                  center={[baseCoords.lat, baseCoords.lng]}
                  zoom={baseCoords.zoom || 11}
                  scrollWheelZoom={false}
                  className="w-full h-full"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    maxZoom={19}
                  />

                  {/* Cập nhật camera khi chọn trạm hoặc đổi ngày hoặc đổi tab mobile */}
                  <MapController
                    points={mapPoints}
                    selectedPoint={selectedMapPoint}
                    triggerResize={mobileTab}
                  />

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
                    const googleMapsDirectUrl = pt.isExact
                      ? `https://www.google.com/maps/search/?api=1&query=${pt.lat},${pt.lng}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${pt.cleanName}, ${pt.address || destinationName}`)}`;

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
                              <span className="w-4 h-4 rounded-full bg-sky-600 text-white text-[10px] flex items-center justify-center shrink-0">
                                {pt.number}
                              </span>
                              <span>{pt.location}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-tight">{pt.address}</p>
                            {pt.time && (
                              <p className="text-[10px] font-mono text-slate-500">Giờ: {pt.time}</p>
                            )}
                            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-2">
                              <a
                                href={googleMapsDirectUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-sky-600 hover:underline font-bold inline-flex items-center gap-1"
                              >
                                <span>Mở trên Google Maps</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              <span className="text-[9px] text-slate-400 font-mono">
                                {pt.lat.toFixed(3)}, {pt.lng.toFixed(3)}
                              </span>
                            </div>
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
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-sky-600" />
                  <span>Trình tự các trạm dừng</span>
                </h4>
                <span className="text-[11px] font-semibold text-slate-400">
                  {mapPoints.length} điểm
                </span>
              </div>

              <div className="space-y-1.5 max-h-48 sm:max-h-56 overflow-y-auto pr-1">
                {mapPoints.map((pt) => {
                  const isSelected = selectedMapPoint?.id === pt.id;
                  return (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => {
                        setSelectedMapPoint(pt);
                        if (window.innerWidth < 1024) {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
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
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
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

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs sm:text-sm font-extrabold text-slate-900">
                  <span>Tổng cộng dự kiến:</span>
                  <span className="text-sky-700">{Number(itinerary.totalBudget || 11000000).toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </div>

            {/* 4. LƯU Ý & CHECKLIST CHUẨN BỊ */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
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
                <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2 mt-2">
                  <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Ghi chú:</strong> {itinerary.aiTipNote}
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* ─── 6. FOOTER RÕ RÀNG, TINH GỌN, RESPONSIVE ───────────────────────── */}
        <div className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-white border-t border-slate-200 flex items-center justify-between gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">In & Tải Toàn Bộ Lịch Trình (PDF)</span>
              <span className="sm:hidden">Tải Lịch Trình PDF</span>
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
