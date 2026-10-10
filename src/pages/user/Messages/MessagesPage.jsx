import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { MessageSquare, Users, Send, Search, Plus, ArrowLeft, CheckCheck, Sparkles } from 'lucide-react';

const INITIAL_THREADS = [
  {
    id: 'group-1',
    name: 'Nhóm Phượt Hà Giang 3N2Đ (Hội phượt thủ)',
    type: 'GROUP',
    membersCount: 4,
    lastMsg: 'Mọi người nhớ chuẩn bị áo khoác dày nhé, đêm trên Đồng Văn khá lạnh!',
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
  ]
};

export const MessagesPage = () => {
  const [searchParams] = useSearchParams();
  const { currentUser } = useApp();

  const [threads, setThreads] = useState(INITIAL_THREADS);
  const [messagesMap, setMessagesMap] = useState(INITIAL_MESSAGES);
  const [activeThread, setActiveThread] = useState('group-1');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'direct' | 'group'
  const [searchTerm, setSearchTerm] = useState('');
  const [inputText, setInputText] = useState('');

  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeThread, messagesMap]);

  // Handle incoming query params: /messages?userId=...&name=...&avatar=...
  useEffect(() => {
    const targetUserId = searchParams.get('userId');
    const targetName = searchParams.get('name');
    const targetAvatar = searchParams.get('avatar');

    if (targetUserId) {
      const threadId = `direct-${targetUserId}`;
      const newDirectThread = {
        id: threadId,
        name: targetName || `Tác giả #${targetUserId}`,
        type: 'DIRECT',
        partnerId: targetUserId,
        membersCount: 2,
        lastMsg: 'Bắt đầu cuộc trò chuyện mới...',
        time: 'Vừa xong',
        unread: 0,
        avatar: targetAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      };

      setThreads(prev => {
        if (prev.some(t => t.id === threadId)) {
          return prev;
        }
        return [newDirectThread, ...prev];
      });

      // Seed welcome greeting if no existing message history
      setMessagesMap(prev => {
        if (prev[threadId]) return prev;
        return {
          ...prev,
          [threadId]: [
            {
              id: Date.now(),
              sender: targetName || 'Tác giả',
              text: `Xin chào! Cảm ơn bạn đã quan tâm đến bài viết và chia sẻ của mình trên Wayfare. Bạn muốn hỏi kinh nghiệm gì về chuyến đi này cứ nhắn cho mình nhé! 🌿`,
              time: 'Vừa xong',
              isMe: false,
              avatar: targetAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
            }
          ]
        };
      });

      setActiveThread(threadId);
      setShowMobileChat(true);
    }
  }, [searchParams]);

  // Handle sending a new message
  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: currentUser?.name || 'Bạn',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    setMessagesMap(prev => ({
      ...prev,
      [activeThread]: [...(prev[activeThread] || []), newMsg]
    }));

    // Update lastMsg in threads list
    setThreads(prev =>
      prev.map(t =>
        t.id === activeThread
          ? { ...t, lastMsg: inputText.trim(), time: 'Vừa xong' }
          : t
      )
    );

    setInputText('');
  };

  const filteredThreads = threads.filter(t => {
    const matchesFilter =
      filterTab === 'all'
        ? true
        : filterTab === 'direct'
        ? t.type === 'DIRECT'
        : t.type === 'GROUP';
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const currentThreadObj = threads.find(t => t.id === activeThread) || threads[0];
  const currentMessages = messagesMap[activeThread] || [];

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px] sm:min-h-[660px]">
        
        {/* Left Threads Sidebar (4 Columns) */}
        <div className={`md:col-span-4 lg:col-span-4 border-r border-slate-200/80 p-4 space-y-3.5 bg-slate-50/50 flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h2 className="font-extrabold text-base text-slate-900 tracking-tight">Hộp Thư Du Khách</h2>
            </div>
            <button
              onClick={() => alert('Tính năng tạo nhóm chat tour đang được nâng cấp!')}
              className="px-2.5 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200/60 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo Nhóm</span>
            </button>
          </div>

          {/* Search Threads */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm bạn bè hoặc nhóm tour..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15"
            />
          </div>

          {/* Filter Pills (All / 1-1 Direct / Group) */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFilterTab('all')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                filterTab === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterTab('direct')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                filterTab === 'direct' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bạn bè 1-1
            </button>
            <button
              onClick={() => setFilterTab('group')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                filterTab === 'group' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nhóm Tour
            </button>
          </div>

          {/* Threads List */}
          <div className="space-y-1.5 flex-1 overflow-y-auto pr-0.5 custom-dropdown-scroll">
            {filteredThreads.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-1">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold">Chưa có cuộc trò chuyện nào</p>
                <p className="text-[11px] text-slate-400">Hãy nhấn "Nhắn tin" với tác giả bạn thích trên Cộng đồng!</p>
              </div>
            ) : (
              filteredThreads.map(thread => (
                <div
                  key={thread.id}
                  onClick={() => {
                    setActiveThread(thread.id);
                    setShowMobileChat(true);
                  }}
                  className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${
                    activeThread === thread.id
                      ? 'bg-white shadow-md border border-sky-200 ring-2 ring-sky-500/15'
                      : 'hover:bg-slate-100/80 border border-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={thread.avatar}
                      alt={thread.name}
                      className="w-11 h-11 rounded-2xl object-cover ring-1 ring-slate-200"
                    />
                    {thread.type === 'DIRECT' ? (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" title="Trực tuyến" />
                    ) : (
                      <span className="absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full bg-sky-600 text-white border border-white text-[8px]" title="Nhóm tour">
                        <Users className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{thread.name}</h4>
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
              ))
            )}
          </div>
        </div>

        {/* Right Active Chat View (8 Columns) */}
        <div className={`md:col-span-8 lg:col-span-8 p-4 sm:p-6 flex flex-col justify-between space-y-4 ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          {/* Chat Header Bar */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile Back Button */}
              <button
                onClick={() => setShowMobileChat(false)}
                className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="relative shrink-0">
                <img
                  src={currentThreadObj?.avatar}
                  alt=""
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover ring-2 ring-sky-100"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
              </div>

              <div className="min-w-0">
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                  {currentThreadObj?.name}
                </h3>
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                  {currentThreadObj?.type === 'DIRECT' ? (
                    <>
                      <span className="text-emerald-600 font-bold">● Đang hoạt động</span>
                      <span>•</span>
                      <span>Hội thoại 1-1 trực tiếp</span>
                    </>
                  ) : (
                    <>
                      <span>{currentThreadObj?.membersCount} thành viên</span>
                      <span>•</span>
                      <span>Nhóm đồng bộ tour AI</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold border border-sky-100 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Trực tiếp</span>
              </span>
            </div>
          </div>

          {/* Messages History */}
          <div className="flex-1 space-y-3.5 max-h-[420px] overflow-y-auto pr-1.5 custom-dropdown-scroll">
            {currentMessages.length === 0 ? (
              <div className="py-20 text-center text-slate-400 text-xs space-y-1">
                <p className="font-semibold text-slate-600">Chưa có tin nhắn nào trong cuộc trò chuyện</p>
                <p>Hãy gửi lời chào đầu tiên để kết nối cùng người bạn này!</p>
              </div>
            ) : (
              currentMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {!msg.isMe && (
                    <img
                      src={msg.avatar || currentThreadObj?.avatar}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                    />
                  )}
                  <div className={`max-w-md space-y-0.5 ${msg.isMe ? 'items-end' : 'items-start'}`}>
                    {!msg.isMe && (
                      <span className="text-[10px] font-bold text-slate-500 px-1">
                        {msg.sender}
                      </span>
                    )}
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.isMe
                          ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-tr-none shadow-sm shadow-sky-600/20'
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
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-3 border-t border-slate-100">
            <input
              type="text"
              placeholder={
                currentThreadObj?.type === 'DIRECT'
                  ? `Nhắn tin cho ${currentThreadObj.name}...`
                  : 'Nhập tin nhắn nhóm chuyến đi...'
              }
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 focus:bg-white transition-all font-medium"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2.5 rounded-xl text-white text-xs font-bold shrink-0 shadow-md shadow-sky-600/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
