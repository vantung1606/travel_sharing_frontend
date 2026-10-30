import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  X, Star, Phone, CheckCircle2, ExternalLink, Copy, Calendar, Sparkles, Send, 
  MapPin, CloudSun, Wind, Droplets, Compass, Edit2, Trash2, Flag, AlertCircle 
} from 'lucide-react';
import { RealMapView } from '../../../../components/map/RealMapView';
import { fetchLiveWeather } from '../../../../utils/weatherUtils';
import { pickFallbackImage, SHARED_PLACEHOLDER_IMAGE } from '../../../../utils/placeImages';
import { useApp } from '../../../../context/AppContext';
import { useToast } from '../../../../components/common/Toast';
import { reviewApi } from '../../../../services/api';
import { UniversalReportModal } from '../../../../components/common/UniversalReportModal';

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
  setReviews = () => {},
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

  const { currentUser } = useApp();
  const toast = useToast();

  // Review Edit States
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [isUpdatingReview, setIsUpdatingReview] = useState(false);

  // Universal Report Modal States
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTargetType, setReportTargetType] = useState('PLACE');
  const [reportTargetId, setReportTargetId] = useState(null);
  const [reportTargetTitle, setReportTargetTitle] = useState('');

  // Dynamic Average Rating Calculation from actual reviews
  const totalReviews = reviews ? reviews.length : 0;
  const dynamicRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / totalReviews).toFixed(1)
    : (item?.rating ? Number(item.rating).toFixed(1) : '5.0');

  // Check if a review belongs to the logged-in user
  const isAuthorOfReview = (r) => {
    if (!currentUser) return false;
    if (r.authorEmail && currentUser.email && r.authorEmail.toLowerCase() === currentUser.email.toLowerCase()) {
      return true;
    }
    if (r.authorId && currentUser.id && String(r.authorId) === String(currentUser.id)) {
      return true;
    }
    return false;
  };

  const handleStartEdit = (r) => {
    setEditingReviewId(r.id);
    setEditRating(r.rating || 5);
    setEditComment(r.comment || '');
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
  };

  const handleSaveEdit = async (reviewId) => {
    if (!editComment.trim()) {
      toast.warn('Nội dung nhận xét không được để trống!');
      return;
    }
    setIsUpdatingReview(true);
    try {
      const updated = await reviewApi.updateReview(
        reviewId,
        { rating: editRating, comment: editComment.trim() },
        currentUser?.email
      );
      toast.success('Đã cập nhật đánh giá thành công! ⭐');
      if (typeof setReviews === 'function') {
        setReviews(prev => prev.map(r => (r.id === reviewId ? { ...r, ...updated, rating: editRating, comment: editComment.trim() } : r)));
      }
      setEditingReviewId(null);
    } catch (err) {
      toast.error('Lỗi khi cập nhật đánh giá: ' + (err.message || 'Thao tác thất bại'));
    } finally {
      setIsUpdatingReview(false);
    }
  };

  // Delete Confirmation State
  const [deleteConfirmReviewId, setDeleteConfirmReviewId] = useState(null);
  const [isDeletingReview, setIsDeletingReview] = useState(false);

  const handleDeleteReview = (reviewId) => {
    setDeleteConfirmReviewId(reviewId);
  };

  const executeDeleteReview = async () => {
    if (!deleteConfirmReviewId) return;
    const reviewId = deleteConfirmReviewId;
    setIsDeletingReview(true);
    try {
      await reviewApi.deleteReview(reviewId, currentUser?.email);
      toast.success('Đã xóa đánh giá thành công!');
      if (typeof setReviews === 'function') {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
      }
      setDeleteConfirmReviewId(null);
    } catch (err) {
      toast.error('Lỗi khi xóa đánh giá: ' + (err.message || 'Thao tác thất bại'));
    } finally {
      setIsDeletingReview(false);
    }
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-ink-900/55  animate-fade-in overflow-y-auto">
      <div className="bg-[#FFFDF8] rounded-[6px] max-w-4xl w-full shadow-none border border-ink-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        {/* 1. Modal Image Panorama Header */}
        <div className="relative h-60 sm:h-72 w-full overflow-hidden shrink-0 bg-ink-800">
          <img
            src={item.image}
            alt={item.name}
            onError={(e) => handleImageError(e, item)}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-ink-900/45" />
          
          {/* Report Place Button */}
          <button
            type="button"
            onClick={() => {
              setReportTargetType('PLACE');
              setReportTargetId(Number(item.rawId || item.id));
              setReportTargetTitle(item.name);
              setIsReportModalOpen(true);
            }}
            className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/50 hover:bg-rose-900/80 text-white flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-bold border border-white/20 z-10 backdrop-blur-xs"
            title="Báo cáo vi phạm địa điểm này"
          >
            <Flag className="w-3.5 h-3.5 text-rose-400" />
            <span>Báo cáo vi phạm</span>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Place Title & Quick Badge Overlay */}
          <div className="absolute bottom-4 left-5 right-5 text-white space-y-1.5 z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-[5px] bg-clay-600/90 text-[11px] font-bold text-white shadow-none">
                {item.category || 'Địa danh du lịch'}
              </span>
              <span className="px-2.5 py-0.5 rounded-[5px] bg-[#FFFDF8]/20 text-[11px] font-semibold text-[#F8F4EC] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-clay-200" />
                <span>{item.city}</span>
              </span>
              {totalReviews > 0 ? (
                <div className="flex items-center gap-1 text-amber-300 font-bold text-xs bg-black/40 px-2 py-0.5 rounded-[5px]">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{dynamicRating} ({totalReviews})</span>
                </div>
              ) : item.rating ? (
                <div className="flex items-center gap-1 text-amber-300 font-bold text-xs bg-black/40 px-2 py-0.5 rounded-[5px]">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{dynamicRating}</span>
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
            <div className="p-4 rounded-[6px] bg-[#F8F4EC] border border-sky-100 shadow-none space-y-2">
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
                      <div className="text-xl font-extrabold text-ink-800 flex items-center gap-1">
                        <span>{liveWeather.temp}°C</span>
                        <span className="text-xs font-semibold text-ink-400">({liveWeather.label})</span>
                      </div>
                      <p className="text-[11px] text-ink-500 font-medium">{liveWeather.vibe}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-right text-[11px] text-ink-400 font-medium">
                    <div className="flex items-center justify-end gap-1">
                      <Droplets className="w-3 h-3 text-sky-500" />
                      <span>Độ ẩm: {liveWeather.humidity}%</span>
                    </div>
                    {liveWeather.windSpeed && (
                      <div className="flex items-center justify-end gap-1">
                        <Wind className="w-3 h-3 text-ink-300" />
                        <span>Gió: {liveWeather.windSpeed} km/h</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : weatherUnavailable ? (
                <div className="py-2 text-ink-400 text-center text-[11px]">
                  📍 Địa điểm chưa có toạ độ GPS nên không kiểm tra được thời tiết thực tế
                </div>
              ) : (
                <div className="py-2 text-ink-300 text-center">Đang kiểm tra dữ liệu thời tiết...</div>
              )}
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-[#F8F4EC] p-3.5 rounded-[6px] border border-ink-200/70">
              <div>
                <span className="block text-[10px] text-ink-300 font-semibold">Giờ mở cửa</span>
                <span className="font-bold text-ink-800 text-xs">{item.openHours || 'Chưa cập nhật'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-ink-300 font-semibold">Chi phí dự kiến</span>
                <span className="font-bold text-sky-700 text-xs">{item.priceEstimate || 'Miễn phí'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-ink-300 font-semibold">Vùng du lịch</span>
                <span className="font-bold text-ink-800 text-xs">{item.region || 'Việt Nam'}</span>
              </div>
            </div>

            {/* Description & Story */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-sm text-ink-800">Giới thiệu & Điểm đặc sắc</h4>
              <p className="text-ink-500 leading-relaxed text-xs">
                {item.description || item.tagline}
              </p>
              {item.address && (
                <p className="text-ink-400 italic text-[11px] pt-1">
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
                  <span className="text-[11px] text-ink-400 min-w-0">
                    Được chia sẻ bởi{' '}
                    <strong className="text-ink-800 font-bold">
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
                <h4 className="font-bold text-xs text-ink-800">Trải nghiệm & Điểm nổi bật</h4>
                <div className="flex flex-wrap gap-1.5">
                  {item.amenities.map((a, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-[5px] bg-[#F5F0E6] text-ink-600 font-medium text-[11px]">
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Form & List */}
            <div className="pt-4 border-t border-ink-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-ink-800">Đánh giá từ du khách ({totalReviews})</h4>
                {totalReviews > 0 ? (
                  <span className="text-amber-500 font-bold">★ {dynamicRating}</span>
                ) : (
                  <span className="text-ink-300 font-medium">Mới · chưa có đánh giá</span>
                )}
              </div>

              {/* Review Input */}
              <form onSubmit={onSubmitReview} className="p-3 rounded-[6px] bg-[#F8F4EC] border border-ink-200/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-ink-600">Chấm điểm:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-0.5 text-ink-300 hover:text-amber-400 cursor-pointer"
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
                  className="w-full p-2 bg-[#FFFDF8] text-ink-800 rounded-[5px] text-xs placeholder:text-ink-300 border border-ink-200 outline-none focus:ring-1 focus:ring-sky-500 resize-none"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingReview || !reviewComment.trim()}
                    className="px-3.5 py-1.5 rounded-[5px] bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isSubmittingReview ? 'Đang gửi...' : 'Gửi nhận xét'}</span>
                  </button>
                </div>
              </form>

              {/* Danh sách đánh giá THẬT từ GET /places/{id}/reviews */}
              {reviews.length > 0 ? (
                <div className="space-y-2.5 pt-1">
                  {reviews.map((r) => {
                    const isMyReview = isAuthorOfReview(r);
                    const isEditing = editingReviewId === r.id;

                    return (
                      <div key={r.id || `${r.authorName}-${r.createdAt}`} className="p-3 rounded-[6px] bg-[#F8F4EC]/70 border border-ink-200/60 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#F5F0E6] border border-ink-200 overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-black text-ink-400">
                              {r.authorAvatar ? (
                                <img src={r.authorAvatar} alt={r.authorName} className="w-full h-full object-cover" />
                              ) : (
                                (r.authorName || 'W')[0]
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[11px] font-bold text-ink-800">{r.authorName || 'Du khách'}</span>
                                {isMyReview && (
                                  <span className="px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 font-bold text-[9px]">Bạn</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                                {'★'.repeat(r.rating || 0)}
                                <span className="text-ink-400 font-normal ml-0.5">({r.rating}/5)</span>
                              </div>
                            </div>
                          </div>

                          {/* Hành động: Sửa / Xóa nếu là đánh giá của mình; Báo cáo nếu là của người khác */}
                          <div className="flex items-center gap-1">
                            {isMyReview ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(r)}
                                  className="px-2 py-1 rounded bg-white hover:bg-ink-100 text-ink-600 border border-ink-200 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Chỉnh sửa đánh giá này"
                                >
                                  <Edit2 className="w-3 h-3 text-sky-600" />
                                  <span>Sửa</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteReview(r.id)}
                                  className="px-2 py-1 rounded bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Xóa đánh giá này"
                                >
                                  <Trash2 className="w-3 h-3 text-rose-500" />
                                  <span>Xóa</span>
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setReportTargetType('REVIEW');
                                  setReportTargetId(r.id);
                                  setReportTargetTitle(`Đánh giá của ${r.authorName || 'du khách'}`);
                                  setIsReportModalOpen(true);
                                }}
                                className="p-1.5 rounded hover:bg-rose-50 text-ink-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Báo cáo vi phạm đánh giá này"
                              >
                                <Flag className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Nội dung nhận xét hoặc Form chỉnh sửa */}
                        {isEditing ? (
                          <div className="pt-2 border-t border-ink-200/60 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-ink-600">Sửa số sao:</span>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setEditRating(star)}
                                    className="p-0.5 text-ink-300 hover:text-amber-400 cursor-pointer"
                                  >
                                    <Star className={`w-3.5 h-3.5 ${star <= editRating ? 'fill-amber-400 text-amber-400' : ''}`} />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <textarea
                              rows={2}
                              value={editComment}
                              onChange={(e) => setEditComment(e.target.value)}
                              className="w-full p-2 bg-[#FFFDF8] text-ink-800 rounded-[5px] text-xs border border-ink-200 outline-none focus:ring-1 focus:ring-sky-500 resize-none"
                            />
                            <div className="flex justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="px-2.5 py-1 rounded bg-white text-ink-600 border border-ink-200 font-bold text-[10px] cursor-pointer"
                              >
                                Hủy
                              </button>
                              <button
                                type="button"
                                disabled={isUpdatingReview}
                                onClick={() => handleSaveEdit(r.id)}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer"
                              >
                                {isUpdatingReview ? 'Đang lưu...' : 'Lưu thay đổi'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] text-ink-700 leading-relaxed pl-9">{r.comment}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-ink-300 font-medium">Chưa có đánh giá nào — hãy là người đầu tiên chia sẻ trải nghiệm nhé!</p>
              )}
            </div>

          </div>

          {/* ─── CỘT PHẢI: BẢN ĐỒ CHI TIẾT TƯƠNG TÁC CỦA ĐỊA ĐIỂM (5 Cột) ─── */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-ink-800 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-sky-600" />
                  <span>Vị trí trên bản đồ</span>
                </span>
                <span className="text-[11px] text-ink-300">
                  {item.latitude ? `${Number(item.latitude).toFixed(3)}, ${Number(item.longitude).toFixed(3)}` : ''}
                </span>
              </div>

              {/* Mini Detailed Map Canvas */}
              <div className="h-64 sm:h-72 w-full rounded-[6px] overflow-hidden border border-ink-200 shadow-none relative">
                <RealMapView
                  items={[item]}
                  activeItem={item}
                  miniMode={true}
                  className="w-full h-full"
                />
              </div>

              {/* Navigation & GPS Tools */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={(e) => onOpenGoogleMaps(item, e)}
                  className="py-2.5 px-3 rounded-[5px] bg-[#F8F4EC] hover:bg-[#F5F0E6] border border-ink-200 text-ink-600 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                  <span>Google Maps</span>
                </button>
                <button
                  onClick={(e) => onCopyGPS(item, e)}
                  className="py-2.5 px-3 rounded-[5px] bg-[#F8F4EC] hover:bg-[#F5F0E6] border border-ink-200 text-ink-600 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
                >
                  <Copy className="w-3.5 h-3.5 text-ink-500" />
                  <span>Copy GPS</span>
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 rounded-[6px] bg-[#F8F4EC] border border-ink-200/80 space-y-2.5">
              <button
                type="button"
                onClick={() => onAddToTrip(item)}
                className="w-full py-2.5 rounded-[5px] bg-clay-600 hover:bg-clay-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-none transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>+ Thêm Vào Lịch Trình Đi Chơi</span>
              </button>

              <button
                onClick={(e) => onPlanWithAI(item, e)}
                className="w-full py-2.5 rounded-[5px] bg-clay-50 hover:bg-clay-100 text-clay-800 border border-clay-300 font-bold text-xs flex items-center justify-center gap-2 shadow-none transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Lập Tour AI Với Điểm Này</span>
              </button>

              <Link
                to={`/places/${item.rawId}`}
                className="w-full py-2.5 rounded-[5px] bg-ink-800 hover:bg-ink-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-clay-200" />
                <span>Xem Trang Chi Tiết Để Chia Sẻ</span>
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* Universal Report Modal */}
      <UniversalReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetType={reportTargetType}
        targetId={reportTargetId}
        targetTitle={reportTargetTitle}
      />

      {/* Styled Delete Review Confirmation Modal */}
      {deleteConfirmReviewId && (
        <div className="fixed inset-0 z-60 bg-ink-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#FFFDF8] rounded-[6px] max-w-sm w-full p-5 border border-ink-200/80 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-ink-900 text-sm">
                  Xóa nhận xét này?
                </h3>
                <p className="text-xs text-ink-600 leading-relaxed">
                  Đánh giá và số sao của bạn sẽ bị gỡ vĩnh viễn khỏi địa điểm này. Điểm trung bình sẽ được tự động tính toán lại.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-200/60">
              <button
                type="button"
                disabled={isDeletingReview}
                onClick={() => setDeleteConfirmReviewId(null)}
                className="px-3.5 py-1.5 rounded-[5px] bg-[#F8F4EC] hover:bg-ink-100 text-ink-700 text-xs font-bold border border-ink-200/80 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isDeletingReview}
                onClick={executeDeleteReview}
                className="px-4 py-1.5 rounded-[5px] bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isDeletingReview ? (
                  <span>Đang xóa...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xác nhận xóa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
