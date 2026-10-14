import React from 'react';
import { X, Star, Phone, CheckCircle2, ExternalLink, Copy, Calendar, Sparkles, Send, Store } from 'lucide-react';

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
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* 1. Modal Image Header */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden shrink-0 bg-slate-100">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-xs font-bold">
                {item.category} • {item.city}
              </span>
              <div className="flex items-center gap-1 text-amber-300 font-bold text-xs">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{item.rating}</span>
              </div>
            </div>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-white">
              {item.name}
            </h3>
          </div>
        </div>

        {/* 2. Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* Host & Merchant Profile Banner if available */}
          {item.ownerName && (
            <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={item.ownerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border-2 border-orange-300"
                />
                <div>
                  <div className="flex items-center gap-1 font-bold text-slate-900 text-sm">
                    <span>{item.ownerName}</span>
                    {item.isVerifiedHost && (
                      <CheckCircle2 className="w-4 h-4 text-sky-600" title="Chủ cơ sở uy tín đã xác thực" />
                    )}
                  </div>
                  <span className="text-slate-500 text-[11px]">{item.ownerHandle || '@local_host'} • Chủ cơ sở bản địa</span>
                </div>
              </div>

              {item.phoneNumber && (
                <a
                  href={`tel:${item.phoneNumber}`}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Gọi đặt chỗ</span>
                </a>
              )}
            </div>
          )}

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <span className="block text-[10px] text-slate-400 font-semibold">Giờ mở cửa</span>
              <span className="font-bold text-slate-800 text-xs">{item.openHours || '07:00 - 22:00'}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-semibold">Khoảng giá dự kiến</span>
              <span className="font-bold text-sky-700 text-xs">{item.priceEstimate}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-semibold">Hotline liên hệ</span>
              <span className="font-bold text-slate-800 text-xs">{item.phoneNumber || 'Đang cập nhật'}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-sm text-slate-900">Giới thiệu & Điểm đặc sắc</h4>
            <p className="text-slate-600 leading-relaxed text-xs">
              {item.tagline || item.description}
            </p>
            {item.address && (
              <p className="text-slate-500 italic text-[11px] pt-1">
                📍 Địa chỉ: {item.address}
              </p>
            )}
          </div>

          {/* Amenities */}
          {item.amenities && item.amenities.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-slate-900">Tiện ích & Điểm nổi bật</h4>
              <div className="flex flex-wrap gap-2">
                {item.amenities.map((a, i) => (
                  <span key={i} className="px-3 py-1 rounded-xl bg-sky-50 text-sky-800 font-semibold border border-sky-200/80">
                    ✓ {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reviews & Ratings Section */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-900">Đánh giá & Trải nghiệm thực tế</h4>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
                  ★ {item.rating || '5.0'} ({reviews.length} nhận xét)
                </span>
              </div>
            </div>

            {/* Submit New Review Box */}
            <form onSubmit={onSubmitReview} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700">Chấm điểm của bạn:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      <Star className={`w-4 h-4 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <textarea
                  rows={2}
                  placeholder="Chia sẻ trải nghiệm thực tế của bạn tại địa điểm này (chất lượng phục vụ, cảnh quan, món ngon...)"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full p-2.5 bg-white text-slate-800 rounded-xl text-xs placeholder:text-slate-400 border border-slate-200 outline-none focus:ring-2 focus:ring-sky-500/20 resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingReview || !reviewComment.trim()}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingReview ? 'Đang gửi...' : 'Gửi nhận xét'}</span>
                </button>
              </div>
            </form>

            {/* Reviews List */}
            <div className="space-y-2.5">
              {isReviewsLoading ? (
                <div className="py-4 text-center text-slate-400 text-xs">Đang tải đánh giá...</div>
              ) : reviews.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 text-center text-slate-400 text-xs">
                  Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ cảm nhận về địa điểm này!
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="p-3 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={rev.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                          alt=""
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="font-bold text-slate-800 text-xs">{rev.authorName || 'Du khách'}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* 3. Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => onOpenGoogleMaps(item, e)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
              <span>Google Maps</span>
            </button>
            <button
              onClick={(e) => onCopyGPS(item, e)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy GPS</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onAddToTrip(item)}
              className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 border border-emerald-200 transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>+ Thêm vào Lịch trình</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Đóng
            </button>
            <button
              onClick={(e) => onPlanWithAI(item, e)}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Lập Tour AI</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
