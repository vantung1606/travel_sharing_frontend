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
  ArrowRight
} from 'lucide-react';
import { userApi, postApi } from '../../services/api';
import { useToast } from '../common/Toast';
import { useApp } from '../../context/AppContext';
import { PostDetailModal } from './PostDetailModal';
import { FollowListModal } from './FollowListModal';

export const UserProfileModal = ({ userId, onClose, onSelectItinerary }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'itineraries'
  const [cloningItinId, setCloningItinId] = useState(null);
  const [selectedPostForDetail, setSelectedPostForDetail] = useState(null);
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
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200">
        
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
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
            <span className="text-xs font-semibold text-slate-600">Đang tải hồ sơ du khách...</span>
          </div>
        ) : profile ? (
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {/* Cover Banner with Ambient Mesh Glow */}
            <div className="relative h-32 sm:h-40 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 shrink-0 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-black/25"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute top-2 left-6 w-24 h-24 bg-sky-300/20 rounded-full blur-xl"></div>
            </div>

            <div className="px-5 sm:px-7 pb-6 space-y-5">
              {/* Header info: Avatar, Names, Follow button */}
              <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 pt-1 sm:pt-2">
                <div className="flex items-end gap-3.5">
                  <div className="relative shrink-0 -mt-12 sm:-mt-16">
                    <img
                      src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                      alt={profile.fullName}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl object-cover ring-4 ring-white shadow-xl bg-white shrink-0"
                    />
                    {profile.isVerified && (
                      <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-blue-600 ring-2 ring-white text-white flex items-center justify-center text-xs font-black shadow-sm" title="Tài khoản đã xác minh">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="pb-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug tracking-tight truncate">
                        {profile.fullName}
                      </h3>
                      {profile.role && (
                        <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[11px] font-extrabold border border-sky-200/70 shadow-2xs">
                          {profile.role}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 truncate">
                      {profile.handle || '@wayfarer'}
                    </p>
                  </div>
                </div>

                {/* Follow / Unfollow Action */}
                <div className="sm:pb-1 flex items-center gap-2">
                  {currentUser && (currentUser.email === profile.email || currentUser.name === profile.fullName) ? (
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
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal bg-slate-50/80 p-3 sm:p-3.5 rounded-2xl border border-slate-100">
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
              <div className="grid grid-cols-4 gap-2 sm:gap-3 py-3 px-3 sm:px-4 bg-slate-50/90 rounded-2xl border border-slate-200/70 text-center">
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
                <div className="space-y-3">
                  {(!profile.posts || profile.posts.length === 0) ? (
                    <div className="text-center py-10 px-4 text-slate-400 text-xs sm:text-sm bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                      Người dùng này chưa có bài viết công khai nào.
                    </div>
                  ) : (
                    profile.posts.map(post => (
                      <div
                        key={post.id}
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
                        className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:shadow-md hover:border-sky-200 transition-all space-y-2.5 cursor-pointer group"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-semibold text-slate-700">{post.formattedDate || post.timeAgo}</span>
                          <div className="flex items-center gap-1.5">
                            {post.visibility === 'PRIVATE' ? (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px]">
                                <Lock className="w-3 h-3" /> Chỉ mình tôi
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-600 font-bold text-[10px]">
                                <Globe className="w-3 h-3" /> Công khai
                              </span>
                            )}
                            {post.locationTag && (
                              <span className="flex items-center gap-1 text-slate-500 font-medium">
                                <MapPin className="w-3 h-3 text-sky-500" />
                                {post.locationTag}
                              </span>
                            )}
                          </div>
                        </div>

                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug group-hover:text-sky-600 transition-colors">
                          {post.title}
                        </h4>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {post.content}
                        </p>

                        {post.images && post.images.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar">
                            {post.images.slice(0, 3).map((img, i) => (
                              <img
                                key={i}
                                src={img}
                                alt="thumb"
                                className="w-20 h-16 rounded-xl object-cover shrink-0"
                              />
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs text-slate-500">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3.5 h-3.5 text-rose-500" />
                              {post.likeCount || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3.5 h-3.5 text-sky-600" />
                              {post.commentCount || 0}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-sky-600 group-hover:text-sky-700 flex items-center gap-1">
                            <span>Xem chi tiết bài viết</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 2: Itineraries List */}
              {activeTab === 'itineraries' && (
                <div className="space-y-3">
                  {(!profile.itineraries || profile.itineraries.length === 0) ? (
                    <div className="text-center py-10 px-4 text-slate-400 text-xs sm:text-sm bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                      Người dùng này chưa xuất bản lịch trình nào.
                    </div>
                  ) : (
                    profile.itineraries.map(itin => (
                      <div
                        key={itin.id}
                        className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:shadow-md hover:border-sky-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={itin.coverImageUrl || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=400&q=80'}
                            alt={itin.title}
                            className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-xs"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold">
                                {itin.destination || 'Việt Nam'}
                              </span>
                              {itin.isAiGenerated && (
                                <span className="flex items-center gap-1 text-[10px] text-sky-600 font-bold">
                                  <Sparkles className="w-3 h-3" /> AI
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 mt-0.5 truncate">
                              {itin.title}
                            </h4>
                            <p className="text-xs font-bold text-sky-600 mt-0.5">
                              {Number(itin.budgetTotal || 0).toLocaleString('vi-VN')} đ
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <button
                            onClick={() => {
                              if (typeof onSelectItinerary === 'function') {
                                onSelectItinerary(itin);
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Eye className="w-3.5 h-3.5 text-sky-600" />
                            <span>Chi tiết</span>
                          </button>
                          <button
                            onClick={() => handleCloneItinerary(itin)}
                            disabled={cloningItinId === itin.id}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs hover:opacity-95 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
                          >
                            {cloningItinId === itin.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>Sao chép</span>
                          </button>
                        </div>
                      </div>
                    ))
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

      {/* Follow List Modal (Following / Followers) */}
      {followModalState.isOpen && profile && (
        <FollowListModal
          userId={profile.id}
          userName={profile.fullName}
          initialTab={followModalState.tab}
          onClose={() => setFollowModalState(prev => ({ ...prev, isOpen: false }))}
          onSelectUser={(newUserId) => {
            setFollowModalState(prev => ({ ...prev, isOpen: false }));
            // If selecting another user, refresh to that profile
            if (typeof onClose === 'function') {
              onClose();
            }
          }}
        />
      )}
    </div>
  );
};

