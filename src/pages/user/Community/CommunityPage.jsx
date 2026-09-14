import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MapPin,
  Sparkles,
  Award,
  TrendingUp,
  UserPlus,
  Users,
  Compass,
  Flame,
  Lightbulb,
  Route,
  Copy,
  Calendar,
  Bike,
  DollarSign,
  Gift,
  MoreHorizontal,
  Image as ImageIcon,
  Smile,
  PlusCircle,
  CheckCircle2,
  Mail,
  Send,
  Tag
} from 'lucide-react';

export const CommunityPage = () => {
  const { posts, addCommunityPost, toggleLikePost, currentUser, setIsAIGeneratorOpen } = useApp();

  const [activeTab, setActiveTab] = useState('Mới nhất');
  const [postContent, setPostContent] = useState('');
  const [postLocation, setPostLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle post submit
  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    addCommunityPost({
      content: postContent,
      location: postLocation || 'Việt Nam',
      images: imageUrl ? [imageUrl] : [
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
      ]
    });

    setPostContent('');
    setPostLocation('');
    setImageUrl('');
    setIsModalOpen(false);
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
      
      {/* 3-COLUMN DESKTOP GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: Profile Summary, Quick Nav, Hashtags (3 cols) */}
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
                <p className="text-xs text-slate-500 truncate">Phượt thủ tự do</p>
                <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  <Award className="w-3 h-3 text-amber-600" />
                  <span>Wanderer Gold</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-center border border-slate-100">
              <div>
                <span className="font-bold text-sm text-sky-600 block">14</span>
                <span className="text-[10px] text-slate-500 font-semibold">Chuyến đi</span>
              </div>
              <div>
                <span className="font-bold text-sm text-sky-600 block">1.2k</span>
                <span className="text-[10px] text-slate-500 font-semibold">Theo dõi</span>
              </div>
              <div>
                <span className="font-bold text-sm text-sky-600 block">3.4k</span>
                <span className="text-[10px] text-slate-500 font-semibold">Lượt thích</span>
              </div>
            </div>

            {/* Quick Navigation Links */}
            <nav className="space-y-1 text-xs font-semibold">
              <a href="#" className="flex items-center justify-between px-3 py-2 rounded-xl bg-sky-50 text-sky-700">
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-sky-600" />
                  <span>Dành cho bạn</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-sky-600"></span>
              </a>
              <a href="#" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                <Users className="w-4 h-4 text-slate-400" />
                <span>Đang theo dõi</span>
              </a>
              <a href="#" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Chuyến đi nổi bật</span>
              </a>
              <a href="#" className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                <div className="flex items-center gap-2.5">
                  <UserPlus className="w-4 h-4 text-slate-400" />
                  <span>Tìm bạn đồng hành</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-orange-100 text-orange-600 font-extrabold">HOT</span>
              </a>
              <a href="#" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                <Bookmark className="w-4 h-4 text-slate-400" />
                <span>Bài viết đã lưu</span>
              </a>
            </nav>
          </div>

          {/* Trending Hashtags Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-sky-600" />
                <span>Xu Hướng Thảo Luận</span>
              </h4>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { tag: '#DaNangReview', count: '2.8k' },
                { tag: '#SanMayDaLat', count: '1.9k' },
                { tag: '#HaGiangMuaHoa', count: '1.4k' },
                { tag: '#PhuQuocGiaRe', count: '980' },
                { tag: '#CheckInVietnam', count: '5.1k' }
              ].map((item, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-sky-100 hover:text-sky-700 text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <span>{item.tag}</span>
                  <span className="text-[10px] text-slate-400">{item.count}</span>
                </a>
              ))}
            </div>
          </div>

          {/* AI Travel Tip of the Day */}
          <div className="bg-gradient-to-br from-sky-50 via-white to-amber-50 p-5 rounded-2xl border border-sky-100 shadow-sm space-y-2">
            <div className="flex items-center gap-1.5 text-sky-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>WanderAI Insight</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hội An đón hoàng hôn đẹp nhất từ 17:15 - 17:45. Gợi ý bạn ghé các quán cà phê tầng thượng đường Trần Phú để có góc chụp rực rỡ nhất!
            </p>
          </div>

        </aside>

        {/* ========================================================= */}
        {/* CENTER COLUMN: Main Social Feed (6 cols) */}
        {/* ========================================================= */}
        <main className="col-span-1 lg:col-span-6 space-y-5">
          
          {/* Top Create Post Box */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <img src={currentUser.avatar} alt="Avatar" className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full text-left bg-slate-50 hover:bg-slate-100 text-slate-400 px-4 py-3 rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center justify-between border border-slate-200/60"
              >
                <span>Chia sẻ chuyến đi hoặc kinh nghiệm du lịch của bạn...</span>
                <Sparkles className="w-4 h-4 text-sky-500" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-100 text-xs font-medium text-slate-600">
              <button onClick={() => setIsModalOpen(true)} className="flex-1 flex items-center justify-center gap-1.5 py-2 hover:bg-slate-50 rounded-xl">
                <ImageIcon className="w-4 h-4 text-sky-600" />
                <span className="hidden sm:inline">Ảnh/Video</span>
              </button>
              <button onClick={() => setIsModalOpen(true)} className="flex-1 flex items-center justify-center gap-1.5 py-2 hover:bg-slate-50 rounded-xl">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span className="hidden sm:inline">Gắn địa điểm</span>
              </button>
              <button onClick={() => setIsAIGeneratorOpen(true)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-xl font-semibold">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">Đính kèm Lịch trình</span>
              </button>
              <button onClick={() => setIsModalOpen(true)} className="flex-1 flex items-center justify-center gap-1.5 py-2 hover:bg-slate-50 rounded-xl">
                <Smile className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline">Cảm xúc</span>
              </button>
            </div>
          </div>

          {/* Feed Filter Tabs */}
          <div className="flex items-center justify-between overflow-x-auto gap-2 pb-1 no-scrollbar">
            <div className="flex items-center gap-2">
              {['Mới nhất', 'Xu hướng (Hot)', 'Được AI tuyển chọn', 'Tìm bạn đồng hành'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    activeTab === tab
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* STITCH POST 1: Review Chi Tiết Đà Nẵng - Hội An */}
          <article className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
                    alt="Minh Anh"
                    className="w-11 h-11 rounded-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[8px]">✓</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">Minh Anh</h4>
                    <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-bold">
                      Travel Blogger
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <span>2 giờ trước</span>
                    <span>•</span>
                    <MapPin className="w-3 h-3 text-sky-600" />
                    <span className="text-slate-600 font-medium">Bà Nà Hills & Phố Cổ Hội An</span>
                  </p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Review chi tiết chuyến đi Đà Nẵng - Hội An 3N2Đ săn vé rẻ và quán cafe view triệu đô cực chill! Nhờ trợ lý AI WanderAI tối ưu cung đường mà nhóm mình tiết kiệm được hơn 1.5 triệu tiền taxi. Lịch trình chi tiết mình ghim bên dưới nhé 👇✨
            </p>

            {/* Rich 3-Photo Grid */}
            <div className="grid grid-cols-12 gap-2 rounded-2xl overflow-hidden h-72">
              <div className="col-span-8 h-full">
                <img
                  src="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80"
                  alt="Golden Bridge"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="col-span-4 grid grid-rows-2 gap-2 h-full">
                <img
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
                  alt="Hoi An Lanterns"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="relative h-full">
                  <img
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
                    alt="Beach Sunset"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold">
                    +4 ảnh
                  </span>
                </div>
              </div>
            </div>

            {/* Attached AI Itinerary Snippet Card */}
            <div className="bg-gradient-to-r from-sky-50 to-teal-50 p-4 rounded-2xl border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl ocean-gradient flex items-center justify-center text-white flex-shrink-0">
                  <Route className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold uppercase flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      Lịch trình AI đã duyệt
                    </span>
                    <span className="text-xs font-bold text-sky-700">3N2Đ</span>
                  </div>
                  <h5 className="font-bold text-sm text-slate-900 mt-1">Đà Nẵng - Hội An Tối Ưu Tiết Kiệm</h5>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="font-bold text-emerald-600">3.850.000đ/người</span>
                    <span>•</span>
                    <span>11 địa điểm</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsAIGeneratorOpen(true)}
                className="sparkle-btn text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-center"
              >
                <Copy className="w-4 h-4" />
                <span>Sao chép Tour</span>
              </button>
            </div>

            {/* Interaction Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1.5 font-bold text-rose-500">
                  <Heart className="w-4 h-4 fill-rose-500" />
                  <span>342</span>
                </button>
                <button className="flex items-center gap-1.5 font-semibold hover:text-slate-900">
                  <MessageCircle className="w-4 h-4 text-slate-400" />
                  <span>48</span>
                </button>
                <button className="flex items-center gap-1.5 font-semibold hover:text-slate-900">
                  <Share2 className="w-4 h-4 text-slate-400" />
                  <span>19</span>
                </button>
              </div>
              <button className="text-slate-400 hover:text-sky-600">
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </article>

          {/* STITCH POST 2: Tìm Bạn Đồng Hành Hà Giang */}
          <article className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                  alt="Tuấn Kiệt"
                  className="w-11 h-11 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">Tuấn Kiệt</h4>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                      <UserPlus className="w-3 h-3 text-amber-600" />
                      Tìm bạn đồng hành (2/4 người)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <span>4 giờ trước</span>
                    <span>•</span>
                    <MapPin className="w-3 h-3 text-sky-600" />
                    <span className="text-slate-600 font-medium">Hà Giang - Đèo Mã Pí Lèng</span>
                  </p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Tìm 2 bạn ghép đoàn phượt xe máy Hà Giang săn hoa tam giác mạch cuối tuần này (Thứ 6 - Chủ Nhật). Tụi mình đã có lịch trình AI chuẩn từng trạm dừng chân, homestay view sông Nho Quế siêu đẹp. Chi phí share đều tầm 2.2tr/người. Ai tham gia inbox mình nhé! 🏍️🏔️
            </p>

            {/* 2-Photos Mosaic */}
            <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden h-60">
              <img
                src="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80"
                alt="Ma Pi Leng Pass"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
                alt="Nho Que River"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Trip Specs Tag Bar */}
            <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-sky-600" /> Thứ 6 - CN tuần này
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Bike className="w-4 h-4 text-sky-600" /> Phượt xe máy
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-emerald-600" /> ~2.200.000đ / người
              </span>
            </div>

            {/* Interaction Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1.5 font-bold hover:text-rose-500">
                  <Heart className="w-4 h-4 text-slate-400" />
                  <span>128</span>
                </button>
                <button className="flex items-center gap-1.5 font-semibold hover:text-slate-900">
                  <MessageCircle className="w-4 h-4 text-slate-400" />
                  <span>35</span>
                </button>
              </div>
              <button className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <Mail className="w-4 h-4 text-sky-400" />
                <span>Nhắn tin tham gia</span>
              </button>
            </div>
          </article>

          {/* DYNAMIC POSTS FROM STATE */}
          {posts.slice(2).map(post => (
            <article key={post.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">{post.author.name}</h4>
                    <p className="text-[11px] text-slate-400">{post.location} • {post.timeAgo}</p>
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{post.content}</p>

              {post.images && post.images.length > 0 && (
                <div className="rounded-2xl overflow-hidden max-h-[350px]">
                  <img src={post.images[0]} alt="Checkin" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600">
                <button
                  onClick={() => toggleLikePost(post.id)}
                  className={`flex items-center gap-1.5 font-bold ${post.isLiked ? 'text-rose-500' : 'hover:text-slate-900'}`}
                >
                  <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-500' : ''}`} />
                  <span>{post.likes} Yêu thích</span>
                </button>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4 text-slate-400" />
                  <span>{post.commentsCount} Bình luận</span>
                </div>
              </div>
            </article>
          ))}

        </main>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Top Check-in, Top Members, Challenge (3 cols) */}
        {/* ========================================================= */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col gap-5 sticky top-20">
          
          {/* WIDGET 1: Top Check-in Tuần này */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-sky-600" />
                <span>Top Check-in Tuần</span>
              </h4>
              <span className="text-[11px] font-bold text-sky-600 cursor-pointer">Tất cả</span>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              {[
                { rank: 1, name: 'Bà Nà Hills', province: 'Đà Nẵng', count: '3.4k check-in', rankBg: 'bg-sky-600 text-white' },
                { rank: 2, name: 'Phố cổ Hội An', province: 'Quảng Nam', count: '2.8k check-in', rankBg: 'bg-sky-100 text-sky-700' },
                { rank: 3, name: 'Tràng An', province: 'Ninh Bình', count: '2.1k check-in', rankBg: 'bg-sky-100 text-sky-700' },
                { rank: 4, name: 'Đỉnh Fansipan', province: 'Sa Pa, Lào Cai', count: '1.9k check-in', rankBg: 'bg-slate-100 text-slate-600' }
              ].map(item => (
                <div key={item.rank} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-6 h-6 rounded-full ${item.rankBg} font-bold text-[11px] flex items-center justify-center`}>
                      {item.rank}
                    </span>
                    <div>
                      <h5 className="font-bold text-slate-900 hover:text-sky-600 transition-colors cursor-pointer">
                        {item.name}
                      </h5>
                      <span className="text-[10px] text-slate-400">{item.province}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-sky-700">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* WIDGET 2: Top Thành Viên Năng Nổ */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Top Thành Viên</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-semibold">Tuần này</span>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              {[
                { name: 'Lan Hương', role: 'Top 1 Reviewer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', color: 'text-amber-600' },
                { name: 'Đức Long', role: 'Nhiếp ảnh gia', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80', color: 'text-sky-600' },
                { name: 'Mai Chi', role: 'Chuyên gia ẩm thực', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', color: 'text-teal-600' }
              ].map((mem, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={mem.avatar} alt={mem.name} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <h5 className="font-bold text-slate-900">{mem.name}</h5>
                      <span className={`text-[10px] font-bold ${mem.color}`}>{mem.role}</span>
                    </div>
                  </div>
                  <button className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white text-[11px] font-bold transition-all">
                    + Theo dõi
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* WIDGET 3: Thử Thách Du Lịch Tháng 11 Banner */}
          <div className="relative overflow-hidden rounded-2xl ocean-gradient p-5 text-white shadow-lg space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 font-extrabold text-[10px] flex items-center gap-1">
                <Gift className="w-3 h-3" />
                Thử thách tháng 11
              </span>
              <span className="text-[10px] text-sky-200">Còn 12 ngày</span>
            </div>

            <div>
              <h4 className="font-bold text-sm text-white">Check-in 3 Di sản miền Trung</h4>
              <p className="text-[11px] text-sky-100 mt-1 leading-relaxed">
                Hoàn thành lộ trình Huế - Hội An - Mỹ Sơn để nhận huy hiệu độc quyền & quà tặng!
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-amber-300">Voucher 200.000đ</span>
              <button className="px-3 py-1.5 rounded-full bg-white text-slate-900 text-xs font-bold hover:bg-sky-50 transition-colors shadow-sm">
                Tham gia
              </button>
            </div>
          </div>

        </aside>

      </div>

      {/* CREATE POST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Đăng Bài Chia Sẻ Mới</h3>
            
            <textarea
              rows={4}
              placeholder="Chia sẻ khoảnh khắc, địa điểm ăn uống ngon hoặc kinh nghiệm du lịch của bạn..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-sky-500"
            ></textarea>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Địa Điểm Check-in</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đà Nẵng, Phú Quốc..."
                  value={postLocation}
                  onChange={(e) => setPostLocation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">URL Hình Ảnh</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                onClick={handleCreatePost}
                className="sparkle-btn text-white px-5 py-2 rounded-xl text-xs font-bold"
              >
                Đăng Bài
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
