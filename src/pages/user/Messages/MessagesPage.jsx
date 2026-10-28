import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../components/common/Toast';
import { chatApi, uploadApi } from '../../../services/api';
import chatSocket from '../../../services/chatSocket';
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
  Maximize2,
  Plus,
  Compass,
  Trash2,
  Check,
  UserPlus,
  Crown,
  UserMinus,
  LogOut,
  Shield,
  AlertTriangle,
  Mic,
  Play,
  Pause,
  FileText,
  Download,
  Route
} from 'lucide-react';
import { ItineraryMessageBubble } from '../../../components/chat/ItineraryMessageBubble';
import { ItineraryPickerModal } from '../../../components/chat/ItineraryPickerModal';

// Hàm chuẩn hóa tiếng Việt loại bỏ dấu để tìm kiếm tức thì theo chuỗi con (VD: 'tu' -> khớp 'tùng', 'tg' -> không khớp)
export const normalizeVietnamese = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim();
};

// Trình phát Tin nhắn Thoại Tuỳ biến Thanh lịch
const AudioMessagePlayer = ({ src, isMe }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(e => console.warn('Audio play warning:', e));
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = Number(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const formatSec = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className={`flex items-center gap-2.5 p-2.5 rounded-[6px] min-w-[210px] sm:min-w-[240px] select-none ${
      isMe ? 'bg-clay-600 text-white shadow-none' : 'bg-[#F5F0E6] text-ink-800 border border-ink-200/80'
    }`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90 cursor-pointer ${
          isMe ? 'bg-[#FFFDF8] text-clay-600 hover:bg-clay-50 shadow-none' : 'bg-clay-600 text-white hover:bg-clay-700 shadow-none'
        }`}
        title={isPlaying ? 'Tạm dừng' : 'Phát tin thoại'}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
      </button>

      <div className="flex-1 space-y-1">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-[#EFE8DC]/40 rounded-[5px] appearance-none cursor-pointer accent-clay-500"
        />
        <div className="flex items-center justify-between text-[10px] font-semibold opacity-85 leading-none">
          <span>{formatSec(currentTime)}</span>
          <span>{duration > 0 ? formatSec(duration) : 'Tin thoại'}</span>
        </div>
      </div>
    </div>
  );
};

// Hiển thị Thẻ Tệp Đính Kèm (PDF, Tài liệu, v.v.)
const FileAttachmentBubble = ({ src, isMe }) => {
  const fileName = useMemo(() => {
    try {
      const parts = src.split('/');
      const last = parts[parts.length - 1];
      return decodeURIComponent(last.split('?')[0]);
    } catch {
      return 'Tệp tin đính kèm';
    }
  }, [src]);

  return (
    <div className={`flex items-center gap-3 p-3 rounded-[6px] max-w-xs ${
      isMe ? 'bg-clay-700 text-white shadow-none' : 'bg-[#F5F0E6] text-ink-800 border border-ink-200/80'
    }`}>
      <div className={`w-10 h-10 rounded-[5px] flex items-center justify-center shrink-0 ${
        isMe ? 'bg-[#FFFDF8]/20 text-white' : 'bg-clay-50 text-clay-600 border border-clay-100'
      }`}>
        <FileText className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold truncate">{fileName}</p>
        <span className="text-[10px] opacity-75">Tệp tin chia sẻ</span>
      </div>
      <a
        href={src}
        download
        target="_blank"
        rel="noopener noreferrer"
        className={`p-2 rounded-[5px] transition-all shrink-0 cursor-pointer ${
          isMe ? 'hover:bg-[#FFFDF8]/20 text-white' : 'hover:bg-[#EFE8DC] text-ink-500'
        }`}
        title="Tải tệp tin về máy"
      >
        <Download className="w-4 h-4" />
      </a>
    </div>
  );
};

export const MessagesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
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
  const [isItineraryPickerOpen, setIsItineraryPickerOpen] = useState(false);

  // Modal Tạo Nhóm Mới
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomIntro, setNewRoomIntro] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [userSearchKeyword, setUserSearchKeyword] = useState('');
  const [isLoadingAvailableUsers, setIsLoadingAvailableUsers] = useState(false);

  // Modal Quản Lý Thành Viên Nhóm (Xem danh sách, Kick, Thêm người, Rời nhóm)
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [roomMembers, setRoomMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [membersModalTab, setMembersModalTab] = useState('list'); // 'list' | 'add'
  const [memberActionLoadingId, setMemberActionLoadingId] = useState(null);
  const [confirmKickMember, setConfirmKickMember] = useState(null);
  const [confirmLeaveGroup, setConfirmLeaveGroup] = useState(false);
  const [addMemberSelectedIds, setAddMemberSelectedIds] = useState([]);
  const [addMemberSearchKeyword, setAddMemberSearchKeyword] = useState('');
  const [isSubmittingAddMembers, setIsSubmittingAddMembers] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const recordingStreamRef = useRef(null);

  const effectiveEmail = currentUser?.email || '';

  // Tải danh sách người dùng khả dụng để thêm vào nhóm (hỗ trợ silent update để không giật màn hình khi gõ phím)
  const loadAvailableUsers = useCallback(async (keyword = '', silent = false) => {
    if (!silent) setIsLoadingAvailableUsers(true);
    try {
      const data = await chatApi.getAvailableUsers(keyword, effectiveEmail);
      if (Array.isArray(data)) {
        setAvailableUsers(data);
      }
    } catch (err) {
      console.warn('Lỗi tải danh sách người dùng khả dụng:', err);
    } finally {
      if (!silent) setIsLoadingAvailableUsers(false);
    }
  }, [effectiveEmail]);

  // Tải trước người dùng ngay lập tức khi mở modal tạo nhóm (0ms delay)
  useEffect(() => {
    if (isCreateModalOpen) {
      loadAvailableUsers('', availableUsers.length > 0);
    }
  }, [isCreateModalOpen, loadAvailableUsers]);

  // Đồng bộ tìm kiếm nền phía server khi gõ từ khóa mà không chặn hiển thị danh sách bộ nhớ cục bộ
  useEffect(() => {
    if (isCreateModalOpen && userSearchKeyword.trim()) {
      const timer = setTimeout(() => {
        loadAvailableUsers(userSearchKeyword, true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isCreateModalOpen, userSearchKeyword, loadAvailableUsers]);

  // 1. Tải danh sách phòng chat từ Backend
  const loadRooms = useCallback(async () => {
    try {
      const data = await chatApi.getRooms(effectiveEmail);
      if (Array.isArray(data)) {
        setThreads(data);
        if (data.length > 0) {
          setActiveThreadId(prev => (prev && data.some(r => r.id === prev)) ? prev : data[0].id);
        } else {
          setActiveThreadId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.warn('Lỗi tải danh sách phòng chat:', err.message);
    } finally {
      setIsLoadingRooms(false);
    }
  }, [effectiveEmail]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // Chuẩn hóa xác định người gửi có phải là phiên hiện tại (bản thân) hay không
  const isMessageFromMe = useCallback((msg) => {
    if (!msg) return false;
    // 1. Đối chiếu theo ID người dùng
    if (currentUser?.id && msg.senderId != null) {
      if (String(currentUser.id) === String(msg.senderId)) return true;
    }
    // 2. Đối chiếu theo Email người dùng
    if (msg.senderEmail) {
      const msgEmail = msg.senderEmail.toLowerCase().trim();
      if (currentUser?.email && msgEmail === currentUser.email.toLowerCase().trim()) return true;
      if (effectiveEmail && msgEmail === effectiveEmail.toLowerCase().trim()) return true;
    }
    // 3. Tin nhắn tạm (optimistic / pending) vừa tạo trên giao diện này
    if (msg.isPending || (typeof msg.id === 'string' && msg.id.startsWith('temp-'))) {
      return true;
    }
    // 4. Fallback: Dùng cờ isMe từ REST API nếu không đủ dữ liệu đối soát
    if (msg.isMe !== undefined && msg.isMe !== null) {
      return Boolean(msg.isMe);
    }
    return false;
  }, [currentUser?.id, currentUser?.email, effectiveEmail]);

  // 2. Tải tin nhắn của phòng chat được chọn
  const loadMessages = useCallback(async (roomId, silent = false) => {
    if (!roomId) return;
    if (!silent) setIsLoadingMessages(true);
    try {
      const msgs = await chatApi.getRoomMessages(roomId, effectiveEmail);
      if (Array.isArray(msgs)) {
        const normalizedMsgs = msgs.map(m => ({
          ...m,
          isMe: isMessageFromMe(m)
        }));
        setMessages(prev => {
          // Tránh cập nhật mảng mới nếu danh sách tin nhắn không đổi (chặn kích hoạt useEffect khi polling)
          if (
            prev.length === normalizedMsgs.length &&
            (prev.length === 0 || prev[prev.length - 1]?.id === normalizedMsgs[normalizedMsgs.length - 1]?.id)
          ) {
            return prev;
          }
          return normalizedMsgs;
        });
        setThreads(prev => prev.map(t => (t.id === roomId ? { ...t, unread: 0 } : t)));
        window.dispatchEvent(new CustomEvent('wayfare_chat_updated'));
      }
    } catch (err) {
      console.warn(`Lỗi tải tin nhắn phòng ${roomId}:`, err.message);
    } finally {
      if (!silent) setIsLoadingMessages(false);
    }
  }, [effectiveEmail, isMessageFromMe]);

  useEffect(() => {
    if (activeThreadId) {
      loadMessages(activeThreadId);
    }
  }, [activeThreadId, loadMessages]);

  // 3. Kết nối WebSocket STOMP nhận tin nhắn thời gian thực (Zero-Latency)
  useEffect(() => {
    if (!activeThreadId) return;

    // Đăng ký nhận tin nhắn tức thì từ WebSocket broker /topic/room.{roomId}
    const unsubscribe = chatSocket.subscribeToRoom(activeThreadId, (incomingMsg) => {
      if (!incomingMsg) return;

      const isFromMe = isMessageFromMe(incomingMsg);
      const normalizedIncoming = {
        ...incomingMsg,
        isMe: isFromMe
      };

      setMessages(prev => {
        // Tránh trùng lặp nếu tin nhắn đã có theo ID thật
        if (prev.some(m => m.id === normalizedIncoming.id)) {
          return prev;
        }

        // Nếu là tin nhắn do chính mình gửi, thay thế optimistic temp message tương ứng
        if (isFromMe) {
          const tempIndex = prev.findIndex(m => m.isPending || (typeof m.id === 'string' && m.id.startsWith('temp-')));
          if (tempIndex !== -1) {
            const next = [...prev];
            next[tempIndex] = normalizedIncoming;
            return next;
          }
        }

        // Xóa optimistic message cũ nếu cùng nội dung
        const cleanPrev = prev.filter(m => !(m.isPending && m.content === normalizedIncoming.content));
        return [...cleanPrev, normalizedIncoming];
      });

      // Cập nhật ngay preview tin nhắn cuối trong danh sách phòng
      setThreads(prev => prev.map(t => {
        if (t.id === activeThreadId) {
          const previewText = incomingMsg.messageType === 'IMAGE' ? '[Hình ảnh 📷]' :
                              incomingMsg.messageType === 'VIDEO' ? '[Video 🎬]' : incomingMsg.content;
          return {
            ...t,
            lastMsg: previewText,
            time: incomingMsg.time || 'Vừa xong'
          };
        }
        return t;
      }));
    });

    // Polling phụ dự phòng (chạy mỗi 5 giây phòng khi mất kết nối mạng tạm thời)
    const interval = setInterval(() => {
      loadMessages(activeThreadId, true);
    }, 5000);

    return () => {
      if (unsubscribe) unsubscribe();
      clearInterval(interval);
    };
  }, [activeThreadId, loadMessages, isMessageFromMe]);

  // 4. Quản lý cuộn thông minh trong khung chat (TUYỆT ĐỐI không cuộn toàn bộ trang web window)
  const chatScrollContainerRef = useRef(null);
  const prevMessagesCountRef = useRef(0);
  const isFirstLoadOfRoomRef = useRef(true);

  const scrollToBottom = useCallback((smooth = true) => {
    const container = chatScrollContainerRef.current;
    if (!container) return;
    try {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    } catch {
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  // Đổi phòng -> Đặt lại trạng thái cuộn ban đầu
  useEffect(() => {
    isFirstLoadOfRoomRef.current = true;
    prevMessagesCountRef.current = 0;
  }, [activeThreadId]);

  // Chỉ cuộn khi cần thiết (mở phòng lần đầu, người dùng gửi tin, hoặc đang ở đáy khi có tin nhắn mới)
  useEffect(() => {
    const container = chatScrollContainerRef.current;
    if (!container) return;

    const count = messages.length;
    const prevCount = prevMessagesCountRef.current;

    // Lần tải đầu tiên khi mở phòng: Cuộn tức thì xuống đáy khung chat
    if (isFirstLoadOfRoomRef.current && count > 0) {
      isFirstLoadOfRoomRef.current = false;
      prevMessagesCountRef.current = count;
      setTimeout(() => scrollToBottom(false), 50);
      return;
    }

    // Nếu số lượng tin nhắn không tăng (polling trả về mảng cũ) -> Không làm gì cả
    if (count <= prevCount) {
      prevMessagesCountRef.current = count;
      return;
    }

    // Có tin nhắn mới: Nếu người dùng đang gần đáy hoặc là tin do chính mình gửi -> Cuộn mượt
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 160;
    const latestMsg = messages[messages.length - 1];
    const isSentByMe = isMessageFromMe(latestMsg);

    if (isNearBottom || isSentByMe) {
      setTimeout(() => scrollToBottom(true), 50);
    }

    prevMessagesCountRef.current = count;
  }, [messages, scrollToBottom, isMessageFromMe]);

  // 5. Xử lý mở nhanh cuộc trò chuyện từ Query Params (ví dụ: bấm nút Nhắn tin ở Profile người khác)
  const openingDirectUserIdRef = useRef(null);

  useEffect(() => {
    const targetUserId = searchParams.get('userId');
    if (targetUserId && openingDirectUserIdRef.current !== targetUserId) {
      openingDirectUserIdRef.current = targetUserId;
      (async () => {
        try {
          const room = await chatApi.openDirectRoom(targetUserId, effectiveEmail);
          if (room) {
            setSearchParams({}, { replace: true });
            await loadRooms();
            setActiveThreadId(room.id);
            setShowMobileChat(true);
          }
        } catch (err) {
          console.error('Không thể mở cuộc trò chuyện trực tiếp:', err);
        }
      })();
    }
  }, [searchParams, effectiveEmail, loadRooms, setSearchParams]);

  // Xóa vĩnh viễn một cuộc trò chuyện
  const handleDeleteRoom = async (roomId) => {
    if (!roomId) return;
    const ok = window.confirm('Bạn có chắc chắn muốn xóa cuộc trò chuyện này? Toàn bộ tin nhắn sẽ bị xóa vĩnh viễn.');
    if (!ok) return;

    try {
      await chatApi.deleteRoom(roomId, effectiveEmail);
      toast.showSuccess('Đã xóa cuộc trò chuyện thành công!');
      setActiveThreadId(null);
      setMessages([]);
      await loadRooms();
    } catch (err) {
      toast.showError('Không thể xóa cuộc trò chuyện: ' + err.message);
    }
  };

  // 6. Gửi tin nhắn Text
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!activeThreadId) {
      toast.showInfo('Vui lòng chọn hoặc tạo một cuộc trò chuyện để bắt đầu gửi tin nhắn!');
      return;
    }
    if (!inputText.trim()) return;

    const contentToSend = inputText.trim();
    setInputText('');

    // Optimistic UI update
    const tempId = 'temp-text-' + Date.now();
    const tempMsg = {
      id: tempId,
      roomId: activeThreadId,
      senderId: currentUser?.id,
      senderEmail: effectiveEmail,
      senderName: currentUser?.name || 'Bạn',
      senderAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      content: contentToSend,
      messageType: 'TEXT',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      isPending: true
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const savedMsg = await chatApi.sendMessage(activeThreadId, { content: contentToSend, messageType: 'TEXT' }, effectiveEmail);
      if (savedMsg) {
        const normalizedSaved = {
          ...savedMsg,
          isMe: true
        };
        setMessages(prev => prev.map(m => m.id === tempId ? normalizedSaved : m));
      }
      loadRooms();
    } catch (err) {
      toast.showError('Không thể gửi tin nhắn. Vui lòng thử lại!');
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  // 7. Gửi Tệp đa phương tiện (Ảnh, Video, Audio hoặc Tài liệu lên Đám mây Cloudinary CDN)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!activeThreadId) {
      toast.showInfo('Vui lòng chọn hoặc tạo một cuộc trò chuyện trước khi tải tệp!');
      e.target.value = '';
      return;
    }

    // Reset input để người dùng có thể chọn lại cùng 1 file nếu muốn
    e.target.value = '';

    const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|avi|mkv)$/i.test(file.name);
    const isAudio = file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac)$/i.test(file.name);
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);

    let msgType = 'FILE';
    if (isVideo) msgType = 'VIDEO';
    else if (isAudio) msgType = 'AUDIO';
    else if (isImage) msgType = 'IMAGE';

    // Giới hạn dung lượng: 100MB cho video, 25MB cho ảnh/tệp/audio
    const maxMb = isVideo ? 100 : 25;
    if (file.size > maxMb * 1024 * 1024) {
      toast.showError(`Dung lượng tệp tối đa là ${maxMb}MB!`);
      return;
    }

    setIsUploading(true);
    const typeLabel = isVideo ? 'video' : isAudio ? 'âm thanh' : isImage ? 'hình ảnh' : 'tài liệu';
    setUploadProgressText(`Đang tải ${typeLabel} lên Đám mây CDN...`);

    // Tạo tin nhắn tạm (optimistic preview)
    const tempId = 'temp-media-' + Date.now();
    const localPreviewUrl = URL.createObjectURL(file);
    const tempMsg = {
      id: tempId,
      roomId: activeThreadId,
      senderId: currentUser?.id,
      senderEmail: effectiveEmail,
      senderName: currentUser?.name || 'Bạn',
      senderAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      content: localPreviewUrl,
      messageType: msgType,
      time: 'Đang tải...',
      isMe: true,
      isPending: true
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      // Đẩy tệp lên Cloudinary thông qua Backend
      const secureUrl = await uploadApi.uploadSingle(file);
      if (!secureUrl) {
        throw new Error('Máy chủ đám mây không phản hồi đường dẫn tệp.');
      }

      setUploadProgressText('Đang phát sóng tin nhắn vào cuộc trò chuyện...');

      // Gửi tin nhắn chứa URL CDN
      const savedMsg = await chatApi.sendMessage(
        activeThreadId,
        { content: secureUrl, messageType: msgType },
        effectiveEmail
      );

      if (savedMsg) {
        const normalizedSaved = {
          ...savedMsg,
          isMe: true
        };
        setMessages(prev => prev.map(m => m.id === tempId ? normalizedSaved : m));
      }
      loadRooms();
      toast.showSuccess(`Đã gửi ${typeLabel} thành công! 🚀`);
    } catch (err) {
      console.error('Lỗi tải tệp lên chat:', err);
      toast.showError(`Tải tệp thất bại: ${err.message || 'Vui lòng kiểm tra lại mạng!'}`);
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
    }
  };

  // 7.1 Bắt đầu ghi âm tin nhắn thoại
  const handleStartRecording = async () => {
    if (!activeThreadId) {
      toast.showInfo('Vui lòng chọn hoặc tạo cuộc trò chuyện trước khi ghi âm!');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingStreamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Lỗi mở micro:', err);
      toast.showError('Không thể truy cập Micro. Vui lòng cấp quyền micro cho trình duyệt!');
    }
  };

  // 7.2 Dừng và Gửi tin nhắn thoại
  const handleStopAndSendRecording = async () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    const mediaRecorder = mediaRecorderRef.current;

    mediaRecorder.onstop = async () => {
      try {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (recordingStreamRef.current) {
          recordingStreamRef.current.getTracks().forEach(track => track.stop());
        }

        if (audioBlob.size < 800) {
          toast.showInfo('Bản ghi quá ngắn để gửi.');
          setIsRecording(false);
          setRecordingDuration(0);
          return;
        }

        const voiceFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });

        setIsUploading(true);
        setUploadProgressText('Đang gửi tin nhắn thoại lên Đám mây CDN...');

        const secureUrl = await uploadApi.uploadSingle(voiceFile);
        if (!secureUrl) {
          throw new Error('Máy chủ đám mây không phản hồi đường dẫn tệp thoại.');
        }

        await chatApi.sendMessage(
          activeThreadId,
          { content: secureUrl, messageType: 'AUDIO' },
          effectiveEmail
        );

        toast.showSuccess('Đã gửi tin nhắn thoại thành công! 🎙️');
        await loadMessages(activeThreadId, true);
        await loadRooms();
      } catch (err) {
        console.error('Lỗi gửi tin nhắn thoại:', err);
        toast.showError('Không thể gửi tin nhắn thoại: ' + err.message);
      } finally {
        setIsUploading(false);
        setUploadProgressText('');
        setIsRecording(false);
        setRecordingDuration(0);
      }
    };

    mediaRecorder.stop();
  };

  // 7.3 Hủy ghi âm
  const handleCancelRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recordingStreamRef.current) {
      recordingStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    setRecordingDuration(0);
    audioChunksRef.current = [];
  };

  // 7.4 Gửi Lịch Trình AI vào cuộc trò chuyện
  const handleSendItinerary = async (itin) => {
    if (!activeThreadId) {
      toast.showInfo('Vui lòng chọn một cuộc trò chuyện để gửi lịch trình!');
      return;
    }
    setIsItineraryPickerOpen(false);

    const itinPayload = {
      id: itin.id,
      title: itin.title || 'Lịch trình du lịch',
      destination: itin.destination || 'Việt Nam',
      budgetTotal: itin.budgetTotal || itin.totalBudget || 0,
      duration: itin.duration || (itin.days ? `${itin.days} ngày` : 'Nhiều ngày'),
      coverImageUrl: itin.coverImageUrl || itin.imageUrl || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
      placesCount: itin.placesCount || (Array.isArray(itin.places) ? itin.places.length : 0),
      isAiGenerated: itin.isAiGenerated ?? true
    };

    const content = JSON.stringify(itinPayload);

    try {
      await chatApi.sendMessage(
        activeThreadId,
        { content, messageType: 'ITINERARY' },
        effectiveEmail
      );
      toast.showSuccess('Đã gửi lịch trình vào cuộc trò chuyện! 🗺️');
      await loadMessages(activeThreadId, true);
      await loadRooms();
    } catch (err) {
      console.error('Lỗi gửi lịch trình:', err);
      toast.showError('Không thể gửi lịch trình: ' + err.message);
    }
  };

  // Chọn hoặc bỏ chọn thành viên trong modal tạo nhóm
  const handleToggleUserSelection = (userId) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  // 8. Tạo Nhóm Chat Mới
  const handleCreateGroup = async (e) => {
    e?.preventDefault();
    if (!newRoomName.trim()) {
      toast.showError('Vui lòng nhập tên nhóm trò chuyện!');
      return;
    }

    if (selectedUserIds.length === 0) {
      toast.showError('Một mình không thể tạo nhóm! Vui lòng chọn ít nhất 1 thành viên khác để lập nhóm.');
      return;
    }

    setIsCreatingRoom(true);
    try {
      const room = await chatApi.createRoom({
        name: newRoomName.trim(),
        memberIds: selectedUserIds,
        initialMessage: newRoomIntro.trim() || `Chào mừng mọi người tham gia nhóm ${newRoomName.trim()}!`
      }, effectiveEmail);

      if (room) {
        toast.showSuccess(`Tạo nhóm "${room.name}" thành công với ${selectedUserIds.length + 1} thành viên! 🎉`);
        setIsCreateModalOpen(false);
        setNewRoomName('');
        setNewRoomIntro('');
        setSelectedUserIds([]);
        setUserSearchKeyword('');
        await loadRooms();
        setActiveThreadId(room.id);
        setShowMobileChat(true);
      }
    } catch (err) {
      console.error('Lỗi tạo nhóm chat:', err);
      toast.showError(err.message || 'Không thể tạo nhóm chat. Vui lòng thử lại!');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const currentThreadObj = threads.find(t => t.id === activeThreadId);

  // Lọc trùng lặp tuyệt đối ở Frontend: Cùng 1 người chỉ xuất hiện 1 lần trong danh sách
  const filteredThreads = useMemo(() => {
    const seenDirectNames = new Set();
    const unique = threads.filter(t => {
      if (t.type === 'DIRECT') {
        const key = t.name?.trim().toLowerCase();
        if (seenDirectNames.has(key)) return false;
        seenDirectNames.add(key);
      }
      return true;
    });

    const normSearch = normalizeVietnamese(searchTerm);

    return unique.filter(t => {
      const matchesFilter =
        filterTab === 'all'
          ? true
          : filterTab === 'direct'
          ? t.type === 'DIRECT'
          : t.type === 'GROUP';

      if (!matchesFilter) return false;
      if (!normSearch) return true;

      const normName = normalizeVietnamese(t.name);
      const normLastMsg = normalizeVietnamese(t.lastMsg);
      return normName.includes(normSearch) || normLastMsg.includes(normSearch);
    });
  }, [threads, filterTab, searchTerm]);

  // Lọc tức thì danh sách người dùng khả dụng theo từng ký tự (gõ t hay tu đều ra tùng, tg thì không)
  const filteredAvailableUsers = useMemo(() => {
    if (!userSearchKeyword.trim()) return availableUsers;
    const kw = normalizeVietnamese(userSearchKeyword);
    return availableUsers.filter(u => {
      const name = normalizeVietnamese(u.fullName);
      const handle = normalizeVietnamese(u.handle);
      const email = normalizeVietnamese(u.email);
      return name.includes(kw) || handle.includes(kw) || email.includes(kw);
    });
  }, [availableUsers, userSearchKeyword]);

  // Tải danh sách thành viên của phòng
  const loadRoomMembers = useCallback(async (roomId) => {
    if (!roomId) return;
    setIsLoadingMembers(true);
    try {
      const data = await chatApi.getRoomMembers(roomId, effectiveEmail);
      setRoomMembers(data || []);
    } catch (err) {
      console.warn('Lỗi tải thành viên nhóm:', err);
      if (currentThreadObj?.members) {
        setRoomMembers(currentThreadObj.members);
      }
    } finally {
      setIsLoadingMembers(false);
    }
  }, [effectiveEmail, currentThreadObj]);

  // Mở modal quản lý thành viên
  const handleOpenMembersModal = async () => {
    if (!currentThreadObj || currentThreadObj.type === 'DIRECT') return;
    setIsMembersModalOpen(true);
    setMembersModalTab('list');
    setConfirmKickMember(null);
    setConfirmLeaveGroup(false);
    setAddMemberSelectedIds([]);
    setAddMemberSearchKeyword('');
    await loadRoomMembers(currentThreadObj.id);
  };

  // Kick thành viên khỏi nhóm
  const handleKickMember = async (targetUser) => {
    if (!currentThreadObj) return;
    setMemberActionLoadingId(targetUser.userId);
    try {
      await chatApi.removeMember(currentThreadObj.id, targetUser.userId, effectiveEmail);
      toast.showSuccess(`Đã xóa "${targetUser.fullName}" khỏi nhóm.`);
      setConfirmKickMember(null);
      await loadRoomMembers(currentThreadObj.id);
      await loadRooms();
    } catch (err) {
      console.error('Lỗi xóa thành viên:', err);
      toast.showError(err.message || 'Không thể xóa thành viên khỏi nhóm.');
    } finally {
      setMemberActionLoadingId(null);
    }
  };

  // Tự rời khỏi nhóm
  const handleLeaveGroup = async () => {
    if (!currentThreadObj || !currentUser) return;
    setMemberActionLoadingId(currentUser.id);
    try {
      await chatApi.removeMember(currentThreadObj.id, currentUser.id, effectiveEmail);
      toast.showSuccess('Bạn đã rời khỏi nhóm trò chuyện.');
      setIsMembersModalOpen(false);
      setConfirmLeaveGroup(false);
      setActiveThreadId(null);
      setShowMobileChat(false);
      await loadRooms();
    } catch (err) {
      console.error('Lỗi khi rời nhóm:', err);
      toast.showError(err.message || 'Không thể rời nhóm.');
    } finally {
      setMemberActionLoadingId(null);
    }
  };

  // Thêm thành viên vào nhóm hiện tại
  const handleAddMembersToExistingGroup = async () => {
    if (!currentThreadObj || addMemberSelectedIds.length === 0) return;
    setIsSubmittingAddMembers(true);
    try {
      await chatApi.addMembers(currentThreadObj.id, addMemberSelectedIds, effectiveEmail);
      toast.showSuccess(`Đã thêm ${addMemberSelectedIds.length} thành viên vào nhóm! 🎉`);
      setAddMemberSelectedIds([]);
      setMembersModalTab('list');
      await loadRoomMembers(currentThreadObj.id);
      await loadRooms();
    } catch (err) {
      console.error('Lỗi thêm thành viên:', err);
      toast.showError(err.message || 'Không thể thêm thành viên vào nhóm.');
    } finally {
      setIsSubmittingAddMembers(false);
    }
  };

  const handleToggleAddMemberSelection = (userId) => {
    setAddMemberSelectedIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  // Lọc những người chưa có trong nhóm khi tìm kiếm để thêm vào (bỏ dấu tiếng Việt tức thì)
  const candidateUsersToAdd = useMemo(() => {
    const existingMemberUserIds = new Set(roomMembers.map(m => m.userId));
    const notInRoom = availableUsers.filter(u => !existingMemberUserIds.has(u.userId));
    if (!addMemberSearchKeyword.trim()) return notInRoom;
    const kw = normalizeVietnamese(addMemberSearchKeyword);
    return notInRoom.filter(u => {
      const name = normalizeVietnamese(u.fullName);
      const handle = normalizeVietnamese(u.handle);
      const email = normalizeVietnamese(u.email);
      return name.includes(kw) || handle.includes(kw) || email.includes(kw);
    });
  }, [availableUsers, roomMembers, addMemberSearchKeyword]);

  // Xác định thành viên hiện tại và quyền Trưởng nhóm (OWNER)
  const currentMember = useMemo(() => {
    return roomMembers.find(m => m.userId === currentUser?.id || m.email === effectiveEmail);
  }, [roomMembers, currentUser, effectiveEmail]);

  const isCurrentOwner = currentMember?.role === 'OWNER' || currentThreadObj?.creator?.id === currentUser?.id;

  // Lắng nghe khi chuyển qua tab thêm thành viên, tải sẵn ngay lập tức không làm giật UI
  useEffect(() => {
    if (isMembersModalOpen && membersModalTab === 'add') {
      loadAvailableUsers('', availableUsers.length > 0);
    }
  }, [isMembersModalOpen, membersModalTab, loadAvailableUsers]);

  useEffect(() => {
    if (isMembersModalOpen && membersModalTab === 'add' && addMemberSearchKeyword.trim()) {
      const timer = setTimeout(() => {
        loadAvailableUsers(addMemberSearchKeyword, true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isMembersModalOpen, membersModalTab, addMemberSearchKeyword, loadAvailableUsers]);

  return (
    <div className="messages-page w-full h-[calc(100vh-64px)] sm:h-[calc(100dvh-64px)] bg-[#F8F4EC] text-ink-800 flex flex-col py-3 sm:py-4 px-4 sm:px-6 lg:px-8 xl:px-12 overflow-hidden">
      <div className="w-full max-w-[1700px] mx-auto flex-1 min-h-0 flex flex-col">
      
      {/* Lightbox Xem Ảnh Chi Tiết */}
      {previewMediaUrl && (
        <div
          className="fixed inset-0 z-50 bg-ink-950/95  flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewMediaUrl(null)}
        >
          <button
            onClick={() => setPreviewMediaUrl(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-[#FFFDF8]/20 hover:bg-[#FFFDF8]/30 text-white transition-all cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={previewMediaUrl}
            alt="Ảnh xem chi tiết"
            className="max-w-full max-h-[90vh] rounded-[6px] object-contain shadow-none ring-1 ring-white/10"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      {/* Modal Tạo Nhóm Trò Chuyện Mới */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink-900/55  flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#FFFDF8] rounded-[6px] max-w-lg w-full p-6 shadow-none border border-ink-200 animate-in zoom-in-95 duration-200 space-y-4 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-ink-200/70 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-[6px] bg-clay-100 text-clay-700 flex items-center justify-center shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-ink-800">Tạo nhóm trò chuyện mới</h3>
                  <p className="text-xs text-ink-400">Cùng bạn bè lập đội phượt, trao đổi lịch trình & ảnh/video</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-[5px] hover:bg-[#F5F0E6] text-ink-300 hover:text-ink-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4 overflow-y-auto pr-1 flex-1 custom-dropdown-scroll">
              {/* Tên nhóm */}
              <div>
                <label className="block text-xs font-bold text-ink-600 mb-1.5">Tên nhóm phượt *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đội Phượt Hà Giang 2026, Nhóm Đi Phú Quốc..."
                  value={newRoomName}
                  onChange={e => setNewRoomName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-[5px] border border-ink-200 text-xs focus:ring-2 focus:ring-clay-500/20 focus:border-clay-500 outline-hidden transition-all font-medium"
                />
              </div>

              {/* Thêm thành viên vào nhóm (Bắt buộc tối thiểu 1 người) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-ink-600 flex items-center gap-1.5">
                    <span>Thêm thành viên vào nhóm *</span>
                    <span className="text-[11px] font-normal text-ink-400">(Tối thiểu 1 người khác)</span>
                  </label>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedUserIds.length > 0 ? 'bg-clay-100 text-clay-700' : 'bg-[#F5F0E6] text-ink-400'
                  }`}>
                    Đã chọn: {selectedUserIds.length} người
                  </span>
                </div>

                {/* Huy hiệu các thành viên ĐÃ CHỌN */}
                {selectedUserIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-[#F8F4EC] rounded-[6px] border border-ink-200/70 max-h-24 overflow-y-auto">
                    {selectedUserIds.map(uid => {
                      const userObj = availableUsers.find(u => u.userId === uid);
                      return (
                        <span
                          key={uid}
                          className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-[5px] bg-[#FFFDF8] border border-clay-200 text-ink-800 text-xs font-semibold shadow-none animate-in zoom-in-95 duration-150"
                        >
                          <img
                            src={userObj?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                            alt=""
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span className="text-[11px] truncate max-w-[120px]">{userObj?.fullName || 'Thành viên'}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleUserSelection(uid)}
                            className="text-ink-300 hover:text-rose-500 transition-colors cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Ô tìm kiếm thành viên */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-ink-300 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên hoặc email người dùng..."
                    value={userSearchKeyword}
                    onChange={e => setUserSearchKeyword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-[5px] bg-[#F8F4EC] border border-ink-200 text-xs focus:ring-2 focus:ring-clay-500/20 focus:border-clay-500 outline-hidden transition-all placeholder:text-ink-300"
                  />
                </div>

                {/* Danh sách người dùng khả dụng */}
                <div className="border border-ink-200/80 rounded-[6px] overflow-hidden bg-[#FFFDF8] max-h-44 overflow-y-auto custom-dropdown-scroll divide-y divide-ink-200/70">
                  {isLoadingAvailableUsers && availableUsers.length === 0 ? (
                    <div className="py-6 text-center text-xs text-ink-300 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-clay-600" />
                      <span>Đang tải danh sách thành viên...</span>
                    </div>
                  ) : filteredAvailableUsers.length === 0 ? (
                    <div className="py-6 text-center text-xs text-ink-300">
                      Không tìm thấy người dùng phù hợp
                    </div>
                  ) : (
                    filteredAvailableUsers.map(user => {
                      const isSelected = selectedUserIds.includes(user.userId);
                      return (
                        <div
                          key={user.userId}
                          onClick={() => handleToggleUserSelection(user.userId)}
                          className={`p-2.5 flex items-center justify-between gap-2.5 cursor-pointer transition-colors ${
                            isSelected ? 'bg-clay-50/60' : 'hover:bg-[#F8F4EC]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative shrink-0">
                              <img
                                src={user.avatarUrl}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-ink-200"
                              />
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                  user.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                                }`}
                                title={user.isOnline ? 'Đang hoạt động' : (user.statusText || 'Ngoại tuyến')}
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-ink-800 truncate">{user.fullName}</p>
                                {user.isOnline && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                                    Online
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-ink-300 truncate">
                                {user.handle || user.email} {user.statusText ? `• ${user.statusText}` : ''}
                              </p>
                            </div>
                          </div>

                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                            isSelected
                              ? 'bg-clay-600 border-clay-600 text-white'
                              : 'border-ink-200 hover:border-clay-400'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {selectedUserIds.length === 0 && (
                  <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-1">
                    <span>💡 Nhóm trò chuyện cần ít nhất 2 thành viên trở lên để bắt đầu.</span>
                  </p>
                )}
              </div>

              {/* Tin nhắn mở đầu */}
              <div>
                <label className="block text-xs font-bold text-ink-600 mb-1.5">Tin nhắn mở đầu (tùy chọn)</label>
                <textarea
                  placeholder="Nhập lời chào khởi đầu cho các thành viên trong nhóm..."
                  value={newRoomIntro}
                  onChange={e => setNewRoomIntro(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-[5px] border border-ink-200 text-xs focus:ring-2 focus:ring-clay-500/20 focus:border-clay-500 outline-hidden transition-all resize-none font-medium"
                />
              </div>

              {/* Footer nút hành động */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-ink-200/70">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-[5px] text-xs font-semibold text-ink-500 hover:bg-[#F5F0E6] transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={!newRoomName.trim() || selectedUserIds.length === 0 || isCreatingRoom}
                  className="px-5 py-2.5 rounded-[5px] bg-clay-600 hover:bg-clay-700 text-white text-xs font-bold shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                >
                  {isCreatingRoom && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Tạo nhóm ngay ({selectedUserIds.length + 1} người)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Quản Lý Thành Viên Nhóm (Xem danh sách, Kick, Thêm người, Rời nhóm) */}
      {isMembersModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink-900/55  flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#FFFDF8] rounded-[6px] max-w-lg w-full p-6 shadow-none border border-ink-200 animate-in zoom-in-95 duration-200 space-y-4 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-ink-200/70 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-[6px] bg-clay-100 text-clay-700 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-ink-800 truncate max-w-[280px] sm:max-w-xs">
                    {currentThreadObj?.name}
                  </h3>
                  <p className="text-xs text-ink-400 flex items-center gap-1.5">
                    <span>{roomMembers.length || currentThreadObj?.membersCount || 1} thành viên tham gia</span>
                    {isCurrentOwner && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                        <Crown className="w-2.5 h-2.5 text-amber-600" />
                        <span>Bạn là Trưởng nhóm</span>
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsMembersModalOpen(false);
                  setConfirmKickMember(null);
                  setConfirmLeaveGroup(false);
                }}
                className="p-1.5 rounded-[5px] hover:bg-[#F5F0E6] text-ink-300 hover:text-ink-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab điều hướng: Danh sách thành viên | Thêm thành viên */}
            <div className="flex items-center gap-1.5 p-1 bg-[#F5F0E6] rounded-[5px] text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setMembersModalTab('list')}
                className={`flex-1 py-1.5 rounded-[5px] text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  membersModalTab === 'list'
                    ? 'bg-[#FFFDF8] text-ink-800 shadow-none'
                    : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Thành viên ({roomMembers.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setMembersModalTab('add')}
                className={`flex-1 py-1.5 rounded-[5px] text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  membersModalTab === 'add'
                    ? 'bg-[#FFFDF8] text-clay-700 shadow-none'
                    : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Thêm người mới</span>
              </button>
            </div>

            {/* NỘI DUNG TAB */}
            {membersModalTab === 'list' ? (
              <div className="space-y-3 overflow-y-auto pr-1 flex-1 custom-dropdown-scroll">
                
                {/* Hộp xác nhận Kick thành viên */}
                {confirmKickMember && (
                  <div className="p-3.5 rounded-[6px] bg-rose-50 border border-rose-200 text-xs space-y-2.5 animate-in fade-in duration-150">
                    <div className="flex items-start gap-2 text-rose-800">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Xác nhận xóa thành viên khỏi nhóm?</p>
                        <p className="text-[11px] text-rose-600 mt-0.5">
                          Bạn có chắc chắn muốn kick <b>{confirmKickMember.fullName}</b> ra khỏi nhóm chat này?
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setConfirmKickMember(null)}
                        className="px-3 py-1.5 rounded-[5px] bg-[#FFFDF8] text-ink-600 hover:bg-[#F5F0E6] text-xs font-semibold border border-ink-200 cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={() => handleKickMember(confirmKickMember)}
                        disabled={memberActionLoadingId === confirmKickMember.userId}
                        className="px-3.5 py-1.5 rounded-[5px] bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                      >
                        {memberActionLoadingId === confirmKickMember.userId && (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        )}
                        <span>Xác nhận Kick</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Hộp xác nhận Tự rời nhóm */}
                {confirmLeaveGroup && (
                  <div className="p-3.5 rounded-[6px] bg-amber-50 border border-amber-200 text-xs space-y-2.5 animate-in fade-in duration-150">
                    <div className="flex items-start gap-2 text-amber-800">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Xác nhận rời khỏi nhóm?</p>
                        <p className="text-[11px] text-amber-700 mt-0.5">
                          Bạn sẽ không còn nhận được tin nhắn và truy cập vào nhóm này nữa.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setConfirmLeaveGroup(false)}
                        className="px-3 py-1.5 rounded-[5px] bg-[#FFFDF8] text-ink-600 hover:bg-[#F5F0E6] text-xs font-semibold border border-ink-200 cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={handleLeaveGroup}
                        disabled={memberActionLoadingId === currentUser?.id}
                        className="px-3.5 py-1.5 rounded-[5px] bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                      >
                        {memberActionLoadingId === currentUser?.id && (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        )}
                        <span>Rời khỏi nhóm</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Danh sách thành viên */}
                {isLoadingMembers ? (
                  <div className="py-12 text-center text-xs text-ink-300 flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-clay-600" />
                    <span>Đang tải danh sách thành viên...</span>
                  </div>
                ) : roomMembers.length === 0 ? (
                  <div className="py-12 text-center text-xs text-ink-300">
                    Chưa có thành viên nào
                  </div>
                ) : (
                  <div className="divide-y divide-ink-200/70">
                    {roomMembers.map(member => {
                      const isMe = member.userId === currentUser?.id || member.email === effectiveEmail;
                      const isOwnerRole = member.role === 'OWNER';

                      return (
                        <div
                          key={member.userId}
                          className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-[#F8F4EC] rounded-[6px] transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative shrink-0">
                              <img
                                src={member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                              />
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                  member.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                                }`}
                                title={member.isOnline ? 'Đang hoạt động' : (member.statusText || 'Ngoại tuyến')}
                              />
                              {isOwnerRole && (
                                <span className="absolute -top-1 -right-1 p-0.5 rounded-full bg-amber-500 text-white shadow-none" title="Trưởng nhóm">
                                  <Crown className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs sm:text-sm font-bold text-ink-800 truncate">
                                  {member.fullName}
                                </p>
                                {isMe && (
                                  <span className="text-[10px] font-bold text-clay-600 bg-clay-50 px-1.5 py-0.5 rounded-md border border-clay-100 shrink-0">
                                    Bạn
                                  </span>
                                )}
                                {member.isOnline && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                                    Online
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-ink-300 truncate">
                                {member.handle || member.email} {member.statusText ? `• ${member.statusText}` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Vai trò */}
                            {isOwnerRole ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[5px] bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200 shadow-none">
                                <Crown className="w-3 h-3 text-amber-600" />
                                <span>Trưởng nhóm</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-[5px] bg-[#F5F0E6] text-ink-500 text-[11px] font-medium">
                                Thành viên
                              </span>
                            )}

                            {/* Nút Kick nếu là Trưởng nhóm và đối tượng không phải là chính mình */}
                            {isCurrentOwner && !isMe && (
                              <button
                                type="button"
                                onClick={() => setConfirmKickMember(member)}
                                title="Kick khỏi nhóm"
                                className="p-1.5 rounded-[5px] text-ink-300 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                              >
                                <UserMinus className="w-4 h-4" />
                              </button>
                            )}

                            {/* Nút Rời nhóm cho chính mình */}
                            {isMe && roomMembers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setConfirmLeaveGroup(true)}
                                title="Rời khỏi nhóm này"
                                className="p-1.5 rounded-[5px] text-ink-300 hover:text-amber-600 hover:bg-amber-50 transition-all cursor-pointer"
                              >
                                <LogOut className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* TAB THÊM THÀNH VIÊN VÀO NHÓM HIỆN TẠI */
              <div className="space-y-3.5 overflow-y-auto pr-1 flex-1 custom-dropdown-scroll">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-ink-300 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên hoặc email người dùng..."
                    value={addMemberSearchKeyword}
                    onChange={e => setAddMemberSearchKeyword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-[5px] bg-[#F8F4EC] border border-ink-200 text-xs focus:ring-2 focus:ring-clay-500/20 focus:border-clay-500 outline-hidden transition-all placeholder:text-ink-300"
                  />
                </div>

                {/* Huy hiệu những người đã chọn thêm */}
                {addMemberSelectedIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-clay-50/50 rounded-[6px] border border-clay-100 max-h-24 overflow-y-auto">
                    {addMemberSelectedIds.map(uid => {
                      const userObj = availableUsers.find(u => u.userId === uid);
                      return (
                        <span
                          key={uid}
                          className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-[5px] bg-[#FFFDF8] border border-clay-200 text-ink-800 text-xs font-semibold shadow-none"
                        >
                          <img
                            src={userObj?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                            alt=""
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span className="text-[11px] truncate max-w-[120px]">{userObj?.fullName || 'Thành viên'}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleAddMemberSelection(uid)}
                            className="text-ink-300 hover:text-rose-500 transition-colors cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Danh sách người dùng khả dụng */}
                <div className="border border-ink-200/80 rounded-[6px] overflow-hidden bg-[#FFFDF8] max-h-52 overflow-y-auto custom-dropdown-scroll divide-y divide-ink-200/70">
                  {isLoadingAvailableUsers && availableUsers.length === 0 ? (
                    <div className="py-8 text-center text-xs text-ink-300 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-clay-600" />
                      <span>Đang tải danh sách người dùng...</span>
                    </div>
                  ) : candidateUsersToAdd.length === 0 ? (
                    <div className="py-8 text-center text-xs text-ink-300">
                      Tất cả bạn bè/người dùng phù hợp đã ở trong nhóm
                    </div>
                  ) : (
                    candidateUsersToAdd.map(user => {
                      const isSelected = addMemberSelectedIds.includes(user.userId);
                      return (
                        <div
                          key={user.userId}
                          onClick={() => handleToggleAddMemberSelection(user.userId)}
                          className={`p-2.5 flex items-center justify-between gap-2.5 cursor-pointer transition-colors ${
                            isSelected ? 'bg-clay-50/60' : 'hover:bg-[#F8F4EC]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative shrink-0">
                              <img
                                src={user.avatarUrl}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-ink-200"
                              />
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                  user.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                                }`}
                                title={user.isOnline ? 'Đang hoạt động' : (user.statusText || 'Ngoại tuyến')}
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-ink-800 truncate">{user.fullName}</p>
                                {user.isOnline && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                                    Online
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-ink-300 truncate">
                                {user.handle || user.email} {user.statusText ? `• ${user.statusText}` : ''}
                              </p>
                            </div>
                          </div>

                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                            isSelected
                              ? 'bg-clay-600 border-clay-600 text-white'
                              : 'border-ink-200 hover:border-clay-400'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-200/70">
                  <button
                    type="button"
                    onClick={() => setMembersModalTab('list')}
                    className="px-4 py-2 rounded-[5px] text-xs font-semibold text-ink-500 hover:bg-[#F5F0E6] transition-all cursor-pointer"
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={handleAddMembersToExistingGroup}
                    disabled={addMemberSelectedIds.length === 0 || isSubmittingAddMembers}
                    className="px-5 py-2.5 rounded-[5px] bg-clay-600 hover:bg-clay-700 text-white text-xs font-bold shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                  >
                    {isSubmittingAddMembers && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Thêm vào nhóm ({addMemberSelectedIds.length})</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Khung chat chính - Đồng bộ lề 2 bên mép px-4 sm:px-6 lg:px-8 xl:px-12 và bo viền chuẩn */}
      <div className="flex-1 w-full min-h-0 overflow-hidden grid grid-cols-1 md:grid-cols-12 bg-[#FFFDF8] rounded-[6px] border border-ink-200/80 shadow-xs">

        {/* CỘT TRÁI: Hộp thư */}
        <div className={`md:col-span-5 lg:col-span-4 xl:col-span-3 border-r border-ink-200/70 flex flex-col min-h-0 h-full bg-[#FFFDF8] ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-3.5 sm:p-4 border-b border-ink-200/70 shrink-0 bg-[#FFFDF8]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="font-display text-base sm:text-lg font-bold text-ink-800 truncate">Hộp thư</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5F0E6] text-ink-500 font-semibold border border-ink-200/60 shrink-0">
                  {filteredThreads.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="h-8 px-2.5 sm:px-3 rounded-[5px] bg-clay-600 hover:bg-clay-700 text-[#FFFDF8] text-[11px] font-bold border border-clay-600 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                title="Tạo nhóm trò chuyện mới"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo nhóm</span>
              </button>
            </div>

            <div className="relative mt-3">
              <Search className="w-3.5 h-3.5 text-ink-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm cuộc trò chuyện..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-[5px] bg-[#F8F4EC] border border-ink-200 focus:border-clay-500 focus:bg-[#FFFDF8] text-xs font-medium text-ink-800 outline-none transition-colors placeholder:text-ink-300"
              />
            </div>

            <div className="flex items-center gap-4 mt-3 border-b border-ink-200/70">
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={`pb-2 -mb-px border-b-2 text-[11px] font-bold transition-colors cursor-pointer ${
                  filterTab === 'all'
                    ? 'border-clay-600 text-clay-700'
                    : 'border-transparent text-ink-400 hover:text-ink-800'
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('group')}
                className={`pb-2 -mb-px border-b-2 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  filterTab === 'group'
                    ? 'border-clay-600 text-clay-700'
                    : 'border-transparent text-ink-400 hover:text-ink-800'
                }`}
              >
                <Users className="w-3 h-3" />
                <span>Nhóm</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('direct')}
                className={`pb-2 -mb-px border-b-2 text-[11px] font-bold transition-colors cursor-pointer ${
                  filterTab === 'direct'
                    ? 'border-clay-600 text-clay-700'
                    : 'border-transparent text-ink-400 hover:text-ink-800'
                }`}
              >
                Cá nhân
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 custom-dropdown-scroll">
            {isLoadingRooms ? (
              <div className="py-14 text-center text-ink-300 text-xs space-y-2">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-clay-600" />
                <p>Đang tải cuộc trò chuyện...</p>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="py-14 px-4 text-center text-ink-300 text-xs space-y-3">
                <div className="w-11 h-11 rounded-[6px] bg-clay-50 border border-clay-200 text-clay-700 flex items-center justify-center mx-auto">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <p className="font-bold text-ink-600">Chưa có cuộc trò chuyện</p>
                <p className="text-[10px] leading-relaxed">
                  Tạo nhóm mới hoặc bắt đầu nhắn tin từ một lịch trình.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="h-8 px-3 rounded-[5px] bg-clay-50 border border-clay-300 text-clay-700 text-[10px] font-bold inline-flex items-center gap-1 hover:bg-clay-100 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tạo nhóm</span>
                </button>
              </div>
            ) : (
              filteredThreads.map(thread => (
                <div
                  key={thread.id}
                  onClick={() => {
                    setActiveThreadId(thread.id);
                    setShowMobileChat(true);
                  }}
                  className={`relative p-2.5 rounded-[5px] cursor-pointer transition-colors flex items-center gap-2.5 border ${
                    activeThreadId === thread.id
                      ? 'bg-clay-50 border-clay-200'
                      : 'border-transparent hover:bg-[#F8F4EC]'
                  }`}
                >
                  {activeThreadId === thread.id && (
                    <span className="absolute left-0 top-2.5 bottom-2.5 w-[2px] rounded-full bg-clay-600" />
                  )}

                  <div className="relative shrink-0">
                    <img
                      src={thread.avatar}
                      alt={thread.name}
                      className="w-10 h-10 rounded-full object-cover border border-ink-200/70"
                    />
                    {thread.type === 'DIRECT' ? (
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#FFFDF8] ${
                          thread.isOnline ? 'bg-emerald-500' : 'bg-ink-300'
                        }`}
                        title={thread.isOnline ? 'Đang hoạt động' : (thread.statusText || 'Ngoại tuyến')}
                      />
                    ) : (
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-clay-600 text-[#FFFDF8] border-2 border-[#FFFDF8] flex items-center justify-center" title="Nhóm chuyến đi">
                        <Users className="w-2 h-2" />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-[12px] text-ink-800 truncate">{thread.name}</h4>
                      <span className="text-[9px] text-ink-300 shrink-0">{thread.time}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-[10.5px] text-ink-400 truncate">{thread.lastMsg}</p>
                      {thread.unread > 0 && (
                        <span className="min-w-4 h-4 px-1 rounded-[3px] bg-clay-600 text-[#FFFDF8] text-[9px] font-bold flex items-center justify-center shrink-0">
                          {thread.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CỘT PHẢI: Nội dung hội thoại */}
        <div className={`md:col-span-7 lg:col-span-8 xl:col-span-9 flex flex-col min-h-0 h-full bg-[#FFFDF8] ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          {currentThreadObj ? (
            <>
              {/* Header phòng chat */}
              <div className="px-4 sm:px-5 py-3 border-b border-ink-200/70 flex items-center justify-between gap-2 shrink-0 bg-[#FFFDF8]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => setShowMobileChat(false)}
                    className="md:hidden w-8 h-8 rounded-[5px] border border-ink-200 bg-[#F8F4EC] text-ink-500 hover:text-clay-700 flex items-center justify-center cursor-pointer shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <img
                    src={currentThreadObj?.avatar || 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=150&q=80'}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover border border-ink-200 shrink-0"
                  />

                  <div className="min-w-0">
                    <h3 className="font-bold text-xs sm:text-sm text-ink-800 truncate">
                      {currentThreadObj?.name}
                    </h3>
                    <div className="text-[10px] text-ink-400 flex items-center gap-1.5 mt-0.5 min-w-0">
                      {currentThreadObj?.type === 'DIRECT' ? (
                        currentThreadObj?.isOnline ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Đang hoạt động</span>
                          </span>
                        ) : (
                          <span className="font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-ink-300" />
                            <span>{currentThreadObj?.statusText || 'Ngoại tuyến'}</span>
                          </span>
                        )
                      ) : (
                        <button
                          type="button"
                          onClick={handleOpenMembersModal}
                          className="text-clay-700 hover:text-clay-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Xem danh sách thành viên nhóm"
                        >
                          <Users className="w-3 h-3" />
                          <span>Nhóm chuyến đi</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {currentThreadObj?.type === 'GROUP' && (
                    <button
                      type="button"
                      onClick={handleOpenMembersModal}
                      title="Xem danh sách & quản lý thành viên nhóm"
                      className="h-8 px-2.5 rounded-[5px] bg-[#F8F4EC] hover:bg-clay-50 text-ink-600 hover:text-clay-700 text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 border border-ink-200"
                    >
                      <Users className="w-3.5 h-3.5 text-clay-600" />
                      <span>{currentThreadObj?.membersCount || 1}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteRoom(currentThreadObj.id)}
                    title="Xóa cuộc trò chuyện này"
                    className="w-8 h-8 rounded-[5px] text-ink-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lịch sử tin nhắn */}
              <div ref={chatScrollContainerRef} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 bg-[#F8F4EC] custom-dropdown-scroll">
                {isLoadingMessages ? (
                  <div className="py-20 text-center text-ink-300 text-xs space-y-2">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-clay-600" />
                    <p>Đang tải tin nhắn...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-20 text-center text-ink-300 text-xs space-y-1">
                    <p className="font-bold text-ink-600">Chưa có tin nhắn nào</p>
                    <p>Gửi lời chào hoặc một tấm ảnh để bắt đầu.</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = isMessageFromMe(msg);
                    if (msg.messageType === 'SYSTEM') {
                      return (
                        <div key={msg.id} className="flex justify-center my-1">
                          <span className="px-2.5 py-1 rounded-[5px] bg-[#FFFDF8] border border-ink-200/70 text-ink-400 text-[10px] font-medium flex items-center gap-1.5">
                            <Shield className="w-3 h-3 text-clay-600 shrink-0" />
                            <span>{msg.content}</span>
                            <span className="text-ink-300">· {msg.time}</span>
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        {!isMe && (
                          <img
                            src={msg.senderAvatar || currentThreadObj?.avatar}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover shrink-0 mt-1 border border-ink-200/70"
                          />
                        )}

                        <div className={`max-w-[82%] sm:max-w-[70%] flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                          {!isMe && (
                            <span className="text-[9px] font-bold text-ink-400 px-0.5">
                              {msg.senderName}
                            </span>
                          )}

                          {msg.messageType === 'IMAGE' ? (
                            <div className="relative overflow-hidden rounded-[6px] border border-ink-200/80 bg-[#FFFDF8]">
                              <img
                                src={msg.content}
                                alt="Ảnh chia sẻ"
                                className="max-w-[260px] sm:max-w-xs max-h-64 rounded-[6px] object-cover cursor-pointer"
                                onClick={() => setPreviewMediaUrl(msg.content)}
                              />
                              {msg.isPending && (
                                <div className="absolute inset-0 bg-ink-900/60 flex items-center justify-center text-[#FFFDF8] text-[10px] font-bold gap-1.5">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Đang tải...</span>
                                </div>
                              )}
                            </div>
                          ) : msg.messageType === 'VIDEO' ? (
                            <div className="rounded-[6px] overflow-hidden border border-ink-800 max-w-[280px] sm:max-w-xs bg-ink-950 relative">
                              <video
                                controls
                                src={msg.content}
                                className="w-full max-h-64 object-contain rounded-[6px]"
                                preload="metadata"
                              />
                              {msg.isPending && (
                                <div className="absolute inset-0 bg-ink-900/60 flex items-center justify-center text-[#FFFDF8] text-[10px] font-bold gap-1.5">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Đang tải video...</span>
                                </div>
                              )}
                            </div>
                          ) : msg.messageType === 'AUDIO' ? (
                            <AudioMessagePlayer src={msg.content} isMe={isMe} />
                          ) : msg.messageType === 'FILE' ? (
                            <FileAttachmentBubble src={msg.content} isMe={isMe} />
                          ) : msg.messageType === 'ITINERARY' ? (
                            <ItineraryMessageBubble
                              content={msg.content}
                              isMe={isMe}
                              onViewItinerary={(itinData) => {
                                navigate(`/itinerary?id=${itinData.id || ''}`);
                              }}
                            />
                          ) : (
                            <div
                              className={`px-3.5 py-2.5 rounded-[6px] text-[12px] leading-relaxed break-words border ${
                                isMe
                                  ? 'bg-clay-600 text-[#FFFDF8] border-clay-600'
                                  : 'bg-[#FFFDF8] text-ink-800 border-ink-200/70'
                              }`}
                            >
                              {msg.content}
                            </div>
                          )}

                          <div className="flex items-center gap-1 text-[9px] text-ink-300 px-0.5">
                            <span>{msg.time}</span>
                            {isMe && <CheckCheck className="w-3 h-3 text-clay-600" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Thanh tiến trình tải media */}
              {isUploading && (
                <div className="mx-3 mt-2 p-2.5 rounded-[5px] bg-clay-50 border border-clay-200 flex items-center gap-2 text-[11px] text-clay-800 font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin text-clay-600 shrink-0" />
                  <span className="truncate">{uploadProgressText}</span>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
                onChange={handleFileUpload}
                className="hidden"
              />

              {isRecording ? (
                <div className="border-t border-ink-200/70 p-3 flex items-center gap-2 bg-[#FFFDF8] shrink-0">
                  <div className="flex-1 h-10 min-w-0 flex items-center gap-2 px-3 rounded-[5px] bg-rose-50 border border-rose-200 text-rose-700">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span className="text-[11px] font-bold shrink-0">Đang ghi âm</span>
                    <span className="font-mono text-xs font-black">
                      {Math.floor(recordingDuration / 60)}:{String(recordingDuration % 60).padStart(2, '0')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCancelRecording}
                    className="w-9 h-9 rounded-[5px] bg-[#F8F4EC] hover:bg-rose-50 text-ink-400 hover:text-rose-600 border border-ink-200 hover:border-rose-200 transition-colors cursor-pointer shrink-0 flex items-center justify-center"
                    title="Hủy ghi âm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleStopAndSendRecording}
                    disabled={isUploading}
                    className="h-9 px-3.5 rounded-[5px] bg-clay-600 hover:bg-clay-700 disabled:opacity-40 text-[#FFFDF8] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Gửi</span>
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSendMessage}
                  className="border-t border-ink-200/70 p-3 flex items-center gap-1.5 bg-[#FFFDF8] shrink-0"
                >
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    title="Đính kèm ảnh, video hoặc tệp tài liệu"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-[5px] text-ink-400 hover:text-clay-700 hover:bg-[#F8F4EC] transition-colors cursor-pointer disabled:opacity-40 shrink-0 flex items-center justify-center"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={handleStartRecording}
                    title="Ghi âm tin nhắn thoại"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-[5px] text-ink-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-40 shrink-0 flex items-center justify-center"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => setIsItineraryPickerOpen(true)}
                    title="Gửi lịch trình vào cuộc trò chuyện"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-[5px] text-clay-600 hover:bg-clay-50 transition-colors cursor-pointer disabled:opacity-40 shrink-0 flex items-center justify-center"
                  >
                    <Route className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    placeholder={
                      currentThreadObj?.type === 'DIRECT'
                        ? `Nhắn tin cho ${currentThreadObj.name}...`
                        : 'Nhập tin nhắn...'
                    }
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    disabled={isUploading}
                    className="flex-1 min-w-0 h-10 px-3 rounded-[5px] border border-ink-200 text-xs text-ink-800 outline-none focus:border-clay-500 focus:bg-[#FFFDF8] bg-[#F8F4EC] transition-colors font-medium placeholder:text-ink-300 disabled:opacity-60"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim() || isUploading}
                    className="h-10 px-3 sm:px-4 rounded-[5px] bg-clay-600 hover:bg-clay-700 disabled:opacity-40 disabled:cursor-not-allowed text-[#FFFDF8] text-xs font-bold shrink-0 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Gửi</span>
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4 bg-[#F8F4EC]">
              <div className="w-12 h-12 rounded-[6px] bg-clay-50 border border-clay-200 text-clay-700 flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="max-w-sm space-y-1.5">
                <h3 className="font-display text-lg font-bold text-ink-800">
                  Bắt đầu trò chuyện
                </h3>
                <p className="text-xs text-ink-400 leading-relaxed">
                  Chọn một cuộc trò chuyện ở bên trái, hoặc tạo nhóm mới cho chuyến đi tiếp theo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="h-9 px-4 rounded-[5px] bg-clay-600 hover:bg-clay-700 text-[#FFFDF8] text-xs font-bold border border-clay-600 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo nhóm mới</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Modal Chọn Lịch Trình AI để gửi vào cuộc trò chuyện */}
      <ItineraryPickerModal
        isOpen={isItineraryPickerOpen}
        onClose={() => setIsItineraryPickerOpen(false)}
        onSelectItinerary={handleSendItinerary}
      />
      </div>
    </div>
  );
};

export default MessagesPage;
