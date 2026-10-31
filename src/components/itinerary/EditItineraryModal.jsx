import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, DollarSign, Users, Compass, Globe, Lock, Image as ImageIcon, Sparkles, Check } from 'lucide-react';
import { useToast } from '../common/Toast';
import { useApp } from '../../context/AppContext';

const PRESET_COVERS = [
  { label: 'Đà Nẵng Biển Xanh', url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Đà Lạt Ngàn Hoa', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Phú Quốc Hoàng Hôn', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Hà Giang Hùng Vĩ', url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Ninh Bình Non Nước', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Sa Pa Ruộng Bậc Thang', url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80' }
];

const TRAVEL_STYLES = [
  { id: 'Nghỉ dưỡng & Khám phá', label: 'Nghỉ dưỡng & Khám phá', desc: 'Thư giãn, thưởng ngoạn cảnh quan nhẹ nhàng' },
  { id: 'Phượt bụi & Khám phá mạo hiểm', label: 'Phượt bụi & Mạo hiểm', desc: 'Chinh phục cung đường, trekking, cắm trại' },
  { id: 'Ẩm thực & Check-in sống ảo', label: 'Ẩm thực & Check-in', desc: 'Quán ăn đặc sản, địa điểm chụp hình ấn tượng' },
  { id: 'Văn hóa & Di sản lịch sử', label: 'Văn hóa & Lịch sử', desc: 'Đền chùa, bảo tàng, làng nghề truyền thống' },
  { id: 'Gia đình & Thư giãn', label: 'Gia đình & Thư giãn', desc: 'Lộ trình thoải mái, an toàn cho mọi lứa tuổi' },
  { id: 'Sinh thái & Thiên nhiên', label: 'Sinh thái & Thiên nhiên', desc: 'Rừng quốc gia, suối thác, đồi chè bình yên' }
];

const GROUP_TYPES = ['Cá nhân', 'Cặp đôi', 'Bạn bè', 'Gia đình'];

export const EditItineraryModal = ({ itinerary, isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const { updateItineraryInBackend } = useApp();

  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budgetTotal, setBudgetTotal] = useState(5000000);
  const [budgetFormatted, setBudgetFormatted] = useState('5,000,000');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [groupType, setGroupType] = useState('Cá nhân');
  const [travelStyle, setTravelStyle] = useState('Nghỉ dưỡng & Khám phá');
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (itinerary && isOpen) {
      setTitle(itinerary.title || '');
      setDestination(itinerary.destination || '');
      setStartDate(itinerary.startDate || '');
      setEndDate(itinerary.endDate || '');
      const rawBudget = Number(itinerary.totalBudget || itinerary.budgetTotal || 5000000);
      setBudgetTotal(rawBudget);
      setBudgetFormatted(rawBudget.toLocaleString('en-US'));
      setCoverImageUrl(itinerary.coverImage || itinerary.coverImageUrl || PRESET_COVERS[0].url);
      setGroupType(itinerary.groupType || 'Cá nhân');
      setTravelStyle(itinerary.travelStyle || itinerary.style || 'Nghỉ dưỡng & Khám phá');
      setIsPublic(itinerary.isPublic !== false);
    }
  }, [itinerary, isOpen]);

  if (!isOpen || !itinerary) return null;

  const handleBudgetChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    const num = Number(rawVal) || 0;
    setBudgetTotal(num);
    setBudgetFormatted(num > 0 ? num.toLocaleString('en-US') : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !destination.trim()) {
      toast.showWarning('Vui lòng nhập tên chuyến đi và điểm đến chính!');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        destination: destination.trim(),
        startDate: startDate || null,
        endDate: endDate || null,
        budgetTotal: Number(budgetTotal),
        coverImageUrl: coverImageUrl.trim(),
        groupType,
        travelStyle,
        isPublic
      };

      let updated = null;
      if (typeof itinerary.id === 'number' || !String(itinerary.id).startsWith('itin-')) {
        updated = await updateItineraryInBackend(itinerary.id, payload);
      } else {
        // Fallback for local mock item
        updated = {
          ...itinerary,
          ...payload,
          coverImage: payload.coverImageUrl,
          style: payload.travelStyle,
          totalBudget: payload.budgetTotal
        };
      }

      toast.showSuccess(`Đã cập nhật thông tin chuyến đi "${title.trim()}" thành công! 🎉`);
      if (onSuccess) {
        onSuccess(updated);
      }
      onClose();
    } catch (err) {
      toast.showError('Không thể cập nhật lịch trình: ' + (err.message || 'Thao tác thất bại'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-fade-in font-display">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 sm:py-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Chỉnh Sửa Thông Tin Chuyến Đi
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Cập nhật tên, điểm đến, thời gian, ngân sách và phong cách du lịch
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 custom-dropdown-scroll">
          {/* Tên chuyến đi */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tên Lịch Trình / Chuyến Đi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Khám Phá Đà Nẵng - Hội An 4N3Đ"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
            />
          </div>

          {/* Điểm đến chính */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              <span>Điểm Đến Chính <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="VD: Đà Nẵng, Phú Quốc, Hà Giang..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
            />
          </div>

          {/* Ngày khởi hành & Ngày kết thúc */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Ngày Bắt Đầu</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Ngày Kết Thúc</span>
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
              />
            </div>
          </div>

          {/* Tổng ngân sách dự kiến */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dự Toán Tổng Ngân Sách (VNĐ)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={budgetFormatted}
                onChange={handleBudgetChange}
                placeholder="5,000,000"
                className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-bold outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                VNĐ
              </span>
            </div>
          </div>

          {/* Nhóm đối tượng */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Nhóm Đồng Hành</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {GROUP_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setGroupType(type)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    groupType === type
                      ? 'bg-sky-50 border-sky-400 text-sky-700 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {groupType === type && <Check className="w-3.5 h-3.5 text-sky-600" />}
                  <span>{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Phong cách du lịch (Travel Style) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Phong Cách Du Lịch</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TRAVEL_STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setTravelStyle(style.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-start gap-2 ${
                    travelStyle === style.id
                      ? 'bg-amber-50/70 border-amber-400 text-amber-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${
                    travelStyle === style.id ? 'bg-amber-500 border-amber-600 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {travelStyle === style.id && <Check className="w-2.5 h-2.5" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">{style.label}</p>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{style.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chế độ Công khai / Riêng tư */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Chế Độ Hiển Thị
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  isPublic
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isPublic ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">Công Khai 🌐</p>
                  <p className="text-[11px] text-slate-500">Mọi thành viên trên Wayfare đều xem được</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  !isPublic
                    ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  !isPublic ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">Riêng Tư 🔒</p>
                  <p className="text-[11px] text-slate-500">Chỉ riêng bạn có quyền xem & chỉnh sửa</p>
                </div>
              </button>
            </div>
          </div>

          {/* Link ảnh bìa & Bộ gợi ý ảnh */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Ảnh Bìa Chuyến Đi (URL)</span>
            </label>
            <input
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
            />

            {/* Ảnh xem trước & preset */}
            <div className="pt-1">
              <p className="text-[11px] font-semibold text-slate-500 mb-2">Hoặc chọn nhanh ảnh tiêu biểu:</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {PRESET_COVERS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCoverImageUrl(preset.url)}
                    className={`relative rounded-lg overflow-hidden h-14 border-2 transition-all cursor-pointer group ${
                      coverImageUrl === preset.url ? 'border-sky-500 ring-2 ring-sky-200' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] font-bold py-0.5 px-1 truncate block text-center">
                      {preset.label.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Đang lưu...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Lưu Thay Đổi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
