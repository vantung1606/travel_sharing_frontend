import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Users,
  UserPlus,
  UserCheck,
  Compass,
  Route,
  Heart,
  MessageCircle,
  Eye,
  Copy,
  DollarSign,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Lock,
  Globe,
  ArrowRight,
  Award
} from 'lucide-react';
import { userApi, postApi } from '../../services/api';
import { useToast } from '../common/Toast';
import { useApp } from '../../context/AppContext';
import { PostDetailModal } from './PostDetailModal';
import { FollowListModal } from './FollowListModal';
import { ItineraryDetailModal } from '../itinerary/ItineraryDetailModal';

export const UserProfileModal = ({ userId, onClose, onSelectItinerary }) => {
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

  const handleCloneItinerary = async (itin) => {
    if (!requireAuth('sao chép lịch trình')) return;
    try {
      setCloningItinId(itin.id);
      const newItinerary = {
        id: Date.now(),
        title: 'Bản sao: ' + itin.title,
        destination: itin.destination || 'Việt Nam',
        budgetTotal: itin.budgetTotal || 5000000,
        coverImageUrl: itin.coverImageUrl || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
        isAiGenerated: itin.isAiGenerated ?? true,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };
      setItineraries(prev => [newItinerary, ...prev]);
      toast.showSuccess(`Đã sao chép lịch trình "${itin.title}" vào kho của bạn! 🎉`);
    } catch (err) {
      toast.showError('Không thể sao chép: ' + err.message);
    } finally {
      setCloningItinId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl sm:max-w-4xl w-full shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-30 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
          title="Đóng hồ sơ"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Content Container */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
            <span className="text-xs font-semibold text-slate-600">Đang tải hồ sơ du khách...</span>
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
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
            </div>

            <div className="px-5 sm:px-8 pb-7 space-y-5">
              {/* Header info: Avatar, Names, Follow button */}
              <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1 sm:pt-2">
                <div className="flex items-end gap-4">
                  <div className="relative shrink-0 -mt-16 sm:-mt-20">
                    <img
                      src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                      alt={profile.fullName}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-white shadow-xl bg-white shrink-0"
                    />
                    {profile.isVerified && (
                      <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm" title="Tài khoản đã xác minh">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="pb-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug tracking-tight truncate">
                        {profile.fullName}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold flex items-center gap-1 border border-amber-200/80 shadow-xs">
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        {profile.role || profile.rank || 'Wanderer Gold'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 font-mono font-medium flex items-center gap-2 mt-1 truncate">
                      <span className="text-slate-700 font-semibold">{profile.handle || '@wayfarer'}</span>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1 text-slate-600 font-sans">
                        <MapPin className="w-3.5 h-3.5 text-sky-600" /> {profile.location || 'Đà Nẵng, Việt Nam'}
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
                    <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200 shadow-2xs">
                      Tài khoản của bạn
                    </span>
                  ) : (
                    <button
                      onClick={handleToggleFollow}
                      disabled={followLoading}
                      className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 ${
                        profile.isFollowing
                          ? 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200'
                          : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-md shadow-sky-500/20'
                      }`}
                    >
                      {followLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : profile.isFollowing ? (
                        <>
                          <UserCheck className="w-4 h-4 text-sky-600" />
                          <span>Đang theo dõi</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Theo dõi</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Bio & Travel Preferences */}
              <div className="space-y-3">
                {profile.bio && (
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal bg-slate-50/80 p-3.5 sm:p-4 rounded-2xl border border-slate-100">
                    {profile.bio}
                  </p>
                )}
                <div className="flex items-center gap-2 flex-wrap text-xs pt-0.5">
                  {profile.travelStyle && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-800 border border-sky-200/60 font-semibold shadow-2xs">
                      <Compass className="w-3.5 h-3.5 text-sky-600" />
                      <span>{profile.travelStyle}</span>
                    </span>
                  )}
                  {profile.budgetPreference && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-semibold shadow-2xs">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{profile.budgetPreference}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-2 sm:gap-3 py-3.5 px-3 sm:px-4 bg-slate-50/90 rounded-2xl border border-slate-200/70 text-center">
                <div className="p-1 rounded-xl">
                  <span className="block text-base sm:text-lg font-black text-slate-900">
                    {profile.postsCount || profile.posts?.length || 0}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-500 font-semibold">Bài viết</span>
                </div>
                <div className="p-1 rounded-xl">
                  <span className="block text-base sm:text-lg font-black text-slate-900">
                    {profile.itinerariesCount || profile.itineraries?.length || 0}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-500 font-semibold">Lịch trình</span>
                </div>
                <div
                  onClick={() => setFollowModalState({ isOpen: true, tab: 'followers' })}
                  className="cursor-pointer hover:bg-white hover:shadow-xs rounded-xl p-1 transition-all group border border-transparent hover:border-slate-200/60"
                  title="Bấm để xem danh sách người theo dõi"
                >
                  <span className="block text-base sm:text-lg font-black text-sky-600 group-hover:scale-105 transition-transform">
                    {profile.followersCount || 0}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-500 font-semibold group-hover:text-sky-700">
                    Người theo dõi
                  </span>
                </div>
                <div
                  onClick={() => setFollowModalState({ isOpen: true, tab: 'following' })}
                  className="cursor-pointer hover:bg-white hover:shadow-xs rounded-xl p-1 transition-all group border border-transparent hover:border-slate-200/60"
                  title="Bấm để xem danh sách đang theo dõi"
                >
                  <span className="block text-base sm:text-lg font-black text-slate-900 group-hover:text-sky-600 group-hover:scale-105 transition-transform">
                    {profile.followingCount || 0}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-500 font-semibold group-hover:text-sky-700">
                    Đang theo dõi
                  </span>
                </div>
              </div>

              {/* Segmented Tab Navigation */}
              <div className="flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60 gap-1">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === 'posts'
                      ? 'bg-white text-sky-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Globe className="w-4 h-4 text-sky-600" />
                  <span>Bài viết chia sẻ</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    activeTab === 'posts' ? 'bg-sky-100 text-sky-800' : 'bg-slate-200/70 text-slate-600'
                  }`}>
                    {profile.posts?.length || 0}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('itineraries')}
                  className={`flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === 'itineraries'
                      ? 'bg-white text-sky-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Route className="w-4 h-4 text-sky-600" />
                  <span>Kho Lịch trình</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    activeTab === 'itineraries' ? 'bg-sky-100 text-sky-800' : 'bg-slate-200/70 text-slate-600'
                  }`}>
                    {profile.itineraries?.length || 0}
                  </span>
                </button>
              </div>

              {/* Tab 1: Posts List */}
              {activeTab === 'posts' && (
                <div className="space-y-4">
                  {(!profile.posts || profile.posts.length === 0) ? (
                    <div className="text-center py-12 px-4 text-slate-400 text-xs sm:text-sm bg-slate-50/60 rounded-3xl border border-dashed border-slate-200">
                      Người dùng này chưa có bài viết công khai nào.
                    </div>
                  ) : (
                    profile.posts.map(post => (
                      <article
                        key={post.id}
                        className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3.5 group"
                      >
                        {/* Author Header */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={post.authorAvatar || profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                              alt={post.authorName || profile.fullName}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-xs shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                                  {post.authorName || profile.fullName}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200/80">
                                  {post.authorRole || profile.role || 'Wanderer Gold'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span>{post.formattedDate || post.timeAgo || 'Vừa xong'}</span>
                                {post.locationTag && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-0.5 text-slate-600 font-medium truncate">
                                      <MapPin className="w-3 h-3 text-sky-600 shrink-0" />
                                      {post.locationTag}
                                    </span>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>

                          {post.visibility === 'PRIVATE' ? (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] shrink-0">
                              <Lock className="w-3 h-3" /> Chỉ mình tôi
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 text-sky-600 font-bold text-[10px] shrink-0">
                              <Globe className="w-3 h-3" /> Công khai
                            </span>
                          )}
                        </div>

                        {/* Title & Content */}
                        <div className="space-y-1.5">
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
                              className="font-display font-extrabold text-base sm:text-lg text-slate-900 group-hover:text-sky-600 transition-colors leading-snug cursor-pointer"
                            >
                              {post.title}
                            </h4>
                          )}
                          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
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
                            className="cursor-pointer overflow-hidden rounded-2xl"
                          >
                            {post.images.length === 1 ? (
                              <img
                                src={post.images[0]}
                                alt="Post photo"
                                className="w-full max-h-80 sm:max-h-96 object-cover rounded-2xl hover:scale-[1.01] transition-transform duration-300"
                              />
                            ) : post.images.length === 2 ? (
                              <div className="grid grid-cols-2 gap-2 h-52 sm:h-64 rounded-2xl overflow-hidden">
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
                              <div className="grid grid-cols-3 gap-2 h-44 sm:h-52 rounded-2xl overflow-hidden">
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
                            className="p-3 sm:p-3.5 bg-sky-50/70 hover:bg-sky-50 rounded-2xl border border-sky-100 flex items-center justify-between gap-3 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                <Route className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">
                                  Lịch trình đính kèm
                                </span>
                                <span className="font-bold text-xs sm:text-sm text-slate-900 truncate block">
                                  {post.itineraryTitle}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-sky-600 hover:text-sky-700 shrink-0 flex items-center gap-1">
                              <span>Xem tour</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        )}

                        {/* Engagement Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5 font-bold text-rose-500">
                              <Heart className="w-4 h-4 fill-rose-500/20 text-rose-500" />
                              <span>{post.likeCount || 0}</span>
                            </span>
                            <span className="flex items-center gap-1.5 font-semibold text-sky-600">
                              <MessageCircle className="w-4 h-4" />
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
                            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer transition-colors"
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
                    <div className="text-center py-12 px-4 text-slate-400 text-xs sm:text-sm bg-slate-50/60 rounded-3xl border border-dashed border-slate-200">
                      Người dùng này chưa xuất bản lịch trình nào.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      {profile.itineraries.map(itin => (
                        <div
                          key={itin.id}
                          className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
                        >
                          {/* Cover Image & Badges */}
                          <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100">
                            <img
                              src={itin.coverImageUrl || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80'}
                              alt={itin.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

                            {/* Top Badges */}
                            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5 flex-wrap">
                              {itin.isAiGenerated ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-600/90 text-white text-[10px] font-bold backdrop-blur-md shadow-xs">
                                  <Sparkles className="w-3 h-3 text-amber-300" />
                                  <span>Tạo bởi AI</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/70 text-white text-[10px] font-bold backdrop-blur-md shadow-xs">
                                  <Route className="w-3 h-3 text-sky-400" />
                                  <span>Lộ trình phượt</span>
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-sky-800 text-[10px] font-extrabold shadow-2xs">
                                {itin.startDate && itin.endDate
                                  ? `${Math.max(1, Math.round((new Date(itin.endDate) - new Date(itin.startDate)) / (1000 * 60 * 60 * 24)) + 1)}N${Math.max(1, Math.round((new Date(itin.endDate) - new Date(itin.startDate)) / (1000 * 60 * 60 * 24)))}Đ`
                                  : '3N2Đ'}
                              </span>
                            </div>

                            {/* Destination Bottom Overlay */}
                            <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-1.5 text-white">
                              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="text-xs font-bold truncate">{itin.destination || 'Việt Nam'}</span>
                            </div>
                          </div>

                          {/* Body */}
                          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                            <div className="space-y-1.5">
                              <h4
                                onClick={() => setSelectedItineraryDetail(itin)}
                                className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2 leading-snug cursor-pointer"
                                title={itin.title}
                              >
                                {itin.title}
                              </h4>
                              <div className="flex items-center justify-between text-xs pt-1">
                                <span className="text-slate-400 font-medium">Chi phí dự kiến:</span>
                                <span className="font-extrabold text-sky-600 font-sans">
                                  {Number(itin.budgetTotal || 0).toLocaleString('vi-VN')} đ
                                </span>
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 text-xs">
                              <button
                                onClick={() => setSelectedItineraryDetail(itin)}
                                className="flex-1 py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Xem chi tiết</span>
                              </button>
                              <button
                                onClick={() => handleCloneItinerary(itin)}
                                disabled={cloningItinId === itin.id}
                                className="py-2 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                              >
                                {cloningItinId === itin.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                                <span className="hidden sm:inline">Sao chép</span>
                              </button>
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


