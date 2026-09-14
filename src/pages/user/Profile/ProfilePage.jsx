import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
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
  X
} from 'lucide-react';

export const ProfilePage = () => {
  const { currentUser, itineraries, posts, destinations, setIsAIGeneratorOpen, setUserTab } = useApp();

  const [activeTab, setActiveTab] = useState('itineraries'); // 'itineraries' | 'posts' | 'ai-dna' | 'saved' | 'badges'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileBio, setProfileBio] = useState(currentUser.bio);

  // Mock Achievements
  const achievements = [
    { title: 'Săn Mây Hà Giang Pro', icon: '☁️', desc: 'Đã hoàn thành 3 tour phượt vùng cao', date: 'Tháng 10, 2026', unlocked: true },
    { title: 'Chuyên Gia Điểm Check-in', icon: '📸', desc: 'Đã chia sẻ 15 bài viết chất lượng', date: 'Tháng 9, 2026', unlocked: true },
    { title: 'Nhà Sáng Tạo Tour AI', icon: '✨', desc: 'Tạo thành công 10+ lịch trình AI', date: 'Tháng 8, 2026', unlocked: true },
    { title: 'Khám Phá Di Sản Việt Nam', icon: '🏛️', desc: 'Ghé thăm 5 di sản thiên nhiên thế giới', date: 'Đang tiến hành (3/5)', unlocked: false }
  ];

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-6 sm:space-y-8">
      
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
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-6">
            
            {/* Avatar & Main Info */}
            <div className="flex items-end gap-4">
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-white shadow-xl bg-white"
                />
                <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold border-2 border-white" title="Tài khoản đã xác minh">
                  ✓
                </span>
              </div>

              <div className="space-y-1 pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900">
                    {profileName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    Wanderer Gold
                  </span>
                </div>

                <p className="text-xs text-slate-400 font-mono font-medium flex items-center gap-2">
                  <span>{currentUser.handle}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-600 font-sans">
                    <MapPin className="w-3.5 h-3.5 text-sky-600" /> Đà Nẵng, Việt Nam
                  </span>
                </p>
              </div>
            </div>

            {/* Action Controls */}
            <div className="flex items-center gap-2 self-stretch md:self-auto">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Edit className="w-4 h-4 text-slate-600" />
                <span>Chỉnh Sửa Hồ Sơ</span>
              </button>

              <button className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors" title="Chia sẻ hồ sơ">
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="p-2">
              <span className="text-slate-400 block text-[11px] font-semibold">Điểm Đến Đã Ghé</span>
              <span className="font-display font-extrabold text-xl text-slate-900 mt-0.5 block flex items-center gap-1">
                {currentUser.destinationsCount} <MapPin className="w-4 h-4 text-sky-600" />
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">24 / 63 Tỉnh thành</span>
            </div>

            <div className="p-2 border-l border-slate-200/80">
              <span className="text-slate-400 block text-[11px] font-semibold">Lịch Trình AI Đã Tạo</span>
              <span className="font-display font-extrabold text-xl text-sky-600 mt-0.5 block flex items-center gap-1">
                {itineraries.length} <Sparkles className="w-4 h-4 text-amber-500" />
              </span>
              <span className="text-[10px] text-slate-400">Đã đồng bộ GPS</span>
            </div>

            <div className="p-2 border-l border-slate-200/80">
              <span className="text-slate-400 block text-[11px] font-semibold">Bài Đăng Cộng Đồng</span>
              <span className="font-display font-extrabold text-xl text-emerald-600 mt-0.5 block flex items-center gap-1">
                {posts.length} <Globe className="w-4 h-4 text-emerald-600" />
              </span>
              <span className="text-[10px] text-slate-400">3.4k lượt thích</span>
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
            { id: 'itineraries', label: 'Lịch Trình AI Của Tôi', count: itineraries.length, icon: Route },
            { id: 'posts', label: 'Bài Viết & Review', count: posts.length, icon: Globe },
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
                    ? 'border-sky-600 text-sky-700 font-extrabold bg-white'
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Route className="w-5 h-5 text-sky-600" />
              <span>Danh Sách Lịch Trình Du Lịch AI</span>
            </h3>
            <button
              onClick={() => setIsAIGeneratorOpen(true)}
              className="sparkle-btn text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo Tour Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itineraries.map(itin => (
              <div
                key={itin.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold">
                      {itin.daysCount} Ngày • {itin.style}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">{itin.budgetTotal}</span>
                  </div>

                  <h4 className="font-bold text-base text-slate-900 group-hover:text-sky-600 transition-colors">
                    {itin.title}
                  </h4>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    Điểm đến chính: {itin.destination}. Phù hợp nhóm phượt hoặc nghỉ dưỡng gia đình.
                  </p>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Hoạt động nổi bật ngày 1
                    </span>
                    {itin.days[0]?.activities.slice(0, 2).map((act, i) => (
                      <div key={i} className="flex items-center gap-2 text-slate-700 font-medium">
                        <span className="font-mono text-sky-600 font-bold">{act.time}</span>
                        <span className="truncate">{act.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => setUserTab('itineraries')}
                    className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition-colors cursor-pointer text-center"
                  >
                    Xem Chi Tiết Lộ Trình
                  </button>
                  <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: COMMUNITY POSTS & REVIEWS */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-600" />
            <span>Bài Đăng & Review Đã Chia Sẻ</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map(post => (
              <article key={post.id} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">{post.author.name}</h4>
                      <p className="text-[11px] text-slate-400">{post.location} • {post.timeAgo}</p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{post.content}</p>

                {post.images && post.images.length > 0 && (
                  <div className="rounded-2xl overflow-hidden h-52">
                    <img src={post.images[0]} alt="Post image" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <span className="flex items-center gap-1 text-rose-500 font-bold">
                    <Heart className="w-4 h-4 fill-rose-500" /> {post.likes} Lượt thích
                  </span>
                  <span className="flex items-center gap-1 font-semibold">
                    <MessageCircle className="w-4 h-4 text-slate-400" /> {post.commentsCount} Bình luận
                  </span>
                </div>
              </article>
            ))}
          </div>
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

            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 space-y-1">
              <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block">Phương tiện di chuyển</span>
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
                onClick={() => setIsEditModalOpen(false)}
                className="sparkle-btn text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

