import React from 'react';
import { X, Plus, Calendar, Sparkles } from 'lucide-react';

export const AddToTripModal = ({
  isOpen = false,
  onClose = () => {},
  item,
  itineraries = [],
  onAddToTrip = () => {},
  onCreateNewTripWithItem = () => {}
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-base text-slate-900">Thêm vào Lịch trình</h3>
            <p className="text-xs text-slate-500 mt-0.5">Chọn chuyến đi để thêm "{item.name}"</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Trips list */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {itineraries.length === 0 ? (
            <div className="p-5 rounded-2xl bg-slate-50 text-center space-y-3">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">Bạn chưa có chuyến đi nào được lưu.</p>
              <button
                type="button"
                onClick={onCreateNewTripWithItem}
                className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-colors cursor-pointer flex items-center gap-1.5 mx-auto shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Tạo chuyến đi mới với điểm này</span>
              </button>
            </div>
          ) : (
            itineraries.map((itin) => (
              <div
                key={itin.id}
                onClick={() => onAddToTrip(itin)}
                className="p-3.5 rounded-2xl border border-slate-200/80 hover:border-sky-500 hover:bg-sky-50/50 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-slate-900 truncate group-hover:text-sky-600">
                    {itin.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {itin.duration || 'Nhiều ngày'} • {itin.placesCount || 0} điểm dừng chân
                  </p>
                </div>
                <span className="p-1.5 rounded-full bg-slate-100 group-hover:bg-sky-600 group-hover:text-white text-slate-600 transition-colors shrink-0">
                  <Plus className="w-3.5 h-3.5" />
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  );
};
