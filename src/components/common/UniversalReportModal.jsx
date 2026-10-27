import React, { useState } from 'react';
import { Flag, X, Camera, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { reportApi, uploadApi } from '../../services/api';
import { useToast } from './Toast';

export const UniversalReportModal = ({
  isOpen,
  onClose,
  targetType = 'PLACE', // 'PLACE' | 'USER' | 'POST' | 'REVIEW'
  targetId,
  targetTitle = ''
}) => {
  const [category, setCategory] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceImageUrl, setEvidenceImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toast = useToast();

  if (!isOpen) return null;

  const categoryOptions = {
    PLACE: [
      'Thông tin sai lệch / Địa danh không đúng',
      'Địa điểm lừa đảo / Chặt chém du khách',
      'Đã đóng cửa vĩnh viễn / Không còn tồn tại',
      'Nguy hiểm an toàn / Vi phạm pháp luật',
      'Khác'
    ],
    USER: [
      'Tài khoản giả mạo danh tính',
      'Quấy rối / Đả kích / Ngôn từ thù địch',
      'Spam thương mại / Lừa đảo tài chính',
      'Hành vi độc hại trong cộng đồng',
      'Khác'
    ],
    POST: [
      'Nội dung sai sự thật / Lừa đảo',
      'Hình ảnh / Video độc hại, phản cảm',
      'Spam rác / Quảng cáo trái phép',
      'Vi phạm bản quyền hình ảnh',
      'Khác'
    ],
    REVIEW: [
      'Đánh giá giả mạo / Đánh giá bẩn',
      'Ngôn từ xúc phạm / Thiếu văn hóa',
      'Nội dung không liên quan đến địa điểm',
      'Khác'
    ]
  };

  const currentCategories = categoryOptions[targetType] || categoryOptions.PLACE;

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      toast.showInfo('Đang tải ảnh bằng chứng lên Cloudinary...');
      const uploadedUrl = await uploadApi.uploadSingle(file);
      if (uploadedUrl) {
        setEvidenceImageUrl(uploadedUrl);
        toast.showSuccess('Đã đính kèm ảnh bằng chứng thành công!');
      }
    } catch (err) {
      toast.showError('Lỗi tải ảnh bằng chứng: ' + (err.message || 'Thử lại sau'));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category) {
      toast.showError('Vui lòng chọn danh mục vi phạm!');
      return;
    }
    if (!reason.trim()) {
      toast.showError('Vui lòng nhập lý do báo cáo cụ thể!');
      return;
    }

    try {
      setIsSubmitting(true);
      await reportApi.submitReport({
        targetType,
        targetId,
        category,
        reason: reason.trim(),
        description: description.trim(),
        evidenceImageUrl
      });

      toast.showSuccess('Báo cáo của bạn đã được gửi tới Ban Quản Trị để kiểm duyệt xử lý. Cảm ơn đóng góp của bạn! 🙏');
      setCategory('');
      setReason('');
      setDescription('');
      setEvidenceImageUrl('');
      onClose();
    } catch (err) {
      toast.showError(err.message || 'Gửi báo cáo thất bại. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTargetTypeLabel = () => {
    switch (targetType) {
      case 'PLACE': return 'Địa Điểm Du Lịch';
      case 'USER': return 'Tài Khoản Người Dùng';
      case 'POST': return 'Bài Viết Cộng Đồng';
      case 'REVIEW': return 'Đánh Giá';
      default: return 'Nội Dung';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FFFDF8] rounded-[6px] max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-ink-200/80 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-ink-200/80">
          <h3 className="font-display font-black text-base text-rose-700 flex items-center gap-2">
            <Flag className="w-4 h-4 text-rose-600" />
            <span>Báo Cáo Vi Phạm {getTargetTypeLabel()}</span>
          </h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-[5px] bg-[#F8F4EC] hover:bg-ink-200 text-ink-500 hover:text-ink-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {targetTitle && (
          <div className="p-3 bg-rose-50 rounded-[5px] border border-rose-200/60 text-xs text-rose-900 font-serif">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Đối tượng bị báo cáo:</span>
            </p>
            <p className="font-sans font-semibold mt-0.5 text-rose-800">{targetTitle}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Danh mục vi phạm */}
          <div>
            <label className="block mb-1 font-bold text-ink-800">
              Danh mục vi phạm <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 rounded-[5px] bg-[#FFFDF8] border border-ink-200/80 text-xs font-medium text-ink-900 outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 transition-all cursor-pointer"
              required
            >
              <option value="">-- Chọn danh mục vi phạm --</option>
              {currentCategories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Lý do tóm tắt */}
          <div>
            <label className="block mb-1 font-bold text-ink-800">
              Lý do báo cáo chính <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Địa điểm đã chuyển chỗ khác nhưng không sửa thông tin..."
              className="w-full p-2.5 rounded-[5px] bg-[#FFFDF8] border border-ink-200/80 text-xs font-medium text-ink-900 outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 transition-all"
              required
            />
          </div>

          {/* Mô tả chi tiết */}
          <div>
            <label className="block mb-1 font-bold text-ink-800">Mô tả chi tiết / Diễn giải thêm</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Cung cấp thêm chi tiết cụ thể để Admin dễ dàng xác minh..."
              className="w-full p-2.5 rounded-[5px] bg-[#FFFDF8] border border-ink-200/80 text-xs font-serif text-ink-800 outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 transition-all leading-relaxed"
            ></textarea>
          </div>

          {/* Đính kèm ảnh bằng chứng (Cloudinary) */}
          <div>
            <label className="block mb-1 font-bold text-ink-800">Ảnh chụp màn hình bằng chứng (tùy chọn)</label>
            <div className="flex items-center gap-3">
              <label className="px-3.5 py-2 rounded-[5px] bg-[#F8F4EC] hover:bg-rose-50 hover:text-rose-700 text-ink-700 font-bold border border-ink-200/80 text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs">
                <Camera className="w-3.5 h-3.5 text-rose-600" />
                <span>{isUploadingImage ? 'Đang tải ảnh...' : 'Chọn ảnh bằng chứng'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploadingImage}
                  className="hidden"
                />
              </label>
              {evidenceImageUrl && (
                <div className="relative group shrink-0">
                  <img
                    src={evidenceImageUrl}
                    alt="Bằng chứng"
                    className="w-12 h-12 object-cover rounded-[4px] border border-rose-300 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setEvidenceImageUrl('')}
                    className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-0.5 hover:bg-rose-700 shadow-xs cursor-pointer"
                    title="Xóa ảnh"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            {evidenceImageUrl && (
              <p className="text-[11px] text-emerald-700 mt-1 font-serif flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Đã đính kèm ảnh bằng chứng thành công
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-ink-200/80">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-[5px] font-bold text-ink-600 hover:bg-[#F8F4EC] transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-[5px] font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang gửi báo cáo...</span>
                </>
              ) : (
                <>
                  <Flag className="w-3.5 h-3.5" />
                  <span>Gửi Báo Cáo Vi Phạm</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default UniversalReportModal;
