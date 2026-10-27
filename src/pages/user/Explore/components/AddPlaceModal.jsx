import React, { useState, useRef } from 'react';
import { 
  X, Navigation, MapPin, Send, Image as ImageIcon, 
  ChevronDown, ChevronUp, Clock, Check, Compass,
  UploadCloud, Loader2, Trash2, RefreshCw, AlertCircle
} from 'lucide-react';
import { uploadApi } from '../../../../services/api';

const POPULAR_CITIES = ['Đà Lạt', 'Đà Nẵng', 'Hà Giang', 'Hội An', 'Phú Quốc', 'Ninh Bình', 'Sapa', 'Quy Nhơn'];

const CATEGORY_ITEMS = [
  { id: 'Danh Lam & Thắng Cảnh', label: 'Thắng Cảnh' },
  { id: 'Biển Đảo & Nghỉ Dưỡng', label: 'Biển Đảo' },
  { id: 'Cà Phê', label: 'Cà Phê' },
  { id: 'Ẩm Thực & Đặc Sản', label: 'Ẩm Thực' },
  { id: 'Di Sản & Văn Hóa', label: 'Di Sản Văn Hóa' },
  { id: 'Homestay & Khách Sạn', label: 'Homestay' },
  { id: 'Cắm Trại & Hoạt Động', label: 'Cắm Trại & Phượt' }
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
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Tự động tìm tọa độ GPS từ địa chỉ người dùng đã nhập
  const handleAutoGeocodeFromAddress = async () => {
    const address = newPlaceForm.address?.trim() || '';
    const city = newPlaceForm.city?.trim() || '';
    if (!address && !city) return;

    setIsGeocoding(true);
    try {
      const cleanAddress = address.replace(/-/g, ', ').replace(/\//g, ', ').trim();
      const query = `${cleanAddress}, ${city}, Việt Nam`;
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=vn`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'vi,en;q=0.9' } });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
        setNewPlaceForm(prev => ({
          ...prev,
          latitude: Number(data[0].lat).toFixed(6),
          longitude: Number(data[0].lon).toFixed(6)
        }));
      } else {
        const cityUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ', Việt Nam')}&format=json&limit=1&countrycodes=vn`;
        const cityRes = await fetch(cityUrl);
        const cityData = await cityRes.json();
        if (Array.isArray(cityData) && cityData.length > 0 && cityData[0].lat && cityData[0].lon) {
          setNewPlaceForm(prev => ({
            ...prev,
            latitude: Number(cityData[0].lat).toFixed(6),
            longitude: Number(cityData[0].lon).toFixed(6)
          }));
        }
      }
    } catch (e) {
      console.debug('Geocoding preview notice:', e);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Handle Local File Upload from device
  const handleFileSelected = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WebP)!');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Dung lượng ảnh tối đa 15MB!');
      return;
    }

    setUploadError('');
    setIsUploading(true);

    // Instant local preview so user sees it right away
    const localUrl = URL.createObjectURL(file);
    setNewPlaceForm(prev => ({ ...prev, coverImageUrl: localUrl }));

    try {
      const serverCdnUrl = await uploadApi.uploadSingle(file);
      if (serverCdnUrl) {
        setNewPlaceForm(prev => ({ ...prev, coverImageUrl: serverCdnUrl }));
      }
    } catch (err) {
      console.error('Lỗi tải ảnh lên máy chủ:', err);
      setUploadError('Không thể tải ảnh lên hệ thống: ' + (err.message || 'Lỗi kết nối'));
    } finally {
      setIsUploading(false);
    }
  };

  const onFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelected(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelected(file);
  };

  const handleClearImage = () => {
    setNewPlaceForm(prev => ({ ...prev, coverImageUrl: '' }));
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-ink-900/55  animate-fade-in overflow-y-auto">
      <div className="bg-[#FFFDF8] rounded-[6px] max-w-xl w-full shadow-none border border-ink-200/70 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header with Visual Banner */}
        <div className="relative p-5 sm:p-6 bg-[#3A2A21] text-white shrink-0 overflow-hidden">
          
          
          <div className="relative flex items-start justify-between">
            <div className="space-y-1.5 pr-6">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFFDF8]/20  text-white text-[11px] font-bold tracking-wide uppercase flex items-center gap-1 border border-white/20">
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
              <p className="text-xs text-[#E3D6C6] leading-relaxed max-w-md">
                Gợi ý điểm đến yêu thích của bạn. Sau khi Ban Quản Trị xác minh, địa điểm sẽ xuất hiện trên bản đồ cộng đồng.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#FFFDF8]/15 hover:bg-[#FFFDF8]/25 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
              title="Đóng modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Clean, Streamlined Form Body */}
        <form onSubmit={onSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* 1. Tải Ảnh Từ Máy / Thiết Bị (Direct Device Upload) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-ink-800 text-xs flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-sky-600" />
                <span>Ảnh địa điểm thực tế</span>
                <span className="text-ink-300 font-normal text-[11px]">(tải trực tiếp từ máy của bạn)</span>
              </label>

              <button
                type="button"
                onClick={() => setShowUrlFallback(!showUrlFallback)}
                className="text-[11px] text-sky-600 hover:text-sky-700 font-bold hover:underline cursor-pointer"
              >
                {showUrlFallback ? 'Ẩn ô dán link' : 'Hoặc dán URL ảnh'}
              </button>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileInputChange}
              className="hidden"
            />

            {/* Case A: Image is Selected/Uploaded -> Show Preview with Actions */}
            {newPlaceForm.coverImageUrl ? (
              <div className="relative h-44 sm:h-48 rounded-[6px] overflow-hidden border border-ink-200 group shadow-none bg-ink-800">
                <img
                  src={newPlaceForm.coverImageUrl}
                  alt="Preview"
                  className={`w-full h-full object-cover transition-all duration-300 ${isUploading ? 'opacity-50 blur-xs ' : ''}`}
                />

                {/* Loading state overlay */}
                {isUploading && (
                  <div className="absolute inset-0 bg-ink-800/70  flex flex-col items-center justify-center gap-2 text-white">
                    <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
                    <span className="text-xs font-bold tracking-wide">Đang tải ảnh lên hệ thống...</span>
                  </div>
                )}

                {/* Bottom Bar with Actions */}
                {!isUploading && (
                  <div className="absolute inset-0 bg-ink-900/50 flex items-end justify-between p-3.5">
                    <span className="text-white text-xs font-bold drop-shadow-none flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Ảnh đã sẵn sàng
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-[5px] bg-[#FFFDF8]/20 hover:bg-[#FFFDF8]/30  text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-white/20 shadow-none"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Đổi ảnh khác</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleClearImage}
                        className="p-1.5 rounded-[5px] bg-rose-600/80 hover:bg-rose-600  text-white transition-all cursor-pointer shadow-none"
                        title="Xóa ảnh"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Case B: No Image -> Clean Drag & Drop Upload Zone */
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-[6px] p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group ${
                  isDragging
                    ? 'border-sky-500 bg-sky-50/80 '
                    : 'border-ink-200 hover:border-sky-400 hover:bg-sky-50/40 bg-[#F8F4EC]/50'
                }`}
              >
                <div className="w-12 h-12 rounded-[6px] bg-sky-100 text-sky-600 flex items-center justify-center group-hover:bg-clay-600 group-hover:text-white transition-all shadow-none">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-ink-800 text-xs group-hover:text-sky-600 transition-colors">
                    Nhấp để tải ảnh từ máy tính / điện thoại
                  </p>
                  <p className="text-[11px] text-ink-300 mt-0.5">
                    Hoặc kéo thả file ảnh vào đây (Hỗ trợ JPG, PNG, WebP)
                  </p>
                </div>
              </div>
            )}

            {/* Error Message if upload fails */}
            {uploadError && (
              <div className="p-2.5 rounded-[5px] bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* URL Fallback Input (Optional) */}
            {showUrlFallback && (
              <input
                type="url"
                placeholder="Dán link ảnh từ Internet: https://..."
                value={newPlaceForm.coverImageUrl}
                onChange={(e) => setNewPlaceForm(prev => ({ ...prev, coverImageUrl: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-[5px] bg-[#F8F4EC] border border-ink-200 focus:bg-[#FFFDF8] focus:border-sky-500 text-ink-800 text-xs outline-none"
              />
            )}
          </div>

          {/* 2. Tên Địa Điểm */}
          <div className="space-y-1.5">
            <label className="font-bold text-ink-800 text-xs flex items-center gap-1">
              <span>Tên địa điểm</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Cột cờ Lũng Cú, Tiệm Cà Phê Hoàng Hôn, Đèo Ô Quy Hồ..."
              value={newPlaceForm.name}
              onChange={(e) => setNewPlaceForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-[6px] bg-[#F8F4EC] border border-ink-200 focus:bg-[#FFFDF8] focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 text-ink-800 font-semibold text-sm outline-none transition-all placeholder:text-ink-300 placeholder:font-normal"
            />
          </div>

          {/* 3. Danh Mục Trải Nghiệm (Visual Chip Badges) */}
          <div className="space-y-2">
            <label className="font-bold text-ink-800 text-xs">
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
                    className={`px-3.5 py-1.5 rounded-[5px] font-semibold text-xs transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-sky-600 text-white border-sky-600 shadow-none'
                        : 'bg-[#F8F4EC] text-ink-600 border-ink-200 hover:bg-[#F5F0E6] hover:text-ink-800'
                    }`}
                  >
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Tỉnh Thành & Địa Chỉ Cụ Thể */}
          <div className="space-y-3 p-4 rounded-[6px] bg-[#F8F4EC] border border-ink-200/80">
            {/* Tỉnh thành chọn nhanh */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-ink-800 text-xs flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  <span>Tỉnh / Thành phố</span>
                  <span className="text-rose-500 font-bold">*</span>
                </label>
                <span className="text-[11px] text-ink-300">Chọn nhanh hoặc tự gõ:</span>
              </div>

              {/* Quick City Chips */}
              <div className="flex flex-wrap gap-1 pb-1">
                {POPULAR_CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewPlaceForm(prev => ({ ...prev, city: c }))}
                    className={`px-2 py-0.5 rounded-[5px] text-[11px] font-semibold transition-colors cursor-pointer ${
                      newPlaceForm.city === c
                        ? 'bg-sky-600 text-white'
                        : 'bg-[#FFFDF8] text-ink-500 border border-ink-200 hover:bg-[#F5F0E6]'
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
                className="w-full px-3.5 py-2.5 rounded-[5px] bg-[#FFFDF8] border border-ink-200 focus:border-sky-500 text-ink-800 font-semibold outline-none"
              />
            </div>

            {/* Địa chỉ chi tiết */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-ink-800 text-xs flex items-center gap-1">
                  <span>Địa chỉ cụ thể</span>
                  <span className="text-rose-500 font-bold">*</span>
                </label>
                <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Kèm Quận/Huyện & Tỉnh/Thành
                </span>
              </div>
              <input
                type="text"
                required
                placeholder="VD: 202 Chương Dương - Sơn Trà - Đà Nẵng"
                value={newPlaceForm.address}
                onChange={(e) => setNewPlaceForm(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-[5px] bg-[#FFFDF8] border border-ink-200 focus:border-sky-500 text-ink-800 outline-none text-xs font-medium"
              />
              <p className="text-[11px] text-ink-400 leading-snug">
                <span className="text-sky-600 font-bold">💡 Quy chuẩn:</span> Phải ghi rõ Số nhà/Đường - Phường/Quận/Huyện - Tỉnh/Thành phố (Ví dụ: <strong className="text-ink-600">202 Chương Dương - Sơn Trà - Đà Nẵng</strong>). Tuyệt đối không chỉ ghi tên đường cộc lốc.
              </p>
            </div>

            {/* Smart GPS Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-ink-200/50">
              <span className="text-[11px] text-ink-400">
                {newPlaceForm.latitude ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Đã ghim GPS: {newPlaceForm.latitude}, {newPlaceForm.longitude}
                  </span>
                ) : (
                  <span className="text-amber-600 font-medium flex items-center gap-1">
                    <span>⚡</span>
                    <span>Tự động định vị GPS khi gửi bài</span>
                  </span>
                )}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleAutoGeocodeFromAddress}
                  disabled={isGeocoding || (!newPlaceForm.address && !newPlaceForm.city)}
                  className="px-2.5 py-1.5 rounded-[5px] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                  title="Tìm vị trí bản đồ dựa trên tên địa chỉ"
                >
                  {isGeocoding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Compass className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>{isGeocoding ? 'Đang tìm...' : 'Lấy GPS từ địa chỉ'}</span>
                </button>

                <button
                  type="button"
                  onClick={onGetLocationForForm}
                  className="px-2.5 py-1.5 rounded-[5px] bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  title="Ghim vị trí thiết bị hiện tại"
                >
                  <Navigation className="w-3.5 h-3.5 text-sky-600" />
                  <span>Vị trí hiện tại</span>
                </button>
              </div>
            </div>
          </div>

          {/* 5. Cảm Nhận & Mô Tả Ngắn */}
          <div className="space-y-1.5">
            <label className="font-bold text-ink-800 text-xs">
              Mô tả & Kinh nghiệm khám phá
            </label>
            <textarea
              rows={2}
              placeholder="Chia sẻ vẻ đẹp, view ngắm cảnh, mùa nào đi đẹp nhất, lưu ý đường đi..."
              value={newPlaceForm.description}
              onChange={(e) => setNewPlaceForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 rounded-[6px] bg-[#F8F4EC] border border-ink-200 focus:bg-[#FFFDF8] focus:border-sky-500 text-ink-800 outline-none resize-none transition-all"
            />
          </div>

          {/* 6. Mục Mở Rộng: Giờ Mở Cửa, Giá Vé, Hotline (Thu gọn mặc định) */}
          <div className="border-t border-ink-200/70 pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-bold text-ink-400 hover:text-ink-800 flex items-center gap-1.5 py-1 cursor-pointer transition-colors"
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
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-[6px] bg-[#F8F4EC] border border-ink-200/80 animate-fade-in">
                <div className="space-y-1">
                  <label className="font-bold text-ink-600 text-[11px]">Giờ mở cửa</label>
                  <input
                    type="text"
                    placeholder="VD: 07:00 - 22:00"
                    value={newPlaceForm.openHours}
                    onChange={(e) => setNewPlaceForm(prev => ({ ...prev, openHours: e.target.value }))}
                    className="w-full px-3 py-2 rounded-[5px] bg-[#FFFDF8] border border-ink-200 text-ink-800 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-ink-600 text-[11px]">Khoảng giá / Vé</label>
                  <input
                    type="text"
                    placeholder="VD: Miễn phí, 50.000đ"
                    value={newPlaceForm.priceRange}
                    onChange={(e) => setNewPlaceForm(prev => ({ ...prev, priceRange: e.target.value }))}
                    className="w-full px-3 py-2 rounded-[5px] bg-[#FFFDF8] border border-ink-200 text-ink-800 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-ink-600 text-[11px]">Hotline liên hệ</label>
                  <input
                    type="text"
                    placeholder="VD: 0988 123 456"
                    value={newPlaceForm.phoneNumber}
                    onChange={(e) => setNewPlaceForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="w-full px-3 py-2 rounded-[5px] bg-[#FFFDF8] border border-ink-200 text-ink-800 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-ink-200/70 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-[5px] text-ink-500 font-bold hover:bg-[#F5F0E6] transition-colors cursor-pointer text-xs"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="px-6 py-2.5 rounded-[6px] bg-clay-600 hover:bg-clay-700 text-white font-bold text-xs shadow-none transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting || isUploading ? (
                <span>{isUploading ? 'Đang tải ảnh...' : 'Đang gửi thông tin...'}</span>
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
