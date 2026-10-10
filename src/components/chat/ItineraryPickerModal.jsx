import React, { useState, useEffect, useMemo } from 'react';
import { Route, Sparkles, MapPin, DollarSign, Search, X, Loader2, Send } from 'lucide-react';
import { itineraryApi } from '../../services/api';
import { useApp } from '../../context/AppContext';

export const ItineraryPickerModal = ({ isOpen, onClose, onSelectItinerary }) => {
  const { itineraries: appItineraries } = useApp();
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setLoading(true);

    itineraryApi.getAllItineraries()
      .then(data => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setItineraries(data);
        } else if (Array.isArray(appItineraries) && appItineraries.length > 0) {
          setItineraries(appItineraries);
        } else {
          setItineraries([]);
        }
      })
      .catch(err => {
        console.warn('Lỗi tải danh sách lịch trình:', err);
        if (isMounted && Array.isArray(appItineraries)) {
          setItineraries(appItineraries);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [isOpen, appItineraries]);

  const filteredItineraries = useMemo(() => {
    if (!searchQuery.trim()) return itineraries;
    const q = searchQuery.toLowerCase().trim();
    return itineraries.filter(itin =>
      (itin.title || '').toLowerCase().includes(q) ||
      (itin.destination || '').toLowerCase().includes(q)
    );
  }, [itineraries, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Route className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Gửi Lịch Trình Vào Tin Nhắn
              </h3>
              <p className="text-xs text-slate-500">
                Chọn chuyến đi bạn muốn chia sẻ với bạn bè
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3.5 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm tour hoặc điểm đến..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>
        </div>

        {/* Itinerary List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 custom-dropdown-scroll">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
              <span className="text-xs">Đang tải danh sách lịch trình...</span>
            </div>
          ) : filteredItineraries.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Route className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium">Chưa tìm thấy lịch trình phù hợp</p>
            </div>
          ) : (
            filteredItineraries.map(itin => (
              <div
                key={itin.id}
                className="p-3 rounded-2xl border border-slate-200/90 hover:border-sky-300 hover:shadow-sm bg-white transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img
                    src={itin.coverImageUrl || itin.imageUrl || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=200&q=80'}
                    alt={itin.title}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 ring-1 ring-slate-100"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-sky-100 text-sky-800">
                        {itin.destination || 'Việt Nam'}
                      </span>
                      {itin.duration && (
                        <span className="text-[9px] font-bold text-slate-500">
                          • {itin.duration}
                        </span>
                      )}
                    </div>
                    <h5 className="font-bold text-xs text-slate-900 truncate mt-0.5 group-hover:text-sky-600 transition-colors">
                      {itin.title}
                    </h5>
                    {itin.budgetTotal && (
                      <span className="text-[10px] font-extrabold text-blue-600 block mt-0.5">
                        {Number(itin.budgetTotal).toLocaleString('vi-VN')} đ
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectItinerary(itin)}
                  className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0 active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
