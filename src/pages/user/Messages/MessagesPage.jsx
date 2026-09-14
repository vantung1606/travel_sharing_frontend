import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { MessageSquare, Users, Send, Search, MapPin, Plus } from 'lucide-react';

export const MessagesPage = () => {
  const [activeThread, setActiveThread] = useState('group-1');
  const [showMobileChat, setShowMobileChat] = useState(false);

  const threads = [
    {
      id: 'group-1',
      name: 'Nhóm Phượt Hà Giang 3N2Đ (Hội phượt thủ)',
      membersCount: 4,
      lastMsg: 'Mọi người nhớ chuẩn bị áo khoác dày nhé, đêm trên Đồng Văn khá lạnh!',
      time: '10:15',
      unread: 2,
      avatar: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 'group-2',
      name: 'Hội Đi Đà Nẵng Tháng 9',
      membersCount: 6,
      lastMsg: 'AI đã tính tiền phòng khách sạn chia đều là 450k/người nha.',
      time: 'Hôm qua',
      unread: 0,
      avatar: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=150&q=80'
    }
  ];

  const currentThreadObj = threads.find(t => t.id === activeThread) || threads[0];

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[550px]">
        
        {/* Left Threads Sidebar (4 Columns) */}
        <div className={`md:col-span-4 border-r border-slate-200 p-4 space-y-4 bg-slate-50/50 ${showMobileChat ? 'hidden md:block' : 'block'}`}>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-slate-900">Trò Chuyện & Nhóm Tour</h2>
            <button className="p-1.5 rounded-lg bg-sky-100 text-sky-700 hover:bg-sky-200 text-xs font-bold flex items-center gap-1">
              <Plus className="w-4 h-4" />
              <span>Tạo Nhóm</span>
            </button>
          </div>

          <div className="space-y-2">
            {threads.map(thread => (
              <div
                key={thread.id}
                onClick={() => {
                  setActiveThread(thread.id);
                  setShowMobileChat(true);
                }}
                className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${
                  activeThread === thread.id
                    ? 'bg-white shadow-md border border-sky-200 ring-2 ring-sky-500/10'
                    : 'hover:bg-slate-100'
                }`}
              >
                <img src={thread.avatar} alt={thread.name} className="w-11 h-11 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{thread.name}</h4>
                    <span className="text-[10px] text-slate-400">{thread.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{thread.lastMsg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Chat Active View (8 Columns) */}
        <div className={`md:col-span-8 p-4 sm:p-6 flex flex-col justify-between space-y-4 ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              {/* Mobile Back Button */}
              <button
                onClick={() => setShowMobileChat(false)}
                className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold"
              >
                ← Tất cả nhóm
              </button>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 truncate max-w-[200px] sm:max-w-none">
                  {currentThreadObj.name}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  {currentThreadObj.membersCount} Thành viên • Đồng bộ lịch trình AI Wander
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold shrink-0">
              ● Online
            </span>
          </div>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            <div className="flex gap-3">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" className="w-8 h-8 rounded-full" />
              <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none text-xs text-slate-800 max-w-sm">
                <span className="font-bold block text-[10px] text-slate-500 mb-0.5">Hoàng Bách</span>
                Mọi người nhớ chuẩn bị áo khoác dày nhé, đêm trên Đồng Văn khá lạnh!
              </div>
            </div>
            <div className="flex gap-3 flex-row-reverse">
              <div className="bg-sky-600 text-white p-3 rounded-2xl rounded-tr-none text-xs max-w-sm">
                Đã chuẩn bị đầy đủ rồi nha. Đặt vé thuyền sông Nho Quế thành công luôn rồi!
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="text"
              placeholder="Nhập tin nhắn nhóm chuyến đi..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button className="sparkle-btn px-4 py-2.5 rounded-xl text-white text-xs font-bold shrink-0">
              Gửi
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
