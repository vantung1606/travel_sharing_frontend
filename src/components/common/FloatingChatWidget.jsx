import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../common/Toast';
import { chatApi, uploadApi } from '../../services/api';
import {
  MessageCircle,
  X,
  Minus,
  Maximize2,
  Send,
  Search,
  Users,
  ArrowLeft,
  CheckCheck,
  Paperclip,
  Loader2
} from 'lucide-react';

export const FloatingChatWidget = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isLoggedIn, setIsAuthModalOpen, setAuthMode } = useApp();
  const toast = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'direct' | 'group'
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const effectiveEmail = currentUser?.email || 'tung@gmail.com';

  // 1. Tải danh sách phòng khi widget được mở
  const loadRooms = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const data = await chatApi.getRooms(effectiveEmail);
      if (Array.isArray(data)) {
        setThreads(data);
      }
    } catch (err) {
      console.warn('Lỗi tải danh sách phòng chat widget:', err.message);
    }
  }, [effectiveEmail, isLoggedIn]);

  useEffect(() => {
    if (isOpen) {
      loadRooms();
    }
  }, [isOpen, loadRooms]);

  // 2. Tải tin nhắn khi mở một phòng chat
  const loadMessages = useCallback(async (roomId, silent = false) => {
    if (!roomId) return;
    if (!silent) setIsLoadingMessages(true);
    try {
      const msgs = await chatApi.getRoomMessages(roomId, effectiveEmail);
      setMessages(msgs || []);
    } catch (err) {
      console.warn(`Lỗi tải tin nhắn phòng ${roomId}:`, err.message);
    } finally {
      if (!silent) setIsLoadingMessages(false);
    }
  }, [effectiveEmail]);

  useEffect(() => {
    if (activeThreadId) {
      loadMessages(activeThreadId);
    }
  }, [activeThreadId, loadMessages]);

  // 3. Polling ngầm mỗi 3 giây khi đang mở phòng chat
  useEffect(() => {
    if (!isOpen || !activeThreadId) return;
    const interval = setInterval(() => {
      loadMessages(activeThreadId, true);
    }, 3000);
    return () => clearInterval(interval);
  }, [isOpen, activeThreadId, loadMessages]);

  // Auto-scroll
  useEffect(() => {
    if (activeThreadId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThreadId, messages]);

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
    setThreads(prev =>
      prev.map(t => (t.id === threadId ? { ...t, unread: 0 } : t))
    );
  };

  const handleBackToList = () => {
    setActiveThreadId(null);
    setMessages([]);
    loadRooms();
  };

  const handleExpandToFullPage = () => {
    setIsOpen(false);
    navigate('/messages');
  };

  // Gửi tin nhắn Text
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeThreadId) return;

    const contentToSend = inputText.trim();
    setInputText('');

    const tempMsg = {
      id: Date.now(),
      roomId: activeThreadId,
      senderId: currentUser?.id,
      senderName: currentUser?.name || 'Bạn',
      senderAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      content: contentToSend,
      messageType: 'TEXT',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const saved = await chatApi.sendMessage(activeThreadId, { content: contentToSend, messageType: 'TEXT' }, effectiveEmail);
      if (saved) {
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? saved : m));
      }
      loadRooms();
    } catch (err) {
      toast.showError('Không thể gửi tin nhắn.');
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    }
  };

  // Gửi Ảnh hoặc Video lên Cloudinary
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!activeThreadId) {
      toast.showInfo('Vui lòng chọn một cuộc trò chuyện để gửi tệp!');
      e.target.value = '';
      return;
    }

    e.target.value = '';

    const isVideo = file.type.startsWith('video/') ||
      /\.(mp4|mov|webm|avi|mkv)$/i.test(file.name);

    const msgType = isVideo ? 'VIDEO' : 'IMAGE';

    // Giới hạn 100MB cho video, 25MB cho ảnh
    const maxMb = isVideo ? 100 : 25;
    if (file.size > maxMb * 1024 * 1024) {
      toast.showError(`Dung lượng ${isVideo ? 'video' : 'ảnh'} tối đa là ${maxMb}MB!`);
      return;
    }

    setIsUploading(true);

    const tempId = 'widget-temp-' + Date.now();
    const localPreviewUrl = URL.createObjectURL(file);
    const tempMsg = {
      id: tempId,
      roomId: activeThreadId,
      senderId: currentUser?.id,
      senderName: currentUser?.name || 'Bạn',
      senderAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      content: localPreviewUrl,
      messageType: msgType,
      time: 'Đang gửi...',
      isMe: true,
      isPending: true
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const secureUrl = await uploadApi.uploadSingle(file);
      if (!secureUrl) throw new Error('Không nhận được URL từ đám mây.');

      const savedMsg = await chatApi.sendMessage(
        activeThreadId,
        { content: secureUrl, messageType: msgType },
        effectiveEmail
      );

      if (savedMsg) {
        setMessages(prev => prev.map(m => m.id === tempId ? savedMsg : m));
      }
      loadRooms();
      toast.showSuccess(`Đã gửi ${isVideo ? 'video' : 'ảnh'} thành công! 🚀`);
    } catch (err) {
      toast.showError(`Lỗi tải tệp: ${err.message || 'Thử lại sau'}`);
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setIsUploading(false);
    }
  };

  const activeThreadObj = threads.find(t => t.id === activeThreadId);

  const filteredThreads = threads.filter(t => {
    const matchesFilter =
      filterTab === 'all'
        ? true
        : filterTab === 'direct'
        ? t.type === 'DIRECT'
        : t.type === 'GROUP';
    const matchesSearch = t.name?.toLowerCase().includes(searchQuery.toLowerCase());
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
                    src={activeThreadObj?.avatar || 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=150&q=80'}
                    alt=""
                    className="w-7 h-7 rounded-xl object-cover ring-1 ring-white/50 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs truncate max-w-[170px] sm:max-w-[200px]">
                      {activeThreadObj?.name}
                    </h4>
                    <span className="text-[10px] text-sky-100 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                      <span>{activeThreadObj?.type === 'DIRECT' ? 'Đang hoạt động' : `${activeThreadObj?.membersCount || 2} thành viên`}</span>
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs">Tin nhắn Wayfare</h4>
                    <span className="text-[10px] text-sky-100 font-medium">Nhóm & Cá nhân</span>
                  </div>
                </div>
              )}
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleExpandToFullPage}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Mở toàn trang"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Thu nhỏ"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body: Danh sách phòng hoặc Khung chat */}
          {!activeThreadId ? (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
              {/* Search Bar */}
              <div className="p-2.5 pb-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm cuộc trò chuyện..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-hidden transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Tabs Filter */}
              <div className="flex items-center gap-1 px-2.5 pb-2 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setFilterTab('all')}
                  className={`flex-1 py-1 rounded-lg text-center transition-all cursor-pointer ${
                    filterTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('group')}
                  className={`flex-1 py-1 rounded-lg text-center transition-all cursor-pointer ${
                    filterTab === 'group' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Nhóm
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('direct')}
                  className={`flex-1 py-1 rounded-lg text-center transition-all cursor-pointer ${
                    filterTab === 'direct' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  1-1
                </button>
              </div>

              {/* Threads List */}
              <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-dropdown-scroll">
                {filteredThreads.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Chưa có cuộc trò chuyện nào
                  </div>
                ) : (
                  filteredThreads.map(thread => (
                    <div
                      key={thread.id}
                      onClick={() => handleOpenThread(thread.id)}
                      className="p-2.5 rounded-2xl hover:bg-white hover:shadow-xs border border-transparent hover:border-slate-200/80 transition-all cursor-pointer flex items-center gap-2.5"
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
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Khung chat tin nhắn */
            <div className="flex-1 flex flex-col min-h-0 bg-white">
              <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-dropdown-scroll">
                {isLoadingMessages ? (
                  <div className="py-12 text-center text-slate-400 text-xs space-y-1">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-sky-600" />
                    <p>Đang tải tin nhắn...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Chưa có tin nhắn nào. Hãy gửi lời chào đầu tiên!
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {!msg.isMe && (
                        <img
                          src={msg.senderAvatar || activeThreadObj?.avatar}
                          alt=""
                          className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                        />
                      )}
                      <div className={`max-w-[75%] space-y-0.5 flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                        {!msg.isMe && (
                          <span className="text-[9px] font-bold text-slate-400 px-1">{msg.senderName}</span>
                        )}

                        {/* RENDER MEDIA HOẶC TEXT */}
                        {msg.messageType === 'IMAGE' ? (
                          <img
                            src={msg.content}
                            alt="Media"
                            className="max-w-[200px] max-h-48 object-cover rounded-2xl shadow-sm border border-slate-200"
                          />
                        ) : msg.messageType === 'VIDEO' ? (
                          <video
                            controls
                            src={msg.content}
                            className="max-w-[220px] max-h-48 rounded-2xl bg-black"
                          />
                        ) : (
                          <div
                            className={`p-2.5 rounded-2xl text-xs leading-relaxed break-words ${
                              msg.isMe
                                ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-tr-none shadow-xs'
                                : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50'
                            }`}
                          >
                            {msg.content}
                          </div>
                        )}

                        <div className={`flex items-center gap-1 text-[8px] text-slate-400 px-1 ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                          <span>{msg.time}</span>
                          {msg.isMe && <CheckCheck className="w-2.5 h-2.5 text-sky-500" />}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Upload Status Bar */}
              {isUploading && (
                <div className="px-3 py-1.5 bg-sky-50 text-sky-700 text-[11px] font-medium flex items-center gap-1.5 border-t border-sky-100">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600 shrink-0" />
                  <span className="truncate">Đang tải tệp lên Cloudinary CDN...</span>
                </div>
              )}

              {/* Form Gửi tin nhắn */}
              <form onSubmit={handleSendMessage} className="p-2.5 border-t border-slate-100 flex items-center gap-1.5 bg-slate-50/50">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-white transition-all cursor-pointer disabled:opacity-50 shrink-0 border border-slate-200/70"
                  title="Gửi ảnh/video lên Cloud"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                </button>
                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  disabled={isUploading}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white transition-all placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isUploading}
                  className="p-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

        </div>
      )}

      {/* Floating Trigger Circle Button */}
      <button
        type="button"
        onClick={handleToggleOpen}
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-sky-600 via-sky-600 to-blue-500 text-white flex items-center justify-center shadow-xl shadow-sky-600/35 hover:scale-105 active:scale-95 transition-all cursor-pointer relative ring-4 ring-white"
        title="Trò chuyện chuyến đi Wayfare"
      >
        {isOpen ? (
          <X className="w-6 h-6 stroke-[2.5]" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 stroke-[2.5]" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
                {totalUnread}
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
};

export default FloatingChatWidget;
