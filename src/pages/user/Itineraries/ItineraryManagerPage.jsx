import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Calendar, Clock, DollarSign, Sparkles, MapPin, Download, Share2, Plus, CheckCircle2 } from 'lucide-react';

export const ItineraryManagerPage = () => {
  const { itineraries, setIsAIGeneratorOpen } = useApp();
  const [activeItinId, setActiveItinId] = useState(itineraries[0]?.id || '');
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const activeItinerary = itineraries.find(i => i.id === activeItinId) || itineraries[0];

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Quản Lý Lịch Trình Du Lịch
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Chi tiết kế hoạch theo từng ngày, mốc thời gian và ngân sách dự kiến do AI tính toán
          </p>
        </div>

        <button
          onClick={() => setIsAIGeneratorOpen(true)}
          className="sparkle-btn text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>Tạo Lịch Trình AI Mới</span>
        </button>
      </div>

      {/* ITINERARIES SELECTOR TABS */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 border-b border-slate-200">
        {itineraries.map(item => (
          <button
            key={item.id}
            onClick={() => { setActiveItinId(item.id); setActiveDayIndex(0); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeItinId === item.id
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {item.title}
          </button>
        ))}
      </div>

      {activeItinerary && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Day Timeline (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Days Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {activeItinerary.days.map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveDayIndex(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeDayIndex === idx
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Ngày {day.dayNumber}
                </button>
              ))}
            </div>

            {/* Selected Day Timeline Card */}
            {activeItinerary.days[activeDayIndex] && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="font-bold text-base text-slate-900">
                    {activeItinerary.days[activeDayIndex].title}
                  </h3>
                  <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold">
                    {activeItinerary.days[activeDayIndex].activities.length} Hoạt động
                  </span>
                </div>

                {/* Timeline Spine */}
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {activeItinerary.days[activeDayIndex].activities.map((act, i) => (
                    <div key={i} className="relative group">
                      {/* Node circle */}
                      <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-white border-2 border-sky-500 group-hover:bg-sky-500 transition-colors"></div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-sky-600 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {act.time}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">📍 AI Check-in Point</span>
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900">{act.title}</h4>
                        <p className="text-xs text-slate-500">{act.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Summary Sidebar (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Trip Specs Card */}
            <div className="bg-gradient-to-br from-slate-900 to-sky-950 text-white p-6 rounded-3xl space-y-4 shadow-xl">
              <h3 className="font-bold text-sm text-sky-300">Tổng Quan Chuyến Đi</h3>
              
              <div className="space-y-3 text-xs border-y border-slate-800 py-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Điểm đến:</span>
                  <span className="font-bold">{activeItinerary.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Số ngày:</span>
                  <span className="font-bold">{activeItinerary.daysCount} ngày</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phong cách:</span>
                  <span className="font-bold">{activeItinerary.style}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ngân sách dự kiến:</span>
                  <span className="font-bold text-emerald-400">{activeItinerary.budgetTotal}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>Xuất File PDF Lịch Trình</span>
                </button>
                <button className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" />
                  <span>Chia Sẻ Cho Bạn Bè</span>
                </button>
              </div>
            </div>

            {/* AI Budget Breakdown Tip */}
            <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl space-y-2 text-amber-900">
              <div className="flex items-center gap-2 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Mẹo Tối Ưu Chi Phí AI</span>
              </div>
              <p className="text-xs leading-relaxed text-amber-800">
                Đặt vé cáp treo và homestay trước 3 ngày qua liên kết WanderAI để tiết kiệm trung bình 15% tổng chi phí.
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
