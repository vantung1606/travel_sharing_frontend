import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { MessageCircle, X, Minus, Maximize2, Send, Search, Users, ArrowLeft, CheckCheck } from 'lucide-react';

const SAMPLE_THREADS = [
  {
    id: 'group-1',
    name: 'Nhóm Phượt Hà Giang 3N2Đ',
    type: 'GROUP',
    membersCount: 4,
    lastMsg: 'Mọi người nhớ chuẩn bị áo khoác dày nhé!',
    time: '10:15',
    unread: 2,
    avatar: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'group-2',
    name: 'Hội Đi Đà Nẵng Tháng 9',
    type: 'GROUP',
    membersCount: 6,
    lastMsg: 'AI đã tính tiền phòng khách sạn chia đều là 450k/người nha.',
    time: 'Hôm qua',
    unread: 0,
    avatar: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'direct-sample',
    name: 'Văn Tùng - Travel Blogger',
    type: 'DIRECT',
    membersCount: 2,
    lastMsg: 'Cảm ơn bạn! Lịch trình Đà Nẵng mình có đính kèm trong bài viết đó.',
    time: 'Vừa xong',
    unread: 1,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  }
];

const INITIAL_MESSAGES = {
  'group-1': [
    {
      id: 1,
      sender: 'Hoàng Bách',
      text: 'Mọi người nhớ chuẩn bị áo khoác dày nhé, đêm trên Đồng Văn khá lạnh!',
      time: '10:12',
      isMe: false,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 2,
      sender: 'Bạn',
      text: 'Đã chuẩn bị đầy đủ rồi nha. Đặt vé thuyền sông Nho Quế thành công luôn rồi!',
      time: '10:15',
      isMe: true
    }
  ],
  'group-2': [
    {
      id: 1,
      sender: 'Minh Thảo',
      text: 'AI đã tính tiền phòng khách sạn chia đều là 450k/người nha.',
      time: 'Hôm qua',
      isMe: false,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80'
    }
  ],
  'direct-sample': [
    {
      id: 1,
      sender: 'Văn Tùng - Travel Blogger',
      text: 'Xin chào! Cảm ơn bạn đã quan tâm đến bài viết trên Wayfare. Bạn muốn hỏi gì về chuyến đi này cứ nhắn cho mình nhé!',
      time: '10:00',
      isMe: false,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 2,
      sender: 'Văn Tùng - Travel Blogger',
      text: 'Lịch trình Đà Nẵng mình có đính kèm trực tiếp trong bài viết, bạn có thể sao chép 1-click vào kho cá nhân nha!',
      time: '10:02',
      isMe: false,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    }
  ]
};

export const FloatingChatWidget = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isLoggedIn, setIsAuthModalOpen, setAuthMode } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState(null); // null means showing threads list
  const [threads, setThreads] = useState(SAMPLE_THREADS);
  const [messagesMap, setMessagesMap] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'direct' | 'group'
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef(null);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (activeThreadId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThreadId, messagesMap]);

  // Hide floating widget if user is currently on the full /messages page
  if (location.pathname === '/messages' || location.pathname.startsWith('/admin')) {
    return null;
  }

  const totalUnread = threads.reduce((acc, t) => acc + (t.unread || 0), 0);

  const handleToggleOpen = () => {
    if (!isLoggedIn) {
      setAuthMode('login');
      setIsAuthModalOpen(true);
      return;
    }
    setIsOpen(prev => !prev);
  };

  const handleOpenThread = (threadId) => {
    setActiveThreadId(threadId);
    // Mark as read
    setThreads(prev =>
      prev.map(t => (t.id === threadId ? { ...t, unread: 0 } : t))
    );
  };

  const handleBackToList = () => {
    setActiveThreadId(null);
  };

  const handleExpandToFullPage = () => {
    setIsOpen(false);
    navigate('/messages');
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeThreadId) return;

    const newMsg = {
      id: Date.now(),
      sender: currentUser?.name || 'Bạn',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    setMessagesMap(prev => ({
      ...prev,
      [activeThreadId]: [...(prev[activeThreadId] || []), newMsg]
    }));

    setThreads(prev =>
      prev.map(t =>
        t.id === activeThreadId
          ? { ...t, lastMsg: inputText.trim(), time: 'Vừa xong' }
          : t
      )
    );

    setInputText('');
  };

  const activeThreadObj = threads.find(t => t.id === activeThreadId);
  const activeMessages = activeThreadId ? messagesMap[activeThreadId] || [] : [];

  const filteredThreads = threads.filter(t => {
    const matchesFilter =
      filterTab === 'all'
        ? true
        : filterTab === 'direct'
        ? t.type === 'DIRECT'
        : t.type === 'GROUP';
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 select-none font-sans">
      {/* Mini Chat Window Box */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[360px] sm:w-[390px] max-w-[calc(100vw-32px)] h-[510px] max-h-[calc(100vh-110px)] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
          {/* Header Bar */}
          <div className="p-3.5 bg-gradient-to-r from-sky-600 via-sky-600 to-blue-600 text-white flex items-center justify-between shadow-xs shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              {activeThreadId ? (
                <>
                  <button
                    type="button"
                    onClick={handleBackToList}
                    className="p-1 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                    title="Quay lại danh sách"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <img
                    src={activeThreadObj?.avatar}
                    alt=""
                    className="w-7 h-7 rounded-xl object-cover ring-1 ring-white/50 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs truncate max-w-[170px] sm:max-w-[200px]">
                      {activeThreadObj?.name}
                    </h4>
                    <span className="text-[10px] text-sky-100 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                      <span>{activeThreadObj?.type === 'DIRECT' ? 'Đang hoạt động' : `${activeThreadObj?.membersCount} thành viên`}</span>
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs tracking-tight">Trò Chuyện & Nhóm Tour</h4>
                    <span className="text-[10px] text-sky-100">Đồng bộ với chuyến đi Wayfare</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions: Full page expand & Minimize/Close */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleExpandToFullPage}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                title="Mở toàn màn hình tại trang Trò chuyện"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                title="Thu nhỏ bong bóng"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body: Threads List or Active Chat Stream */}
          {!activeThreadId ? (
            /* Threads List View */
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
              {/* Search & Tabs */}
              <div className="p-3 space-y-2 border-b border-slate-200/80 bg-white">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm bạn bè hoặc nhóm..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-sky-500 focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl text-[11px] font-bold">
                  <button
                    onClick={() => setFilterTab('all')}
                    className={`flex-1 py-1 rounded-lg text-center transition-all cursor-pointer ${
                      filterTab === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => setFilterTab('direct')}
                    className={`flex-1 py-1 rounded-lg text-center transition-all cursor-pointer ${
                      filterTab === 'direct' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Bạn bè
                  </button>
                  <button
                    onClick={() => setFilterTab('group')}
                    className={`flex-1 py-1 rounded-lg text-center transition-all cursor-pointer ${
                      filterTab === 'group' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Nhóm Tour
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-dropdown-scroll">
                {filteredThreads.map(thread => (
                  <div
                    key={thread.id}
                    onClick={() => handleOpenThread(thread.id)}
                    className="p-2.5 rounded-2xl hover:bg-white border border-transparent hover:border-slate-200/80 hover:shadow-2xs transition-all flex items-center gap-2.5 cursor-pointer"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={thread.avatar}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                      {thread.type === 'DIRECT' ? (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                      ) : (
                        <span className="absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full bg-sky-600 text-white border border-white text-[7px]">
                          <Users className="w-2 h-2" />
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className="font-bold text-xs text-slate-900 truncate">{thread.name}</h5>
                        <span className="text-[10px] text-slate-400 shrink-0">{thread.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{thread.lastMsg}</p>
                    </div>
                    {thread.unread > 0 && (
                      <span className="w-4 h-4 rounded-full bg-sky-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                        {thread.unread}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Active Chat Stream View */
            <div className="flex-1 flex flex-col min-h-0 bg-white">
              {/* Message Bubbles Container */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-dropdown-scroll">
                {activeMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {!msg.isMe && (
                      <img
                        src={msg.avatar || activeThreadObj?.avatar}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                      />
                    )}
                    <div className={`max-w-[80%] space-y-0.5 ${msg.isMe ? 'items-end' : 'items-start'}`}>
                      {!msg.isMe && (
                        <span className="text-[10px] font-bold text-slate-500 px-1">
                          {msg.sender}
                        </span>
                      )}
                      <div
                        className={`p-2.5 rounded-2xl text-xs leading-relaxed ${
                          msg.isMe
                            ? 'bg-sky-600 text-white rounded-tr-none shadow-xs'
                            : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <div className={`flex items-center gap-1 text-[9px] text-slate-400 px-1 ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                        <span>{msg.time}</span>
                        {msg.isMe && <CheckCheck className="w-3 h-3 text-sky-500" />}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="p-2.5 border-t border-slate-100 flex items-center gap-1.5 bg-slate-50/50">
                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white transition-all cursor-pointer active:scale-95 shadow-xs shrink-0"
                  title="Gửi tin nhắn"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Floating Action Bubble (Bong bóng tròn) */}
      <button
        type="button"
        onClick={handleToggleOpen}
        className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl cursor-pointer group hover:scale-105 active:scale-95 ${
          isOpen
            ? 'bg-slate-800 text-white shadow-slate-900/40 ring-4 ring-slate-800/20'
            : 'bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-600 text-white shadow-sky-600/40 ring-4 ring-sky-500/25 hover:shadow-sky-500/50'
        }`}
        title={isOpen ? 'Đóng hộp trò chuyện' : 'Mở bong bóng trò chuyện Wayfare'}
      >
        {isOpen ? (
          <X className="w-6 h-6 transition-transform group-hover:rotate-90 duration-200" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 transition-transform group-hover:scale-110 duration-200" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black border-2 border-white flex items-center justify-center shadow-md animate-bounce">
                {totalUnread}
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
};
