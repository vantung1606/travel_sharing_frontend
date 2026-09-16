import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../components/common/Toast';
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
  ChevronRight,
  Lightbulb,
  Clock,
  Utensils,
  Plane,
  Camera,
  Sun,
  ShieldCheck,
  Zap,
  Sliders,
  X,
  Heart,
  SlidersHorizontal,
  ExternalLink,
  Info,
  Check,
  Map,
  ShoppingBag,
  Coffee,
  Waves
} from 'lucide-react';

export const AIPlannerPage = () => {
  const { generateAITrip } = useApp();
  const toast = useToast();

  // Input Panel States
  const [destination, setDestination] = useState('Đà Nẵng & Hội An, Miền Trung');
  const [duration, setDuration] = useState('3 Ngày 2 Đêm');
  const [startDate, setStartDate] = useState('2026-11-15');
  const [budgetVal, setBudgetVal] = useState(4500000);
  const [budgetTier, setBudgetTier] = useState('Tiêu chuẩn');
  const [selectedStyles, setSelectedStyles] = useState([
    '🏖️ Nghỉ dưỡng & Biển',
    '🍜 Ẩm thực địa phương',
    '🏛️ Văn hóa & Lịch sử'
  ]);
  const [transport, setTransport] = useState('Taxi / Công nghệ');
  const [userNote, setUserNote] = useState(
    'Đi cùng nhóm bạn 4 người, muốn dậy sớm đón bình minh biển và trải nghiệm trọn vẹn ẩm thực chợ đêm Hội An.'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  // Preset Prompts matching Stitch M05
  const presets = [
    {
      label: '✨ 3N2Đ Đà Nẵng - Hội An tiết kiệm',
      dest: 'Đà Nẵng & Hội An, Miền Trung',
      budget: 3500000,
      duration: '3 Ngày 2 Đêm',
      styles: ['🏖️ Nghỉ dưỡng & Biển', '🍜 Ẩm thực địa phương', '🏛️ Văn hóa & Lịch sử'],
      transport: 'Taxi / Công nghệ',
      note: 'Đi cùng nhóm bạn 4 người, muốn dậy sớm đón bình minh biển và trải nghiệm trọn vẹn ẩm thực chợ đêm Hội An.'
    },
    {
      label: '☁️ 4N3Đ Đà Lạt săn mây & cafe chill',
      dest: 'Đà Lạt Ngàn Hoa, Lâm Đồng',
      budget: 4200000,
      duration: '4 Ngày 3 Đêm',
      styles: ['📸 Check-in sống ảo', '🍜 Ẩm thực địa phương', '⛺ Khám phá mạo hiểm'],
      transport: 'Xe máy',
      note: 'Dậy sớm 5h sáng săn mây đồi chè Cầu Đất, tối dạo chợ đêm ăn bánh tráng nướng và sữa đậu nành nóng.'
    },
    {
      label: '🏝️ 5N4Đ Nghỉ dưỡng Phú Quốc gia đình',
      dest: 'Đảo Ngọc Phú Quốc, Kiên Giang',
      budget: 8500000,
      duration: '5 Ngày 4 Đêm',
      styles: ['🏖️ Nghỉ dưỡng & Biển', '🍜 Ẩm thực địa phương'],
      transport: 'Xe tự lái',
      note: 'Gia đình có trẻ em và người lớn tuổi, ưu tiên resort 5 sao bãi Khem, ngắm hoàng hôn Sunset Sanato.'
    },
    {
      label: '🌸 Hà Giang mùa hoa tam giác mạch',
      dest: 'Cao nguyên đá Đồng Văn, Hà Giang',
      budget: 3200000,
      duration: '3 Ngày 2 Đêm',
      styles: ['⛺ Khám phá mạo hiểm', '📸 Check-in sống ảo', '🏛️ Văn hóa & Lịch sử'],
      transport: 'Xe máy',
      note: 'Phượt đèo Mã Pí Lèng, chèo kayak hẻm Tu Sản, khám phá dinh họ Vương và cột cờ Lũng Cú.'
    }
  ];

  const toggleStyle = (style) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const handleSelectTier = (tier) => {
    setBudgetTier(tier);
    if (tier === 'Tiết kiệm') setBudgetVal(2500000);
    else if (tier === 'Tiêu chuẩn') setBudgetVal(4500000);
    else if (tier === 'Cao cấp') setBudgetVal(8500000);
  };

  const handleApplyPreset = (index) => {
    setActivePresetIndex(index);
    const p = presets[index];
    setDestination(p.dest);
    setBudgetVal(p.budget);
    setDuration(p.duration);
    setSelectedStyles(p.styles);
    setTransport(p.transport);
    setUserNote(p.note);

    toast.info(`Đã áp dụng mẫu lộ trình: ${p.label}`);
  };

  const handleReset = () => {
    setDestination('Đà Nẵng & Hội An, Miền Trung');
    setDuration('3 Ngày 2 Đêm');
    setStartDate('2026-11-15');
    setBudgetVal(4500000);
    setBudgetTier('Tiêu chuẩn');
    setSelectedStyles(['🏖️ Nghỉ dưỡng & Biển', '🍜 Ẩm thực địa phương', '🏛️ Văn hóa & Lịch sử']);
    setTransport('Taxi / Công nghệ');
    setUserNote('Đi cùng nhóm bạn 4 người, muốn dậy sớm đón bình minh biển và trải nghiệm trọn vẹn ẩm thực chợ đêm Hội An.');
    setActivePresetIndex(0);
    setIsSaved(false);
    toast.info('Đã đặt lại các tùy chọn chuyến đi.');
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast.success('WanderAI đã tính toán và cập nhật lại toàn bộ lịch trình tối ưu!');
    }, 1100);
  };

  const handleSaveItinerary = () => {
    setIsSaved(true);
    generateAITrip({
      destination,
      daysCount: duration.startsWith('2') ? 2 : duration.startsWith('4') ? 4 : duration.startsWith('5') ? 5 : 3,
      budget: `${(budgetVal / 1000000).toFixed(1)} triệuđ`,
      style: selectedStyles.join(', ')
    });
    toast.success('Đã lưu lịch trình thành công vào bộ sưu tập cá nhân!');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Đã sao chép liên kết chia sẻ lịch trình vào bộ nhớ tạm!');
  };

  const handleDownload = () => {
    toast.info('Đang chuẩn bị file PDF lịch trình chi tiết và mã vé QR...');
    setTimeout(() => {
      toast.success('Đã sẵn sàng tải xuống bản PDF lịch trình du lịch!');
    }, 1200);
  };

  // Dynamic calculations based on budget
  const estimatedTotal = Math.round(budgetVal * 0.85);
  const surplus = budgetVal - estimatedTotal;
  const stayCost = Math.round(estimatedTotal * 0.35);
  const foodCost = Math.round(estimatedTotal * 0.30);
  const ticketCost = Math.round(estimatedTotal * 0.20);
  const transitCost = estimatedTotal - stayCost - foodCost - ticketCost;

  return (
    <div className="w-full min-h-screen bg-slate-50/50 pb-20">
      
      {/* Background Subtle Ambient Glow Orbs */}
      <div className="relative w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 space-y-6 overflow-hidden">
        <div className="absolute -top-32 right-12 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-48 left-10 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-96 right-1/4 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* 1. BREADCRUMB & HEADER AREA */}
        <section className="space-y-3">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <a href="#" className="hover:text-sky-600 transition-colors">Trang chủ</a>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-sky-600 font-bold">AI Travel Planner</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-xs font-bold shadow-xs mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Trí tuệ nhân tạo thế hệ mới • WanderAI v3.5</span>
              </div>
              <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Trợ lý AI Lập Lịch Trình Chuyến Đi Thông Minh
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                Chỉ cần vài thông tin cơ bản, AI sẽ tự động tối ưu cung đường, dự trù ngân sách và lên lịch chi tiết từng giờ với dữ liệu thời gian thực.
              </p>
            </div>

            {/* System Capability Chip */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white shadow-xs border border-slate-200 text-xs font-semibold text-slate-700 flex-shrink-0 self-start lg:self-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600 animate-pulse"></span>
              <span>Dữ liệu thời tiết & vé thực tế 2026</span>
            </div>
          </div>

          {/* Quick Preset Prompt Chips */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            <span className="text-slate-500 font-semibold whitespace-nowrap mr-1 flex items-center gap-1">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Lộ trình mẫu:
            </span>
            {presets.map((p, idx) => {
              const active = activePresetIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(idx)}
                  className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 font-medium cursor-pointer shadow-2xs ${
                    active
                      ? 'bg-sky-700 text-white font-bold shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                  }`}
                >
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. TWO-COLUMN SPLIT VIEW LAYOUT (~35% Form, ~65% Output) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: Interactive Input Panel (4 Cols)             */}
          {/* ========================================================= */}
          <aside className="lg:col-span-4 w-full">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-md space-y-5 sticky top-24">
              
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center text-sky-700 font-bold border border-sky-100">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <h2 className="font-bold text-base text-slate-900">Tùy Chọn Chuyến Đi</h2>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-slate-400 hover:text-sky-600 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Đặt lại bộ lọc"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Đặt lại</span>
                </button>
              </div>

              {/* Input 1: Destination */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Điểm đến mong muốn</span>
                  <span className="text-[11px] text-sky-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-sky-600" />
                    Đã nhận diện vị trí
                  </span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-sky-600" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Nhập thành phố hoặc danh thắng..."
                    className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs font-semibold text-slate-900 shadow-inner focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-500/20 transition-all"
                  />
                  {destination && (
                    <button
                      type="button"
                      onClick={() => setDestination('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Input 2: Days & Start Date (2 cols) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Thời gian</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-500/20 transition-all"
                  >
                    <option>2 Ngày 1 Đêm</option>
                    <option>3 Ngày 2 Đêm</option>
                    <option>4 Ngày 3 Đêm</option>
                    <option>5 Ngày 4 Đêm</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Ngày khởi hành</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50/80 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Input 3: Budget Range Slider & Style Tier Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-xs">Ngân sách dự kiến</label>
                  <span className="font-bold text-sky-700 text-sm">
                    {budgetVal.toLocaleString('vi-VN')}đ
                    <span className="text-[11px] text-slate-400 font-normal"> / người</span>
                  </span>
                </div>
                <input
                  type="range"
                  min={1500000}
                  max={15000000}
                  step={250000}
                  value={budgetVal}
                  onChange={(e) => setBudgetVal(Number(e.target.value))}
                  className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex items-center justify-between gap-1.5 pt-1">
                  {['Tiết kiệm', 'Tiêu chuẩn', 'Cao cấp'].map((tier) => {
                    const active = budgetTier === tier;
                    return (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => handleSelectTier(tier)}
                        className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold transition-all text-center cursor-pointer ${
                          active
                            ? 'bg-sky-700 text-white shadow-xs'
                            : 'bg-white hover:bg-slate-200/70 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {tier}
                      </button>
                    );
                  })}
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
                  ].map((st) => {
                    const active = selectedStyles.includes(st);
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => toggleStyle(st)}
                        className={`px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer shadow-2xs ${
                          active
                            ? 'bg-sky-100 text-sky-900 border border-sky-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/60'
                        }`}
                      >
                        <span>{st}</span>
                        {active && <Check className="w-3 h-3 text-sky-700" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Input 5: Preferred Transport (3 visual cards) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Phương tiện di chuyển ưu tiên</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: 'Xe máy', icon: Bike },
                    { name: 'Taxi / Công nghệ', icon: Car },
                    { name: 'Xe tự lái', icon: Bus }
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = transport === item.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setTransport(item.name)}
                        className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 text-center text-xs transition-all cursor-pointer ${
                          active
                            ? 'bg-sky-700 text-white font-bold shadow-xs'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 font-medium'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px]">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Input 6: Special Requests / User Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Ghi chú đặc biệt cho AI</label>
                <textarea
                  rows={3}
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  placeholder="Ví dụ: Đi nhóm bạn 4 người, thích ngắm hoàng hôn và muốn trải nghiệm ăn hải sản giá bình dân..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50/80 border border-slate-200 text-xs font-normal text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-500/20 resize-none transition-all"
                />
              </div>

              {/* Primary Action CTA */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-75"
                >
                  <Sparkles className={`w-4 h-4 text-amber-200 transition-transform ${isGenerating ? 'animate-spin' : 'group-hover:rotate-12'}`} />
                  <span>{isGenerating ? 'AI Đang Tính Toán Lộ Trình...' : 'Tạo lại gợi ý AI'}</span>
                </button>
              </div>

              {/* AI Engine Capability Meta Badge */}
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-100/80 text-[11px] text-slate-500 font-medium border border-slate-200/60">
                <ShieldCheck className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                <span>Mạng lưới học máy kết hợp dữ liệu Google Places & hệ thống định tuyến phân luồng du lịch WanderAI.</span>
              </div>

            </div>
          </aside>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Live AI Generated Itinerary Showcase (8 Cols) */}
          {/* ========================================================= */}
          <main className="lg:col-span-8 w-full space-y-6">
            
            {/* Top Summary Card with Rich Visuals */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md relative overflow-hidden space-y-6">
              <div className="absolute -right-16 -top-16 w-56 h-56 bg-sky-200/30 rounded-full blur-2xl pointer-events-none" />

              {/* Header & Title */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full bg-teal-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs">
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      Độ phù hợp AI: 98%
                    </span>
                    <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-900 text-xs font-bold border border-sky-200">
                      Ngân sách tối ưu
                    </span>
                    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold flex items-center gap-1 border border-amber-200">
                      <Sun className="w-3.5 h-3.5 text-amber-600" />
                      26°C - 29°C Nắng đẹp
                    </span>
                  </div>

                  <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
                    Khám phá trọn vẹn {destination} ({duration})
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                    Lộ trình thiết kế riêng cho nhóm bạn: Cân bằng giữa nghỉ ngơi bãi biển, trải nghiệm ẩm thực trứ danh miền Trung và khám phá di sản văn hóa thế giới.
                  </p>
                </div>

                {/* Top Action Buttons Bar */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-2.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors shadow-2xs cursor-pointer"
                    title="Chia sẻ lịch trình"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="p-2.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors shadow-2xs cursor-pointer"
                    title="Xuất PDF / Lịch điện thoại"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveItinerary}
                    className={`px-4 py-2.5 rounded-full text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSaved
                        ? 'bg-emerald-600 text-white'
                        : 'bg-sky-700 hover:bg-sky-800 text-white'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>{isSaved ? 'Đã Lưu Lịch Trình' : 'Lưu lịch trình'}</span>
                  </button>
                </div>
              </div>

              {/* Key Metrics Bento Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[11px]">Tổng quãng đường</span>
                  <span className="font-bold text-base text-slate-900 mt-0.5 flex items-center gap-1">
                    68 km
                    <Route className="w-4 h-4 text-sky-600" />
                  </span>
                  <span className="text-[11px] text-teal-700 font-semibold">Tối ưu 18% so với gốc</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-slate-400 text-[11px]">Điểm dừng chân</span>
                  <span className="font-bold text-base text-slate-900 mt-0.5 flex items-center gap-1">
                    11 địa điểm
                    <MapPin className="w-4 h-4 text-amber-600" />
                  </span>
                  <span className="text-[11px] text-slate-400">Đã đồng bộ mở cửa</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-slate-400 text-[11px]">Ước tính chi phí</span>
                  <span className="font-bold text-base text-sky-700 mt-0.5">
                    {estimatedTotal.toLocaleString('vi-VN')}đ
                  </span>
                  <span className="text-[11px] text-amber-700">Hạn mức: {budgetVal.toLocaleString('vi-VN')}đ</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-slate-400 text-[11px]">Dôi dư an toàn</span>
                  <span className="font-bold text-base text-emerald-600 mt-0.5">
                    +{surplus.toLocaleString('vi-VN')}đ
                  </span>
                  <span className="text-[11px] text-slate-400">Dự phòng phát sinh</span>
                </div>
              </div>

              {/* Visual Budget Breakdown Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span>Phân bổ chi phí dự kiến theo hạng mục</span>
                  <span className="text-slate-400 font-normal">Tổng: {estimatedTotal.toLocaleString('vi-VN')}đ / người</span>
                </div>
                
                {/* Multi-colored segment bar */}
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
                  <div className="h-full bg-sky-700" style={{ width: '35%' }} title="Lưu trú: 35%" />
                  <div className="h-full bg-amber-600" style={{ width: '30%' }} title="Ăn uống: 30%" />
                  <div className="h-full bg-teal-600" style={{ width: '20%' }} title="Vé tham quan: 20%" />
                  <div className="h-full bg-slate-400" style={{ width: '15%' }} title="Di chuyển: 15%" />
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-700" />
                    <span>Lưu trú: <strong>35%</strong> ({stayCost.toLocaleString('vi-VN')}đ)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                    <span>Ăn uống: <strong>30%</strong> ({foodCost.toLocaleString('vi-VN')}đ)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                    <span>Vé tham quan: <strong>20%</strong> ({ticketCost.toLocaleString('vi-VN')}đ)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <span>Di chuyển: <strong>15%</strong> ({transitCost.toLocaleString('vi-VN')}đ)</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Inline Interactive Mini Map & Quick Route Overview */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Map className="w-4 h-4 text-sky-600" />
                  <span>Bản Đồ Cung Đường Thông Minh</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1 font-semibold text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-sky-600" />
                    8 Điểm chính
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 flex items-center gap-1 font-bold text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
                    3 AI Hidden Gems
                  </span>
                </div>
              </div>

              {/* Integrated Static Map with Simulated HUD */}
              <div
                className="w-full h-52 rounded-2xl relative shadow-inner overflow-hidden flex items-end p-4 bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1400&q=80')`
                }}
              >
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-2xs" />
                
                {/* Floating HUD over map */}
                <div className="relative z-10 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 text-sky-700 font-bold">
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Sân bay DAD → Mỹ Khê → Bà Nà → Hội An</span>
                  </div>
                  <span className="text-slate-300 hidden sm:inline">|</span>
                  <span className="text-slate-500 font-medium text-[11px]">
                    Thời gian di chuyển tb: 22 phút / chặng
                  </span>
                </div>
              </div>
            </div>

            {/* ================= DAY-BY-DAY ITINERARY CARDS ================= */}

            {/* DAY 1 */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
              {/* Day Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 bg-slate-50 px-4 py-3 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-700 text-white text-base flex items-center justify-center font-bold shadow-xs">
                    01
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-sky-700 tracking-wider uppercase block">
                      Ngày 1 • Thứ Sáu, 15/11
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      Chạm ngõ Đà Nẵng & Hoàng hôn Bán đảo Sơn Trà
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-400 font-medium">
                  <span>5 hoạt động • 18 km</span>
                </div>
              </div>

              {/* Timeline Activities */}
              <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                
                {/* Item 1 */}
                <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-3 group">
                  <div className="absolute -left-[27px] sm:-left-[35px] top-0 w-6 h-6 rounded-full bg-white ring-4 ring-sky-600 flex items-center justify-center shadow-xs">
                    <Plane className="w-3 h-3 text-sky-700" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-sky-700 font-mono">08:30</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                        Di chuyển & Nhận phòng
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Đến Sân bay Quốc tế Đà Nẵng & Check-in Khách sạn ven biển Mỹ Khê
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Đón xe công nghệ về khách sạn 4 sao mặt biển (Salmalia Boutique hoặc Haian Beach Hotel). Gửi hành lý tại lễ tân, nhận phòng sớm nếu có phòng trống.
                    </p>
                  </div>
                  <div className="text-right sm:flex-shrink-0 text-xs">
                    <span className="font-bold text-slate-900 block">750.000đ</span>
                    <span className="text-[10px] text-slate-400">Khách sạn & Taxi</span>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-3 group">
                  <div className="absolute -left-[27px] sm:-left-[35px] top-0 w-6 h-6 rounded-full bg-white ring-4 ring-amber-500 flex items-center justify-center shadow-xs">
                    <Utensils className="w-3 h-3 text-amber-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-amber-600 font-mono">11:30</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-semibold">
                        Ẩm thực đặc sản
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Bữa trưa đặc sản: Mì Quảng Ếch Bếp Trang (Đường Pasteur)
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Thưởng thức mì Quảng thố niêu nước dùng đậm đà ăn kèm bánh tráng mè nướng giòn và rau sống Trà Quế tươi non.
                    </p>
                  </div>
                  <div className="text-right sm:flex-shrink-0 text-xs">
                    <span className="font-bold text-slate-900 block">85.000đ</span>
                    <span className="text-[10px] text-slate-400">Chi phí ăn uống</span>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-3 group">
                  <div className="absolute -left-[27px] sm:-left-[35px] top-0 w-6 h-6 rounded-full bg-white ring-4 ring-sky-600 flex items-center justify-center shadow-xs">
                    <Camera className="w-3 h-3 text-sky-700" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-sky-700 font-mono">14:30</span>
                      <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-semibold">
                        Danh lam thắng cảnh
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Bán đảo Sơn Trà & Chiêm bái Chùa Linh Ứng Bãi Bụt
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Viếng tượng Phật Bà Quan Âm cao 67m hướng biển, ngắm toàn cảnh vịnh Đà Nẵng từ trên cao. Cung đường rợp bóng mát dễ chịu.
                    </p>
                    {/* AI Tip Callout */}
                    <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-100/80 flex items-center gap-2 text-xs text-slate-700">
                      <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span><strong>AI Tip:</strong> Nên mang theo mũ chống nắng và trang phục lịch sự qua đầu gối khi vào chánh điện.</span>
                    </div>
                  </div>
                  <div className="text-right sm:flex-shrink-0 text-xs">
                    <span className="font-bold text-emerald-600 block">Miễn phí</span>
                    <span className="text-[10px] text-slate-400">Vé vào cổng 0đ</span>
                  </div>
                </div>

                {/* Item 4 */}
                <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-3 group">
                  <div className="absolute -left-[27px] sm:-left-[35px] top-0 w-6 h-6 rounded-full bg-white ring-4 ring-amber-600 flex items-center justify-center shadow-xs">
                    <Waves className="w-3 h-3 text-amber-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-amber-600 font-mono">17:30</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                        Thư giãn biển
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Tắm biển Mỹ Khê & Chill ngắm hoàng hôn ráng vàng
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Được Forbes vinh danh là một trong những bãi biển quyến rũ nhất hành tinh. Thư thái dạo bộ bờ cát trắng mịn hoặc gọi nước dừa tại quán bar sát biển.
                    </p>
                  </div>
                  <div className="text-right sm:flex-shrink-0 text-xs">
                    <span className="font-bold text-emerald-600 block">Miễn phí</span>
                    <span className="text-[10px] text-slate-400">Tự do tắm biển</span>
                  </div>
                </div>

                {/* Item 5 */}
                <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-3 group">
                  <div className="absolute -left-[27px] sm:-left-[35px] top-0 w-6 h-6 rounded-full bg-white ring-4 ring-sky-600 flex items-center justify-center shadow-xs">
                    <Utensils className="w-3 h-3 text-sky-700" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-sky-700 font-mono">19:30</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-semibold">
                        Bữa tối & Check-in
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Hải sản Năm Đảnh & Dạo bộ ngắm Cầu Rồng phun lửa
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Quán hải sản nổi tiếng người địa phương: ghẹ rang me, ốc móng tay xào rau muống, sò điệp nướng mỡ hành. Sau đó di chuyển ra Cầu Rồng check-in bờ sông Hàn lộng gió.
                    </p>
                  </div>
                  <div className="text-right sm:flex-shrink-0 text-xs">
                    <span className="font-bold text-slate-900 block">250.000đ</span>
                    <span className="text-[10px] text-slate-400">Ăn tối no say</span>
                  </div>
                </div>

              </div>
            </section>

            {/* DAY 2 */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
              {/* Day Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 bg-slate-50 px-4 py-3 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-700 text-white text-base flex items-center justify-center font-bold shadow-xs">
                    02
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-teal-700 tracking-wider uppercase block">
                      Ngày 2 • Thứ Bảy, 16/11
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      Kỳ quan Bà Nà Hills & Di chuyển Phố Cổ Hội An
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-400 font-medium">
                  <span>4 hoạt động • 38 km</span>
                </div>
              </div>

              {/* Timeline Activities */}
              <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                
                {/* Item 1 */}
                <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-3 group">
                  <div className="absolute -left-[27px] sm:-left-[35px] top-0 w-6 h-6 rounded-full bg-white ring-4 ring-amber-500 flex items-center justify-center shadow-xs">
                    <Sun className="w-3 h-3 text-amber-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-amber-600 font-mono">07:30</span>
                      <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 text-[10px] font-semibold">
                        Điểm nhấn tour
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Khởi hành đi Sun World Bà Nà Hills, check-in Cầu Vàng
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Trải nghiệm hệ thống cáp treo đạt kỷ lục thế giới, dạo bước trên đôi bàn tay khổng lồ Cầu Vàng trong sương sớm, thăm Làng Pháp và hầm rượu Debay cổ kính.
                    </p>
                    <div className="mt-2 p-2.5 rounded-xl bg-teal-50 border border-teal-100/80 flex items-center gap-2 text-xs text-slate-700">
                      <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      <span><strong>AI Insight:</strong> Lên cáp treo lúc 08:00 giúp chụp ảnh Cầu Vàng vắng bóng người trước khi các đoàn tour lớn đổ về.</span>
                    </div>
                  </div>
                  <div className="text-right sm:flex-shrink-0 text-xs">
                    <span className="font-bold text-slate-900 block">850.000đ</span>
                    <span className="text-[10px] text-slate-400">Vé cáp treo Bà Nà</span>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-3 group">
                  <div className="absolute -left-[27px] sm:-left-[35px] top-0 w-6 h-6 rounded-full bg-white ring-4 ring-sky-600 flex items-center justify-center shadow-xs">
                    <Utensils className="w-3 h-3 text-sky-700" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-sky-700 font-mono">12:00</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                        Bữa trưa Buffet
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Thưởng thức Buffet hơn 100 món Á - Âu tại đỉnh Bà Nà
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Nghỉ ngơi tiếp thêm năng lượng tại nhà hàng Four Seasons với quầy thịt nướng, hải sản nóng hổi và bánh ngọt châu Âu.
                    </p>
                  </div>
                  <div className="text-right sm:flex-shrink-0 text-xs">
                    <span className="font-bold text-teal-700 block">Đã bao gồm</span>
                    <span className="text-[10px] text-slate-400">Gói combo cáp treo</span>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-3 group">
                  <div className="absolute -left-[27px] sm:-left-[35px] top-0 w-6 h-6 rounded-full bg-white ring-4 ring-sky-600 flex items-center justify-center shadow-xs">
                    <Car className="w-3 h-3 text-sky-700" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-sky-700 font-mono">16:00</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                        Di chuyển & Homestay
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Di chuyển về Phố Cổ Hội An, nhận homestay ven sông Hoài
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Xe đưa đón về Hội An (30km). Nhận phòng tại homestay phong cách Indochine yên bình gần chùa Cầu, ngâm chân thư giãn với thảo mộc địa phương.
                    </p>
                  </div>
                  <div className="text-right sm:flex-shrink-0 text-xs">
                    <span className="font-bold text-slate-900 block">450.000đ</span>
                    <span className="text-[10px] text-slate-400">Homestay Hội An</span>
                  </div>
                </div>

                {/* Item 4 */}
                <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-3 group">
                  <div className="absolute -left-[27px] sm:-left-[35px] top-0 w-6 h-6 rounded-full bg-white ring-4 ring-amber-600 flex items-center justify-center shadow-xs">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-amber-600 font-mono">18:30</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-semibold">
                        Trải nghiệm đêm di sản
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Thuyền hoa đăng sông Hoài & Thưởng thức Cao Lầu, Cơm Gà
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Thả đèn hoa đăng cầu an trên dòng sông Hoài rực rỡ lồng đèn. Thưởng thức Cao Lầu Bá Lễ và Cơm gà Bà Buội nức tiếng đậm vị truyền thống.
                    </p>
                  </div>
                  <div className="text-right sm:flex-shrink-0 text-xs">
                    <span className="font-bold text-slate-900 block">180.000đ</span>
                    <span className="text-[10px] text-slate-400">Thuyền & Ăn uống</span>
                  </div>
                </div>

              </div>
            </section>

            {/* DAY 3 (or final day) */}
            {(!duration.startsWith('2')) && (
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
                {/* Day Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 bg-slate-50 px-4 py-3 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-600 text-white text-base flex items-center justify-center font-bold shadow-xs">
                      03
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase block">
                        Ngày 3 • Chủ Nhật, 17/11
                      </span>
                      <h3 className="text-base font-bold text-slate-900">
                        Bình yên Hội An & Chợ Đêm Hương Vị Miền Trung
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-400 font-medium">
                    <span>3 hoạt động • 12 km</span>
                  </div>
                </div>

                {/* Timeline Activities */}
                <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  
                  {/* Item 1 */}
                  <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-3 group">
                    <div className="absolute -left-[27px] sm:-left-[35px] top-0 w-6 h-6 rounded-full bg-white ring-4 ring-sky-600 flex items-center justify-center shadow-xs">
                      <Coffee className="w-3 h-3 text-sky-700" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-sky-700 font-mono">06:30</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                          Bình minh đồng quê
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Đạp xe ngắm bình minh cánh đồng Cẩm Châu, cafe sáng Roving Chillhouse
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Đạp xe qua những rặng tre xanh ngát, hít thở sương mai trên đồng lúa vàng óng và nhâm nhi ly cà phê cốt dừa thơm béo bên ruộng bậc thang Hội An.
                      </p>
                    </div>
                    <div className="text-right sm:flex-shrink-0 text-xs">
                      <span className="font-bold text-slate-900 block">65.000đ</span>
                      <span className="text-[10px] text-slate-400">Cafe & Thuê xe</span>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-3 group">
                    <div className="absolute -left-[27px] sm:-left-[35px] top-0 w-6 h-6 rounded-full bg-white ring-4 ring-teal-600 flex items-center justify-center shadow-xs">
                      <Waves className="w-3 h-3 text-teal-700" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-teal-700 font-mono">09:30</span>
                        <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 text-[10px] font-semibold">
                          Trải nghiệm sông nước
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Trải nghiệm chèo thuyền thúng Rừng Dừa Bảy Mẫu
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Hòa mình vào màn múa thuyền thúng sôi động, câu cua đá cùng ngư dân bản địa và chiêm ngưỡng bạt ngàn rặng dừa nước Cẩm Thanh xanh mướt.
                      </p>
                    </div>
                    <div className="text-right sm:flex-shrink-0 text-xs">
                      <span className="font-bold text-slate-900 block">150.000đ</span>
                      <span className="text-[10px] text-slate-400">Vé thuyền thúng</span>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-3 group">
                    <div className="absolute -left-[27px] sm:-left-[35px] top-0 w-6 h-6 rounded-full bg-white ring-4 ring-slate-400 flex items-center justify-center shadow-xs">
                      <ShoppingBag className="w-3 h-3 text-slate-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-600 font-mono">13:00</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                          Lưu niệm & Tạm biệt
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Mua sắm quà lưu niệm phố Hội & Ra sân bay Đà Nẵng về lại
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Ghé chợ Hội An mua bánh đậu xanh nhân thịt, lồng đèn gấm thêu và trà Mót thảo mộc. Xe đưa đoàn quay về Sân bay Đà Nẵng, kết thúc chuyến đi tuyệt vời.
                      </p>
                    </div>
                    <div className="text-right sm:flex-shrink-0 text-xs">
                      <span className="font-bold text-teal-700 block">Kết thúc</span>
                      <span className="text-[10px] text-slate-400">Chuyến bay chiều</span>
                    </div>
                  </div>

                </div>
              </section>
            )}

            {/* Bottom Advice Box from AI */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-50 via-slate-50 to-amber-50/60 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Lightbulb className="w-6 h-6 text-amber-100" />
              </div>
              <div className="flex-1 space-y-1.5">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  Lời khuyên hành trình từ WanderAI
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Thời điểm lý tưởng nhất để lên đỉnh Bà Nà Hills là lúc <strong>08:00 sáng</strong>. Đặt trước vé điện tử trên app WanderAI để quét mã QR trực tiếp tại cổng cáp treo, giúp bạn tiết kiệm trung bình <strong>30 - 45 phút xếp hàng</strong> vào những ngày cuối tuần.
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs pt-1">
                  <a href="#" className="font-bold text-sky-700 hover:underline flex items-center gap-1">
                    <span>Xem bản đồ offline khu vực phố cổ</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                  <span className="text-slate-300">•</span>
                  <a href="#" className="font-bold text-sky-700 hover:underline flex items-center gap-1">
                    <span>Đặt vé Sun World ưu đãi độc quyền WanderAI (-10%)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Sticky Floating Quick Bar (Bottom Viewport Assist) */}
            <div className="sticky bottom-6 z-40 p-2.5 sm:p-3 rounded-full bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 pl-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Check className="w-4 h-4 text-amber-700" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-xs text-slate-900 block font-bold">
                    Đã tính toán xong {duration}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Chi phí dự toán: {estimatedTotal.toLocaleString('vi-VN')}đ (Tiết kiệm {surplus.toLocaleString('vi-VN')}đ)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Tùy chỉnh chặng</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveItinerary}
                  className={`px-5 py-2 rounded-full text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSaved
                      ? 'bg-emerald-600 text-white'
                      : 'bg-sky-700 hover:bg-sky-800 text-white'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>{isSaved ? 'Đã Lưu' : 'Lưu hành trình'}</span>
                </button>
              </div>
            </div>

          </main>
        </div>

      </div>

    </div>
  );
};
export default AIPlannerPage;
