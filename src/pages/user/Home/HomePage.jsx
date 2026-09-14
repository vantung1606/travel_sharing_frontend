import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import mascotImg from '../../../assets/design/bannerlogo.png';
import {
  Sparkles,
  MapPin,
  Star,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Heart,
  Users,
  MessageCircle,
  PlayCircle,
  Compass,
  DollarSign,
  Layers,
  Search,
  Zap,
  TrendingUp,
  BrainCircuit,
  PieChart,
  Navigation,
  Calculator,
  SlidersHorizontal,
  CheckCircle2,
  Bookmark,
  Bot,
  Check
} from 'lucide-react';

export const HomePage = () => {
  const { destinations, posts, itineraries, setIsAIGeneratorOpen, setUserTab, toggleLikePost, generateAITrip } = useApp();

  const [selectedRegion, setSelectedRegion] = useState('Tất cả');
  const [filterDest, setFilterDest] = useState('Đà Nẵng & Hội An');
  const [filterBudget, setFilterBudget] = useState('3.500.000đ - 5.000.000đ');
  const [filterStyle, setFilterStyle] = useState('Biển & Ẩm thực');
  const [filterDays, setFilterDays] = useState('3');

  const regions = ['Tất cả', 'Miền Bắc', 'Miền Trung', 'Miền Nam', 'Biển đảo', 'Vùng cao'];

  const handleQuickSearch = (e) => {
    e.preventDefault();
    generateAITrip({
      destination: filterDest,
      daysCount: filterDays,
      budget: filterBudget,
      style: filterStyle
    });
  };

  return (
    <div className="space-y-12 pb-16">
      
      {/* 1. ATMOSPHERIC HERO SECTION WITH 3D MASCOT SPOTLIGHT */}
      <section className="relative w-full overflow-hidden -mt-6 pt-16 pb-28 md:pb-36 bg-slate-950 text-white">
        
        {/* Background Image with Dark Gradient Scrim */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-luminosity"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1800&q=80')`
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/70 to-slate-900"></div>

        {/* Ambient Glowing AI Light Effect */}
        <div className="absolute top-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-sky-500/20 blur-3xl pointer-events-none animate-pulse-glow"></div>
        <div className="absolute top-1/3 left-1/4 w-[380px] h-[380px] rounded-full bg-orange-500/15 blur-3xl pointer-events-none"></div>

        <div className="relative w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* LEFT COLUMN: Headline & CTA Actions (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
              
              {/* Smart Badge Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm text-xs font-bold text-sky-300">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
                <span>Trợ Lý 3D WanderAI • Generative AI thế hệ mới</span>
              </div>

              {/* Hero Headline */}
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-tight">
                Kết nối & Lập lịch trình Du lịch Thông minh cùng{' '}
                <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                  AI Wander
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                Trải nghiệm du lịch dễ dàng hơn với trợ lý AI phân bổ lịch trình từng ngày, ước tính chi phí thực tế và kết nối cộng đồng xê dịch hàng đầu Việt Nam.
              </p>

              {/* CTA Action Group */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-2">
                <button
                  onClick={() => setIsAIGeneratorOpen(true)}
                  className="w-full sm:w-auto sparkle-btn text-white px-8 py-4 rounded-full text-sm font-bold flex items-center justify-center gap-2.5 shadow-2xl cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-amber-200" />
                  <span>Tạo lịch trình AI ngay</span>
                </button>
                <button
                  onClick={() => setUserTab('explore')}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <PlayCircle className="w-5 h-5 text-sky-400" />
                  <span>Khám phá địa điểm nổi bật</span>
                </button>
              </div>

              {/* Trust Metrics & Social Proof Pill */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 px-6 py-4 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl text-left w-full max-w-2xl pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-base text-white leading-none">50,000+</p>
                    <p className="text-xs text-slate-400 mt-1">Lịch trình đã tạo</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:border-l sm:border-slate-800 sm:pl-6">
                  <div className="w-10 h-10 rounded-full bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-base text-white leading-none">12,000+</p>
                    <p className="text-xs text-slate-400 mt-1">Điểm đến Việt Nam</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:border-l sm:border-slate-800 sm:pl-6">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Star className="w-5 h-5 fill-amber-400" />
                  </div>
                  <div>
                    <p className="font-bold text-base text-white leading-none">4.9 / 5.0</p>
                    <p className="text-xs text-slate-400 mt-1">Đánh giá hài lòng</p>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: 3D MASCOT ARTWORK SPOTLIGHT (5 Cols) */}
            <div className="lg:col-span-5 relative flex items-center justify-center mt-6 lg:mt-0">
              
              {/* Glowing Aura Backlight Disk */}
              <div className="absolute w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full bg-gradient-to-tr from-sky-500/30 via-teal-400/20 to-orange-500/30 blur-2xl animate-pulse-glow pointer-events-none"></div>

              {/* Decorative 3D Ring Circle */}
              <div className="absolute w-[360px] h-[360px] sm:w-[460px] sm:h-[460px] rounded-full border border-sky-500/20 border-dashed animate-spin-slow pointer-events-none"></div>

              {/* Main 3D Mascot Character Container */}
              <div className="relative z-10 flex flex-col items-center">
                
                {/* 3D Glassmorphic AI Chat Speech Bubble */}
                <div className="mb-2 px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/25 shadow-2xl text-xs text-white max-w-xs animate-bounce space-y-1 relative">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="font-bold text-sky-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Trợ Lý AI Nam
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-100 leading-snug">
                    "Xin chào! Tôi là Nam ✌️ Bạn muốn lập tour đi biển hay săn mây hôm nay?"
                  </p>
                  {/* Speech bubble pointer tip */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white/20"></div>
                </div>

                {/* 3D Mascot Image with Drop Shadow & Smooth Float */}
                <div className="relative group cursor-pointer">
                  <img
                    src={mascotImg}
                    alt="AI Wander 3D Mascot Guide Nam"
                    className="h-[360px] sm:h-[440px] lg:h-[480px] w-auto object-contain animate-float-3d mascot-3d-shadow group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Floating Bento Badge 1: AI Assistant Status */}
                  <div className="absolute top-12 -left-6 sm:-left-10 px-3.5 py-2 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-700/80 shadow-2xl text-xs text-white flex items-center gap-2 animate-pulse">
                    <div className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold block text-[11px] text-sky-300">WanderAI v3.5</span>
                      <span className="text-[9px] text-slate-400">Trí tuệ nhân tạo 2026</span>
                    </div>
                  </div>

                  {/* Floating Bento Badge 2: Quick Check-in Stats */}
                  <div className="absolute bottom-8 -right-4 sm:-right-8 px-4 py-2.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-700/80 shadow-2xl text-xs text-white flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                      <Sparkles className="w-4.5 h-4.5 text-amber-400" />
                    </div>
                    <div>
                      <span className="font-extrabold block text-xs text-amber-300">100% Tối ưu tour</span>
                      <span className="text-[10px] text-slate-400">Tiết kiệm 20% chi phí</span>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>

        {/* Subtle Bottom Vignette Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-b from-transparent via-slate-950/40 to-slate-950/90 pointer-events-none z-[2]"></div>
      </section>

      {/* 2. FLOATING QUICK SEARCH & FILTER CARD (MATCHING STITCH M01) */}
      <section className="relative z-20 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 -mt-12 md:-mt-16">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-200/80 space-y-6">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 animate-ping"></span>
              <h2 className="font-bold text-sm sm:text-base text-slate-900">
                Bộ lọc Lập lịch trình Tức thì
              </h2>
            </div>
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
              Tính năng AI hỗ trợ
            </span>
          </div>

          <form onSubmit={handleQuickSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Field 1: Điểm đến */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-sky-500 transition-colors">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
                <MapPin className="w-4 h-4 text-sky-600" />
                <span>Điểm đến</span>
              </div>
              <select
                value={filterDest}
                onChange={(e) => setFilterDest(e.target.value)}
                className="w-full bg-transparent font-bold text-xs sm:text-sm text-slate-900 outline-none cursor-pointer"
              >
                <option value="Đà Nẵng & Hội An">Đà Nẵng & Hội An</option>
                <option value="Đảo Ngọc Phú Quốc">Đảo Ngọc Phú Quốc</option>
                <option value="Hà Giang Phượt Loop">Hà Giang Phượt Loop</option>
                <option value="Sapa Sương Mờ">Sa Pa & Fansipan</option>
                <option value="Đà Lạt Ngàn Hoa">Đà Lạt Ngàn Hoa</option>
              </select>
            </div>

            {/* Field 2: Ngân sách */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-sky-500 transition-colors">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Ngân sách dự kiến</span>
              </div>
              <select
                value={filterBudget}
                onChange={(e) => setFilterBudget(e.target.value)}
                className="w-full bg-transparent font-bold text-xs sm:text-sm text-slate-900 outline-none cursor-pointer"
              >
                <option value="2.000.000đ - 3.500.000đ">Dưới 3.5 triệu VNĐ</option>
                <option value="3.500.000đ - 5.000.000đ">3.5 - 5 triệu VNĐ</option>
                <option value="5.000.000đ - 10.000.000đ">5 - 10 triệu VNĐ</option>
              </select>
            </div>

            {/* Field 3: Thể loại du lịch */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-sky-500 transition-colors">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
                <Compass className="w-4 h-4 text-purple-600" />
                <span>Thể loại du lịch</span>
              </div>
              <select
                value={filterStyle}
                onChange={(e) => setFilterStyle(e.target.value)}
                className="w-full bg-transparent font-bold text-xs sm:text-sm text-slate-900 outline-none cursor-pointer"
              >
                <option value="Biển & Ẩm thực">Nghỉ dưỡng & Biển</option>
                <option value="Phượt & Sinh thái">Phượt & Mạo hiểm</option>
                <option value="Văn hoá & Di tích">Văn hóa & Di sản</option>
              </select>
            </div>

            {/* Field 4: Số ngày đi */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-sky-500 transition-colors">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
                <Calendar className="w-4 h-4 text-sky-600" />
                <span>Thời gian đi</span>
              </div>
              <select
                value={filterDays}
                onChange={(e) => setFilterDays(e.target.value)}
                className="w-full bg-transparent font-bold text-xs sm:text-sm text-slate-900 outline-none cursor-pointer"
              >
                <option value="2">2 Ngày 1 Đêm</option>
                <option value="3">3 Ngày 2 Đêm</option>
                <option value="4">4 Ngày 3 Đêm</option>
                <option value="5">5 Ngày 4 Đêm</option>
              </select>
            </div>

            {/* Submit Trigger */}
            <div className="sm:col-span-2 lg:col-span-4 pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Khởi tạo lộ trình tùy chỉnh chỉ mất ~ 3 giây với AI realtime</span>
              </p>

              <button
                type="submit"
                className="w-full sm:w-auto sparkle-btn text-white px-8 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Tìm kiếm & Gợi ý AI</span>
              </button>
            </div>

          </form>

        </div>
      </section>

      {/* 3. TRENDING TRAVEL DESTINATIONS */}
      <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 space-y-6 pt-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Điểm hẹn cuốn hút</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Địa điểm thịnh hành tuần này
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Lựa chọn hàng đầu được hàng chục nghìn xê dịch thủ đánh giá cao nhất trên hệ thống
            </p>
          </div>

          <button
            onClick={() => setUserTab('explore')}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 group self-start md:self-auto"
          >
            <span>Xem tất cả 1,200+ địa điểm</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Region Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {regions.map(r => (
            <button
              key={r}
              onClick={() => setSelectedRegion(r)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedRegion === r
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Destination Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              id: 'ba-na',
              name: 'Bà Nà Hills & Cầu Vàng',
              province: 'Đà Nẵng',
              tag: 'Bán chạy nhất',
              tagBg: 'bg-orange-500 text-white',
              rating: 4.9,
              reviews: '1,420 đánh giá',
              desc: 'Kỳ quan kiến trúc đẳng cấp thế giới cùng làng Pháp cổ điển và khí hậu bốn mùa độc đáo.',
              price: '850.000₫',
              img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80'
            },
            {
              id: 'fansipan',
              name: 'Đỉnh Fansipan & Bản Cát Cát',
              province: 'Sa Pa, Lào Cai',
              tag: 'Săn mây đỉnh cao',
              tagBg: 'bg-sky-600 text-white',
              rating: 4.8,
              reviews: '980 đánh giá',
              desc: 'Chinh phục Nóc nhà Đông Dương, trải nghiệm hệ thống cáp treo kỷ lục và văn hóa H’Mông.',
              price: '750.000₫',
              img: 'https://images.unsplash.com/photo-1570784409178-be94786231ba?auto=format&fit=crop&w=800&q=80'
            },
            {
              id: 'trang-an',
              name: 'Quần thể Danh thắng Tràng An',
              province: 'Ninh Bình',
              tag: 'Di sản thế giới',
              tagBg: 'bg-emerald-600 text-white',
              rating: 4.9,
              reviews: '2,150 đánh giá',
              desc: 'Xuôi thuyền nan qua các hang động thủy mặc kỳ bí và phim trường Kong Skull Island.',
              price: '250.000₫',
              img: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80'
            },
            {
              id: 'an-thoi',
              name: 'Quần đảo An Thới & Hòn Thơm',
              province: 'Phú Quốc',
              tag: 'Nghỉ dưỡng biển',
              tagBg: 'bg-teal-600 text-white',
              rating: 4.7,
              reviews: '890 đánh giá',
              desc: 'Lặn ngắm rạn san hô tự nhiên rực rỡ, lướt cáp treo vượt biển dài nhất thế giới.',
              price: '650.000₫',
              img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
            }
          ].map(item => (
            <div
              key={item.id}
              onClick={() => setUserTab('explore')}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col justify-between"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold shadow-md ${item.tagBg}`}>
                  {item.tag}
                </div>
                <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-amber-400 text-slate-900 text-[10px] font-extrabold flex items-center gap-1 shadow-md">
                  <Star className="w-3 h-3 fill-slate-900" />
                  <span>{item.rating}</span>
                </div>
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-sky-400" />
                  <span>{item.province}</span>
                </div>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-sky-600 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.desc}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Giá vé từ</span>
                    <span className="font-bold text-sky-600">{item.price}</span>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); setIsAIGeneratorOpen(true); }}
                    className="px-3 py-1.5 rounded-full bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white text-xs font-bold transition-all"
                  >
                    + Lịch trình
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. KHỐI AI FEATURE HIGHLIGHT SHOWCASE (EXACT STITCH AI M01 SECTION) */}
      <section className="w-full bg-slate-100/70 py-16 my-8 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Interactive AI Generator Simulation Card */}
            <div className="lg:col-span-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200/80 space-y-6 relative overflow-hidden">
                
                {/* Simulated Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      <BrainCircuit className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Hành trình: Đà Nẵng - Hội An (3N2Đ)</h4>
                      <p className="text-[11px] text-slate-400">AI vừa tối ưu hóa 1 phút trước • Độ chính xác ngân sách 96%</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200">
                    Đã hoàn thành
                  </span>
                </div>

                {/* Day-by-Day Simulated Timeline Nodes */}
                <div className="space-y-4 relative pl-6 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  
                  {/* Step 1 */}
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-7 h-7 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      1
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">Ngày 1: Biển Mỹ Khê & Bán đảo Sơn Trà</span>
                        <span className="font-mono text-sky-600 font-semibold">08:00 - 18:30</span>
                      </div>
                      <p className="text-xs text-slate-500">Check-in Khách sạn ven biển, ăn trưa Bánh xèo Bà Dưỡng, ngắm hoàng hôn Chùa Linh Ứng.</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      2
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">Ngày 2: Sun World Bà Nà Hills - Cầu Vàng</span>
                        <span className="font-mono text-teal-600 font-semibold">07:30 - 16:30</span>
                      </div>
                      <p className="text-xs text-slate-500">Đi cáp treo sớm tránh đông, buffet trưa 80 món Á - Âu, check-in Hầm rượu Debay.</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-7 h-7 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      3
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">Ngày 3: Phố Cổ Hội An & Chèo Thuyền Thúng</span>
                        <span className="font-mono text-amber-600 font-semibold">09:00 - 20:30</span>
                      </div>
                      <p className="text-xs text-slate-500">Rừng dừa Bảy Mẫu, thử nước Mót, thả hoa đăng sông Hoài thơ mộng.</p>
                    </div>
                  </div>

                </div>

                {/* Mini Budget Breakdown Chart Graphic */}
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>Dự toán phân bổ chi phí AI (3.850.000₫/người)</span>
                    <PieChart className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex">
                    <div className="h-full bg-sky-600" style={{ width: '40%' }} title="Lưu trú (40%)"></div>
                    <div className="h-full bg-amber-500" style={{ width: '35%' }} title="Ẩm thực (35%)"></div>
                    <div className="h-full bg-teal-600" style={{ width: '15%' }} title="Vé tham quan (15%)"></div>
                    <div className="h-full bg-slate-400" style={{ width: '10%' }} title="Dự phòng (10%)"></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-600"></span> Khách sạn & Xe</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Ẩm thực</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-600"></span> Vé thắng cảnh</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400"></span> Dự phòng</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: AI Benefits & Value Props */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Khám phá sức mạnh WanderAI Planner</span>
              </div>

              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                Chuyến đi hoàn hảo không còn tốn hàng tuần để lên mạng gom góp thông tin
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Trí tuệ nhân tạo của WanderAI liên tục phân tích hàng triệu đánh giá thực tế, khoảng cách địa lý và thói quen xê dịch bản địa để mang tới hành trình liền mạch nhất cho bạn.
              </p>

              {/* 3 Feature Pillars */}
              <div className="space-y-5">
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                    <Navigation className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Tối ưu lộ trình di chuyển liên tục</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Tự động sắp xếp các điểm đến theo cụm vị trí địa lý thông minh, loại bỏ việc quay đầu xe lòng vòng tốn thời gian và chi phí xăng xe.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Dự trù chi phí thực tế chính xác 95%</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Tính toán chi tiết từ tiền vé tham quan, giá taxi theo km thực tế đến giá trung bình từng bữa ăn để bạn luôn chủ động ngân sách.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                    <SlidersHorizontal className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Cá nhân hóa theo gu trải nghiệm</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Dù bạn thích săn quán cafe hoài niệm chill mộc, tìm quán ăn chuẩn bản địa hay trekking thám hiểm, AI đều gợi ý chuẩn xác.
                    </p>
                  </div>
                </div>

              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsAIGeneratorOpen(true)}
                  className="sparkle-btn text-white px-8 py-3.5 rounded-full text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <span>Trải nghiệm tạo lịch trình ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 5. COMMUNITY TRAVEL FEED PREVIEW (MATCHING STITCH M01) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">
              <Users className="w-4 h-4" />
              <span>Không gian kết nối xê dịch</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Chia sẻ thực tế từ Cộng đồng Xê dịch
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Hình ảnh chân thực, mẹo du lịch tiết kiệm và những câu chuyện hành trình truyền cảm hứng
            </p>
          </div>

          <button
            onClick={() => setUserTab('community')}
            className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-2 transition-colors self-start md:self-auto"
          >
            <MessageCircle className="w-4 h-4 text-sky-600" />
            <span>Tham gia thảo luận</span>
          </button>
        </div>

        {/* 3 Community Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.slice(0, 3).map(post => (
            <article key={post.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-sky-100" />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{post.author.name}</h4>
                      <p className="text-[10px] text-slate-400">{post.location} • {post.timeAgo}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                  {post.content}
                </p>

                {post.images && post.images.length > 0 && (
                  <div className="rounded-2xl overflow-hidden h-40">
                    <img src={post.images[0]} alt="Checkin" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
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
        </div>
      </section>

    </div>
  );
};
