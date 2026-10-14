import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import { userApi, itineraryApi, uploadApi } from '../../../services/api';
import { FollowListModal } from '../../../components/community/FollowListModal';
import { PostDetailModal } from '../../../components/community/PostDetailModal';
import { ItineraryDetailModal } from '../../../components/itinerary/ItineraryDetailModal';
import { TravelFootprintSection } from '../../../components/profile/TravelFootprintSection';
import { TravelPassportCardModal } from '../../../components/profile/TravelPassportCardModal';
import { useToast } from '../../../components/common/Toast';
import { User, MapPin, Heart, Award, Sparkles, Share2, Bookmark, MessageCircle, Route, Edit, Camera, Star, PlusCircle, Zap, Globe, X, Users, UserCheck, Loader2, Copy, Eye, ArrowRight, Lock, Compass, Phone, CheckCircle2, ChevronLeft, ChevronRight, Crown } from 'lucide-react';
import { TierPromotionModal } from '../../../components/common/TierPromotionModal';
import { TIERS, calculateUserXP, getUserTier, getNextTier, calculateTierProgress, checkTierPromotion } from '../../../utils/tierSystem';

export const ProfilePage = () => {
  const { currentUser, updateCurrentUser, itineraries, posts, destinations, savedPlaces = [], toggleSavePlace = () => {}, setIsAIGeneratorOpen, setUserTab, setItineraries, isLoggedIn, setIsAuthModalOpen, setAuthMode } = useApp();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('itineraries'); // 'itineraries' | 'posts' | 'footprint' | 'ai-dna' | 'saved' | 'badges'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPassportModalOpen, setIsPassportModalOpen] = useState(false);
  const [promotionData, setPromotionData] = useState(null);
  
  // Tab scroll reference & scroll buttons state
  const tabScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkTabScroll = () => {
    if (tabScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabScrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollTabs = (direction) => {
    if (tabScrollRef.current) {
      const amount = direction === 'left' ? -220 : 220;
      tabScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    checkTabScroll();
    window.addEventListener('resize', checkTabScroll);
    return () => window.removeEventListener('resize', checkTabScroll);
  }, []);
  
  // Profile edit fields
  const [profileName, setProfileName] = useState(currentUser?.name || currentUser?.fullName || '');
  const [profileHandle, setProfileHandle] = useState(currentUser?.handle || '');
  const [profileBio, setProfileBio] = useState(currentUser?.bio || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phoneNumber || '');
  const [profileTravelStyle, setProfileTravelStyle] = useState(currentUser?.travelStyle || 'Khám phá tự do');
  const [profileBudget, setProfileBudget] = useState(currentUser?.budgetPreference || 'Linh hoạt');
  
  // Media upload & preview states
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Keep form fields synced with current active user
  useEffect(() => {
    if (currentUser?.name) setProfileName(currentUser.name);
    if (currentUser?.fullName) setProfileName(currentUser.fullName);
    if (currentUser?.handle) setProfileHandle(currentUser.handle);
    if (currentUser?.bio !== undefined) setProfileBio(currentUser.bio || '');
    if (currentUser?.phoneNumber) setProfilePhone(currentUser.phoneNumber);
    if (currentUser?.travelStyle) setProfileTravelStyle(currentUser.travelStyle);
    if (currentUser?.budgetPreference) setProfileBudget(currentUser.budgetPreference);
  }, [currentUser]);

  // Full Profile data from Backend API
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Modals & cloning state
  const [selectedPostForDetail, setSelectedPostForDetail] = useState(null);
  const [selectedItineraryForModal, setSelectedItineraryForModal] = useState(null);
  const [cloningItinId, setCloningItinId] = useState(null);

  // Follow State & Modal
  const [followModalState, setFollowModalState] = useState({ isOpen: false, tab: 'following' });
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);

  const myUserId = currentUser?.id;

  const loadFullProfile = async () => {
    if (!myUserId) {
      setLoadingProfile(false);
      return;
    }
    try {
      setLoadingProfile(true);
      const data = await userApi.getProfile(myUserId, currentUser?.email);
      if (data) {
        setProfileData(data);
        if (data.fullName) setProfileName(data.fullName);
        if (data.handle) setProfileHandle(data.handle);
        if (data.bio !== undefined) setProfileBio(data.bio || '');
        if (data.phoneNumber) setProfilePhone(data.phoneNumber || '');
        if (data.travelStyle) setProfileTravelStyle(data.travelStyle);
        if (data.budgetPreference) setProfileBudget(data.budgetPreference);
        if (data.coverImageUrl) setCoverPhotoUrl(data.coverImageUrl);
        if (data.followersCount !== undefined) setFollowersCount(data.followersCount);
        if (data.followingCount !== undefined) setFollowingCount(data.followingCount);
      }
    } catch (err) {
      console.warn('Lỗi khi tải thông tin hồ sơ người dùng:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadFollowCounts = async () => {
    if (!myUserId) return;
    try {
      const [following, followers] = await Promise.all([
        userApi.getFollowing(myUserId),
        userApi.getFollowers(myUserId)
      ]);
      if (Array.isArray(following)) setFollowingCount(following.length);
      if (Array.isArray(followers)) setFollowersCount(followers.length);
    } catch (err) {
      console.warn('Lỗi khi tải thông tin follow trang cá nhân:', err);
    }
  };

  useEffect(() => {
    loadFullProfile();
    loadFollowCounts();

    const handleFollowChanged = () => {
      loadFullProfile();
      loadFollowCounts();
    };

    window.addEventListener('wayfare_follow_changed', handleFollowChanged);
    return () => {
      window.removeEventListener('wayfare_follow_changed', handleFollowChanged);
    };
  }, [myUserId, currentUser?.email]);

  const handleCloneItinerary = async (itin) => {
    try {
      setCloningItinId(itin.id);
      const cloned = await itineraryApi.cloneItinerary(itin.id, currentUser?.email);
      if (cloned) {
        setItineraries(prev => [cloned, ...prev]);
        toast.showSuccess(`Đã sao chép lịch trình "${itin.title}" vào kho của bạn! 🎉`);
        loadFullProfile();
      }
    } catch (err) {
      toast.showError('Không thể sao chép: ' + (err.message || 'Lỗi kết nối'));
    } finally {
      setCloningItinId(null);
    }
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingAvatar(true);
      toast.showInfo('Đang tải ảnh đại diện lên...');
      const uploadedUrl = await uploadApi.uploadSingle(file);
      if (uploadedUrl) {
        await userApi.updateProfile({ avatarUrl: uploadedUrl }, currentUser?.email);
        updateCurrentUser({ avatar: uploadedUrl, avatarUrl: uploadedUrl });
        setProfileData(prev => prev ? { ...prev, avatarUrl: uploadedUrl } : prev);
        toast.showSuccess('Cập nhật ảnh đại diện thành công! 🎉');
      }
    } catch (err) {
      toast.showError('Lỗi khi tải ảnh đại diện: ' + (err.message || 'Vui lòng thử lại'));
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleCoverFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingCover(true);
      toast.showInfo('Đang tải ảnh bìa du lịch...');
      const uploadedUrl = await uploadApi.uploadSingle(file);
      if (uploadedUrl) {
        setCoverPhotoUrl(uploadedUrl);
        toast.showSuccess('Đã cập nhật ảnh bìa mới! 📸');
      }
    } catch (err) {
      toast.showError('Lỗi khi tải ảnh bìa: ' + (err.message || 'Vui lòng thử lại'));
    } finally {
      setIsUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      toast.showError('Họ và tên không được để trống!');
      return;
    }
    try {
      setIsSavingProfile(true);
      const updatePayload = {
        fullName: profileName.trim(),
        handle: profileHandle.trim(),
        bio: profileBio.trim(),
        phoneNumber: profilePhone.trim(),
        travelStyle: profileTravelStyle,
        budgetPreference: profileBudget
      };
      await userApi.updateProfile(updatePayload, currentUser?.email);
      updateCurrentUser({
        name: profileName.trim(),
        fullName: profileName.trim(),
        handle: profileHandle.trim(),
        bio: profileBio.trim(),
        phoneNumber: profilePhone.trim(),
        travelStyle: profileTravelStyle,
        budgetPreference: profileBudget
      });
      setProfileData(prev => prev ? {
        ...prev,
        fullName: profileName.trim(),
        handle: profileHandle.trim(),
        bio: profileBio.trim(),
        phoneNumber: profilePhone.trim(),
        travelStyle: profileTravelStyle,
        budgetPreference: profileBudget
      } : prev);
      setIsEditModalOpen(false);
      toast.showSuccess('Đã lưu thông tin hồ sơ của bạn thành công vào CSDL! 🎉');
    } catch (err) {
      toast.showError('Không thể cập nhật hồ sơ: ' + (err.message || 'Lỗi kết nối'));
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Real database lists: only show user's own posts and itineraries, never fall back to community posts
  const displayPosts = profileData?.posts || [];
  const displayItineraries = profileData?.itineraries || [];

  // Real Account Achievements (Calculated dynamically from MySQL database stats)
  const postsCount = displayPosts.length;
  const itinsCount = displayItineraries.length;
  const activeFollowersCount = followersCount || profileData?.followersCount || 0;

  const achievements = [
    {
      title: 'Tác Giả Cộng Đồng',
      icon: '✍️',
      desc: postsCount >= 5 ? `Đã đăng ${postsCount} bài viết chia sẻ` : `Đã đăng ${postsCount}/5 bài viết`,
      date: postsCount > 0 ? 'Đang hoạt động' : 'Chưa mở khóa',
      unlocked: postsCount >= 5
    },
    {
      title: 'Nhà Sáng Lập Tour',
      icon: '🗺️',
      desc: itinsCount >= 3 ? `Đã thiết kế ${itinsCount} lịch trình du lịch` : `Đã thiết kế ${itinsCount}/3 lịch trình`,
      date: itinsCount > 0 ? 'Đang hoạt động' : 'Chưa mở khóa',
      unlocked: itinsCount >= 3
    },
    {
      title: 'Gương Mặt Truyền Cảm Hứng',
      icon: '🌟',
      desc: activeFollowersCount >= 10 ? `Có ${activeFollowersCount} người theo dõi` : `Đạt ${activeFollowersCount}/10 người theo dõi`,
      date: activeFollowersCount >= 10 ? 'Đã đạt tiêu chuẩn' : 'Đang phấn đấu',
      unlocked: activeFollowersCount >= 10
    },
    {
      title: 'Thành Viên Xác Thực',
      icon: '🛡️',
      desc: Boolean(profileData?.isVerified) ? 'Hồ sơ đã được xác thực bảo mật' : 'Cần cập nhật hồ sơ đầy đủ',
      date: Boolean(profileData?.isVerified) ? 'Đã xác minh' : 'Chưa hoàn tất',
      unlocked: Boolean(profileData?.isVerified)
    }
  ];

  // ─── TIER & AVATAR FRAME CALCULATION (Prestige Honor System) ─────────
  const destinationsCount = typeof currentUser?.destinationsCount === 'number' 
    ? currentUser.destinationsCount 
    : (itinsCount > 0 ? Math.min(itinsCount * 2, 25) : 0);
  const userTotalXP = calculateUserXP({
    itinsCount,
    postsCount,
    followersCount: activeFollowersCount,
    destinationsCount
  });

  const currentTier = getUserTier({
    ...currentUser,
    ...profileData,
    tier: profileData?.tier || currentUser?.tier,
    totalXp: userTotalXP
  });
  const nextTier = getNextTier(currentTier);
  const progressPercent = calculateTierProgress(userTotalXP, currentTier, nextTier);

  // Kiểm tra sự kiện thăng cấp để hiển thị modal chúc mừng
  useEffect(() => {
    if (currentUser?.id && userTotalXP > 0) {
      const promo = checkTierPromotion({ ...currentUser, totalXp: userTotalXP });
      if (promo) {
        setPromotionData(promo);
        toast.showSuccess(`🎉 Chúc mừng bạn đã thăng hạng lên Cấp ${promo.newTier.name}!`);
      }
    }
  }, [currentUser?.id, userTotalXP]);

  // Nếu người dùng chưa đăng nhập hoặc không có ID hợp lệ, hiển thị thông báo yêu cầu đăng nhập
  if (!currentUser?.id) {
    return (
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-16 sm:py-24 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mb-6 shadow-xs">
          <User className="w-10 h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-800 mb-3">
          Chưa đăng nhập tài khoản
        </h2>
        <p className="text-slate-500 max-w-md mb-8 text-sm sm:text-base leading-relaxed">
          Vui lòng đăng nhập bằng tài khoản Wayfare của bạn để xem và quản lý hồ sơ cá nhân, lịch trình du lịch và các bài viết chia sẻ.
        </p>
        <button
          onClick={() => {
            setAuthMode('login');
            setIsAuthModalOpen(true);
          }}
          className="px-7 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold shadow-md shadow-sky-500/20 transition-all hover:scale-[1.02] cursor-pointer"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 space-y-6 sm:space-y-8">
      
      {/* ========================================================= */}
      {/* 1. HERO PROFILE BANNER & USER HEADER CARD                 */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden relative">
        
        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={coverInputRef}
          onChange={handleCoverFileChange}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={avatarInputRef}
          onChange={handleAvatarFileChange}
          accept="image/*"
          className="hidden"
        />

        {/* Cover Photo */}
        <div
          className="h-36 sm:h-52 bg-cover bg-center relative transition-all duration-300"
          style={{
            backgroundImage: `url('${coverPhotoUrl}')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent"></div>
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={isUploadingCover}
            className="absolute top-4 right-4 px-3.5 py-1.5 rounded-full bg-slate-900/70 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 hover:bg-slate-900 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Bấm để tải ảnh bìa du lịch từ máy"
          >
            {isUploadingCover ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                <span>Đang tải ảnh bìa...</span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 text-sky-300" />
                <span className="hidden sm:inline">Đổi ảnh bìa</span>
              </>
            )}
          </button>
        </div>

        {/* Profile Info Bar */}
        <div className="p-6 sm:p-8 pt-0 relative">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-5 mb-6 pt-2 sm:pt-3">
            
            {/* Avatar & Main Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              {/* Avatar with Prestige Tier Frame */}
              <div className="relative -mt-16 sm:-mt-20 shrink-0 group">
                <div className={`rounded-full transition-all duration-300 ${currentTier.avatarEffect}`}>
                  <img
                    src={currentUser.avatar || profileData?.avatarUrl}
                    alt={currentUser.name}
                    className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover bg-white ring-4 ring-white shadow-xl ${currentTier.avatarRing} transition-transform group-hover:scale-[1.02]`}
                  />
                </div>
                
                {/* Upload Avatar Overlay Button */}
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute inset-0 rounded-full bg-slate-950/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-bold cursor-pointer"
                  title="Thay đổi ảnh đại diện"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 text-white mb-0.5" />
                      <span>Đổi ảnh</span>
                    </>
                  )}
                </button>

                {/* Prestige Rank Badge */}
                <span
                  className={`absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-md border-2 border-white cursor-pointer transition-transform group-hover:scale-110 ${currentTier.cornerBg}`}
                  title={`Cấp độ: ${currentTier.name} (${currentTier.nameEn}) • ${userTotalXP} XP`}
                >
                  {currentTier.cornerIcon}
                </span>
              </div>

              {/* User Details: starts comfortably on white background, 100% clear of cover photo */}
              <div className="space-y-1.5 pb-1 pt-1 sm:pt-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight leading-tight">
                    {profileName}
                  </h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 border shadow-xs ${currentTier.badgeBg}`}>
                    <span>{currentTier.icon}</span>
                    <span>{currentTier.name}</span>
                  </span>
                  {profileTravelStyle && (
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[11px] font-bold border border-sky-200/80">
                      🧭 {profileTravelStyle}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-500 font-mono font-medium flex items-center gap-2">
                  <span className="text-slate-700 font-semibold">{profileHandle || currentUser.handle}</span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1 text-slate-600 font-sans">
                    <MapPin className="w-3.5 h-3.5 text-sky-600" /> {profileData?.location || 'Việt Nam'}
                  </span>
                  {profileBudget && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-emerald-700 font-sans font-semibold text-xs">
                        💰 {profileBudget}
                      </span>
                    </>
                  )}
                </p>

                {/* Follow Counts Quick Bar */}
                <div className="flex items-center gap-3 pt-0.5 text-xs sm:text-sm">
                  <button
                    onClick={() => setFollowModalState({ isOpen: true, tab: 'followers' })}
                    className="flex items-center gap-1.5 font-bold text-slate-800 hover:text-sky-700 transition-colors cursor-pointer group"
                    title="Bấm để xem danh sách người theo dõi"
                  >
                    <span className="font-black text-sky-700 text-sm sm:text-base flex items-center gap-1">
                      {followersCount}
                      <Users className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    </span>
                    <span className="font-medium text-slate-500 group-hover:text-sky-800">người theo dõi</span>
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    onClick={() => setFollowModalState({ isOpen: true, tab: 'following' })}
                    className="flex items-center gap-1.5 font-bold text-slate-800 hover:text-indigo-700 transition-colors cursor-pointer group"
                    title="Bấm để xem danh sách đang theo dõi"
                  >
                    <span className="font-black text-indigo-600 text-sm sm:text-base flex items-center gap-1">
                      {followingCount}
                      <UserCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    </span>
                    <span className="font-medium text-slate-500 group-hover:text-indigo-700">đang theo dõi</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Action Controls - Small, elegant and single-line */}
            <div className="flex items-center gap-2 pb-1 shrink-0">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
              >
                <Edit className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span>Chỉnh Sửa Hồ Sơ</span>
              </button>

              <button
                onClick={() => setIsPassportModalOpen(true)}
                className="p-2 rounded-xl bg-white hover:bg-sky-50 text-slate-600 hover:text-sky-700 border border-slate-200 hover:border-sky-300 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 flex items-center justify-center"
                title="Xem Thẻ Passport & Mã QR Cá Nhân"
              >
                <Share2 className="w-4 h-4 text-sky-600" />
              </button>
            </div>

          </div>

          {/* Bio Text */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl mb-6">
            {profileBio}
          </p>

          {/* Key Travel Metrics Bento Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div
              onClick={() => setActiveTab('footprint')}
              className="p-2 cursor-pointer hover:bg-sky-100/60 rounded-xl transition-colors group"
              title="Bấm để xem Bản đồ Dấu Chân Du Lịch 63 Tỉnh Thành"
            >
              <span className="text-slate-400 block text-[11px] font-semibold group-hover:text-sky-700">Điểm Đến Đã Ghé</span>
              <span className="font-display font-extrabold text-xl text-slate-900 mt-0.5 block flex items-center gap-1 group-hover:scale-105 transition-transform">
                {currentUser.destinationsCount || 24} <MapPin className="w-4 h-4 text-sky-600" />
              </span>
              <span className="text-[10px] text-sky-600 font-semibold group-hover:underline">Bản đồ dấu chân &rarr;</span>
            </div>

            <div className="p-2 border-l border-slate-200/80">
              <span className="text-slate-400 block text-[11px] font-semibold">Lịch Trình AI Đã Tạo</span>
              <span className="font-display font-extrabold text-xl text-sky-700 mt-0.5 block flex items-center gap-1">
                {displayItineraries.length} <Sparkles className="w-4 h-4 text-amber-500" />
              </span>
              <span className="text-[10px] text-slate-400">Đã đồng bộ GPS</span>
            </div>

            <div className="p-2 border-l border-slate-200/80">
              <span className="text-slate-400 block text-[11px] font-semibold">Bài Đăng Cộng Đồng</span>
              <span className="font-display font-extrabold text-xl text-sky-600 mt-0.5 block flex items-center gap-1">
                {displayPosts.length} <Globe className="w-4 h-4 text-sky-600" />
              </span>
              <span className="text-[10px] text-slate-400">Đã đăng công khai</span>
            </div>

            <div
              onClick={() => setFollowModalState({ isOpen: true, tab: 'followers' })}
              className="p-2 border-l border-slate-200/80 cursor-pointer hover:bg-sky-100/60 rounded-xl transition-colors group"
              title="Bấm để xem danh sách người theo dõi"
            >
              <span className="text-slate-400 block text-[11px] font-semibold group-hover:text-sky-800">Người Theo Dõi</span>
              <span className="font-display font-extrabold text-xl text-sky-700 mt-0.5 block flex items-center gap-1 group-hover:scale-105 transition-transform">
                {followersCount} <Users className="w-4 h-4 text-sky-600" />
              </span>
              <span className="text-[10px] text-sky-700 font-semibold group-hover:underline">Xem kết nối</span>
            </div>

            <div
              onClick={() => setFollowModalState({ isOpen: true, tab: 'following' })}
              className="p-2 border-l border-slate-200/80 cursor-pointer hover:bg-indigo-100/60 rounded-xl transition-colors group"
              title="Bấm để xem danh sách đang theo dõi"
            >
              <span className="text-slate-400 block text-[11px] font-semibold group-hover:text-indigo-700">Đang Theo Dõi</span>
              <span className="font-display font-extrabold text-xl text-indigo-600 mt-0.5 block flex items-center gap-1 group-hover:scale-105 transition-transform">
                {followingCount} <UserCheck className="w-4 h-4 text-indigo-500" />
              </span>
              <span className="text-[10px] text-indigo-600 font-semibold group-hover:underline">Quản lý</span>
            </div>

            <div
              onClick={() => setActiveTab('badges')}
              className="p-2 border-l border-slate-200/80 cursor-pointer hover:bg-amber-50/60 rounded-xl transition-colors group"
              title="Bấm để xem Bảng Cấp Bậc & Khung Avatar"
            >
              <span className="text-slate-400 block text-[11px] font-semibold group-hover:text-amber-800">Cấp Độ Danh Dự</span>
              <span className="font-display font-extrabold text-xs sm:text-sm text-amber-700 mt-0.5 block flex items-center gap-1 truncate">
                {currentTier.icon} {currentTier.name}
              </span>
              <span className="text-[10px] text-amber-600 font-semibold group-hover:underline">{userTotalXP} XP • Khung avatar &rarr;</span>
            </div>
          </div>

        </div>

        {/* PROFILE TAB NAVIGATION WITH SCROLL ARROWS */}
        <div className="relative border-t border-slate-200/80 bg-slate-50/60 px-2 sm:px-4 flex items-center gap-1">
          {/* Scroll Left Button */}
          {canScrollLeft && (
            <button
              onClick={() => scrollTabs('left')}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 shadow-sm shrink-0 cursor-pointer z-10 transition-transform active:scale-95"
              title="Cuộn sang trái"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Scrollable Tabs */}
          <div
            ref={tabScrollRef}
            onScroll={checkTabScroll}
            className="flex-1 flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400 scrollbar-track-transparent py-2.5"
          >
            {[
              { id: 'itineraries', label: 'Lịch Trình AI Của Tôi', count: displayItineraries.length, icon: Route },
              { id: 'posts', label: 'Bài Viết & Review', count: displayPosts.length, icon: Globe },
              { id: 'footprint', label: 'Dấu Chân Du Lịch', badge: 'Mới', icon: Compass },
              { id: 'ai-dna', label: 'Gu Du Lịch & AI DNA', icon: Sparkles },
              { id: 'saved', label: 'Địa Điểm Đã Lưu', count: savedPlaces.length, icon: Bookmark },
              { id: 'badges', label: 'Huy Hiệu & Khung Avatar', count: achievements.length, icon: Award }
            ].map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-3 sm:px-4 text-xs font-bold flex items-center gap-2 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-sky-600 text-white shadow-xs font-extrabold'
                      : 'bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      active ? 'bg-white/20 text-white font-extrabold' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  {tab.badge && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                      active ? 'bg-amber-300 text-amber-950' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          {canScrollRight && (
            <button
              onClick={() => scrollTabs('right')}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 shadow-sm shrink-0 cursor-pointer z-10 transition-transform active:scale-95"
              title="Cuộn sang phải"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

      {/* ========================================================= */}
      {/* 2. TABBED CONTENT SECTIONS                                */}
      {/* ========================================================= */}
      
      {/* TAB 1: MY AI ITINERARIES */}
      {activeTab === 'itineraries' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Route className="w-5 h-5 text-sky-600" />
              <span>Danh Sách Lịch Trình Du Lịch ({displayItineraries.length})</span>
            </h3>
            <button
              onClick={() => setIsAIGeneratorOpen(true)}
              className="sparkle-btn text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-102 active:scale-98 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo Tour Mới</span>
            </button>
          </div>

          {displayItineraries.length === 0 ? (
            <div className="text-center py-16 px-4 text-slate-400 text-sm bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
              <Route className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-600">Bạn chưa có lịch trình du lịch nào trong kho.</p>
              <button
                onClick={() => setIsAIGeneratorOpen(true)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                Tạo Tour Cùng Trợ Lý AI
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayItineraries.map(itin => (
                <div
                  key={itin.id}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
                >
                  {/* Cover Image & Badges */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={itin.coverImageUrl || itin.coverImage || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80'}
                      alt={itin.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

                    {/* Top Badges */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-1.5 flex-wrap">
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
                      <span className="px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-sky-800 text-[10px] font-extrabold shadow-2xs">
                        {itin.startDate && itin.endDate
                          ? `${Math.max(1, Math.round((new Date(itin.endDate) - new Date(itin.startDate)) / (1000 * 60 * 60 * 24)) + 1)}N${Math.max(1, Math.round((new Date(itin.endDate) - new Date(itin.startDate)) / (1000 * 60 * 60 * 24)))}Đ`
                          : (itin.daysCount ? `${itin.daysCount}N${itin.daysCount - 1}Đ` : '3N2Đ')}
                      </span>
                    </div>

                    {/* Destination Bottom Overlay */}
                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center gap-1.5 text-white">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-xs font-bold truncate">{itin.destination || 'Việt Nam'}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <h4
                        onClick={() => setSelectedItineraryForModal(itin)}
                        className="font-bold text-base text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2 leading-snug cursor-pointer"
                        title={itin.title}
                      >
                        {itin.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-slate-400 font-medium">Chi phí dự kiến:</span>
                        <span className="font-extrabold text-sky-600 font-sans text-sm">
                          {typeof itin.budgetTotal === 'number'
                            ? `${itin.budgetTotal.toLocaleString('vi-VN')} đ`
                            : (itin.budgetTotal || '5.000.000 đ')}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100 text-xs">
                      <button
                        onClick={() => setSelectedItineraryForModal(itin)}
                        className="flex-1 py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem chi tiết</span>
                      </button>
                      <button
                        onClick={() => handleCloneItinerary(itin)}
                        disabled={cloningItinId === itin.id}
                        className="py-2 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                        title="Sao chép lịch trình"
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

      {/* TAB 2: COMMUNITY POSTS & REVIEWS */}
      {activeTab === 'posts' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-sky-600" />
              <span>Bài Đăng & Review Đã Chia Sẻ ({displayPosts.length})</span>
            </h3>
            <button
              onClick={() => setUserTab('community')}
              className="px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              <span>Vào Cộng Đồng Chia Sẻ</span>
            </button>
          </div>

          {displayPosts.length === 0 ? (
            <div className="text-center py-16 px-4 text-slate-400 text-sm bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
              <Globe className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-600">Bạn chưa có bài viết nào trên cộng đồng.</p>
              <button
                onClick={() => setUserTab('community')}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                Chia Sẻ Trải Nghiệm Đầu Tiên
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayPosts.map(post => {
                const authorName = post.authorName || post.author?.name || profileName || currentUser.name;
                const authorAvatar = post.authorAvatar || post.author?.avatar || currentUser.avatar;
                const authorRole = post.authorRole || 'Wanderer Gold';
                const timeDisplay = post.formattedDate || post.timeAgo || 'Vừa xong';
                const locationText = post.locationTag || post.location || 'Việt Nam';
                const likeCount = post.likeCount ?? post.likes ?? 0;
                const commentCount = post.commentCount ?? post.commentsCount ?? 0;

                return (
                  <article
                    key={post.id}
                    className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3.5 group flex flex-col justify-between"
                  >
                    <div className="space-y-3.5">
                      {/* Author Header */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={authorAvatar}
                            alt={authorName}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-xs shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                                {authorName}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200/80">
                                {authorRole}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span>{timeDisplay}</span>
                              {locationText && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-0.5 text-slate-600 font-medium truncate">
                                    <MapPin className="w-3 h-3 text-sky-600 shrink-0" />
                                    {locationText}
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
                            onClick={() => setSelectedPostForDetail(post)}
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
                          onClick={() => setSelectedPostForDetail(post)}
                          className="cursor-pointer overflow-hidden rounded-2xl"
                        >
                          {post.images.length === 1 ? (
                            <img
                              src={post.images[0]}
                              alt="Post photo"
                              className="w-full max-h-72 sm:max-h-80 object-cover rounded-2xl hover:scale-[1.01] transition-transform duration-300"
                            />
                          ) : post.images.length === 2 ? (
                            <div className="grid grid-cols-2 gap-2 h-48 sm:h-56 rounded-2xl overflow-hidden">
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
                            <div className="grid grid-cols-3 gap-2 h-40 sm:h-48 rounded-2xl overflow-hidden">
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
                            setSelectedItineraryForModal({
                              id: post.itineraryId,
                              title: post.itineraryTitle,
                              destination: post.itineraryDestination || locationText,
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
                    </div>

                    {/* Engagement Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 font-bold text-rose-500">
                          <Heart className="w-4 h-4 fill-rose-500/20 text-rose-500" />
                          <span>{likeCount}</span>
                        </span>
                        <span className="flex items-center gap-1.5 font-semibold text-sky-600">
                          <MessageCircle className="w-4 h-4" />
                          <span>{commentCount}</span>
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedPostForDetail(post)}
                        className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Xem chi tiết & bình luận</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WANDERAI TRAVEL DNA PREFERENCES */}
      {activeTab === 'ai-dna' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl ocean-gradient text-white flex items-center justify-center shadow-md shrink-0">
                <Sparkles className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Cấu Hình Gu Du Lịch & AI DNA</h3>
                <p className="text-xs text-slate-500">Trợ lý WanderAI tự động ghi nhớ khẩu vị du lịch của bạn để tối ưu gợi ý tour</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Edit className="w-3.5 h-3.5 text-sky-600" />
              <span>Chỉnh sửa Gu du lịch</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-1">
              <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">Phong cách du lịch</span>
              <span className="font-bold text-slate-900 text-sm block">🧭 {profileTravelStyle || 'Khám phá tự do'}</span>
              <p className="text-[11px] text-slate-500">Khẩu vị di chuyển & trải nghiệm điểm đến</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Mức ngân sách ưa thích</span>
              <span className="font-bold text-slate-900 text-sm block">💰 {profileBudget || 'Linh hoạt'}</span>
              <p className="text-[11px] text-slate-500">Cân đối chi phí di chuyển, ăn uống & lưu trú</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-1">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Cấp bậc nhà thám hiểm</span>
              <span className="font-bold text-slate-900 text-sm block flex items-center gap-1.5">
                <span>{currentTier.icon}</span>
                <span>{currentTier.name}</span>
              </span>
              <p className="text-[11px] text-slate-500">{currentTier.desc}</p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-1">
              <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">Mục tiêu năm 2026</span>
              <span className="font-bold text-slate-900 text-sm block">🇻🇳 {destinationsCount}/63 Tỉnh Thành</span>
              <p className="text-[11px] text-slate-500">Đã đánh dấu trên Bản đồ ({Math.round((destinationsCount / 63) * 100)}% Việt Nam)</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Ghi chú riêng của bạn dành cho AI Engine</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
              "{profileData?.bio || currentUser?.bio || "Thường đi du lịch trải nghiệm tự túc, thích chụp ảnh và khám phá ẩm thực bản địa độc đáo."}"
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: SAVED DESTINATIONS */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-sky-600" />
              <span>Địa Điểm Yêu Thích Đã Lưu ({savedPlaces.length})</span>
            </h3>
            <a
              href="/explore"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline"
            >
              <span>+ Khám phá thêm địa điểm</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {savedPlaces.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-xs">
                <Heart className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-base text-slate-900">Chưa có địa điểm nào được lưu</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Khi lướt trang Khám phá, hãy bấm biểu tượng trái tim ❤️ ở góc ảnh để lưu các tọa độ bạn muốn ghé thăm vào danh sách này nhé!
              </p>
              <a
                href="/explore"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                <Compass className="w-4 h-4" />
                <span>Khám Phá Địa Điểm Ngay ✨</span>
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {savedPlaces.map(place => (
                <div key={place.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 hover:border-sky-300 shadow-xs hover:shadow-md transition-all duration-300 space-y-3 p-3 group relative flex flex-col justify-between">
                  <div className="h-44 rounded-2xl overflow-hidden relative bg-slate-100">
                    <img
                      src={place.image || place.coverImageUrl || 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80'}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Rating badge */}
                    <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {place.rating || '4.9'}
                    </span>
                    {/* Remove from saved button */}
                    <button
                      onClick={() => toggleSavePlace(place)}
                      title="Gỡ khỏi danh sách đã lưu"
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:scale-110 transition-all cursor-pointer"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                  <div className="space-y-1 px-1">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                      <MapPin className="w-3 h-3 text-sky-600" />
                      <span>{place.city || 'Việt Nam'}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 truncate">{place.name}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{place.category || place.categoryName}</p>
                  </div>
                  <a
                    href={`/explore`}
                    className="w-full py-2 rounded-xl bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white font-bold text-xs text-center border border-sky-200 transition-all block"
                  >
                    Xem trên Bản đồ 🗺️
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: ACHIEVEMENTS, TIERS & AVATAR FRAMES */}
      {activeTab === 'badges' && (
        <div className="space-y-6">
          
          {/* 1. CURRENT TIER & XP PROGRESS CARD */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-700/60 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-sky-500/10 blur-3xl pointer-events-none"></div>
            <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"></div>

            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/20 ${currentTier.avatarEffect || 'bg-white/10'}`}>
                  {currentTier.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-sky-400 tracking-wider uppercase font-mono">{currentTier.tagText}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-300 text-[10px] font-semibold border border-white/10">
                      Đang kích hoạt
                    </span>
                  </div>
                  <h3 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight mt-0.5">
                    {currentTier.name} ({currentTier.nameEn})
                  </h3>
                  <p className="text-xs text-slate-300/80 mt-1 max-w-xl leading-relaxed">
                    {currentTier.desc}
                  </p>
                </div>
              </div>

              {/* Total XP Counter */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[180px] text-center shrink-0">
                <span className="text-[11px] text-sky-300 font-medium block">Điểm Uy Tín Du Lịch</span>
                <span className="font-display font-black text-2xl sm:text-3xl text-white mt-0.5 block flex items-center justify-center gap-1">
                  {userTotalXP} <span className="text-sm font-bold text-amber-300">XP</span>
                </span>
                <span className="text-[10px] text-slate-300 block mt-1">Tính từ hoạt động thực tế</span>
              </div>
            </div>

            {/* XP Level Progress Bar */}
            <div className="pt-5 space-y-2 relative">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span>Tiến trình thăng hạng:</span>
                  <span className="text-amber-300 font-extrabold">{userTotalXP} XP</span>
                </span>
                <span className="text-sky-300">
                  {nextTier ? `Cần ${nextTier.minXP} XP để đạt ${nextTier.name}` : 'Đã đạt cấp bậc Huyền Thoại cao nhất! 🏆'}
                </span>
              </div>

              <div className="w-full h-3.5 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-purple-400 transition-all duration-700 shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              {/* Scoring Formula Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-slate-300/90 font-medium">
                <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                  <span className="text-sky-300 font-bold block">Tour đã tạo:</span>
                  <span>{itinsCount} × 60 XP = {itinsCount * 60} XP</span>
                </div>
                <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                  <span className="text-emerald-300 font-bold block">Bài chia sẻ:</span>
                  <span>{postsCount} × 40 XP = {postsCount * 40} XP</span>
                </div>
                <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                  <span className="text-indigo-300 font-bold block">Người theo dõi:</span>
                  <span>{activeFollowersCount} × 15 XP = {activeFollowersCount * 15} XP</span>
                </div>
                <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                  <span className="text-amber-300 font-bold block">Tỉnh thành ghé:</span>
                  <span>{destinationsCount} × 25 XP = {destinationsCount * 25} XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. AVATAR FRAMES SHOWCASE (Bộ Sưu Tập Khung Avatar 4 Cấp Độ) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  <span>Bộ Sưu Tập Khung Avatar Danh Dự</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Khung Avatar tự động hiển thị trên hồ sơ để khoe đẳng cấp uy tín của bạn với cộng đồng du lịch
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {TIERS.map(tier => {
                const isUnlocked = userTotalXP >= tier.minXP;
                const isCurrent = currentTier.id === tier.id;

                return (
                  <div
                    key={tier.id}
                    className={`rounded-2xl p-4 border transition-all duration-300 flex flex-col justify-between space-y-4 ${
                      isCurrent
                        ? 'border-sky-500 bg-sky-50/50 shadow-md ring-2 ring-sky-500/20'
                        : isUnlocked
                        ? 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                        : 'border-slate-200/60 bg-slate-50/60 opacity-60'
                    }`}
                  >
                    {/* Live Avatar Preview with Frame */}
                    <div className="flex flex-col items-center justify-center text-center pt-2">
                      <div className="relative group">
                        <div className={`rounded-full transition-all duration-300 ${tier.avatarEffect}`}>
                          <img
                            src={currentUser.avatar || profileData?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                            alt={tier.name}
                            className={`w-20 h-20 rounded-full object-cover bg-white ${tier.avatarRing}`}
                          />
                        </div>
                        <span className={`absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-md border border-white ${tier.cornerBg}`}>
                          {tier.cornerIcon}
                        </span>
                      </div>

                      <div className="mt-3 space-y-0.5">
                        <h4 className="font-bold text-sm text-slate-900 flex items-center justify-center gap-1">
                          <span>{tier.icon}</span>
                          <span>{tier.name}</span>
                        </h4>
                        <span className="text-[11px] font-mono text-slate-500 font-semibold">{tier.nameEn}</span>
                      </div>
                    </div>

                    {/* Tier Requirements & Status */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-center">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Yêu cầu tối thiểu:</span>
                        <span className="font-bold text-slate-800">{tier.minXP} XP</span>
                      </div>

                      {isCurrent ? (
                        <span className="block py-1.5 px-2 rounded-xl bg-sky-600 text-white font-extrabold text-[11px] shadow-xs">
                          ✓ Đang sử dụng khung này
                        </span>
                      ) : isUnlocked ? (
                        <span className="block py-1.5 px-2 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                          ✓ Đã mở khóa khung
                        </span>
                      ) : (
                        <span className="block py-1.5 px-2 rounded-xl bg-slate-200/80 text-slate-600 font-medium text-[11px]">
                          🔒 Cần thêm {tier.minXP - userTotalXP} XP
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. HISTORIC ACHIEVEMENTS LIST */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Huy Hiệu Đóng Góp Cộng Đồng</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {achievements.map((ach, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border flex items-start gap-4 ${
                    ach.unlocked ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white text-2xl flex items-center justify-center shadow-sm shrink-0">
                    {ach.icon}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{ach.title}</h4>
                      {ach.unlocked && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[9px] font-bold">
                          Đã mở khóa
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">{ach.desc}</p>
                    <p className="text-[10px] text-slate-400 font-mono pt-1">{ach.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 6: TRAVEL FOOTPRINT MAP (63 Tỉnh Thành Việt Nam) */}
      {activeTab === 'footprint' && (
        <TravelFootprintSection
          posts={displayPosts}
          itineraries={displayItineraries}
          userId={currentUser?.id}
          userName={currentUser?.name || 'Bạn'}
        />
      )}

      {/* ========================================================= */}
      {/* 3. EDIT PROFILE MODAL DIALOG                              */}
      {/* ========================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Edit className="w-4 h-4 text-sky-600" />
                <span>Chỉnh Sửa Hồ Sơ Cá Nhân</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Avatar Change Header inside modal */}
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="relative shrink-0">
                <img
                  src={currentUser.avatar || profileData?.avatarUrl}
                  alt={profileName}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-xs bg-white"
                />
                {isUploadingAvatar && (
                  <div className="absolute inset-0 rounded-full bg-slate-900/60 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs text-slate-900">Ảnh đại diện du khách</p>
                <p className="text-[11px] text-slate-500">Định dạng JPG, PNG hoặc WEBP</p>
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-sky-600" />
                <span>Đổi ảnh</span>
              </button>
            </div>

            <div className="space-y-4 text-xs font-bold text-slate-700">
              {/* Họ và tên */}
              <div>
                <label className="block mb-1 text-slate-800">Họ và tên <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Nhập họ và tên..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>

              {/* Tên người dùng Handle & Số điện thoại */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-800">Biệt danh / Handle</label>
                  <input
                    type="text"
                    value={profileHandle}
                    onChange={(e) => setProfileHandle(e.target.value)}
                    placeholder="@wanderer"
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-800">Số điện thoại</label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="VD: 0912345678"
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  />
                </div>
              </div>

              {/* Phong cách du lịch (Travel Style) */}
              <div>
                <label className="block mb-1.5 text-slate-800">Phong cách / Gu du lịch chính</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Khám phá tự do',
                    'Phượt mạo hiểm',
                    'Nghỉ dưỡng & Spa',
                    'Foodie ẩm thực',
                    'Khám phá văn hóa',
                    'Check-in sống ảo',
                    'Du lịch chữa lành'
                  ].map(style => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setProfileTravelStyle(style)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                        profileTravelStyle === style
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ngân sách du lịch ưa thích (Budget Preference) */}
              <div>
                <label className="block mb-1.5 text-slate-800">Mức ngân sách ưa thích</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Tiết kiệm', label: 'Tiết kiệm', desc: 'Tối ưu chi phí' },
                    { id: 'Linh hoạt', label: 'Linh hoạt', desc: 'Tiêu chuẩn hợp lý' },
                    { id: 'Sang chảnh', label: 'Sang chảnh', desc: 'Cao cấp & Resort' }
                  ].map(budget => (
                    <button
                      key={budget.id}
                      type="button"
                      onClick={() => setProfileBudget(budget.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        profileBudget === budget.id
                          ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-extrabold shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium'
                      }`}
                    >
                      <span className="block text-xs">{budget.label}</span>
                      <span className="block text-[10px] text-slate-400 font-normal">{budget.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tiểu sử (Bio) */}
              <div>
                <label className="block mb-1 text-slate-800">Tiểu sử cá nhân (Bio)</label>
                <textarea
                  rows={3}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  placeholder="Chia sẻ đôi nét về bạn, sở thích du lịch và những nơi bạn từng đi..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 transition-all leading-relaxed"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSavingProfile}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="sparkle-btn text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang lưu vào CSDL...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Lưu Thay Đổi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Travel Passport QR Modal (Mã QR & Thẻ Hộ Chiếu Du Khách) */}
      {isPassportModalOpen && (
        <TravelPassportCardModal
          user={currentUser}
          profileData={profileData}
          onClose={() => setIsPassportModalOpen(false)}
        />
      )}

      {/* Follow List Modal (Followers & Following) */}
      {followModalState.isOpen && (
        <FollowListModal
          userId={myUserId}
          userName={profileName || currentUser.name}
          initialTab={followModalState.tab}
          onClose={() => {
            setFollowModalState(prev => ({ ...prev, isOpen: false }));
            loadFollowCounts();
          }}
          onFollowChange={() => {
            loadFollowCounts();
          }}
        />
      )}

      {/* Itinerary Detail Modal */}
      {selectedItineraryForModal && (
        <ItineraryDetailModal
          itinerary={selectedItineraryForModal}
          onClose={() => setSelectedItineraryForModal(null)}
        />
      )}

      {/* Post Detail Modal */}
      {selectedPostForDetail && (
        <PostDetailModal
          post={selectedPostForDetail}
          onClose={() => setSelectedPostForDetail(null)}
          onSelectItinerary={(itin) => {
            setSelectedPostForDetail(null);
            setSelectedItineraryForModal(itin);
          }}
        />
      )}

      {/* Level Up & Tier Promotion Celebration Modal */}
      {promotionData && (
        <TierPromotionModal
          promotion={promotionData}
          user={currentUser}
          onClose={() => setPromotionData(null)}
          onViewBadges={() => {
            setPromotionData(null);
            setActiveTab('badges');
          }}
        />
      )}

    </div>
  );
};


