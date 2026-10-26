import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../common/Toast';
import { chatApi, uploadApi } from '../../services/api';
import chatSocket from '../../services/chatSocket';
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
  Loader2,
  Play,
  Pause,
  FileText,
  Download,
  Mic,
  Trash2,
  Route,
  Sparkles,
  Compass
} from 'lucide-react';
import { ItineraryMessageBubble } from '../chat/ItineraryMessageBubble';
import { ItineraryPickerModal } from '../chat/ItineraryPickerModal';

// Official Facebook Messenger SVG Icon
const MessengerIcon = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 28 28" fill="currentColor" className={className}>
    <path d="M14 2C7.373 2 2 6.955 2 13.067c0 3.481 1.745 6.581 4.473 8.528V26l4.24-2.333c1.036.287 2.137.442 3.287.442 6.627 0 12-4.955 12-11.067C26 6.955 20.627 2 14 2zm1.187 14.862l-3.067-3.273-5.986 3.273 6.586-7 3.134 3.273 5.92-3.273-6.587 7z"/>
  </svg>
);

const normalizeVietnamese = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim();
};

// Compact Audio Voice Player for Widget
const AudioMessagePlayer = ({ src, isMe }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const onEnded = () => { setIsPlaying(false); setCurrentTime(0); };
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
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
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleSeek = (e) => {
    const val = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const formatSec = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className={`flex items-center gap-2.5 p-2.5 rounded-2xl min-w-[190px] max-w-[230px] select-none ${
      isMe
        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
        : 'bg-white text-slate-800 border border-slate-200/80 shadow-xs'
    }`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <button
        type="button"
        onClick={togglePlay}
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90 cursor-pointer ${
          isMe
            ? 'bg-white/20 hover:bg-white/30 text-white shadow-xs backdrop-blur-xs'
            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
        }`}
        title={isPlaying ? 'Tạm dừng' : 'Phát tin thoại'}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
      </button>
      <div className="flex-1 space-y-1">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${
            isMe ? 'bg-white/30 accent-white' : 'bg-slate-200 accent-blue-600'
          }`}
        />
        <div className="flex items-center justify-between text-[10px] font-semibold opacity-90 leading-none font-mono">
          <span>{formatSec(currentTime)}</span>
          <span>{duration > 0 ? formatSec(duration) : 'Thoại'}</span>
        </div>
      </div>
    </div>
  );
};

// Compact File Attachment Bubble for Widget
const FileAttachmentBubble = ({ src, isMe }) => {
  const fileName = React.useMemo(() => {
    try {
      const parts = src.split('/');
      const last = parts[parts.length - 1];
      return decodeURIComponent(last.split('?')[0]);
    } catch {
      return 'Tệp tin đính kèm';
    }
  }, [src]);

  return (
    <div className={`flex items-center gap-2.5 p-2.5 rounded-2xl max-w-[220px] ${
      isMe
        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
        : 'bg-white text-slate-800 border border-slate-200/80 shadow-xs'
    }`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
        isMe ? 'bg-white/20 text-white backdrop-blur-xs' : 'bg-blue-50 text-blue-600 border border-blue-100'
      }`}>
        <FileText className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold truncate leading-tight">{fileName}</p>
        <span className="text-[10px] opacity-75">Tệp đính kèm</span>
      </div>
      <a
        href={src}
        download
        target="_blank"
        rel="noopener noreferrer"
        className={`p-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
          isMe ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-100 text-slate-600'
        }`}
        title="Tải tệp tin"
      >
        <Download className="w-3.5 h-3.5" />
      </a>
    </div>
  );
};

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
  const [isItineraryPickerOpen, setIsItineraryPickerOpen] = useState(false);

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

  // Chuẩn hóa xác định người gửi có phải là phiên hiện tại (bản thân) hay không
  const isMessageFromMe = useCallback((msg) => {
    if (!msg) return false;
    if (currentUser?.id && msg.senderId != null) {
      if (String(currentUser.id) === String(msg.senderId)) return true;
    }
    if (msg.senderEmail) {
      const msgEmail = msg.senderEmail.toLowerCase().trim();
      if (currentUser?.email && msgEmail === currentUser.email.toLowerCase().trim()) return true;
      if (effectiveEmail && msgEmail === effectiveEmail.toLowerCase().trim()) return true;
    }
    if (msg.isPending || (typeof msg.id === 'string' && msg.id.startsWith('widget-temp-'))) {
      return true;
    }
    if (msg.isMe !== undefined && msg.isMe !== null) {
      return Boolean(msg.isMe);
    }
    return false;
  }, [currentUser?.id, currentUser?.email, effectiveEmail]);

  // 2. Tải tin nhắn khi mở một phòng chat
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
          if (
            prev.length === normalizedMsgs.length &&
            (prev.length === 0 || prev[prev.length - 1]?.id === normalizedMsgs[normalizedMsgs.length - 1]?.id)
          ) {
            return prev;
          }
          return normalizedMsgs;
        });
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

  // 3. Kết nối STOMP WebSocket nhận tin nhắn tức thì (Zero-Latency)
  useEffect(() => {
    if (!isOpen || !activeThreadId) return;

    const unsubscribe = chatSocket.subscribeToRoom(activeThreadId, (incomingMsg) => {
      if (!incomingMsg) return;

      const isFromMe = isMessageFromMe(incomingMsg);
      const normalizedIncoming = {
        ...incomingMsg,
        isMe: isFromMe
      };

      setMessages(prev => {
        if (prev.some(m => m.id === normalizedIncoming.id)) return prev;

        if (isFromMe) {
          const tempIdx = prev.findIndex(m => m.isPending || (typeof m.id === 'string' && m.id.startsWith('widget-temp-')));
          if (tempIdx !== -1) {
            const next = [...prev];
            next[tempIdx] = normalizedIncoming;
            return next;
          }
        }

        const cleanPrev = prev.filter(m => !(m.isPending && m.content === normalizedIncoming.content));
        return [...cleanPrev, normalizedIncoming];
      });

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

    const interval = setInterval(() => {
      loadMessages(activeThreadId, true);
    }, 5000);

    return () => {
      if (unsubscribe) unsubscribe();
      clearInterval(interval);
    };
  }, [isOpen, activeThreadId, loadMessages, isMessageFromMe]);

  // Quản lý cuộn thông minh trong widget
  const widgetScrollContainerRef = useRef(null);
  const prevWidgetMsgCountRef = useRef(0);
  const isWidgetFirstLoadRef = useRef(true);

  useEffect(() => {
    isWidgetFirstLoadRef.current = true;
    prevWidgetMsgCountRef.current = 0;
  }, [activeThreadId]);

  useEffect(() => {
    const container = widgetScrollContainerRef.current;
    if (!container || !activeThreadId) return;

    const count = messages.length;
    const prevCount = prevWidgetMsgCountRef.current;

    if (isWidgetFirstLoadRef.current && count > 0) {
      isWidgetFirstLoadRef.current = false;
      prevWidgetMsgCountRef.current = count;
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 50);
      return;
    }

    if (count <= prevCount) {
      prevWidgetMsgCountRef.current = count;
      return;
    }

    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
    const latestMsg = messages[messages.length - 1];
    const isSentByMe = isMessageFromMe(latestMsg);
    if (isNearBottom || isSentByMe) {
      setTimeout(() => {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }, 50);
    }

    prevWidgetMsgCountRef.current = count;
  }, [activeThreadId, messages, isMessageFromMe]);

  // Cleanup micro stream khi rời khỏi
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (recordingStreamRef.current) {
        recordingStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const totalUnread = threads.reduce((acc, t) => acc + (t.unread || 0), 0);
  const [isClickAnimating, setIsClickAnimating] = useState(false);

  const handleToggleOpen = () => {
    if (!isLoggedIn) {
      setAuthMode('login');
      setIsAuthModalOpen(true);
      return;
    }
    setIsOpen(prev => !prev);
  };

  const handleToggleOpenWithAnimation = () => {
    setIsClickAnimating(true);
    setTimeout(() => setIsClickAnimating(false), 450);
    handleToggleOpen();
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

    const tempId = 'widget-temp-text-' + Date.now();
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
      const saved = await chatApi.sendMessage(activeThreadId, { content: contentToSend, messageType: 'TEXT' }, effectiveEmail);
      if (saved) {
        const normalizedSaved = {
          ...saved,
          isMe: true
        };
        setMessages(prev => prev.map(m => m.id === tempId ? normalizedSaved : m));
      }
      loadRooms();
    } catch (err) {
      toast.showError('Không thể gửi tin nhắn.');
      setMessages(prev => prev.filter(m => m.id !== tempId));
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
    const isAudio = file.type.startsWith('audio/') ||
      /\.(mp3|wav|ogg|m4a|aac)$/i.test(file.name);
    const isDoc = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|txt)$/i.test(file.name);

    const msgType = isVideo ? 'VIDEO' : isAudio ? 'AUDIO' : isDoc ? 'FILE' : 'IMAGE';

    // Giới hạn 100MB cho video, 25MB cho ảnh/tệp
    const maxMb = isVideo ? 100 : 25;
    if (file.size > maxMb * 1024 * 1024) {
      toast.showError(`Dung lượng tệp tối đa là ${maxMb}MB!`);
      return;
    }

    setIsUploading(true);

    const tempId = 'widget-temp-media-' + Date.now();
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
        const normalizedSaved = {
          ...savedMsg,
          isMe: true
        };
        setMessages(prev => prev.map(m => m.id === tempId ? normalizedSaved : m));
      }
      loadRooms();
      toast.showSuccess(`Đã gửi tệp thành công! 🚀`);
    } catch (err) {
      toast.showError(`Lỗi tải tệp: ${err.message || 'Thử lại sau'}`);
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setIsUploading(false);
    }
  };

  // 4.1 Bắt đầu ghi âm tin nhắn thoại
  const handleStartRecording = async () => {
    if (!activeThreadId) {
      toast.showInfo('Vui lòng chọn một cuộc trò chuyện trước khi ghi âm!');
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

  // 4.2 Dừng và Gửi tin nhắn thoại
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

        const secureUrl = await uploadApi.uploadSingle(voiceFile);
        if (!secureUrl) {
          throw new Error('Máy chủ không phản hồi đường dẫn tệp thoại.');
        }

        const savedMsg = await chatApi.sendMessage(
          activeThreadId,
          { content: secureUrl, messageType: 'AUDIO' },
          effectiveEmail
        );

        if (savedMsg) {
          const normalizedSaved = {
            ...savedMsg,
            isMe: true,
            isPending: false,
            time: 'Vừa xong'
          };
          setMessages(prev => [...prev, normalizedSaved]);
        }

        toast.showSuccess('Đã gửi tin nhắn thoại! 🎙️');
        loadRooms();
      } catch (err) {
        console.error('Lỗi gửi tin nhắn thoại:', err);
        toast.showError('Không thể gửi tin nhắn thoại: ' + err.message);
      } finally {
        setIsUploading(false);
        setIsRecording(false);
        setRecordingDuration(0);
      }
    };

    mediaRecorder.stop();
  };

  // 4.3 Hủy ghi âm
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
  };


  // 5. Gửi Lịch Trình AI vào cuộc trò chuyện
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
    const tempId = 'widget-temp-itin-' + Date.now();
    const tempMsg = {
      id: tempId,
      roomId: activeThreadId,
      senderId: currentUser?.id,
      senderEmail: effectiveEmail,
      senderName: currentUser?.name || 'Bạn',
      senderAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      content,
      messageType: 'ITINERARY',
      time: 'Đang gửi...',
      isMe: true,
      isPending: true
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const savedMsg = await chatApi.sendMessage(
        activeThreadId,
        { content, messageType: 'ITINERARY' },
        effectiveEmail
      );
      if (savedMsg) {
        setMessages(prev => prev.map(m => m.id === tempId ? { ...savedMsg, isMe: true } : m));
      }
      toast.showSuccess('Đã gửi lịch trình vào cuộc trò chuyện! 🗺️');
      loadRooms();
    } catch (err) {
      console.error('Lỗi gửi lịch trình:', err);
      toast.showError('Không thể gửi lịch trình: ' + err.message);
      setMessages(prev => prev.filter(m => m.id !== tempId));
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

    if (!matchesFilter) return false;
    if (!searchQuery.trim()) return true;

    const normQuery = normalizeVietnamese(searchQuery);
    const normName = normalizeVietnamese(t.name);
    const normLastMsg = normalizeVietnamese(t.lastMsg);
    return normName.includes(normQuery) || normLastMsg.includes(normQuery);
  });

  // Hide floating widget if user is currently on the full /messages page or admin portal
  if (location.pathname === '/messages' || location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 select-none font-sans group/widget">
      {/* Mini Chat Window Box */}
      {isOpen && (
        <div className="absolute bottom-16 sm:bottom-20 right-0 w-[370px] sm:w-[410px] max-w-[calc(100vw-32px)] h-[560px] max-h-[calc(100vh-110px)] bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_-15px_rgba(15,23,42,0.28)] border border-slate-100 flex flex-col overflow-hidden ring-1 ring-slate-900/5 transition-all duration-300 animate-in fade-in zoom-in-95">
          
          {/* Header Bar */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white flex items-center justify-between shrink-0 shadow-sm relative overflow-hidden border-b border-white/10">
            {/* Ambient Lighting Accents */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/25 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center gap-2.5 min-w-0 relative z-10">
              {activeThreadId ? (
                <>
                  <button
                    type="button"
                    onClick={handleBackToList}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all cursor-pointer shrink-0"
                    title="Quay lại danh sách"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <img
                    src={activeThreadObj?.avatar || 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=150&q=80'}
                    alt=""
                    className="w-9 h-9 rounded-2xl object-cover ring-2 ring-white/25 shadow-xs shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-white truncate max-w-[170px] sm:max-w-[210px] leading-tight">
                      {activeThreadObj?.name}
                    </h4>
                    <span className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5">
                      {activeThreadObj?.type === 'DIRECT' ? (
                        <>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            activeThreadObj?.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                          }`} />
                          <span className="truncate">{activeThreadObj?.isOnline ? 'Đang hoạt động' : (activeThreadObj?.statusText || 'Ngoại tuyến')}</span>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            navigate('/messages');
                            setIsOpen(false);
                          }}
                          className="hover:underline cursor-pointer font-medium flex items-center gap-1 text-sky-300"
                          title="Xem & quản lý thành viên trên trang tin nhắn"
                        >
                          <Users className="w-3 h-3" />
                          <span>{activeThreadObj?.membersCount || 2} thành viên</span>
                        </button>
                      )}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2.5">
                  <img
                    src="/chaticon.png"
                    alt=""
                    className="w-9 h-9 object-contain drop-shadow-sm shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-white leading-tight">Hỏi đáp chuyến đi</h4>
                    <span className="text-[11px] text-slate-300 mt-0.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>Trợ lý & Đồng hành 24/7</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1 relative z-10">
              <button
                type="button"
                onClick={handleExpandToFullPage}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all cursor-pointer"
                title="Mở toàn màn hình"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all cursor-pointer"
                title="Thu nhỏ"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body: Danh sách phòng hoặc Khung chat */}
          {!activeThreadId ? (
            <div className="flex-1 flex flex-col min-h-0 bg-white">
              {/* Search Bar */}
              <div className="p-3 bg-slate-50/80 border-b border-slate-100">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm cuộc trò chuyện..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-2xl bg-white border border-slate-200/90 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Tabs Filter */}
              <div className="px-3 py-2 bg-slate-50/50 border-b border-slate-100">
                <div className="p-1 bg-slate-200/60 rounded-2xl flex gap-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setFilterTab('all')}
                    className={`flex-1 py-1 rounded-xl text-center transition-all cursor-pointer ${
                      filterTab === 'all' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab('group')}
                    className={`flex-1 py-1 rounded-xl text-center transition-all cursor-pointer ${
                      filterTab === 'group' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Nhóm
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab('direct')}
                    className={`flex-1 py-1 rounded-xl text-center transition-all cursor-pointer ${
                      filterTab === 'direct' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    1-1
                  </button>
                </div>
              </div>

              {/* Threads List */}
              <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 custom-dropdown-scroll">
                {filteredThreads.length === 0 ? (
                  <div className="py-14 text-center text-slate-400 text-xs space-y-2">
                    <MessageCircle className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
                    <p>Chưa có cuộc trò chuyện nào</p>
                  </div>
                ) : (
                  filteredThreads.map(thread => (
                    <div
                      key={thread.id}
                      onClick={() => handleOpenThread(thread.id)}
                      className="p-2.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-150 cursor-pointer flex items-center gap-3"
                    >
                      <div className="relative shrink-0">
                        <img
                          src={thread.avatar}
                          alt=""
                          className="w-11 h-11 rounded-2xl object-cover ring-1 ring-slate-200/80 shadow-2xs"
                        />
                        {thread.type === 'DIRECT' ? (
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white ${
                              thread.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                            title={thread.isOnline ? 'Đang hoạt động' : (thread.statusText || 'Ngoại tuyến')}
                          />
                        ) : (
                          <span className="absolute -bottom-0.5 -right-0.5 p-1 rounded-lg bg-blue-600 text-white ring-2 ring-white text-[8px]">
                            <Users className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h5 className="font-bold text-xs text-slate-800 truncate">{thread.name}</h5>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">{thread.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5 leading-relaxed">{thread.lastMsg}</p>
                      </div>
                      {thread.unread > 0 && (
                        <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-mono font-bold flex items-center justify-center shrink-0 shadow-xs">
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
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
              <div ref={widgetScrollContainerRef} className="flex-1 p-3.5 overflow-y-auto space-y-3 custom-dropdown-scroll">
                {isLoadingMessages ? (
                  <div className="py-14 text-center text-slate-400 text-xs space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                    <p>Đang tải tin nhắn...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-14 text-center text-slate-400 text-xs space-y-2">
                    <Sparkles className="w-6 h-6 mx-auto text-blue-400" />
                    <p>Chưa có tin nhắn nào. Hãy gửi lời chào đầu tiên!</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    if (msg.messageType === 'SYSTEM') {
                      return (
                        <div key={msg.id} className="flex justify-center my-2 px-2">
                          <span className="px-3 py-1 rounded-full bg-slate-200/70 text-slate-600 text-[10px] font-medium text-center shadow-2xs">
                            {msg.content}
                          </span>
                        </div>
                      );
                    }

                    const isMe = isMessageFromMe(msg);
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        {!isMe && (
                          <img
                            src={msg.senderAvatar || activeThreadObj?.avatar}
                            alt=""
                            className="w-7 h-7 rounded-xl object-cover shrink-0 mt-0.5 ring-1 ring-slate-200 shadow-2xs"
                          />
                        )}
                        <div className={`max-w-[78%] space-y-1 flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          {!isMe && (
                            <span className="text-[10px] font-semibold text-slate-500 px-1">{msg.senderName}</span>
                          )}

                          {/* RENDER MEDIA HOẶC TEXT */}
                          {msg.messageType === 'IMAGE' ? (
                            <img
                              src={msg.content}
                              alt="Media"
                              className="max-w-[210px] max-h-52 object-cover rounded-2xl shadow-sm border border-slate-100"
                            />
                          ) : msg.messageType === 'VIDEO' ? (
                            <video
                              controls
                              src={msg.content}
                              className="max-w-[230px] max-h-52 rounded-2xl bg-black shadow-sm"
                            />
                          ) : msg.messageType === 'AUDIO' ? (
                            <AudioMessagePlayer src={msg.content} isMe={isMe} />
                          ) : msg.messageType === 'FILE' ? (
                            <FileAttachmentBubble src={msg.content} isMe={isMe} />
                          ) : msg.messageType === 'ITINERARY' ? (
                            <ItineraryMessageBubble
                              content={msg.content}
                              isMe={isMe}
                              onViewItinerary={(itinData) => {
                                setIsOpen(false);
                                navigate(`/itinerary?id=${itinData.id || ''}`);
                              }}
                            />
                          ) : (
                            <div
                              className={`p-3 rounded-2xl text-xs leading-relaxed break-words ${
                                isMe
                                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs shadow-sm shadow-blue-500/20'
                                  : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/80 shadow-xs'
                              }`}
                            >
                              {msg.content}
                            </div>
                          )}

                          <div className={`flex items-center gap-1 text-[9px] text-slate-400 px-1 font-mono ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <span>{msg.time}</span>
                            {isMe && <CheckCheck className="w-3 h-3 text-blue-500" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Upload Status Bar */}
              {isUploading && (
                <div className="px-4 py-2 bg-blue-50 text-blue-700 text-xs font-medium flex items-center gap-2 border-t border-blue-100">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0" />
                  <span className="truncate">Đang tải tệp lên Cloudinary CDN...</span>
                </div>
              )}

              {/* Form Gửi tin nhắn / Ghi âm tin thoại */}
              {isRecording ? (
                /* Thanh Trạng Thái Đang Ghi Âm Tin Nhắn Thoại */
                <div className="p-3 border-t border-slate-100 flex items-center gap-2 bg-rose-50/80 animate-in fade-in duration-200">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-2xl bg-white border border-rose-200 text-rose-700 min-w-0 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                    <span className="text-xs font-bold text-rose-600 truncate">Đang ghi âm...</span>
                    <span className="font-mono text-xs font-black text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-lg shrink-0">
                      {Math.floor(recordingDuration / 60)}:{String(recordingDuration % 60).padStart(2, '0')}
                    </span>
                    {/* Sóng âm thanh */}
                    <div className="flex items-center gap-0.5 ml-auto shrink-0">
                      <span className="w-0.5 h-2 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-0.5 h-3.5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-0.5 h-2 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.45s]"></span>
                      <span className="w-0.5 h-4 bg-rose-600 rounded-full animate-bounce"></span>
                      <span className="w-0.5 h-2 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.2s]"></span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCancelRecording}
                    className="p-2.5 rounded-2xl bg-white hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-all cursor-pointer shrink-0 border border-slate-200/80 shadow-2xs"
                    title="Hủy ghi âm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleStopAndSendRecording}
                    disabled={isUploading}
                    className="p-2.5 px-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-sm shadow-rose-600/30 cursor-pointer shrink-0 active:scale-95 flex items-center gap-1.5 font-bold text-xs"
                    title="Gửi tin nhắn thoại"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Gửi</span>
                  </button>
                </div>
              ) : (
                /* Thanh Nhập Tin Nhắn Bình Thường Kèm Nút Mic */
                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex items-center gap-1.5 bg-white/95 backdrop-blur-md">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {/* Nút đính kèm */}
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-2xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                    title="Đính kèm ảnh, video hoặc tài liệu"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  {/* Nút Mic Ghi Âm Tin Nhắn Thoại */}
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={handleStartRecording}
                    className="p-2.5 rounded-2xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                    title="Ghi âm tin nhắn thoại"
                  >
                    <Mic className="w-4 h-4 text-rose-500" />
                  </button>

                  {/* Nút Gửi Lịch Trình AI */}
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => setIsItineraryPickerOpen(true)}
                    className="p-2.5 rounded-2xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                    title="Gửi lịch trình du lịch vào cuộc trò chuyện"
                  >
                    <Route className="w-4 h-4 text-blue-600" />
                  </button>

                  <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    disabled={isUploading}
                    className="flex-1 px-3.5 py-2.5 rounded-2xl border border-slate-200/90 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/80 focus:bg-white transition-all placeholder:text-slate-400 min-w-0"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isUploading}
                    className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-600/30 cursor-pointer shrink-0 flex items-center justify-center active:scale-95"
                    title="Gửi tin nhắn"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

        </div>
      )}

      {/* Modal Chọn Lịch Trình AI để gửi */}
      <ItineraryPickerModal
        isOpen={isItineraryPickerOpen}
        onClose={() => setIsItineraryPickerOpen(false)}
        onSelectItinerary={handleSendItinerary}
      />

      {/* Compact Crystal Glass Chat Trigger Button with Click Animation */}
      <div className="relative flex items-center justify-end">
        {/* Subtle Tooltip on Desktop Hover */}
        {!isOpen && (
          <div className="absolute right-full mr-2.5 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-medium shadow-md border border-white/10 whitespace-nowrap opacity-0 group-hover/widget:opacity-100 transition-opacity duration-200 pointer-events-none backdrop-blur-xs">
            <span>Hỏi đáp & Trò chuyện</span>
          </div>
        )}

        {/* Click Shockwave Ripple Burst */}
        {isClickAnimating && (
          <span className="absolute inset-0 rounded-full bg-sky-400/25 animate-ping pointer-events-none" />
        )}

        <button
          type="button"
          onClick={handleToggleOpenWithAnimation}
          className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center cursor-pointer relative active:scale-75 transition-all duration-300 ease-out shrink-0 select-none ${
            isClickAnimating ? 'scale-90' : 'hover:scale-105'
          }`}
          title="Hỏi đáp & Trò chuyện Wayfare"
          aria-label="Trò chuyện Wayfare"
        >
          {/* Smooth Icon Morphing Animation between Crystal Orb and Close X */}
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Crystal Glass Chat Orb */}
            <div
              className={`transition-all duration-300 ease-out transform flex items-center justify-center w-full h-full ${
                isOpen
                  ? 'rotate-90 scale-0 opacity-0 pointer-events-none'
                  : 'rotate-0 scale-100 opacity-100'
              }`}
            >
              <img
                src="/chaticon.png"
                alt="Wayfare Chat"
                className="w-full h-full object-contain"
              />
              <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white shadow-xs" />
            </div>

            {/* Close X Icon */}
            <div
              className={`absolute transition-all duration-300 ease-out transform flex items-center justify-center w-11 h-11 rounded-full bg-slate-900/90 text-white border border-white/20 shadow-lg ${
                isOpen
                  ? 'rotate-0 scale-100 opacity-100'
                  : '-rotate-90 scale-0 opacity-0 pointer-events-none'
              }`}
            >
              <X className="w-5 h-5 stroke-[2.5] drop-shadow-xs" />
            </div>
          </div>

          {/* Unread badge */}
          {totalUnread > 0 && !isOpen && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-black font-mono flex items-center justify-center ring-2 ring-white shadow-sm animate-bounce">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default FloatingChatWidget;
