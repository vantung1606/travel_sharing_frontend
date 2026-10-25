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
  Sparkles
} from 'lucide-react';
import { ItineraryMessageBubble } from '../chat/ItineraryMessageBubble';
import { ItineraryPickerModal } from '../chat/ItineraryPickerModal';

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
    <div className={`flex items-center gap-2 p-2 rounded-[5px] min-w-[180px] max-w-[210px] select-none ${
      isMe ? 'bg-clay-600 text-white shadow-2xs' : 'bg-[#F8F4EC] text-ink-800 border border-ink-200/80'
    }`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <button
        type="button"
        onClick={togglePlay}
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90 cursor-pointer ${
          isMe ? 'bg-[#FFFDF8] text-clay-700 hover:bg-clay-50 shadow-2xs' : 'bg-clay-600 text-white hover:bg-clay-700 shadow-2xs'
        }`}
        title={isPlaying ? 'Tạm dừng' : 'Phát tin thoại'}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
      </button>
      <div className="flex-1 space-y-0.5">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-ink-200/60 rounded-lg appearance-none cursor-pointer accent-clay-500"
        />
        <div className="flex items-center justify-between text-[9px] font-semibold opacity-85 leading-none font-mono">
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
    <div className={`flex items-center gap-2 p-2 rounded-[5px] max-w-[210px] ${
      isMe ? 'bg-clay-700 text-white shadow-2xs' : 'bg-[#F8F4EC] text-ink-800 border border-ink-200/80'
    }`}>
      <div className={`w-7 h-7 rounded-[4px] flex items-center justify-center shrink-0 ${
        isMe ? 'bg-white/20 text-white' : 'bg-clay-50 text-clay-700 border border-clay-200/60'
      }`}>
        <FileText className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold truncate leading-tight">{fileName}</p>
        <span className="text-[8px] opacity-75 font-serif">Tệp đính kèm</span>
      </div>
      <a
        href={src}
        download
        target="_blank"
        rel="noopener noreferrer"
        className={`p-1.5 rounded-[4px] transition-all shrink-0 cursor-pointer ${
          isMe ? 'hover:bg-white/20 text-white' : 'hover:bg-ink-200/60 text-ink-600'
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
        <div className="absolute bottom-16 sm:bottom-20 right-0 w-[360px] sm:w-[390px] max-w-[calc(100vw-32px)] h-[520px] max-h-[calc(100vh-110px)] bg-[#FFFDF8] rounded-[6px] shadow-2xl border border-ink-200/80 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 ring-1 ring-ink-950/10">
          
          {/* Header Bar */}
          <div className="p-3.5 bg-gradient-to-r from-ink-950 via-ink-900 to-clay-950 text-white flex items-center justify-between shadow-xs shrink-0 border-b border-ink-700/60">
            <div className="flex items-center gap-2 min-w-0">
              {activeThreadId ? (
                <>
                  <button
                    type="button"
                    onClick={handleBackToList}
                    className="p-1 rounded-[4px] hover:bg-white/10 text-ink-300 hover:text-white transition-colors cursor-pointer"
                    title="Quay lại danh sách"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <img
                    src={activeThreadObj?.avatar || 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=150&q=80'}
                    alt=""
                    className="w-7 h-7 rounded-[4px] object-cover ring-1 ring-white/30 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-display font-black text-xs text-white truncate max-w-[170px] sm:max-w-[200px]">
                      {activeThreadObj?.name}
                    </h4>
                    <span className="text-[10px] text-ink-300 font-serif flex items-center gap-1">
                      {activeThreadObj?.type === 'DIRECT' ? (
                        <>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            activeThreadObj?.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-ink-400'
                          }`} />
                          <span>{activeThreadObj?.isOnline ? 'Đang hoạt động' : (activeThreadObj?.statusText || 'Ngoại tuyến')}</span>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            navigate('/messages');
                            setIsOpen(false);
                          }}
                          className="hover:underline cursor-pointer font-bold flex items-center gap-0.5 text-clay-300"
                          title="Xem & quản lý thành viên trên trang tin nhắn"
                        >
                          <span>{activeThreadObj?.membersCount || 2} thành viên</span>
                        </button>
                      )}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[4px] bg-clay-500/20 border border-clay-400/30 flex items-center justify-center font-bold text-clay-300">
                    <MessageCircle className="w-4 h-4 text-clay-300" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-xs text-white">Tin nhắn Wayfare</h4>
                    <span className="text-[10px] text-ink-300 font-serif">Nhóm & Cá nhân</span>
                  </div>
                </div>
              )}
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleExpandToFullPage}
                className="p-1.5 rounded-[4px] hover:bg-white/10 text-ink-300 hover:text-white transition-colors cursor-pointer"
                title="Mở toàn trang"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-[4px] hover:bg-white/10 text-ink-300 hover:text-white transition-colors cursor-pointer"
                title="Thu nhỏ"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body: Danh sách phòng hoặc Khung chat */}
          {!activeThreadId ? (
            <div className="flex-1 flex flex-col min-h-0 bg-[#FFFDF8]">
              {/* Search Bar */}
              <div className="p-2.5 pb-2 bg-[#F8F4EC] border-b border-ink-200/80">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm cuộc trò chuyện..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-[5px] bg-[#FFFDF8] border border-ink-200/80 text-xs text-ink-800 placeholder-ink-400 focus:ring-1 focus:ring-clay-500/20 focus:border-clay-500 outline-hidden transition-all"
                  />
                </div>
              </div>

              {/* Tabs Filter */}
              <div className="flex items-center gap-1 px-2.5 py-2 bg-[#F8F4EC]/60 border-b border-ink-200/60 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setFilterTab('all')}
                  className={`flex-1 py-1 rounded-[4px] text-center transition-all cursor-pointer ${
                    filterTab === 'all' ? 'bg-[#FFFDF8] text-ink-800 border border-ink-200/80 shadow-2xs font-bold' : 'text-ink-500 hover:text-ink-800'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('group')}
                  className={`flex-1 py-1 rounded-[4px] text-center transition-all cursor-pointer ${
                    filterTab === 'group' ? 'bg-[#FFFDF8] text-clay-700 border border-ink-200/80 shadow-2xs font-bold' : 'text-ink-500 hover:text-ink-800'
                  }`}
                >
                  Nhóm
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('direct')}
                  className={`flex-1 py-1 rounded-[4px] text-center transition-all cursor-pointer ${
                    filterTab === 'direct' ? 'bg-[#FFFDF8] text-ink-800 border border-ink-200/80 shadow-2xs font-bold' : 'text-ink-500 hover:text-ink-800'
                  }`}
                >
                  1-1
                </button>
              </div>

              {/* Threads List */}
              <div className="flex-1 overflow-y-auto px-2 py-1.5 space-y-1 custom-dropdown-scroll">
                {filteredThreads.length === 0 ? (
                  <div className="py-12 text-center text-ink-400 text-xs font-serif">
                    Chưa có cuộc trò chuyện nào
                  </div>
                ) : (
                  filteredThreads.map(thread => (
                    <div
                      key={thread.id}
                      onClick={() => handleOpenThread(thread.id)}
                      className="p-2.5 rounded-[5px] hover:bg-[#F8F4EC] border border-transparent hover:border-ink-200/80 transition-all cursor-pointer flex items-center gap-2.5"
                    >
                      <div className="relative shrink-0">
                        <img
                          src={thread.avatar}
                          alt=""
                          className="w-10 h-10 rounded-[5px] object-cover ring-1 ring-ink-200/80"
                        />
                        {thread.type === 'DIRECT' ? (
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[#FFFDF8] ${
                              thread.isOnline ? 'bg-emerald-500' : 'bg-ink-300'
                            }`}
                            title={thread.isOnline ? 'Đang hoạt động' : (thread.statusText || 'Ngoại tuyến')}
                          />
                        ) : (
                          <span className="absolute -bottom-0.5 -right-0.5 p-0.5 rounded-[3px] bg-clay-600 text-white border border-[#FFFDF8] text-[7px]">
                            <Users className="w-2 h-2" />
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h5 className="font-display font-bold text-xs text-ink-800 truncate">{thread.name}</h5>
                          <span className="text-[10px] text-ink-400 font-mono shrink-0">{thread.time}</span>
                        </div>
                        <p className="text-[11px] text-ink-500 truncate mt-0.5 font-serif">{thread.lastMsg}</p>
                      </div>
                      {thread.unread > 0 && (
                        <span className="w-4 h-4 rounded-[3px] bg-clay-600 text-white text-[9px] font-mono font-bold flex items-center justify-center shrink-0">
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
            <div className="flex-1 flex flex-col min-h-0 bg-[#FFFDF8]">
              <div ref={widgetScrollContainerRef} className="flex-1 p-3 overflow-y-auto space-y-3 custom-dropdown-scroll">
                {isLoadingMessages ? (
                  <div className="py-12 text-center text-ink-400 text-xs space-y-1">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-clay-600" />
                    <p className="font-serif">Đang tải tin nhắn...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center text-ink-400 text-xs font-serif">
                    Chưa có tin nhắn nào. Hãy gửi lời chào đầu tiên!
                  </div>
                ) : (
                  messages.map(msg => {
                    if (msg.messageType === 'SYSTEM') {
                      return (
                        <div key={msg.id} className="flex justify-center my-1.5 px-2">
                          <span className="px-2.5 py-1 rounded-[4px] bg-[#F8F4EC] text-ink-500 text-[10px] font-serif border border-ink-200/60 text-center">
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
                            className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5 ring-1 ring-ink-200"
                          />
                        )}
                      <div className={`max-w-[75%] space-y-0.5 flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {!isMe && (
                          <span className="text-[9px] font-bold text-ink-400 px-1 font-display">{msg.senderName}</span>
                        )}

                        {/* RENDER MEDIA HOẶC TEXT */}
                        {msg.messageType === 'IMAGE' ? (
                          <img
                            src={msg.content}
                            alt="Media"
                            className="max-w-[200px] max-h-48 object-cover rounded-[5px] shadow-2xs border border-ink-200/80"
                          />
                        ) : msg.messageType === 'VIDEO' ? (
                          <video
                            controls
                            src={msg.content}
                            className="max-w-[220px] max-h-48 rounded-[5px] bg-black"
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
                            className={`p-2.5 rounded-[6px] text-xs leading-relaxed break-words ${
                              isMe
                                ? 'bg-clay-600 text-white rounded-tr-[1px] shadow-2xs'
                                : 'bg-[#F8F4EC] text-ink-800 rounded-tl-[1px] border border-ink-200/80 font-serif'
                            }`}
                          >
                            {msg.content}
                          </div>
                        )}

                        <div className={`flex items-center gap-1 text-[8px] text-ink-400 px-1 font-mono ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <span>{msg.time}</span>
                          {isMe && <CheckCheck className="w-2.5 h-2.5 text-clay-600" />}
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
                <div className="px-3 py-1.5 bg-clay-50 text-clay-800 text-[11px] font-medium flex items-center gap-1.5 border-t border-clay-200/60 font-serif">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-clay-600 shrink-0" />
                  <span className="truncate">Đang tải tệp lên Cloudinary CDN...</span>
                </div>
              )}

              {/* Form Gửi tin nhắn / Ghi âm tin thoại */}
              {isRecording ? (
                /* Thanh Trạng Thái Đang Ghi Âm Tin Nhắn Thoại */
                <div className="p-2.5 border-t border-ink-200/80 flex items-center gap-1.5 bg-rose-50/70 animate-in fade-in duration-200">
                  <div className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-[5px] bg-[#FFFDF8] border border-rose-200 text-rose-700 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                    <span className="text-[11px] font-bold text-rose-600 truncate">Đang ghi âm...</span>
                    <span className="font-mono text-[11px] font-black text-rose-700 bg-rose-100/70 px-1.5 py-0.2 rounded-[3px] shrink-0">
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
                    className="p-2 rounded-[5px] bg-[#FFFDF8] hover:bg-rose-100 text-ink-500 hover:text-rose-600 transition-all cursor-pointer shrink-0 border border-ink-200/80"
                    title="Hủy ghi âm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleStopAndSendRecording}
                    disabled={isUploading}
                    className="p-2 px-3 rounded-[5px] bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-2xs cursor-pointer shrink-0 active:scale-95 flex items-center gap-1 font-bold text-xs"
                    title="Gửi tin nhắn thoại"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Gửi</span>
                  </button>
                </div>
              ) : (
                /* Thanh Nhập Tin Nhắn Bình Thường Kèm Nút Mic */
                <form onSubmit={handleSendMessage} className="p-2.5 border-t border-ink-200/80 flex items-center gap-1.5 bg-[#F8F4EC]">
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
                    className="p-2 rounded-[5px] text-ink-600 hover:text-clay-700 hover:bg-[#FFFDF8] transition-all cursor-pointer disabled:opacity-50 shrink-0 border border-ink-200/80 bg-[#FFFDF8]"
                    title="Đính kèm ảnh, video hoặc tài liệu"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                  </button>

                  {/* Nút Mic Ghi Âm Tin Nhắn Thoại */}
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={handleStartRecording}
                    className="p-2 rounded-[5px] text-ink-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all cursor-pointer disabled:opacity-50 shrink-0 border border-ink-200/80 bg-[#FFFDF8]"
                    title="Ghi âm tin nhắn thoại"
                  >
                    <Mic className="w-3.5 h-3.5 text-rose-500" />
                  </button>

                  {/* Nút Gửi Lịch Trình AI */}
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => setIsItineraryPickerOpen(true)}
                    className="p-2 rounded-[5px] text-ink-600 hover:text-clay-700 hover:bg-clay-50 hover:border-clay-300 transition-all cursor-pointer disabled:opacity-50 shrink-0 border border-ink-200/80 bg-[#FFFDF8]"
                    title="Gửi lịch trình du lịch vào cuộc trò chuyện"
                  >
                    <Route className="w-3.5 h-3.5 text-clay-600" />
                  </button>

                  <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    disabled={isUploading}
                    className="flex-1 px-3 py-1.5 rounded-[5px] border border-ink-200/80 text-xs outline-hidden focus:ring-1 focus:ring-clay-500/20 focus:border-clay-500 bg-[#FFFDF8] transition-all placeholder:text-ink-400 min-w-0"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isUploading}
                    className="p-2 rounded-[5px] bg-clay-600 hover:bg-clay-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer shrink-0"
                    title="Gửi tin nhắn"
                  >
                    <Send className="w-3.5 h-3.5" />
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

      {/* Floating Trigger Circle Button with Paper-Ink-Clay Aesthetics */}
      <div className="relative flex items-center justify-end">
        {/* Tooltip Tag on Hover (Desktop) */}
        {!isOpen && (
          <div className="absolute right-full mr-3 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-ink-950/95 text-ink-100 text-[11px] font-serif tracking-wide shadow-md border border-ink-700/70 whitespace-nowrap opacity-0 group-hover/widget:opacity-100 transition-all duration-200 pointer-events-none translate-x-2 group-hover/widget:translate-x-0">
            <span className="w-1.5 h-1.5 rounded-full bg-clay-400 animate-pulse"></span>
            <span>Hộp thư & Chat chuyến đi</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleToggleOpen}
          className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-clay-800 via-clay-600 to-amber-600 text-white flex items-center justify-center shadow-xl shadow-clay-950/25 hover:shadow-2xl hover:shadow-clay-950/35 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer relative ring-4 ring-[#FFFDF8] border border-clay-400/40"
          title="Trò chuyện chuyến đi Wayfare"
          aria-label="Trò chuyện chuyến đi"
        >
          {isOpen ? (
            <X className="w-6 h-6 stroke-[2.5] transition-transform duration-200 rotate-0 hover:rotate-90" />
          ) : (
            <>
              <div className="relative">
                <MessageCircle className="w-6 h-6 stroke-[2.2]" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-clay-700 animate-pulse" />
              </div>
              {totalUnread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-rose-600 text-white text-[10px] font-black font-mono flex items-center justify-center border-2 border-[#FFFDF8] shadow-xs animate-bounce">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FloatingChatWidget;
