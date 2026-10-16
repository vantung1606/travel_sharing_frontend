import React, { useState } from 'react';
import { 
  X, Navigation, MapPin, Sparkles, Send, Image as ImageIcon, 
  ChevronDown, ChevronUp, Clock, Check, Info, Compass
} from 'lucide-react';

const POPULAR_CITIES = ['Đà Lạt', 'Đà Nẵng', 'Hà Giang', 'Hội An', 'Phú Quốc', 'Ninh Bình', 'Sapa', 'Quy Nhơn'];

const CATEGORY_ITEMS = [
  { id: 'Danh Lam & Thắng Cảnh', label: 'Thắng Cảnh', icon: '🏔️' },
  { id: 'Biển Đảo & Nghỉ Dưỡng', label: 'Biển Đảo', icon: '🏖️' },
  { id: 'Quán Cafe & Săn Mây', label: 'Cafe Săn Mây', icon: '☕' },
  { id: 'Ẩm Thực & Đặc Sản', label: 'Ẩm Thực', icon: '🍜' },
  { id: 'Di Sản & Phố Cổ', label: 'Di Sản Phố Cổ', icon: '🏛️' },
  { id: 'Homestay & Nghỉ Dưỡng', label: 'Homestay', icon: '🏡' },
  { id: 'Trải Nghiệm & Hoạt Động', label: 'Cắm Trại & Phượt', icon: '🏕️' }
];

const CURATED_IMAGES = [
  { label: 'Núi Rừng', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
  { label: 'Biển Đảo', url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80' },
  { label: 'Phố Cổ', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80' },
  { label: 'Cafe Mây', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80' },
  { label: 'Resort', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80' },
  { label: 'Ẩm Thực', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' }
];

export const AddPlaceModal = ({
  isOpen = false,
  onClose = () => {},
  newPlaceForm,
  setNewPlaceForm = () => {},
  onGetLocationForForm = () => {},
  onSubmit = () => {},
  isSubmitting = false
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);

  if (!isOpen) return null;

  const currentCover = newPlaceForm.coverImageUrl || CURATED_IMAGES[0].url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header with Visual Banner */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-br from-sky-600 via-sky-700 to-indigo-800 text-white shrink-0 overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
          
          <div className="relative flex items-start justify-between">
            <div className="space-y-1.5 pr-6">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold tracking-wide uppercase flex items-center gap-1 border border-white/20">
                  <Compass className="w-3 h-3 text-amber-300" />
                  Đóng góp tọa độ
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 text-[11px] font-medium flex items-center gap-1 border border-amber-300/30">
                  <Clock className="w-3 h-3" />
                  Chờ duyệt
                </span>
              </div>
              <h2 className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-white">
                Chia Sẻ Địa Điểm Mới
              </h2>
              <p className="text-xs text-sky-100/90 leading-relaxed max-w-md">
                Gợi ý điểm đến yêu thích của bạn. Sau khi Ban Quản Trị xác minh, địa điểm sẽ xuất hiện trên bản đồ cộng đồng.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
              title="Đóng modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Clean, Streamlined Form Body */}
        <form onSubmit={onSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* 1. Tên Địa Điểm */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 text-xs flex items-center gap-1">
              <span>Tên địa điểm</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Cột cờ Lũng Cú, Tiệm Cà Phê Hoàng Hôn, Đèo Ô Quy Hồ..."
              value={newPlaceForm.name}
              onChange={(e) => setNewPlaceForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 text-slate-900 font-semibold text-sm outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
            />
          </div>

          {/* 2. Danh Mục Trải Nghiệm (Visual Chip Badges) */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 text-xs">
              Danh mục trải nghiệm
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_ITEMS.map((cat) => {
                const isSelected = newPlaceForm.categoryName === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setNewPlaceForm(prev => ({ ...prev, categoryName: cat.id }))}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-600/30 scale-[1.02]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Tỉnh Thành & Địa Chỉ Cụ Thể */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            {/* Tỉnh thành chọn nhanh */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 text-xs flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  <span>Tỉnh / Thành phố</span>
                  <span className="text-rose-500 font-bold">*</span>
                </label>
                <span className="text-[11px] text-slate-400">Chọn nhanh hoặc tự nhập:</span>
              </div>

              {/* Quick City Chips */}
              <div className="flex flex-wrap gap-1 pb-1">
                {POPULAR_CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewPlaceForm(prev => ({ ...prev, city: c }))}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                      newPlaceForm.city === c
                        ? 'bg-sky-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <input
                type="text"
                required
                placeholder="VD: Đà Lạt, Hà Giang, Đà Nẵng, Quảng Ninh..."
                value={newPlaceForm.city}
                onChange={(e) => setNewPlaceForm(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-sky-500 text-slate-800 font-semibold outline-none"
              />
            </div>

            {/* Địa chỉ chi tiết */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 text-xs">
                Địa chỉ chi tiết / Khu vực <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Đèo Mã Pí Lèng, Xã Pải Lủng, Huyện Mèo Vạc..."
                value={newPlaceForm.address}
                onChange={(e) => setNewPlaceForm(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-sky-500 text-slate-800 outline-none"
              />
            </div>

            {/* Smart 1-Tap GPS Button */}
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {newPlaceForm.latitude ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Đã ghim GPS: {newPlaceForm.latitude}, {newPlaceForm.longitude}
                  </span>
                ) : (
                  'Chưa ghim tọa độ GPS bản đồ'
                )}
              </span>

              <button
                type="button"
                onClick={onGetLocationForForm}
                className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 text-sky-600" />
                <span>📍 Ghim vị trí hiện tại</span>
              </button>
            </div>
          </div>

          {/* 4. Chọn Ảnh Nổi Bật (Visual Card + Quick Curated Samples) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                <span>Ảnh đại diện địa điểm</span>
              </label>
              <button
                type="button"
                onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                className="text-[11px] text-sky-600 hover:text-sky-700 font-bold hover:underline cursor-pointer"
              >
                {showCustomUrlInput ? 'Ẩn ô dán link ảnh' : 'Dán link ảnh riêng'}
              </button>
            </div>

            {/* Live Preview Card */}
            <div className="relative h-36 sm:h-40 rounded-2xl overflow-hidden border border-slate-200 group shadow-xs">
              <img
                src={currentCover}
                alt="Preview"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.target.src = CURATED_IMAGES[0].url;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex items-end p-3">
                <span className="text-white text-xs font-bold drop-shadow-sm flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Ảnh đại diện hiển thị trên bài viết
                </span>
              </div>
            </div>

            {/* Quick 1-Click Curated Photos */}
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400">Hoặc chọn nhanh ảnh mẫu chất lượng cao:</span>
              <div className="grid grid-cols-6 gap-2">
                {CURATED_IMAGES.map((img, idx) => {
                  const isCurActive = newPlaceForm.coverImageUrl === img.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewPlaceForm(prev => ({ ...prev, coverImageUrl: img.url }))}
                      className={`relative h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${
                        isCurActive ? 'border-sky-500 ring-2 ring-sky-500/30 scale-105' : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent"></div>
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white font-medium text-center truncate py-0.5">
                        {img.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom URL Input Field (Collapsible) */}
            {showCustomUrlInput && (
              <input
                type="url"
                placeholder="Dán đường dẫn ảnh: https://images.unsplash.com/..."
                value={newPlaceForm.coverImageUrl}
                onChange={(e) => setNewPlaceForm(prev => ({ ...prev, coverImageUrl: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 text-slate-800 text-xs outline-none"
              />
            )}
          </div>

          {/* 5. Cảm Nhận & Mô Tả Ngắn */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 text-xs">
              Mô tả & Kinh nghiệm khám phá
            </label>
            <textarea
              rows={2}
              placeholder="Chia sẻ vẻ đẹp, view ngắm cảnh, mùa nào đi đẹp nhất, lưu ý đường đi..."
              value={newPlaceForm.description}
              onChange={(e) => setNewPlaceForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 text-slate-800 outline-none resize-none transition-all"
            />
          </div>

          {/* 6. Mục Mở Rộng: Giờ Mở Cửa, Giá Vé, Hotline (Thu gọn mặc định) */}
          <div className="border-t border-slate-100 pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 py-1 cursor-pointer transition-colors"
            >
              {showAdvanced ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Thu gọn thông tin phụ</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>+ Thêm giờ mở cửa, giá vé, số điện thoại (tùy chọn)</span>
                </>
              )}
            </button>

            {showAdvanced && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 animate-fade-in">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Giờ mở cửa</label>
                  <input
                    type="text"
                    placeholder="VD: 07:00 - 22:00"
                    value={newPlaceForm.openHours}
                    onChange={(e) => setNewPlaceForm(prev => ({ ...prev, openHours: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Khoảng giá / Vé</label>
                  <input
                    type="text"
                    placeholder="VD: Miễn phí, 50.000đ"
                    value={newPlaceForm.priceRange}
                    onChange={(e) => setNewPlaceForm(prev => ({ ...prev, priceRange: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Hotline liên hệ</label>
                  <input
                    type="text"
                    placeholder="VD: 0988 123 456"
                    value={newPlaceForm.phoneNumber}
                    onChange={(e) => setNewPlaceForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors cursor-pointer text-xs"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-700 hover:from-sky-700 hover:to-indigo-800 text-white font-bold text-xs shadow-lg shadow-sky-600/25 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Đang gửi thông tin...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi Duyệt Địa Điểm ✨</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
