import React from 'react';
import { X, Navigation, Check, Camera, PlusCircle, Store } from 'lucide-react';

export const AddPlaceModal = ({
  isOpen = false,
  onClose = () => {},
  placeTypeTab = 'spot',
  setPlaceTypeTab = () => {},
  newPlaceForm,
  setNewPlaceForm = () => {},
  availableAmenityOptions = [],
  suggestedCoverImages = [],
  onGetLocationForForm = () => {},
  toggleAmenity = () => {},
  onSubmit = () => {},
  isSubmitting = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-xs">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900">
                Đăng Ký & Chia Sẻ Tọa Độ Bản Địa
              </h3>
              <p className="text-xs text-slate-500">
                Đóng góp quán cafe săn mây, homestay hoặc điểm check-in độc đáo lên mạng lưới Wayfare
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Place Type Switcher */}
          <div className="flex p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setPlaceTypeTab('spot')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                placeTypeTab === 'spot' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📍 Điểm Check-in Phượt Thủ (Miễn phí / Tự do)
            </button>
            <button
              type="button"
              onClick={() => setPlaceTypeTab('business')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                placeTypeTab === 'business' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏢 Cơ Sở Kinh Doanh Bản Địa (Quán cafe, Homestay...)
            </button>
          </div>

          {/* Place Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800">
                Tên địa điểm / Cơ sở <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Tiệm Cà Phê Hoàng Hôn Dã Chiến"
                value={newPlaceForm.name}
                onChange={(e) => setNewPlaceForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 text-slate-900 font-semibold outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-800">Danh mục trải nghiệm</label>
              <select
                value={newPlaceForm.categoryName}
                onChange={(e) => setNewPlaceForm(prev => ({ ...prev, categoryName: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 text-slate-900 font-semibold outline-none cursor-pointer"
              >
                <option value="Quán Cafe & Săn Mây">Quán Cafe & Săn Mây</option>
                <option value="Homestay & Nghỉ Dưỡng">Homestay & Nghỉ Dưỡng</option>
                <option value="Ẩm Thực & Đặc Sản">Ẩm Thực & Đặc Sản</option>
                <option value="Trải Nghiệm & Hoạt Động">Trải Nghiệm & Hoạt Động</option>
                <option value="Danh Lam & Thắng Cảnh">Danh Lam & Thắng Cảnh</option>
              </select>
            </div>
          </div>

          {/* City & Detailed Address */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800">Thành phố / Tỉnh</label>
              <input
                type="text"
                placeholder="VD: Đà Lạt"
                value={newPlaceForm.city}
                onChange={(e) => setNewPlaceForm(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 text-slate-900 font-semibold outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-bold text-slate-800">Địa chỉ cụ thể (Số nhà, đường, thôn bản)</label>
              <input
                type="text"
                placeholder="VD: Hẻm 31 Hoàng Hoa Thám, Phường 10"
                value={newPlaceForm.address}
                onChange={(e) => setNewPlaceForm(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 text-slate-900 font-semibold outline-none"
              />
            </div>
          </div>

          {/* GPS Coordinates with auto-fill button */}
          <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-950 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-sky-600" />
                Tọa độ GPS bản đồ (Hỗ trợ định vị radar)
              </span>
              <button
                type="button"
                onClick={onGetLocationForForm}
                className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>📍 Lấy tọa độ hiện tại</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Vĩ độ (Latitude) VD: 11.9404"
                value={newPlaceForm.latitude}
                onChange={(e) => setNewPlaceForm(prev => ({ ...prev, latitude: e.target.value }))}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-mono outline-none"
              />
              <input
                type="text"
                placeholder="Kinh độ (Longitude) VD: 108.4583"
                value={newPlaceForm.longitude}
                onChange={(e) => setNewPlaceForm(prev => ({ ...prev, longitude: e.target.value }))}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-mono outline-none"
              />
            </div>
          </div>

          {/* Operating Hours, Price & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800">Giờ mở cửa</label>
              <input
                type="text"
                placeholder="VD: 06:30 - 22:00"
                value={newPlaceForm.openHours}
                onChange={(e) => setNewPlaceForm(prev => ({ ...prev, openHours: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800">Khoảng giá dự kiến</label>
              <input
                type="text"
                placeholder="VD: 35.000đ - 75.000đ"
                value={newPlaceForm.priceRange}
                onChange={(e) => setNewPlaceForm(prev => ({ ...prev, priceRange: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800">Hotline đặt chỗ (nếu có)</label>
              <input
                type="text"
                placeholder="VD: 0988 123 456"
                value={newPlaceForm.phoneNumber}
                onChange={(e) => setNewPlaceForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 outline-none"
              />
            </div>
          </div>

          {/* Cover Image URL & Quick Suggestions */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 flex items-center justify-between">
              <span>Link ảnh bìa (URL)</span>
              <span className="text-[11px] text-slate-400 font-normal">Gợi ý ảnh đẹp bên dưới:</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={newPlaceForm.coverImageUrl}
                onChange={(e) => setNewPlaceForm(prev => ({ ...prev, coverImageUrl: e.target.value }))}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 outline-none"
              />
            </div>
            {/* Image suggestions */}
            <div className="flex flex-wrap gap-2 pt-1">
              {suggestedCoverImages.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setNewPlaceForm(prev => ({ ...prev, coverImageUrl: sug.url }))}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                >
                  📷 {sug.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amenities Multi-select */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800">Tiện ích & Dịch vụ nổi bật</label>
            <div className="flex flex-wrap gap-2">
              {availableAmenityOptions.map((am) => {
                const selected = newPlaceForm.amenities.includes(am);
                return (
                  <button
                    key={am}
                    type="button"
                    onClick={() => toggleAmenity(am)}
                    className={`px-3 py-1.5 rounded-xl font-semibold text-xs border transition-all cursor-pointer flex items-center gap-1.5 ${
                      selected
                        ? 'bg-sky-50 text-sky-800 border-sky-300 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5 text-sky-600" />}
                    <span>{am}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800">Mô tả / Kinh nghiệm trải nghiệm</label>
            <textarea
              rows={3}
              placeholder="Chia sẻ view săn mây mấy giờ đẹp nhất, món nước nào ngon nhất, đường đi có dốc không..."
              value={newPlaceForm.description}
              onChange={(e) => setNewPlaceForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 outline-none resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Đang gửi đăng ký...' : '🚀 Gửi Đăng Ký Địa Điểm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
