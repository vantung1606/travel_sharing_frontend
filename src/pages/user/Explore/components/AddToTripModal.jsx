import React, { useState, useEffect } from 'react';
import {
  X, Plus, Calendar, Clock, Sparkles, MapPin, ChevronRight,
  ArrowLeft, Check, Compass, DollarSign, Tag, Info
} from 'lucide-react';

const TIME_SLOT_PRESETS = [
  { id: 'morning', label: 'Buổi sáng', time: '08:30:00', displayTime: '08:30 - 11:30', icon: '🌅' },
  { id: 'afternoon', label: 'Buổi chiều', time: '14:00:00', displayTime: '14:00 - 17:00', icon: '☀️' },
  { id: 'evening', label: 'Buổi tối', time: '18:30:00', displayTime: '18:30 - 21:00', icon: '🌙' },
  { id: 'custom', label: 'Tùy chỉnh giờ', time: '09:00:00', displayTime: 'Giờ cụ thể', icon: '⏱️' },
];

const CATEGORY_PRESETS = [
  'Tham quan', 'Ăn uống', 'Check-in chụp ảnh', 'Vui chơi giải trí', 'Thư giãn nghỉ dưỡng'
];

export const AddToTripModal = ({
  isOpen = false,
  onClose = () => {},
  item,
  itineraries = [],
  onAddToTrip = () => {},
  onCreateNewTripWithItem = () => {}
}) => {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);
  const [customDaysCount, setCustomDaysCount] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('morning');
  const [customTime, setCustomTime] = useState('09:00');
  const [category, setCategory] = useState('Tham quan');
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset or initialize state whenever modal opens or item changes
  useEffect(() => {
    if (isOpen && item) {
      setSelectedTrip(null);
      setSelectedDayNumber(1);
      setCustomDaysCount(null);
      setSelectedTimeSlot('morning');
      setCustomTime('09:00');
      setCategory(item.category || 'Tham quan');
      const rawPrice = Number(item.ticketPrice) || 0;
      setEstimatedCost(rawPrice);
      setNote(`Tham quan, trải nghiệm và chụp ảnh tại ${item.name}`);
      setIsSubmitting(false);
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  // Tính số ngày của chuyến đi được chọn
  const getDaysCount = (trip) => {
    if (!trip) return 1;
    if (customDaysCount && customDaysCount > 0) return customDaysCount;
    if (trip.startDate && trip.endDate) {
      const s = new Date(trip.startDate);
      const e = new Date(trip.endDate);
      const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
      if (diff > 0 && diff <= 30) return diff;
    }
    if (trip.daysCount && Number(trip.daysCount) > 0) return Number(trip.daysCount);
    if (Array.isArray(trip.days) && trip.days.length > 0) {
      const maxDay = Math.max(...trip.days.map((d) => Number(d.dayNumber) || 1));
      return Math.max(trip.days.length, maxDay);
    }
    if (Array.isArray(trip.details) && trip.details.length > 0) {
      return Math.max(1, ...trip.details.map((d) => Number(d.dayNumber) || 1));
    }
    return 1;
  };

  const currentTotalDays = selectedTrip ? getDaysCount(selectedTrip) : 1;

  // Tính ngày cụ thể theo lịch trình (VD: Thứ 7, 24/10)
  const formatDayDate = (trip, dayIndex) => {
    if (!trip?.startDate) return null;
    const baseDate = new Date(trip.startDate);
    baseDate.setDate(baseDate.getDate() + (dayIndex - 1));
    const dayName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][baseDate.getDay()];
    const dateFormatted = `${baseDate.getDate().toString().padStart(2, '0')}/${(baseDate.getMonth() + 1).toString().padStart(2, '0')}`;
    return `${dayName}, ${dateFormatted}`;
  };

  // Đếm số điểm đã có trong ngày được chọn
  const getExistingStopsCountForDay = (trip, dayNum) => {
    if (!trip) return 0;
    if (Array.isArray(trip.details)) {
      return trip.details.filter((d) => Number(d.dayNumber) === dayNum).length;
    }
    if (Array.isArray(trip.days)) {
      const dayObj = trip.days.find((d) => Number(d.dayNumber) === dayNum);
      return (dayObj?.activities || []).length;
    }
    return 0;
  };

  const handleSelectTrip = (trip) => {
    setSelectedTrip(trip);
    setSelectedDayNumber(1);
    const initialDays = getDaysCount(trip);
    setCustomDaysCount(initialDays);
  };

  const handleAddExtraDay = () => {
    const nextDays = currentTotalDays + 1;
    setCustomDaysCount(nextDays);
    setSelectedDayNumber(nextDays);
  };

  const handleConfirmAdd = async () => {
    if (!selectedTrip) return;
    setIsSubmitting(true);

    let finalStartTime = '09:00:00';
    let timeSlotLabel = 'Buổi sáng (08:30)';

    if (selectedTimeSlot === 'custom') {
      finalStartTime = `${customTime}:00`;
      timeSlotLabel = `${customTime}`;
    } else {
      const preset = TIME_SLOT_PRESETS.find((p) => p.id === selectedTimeSlot);
      if (preset) {
        finalStartTime = preset.time;
        timeSlotLabel = `${preset.label} (${preset.displayTime})`;
      }
    }

    try {
      await onAddToTrip({
        itinerary: selectedTrip,
        dayNumber: selectedDayNumber,
        startTime: finalStartTime,
        timeSlotLabel,
        category: category || 'Tham quan',
        estimatedCost: Number(estimatedCost) || 0,
        note: (note || '').trim(),
      });
      onClose();
    } catch {
      // Error handled by parent toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-ink-900/55  animate-fade-in overflow-y-auto">
      <div className="bg-[#FFFDF8] rounded-[6px] max-w-lg w-full shadow-none border border-ink-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-ink-200/70 flex items-center justify-between bg-[#F8F4EC]">
          <div className="flex items-center gap-3">
            {selectedTrip && (
              <button
                type="button"
                onClick={() => setSelectedTrip(null)}
                className="w-8 h-8 rounded-full bg-[#F5F0E6] hover:bg-[#EFE8DC] flex items-center justify-center text-ink-500 cursor-pointer transition-colors"
                title="Quay lại danh sách chuyến đi"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h3 className="font-bold text-base text-ink-800">
                {selectedTrip ? 'Lên lịch trình chi tiết' : 'Thêm vào Lịch trình'}
              </h3>
              <p className="text-xs text-ink-400 mt-0.5">
                {selectedTrip
                  ? `Chọn ngày & thời gian cho "${item.name}"`
                  : `Chọn chuyến đi để thêm "${item.name}"`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5F0E6] hover:bg-[#EFE8DC] flex items-center justify-center text-ink-400 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BƯỚC 1: CHỌN CHUYẾN ĐI */}
        {!selectedTrip ? (
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2 p-2.5 rounded-[5px] bg-sky-50/80 border border-sky-100 text-sky-800 text-xs">
              <Compass className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                Bạn muốn ghé thăm <strong>{item.name}</strong> trong chuyến đi nào?
              </span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {itineraries.length === 0 ? (
                <div className="p-6 rounded-[6px] bg-[#F8F4EC] text-center space-y-3 border border-ink-200/70">
                  <Calendar className="w-10 h-10 text-ink-300 mx-auto" />
                  <p className="text-xs text-ink-400">Bạn chưa có lịch trình nào trên tài khoản này.</p>
                  <button
                    type="button"
                    onClick={onCreateNewTripWithItem}
                    className="px-4 py-2.5 rounded-[5px] bg-clay-600 text-white text-xs font-bold hover:shadow-none transition-all cursor-pointer flex items-center gap-1.5 mx-auto"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Tạo lịch trình mới với điểm này</span>
                  </button>
                </div>
              ) : (
                itineraries.map((itin) => {
                  const daysTotal = getDaysCount(itin);
                  const stopsCount = Array.isArray(itin.details)
                    ? itin.details.length
                    : itin.placesCount || 0;

                  return (
                    <div
                      key={itin.id}
                      onClick={() => handleSelectTrip(itin)}
                      className="p-3.5 rounded-[6px] border border-ink-200/90 hover:border-sky-500 hover:bg-sky-50/40 transition-all cursor-pointer flex items-center justify-between gap-3 group shadow-none hover:shadow-none"
                    >
                      <div className="min-w-0 space-y-1">
                        <h4 className="font-bold text-xs sm:text-sm text-ink-800 truncate group-hover:text-sky-600 transition-colors">
                          {itin.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-ink-400">
                          <span className="flex items-center gap-1 font-medium text-ink-500">
                            <MapPin className="w-3 h-3 text-red-500" /> {itin.destination || 'Việt Nam'}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-[3px] border border-sky-100">
                            {daysTotal} ngày
                          </span>
                          <span>•</span>
                          <span>{stopsCount} điểm dừng</span>
                        </div>
                      </div>
                      <span className="p-2 rounded-[5px] bg-[#F5F0E6] group-hover:bg-sky-600 group-hover:text-white text-ink-500 transition-colors shrink-0">
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 border-t border-ink-200/70 flex items-center justify-between">
              <button
                type="button"
                onClick={onCreateNewTripWithItem}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>+ Tạo lịch trình mới</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-[5px] bg-[#F5F0E6] text-ink-600 text-xs font-bold hover:bg-[#EFE8DC] transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          /* BƯỚC 2: CHỌN NGÀY & KHUNG GIỜ CHI TIẾT */
          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Selected Trip Info Banner */}
            <div className="p-3 rounded-[6px] bg-clay-50 border border-sky-200/70 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-black tracking-wider text-sky-600">Chuyến đi đã chọn</span>
                <h4 className="font-extrabold text-xs sm:text-sm text-ink-800 truncate">
                  {selectedTrip.title}
                </h4>
                <p className="text-[11px] text-ink-400 mt-0.5">
                  📍 {selectedTrip.destination || 'Điểm đến'} • Thời lượng: {currentTotalDays} ngày
                  {selectedTrip.startDate ? ` (${selectedTrip.startDate} → ${selectedTrip.endDate || ''})` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTrip(null)}
                className="text-[11px] font-bold text-sky-700 hover:text-sky-900 bg-[#FFFDF8] px-2.5 py-1.5 rounded-[5px] border border-sky-200 shadow-none shrink-0 cursor-pointer"
              >
                Đổi chuyến
              </button>
            </div>

            {/* Mục 1: Chọn Ngày Thứ Mấy */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-ink-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  <span>1. Ghé thăm vào ngày thứ mấy?</span>
                </label>
                <span className="text-[11px] text-ink-400 font-medium">
                  Đang chọn: <strong className="text-sky-600">Ngày {selectedDayNumber}</strong>
                  {getExistingStopsCountForDay(selectedTrip, selectedDayNumber) > 0 &&
                    ` (${getExistingStopsCountForDay(selectedTrip, selectedDayNumber)} điểm đã có)`}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {Array.from({ length: currentTotalDays }).map((_, index) => {
                  const dayNum = index + 1;
                  const isSelected = selectedDayNumber === dayNum;
                  const dateStr = formatDayDate(selectedTrip, dayNum);
                  const stops = getExistingStopsCountForDay(selectedTrip, dayNum);

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => setSelectedDayNumber(dayNum)}
                      className={`px-3 py-2 rounded-[5px] text-xs font-bold border transition-all cursor-pointer flex flex-col items-center min-w-[72px] ${
                        isSelected
                          ? 'bg-sky-600 text-white border-sky-600 shadow-none '
                          : 'bg-[#FFFDF8] text-ink-600 border-ink-200 hover:border-sky-400 hover:bg-[#F8F4EC]'
                      }`}
                    >
                      <span>Ngày {dayNum}</span>
                      {dateStr && (
                        <span className={`text-[10px] font-normal ${isSelected ? 'text-sky-100' : 'text-ink-300'}`}>
                          {dateStr}
                        </span>
                      )}
                      {stops > 0 && (
                        <span className={`text-[9px] font-semibold mt-0.5 ${isSelected ? 'text-amber-200' : 'text-ink-400'}`}>
                          • {stops} điểm
                        </span>
                      )}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={handleAddExtraDay}
                  className="px-3 py-2 rounded-[5px] text-xs font-bold border border-dashed border-sky-300 text-sky-600 hover:bg-sky-50 hover:border-sky-500 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Thêm ngày mới cho lịch trình này"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm ngày {currentTotalDays + 1}</span>
                </button>
              </div>
            </div>

            {/* Mục 2: Chọn Buổi / Khung giờ */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-ink-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>2. Khung giờ dự kiến trong ngày</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {TIME_SLOT_PRESETS.map((preset) => {
                  const isSelected = selectedTimeSlot === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedTimeSlot(preset.id)}
                      className={`p-2.5 rounded-[5px] border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        isSelected
                          ? 'border-sky-600 bg-sky-50/70 text-sky-900 ring-1 ring-sky-500'
                          : 'border-ink-200 hover:border-ink-200 hover:bg-[#F8F4EC] text-ink-600'
                      }`}
                    >
                      <span className="text-base">{preset.icon}</span>
                      <div className="min-w-0">
                        <p className="font-bold text-xs">{preset.label}</p>
                        <p className="text-[10px] text-ink-400">{preset.displayTime}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedTimeSlot === 'custom' && (
                <div className="pt-2 flex items-center gap-2 p-3 bg-[#F8F4EC] rounded-[5px] border border-ink-200">
                  <Clock className="w-4 h-4 text-ink-400" />
                  <label htmlFor="customTimeInput" className="text-xs font-semibold text-ink-600">Giờ bắt đầu:</label>
                  <input
                    id="customTimeInput"
                    type="time"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="px-2.5 py-1 rounded-[5px] border border-ink-200 bg-[#FFFDF8] text-xs font-bold text-ink-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <span className="text-[11px] text-ink-300 italic">(Định dạng 24h)</span>
                </div>
              )}
            </div>

            {/* Mục 3: Phân loại & Chi phí dự kiến */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-800 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-ink-400" />
                  <span>Loại hoạt động</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-[5px] border border-ink-200 bg-[#FFFDF8] text-xs font-semibold text-ink-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {CATEGORY_PRESETS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-800 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Chi phí dự kiến (VNĐ)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(Math.max(0, Number(e.target.value)))}
                  placeholder="0 (Miễn phí)"
                  className="w-full px-3 py-2 rounded-[5px] border border-ink-200 bg-[#FFFDF8] text-xs font-semibold text-ink-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Mục 4: Ghi chú kế hoạch */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-ink-800 flex items-center justify-between">
                <span>Ghi chú cho hoạt động này</span>
                <span className="text-[10px] text-ink-300 font-normal">Tối đa 300 ký tự</span>
              </label>
              <textarea
                value={note}
                maxLength={300}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="VD: Chụp ảnh hoàng hôn, ăn đặc sản, chuẩn bị vé..."
                className="w-full px-3 py-2 rounded-[5px] border border-ink-200 bg-[#FFFDF8] text-xs text-ink-800 focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed resize-none"
              />
            </div>

            {/* Buttons Action */}
            <div className="pt-3 border-t border-ink-200/70 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedTrip(null)}
                className="px-4 py-2.5 rounded-[5px] bg-[#F5F0E6] hover:bg-[#EFE8DC] text-ink-600 text-xs font-bold transition-colors cursor-pointer"
              >
                Quay lại
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmAdd}
                className="flex-1 px-4 py-2.5 rounded-[5px] bg-clay-600 hover:bg-clay-700 text-white text-xs font-bold transition-all shadow-none hover:shadow-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Đang lưu vào lịch trình...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>
                      Xác nhận thêm vào Ngày {selectedDayNumber} ({selectedTimeSlot === 'custom' ? customTime : TIME_SLOT_PRESETS.find(p => p.id === selectedTimeSlot)?.label})
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
