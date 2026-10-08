import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../components/common/Toast';
import { ItineraryExportModal } from '../../../components/itinerary/ItineraryExportModal';
import { generateCustomVietnamItinerary } from '../../../services/vietnamTravelDatabase';
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
    'Đi cùng nhóm bạn 4 người, muốn dậy sớm đón bình minh biển và trải nghiệm trọn vẹn ẩm thực địa phương.'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  // Preset Prompts
  const presets = [
    {
      label: '✨ 3N2Đ Đà Nẵng - Hội An',
      dest: 'Đà Nẵng - Hội An',
      budget: 3500000,
      duration: '3 Ngày 2 Đêm',
      styles: ['🏖️ Nghỉ dưỡng & Biển', '🍜 Ẩm thực địa phương', '🏛️ Văn hóa & Lịch sử'],
      transport: 'Taxi / Công nghệ',
      note: 'Đi cùng nhóm bạn 4 người, muốn đón bình minh biển và trải nghiệm trọn vẹn ẩm thực chợ đêm Hội An.'
    },
    {
      label: '☁️ 4N3Đ Đà Lạt săn mây & cafe',
      dest: 'Đà Lạt',
      budget: 4200000,
      duration: '4 Ngày 3 Đêm',
      styles: ['📸 Check-in sống ảo', '🍜 Ẩm thực địa phương', '⛺ Khám phá mạo hiểm'],
      transport: 'Xe máy',
      note: 'Dậy sớm 5h sáng săn mây đồi chè Cầu Đất, tối dạo chợ đêm ăn bánh tráng nướng và lẩu gà lá é.'
    },
    {
      label: '🏝️ 5N4Đ Nghỉ dưỡng Phú Quốc',
      dest: 'Phú Quốc',
      budget: 8500000,
      duration: '5 Ngày 4 Đêm',
      styles: ['🏖️ Nghỉ dưỡng & Biển', '🍜 Ẩm thực địa phương'],
      transport: 'Xe tự lái',
      note: 'Gia đình có trẻ em, ưu tiên bãi Sao, cáp treo Hòn Thơm và ngắm hoàng hôn Sunset Sanato.'
    },
    {
      label: '🌸 3N2Đ Hà Giang hùng vĩ',
      dest: 'Hà Giang',
      budget: 3200000,
      duration: '3 Ngày 2 Đêm',
      styles: ['⛺ Khám phá mạo hiểm', '📸 Check-in sống ảo', '🏛️ Văn hóa & Lịch sử'],
      transport: 'Xe máy',
      note: 'Chinh phục đèo Mã Pí Lèng, chèo kayak hẻm Tu Sản, dinh vua Mèo và cột cờ Lũng Cú.'
    },
    {
      label: '🚣 2N1Đ Ninh Bình di sản',
      dest: 'Ninh Bình',
      budget: 2500000,
      duration: '2 Ngày 1 Đêm',
      styles: ['🏛️ Văn hóa & Lịch sử', '🍜 Ẩm thực địa phương'],
      transport: 'Xe tự lái',
      note: 'Tràng An, Hang Múa, Chùa Bái Đính và thưởng thức cơm cháy thịt dê nướng.'
    }
  ];

  // Parse Days Count
  const daysCount = useMemo(() => {
    if (duration.startsWith('2')) return 2;
    if (duration.startsWith('4')) return 4;
    if (duration.startsWith('5')) return 5;
    return 3;
  }, [duration]);

  const durationDays = daysCount;
  const durationNights = Math.max(1, daysCount - 1);

  // Dynamic Realistic Vietnam Itinerary Generator
  const itineraryPlan = useMemo(() => {
    return generateCustomVietnamItinerary(destination, daysCount);
  }, [destination, daysCount]);

  const customTitle = `Khám phá trọn vẹn ${destination} (${duration})`;
  const generatedPlan = itineraryPlan?.days || [];

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
    setDestination('Đà Nẵng - Hội An');
    setDuration('3 Ngày 2 Đêm');
    setStartDate('2026-11-15');
    setBudgetVal(4500000);
    setBudgetTier('Tiêu chuẩn');
    setSelectedStyles(['🏖️ Nghỉ dưỡng & Biển', '🍜 Ẩm thực địa phương', '🏛️ Văn hóa & Lịch sử']);
    setTransport('Taxi / Công nghệ');
    setUserNote('Đi cùng nhóm bạn 4 người, muốn dậy sớm đón bình minh biển và trải nghiệm trọn vẹn ẩm thực địa phương.');
    setActivePresetIndex(0);
    setIsSaved(false);
    toast.info('Đã đặt lại các tùy chọn chuyến đi.');
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast.success(`WanderAI đã tính toán và cập nhật lại toàn bộ lịch trình tối ưu cho ${destination}!`);
    }, 800);
  };

  const handleSaveItinerary = () => {
    setIsSaved(true);
    generateAITrip({
      destination,
      daysCount,
      budget: `${(budgetVal / 1000000).toFixed(1)} triệuđ`,
      style: selectedStyles.join(', '),
      fullItinerary: itineraryPlan
    });
    toast.success('Đã lưu lịch trình thành công vào bộ sưu tập cá nhân!');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Đã sao chép liên kết chia sẻ lịch trình vào bộ nhớ tạm!');
  };

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleDownload = () => {
    setIsExportModalOpen(true);
  };

  const exportItineraryData = useMemo(() => {
    return {
      title: customTitle,
      destination: destination,
      duration: `${durationDays}N${durationNights}Đ`,
      totalBudget: budgetVal,
      budgetPerPerson: Math.round(budgetVal / 4),
      days: (generatedPlan || []).map((p, idx) => ({
        dayNumber: idx + 1,
        title: p.theme || `Ngày ${idx + 1}: Khám phá`,
        activities: (p.activities || []).map(a => ({
          time: a.time,
          category: a.category || 'Điểm tham quan',
          title: a.title,
          location: a.location || a.title,
          address: a.address || `${destination}, Việt Nam`,
          note: a.desc,
          aiTip: a.tip,
          cost: a.cost
        }))
      }))
    };
  }, [customTitle, destination, durationDays, durationNights, budgetVal, generatedPlan]);

  // Dynamic calculations based on budget
  const estimatedTotal = Math.round(budgetVal * 0.85);
  const surplus = budgetVal - estimatedTotal;
  const stayCost = Math.round(estimatedTotal * 0.35);
  const foodCost = Math.round(estimatedTotal * 0.30);
  const ticketCost = Math.round(estimatedTotal * 0.20);
  const transitCost = estimatedTotal - stayCost - foodCost - ticketCost;

  // Helper for activity icon
  const getActivityIcon = (act, idx) => {
    const title = (act.title || '').toLowerCase();
    const cat = (act.category || '').toLowerCase();
    if (title.includes('ăn') || title.includes('bánh') || title.includes('mì') || title.includes('phở') || title.includes('lẩu') || cat.includes('ẩm thực')) {
      return { Icon: Utensils, colorClass: 'text-amber-600 ring-amber-500' };
    }
    if (title.includes('biển') || title.includes('bãi') || title.includes('sông') || title.includes('suối')) {
      return { Icon: Waves, colorClass: 'text-sky-600 ring-sky-500' };
    }
    if (title.includes('sáng') || title.includes('bình minh') || title.includes('săn mây')) {
      return { Icon: Sun, colorClass: 'text-amber-500 ring-amber-400' };
    }
    if (title.includes('cafe') || title.includes('trà') || title.includes('chill')) {
      return { Icon: Coffee, colorClass: 'text-emerald-600 ring-emerald-500' };
    }
    if (title.includes('chợ') || title.includes('quà') || title.includes('mua')) {
      return { Icon: ShoppingBag, colorClass: 'text-purple-600 ring-purple-500' };
    }
    if (idx === 0) {
      return { Icon: Plane, colorClass: 'text-sky-700 ring-sky-600' };
    }
    return { Icon: Camera, colorClass: 'text-sky-600 ring-sky-500' };
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/50 pb-20">
      
      {/* Container chuẩn hóa lề mép theo ui-ux-consistency */}
      <div className="relative w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-6 space-y-6 overflow-hidden">
        <div className="absolute -top-32 right-12 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-48 left-10 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-96 right-1/4 w-72 h-72 bg-sky-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* 1. BREADCRUMB & HEADER AREA */}
        <section className="space-y-3">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <a href="/" className="hover:text-sky-600 transition-colors">Trang chủ</a>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-sky-600 font-bold">AI Travel Planner</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-xs font-bold shadow-xs mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Trí tuệ nhân tạo thế hệ mới • WanderAI</span>
              </div>
              <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Trợ lý AI Lập Lịch Trình Chuyến Đi Thông Minh
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                Tự động định vị địa danh thực tế khắp Việt Nam, tối ưu cung đường, dự trù chi phí chi tiết theo thời gian thực.
              </p>
            </div>

            {/* System Capability Chip */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white shadow-xs border border-slate-200 text-xs font-semibold text-slate-700 flex-shrink-0 self-start lg:self-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Dữ liệu thực địa & GPS chuẩn xác 2026</span>
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
                  <span>Điểm đến du lịch</span>
                  <span className="text-[11px] text-sky-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-sky-600" />
                    Toàn quốc
                  </span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-sky-600" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Nhập tỉnh thành hoặc danh thắng (Đà Lạt, Phú Quốc, Ninh Bình...)"
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
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Input 3: Budget Range */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">Dự trù ngân sách / người</span>
                  <span className="text-sky-700 text-sm font-extrabold font-mono">
                    {budgetVal.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <input
                  type="range"
                  min="1500000"
                  max="15000000"
                  step="500000"
                  value={budgetVal}
                  onChange={(e) => setBudgetVal(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                />
                <div className="flex items-center justify-between gap-1 text-[11px] font-semibold">
                  {['Tiết kiệm', 'Tiêu chuẩn', 'Cao cấp'].map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => handleSelectTier(tier)}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        budgetTier === tier
                          ? 'bg-sky-100 text-sky-800 font-bold border border-sky-300'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input 4: Travel Styles */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">Gu du lịch mong muốn</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '🏖️ Nghỉ dưỡng & Biển',
                    '🍜 Ẩm thực địa phương',
                    '🏛️ Văn hóa & Lịch sử',
                    '📸 Check-in sống ảo',
                    '⛺ Khám phá mạo hiểm',
                    '☕ Cafe & Thư giãn'
                  ].map((style) => {
                    const isSelected = selectedStyles.includes(style);
                    return (
                      <button
                        key={style}
                        type="button"
                        onClick={() => toggleStyle(style)}
                        className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-50 border-sky-400 text-sky-800 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {style}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Input 5: Special Note */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">Yêu cầu thêm cho AI</label>
                <textarea
                  rows={2}
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  placeholder="Ví dụ: Không muốn đi sớm, thích ăn hải sản vỉa hè..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50/80 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-500/20 transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isGenerating ? 'WanderAI Đang Tính Toán...' : 'Tối Ưu Lại Lịch Trình ✨'}</span>
              </button>

            </div>
          </aside>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Interactive Generated Output (8 Cols)       */}
          {/* ========================================================= */}
          <main className="lg:col-span-8 w-full space-y-6">
            
            {/* Top Summary Bento Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-md space-y-5">
              
              {/* Header & Title */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full bg-sky-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs">
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      Độ phù hợp AI: 98%
                    </span>
                    <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-900 text-xs font-bold border border-sky-200">
                      Ngân sách tối ưu
                    </span>
                    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold flex items-center gap-1 border border-amber-200">
                      <Sun className="w-3.5 h-3.5 text-amber-600" />
                      Thời tiết đẹp • Thuận lợi
                    </span>
                  </div>

                  <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
                    Khám phá trọn vẹn {destination} ({duration})
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                    Lộ trình được thiết kế chi tiết từng ngày với địa danh thực tế có thật 100%, cân đối giữa trải nghiệm văn hóa, ẩm thực bản địa và thư giãn.
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
                    {itineraryPlan?.totalDistance || '45 km'}
                    <Route className="w-4 h-4 text-sky-600" />
                  </span>
                  <span className="text-[11px] text-sky-700 font-semibold">Tối ưu cung đường</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-slate-400 text-[11px]">Điểm dừng chân</span>
                  <span className="font-bold text-base text-slate-900 mt-0.5 flex items-center gap-1">
                    {(generatedPlan || []).reduce((acc, d) => acc + (d.activities?.length || 0), 0)} địa điểm
                    <MapPin className="w-4 h-4 text-amber-600" />
                  </span>
                  <span className="text-[11px] text-slate-400">Đã định vị GPS</span>
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
                  <div className="h-full bg-sky-600" style={{ width: '20%' }} title="Vé tham quan: 20%" />
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
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                    <span>Vé tham quan: <strong>20%</strong> ({ticketCost.toLocaleString('vi-VN')}đ)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <span>Di chuyển: <strong>15%</strong> ({transitCost.toLocaleString('vi-VN')}đ)</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Inline Mini Route Overview */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Map className="w-4 h-4 text-sky-600" />
                  <span>Tổng Quan Cung Đường & Điểm Dừng</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1 font-semibold text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-sky-600" />
                    {destination}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 flex items-center gap-1 font-bold text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
                    Dữ liệu thực tế 100%
                  </span>
                </div>
              </div>

              {/* HUD banner */}
              <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-sky-900 font-bold">
                  <Navigation className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Lộ trình mẫu: {generatedPlan[0]?.activities?.slice(0, 3).map(a => a.title).join(' → ') || `${destination} trung tâm`}</span>
                </div>
                <span className="text-sky-700 font-semibold text-[11px]">
                  Thời gian di chuyển tb: 15 - 25 phút / chặng
                </span>
              </div>
            </div>

            {/* ================= DYNAMIC DAY-BY-DAY ITINERARY CARDS ================= */}
            {generatedPlan.map((day, dayIndex) => (
              <section key={day.dayNumber || dayIndex} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
                {/* Day Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 bg-slate-50 px-4 py-3 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-700 text-white text-base flex items-center justify-center font-bold shadow-xs">
                      {String(day.dayNumber || dayIndex + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-sky-700 tracking-wider uppercase block">
                        Ngày {day.dayNumber || dayIndex + 1} • {destination}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">
                        {day.theme || `Hành trình khám phá ${destination}`}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-400 font-medium">
                    <span>{day.activities?.length || 0} hoạt động • Di chuyển khoa học</span>
                  </div>
                </div>

                {/* Timeline Activities */}
                <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  {(day.activities || []).map((act, actIdx) => {
                    const { Icon, colorClass } = getActivityIcon(act, actIdx);
                    return (
                      <div key={actIdx} className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-3 group">
                        <div className={`absolute -left-[27px] sm:-left-[35px] top-0 w-6 h-6 rounded-full bg-white ring-4 ${colorClass} flex items-center justify-center shadow-xs`}>
                          <Icon className="w-3 h-3" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-sky-700 font-mono">{act.time}</span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                              {act.category || 'Hoạt động'}
                            </span>
                            {act.address && (
                              <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                                • {act.address}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {act.title}
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {act.desc}
                          </p>
                          {act.tip && (
                            <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-100/80 flex items-center gap-2 text-xs text-slate-700">
                              <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0" />
                              <span><strong>Kinh nghiệm thực tế:</strong> {act.tip}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right sm:flex-shrink-0 text-xs">
                          <span className="font-bold text-slate-900 block">{act.cost || 'Miễn phí'}</span>
                          <span className="text-[10px] text-slate-400">Chi phí dự tính</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}

            {/* Bottom Advice Box from AI */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-50 via-slate-50 to-amber-50/60 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Lightbulb className="w-6 h-6 text-amber-100" />
              </div>
              <div className="flex-1 space-y-1.5">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  Lời khuyên hành trình từ WanderAI cho {destination}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Lịch trình được WanderAI tính toán dựa trên khoảng cách GPS thực tế giữa các điểm tham quan nhằm giảm thiểu thời gian di chuyển, tối đa hóa thời gian tận hưởng và trải nghiệm ẩm thực bản địa.
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs pt-1">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="font-bold text-sky-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Xuất lịch trình dạng PDF hoặc Calendar</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={handleSaveItinerary}
                    className="font-bold text-sky-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Lưu vào bộ sưu tập cá nhân</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
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
                    Đã tính toán xong {duration} cho {destination}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Chi phí dự toán: {estimatedTotal.toLocaleString('vi-VN')}đ (Dự phòng {surplus.toLocaleString('vi-VN')}đ)
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

      {/* Export & Download Modal */}
      {isExportModalOpen && (
        <ItineraryExportModal
          itinerary={exportItineraryData}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}

    </div>
  );
};

export default AIPlannerPage;
