import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../components/common/Toast';
import { postApi, uploadApi, userApi, itineraryApi, placeApi } from '../../../services/api';
import { useCommunityRealtime } from '../../../hooks/useCommunityRealtime';
import { ItineraryDetailModal } from '../../../components/itinerary/ItineraryDetailModal';
import { UserProfileModal } from '../../../components/community/UserProfileModal';
import { EditPostModal } from '../../../components/community/EditPostModal';
import { PostDetailModal } from '../../../components/community/PostDetailModal';
import { FollowListModal } from '../../../components/community/FollowListModal';
import { ShareModal } from '../../../components/community/ShareModal';
import { ReportPostModal } from '../../../components/community/ReportPostModal';
import { ImageLightboxModal } from '../../../components/community/ImageLightboxModal';
import { BlogArticleReaderModal } from '../../../components/community/BlogArticleReaderModal';
import { PostLikersModal } from '../../../components/community/PostLikersModal';
import { PlaceAttachCard } from '../../../components/community/PlaceAttachCard';
import { CustomSelect } from '../../../components/common/CustomSelect';
import { UserAvatar } from '../../../components/common/UserAvatar';
import { MentionSuggestionsDropdown, renderTextWithMentions } from '../../../components/community/MentionSuggestions';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RichPostContent } from '../../../components/community/RichTextToolbar';
import { ProposePlaceModal } from '../../../components/community/ProposePlaceModal';
import { getUserTier } from '../../../utils/tierSystem';
import { formatDisplayDateTime, formatDisplayTimeAgo } from '../../../utils/dateUtils';
import { AtSign, Heart, MessageCircle, MessageSquare, Share2, Bookmark, MapPin, Award, TrendingUp, Compass, Route, Copy, DollarSign, Camera, Image as ImageIcon, CheckCircle2, Send, Search, SlidersHorizontal, Filter, Plus, PlusCircle, X, Loader2, Eye, MoreHorizontal, ChevronLeft, ChevronRight, ArrowRight, Flame, Check, UserCheck, ShieldCheck, AlertCircle, AlertTriangle, ShieldAlert, Lock, Globe, Upload, Video, Trash2, Edit, UserPlus, CornerDownRight, Flag, EyeOff, BookOpen } from 'lucide-react';

const FEED_SCOPES = [
  { id: 'all', label: 'Khám phá dành cho bạn', icon: Compass },
  { id: 'following', label: 'Đang theo dõi', icon: UserCheck },
  { id: 'saved', label: 'Bài viết đã lưu', icon: Bookmark }
];

const TOPIC_FILTERS = [
  { id: 'Tất cả', label: 'Tất cả', icon: Compass },
  { id: 'checkin', label: 'Check-in', icon: MapPin },
  { id: 'itinerary', label: 'Lịch trình', icon: Route },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'food', label: 'Ẩm thực', icon: MapPin },
  { id: 'adventure', label: 'Phượt', icon: Flame },
  { id: 'beach', label: 'Biển đảo', icon: Globe }
];

const COMMUNITY_STORIES = [
  { id: 'dalat', location: 'Đà Lạt', tag: 'Đà Lạt', badge: '🌸', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80' },
  { id: 'danang', location: 'Đà Nẵng', tag: 'Đà Nẵng', badge: '🌊', image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=300&q=80' },
  { id: 'phuquoc', location: 'Phú Quốc', tag: 'Phú Quốc', badge: '🏖️', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80' },
  { id: 'hagiang', location: 'Hà Giang', tag: 'Hà Giang', badge: '🏍️', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=300&q=80' },
  { id: 'sapa', location: 'Sa Pa', tag: 'Sa Pa', badge: '🌾', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=300&q=80' },
  { id: 'ninhbinh', location: 'Ninh Bình', tag: 'Ninh Bình', badge: '🛶', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80' },
  { id: 'hoian', location: 'Hội An', tag: 'Hội An', badge: '🏮', image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=300&q=80' }
];



export const CommunityPage = () => {
  const {
    currentUser,
    isLoggedIn,
    setIsAuthModalOpen,
    setAuthMode,
    itineraries,
    setItineraries,
    setIsAIGeneratorOpen,
    fetchNotifications
  } = useApp();
  const toast = useToast();

  // Guard helper for guest actions (require login)
  const requireAuth = (actionName = 'thực hiện thao tác này') => {
    if (!isLoggedIn) {
      if (toast?.showInfo) toast.showInfo(`Vui lòng đăng nhập để ${actionName}!`);
      else if (toast?.info) toast.info(`Vui lòng đăng nhập để ${actionName}!`);
      setAuthMode('login');
      setIsAuthModalOpen(true);
      return false;
    }
    return true;
  };

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle navigating to direct chat with post author
  const handleDirectMessage = (author) => {
    if (!requireAuth(`nhắn tin với ${author?.name || 'tác giả'}`)) return;
    const targetId = author?.id || author?.userId;
    if (!targetId) return;
    const params = new URLSearchParams({
      userId: targetId,
      name: author?.name || author?.fullName || '',
      avatar: author?.avatar || author?.avatarUrl || ''
    }).toString();
    navigate(`/messages?${params}`);
  };

  // Feed State (SWR Instant Hydration)
  const [posts, setPosts] = useState(() => {
    try {
      const cached = sessionStorage.getItem('wayfare_community_posts_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      const cached = sessionStorage.getItem('wayfare_community_posts_cache');
      return !cached;
    } catch {
      return true;
    }
  });
  const [feedScope, setFeedScope] = useState('all'); // 'all' | 'following' | 'saved'
  const [topicFilter, setTopicFilter] = useState('Tất cả'); // 'Tất cả' | 'video' | 'itinerary' | 'food' | 'adventure' | 'beach'
  const [selectedHashtag, setSelectedHashtag] = useState('all'); // 'all' | 'KinhNghiem' | 'ReviewAmThuc' ...
  const [readingPost, setReadingPost] = useState(null); // Post currently in Blog Article Reader Mode
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSort, setActiveSort] = useState('newest'); // 'newest' | 'popular' | 'has_itinerary'
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState(new Set());

  // Create Post Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('Ẩm thực & Check-in');
  const [postVisibility, setPostVisibility] = useState('PUBLIC');
  const [postImagesList, setPostImagesList] = useState([]);
  const [postVideoUrl, setPostVideoUrl] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [attachedItineraryId, setAttachedItineraryId] = useState('');
  const [places, setPlaces] = useState([]);
  const [attachedPlaceId, setAttachedPlaceId] = useState('');
  const [isProposePlaceModalOpen, setIsProposePlaceModalOpen] = useState(false);
  const [submittingPost, setSubmittingPost] = useState(false);
  const createFileInputRef = useRef(null);
  const postTextareaRef = useRef(null);
  const [postMentionState, setPostMentionState] = useState({ isOpen: false, query: '', cursorIndex: -1 });
  const [taggedUsersInPost, setTaggedUsersInPost] = useState([]);

  // User Profile Modal State
  const [selectedUserIdForModal, setSelectedUserIdForModal] = useState(null);

  // Edit Post Modal State
  const [postToEdit, setPostToEdit] = useState(null);

  // Single Post Detail Modal State
  const [selectedPostForDetail, setSelectedPostForDetail] = useState(null);

  // Post Likers Modal State
  const [likersPost, setLikersPost] = useState(null);

  // Fullscreen Photo Lightbox State
  const [lightboxState, setLightboxState] = useState({
    isOpen: false,
    images: [],
    initialIndex: 0,
    post: null
  });

  const handleOpenLightbox = (post, initialIndex = 0, e = null) => {
    if (e) e.stopPropagation();
    if (!post?.images || post.images.length === 0) return;
    setLightboxState({
      isOpen: true,
      images: post.images,
      initialIndex: initialIndex,
      post: post
    });
  };

  // Topic Filter Bar Drag & Scroll Controls
  const topicScrollRef = useRef(null);
  const rightSidebarRef = useRef(null);
  const rightSidebarResetCount = useRef(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isDraggingTopics = useRef(false);
  const startTopicX = useRef(0);
  const startTopicScrollLeft = useRef(0);
  const hasDraggedTopics = useRef(false);

  const checkTopicScroll = useCallback(() => {
    const el = topicScrollRef.current;
    if (!el) return;
    const canLeft = el.scrollLeft > 6;
    const canRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 6;
    setCanScrollLeft(canLeft);
    setCanScrollRight(canRight);
  }, []);

  useEffect(() => {
    checkTopicScroll();
    window.addEventListener('resize', checkTopicScroll);
    return () => window.removeEventListener('resize', checkTopicScroll);
  }, [checkTopicScroll]);

  const handleTopicScrollLeft = () => {
    topicScrollRef.current?.scrollBy({ left: -220, behavior: 'smooth' });
    setTimeout(checkTopicScroll, 300);
  };

  const handleTopicScrollRight = () => {
    topicScrollRef.current?.scrollBy({ left: 220, behavior: 'smooth' });
    setTimeout(checkTopicScroll, 300);
  };

  const handleTopicMouseDown = (e) => {
    isDraggingTopics.current = true;
    startTopicX.current = e.pageX - (topicScrollRef.current?.offsetLeft || 0);
    startTopicScrollLeft.current = topicScrollRef.current?.scrollLeft || 0;
    hasDraggedTopics.current = false;
  };

  const handleTopicMouseMove = (e) => {
    if (!isDraggingTopics.current || !topicScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - topicScrollRef.current.offsetLeft;
    const walk = (x - startTopicX.current) * 1.5;
    if (Math.abs(walk) > 4) {
      hasDraggedTopics.current = true;
    }
    topicScrollRef.current.scrollLeft = startTopicScrollLeft.current - walk;
    checkTopicScroll();
  };

  const handleTopicMouseUpOrLeave = () => {
    isDraggingTopics.current = false;
  };

  // Share Modal State
  const [sharingPost, setSharingPost] = useState(null);

  // Post Actions Menu State
  const [openMenuPostId, setOpenMenuPostId] = useState(null);

  // Close post actions menu when clicking outside
  useEffect(() => {
    const handleGlobalClick = () => {
      setOpenMenuPostId(null);
    };
    if (openMenuPostId !== null) {
      document.addEventListener('click', handleGlobalClick);
    }
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [openMenuPostId]);

  // Report Post Modal State
  const [postToReport, setPostToReport] = useState(null);

  // Hidden Post IDs (User local hide preference)
  const [hiddenPostIds, setHiddenPostIds] = useState(new Set());

  // Facebook-style Expandable Post Content State ("... Xem thêm")
  const [expandedPostIds, setExpandedPostIds] = useState(new Set());
  const toggleExpandPost = (postId) => {
    setExpandedPostIds(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  // AI Moderation Scanning Step & Feedback State
  const [moderationStep, setModerationStep] = useState(0); // 0: idle, 1: text scan, 2: safety rules, 3: AI scoring
  const [moderationFeedback, setModerationFeedback] = useState(null); // { type, title, score, reason, message }

  // Itinerary Detail Modal State
  const [selectedItineraryForModal, setSelectedItineraryForModal] = useState(null);

  // Comments Drawer / Modal State
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [postComments, setPostComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // { commentId, authorId, authorName }
  const [submittingComment, setSubmittingComment] = useState(false);
  const commentInputRef = useRef(null);
  const [commentMentionState, setCommentMentionState] = useState({ isOpen: false, query: '', cursorIndex: -1 });

  // Copying Tour Action State
  const [cloningPostId, setCloningPostId] = useState(null);

  // Following Authors State
  const [followingIds, setFollowingIds] = useState(new Set());
  const [followingUsers, setFollowingUsers] = useState([]);
  const [followingLoadingIds, setFollowingLoadingIds] = useState(new Set());

  // Fetch full following user objects (only people current user follows can be tagged)
  const fetchFollowingUsers = useCallback(async () => {
    if (!isLoggedIn) {
      setFollowingUsers([]);
      return;
    }
    const myUserId = currentUser?.id || currentUser?.userId;
    const myEmail = currentUser?.email;
    try {
      const list = await userApi.getFollowing(myUserId, myEmail);
      if (Array.isArray(list)) {
        setFollowingUsers(list);
      }
    } catch (err) {
      console.warn('Lỗi khi tải danh sách người theo dõi để gắn thẻ:', err);
    }
  }, [isLoggedIn, currentUser]);

  useEffect(() => {
    fetchFollowingUsers();
    const handleFollowSync = () => fetchFollowingUsers();
    window.addEventListener('wayfare_follow_changed', handleFollowSync);
    return () => window.removeEventListener('wayfare_follow_changed', handleFollowSync);
  }, [fetchFollowingUsers]);

  // Follow List Modal State (Followers & Following)
  const [followListModalState, setFollowListModalState] = useState({
    isOpen: false,
    tab: 'following',
    userId: null,
    userName: ''
  });

  // Fetch Following IDs on mount (only for logged-in users)
  useEffect(() => {
    if (!isLoggedIn) {
      setFollowingIds(new Set());
      return;
    }
    userApi
      .getFollowingIds()
      .then(ids => {
        if (Array.isArray(ids)) {
          setFollowingIds(new Set(ids.map(Number)));
        }
      })
      .catch(err => console.warn('Lỗi khi tải danh sách theo dõi:', err));
  }, [isLoggedIn]);

  // Fetch Bookmarked Post IDs on mount & user change (only for logged-in users)
  useEffect(() => {
    let isMounted = true;
    if (!isLoggedIn || !currentUser?.email) {
      setBookmarkedPostIds(new Set());
      return;
    }
    postApi
      .getBookmarkedPostIds(currentUser?.email)
      .then(ids => {
        if (isMounted && Array.isArray(ids)) {
          setBookmarkedPostIds(new Set(ids.map(Number)));
        }
      })
      .catch(err => console.warn('Lỗi khi tải danh sách bài viết đã lưu:', err));
    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, currentUser?.email]);

  const handleToggleFollowAuthor = async (authorId, authorName) => {
    if (!authorId) return;
    if (!requireAuth('theo dõi tác giả')) return;
    try {
      setFollowingLoadingIds(prev => new Set(prev).add(authorId));
      const res = await userApi.toggleFollow(authorId);
      const isNowFollowing = res?.isFollowing;
      setFollowingIds(prev => {
        const next = new Set(prev);
        if (isNowFollowing) {
          next.add(Number(authorId));
          toast.showSuccess(`Đã theo dõi ${authorName || 'tác giả'}! ✨`);
        } else {
          next.delete(Number(authorId));
          toast.showInfo(`Đã hủy theo dõi ${authorName || 'tác giả'}`);
        }
        return next;
      });
      window.dispatchEvent(new CustomEvent('wayfare_follow_changed'));
      fetchFollowingUsers();
    } catch (err) {
      toast.showError('Thao tác theo dõi thất bại: ' + err.message);
    } finally {
      setFollowingLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(authorId);
        return next;
      });
    }
  };

  // Handle @mention typing in Create Post Content
  const handlePostContentChange = (e) => {
    const val = e.target.value;
    const cursor = e.target.selectionStart;
    setPostContent(val);
    const textBefore = val.slice(0, cursor);
    const match = textBefore.match(/@([^\s@]*)$/);
    if (match) {
      setPostMentionState({
        isOpen: true,
        query: match[1],
        cursorIndex: match.index
      });
    } else {
      setPostMentionState({ isOpen: false, query: '', cursorIndex: -1 });
    }
  };

  const handleSelectPostMention = (user) => {
    const userName = user.fullName || user.name || 'user';
    const tag = `@${userName} `;
    let newText = '';
    if (postMentionState.cursorIndex >= 0) {
      const before = postContent.slice(0, postMentionState.cursorIndex);
      const after = postContent.slice(postMentionState.cursorIndex + 1 + postMentionState.query.length);
      newText = `${before}${tag}${after}`;
    } else {
      newText = postContent ? `${postContent} ${tag}` : tag;
    }
    setPostContent(newText);
    setPostMentionState({ isOpen: false, query: '', cursorIndex: -1 });
    setTaggedUsersInPost(prev => {
      if (prev.some(u => u.id === user.id)) return prev;
      return [...prev, user];
    });
    setTimeout(() => postTextareaRef.current?.focus(), 50);
  };

  const handleRemoveTaggedUser = (userId) => {
    setTaggedUsersInPost(prev => prev.filter(u => u.id !== userId));
  };

  // Handle @mention typing in Comments Drawer
  const handleCommentInputChange = (e) => {
    const val = e.target.value;
    const cursor = e.target.selectionStart;
    setCommentInput(val);
    const textBefore = val.slice(0, cursor);
    const match = textBefore.match(/@([^\s@]*)$/);
    if (match) {
      setCommentMentionState({
        isOpen: true,
        query: match[1],
        cursorIndex: match.index
      });
    } else {
      setCommentMentionState({ isOpen: false, query: '', cursorIndex: -1 });
    }
  };

  const handleSelectCommentMention = (user) => {
    const userName = user.fullName || user.name || 'user';
    const tag = `@${userName} `;
    let newText = '';
    if (commentMentionState.cursorIndex >= 0) {
      const before = commentInput.slice(0, commentMentionState.cursorIndex);
      const after = commentInput.slice(commentMentionState.cursorIndex + 1 + commentMentionState.query.length);
      newText = `${before}${tag}${after}`;
    } else {
      newText = commentInput ? `${commentInput} ${tag}` : tag;
    }
    setCommentInput(newText);
    setCommentMentionState({ isOpen: false, query: '', cursorIndex: -1 });
    setTimeout(() => commentInputRef.current?.focus(), 50);
  };

  // Fetch Posts from Backend
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      if (feedScope === 'saved') {
        const bookmarkedList = await postApi.getBookmarkedPosts(currentUser?.email);
        if (Array.isArray(bookmarkedList)) {
          setPosts(bookmarkedList);
          setBookmarkedPostIds(new Set(bookmarkedList.map(p => Number(p.id))));
        } else {
          setPosts([]);
        }
        return;
      }

      const data = await postApi.getPosts({
        keyword: searchQuery,
        email: currentUser?.email
      });

      if (Array.isArray(data) && data.length > 0) {
        setPosts(data);
        if (feedScope === 'all' && !searchQuery) {
          try {
            sessionStorage.setItem('wayfare_community_posts_cache', JSON.stringify(data));
          } catch {
            // Ignore storage quota
          }
        }
        // Synchronize bookmarked IDs from posts
        setBookmarkedPostIds(prev => {
          const next = new Set(prev);
          data.forEach(p => {
            if (p.isBookmarked) next.add(Number(p.id));
          });
          return next;
        });
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.warn('Failed to load posts from backend:', err);
    } finally {
      setLoading(false);
    }
  }, [feedScope, searchQuery, currentUser?.email]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Realtime community events (SSE): live comment & like counters + live comment drawer
  useCommunityRealtime((event) => {
    if (!event?.postId) return;
    const eventPostId = Number(event.postId);
    const isMine = Boolean(currentUser?.email) && event.actorEmail === currentUser.email;

    if (event.type === 'COMMENT_ADDED' || event.type === 'COMMENT_DELETED') {
      if (typeof event.commentCount === 'number') {
        setPosts(prev =>
          prev.map(p => (Number(p.id) === eventPostId ? { ...p, commentCount: event.commentCount } : p))
        );
      }
      // Own actions are already applied optimistically; only sync others' changes into the open drawer
      if (!isMine && activeCommentPost && Number(activeCommentPost.id) === eventPostId) {
        postApi
          .getComments(eventPostId)
          .then(comments => {
            setPostComments(comments || []);
            if (event.type === 'COMMENT_ADDED') toast?.showInfo?.('💬 Có bình luận mới vừa được thêm');
          })
          .catch(err => console.warn('[Realtime] Failed to refresh comments:', err));
      }
    } else if (event.type === 'LIKE_CHANGED' && !isMine && event.likeCount !== undefined && event.likeCount !== null) {
      setPosts(prev =>
        prev.map(p => (Number(p.id) === eventPostId ? { ...p, likeCount: Number(event.likeCount) } : p))
      );
    }
  });

  // Handle URL query ?postId=<id> or ?post=<id> to auto-open post detail modal from notification or share link
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetPostId = urlParams.get('postId') || urlParams.get('post');
    if (targetPostId) {
      const found = posts.find(p => String(p.id) === String(targetPostId));
      if (found) {
        setSelectedPostForDetail(found);
      } else {
        postApi.getById(targetPostId, currentUser?.email)
          .then(data => {
            if (data) setSelectedPostForDetail(data);
          })
          .catch(err => console.warn('Could not fetch target deep link post:', err));
      }
    }
  }, [posts, currentUser?.email]);

  // Real System Itineraries for "Tour được sao chép nhiều"
  const [trendingTours, setTrendingTours] = useState([]);

  useEffect(() => {
    let isMounted = true;
    itineraryApi.getAllItineraries()
      .then(data => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setTrendingTours(data.slice(0, 4));
        }
      })
      .catch(err => console.warn('Could not load trending itineraries:', err));
    return () => { isMounted = false; };
  }, []);

  // Load Active Places for Check-in Selection
  useEffect(() => {
    let isMounted = true;
    placeApi.getPlaces({ status: 'ACTIVE' })
      .then(data => {
        if (isMounted && Array.isArray(data)) {
          setPlaces(data);
        }
      })
      .catch(err => console.warn('Could not load places for check-in:', err));
    return () => { isMounted = false; };
  }, []);

  // Real Top Authors computed from live community posts & active creators
  const topAuthors = useMemo(() => {
    const authorMap = new Map();
    posts.forEach(p => {
      // Chỉ tính các bài viết đã được duyệt công khai (ACTIVE)
      if (p.status && p.status !== 'ACTIVE') return;

      const aId = p.authorId || p.author?.id;
      if (!aId) return;
      if (!authorMap.has(aId)) {
        authorMap.set(aId, {
          id: aId,
          name: p.authorName || p.author?.fullName || 'Thành viên Wayfare',
          handle: p.authorHandle || p.author?.handle || '@wayfarer',
          avatar: p.authorAvatar || p.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          email: p.authorEmail || p.author?.email || '',
          postsCount: 0
        });
      }
      authorMap.get(aId).postsCount += 1;
    });

    let list = Array.from(authorMap.values()).sort((a, b) => b.postsCount - a.postsCount);

    // Complement with platform creators if needed
    const defaultCreators = [
      { id: 2, name: 'Linh Hoàng', handle: '@linh_wanderer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', email: 'linh@gmail.com', postsCount: 6 },
      { id: 3, name: 'Minh Anh', handle: '@minhanh_travel', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', email: 'minhanh@gmail.com', postsCount: 4 },
      { id: 4, name: 'Hoàng Nam', handle: '@hoangnam_rider', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', email: 'hoangnam@gmail.com', postsCount: 3 }
    ];

    defaultCreators.forEach(dc => {
      if (!authorMap.has(dc.id)) {
        list.push(dc);
      }
    });

    return list.slice(0, 5);
  }, [posts]);

  // Keep the discovery rail at the top after async data hydrates.
  useEffect(() => {
    if (rightSidebarResetCount.current >= 3) return;
    if (!trendingTours.length && !topAuthors.length) return;
    rightSidebarResetCount.current += 1;
    const timer = setTimeout(() => {
      if (rightSidebarRef.current) rightSidebarRef.current.scrollTop = 0;
    }, 60);
    return () => clearTimeout(timer);
  }, [trendingTours.length, topAuthors.length]);

  // Filter & Sort Posts
  const displayPosts = useMemo(() => {
    let result = [...posts];

    // Filter out posts hidden locally by user
    if (hiddenPostIds.size > 0) {
      result = result.filter(p => !hiddenPostIds.has(p.id));
    }

    // Filter by Search Query (with hashtag & tags support)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim().replace(/^#/, '');
      const normalize = (str) =>
        (str || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[đĐ]/g, 'd');
      const qNorm = normalize(q);

      result = result.filter(p => {
        const fullText = `${p.title || ''} ${p.content || ''} ${p.tags || ''} ${p.category || ''} ${p.locationTag || ''} ${p.destination || ''} ${p.location || ''} ${p.authorName || ''} ${p.author?.fullName || ''} ${p.author?.username || ''}`;
        return fullText.toLowerCase().includes(q) || normalize(fullText).includes(qNorm);
      });
    }

    // 1. Filter by Feed Scope (Nguồn cấp tin)
    if (feedScope === 'following') {
      result = result.filter(p => followingIds.has(Number(p.authorId || p.author?.id)));
    } else if (feedScope === 'saved') {
      result = result.filter(p => bookmarkedPostIds.has(Number(p.id)) || Boolean(p.isBookmarked));
    }

    // 2. Filter by Topic / Media format (Chủ đề & Định dạng)
    if (topicFilter === 'checkin') {
      result = result.filter(p => Boolean(p.placeId || p.placeName || (p.sharedPost && (p.sharedPost.placeId || p.sharedPost.placeName))));
    } else if (topicFilter === 'video') {
      result = result.filter(p => Boolean(p.videoUrl));
    } else if (topicFilter === 'itinerary') {
      result = result.filter(p => p.itineraryId || p.itineraryTitle || (p.sharedPost && (p.sharedPost.itineraryId || p.sharedPost.itineraryTitle)));
    } else if (topicFilter === 'food') {
      result = result.filter(p =>
        (p.tags && (p.tags.toLowerCase().includes('ẩm thực') || p.tags.toLowerCase().includes('check-in') || p.tags.toLowerCase().includes('food'))) ||
        (p.category && p.category.toLowerCase().includes('ẩm thực')) ||
        (p.content && (p.content.toLowerCase().includes('ẩm thực') || p.content.toLowerCase().includes('món') || p.content.toLowerCase().includes('quán') || p.content.toLowerCase().includes('check-in')))
      );
    } else if (topicFilter === 'adventure') {
      result = result.filter(p =>
        (p.tags && (p.tags.toLowerCase().includes('phượt') || p.tags.toLowerCase().includes('khám phá') || p.tags.toLowerCase().includes('trekking'))) ||
        (p.category && (p.category.toLowerCase().includes('phượt') || p.category.toLowerCase().includes('khám phá'))) ||
        (p.content && (p.content.toLowerCase().includes('phượt') || p.content.toLowerCase().includes('khám phá') || p.content.toLowerCase().includes('đèo') || p.content.toLowerCase().includes('núi')))
      );
    } else if (topicFilter === 'beach') {
      result = result.filter(p =>
        (p.tags && (p.tags.toLowerCase().includes('biển') || p.tags.toLowerCase().includes('đảo') || p.tags.toLowerCase().includes('nghỉ dưỡng') || p.tags.toLowerCase().includes('resort'))) ||
        (p.category && (p.category.toLowerCase().includes('biển') || p.category.toLowerCase().includes('nghỉ dưỡng'))) ||
        (p.content && (p.content.toLowerCase().includes('biển') || p.content.toLowerCase().includes('đảo') || p.content.toLowerCase().includes('nghỉ dưỡng') || p.content.toLowerCase().includes('resort')))
      );
    }

    // 3. Filter by Travel Hashtag (#KinhNghiem, #DaLat, etc.)
    if (selectedHashtag !== 'all') {
      const tagMapping = {
        KinhNghiem: ['kinh nghiệm', 'kinhnghiem', 'tips', 'bí kíp', 'cẩm nang'],
        ReviewAmThuc: ['ẩm thực', 'quán', 'món', 'ăn', 'food', 'reviewamthuc'],
        PhuotSolo: ['phượt', 'solo', 'độc hành', 'xe máy', 'phuotsolo'],
        DaLat: ['đà lạt', 'dalat', 'lâm đồng'],
        HaGiang: ['hà giang', 'hagiang', 'mã pí lèng', 'đồng văn'],
        SaPa: ['sa pa', 'sapa', 'lào cai', 'fansipan'],
        PhuQuoc: ['phú quốc', 'phuquoc', 'kiên giang'],
        DaNang: ['đà nẵng', 'danang', 'bà nà'],
        CheckIn: ['check-in', 'checkin', 'sống ảo', 'view đẹp', 'ảnh đẹp'],
        TietKiem: ['tiết kiệm', 'tietkiem', 'giá rẻ', 'chi phí', 'budget']
      };
      const keywords = tagMapping[selectedHashtag] || [selectedHashtag.toLowerCase()];
      result = result.filter(p => {
        const text = `${p.title || ''} ${p.content || ''} ${p.tags || ''} ${p.category || ''} ${p.locationTag || ''}`.toLowerCase();
        return keywords.some(kw => text.includes(kw));
      });
    }

    // Sort
    if (activeSort === 'popular') {
      result.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    } else if (activeSort === 'has_itinerary') {
      result.sort((a, b) => (b.itineraryId ? 1 : 0) - (a.itineraryId ? 1 : 0));
    } else {
      // Default: newest
      result.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    return result;
  }, [posts, feedScope, topicFilter, selectedHashtag, activeSort, followingIds, bookmarkedPostIds, searchQuery, hiddenPostIds]);

  // Pagination State for Feed
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [feedScope, topicFilter, selectedHashtag, searchQuery, activeSort]);

  const totalPages = Math.ceil(displayPosts.length / postsPerPage) || 1;
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    return displayPosts.slice(startIndex, startIndex + postsPerPage);
  }, [displayPosts, currentPage, postsPerPage]);

  const generatePageNumbers = (current, total) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 pt-4 sm:pt-6 pb-2 border-t border-[#1E1A15]/10 mt-4 sm:mt-6">
        <p className="text-[11px] sm:text-xs text-[#6B6154] font-medium">
          Hiển thị <strong className="text-[#1E1A15] font-bold">{(currentPage - 1) * postsPerPage + 1}</strong> - <strong className="text-[#1E1A15] font-bold">{Math.min(currentPage * postsPerPage, displayPosts.length)}</strong> trong số <strong className="text-[#1E1A15] font-bold">{displayPosts.length}</strong> bài viết
        </p>

        <div className="flex items-center gap-1 flex-wrap justify-center">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => {
              setCurrentPage((p) => Math.max(p - 1, 1));
              window.scrollTo({ top: 380, behavior: 'smooth' });
            }}
            className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-sm border border-[#1E1A15]/10 bg-[#FFFDF8] hover:bg-[#F8F4EC] text-xs font-bold text-[#3B332A] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 transition-all "
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Trước</span>
          </button>

          {generatePageNumbers(currentPage, totalPages).map((p, idx) => (
            typeof p === 'number' ? (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCurrentPage(p);
                  window.scrollTo({ top: 380, behavior: 'smooth' });
                }}
                className={`min-w-[28px] sm:min-w-[32px] h-7 sm:h-8 px-1.5 sm:px-2 rounded-sm text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  currentPage === p
                    ? 'bg-sky-600 text-white '
                    : 'bg-[#FFFDF8] hover:bg-[#F3EDE2] text-[#3B332A] border border-[#1E1A15]/10 '
                }`}
              >
                {p}
              </button>
            ) : (
              <span key={idx} className="px-1 text-xs text-[#8A7F70] font-bold">
                {p}
              </span>
            )
          ))}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => {
              setCurrentPage((p) => Math.min(p + 1, totalPages));
              window.scrollTo({ top: 380, behavior: 'smooth' });
            }}
            className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-sm border border-[#1E1A15]/10 bg-[#FFFDF8] hover:bg-[#F8F4EC] text-xs font-bold text-[#3B332A] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 transition-all "
          >
            <span className="hidden sm:inline">Sau</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  // Handle Like Post
  const handleToggleLike = async (postId) => {
    if (!requireAuth('thích bài viết')) return;
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
      const res = await postApi.toggleLike(postId, currentUser?.email);
      if (res?.isLiked !== undefined) {
        setPosts(prev =>
          prev.map(p => {
            if (p.id === postId) {
              return {
                ...p,
                isLiked: res.isLiked,
                likeCount: res.likeCount !== undefined ? res.likeCount : p.likeCount
              };
            }
            return p;
          })
        );
      }
    } catch (err) {
      if (toast?.showError) toast.showError('Không thể cập nhật lượt thích: ' + err.message);
      else if (toast?.error) toast.error('Không thể cập nhật lượt thích: ' + err.message);
      fetchPosts();
    }
  };

  // Handle Bookmark Post with persistent backend API & optimistic UI
  const handleToggleBookmark = async (postId) => {
    if (!postId) return;
    if (!requireAuth('lưu bài viết vào bộ sưu tập')) return;
    const numericId = Number(postId);
    const wasBookmarked = bookmarkedPostIds.has(numericId);

    // Optimistic UI update
    setBookmarkedPostIds(prev => {
      const next = new Set(prev);
      if (wasBookmarked) {
        next.delete(numericId);
      } else {
        next.add(numericId);
      }
      return next;
    });

    setPosts(prev =>
      prev.map(p => {
        if (Number(p.id) === numericId) {
          return { ...p, isBookmarked: !wasBookmarked };
        }
        return p;
      })
    );

    try {
      const res = await postApi.toggleBookmark(numericId, currentUser?.email);
      const isNowBookmarked = res?.isBookmarked !== undefined ? res.isBookmarked : !wasBookmarked;

      // Final synchronization with server-returned state
      setBookmarkedPostIds(prev => {
        const next = new Set(prev);
        if (isNowBookmarked) {
          next.add(numericId);
        } else {
          next.delete(numericId);
        }
        return next;
      });

      setPosts(prev =>
        prev.map(p => {
          if (Number(p.id) === numericId) {
            return { ...p, isBookmarked: isNowBookmarked };
          }
          return p;
        })
      );

      if (isNowBookmarked) {
        if (toast?.showSuccess) toast.showSuccess('Đã lưu bài viết vào Bộ sưu tập cá nhân ⭐');
        else if (toast?.success) toast.success('Đã lưu bài viết vào Bộ sưu tập cá nhân ⭐');
      } else {
        if (toast?.showInfo) toast.showInfo('Đã bỏ lưu bài viết khỏi bộ sưu tập');
        else if (toast?.info) toast.info('Đã bỏ lưu bài viết khỏi bộ sưu tập');
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      // Revert if error
      setBookmarkedPostIds(prev => {
        const next = new Set(prev);
        if (wasBookmarked) {
          next.add(numericId);
        } else {
          next.delete(numericId);
        }
        return next;
      });
      setPosts(prev =>
        prev.map(p => {
          if (Number(p.id) === numericId) {
            return { ...p, isBookmarked: wasBookmarked };
          }
          return p;
        })
      );
      if (toast?.showError) toast.showError('Thao tác lưu bài viết thất bại: ' + (err.message || 'Lỗi kết nối'));
      else if (toast?.error) toast.error('Thao tác lưu bài viết thất bại: ' + (err.message || 'Lỗi kết nối'));
    }
  };

  // Open Comments Drawer
  const handleOpenComments = async (post) => {
    setActiveCommentPost(post);
    setReplyingTo(null);
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

  // Submit New Comment or Reply
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!requireAuth('bình luận')) return;
    if (!commentInput.trim() || !activeCommentPost || submittingComment) return;

    try {
      setSubmittingComment(true);
      const payload = {
        content: commentInput.trim(),
        parentId: replyingTo?.commentId || null,
        replyToUserId: replyingTo?.authorId || null
      };

      const newComment = await postApi.addComment(activeCommentPost.id, payload, currentUser?.email);

      if (replyingTo?.commentId) {
        setPostComments(prev =>
          prev.map(c => {
            if (c.id === replyingTo.commentId) {
              return {
                ...c,
                replies: [...(c.replies || []), newComment]
              };
            }
            return c;
          })
        );
      } else {
        setPostComments(prev => [...prev, newComment]);
      }

      setCommentInput('');
      setReplyingTo(null);

      // Update post comment count locally
      setPosts(prev =>
        prev.map(p => (p.id === activeCommentPost.id ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p))
      );

    } catch (err) {
      if (toast?.showError) toast.showError('Không thể gửi bình luận: ' + err.message);
      else if (toast?.error) toast.error('Không thể gửi bình luận: ' + err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle Delete Comment
  const handleDeleteComment = async (commentId) => {
    if (!activeCommentPost) return;
    try {
      await postApi.deleteComment(activeCommentPost.id, commentId, currentUser?.email);
      setPostComments(prev =>
        prev
          .filter(c => c.id !== commentId)
          .map(c => ({
            ...c,
            replies: c.replies ? c.replies.filter(r => r.id !== commentId) : []
          }))
      );
      setPosts(prev =>
        prev.map(p =>
          p.id === activeCommentPost.id
            ? { ...p, commentCount: Math.max(0, (p.commentCount || 1) - 1) }
            : p
        )
      );
      setActiveCommentPost(prev =>
        prev ? { ...prev, commentCount: Math.max(0, (prev.commentCount || 1) - 1) } : null
      );
      if (toast?.showSuccess) toast.showSuccess('Đã xóa bình luận thành công!');
      else if (toast?.success) toast.success('Đã xóa bình luận thành công!');
    } catch (err) {
      if (toast?.showError) toast.showError('Không thể xóa bình luận: ' + err.message);
      else if (toast?.error) toast.error('Không thể xóa bình luận: ' + err.message);
    }
  };

  // Handle Copy Post Link
  const handleCopyPostLink = async (post) => {
    const url = `${window.location.origin}/community?postId=${post.id}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        if (toast?.showSuccess) toast.showSuccess('Đã sao chép liên kết bài viết vào bộ nhớ tạm! 📋');
        else if (toast?.success) toast.success('Đã sao chép liên kết bài viết vào bộ nhớ tạm! 📋');
      }
    } catch (err) {
      if (toast?.showInfo) toast.showInfo(`Liên kết: ${url}`);
      else if (toast?.info) toast.info(`Liên kết: ${url}`);
    }
    setOpenMenuPostId(null);
  };

  // Handle 1-Click Clone Itinerary from Community Post
  const handleCloneItinerary = async (post) => {
    if (!requireAuth('sao chép lịch trình')) return;
    if (!post.itineraryId) {
      toast.showWarning('Bài viết này không có lịch trình đính kèm.');
      return;
    }

    if (
      (post.authorId && currentUser?.id && post.authorId === currentUser.id) ||
      (post.authorEmail && currentUser?.email && post.authorEmail === currentUser.email) ||
      (post.userId && currentUser?.id && post.userId === currentUser.id)
    ) {
      toast.showWarning('Bạn là tác giả của bài viết/lịch trình này nên không thể tự sao chép!');
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn sao chép lịch trình "${post.itineraryTitle || 'Lịch trình'}" vào kho chuyến đi của bạn không?`)) {
      return;
    }

    try {
      setCloningPostId(post.id);
      const result = await postApi.cloneItinerary(post.id);

      if (result && result.itinerary) {
        setItineraries(prev => [result.itinerary, ...prev]);
        toast.showSuccess(
          `Đã sao chép thành công "${post.itineraryTitle || 'Lịch trình'}" vào kho Lịch trình của bạn! 🎉`
        );
      } else {
        throw new Error('Máy chủ không phản hồi lịch trình nhân bản.');
      }
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
        duration: post.itineraryDuration || '',
        budgetTotal: post.itineraryBudget || 0,
        coverImageUrl: post.images?.[0] || null,
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

  // Upload Media for Create Modal
  const handleUploadMediaForCreate = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingMedia(true);
      const uploadedUrls = await uploadApi.uploadFiles(files);
      if (uploadedUrls && uploadedUrls.length > 0) {
        const newImages = [...postImagesList];
        uploadedUrls.forEach(url => {
          if (url.match(/\.(mp4|webm|mov|mkv)$/i)) {
            setPostVideoUrl(url);
          } else {
            newImages.push(url);
          }
        });
        setPostImagesList(newImages);
        toast.showSuccess(`Đã tải lên ${uploadedUrls.length} tệp thành công! 📸`);
      }
    } catch (err) {
      toast.showError('Tải tệp lên thất bại: ' + err.message);
    } finally {
      setUploadingMedia(false);
      if (createFileInputRef.current) createFileInputRef.current.value = '';
    }
  };

  const handleRemoveCreateImage = (indexToRemove) => {
    setPostImagesList(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRemoveCreateVideo = () => {
    setPostVideoUrl('');
  };

  // Toggle Post Visibility (Public <-> Private)
  const handleToggleVisibility = async (post) => {
    const nextVisibility = post.visibility === 'PRIVATE' ? 'PUBLIC' : 'PRIVATE';
    try {
      await postApi.updateVisibility(post.id, nextVisibility, currentUser?.email);
      setPosts(prev =>
        prev.map(p => (p.id === post.id ? { ...p, visibility: nextVisibility } : p))
      );
      toast.showSuccess(
        nextVisibility === 'PRIVATE'
          ? 'Đã chuyển bài viết sang chế độ Chỉ mình tôi 🔒'
          : 'Đã chuyển bài viết sang chế độ Công khai 🌐'
      );
      setOpenMenuPostId(null);
    } catch (err) {
      toast.showError('Không thể cập nhật quyền riêng tư: ' + err.message);
    }
  };

  // Delete Post
  const handleDeletePost = async (post) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${post.title}" không? Hành động này không thể hoàn tác.`)) {
      return;
    }
    try {
      await postApi.delete(post.id, currentUser?.email);
      setPosts(prev => prev.filter(p => p.id !== post.id));
      toast.showSuccess('Đã xóa bài viết thành công! 🗑️');
      setOpenMenuPostId(null);
    } catch (err) {
      toast.showError('Không thể xóa bài viết: ' + err.message);
    }
  };

  // Callback when user creates a place via proposal modal
  const handlePlaceCreatedFromProposal = (newPlace) => {
    if (newPlace) {
      setPlaces(prev => [newPlace, ...prev]);
      setAttachedPlaceId(String(newPlace.id));
    }
  };

  // Post Updated Callback from Edit Modal
  const handlePostUpdated = (updatedPost) => {
    setPosts(prev =>
      prev.map(p => (p.id === updatedPost.id ? updatedPost : p))
    );
    fetchPosts();
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
      setModerationStep(1);
      // AI Inspection: Gửi trực tiếp lên Backend cho Gemini AI thẩm định chuyên sâu & lưu trữ CSDL
      await new Promise(r => setTimeout(r, 300));
      setModerationStep(2);
      await new Promise(r => setTimeout(r, 200));
      setModerationStep(3);

      const isCustomPlace = typeof attachedPlaceId === 'string' && attachedPlaceId.startsWith('custom:');
      const customPlaceName = isCustomPlace ? attachedPlaceId.replace('custom:', '').trim() : '';

      const locationTagValue = isCustomPlace
        ? customPlaceName
        : (selectedPlacePreview ? (selectedPlacePreview.city ? `${selectedPlacePreview.name}, ${selectedPlacePreview.city}` : selectedPlacePreview.name) : 'Việt Nam');

      const payload = {
        title: postTitle.trim(),
        content: postContent.trim(),
        locationTag: locationTagValue,
        category: postCategory,
        visibility: postVisibility,
        images: postImagesList.length > 0 ? postImagesList : [],
        videoUrl: postVideoUrl || null,
        itineraryId: attachedItineraryId ? Number(attachedItineraryId) : null,
        placeId: isCustomPlace || !attachedPlaceId ? null : Number(attachedPlaceId)
      };

      const result = await postApi.createPost(payload, currentUser?.email);

      // Close create modal and reset form
      setIsCreateModalOpen(false);
      setPostTitle('');
      setPostContent('');
      setPostCategory('Ẩm thực & Check-in');
      setPostVisibility('PUBLIC');
      setPostImagesList([]);
      setPostVideoUrl('');
      setAttachedItineraryId('');
      setAttachedPlaceId('');
      setTaggedUsersInPost([]);
      setPostMentionState({ isOpen: false, query: '', cursorIndex: -1 });

      // Evaluate Moderation Result for Feedback Display
      if (result && result.status === 'PENDING_REVIEW') {
        const isDebt = (result.category && result.category.includes('Đòi nợ')) || (result.aiFlagReason && result.aiFlagReason.toLowerCase().includes('đòi nợ'));
        const isOffTopic = (result.category && result.category.includes('Lạc đề')) || (result.aiFlagReason && result.aiFlagReason.toLowerCase().includes('du lịch'));

        setModerationFeedback({
          type: 'PENDING_REVIEW',
          title: isDebt 
            ? 'Phát hiện nội dung Đòi nợ / Tranh chấp tài chính 🚫'
            : isOffTopic
            ? 'Nội dung chưa rõ chủ đề Du lịch 📍'
            : 'Bài viết đang chờ Quản trị viên duyệt 🛡️',
          score: result.aiSafetyScore || 20,
          category: result.category,
          reason: result.aiFlagReason || 'Nội dung chưa đạt tiêu chuẩn tự động duyệt của hệ thống.',
          message: isDebt
            ? 'Wayfare là nền tảng chia sẻ Du lịch & Khám phá, nghiêm cấm các bài viết đòi nợ, bóc phốt tài chính hoặc giải quyết mâu thuẫn tiền bạc cá nhân. Bài viết đã bị chặn xuất bản và đưa vào diện xem xét vi phạm của Quản trị viên.'
            : isOffTopic
            ? 'Wayfare chỉ tự động duyệt các bài viết liên quan đến Du lịch, Lịch trình, Trải nghiệm điểm đến hoặc Ẩm thực địa phương. Bài viết của bạn đã được chuyển vào hàng đợi để Quản trị viên thẩm định thủ công.'
            : 'Hệ thống Safety Shield đã phát hiện một số cảnh báo an toàn. Bài viết của bạn đã được chuyển vào hàng đợi kiểm duyệt thủ công của Quản trị viên. Bạn sẽ nhận được thông báo ngay khi bài được duyệt!'
        });
        toast.showWarning(isDebt 
          ? 'Bài viết bị chặn xuất bản do vi phạm quy tắc: Đòi nợ / Tranh chấp tài chính! 🚫'
          : 'Bài viết đã chuyển vào hàng đợi CHỜ ADMIN DUYỆT THỦ CÔNG. ⚠️');
      } else {
        setModerationFeedback({
          type: 'APPROVED',
          title: 'Thẩm định thành công! Xuất bản công khai 🎉',
          score: result?.aiSafetyScore || 98,
          message: 'Bài viết của bạn đã vượt qua toàn bộ quy chuẩn an toàn của hệ thống và đã được đăng công khai trên Cộng đồng Wayfare!'
        });
        toast.showSuccess('Đã đăng bài viết thành công lên Cộng đồng Wayfare! 🚀');
      }

      // Refresh posts and notifications
      fetchPosts();
      if (typeof fetchNotifications === 'function') {
        fetchNotifications();
      }
    } catch (err) {
      toast.showError('Không thể tạo bài viết: ' + err.message);
    } finally {
      setSubmittingPost(false);
      setModerationStep(0);
    }
  };

  // Selected itinerary preview for the creator modal
  const selectedTripPreview = useMemo(() => {
    if (!attachedItineraryId) return null;
    return itineraries.find(i => String(i.id) === String(attachedItineraryId));
  }, [attachedItineraryId, itineraries]);

  // Selected place check-in preview for the creator modal
  const selectedPlacePreview = useMemo(() => {
    if (!attachedPlaceId) return null;
    if (typeof attachedPlaceId === 'string' && attachedPlaceId.startsWith('custom:')) {
      return {
        id: null,
        name: attachedPlaceId.replace('custom:', '').trim(),
        isCustom: true,
        address: 'Địa điểm mới do bạn đề xuất',
        city: 'Chờ duyệt chính thức',
        coverImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
      };
    }
    return places.find(p => String(p.id) === String(attachedPlaceId));
  }, [attachedPlaceId, places]);

  // Fetch available places for check-in picker
  useEffect(() => {
    placeApi.getPlaces({ status: 'ACTIVE' })
      .then(data => setPlaces(Array.isArray(data) ? data : []))
      .catch(err => console.warn('Could not load places for check-in picker:', err));
  }, []);

  // Handle auto-open create modal if navigated with ?checkinPlaceId=...
  useEffect(() => {
    const checkinId = searchParams.get('checkinPlaceId');
    if (checkinId) {
      setAttachedPlaceId(checkinId);
      setIsCreateModalOpen(true);
      searchParams.delete('checkinPlaceId');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Real Location Stories extracted dynamically from loaded posts
  const realLocationStories = useMemo(() => {
    if (!Array.isArray(posts) || posts.length === 0) return [];
    const map = new Map();
    posts.forEach(p => {
      const loc = p.location?.trim();
      if (loc) {
        const existing = map.get(loc);
        const img = (Array.isArray(p.mediaUrls) && p.mediaUrls.length > 0 ? p.mediaUrls[0] : null) || p.imageUrl || null;
        if (!existing) {
          map.set(loc, {
            id: loc,
            location: loc,
            count: 1,
            image: img
          });
        } else {
          existing.count += 1;
          if (!existing.image && img) existing.image = img;
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [posts]);

  return (
    <div className="community-page w-full min-h-screen bg-[#F8F4EC] text-[#1E1A15] pb-16 sm:pb-20">
      {/* ─── 3-COLUMN COMMUNITY WORKSPACE ─── */}
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-5 sm:py-6">
        {/* 3-COLUMN DESKTOP GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: User Mini-Profile, Quick Nav, Trending Tags */}
          {/* ========================================================= */}
          <aside className="hidden 2xl:flex 2xl:col-span-3 flex-col gap-5 sticky top-20 self-start max-h-[calc(100vh-5.5rem)] overflow-y-auto overscroll-contain sidebar-scrollbar pr-1.5 pb-8 select-none z-10">
            
            {/* User Profile Card or Guest Login Prompt */}
            {isLoggedIn ? (
              <div className="bg-[#FFFDF8] rounded-sm p-5 border border-[#1E1A15]/10  space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img
                      src={currentUser?.avatar}
                      alt={currentUser?.name}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-clay-600/30"
                    />
                    <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] ring-2 ring-white font-bold">
                      ✓
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold text-sm text-[#1E1A15] truncate">{currentUser?.name}</h3>
                    <p className="text-xs text-[#6B6154] truncate">{currentUser?.handle || '@wanderer'}</p>
                    {(() => {
                      const tier = getUserTier(currentUser);
                      return (
                        <div className={`inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-sm text-[10px] font-bold border ${tier.badgeBg}`}>
                          <span>{tier.icon}</span>
                          <span>{tier.name}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* User Stats Grid */}
                <div className="grid grid-cols-4 gap-1.5 p-2.5 bg-[#F8F4EC] rounded-sm text-center border border-[#1E1A15]/10">
                  <div className="p-1 rounded-sm bg-[#FFFDF8] border border-[#1E1A15]/10">
                    <span className="font-extrabold text-sm text-sky-600 block">{itineraries.length}</span>
                    <span className="text-[10px] text-[#6B6154] font-semibold">Chuyến đi</span>
                  </div>
                  <div className="p-1 rounded-sm bg-[#FFFDF8] border border-[#1E1A15]/10">
                    <span className="font-extrabold text-sm text-amber-600 block">
                      {posts.filter(p => p.author?.email === currentUser?.email && p.status === 'ACTIVE').length}
                    </span>
                    <span className="text-[10px] text-[#6B6154] font-semibold">Bài viết</span>
                  </div>
                  <div
                    onClick={() => setFollowListModalState({ isOpen: true, tab: 'following', userId: currentUser?.id, userName: currentUser?.name })}
                    className="p-1 rounded-sm bg-[#FFFDF8] border border-[#1E1A15]/10 cursor-pointer hover:bg-[#F3EDE2] transition-colors group"
                    title="Bấm để xem danh sách đang theo dõi"
                  >
                    <span className="font-extrabold text-sm text-sky-700 block">
                      {followingIds.size}
                    </span>
                    <span className="text-[10px] text-[#6B6154] font-semibold group-hover:text-sky-800">Đang follow</span>
                  </div>
                  <div
                    onClick={() => setFeedScope(feedScope === 'saved' ? 'all' : 'saved')}
                    className="p-1 rounded-sm bg-[#FFFDF8] border border-[#1E1A15]/10 cursor-pointer hover:bg-[#F3EDE2] transition-colors group"
                    title="Bấm để xem bài viết đã lưu"
                  >
                    <span className="font-extrabold text-sm text-sky-600 block">
                      {bookmarkedPostIds.size}
                    </span>
                    <span className="text-[10px] text-[#6B6154] font-semibold group-hover:text-sky-700">Đã lưu</span>
                  </div>
                </div>

                {/* Quick Action Button */}
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-sm bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Đăng Bài & Đính Kèm Tour</span>
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-white via-sky-50/50 to-indigo-50/30 rounded-sm p-5 border border-sky-100  text-center space-y-4">
                <div className="w-14 h-14 rounded-sm bg-sky-600/10 text-sky-600 flex items-center justify-center mx-auto ">
                  <Compass className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-base text-[#1E1A15]">Cộng đồng Wayfare</h3>
                  <p className="text-xs text-[#6B6154] leading-relaxed px-1">
                    Đăng nhập để đăng bài viết, bình luận, lưu hành trình yêu thích và kết nối với các thành viên.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-sm bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold  shadow-sky-600/25 hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Đăng nhập ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </aside>

          {/* ========================================================= */}
          {/* CENTER COLUMN: Social Feed & Post Creator (6 cols) */}
          {/* ========================================================= */}
          <main className="col-span-1 lg:col-span-8 xl:col-span-9 2xl:col-span-6 space-y-3 sm:space-y-4">

            {/* ─── 24H COMMUNITY MOMENTS & STORIES CAROUSEL ─── */}
            <div className="bg-[#FFFDF8] rounded-sm p-3 sm:p-4 border border-[#1E1A15]/10 space-y-2.5">
              <div className="flex items-center gap-2 px-1">
                <div className="w-1.5 h-1.5 rounded-full bg-clay-600"></div>
                <h3 className="font-extrabold text-xs sm:text-sm text-[#1E1A15] tracking-tight">Khoảnh Khắc 24h • Trải Nghiệm Thực Tế</h3>
              </div>

              {/* Horizontal Scroll Story Circles - Dữ liệu địa điểm thực tế từ bài viết */}
              <div className="flex items-center gap-3 sm:gap-3.5 overflow-x-auto pb-1 scrollbar-none select-none">
                {/* Reset / All Filter */}
                <div
                  onClick={() => setSearchQuery('')}
                  className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
                  title="Xem tất cả bài viết"
                >
                  <div className={`relative p-0.5 rounded-full border-2 ${
                    !searchQuery
                      ? 'border-clay-600'
                      : 'border-[#1E1A15]/10 group-hover:border-clay-600/50'
                  }`}>
                    <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#F3EDE2] flex items-center justify-center p-0.5">
                      <div className="w-full h-full rounded-full bg-[#FFFDF8] flex items-center justify-center text-clay-700">
                        <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold truncate max-w-[62px] sm:max-w-[72px] text-center ${
                    !searchQuery ? 'text-clay-700 font-extrabold' : 'text-[#3B332A] group-hover:text-clay-700'
                  }`}>
                    Tất cả
                  </span>
                </div>

                {/* Real Location Stories from database */}
                {(realLocationStories.length > 0 ? realLocationStories : COMMUNITY_STORIES).map(story => {
                  const locName = story.location;
                  const isSelected = searchQuery.toLowerCase().includes(locName.toLowerCase());
                  const postCount = story.count || null;
                  const imgSrc = story.image || (story.badge ? null : null);

                  return (
                    <div
                      key={story.id || locName}
                      onClick={() => setSearchQuery(isSelected ? '' : locName)}
                      className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
                      title={`Bấm để xem các bài viết về ${locName}${postCount ? ` (${postCount} bài)` : ''}`}
                    >
                      <div className={`relative p-0.5 rounded-full border-2 ${
                        isSelected
                          ? 'border-clay-600'
                          : 'border-[#1E1A15]/10 group-hover:border-clay-600/50'
                      }`}>
                        <div className="p-0.5 rounded-full bg-[#FFFDF8]">
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={locName}
                              className="w-11 h-11 sm:w-14 sm:h-14 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#F8F4EC] flex items-center justify-center text-clay-700 font-extrabold text-sm sm:text-base">
                              📍
                            </div>
                          )}
                        </div>
                        {postCount ? (
                          <span className="absolute -bottom-1 -right-1 text-[9px] sm:text-[10px] bg-[#1E1A15] text-[#F8F4EC] px-1.5 py-0.2 rounded-sm font-bold">
                            {postCount}
                          </span>
                        ) : story.badge ? (
                          <span className="absolute -bottom-1 -right-1 text-[9px] sm:text-[10px] bg-[#1E1A15] text-[#F8F4EC] px-1.5 py-0.2 rounded-sm font-bold">
                            {story.badge}
                          </span>
                        ) : null}
                      </div>
                      <span className={`text-[10px] font-bold truncate max-w-[62px] sm:max-w-[72px] text-center ${
                        isSelected ? 'text-clay-700 font-extrabold' : 'text-[#3B332A] group-hover:text-clay-700'
                      }`}>
                        {locName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Quick Create Post Bar or Guest Invitation */}
            {isLoggedIn ? (
            <div className="bg-[#FFFDF8] rounded-sm p-3 sm:p-4 border border-[#1E1A15]/10 flex items-center gap-3">
              <img
                src={currentUser?.avatar}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-[#1E1A15]/10"
              />
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex-1 min-w-0 text-left bg-[#F8F4EC] hover:bg-[#F3EDE2] text-[#6B6154] px-3.5 py-2.5 sm:py-3 rounded-sm text-xs sm:text-sm font-medium transition-colors cursor-pointer border border-[#1E1A15]/10 truncate"
              >
                Chia sẻ review, ảnh đẹp hoặc đính kèm tour...
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="shrink-0 px-4 py-2.5 sm:py-3 rounded-sm bg-clay-600 hover:bg-clay-700 text-white text-xs font-extrabold transition-colors cursor-pointer"
              >
                Đăng bài
              </button>
            </div>
          ) : (
            <div className="bg-[#FFFDF8] rounded-sm p-4 sm:p-5 border border-[#1E1A15]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-sm bg-clay-600/10 text-clay-700 flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-[#1E1A15]">Chia sẻ câu chuyện du lịch của bạn</h4>
                  <p className="text-[11px] sm:text-xs text-[#6B6154] mt-0.5">
                    Đăng nhập để đăng bài viết, tương tác thả tim, bình luận và lưu lại các hành trình yêu thích.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="shrink-0 px-5 py-2.5 rounded-sm bg-clay-600 hover:bg-clay-700 text-white text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap"
              >
                Đăng nhập ngay
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* TWO-TIER FEED CONTROL: TIER 1 SCOPE + TIER 2 TOPICS       */}
          {/* ========================================================= */}
          <div className="space-y-2.5">
            {/* TIER 1: FEED SCOPE TABS */}
            <div className="flex items-center gap-1 border-b border-[#1E1A15]/10 overflow-x-auto no-scrollbar">
              {FEED_SCOPES.map(scope => {
                const Icon = scope.icon;
                const isActive = feedScope === scope.id;

                return (
                  <button
                    key={scope.id}
                    onClick={() => {
                      if ((scope.id === 'following' || scope.id === 'saved') && !isLoggedIn) {
                        requireAuth(`xem mục "${scope.label}"`);
                        return;
                      }
                      setFeedScope(scope.id);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 border-b-2 -mb-px text-xs sm:text-sm font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'border-clay-600 text-clay-700'
                        : 'border-transparent text-[#6B6154] hover:text-[#1E1A15]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-clay-600' : 'text-[#8A7F70]'}`} />
                    <span className="truncate">{scope.label}</span>
                  </button>
                );
              })}
            </div>

            {/* SEARCH & SORT BAR */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8A7F70] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Tìm bài viết theo tác giả, địa điểm, nội dung..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-[#FFFDF8] border border-[#1E1A15]/10 rounded-sm text-xs sm:text-sm text-[#2A241D] placeholder-[#8A7F70] focus:outline-none focus:border-clay-600 focus:ring-0 transition-colors font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A7F70] hover:text-[#5A5146] transition-colors cursor-pointer"
                    title="Xóa tìm kiếm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Sort Selector Dropdown */}
              <div className="w-40 sm:w-48 shrink-0">
                <CustomSelect
                  value={activeSort}
                  onChange={setActiveSort}
                  icon={SlidersHorizontal}
                  size="sm"
                  buttonClassName="py-2.5 sm:py-3 font-bold border-[#1E1A15]/10 rounded-sm bg-[#FFFDF8]"
                  options={[
                    { value: 'newest', label: 'Mới nhất' },
                    { value: 'popular', label: 'Nhiều like nhất' },
                    { value: 'has_itinerary', label: 'Có lịch trình' }
                  ]}
                />
              </div>
            </div>

            {/* TIER 2: TOPIC & MEDIA FILTER PILLS WITH DRAG-TO-SCROLL & CHEVRONS */}
            <div className="relative group/topicbar w-full min-w-0">
              {/* Left Navigation Chevron Button */}
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={handleTopicScrollLeft}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-[#FFFDF8] hover:bg-[#F8F4EC] text-[#3B332A] hover:text-clay-700 border border-[#1E1A15]/10 flex items-center justify-center transition-colors cursor-pointer"
                  title="Cuộn sang trái"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              {/* Scrollable Container with Drag Support */}
              <div
                ref={topicScrollRef}
                onScroll={checkTopicScroll}
                onMouseDown={handleTopicMouseDown}
                onMouseMove={handleTopicMouseMove}
                onMouseUp={handleTopicMouseUpOrLeave}
                onMouseLeave={handleTopicMouseUpOrLeave}
                className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none cursor-grab active:cursor-grabbing scroll-smooth px-0.5"
              >
                {TOPIC_FILTERS.map(topic => {
                  const Icon = topic.icon;
                  const isActive = topicFilter === topic.id;

                  return (
                    <button
                      key={topic.id}
                      onClick={() => {
                        if (hasDraggedTopics.current) return;
                        setTopicFilter(topic.id);
                      }}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm text-xs transition-colors shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-clay-600 text-white font-extrabold'
                          : 'bg-[#FFFDF8] text-[#3B332A] border border-[#1E1A15]/10 hover:border-clay-600/50 hover:text-clay-700 font-semibold'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#8A7F70]'}`} />
                      <span>{topic.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right Navigation Chevron Button */}
              {canScrollRight && (
                <button
                  type="button"
                  onClick={handleTopicScrollRight}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-[#FFFDF8] hover:bg-[#F8F4EC] text-[#3B332A] hover:text-clay-700 border border-[#1E1A15]/10 flex items-center justify-center transition-colors cursor-pointer"
                  title="Cuộn sang phải"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="space-y-4">
              {[1, 2].map(n => (
                <div key={n} className="bg-[#FFFDF8] rounded-sm p-6 border border-[#1E1A15]/10  animate-pulse space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#E8DFD0]" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-32 bg-[#E8DFD0] rounded" />
                      <div className="h-3 w-20 bg-[#F3EDE2] rounded" />
                    </div>
                  </div>
                  <div className="h-16 bg-[#F3EDE2] rounded-sm" />
                  <div className="h-48 bg-[#E8DFD0] rounded-sm" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && displayPosts.length === 0 && (
            <div className="bg-[#FFFDF8] rounded-sm p-10 border border-[#1E1A15]/10  text-center space-y-4">
              <div className="w-16 h-16 rounded-sm bg-sky-50 text-sky-600 flex items-center justify-center mx-auto ">
                {feedScope === 'following' ? (
                  <UserCheck className="w-8 h-8 text-sky-600" />
                ) : feedScope === 'saved' ? (
                  <Bookmark className="w-8 h-8 text-amber-500 fill-amber-500/20" />
                ) : topicFilter === 'video' ? (
                  <Video className="w-8 h-8 text-rose-500" />
                ) : (
                  <Compass className="w-8 h-8 text-sky-600" />
                )}
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-extrabold text-[#1E1A15]">
                  {feedScope === 'following'
                    ? (followingIds.size === 0
                        ? 'Bạn chưa theo dõi tác giả nào'
                        : 'Các tác giả bạn theo dõi chưa có bài viết mới')
                    : feedScope === 'saved'
                    ? 'Chưa có bài viết nào trong bộ sưu tập'
                    : topicFilter === 'video'
                    ? 'Chưa có video thước phim nào'
                    : 'Chưa tìm thấy bài viết phù hợp'}
                </h3>
                <p className="text-xs sm:text-sm text-[#6B6154] mt-1 leading-relaxed font-normal">
                  {feedScope === 'following'
                    ? (followingIds.size === 0
                        ? 'Hãy bấm "Theo dõi" các phượt thủ hoặc tác giả nổi bật ở cột bên phải để luôn cập nhật những hành trình mới nhất từ họ!'
                        : 'Hãy khám phá thêm bài viết hấp dẫn tại mục Khám phá hoặc chia sẻ chuyến đi của riêng bạn!')
                    : feedScope === 'saved'
                    ? 'Bạn có thể bấm vào biểu tượng Bookmark trên các bài viết hay để lưu vào bộ sưu tập cá nhân và xem lại bất cứ lúc nào!'
                    : topicFilter === 'video'
                    ? 'Hãy là người đầu tiên đăng tải video thước phim ngắn chia sẻ trải nghiệm du lịch tuyệt vời của bạn!'
                    : 'Hãy thử tìm kiếm với từ khóa khác, chọn danh mục khác hoặc là người đầu tiên chia sẻ chuyến đi của bạn!'}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                {(feedScope !== 'all' || topicFilter !== 'Tất cả' || selectedHashtag !== 'all') && (
                  <button
                    onClick={() => {
                      setFeedScope('all');
                      setTopicFilter('Tất cả');
                      setSelectedHashtag('all');
                    }}
                    className="px-5 py-2.5 rounded-full border border-[#1E1A15]/10 text-[#3B332A] hover:bg-[#F8F4EC] text-xs font-bold transition-all cursor-pointer"
                  >
                    Xem tất cả bài viết
                  </button>
                )}
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2.5 rounded-full text-xs font-extrabold  shadow-sky-600/25 hover:shadow-none transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tạo bài viết ngay</span>
                </button>
              </div>
            </div>
          )}

          {/* Social Posts Feed */}
          {!loading &&
            paginatedPosts.map(post => {
              const hasItinerary = Boolean(post.itineraryId || post.itineraryTitle);
              const isBookmarked = bookmarkedPostIds.has(Number(post.id)) || Boolean(post.isBookmarked);
              const rawAuthorName = post.authorName || post.author?.fullName || post.author?.name || 'Thành viên Wayfare';
              const cleanAuthorName = rawAuthorName.replace(/\s*\([^)]*\)\s*$/, '').trim();
              const authorName = cleanAuthorName;
              const authorAvatar = post.authorAvatar || post.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
              const authorId = post.authorId || post.author?.id;
              const authorEmail = post.authorEmail || post.author?.email || '';
              const authorHandle = post.authorHandle || post.author?.handle || '';

              const isSelf = Boolean(
                post.isOwner ||
                (authorId && currentUser?.id && Number(authorId) === Number(currentUser.id)) ||
                (currentUser?.handle && authorHandle && authorHandle.trim().toLowerCase() === currentUser.handle.trim().toLowerCase()) ||
                (currentUser?.email && authorEmail && authorEmail.trim().toLowerCase() === currentUser.email.trim().toLowerCase())
              );

              return (
                <article
                  key={post.id}
                  className="bg-[#FFFDF8] rounded-sm sm:rounded-sm p-3 sm:p-5 border border-[#1E1A15]/10  hover:shadow-none transition-all space-y-3 relative overflow-hidden"
                >
                  {/* Status Banner for Posts Pending Review */}
                  {post.status === 'PENDING_REVIEW' && (
                    <div className="bg-amber-50/90 border border-amber-200 p-3 sm:p-3.5 rounded-sm sm:rounded-sm flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-amber-900 ">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-[#1E1A15]">Đang chờ Quản trị viên duyệt thủ công</span>
                          <span className="px-2 py-0.5 rounded-sm bg-amber-200/80 text-amber-900 text-xs font-bold">
                            Kiểm duyệt: {post.aiSafetyScore || 45}/100
                          </span>
                        </div>
                        <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                          <strong>Ghi chú hệ thống:</strong> {post.aiFlagReason || 'Nội dung chứa yếu tố cần xác thực thêm trước khi công khai.'} <span className="text-[#6B6154] italic">(Hiện tại chỉ hiển thị trong feed của bạn)</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Post Header: Facebook Style (Avatar + Name · Follow + Subline + Right controls) */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                      <div
                        onClick={() => {
                          if (authorId) setSelectedUserIdForModal(authorId);
                        }}
                        className="cursor-pointer group shrink-0"
                        title="Xem trang cá nhân của tác giả"
                      >
                        <UserAvatar
                          user={{
                            id: authorId,
                            fullName: authorName,
                            avatarUrl: authorAvatar,
                            email: authorEmail,
                            tier: post.authorTier,
                            role: post.authorRole,
                            isVerified: true
                          }}
                          size="md"
                          showBadge={false}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Row 1: Name · Theo dõi */}
                        <div className="flex items-center gap-1.5 flex-wrap leading-tight">
                          <h4
                            onClick={() => {
                              if (authorId) setSelectedUserIdForModal(authorId);
                            }}
                            className="font-bold text-[14px] sm:text-[15px] text-[#1E1A15] hover:text-blue-600 hover:underline cursor-pointer transition-colors truncate max-w-[190px] sm:max-w-none"
                            title={authorName}
                          >
                            {authorName}
                          </h4>

                          {post.sharedPost && (
                            <span className="text-xs font-normal text-[#6B6154] flex items-center gap-1">
                              <span>đã chia sẻ bài viết của</span>
                              <strong
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const origAuthorId = post.sharedPost.authorId || post.sharedPost.author?.id;
                                  if (origAuthorId) setSelectedUserIdForModal(origAuthorId);
                                }}
                                className="font-bold text-[#1E1A15] hover:text-blue-600 hover:underline transition-colors cursor-pointer"
                              >
                                {(post.sharedPost.authorName || post.sharedPost.author?.fullName || 'thành viên').replace(/\s*\([^)]*\)\s*$/, '').trim()}
                              </strong>
                            </span>
                          )}

                          {isSelf ? (
                            <span className="text-[11px] text-[#8A7F70] font-medium">
                              (Bạn)
                            </span>
                          ) : authorId ? (
                            <div className="inline-flex items-center gap-1.5">
                              <span className="text-[#8A7F70] font-bold text-xs select-none">·</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleFollowAuthor(authorId, authorName);
                                }}
                                disabled={followingLoadingIds.has(authorId)}
                                className="text-xs sm:text-[13px] font-bold text-sky-600 hover:text-sky-700 hover:underline cursor-pointer transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                                title={followingIds.has(Number(authorId)) ? 'Hủy theo dõi tác giả' : 'Theo dõi tác giả'}
                              >
                                {followingLoadingIds.has(authorId) ? (
                                  <Loader2 className="w-3 h-3 animate-spin text-sky-600" />
                                ) : followingIds.has(Number(authorId)) ? (
                                  <span className="text-[#6B6154] font-semibold">Đang theo dõi</span>
                                ) : (
                                  <span>Theo dõi</span>
                                )}
                              </button>
                            </div>
                          ) : null}
                        </div>

                        {/* Row 2: Metadata (Time · Location · Category · Globe icon) */}
                        <div className="text-[11px] sm:text-xs text-[#6B6154] flex items-center gap-1 mt-0.5 font-normal flex-wrap">
                          <span>{formatDisplayTimeAgo(post.createdAt, post.timeAgo)}</span>
                          {post.locationTag && (
                            <>
                              <span className="text-[#B3A895]">·</span>
                              {post.placeId ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/places/${post.placeId}`);
                                  }}
                                  className="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-800 hover:underline font-semibold cursor-pointer transition-colors max-w-[200px] sm:max-w-none text-left"
                                  title={`Xem chi tiết địa điểm ${post.locationTag}`}
                                >
                                  <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                                  <span className="truncate">{post.locationTag}</span>
                                </button>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 text-[#5A5146] font-medium">
                                  <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                                  <span className="truncate max-w-[120px] sm:max-w-none">{post.locationTag}</span>
                                </span>
                              )}
                            </>
                          )}
                          {post.category && (
                            <>
                              <span className="text-[#B3A895]">·</span>
                              <span className="text-[#5A5146] font-medium">{post.category}</span>
                            </>
                          )}
                          <span className="text-[#B3A895]">·</span>
                          {post.visibility === 'PRIVATE' ? (
                            <span className="inline-flex items-center text-[#6B6154]" title="Chỉ mình tôi">
                              <Lock className="w-2.5 h-2.5" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[#8A7F70]" title="Công khai">
                              <Globe className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Header Right Actions: Bookmark + Options More Menu + Hide Post */}
                    <div className="flex items-center gap-0.5 shrink-0 self-start relative">
                      <button
                        type="button"
                        onClick={() => handleToggleBookmark(post.id)}
                        className={`p-1.5 sm:p-2 rounded-sm transition-colors cursor-pointer ${
                          isBookmarked ? 'text-amber-500 bg-amber-50' : 'text-[#8A7F70] hover:text-[#5A5146] hover:bg-[#F8F4EC]'
                        }`}
                        title={isBookmarked ? 'Bỏ lưu' : 'Lưu bài viết'}
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                      </button>

                      {/* Actions Menu for All Posts */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuPostId(prev => (prev === post.id ? null : post.id));
                          }}
                          className="p-1.5 sm:p-2 rounded-sm text-[#8A7F70] hover:text-[#3B332A] hover:bg-[#F3EDE2] transition-colors cursor-pointer"
                          title="Tùy chọn bài viết"
                        >
                          <MoreHorizontal className="w-4 h-4 pointer-events-none" />
                        </button>

                        {openMenuPostId === post.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-full mt-1 w-52 bg-[#FFFDF8] rounded-sm  border border-[#1E1A15]/10 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150"
                          >
                            {isSelf ? (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPostToEdit(post);
                                    setOpenMenuPostId(null);
                                  }}
                                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#3B332A] hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer"
                                >
                                  <Edit className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Chỉnh sửa bài viết</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuPostId(null);
                                    handleToggleVisibility(post);
                                  }}
                                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#3B332A] hover:bg-[#F8F4EC] flex items-center gap-2 cursor-pointer"
                                >
                                  {post.visibility === 'PRIVATE' ? (
                                    <>
                                      <Globe className="w-3.5 h-3.5 text-sky-600" />
                                      <span>Đặt làm Công khai 🌐</span>
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                                      <span>Đặt Chỉ mình tôi 🔒</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuPostId(null);
                                    handleCopyPostLink(post);
                                  }}
                                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#3B332A] hover:bg-[#F8F4EC] flex items-center gap-2 cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5 text-[#6B6154]" />
                                  <span>Sao chép liên kết</span>
                                </button>
                                <div className="border-t border-[#1E1A15]/10 my-1"></div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuPostId(null);
                                    handleDeletePost(post);
                                  }}
                                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Xóa bài viết</span>
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuPostId(null);
                                    handleDirectMessage(post.author);
                                  }}
                                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#3B332A] hover:bg-sky-50 hover:text-sky-700 flex items-center gap-2 cursor-pointer"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                                  <span>Nhắn tin cho {post.author?.name || 'tác giả'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuPostId(null);
                                    handleCopyPostLink(post);
                                  }}
                                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#3B332A] hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Sao chép liên kết bài viết</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setHiddenPostIds(prev => new Set(prev).add(post.id));
                                    setOpenMenuPostId(null);
                                    if (toast?.showInfo) toast.showInfo('Đã ẩn bài viết khỏi bảng tin của bạn');
                                    else if (toast?.info) toast.info('Đã ẩn bài viết khỏi bảng tin của bạn');
                                  }}
                                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#3B332A] hover:bg-[#F8F4EC] flex items-center gap-2 cursor-pointer"
                                >
                                  <EyeOff className="w-3.5 h-3.5 text-[#6B6154]" />
                                  <span>Ẩn bài viết khỏi bảng tin</span>
                                </button>
                                <div className="border-t border-[#1E1A15]/10 my-1"></div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!requireAuth('báo cáo bài viết')) return;
                                    setPostToReport(post);
                                    setOpenMenuPostId(null);
                                  }}
                                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Flag className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Báo cáo bài viết vi phạm</span>
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Quick Hide Button (Facebook Style ✕) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setHiddenPostIds(prev => new Set(prev).add(post.id));
                          if (toast?.showInfo) toast.showInfo('Đã ẩn bài viết khỏi bảng tin của bạn');
                          else if (toast?.info) toast.info('Đã ẩn bài viết khỏi bảng tin của bạn');
                        }}
                        className="p-1.5 sm:p-2 rounded-sm text-[#8A7F70] hover:text-[#3B332A] hover:bg-[#F3EDE2] transition-colors cursor-pointer"
                        title="Ẩn bài viết này"
                      >
                        <X className="w-4 h-4 pointer-events-none" />
                      </button>
                    </div>
                  </div>

                  {/* Post Content & Body */}
                  {post.sharedPost ? (
                    <div className="space-y-3">
                      {/* Sharing User's Caption/Quote */}
                      {post.content && (
                        <div className="text-sm sm:text-base text-[#2A241D] leading-relaxed font-normal tracking-[0.015em]">
                          <RichPostContent content={post.content} followingUsers={followingUsers} onUserClick={(uid) => setSelectedUserIdForModal(uid)} />
                        </div>
                      )}

                      {/* Embedded Shared Post Card */}
                      <div
                        onClick={() => setSelectedPostForDetail(post.sharedPost)}
                        className="rounded-sm border border-[#1E1A15]/10 bg-[#F8F4EC]/70 p-4 space-y-3 hover:border-slate-300 hover:bg-[#F8F4EC] transition-all cursor-pointer  group"
                      >
                        {/* Original Author Header */}
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            user={{
                              id: post.sharedPost.authorId || post.sharedPost.author?.id,
                              fullName: post.sharedPost.authorName || post.sharedPost.author?.fullName,
                              avatarUrl: post.sharedPost.authorAvatar || post.sharedPost.author?.avatar,
                              email: post.sharedPost.authorEmail || post.sharedPost.author?.email,
                              tier: post.sharedPost.authorTier,
                              role: post.sharedPost.authorRole,
                              isVerified: true
                            }}
                            size="sm"
                            showBadge={true}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const origId = post.sharedPost.authorId || post.sharedPost.author?.id;
                                  if (origId) setSelectedUserIdForModal(origId);
                                }}
                                className="font-bold text-sm text-[#1E1A15] group-hover:text-blue-600 transition-colors cursor-pointer"
                              >
                                {post.sharedPost.authorName || post.sharedPost.author?.fullName || 'Thành viên Wayfare'}
                              </span>
                              {post.sharedPost.category && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-100">
                                  {post.sharedPost.category}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-[#8A7F70] font-medium mt-0.5">
                              <span>{formatDisplayTimeAgo(post.sharedPost.createdAt, post.sharedPost.timeAgo)}</span>
                              <span>•</span>
                              <Globe className="w-3 h-3 text-[#8A7F70]" />
                              {post.sharedPost.locationTag && (
                                <>
                                  <span>•</span>
                                  {post.sharedPost.placeId ? (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/places/${post.sharedPost.placeId}`);
                                      }}
                                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-semibold cursor-pointer text-left"
                                      title={`Xem chi tiết địa điểm ${post.sharedPost.locationTag}`}
                                    >
                                      <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                                      <span>{post.sharedPost.locationTag}</span>
                                    </button>
                                  ) : (
                                    <span className="flex items-center gap-1 text-[#6B6154]">
                                      <MapPin className="w-3 h-3 text-blue-500" />
                                      {post.sharedPost.locationTag}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Original Title & Content */}
                        <div className="space-y-1">
                          {post.sharedPost.title && (
                            <h4 className="font-extrabold text-sm sm:text-base text-[#1E1A15] leading-snug">
                              {post.sharedPost.title}
                            </h4>
                          )}
                          {post.sharedPost.content && (
                            <div className="text-xs sm:text-sm text-[#3B332A] leading-relaxed line-clamp-4">
                              <RichPostContent content={post.sharedPost.content} followingUsers={followingUsers} onUserClick={(uid) => setSelectedUserIdForModal(uid)} />
                            </div>
                          )}
                        </div>

                        {/* Original Video Display */}
                        {post.sharedPost.videoUrl && (
                          <div className="rounded-sm overflow-hidden border border-[#1E1A15]/10 bg-black aspect-video max-h-72">
                            <video
                              src={post.sharedPost.videoUrl}
                              controls
                              onClick={e => e.stopPropagation()}
                              className="w-full h-full object-contain"
                              preload="metadata"
                            />
                          </div>
                        )}

                        {/* Original Photos Display */}
                        {post.sharedPost.images && post.sharedPost.images.length > 0 && !post.sharedPost.videoUrl && (
                          <div className="rounded-sm overflow-hidden border border-[#1E1A15]/10">
                            {post.sharedPost.images.length === 1 ? (
                              <img
                                src={post.sharedPost.images[0]}
                                alt="Shared post"
                                onClick={(e) => handleOpenLightbox(post.sharedPost, 0, e)}
                                className="w-full max-h-80 object-cover cursor-pointer hover:scale-[1.01] transition-transform"
                              />
                            ) : (
                              <div className="grid grid-cols-2 gap-1 max-h-72 overflow-hidden">
                                {post.sharedPost.images.slice(0, 2).map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    alt={`Shared post ${idx}`}
                                    onClick={(e) => handleOpenLightbox(post.sharedPost, idx, e)}
                                    className="w-full h-44 sm:h-52 object-cover cursor-pointer hover:scale-105 transition-transform"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Original Attached Itinerary */}
                        {(post.sharedPost.itineraryId || post.sharedPost.itineraryTitle) && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewItineraryDetails(post.sharedPost);
                            }}
                            className="p-3 bg-[#FFFDF8] rounded-sm border border-blue-100 flex items-center justify-between gap-3  hover:border-blue-300 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-sm bg-blue-600 flex items-center justify-center text-white shrink-0 ">
                                <Route className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-sm inline-block">
                                  Lịch trình đính kèm
                                </div>
                                <div className="font-bold text-xs text-[#1E1A15] truncate">
                                  {post.sharedPost.itineraryTitle || 'Lịch trình du lịch'}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-blue-600 shrink-0">Xem tour &rarr;</span>
                          </div>
                        )}


                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Post Title & Content (Nổi bật hơn, bài viết ngắn tự động tăng cỡ chữ) */}
                      <div className="space-y-1.5 sm:space-y-2">
                        {post.title && (
                          <h3
                            onClick={() => setSelectedPostForDetail(post)}
                            className="font-bold text-base sm:text-lg text-[#1E1A15] leading-snug hover:text-clay-600 transition-colors cursor-pointer tracking-tight"
                            title="Bấm để xem riêng chi tiết bài viết"
                          >
                            {post.title}
                          </h3>
                        )}
                        {post.content && (
                          <div>
                            {(() => {
                              const isExpanded = expandedPostIds.has(post.id);
                              const shouldTruncate = post.content.length > 200 && !isExpanded;
                              const textToShow = shouldTruncate
                                ? post.content.slice(0, 200).trim()
                                : post.content;
                              const isShortNote = post.content.length <= 120 && (!post.images || post.images.length === 0) && !post.videoUrl;

                              return (
                                <div className={isShortNote ? 'text-[15px] sm:text-base font-medium text-[#1E1A15] leading-relaxed' : 'text-xs sm:text-sm text-[#2A241D] leading-relaxed font-normal tracking-[0.01em]'}>
                                  <RichPostContent content={textToShow} followingUsers={followingUsers} onUserClick={(uid) => setSelectedUserIdForModal(uid)} />
                                  <div className="flex items-center gap-2 mt-1">
                                    {shouldTruncate && (
                                      <button
                                        type="button"
                                        onClick={() => toggleExpandPost(post.id)}
                                        className="font-bold text-clay-700 hover:text-clay-900 hover:underline cursor-pointer inline-block text-xs"
                                      >
                                        ... Xem thêm
                                      </button>
                                    )}
                                    {isExpanded && post.content.length > 200 && (
                                      <button
                                        type="button"
                                        onClick={() => toggleExpandPost(post.id)}
                                        className="font-bold text-[#8A7F70] hover:text-[#5A5146] hover:underline cursor-pointer text-xs inline-block"
                                      >
                                        Thu gọn
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>

                      {/* Post Video Display */}
                      {post.videoUrl && (
                        <div className="rounded-sm overflow-hidden border border-[#1E1A15]/10 bg-black aspect-video max-h-96">
                          <video
                            src={post.videoUrl}
                            controls
                            className="w-full h-full object-contain"
                            preload="metadata"
                          />
                        </div>
                      )}

                      {/* Post Photos Display */}
                      {(() => {
                        const validImages = (post.images || []).filter(img =>
                          typeof img === 'string' &&
                          img.trim().length > 10 &&
                          (img.trim().startsWith('http://') || img.trim().startsWith('https://') || img.trim().startsWith('blob:') || img.trim().startsWith('data:image/'))
                        );

                        if (validImages.length === 0) return null;

                        return (
                          <div
                            className="rounded-sm overflow-hidden border border-[#1E1A15]/10 bg-[#F8F4EC] cursor-pointer"
                            title="Bấm vào ảnh để phóng to toàn màn hình"
                          >
                            {validImages.length === 1 ? (
                              <img
                                src={validImages[0]}
                                alt="Post photo"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                onClick={(e) => handleOpenLightbox(post, 0, e)}
                                className="w-full max-h-96 object-cover hover:scale-[1.01] transition-transform duration-300"
                              />
                            ) : validImages.length === 2 ? (
                              <div className="grid grid-cols-2 gap-1.5 h-64 sm:h-80">
                                {validImages.map((img, i) => (
                                  <img
                                    key={i}
                                    src={img}
                                    alt={`Post photo ${i}`}
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    onClick={(e) => handleOpenLightbox(post, i, e)}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                  />
                                ))}
                              </div>
                            ) : (
                              <div className="grid grid-cols-12 gap-1.5 h-72 sm:h-84">
                                <div className="col-span-8 h-full overflow-hidden">
                                  <img
                                    src={validImages[0]}
                                    alt="Post photo 1"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    onClick={(e) => handleOpenLightbox(post, 0, e)}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                                <div className="col-span-4 grid grid-rows-2 gap-1.5 h-full">
                                  <div className="h-full overflow-hidden">
                                    <img
                                      src={validImages[1]}
                                      alt="Post photo 2"
                                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                      onClick={(e) => handleOpenLightbox(post, 1, e)}
                                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                  </div>
                                  <div
                                    className="relative h-full overflow-hidden"
                                    onClick={(e) => handleOpenLightbox(post, 2, e)}
                                  >
                                    <img
                                      src={validImages[2]}
                                      alt="Post photo 3"
                                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                    {validImages.length > 3 && (
                                      <div className="absolute inset-0 bg-[#1E1A15]/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold hover:bg-[#1E1A15]/70 transition-colors">
                                        +{validImages.length - 3} ảnh
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </>
                  )}

                  {/* ATTACHED TOUR / ITINERARY CARD (Compact Accessory Style - Giảm 50% diện tích, không lấn át bài viết) */}
                  {!post.sharedPost && hasItinerary && (
                    <div
                      onClick={() => handleViewItineraryDetails(post)}
                      className="p-3 sm:p-3.5 rounded-[6px] bg-[#FAF7F0] hover:bg-[#F3ECE0] border border-[#E8DFD1] transition-all cursor-pointer group/itin flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs"
                      title="Bấm để xem chi tiết lộ trình"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-[5px] bg-clay-600/10 border border-clay-300/60 text-clay-700 flex items-center justify-center shrink-0 group-hover/itin:bg-clay-600 group-hover/itin:text-white transition-colors">
                          <Route className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] bg-clay-100 text-clay-800 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                              <span>Lịch trình</span>
                            </span>
                            {post.itineraryDuration && (
                              <span className="text-[10px] font-bold text-ink-600 bg-white/80 px-1.5 py-0.5 rounded border border-ink-200/60 whitespace-nowrap">
                                {post.itineraryDuration}
                              </span>
                            )}
                          </div>
                          <h5 className="font-bold text-xs sm:text-sm text-ink-900 truncate group-hover/itin:text-clay-700 transition-colors">
                            {post.itineraryTitle || 'Lịch trình chi tiết đính kèm'}
                          </h5>
                          <div className="flex items-center gap-2 text-[11px] text-ink-500 font-serif flex-wrap">
                            {post.itineraryBudget && (
                              <span className="font-semibold text-clay-700 inline-flex items-center gap-0.5 whitespace-nowrap">
                                <span>{Number(post.itineraryBudget).toLocaleString('vi-VN')} đ/người</span>
                              </span>
                            )}
                            {post.itineraryPlacesCount > 0 && (
                              <>
                                <span className="text-ink-300">•</span>
                                <span className="inline-flex items-center gap-1 text-ink-600 whitespace-nowrap">
                                  <MapPin className="w-3 h-3 text-clay-600 shrink-0" />
                                  <span>{post.itineraryPlacesCount} điểm dừng</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons (Gọn gàng bên phải, không chiếm nguyên 1 hàng đáy) */}
                      <div className="flex items-center gap-2 shrink-0">
                        {!Boolean(
                          (post.authorId && currentUser?.id && String(post.authorId) === String(currentUser.id)) ||
                          (post.authorEmail && currentUser?.email && post.authorEmail.toLowerCase() === (currentUser.email || '').toLowerCase()) ||
                          (post.userId && currentUser?.id && String(post.userId) === String(currentUser.id)) ||
                          (post.author?.id && currentUser?.id && String(post.author.id) === String(currentUser.id)) ||
                          (post.author?.email && currentUser?.email && post.author.email.toLowerCase() === (currentUser.email || '').toLowerCase())
                        ) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCloneItinerary(post);
                            }}
                            disabled={cloningPostId === post.id}
                            className="py-1 px-2.5 rounded-[4px] bg-clay-50 hover:bg-clay-600 text-clay-700 hover:text-white border border-clay-300/70 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            title="Sao chép lộ trình này vào tài khoản của bạn"
                          >
                            {cloningPostId === post.id ? (
                              <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                            ) : (
                              <Copy className="w-3 h-3 shrink-0" />
                            )}
                            <span className="hidden sm:inline">Sao chép</span>
                          </button>
                        )}
                        <span className="text-xs font-bold text-clay-600 group-hover/itin:text-clay-700 flex items-center gap-0.5 transition-colors">
                          <span className="hidden sm:inline">Xem tour</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover/itin:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  )}



                  {/* Post Interaction Bar (Facebook Style) */}
                  <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-[#1E1A15]/10 text-xs sm:text-sm text-[#5A5146] font-sans flex-wrap gap-y-2">
                    <div className="flex items-center gap-1 sm:gap-2">
                      {/* Like Button & Likers Count */}
                      <div className="inline-flex items-center rounded-sm hover:bg-[#F3EDE2] transition-colors">
                        <button
                          type="button"
                          onClick={() => handleToggleLike(post.id)}
                          className={`inline-flex items-center gap-1.5 px-2 py-1.5 font-medium transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                            post.isLiked ? 'text-rose-600 font-bold' : 'text-[#5A5146] hover:text-rose-600'
                          }`}
                          title={post.isLiked ? 'Bỏ thích' : 'Thích bài viết'}
                        >
                          <Heart className={`w-4 h-4 sm:w-[18px] sm:h-[18px] shrink-0 ${post.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setLikersPost(post)}
                          className={`pr-2.5 py-1.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer hover:underline ${
                            post.isLiked ? 'text-rose-600' : 'text-[#5A5146] hover:text-rose-600'
                          }`}
                          title="Xem danh sách người đã thích"
                        >
                          {post.likeCount || 0}
                        </button>
                      </div>

                      {/* Comment Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenComments(post)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm hover:bg-[#F3EDE2] font-medium text-[#5A5146] hover:text-[#1E1A15] transition-colors cursor-pointer whitespace-nowrap active:scale-95"
                        title="Bình luận bài viết"
                      >
                        <MessageCircle className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#6B6154] shrink-0" />
                        <span>{post.commentCount || 0}</span>
                      </button>

                      {/* Share Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (!requireAuth('chia sẻ bài viết')) return;
                          setSharingPost(post);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm hover:bg-[#F3EDE2] font-medium text-[#5A5146] hover:text-[#1E1A15] transition-colors cursor-pointer whitespace-nowrap active:scale-95"
                        title="Chia sẻ bài viết"
                      >
                        <Share2 className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#6B6154] shrink-0" />
                        <span>{post.shareCount || 0}</span>
                      </button>

                    </div>

                    {/* Right side: Reader Mode + Detail + Moderation */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => setReadingPost(post)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/60 transition-colors cursor-pointer whitespace-nowrap active:scale-95"
                        title="Mở chế độ đọc blog bài viết toàn màn hình chuẩn tạp chí"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span className="hidden sm:inline">Đọc bài</span>
                      </button>

                      {/* View Single Post Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedPostForDetail(post)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-semibold text-[#6B6154] hover:text-[#3B332A] hover:bg-[#F8F4EC] transition-colors cursor-pointer whitespace-nowrap active:scale-95"
                        title="Xem riêng bài viết"
                      >
                        <Eye className="w-3.5 h-3.5 shrink-0" />
                        <span className="hidden sm:inline">Chi tiết</span>
                      </button>

                      {/* Report / Moderation status */}
                      <span className="text-[11px] inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                        {post.status === 'PENDING_REVIEW' ? (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="text-amber-600 font-bold hidden md:inline">Chờ Admin duyệt</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="text-[#8A7F70] hidden md:inline">Đã duyệt</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}

          {/* Feed Pagination */}
          {!loading && renderPagination()}
        </main>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Trending Tours to Clone, Top Authors (3 cols) */}
        {/* ========================================================= */}
        <aside ref={rightSidebarRef} className="hidden lg:flex lg:col-span-4 xl:col-span-3 flex-col gap-5 sticky top-20 self-start max-h-[calc(100vh-5.5rem)] overflow-y-auto overscroll-contain sidebar-scrollbar pr-1.5 pb-8 select-none z-10">
          
          {/* Top Curated Tours to Clone 1-Click */}
          <div className="bg-[#FFFDF8] rounded-sm p-4 border border-[#1E1A15]/10 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-[#1E1A15] flex items-center gap-1.5">
                <Route className="w-4 h-4 text-clay-700" />
                <span>Tour được sao chép nhiều</span>
              </h4>
            </div>

            <div className="space-y-2">
              {(trendingTours.length > 0 ? trendingTours : itineraries.slice(0, 3)).map((tour, idx) => {
                const coverImg = tour.coverImageUrl || tour.img || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=200&q=80';
                const budgetText = tour.budgetTotal
                  ? Number(tour.budgetTotal).toLocaleString('vi-VN') + 'đ'
                  : (tour.budget || '3.500.000đ');
                const durationText = tour.duration || '3N2Đ';

                return (
                  <div
                    key={tour.id || idx}
                    onClick={() => setSelectedItineraryForModal(tour)}
                    className="flex items-center gap-2.5 p-2 rounded-sm hover:bg-[#F8F4EC] border border-transparent hover:border-[#1E1A15]/10 transition-colors group cursor-pointer"
                    title="Bấm để xem lịch trình chi tiết và sao chép"
                  >
                    <img
                      src={coverImg}
                      alt={tour.title}
                      className="w-11 h-11 rounded-sm object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="font-extrabold text-xs text-[#1E1A15] group-hover:text-clay-700 transition-colors truncate">
                        {tour.title}
                      </h5>
                      <div className="flex items-center gap-1.5 text-[10px] text-[#6B6154] mt-0.5">
                        <span className="font-extrabold text-clay-700">{budgetText}</span>
                        <span>•</span>
                        <span>{durationText}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setIsAIGeneratorOpen(true)}
              className="w-full py-2.5 rounded-sm bg-[#F8F4EC] hover:bg-clay-600 hover:text-white text-clay-700 text-xs font-extrabold transition-colors border border-[#1E1A15]/10 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Route className="w-3.5 h-3.5" />
              <span>Tạo Tour Tùy Biến</span>
            </button>
          </div>

          {/* Top Travel Bloggers of the Month */}
          <div className="bg-[#FFFDF8] rounded-sm p-4 border border-[#1E1A15]/10 space-y-3">
            <h4 className="text-xs font-extrabold text-[#1E1A15] flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Top Tác Giả Tuần Này</span>
            </h4>

            <div className="space-y-3">
              {topAuthors.map((author, idx) => {
                const isMe = Boolean(
                  (currentUser?.id && Number(author.id) === Number(currentUser.id)) ||
                  (currentUser?.email && author.email && author.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase()) ||
                  (currentUser?.handle && author.handle && author.handle.trim().toLowerCase() === currentUser.handle.trim().toLowerCase())
                );

                return (
                  <div
                    key={author.id || idx}
                    className="flex items-center justify-between gap-2.5 p-1 rounded-sm hover:bg-[#F8F4EC] transition-colors"
                  >
                    <div
                      onClick={() => setSelectedUserIdForModal(author.id)}
                      className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group"
                      title="Bấm để xem hồ sơ"
                    >
                      <img
                        src={author.avatar}
                        alt={author.name}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-[#1E1A15]/10 group-hover:ring-clay-600/50 transition-colors shrink-0"
                      />
                      <div className="min-w-0">
                        <h5 className="font-extrabold text-xs text-[#1E1A15] group-hover:text-clay-700 transition-colors truncate">
                          {author.name}
                        </h5>
                        <p className="text-[10px] text-[#8A7F70] truncate">
                          {author.postsCount ? `${author.postsCount} bài viết` : (author.trips || 'Thành viên Wayfare')}
                        </p>
                      </div>
                    </div>
                    
                    {isMe ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-[#F3EDE2] text-clay-800 border border-clay-300/60 text-[10.5px] font-extrabold shrink-0" title="Tài khoản của bạn đang đăng nhập">
                        <span className="w-1.5 h-1.5 rounded-full bg-clay-600"></span>
                        <span>Chính bạn</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleToggleFollowAuthor(author.id, author.name)}
                        disabled={followingLoadingIds.has(author.id)}
                        className={`px-2 py-1 rounded-sm text-[10px] font-extrabold transition-colors flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap ${
                          followingIds.has(Number(author.id))
                            ? 'bg-[#F3EDE2] text-[#3B332A] hover:bg-rose-50 hover:text-rose-600 border border-[#1E1A15]/10'
                            : 'bg-clay-600 hover:bg-clay-700 text-white'
                        }`}
                        title={followingIds.has(Number(author.id)) ? 'Hủy theo dõi' : 'Theo dõi tác giả'}
                      >
                        {followingLoadingIds.has(author.id) ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : followingIds.has(Number(author.id)) ? (
                          <>
                            <UserCheck className="w-3 h-3 text-clay-700" />
                            <span>Đang theo dõi</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3" />
                            <span>Theo dõi</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Community Guidelines Card */}
          <details className="p-4 rounded-sm bg-[#FFFDF8] border border-[#1E1A15]/10 text-xs text-[#6B6154]">
            <summary className="font-extrabold text-[#1E1A15] flex items-center gap-1.5 cursor-pointer list-none">
              <ShieldCheck className="w-4 h-4 text-clay-700" />
              <span>Quy tắc Cộng đồng Wayfare</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#8A7F70]" />
            </summary>
            <div className="mt-3 space-y-2">
              <p className="text-[11px] leading-relaxed">
                Tất cả bài viết được kiểm duyệt tự động bởi hệ thống Safety Shield:
              </p>
              <ul className="text-[11px] space-y-1.5 text-[#5A5146] list-disc list-inside">
                <li><strong className="text-[#2A241D]">Chỉ duyệt chủ đề Du lịch:</strong> Lịch trình, review điểm đến, ẩm thực, phượt, văn hóa bản địa.</li>
                <li><strong className="text-rose-600">Nghiêm cấm tuyệt đối:</strong> Đòi nợ, bóc phốt tài chính cá nhân, cờ bạc, rao vặt ngoài du lịch.</li>
                <li><strong className="text-clay-700">An toàn & Môi trường:</strong> Tuân thủ an toàn PCCC rừng, bảo tồn sinh thái và quy định địa phương.</li>
              </ul>
            </div>
          </details>

        </aside>

        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: CREATE POST WITH ATTACHED ITINERARY SELECTOR    */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1E1A15]/60 backdrop-blur-xs">
          <div className="bg-[#FFFDF8] rounded-sm sm:rounded-sm max-w-xl w-full p-4 sm:p-6  border border-[#1E1A15]/10 max-h-[90vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in-95 duration-200 relative">
            
            {/* AI Moderation & Shield Scanning Overlay */}
            {submittingPost && (
              <div className="absolute inset-0 bg-[#FFFDF8]/95 backdrop-blur-xs rounded-sm z-30 flex flex-col items-center justify-center p-6 text-center space-y-5 animate-in fade-in">
                <div className="relative">
                  <div className="w-16 h-16 rounded-sm ocean-gradient text-white flex items-center justify-center  shadow-sky-500/25 animate-pulse">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <Loader2 className="w-5 h-5 text-sky-500 absolute -top-1 -right-1 animate-spin" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h4 className="font-extrabold text-sm text-[#1E1A15]">
                    {moderationStep === 1
                      ? 'Đang quét từ khóa & ngữ cảnh an toàn du lịch...'
                      : moderationStep === 2
                      ? 'Đang thẩm định an toàn bảo tồn rừng & PCCC...'
                      : 'Đang hoàn tất thẩm định tiêu chuẩn an toàn...'}
                  </h4>
                  <p className="text-xs text-[#6B6154] leading-relaxed">
                    Hệ thống Safety Shield đang thẩm định tự động để bảo vệ cộng đồng và nội dung trước khi xuất bản.
                  </p>
                </div>
                <div className="w-48 h-2 bg-[#F3EDE2] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 via-sky-500 to-amber-500 transition-all duration-300 rounded-full"
                    style={{ width: `${(moderationStep / 3) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pb-3 border-b border-[#1E1A15]/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-sm bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1E1A15]">Chia sẻ với Cộng đồng</h3>
                  <p className="text-xs text-[#6B6154]">Kèm theo lịch trình từ kho cá nhân của bạn</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#F3EDE2] text-[#8A7F70] hover:text-[#5A5146] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePostSubmit} className="space-y-4">
              {/* User preview and Visibility Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#F8F4EC] rounded-sm border border-[#1E1A15]/10">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-sky-100"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-[#1E1A15]">{currentUser.name}</h4>
                    <span className="text-[10px] text-[#8A7F70]">
                      {postVisibility === 'PUBLIC' ? 'Đăng công khai toàn hệ thống 🌐' : 'Chỉ mình tôi có thể xem 🔒'}
                    </span>
                  </div>
                </div>

                {/* Visibility selector */}
                <div className="flex items-center gap-1 bg-[#F3EDE2] p-1 rounded-md border border-[#1E1A15]/10 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => setPostVisibility('PUBLIC')}
                    className={`px-2.5 py-1 rounded-sm text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                      postVisibility === 'PUBLIC'
                        ? 'bg-clay-600 text-white shadow-xs'
                        : 'text-[#6B6154] hover:text-[#1E1A15] hover:bg-white/60'
                    }`}
                  >
                    <Globe className="w-3 h-3" />
                    <span>Công khai</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostVisibility('PRIVATE')}
                    className={`px-2.5 py-1 rounded-sm text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                      postVisibility === 'PRIVATE'
                        ? 'bg-[#2A241D] text-white shadow-xs'
                        : 'text-[#6B6154] hover:text-[#1E1A15] hover:bg-white/60'
                    }`}
                  >
                    <Lock className="w-3 h-3" />
                    <span>Chỉ mình tôi</span>
                  </button>
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-[#3B332A] mb-1">Tiêu đề bài viết *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Bí kíp du lịch Đà Nẵng 4N3Đ tự túc chỉ 3.5 triệu..."
                  value={postTitle}
                  onChange={e => setPostTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F4EC] border border-[#1E1A15]/10 rounded-sm text-xs text-[#2A241D] placeholder-[#8A7F70] focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-semibold"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-[#3B332A] mb-1">Chủ đề bài viết *</label>
                <CustomSelect
                  value={postCategory}
                  onChange={setPostCategory}
                  size="sm"
                  buttonClassName="bg-[#F8F4EC] border-[#1E1A15]/10 py-2.5 rounded-sm font-semibold text-xs"
                  options={[
                    { value: 'Ẩm thực & Check-in', label: 'Ẩm thực & Check-in', icon: MapPin },
                    { value: 'Phượt & Khám phá', label: 'Phượt & Khám phá', icon: Flame },
                    { value: 'Biển đảo & Nghỉ dưỡng', label: 'Biển đảo & Nghỉ dưỡng', icon: Globe },
                    { value: 'Văn hóa & Lịch sử', label: 'Văn hóa & Lịch sử', icon: Compass }
                  ]}
                />
              </div>

              {/* Content textarea with @mention */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#3B332A]">Nội dung chia sẻ *</label>
                  <button
                    type="button"
                    onClick={() => setPostMentionState(prev => ({ ...prev, isOpen: !prev.isOpen, query: '' }))}
                    className="text-[11px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 px-2 py-0.5 rounded-sm hover:bg-sky-50 transition-colors cursor-pointer"
                    title="Gắn thẻ người bạn đang theo dõi"
                  >
                    <AtSign className="w-3.5 h-3.5" />
                    <span>Gắn thẻ bạn bè ({followingUsers.length})</span>
                  </button>
                </div>
                <textarea
                  ref={postTextareaRef}
                  rows={4}
                  placeholder="Chia sẻ trải nghiệm, kinh nghiệm du lịch hoặc cảm nghĩ của bạn... (Gõ @ để gắn thẻ bạn bè)"
                  value={postContent}
                  onChange={handlePostContentChange}
                  className="w-full p-3.5 bg-[#F8F4EC] border border-[#1E1A15]/10 rounded-sm text-xs text-[#2A241D] placeholder-[#8A7F70] focus:outline-hidden focus:ring-2 focus:ring-clay-500/20 focus:border-clay-600 transition-all resize-none leading-relaxed"
                  required
                />

                {/* Floating Mention Suggestions for Post */}
                {postMentionState.isOpen && (
                  <MentionSuggestionsDropdown
                    followingUsers={followingUsers}
                    query={postMentionState.query}
                    onSelect={handleSelectPostMention}
                    onClose={() => setPostMentionState({ isOpen: false, query: '', cursorIndex: -1 })}
                    positionClass="top-full mt-1.5"
                    title="Gắn thẻ người bạn đang theo dõi vào bài viết"
                  />
                )}

                {/* Tagged Users Chips Bar */}
                {taggedUsersInPost.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2 p-2 bg-sky-50/70 border border-sky-100 rounded-sm">
                    <span className="text-[10px] font-bold text-sky-800 flex items-center gap-1">
                      <AtSign className="w-3 h-3 text-sky-600" />
                      <span>Đang gắn thẻ:</span>
                    </span>
                    {taggedUsersInPost.map(u => (
                      <span
                        key={u.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[#FFFDF8] text-sky-700 text-[11px] font-bold border border-sky-200 "
                      >
                        <img
                          src={
                            u.avatarUrl ||
                            u.avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                          }
                          alt={u.fullName || u.name}
                          className="w-3.5 h-3.5 rounded-full object-cover"
                        />
                        <span>{u.fullName || u.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTaggedUser(u.id)}
                          className="text-[#8A7F70] hover:text-rose-500 transition-colors ml-0.5 cursor-pointer"
                          title="Bỏ gắn thẻ"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* ATTACH MY ITINERARY SELECTOR */}
              <div className="p-3.5 bg-sky-50/70 border border-sky-100 rounded-sm space-y-2">
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

                <CustomSelect
                  value={attachedItineraryId}
                  onChange={setAttachedItineraryId}
                  placeholder="-- Chọn chuyến đi từ lịch trình của bạn --"
                  searchable={true}
                  searchPlaceholder="Tìm kiếm chuyến đi theo tên hoặc địa điểm..."
                  clearable={true}
                  onClear={() => setAttachedItineraryId('')}
                  buttonClassName="bg-[#FFFDF8] border-sky-200 py-2.5 rounded-sm text-xs font-semibold"
                  options={[
                    {
                      value: '',
                      label: '-- Không đính kèm chuyến đi --',
                      description: 'Đăng bài viết chia sẻ thông thường không kèm tour'
                    },
                    ...itineraries.map(itin => ({
                      value: String(itin.id),
                      label: itin.title,
                      description: `${itin.destination || 'Việt Nam'} • ${Number(itin.budgetTotal || 0).toLocaleString('vi-VN')} đ`,
                      image: itin.coverImageUrl,
                      badge: itin.duration ? `${itin.duration} ngày` : 'Tour'
                    }))
                  ]}
                />

                {selectedTripPreview && (
                  <div className="bg-[#FFFDF8] p-3 rounded-sm border border-sky-100 flex items-center gap-3 mt-2 ">
                    <img
                      src={selectedTripPreview.coverImageUrl}
                      alt={selectedTripPreview.title}
                      className="w-12 h-12 rounded-sm object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-xs text-[#1E1A15] truncate">
                        {selectedTripPreview.title}
                      </h5>
                      <p className="text-[11px] text-sky-600 font-semibold">
                        Ngân sách: {Number(selectedTripPreview.budgetTotal || 0).toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-sky-500 flex-shrink-0" />
                  </div>
                )}
              </div>

              {/* ATTACH CHECK-IN PLACE SELECTOR */}
              <div className="p-3.5 bg-[#FAF6EE] border border-[#1E1A15]/10 rounded-sm space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1E1A15] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-clay-600" />
                    <span>Vị trí check-in địa điểm</span>
                  </label>
                  {attachedPlaceId && (
                    <button
                      type="button"
                      onClick={() => setAttachedPlaceId('')}
                      className="text-[10px] text-rose-600 font-bold hover:underline cursor-pointer"
                    >
                      Bỏ check-in
                    </button>
                  )}
                </div>

                <CustomSelect
                  value={attachedPlaceId}
                  onChange={setAttachedPlaceId}
                  placeholder="-- Chọn địa điểm du lịch muốn check-in --"
                  searchable={true}
                  allowCustom={true}
                  searchPlaceholder="Tìm kiếm địa điểm hoặc gõ tên điểm mới..."
                  clearable={true}
                  onClear={() => setAttachedPlaceId('')}
                  buttonClassName="bg-[#FFFDF8] border-[#1E1A15]/15 hover:border-clay-600/50 py-2.5 rounded-sm text-xs font-semibold"
                  options={[
                    {
                      value: '',
                      label: '-- Không check-in địa điểm cụ thể --',
                      description: 'Đăng bài viết thông thường không gắn vị trí'
                    },
                    ...places.map(p => ({
                      value: String(p.id),
                      label: p.name,
                      description: `${p.city || ''} • ${p.categoryName || 'Địa điểm'} • ⭐ ${p.averageRating ? Number(p.averageRating).toFixed(1) : '5.0'}`,
                      image: p.coverImageUrl,
                      badge: p.city || 'Việt Nam'
                    }))
                  ]}
                />

                {/* Subtext link for proposing a new place */}
                <div className="flex items-center justify-between pt-0.5 px-0.5 text-[11px] text-[#6B6154]">
                  <span>Chưa có trên Bản đồ Wayfare?</span>
                  <button
                    type="button"
                    onClick={() => setIsProposePlaceModalOpen(true)}
                    className="font-bold text-clay-700 hover:text-clay-800 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-clay-600" />
                    <span>Đóng góp địa điểm vào CSDL</span>
                  </button>
                </div>

                {selectedPlacePreview && (
                  <div className={`p-3 rounded-sm border flex items-center gap-3 mt-2 ${
                    selectedPlacePreview.isCustom
                      ? 'bg-[#FAF6EE] border-[#1E1A15]/15'
                      : 'bg-[#FFFDF8] border-[#1E1A15]/10'
                  }`}>
                    {selectedPlacePreview.isCustom ? (
                      <div className="w-12 h-12 rounded-sm bg-clay-100/80 border border-clay-200 flex items-center justify-center shrink-0 text-clay-700">
                        <MapPin className="w-6 h-6 text-clay-600" />
                      </div>
                    ) : (
                      <img
                        src={selectedPlacePreview.coverImageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'}
                        alt={selectedPlacePreview.name}
                        className="w-12 h-12 rounded-sm object-cover flex-shrink-0 border border-[#1E1A15]/10"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h5 className="font-bold text-xs text-[#1E1A15] truncate">
                          {selectedPlacePreview.name}
                        </h5>
                        {selectedPlacePreview.isCustom ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-[#F3EDE2] text-clay-800 font-bold border border-clay-300/60">
                            Vị trí check-in tự do
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-emerald-100 text-emerald-800 font-bold border border-emerald-300/60">
                            Địa điểm chính thức
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold truncate text-[#6B6154]">
                        {selectedPlacePreview.isCustom ? 'Gắn nhãn check-in riêng cho bài viết này' : `📍 ${selectedPlacePreview.address || selectedPlacePreview.city}`}
                      </p>
                    </div>
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${
                      selectedPlacePreview.isCustom ? 'text-clay-600' : 'text-emerald-600'
                    }`} />
                  </div>
                )}
              </div>

              {/* MEDIA SECTION: CLOUDINARY UPLOAD */}
              <div className="space-y-3 p-3.5 bg-[#F8F4EC]/80 rounded-sm border border-[#1E1A15]/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2A241D] flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-sky-600" />
                    <span>Ảnh & Video ({postImagesList.length} ảnh{postVideoUrl ? ', 1 video' : ''})</span>
                  </label>
                  {(postImagesList.length > 0 || postVideoUrl) && (
                    <button
                      type="button"
                      onClick={() => createFileInputRef.current?.click()}
                      disabled={uploadingMedia}
                      className="px-2.5 py-1 rounded-sm bg-[#FFFDF8] border border-sky-200 text-sky-700 hover:bg-sky-50 text-[11px] font-bold transition-all flex items-center gap-1  cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Thêm tệp</span>
                    </button>
                  )}
                  <input
                    ref={createFileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleUploadMediaForCreate}
                    className="hidden"
                  />
                </div>

                {/* Upload Status Banner */}
                {uploadingMedia && (
                  <div className="flex items-center gap-2.5 px-3 py-2 bg-sky-50 border border-sky-200 rounded-sm text-xs text-sky-700 font-semibold animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-sky-600 shrink-0" />
                    <span>Đang tải và tối ưu ảnh / video qua Cloudinary CDN...</span>
                  </div>
                )}

                {/* Empty State: Dropzone button */}
                {postImagesList.length === 0 && !postVideoUrl && !uploadingMedia && (
                  <div
                    onClick={() => createFileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#1E1A15]/10 hover:border-sky-400 bg-[#FFFDF8] hover:bg-sky-50/40 rounded-sm p-4 text-center cursor-pointer transition-all group"
                  >
                    <div className="w-10 h-10 mx-auto rounded-full bg-sky-100/70 group-hover:bg-sky-100 text-sky-600 flex items-center justify-center mb-2 transition-transform group-hover:scale-110">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-[#3B332A] group-hover:text-sky-700">
                      Tải ảnh hoặc video thước phim từ thiết bị
                    </p>
                    <p className="text-[11px] text-[#8A7F70] mt-0.5">
                      Hỗ trợ chọn nhiều ảnh (JPG, PNG, WEBP) và video (MP4, MOV) • Tối ưu tự động trên Cloudinary
                    </p>
                  </div>
                )}

                {/* Thumbnails preview */}
                {(postImagesList.length > 0 || postVideoUrl) && (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-1">
                    {postImagesList.map((img, idx) => (
                      <div key={idx} className="relative group rounded-sm overflow-hidden aspect-square border border-[#1E1A15]/10 bg-[#FFFDF8] ">
                        <img src={img} alt="thumb" className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-sm bg-sky-600/90 backdrop-blur-xs text-white text-[9px] font-extrabold ">
                            Ảnh bìa
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveCreateImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700 cursor-pointer "
                          title="Xóa ảnh"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {postVideoUrl && (
                      <div className="relative group rounded-sm overflow-hidden aspect-square border border-sky-300 bg-[#1E1A15] flex flex-col items-center justify-center text-white ">
                        <Video className="w-6 h-6 text-sky-400 mb-1" />
                        <span className="text-[9px] font-bold text-[#B3A895] bg-slate-800/80 px-1 rounded">Video</span>
                        <button
                          type="button"
                          onClick={handleRemoveCreateVideo}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700 cursor-pointer "
                          title="Xóa video"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1E1A15]/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-sm border border-[#1E1A15]/10 text-xs font-bold text-[#5A5146] hover:bg-[#F8F4EC] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingPost || uploadingMedia}
                  className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2.5 rounded-sm text-xs font-extrabold  shadow-sky-600/25 hover:shadow-none transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {uploadingMedia ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang tải tệp...</span>
                    </>
                  ) : submittingPost ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang xuất bản...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Đăng bài viết 🚀</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: AI MODERATION & SAFETY REVIEW FEEDBACK             */}
      {/* ========================================================= */}
      {moderationFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1E1A15]/60 backdrop-blur-xs">
          <div className="bg-[#FFFDF8] rounded-sm sm:rounded-sm max-w-md w-full p-4 sm:p-6  border border-[#1E1A15]/10 space-y-4 animate-in fade-in zoom-in-95 duration-200 text-center">
            <div
              className="w-16 h-16 rounded-sm mx-auto flex items-center justify-center  transition-transform duration-300 scale-105"
              style={{
                background:
                  moderationFeedback.type === 'APPROVED'
                    ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)'
                    : 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)'
              }}
            >
              {moderationFeedback.type === 'APPROVED' ? (
                <CheckCircle2 className="w-8 h-8 text-white" />
              ) : (
                <ShieldAlert className="w-8 h-8 text-white" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-[#1E1A15]">
                {moderationFeedback.title}
              </h3>
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mt-1"
                style={{
                  backgroundColor: moderationFeedback.type === 'APPROVED' ? '#eff6ff' : '#fffbeb',
                  color: moderationFeedback.type === 'APPROVED' ? '#1d4ed8' : '#b45309'
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Điểm an toàn hệ thống: {moderationFeedback.score}/100</span>
              </div>
            </div>

            {moderationFeedback.reason && (
              <div
                className="border rounded-sm p-3.5 text-left text-xs space-y-1 bg-amber-50/80 border-amber-200/80 text-amber-900"
              >
                <span className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Cảnh báo hệ thống:
                </span>
                <p className="text-[11px] leading-relaxed">
                  {moderationFeedback.reason}
                </p>
              </div>
            )}

            <p className="text-xs text-[#5A5146] leading-relaxed font-normal">
              {moderationFeedback.message}
            </p>

            <button
              onClick={() => setModerationFeedback(null)}
              className="w-full py-2.5 rounded-sm text-xs font-extrabold  hover:shadow-none transition-all cursor-pointer text-white bg-sky-600 hover:bg-sky-700 shadow-sky-500/25"
            >
              {moderationFeedback.type === 'APPROVED'
                ? 'Xem bài viết ngay'
                : 'Đã hiểu & Tiếp tục theo dõi'}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: COMMENTS DRAWER / MODAL                          */}
      {/* ========================================================= */}
      {activeCommentPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E1A15]/60 backdrop-blur-xs">
          <div className="bg-[#FFFDF8] rounded-sm max-w-lg w-full p-6  border border-[#1E1A15]/10 max-h-[85vh] flex flex-col space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1E1A15]/10">
              <div>
                <h3 className="font-bold text-base text-[#1E1A15] flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-sky-600" />
                  <span>Bình luận bài viết</span>
                </h3>
                <p className="text-xs text-[#6B6154] truncate max-w-xs">{activeCommentPost.title}</p>
              </div>
              <button
                onClick={() => setActiveCommentPost(null)}
                className="p-1.5 rounded-full hover:bg-[#F3EDE2] text-[#8A7F70] hover:text-[#5A5146] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-96">
              {loadingComments && (
                <div className="flex items-center justify-center py-8 text-[#8A7F70] gap-2 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                  <span>Đang tải bình luận...</span>
                </div>
              )}

              {!loadingComments && postComments.length === 0 && (
                <div className="text-center py-8 text-[#8A7F70] text-xs">
                  Chưa có bình luận nào. Hãy là người đầu tiên trao đổi!
                </div>
              )}

              {!loadingComments &&
                postComments.map((cmt, idx) => {
                  const isMyComment = Boolean(
                    (cmt.authorId && currentUser?.id && Number(cmt.authorId) === Number(currentUser.id)) ||
                    (cmt.userId && currentUser?.id && Number(cmt.userId) === Number(currentUser.id)) ||
                    (cmt.authorEmail && currentUser?.email && cmt.authorEmail.toLowerCase() === currentUser.email.toLowerCase())
                  );

                  return (
                    <div key={cmt.id || idx} className="space-y-2 p-2 rounded-sm hover:bg-[#F8F4EC]/70 transition-colors">
                      <div className="flex items-start gap-2.5">
                        <img
                          onClick={() => {
                            const targetId = cmt.authorId || cmt.userId;
                            if (targetId) setSelectedUserIdForModal(targetId);
                          }}
                          src={
                            cmt.authorAvatar ||
                            cmt.userAvatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                          }
                          alt={cmt.authorName || cmt.userName || 'User'}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5 cursor-pointer hover:ring-2 hover:ring-sky-400 transition-all "
                          title="Xem trang cá nhân"
                        />
                        <div className="flex-1 bg-[#F3EDE2]/80 rounded-sm px-3.5 py-2.5">
                          <div className="flex items-center justify-between">
                            <span
                              onClick={() => {
                                const targetId = cmt.authorId || cmt.userId;
                                if (targetId) setSelectedUserIdForModal(targetId);
                              }}
                              className="font-bold text-xs text-[#1E1A15] cursor-pointer hover:text-sky-600 transition-colors"
                            >
                              {cmt.authorName || cmt.userName || 'Thành viên'}
                            </span>
                            <span className="text-[10px] text-[#8A7F70]">{cmt.timeAgo || cmt.formattedDate || 'Vừa xong'}</span>
                          </div>
                          <p className="text-xs text-[#3B332A] mt-1 leading-relaxed">
                            {renderTextWithMentions(cmt.content, followingUsers, (uid) => setSelectedUserIdForModal(uid))}
                          </p>
                          <div className="mt-1.5 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => {
                                if (!requireAuth('trả lời bình luận')) return;
                                setReplyingTo({
                                  commentId: cmt.id,
                                  authorId: cmt.authorId || cmt.userId,
                                  authorName: cmt.authorName || cmt.userName || 'Thành viên'
                                });
                                setTimeout(() => commentInputRef.current?.focus(), 50);
                              }}
                              className="text-[11px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <CornerDownRight className="w-3.5 h-3.5" />
                              <span>Trả lời</span>
                            </button>
                            {(isMyComment || currentUser?.email?.toLowerCase().includes('admin')) && (
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(cmt.id)}
                                className="text-[11px] font-medium text-[#8A7F70] hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
                                title="Xóa bình luận"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Xóa</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Nested Replies */}
                      {cmt.replies && cmt.replies.length > 0 && (
                        <div className="ml-7 sm:ml-9 pl-3 border-l-2 border-sky-100 space-y-2">
                          {cmt.replies.map((reply, rIdx) => {
                            const isMyReply = Boolean(
                              (reply.authorId && currentUser?.id && Number(reply.authorId) === Number(currentUser.id)) ||
                              (reply.userId && currentUser?.id && Number(reply.userId) === Number(currentUser.id)) ||
                              (reply.authorEmail && currentUser?.email && reply.authorEmail.toLowerCase() === currentUser.email.toLowerCase())
                            );

                            return (
                              <div key={reply.id || rIdx} className="flex items-start gap-2 text-xs">
                                <img
                                  onClick={() => {
                                    const targetId = reply.authorId || reply.userId;
                                    if (targetId) setSelectedUserIdForModal(targetId);
                                  }}
                                  src={
                                    reply.authorAvatar ||
                                    reply.userAvatar ||
                                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                                  }
                                  alt={reply.authorName || reply.userName}
                                  className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5 cursor-pointer hover:ring-1 hover:ring-sky-400"
                                />
                                <div className="flex-1 bg-[#FFFDF8] border border-[#1E1A15]/10 rounded-sm px-3 py-2 ">
                                  <div className="flex items-center justify-between">
                                    <span
                                      onClick={() => {
                                        const targetId = reply.authorId || reply.userId;
                                        if (targetId) setSelectedUserIdForModal(targetId);
                                      }}
                                      className="font-bold text-[11px] text-[#1E1A15] cursor-pointer hover:text-sky-600"
                                    >
                                      {reply.authorName || reply.userName}
                                    </span>
                                    <span className="text-[10px] text-[#8A7F70]">{reply.timeAgo || reply.formattedDate || 'Vừa xong'}</span>
                                  </div>
                                  {reply.replyToUserName && (
                                    <div className="text-[10px] text-sky-600 font-bold mb-0.5">
                                      @{reply.replyToUserName}
                                    </div>
                                  )}
                                  <p className="text-xs text-[#3B332A] leading-relaxed">
                                    {renderTextWithMentions(reply.content, followingUsers, (uid) => setSelectedUserIdForModal(uid))}
                                  </p>
                                  <div className="mt-1 flex items-center justify-between">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setReplyingTo({
                                          commentId: cmt.id,
                                          authorId: reply.authorId || reply.userId,
                                          authorName: reply.authorName || reply.userName
                                        });
                                        setTimeout(() => commentInputRef.current?.focus(), 50);
                                      }}
                                      className="text-[10px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
                                    >
                                      <CornerDownRight className="w-3 h-3" /> Trả lời
                                    </button>
                                    {(isMyReply || currentUser?.email?.toLowerCase().includes('admin')) && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteComment(reply.id)}
                                        className="text-[10px] font-medium text-[#8A7F70] hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                                        title="Xóa phản hồi"
                                      >
                                        <Trash2 className="w-3 h-3" /> Xóa
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Replying Banner if active */}
            {replyingTo && (
              <div className="flex items-center justify-between px-3 py-1.5 bg-sky-50 border border-sky-200/80 rounded-sm text-xs text-sky-700 animate-in fade-in duration-150">
                <span className="flex items-center gap-1.5 font-medium truncate">
                  <CornerDownRight className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>Đang trả lời <strong className="font-bold text-sky-900">@{replyingTo.authorName}</strong></span>
                </span>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="p-1 hover:bg-sky-100 rounded-sm text-sky-600 transition-colors cursor-pointer shrink-0"
                  title="Hủy trả lời"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Comment Input Box or Guest Login Prompt */}
            {isLoggedIn ? (
              <div className="pt-2 border-t border-[#1E1A15]/10 relative">
                {commentMentionState.isOpen && (
                  <MentionSuggestionsDropdown
                    followingUsers={followingUsers}
                    query={commentMentionState.query}
                    onSelect={handleSelectCommentMention}
                    onClose={() => setCommentMentionState({ isOpen: false, query: '', cursorIndex: -1 })}
                    positionClass="bottom-full mb-2 left-0"
                    title="Gắn thẻ người bạn đang theo dõi"
                  />
                )}
                <form onSubmit={handleAddComment} className="flex items-center gap-2">
                  <div className="flex-1 relative flex items-center">
                    <input
                      ref={commentInputRef}
                      type="text"
                      placeholder={
                        replyingTo
                          ? `Trả lời @${replyingTo.authorName}... (Gõ @ để gắn thẻ)`
                          : "Viết bình luận hoặc đặt câu hỏi... (Gõ @ để gắn thẻ)"
                      }
                      value={commentInput}
                      onChange={handleCommentInputChange}
                      className="w-full pl-4 pr-9 py-2.5 bg-[#F8F4EC] border border-[#1E1A15]/10 rounded-full text-xs text-[#2A241D] placeholder-[#8A7F70] focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setCommentMentionState(prev => ({ ...prev, isOpen: !prev.isOpen, query: '' }))}
                      className="absolute right-2.5 p-1 rounded-full text-[#8A7F70] hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                      title="Gắn thẻ người bạn đang theo dõi (@)"
                    >
                      <AtSign className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={submittingComment || !commentInput.trim()}
                    className="bg-sky-600 hover:bg-sky-700 text-white p-2.5 rounded-full hover:shadow-none transition-all disabled:opacity-50 cursor-pointer  shadow-sky-500/20"
                  >
                    {submittingComment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="pt-3 border-t border-[#1E1A15]/10 p-3 bg-gradient-to-r from-sky-50 via-white to-blue-50/70 rounded-sm flex items-center justify-between gap-3 text-xs">
                <span className="text-[#5A5146] font-medium">Đăng nhập để tham gia bình luận thảo luận</span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-sm bg-sky-600 hover:bg-sky-700 text-white font-bold cursor-pointer whitespace-nowrap active:scale-95 "
                >
                  Đăng nhập ngay
                </button>
              </div>
            )}
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

      {/* ========================================================= */}
      {/* MODAL 4: USER PROFILE MODAL (Full User Details & Follow) */}
      {/* ========================================================= */}
      {selectedUserIdForModal && (
        <UserProfileModal
          userId={selectedUserIdForModal}
          onClose={() => setSelectedUserIdForModal(null)}
          onSelectItinerary={(itin) => {
            setSelectedUserIdForModal(null);
            setSelectedItineraryForModal(itin);
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL 5: EDIT POST MODAL (With AI Re-moderation)          */}
      {/* ========================================================= */}
      {postToEdit && (
        <EditPostModal
          post={postToEdit}
          onClose={() => setPostToEdit(null)}
          onPostUpdated={handlePostUpdated}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL 6: SINGLE POST DETAIL MODAL                         */}
      {/* ========================================================= */}
      {selectedPostForDetail && (
        <PostDetailModal
          post={selectedPostForDetail}
          onClose={() => setSelectedPostForDetail(null)}
          onAuthorClick={(authorId) => {
            setSelectedPostForDetail(null);
            setSelectedUserIdForModal(authorId);
          }}
          onSelectItinerary={(itin) => {
            setSelectedPostForDetail(null);
            setSelectedItineraryForModal(itin);
          }}
          onReportPost={(post) => {
            setPostToReport(post);
          }}
          onPostUpdated={(postId, updates) => {
            setPosts(prev =>
              prev.map(p => (Number(p.id) === Number(postId) ? { ...p, ...updates } : p))
            );
            if (updates?.isBookmarked !== undefined) {
              setBookmarkedPostIds(prev => {
                const next = new Set(prev);
                if (updates.isBookmarked) {
                  next.add(Number(postId));
                } else {
                  next.delete(Number(postId));
                }
                return next;
              });
            }
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL 7: FOLLOW LIST MODAL (Followers & Following)        */}
      {/* ========================================================= */}
      {followListModalState.isOpen && (
        <FollowListModal
          userId={followListModalState.userId}
          userName={followListModalState.userName}
          initialTab={followListModalState.tab}
          onClose={() => setFollowListModalState(prev => ({ ...prev, isOpen: false }))}
          onSelectUser={(userId) => {
            setFollowListModalState(prev => ({ ...prev, isOpen: false }));
            setSelectedUserIdForModal(userId);
          }}
          onFollowChange={(targetUserId, isNowFollowing) => {
            setFollowingIds(prev => {
              const next = new Set(prev);
              if (isNowFollowing) {
                next.add(Number(targetUserId));
              } else {
                next.delete(Number(targetUserId));
              }
              return next;
            });
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL 8: MODERN FACEBOOK-STYLE SHARE MODAL                 */}
      {/* ========================================================= */}
      {sharingPost && (
        <ShareModal
          post={sharingPost}
          onClose={() => setSharingPost(null)}
          onPostShared={() => {
            fetchPosts();
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL 9: REPORT POST MODAL                                */}
      {/* ========================================================= */}
      {postToReport && (
        <ReportPostModal
          post={postToReport}
          onClose={() => setPostToReport(null)}
          onReportSuccess={(reportedPostId) => {
            const targetId = reportedPostId || postToReport?.id;
            if (targetId) {
              setHiddenPostIds(prev => new Set(prev).add(Number(targetId)));
              setPosts(prev => prev.map(p => Number(p.id) === Number(targetId) ? { ...p, status: 'PENDING_REPORT', reportsCount: (p.reportsCount || 0) + 1 } : p));
            }
            setSelectedPostForDetail(null);
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL 10: FULLSCREEN PHOTO LIGHTBOX MODAL                 */}
      {/* ========================================================= */}
      {lightboxState.isOpen && (
        <ImageLightboxModal
          isOpen={lightboxState.isOpen}
          images={lightboxState.images}
          initialIndex={lightboxState.initialIndex}
          post={lightboxState.post}
          onClose={() => setLightboxState(prev => ({ ...prev, isOpen: false }))}
          onOpenPostDetail={(targetPost) => setSelectedPostForDetail(targetPost)}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL 11: BLOG ARTICLE READER MODAL (Magazine Style)       */}
      {/* ========================================================= */}
      {readingPost && (
        <BlogArticleReaderModal
          post={readingPost}
          onClose={() => setReadingPost(null)}
          onOpenItinerary={(itin) => {
            setReadingPost(null);
            setSelectedItineraryForModal(itin);
          }}
          onToggleLike={(postId) => handleToggleLike(postId)}
          onBookmarkToggle={(postId) => handleToggleBookmark(postId)}
          onAuthorClick={(authorId) => {
            setReadingPost(null);
            setSelectedUserIdForModal(authorId);
          }}
          onReadRelated={(relatedPost) => setReadingPost(relatedPost)}
          relatedPosts={posts.filter(p => Number(p.id) !== Number(readingPost.id)).slice(0, 4)}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL 12: POST LIKERS MODAL (Who Liked This Post)         */}
      {/* ========================================================= */}
      {likersPost && (
        <PostLikersModal
          postId={likersPost.id}
          postTitle={likersPost.title}
          onClose={() => setLikersPost(null)}
          onSelectUser={(u) => {
            setLikersPost(null);
            if (u?.id) setSelectedUserIdForModal(u.id);
          }}
          onFollowChange={(targetUserId, isNowFollowing) => {
            setFollowingIds(prev => {
              const next = new Set(prev);
              if (isNowFollowing) next.add(Number(targetUserId));
              else next.delete(Number(targetUserId));
              return next;
            });
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL 13: PROPOSE NEW PLACE MODAL (Add place to DB)       */}
      {/* ========================================================= */}
      <ProposePlaceModal
        isOpen={isProposePlaceModalOpen}
        onClose={() => setIsProposePlaceModalOpen(false)}
        initialName={
          typeof attachedPlaceId === 'string' && attachedPlaceId.startsWith('custom:')
            ? attachedPlaceId.replace('custom:', '').trim()
            : ''
        }
        onPlaceCreated={handlePlaceCreatedFromProposal}
        currentUser={currentUser}
      />

    </div>
  );
};

