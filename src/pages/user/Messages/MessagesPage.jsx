import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../components/common/Toast';
import { chatApi, uploadApi } from '../../../services/api';
import {
  MessageSquare,
  Users,
  Send,
  Search,
  ArrowLeft,
  CheckCheck,
  Sparkles,
  Image as ImageIcon,
  Film,
  Paperclip,
  Loader2,
  X,
  Maximize2
} from 'lucide-react';

export const MessagesPage = () => {
  const [searchParams] = useSearchParams();
  const { currentUser } = useApp();
  const toast = useToast();

  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'direct' | 'group'
  const [searchTerm, setSearchTerm] = useState('');
  const [inputText, setInputText] = useState('');
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [previewMediaUrl, setPreviewMediaUrl] = useState(null); // Lightbox for image

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const effectiveEmail = currentUser?.email || 'tung@gmail.com';

  // 1. Tải danh sách phòng chat từ Backend
  const loadRooms = useCallback(async () => {
    try {
      const data = await chatApi.getRooms(effectiveEmail);
      if (Array.isArray(data) && data.length > 0) {
        setThreads(data);
        if (!activeThreadId) {
          setActiveThreadId(data[0].id);
        }
      }
    } catch (err) {
      console.warn('Lỗi tải danh sách phòng chat:', err.message);
    } finally {
      setIsLoadingRooms(false);
    }
  }, [effectiveEmail, activeThreadId]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // 2. Tải tin nhắn của phòng chat được chọn
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

  // 3. Polling ngầm để cập nhật tin nhắn mới mỗi 3 giây
  useEffect(() => {
    if (!activeThreadId) return;
    const interval = setInterval(() => {
      loadMessages(activeThreadId, true);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeThreadId, loadMessages]);

  // 4. Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 5. Xử lý mở nhanh cuộc trò chuyện từ Query Params (ví dụ: bấm nút Nhắn tin ở Profile người khác)
  useEffect(() => {
    const targetUserId = searchParams.get('userId');
    if (targetUserId) {
      (async () => {
        try {
          const room = await chatApi.openDirectRoom(targetUserId, effectiveEmail);
          if (room) {
            await loadRooms();
            setActiveThreadId(room.id);
            setShowMobileChat(true);
          }
        } catch (err) {
          console.error('Không thể mở cuộc trò chuyện trực tiếp:', err);
        }
      })();
    }
  }, [searchParams, effectiveEmail, loadRooms]);

  // 6. Gửi tin nhắn Text
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeThreadId) return;

    const contentToSend = inputText.trim();
    setInputText('');

    // Optimistic UI update
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
      const savedMsg = await chatApi.sendMessage(activeThreadId, { content: contentToSend, messageType: 'TEXT' }, effectiveEmail);
      if (savedMsg) {
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? savedMsg : m));
      }
      loadRooms();
    } catch (err) {
      toast.showError('Không thể gửi tin nhắn. Vui lòng thử lại!');
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    }
  };

  // 7. Gửi Tệp đa phương tiện (Ảnh hoặc Video lên Đám mây Cloudinary)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeThreadId) return;

    // Reset input
    e.target.value = '';

    const isVideo = file.type.startsWith('video/') ||
      file.name.toLowerCase().endsWith('.mp4') ||
      file.name.toLowerCase().endsWith('.mov') ||
      file.name.toLowerCase().endsWith('.webm');

    const msgType = isVideo ? 'VIDEO' : 'IMAGE';

    // Giới hạn dung lượng: 50MB cho video, 10MB cho ảnh
    const maxMb = isVideo ? 50 : 10;
    if (file.size > maxMb * 1024 * 1024) {
      toast.showError(`Dung lượng ${isVideo ? 'video' : 'ảnh'} tối đa là ${maxMb}MB!`);
      return;
    }

    setIsUploading(true);
    setUploadProgressText(`Đang tải ${isVideo ? 'video' : 'hình ảnh'} lên Cloudinary CDN...`);

    try {
      // Đẩy tệp lên Cloudinary thông qua Backend
      const secureUrl = await uploadApi.uploadSingle(file);
      if (!secureUrl) {
        throw new Error('Máy chủ đám mây không phản hồi đường dẫn tệp.');
      }

      setUploadProgressText('Đang phát sóng tin nhắn vào nhóm...');

      // Gửi tin nhắn chứa URL CDN
      const savedMsg = await chatApi.sendMessage(
        activeThreadId,
        { content: secureUrl, messageType: msgType },
        effectiveEmail
      );

      if (savedMsg) {
        setMessages(prev => [...prev, savedMsg]);
      }
      loadRooms();
      toast.showSuccess(`Đã gửi ${isVideo ? 'video' : 'hình ảnh'} thành công lên nhóm! 🚀`);
    } catch (err) {
      console.error('Lỗi tải tệp lên chat:', err);
      toast.showError(`Tải tệp thất bại: ${err.message || 'Vui lòng kiểm tra lại mạng!'}`);
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
    }
  };

  const currentThreadObj = threads.find(t => t.id === activeThreadId) || threads[0];

  const filteredThreads = threads.filter(t => {
    const matchesFilter =
      filterTab === 'all'
        ? true
        : filterTab === 'direct'
        ? t.type === 'DIRECT'
        : t.type === 'GROUP';
    const matchesSearch = t.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 space-y-6">
      
      {/* Lightbox Phóng to ảnh */}
      {previewMediaUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewMediaUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setPreviewMediaUrl(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-sky-400 bg-white/10 rounded-full cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewMediaUrl}
              alt="Preview"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Khung chat chính */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px] sm:min-h-[680px]">
        
        {/* CỘT TRÁI: Danh sách phòng chat (4 Cột) */}
        <div className={`md:col-span-4 lg:col-span-4 border-r border-slate-100 flex flex-col p-4 sm:p-5 bg-slate-50/50 ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-200/70">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sky-600" />
                <span>Trò chuyện</span>
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">Kết nối trực tiếp & Nhóm chuyến đi</p>
            </div>
            <span className="px-2.5 py-1 bg-sky-100/70 text-sky-800 text-[11px] font-bold rounded-full">
              {threads.length} phòng
            </span>
          </div>

          {/* Ô tìm kiếm phòng chat */}
          <div className="relative my-3.5">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm phòng chat, người bạn..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-hidden transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Bộ lọc: Tất cả | Nhóm tour | 1-1 */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl mb-3 text-xs font-semibold">
            <button
              onClick={() => setFilterTab('all')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                filterTab === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterTab('group')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                filterTab === 'group' ? 'bg-white text-sky-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Nhóm</span>
            </button>
            <button
              onClick={() => setFilterTab('direct')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                filterTab === 'direct' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cá nhân
            </button>
          </div>

          {/* Danh sách phòng */}
          <div className="flex-1 overflow-y-auto space-y-1.5 custom-dropdown-scroll pr-1">
            {isLoadingRooms ? (
              <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-sky-600" />
                <p>Đang tải danh sách cuộc trò chuyện...</p>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Không tìm thấy phòng chat nào
              </div>
            ) : (
              filteredThreads.map(thread => (
                <div
                  key={thread.id}
                  onClick={() => {
                    setActiveThreadId(thread.id);
                    setShowMobileChat(true);
                  }}
                  className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${
                    activeThreadId === thread.id
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

        {/* CỘT PHẢI: Khung nhắn tin chi tiết (8 Cột) */}
        <div className={`md:col-span-8 lg:col-span-8 p-4 sm:p-6 flex flex-col justify-between space-y-4 ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Header phòng chat */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setShowMobileChat(false)}
                className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="relative shrink-0">
                <img
                  src={currentThreadObj?.avatar || 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=150&q=80'}
                  alt=""
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover ring-2 ring-sky-100"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
              </div>

              <div className="min-w-0">
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                  {currentThreadObj?.name || 'Đang mở cuộc trò chuyện...'}
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
                      <span>{currentThreadObj?.membersCount || 2} thành viên</span>
                      <span>•</span>
                      <span>Nhóm thảo luận chuyến đi</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Cloud CDN Sẵn Sàng</span>
              </span>
            </div>
          </div>

          {/* Lịch sử tin nhắn */}
          <div className="flex-1 space-y-3.5 max-h-[440px] overflow-y-auto pr-1.5 custom-dropdown-scroll">
            {isLoadingMessages ? (
              <div className="py-24 text-center text-slate-400 text-xs space-y-2">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-sky-600" />
                <p>Đang đồng bộ tin nhắn đám mây...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="py-24 text-center text-slate-400 text-xs space-y-1">
                <p className="font-semibold text-slate-600">Chưa có tin nhắn nào trong phòng</p>
                <p>Gửi tin nhắn hoặc hình ảnh/video đầu tiên để bắt đầu chuyến hành trình!</p>
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {!msg.isMe && (
                    <img
                      src={msg.senderAvatar || currentThreadObj?.avatar}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                    />
                  )}
                  <div className={`max-w-md space-y-1 flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                    {!msg.isMe && (
                      <span className="text-[10px] font-bold text-slate-500 px-1">
                        {msg.senderName}
                      </span>
                    )}

                    {/* RENDER NỘI DUNG TIN NHẮN THEO LOẠI */}
                    {msg.messageType === 'IMAGE' ? (
                      <div className="relative group overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm bg-slate-100">
                        <img
                          src={msg.content}
                          alt="Ảnh chia sẻ"
                          className="max-w-[260px] sm:max-w-xs max-h-64 rounded-2xl object-cover cursor-pointer hover:opacity-95 transition-all"
                          onClick={() => setPreviewMediaUrl(msg.content)}
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 cursor-pointer pointer-events-none">
                          <Maximize2 className="w-4 h-4" />
                          <span>Xem ảnh</span>
                        </div>
                      </div>
                    ) : msg.messageType === 'VIDEO' ? (
                      <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-md max-w-[280px] sm:max-w-xs bg-black">
                        <video
                          controls
                          src={msg.content}
                          className="w-full max-h-64 object-contain rounded-2xl"
                          preload="metadata"
                        />
                      </div>
                    ) : (
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed break-words ${
                          msg.isMe
                            ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-tr-none shadow-sm shadow-sky-600/20'
                            : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
                        }`}
                      >
                        {msg.content}
                      </div>
                    )}

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

          {/* Thanh Upload Media Đang Tiến Hành */}
          {isUploading && (
            <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200/80 flex items-center gap-2.5 text-xs text-sky-700 animate-fade-in font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-sky-600 shrink-0" />
              <span className="flex-1 truncate">{uploadProgressText}</span>
            </div>
          )}

          {/* Form Nhập tin nhắn & Nút Chọn Ảnh/Video */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-3 border-t border-slate-100">
            {/* Input file ẩn hỗ trợ cả Ảnh và Video */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Nút đính kèm ảnh/video lên Cloudinary */}
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              title="Gửi hình ảnh hoặc video lên Cloud"
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-sky-600 hover:border-sky-300 hover:bg-sky-50 transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              placeholder={
                currentThreadObj?.type === 'DIRECT'
                  ? `Nhắn tin cho ${currentThreadObj.name}...`
                  : 'Nhập tin nhắn nhóm chuyến đi (hoặc đính kèm ảnh/video)...'
              }
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              disabled={isUploading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 focus:bg-white transition-all font-medium disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isUploading}
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

export default MessagesPage;
