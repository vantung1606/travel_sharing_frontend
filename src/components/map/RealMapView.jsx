import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Navigation,
  ExternalLink,
  Phone,
  Eye,
  Star,
  Layers,
  Sparkles,
  MapPin,
  Compass
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
  mapStyle = 'voyager', // 'voyager' | 'satellite' | 'dark'
  setMapStyle = () => {},
  className = ''
}) => {
  // Tile Layer URL Map
  const tileLayers = {
    voyager: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri &copy; OpenStreetMap'
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
    }
  };

  // Center of Vietnam as default
  const defaultCenter = useMemo(() => {
    if (activeItem?.latitude && activeItem?.longitude) {
      return [parseFloat(activeItem.latitude), parseFloat(activeItem.longitude)];
    }
    return [16.0544, 108.0717]; // Da Nang / Central Vietnam
  }, [activeItem]);

  return (
    <div className={`relative w-full h-full rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-900 ${className}`}>
      
      {/* Top Map Toolbar Overlay */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Live Status Pill */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700/80 shadow-lg flex items-center gap-2 text-xs font-bold text-sky-300">
          <Navigation className="w-4 h-4 text-sky-400 animate-pulse" />
          <span>Bản Đồ Tọa Độ Sống ({items.length} Điểm Ghim)</span>
        </div>

        {/* Map Style Selector */}
        <div className="pointer-events-auto flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-700/80 shadow-lg text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setMapStyle('voyager')}
            className={`px-2.5 py-1 rounded-xl transition-all ${
              mapStyle === 'voyager'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Đường Phố
          </button>
          <button
            type="button"
            onClick={() => setMapStyle('satellite')}
            className={`px-2.5 py-1 rounded-xl transition-all ${
              mapStyle === 'satellite'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Vệ Tinh
          </button>
          <button
            type="button"
            onClick={() => setMapStyle('dark')}
            className={`px-2.5 py-1 rounded-xl transition-all ${
              mapStyle === 'dark'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Đêm Dark
          </button>
        </div>

      </div>

      {/* Real Interactive Leaflet Map */}
      <MapContainer
        center={defaultCenter}
        zoom={6}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[520px] z-0"
      >
        <TileLayer
          url={tileLayers[mapStyle]?.url || tileLayers.voyager.url}
          attribution={tileLayers[mapStyle]?.attribution || tileLayers.voyager.attribution}
          maxZoom={19}
        />

        {/* Map Controller for dynamic flyTo */}
        <MapFlyController activeItem={activeItem} userCoords={userCoords} />

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

        {/* Real Item Markers */}
        {items.map(item => {
          const lat = parseFloat(item.latitude);
          const lng = parseFloat(item.longitude);
          if (isNaN(lat) || isNaN(lng)) return null;

          const isActive = activeItem?.id === item.id;
          const icon = createCustomMarkerIcon(item, isActive);

          return (
            <Marker
              key={item.id}
              position={[lat, lng]}
              icon={icon}
              eventHandlers={{
                click: () => setActiveItem(item)
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="w-56 p-1 text-xs space-y-2 font-sans">
                  {/* Thumbnail */}
                  <div className="relative h-28 w-full rounded-xl overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 text-[10px] text-white font-bold backdrop-blur-xs">
                      {item.city}
                    </span>
                  </div>

                  {/* Title & Category */}
                  <div>
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 mt-1 line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                      {item.tagline}
                    </p>
                  </div>

                  {/* Price & Rating */}
                  <div className="flex items-center justify-between text-[11px] font-semibold pt-1 border-t border-slate-100">
                    <span className="text-amber-600 font-bold">
                      {item.priceEstimate}
                    </span>
                    <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {item.rating}
                    </span>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setDetailModalItem(item)}
                      className="flex-1 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Chi tiết</span>
                    </button>
                    {item.phoneNumber && (
                      <a
                        href={`tel:${item.phoneNumber}`}
                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold transition-colors"
                        title="Gọi hotline"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                      title="Chỉ đường Maps"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Bottom Map Info Tag */}
      <div className="absolute bottom-3 left-3 z-[1000] pointer-events-none">
        <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] text-slate-400 border border-slate-800">
          Click vào ghim để xem nhanh • Bấm thẻ bên trái để bay camera đến tọa độ 📍
        </div>
      </div>

    </div>
  );
};

export default RealMapView;
