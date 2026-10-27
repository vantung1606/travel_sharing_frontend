import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import { userApi, itineraryApi, uploadApi } from '../../../services/api';
import { FollowListModal } from '../../../components/community/FollowListModal';
import { PostDetailModal } from '../../../components/community/PostDetailModal';
import { ItineraryDetailModal } from '../../../components/itinerary/ItineraryDetailModal';
import { TravelPassportCardModal } from '../../../components/profile/TravelPassportCardModal';
import { useToast } from '../../../components/common/Toast';
import { User, MapPin, Heart, Award, Sparkles, Share2, Bookmark, MessageCircle, Route, Edit, Camera, Star, PlusCircle, Zap, Globe, X, Users, UserCheck, Loader2, Copy, Eye, ArrowRight, Lock, Compass, Phone, CheckCircle2, ChevronLeft, ChevronRight, Crown, Trash2 } from 'lucide-react';
import { TierPromotionModal } from '../../../components/common/TierPromotionModal';
import { TravelFootprintSection } from '../../../components/profile/TravelFootprintSection';
import { ChangePasswordModal } from '../../../components/profile/ChangePasswordModal';
import { TIERS, calculateUserXP, getUserTier, getNextTier, calculateTierProgress, checkTierPromotion } from '../../../utils/tierSystem';

export const ProfilePage = () => {
  const { currentUser, updateCurrentUser, itineraries, posts, destinations, savedPlaces = [], toggleSavePlace = () => {}, setIsAIGeneratorOpen, setUserTab, setItineraries, isLoggedIn, setIsAuthModalOpen, setAuthMode } = useApp();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('itineraries'); // 'itineraries' | 'posts' | 'ai-dna' | 'saved' | 'badges'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
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
  const [profileAddress, setProfileAddress] = useState(currentUser?.address || '');
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
    if (currentUser?.address) setProfileAddress(currentUser.address);
    if (currentUser?.travelStyle) setProfileTravelStyle(currentUser.travelStyle);
    if (currentUser?.budgetPreference) setProfileBudget(currentUser.budgetPreference);
  }, [currentUser]);

  // Full Profile data from Backend API
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Modals & cloning state
  const [selectedPostForDetail, setSelectedPostForDetail] = useState(null);
  const [selectedItineraryForModal, setSelectedItineraryForModal] = useState(null);


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

  const handleDeleteItinerary = async (itin) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa chuyến đi "${itin.title}" khỏi kho cá nhân của bạn không?`)) {
      return;
    }
    try {
      await itineraryApi.deleteItinerary(itin.id, currentUser?.email);
      setItineraries(prev => prev.filter(i => i.id !== itin.id));
      toast.showSuccess(`Đã xóa chuyến đi "${itin.title}" thành công.`);
      loadFullProfile();
    } catch (err) {
      toast.showError('Không thể xóa: ' + (err.message || 'Lỗi kết nối'));
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
        address: profileAddress.trim(),
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
        address: profileAddress.trim(),
        travelStyle: profileTravelStyle,
        budgetPreference: profileBudget
      });
      setProfileData(prev => prev ? {
        ...prev,
        fullName: profileName.trim(),
        handle: profileHandle.trim(),
        bio: profileBio.trim(),
        phoneNumber: profilePhone.trim(),
        address: profileAddress.trim(),
        location: profileAddress.trim() || prev.location,
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
  const totalLikesReceived = React.useMemo(() => {
    return displayPosts.reduce((acc, p) => acc + (p.likeCount ?? p.likesCount ?? 0), 0);
  }, [displayPosts]);

  const userTotalXP = calculateUserXP({
    itinsCount,
    postsCount,
    followersCount: activeFollowersCount
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
        <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] shadow-sm p-8 sm:p-12 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-[6px] bg-clay-50 border border-clay-200 flex items-center justify-center text-clay-700 mx-auto shadow-2xs">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black font-display text-ink-800 tracking-tight">
            Chưa Đăng Nhập Tài Khoản
          </h2>
          <p className="text-ink-600 text-sm font-serif leading-relaxed">
            Vui lòng đăng nhập bằng tài khoản Wayfare của bạn để xem và quản lý hồ sơ cá nhân, lịch trình du lịch và các bài viết chia sẻ.
          </p>
          <button
            onClick={() => {
              setAuthMode('login');
              setIsAuthModalOpen(true);
            }}
            className="w-full py-2.5 rounded-[5px] bg-clay-600 hover:bg-clay-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 space-y-6 sm:space-y-8">
      
      {/* ========================================================= */}
      {/* 1. HERO PROFILE BANNER & USER HEADER CARD                 */}
      {/* ========================================================= */}
      <div className="bg-[#FFFDF8] rounded-[6px] border border-ink-200/80 shadow-xs overflow-hidden relative">
        
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
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-ink-950/20 to-transparent"></div>
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={isUploadingCover}
            className="absolute top-4 right-4 px-3.5 py-1.5 rounded-[5px] bg-ink-900/80 backdrop-blur-md text-ink-100 text-xs font-bold flex items-center gap-1.5 border border-ink-400/30 hover:bg-ink-900 transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Bấm để tải ảnh bìa du lịch từ máy"
          >
            {isUploadingCover ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-clay-400" />
                <span>Đang tải ảnh bìa...</span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 text-clay-300" />
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
                    className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover bg-white ring-4 ring-[#FFFDF8] shadow-md ${currentTier.avatarRing} transition-transform group-hover:scale-[1.02]`}
                  />
                </div>
                
                {/* Upload Avatar Overlay Button */}
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute inset-0 rounded-full bg-ink-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-bold cursor-pointer"
                  title="Thay đổi ảnh đại diện"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="w-6 h-6 animate-spin text-clay-300" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 text-white mb-0.5" />
                      <span>Đổi ảnh</span>
                    </>
                  )}
                </button>

                {/* Prestige Rank Badge */}
                <span
                  className={`absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-md border-2 border-[#FFFDF8] cursor-pointer transition-transform group-hover:scale-110 ${currentTier.cornerBg}`}
                  title={`Cấp độ: ${currentTier.name} (${currentTier.nameEn}) • ${userTotalXP} XP`}
                >
                  {currentTier.cornerIcon}
                </span>
              </div>

              {/* User Details */}
              <div className="space-y-1.5 pb-1 pt-1 sm:pt-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-display font-black text-2xl sm:text-3xl text-ink-800 tracking-tight leading-tight">
                    {profileName}
                  </h1>
                  <span className={`px-2.5 py-0.5 rounded-[4px] text-[11px] font-bold flex items-center gap-1 border shadow-2xs ${currentTier.badgeBg}`}>
                    <span>{currentTier.icon}</span>
                    <span>{currentTier.name}</span>
                  </span>
                  {profileTravelStyle && (
                    <span className="px-2.5 py-0.5 rounded-[4px] bg-clay-50 text-clay-700 text-[11px] font-bold border border-clay-200">
                      🧭 {profileTravelStyle}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-ink-500 font-mono font-medium flex items-center gap-2 flex-wrap">
                  <span className="text-ink-800 font-semibold">{profileHandle || currentUser.handle}</span>
                  <span className="text-ink-300">•</span>
                  <span className="flex items-center gap-1 text-ink-600 font-serif">
                    <MapPin className="w-3.5 h-3.5 text-clay-600" /> {profileAddress || profileData?.address || profileData?.location || 'Việt Nam'}
                  </span>
                  {profileBudget && (
                    <>
                      <span className="text-ink-300">•</span>
                      <span className="text-emerald-800 font-serif font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-[4px] border border-emerald-200">
                        💰 {profileBudget}
                      </span>
                    </>
                  )}
                </p>

                {/* Follow Counts Quick Bar */}
                <div className="flex items-center gap-3 pt-0.5 text-xs sm:text-sm">
                  <button
                    onClick={() => setFollowModalState({ isOpen: true, tab: 'followers' })}
                    className="flex items-center gap-1.5 font-bold text-ink-800 hover:text-clay-700 transition-colors cursor-pointer group"
                    title="Bấm để xem danh sách người theo dõi"
                  >
                    <span className="font-black text-clay-700 text-sm sm:text-base flex items-center gap-1">
                      {followersCount}
                      <Users className="w-3.5 h-3.5 text-clay-600 shrink-0" />
                    </span>
                    <span className="font-medium text-ink-500 group-hover:text-clay-800 font-serif">người theo dõi</span>
                  </button>
                  <span className="text-ink-300">•</span>
                  <button
                    onClick={() => setFollowModalState({ isOpen: true, tab: 'following' })}
                    className="flex items-center gap-1.5 font-bold text-ink-800 hover:text-ink-900 transition-colors cursor-pointer group"
                    title="Bấm để xem danh sách đang theo dõi"
                  >
                    <span className="font-black text-ink-800 text-sm sm:text-base flex items-center gap-1">
                      {followingCount}
                      <UserCheck className="w-3.5 h-3.5 text-ink-600 shrink-0" />
                    </span>
                    <span className="font-medium text-ink-500 group-hover:text-ink-900 font-serif">đang theo dõi</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Action Controls */}
            <div className="flex items-center gap-2 pb-1 shrink-0 flex-wrap">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-3.5 py-2 rounded-[5px] bg-[#F8F4EC] hover:bg-ink-100 text-ink-800 border border-ink-200/80 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap"
              >
                <Edit className="w-3.5 h-3.5 text-clay-600 shrink-0" />
                <span>Chỉnh Sửa Hồ Sơ</span>
              </button>

              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="px-3.5 py-2 rounded-[5px] bg-[#FFFDF8] hover:bg-clay-50 text-clay-700 border border-ink-200/80 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap"
                title="Đổi mật khẩu tài khoản"
              >
                <Lock className="w-3.5 h-3.5 text-clay-600 shrink-0" />
                <span>Đổi Mật Khẩu</span>
              </button>

              <button
                onClick={() => setIsPassportModalOpen(true)}
                className="p-2 rounded-[5px] bg-[#FFFDF8] hover:bg-clay-50 text-clay-700 border border-ink-200/80 hover:border-clay-300 transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0 flex items-center justify-center"
                title="Xem Thẻ Passport & Mã QR Cá Nhân"
              >
                <Share2 className="w-4 h-4 text-clay-600" />
              </button>
            </div>

          </div>

          {/* Bio Text */}
          {profileBio && (
            <p className="text-xs sm:text-sm text-ink-600 font-serif leading-relaxed max-w-3xl mb-5 italic bg-[#F8F4EC]/60 p-3 rounded-[5px] border border-ink-200/50">
              "{profileBio}"
            </p>
          )}

          {/* Key Travel Metrics Bento Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-3.5 rounded-[6px] bg-[#F8F4EC] border border-ink-200/80 text-xs">
            <div
              onClick={() => setActiveTab('posts')}
              className="p-2 cursor-pointer hover:bg-rose-50/70 rounded-[5px] transition-colors group"
              title="Tổng lượt thích các bài viết từ cộng đồng du lịch"
            >
              <span className="text-ink-500 block text-[11px] font-bold uppercase tracking-wider group-hover:text-rose-700">Lượt Thích Nhận Được</span>
              <span className="font-display font-black text-xl text-rose-600 mt-0.5 block flex items-center gap-1 group-hover:scale-105 transition-transform">
                {totalLikesReceived} <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              </span>
              <span className="text-[10px] text-rose-600 font-serif font-semibold group-hover:underline">Tương tác bài viết &rarr;</span>
            </div>

            <div className="p-2 border-l border-ink-200/80">
              <span className="text-ink-500 block text-[11px] font-bold uppercase tracking-wider">Lịch Trình Đã Tạo</span>
              <span className="font-display font-black text-xl text-clay-700 mt-0.5 block flex items-center gap-1">
                {displayItineraries.length} <Sparkles className="w-4 h-4 text-amber-500" />
              </span>
              <span className="text-[10px] text-ink-400 font-serif">Đã đồng bộ GPS</span>
            </div>

            <div className="p-2 border-l border-ink-200/80">
              <span className="text-ink-500 block text-[11px] font-bold uppercase tracking-wider">Bài Đăng Cộng Đồng</span>
              <span className="font-display font-black text-xl text-ink-800 mt-0.5 block flex items-center gap-1">
                {displayPosts.length} <Globe className="w-4 h-4 text-clay-600" />
              </span>
              <span className="text-[10px] text-ink-400 font-serif">Đã đăng công khai</span>
            </div>

            <div
              onClick={() => setFollowModalState({ isOpen: true, tab: 'followers' })}
              className="p-2 border-l border-ink-200/80 cursor-pointer hover:bg-clay-100/60 rounded-[5px] transition-colors group"
              title="Bấm để xem danh sách người theo dõi"
            >
              <span className="text-ink-500 block text-[11px] font-bold uppercase tracking-wider group-hover:text-clay-800">Người Theo Dõi</span>
              <span className="font-display font-black text-xl text-clay-700 mt-0.5 block flex items-center gap-1 group-hover:scale-105 transition-transform">
                {followersCount} <Users className="w-4 h-4 text-clay-600" />
              </span>
              <span className="text-[10px] text-clay-700 font-serif font-semibold group-hover:underline">Xem kết nối</span>
            </div>

            <div
              onClick={() => setFollowModalState({ isOpen: true, tab: 'following' })}
              className="p-2 border-l border-ink-200/80 cursor-pointer hover:bg-amber-100/60 rounded-[5px] transition-colors group"
              title="Bấm để xem danh sách đang theo dõi"
            >
              <span className="text-ink-500 block text-[11px] font-bold uppercase tracking-wider group-hover:text-ink-900">Đang Theo Dõi</span>
              <span className="font-display font-black text-xl text-ink-800 mt-0.5 block flex items-center gap-1 group-hover:scale-105 transition-transform">
                {followingCount} <UserCheck className="w-3.5 h-3.5 text-ink-600" />
              </span>
              <span className="text-[10px] text-ink-600 font-serif font-semibold group-hover:underline">Quản lý</span>
            </div>

            <div
              onClick={() => setActiveTab('badges')}
              className="p-2 border-l border-ink-200/80 cursor-pointer hover:bg-amber-100/60 rounded-[5px] transition-colors group"
              title="Bấm để xem Bảng Cấp Bậc & Khung Avatar"
            >
              <span className="text-ink-500 block text-[11px] font-bold uppercase tracking-wider group-hover:text-amber-800">Cấp Độ Danh Dự</span>
              <span className="font-display font-black text-xs sm:text-sm text-amber-800 mt-0.5 block flex items-center gap-1 truncate">
                {currentTier.icon} {currentTier.name}
              </span>
              <span className="text-[10px] text-amber-700 font-serif font-semibold group-hover:underline">{userTotalXP} XP • Khung avatar &rarr;</span>
            </div>
          </div>

        </div>

        {/* PROFILE TAB NAVIGATION WITH SCROLL ARROWS */}
        <div className="relative border-t border-ink-200/80 bg-[#F4EFE6] px-2 sm:px-4 py-2 flex items-center gap-1.5">
          {/* Scroll Left Button */}
          {canScrollLeft && (
            <button
              onClick={() => scrollTabs('left')}
              className="p-1.5 rounded-[5px] bg-[#FFFDF8] border border-ink-200 text-ink-600 hover:bg-ink-100 shadow-2xs shrink-0 cursor-pointer z-10 transition-transform active:scale-95"
              title="Cuộn sang trái"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Scrollable Tabs */}
          <div
            ref={tabScrollRef}
            onScroll={checkTabScroll}
            className="flex-1 flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-ink-300 hover:scrollbar-thumb-ink-400 scrollbar-track-transparent py-1"
          >
            {[
              { id: 'itineraries', label: 'Lịch Trình Của Tôi', count: displayItineraries.length, icon: Route },
              { id: 'posts', label: 'Bài Viết & Review', count: displayPosts.length, icon: Globe },
              { id: 'ai-dna', label: 'Gu Du Lịch & AI DNA', badge: 'AI', icon: Sparkles },
              { id: 'saved', label: 'Địa Điểm Đã Lưu', count: savedPlaces.length, icon: Bookmark },
              { id: 'badges', label: 'Huy Hiệu & Khung Avatar', count: achievements.length, icon: Award }
            ].map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-3 sm:px-4 text-xs font-bold flex items-center gap-2 rounded-[5px] transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-clay-600 text-white shadow-xs font-black'
                      : 'bg-[#FFFDF8] hover:bg-white text-ink-700 hover:text-ink-900 border border-ink-200/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-clay-600'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] ${
                      active ? 'bg-white/20 text-white font-black' : 'bg-[#F8F4EC] text-ink-600 font-bold border border-ink-200/60'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  {tab.badge && (
                    <span className={`px-1.5 py-0.5 rounded-[4px] text-[9px] font-black ${
                      active ? 'bg-amber-300 text-amber-950' : 'bg-amber-100 text-amber-900 border border-amber-300'
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
              className="p-1.5 rounded-[5px] bg-[#FFFDF8] border border-ink-200 text-ink-600 hover:bg-ink-100 shadow-2xs shrink-0 cursor-pointer z-10 transition-transform active:scale-95"
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
            <h3 className="font-display font-black text-base text-ink-800 flex items-center gap-2">
              <Route className="w-5 h-5 text-clay-600" />
              <span>Danh Sách Lịch Trình Du Lịch ({displayItineraries.length})</span>
            </h3>
            <button
              onClick={() => setIsAIGeneratorOpen(true)}
              className="bg-clay-600 hover:bg-clay-700 text-white px-4 py-2 rounded-[5px] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs hover:scale-102 active:scale-98 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo Tour Mới</span>
            </button>
          </div>

          {displayItineraries.length === 0 ? (
            <div className="text-center py-16 px-4 text-ink-400 text-sm bg-[#FFFDF8] rounded-[6px] border border-dashed border-ink-200/80 space-y-3">
              <Route className="w-10 h-10 text-ink-300 mx-auto" />
              <p className="font-serif font-bold text-ink-700">Bạn chưa có lịch trình du lịch nào trong kho.</p>
              <button
                onClick={() => setIsAIGeneratorOpen(true)}
                className="px-4 py-2 rounded-[5px] bg-clay-600 hover:bg-clay-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Tạo Tour Cùng Trợ Lý AI
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayItineraries.map(itin => (
                <div
                  key={itin.id}
                  className="bg-[#FFFDF8] rounded-[6px] border border-ink-200/80 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-0.5"
                >
                  {/* Cover Image & Badges */}
                  <div className="relative h-48 w-full overflow-hidden bg-ink-100">
                    <img
                      src={itin.coverImageUrl || itin.coverImage || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80'}
                      alt={itin.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/20 to-transparent"></div>

                    {/* Top Badges */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-1.5 flex-wrap">
                      {itin.isAiGenerated ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-clay-600/90 text-white text-[10px] font-bold backdrop-blur-md shadow-2xs">
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>Tạo bởi AI</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-ink-900/80 text-white text-[10px] font-bold backdrop-blur-md shadow-2xs">
                          <Route className="w-3 h-3 text-clay-400" />
                          <span>Lộ trình phượt</span>
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-[4px] bg-[#FFFDF8]/90 backdrop-blur-md text-ink-800 text-[10px] font-black border border-ink-200/60 shadow-2xs">
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
                        className="font-display font-black text-base text-ink-800 group-hover:text-clay-600 transition-colors line-clamp-2 leading-snug cursor-pointer"
                        title={itin.title}
                      >
                        {itin.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-ink-500 font-serif">Chi phí dự kiến:</span>
                        <span className="font-black text-clay-700 font-mono text-sm">
                          {typeof itin.budgetTotal === 'number'
                            ? `${itin.budgetTotal.toLocaleString('vi-VN')} đ`
                            : (itin.budgetTotal || '5.000.000 đ')}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-3 border-t border-ink-100 text-xs">
                      <button
                        onClick={() => setSelectedItineraryForModal(itin)}
                        className="flex-1 py-2 px-3 rounded-[5px] bg-[#F8F4EC] hover:bg-clay-50 text-clay-700 border border-ink-200/80 font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem chi tiết lộ trình</span>
                      </button>
                      <button
                        onClick={() => handleDeleteItinerary(itin)}
                        className="p-2 rounded-[5px] bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                        title="Xóa lịch trình khỏi kho cá nhân"
                      >
                        <Trash2 className="w-4 h-4" />
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
            <h3 className="font-display font-black text-base text-ink-800 flex items-center gap-2">
              <Globe className="w-5 h-5 text-clay-600" />
              <span>Bài Đăng & Review Đã Chia Sẻ ({displayPosts.length})</span>
            </h3>
            <button
              onClick={() => setUserTab('community')}
              className="px-4 py-2 rounded-[5px] bg-[#F8F4EC] hover:bg-clay-50 text-clay-700 border border-ink-200/80 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Globe className="w-4 h-4 text-clay-600" />
              <span>Vào Cộng Đồng Chia Sẻ</span>
            </button>
          </div>

          {displayPosts.length === 0 ? (
            <div className="text-center py-16 px-4 text-ink-400 text-sm bg-[#FFFDF8] rounded-[6px] border border-dashed border-ink-200/80 space-y-3">
              <Globe className="w-10 h-10 text-ink-300 mx-auto" />
              <p className="font-serif font-bold text-ink-700">Bạn chưa có bài viết nào trên cộng đồng.</p>
              <button
                onClick={() => setUserTab('community')}
                className="px-4 py-2 rounded-[5px] bg-clay-600 hover:bg-clay-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
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
                    className="p-5 sm:p-6 rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 shadow-2xs hover:shadow-sm transition-all space-y-3.5 group flex flex-col justify-between"
                  >
                    <div className="space-y-3.5">
                      {/* Author Header */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={authorAvatar}
                            alt={authorName}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#FFFDF8] shadow-2xs shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs sm:text-sm text-ink-800 truncate">
                                {authorName}
                              </span>
                              <span className="px-2 py-0.5 rounded-[4px] bg-amber-50 text-amber-900 text-[10px] font-bold border border-amber-200/80">
                                {authorRole}
                              </span>
                            </div>
                            <p className="text-[11px] text-ink-500 font-serif flex items-center gap-1.5 mt-0.5">
                              <span>{timeDisplay}</span>
                              {locationText && (
                                <>
                                  <span className="text-ink-300">•</span>
                                  <span className="flex items-center gap-0.5 text-ink-600 font-medium truncate">
                                    <MapPin className="w-3 h-3 text-clay-600 shrink-0" />
                                    {locationText}
                                  </span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        {post.visibility === 'PRIVATE' ? (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] bg-[#F8F4EC] text-ink-600 font-bold text-[10px] border border-ink-200/80 shrink-0">
                            <Lock className="w-3 h-3" /> Chỉ mình tôi
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] bg-clay-50 text-clay-700 font-bold text-[10px] border border-clay-200/80 shrink-0">
                            <Globe className="w-3 h-3" /> Công khai
                          </span>
                        )}
                      </div>

                      {/* Title & Content */}
                      <div className="space-y-1.5">
                        {post.title && (
                          <h4
                            onClick={() => setSelectedPostForDetail(post)}
                            className="font-display font-black text-base sm:text-lg text-ink-800 group-hover:text-clay-600 transition-colors leading-snug cursor-pointer"
                          >
                            {post.title}
                          </h4>
                        )}
                        <p className="text-xs sm:text-sm text-ink-700 font-serif leading-relaxed whitespace-pre-line">
                          {post.content}
                        </p>
                      </div>

                      {/* Image Gallery */}
                      {post.images && post.images.length > 0 && (
                        <div
                          onClick={() => setSelectedPostForDetail(post)}
                          className="cursor-pointer overflow-hidden rounded-[6px]"
                        >
                          {post.images.length === 1 ? (
                            <img
                              src={post.images[0]}
                              alt="Post photo"
                              className="w-full max-h-72 sm:max-h-80 object-cover rounded-[6px] hover:scale-[1.01] transition-transform duration-300"
                            />
                          ) : post.images.length === 2 ? (
                            <div className="grid grid-cols-2 gap-2 h-48 sm:h-56 rounded-[6px] overflow-hidden">
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
                            <div className="grid grid-cols-3 gap-2 h-40 sm:h-48 rounded-[6px] overflow-hidden">
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
                          className="p-3 sm:p-3.5 bg-[#F8F4EC] hover:bg-clay-50/50 rounded-[6px] border border-ink-200/80 flex items-center justify-between gap-3 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-[5px] bg-clay-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                              <Route className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold text-clay-700 uppercase tracking-wider block">
                                Lịch trình đính kèm
                              </span>
                              <span className="font-bold text-xs sm:text-sm text-ink-800 truncate block">
                                {post.itineraryTitle}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-clay-600 hover:text-clay-700 shrink-0 flex items-center gap-1">
                            <span>Xem tour</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Engagement Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-ink-100 text-xs text-ink-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 font-bold text-rose-600">
                          <Heart className="w-4 h-4 fill-rose-500/20 text-rose-600" />
                          <span>{likeCount}</span>
                        </span>
                        <span className="flex items-center gap-1.5 font-bold text-clay-700">
                          <MessageCircle className="w-4 h-4" />
                          <span>{commentCount}</span>
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedPostForDetail(post)}
                        className="text-xs font-bold text-clay-600 hover:text-clay-700 flex items-center gap-1 cursor-pointer transition-colors"
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
        <div className="bg-[#FFFDF8] rounded-[6px] p-6 sm:p-8 border border-ink-200/80 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[5px] bg-clay-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Sparkles className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-ink-800">Cấu Hình Gu Du Lịch & AI DNA</h3>
                <p className="text-xs text-ink-500 font-serif">Trợ lý WanderAI tự động ghi nhớ khẩu vị du lịch của bạn để tối ưu gợi ý tour</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 rounded-[5px] bg-[#F8F4EC] hover:bg-clay-50 text-clay-700 border border-ink-200/80 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Edit className="w-3.5 h-3.5 text-clay-600" />
              <span>Chỉnh sửa Gu du lịch</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-[6px] bg-[#F8F4EC] border border-ink-200/80 space-y-1">
              <span className="text-[11px] font-bold text-clay-700 uppercase tracking-wider block">Phong cách du lịch</span>
              <span className="font-bold text-ink-800 text-sm block">🧭 {profileTravelStyle || 'Khám phá tự do'}</span>
              <p className="text-[11px] text-ink-500 font-serif">Khẩu vị di chuyển & trải nghiệm điểm đến</p>
            </div>

            <div className="p-4 rounded-[6px] bg-[#F8F4EC] border border-ink-200/80 space-y-1">
              <span className="text-[11px] font-bold text-clay-700 uppercase tracking-wider block">Mức ngân sách ưa thích</span>
              <span className="font-bold text-ink-800 text-sm block">💰 {profileBudget || 'Linh hoạt'}</span>
              <p className="text-[11px] text-ink-500 font-serif">Cân đối chi phí di chuyển, ăn uống & lưu trú</p>
            </div>

            <div className="p-4 rounded-[6px] bg-[#F8F4EC] border border-ink-200/80 space-y-1">
              <span className="text-[11px] font-bold text-clay-700 uppercase tracking-wider block">Cấp bậc nhà thám hiểm</span>
              <span className="font-bold text-ink-800 text-sm block flex items-center gap-1.5">
                <span>{currentTier.icon}</span>
                <span>{currentTier.name}</span>
              </span>
              <p className="text-[11px] text-ink-500 font-serif">{currentTier.desc}</p>
            </div>

            <div className="p-4 rounded-[6px] bg-[#F8F4EC] border border-ink-200/80 space-y-1">
              <span className="text-[11px] font-bold text-clay-700 uppercase tracking-wider block">Đóng góp cộng đồng</span>
              <span className="font-bold text-ink-800 text-sm block">🌟 {displayPosts.length} Bài viết • {displayItineraries.length} Tour</span>
              <p className="text-[11px] text-ink-500 font-serif">{totalLikesReceived} lượt thích từ bạn bè du khách</p>
            </div>
          </div>

          <div className="p-4 rounded-[6px] bg-[#F8F4EC] border border-ink-200/80 space-y-2">
            <h4 className="font-bold text-xs text-ink-800 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Giới thiệu bản thân (đầu vào cho gợi ý du lịch cá nhân hóa)</span>
            </h4>
            <p className="text-xs text-ink-700 font-serif italic leading-relaxed bg-[#FFFDF8] p-3 rounded-[5px] border border-ink-200/80">
              "{profileData?.bio || currentUser?.bio || "Thường đi du lịch trải nghiệm tự túc, thích chụp ảnh và khám phá ẩm thực bản địa độc đáo."}"
            </p>
          </div>

          {/* Bản đồ dấu chân du lịch — danh mục tỉnh từ server (bảng provinces), check-in lưu DB */}
          <TravelFootprintSection
            posts={displayPosts}
            itineraries={displayItineraries}
            userId={profileData?.id || currentUser?.id}
            userName={profileData?.fullName || currentUser?.fullName}
          />
        </div>
      )}

      {/* TAB 4: SAVED DESTINATIONS */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-black text-base text-ink-800 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-clay-600" />
              <span>Địa Điểm Yêu Thích Đã Lưu ({savedPlaces.length})</span>
            </h3>
            <a
              href="/explore"
              className="text-xs font-bold text-clay-600 hover:text-clay-700 flex items-center gap-1 hover:underline"
            >
              <span>+ Khám phá thêm địa điểm</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {savedPlaces.length === 0 ? (
            <div className="bg-[#FFFDF8] rounded-[6px] p-12 text-center border border-ink-200/80 shadow-2xs space-y-3">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-2xs">
                <Heart className="w-7 h-7" />
              </div>
              <h4 className="font-display font-black text-base text-ink-800">Chưa có địa điểm nào được lưu</h4>
              <p className="text-xs text-ink-600 font-serif max-w-sm mx-auto leading-relaxed">
                Khi lướt trang Khám phá, hãy bấm biểu tượng trái tim ❤️ ở góc ảnh để lưu các tọa độ bạn muốn ghé thăm vào danh sách này nhé!
              </p>
              <a
                href="/explore"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[5px] bg-clay-600 hover:bg-clay-700 text-white font-bold text-xs shadow-xs transition-all"
              >
                <Compass className="w-4 h-4" />
                <span>Khám Phá Địa Điểm Ngay ✨</span>
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {savedPlaces.map(place => (
                <div key={place.id} className="bg-[#FFFDF8] rounded-[6px] overflow-hidden border border-ink-200/80 hover:border-clay-400 shadow-2xs hover:shadow-sm transition-all duration-300 space-y-3 p-3 group relative flex flex-col justify-between">
                  <div className="h-44 rounded-[5px] overflow-hidden relative bg-ink-100">
                    <img
                      src={place.image || place.coverImageUrl || 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80'}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Rating badge */}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-[4px] bg-ink-950/70 backdrop-blur-md text-amber-300 text-[10px] font-bold flex items-center gap-1 border border-ink-700/50">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {place.rating || '4.9'}
                    </span>
                    {/* Remove from saved button */}
                    <button
                      onClick={() => toggleSavePlace(place)}
                      title="Gỡ khỏi danh sách đã lưu"
                      className="absolute top-2 right-2 w-7 h-7 rounded-[4px] bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                  <div className="space-y-1 px-1">
                    <div className="flex items-center gap-1 text-[11px] font-serif text-ink-500">
                      <MapPin className="w-3 h-3 text-clay-600" />
                      <span>{place.city || 'Việt Nam'}</span>
                    </div>
                    <h4 className="font-bold text-sm text-ink-800 truncate">{place.name}</h4>
                    <p className="text-[11px] text-ink-500 font-serif truncate">{place.category || place.categoryName}</p>
                  </div>
                  <a
                    href={`/explore`}
                    className="w-full py-2 rounded-[5px] bg-[#F8F4EC] hover:bg-clay-600 hover:text-white text-clay-700 font-bold text-xs text-center border border-ink-200/80 transition-all block shadow-2xs"
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
          <div className="bg-gradient-to-br from-ink-950 via-ink-900 to-clay-950 rounded-[6px] p-6 sm:p-8 text-white shadow-xl border border-ink-700/60 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-clay-500/10 blur-3xl pointer-events-none"></div>
            <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-[5px] flex items-center justify-center text-3xl shadow-lg border border-white/20 ${currentTier.avatarEffect || 'bg-white/10'}`}>
                  {currentTier.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-clay-300 tracking-wider uppercase font-mono">{currentTier.tagText}</span>
                    <span className="px-2 py-0.5 rounded-[4px] bg-white/10 text-ink-200 text-[10px] font-semibold border border-white/10">
                      Đang kích hoạt
                    </span>
                  </div>
                  <h3 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight mt-0.5">
                    {currentTier.name} ({currentTier.nameEn})
                  </h3>
                  <p className="text-xs text-ink-200/90 font-serif mt-1 max-w-xl leading-relaxed">
                    {currentTier.desc}
                  </p>
                </div>
              </div>

              {/* Total XP Counter */}
              <div className="bg-white/10 backdrop-blur-md rounded-[5px] p-4 border border-white/10 min-w-[180px] text-center shrink-0">
                <span className="text-[11px] text-clay-300 font-medium block">Điểm Uy Tín Du Lịch</span>
                <span className="font-display font-black text-2xl sm:text-3xl text-white mt-0.5 block flex items-center justify-center gap-1">
                  {userTotalXP} <span className="text-sm font-bold text-amber-300">XP</span>
                </span>
                <span className="text-[10px] text-ink-300 font-serif block mt-1">Tính từ hoạt động thực tế</span>
              </div>
            </div>

            {/* XP Level Progress Bar */}
            <div className="pt-5 space-y-2 relative">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-ink-200 flex items-center gap-1.5">
                  <span className="font-serif">Tiến trình thăng hạng:</span>
                  <span className="text-amber-300 font-black">{userTotalXP} XP</span>
                </span>
                <span className="text-clay-300 font-serif">
                  {nextTier ? `Cần ${nextTier.minXP} XP để đạt ${nextTier.name}` : 'Đã đạt cấp bậc Huyền Thoại cao nhất! 🏆'}
                </span>
              </div>

              <div className="w-full h-3 rounded-[4px] bg-white/10 overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full rounded-[3px] bg-gradient-to-r from-clay-400 via-amber-400 to-clay-200 transition-all duration-700 shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              {/* Scoring Formula Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px] text-ink-200 font-medium">
                <div className="bg-white/5 rounded-[5px] p-2 border border-white/5">
                  <span className="text-clay-300 font-bold block">Tour đã tạo:</span>
                  <span>{itinsCount} × 60 XP = {itinsCount * 60} XP</span>
                </div>
                <div className="bg-white/5 rounded-[5px] p-2 border border-white/5">
                  <span className="text-emerald-300 font-bold block">Bài chia sẻ:</span>
                  <span>{postsCount} × 40 XP = {postsCount * 40} XP</span>
                </div>
                <div className="bg-white/5 rounded-[5px] p-2 border border-white/5">
                  <span className="text-amber-300 font-bold block">Người theo dõi:</span>
                  <span>{activeFollowersCount} × 15 XP = {activeFollowersCount * 15} XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. AVATAR FRAMES SHOWCASE */}
          <div className="bg-[#FFFDF8] rounded-[6px] p-6 sm:p-8 border border-ink-200/80 shadow-2xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-black text-base text-ink-800 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  <span>Bộ Sưu Tập Khung Avatar Danh Dự</span>
                </h3>
                <p className="text-xs text-ink-500 font-serif mt-0.5">
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
                    className={`rounded-[6px] p-4 border transition-all duration-300 flex flex-col justify-between space-y-4 ${
                      isCurrent
                        ? 'border-clay-500 bg-clay-50/50 shadow-sm ring-1 ring-clay-500/30'
                        : isUnlocked
                        ? 'border-ink-200/80 bg-[#FFFDF8] hover:border-ink-300 shadow-2xs'
                        : 'border-ink-200/50 bg-[#F8F4EC]/60 opacity-60'
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
                        <h4 className="font-bold text-sm text-ink-800 flex items-center justify-center gap-1">
                          <span>{tier.icon}</span>
                          <span>{tier.name}</span>
                        </h4>
                        <span className="text-[11px] font-mono text-ink-500 font-semibold">{tier.nameEn}</span>
                      </div>
                    </div>

                    {/* Tier Requirements & Status */}
                    <div className="space-y-2 pt-2 border-t border-ink-100 text-xs text-center">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-ink-500 font-serif">Yêu cầu tối thiểu:</span>
                        <span className="font-bold text-ink-800">{tier.minXP} XP</span>
                      </div>

                      {isCurrent ? (
                        <span className="block py-1.5 px-2 rounded-[4px] bg-clay-600 text-white font-bold text-[11px] shadow-2xs">
                          ✓ Đang sử dụng khung này
                        </span>
                      ) : isUnlocked ? (
                        <span className="block py-1.5 px-2 rounded-[4px] bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                          ✓ Đã mở khóa khung
                        </span>
                      ) : (
                        <span className="block py-1.5 px-2 rounded-[4px] bg-[#F8F4EC] text-ink-600 font-medium text-[11px] border border-ink-200/60">
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
          <div className="bg-[#FFFDF8] rounded-[6px] p-6 sm:p-8 border border-ink-200/80 shadow-2xs space-y-5">
            <h3 className="font-display font-black text-base text-ink-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Huy Hiệu Đóng Góp Cộng Đồng</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {achievements.map((ach, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-[6px] border flex items-start gap-4 ${
                    ach.unlocked ? 'bg-[#F8F4EC] border-clay-200' : 'bg-[#F8F4EC]/50 border-ink-200/60 opacity-60'
                  }`}
                >
                  <div className="w-12 h-12 rounded-[5px] bg-[#FFFDF8] border border-ink-200/60 text-2xl flex items-center justify-center shadow-2xs shrink-0">
                    {ach.icon}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-ink-800">{ach.title}</h4>
                      {ach.unlocked && (
                        <span className="px-2 py-0.5 rounded-[4px] bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-bold">
                          Đã mở khóa
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-600 font-serif">{ach.desc}</p>
                    <p className="text-[10px] text-ink-400 font-mono pt-1">{ach.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 3. EDIT PROFILE MODAL DIALOG                              */}
      {/* ========================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FFFDF8] rounded-[6px] max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-ink-200/80 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-ink-200/80">
              <h3 className="font-display font-black text-base text-ink-800 flex items-center gap-2">
                <Edit className="w-4 h-4 text-clay-600" />
                <span>Chỉnh Sửa Hồ Sơ Cá Nhân</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-[5px] bg-[#F8F4EC] hover:bg-ink-200 text-ink-500 hover:text-ink-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Avatar Change Header inside modal */}
            <div className="flex items-center gap-4 p-3 bg-[#F8F4EC] rounded-[6px] border border-ink-200/80">
              <div className="relative shrink-0">
                <img
                  src={currentUser.avatar || profileData?.avatarUrl}
                  alt={profileName}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-[#FFFDF8] shadow-2xs bg-white"
                />
                {isUploadingAvatar && (
                  <div className="absolute inset-0 rounded-full bg-ink-950/60 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs text-ink-800">Ảnh đại diện du khách</p>
                <p className="text-[11px] text-ink-500 font-serif">Định dạng JPG, PNG hoặc WEBP</p>
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="px-3 py-1.5 rounded-[5px] bg-[#FFFDF8] hover:bg-clay-50 text-clay-700 text-xs font-bold border border-ink-200/80 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Camera className="w-3.5 h-3.5 text-clay-600" />
                <span>Đổi ảnh</span>
              </button>
            </div>

            <div className="space-y-4 text-xs font-bold text-ink-700">
              {/* Họ và tên */}
              <div>
                <label className="block mb-1 text-ink-800">Họ và tên <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Nhập họ và tên..."
                  className="w-full p-2.5 rounded-[5px] bg-[#FFFDF8] border border-ink-200/80 text-xs font-bold text-ink-900 outline-none focus:ring-1 focus:ring-clay-500 focus:border-clay-500 transition-all"
                />
              </div>

              {/* Tên người dùng Handle & Số điện thoại */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-ink-800">Biệt danh / Handle</label>
                  <input
                    type="text"
                    value={profileHandle}
                    onChange={(e) => setProfileHandle(e.target.value)}
                    placeholder="@wanderer"
                    className="w-full p-2.5 rounded-[5px] bg-[#FFFDF8] border border-ink-200/80 text-xs font-medium text-ink-900 outline-none focus:ring-1 focus:ring-clay-500 focus:border-clay-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-ink-800">Số điện thoại</label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="VD: 0912345678"
                    className="w-full p-2.5 rounded-[5px] bg-[#FFFDF8] border border-ink-200/80 text-xs font-medium text-ink-900 outline-none focus:ring-1 focus:ring-clay-500 focus:border-clay-500 transition-all"
                  />
                </div>
              </div>

              {/* Địa chỉ thường trú */}
              <div>
                <label className="block mb-1 text-ink-800">Địa chỉ thường trú / Thành phố</label>
                <div className="relative">
                  <input
                    type="text"
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                    placeholder="VD: Đà Nẵng, Việt Nam"
                    className="w-full p-2.5 pl-8 rounded-[5px] bg-[#FFFDF8] border border-ink-200/80 text-xs font-medium text-ink-900 outline-none focus:ring-1 focus:ring-clay-500 focus:border-clay-500 transition-all"
                  />
                  <MapPin className="w-4 h-4 text-ink-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Phong cách du lịch (Travel Style) */}
              <div>
                <label className="block mb-1.5 text-ink-800">Phong cách / Gu du lịch chính</label>
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
                      className={`px-3 py-1.5 rounded-[4px] text-[11px] font-bold transition-all cursor-pointer ${
                        profileTravelStyle === style
                          ? 'bg-clay-600 text-white shadow-2xs'
                          : 'bg-[#F8F4EC] hover:bg-ink-100 text-ink-700 border border-ink-200/60'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ngân sách du lịch ưa thích (Budget Preference) */}
              <div>
                <label className="block mb-1.5 text-ink-800">Mức ngân sách ưa thích</label>
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
                      className={`p-2.5 rounded-[5px] border text-center transition-all cursor-pointer ${
                        profileBudget === budget.id
                          ? 'border-clay-500 bg-clay-50 text-clay-900 font-black shadow-2xs'
                          : 'border-ink-200/80 bg-[#F8F4EC] hover:bg-ink-100 text-ink-700 font-medium'
                      }`}
                    >
                      <span className="block text-xs">{budget.label}</span>
                      <span className="block text-[10px] text-ink-500 font-serif font-normal">{budget.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tiểu sử (Bio) */}
              <div>
                <label className="block mb-1 text-ink-800">Tiểu sử cá nhân (Bio)</label>
                <textarea
                  rows={3}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  placeholder="Chia sẻ đôi nét về bạn, sở thích du lịch và những nơi bạn từng đi..."
                  className="w-full p-2.5 rounded-[5px] bg-[#FFFDF8] border border-ink-200/80 text-xs font-serif text-ink-800 outline-none focus:ring-1 focus:ring-clay-500 focus:border-clay-500 transition-all leading-relaxed"
                ></textarea>
              </div>

              {/* Bảo mật tài khoản */}
              <div className="pt-2 border-t border-ink-200/60">
                <div className="flex items-center justify-between p-3 bg-[#F8F4EC] rounded-[5px] border border-ink-200/80">
                  <div>
                    <p className="font-bold text-xs text-ink-800 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-clay-600" />
                      <span>Mật khẩu tài khoản</span>
                    </p>
                    <p className="text-[11px] text-ink-500 font-serif">Đổi mật khẩu định kỳ để bảo vệ tài khoản</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setIsPasswordModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-[5px] bg-[#FFFDF8] hover:bg-clay-50 text-clay-700 text-xs font-bold border border-ink-200/80 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>Đổi mật khẩu</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-ink-200/80">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSavingProfile}
                className="px-4 py-2 rounded-[5px] text-xs font-bold text-ink-600 hover:bg-[#F8F4EC] transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="bg-clay-600 hover:bg-clay-700 text-white px-5 py-2.5 rounded-[5px] text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
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

      {/* Change Password Modal (Đổi Mật Khẩu Tài Khoản) */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

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


