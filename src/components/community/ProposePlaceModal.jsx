import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Upload, Loader2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { placeApi, uploadApi } from '../../services/api';
import { useToast } from '../common/Toast';

const POPULAR_CITIES = [
  'Đà Lạt', 'Đà Nẵng', 'Hà Nội', 'TP. Hồ Chí Minh',
  'Hội An', 'Phú Quốc', 'Sa Pa', 'Ninh Bình',
  'Nha Trang', 'Hà Giang', 'Huế', 'Vũng Tàu', 'Quy Nhơn'
];

const CATEGORIES = [
  'Danh Lam & Thắng Cảnh',
  'Quán Cafe & Săn Mây',
  'Ẩm thực & Check-in',
  'Núi Rừng & Mây Ngàn',
  'Di Sản & Phố Cổ',
  'Biển Đảo & Nghỉ Dưỡng',
  'Văn hóa & Lịch sử',
  'Lưu Trú & Homestay'
];

export const ProposePlaceModal = ({ isOpen, onClose, initialName = '', onPlaceCreated, currentUser }) => {
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [name, setName] = useState('');
  const [city, setCity] = useState('Đà Lạt');
  const [address, setAddress] = useState('');
  const [categoryName, setCategoryName] = useState('Danh Lam & Thắng Cảnh');
  const [description, setDescription] = useState('');
  const [openHours, setOpenHours] = useState('07:30 - 21:00');
  const [ticketPrice, setTicketPrice] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialName || '');
      setAddress('');
      setDescription('');
      setCoverImageUrl('');
    }
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  const handleUploadCoverImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const url = await uploadApi.uploadImage(file);
      if (url) {
        setCoverImageUrl(url);
        toast.showSuccess('Đã tải ảnh địa điểm lên Cloudinary CDN.');
      }
    } catch (err) {
      toast.showError('Tải ảnh thất bại: ' + (err.message || 'Vui lòng thử lại.'));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.showWarning('Vui lòng nhập tên địa điểm hoặc tên quán.');
      return;
    }

    if (!address.trim()) {
      toast.showWarning('Vui lòng nhập địa chỉ cụ thể (Số nhà, tên đường, phường/xã).');
      return;
    }

    setSubmitting(true);
    try {
      const priceNum = ticketPrice.trim() ? parseFloat(ticketPrice.replace(/\D/g, '')) : null;

      const payload = {
        name: name.trim(),
        city,
        address: address.trim(),
        categoryName,
        description: description.trim() || undefined,
        openHours: openHours.trim() || undefined,
        ticketPrice: priceNum || undefined,
        coverImageUrl: coverImageUrl || undefined,
        images: coverImageUrl ? [coverImageUrl] : []
      };

      const result = await placeApi.createPlace(payload, currentUser?.email);

      toast.showSuccess(
        result.status === 'ACTIVE'
          ? 'Địa điểm đã được AI thẩm định và duyệt thành công vào hệ thống!'
          : 'Đã gửi đề xuất địa điểm! Thông tin đã được chuyển vào hàng đợi duyệt của Quản trị viên.'
      );

      if (onPlaceCreated) {
        onPlaceCreated(result);
      }
      onClose();
    } catch (err) {
      toast.showError('Không thể tạo địa điểm: ' + (err.message || 'Lỗi hệ thống'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFDF8] rounded-sm max-w-lg w-full shadow-2xl border border-[#1E1A15]/15 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#1E1A15]/10 flex items-center justify-between bg-[#F8F4EC]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-sm bg-clay-600 text-white flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#1E1A15]">
                Đóng góp Địa điểm Mới vào Wayfare
              </h3>
              <p className="text-[11px] text-[#6B6154]">
                Địa điểm sẽ được AI kiểm duyệt và đưa lên Bản đồ du lịch toàn quốc
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-sm text-[#8A7F70] hover:text-[#1E1A15] hover:bg-[#EBE3D5] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* Tên địa điểm */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#1E1A15] flex items-center gap-1">
              <span>Tên địa điểm / Tên quán</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Cà phê Túi Mơ To, Tiệm Bánh Cối Xay Gió..."
              className="w-full px-3 py-2 rounded-sm bg-white border border-[#1E1A15]/15 focus:border-clay-600 focus:outline-none text-[#1E1A15] font-semibold text-xs"
              required
            />
          </div>

          {/* Thành phố & Danh mục */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-[#1E1A15]">Tỉnh / Thành phố <span className="text-rose-500">*</span></label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-sm bg-white border border-[#1E1A15]/15 focus:border-clay-600 focus:outline-none text-[#1E1A15] font-semibold text-xs cursor-pointer"
              >
                {POPULAR_CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#1E1A15]">Danh mục <span className="text-rose-500">*</span></label>
              <select
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-3 py-2 rounded-sm bg-white border border-[#1E1A15]/15 focus:border-clay-600 focus:outline-none text-[#1E1A15] font-semibold text-xs cursor-pointer"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Địa chỉ cụ thể */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#1E1A15] flex items-center gap-1">
              <span>Địa chỉ cụ thể</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="VD: Hẻm 31 Sào Nam, Phường 11, TP. Đà Lạt"
              className="w-full px-3 py-2 rounded-sm bg-white border border-[#1E1A15]/15 focus:border-clay-600 focus:outline-none text-[#1E1A15] text-xs"
              required
            />
            <p className="text-[10.5px] text-[#8A7F70]">
              Ghi rõ số nhà/tên đường/phường xã để AI đối soát tính có thật của địa điểm.
            </p>
          </div>

          {/* Ảnh bìa */}
          <div className="space-y-2">
            <label className="font-bold text-[#1E1A15] flex items-center justify-between">
              <span>Hình ảnh địa điểm</span>
              {uploadingImage && <span className="text-clay-600 text-[10px] flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Đang tải...</span>}
            </label>

            <div className="flex items-center gap-3">
              {coverImageUrl ? (
                <div className="relative w-20 h-16 rounded-sm overflow-hidden border border-[#1E1A15]/15 shrink-0">
                  <img src={coverImageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setCoverImageUrl('')}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="px-3 py-2 rounded-sm border border-dashed border-[#1E1A15]/20 hover:border-clay-600 bg-white hover:bg-[#F8F4EC] text-[#6B6154] hover:text-clay-700 transition-colors flex items-center gap-2 cursor-pointer text-xs"
                >
                  <Upload className="w-4 h-4 text-clay-600" />
                  <span>Tải ảnh từ thiết bị</span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUploadCoverImage}
                className="hidden"
              />

              <input
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="Hoặc dán URL ảnh tại đây..."
                className="flex-1 px-3 py-2 rounded-sm bg-white border border-[#1E1A15]/15 focus:border-clay-600 focus:outline-none text-[#1E1A15] text-xs"
              />
            </div>
          </div>

          {/* Giờ mở cửa & Giá vé */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-[#1E1A15]">Giờ hoạt động</label>
              <input
                type="text"
                value={openHours}
                onChange={(e) => setOpenHours(e.target.value)}
                placeholder="VD: 07:00 - 22:00"
                className="w-full px-3 py-2 rounded-sm bg-white border border-[#1E1A15]/15 focus:border-clay-600 focus:outline-none text-[#1E1A15] text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#1E1A15]">Giá vé / Mức giá (VNĐ)</label>
              <input
                type="text"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(e.target.value)}
                placeholder="VD: 50.000 hoặc Miễn phí"
                className="w-full px-3 py-2 rounded-sm bg-white border border-[#1E1A15]/15 focus:border-clay-600 focus:outline-none text-[#1E1A15] text-xs"
              />
            </div>
          </div>

          {/* Mô tả ngắn */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#1E1A15]">Mô tả ngắn về địa điểm</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Chia sẻ vài nét đặc trưng: view ngắm hoàng hôn, phong cách thiết kế, món ăn nổi bật..."
              className="w-full px-3 py-2 rounded-sm bg-white border border-[#1E1A15]/15 focus:border-clay-600 focus:outline-none text-[#1E1A15] text-xs leading-relaxed resize-none"
            />
          </div>

          {/* AI Notice Banner */}
          <div className="p-2.5 rounded-sm bg-amber-50 border border-amber-200/80 flex items-start gap-2 text-amber-900 text-[11px] leading-relaxed">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Cơ chế kiểm duyệt CSDL Wayfare:</strong> Sau khi gửi, hệ thống AI sẽ tự động thẩm định vị trí thực tế và chống trùng lặp. Khi được duyệt, địa điểm sẽ xuất hiện trên Bản đồ toàn quốc và bạn sẽ nhận điểm thưởng đóng góp.
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#1E1A15]/10">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-sm bg-[#F3EDE2] hover:bg-[#EBE3D5] text-[#3B332A] font-bold text-xs transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingImage}
              className="px-5 py-2 rounded-sm bg-clay-600 hover:bg-clay-700 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang gửi thẩm định...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Gửi đề xuất địa điểm</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default ProposePlaceModal;
