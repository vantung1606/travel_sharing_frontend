import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../common/Toast';
import { postApi } from '../../services/api';
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ExternalLink,
  ChevronRight,
  UserCheck,
  UserPlus,
  Send,
  Compass,
  Maximize2,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export const BlogArticleReaderModal = ({
  post,
  onClose,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onFollowAuthor,
  isFollowingAuthor,
  onReadRelated,
  relatedPosts = []
}) => {
  const { openAIGeneratorWithItem } = useApp();
  const toast = useToast();

  const [commentInput, setCommentInput] = useState('');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (!post?.id) return undefined;

    setCommentInput('');
    setSelectedPhotoIndex(null);

    const embeddedComments = Array.isArray(post.comments) ? post.comments : [];
    setComments(embeddedComments);
    setLoadingComments(false);
    if (embeddedComments.length > 0) return undefined;

    let cancelled = false;
    setLoadingComments(true);
    postApi.getComments(post.id)
      .then((data) => {
        if (!cancelled) setComments(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setComments([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingComments(false);
      });

    return () => {
      cancelled = true;
    };
  }, [post?.id]);

  if (!post) return null;

  const authorName = post.author?.name || post.author?.fullName || 'Travel Blogger';
  const authorAvatar = post.author?.avatar || post.author?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
  const authorBadge = post.author?.badge || 'Blogger Du Lịch';
  const locationTag = post.locationTag || post.location || 'Việt Nam';
  const postDate = post.timeAgo || post.time || 'Vừa xong';

  // Tách danh sách ảnh từ chuỗi ngăn cách bởi ';;;' hoặc mảng
  const photoList = useMemo(() => {
    if (Array.isArray(post.images)) return post.images.filter(Boolean);
    if (typeof post.images === 'string' && post.images.trim()) {
      return post.images.split(';;;').filter(Boolean);
    }
    if (post.image) return [post.image];
    return [];
  }, [post.images, post.image]);

  // Ước tính thời gian đọc (trung bình 200 từ/phút)
  const readingStats = useMemo(() => {
    const text = `${post.title || ''} ${post.content || ''}`;
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 50;
    const minutes = Math.max(1, Math.ceil(wordCount / 180));
    return { wordCount, minutes };
  }, [post.title, post.content]);

  // Nhận diện và highlight hashtag trong nội dung
  const formattedContent = useMemo(() => {
    const rawContent = post.content || '';
    const paragraphs = rawContent.split('\n\n').filter(Boolean);
    return paragraphs.length > 0 ? paragraphs : [rawContent];
  }, [post.content]);

  const handleSendComment = async (e) => {
    e?.preventDefault();
    const content = commentInput.trim();
    if (!content || submittingComment) return;

    if (!onComment) {
      if (toast?.showInfo) toast.showInfo('Vui lòng đăng nhập để bình luận.');
      else if (toast?.info) toast.info('Vui lòng đăng nhập để bình luận.');
      return;
    }

    try {
      setSubmittingComment(true);
      const newComment = await onComment(post.id, content);
      if (newComment) {
        setComments(prev => [...prev, newComment]);
        setCommentInput('');
      }
    } catch (err) {
      if (toast?.showError) toast.showError('Không thể gửi bình luận: ' + (err.message || 'Vui lòng thử lại.'));
      else if (toast?.error) toast.error('Không thể gửi bình luận: ' + (err.message || 'Vui lòng thử lại.'));
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleOpenAiPlanner = () => {
    onClose();
    openAIGeneratorWithItem({
      name: locationTag,
      city: locationTag
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 md:p-6 bg-[#1E1A15] overflow-y-auto animate-fade-in font-display">
      {/* KHUNG MODAL ĐỌC BÀI VIẾT CHUYÊN SÂU */}
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] border border-slate-200 mt-2 sm:mt-4">
        
        {/* TOP BAR / NAVIGATION ACTIONS */}
        <div className="px-5 sm:px-8 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between gap-3 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 min-w-0">
            <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 font-extrabold border border-sky-100 shrink-0">
              Blog Du Lịch
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="hidden sm:inline flex items-center gap-1 text-slate-600 truncate">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate">{locationTag}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => onBookmark && onBookmark(post.id)}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                post.isBookmarked
                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
              title={post.isBookmarked ? 'Bỏ lưu' : 'Lưu vào sổ tay'}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>

            <button
              type="button"
              onClick={() => onShare && onShare(post)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
              title="Chia sẻ bài viết"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer ml-1"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NỘI DUNG BÀI VIẾT BÁO CHÍ (CUỘN MƯỢT MÀ) */}
        <div className="overflow-y-auto px-5 sm:px-10 md:px-14 py-6 sm:py-8 space-y-8 flex-1 custom-dropdown-scroll">
          
          {/* 1. HEADER BÀI VIẾT: TIÊU ĐỀ & META */}
          <div className="space-y-4 border-b border-slate-100 pb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {post.title || `Hành Trình Khám Phá & Kinh Nghiệm Tại ${locationTag}`}
            </h1>

            {/* Thông tin tác giả & Thời gian đọc */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-sky-100"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                      {authorName}
                    </h4>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-extrabold border border-amber-200/60">
                      {authorBadge}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{postDate}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-sky-600 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>~{readingStats.minutes} phút đọc</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Nút Theo Dõi Blogger */}
              {onFollowAuthor && (
                <button
                  type="button"
                  onClick={() => onFollowAuthor(post.author?.id || post.author?.email)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    isFollowingAuthor
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20 active:scale-95'
                  }`}
                >
                  {isFollowingAuthor ? (
                    <>
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>Đang theo dõi</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Theo dõi Blogger</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* 2. THÂN BÀI VIẾT BLOG - TYPOGRAPHY NGHỆ THUẬT */}
          <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed sm:leading-loose space-y-4 font-normal">
            {formattedContent.map((para, idx) => (
              <p key={idx} className="whitespace-pre-line">
                {para}
              </p>
            ))}
          </div>

          {/* 3. BỘ SƯU TẬP ẢNH & VIDEO DU LỊCH (PHOTO GALLERY) */}
          {photoList.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <span>Bộ Sưu Tập Hình Ảnh Chuyến Đi ({photoList.length} ảnh)</span>
                </h3>
                <span className="text-[11px] text-slate-400">Bấm ảnh để phóng to</span>
              </div>

              {photoList.length === 1 ? (
                <div
                  onClick={() => setSelectedPhotoIndex(0)}
                  className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm cursor-pointer group relative bg-slate-100"
                >
                  <img
                    src={photoList[0]}
                    alt="Ảnh chụp chuyến đi"
                    className="w-full max-h-[460px] object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                    <Maximize2 className="w-4 h-4" />
                    <span>Xem ảnh đầy đủ</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photoList.map((url, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedPhotoIndex(idx)}
                      className="aspect-4/3 rounded-xl overflow-hidden border border-slate-200 shadow-2xs cursor-pointer group relative bg-slate-100"
                    >
                      <img
                        src={url}
                        alt={`Ảnh du lịch ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold gap-1">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Phóng to</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Video nếu có */}
          {post.videoUrl && (
            <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-md bg-black">
              <video
                controls
                src={post.videoUrl}
                className="w-full max-h-[420px] object-contain"
                preload="metadata"
              />
            </div>
          )}

          {/* 4. HỘP KẾT NỐI ĐIỂM ĐẾN & LẬP LỊCH TRÌNH AI (DESTINATION CALLOUT) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="space-y-1 min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-md">
                Điểm Đến Được Nhắc Tới
              </span>
              <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-1.5 pt-1">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Bạn muốn khám phá {locationTag}?</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed max-w-lg">
                Sử dụng AI của Wayfare để tạo ngay lịch trình du lịch {locationTag} chi tiết, tối ưu chi phí và định tuyến bản đồ.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAiPlanner}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Tạo Lịch Trình {locationTag}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 5. KHU VỰC BÌNH LUẬN & TƯƠNG TÁC CHUYÊN SÂU */}
          <div className="space-y-5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-sky-600" />
                <span>Bình luận & Thảo luận ({Math.max(Number(post.commentCount || post.commentsCount || 0), comments.length)})</span>
              </h3>

              {/* Nút Like nhanh */}
              <button
                type="button"
                onClick={() => onLike && onLike(post.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  post.isLiked
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${post.isLiked ? 'fill-current' : ''}`} />
                <span>{post.likes || post.likeCount || 0} Thích</span>
              </button>
            </div>

            {/* Form gửi bình luận */}
            <form onSubmit={handleSendComment} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={`Đặt câu hỏi hoặc chia sẻ cảm nghĩ với ${authorName}...`}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 outline-none transition-all font-medium"
              />
              <button
                type="submit"
                disabled={!commentInput.trim() || submittingComment}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingComment ? 'Đang gửi...' : 'Gửi'}</span>
              </button>
            </form>

            {/* Danh sách bình luận */}
            <div className="space-y-3 pt-2">
              {loadingComments ? (
                <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
                  <span>Đang tải bình luận...</span>
                </div>
              ) : comments.length > 0 ? (
                comments.map((cmt, cIdx) => (
                  <div
                    key={cmt.id || cIdx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={cmt.authorAvatar || cmt.author?.avatar || cmt.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                          alt=""
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="font-bold text-slate-900">
                          {cmt.authorName || cmt.author?.name || cmt.userName || 'Thành viên Wayfare'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {cmt.timeAgo || cmt.time || 'Vừa xong'}
                      </span>
                    </div>
                    <p className="text-slate-700 pl-8 leading-relaxed">
                      {cmt.content || cmt.text}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  Chưa có bình luận nào. Hãy là người đầu tiên đặt câu hỏi cho chuyến đi này!
                </div>
              )}
            </div>
          </div>

          {/* 6. GỢI Ý BÀI VIẾT LIÊN QUAN (RELATED TRAVEL STORIES) */}
          {relatedPosts && relatedPosts.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-600" />
                <span>Có thể bạn cũng muốn đọc</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {relatedPosts.slice(0, 2).map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      if (typeof onReadRelated === 'function') {
                        onReadRelated(rel);
                      } else if (onClose) {
                        onClose();
                      }
                    }}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-sm transition-all cursor-pointer bg-slate-50/50 hover:bg-white flex items-center gap-3 group"
                  >
                    <img
                      src={rel.image || (rel.images && rel.images[0]) || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80'}
                      alt=""
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-xs text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
                        {rel.title || `Hành trình ${rel.locationTag || 'Việt Nam'}`}
                      </h5>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {rel.content}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 inline-block">
                        Bởi {rel.author?.name || 'Blogger'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* LIGHTBOX PHÓNG TO ẢNH FULL HD */}
      {selectedPhotoIndex !== null && photoList[selectedPhotoIndex] && (
        <div
          onClick={() => setSelectedPhotoIndex(null)}
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        >
          <button
            type="button"
            onClick={() => setSelectedPhotoIndex(null)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <img
            src={photoList[selectedPhotoIndex]}
            alt="Ảnh phóng to"
            className="max-w-[92vw] max-h-[88vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default BlogArticleReaderModal;
