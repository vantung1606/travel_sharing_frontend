import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { userApi } from '../../../services/api';
import { FollowListModal } from '../../../components/community/FollowListModal';
import { PostDetailModal } from '../../../components/community/PostDetailModal';
import { ItineraryDetailModal } from '../../../components/itinerary/ItineraryDetailModal';
import { useToast } from '../../../components/common/Toast';
import {
  User,
  MapPin,
  Calendar,
  Heart,
  Award,
  Sparkles,
  Settings,
  Share2,
  Bookmark,
  MessageCircle,
  Route,
  ShieldCheck,
  Edit,
  Camera,
  CheckCircle2,
  Compass,
  Star,
  Download,
  PlusCircle,
  Zap,
  Globe,
  Tag,
  Gift,
  MoreHorizontal,
  X,
  Users,
  UserCheck,
  Loader2,
  Copy,
  Eye,
  ArrowRight,
  Lock,
  DollarSign
} from 'lucide-react';

export const ProfilePage = () => {
  const { currentUser, updateCurrentUser, itineraries, posts, destinations, setIsAIGeneratorOpen, setUserTab, setItineraries } = useApp();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('itineraries'); // 'itineraries' | 'posts' | 'ai-dna' | 'saved' | 'badges'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileBio, setProfileBio] = useState(currentUser?.bio || '');

  // Keep form fields synced with current active user
  useEffect(() => {
    if (currentUser?.name) setProfileName(currentUser.name);
    if (currentUser?.bio !== undefined) setProfileBio(currentUser.bio || '');
  }, [currentUser?.name, currentUser?.bio]);

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

  const myUserId = currentUser.id || 1;

  const loadFullProfile = async () => {
    try {
      setLoadingProfile(true);
      const data = await userApi.getProfile(myUserId, currentUser?.email);
      if (data) {
        setProfileData(data);
        if (data.fullName) setProfileName(data.fullName);
        if (data.bio) setProfileBio(data.bio);
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

  // Derive real database lists with fallback to initial data
  const displayPosts = profileData?.posts && profileData.posts.length > 0 ? profileData.posts : posts;
  const displayItineraries = profileData?.itineraries && profileData.itineraries.length > 0 ? profileData.itineraries : itineraries;

  // Mock Achievements
  const achievements = [
    { title: 'Săn Mây Hà Giang Pro', icon: '☁️', desc: 'Đã hoàn thành 3 tour phượt vùng cao', date: 'Tháng 10, 2026', unlocked: true },
    { title: 'Chuyên Gia Điểm Check-in', icon: '📸', desc: 'Đã chia sẻ 15 bài viết chất lượng', date: 'Tháng 9, 2026', unlocked: true },
    { title: 'Nhà Sáng Tạo Tour AI', icon: '✨', desc: 'Tạo thành công 10+ lịch trình AI', date: 'Tháng 8, 2026', unlocked: true },
    { title: 'Khám Phá Di Sản Việt Nam', icon: '🏛️', desc: 'Ghé thăm 5 di sản thiên nhiên thế giới', date: 'Đang tiến hành (3/5)', unlocked: false }
  ];

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 space-y-6 sm:space-y-8">
      
      {/* ========================================================= */}
      {/* 1. HERO PROFILE BANNER & USER HEADER CARD                 */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden relative">
        
        {/* Cover Photo */}
        <div
          className="h-36 sm:h-52 bg-cover bg-center relative"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent"></div>
          <button className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 hover:bg-slate-900/80 transition-colors">
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Đổi ảnh bìa</span>
          </button>
        </div>

        {/* Profile Info Bar */}
        <div className="p-6 sm:p-8 pt-0 relative">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-5 mb-6 pt-2 sm:pt-3">
            
            {/* Avatar & Main Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              {/* Avatar: only avatar is pulled up to overlap cover photo */}
              <div className="relative -mt-16 sm:-mt-20 shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover ring-4 ring-white shadow-xl bg-white"
                />
                <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm" title="Tài khoản đã xác minh">
                  ✓
                </span>
              </div>

              {/* User Details: starts comfortably on white background, 100% clear of cover photo */}
              <div className="space-y-1.5 pb-1 pt-1 sm:pt-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight leading-tight">
                    {profileName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold flex items-center gap-1 border border-amber-200/80 shadow-xs">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    Wanderer Gold
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-500 font-mono font-medium flex items-center gap-2">
                  <span className="text-slate-700 font-semibold">{currentUser.handle}</span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1 text-slate-600 font-sans">
                    <MapPin className="w-3.5 h-3.5 text-sky-600" /> Đà Nẵng, Việt Nam
                  </span>
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

            {/* Action Controls */}
            <div className="flex items-center gap-2 self-stretch lg:self-end pb-1">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Edit className="w-4 h-4 text-slate-600" />
                <span>Chỉnh Sửa Hồ Sơ</span>
              </button>

              <button className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer shadow-xs" title="Chia sẻ hồ sơ">
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsAIGeneratorOpen(true)}
                className="sparkle-btn text-white px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span className="hidden sm:inline">Tạo Tour AI</span>
              </button>
            </div>

          </div>

          {/* Bio Text */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl mb-6">
            {profileBio}
          </p>

          {/* Key Travel Metrics Bento Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="p-2">
              <span className="text-slate-400 block text-[11px] font-semibold">Điểm Đến Đã Ghé</span>
              <span className="font-display font-extrabold text-xl text-slate-900 mt-0.5 block flex items-center gap-1">
                {currentUser.destinationsCount} <MapPin className="w-4 h-4 text-sky-600" />
              </span>
              <span className="text-[10px] text-sky-600 font-semibold">24 / 63 Tỉnh thành</span>
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

            <div className="p-2 border-l border-slate-200/80">
              <span className="text-slate-400 block text-[11px] font-semibold">Cấp Độ Huy Hiệu</span>
              <span className="font-display font-extrabold text-xl text-amber-600 mt-0.5 block flex items-center gap-1">
                Gold Explorer <Award className="w-4 h-4 text-amber-500" />
              </span>
              <span className="text-[10px] text-amber-700 font-semibold">Top 5% thành viên</span>
            </div>
          </div>

        </div>

        {/* PROFILE TAB NAVIGATION */}
        <div className="flex items-center gap-2 px-6 overflow-x-auto border-t border-slate-200/80 bg-slate-50/50 no-scrollbar">
          {[
            { id: 'itineraries', label: 'Lịch Trình AI Của Tôi', count: displayItineraries.length, icon: Route },
            { id: 'posts', label: 'Bài Viết & Review', count: displayPosts.length, icon: Globe },
            { id: 'ai-dna', label: 'Gu Du Lịch & AI DNA', badge: 'WanderAI', icon: Sparkles },
            { id: 'saved', label: 'Địa Điểm Đã Lưu', count: destinations.length, icon: Bookmark },
            { id: 'badges', label: 'Huy Hiệu & Thành Tích', count: achievements.length, icon: Award }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'border-sky-600 text-sky-800 font-extrabold bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    active ? 'bg-sky-100 text-sky-800 font-extrabold' : 'bg-slate-200/70 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-800">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl ocean-gradient text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Cấu Hình Gu Du Lịch & AI DNA</h3>
              <p className="text-xs text-slate-500">Trợ lý WanderAI tự động ghi nhớ khẩu vị du lịch của bạn để tối ưu gợi ý chuyến đi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-1">
              <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">Phong cách ưu tiên</span>
              <span className="font-bold text-slate-900 text-sm block">🏖️ Nghỉ dưỡng & Biển</span>
              <p className="text-[11px] text-slate-500">Thích đón bình minh, chụp ảnh check-in bãi biển đẹp</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-1">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Hạng mức khách sạn</span>
              <span className="font-bold text-slate-900 text-sm block">🏡 Homestay & 3-4 Sao</span>
              <p className="text-[11px] text-slate-500">Ưu tiên view đẹp mộc mạc hoặc resort 4 sao tiện nghi</p>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-1">
              <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">Phương tiện di chuyển</span>
              <span className="font-bold text-slate-900 text-sm block">🏍️ Xe máy & Taxi công nghệ</span>
              <p className="text-[11px] text-slate-500">Linh hoạt đường ngõ và đèo núi dốc</p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1">
              <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">Ẩm thực yêu thích</span>
              <span className="font-bold text-slate-900 text-sm block">🍜 Quán bản địa truyền thống</span>
              <p className="text-[11px] text-slate-500">Trải nghiệm đặc sản chợ đêm & quán ăn lâu đời</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Ghi chú riêng của bạn dành cho AI Engine</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
              "Thường đi du lịch nhóm 4-6 người. Muốn dậy sớm từ 5:30 để đón bình minh. Thích các quán cafe view thung lũng yên tĩnh."
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: SAVED DESTINATIONS */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-sky-600" />
            <span>Địa Điểm Yêu Thích Đã Lưu</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map(dest => (
              <div key={dest.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm space-y-3 p-3 group">
                <div className="h-40 rounded-2xl overflow-hidden relative">
                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-400" /> {dest.rating}
                  </span>
                </div>
                <div className="space-y-1 px-1">
                  <h4 className="font-bold text-sm text-slate-900 truncate">{dest.name}</h4>
                  <p className="text-xs text-slate-500">{dest.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ACHIEVEMENTS & BADGES */}
      {activeTab === 'badges' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Huy Hiệu & Thành Tích Du Lịch</span>
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
      )}

      {/* ========================================================= */}
      {/* 3. EDIT PROFILE MODAL DIALOG                              */}
      {/* ========================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Edit className="w-4 h-4 text-sky-600" />
                <span>Chỉnh Sửa Hồ Sơ Cá Nhân</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block mb-1">Tiểu sử (Bio)</label>
                <textarea
                  rows={3}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-sky-500"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (!profileName.trim()) {
                    toast.error('Họ và tên không được để trống!');
                    return;
                  }
                  updateCurrentUser({
                    name: profileName.trim(),
                    fullName: profileName.trim(),
                    bio: profileBio.trim()
                  });
                  setProfileData(prev => prev ? { ...prev, fullName: profileName.trim(), bio: profileBio.trim() } : prev);
                  setIsEditModalOpen(false);
                  toast.success('Đã cập nhật thông tin hồ sơ của bạn thành công! 🎉');
                }}
                className="sparkle-btn text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
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

    </div>
  );
};


