import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  AlertTriangle
} from 'lucide-react';

export const MessagesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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

  const effectiveEmail = currentUser?.email || 'tung@gmail.com';

  // Tải danh sách người dùng khả dụng để thêm vào nhóm
  const loadAvailableUsers = useCallback(async (keyword = '') => {
    setIsLoadingAvailableUsers(true);
    try {
      const data = await chatApi.getAvailableUsers(keyword, effectiveEmail);
      setAvailableUsers(data || []);
    } catch (err) {
      console.warn('Lỗi tải danh sách người dùng khả dụng:', err);
    } finally {
      setIsLoadingAvailableUsers(false);
    }
  }, [effectiveEmail]);

  useEffect(() => {
    if (isCreateModalOpen) {
      loadAvailableUsers(userSearchKeyword);
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

  // 2. Tải tin nhắn của phòng chat được chọn
  const loadMessages = useCallback(async (roomId, silent = false) => {
    if (!roomId) return;
    if (!silent) setIsLoadingMessages(true);
    try {
      const msgs = await chatApi.getRoomMessages(roomId, effectiveEmail);
      if (Array.isArray(msgs)) {
        setMessages(prev => {
          // Tránh cập nhật mảng mới nếu danh sách tin nhắn không đổi (chặn kích hoạt useEffect khi polling)
          if (
            prev.length === msgs.length &&
            (prev.length === 0 || prev[prev.length - 1]?.id === msgs[msgs.length - 1]?.id)
          ) {
            return prev;
          }
          return msgs;
        });
      }
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

  // 3. Kết nối WebSocket STOMP nhận tin nhắn thời gian thực (Zero-Latency)
  useEffect(() => {
    if (!activeThreadId) return;

    // Đăng ký nhận tin nhắn tức thì từ WebSocket broker /topic/room.{roomId}
    const unsubscribe = chatSocket.subscribeToRoom(activeThreadId, (incomingMsg) => {
      if (!incomingMsg) return;

      setMessages(prev => {
        // Tránh trùng lặp nếu tin nhắn đã có
        if (prev.some(m => m.id === incomingMsg.id)) {
          return prev;
        }
        // Xóa optimistic/pending message tương ứng nếu có
        const cleanPrev = prev.filter(m => !m.isPending);
        return [...cleanPrev, incomingMsg];
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
  }, [activeThreadId, loadMessages]);

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
    const isSentByMe = latestMsg?.isMe;

    if (isNearBottom || isSentByMe) {
      setTimeout(() => scrollToBottom(true), 50);
    }

    prevMessagesCountRef.current = count;
  }, [messages, scrollToBottom]);

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

  // 7. Gửi Tệp đa phương tiện (Ảnh hoặc Video lên Đám mây Cloudinary CDN)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!activeThreadId) {
      toast.showInfo('Vui lòng chọn hoặc tạo một cuộc trò chuyện trước khi tải ảnh/video!');
      e.target.value = '';
      return;
    }

    // Reset input để người dùng có thể chọn lại cùng 1 file nếu muốn
    e.target.value = '';

    const isVideo = file.type.startsWith('video/') ||
      /\.(mp4|mov|webm|avi|mkv)$/i.test(file.name);

    const msgType = isVideo ? 'VIDEO' : 'IMAGE';

    // Giới hạn dung lượng: 100MB cho video, 25MB cho ảnh
    const maxMb = isVideo ? 100 : 25;
    if (file.size > maxMb * 1024 * 1024) {
      toast.showError(`Dung lượng ${isVideo ? 'video' : 'ảnh'} tối đa là ${maxMb}MB!`);
      return;
    }

    setIsUploading(true);
    setUploadProgressText(`Đang tải ${isVideo ? 'video' : 'hình ảnh'} lên Đám mây CDN...`);

    // Tạo tin nhắn tạm (optimistic preview)
    const tempId = 'temp-media-' + Date.now();
    const localPreviewUrl = URL.createObjectURL(file);
    const tempMsg = {
      id: tempId,
      roomId: activeThreadId,
      senderId: currentUser?.id,
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
        setMessages(prev => prev.map(m => m.id === tempId ? savedMsg : m));
      }
      loadRooms();
      toast.showSuccess(`Đã gửi ${isVideo ? 'video' : 'hình ảnh'} thành công! 🚀`);
    } catch (err) {
      console.error('Lỗi tải tệp lên chat:', err);
      toast.showError(`Tải tệp thất bại: ${err.message || 'Vui lòng kiểm tra lại mạng!'}`);
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
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

    return unique.filter(t => {
      const matchesFilter =
        filterTab === 'all'
          ? true
          : filterTab === 'direct'
          ? t.type === 'DIRECT'
          : t.type === 'GROUP';
      const matchesSearch = t.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [threads, filterTab, searchTerm]);

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

  // Lọc những người chưa có trong nhóm khi tìm kiếm để thêm vào
  const candidateUsersToAdd = useMemo(() => {
    const existingMemberUserIds = new Set(roomMembers.map(m => m.userId));
    return availableUsers.filter(u => !existingMemberUserIds.has(u.userId));
  }, [availableUsers, roomMembers]);

  // Xác định thành viên hiện tại và quyền Trưởng nhóm (OWNER)
  const currentMember = useMemo(() => {
    return roomMembers.find(m => m.userId === currentUser?.id || m.email === effectiveEmail);
  }, [roomMembers, currentUser, effectiveEmail]);

  const isCurrentOwner = currentMember?.role === 'OWNER' || currentThreadObj?.creator?.id === currentUser?.id;

  // Lắng nghe tìm kiếm khi chuyển qua tab thêm thành viên
  useEffect(() => {
    if (isMembersModalOpen && membersModalTab === 'add') {
      const timer = setTimeout(() => {
        loadAvailableUsers(addMemberSearchKeyword);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isMembersModalOpen, membersModalTab, addMemberSearchKeyword, loadAvailableUsers]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 space-y-6">
      
      {/* Lightbox Xem Ảnh Chi Tiết */}
      {previewMediaUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewMediaUrl(null)}
        >
          <button
            onClick={() => setPreviewMediaUrl(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={previewMediaUrl}
            alt="Ảnh xem chi tiết"
            className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl ring-1 ring-white/10"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      {/* Modal Tạo Nhóm Trò Chuyện Mới */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 space-y-4 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900">Tạo nhóm trò chuyện mới</h3>
                  <p className="text-xs text-slate-500">Cùng bạn bè lập đội phượt, trao đổi lịch trình & ảnh/video</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4 overflow-y-auto pr-1 flex-1 custom-dropdown-scroll">
              {/* Tên nhóm */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên nhóm phượt *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đội Phượt Hà Giang 2026, Nhóm Đi Phú Quốc..."
                  value={newRoomName}
                  onChange={e => setNewRoomName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-hidden transition-all font-medium"
                />
              </div>

              {/* Thêm thành viên vào nhóm (Bắt buộc tối thiểu 1 người) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>Thêm thành viên vào nhóm *</span>
                    <span className="text-[11px] font-normal text-slate-500">(Tối thiểu 1 người khác)</span>
                  </label>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedUserIds.length > 0 ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    Đã chọn: {selectedUserIds.length} người
                  </span>
                </div>

                {/* Huy hiệu các thành viên ĐÃ CHỌN */}
                {selectedUserIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-2xl border border-slate-100 max-h-24 overflow-y-auto">
                    {selectedUserIds.map(uid => {
                      const userObj = availableUsers.find(u => u.userId === uid);
                      return (
                        <span
                          key={uid}
                          className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-xl bg-white border border-sky-200 text-slate-800 text-xs font-semibold shadow-2xs animate-in zoom-in-95 duration-150"
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
                            className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
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
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên hoặc email người dùng..."
                    value={userSearchKeyword}
                    onChange={e => setUserSearchKeyword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50/70 border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-hidden transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Danh sách người dùng khả dụng */}
                <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white max-h-44 overflow-y-auto custom-dropdown-scroll divide-y divide-slate-100">
                  {isLoadingAvailableUsers ? (
                    <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                      <span>Đang tìm kiếm thành viên...</span>
                    </div>
                  ) : availableUsers.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      Không tìm thấy người dùng phù hợp
                    </div>
                  ) : (
                    availableUsers.map(user => {
                      const isSelected = selectedUserIds.includes(user.userId);
                      return (
                        <div
                          key={user.userId}
                          onClick={() => handleToggleUserSelection(user.userId)}
                          className={`p-2.5 flex items-center justify-between gap-2.5 cursor-pointer transition-colors ${
                            isSelected ? 'bg-sky-50/60' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={user.avatarUrl}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                              <p className="text-[10px] text-slate-400 truncate">{user.handle || user.email}</p>
                            </div>
                          </div>

                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                            isSelected
                              ? 'bg-sky-600 border-sky-600 text-white'
                              : 'border-slate-300 hover:border-sky-400'
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
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tin nhắn mở đầu (tùy chọn)</label>
                <textarea
                  placeholder="Nhập lời chào khởi đầu cho các thành viên trong nhóm..."
                  value={newRoomIntro}
                  onChange={e => setNewRoomIntro(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-hidden transition-all resize-none font-medium"
                />
              </div>

              {/* Footer nút hành động */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={!newRoomName.trim() || selectedUserIds.length === 0 || isCreatingRoom}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 space-y-4 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 truncate max-w-[280px] sm:max-w-xs">
                    {currentThreadObj?.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
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
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab điều hướng: Danh sách thành viên | Thêm thành viên */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setMembersModalTab('list')}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  membersModalTab === 'list'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Thành viên ({roomMembers.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setMembersModalTab('add')}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  membersModalTab === 'add'
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
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
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs space-y-2.5 animate-in fade-in duration-150">
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
                        className="px-3 py-1.5 rounded-xl bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold border border-slate-200 cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={() => handleKickMember(confirmKickMember)}
                        disabled={memberActionLoadingId === confirmKickMember.userId}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
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
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-2.5 animate-in fade-in duration-150">
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
                        className="px-3 py-1.5 rounded-xl bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold border border-slate-200 cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={handleLeaveGroup}
                        disabled={memberActionLoadingId === currentUser?.id}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
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
                  <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-sky-600" />
                    <span>Đang tải danh sách thành viên...</span>
                  </div>
                ) : roomMembers.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Chưa có thành viên nào
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {roomMembers.map(member => {
                      const isMe = member.userId === currentUser?.id || member.email === effectiveEmail;
                      const isOwnerRole = member.role === 'OWNER';

                      return (
                        <div
                          key={member.userId}
                          className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-slate-50/70 rounded-2xl transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative shrink-0">
                              <img
                                src={member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                              />
                              {isOwnerRole && (
                                <span className="absolute -top-1 -right-1 p-0.5 rounded-full bg-amber-500 text-white shadow-2xs" title="Trưởng nhóm">
                                  <Crown className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                  {member.fullName}
                                </p>
                                {isMe && (
                                  <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-md border border-sky-100 shrink-0">
                                    Bạn
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 truncate">
                                {member.handle || member.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Vai trò */}
                            {isOwnerRole ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200 shadow-2xs">
                                <Crown className="w-3 h-3 text-amber-600" />
                                <span>Trưởng nhóm</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-xl bg-slate-100 text-slate-600 text-[11px] font-medium">
                                Thành viên
                              </span>
                            )}

                            {/* Nút Kick nếu là Trưởng nhóm và đối tượng không phải là chính mình */}
                            {isCurrentOwner && !isMe && (
                              <button
                                type="button"
                                onClick={() => setConfirmKickMember(member)}
                                title="Kick khỏi nhóm"
                                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
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
                                className="p-1.5 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all cursor-pointer"
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
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên hoặc email người dùng..."
                    value={addMemberSearchKeyword}
                    onChange={e => setAddMemberSearchKeyword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-hidden transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Huy hiệu những người đã chọn thêm */}
                {addMemberSelectedIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-sky-50/50 rounded-2xl border border-sky-100 max-h-24 overflow-y-auto">
                    {addMemberSelectedIds.map(uid => {
                      const userObj = availableUsers.find(u => u.userId === uid);
                      return (
                        <span
                          key={uid}
                          className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-xl bg-white border border-sky-200 text-slate-800 text-xs font-semibold shadow-2xs"
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
                            className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Danh sách người dùng khả dụng */}
                <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white max-h-52 overflow-y-auto custom-dropdown-scroll divide-y divide-slate-100">
                  {isLoadingAvailableUsers ? (
                    <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                      <span>Đang tìm kiếm...</span>
                    </div>
                  ) : candidateUsersToAdd.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
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
                            isSelected ? 'bg-sky-50/60' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={user.avatarUrl}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                              <p className="text-[10px] text-slate-400 truncate">{user.handle || user.email}</p>
                            </div>
                          </div>

                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                            isSelected
                              ? 'bg-sky-600 border-sky-600 text-white'
                              : 'border-slate-300 hover:border-sky-400'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setMembersModalTab('list')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={handleAddMembersToExistingGroup}
                    disabled={addMemberSelectedIds.length === 0 || isSubmittingAddMembers}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
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

      {/* Header Trang Tin Nhắn */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-sky-100 text-sky-700">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Tin Nhắn & Đội Phượt
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Trò chuyện trực tiếp, chia sẻ hình ảnh và video chất lượng cao lưu trữ Cloudinary CDN.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo nhóm chat mới</span>
          </button>
        </div>
      </div>

      {/* Khung chat chính */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px] sm:min-h-[680px]">
        
        {/* CỘT TRÁI: Danh sách phòng chat (4 Cột) */}
        <div className={`md:col-span-4 lg:col-span-4 border-r border-slate-100 flex flex-col p-4 sm:p-5 bg-slate-50/50 ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-200/70">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sky-600" />
                <span>Hộp thư</span>
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">Kết nối trực tiếp & Nhóm chuyến đi</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              title="Tạo nhóm mới"
              className="p-1.5 rounded-xl bg-sky-100/80 hover:bg-sky-200 text-sky-800 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
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
              <div className="py-12 text-center text-slate-400 text-xs space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="font-semibold text-slate-600">Chưa có cuộc trò chuyện nào</p>
                <p className="text-[11px] text-slate-400 px-4">Hãy tạo nhóm mới hoặc nhắn tin từ trang Lịch trình / Bạn bè để kết nối!</p>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo nhóm ngay</span>
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
          
          {/* Header phòng chat hoặc Empty State */}
          {currentThreadObj ? (
            <>
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
                          <button
                            type="button"
                            onClick={handleOpenMembersModal}
                            className="text-sky-600 hover:text-sky-700 font-bold hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                            title="Bấm để xem & quản lý thành viên nhóm"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>{currentThreadObj?.membersCount || 1} thành viên</span>
                          </button>
                          <span>•</span>
                          <span>Bấm để quản lý thành viên & kick</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {currentThreadObj?.type === 'GROUP' && (
                    <button
                      type="button"
                      onClick={handleOpenMembersModal}
                      title="Xem danh sách & quản lý thành viên nhóm"
                      className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-sky-100 shadow-2xs"
                    >
                      <Users className="w-3.5 h-3.5 text-sky-600" />
                      <span>Thành viên ({currentThreadObj?.membersCount || 1})</span>
                    </button>
                  )}

                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 flex items-center gap-1 hidden lg:flex">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Cloud CDN</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDeleteRoom(currentThreadObj.id)}
                    title="Xóa cuộc trò chuyện này"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lịch sử tin nhắn */}
              <div ref={chatScrollContainerRef} className="flex-1 space-y-3.5 max-h-[440px] overflow-y-auto pr-1.5 custom-dropdown-scroll">
                {isLoadingMessages ? (
                  <div className="py-24 text-center text-slate-400 text-xs space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-sky-600" />
                    <p>Đang đồng bộ tin nhắn đám mây...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-24 text-center text-slate-400 text-xs space-y-1">
                    <p className="font-semibold text-slate-600">Chưa có tin nhắn nào trong phòng</p>
                    <p>Gửi tin nhắn hoặc đính kèm ảnh/video đầu tiên để bắt đầu cuộc trò chuyện!</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    if (msg.messageType === 'SYSTEM') {
                      return (
                        <div key={msg.id} className="flex justify-center my-2">
                          <div className="px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200/80 flex items-center gap-1.5 shadow-2xs">
                            <Shield className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                            <span>{msg.content}</span>
                            <span className="text-[10px] text-slate-400">• {msg.time}</span>
                          </div>
                        </div>
                      );
                    }

                    return (
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

                        {/* RENDER NỘI DUNG THEO LOẠI */}
                        {msg.messageType === 'IMAGE' ? (
                          <div className="relative group overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm bg-slate-100">
                            <img
                              src={msg.content}
                              alt="Ảnh chia sẻ"
                              className="max-w-[260px] sm:max-w-xs max-h-64 rounded-2xl object-cover cursor-pointer hover:opacity-95 transition-all"
                              onClick={() => setPreviewMediaUrl(msg.content)}
                            />
                            {msg.isPending && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold gap-1.5">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Đang tải lên Cloud...</span>
                              </div>
                            )}
                            {!msg.isPending && (
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 cursor-pointer pointer-events-none">
                                <Maximize2 className="w-4 h-4" />
                                <span>Xem ảnh</span>
                              </div>
                            )}
                          </div>
                        ) : msg.messageType === 'VIDEO' ? (
                          <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-md max-w-[280px] sm:max-w-xs bg-black relative">
                            <video
                              controls
                              src={msg.content}
                              className="w-full max-h-64 object-contain rounded-2xl"
                              preload="metadata"
                            />
                            {msg.isPending && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold gap-1.5">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Đang tải video lên Cloud...</span>
                              </div>
                            )}
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

                        <div className="flex items-center gap-1 text-[10px] text-slate-400 px-1">
                          <span>{msg.time}</span>
                          {msg.isMe && <CheckCheck className="w-3 h-3 text-sky-500" />}
                        </div>
                      </div>
                    </div>
                  );
                }))}
                <div ref={messagesEndRef} />
              </div>
            </>
          ) : (
            /* Khi chưa có phòng chat nào được chọn */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-sky-100/70 text-sky-600 flex items-center justify-center shadow-inner">
                <Compass className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Chào mừng bạn đến với Tin Nhắn Wayfare!
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Hiện bạn chưa có cuộc trò chuyện nào. Hãy tạo một nhóm mới hoặc nhắn tin kết nối với bạn bè qua các lịch trình du lịch để bắt đầu chia sẻ hình ảnh và video.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo nhóm trò chuyện ngay</span>
              </button>
            </div>
          )}

          {/* Thanh Tiến Trình Tải Lên Media */}
          {isUploading && (
            <div className="p-3 bg-sky-50 border border-sky-100 rounded-2xl flex items-center gap-2.5 text-xs text-sky-800 font-bold animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-sky-600 shrink-0" />
              <span className="flex-1 truncate">{uploadProgressText}</span>
            </div>
          )}

          {/* Form Nhập tin nhắn & Nút Chọn Ảnh/Video */}
          {currentThreadObj && (
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
                title="Gửi hình ảnh hoặc video lên Cloudinary CDN"
                className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-sky-600 hover:border-sky-300 hover:bg-sky-50 transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                placeholder={
                  currentThreadObj?.type === 'DIRECT'
                    ? `Nhắn tin cho ${currentThreadObj.name}...`
                    : 'Nhập tin nhắn nhóm (hoặc bấm biểu tượng ghim kẹp để gửi ảnh/video)...'
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
          )}

        </div>

      </div>
    </div>
  );
};

export default MessagesPage;
