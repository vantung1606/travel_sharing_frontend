import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star, MapPin, Copy, ExternalLink, Calendar, ArrowLeft, CheckCircle2, Phone, Camera, Heart, MessageCircle
} from 'lucide-react';
import { placeApi, reviewApi, postApi } from '../../../services/api';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../components/common/Toast';
import { RealMapView } from '../../../components/map/RealMapView';
import { fetchLiveWeather } from '../../../utils/weatherUtils';
import { mapApiSpot } from '../../../utils/placeMap';
import { pickFallbackImage, SHARED_PLACEHOLDER_IMAGE } from '../../../utils/placeImages';
import { AddToTripModal } from './components/AddToTripModal';

export const PlaceDetailPage = () => {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const { currentUser, itineraries = [], addPlaceToItinerary } = useApp();
  const toast = useToast();

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [placePosts, setPlacePosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [liveWeather, setLiveWeather] = useState(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [weatherUnavailable, setWeatherUnavailable] = useState(false);
  const [isAddToTripModalOpen, setIsAddToTripModalOpen] = useState(false);

  const handleAddToTrip = async (payload) => {
    if (!payload || !place) return;
    const itin = payload.itinerary || payload;
    const dayNumber = Number(payload.dayNumber) || Number(itin.daysCount) || 1;
    const startTime = payload.startTime || '09:00:00';
    const timeSlotLabel = payload.timeSlotLabel || '09:00';
    const activityCategory = payload.category || place.category || 'Khám phá';
    const cost = payload.estimatedCost !== undefined ? Number(payload.estimatedCost) : (Number(place.ticketPrice) || null);
    const noteText = payload.note || (place.tagline || place.description || '').slice(0, 500);

    if (!currentUser?.email || /^itin-|^-/.test(String(itin.id))) {
      toast.info('Vui lòng đăng nhập bằng tài khoản có lịch trình trên hệ thống để thêm điểm dừng nhé!');
      setIsAddToTripModalOpen(false);
      return;
    }

    const currentDayActivities = (itin.days || []).find(d => Number(d.dayNumber) === dayNumber)?.activities ||
      (Array.isArray(itin.details) ? itin.details.filter(d => Number(d.dayNumber) === dayNumber) : []);
    const visitOrder = currentDayActivities.length + 1;

    const detail = {
      placeId: Number(place.rawId || place.id) || null,
      locationName: place.name,
      locationAddress: place.address || `${place.city}, Việt Nam`,
      category: activityCategory,
      dayNumber,
      visitOrder,
      startTime,
      estimatedCost: cost,
      note: noteText
    };

    try {
      await addPlaceToItinerary(itin.id, detail, currentUser.email);
      toast.success(
        <div>
          <p className="font-bold">Đã thêm vào lịch trình thành công! 🚀</p>
          <p className="text-xs text-slate-100 mt-0.5">
            "{place.name}" • Ngày {dayNumber} ({timeSlotLabel}) của chuyến đi "{itin.title}"
          </p>
        </div>
      );
    } catch (err) {
      toast.error('Lỗi khi thêm vào lịch trình: ' + err.message);
    } finally {
      setIsAddToTripModalOpen(false);
    }
  };

  useEffect(() => {
    let alive = true;
    setLoading(true);
    placeApi.getPlaceById(placeId).then((p) => {
      if (!alive) return;
      setPlace(p ? mapApiSpot(p) : null);
      setLoading(false);
    }).catch(() => {
      if (alive) { setPlace(null); setLoading(false); }
    });
    reviewApi.getReviews(placeId).then(list => {
      if (alive) setReviews(list || []);
    }).catch(() => {});

    setLoadingPosts(true);
    postApi.getPosts({ placeId }).then(list => {
      if (alive) {
        setPlacePosts(Array.isArray(list) ? list : []);
        setLoadingPosts(false);
      }
    }).catch(() => {
      if (alive) setLoadingPosts(false);
    });

    return () => { alive = false; };
  }, [placeId]);

  // Thời tiết THẬT theo tọa độ (Open-Meteo) — như modal chi tiết
  useEffect(() => {
    if (!place?.latitude || !place?.longitude) { setWeatherUnavailable(true); return; }
    setWeatherUnavailable(false);
    setIsWeatherLoading(true);
    fetchLiveWeather(place.latitude, place.longitude)
      .then(data => {
        if (data) setLiveWeather(data); else setWeatherUnavailable(true);
      })
      .catch(() => setWeatherUnavailable(true))
      .finally(() => setIsWeatherLoading(false));
  }, [place?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopyGPS = () => {
    if (!place?.latitude || !place?.longitude) return;
    const text = `${place.latitude}, ${place.longitude}`;
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép GPS "${place.name}": ${text}`);
  };

  const handleShareLink = () => {
    const url = `${window.location.origin}/places/${place.rawId}`;
    navigator.clipboard.writeText(url);
    toast.success(<div><p className="font-bold">Đã sao chép link chia sẻ!</p><p className="text-[11px] text-slate-200 font-normal mt-0.5">{url}</p></div>);
  };

  const handleImageError = (e) => {
    const img = e.currentTarget;
    const fallback = pickFallbackImage(place?.rawId ?? 0);
    if (img.src !== fallback) img.src = fallback;
    else img.src = SHARED_PLACEHOLDER_IMAGE;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-slate-500 font-semibold animate-pulse">Đang tải địa điểm...</div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-4">
        <MapPin className="w-12 h-12 text-slate-300" />
        <h2 className="font-bold text-slate-900">Không tìm thấy địa điểm #{placeId}</h2>
        <Link to="/explore" className="text-sky-600 font-bold hover:underline">← Về trang Khám phá</Link>
      </div>
    );
  }

  const mapUrl = place.latitude && place.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.city)}`;

  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Breadcrumb + Back */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link to="/" className="hover:text-sky-600 transition-colors flex items-center gap-1 text-slate-500">
            <ArrowLeft className="w-3.5 h-3.5" /> Trang chủ
          </Link>
          <span>/</span>
          <Link to="/explore" className="hover:text-sky-600 transition-colors text-slate-500">Khám phá</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold truncate max-w-[220px]">{place.name}</span>
        </div>
        <button
          onClick={handleShareLink}
          className="px-3.5 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold flex items-center gap-1.5 hover:bg-sky-100 transition cursor-pointer shadow-2xs"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Chia sẻ link
        </button>
      </div>

      {/* Hero */}
      <div className="relative h-56 sm:h-80 rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
        <img src={place.image} alt={place.name} onError={handleImageError} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-950/75 backdrop-blur-md text-[10px] font-bold text-white border border-white/15">{place.category}</span>
              {place.isVerifiedHost && (
                <span className="px-2 py-0.5 rounded-full bg-sky-500 text-[10px] font-bold text-white flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Đã xác thực
                </span>
              )}
              <span className="text-[11px] font-bold text-sky-200 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {place.city}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-white truncate">{place.name}</h1>
          </div>
          {place.rating && place.reviewsCount > 0 ? (
            <div className="flex items-center gap-1.5 bg-amber-50/95 backdrop-blur px-3 py-1.5 rounded-xl border border-amber-200 shrink-0">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-black text-amber-700 text-sm">{place.rating}</span>
              <span className="text-[11px] text-slate-500 font-semibold">({place.reviewsCount} đánh giá)</span>
            </div>
          ) : (
            <span className="text-[11px] text-white/80 font-semibold bg-slate-950/60 px-3 py-1.5 rounded-xl border border-white/10">Mới · chưa có đánh giá</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column */}
        <div className="lg:col-span-7 space-y-5">
          {/* Quick specs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <div>
              <span className="block text-[10px] text-slate-400 font-semibold">Giờ mở cửa</span>
              <span className="font-bold text-slate-800 text-xs">{place.openHours || 'Chưa cập nhật'}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-semibold">Chi phí dự kiến</span>
              <span className="font-bold text-sky-700 text-xs">{place.priceEstimate || 'Miễn phí'}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-semibold">GPS</span>
              <span className="font-bold text-slate-800 text-xs">
                {place.latitude && place.longitude ? `${place.latitude}, ${place.longitude}` : 'Chưa cập nhật'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-sm text-slate-900">Giới thiệu & Điểm đặc sắc</h4>
            <p className="text-slate-600 leading-relaxed text-xs">{place.description || 'Chưa có mô tả chi tiết.'}</p>
            {place.address && <p className="text-slate-500 italic text-[11px] pt-1">📍 Địa chỉ: {place.address}</p>}
            {place.phoneNumber && (
              <p className="text-slate-500 text-[11px] flex items-center gap-1">
                <Phone className="w-3 h-3" /> {place.phoneNumber}
              </p>
            )}
            {(place.ownerName || place.isVerifiedHost) && (
              <div className="flex items-center gap-2 pt-2">
                <span className="w-7 h-7 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center font-black text-sky-700 text-[11px] shrink-0 overflow-hidden">
                  {place.ownerAvatar ? (
                    <img src={place.ownerAvatar} alt={place.ownerName} className="w-full h-full object-cover" />
                  ) : (
                    (place.ownerName || place.city || 'W')[0]
                  )}
                </span>
                <span className="text-[11px] text-slate-500 min-w-0">
                  Được chia sẻ bởi{' '}
                  <strong className="text-slate-800 font-bold">
                    {place.ownerName || 'cộng đồng Wayfare'}
                    {place.ownerHandle ? ` (@${place.ownerHandle})` : ''}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Amenities */}
          {place.amenities.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="font-bold text-xs text-slate-800">Trải nghiệm & Điểm nổi bật</h4>
              <div className="flex flex-wrap gap-1.5">
                {place.amenities.map((a, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px]">✓ {a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Reviews — THẬT từ bảng reviews (GET /places/{id}/reviews) */}
          {reviews.length > 0 ? (
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <h4 className="font-bold text-xs text-slate-900">Đánh giá từ du khách ({reviews.length})</h4>
              {reviews.slice(0, 10).map((r) => (
                <div key={r.id || r.authorHandle} className="flex gap-2.5 items-start">
                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-black text-slate-500">
                    {r.authorAvatar ? (
                      <img src={r.authorAvatar} alt={r.authorName} className="w-full h-full object-cover" />
                    ) : (
                      (r.authorName || 'W')[0]
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-800">{r.authorName || 'Du khách'}</span>
                      <span className="text-[10px] font-bold text-amber-600">{'★'.repeat(r.rating || 0)}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{r.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-semibold">Mới · chưa có đánh giá nào từ du khách</div>
          )}
        </div>

        {/* Right column: weather + map + actions */}
        <div className="lg:col-span-5 space-y-4">
          {/* Weather card — chỉ JSON Open-Meteo thật */}
          <div className="p-4 rounded-2xl border border-sky-100 bg-sky-50/70 space-y-1">
            <h3 className="font-display font-bold text-sm text-sky-900">Thời tiết điều hành</h3>
            {liveWeather ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl select-none">{liveWeather.icon}</span>
                <div>
                  <div className="text-xl font-extrabold text-slate-900">
                    {liveWeather.temp}°C <span className="text-xs font-semibold text-slate-500">({liveWeather.label})</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">{liveWeather.vibe}</p>
                </div>
              </div>
            ) : weatherUnavailable ? (
              <div className="py-2 text-slate-500 text-center text-[11px]">📍 Địa điểm chưa có tọa độ GPS nên không kiểm tra được thời tiết thực tế</div>
            ) : (
              <div className="py-2 text-slate-400 text-center">Đang kiểm tra dữ liệu thời tiết...</div>
            )}
          </div>

          {/* Map card */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-[300px]">
            <RealMapView
              items={[place]}
              activeItem={place}
              miniMode={true}
              className="w-full h-full"
            />
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            <button
              onClick={() => setIsAddToTripModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl h-11 font-bold text-xs shadow-md shadow-sky-600/20 transition cursor-pointer"
            >
              <Calendar className="w-4 h-4" /> Thêm vào Lịch trình chuyến đi
            </button>
            <button
              onClick={() => navigate(`/community?checkinPlaceId=${place.rawId || place.id}`)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl h-11 font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <Camera className="w-4 h-4" /> Viết bài check-in tại đây
            </button>
            <a href={mapUrl} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 bg-sky-50 border border-sky-200 rounded-xl h-11 font-bold text-sky-700 text-xs hover:bg-sky-100 transition">
              <MapPin className="w-4 h-4" /> Xem Google Maps
            </a>
            {place.latitude && place.longitude && (
              <button onClick={handleCopyGPS} className="w-full flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 rounded-xl h-11 font-bold text-slate-600 text-xs hover:bg-slate-100 transition cursor-pointer">
                <Copy className="w-4 h-4" /> Copy GPS
              </button>
            )}
            <button
              onClick={() => navigate('/explore')}
              className="w-full flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 rounded-xl h-11 font-bold text-slate-600 text-xs hover:bg-slate-100 transition cursor-pointer"
            >
              <Calendar className="w-4 h-4" /> Khám phá thêm địa điểm
            </button>
          </div>
        </div>
      </div>

      {/* Community Check-in Posts Section */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-xs">
                <Camera className="w-4 h-4" />
              </span>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                Bài viết check-in từ cộng đồng ({placePosts.length})
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Khoảnh khắc, đánh giá và cẩm nang thực tế từ các du khách đã check-in tại {place.name}
            </p>
          </div>

          <button
            onClick={() => navigate(`/community?checkinPlaceId=${place.rawId || place.id}`)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>+ Viết bài check-in</span>
          </button>
        </div>

        {loadingPosts ? (
          <div className="py-8 text-center text-xs text-slate-400 font-semibold animate-pulse">
            Đang tải bài viết check-in từ cộng đồng...
          </div>
        ) : placePosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {placePosts.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate('/community')}
                className="group p-3.5 rounded-2xl border border-slate-200/80 hover:border-emerald-300 bg-slate-50/50 hover:bg-white transition-all cursor-pointer flex gap-3 shadow-2xs hover:shadow-xs"
              >
                {/* Image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                  <img
                    src={p.imageUrl || (p.images && p.images[0]) || pickFallbackImage(p.id)}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 shrink-0">
                        <img
                          src={p.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                          alt={p.authorName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 truncate">
                        {p.authorName || 'Du khách Wayfare'}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {p.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {p.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1">
                    <span className="inline-flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-500 fill-rose-500/20" /> {p.likeCount || 0}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="w-3 h-3 text-sky-500" /> {p.commentCount || 0}
                    </span>
                    <span className="ml-auto font-medium text-slate-400">
                      {p.formattedDate || 'Vừa xong'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center space-y-2.5 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-6">
            <p className="text-xs text-slate-500 font-medium">
              Chưa có bài viết check-in nào tại địa điểm này.
            </p>
            <button
              onClick={() => navigate(`/community?checkinPlaceId=${place.rawId || place.id}`)}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Hãy là người đầu tiên chia sẻ khoảnh khắc check-in!</span>
            </button>
          </div>
        )}
      </div>

      {/* Add To Trip Modal */}
      <AddToTripModal
        isOpen={isAddToTripModalOpen}
        onClose={() => setIsAddToTripModalOpen(false)}
        item={place}
        itineraries={itineraries}
        onAddToTrip={handleAddToTrip}
        onCreateNewTripWithItem={() => {
          setIsAddToTripModalOpen(false);
          navigate('/itinerary');
        }}
      />
    </div>
  );
};

export default PlaceDetailPage;
