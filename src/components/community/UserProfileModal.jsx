import React, { useState, useEffect } from 'react';
import { X, MapPin, Users, UserPlus, UserCheck, Compass, Route, Heart, MessageCircle, Eye, Copy, DollarSign, Sparkles, Loader2, Lock, Globe, ArrowRight, Award } from 'lucide-react';
import { userApi, itineraryApi } from '../../services/api';
import { useToast } from '../common/Toast';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { PostDetailModal } from './PostDetailModal';
import { FollowListModal } from './FollowListModal';
import { ItineraryDetailModal } from '../itinerary/ItineraryDetailModal';
import { UserAvatar } from '../common/UserAvatar';
import { getUserTier } from '../../utils/tierSystem';

export const UserProfileModal = ({ userId, onClose, onSelectItinerary }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'itineraries'
  const [cloningItinId, setCloningItinId] = useState(null);
  const [selectedPostForDetail, setSelectedPostForDetail] = useState(null);
  const [selectedItineraryDetail, setSelectedItineraryDetail] = useState(null);
  const [followModalState, setFollowModalState] = useState({ isOpen: false, tab: 'following' });

  const toast = useToast();
  const { currentUser, setItineraries, isLoggedIn, setIsAuthModalOpen, setAuthMode } = useApp();

  // Require auth guard helper for guests
  const requireAuth = (actionName = 'thực hiện thao tác này') => {
    if (!isLoggedIn) {
      toast.showInfo(`Vui lòng đăng nhập để ${actionName}!`);
      setAuthMode('login');
      setIsAuthModalOpen(true);
      return false;
    }
    return true;
  };

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await userApi.getProfile(userId);
        if (isMounted) {
          setProfile(data);
        }
      } catch (err) {
        console.error('Lỗi khi tải trang cá nhân:', err);
        toast.showError('Không thể tải thông tin người dùng: ' + err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (userId) {
      loadProfile();
    }
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const handleToggleFollow = async () => {
    if (!profile) return;
    if (!requireAuth('theo dõi người dùng')) return;
    try {
      setFollowLoading(true);
      const res = await userApi.toggleFollow(profile.id);
      setProfile(prev => ({
        ...prev,
        isFollowing: res.isFollowing,
        followersCount: res.followersCount,
        followingCount: res.followingCount
      }));

      // Broadcast follow status change to entire app (ProfilePage, Community, etc.)
      window.dispatchEvent(new CustomEvent('wayfare_follow_changed', {
        detail: { targetUserId: profile.id, isFollowing: res.isFollowing }
      }));

      if (res.isFollowing) {
        toast.showSuccess(`Đã theo dõi ${profile.fullName}! ✨`);
      } else {
        toast.showInfo(`Đã hủy theo dõi ${profile.fullName}`);
      }
    } catch (err) {
      toast.showError('Thao tác theo dõi thất bại: ' + err.message);
    } finally {
      setFollowLoading(false);
    }
  };

  const isOwnProfile = Boolean(
    currentUser && (
      (userId && currentUser.id && String(userId) === String(currentUser.id)) ||
      (profile?.id && currentUser.id && String(profile.id) === String(currentUser.id)) ||
      (profile?.userId && currentUser.id && String(profile.userId) === String(currentUser.id)) ||
      (profile?.email && currentUser.email && profile.email.toLowerCase() === currentUser.email.toLowerCase()) ||
      (profile?.username && currentUser.username && profile.username.toLowerCase() === currentUser.username.toLowerCase()) ||
      (profile?.fullName && (currentUser.name || currentUser.fullName) && profile.fullName.trim().toLowerCase() === (currentUser.name || currentUser.fullName).trim().toLowerCase())
    )
  );

  const handleCloneItinerary = async (itin) => {
    if (!requireAuth('sao chép lịch trình')) return;

    const isOwner = Boolean(
      isOwnProfile ||
      (itin.creatorId && currentUser?.id && String(itin.creatorId) === String(currentUser.id)) ||
      (itin.userId && currentUser?.id && String(itin.userId) === String(currentUser.id)) ||
      (itin.creatorEmail && currentUser?.email && itin.creatorEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
      (itin.userEmail && currentUser?.email && itin.userEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
      (itin.creatorName && (currentUser?.name || currentUser?.fullName) && itin.creatorName.trim().toLowerCase() === (currentUser.name || currentUser.fullName).trim().toLowerCase())
    );

    if (isOwner) {
      toast.showWarning('Bạn là tác giả của lịch trình này nên không thể tự sao chép!');
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn sao chép lịch trình "${itin.title}" vào kho của bạn không?`)) {
      return;
    }

    try {
      setCloningItinId(itin.id);
      const cloned = await itineraryApi.cloneItinerary(itin.id, currentUser?.email);
      if (cloned) {
        setItineraries(prev => [cloned, ...prev]);
        toast.showSuccess(`Đã sao chép lịch trình "${itin.title}" vào kho của bạn! 🎉`);
      }
    } catch (err) {
      toast.showError('Không thể sao chép lịch trình: ' + (err.message || 'Lỗi kết nối'));
    } finally {
      setCloningItinId(null);
    }
  };

  const handleStartChat = () => {
    if (!requireAuth(`nhắn tin với ${profile?.fullName || 'tác giả'}`)) return;
    if (onClose) onClose();
    const targetId = profile?.id || profile?.userId || userId;
    const targetName = profile?.fullName || profile?.name || '';
    const targetAvatar = profile?.avatar || profile?.avatarUrl || '';
    const params = new URLSearchParams({
      userId: targetId,
      name: targetName,
      avatar: targetAvatar
    }).toString();
    navigate(`/messages?${params}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFDF8] rounded-[6px] max-w-3xl sm:max-w-4xl w-full shadow-2xl border border-ink-200/80 max-h-[92vh] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-30 w-8 h-8 rounded-[4px] bg-ink-950/60 hover:bg-ink-950/80 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-md"
          title="Đóng hồ sơ"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Profile Content Container */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 gap-3 text-ink-500">
            <Loader2 className="w-7 h-7 animate-spin text-clay-600" />
            <span className="text-xs font-semibold text-ink-600 font-serif">Đang tải hồ sơ du khách...</span>
          </div>
        ) : profile ? (
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {/* Cover Banner: Displays real cover image with subtle dark overlay */}
            <div
              className="relative h-40 sm:h-52 bg-cover bg-center shrink-0 overflow-hidden"
              style={{
                backgroundImage: `url('${profile.coverImageUrl || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80"}')`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/20 to-transparent"></div>
            </div>

            <div className="px-5 sm:px-8 pb-7 space-y-5">
              {/* Header info: Avatar, Names, Follow button */}
              <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1 sm:pt-2">
                <div className="flex items-end gap-4">
                  <div className="relative shrink-0 -mt-16 sm:-mt-20">
                    <UserAvatar user={profile} size="2xl" showBadge={true} showVerified={Boolean(profile.isVerified)} />
                  </div>
                  <div className="pb-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-xl sm:text-2xl font-black font-display text-ink-800 leading-snug tracking-tight truncate">
                        {profile.fullName}
                      </h3>
                      {(() => {
                        const tier = getUserTier(profile);
                        return (
                          <span className={`px-2 py-0.5 rounded-[4px] text-[11px] font-bold flex items-center gap-1 border shadow-2xs ${tier.badgeBg}`}>
                            <span>{tier.icon}</span>
                            <span>{tier.name}</span>
                          </span>
                        );
                      })()}
                    </div>
                    <p className="text-xs sm:text-sm text-ink-500 font-mono font-medium flex items-center gap-2 mt-1 truncate">
                      <span className="text-ink-700 font-semibold">{profile.handle || '@wayfarer'}</span>
                      <span className="text-ink-300">•</span>
                      <span className="flex items-center gap-1 text-ink-600 font-serif">
                        <MapPin className="w-3.5 h-3.5 text-clay-600" /> {profile.location || 'Đà Nẵng, Việt Nam'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Follow / Unfollow Action */}
                <div className="sm:pb-1 flex items-center gap-2">
                  {Boolean(
                    (currentUser?.id && profile?.id && Number(currentUser.id) === Number(profile.id)) ||
                    (currentUser?.email && profile?.email && currentUser.email.toLowerCase() === profile.email.toLowerCase()) ||
                    (currentUser?.handle && profile?.handle && currentUser.handle.toLowerCase() === profile.handle.toLowerCase()) ||
                    (currentUser?.name && profile?.fullName && currentUser.name.trim().toLowerCase() === profile.fullName.trim().toLowerCase())
                  ) ? (
                    <span className="px-3.5 py-1.5 rounded-[5px] bg-[#F8F4EC] text-ink-600 text-xs font-bold border border-ink-200/80 shadow-2xs">
                      Tài khoản của bạn
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleToggleFollow}
                        disabled={followLoading}
                        className={`px-4 sm:px-4.5 py-2 rounded-[5px] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                          profile.isFollowing
                            ? 'bg-[#FFFDF8] hover:bg-rose-50 text-ink-700 hover:text-rose-700 border border-ink-200/80'
                            : 'bg-clay-600 hover:bg-clay-700 text-white'
                        }`}
                      >
                        {followLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : profile.isFollowing ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-clay-600" />
                            <span>Đang theo dõi</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Theo dõi</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleStartChat}
                        className="px-3.5 py-2 rounded-[5px] text-xs font-bold bg-[#FFFDF8] hover:bg-clay-50 text-clay-700 border border-ink-200/80 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        title={`Gửi tin nhắn trực tiếp cho ${profile?.fullName || 'thành viên này'}`}
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-clay-600" />
                        <span>Nhắn tin</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio & Travel Preferences */}
              <div className="space-y-2.5">
                {profile.bio && (
                  <p className="text-xs sm:text-sm text-ink-700 leading-relaxed font-serif bg-[#F8F4EC] p-3.5 sm:p-4 rounded-[5px] border border-ink-200/80">
                    {profile.bio}
                  </p>
                )}
                <div className="flex items-center gap-2 flex-wrap text-xs pt-0.5">
                  {profile.travelStyle && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-clay-50 text-clay-800 border border-clay-200/70 font-semibold shadow-2xs">
                      <Compass className="w-3.5 h-3.5 text-clay-600" />
                      <span>{profile.travelStyle}</span>
                    </span>
                  )}
                  {profile.budgetPreference && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-semibold shadow-2xs">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{profile.budgetPreference}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-2 sm:gap-3 p-2.5 bg-[#F8F4EC] rounded-[6px] border border-ink-200/80 text-center">
                <div
                  onClick={() => setActiveTab('posts')}
                  className={`cursor-pointer rounded-[5px] py-2 px-1 transition-all group border ${
                    activeTab === 'posts'
                      ? 'bg-[#FFFDF8] shadow-xs border-ink-200/80'
                      : 'hover:bg-[#FFFDF8]/80 border-transparent hover:border-ink-200/60'
                  }`}
                  title="Bấm để xem danh sách bài viết đã chia sẻ"
                >
                  <span className="flex items-center justify-center gap-1 text-base sm:text-lg font-black font-display text-ink-800 group-hover:text-clay-700 transition-colors">
                    {profile.postsCount || profile.posts?.length || 0}
                    <Globe className="w-3.5 h-3.5 text-clay-600 shrink-0" />
                  </span>
                  <span className="block text-[11px] sm:text-xs text-ink-500 font-serif group-hover:text-ink-800 leading-normal mt-0.5">
                    Bài viết
                  </span>
                </div>

                <div
                  onClick={() => setActiveTab('itineraries')}
                  className={`cursor-pointer rounded-[5px] py-2 px-1 transition-all group border ${
                    activeTab === 'itineraries'
                      ? 'bg-[#FFFDF8] shadow-xs border-ink-200/80'
                      : 'hover:bg-[#FFFDF8]/80 border-transparent hover:border-ink-200/60'
                  }`}
                  title="Bấm để xem danh sách lịch trình"
                >
                  <span className="flex items-center justify-center gap-1 text-base sm:text-lg font-black font-display text-ink-800 group-hover:text-amber-700 transition-colors">
                    {profile.itinerariesCount || profile.itineraries?.length || 0}
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  </span>
                  <span className="block text-[11px] sm:text-xs text-ink-500 font-serif group-hover:text-ink-800 leading-normal mt-0.5">
                    Lịch trình
                  </span>
                </div>

                <div
                  onClick={() => setFollowModalState({ isOpen: true, tab: 'followers' })}
                  className="cursor-pointer hover:bg-[#FFFDF8] hover:shadow-xs rounded-[5px] py-2 px-1 transition-all group border border-transparent hover:border-ink-200/60"
                  title="Bấm để xem danh sách người theo dõi"
                >
                  <span className="flex items-center justify-center gap-1 text-base sm:text-lg font-black font-display text-clay-700 transition-transform">
                    {profile.followersCount || 0}
                    <Users className="w-3.5 h-3.5 text-clay-600 shrink-0" />
                  </span>
                  <span className="block text-[11px] sm:text-xs text-ink-500 font-serif group-hover:text-clay-800 leading-normal mt-0.5">
                    Người theo dõi
                  </span>
                </div>

                <div
                  onClick={() => setFollowModalState({ isOpen: true, tab: 'following' })}
                  className="cursor-pointer hover:bg-[#FFFDF8] hover:shadow-xs rounded-[5px] py-2 px-1 transition-all group border border-transparent hover:border-ink-200/60"
                  title="Bấm để xem danh sách đang theo dõi"
                >
                  <span className="flex items-center justify-center gap-1 text-base sm:text-lg font-black font-display text-ink-800 transition-transform">
                    {profile.followingCount || 0}
                    <UserCheck className="w-3.5 h-3.5 text-clay-600 shrink-0" />
                  </span>
                  <span className="block text-[11px] sm:text-xs text-ink-500 font-serif group-hover:text-ink-800 leading-normal mt-0.5">
                    Đang theo dõi
                  </span>
                </div>
              </div>

              {/* Segmented Tab Navigation */}
              <div className="flex p-1 bg-[#F8F4EC] rounded-[5px] border border-ink-200/80 gap-1">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-[4px] transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === 'posts'
                      ? 'bg-[#FFFDF8] text-clay-700 shadow-2xs border border-ink-200/60'
                      : 'text-ink-500 hover:text-ink-800'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-clay-600" />
                  <span>Bài viết chia sẻ</span>
                  <span className={`px-1.5 py-0.2 rounded-[3px] text-[10px] font-mono ${
                    activeTab === 'posts' ? 'bg-clay-100 text-clay-800' : 'bg-ink-200/70 text-ink-600'
                  }`}>
                    {profile.posts?.length || 0}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('itineraries')}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-[4px] transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === 'itineraries'
                      ? 'bg-[#FFFDF8] text-clay-700 shadow-2xs border border-ink-200/60'
                      : 'text-ink-500 hover:text-ink-800'
                  }`}
                >
                  <Route className="w-3.5 h-3.5 text-clay-600" />
                  <span>Kho Lịch trình</span>
                  <span className={`px-1.5 py-0.2 rounded-[3px] text-[10px] font-mono ${
                    activeTab === 'itineraries' ? 'bg-clay-100 text-clay-800' : 'bg-ink-200/70 text-ink-600'
                  }`}>
                    {profile.itineraries?.length || 0}
                  </span>
                </button>
              </div>

              {/* Tab 1: Posts List */}
              {activeTab === 'posts' && (
                <div className="space-y-4">
                  {(!profile.posts || profile.posts.length === 0) ? (
                    <div className="text-center py-12 px-4 text-ink-400 text-xs sm:text-sm bg-[#F8F4EC]/60 rounded-[6px] border border-dashed border-ink-200 font-serif">
                      Người dùng này chưa có bài viết công khai nào.
                    </div>
                  ) : (
                    profile.posts.map(post => (
                      <article
                        key={post.id}
                        className="p-4 sm:p-5 rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 shadow-2xs hover:shadow-xs transition-all space-y-3 group"
                      >
                        {/* Author Header */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={post.authorAvatar || profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                              alt={post.authorName || profile.fullName}
                              className="w-9 h-9 rounded-full object-cover ring-1 ring-ink-200 shadow-2xs shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold font-display text-xs sm:text-sm text-ink-800 truncate">
                                  {post.authorName || profile.fullName}
                                </span>
                                <span className="px-1.5 py-0.2 rounded-[3px] bg-clay-50 text-clay-800 text-[10px] font-bold border border-clay-200/80">
                                  {post.authorRole || profile.role || 'Wanderer Gold'}
                                </span>
                              </div>
                              <p className="text-[11px] text-ink-400 flex items-center gap-1.5 mt-0.5 font-serif">
                                <span>{post.formattedDate || post.timeAgo || 'Vừa xong'}</span>
                                {post.locationTag && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-0.5 text-ink-600 font-medium truncate">
                                      <MapPin className="w-3 h-3 text-clay-600 shrink-0" />
                                      {post.locationTag}
                                    </span>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>

                          {post.visibility === 'PRIVATE' ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-[#F8F4EC] text-ink-600 font-bold text-[10px] shrink-0 border border-ink-200/60">
                              <Lock className="w-3 h-3" /> Chỉ mình tôi
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-clay-50 text-clay-700 font-bold text-[10px] shrink-0 border border-clay-200/60">
                              <Globe className="w-3 h-3" /> Công khai
                            </span>
                          )}
                        </div>

                        {/* Title & Content */}
                        <div className="space-y-1">
                          {post.title && (
                            <h4
                              onClick={() =>
                                setSelectedPostForDetail({
                                  ...post,
                                  authorName: profile.fullName,
                                  authorAvatar: profile.avatarUrl,
                                  authorHandle: profile.handle,
                                  authorRole: profile.role,
                                  authorId: profile.id
                                })
                              }
                              className="font-display font-black text-base text-ink-800 group-hover:text-clay-700 transition-colors leading-snug cursor-pointer"
                            >
                              {post.title}
                            </h4>
                          )}
                          <p className="text-xs sm:text-sm text-ink-700 leading-relaxed whitespace-pre-line font-serif">
                            {post.content}
                          </p>
                        </div>

                        {/* Image Gallery */}
                        {post.images && post.images.length > 0 && (
                          <div
                            onClick={() =>
                              setSelectedPostForDetail({
                                ...post,
                                authorName: profile.fullName,
                                authorAvatar: profile.avatarUrl,
                                authorHandle: profile.handle,
                                authorRole: profile.role,
                                authorId: profile.id
                              })
                            }
                            className="cursor-pointer overflow-hidden rounded-[5px]"
                          >
                            {post.images.length === 1 ? (
                              <img
                                src={post.images[0]}
                                alt="Post photo"
                                className="w-full max-h-80 sm:max-h-96 object-cover rounded-[5px] hover:scale-[1.01] transition-transform duration-300"
                              />
                            ) : post.images.length === 2 ? (
                              <div className="grid grid-cols-2 gap-2 h-52 sm:h-64 rounded-[5px] overflow-hidden">
                                {post.images.slice(0, 2).map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    alt={`Photo ${idx}`}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                  />
                                ))}
                              </div>
                            ) : (
                              <div className="grid grid-cols-3 gap-2 h-44 sm:h-52 rounded-[5px] overflow-hidden">
                                {post.images.slice(0, 3).map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    alt={`Photo ${idx}`}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Attached Itinerary Preview */}
                        {(post.itineraryId || post.itineraryTitle) && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItineraryDetail({
                                id: post.itineraryId,
                                title: post.itineraryTitle,
                                destination: post.itineraryDestination || post.locationTag || 'Việt Nam',
                                budgetTotal: post.itineraryBudget || 3500000,
                                isAiGenerated: post.itineraryIsAi ?? true
                              });
                            }}
                            className="p-3 bg-[#F8F4EC] hover:bg-[#EFE9DC] rounded-[5px] border border-ink-200/80 flex items-center justify-between gap-3 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-[4px] bg-clay-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                                <Route className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[10px] font-bold text-clay-700 uppercase tracking-wider block font-serif">
                                  Lịch trình đính kèm
                                </span>
                                <span className="font-bold text-xs sm:text-sm text-ink-800 truncate block">
                                  {post.itineraryTitle}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-clay-700 hover:text-clay-800 shrink-0 flex items-center gap-1">
                              <span>Xem tour</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        )}

                        {/* Engagement Footer */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-ink-200/60 text-xs text-ink-500">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5 font-bold text-rose-600 font-mono">
                              <Heart className="w-3.5 h-3.5 fill-rose-600/20 text-rose-600" />
                              <span>{post.likeCount || 0}</span>
                            </span>
                            <span className="flex items-center gap-1.5 font-semibold text-clay-700 font-mono">
                              <MessageCircle className="w-3.5 h-3.5 text-clay-600" />
                              <span>{post.commentCount || 0}</span>
                            </span>
                          </div>

                          <button
                            onClick={() =>
                              setSelectedPostForDetail({
                                ...post,
                                authorName: profile.fullName,
                                authorAvatar: profile.avatarUrl,
                                authorHandle: profile.handle,
                                authorRole: profile.role,
                                authorId: profile.id
                              })
                            }
                            className="text-xs font-bold text-clay-700 hover:text-clay-800 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>Xem chi tiết & bình luận</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              )}

              {/* Tab 2: Itineraries List */}
              {activeTab === 'itineraries' && (
                <div>
                  {(!profile.itineraries || profile.itineraries.length === 0) ? (
                    <div className="text-center py-12 px-4 text-ink-400 text-xs sm:text-sm bg-[#F8F4EC]/60 rounded-[6px] border border-dashed border-ink-200 font-serif">
                      Người dùng này chưa xuất bản lịch trình nào.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {profile.itineraries.map(itin => (
                        <div
                          key={itin.id}
                          className="bg-[#FFFDF8] rounded-[6px] border border-ink-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between overflow-hidden group"
                        >
                          {/* Cover Image & Badges */}
                          <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-ink-100">
                            <img
                              src={itin.coverImageUrl || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80'}
                              alt={itin.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/20 to-transparent"></div>

                            {/* Top Badges */}
                            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 flex-wrap">
                              {itin.isAiGenerated ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-clay-600/90 text-white text-[10px] font-bold backdrop-blur-md shadow-2xs">
                                  <Sparkles className="w-3 h-3 text-amber-300" />
                                  <span>Gợi ý du lịch</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-ink-900/80 text-white text-[10px] font-bold backdrop-blur-md shadow-2xs">
                                  <Route className="w-3 h-3 text-clay-300" />
                                  <span>Lộ trình phượt</span>
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded-[3px] bg-[#FFFDF8]/90 backdrop-blur-md text-ink-800 text-[10px] font-mono font-bold shadow-2xs">
                                {itin.startDate && itin.endDate
                                  ? `${Math.max(1, Math.round((new Date(itin.endDate) - new Date(itin.startDate)) / (1000 * 60 * 60 * 24)) + 1)}N${Math.max(1, Math.round((new Date(itin.endDate) - new Date(itin.startDate)) / (1000 * 60 * 60 * 24)))}Đ`
                                  : '3N2Đ'}
                              </span>
                            </div>

                            {/* Destination Bottom Overlay */}
                            <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center gap-1.5 text-white">
                              <MapPin className="w-3.5 h-3.5 text-clay-300 shrink-0" />
                              <span className="text-xs font-bold truncate">{itin.destination || 'Việt Nam'}</span>
                            </div>
                          </div>

                          {/* Body */}
                          <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div className="space-y-1">
                              <h4
                                onClick={() => setSelectedItineraryDetail(itin)}
                                className="font-display font-black text-sm sm:text-base text-ink-800 group-hover:text-clay-700 transition-colors line-clamp-2 leading-snug cursor-pointer"
                                title={itin.title}
                              >
                                {itin.title}
                              </h4>
                              <div className="flex items-center justify-between text-xs pt-0.5">
                                <span className="text-ink-500 font-serif">Chi phí dự kiến:</span>
                                <span className="font-bold text-clay-700 font-mono">
                                  {Number(itin.budgetTotal || 0).toLocaleString('vi-VN')} đ
                                </span>
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 pt-2.5 border-t border-ink-200/60 text-xs">
                              <button
                                onClick={() => setSelectedItineraryDetail(itin)}
                                className="flex-1 py-1.5 px-3 rounded-[5px] bg-[#F8F4EC] hover:bg-[#EFE9DC] text-clay-700 font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-ink-200/80 shadow-2xs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Xem chi tiết</span>
                              </button>
                              {(() => {
                                const isItinOwner = Boolean(
                                  isOwnProfile ||
                                  (currentUser?.id && itin.creatorId && String(itin.creatorId) === String(currentUser.id)) ||
                                  (currentUser?.id && itin.userId && String(itin.userId) === String(currentUser.id)) ||
                                  (currentUser?.email && itin.creatorEmail && itin.creatorEmail.toLowerCase() === (currentUser.email || '').toLowerCase()) ||
                                  (currentUser?.email && itin.userEmail && itin.userEmail.toLowerCase() === (currentUser.email || '').toLowerCase()) ||
                                  ((currentUser?.name || currentUser?.fullName) && itin.creatorName && itin.creatorName.trim().toLowerCase() === (currentUser.name || currentUser.fullName).trim().toLowerCase())
                                );

                                if (isItinOwner) return null;

                                return (
                                  <button
                                    onClick={() => handleCloneItinerary(itin)}
                                    disabled={cloningItinId === itin.id}
                                    className="py-1.5 px-3 rounded-[5px] bg-clay-600 hover:bg-clay-700 text-white font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                                  >
                                    {cloningItinId === itin.id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                    <span className="hidden sm:inline">Sao chép</span>
                                  </button>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        ) : null}

      </div>

      {/* Post Detail Modal */}
      {selectedPostForDetail && (
        <PostDetailModal
          post={selectedPostForDetail}
          onClose={() => setSelectedPostForDetail(null)}
          onSelectItinerary={onSelectItinerary}
          onAuthorClick={() => setSelectedPostForDetail(null)}
        />
      )}

      {/* Itinerary Detail Modal */}
      {selectedItineraryDetail && (
        <ItineraryDetailModal
          itinerary={selectedItineraryDetail}
          onClose={() => setSelectedItineraryDetail(null)}
        />
      )}

      {/* Follow List Modal (Following / Followers) */}
      {followModalState.isOpen && profile && (
        <FollowListModal
          userId={profile.id}
          userName={profile.fullName}
          initialTab={followModalState.tab}
          onClose={() => setFollowModalState(prev => ({ ...prev, isOpen: false }))}
          onSelectUser={(newUserId) => {
            setFollowModalState(prev => ({ ...prev, isOpen: false }));
            if (typeof onClose === 'function') {
              onClose();
            }
          }}
        />
      )}
    </div>
  );
};


