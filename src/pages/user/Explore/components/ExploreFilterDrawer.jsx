import React from 'react';
import { X, Check, RotateCcw, SlidersHorizontal, MapPin, DollarSign, ArrowDownUp } from 'lucide-react';

export const ExploreFilterDrawer = ({
  isOpen = false,
  onClose = () => {},
  regions = [],
  selectedRegion = 'Tất cả',
  setSelectedRegion = () => {},
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/50 backdrop-blur-xs animate-fade-in">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col z-10 animate-slide-left">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">Bộ Lọc Khám Phá</h3>
              <p className="text-xs text-slate-500">Tùy biến tiêu chí tìm kiếm theo nhu cầu của bạn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* 1. Filter: Region */}
          <div className="space-y-3">
            <label className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <MapPin className="w-4 h-4 text-sky-600" />
              <span>Vùng miền du lịch</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {regions.map((reg) => {
                const isSelected = selectedRegion === reg;
                return (
                  <button
                    key={reg}
                    onClick={() => setSelectedRegion(reg)}
                    className={`p-2.5 rounded-xl font-bold flex items-center justify-between border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 text-sky-800 border-sky-300 ring-1 ring-sky-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{reg}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-sky-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Filter: Sort By */}
          <div className="space-y-3">
            <label className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <ArrowDownUp className="w-4 h-4 text-sky-600" />
              <span>Thứ tự sắp xếp</span>
            </label>
            <div className="space-y-2">
              {[
                { value: 'popular', label: '🔥 Phổ biến nhất (Nhiều lượt đánh giá)' },
                { value: 'rating', label: '⭐ Điểm đánh giá cao nhất (5.0★)' },
                ...(userCoords ? [{ value: 'nearest', label: '📍 Gần vị trí GPS của bạn nhất' }] : [])
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`w-full p-3 rounded-xl font-semibold flex items-center justify-between border text-left transition-all cursor-pointer ${
                    sortBy === opt.value
                      ? 'bg-sky-50 text-sky-800 border-sky-300 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{opt.label}</span>
                  {sortBy === opt.value && <Check className="w-3.5 h-3.5 text-sky-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Filter: Budget Range */}
          <div className="space-y-3">
            <label className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <DollarSign className="w-4 h-4 text-sky-600" />
              <span>Khoảng giá dự kiến</span>
            </label>
            <div className="space-y-2">
              {budgetOptions.map((opt) => {
                const isSelected = selectedBudget === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedBudget(opt.value)}
                    className={`w-full p-2.5 rounded-xl font-medium flex items-center justify-between border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 text-sky-800 border-sky-300 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-sky-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              onResetFilters();
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-md transition-all cursor-pointer"
          >
            Áp dụng bộ lọc
          </button>
        </div>
      </div>
    </div>
  );
};
