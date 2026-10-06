import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Navigation,
  ExternalLink,
  Phone,
  Eye,
  Star,
  Sparkles,
  MapPin,
  Clock,
  ChevronUp,
  X,
  Compass,
  CheckCircle2,
  Share2
} from 'lucide-react';

// Custom Map Controller to smoothly fly to active item or user location
function MapFlyController({ activeItem, userCoords }) {
  const map = useMap();

  useEffect(() => {
    if (activeItem?.latitude && activeItem?.longitude) {
      const lat = parseFloat(activeItem.latitude);
      const lng = parseFloat(activeItem.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        map.flyTo([lat, lng], 13, {
          duration: 1.2,
          easeLinearity: 0.25
        });
      }
    }
  }, [activeItem, map]);

  useEffect(() => {
    if (userCoords?.lat && userCoords?.lng) {
      map.flyTo([userCoords.lat, userCoords.lng], 12, {
        duration: 1.2
      });
    }
  }, [userCoords, map]);

  return null;
}

// Custom Marker Icon Generator using Tailwind CSS
const createCustomMarkerIcon = (item, isActive) => {
  const isCafe = item.category?.includes('Cafe');
  const isHome = item.category?.includes('Homestay');
  const isFood = item.category?.includes('Ẩm Thực');
  const isActivity = item.category?.includes('Trải Nghiệm');

  let bgClass = 'bg-gradient-to-tr from-sky-600 to-blue-500';
  let emoji = '📍';

  if (isCafe) {
    bgClass = 'bg-gradient-to-tr from-amber-500 to-orange-500';
    emoji = '☕';
  } else if (isHome) {
    bgClass = 'bg-gradient-to-tr from-orange-600 to-rose-500';
    emoji = '🏡';
  } else if (isFood) {
    bgClass = 'bg-gradient-to-tr from-emerald-600 to-teal-500';
    emoji = '🍜';
  } else if (isActivity) {
    bgClass = 'bg-gradient-to-tr from-indigo-600 to-purple-500';
    emoji = '🧗';
  }

  const activeRing = isActive
    ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-900 scale-125 z-50 shadow-2xl'
    : 'scale-100 shadow-lg hover:scale-110';

  const pulseBadge = isActive
    ? '<span class="absolute -top-1 -right-1 flex h-3.5 w-3.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border border-white"></span></span>'
    : '';

  return L.divIcon({
    className: 'custom-leaflet-marker-wrapper',
    html: `
      <div class="relative cursor-pointer transition-all duration-300 ${activeRing}">
        <div class="w-9 h-9 rounded-2xl ${bgClass} text-white flex items-center justify-center border-2 border-white text-sm shadow-md">
          <span>${emoji}</span>
        </div>
        ${pulseBadge}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  });
};

// User GPS marker icon
const createUserGpsIcon = () => {
  return L.divIcon({
    className: 'user-gps-marker',
    html: `
      <div class="relative flex items-center justify-center">
        <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-sky-400 opacity-60"></span>
        <div class="relative w-5 h-5 rounded-full bg-sky-600 border-2 border-white shadow-xl flex items-center justify-center">
          <div class="w-2 h-2 rounded-full bg-white"></div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

export const RealMapView = ({
  items = [],
  activeItem = null,
  setActiveItem = () => {},
  setDetailModalItem = () => {},
  userCoords = null,
  mapStyle = 'osm', // 'osm' | 'hot' | 'osmfr'
  setMapStyle = () => {},
  className = ''
}) => {
  // Trạng thái ô thông tin nổi (Floating Info Box) - Tối ưu cho Mobile
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Khi activeItem thay đổi từ bên ngoài (click thẻ danh sách, chọn điểm)
  useEffect(() => {
    if (activeItem && activeItem.id && !activeItem.isJumpPoint) {
      setSelectedPlace(activeItem);
      setIsDismissed(false);
      setIsExpanded(false); // Bắt đầu bằng thông tin nhẹ
    }
  }, [activeItem]);

  // Bản đồ chuẩn quốc tế OpenStreetMap - 100% Sạch, Không đường lưỡi bò phi pháp, Không watermark
  const tileLayers = {
    osm: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors • Khẳng định chủ quyền Việt Nam 🇻🇳'
    },
    hot: {
      url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap France & HOT • Bản đồ Du lịch Sạch'
    },
    osmfr: {
      url: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap France • Khẳng định chủ quyền Việt Nam'
    }
  };

  // Vị trí trung tâm Việt Nam
  const defaultCenter = useMemo(() => {
    if (activeItem?.latitude && activeItem?.longitude) {
      return [parseFloat(activeItem.latitude), parseFloat(activeItem.longitude)];
    }
    return [16.0544, 108.0717]; // Đà Nẵng / Miền Trung Việt Nam
  }, [activeItem]);

  // Ghim khẳng định chủ quyền biển đảo thiêng liêng
  const hoangSaPosition = [16.5367, 111.6067];
  const truongSaPosition = [8.6433, 111.9194];

  const hoangSaIcon = useMemo(() => L.divIcon({
    className: 'vn-sovereignty-marker',
    html: `
      <div class="cursor-pointer hover:scale-110 transition-transform">
        <div class="px-2.5 py-1 rounded-xl bg-red-600/95 text-white font-extrabold text-[11px] border-2 border-amber-400 shadow-2xl flex items-center gap-1.5 whitespace-nowrap">
          <span>🇻🇳</span>
          <span class="tracking-tight">Quần đảo Hoàng Sa (Việt Nam)</span>
        </div>
      </div>
    `,
    iconSize: [180, 32],
    iconAnchor: [90, 16]
  }), []);

  const truongSaIcon = useMemo(() => L.divIcon({
    className: 'vn-sovereignty-marker',
    html: `
      <div class="cursor-pointer hover:scale-110 transition-transform">
        <div class="px-2.5 py-1 rounded-xl bg-red-600/95 text-white font-extrabold text-[11px] border-2 border-amber-400 shadow-2xl flex items-center gap-1.5 whitespace-nowrap">
          <span>🇻🇳</span>
          <span class="tracking-tight">Quần đảo Trường Sa (Việt Nam)</span>
        </div>
      </div>
    `,
    iconSize: [180, 32],
    iconAnchor: [90, 16]
  }), []);

  // Khóa cứng phạm vi bản đồ trong phạm vi lãnh thổ & hải phận Việt Nam
  const vietnamBounds = [
    [7.5, 101.5],  // Tây Nam (Mũi Cà Mau & Vùng biển phía Nam)
    [24.0, 118.0]  // Đông Bắc (Hà Giang, Móng Cái & Quần đảo Hoàng Sa, Trường Sa)
  ];

  const quickVnCities = [
    { label: 'Hà Giang', lat: 23.2428, lng: 105.4192 },
    { label: 'Sa Pa', lat: 22.3364, lng: 103.8438 },
    { label: 'Đà Nẵng', lat: 16.0544, lng: 108.2022 },
    { label: 'Hội An', lat: 15.8801, lng: 108.3380 },
    { label: 'Đà Lạt', lat: 11.9404, lng: 108.4583 },
    { label: 'Phú Quốc', lat: 10.2899, lng: 103.9840 }
  ];

  // Xử lý click Marker: mở thông tin nhẹ và kích hoạt flyTo
  const handleMarkerClick = (item) => {
    setSelectedPlace(item);
    setActiveItem(item);
    setIsDismissed(false);
    setIsExpanded(false); // Khi click vào vị trí -> ban đầu ra thông tin nhẹ
  };

  return (
    <div className={`relative w-full h-full rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-900 ${className}`}>
      
      {/* Top Map Toolbar Overlay */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Live Status Pill & Vietnam Flag */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-700/80 shadow-lg flex items-center gap-2 text-xs font-bold text-white">
          <span className="text-base">🇻🇳</span>
          <span className="text-sky-300">Bản Đồ Du Lịch Việt Nam ({items.length} Điểm Ghim)</span>
        </div>

        {/* Quick VN Cities Jump Toolbar */}
        <div className="pointer-events-auto hidden xl:flex items-center gap-1 bg-slate-900/90 backdrop-blur-md px-2 py-1 rounded-2xl border border-slate-700/80 text-[11px] font-bold text-slate-300">
          <span className="text-slate-400 mr-1 text-[10px]">Tới nhanh:</span>
          {quickVnCities.map(city => (
            <button
              key={city.label}
              type="button"
              onClick={() => setActiveItem({ latitude: city.lat, longitude: city.lng, name: city.label, isJumpPoint: true })}
              className="px-2 py-0.5 rounded-lg hover:bg-sky-600 hover:text-white transition-colors cursor-pointer"
            >
              {city.label}
            </button>
          ))}
        </div>

        {/* Map Style Selector */}
        <div className="pointer-events-auto flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-700/80 shadow-lg text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setMapStyle('osm')}
            className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
              mapStyle === 'osm'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Đường Phố
          </button>
          <button
            type="button"
            onClick={() => setMapStyle('hot')}
            className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
              mapStyle === 'hot'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Màu Du Lịch
          </button>
        </div>

      </div>

      {/* Real Interactive Leaflet Map - Locked Strictly Within Vietnam Territory */}
      <MapContainer
        center={defaultCenter}
        zoom={6}
        minZoom={5.8}
        maxZoom={18}
        maxBounds={vietnamBounds}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[520px] z-0"
      >
        <TileLayer
          url={tileLayers[mapStyle]?.url || tileLayers.osm.url}
          attribution={tileLayers[mapStyle]?.attribution || tileLayers.osm.attribution}
          maxZoom={19}
        />

        {/* Map Controller for dynamic flyTo */}
        <MapFlyController activeItem={activeItem} userCoords={userCoords} />

        {/* Ghim Khẳng Định Chủ Quyền Quần Đảo Hoàng Sa & Trường Sa Của Việt Nam */}
        <Marker position={hoangSaPosition} icon={hoangSaIcon}>
          <Popup>
            <div className="p-1 text-xs font-sans space-y-1">
              <strong className="text-red-700 font-bold block text-sm">🇻🇳 Quần đảo Hoàng Sa</strong>
              <p className="text-slate-600 text-[11px]">Thuộc Huyện Hoàng Sa, Thành phố Đà Nẵng, Việt Nam.</p>
              <p className="text-slate-500 italic text-[10px]">Chủ quyền thiêng liêng bất khả xâm phạm của Tổ quốc Việt Nam.</p>
            </div>
          </Popup>
        </Marker>

        <Marker position={truongSaPosition} icon={truongSaIcon}>
          <Popup>
            <div className="p-1 text-xs font-sans space-y-1">
              <strong className="text-red-700 font-bold block text-sm">🇻🇳 Quần đảo Trường Sa</strong>
              <p className="text-slate-600 text-[11px]">Thuộc Huyện Trường Sa, Tỉnh Khánh Hòa, Việt Nam.</p>
              <p className="text-slate-500 italic text-[10px]">Chủ quyền thiêng liêng bất khả xâm phạm của Tổ quốc Việt Nam.</p>
            </div>
          </Popup>
        </Marker>

        {/* User GPS Location Marker & Radar Circle */}
        {userCoords?.lat && userCoords?.lng && (
          <>
            <Marker position={[userCoords.lat, userCoords.lng]} icon={createUserGpsIcon()}>
              <Popup>
                <div className="text-xs p-1 font-bold text-slate-800">
                  📍 Vị trí hiện tại của bạn
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[userCoords.lat, userCoords.lng]}
              radius={20000} // 20km radar radius
              pathOptions={{
                color: '#0284c7',
                fillColor: '#38bdf8',
                fillOpacity: 0.12,
                weight: 1.5,
                dashArray: '4, 4'
              }}
            />
          </>
        )}

        {/* Real Item Markers - Không dùng Popup Leaflet cồng kềnh, chuyển sang ô thông tin nổi tiện lợi */}
        {items.map(item => {
          const lat = parseFloat(item.latitude);
          const lng = parseFloat(item.longitude);
          if (isNaN(lat) || isNaN(lng)) return null;

          const isActive = (selectedPlace?.id === item.id) || (activeItem?.id === item.id);
          const icon = createCustomMarkerIcon(item, isActive);

          return (
            <Marker
              key={item.id}
              position={[lat, lng]}
              icon={icon}
              eventHandlers={{
                click: () => handleMarkerClick(item)
              }}
            />
          );
        })}
      </MapContainer>

      {/* ────────────────────────────────────────────────────────────────────────
          Ô THÔNG TIN NỔI TRÊN BẢN ĐỒ (FLOATING CARD / MOBILE BOTTOM SHEET)
          - Chế độ 1: Bấm vào ra "thông tin nhẹ"
          - Chế độ 2: Bấm mũi tên mở rộng ra "thông tin chi tiết hơn nữa"
          - Tối ưu tuyệt đối cho điện thoại di động (không che map, thumb-friendly)
         ──────────────────────────────────────────────────────────────────────── */}
      {selectedPlace && !isDismissed ? (
        <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto sm:max-w-md z-[1000] pointer-events-auto transition-all duration-300">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.35)] overflow-hidden transition-all duration-300">
            
            {/* TẦNG 1: THÔNG TIN NHẸ (COMPACT BAR) */}
            <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3">
              
              {/* Thumbnail & Thông tin cơ bản */}
              <div
                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 border border-slate-200/80 dark:border-slate-700 shadow-sm">
                  <img
                    src={selectedPlace.image}
                    alt={selectedPlace.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs text-[9px] text-white text-center font-bold py-0.5 truncate px-1">
                    {selectedPlace.city}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-200/50 dark:border-sky-800/50">
                      {selectedPlace.category}
                    </span>
                    <span className="flex items-center gap-0.5 text-[11px] font-extrabold text-amber-500">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {selectedPlace.rating || '5.0'}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                    {selectedPlace.name}
                  </h4>

                  <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 truncate mt-0.5">
                    {selectedPlace.priceEstimate || 'Đang cập nhật giá'}
                  </p>
                </div>
              </div>

              {/* Nút Mũi Tên Mở Rộng / Thu Gọn & Nút Đóng */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    isExpanded
                      ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700 hover:text-sky-600'
                  }`}
                  title={isExpanded ? 'Thu gọn thông tin' : 'Bấm để xem thêm chi tiết'}
                >
                  <span className="hidden xs:inline text-[11px]">
                    {isExpanded ? 'Thu gọn' : 'Chi tiết'}
                  </span>
                  <ChevronUp
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isExpanded ? 'rotate-180 text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setIsDismissed(true)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Đóng ô thông tin"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* TẦNG 2: THÔNG TIN CHI TIẾT HƠN NỮA (EXPANDED DRAWER) */}
            {isExpanded && (
              <div className="px-3.5 pb-3.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-3 max-h-[60vh] sm:max-h-[380px] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-2 duration-200">
                
                {/* Tagline / Mô tả giới thiệu */}
                {selectedPlace.tagline && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                    "{selectedPlace.tagline}"
                  </p>
                )}

                {/* Danh sách thông tin chi tiết */}
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  
                  {/* Địa chỉ cụ thể */}
                  {(selectedPlace.address || selectedPlace.city) && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        {selectedPlace.address ? `${selectedPlace.address}, ${selectedPlace.city}` : selectedPlace.city}
                      </span>
                    </div>
                  )}

                  {/* Giờ mở cửa */}
                  {selectedPlace.openingHours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{selectedPlace.openingHours}</span>
                    </div>
                  )}

                  {/* Hotline hỗ trợ */}
                  {selectedPlace.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Hotline: </span>
                      <a
                        href={`tel:${selectedPlace.phoneNumber}`}
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                      >
                        {selectedPlace.phoneNumber}
                      </a>
                    </div>
                  )}

                  {/* Chủ cơ sở / Đăng bởi */}
                  {selectedPlace.hostName && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      <span>Cơ sở đối tác: <strong className="text-slate-700 dark:text-slate-200">{selectedPlace.hostName}</strong></span>
                    </div>
                  )}
                </div>

                {/* Tiện ích nổi bật (Chips) */}
                {selectedPlace.amenities && (
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" /> Tiện ích nổi bật
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(Array.isArray(selectedPlace.amenities)
                        ? selectedPlace.amenities
                        : selectedPlace.amenities.split(',').map(s => s.trim())
                      ).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDetailModalItem(selectedPlace)}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/25 transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem Toàn Bộ Chi Tiết</span>
                  </button>
                  
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.latitude},${selectedPlace.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Chỉ đường trên Google Maps"
                  >
                    <Navigation className="w-3.5 h-3.5 text-sky-500" />
                    <span className="hidden xs:inline">Chỉ đường</span>
                  </a>
                </div>

              </div>
            )}

          </div>
        </div>
      ) : (
        /* Hướng dẫn nhẹ nhàng khi chưa chọn điểm */
        <div className="absolute bottom-3 left-3 z-[1000] pointer-events-none">
          <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] text-slate-400 border border-slate-800">
            Click vào ghim để xem thông tin • Bấm thẻ bên trái để bay camera 📍
          </div>
        </div>
      )}

    </div>
  );
};

export default RealMapView;

