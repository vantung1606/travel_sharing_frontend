import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  Compass,
  Bike,
  Car,
  Bus,
  RefreshCw,
  Share2,
  Download,
  Bookmark,
  Route,
  Navigation,
  CheckCircle2,
  Award,
  ChevronRight,
  Lightbulb,
  PieChart,
  Info,
  Clock,
  Utensils,
  Plane,
  Camera,
  Sun,
  ShieldCheck
} from 'lucide-react';

export const AIPlannerPage = () => {
  const { generateAITrip, setIsAIGeneratorOpen } = useApp();

  // Input Panel States
  const [destination, setDestination] = useState('Đà Nẵng & Hội An');
  const [duration, setDuration] = useState('3 Ngày 2 Đêm');
  const [startDate, setStartDate] = useState('2026-11-15');
  const [budgetVal, setBudgetVal] = useState(4500000);
  const [budgetTier, setBudgetTier] = useState('Tiêu chuẩn');
  const [selectedStyles, setSelectedStyles] = useState(['🏖️ Nghỉ dưỡng & Biển', '🍜 Ẩm thực địa phương', '🏛️ Văn hóa & Lịch sử']);
  const [transport, setTransport] = useState('Taxi / Công nghệ');
  const [userNote, setUserNote] = useState('Đi cùng nhóm bạn 4 người, muốn dậy sớm đón bình minh biển và trải nghiệm trọn vẹn ẩm thực chợ đêm Hội An.');
  const [isGenerating, setIsGenerating] = useState(false);

  // Preset Prompts
  const presets = [
    { label: '✨ 3N2Đ Đà Nẵng - Hội An tiết kiệm', dest: 'Đà Nẵng & Hội An', budget: 3500000 },
    { label: '☁️ 4N3Đ Đà Lạt săn mây & cafe chill', dest: 'Đà Lạt Ngàn Hoa', budget: 4000000 },
    { label: '🏝️ 5N4Đ Nghỉ dưỡng Phú Quốc gia đình', dest: 'Đảo Ngọc Phú Quốc', budget: 8000000 },
    { label: '🌸 Hà Giang mùa hoa tam giác mạch', dest: 'Hà Giang Phượt Loop', budget: 3000000 }
  ];

  const toggleStyle = (style) => {
    setSelectedStyles(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      generateAITrip({
        destination,
        daysCount: duration.startsWith('2') ? 2 : duration.startsWith('4') ? 4 : 3,
        budget: `${(budgetVal / 1000000).toFixed(1)} triệuđ`,
        style: selectedStyles.join(', ')
      });
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6">
      
      {/* 1. BREADCRUMB & HEADER AREA */}
      <section className="space-y-2">
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <a href="#" className="hover:text-sky-600">Trang chủ</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-sky-600 font-bold">AI Travel Planner</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold shadow-sm mb-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Trí tuệ nhân tạo thế hệ mới • WanderAI v3.5</span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Trợ Lý AI Lập Lịch Trình Chuyến Đi Thông Minh
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Chỉ cần vài thông tin cơ bản, AI sẽ tự động tối ưu cung đường, dự trù ngân sách và lên lịch chi tiết từng giờ với dữ liệu thời gian thực.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white shadow-sm border border-slate-200 text-xs font-bold text-slate-700 flex-shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 animate-pulse"></span>
            <span>Dữ liệu thời tiết & vé thực tế 2026</span>
          </div>
        </div>

        {/* Quick Preset Prompt Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 no-scrollbar text-xs font-semibold">
          <span className="text-slate-500 whitespace-nowrap flex items-center gap-1">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Lộ trình mẫu:
          </span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => { setDestination(p.dest); setBudgetVal(p.budget); }}
              className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm whitespace-nowrap transition-all cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      {/* 2. TWO-COLUMN SPLIT VIEW LAYOUT (~35% Form, ~65% Output Showcase) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: Interactive Input Panel (4 Cols)             */}
        {/* ========================================================= */}
        <aside className="lg:col-span-4 w-full">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-5 sticky top-20">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold">
                  <Compass className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-base text-slate-900">Tùy Chọn Chuyến Đi</h2>
              </div>
              <button
                onClick={() => { setDestination('Đà Nẵng & Hội An'); setBudgetVal(4500000); }}
                className="text-xs font-bold text-slate-400 hover:text-sky-600 flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Đặt lại</span>
              </button>
            </div>

            {/* Input 1: Destination */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 flex justify-between">
                <span>Điểm đến mong muốn</span>
                <span className="text-[10px] text-sky-600 font-semibold">Đã nhận diện GPS</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-sky-600" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Input 2: Duration & Start Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Thời gian</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 outline-none"
                >
                  <option>3 Ngày 2 Đêm</option>
                  <option>2 Ngày 1 Đêm</option>
                  <option>4 Ngày 3 Đêm</option>
                  <option>5 Ngày 4 Đêm</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Khởi hành</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 outline-none"
                />
              </div>
            </div>

            {/* Input 3: Budget Range Slider */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-800">Ngân sách dự kiến</label>
                <span className="font-bold text-sky-600 text-sm">
                  {budgetVal.toLocaleString('vi-VN')}đ <span className="text-[10px] text-slate-400 font-normal">/người</span>
                </span>
              </div>
              <input
                type="range"
                min={1500000}
                max={15000000}
                step={250000}
                value={budgetVal}
                onChange={(e) => setBudgetVal(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 pt-1">
                {['Tiết kiệm', 'Tiêu chuẩn', 'Cao cấp'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setBudgetTier(t)}
                    className={`flex-1 py-1 rounded-lg transition-colors ${
                      budgetTier === t ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-200/70 hover:bg-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Input 4: Travel Style Multi-select Chips */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Phong cách chuyến đi</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '🏖️ Nghỉ dưỡng & Biển',
                  '🍜 Ẩm thực địa phương',
                  '📸 Check-in sống ảo',
                  '🏛️ Văn hóa & Lịch sử',
                  '⛺ Khám phá mạo hiểm'
                ].map(st => {
                  const active = selectedStyles.includes(st);
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => toggleStyle(st)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        active
                          ? 'bg-sky-100 text-sky-800 border border-sky-300 shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st} {active && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input 5: Preferred Transport */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Phương tiện ưu tiên</label>
              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                {[
                  { name: 'Xe máy', icon: Bike },
                  { name: 'Taxi / Công nghệ', icon: Car },
                  { name: 'Xe tự lái', icon: Bus }
                ].map(t => {
                  const Icon = t.icon;
                  const active = transport === t.name;
                  return (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => setTransport(t.name)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        active
                          ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px]">{t.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input 6: Special Requests / User Notes */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Ghi chú đặc biệt cho AI</label>
              <textarea
                rows={3}
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-sky-500"
              ></textarea>
            </div>

            {/* Primary Action CTA */}
            <button
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="w-full sparkle-btn py-3.5 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
              <span>{isGenerating ? 'AI Đang Tính Toán Lộ Trình...' : 'Tạo Lại Gợi Ý AI'}</span>
            </button>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 text-[11px] text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-sky-600 flex-shrink-0" />
              <span>Kết hợp dữ liệu Google Places & định tuyến phân luồng du lịch WanderAI.</span>
            </div>

          </div>
        </aside>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Live AI Generated Itinerary Showcase (8 Cols) */}
        {/* ========================================================= */}
        <main className="lg:col-span-8 w-full space-y-6">
          
          {/* Top Summary Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6 relative overflow-hidden">
            
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    Độ phù hợp AI: 98%
                  </span>
                  <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold">
                    Ngân sách tối ưu
                  </span>
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-600" />
                    26°C - 29°C Nắng đẹp
                  </span>
                </div>

                <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900">
                  Khám phá trọn vẹn {destination} ({duration})
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Lộ trình thiết kế riêng cho nhóm 4 người: Cân bằng giữa nghỉ ngơi bãi biển Mỹ Khê, ẩm thực trứ danh miền Trung và check-in di sản thế giới.
                </p>
              </div>

              {/* Action Buttons Bar */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button className="p-2.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="p-2.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                <button className="sparkle-btn px-4 py-2.5 rounded-full text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                  <Bookmark className="w-4 h-4" />
                  <span>Lưu Lịch Trình</span>
                </button>
              </div>
            </div>

            {/* Key Metrics Bento Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Tổng quãng đường</span>
                <span className="font-bold text-base text-slate-900 flex items-center gap-1 mt-0.5">
                  68 km <Route className="w-4 h-4 text-sky-600" />
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">Tối ưu 18% so với gốc</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">Điểm dừng chân</span>
                <span className="font-bold text-base text-slate-900 flex items-center gap-1 mt-0.5">
                  11 địa điểm <MapPin className="w-4 h-4 text-teal-600" />
                </span>
                <span className="text-[10px] text-slate-400">Đã đồng bộ giờ mở</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">Ước tính chi phí</span>
                <span className="font-bold text-base text-sky-600 mt-0.5 block">
                  3.850.000đ
                </span>
                <span className="text-[10px] text-slate-400">Hạn mức: {budgetVal.toLocaleString('vi-VN')}đ</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">Dôi dư an toàn</span>
                <span className="font-bold text-base text-emerald-600 mt-0.5 block">
                  +{((budgetVal - 3850000) / 1000).toFixed(0)}.000đ
                </span>
                <span className="text-[10px] text-slate-400">Dự phòng phát sinh</span>
              </div>
            </div>

            {/* Visual Budget Breakdown Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Phân bổ chi phí dự kiến theo hạng mục</span>
                <span className="text-slate-500 font-normal">Tổng: 3.850.000đ / người</span>
              </div>
              
              <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
                <div className="h-full bg-sky-600" style={{ width: '35%' }} title="Lưu trú: 35%"></div>
                <div className="h-full bg-amber-500" style={{ width: '30%' }} title="Ẩm thực: 30%"></div>
                <div className="h-full bg-teal-600" style={{ width: '20%' }} title="Vé tham quan: 20%"></div>
                <div className="h-full bg-slate-400" style={{ width: '15%' }} title="Di chuyển: 15%"></div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-600 font-medium">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span> Lưu trú: <strong>35%</strong> (1.350.000đ)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Ẩm thực: <strong>30%</strong> (1.150.000đ)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span> Vé thắng cảnh: <strong>20%</strong> (770.000đ)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Di chuyển: <strong>15%</strong> (580.000đ)</span>
              </div>
            </div>

          </div>

          {/* Interactive Mini Map Viewport */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Navigation className="w-4 h-4 text-sky-600" />
                <span>Bản Đồ Cung Đường Thông Minh AI</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 font-bold border border-sky-200">
                8 Điểm chính • 3 AI Hidden Gems
              </span>
            </div>

            <div
              className="w-full h-52 bg-slate-900 rounded-2xl relative overflow-hidden flex items-center justify-center text-white p-4 bg-cover bg-center"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80')` }}
            >
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"></div>
              <div className="relative z-10 text-center space-y-2">
                <MapPin className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
                <p className="font-bold text-sm text-white">Cung đường: Sân bay DAD → Mỹ Khê → Bà Nà Hills → Phố Cổ Hội An</p>
                <span className="text-[11px] bg-slate-900/80 px-3 py-1 rounded-full text-sky-300 font-mono inline-block">
                  GPS Active • Thời gian di chuyển trung bình: 22 phút / chặng
                </span>
              </div>
            </div>
          </div>

          {/* DAY 1 DETAILED TIMELINE CARD */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl ocean-gradient text-white font-bold text-base flex items-center justify-center shadow-md">
                  01
                </div>
                <div>
                  <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">Ngày 1 • Thứ Sáu</span>
                  <h3 className="font-bold text-base text-slate-900">Chạm ngõ Đà Nẵng & Hoàng hôn Bán đảo Sơn Trà</h3>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-medium">5 hoạt động • 18 km</span>
            </div>

            {/* Timeline Activity Items */}
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              
              {/* Item 1 */}
              <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="absolute -left-6 sm:-left-8 top-1 w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">
                  <Plane className="w-3 h-3" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-sky-600 font-mono">08:30</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      Di chuyển & Nhận phòng
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Đến Sân bay Quốc tế Đà Nẵng & Check-in Khách sạn ven biển Mỹ Khê
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Đón xe công nghệ về khách sạn 4 sao mặt biển (Salmalia Boutique hoặc Haian Beach Hotel). Gửi hành lý tại lễ tân, nhận phòng sớm.
                  </p>
                </div>
                <div className="text-right sm:flex-shrink-0 text-xs">
                  <span className="font-bold text-slate-900 block">750.000đ</span>
                  <span className="text-[10px] text-slate-400">Khách sạn & Taxi</span>
                </div>
              </div>

              {/* Item 2 */}
              <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="absolute -left-6 sm:-left-8 top-1 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">
                  <Utensils className="w-3 h-3" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-amber-600 font-mono">11:30</span>
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold">
                      Ẩm thực đặc sản
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Bữa trưa đặc sản: Mì Quảng Ếch Bếp Trang (Đường Pasteur)
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Thưởng thức mì Quảng thố niêu nước dùng đậm đà ăn kèm bánh tráng mè nướng giòn và rau sống Trà Quế tươi non.
                  </p>
                </div>
                <div className="text-right sm:flex-shrink-0 text-xs">
                  <span className="font-bold text-slate-900 block">85.000đ</span>
                  <span className="text-[10px] text-slate-400">Ăn uống</span>
                </div>
              </div>

              {/* Item 3 */}
              <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="absolute -left-6 sm:-left-8 top-1 w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">
                  <Camera className="w-3 h-3" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-teal-600 font-mono">14:30</span>
                    <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 text-[10px] font-bold">
                      Danh thắng
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Bán đảo Sơn Trà & Chiêm bái Chùa Linh Ứng Bãi Bụt
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Viếng tượng Phật Bà Quan Âm cao 67m hướng biển, ngắm toàn cảnh vịnh Đà Nẵng từ trên cao. Cung đường rợp bóng mát dễ chịu.
                  </p>
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-900 text-xs flex items-center gap-2 border border-amber-100">
                    <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span><strong>AI Tip:</strong> Mang theo mũ chống nắng và ăn mặc lịch sự khi vào chánh điện.</span>
                  </div>
                </div>
                <div className="text-right sm:flex-shrink-0 text-xs">
                  <span className="font-bold text-emerald-600 block">Miễn phí</span>
                  <span className="text-[10px] text-slate-400">Vé 0đ</span>
                </div>
              </div>

            </div>
          </section>

          {/* DAY 2 DETAILED TIMELINE CARD */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white font-bold text-base flex items-center justify-center shadow-md">
                  02
                </div>
                <div>
                  <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider block">Ngày 2 • Thứ Bảy</span>
                  <h3 className="font-bold text-base text-slate-900">Kỳ quan Bà Nà Hills & Di chuyển Phố Cổ Hội An</h3>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-medium">4 hoạt động • 38 km</span>
            </div>

            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="absolute -left-6 sm:-left-8 top-1 w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">
                  <Sun className="w-3 h-3" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-sky-600 font-mono">07:30</span>
                    <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 text-[10px] font-bold">
                      Điểm nhấn tour
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Khởi hành đi Sun World Bà Nà Hills, check-in Cầu Vàng
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Trải nghiệm cáp treo kỷ lục thế giới, dạo bước trên đôi bàn tay khổng lồ Cầu Vàng sương sớm, thăm Làng Pháp và hầm rượu Debay.
                  </p>
                </div>
                <div className="text-right sm:flex-shrink-0 text-xs">
                  <span className="font-bold text-slate-900 block">850.000đ</span>
                  <span className="text-[10px] text-slate-400">Vé cáp treo</span>
                </div>
              </div>
            </div>
          </section>

        </main>

      </div>

    </div>
  );
};
