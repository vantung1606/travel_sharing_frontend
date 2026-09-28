import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../components/common/Toast';
import { postApi } from '../../../services/api';
import { ItineraryDetailModal } from '../../../components/itinerary/ItineraryDetailModal';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MapPin,
  Sparkles,
  Award,
  TrendingUp,
  Compass,
  Route,
  Copy,
  Calendar,
  DollarSign,
  Image as ImageIcon,
  Smile,
  CheckCircle2,
  Send,
  Search,
  SlidersHorizontal,
  Filter,
  Plus,
  X,
  Loader2,
  Eye,
  MoreHorizontal,
  Tag,
  ChevronRight,
  Layers,
  ExternalLink,
  Clock,
  ArrowRight,
  Flame,
  Check,
  UserCheck,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const CATEGORIES = [
  'Tất cả',
  'Ẩm thực & Check-in',
  'Phượt & Khám phá',
  'Biển đảo & Nghỉ dưỡng',
  'Có Lịch trình đính kèm'
];

export const CommunityPage = () => {
  const { currentUser, itineraries, setItineraries, setIsAIGeneratorOpen } = useApp();
  const toast = useToast();

  // Feed State
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSort, setActiveSort] = useState('newest'); // 'newest' | 'popular' | 'has_itinerary'
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState(new Set());

  // Create Post Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postLocation, setPostLocation] = useState('');
  const [postCategory, setPostCategory] = useState('Ẩm thực & Check-in');
  const [postImagesInput, setPostImagesInput] = useState('');
  const [attachedItineraryId, setAttachedItineraryId] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);

  // Itinerary Detail Modal State
  const [selectedItineraryForModal, setSelectedItineraryForModal] = useState(null);

  // Comments Drawer / Modal State
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [postComments, setPostComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Copying Tour Action State
  const [cloningPostId, setCloningPostId] = useState(null);

  // Fetch Posts from Backend
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const categoryParam = activeCategory === 'Có Lịch trình đính kèm' ? '' : activeCategory;
      const data = await postApi.getPosts({
        category: categoryParam,
        keyword: searchQuery
      });

      if (Array.isArray(data) && data.length > 0) {
        setPosts(data);
      } else {
        // Fallback demo posts if DB empty or starting up
        setPosts([]);
      }
    } catch (err) {
      console.warn('Failed to load posts from backend:', err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Filter & Sort Posts
  const displayPosts = useMemo(() => {
    let result = [...posts];

    if (activeCategory === 'Có Lịch trình đính kèm') {
      result = result.filter(p => p.itineraryId || p.itineraryTitle);
    }

    if (activeSort === 'popular') {
      result.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    } else if (activeSort === 'has_itinerary') {
      result.sort((a, b) => (b.itineraryId ? 1 : 0) - (a.itineraryId ? 1 : 0));
    } else {
      // Default: newest
      result.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    return result;
  }, [posts, activeCategory, activeSort]);

  // Handle Like Post
  const handleToggleLike = async (postId) => {
    // Optimistic Update
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const willLike = !p.isLiked;
          return {
            ...p,
            isLiked: willLike,
            likeCount: willLike ? (p.likeCount || 0) + 1 : Math.max(0, (p.likeCount || 0) - 1)
          };
        }
        return p;
      })
    );

    try {
      await postApi.toggleLike(postId);
    } catch (err) {
      toast.showError('Không thể cập nhật lượt thích: ' + err.message);
      // Revert if error
      fetchPosts();
    }
  };

  // Handle Bookmark Post
  const handleToggleBookmark = (postId) => {
    setBookmarkedPostIds(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
        toast.showInfo('Đã bỏ lưu bài viết khỏi bộ sưu tập');
      } else {
        next.add(postId);
        toast.showSuccess('Đã lưu bài viết vào Bộ sưu tập cá nhân ⭐');
      }
      return next;
    });
  };

  // Open Comments Drawer
  const handleOpenComments = async (post) => {
    setActiveCommentPost(post);
    setLoadingComments(true);
    setPostComments([]);
    try {
      const comments = await postApi.getComments(post.id);
      setPostComments(comments || []);
    } catch (err) {
      console.warn('Failed to load comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  // Submit New Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim() || !activeCommentPost) return;

    try {
      setSubmittingComment(true);
      const newComment = await postApi.addComment(activeCommentPost.id, commentInput.trim());

      setPostComments(prev => [...prev, newComment]);
      setCommentInput('');

      // Update post comment count locally
      setPosts(prev =>
        prev.map(p => (p.id === activeCommentPost.id ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p))
      );

      toast.showSuccess('Đã gửi bình luận của bạn thành công! 💬');
    } catch (err) {
      toast.showError('Không thể gửi bình luận: ' + err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle 1-Click Clone Itinerary from Community Post
  const handleCloneItinerary = async (post) => {
    if (!post.itineraryId) {
      toast.showWarning('Bài viết này không có lịch trình đính kèm.');
      return;
    }

    try {
      setCloningPostId(post.id);
      const result = await postApi.cloneItinerary(post.id);

      // Add to user's itineraries in AppContext
      if (result && result.itinerary) {
        setItineraries(prev => [result.itinerary, ...prev]);
      } else {
        // Fallback: mock duplicate object
        const mockCloned = {
          id: Date.now(),
          title: 'Bản sao: ' + (post.itineraryTitle || 'Chuyến đi ' + post.locationTag),
          destination: post.locationTag || 'Việt Nam',
          startDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          endDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
          budgetTotal: post.itineraryBudget || 5000000,
          coverImageUrl: post.images?.[0] || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
          isAiGenerated: true,
          status: 'ACTIVE'
        };
        setItineraries(prev => [mockCloned, ...prev]);
      }

      toast.showSuccess(
        `Đã sao chép thành công "${post.itineraryTitle || 'Lịch trình'}" vào kho Lịch trình của bạn! 🎉`
      );
    } catch (err) {
      toast.showError('Không thể sao chép lịch trình: ' + err.message);
    } finally {
      setCloningPostId(null);
    }
  };

  // Open Full Itinerary Modal from Post
  const handleViewItineraryDetails = (post) => {
    // Find matching itinerary in local state or craft representation
    const existing = itineraries.find(i => i.id === post.itineraryId);
    if (existing) {
      setSelectedItineraryForModal(existing);
    } else {
      // Synthesize itinerary object with rich itinerary details for modal
      setSelectedItineraryForModal({
        id: post.itineraryId,
        title: post.itineraryTitle || 'Lịch trình khám phá ' + post.locationTag,
        destination: post.locationTag || 'Điểm đến nổi bật',
        duration: post.itineraryDuration || '3N2Đ',
        budgetTotal: post.itineraryBudget || 4500000,
        coverImageUrl: post.images?.[0] || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
        isAiGenerated: post.itineraryIsAi ?? true,
        days: [
          {
            dayNumber: 1,
            title: `Ngày 1: Khám phá các điểm dừng chân nổi bật tại ${post.locationTag || 'điểm đến'}`,
            activities: [
              {
                time: '08:30 – 11:30',
                category: 'Văn hóa & Danh lam',
                title: `Check-in các biểu tượng danh thắng ${post.locationTag || ''}`,
                location: `${post.locationTag || 'Điểm nhấn'} Landmark`,
                address: `Khu vực trung tâm, ${post.locationTag || 'Việt Nam'}`,
                note: 'Khởi đầu tour với các địa danh biểu tượng và thưởng thức cà phê ngắm cảnh.',
                aiTip: 'Đến vào khung giờ sáng sớm để đón ánh nắng đẹp nhất và tránh đông đúc.',
                cost: 150000
              },
              {
                time: '14:30 – 17:30',
                category: 'Trải nghiệm & Khám phá',
                title: 'Trải nghiệm văn hóa & Ẩm thực địa phương',
                location: `Phố ẩm thực ${post.locationTag || ''}`,
                address: `Tuyến phố đặc sản, ${post.locationTag || 'Việt Nam'}`,
                note: 'Thưởng thức các món đặc sản theo gợi ý của cư dân bản địa.',
                aiTip: 'Hỏi giá trước và thử các món đặc sản mang đậm bản sắc vùng miền.',
                cost: 250000
              }
            ]
          },
          {
            dayNumber: 2,
            title: 'Ngày 2: Hoạt động trải nghiệm thiên nhiên & Hoà mình vào cảnh quan',
            activities: [
              {
                time: '09:00 – 16:30',
                category: 'Nghỉ dưỡng & Biển trời',
                title: 'Hành trình ngắm hoàng hôn & Khám phá cảnh quan thiên nhiên',
                location: `Vịnh & Thung lũng ngắm cảnh ${post.locationTag || ''}`,
                address: `Vùng ngoại ô sinh thái, ${post.locationTag || 'Việt Nam'}`,
                note: 'Check-in các góc view triệu đô đã được chia sẻ trong bài viết.',
                aiTip: 'Nên sạc đầy pin máy ảnh/điện thoại để ghi lại khoảnh khắc hoàng hôn.',
                cost: 450000
              }
            ]
          }
        ]
      });
    }
  };

  // Submit Create Post Form
  const handleCreatePostSubmit = async (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      toast.showWarning('Vui lòng nhập tiêu đề và nội dung bài viết.');
      return;
    }

    try {
      setSubmittingPost(true);
      const images = postImagesInput
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      const payload = {
        title: postTitle.trim(),
        content: postContent.trim(),
        locationTag: postLocation.trim() || 'Việt Nam',
        category: postCategory,
        images: images.length > 0 ? images : [
          'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80'
        ],
        itineraryId: attachedItineraryId ? Number(attachedItineraryId) : null
      };

      await postApi.createPost(payload);

      toast.showSuccess('Đã đăng bài viết thành công lên Cộng đồng Wayfare! 🚀');

      // Reset form
      setPostTitle('');
      setPostContent('');
      setPostLocation('');
      setPostCategory('Ẩm thực & Check-in');
      setPostImagesInput('');
      setAttachedItineraryId('');
      setIsCreateModalOpen(false);

      // Refresh posts
      fetchPosts();
    } catch (err) {
      toast.showError('Không thể tạo bài viết: ' + err.message);
    } finally {
      setSubmittingPost(false);
    }
  };

  // Selected itinerary preview for the creator modal
  const selectedTripPreview = useMemo(() => {
    if (!attachedItineraryId) return null;
    return itineraries.find(i => String(i.id) === String(attachedItineraryId));
  }, [attachedItineraryId, itineraries]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
      
      {/* 3-COLUMN DESKTOP GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: User Mini-Profile, Quick Nav, Trending Tags */}
        {/* ========================================================= */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col gap-5 sticky top-20">
          
          {/* User Profile Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-sky-100"
                />
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">
                  ✓
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm text-slate-900 truncate">{currentUser.name}</h3>
                <p className="text-xs text-slate-500 truncate">{currentUser.handle || '@wanderer'}</p>
                <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  <Award className="w-3 h-3 text-amber-600" />
                  <span>Wanderer Diamond</span>
                </div>
              </div>
            </div>

            {/* User Stats Grid */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-center border border-slate-100">
              <div>
                <span className="font-bold text-sm text-sky-600 block">{itineraries.length}</span>
                <span className="text-[10px] text-slate-500 font-semibold">Chuyến đi</span>
              </div>
              <div>
                <span className="font-bold text-sm text-amber-600 block">
                  {posts.filter(p => p.author?.email === currentUser.email).length}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">Bài viết</span>
              </div>
              <div>
                <span className="font-bold text-sm text-emerald-600 block">{bookmarkedPostIds.size}</span>
                <span className="text-[10px] text-slate-500 font-semibold">Đã lưu</span>
              </div>
            </div>

            {/* Quick Action Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full ocean-gradient text-white py-2.5 px-4 rounded-xl text-xs font-bold shadow-md shadow-sky-500/15 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Đăng bài & Đính kèm Tour</span>
            </button>
          </div>

          {/* Quick Navigation Links */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 pb-2">
              Khám phá Cộng đồng
            </h4>
            {[
              {
                label: 'Tất cả bài viết',
                icon: Compass,
                active: activeCategory === 'Tất cả',
                action: () => setActiveCategory('Tất cả')
              },
              {
                label: 'Tour có Lịch trình AI',
                icon: Route,
                active: activeCategory === 'Có Lịch trình đính kèm',
                action: () => setActiveCategory('Có Lịch trình đính kèm'),
                badge: 'Hot'
              },
              {
                label: 'Xu hướng (Nhiều Like)',
                icon: Flame,
                active: activeSort === 'popular',
                action: () => setActiveSort(activeSort === 'popular' ? 'newest' : 'popular')
              },
              {
                label: 'Bài viết đã lưu',
                icon: Bookmark,
                active: false,
                action: () => toast.showInfo(`Bạn đang lưu ${bookmarkedPostIds.size} bài viết trong bộ sưu tập.`)
              }
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={item.action}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  item.active
                    ? 'bg-sky-50 text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className={`w-4 h-4 ${item.active ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-600 font-bold text-[10px]">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Trending Topics & Hashtags */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-sky-600" />
                <span>Chủ đề nổi bật</span>
              </h4>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { tag: '#DaNangReview', count: '2.8k' },
                { tag: '#SanMayDaLat', count: '1.9k' },
                { tag: '#HaGiangPhuot', count: '1.4k' },
                { tag: '#PhuQuocGiaRe', count: '980' },
                { tag: '#CheckInVietnam', count: '5.1k' }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSearchQuery(item.tag.replace('#', ''))}
                  className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-sky-100 hover:text-sky-700 text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <span>{item.tag}</span>
                  <span className="text-[10px] text-slate-400">{item.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* WanderAI Community Insight */}
          <div className="bg-gradient-to-br from-sky-50 via-white to-amber-50 p-5 rounded-2xl border border-sky-100 shadow-sm space-y-2">
            <div className="flex items-center gap-1.5 text-sky-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Gợi ý du lịch thông minh</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có thể bấm <strong className="text-sky-700">"Sao chép Tour 1-Click"</strong> ở bất kỳ bài viết nào để tự động thêm toàn bộ lộ trình chi tiết vào kho cá nhân của bạn!
            </p>
          </div>

        </aside>

        {/* ========================================================= */}
        {/* CENTER COLUMN: Social Feed & Post Creator (6 cols) */}
        {/* ========================================================= */}
        <main className="col-span-1 lg:col-span-6 space-y-5">
          
          {/* Quick Create Post Bar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt="Avatar"
                className="w-11 h-11 rounded-full object-cover flex-shrink-0 ring-2 ring-slate-100"
              />
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full text-left bg-slate-50 hover:bg-slate-100 text-slate-400 px-4 py-3 rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center justify-between border border-slate-200/60"
              >
                <span>Chia sẻ review, ảnh đẹp hoặc đính kèm lịch trình của bạn...</span>
                <Sparkles className="w-4 h-4 text-sky-500" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-100 text-xs font-medium text-slate-600">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <ImageIcon className="w-4 h-4 text-sky-600" />
                <span className="hidden sm:inline">Ảnh/Video</span>
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <MapPin className="w-4 h-4 text-teal-600" />
                <span className="hidden sm:inline">Gắn địa điểm</span>
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-xl font-semibold transition-colors"
              >
                <Route className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">Đính kèm Lịch trình</span>
              </button>
              <button
                onClick={() => setIsAIGeneratorOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-sky-50 text-sky-800 hover:bg-sky-100 rounded-xl font-semibold transition-colors"
              >
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span className="hidden sm:inline">Tạo Tour AI</span>
              </button>
            </div>
          </div>

          {/* Search & Category Tabs */}
          <div className="space-y-3">
            {/* Search Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm bài viết theo địa điểm, tác giả hoặc nội dung..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Pills & Sorting Bar */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
              <div className="flex items-center gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-1.5 flex-shrink-0 text-xs font-semibold text-slate-500">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={activeSort}
                  onChange={e => setActiveSort(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-700 border-none outline-hidden cursor-pointer"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="popular">Nhiều like nhất</option>
                  <option value="has_itinerary">Có lịch trình</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="space-y-4">
              {[1, 2].map(n => (
                <div key={n} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm animate-pulse space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-slate-200" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-32 bg-slate-200 rounded" />
                      <div className="h-3 w-20 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="h-16 bg-slate-100 rounded-xl" />
                  <div className="h-48 bg-slate-200 rounded-2xl" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && displayPosts.length === 0 && (
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
                <Compass className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">Chưa tìm thấy bài viết phù hợp</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Hãy thử tìm kiếm với từ khóa khác, chọn danh mục khác hoặc là người đầu tiên chia sẻ chuyến đi của bạn!
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="ocean-gradient text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 hover:shadow-lg transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo bài viết ngay</span>
              </button>
            </div>
          )}

          {/* Social Posts Feed */}
          {!loading &&
            displayPosts.map(post => {
              const hasItinerary = Boolean(post.itineraryId || post.itineraryTitle);
              const isBookmarked = bookmarkedPostIds.has(post.id);

              return (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow"
                >
                  {/* Post Header: Author, Verification Badge, Time, Location */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={
                            post.author?.avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                          }
                          alt={post.author?.fullName || 'User'}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100"
                        />
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[8px] font-bold">
                          ✓
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                            {post.author?.fullName || 'Thành viên Wayfare'}
                          </h4>
                          {post.category && (
                            <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-bold">
                              {post.category}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span>{post.timeAgo || 'Vừa xong'}</span>
                          {post.locationTag && (
                            <>
                              <span>•</span>
                              <MapPin className="w-3 h-3 text-sky-600" />
                              <span className="text-slate-600 font-medium">{post.locationTag}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleBookmark(post.id)}
                        className={`p-2 rounded-xl transition-colors ${
                          isBookmarked ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                        title={isBookmarked ? 'Bỏ lưu' : 'Lưu bài viết'}
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Post Title & Content */}
                  <div>
                    {post.title && (
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-1.5 leading-snug">
                        {post.title}
                      </h3>
                    )}
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                  </div>

                  {/* Post Photos Display */}
                  {post.images && post.images.length > 0 && (
                    <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                      {post.images.length === 1 ? (
                        <img
                          src={post.images[0]}
                          alt="Post photo"
                          className="w-full max-h-96 object-cover hover:scale-[1.01] transition-transform duration-300"
                        />
                      ) : post.images.length === 2 ? (
                        <div className="grid grid-cols-2 gap-1.5 h-64 sm:h-80">
                          {post.images.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt={`Post photo ${i}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-12 gap-1.5 h-72 sm:h-84">
                          <div className="col-span-8 h-full">
                            <img
                              src={post.images[0]}
                              alt="Post photo 1"
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="col-span-4 grid grid-rows-2 gap-1.5 h-full">
                            <img
                              src={post.images[1]}
                              alt="Post photo 2"
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                            <div className="relative h-full">
                              <img
                                src={post.images[2]}
                                alt="Post photo 3"
                                className="w-full h-full object-cover"
                              />
                              {post.images.length > 3 && (
                                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold">
                                  +{post.images.length - 3} ảnh
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ATTACHED TOUR / ITINERARY CARD (The Key Integration Component!) */}
                  {hasItinerary && (
                    <div className="bg-gradient-to-r from-sky-50/90 via-teal-50/60 to-emerald-50/60 p-4 rounded-2xl border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl ocean-gradient flex items-center justify-center text-white flex-shrink-0 shadow-sm shadow-sky-500/20">
                          <Route className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              Lịch trình AI tối ưu
                            </span>
                            {post.itineraryDuration && (
                              <span className="text-xs font-bold text-sky-800 bg-sky-100/80 px-2 py-0.5 rounded-md">
                                {post.itineraryDuration}
                              </span>
                            )}
                          </div>
                          <h5 className="font-bold text-sm text-slate-900 mt-1">
                            {post.itineraryTitle || 'Lịch trình chi tiết đính kèm'}
                          </h5>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                            {post.itineraryBudget && (
                              <span className="font-bold text-emerald-600 flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                {Number(post.itineraryBudget).toLocaleString('vi-VN')} đ/người
                              </span>
                            )}
                            {post.itineraryPlacesCount > 0 && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  {post.itineraryPlacesCount} địa điểm dừng chân
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons for Attached Itinerary */}
                      <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
                        {/* Action 1: View Route Details in Modal */}
                        <button
                          onClick={() => handleViewItineraryDetails(post)}
                          className="px-3 py-2 rounded-xl bg-white border border-sky-200 text-sky-700 hover:bg-sky-50 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-sky-600" />
                          <span>Xem lộ trình</span>
                        </button>

                        {/* Action 2: 1-Click Clone to My Itineraries */}
                        <button
                          onClick={() => handleCloneItinerary(post)}
                          disabled={cloningPostId === post.id}
                          className="sparkle-btn text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                        >
                          {cloningPostId === post.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Đang chép...</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Sao chép Tour</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Post Interaction Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-4 sm:gap-6">
                      {/* Like Button */}
                      <button
                        onClick={() => handleToggleLike(post.id)}
                        className={`flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                          post.isLiked ? 'text-rose-500 scale-105' : 'hover:text-rose-500 text-slate-600'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>{post.likeCount || 0}</span>
                      </button>

                      {/* Comment Button */}
                      <button
                        onClick={() => handleOpenComments(post)}
                        className="flex items-center gap-1.5 font-semibold hover:text-sky-600 text-slate-600 transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 text-slate-400 group-hover:text-sky-600" />
                        <span>{post.commentCount || 0} bình luận</span>
                      </button>

                      {/* Share Button */}
                      <button
                        onClick={() => {
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(window.location.origin + `/community?post=${post.id}`);
                            toast.showSuccess('Đã sao chép liên kết bài viết vào khay nhớ tạm! 📋');
                          }
                        }}
                        className="flex items-center gap-1.5 font-semibold hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        <Share2 className="w-4 h-4 text-slate-400" />
                        <span className="hidden sm:inline">Chia sẻ</span>
                      </button>
                    </div>

                    {/* Report / Moderation status */}
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Đã kiểm duyệt AI</span>
                    </span>
                  </div>
                </article>
              );
            })}
        </main>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Trending Tours to Clone, Top Authors (3 cols) */}
        {/* ========================================================= */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col gap-5 sticky top-20">
          
          {/* Top Curated Tours to Clone 1-Click */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Route className="w-4 h-4 text-amber-500" />
                <span>Tour được sao chép nhiều</span>
              </h4>
            </div>

            <div className="space-y-3">
              {[
                {
                  title: 'Đà Nẵng - Hội An 4N3Đ',
                  tag: 'Đà Nẵng',
                  duration: '4N3Đ',
                  clones: '1.2k',
                  budget: '7.500.000đ',
                  img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=200&q=80'
                },
                {
                  title: 'Phượt Hà Giang Mùa Hoa',
                  tag: 'Hà Giang',
                  duration: '3N2Đ',
                  clones: '940',
                  budget: '3.200.000đ',
                  img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80'
                },
                {
                  title: 'Săn Hoàng Hôn Phú Quốc',
                  tag: 'Phú Quốc',
                  duration: '3N2Đ',
                  clones: '860',
                  budget: '5.500.000đ',
                  img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=200&q=80'
                }
              ].map((tour, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"
                >
                  <img
                    src={tour.img}
                    alt={tour.title}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold text-xs text-slate-900 truncate">{tour.title}</h5>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                      <span className="font-semibold text-emerald-600">{tour.budget}</span>
                      <span>•</span>
                      <span>{tour.clones} lượt chép</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      // Filter feed by location
                      setSearchQuery(tour.tag);
                      toast.showInfo(`Đang lọc bài viết cộng đồng về ${tour.tag}`);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 group-hover:text-sky-600 group-hover:bg-sky-50 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsAIGeneratorOpen(true)}
              className="w-full py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Tạo Tour Tùy Biến Với AI</span>
            </button>
          </div>

          {/* Top Travel Bloggers of the Month */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Top Tác Giả Tuần Này</span>
            </h4>

            <div className="space-y-3">
              {[
                {
                  name: 'Minh Anh',
                  handle: '@minhanh_travel',
                  trips: '18 Tour',
                  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
                  badge: 'Top 1'
                },
                {
                  name: 'Hoàng Nam Phượt',
                  handle: '@hoangnam_rider',
                  trips: '14 Tour',
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
                  badge: 'Top 2'
                },
                {
                  name: 'Linh Nguyễn',
                  handle: '@linh_coffee',
                  trips: '9 Tour',
                  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
                  badge: 'Top 3'
                }
              ].map((author, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-100"
                    />
                    <div className="min-w-0">
                      <h5 className="font-bold text-xs text-slate-900 truncate">{author.name}</h5>
                      <p className="text-[10px] text-slate-400 truncate">{author.trips}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold">
                    {author.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Community Guidelines Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs text-slate-500 space-y-2">
            <h5 className="font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Quy tắc Cộng đồng Wayfare</span>
            </h5>
            <p className="text-[11px] leading-relaxed">
              Tất cả bài viết và lộ trình được kiểm tra tự động bởi hệ thống AI Safety để đảm bảo tính an toàn, bảo vệ môi trường và ngăn chặn tin giả du lịch.
            </p>
          </div>

        </aside>

      </div>

      {/* ========================================================= */}
      {/* MODAL 1: CREATE POST WITH ATTACHED ITINERARY SELECTOR    */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Chia sẻ với Cộng đồng</h3>
                  <p className="text-xs text-slate-500">Kèm theo lịch trình từ kho cá nhân của bạn</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePostSubmit} className="space-y-4">
              {/* User preview */}
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-sky-100"
                />
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{currentUser.name}</h4>
                  <span className="text-[10px] text-slate-400">Đăng công khai trên toàn hệ thống</span>
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề bài viết *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Bí kíp du lịch Đà Nẵng 4N3Đ tự túc chỉ 3.5 triệu..."
                  value={postTitle}
                  onChange={e => setPostTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-semibold"
                  required
                />
              </div>

              {/* Category & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chủ đề</label>
                  <select
                    value={postCategory}
                    onChange={e => setPostCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  >
                    <option value="Ẩm thực & Check-in">Ẩm thực & Check-in</option>
                    <option value="Phượt & Khám phá">Phượt & Khám phá</option>
                    <option value="Biển đảo & Nghỉ dưỡng">Biển đảo & Nghỉ dưỡng</option>
                    <option value="Văn hóa & Lịch sử">Văn hóa & Lịch sử</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gắn địa điểm</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Ví dụ: Đà Nẵng, Sa Pa..."
                      value={postLocation}
                      onChange={e => setPostLocation(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Content textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung chia sẻ *</label>
                <textarea
                  rows={4}
                  placeholder="Chia sẻ kinh nghiệm, lưu ý quan trọng, các điểm ăn uống check-in không thể bỏ lỡ..."
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 resize-none"
                  required
                />
              </div>

              {/* ATTACH MY ITINERARY SELECTOR */}
              <div className="p-3.5 bg-sky-50/70 border border-sky-100 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                    <Route className="w-4 h-4 text-sky-600" />
                    <span>Đính kèm Chuyến đi từ "Lịch trình của tôi"</span>
                  </label>
                  {attachedItineraryId && (
                    <button
                      type="button"
                      onClick={() => setAttachedItineraryId('')}
                      className="text-[10px] text-rose-600 font-bold hover:underline"
                    >
                      Bỏ đính kèm
                    </button>
                  )}
                </div>

                <select
                  value={attachedItineraryId}
                  onChange={e => setAttachedItineraryId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-sky-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                >
                  <option value="">-- Không đính kèm chuyến đi --</option>
                  {itineraries.map(itin => (
                    <option key={itin.id} value={itin.id}>
                      {itin.title} ({itin.destination} - {Number(itin.budgetTotal || 0).toLocaleString('vi-VN')}đ)
                    </option>
                  ))}
                </select>

                {selectedTripPreview && (
                  <div className="bg-white p-3 rounded-xl border border-sky-100 flex items-center gap-3 mt-2 shadow-2xs">
                    <img
                      src={selectedTripPreview.coverImageUrl}
                      alt={selectedTripPreview.title}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-xs text-slate-900 truncate">
                        {selectedTripPreview.title}
                      </h5>
                      <p className="text-[11px] text-emerald-600 font-semibold">
                        Ngân sách: {Number(selectedTripPreview.budgetTotal || 0).toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  </div>
                )}
              </div>

              {/* Image URLs input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL Hình ảnh minh họa (Mỗi dòng một link)
                </label>
                <textarea
                  rows={2}
                  placeholder="https://images.unsplash.com/...&#10;https://images.unsplash.com/..."
                  value={postImagesInput}
                  onChange={e => setPostImagesInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 resize-none font-mono"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingPost}
                  className="ocean-gradient text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingPost ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang xuất bản...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Đăng bài viết</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: COMMENTS DRAWER / MODAL                          */}
      {/* ========================================================= */}
      {activeCommentPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-sky-600" />
                  <span>Bình luận bài viết</span>
                </h3>
                <p className="text-xs text-slate-500 truncate max-w-xs">{activeCommentPost.title}</p>
              </div>
              <button
                onClick={() => setActiveCommentPost(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-96">
              {loadingComments && (
                <div className="flex items-center justify-center py-8 text-slate-400 gap-2 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                  <span>Đang tải bình luận...</span>
                </div>
              )}

              {!loadingComments && postComments.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Chưa có bình luận nào. Hãy là người đầu tiên trao đổi!
                </div>
              )}

              {!loadingComments &&
                postComments.map((cmt, idx) => (
                  <div key={cmt.id || idx} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50">
                    <img
                      src={
                        cmt.userAvatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                      }
                      alt={cmt.userName || 'User'}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5"
                    />
                    <div className="flex-1 bg-slate-100/80 rounded-2xl px-3.5 py-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{cmt.userName || 'Thành viên'}</span>
                        <span className="text-[10px] text-slate-400">{cmt.timeAgo || 'Vừa xong'}</span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1 leading-relaxed">{cmt.content}</p>
                    </div>
                  </div>
                ))}
            </div>

            {/* Comment Input Box */}
            <form onSubmit={handleAddComment} className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                placeholder="Viết bình luận hoặc đặt câu hỏi về chuyến đi..."
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentInput.trim()}
                className="ocean-gradient text-white p-2.5 rounded-full hover:shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {submittingComment ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: FULL ITINERARY DETAIL MODAL                      */}
      {/* ========================================================= */}
      {selectedItineraryForModal && (
        <ItineraryDetailModal
          itinerary={selectedItineraryForModal}
          onClose={() => setSelectedItineraryForModal(null)}
        />
      )}

    </div>
  );
};
