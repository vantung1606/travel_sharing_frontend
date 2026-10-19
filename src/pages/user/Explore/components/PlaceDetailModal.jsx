import React, { useState, useEffect } from 'react';
import { X, Star, Phone, CheckCircle2, ExternalLink, Copy, Calendar, Sparkles, Send, MapPin, CloudSun, Wind, Droplets, Compass } from 'lucide-react';
import { RealMapView } from '../../../../components/map/RealMapView';
import { fetchLiveWeather } from '../../../../utils/weatherUtils';
import { pickFallbackImage, SHARED_PLACEHOLDER_IMAGE } from '../../../../utils/placeImages';

// Ảnh lỗi (404 do sai mã hoá '%') tự đổi sang ảnh thật dự phòng từ kho Wayfare
const handleImageError = (e, item) => {
  const img = e.currentTarget;
  const fallback = pickFallbackImage(item?.rawId ?? 0);
  if (img.src !== fallback) {
    img.src = fallback;
  } else {
    img.src = SHARED_PLACEHOLDER_IMAGE;
  }
};

export const PlaceDetailModal = ({
  item,
  onClose = () => {},
  reviews = [],
  isReviewsLoading = false,
  reviewRating = 5,
  setReviewRating = () => {},
  reviewComment = '',
  setReviewComment = () => {},
  isSubmittingReview = false,
  onSubmitReview = () => {},
  onOpenGoogleMaps = () => {},
  onCopyGPS = () => {},
  onAddToTrip = () => {},
  onPlanWithAI = () => {}
}) => {
  const [liveWeather, setLiveWeather] = useState(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [weatherUnavailable, setWeatherUnavailable] = useState(false);

  // Tự động kéo thời tiết thực tế từ Open-Meteo theo tọa độ GPS của địa điểm.
  // Không toạ độ / API lỗi -> báo thẳng người dùng, KHÔNG ước lượng theo tên thành phố.
  useEffect(() => {
    if (!item) return;
    const lat = item.latitude || item.coordinates?.lat;
    const lng = item.longitude || item.coordinates?.lng;

    setWeatherUnavailable(false);
    setLiveWeather(null);

    if (lat && lng) {
      const key = `${Number(lat).toFixed(2)},${Number(lng).toFixed(2)}`;
      setIsWeatherLoading(true);
      fetchLiveWeather(lat, lng)
        .then((data) => {
          if (data) {
            setLiveWeather(data);
          } else {
            setWeatherUnavailable(true);
          }
        })
        .catch(() => setWeatherUnavailable(true))
        .finally(() => setIsWeatherLoading(false));
    } else {
      setWeatherUnavailable(true);
    }
  }, [item]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        {/* 1. Modal Image Panorama Header */}
        <div className="relative h-60 sm:h-72 w-full overflow-hidden shrink-0 bg-slate-900">
          <img
            src={item.image}
            alt={item.name}
            onError={(e) => handleImageError(e, item)}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-black/30" />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Place Title & Quick Badge Overlay */}
          <div className="absolute bottom-4 left-5 right-5 text-white space-y-1.5 z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-sky-500/80 backdrop-blur-md text-[11px] font-bold text-white shadow-xs">
                {item.category || 'Địa danh du lịch'}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-white/20 backdrop-blur-md text-[11px] font-semibold text-slate-200 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-sky-300" />
                <span>{item.city}</span>
              </span>
              {item.rating && item.reviewsCount > 0 ? (
                <div className="flex items-center gap-1 text-amber-300 font-bold text-xs bg-black/40 px-2 py-0.5 rounded-lg backdrop-blur-md">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{item.rating}</span>
                </div>
              ) : null}
            </div>

            <h2 className="font-display font-extrabold text-xl sm:text-3xl text-white tracking-tight">
              {item.name}
            </h2>
          </div>
        </div>

        {/* 2. Modal Body: Split 2 Columns (Content Left + Map & Weather Right) */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
          
          {/* ─── CỘT TRÁI: THÔNG TIN CHI TIẾT & REVIEW (7 Cột) ─── */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Live Weather Widget Thực Tế */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 via-blue-50/60 to-indigo-50 border border-sky-100 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sky-950 font-bold text-xs">
                  <CloudSun className="w-4 h-4 text-sky-600" />
                  <span>Thời tiết thực tế tại {item.city}</span>
                </div>
                <span className="text-[10px] text-sky-600 font-semibold bg-sky-100/80 px-2 py-0.5 rounded-full">
                  Cập nhật vệ tinh trực tiếp
                </span>
              </div>

              {liveWeather ? (
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl select-none">{liveWeather.icon}</span>
                    <div>
                      <div className="text-xl font-extrabold text-slate-900 flex items-center gap-1">
                        <span>{liveWeather.temp}°C</span>
                        <span className="text-xs font-semibold text-slate-500">({liveWeather.label})</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">{liveWeather.vibe}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-right text-[11px] text-slate-500 font-medium">
                    <div className="flex items-center justify-end gap-1">
                      <Droplets className="w-3 h-3 text-sky-500" />
                      <span>Độ ẩm: {liveWeather.humidity}%</span>
                    </div>
                    {liveWeather.windSpeed && (
                      <div className="flex items-center justify-end gap-1">
                        <Wind className="w-3 h-3 text-slate-400" />
                        <span>Gió: {liveWeather.windSpeed} km/h</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : weatherUnavailable ? (
                <div className="py-2 text-slate-500 text-center text-[11px]">
                  📍 Địa điểm chưa có toạ độ GPS nên không kiểm tra được thời tiết thực tế
                </div>
              ) : (
                <div className="py-2 text-slate-400 text-center">Đang kiểm tra dữ liệu thời tiết...</div>
              )}
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div>
                <span className="block text-[10px] text-slate-400 font-semibold">Giờ mở cửa</span>
                <span className="font-bold text-slate-800 text-xs">{item.openHours || 'Chưa cập nhật'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-semibold">Chi phí dự kiến</span>
                <span className="font-bold text-sky-700 text-xs">{item.priceEstimate || 'Miễn phí'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-semibold">Vùng du lịch</span>
                <span className="font-bold text-slate-800 text-xs">{item.region || 'Việt Nam'}</span>
              </div>
            </div>

            {/* Description & Story */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-sm text-slate-900">Giới thiệu & Điểm đặc sắc</h4>
              <p className="text-slate-600 leading-relaxed text-xs">
                {item.description || item.tagline}
              </p>
              {item.address && (
                <p className="text-slate-500 italic text-[11px] pt-1">
                  📍 Địa chỉ: {item.address}
                </p>
              )}
              {/* Người chia sẻ địa điểm (dữ liệu thật: ownerName/isVerifiedHost từ server) */}
              {(item.ownerName || item.isVerifiedHost) && (
                <div className="flex items-center gap-2 pt-2">
                  <span className="w-7 h-7 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center font-black text-sky-700 text-[11px] shrink-0 overflow-hidden">
                    {item.ownerAvatar ? (
                      <img src={item.ownerAvatar} alt={item.ownerName} className="w-full h-full object-cover" />
                    ) : (
                      (item.ownerName || item.city || 'W')[0]
                    )}
                  </span>
                  <span className="text-[11px] text-slate-500 min-w-0">
                    Được chia sẻ bởi{' '}
                    <strong className="text-slate-800 font-bold">
                      {item.ownerName || 'cộng đồng Wayfare'}
                      {item.ownerHandle ? ` (@${item.ownerHandle})` : ''}
                    </strong>
                    {item.isVerifiedHost && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 text-sky-600 font-bold whitespace-nowrap">
                        ✓ Đã xác thực
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Amenities / Specialties */}
            {item.amenities && item.amenities.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="font-bold text-xs text-slate-800">Trải nghiệm & Điểm nổi bật</h4>
                <div className="flex flex-wrap gap-1.5">
                  {item.amenities.map((a, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px]">
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Form & List */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-900">Đánh giá từ du khách ({reviews.length})</h4>
                {item.rating && item.reviewsCount > 0 ? (
                  <span className="text-amber-500 font-bold">★ {item.rating}</span>
                ) : (
                  <span className="text-slate-400 font-medium">Mới · chưa có đánh giá</span>
                )}
              </div>

              {/* Review Input */}
              <form onSubmit={onSubmitReview} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">Chấm điểm:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-0.5 text-slate-300 hover:text-amber-400 cursor-pointer"
                      >
                        <Star className={`w-3.5 h-3.5 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={2}
                  placeholder="Chia sẻ cảm nhận, góc chụp đẹp hoặc lưu ý cho người đi sau..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full p-2 bg-white text-slate-800 rounded-xl text-xs placeholder:text-slate-400 border border-slate-200 outline-none focus:ring-1 focus:ring-sky-500 resize-none"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingReview || !reviewComment.trim()}
                    className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isSubmittingReview ? 'Đang gửi...' : 'Gửi nhận xét'}</span>
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* ─── CỘT PHẢI: BẢN ĐỒ CHI TIẾT TƯƠNG TÁC CỦA ĐỊA ĐIỂM (5 Cột) ─── */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-sky-600" />
                  <span>Vị trí trên bản đồ</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {item.latitude ? `${Number(item.latitude).toFixed(3)}, ${Number(item.longitude).toFixed(3)}` : ''}
                </span>
              </div>

              {/* Mini Detailed Map Canvas */}
              <div className="h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
                <RealMapView
                  items={[item]}
                  activeItem={item}
                  className="w-full h-full"
                />
              </div>

              {/* Navigation & GPS Tools */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={(e) => onOpenGoogleMaps(item, e)}
                  className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                  <span>Google Maps</span>
                </button>
                <button
                  onClick={(e) => onCopyGPS(item, e)}
                  className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Copy GPS</span>
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <button
                type="button"
                onClick={() => onAddToTrip(item)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>+ Thêm Vào Lịch Trình Đi Chơi</span>
              </button>

              <button
                onClick={(e) => onPlanWithAI(item, e)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Lập Tour AI Với Điểm Này</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
