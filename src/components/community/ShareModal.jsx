import React, { useState } from 'react';
import { X, Globe, Lock, Users, Smile, Send, Copy, Check, ExternalLink, ChevronDown, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../common/Toast';
import { postApi } from '../../services/api';

export const ShareModal = ({ post, onClose, onPostShared }) => {
  const { currentUser } = useApp();
  const toast = useToast();

  const [shareCaption, setShareCaption] = useState('');
  const [audience, setAudience] = useState('PUBLIC'); // 'PUBLIC' | 'FRIENDS' | 'PRIVATE'
  const [isAudienceDropdownOpen, setIsAudienceDropdownOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isSharingToFeed, setIsSharingToFeed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!post) return null;

  const postUrl = window.location.origin + `/community?post=${post.id}`;
  const userName = currentUser?.name || currentUser?.fullName || 'Nguyễn Tùng';
  const userAvatar =
    currentUser?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

  const audienceConfig = {
    PUBLIC: { label: 'Công khai', icon: Globe },
    FRIENDS: { label: 'Bạn bè', icon: Users },
    PRIVATE: { label: 'Chỉ mình tôi', icon: Lock }
  };

  const CurrentAudienceIcon = audienceConfig[audience].icon;

  // Handle Copy Link
  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(postUrl);
        setCopied(true);
        if (toast?.showSuccess) toast.showSuccess('Đã sao chép liên kết vào bộ nhớ tạm! 📋');
        else if (toast?.success) toast.success('Đã sao chép liên kết vào bộ nhớ tạm! 📋');
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      if (toast?.showError) toast.showError('Không thể sao chép liên kết');
    }
  };

  // Handle Share to Messenger
  const handleShareMessenger = () => {
    // Facebook Messenger web send link
    const messengerUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(postUrl)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(postUrl)}`;
    window.open(messengerUrl, '_blank', 'width=600,height=500');
  };

  // Handle Share to Facebook
  const handleShareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
    window.open(fbUrl, '_blank', 'width=600,height=500');
  };

  // Handle Share to Zalo
  const handleShareZalo = () => {
    const zaloUrl = `https://zalo.me/share?url=${encodeURIComponent(postUrl)}`;
    window.open(zaloUrl, '_blank', 'width=600,height=500');
  };

  // Handle Share to User's Feed
  const handleShareToFeed = async () => {
    try {
      setIsSharingToFeed(true);

      const postPayload = {
        title: shareCaption.trim()
          ? (shareCaption.trim().length > 60 ? shareCaption.trim().substring(0, 57) + '...' : shareCaption.trim())
          : `Chia sẻ bài viết của ${post.authorName || 'thành viên'}`,
        content: shareCaption.trim() || 'Chia sẻ bài viết này cùng mọi người!',
        sharedPostId: post.id,
        category: post.category || 'Phượt & Khám phá',
        locationTag: post.locationTag || '',
        visibility: audience
      };

      const res = await postApi.createPost(postPayload, currentUser?.email);

      if (toast?.showSuccess) {
        toast.showSuccess(`Đã chia sẻ bài viết của ${post.authorName || 'bạn bè'} lên trang của bạn! ✨`);
      } else if (toast?.success) {
        toast.success(`Đã chia sẻ bài viết của ${post.authorName || 'bạn bè'} lên trang của bạn! ✨`);
      }

      if (typeof onPostShared === 'function') {
        onPostShared(res);
      }

      onClose();
    } catch (err) {
      if (toast?.showError) toast.showError('Chia sẻ thất bại: ' + (err.message || 'Lỗi'));
    } finally {
      setIsSharingToFeed(false);
    }
  };

  // Quick Emoji selection
  const emojis = ['😊', '❤️', '👍', '🔥', '✨', '✈️', '🏝️', '😍'];
  const handleSelectEmoji = (emoji) => {
    setShareCaption(prev => prev + emoji);
    setIsEmojiPickerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Modal Header */}
        <div className="relative px-6 py-4 border-b border-slate-200 text-center">
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
            Chia sẻ
          </h3>
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* User Profile & Audience Row */}
          <div className="flex items-center gap-3">
            <img
              src={userAvatar}
              alt={userName}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 shadow-2xs"
            />
            <div>
              <h4 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
                {userName}
              </h4>
              <div className="flex items-center gap-2 mt-1 relative">
                {/* Pill 1: Bảng feed */}
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                  Bảng feed
                </span>

                {/* Pill 2: Audience Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAudienceDropdownOpen(!isAudienceDropdownOpen)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CurrentAudienceIcon className="w-3.5 h-3.5 text-slate-600" />
                    <span>{audienceConfig[audience].label}</span>
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {isAudienceDropdownOpen && (
                    <div className="absolute left-0 top-full mt-1.5 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-20 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Chọn người có thể xem
                      </div>
                      {Object.entries(audienceConfig).map(([key, config]) => {
                        const Icon = config.icon;
                        const isSelected = audience === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setAudience(key);
                              setIsAudienceDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-sky-50 text-sky-700 font-bold'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <Icon className="w-3.5 h-3.5" />
                              <span>{config.label}</span>
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-sky-600" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Caption Input */}
          <div className="relative pt-1">
            <textarea
              rows={3}
              value={shareCaption}
              onChange={e => setShareCaption(e.target.value)}
              placeholder="Hãy nói gì đó về nội dung này..."
              className="w-full text-sm sm:text-base text-slate-800 placeholder-slate-400 border-none outline-none focus:ring-0 resize-none bg-transparent p-0 leading-relaxed font-normal"
              autoFocus
            />

            {/* Emoji and Actions bar */}
            <div className="flex items-center justify-between pt-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                  title="Thêm biểu tượng cảm xúc"
                >
                  <Smile className="w-6 h-6" />
                </button>

                {/* Emoji quick popover */}
                {isEmojiPickerOpen && (
                  <div className="absolute left-0 bottom-full mb-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 flex gap-1.5 z-20 animate-in fade-in duration-150">
                    {emojis.map((emoji, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectEmoji(emoji)}
                        className="w-8 h-8 rounded-xl hover:bg-slate-100 text-lg flex items-center justify-center transition-transform hover:scale-125 cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Chia sẻ ngay Button */}
              <button
                type="button"
                onClick={handleShareToFeed}
                disabled={isSharingToFeed}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSharingToFeed ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang chia sẻ...</span>
                  </>
                ) : (
                  <span>Chia sẻ ngay</span>
                )}
              </button>
            </div>
          </div>

          {/* Mini Preview of the Post Being Shared */}
          <div className="rounded-2xl border border-slate-200/90 overflow-hidden bg-slate-50/70 p-3 flex gap-3 items-center">
            {((post.images && post.images.length > 0) || post.imageUrl) && (
              <img
                src={(post.images && post.images[0]) || post.imageUrl}
                alt={post.title}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md inline-block mb-1">
                {post.category || 'Wayfare Community'}
              </span>
              <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                {post.title}
              </h5>
              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                {post.content}
              </p>
              <div className="text-[10px] text-slate-400 mt-1 font-medium">
                Tác giả: {post.authorName || 'Thành viên Wayfare'}
              </div>
            </div>
          </div>

          {/* Social Channels Section Divider */}
          <div className="border-t border-slate-200 pt-3 space-y-2">
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Hoặc chia sẻ qua
            </h5>

            {/* Messenger option (Exactly matching screenshot) */}
            <button
              type="button"
              onClick={handleShareMessenger}
              className="w-full p-3 rounded-2xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between group transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00B2FF] to-[#006AFF] text-white flex items-center justify-center shadow-xs">
                  <Send className="w-5 h-5 -rotate-45" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                    Gửi bằng Messenger
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Gửi trực tiếp cho bạn bè hoặc nhóm chat
                  </div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </button>

            {/* Facebook Post option */}
            <button
              type="button"
              onClick={handleShareFacebook}
              className="w-full p-3 rounded-2xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between group transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-black text-lg shadow-xs">
                  f
                </div>
                <div className="text-left">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#1877F2] transition-colors">
                    Chia sẻ lên Facebook
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Đăng lên trang cá nhân hoặc dòng thời gian
                  </div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#1877F2] transition-colors" />
            </button>

            {/* Zalo option */}
            <button
              type="button"
              onClick={handleShareZalo}
              className="w-full p-3 rounded-2xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between group transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0068FF] text-white flex items-center justify-center font-black text-xs shadow-xs">
                  Zalo
                </div>
                <div className="text-left">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#0068FF] transition-colors">
                    Chia sẻ qua Zalo
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Gửi nhật ký hoặc tin nhắn Zalo
                  </div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#0068FF] transition-colors" />
            </button>

            {/* Copy Link option */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full p-3 rounded-2xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between group transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shadow-xs">
                  {copied ? (
                    <Check className="w-5 h-5 text-sky-600" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </div>
                <div className="text-left">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-sky-600 transition-colors">
                    {copied ? 'Đã sao chép liên kết!' : 'Sao chép liên kết'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium truncate max-w-[240px] sm:max-w-[320px]">
                    {postUrl}
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-sky-600 group-hover:underline">
                {copied ? 'Đã chép' : 'Sao chép'}
              </span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

