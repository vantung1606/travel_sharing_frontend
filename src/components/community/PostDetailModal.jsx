import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MapPin,
  Calendar,
  Sparkles,
  Route,
  Eye,
  Send,
  Loader2,
  Lock,
  Globe,
  Tag,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  UserPlus,
  UserCheck
} from 'lucide-react';
import { postApi, userApi } from '../../services/api';
import { useToast } from '../common/Toast';
import { useApp } from '../../context/AppContext';

export const PostDetailModal = ({
  postId,
  post: initialPost,
  onClose,
  onAuthorClick,
  onSelectItinerary,
  onPostUpdated
}) => {
  const [post, setPost] = useState(initialPost || null);
  const [loading, setLoading] = useState(!initialPost && !!postId);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(initialPost?.isLiked || false);
  const [likeCount, setLikeCount] = useState(initialPost?.likeCount || 0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const toast = useToast();
  const { currentUser } = useApp();

  const effectivePostId = post?.id || postId;
  const effectiveAuthorId = post?.authorId || post?.author?.id;

  // Check follow status for author
  useEffect(() => {
    let isMounted = true;
    if (effectiveAuthorId) {
      userApi
        .getFollowingIds()
        .then(ids => {
          if (isMounted && Array.isArray(ids)) {
            setIsFollowingAuthor(ids.includes(Number(effectiveAuthorId)));
          }
        })
        .catch(err => console.warn('Lỗi kiểm tra trạng thái follow:', err));
    }
    return () => {
      isMounted = false;
    };
  }, [effectiveAuthorId]);

  const handleToggleFollowAuthor = async () => {
    if (!effectiveAuthorId || followLoading) return;
    try {
      setFollowLoading(true);
      const res = await userApi.toggleFollow(effectiveAuthorId);
      setIsFollowingAuthor(res?.isFollowing);
      if (res?.isFollowing) {
        toast.showSuccess(`Đã theo dõi ${authorName}! ✨`);
      } else {
        toast.showInfo(`Đã hủy theo dõi ${authorName}`);
      }
    } catch (err) {
      toast.showError('Thao tác theo dõi thất bại: ' + err.message);
    } finally {
      setFollowLoading(false);
    }
  };

  // Load post details if only postId is provided
  useEffect(() => {
    let isMounted = true;
    if (postId && !initialPost) {
      setLoading(true);
      postApi
        .getPostById(postId)
        .then(data => {
          if (isMounted && data) {
            setPost(data);
            setIsLiked(data.isLiked || false);
            setLikeCount(data.likeCount || 0);
          }
        })
        .catch(err => {
          console.error('Lỗi khi tải chi tiết bài viết:', err);
          toast.showError('Không thể tải bài viết: ' + err.message);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [postId, initialPost]);

  // Load comments
  useEffect(() => {
    let isMounted = true;
    if (effectivePostId) {
      setLoadingComments(true);
      postApi
        .getComments(effectivePostId)
        .then(data => {
          if (isMounted) setComments(data || []);
        })
        .catch(err => {
          console.warn('Lỗi khi tải bình luận:', err);
        })
        .finally(() => {
          if (isMounted) setLoadingComments(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [effectivePostId]);

  // Toggle Like
  const handleToggleLike = async () => {
    if (!effectivePostId || likeLoading) return;
    try {
      setLikeLoading(true);
      const nextLiked = !isLiked;
      setIsLiked(nextLiked);
      setLikeCount(prev => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

      await postApi.toggleLike(effectivePostId);
      if (typeof onPostUpdated === 'function') {
        onPostUpdated(effectivePostId, { isLiked: nextLiked, likeCount: nextLiked ? likeCount + 1 : Math.max(0, likeCount - 1) });
      }
    } catch (err) {
      // Revert on error
      setIsLiked(!isLiked);
      setLikeCount(prev => (!isLiked ? prev + 1 : Math.max(0, prev - 1)));
      toast.showError('Thao tác thích bài viết thất bại: ' + err.message);
    } finally {
      setLikeLoading(false);
    }
  };

  // Add Comment
  const handleAddComment = async e => {
    e.preventDefault();
    if (!commentInput.trim() || submittingComment || !effectivePostId) return;

    try {
      setSubmittingComment(true);
      const newComment = await postApi.addComment(effectivePostId, commentInput.trim());
      setComments(prev => [newComment, ...prev]);
      setCommentInput('');
      toast.showSuccess('Đã gửi bình luận của bạn! 💬');

      if (post) {
        setPost(prev => ({
          ...prev,
          commentCount: (prev.commentCount || 0) + 1
        }));
      }

      if (typeof onPostUpdated === 'function') {
        onPostUpdated(effectivePostId, { commentCount: (post?.commentCount || 0) + 1 });
      }
    } catch (err) {
      toast.showError('Không thể gửi bình luận: ' + err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Share post
  const handleShare = () => {
    const url = window.location.origin + `/community?post=${effectivePostId}`;
    navigator.clipboard.writeText(url);
    toast.showSuccess('Đã sao chép liên kết bài viết vào bộ nhớ tạm! 📋');
  };

  // Collect images
  const images = (post?.images && post.images.length > 0)
    ? post.images
    : post?.imageUrl
    ? [post.imageUrl]
    : [];

  const authorName = post?.authorName || post?.author?.fullName || 'Thành viên Wayfare';
  const authorAvatar = post?.authorAvatar || post?.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  const authorHandle = post?.authorHandle || post?.author?.handle || '@wayfarer';
  const authorRole = post?.authorRole || post?.author?.role || 'Phượt thủ';
  const isSelf = Boolean(
    post?.isOwner ||
    (effectiveAuthorId && currentUser?.id && Number(effectiveAuthorId) === Number(currentUser.id)) ||
    (currentUser?.name && authorName && authorName.trim().toLowerCase() === currentUser.name.trim().toLowerCase()) ||
    (currentUser?.handle && authorHandle && authorHandle.trim().toLowerCase() === currentUser.handle.trim().toLowerCase()) ||
    (currentUser?.email && (post?.authorEmail || post?.author?.email) && (post?.authorEmail || post?.author?.email).toLowerCase() === currentUser.email.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0 bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => {
                if (typeof onAuthorClick === 'function' && authorId) {
                  onAuthorClick(authorId);
                }
              }}
              className="relative shrink-0 group cursor-pointer"
            >
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-11 h-11 rounded-2xl object-cover ring-2 ring-sky-100 group-hover:ring-sky-400 transition-all shadow-xs"
              />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    if (typeof onAuthorClick === 'function' && authorId) {
                      onAuthorClick(authorId);
                    }
                  }}
                  className="font-extrabold text-sm sm:text-base text-slate-900 hover:text-sky-600 transition-colors truncate cursor-pointer"
                >
                  {authorName}
                </button>
                <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-bold border border-sky-100 shrink-0">
                  {authorRole}
                </span>
                {isSelf ? (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                    Bạn
                  </span>
                ) : effectiveAuthorId ? (
                  <button
                    onClick={handleToggleFollowAuthor}
                    disabled={followLoading}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs ${
                      isFollowingAuthor
                        ? 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600 border border-slate-200'
                        : 'ocean-gradient text-white hover:opacity-95 shadow-sky-500/20'
                    }`}
                    title={isFollowingAuthor ? 'Hủy theo dõi tác giả' : 'Theo dõi tác giả'}
                  >
                    {followLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : isFollowingAuthor ? (
                      <>
                        <UserCheck className="w-3 h-3 text-emerald-600" />
                        <span>Đang theo dõi</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3 h-3" />
                        <span>Theo dõi</span>
                      </>
                    )}
                  </button>
                ) : null}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span>{authorHandle}</span>
                <span>•</span>
                <span>{post?.formattedDate || post?.timeAgo || 'Vừa xong'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {post?.visibility === 'PRIVATE' ? (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs">
                <Lock className="w-3.5 h-3.5" /> Chỉ mình tôi
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-600 font-bold text-xs">
                <Globe className="w-3.5 h-3.5" /> Công khai
              </span>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              title="Đóng bài viết"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
            <span className="text-xs font-medium">Đang tải chi tiết bài viết...</span>
          </div>
        ) : post ? (
          <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-5">
            {/* Meta Tags: Category & Location */}
            <div className="flex items-center gap-2 flex-wrap">
              {post.category && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-sky-50 text-sky-700 text-xs font-bold border border-sky-100">
                  <Tag className="w-3.5 h-3.5 text-sky-500" />
                  {post.category}
                </span>
              )}
              {post.locationTag && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-sky-500" />
                  {post.locationTag}
                </span>
              )}
              {post.badgeText && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  {post.badgeText}
                </span>
              )}
            </div>

            {/* Post Title */}
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {post.title}
            </h2>

            {/* Post Content */}
            <div className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
              {post.content}
            </div>

            {/* Multimedia: Video Player */}
            {post.videoUrl && (
              <div className="rounded-2xl overflow-hidden bg-black shadow-md">
                <video
                  src={post.videoUrl}
                  controls
                  className="w-full max-h-[420px] object-contain"
                />
              </div>
            )}

            {/* Multimedia: Images Showcase */}
            {images.length > 0 && (
              <div className="space-y-3">
                {/* Main Selected Image */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 group">
                  <img
                    src={images[activeImageIndex]}
                    alt={`Ảnh ${activeImageIndex + 1}`}
                    className="w-full max-h-[460px] object-contain mx-auto transition-transform duration-300"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setActiveImageIndex(prev =>
                            prev === 0 ? images.length - 1 : prev - 1
                          )
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer opacity-90 hover:opacity-100"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() =>
                          setActiveImageIndex(prev =>
                            prev === images.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer opacity-90 hover:opacity-100"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 text-white text-xs font-bold backdrop-blur-xs">
                        {activeImageIndex + 1} / {images.length}
                      </span>
                    </>
                  )}
                </div>

                {/* Thumbnails row */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          activeImageIndex === idx
                            ? 'border-sky-500 ring-2 ring-sky-300'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img}
                          alt="thumb"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Attached Itinerary Card */}
            {(post.itineraryId || post.itineraryTitle) && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50/70 via-indigo-50/40 to-teal-50/60 border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Route className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-md">
                        Lịch trình đính kèm
                      </span>
                      {post.itineraryIsAi && (
                        <span className="flex items-center gap-0.5 text-[10px] text-amber-700 font-bold">
                          <Sparkles className="w-3 h-3 text-amber-500" /> AI Tạo
                        </span>
                      )}
                    </div>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 mt-0.5">
                      {post.itineraryTitle || 'Lịch trình khám phá'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {post.itineraryDestination || 'Điểm đến thú vị'} • Ngân sách:{' '}
                      <span className="font-bold text-emerald-600">
                        {Number(post.itineraryBudget || 0).toLocaleString('vi-VN')} đ
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (typeof onSelectItinerary === 'function') {
                      onSelectItinerary({
                        id: post.itineraryId,
                        title: post.itineraryTitle,
                        destination: post.itineraryDestination,
                        budgetTotal: post.itineraryBudget
                      });
                    }
                  }}
                  className="px-4 py-2 rounded-xl ocean-gradient text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:opacity-95 cursor-pointer shrink-0"
                >
                  <Eye className="w-4 h-4" />
                  <span>Xem lịch trình</span>
                </button>
              </div>
            )}

            {/* Social Interaction Buttons */}
            <div className="flex items-center justify-between py-3 border-y border-slate-100 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={handleToggleLike}
                  disabled={likeLoading}
                  className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                    isLiked
                      ? 'bg-rose-50 text-rose-600 font-bold'
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-500'
                    }`}
                  />
                  <span>{likeCount} Thích</span>
                </button>

                <div className="px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-slate-600">
                  <MessageCircle className="w-4 h-4 text-sky-600" />
                  <span>{comments.length} Bình luận</span>
                </div>
              </div>

              <button
                onClick={handleShare}
                className="px-3.5 py-2 rounded-xl hover:bg-slate-100 text-slate-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Chia sẻ liên kết"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Chia sẻ</span>
              </button>
            </div>

            {/* Comments List & Input */}
            <div className="space-y-4 pt-1">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <span>Bình luận</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-600 font-bold">
                  {comments.length}
                </span>
              </h3>

              {/* Add Comment Box */}
              <form onSubmit={handleAddComment} className="flex gap-2.5 items-start">
                <img
                  src={
                    currentUser?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                  }
                  alt="My avatar"
                  className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0 mt-0.5"
                />
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    placeholder="Viết cảm nghĩ hoặc lời khuyên của bạn..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!commentInput.trim() || submittingComment}
                    className="px-4 py-2 rounded-xl ocean-gradient text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:opacity-95 cursor-pointer disabled:opacity-50"
                  >
                    {submittingComment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">Gửi</span>
                  </button>
                </div>
              </form>

              {/* Comment Thread */}
              {loadingComments ? (
                <div className="flex items-center justify-center py-6 gap-2 text-slate-400 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
                  <span>Đang tải bình luận...</span>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nghĩ! 🌟
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {comments.map((c, i) => (
                    <div
                      key={c.id || i}
                      className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-start gap-3"
                    >
                      <img
                        src={
                          c.userAvatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                        }
                        alt={c.userName}
                        className="w-8 h-8 rounded-xl object-cover shrink-0 ring-1 ring-white"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-slate-900">
                            {c.userName || 'Du khách Wayfare'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {c.formattedDate || c.timeAgo || 'Vừa xong'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                          {c.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
};
