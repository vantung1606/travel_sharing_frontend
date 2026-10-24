import React from 'react';
import { X, Check, RotateCcw, SlidersHorizontal, MapPin, Building2, DollarSign, ArrowDownUp } from 'lucide-react';

export const ExploreFilterDrawer = ({
  isOpen = false,
  onClose = () => {},
  regions = [],
  selectedRegion = 'Tất cả',
  setSelectedRegion = () => {},
  cities = ['Tất cả'],
  selectedCity = 'Tất cả',
  setSelectedCity = () => {},
  sortBy = 'popular',
  setSortBy = () => {},
  selectedBudget = 'all',
  setSelectedBudget = () => {},
  userCoords = null,
  onResetFilters = () => {}
}) => {
  if (!isOpen) return null;

  const budgetOptions = [
    { value: 'all', label: 'Tất cả mức giá' },
    { value: 'under50k', label: 'Dưới 50.000đ (Bình dân / Quán nước)' },
    { value: '50k-200k', label: '50.000đ - 200.000đ (Cafe view, Quán ăn)' },
    { value: '200k-1m', label: '200.000đ - 1.000.000đ (Nhà hàng, Tour)' },
    { value: 'above1m', label: 'Trên 1.000.000đ (Homestay, Khách sạn)' }
  ];

  const selectedClass = 'bg-clay-50 text-clay-800 border-clay-400';
  const idleClass = 'bg-[#F8F4EC] text-ink-500 border-ink-200 hover:border-clay-300 hover:text-clay-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-ink-900/45 animate-fade-in">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer panel */}
      <div className="relative w-full max-w-md h-full bg-[#FFFDF8] border-l border-ink-200 flex flex-col z-10 animate-slide-left">
        {/* Header */}
        <div className="p-5 border-b border-ink-200/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-[5px] bg-clay-50 text-clay-700 border border-clay-600/20">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-ink-800">Bộ lọc khám phá</h3>
              <p className="text-[11px] text-ink-400">Tùy biến tiêu chí tìm kiếm theo nhu cầu của bạn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[5px] bg-[#F8F4EC] hover:bg-clay-50 border border-ink-200 text-ink-500 hover:text-clay-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* City */}
          <div className="space-y-3">
            <label className="font-bold text-ink-800 flex items-center gap-1.5 text-sm">
              <Building2 className="w-4 h-4 text-clay-600" />
              <span>Tỉnh thành</span>
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
              {cities.map((c) => {
                const isSelected = selectedCity === c;
                return (
                  <button
                    key={c}
                    onClick={() => setSelectedCity(c)}
                    className={`p-2.5 rounded-[5px] font-bold flex items-center justify-between border transition-colors cursor-pointer ${
                      isSelected ? selectedClass : idleClass
                    }`}
                  >
                    <span className="truncate">{c}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-clay-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-ink-300 leading-relaxed">
              Bấm một tỉnh để truy vấn trực tiếp theo toạ độ trên server, không cần tải toàn bộ danh sách.
            </p>
          </div>

          {/* Region */}
          <div className="space-y-3">
            <label className="font-bold text-ink-800 flex items-center gap-1.5 text-sm">
              <MapPin className="w-4 h-4 text-clay-600" />
              <span>Vùng miền du lịch</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {regions.map((reg) => {
                const isSelected = selectedRegion === reg;
                return (
                  <button
                    key={reg}
                    onClick={() => setSelectedRegion(reg)}
                    className={`p-2.5 rounded-[5px] font-bold flex items-center justify-between border transition-colors cursor-pointer ${
                      isSelected ? selectedClass : idleClass
                    }`}
                  >
                    <span>{reg}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-clay-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort */}
          <div className="space-y-3">
            <label className="font-bold text-ink-800 flex items-center gap-1.5 text-sm">
              <ArrowDownUp className="w-4 h-4 text-clay-600" />
              <span>Thứ tự sắp xếp</span>
            </label>
            <div className="space-y-2">
              {[
                { value: 'popular', label: 'Phổ biến nhất (nhiều lượt đánh giá)' },
                { value: 'rating', label: 'Điểm đánh giá cao nhất' },
                ...(userCoords ? [{ value: 'nearest', label: 'Gần vị trí GPS của bạn nhất' }] : [])
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`w-full p-2.5 rounded-[5px] font-semibold flex items-center justify-between border text-left transition-colors cursor-pointer ${
                    sortBy === opt.value ? selectedClass : idleClass
                  }`}
                >
                  <span>{opt.label}</span>
                  {sortBy === opt.value && <Check className="w-3.5 h-3.5 text-clay-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-3">
            <label className="font-bold text-ink-800 flex items-center gap-1.5 text-sm">
              <DollarSign className="w-4 h-4 text-clay-600" />
              <span>Khoảng giá dự kiến</span>
            </label>
            <div className="space-y-2">
              {budgetOptions.map((opt) => {
                const isSelected = selectedBudget === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedBudget(opt.value)}
                    className={`w-full p-2.5 rounded-[5px] font-medium flex items-center justify-between border text-left transition-colors cursor-pointer ${
                      isSelected ? selectedClass : idleClass
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-clay-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-ink-200/70 bg-[#F8F4EC] flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              onResetFilters();
              onClose();
            }}
            className="h-9 px-3 rounded-[5px] text-ink-500 hover:text-clay-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại</span>
          </button>
          <button
            onClick={onClose}
            className="h-9 px-5 rounded-[5px] bg-clay-600 hover:bg-clay-700 text-[#FFFDF8] font-bold border border-clay-600 transition-colors cursor-pointer"
          >
            Áp dụng bộ lọc
          </button>
        </div>
      </div>
    </div>
  );
};
