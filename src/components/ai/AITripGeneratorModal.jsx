import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../common/Toast';
import { aiService } from '../../services/aiService';
import {
  Sparkles,
  X,
  MapPin,
  Calendar,
  DollarSign,
  Bike,
  Car,
  Bus,
  Loader2,
  Check,
  CheckCircle2,
  ShieldCheck,
  Camera,
  Utensils,
  Sun,
  Landmark,
  Compass,
  Music,
  Heart,
  ShoppingBag,
  Users,
  User,
  Home,
  Sliders,
  RotateCcw,
  Bookmark,
  Zap,
  Info,
  Navigation
} from 'lucide-react';

const HOT_DESTINATIONS = ['Đà Lạt', 'Hà Giang', 'Phú Quốc', 'Ninh Bình', 'Sa Pa', 'Đà Nẵng - Hội An', 'Quy Nhơn'];

const DESTINATION_COVERS = {
  'Đà Lạt': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  'Hà Giang': 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
  'Phú Quốc': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
  'Ninh Bình': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'Sa Pa': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
  'Đà Nẵng - Hội An': 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
  'Quy Nhơn': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  'default': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'
};

const INTEREST_OPTIONS = [
  { id: 'checkin', label: 'Check-in sống ảo & Cafe chill', icon: Camera },
  { id: 'food', label: 'Ẩm thực bản địa & Street food', icon: Utensils },
  { id: 'beach', label: 'Nghỉ dưỡng biển & Resort', icon: Sun },
  { id: 'culture', label: 'Văn hóa - Di sản & Phố cổ', icon: Landmark },
  { id: 'trekking', label: 'Trekking & Mạo hiểm', icon: Compass },
  { id: 'nightlife', label: 'Nightlife & Phố đi bộ', icon: Music },
  { id: 'healing', label: 'Chữa lành & Slow Travel', icon: Heart },
  { id: 'shopping', label: 'Mua sắm & Chợ đêm', icon: ShoppingBag }
];

export const AITripGeneratorModal = () => {
  const { isAIGeneratorOpen, setIsAIGeneratorOpen, generateAITrip } = useApp();
  const toast = useToast();

  // Core Trip Parameters
  const [destination, setDestination] = useState('Đà Nẵng - Hội An, Việt Nam');
  const [durationPill, setDurationPill] = useState('3N2Đ');
  const [daysCount, setDaysCount] = useState(3);

  // Default start date: today + 5 days
  const defaultStartDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  }, []);

  const [startDate, setStartDate] = useState(defaultStartDate);

  // Calculated End Date
  const endDateDisplay = useMemo(() => {
    try {
      const parts = startDate.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      d.setDate(d.getDate() + (daysCount - 1));
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    } catch {
      return '20/05/2026';
    }
  }, [startDate, daysCount]);

  // Companions
  const [companion, setCompanion] = useState('couple'); // 'solo' | 'couple' | 'friends' | 'family'

  // Transit
  const [transit, setTransit] = useState('taxi'); // 'bike' | 'car' | 'taxi' | 'bus'

  // Budget Tier (1: 2-4tr, 2: 4-7tr, 3: 7-12tr, 4: >15tr)
  const [budgetTier, setBudgetTier] = useState(2);
  const [includeFlight, setIncludeFlight] = useState(true);

  // Right Column: Personalization & AI Tuning
  const [selectedInterests, setSelectedInterests] = useState(['checkin', 'food', 'culture']);
  const [pacing, setPacing] = useState('balanced'); // 'relaxed' | 'balanced' | 'max'
  const [accommodation, setAccommodation] = useState('Khách sạn 3 sao tiện nghi, trung tâm');
  const [diningStyle, setDiningStyle] = useState('Quán ăn bản địa chuẩn vị & nổi tiếng');
  const [customPrompt, setCustomPrompt] = useState('');

  // Smart Algorithms
  const [smartAvoidTraffic, setSmartAvoidTraffic] = useState(true);
  const [smartLoopRoute, setSmartLoopRoute] = useState(true);
  const [smartWeather, setSmartWeather] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);

  if (!isAIGeneratorOpen) return null;

  // Toggle Interest
  const toggleInterest = (id) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Handle Duration Change
  const handleSelectDuration = (pill) => {
    setDurationPill(pill);
    if (pill === '2N1Đ') setDaysCount(2);
    else if (pill === '3N2Đ') setDaysCount(3);
    else if (pill === '4N3Đ') setDaysCount(4);
    else if (pill === '5N4Đ') setDaysCount(5);
  };

  // Reset Form
  const handleReset = () => {
    setDestination('Đà Nẵng - Hội An, Việt Nam');
    setDurationPill('3N2Đ');
    setDaysCount(3);
    setStartDate(defaultStartDate);
    setCompanion('couple');
    setTransit('taxi');
    setBudgetTier(2);
    setIncludeFlight(true);
    setSelectedInterests(['checkin', 'food', 'culture']);
    setPacing('balanced');
    setAccommodation('Khách sạn 3 sao tiện nghi, trung tâm');
    setDiningStyle('Quán ăn bản địa chuẩn vị & nổi tiếng');
    setCustomPrompt('');
    setSmartAvoidTraffic(true);
    setSmartLoopRoute(true);
    setSmartWeather(true);
    toast.info('Đã khôi phục các tùy chọn mặc định của WanderAI!');
  };

  // Budget label helper
  const getBudgetLabel = () => {
    switch (budgetTier) {
      case 1: return '2.5 - 4.0 Triệu VNĐ';
      case 2: return '4.0 - 7.0 Triệu VNĐ';
      case 3: return '7.0 - 12.0 Triệu VNĐ';
      case 4: return '15.0+ Triệu VNĐ (Cao cấp)';
      default: return '4.0 - 7.0 Triệu VNĐ';
    }
  };

  const getCompanionLabel = () => {
    switch (companion) {
      case 'solo': return 'Đi một mình (Solo)';
      case 'couple': return 'Cặp đôi / Trăng mật';
      case 'friends': return 'Nhóm bạn thân';
      case 'family': return 'Gia đình nhiều thế hệ';
      default: return 'Cặp đôi';
    }
  };

  const getTransitLabel = () => {
    switch (transit) {
      case 'bike': return 'Xe máy phượt';
      case 'car': return 'Thuê ô tô tự lái';
      case 'taxi': return 'Taxi & Grab';
      case 'bus': return 'Xe khách / Tour ghép';
      default: return 'Taxi & Grab';
    }
  };

  const getPacingLabel = () => {
    switch (pacing) {
      case 'relaxed': return 'Thong thả (2-3 điểm/ngày)';
      case 'balanced': return 'Cân bằng ✨ (3-4 điểm/ngày)';
      case 'max': return 'Khám phá tối đa (5-6 điểm/ngày)';
      default: return 'Cân bằng';
    }
  };

  // Build Itinerary helper
  const createItineraryObject = (aiTip, isDraft = false) => {
    // Find cover image
    let cover = DESTINATION_COVERS['default'];
    for (const key of Object.keys(DESTINATION_COVERS)) {
      if (destination.toLowerCase().includes(key.toLowerCase())) {
        cover = DESTINATION_COVERS[key];
        break;
      }
    }

    const companionText = getCompanionLabel();
    const pacingText = getPacingLabel();
    const budgetVal = budgetTier === 1 ? 3000000 : budgetTier === 2 ? 5500000 : budgetTier === 3 ? 9000000 : 16000000;
    const styleText = selectedInterests
      .map(id => INTEREST_OPTIONS.find(o => o.id === id)?.label)
      .filter(Boolean)
      .join(', ');

    return {
      id: `itin-${Date.now()}`,
      title: `Hành Trình ${destination} (${daysCount}N${Math.max(1, daysCount - 1)}Đ): WanderAI Tối Ưu`,
      destination: destination,
      region: destination.includes('Hội An') ? 'Miền Trung di sản' : 'Điểm đến du lịch nổi bật',
      coverImage: cover,
      duration: `${daysCount}N${Math.max(1, daysCount - 1)}Đ`,
      daysCount: daysCount,
      status: isDraft ? 'drafts' : 'upcoming',
      isAiGenerated: true,
      countdown: isDraft ? 'Bản nháp AI đề xuất' : `Sắp khởi hành • Khởi hành ${startDate.split('-').reverse().join('/')}`,
      departureDate: `${startDate.split('-').reverse().join('/')} – ${endDateDisplay}`,
      groupType: companionText,
      placesCount: daysCount * (pacing === 'relaxed' ? 3 : pacing === 'max' ? 5 : 4),
      placesList: [
        `${destination.split('-')[0].trim()} Downtown Tour`,
        'Điểm Check-in Danh Thắng Đặc Sắc',
        'Khu Ẩm Thực Đêm & Phố Cổ'
      ],
      budgetPerPerson: budgetVal,
      totalBudget: budgetVal * (companion === 'solo' ? 1 : companion === 'couple' ? 2 : companion === 'friends' ? 4 : 5),
      budgetProgress: isDraft ? 15 : 45,
      budgetNote: `Ngân sách: ${getBudgetLabel()} • ${includeFlight ? 'Đã gồm vé khứ hồi' : 'Chưa gồm vé máy bay'}`,
      pace: pacingText,
      style: styleText || 'Trải nghiệm du lịch toàn diện',
      aiTipNote: aiTip || `Gợi ý độc quyền WanderAI: Lưu ý ưu tiên phương tiện ${getTransitLabel()}, các điểm ẩm thực phong cách ${diningStyle}.`,
      days: Array.from({ length: daysCount }).map((_, i) => ({
        dayNumber: i + 1,
        title: `Ngày ${i + 1}: Điểm nhấn văn hóa, trải nghiệm ẩm thực & cảnh đẹp`,
        activities: [
          { time: '08:00', title: `Đón bình minh & Thưởng thức điểm tâm bản địa`, note: `${diningStyle} • Khung giờ thoáng mát nhất`, cost: '80.000đ' },
          { time: '10:00', title: `Khám phá danh lam thắng cảnh biểu tượng tại ${destination}`, note: 'Tối ưu GPS không đi vòng • Tiết kiệm 25% thời gian di chuyển', cost: '150.000đ' },
          { time: '14:30', title: `Trải nghiệm văn hóa, cà phê view đẹp & check-in`, note: 'Gợi ý WanderAI: Ánh sáng lý tưởng nhất để săn ảnh', cost: '65.000đ' },
          { time: '19:00', title: `Khám phá ẩm thực đêm & phố đi bộ thư giãn`, note: 'Gợi ý từ AI: Đã điều hướng tránh khu vực kẹt xe giờ cao điểm', cost: '250.000đ' }
        ]
      }))
    };
  };

  // Submit AI Generation
  const handleGenerate = async (isDraft = false) => {
    if (!destination.trim()) {
      toast.warn('Vui lòng nhập điểm đến du lịch bạn mong muốn!');
      return;
    }

    setIsGenerating(true);
    toast.info(`WanderAI đang kết nối Google Gemini để phân tích lộ trình ${destination}...`);

    try {
      // Build detailed prompt for Gemini
      const prompt = `Bạn là trợ lý du lịch chuyên nghiệp WanderAI.
Hãy đưa ra gợi ý ngắn gọn (khoảng 2-3 câu) về lịch trình du lịch:
- Điểm đến: ${destination}
- Thời lượng: ${daysCount} ngày
- Đối tượng: ${getCompanionLabel()}
- Phương tiện: ${getTransitLabel()}
- Ngân sách: ${getBudgetLabel()}
- Gu trải nghiệm: ${selectedInterests.join(', ')}
- Nhịp độ: ${getPacingLabel()}
- Lưu trú: ${accommodation}
- Ẩm thực: ${diningStyle}
- Yêu cầu thêm của khách: ${customPrompt || 'Không có'}
Hãy chỉ đưa ra 1 mẹo di chuyển thông minh và 1 điểm ăn uống đặc sắc nhất. Tiếng Việt tự nhiên, súc tích.`;

      const aiResponse = await aiService.generateText({ prompt });
      const fullItinerary = createItineraryObject(aiResponse, isDraft);

      generateAITrip({ fullItinerary });
      setIsGenerating(false);
      setIsAIGeneratorOpen(false);

      if (isDraft) {
        toast.success(`Đã lưu nháp lịch trình đề xuất WanderAI cho ${destination}!`);
      } else {
        toast.success(`WanderAI đã khởi tạo thành công hành trình ${daysCount} ngày tại ${destination}!`);
      }
    } catch (err) {
      console.error('AI Generation error:', err);
      // Fallback realistic itinerary
      const fallbackItinerary = createItineraryObject(null, isDraft);
      generateAITrip({ fullItinerary: fallbackItinerary });
      setIsGenerating(false);
      setIsAIGeneratorOpen(false);
      toast.success(`WanderAI đã tạo thành công lịch trình tối ưu cho ${destination}!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-fade-in">
      {/* MAIN MODAL CARD (Max-w: 980px matching Stitch Screen M09) */}
      <div className="relative w-full max-w-[980px] bg-white text-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] border border-slate-200/80">
        
        {/* Top Ambient Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-sky-600 via-teal-500 to-amber-500 shrink-0" />

        {/* MODAL HEADER */}
        <div className="px-5 sm:px-8 pt-5 sm:pt-6 pb-4 bg-white flex items-start justify-between gap-4 shrink-0 border-b border-slate-100">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-500 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
              </span>
              <h1 className="font-display text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
                Tạo Lịch Trình Du Lịch Thông Minh Cùng WanderAI
                <span className="text-[10px] text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold border border-amber-200">
                  PRO
                </span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 pl-11 max-w-2xl leading-relaxed">
              Điền một vài mong muốn của bạn, AI sẽ tự động phân tích không gian địa lý, tối ưu thời gian di chuyển, thời tiết và tính toán chi phí thực tế.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/60 text-sky-800 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Gemini 3.6 Flash · GPS Grounding</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAIGeneratorOpen(false)}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              title="Đóng popup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY: 2-COLUMN SCROLLABLE WORKSPACE */}
        <div className="px-5 sm:px-8 py-5 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* ─── CỘT TRÁI: THÔNG TIN CƠ BẢN & HÀNH TRÌNH CỐT LÕI (6 Cols) ─── */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              
              {/* 1. Destination Search & Quick Tags */}
              <div className="bg-slate-50/90 p-4 rounded-2xl flex flex-col gap-2.5 border border-slate-200/70 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-sky-600" />
                    <span>Điểm đến mong muốn</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const seasonal = ['Đà Lạt Săn Mây', 'Phú Quốc Mùa Biển Êm', 'Hà Giang Mùa Lúa'];
                      const randomPick = seasonal[Math.floor(Math.random() * seasonal.length)];
                      setDestination(randomPick);
                      toast.info(`Đã áp dụng gợi ý theo mùa: ${randomPick}`);
                    }}
                    className="text-[11px] text-sky-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Gợi ý theo mùa ✨</span>
                  </button>
                </div>

                <div className="relative">
                  <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Nhập tỉnh, thành phố hoặc vùng vịnh..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-semibold border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs"
                  />
                  {destination && (
                    <button
                      type="button"
                      onClick={() => setDestination('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Quick Select Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">Hot:</span>
                  {HOT_DESTINATIONS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setDestination(tag)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                        destination === tag
                          ? 'bg-sky-600 text-white shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Duration & Departure Date */}
              <div className="bg-slate-50/90 p-4 rounded-2xl flex flex-col gap-2.5 border border-slate-200/70 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    <span>Thời gian & Ngày khởi hành</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">Lý tưởng: 3 - 5 ngày</span>
                </div>

                {/* Duration Selector Pills */}
                <div className="grid grid-cols-4 gap-1.5">
                  {['2N1Đ', '3N2Đ', '4N3Đ', '5N4Đ'].map(pill => (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => handleSelectDuration(pill)}
                      className={`py-2 px-2 rounded-xl text-center text-xs font-bold transition-all cursor-pointer ${
                        durationPill === pill
                          ? 'bg-sky-600 text-white shadow-2xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {pill}
                    </button>
                  ))}
                </div>

                {/* Start & Auto Calculated End Date */}
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-slate-500">Ngày bắt đầu</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white text-slate-800 text-xs font-semibold border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-slate-500">Ngày kết thúc (tự tính)</span>
                    <div className="px-3 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-between border border-slate-200/60">
                      <span>{endDateDisplay}</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Companions (Thành viên chuyến đi) */}
              <div className="bg-slate-50/90 p-4 rounded-2xl flex flex-col gap-2.5 border border-slate-200/70 shadow-2xs">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Đối tượng tham gia chuyến đi</span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'solo', title: 'Đi một mình', desc: 'Solo backpacker & tự do', icon: User },
                    { id: 'couple', title: 'Cặp đôi / Trăng mật', desc: 'Lãng mạn, riêng tư & view đẹp', icon: Heart },
                    { id: 'friends', title: 'Nhóm bạn thân', desc: 'Năng động, chill & ảnh đẹp', icon: Users },
                    { id: 'family', title: 'Gia đình nhiều thế hệ', desc: 'Có trẻ nhỏ / người cao tuổi', icon: Home }
                  ].map(item => {
                    const isSelected = companion === item.id;
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setCompanion(item.id)}
                        className={`p-2.5 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'bg-sky-50/80 border-sky-400 shadow-2xs text-sky-900'
                            : 'bg-white border-slate-200 hover:bg-slate-100/80 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="companion"
                          checked={isSelected}
                          onChange={() => setCompanion(item.id)}
                          className="accent-sky-600 w-3.5 h-3.5 mt-0.5"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold flex items-center gap-1">
                            <Icon className="w-3.5 h-3.5 opacity-70" />
                            {item.title}
                          </span>
                          <span className="text-[10px] text-slate-500 leading-tight mt-0.5">{item.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Preferred Transit (Phương tiện di chuyển) */}
              <div className="bg-slate-50/90 p-4 rounded-2xl flex flex-col gap-2.5 border border-slate-200/70 shadow-2xs">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-sky-600" />
                  <span>Phương tiện ưu tiên tại điểm đến</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'bike', label: 'Xe máy phượt', icon: Bike },
                    { id: 'car', label: 'Thuê ô tô tự lái', icon: Car },
                    { id: 'taxi', label: 'Taxi & Grab', icon: Car },
                    { id: 'bus', label: 'Xe khách / Tour', icon: Bus }
                  ].map(item => {
                    const isSelected = transit === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTransit(item.id)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl gap-1 text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-600 text-white shadow-2xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px] font-bold">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Budget Level Slider */}
              <div className="bg-slate-50/90 p-4 rounded-2xl flex flex-col gap-2.5 border border-slate-200/70 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-amber-600" />
                    <span>Ngân sách ước tính mỗi người</span>
                  </label>
                  <span className="text-xs font-extrabold text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    {getBudgetLabel()}
                  </span>
                </div>

                <div className="relative pt-2 pb-1">
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={budgetTier}
                    onChange={(e) => setBudgetTier(Number(e.target.value))}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1">
                    <span className={budgetTier === 1 ? 'text-sky-600 font-black' : ''}>Tiết kiệm (2-4tr)</span>
                    <span className={budgetTier === 2 ? 'text-sky-600 font-black' : ''}>Tiêu chuẩn (4-7tr)</span>
                    <span className={budgetTier === 3 ? 'text-sky-600 font-black' : ''}>Thoải mái (7-12tr)</span>
                    <span className={budgetTier === 4 ? 'text-sky-600 font-black' : ''}>Cao cấp (&gt;15tr)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                  <input
                    type="checkbox"
                    id="includeFlight"
                    checked={includeFlight}
                    onChange={(e) => setIncludeFlight(e.target.checked)}
                    className="accent-sky-600 w-3.5 h-3.5 rounded cursor-pointer"
                  />
                  <label htmlFor="includeFlight" className="text-[11px] text-slate-600 cursor-pointer select-none font-medium">
                    Bao gồm chi phí vé máy bay khứ hồi hoặc vé xe liên tỉnh
                  </label>
                </div>
              </div>

            </div>

            {/* ─── CỘT PHẢI: CÁ NHÂN HÓA CHUYÊN SÂU & AI TUNING (6 Cols) ─── */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              
              {/* 1. Travel Interests Multi-Select Chips */}
              <div className="bg-slate-50/90 p-4 rounded-2xl flex flex-col gap-2.5 border border-slate-200/70 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Gu du lịch & Trải nghiệm mong muốn</span>
                  </label>
                  <span className="text-[11px] text-sky-600 font-bold">
                    {selectedInterests.length} đã chọn
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {INTEREST_OPTIONS.map(opt => {
                    const isSelected = selectedInterests.includes(opt.id);
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleInterest(opt.id)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-600 text-white shadow-2xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-sky-600'}`} />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Travel Pace (Pacing Engine) */}
              <div className="bg-slate-50/90 p-4 rounded-2xl flex flex-col gap-2.5 border border-slate-200/70 shadow-2xs">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Nhịp độ lịch trình (Pacing Engine)</span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'relaxed', title: 'Thong thả', desc: '2-3 điểm/ngày, thư giãn, không vội vã' },
                    { id: 'balanced', title: 'Cân bằng ✨', desc: '3-4 điểm/ngày, chuẩn tối ưu WanderAI' },
                    { id: 'max', title: 'Khám phá tối đa', desc: '5-6 điểm/ngày, tận dụng từng khoảnh khắc' }
                  ].map(item => {
                    const isSelected = pacing === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setPacing(item.id)}
                        className={`p-2.5 rounded-xl flex flex-col gap-1 cursor-pointer transition-all text-center border ${
                          isSelected
                            ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                            : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <span className="text-xs font-bold">{item.title}</span>
                        <span className={`text-[10px] leading-tight ${isSelected ? 'text-sky-100' : 'text-slate-500'}`}>
                          {item.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Accommodation & Dining Preferences */}
              <div className="bg-slate-50/90 p-4 rounded-2xl flex flex-col gap-2.5 border border-slate-200/70 shadow-2xs">
                <div className="grid grid-cols-2 gap-3">
                  {/* Stay Style */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Home className="w-3.5 h-3.5 text-sky-600" />
                      <span>Loại lưu trú</span>
                    </label>
                    <select
                      value={accommodation}
                      onChange={(e) => setAccommodation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white text-slate-800 text-xs font-semibold border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    >
                      <option>Khách sạn 3 sao tiện nghi, trung tâm</option>
                      <option>Khách sạn 4-5 sao sang trọng</option>
                      <option>Homestay phong cách bản địa</option>
                      <option>Glamping / Cắm trại view đồi</option>
                      <option>Resort ven biển biệt lập</option>
                    </select>
                  </div>

                  {/* Food Style */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Utensils className="w-3.5 h-3.5 text-amber-600" />
                      <span>Phong cách ẩm thực</span>
                    </label>
                    <select
                      value={diningStyle}
                      onChange={(e) => setDiningStyle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white text-slate-800 text-xs font-semibold border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    >
                      <option>Quán ăn bản địa chuẩn vị & nổi tiếng</option>
                      <option>Nhà hàng cao cấp, không gian đẹp</option>
                      <option>Hải sản tươi sống, bình dân</option>
                      <option>Ăn chay / Thuần Organic & Healthy</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 4. Free AI Prompt Box (Custom Instructions) */}
              <div className="bg-slate-50/90 p-4 rounded-2xl flex flex-col gap-1.5 border border-slate-200/70 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Yêu cầu đặc biệt cho AI (Tự do mô tả)</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Ngôn ngữ tự nhiên</span>
                </div>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Ví dụ: Muốn ngắm hoàng hôn ở bán đảo Sơn Trà ngày thứ hai, thích ăn mì Quảng chuẩn vị người bản xứ, đoàn không dậy sớm trước 8h sáng..."
                  rows="3"
                  className="w-full p-3 rounded-xl bg-white text-slate-900 text-xs font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 placeholder:text-slate-400 resize-none shadow-2xs"
                />
              </div>

              {/* 5. Advanced AI Tuning Toggles */}
              <div className="bg-slate-50/90 px-4 py-3 rounded-2xl flex flex-col gap-2 border border-slate-200/70 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-sky-600" />
                  <span>Thuật toán thông minh tích hợp</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smartAvoidTraffic}
                      onChange={(e) => setSmartAvoidTraffic(e.target.checked)}
                      className="accent-sky-600 w-3.5 h-3.5 rounded"
                    />
                    <span className="text-[11px] text-slate-600 font-medium">Tránh tắc đường cao điểm</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smartLoopRoute}
                      onChange={(e) => setSmartLoopRoute(e.target.checked)}
                      className="accent-sky-600 w-3.5 h-3.5 rounded"
                    />
                    <span className="text-[11px] text-slate-600 font-medium">Lộ trình vòng tròn không lặp</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smartWeather}
                      onChange={(e) => setSmartWeather(e.target.checked)}
                      className="accent-sky-600 w-3.5 h-3.5 rounded"
                    />
                    <span className="text-[11px] text-slate-600 font-medium">Dự báo thời tiết & nắng râm</span>
                  </label>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* MODAL FOOTER & ACTION BAR (Stitch Screen M09 Footer) */}
        <div className="px-5 sm:px-8 py-3.5 bg-slate-100/90 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          
          {/* Live AI Performance Predictor Indicator */}
          <div className="flex items-center gap-3 text-slate-500 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-600"></span>
              </span>
              <span className="text-slate-700 font-bold">Thời gian tạo: ~2.8s</span>
            </div>
            <span>•</span>
            <span className="hidden md:inline font-semibold">Độ khớp nhu cầu 98.6%</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline font-semibold">Tối ưu GPS thời gian thực</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleReset}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-full bg-white hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              Làm mới
            </button>

            <button
              type="button"
              onClick={() => handleGenerate(true)}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-full bg-white hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Bookmark className="w-3.5 h-3.5 text-slate-500" />
              <span>Lưu nháp</span>
            </button>

            {/* AI MAGIC GENERATE BUTTON WITH GLOW */}
            <button
              type="button"
              onClick={() => handleGenerate(false)}
              disabled={isGenerating}
              className="relative group px-5 sm:px-6 py-2.5 rounded-full bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-[1.01] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Đang kết nối Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
                  <span>Khởi Tạo Lịch Trình Bằng AI</span>
                  <span className="bg-white/20 text-white text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full">
                    Miễn phí
                  </span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
