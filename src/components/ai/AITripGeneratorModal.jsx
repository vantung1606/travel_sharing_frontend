import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../common/Toast';
import { aiService } from '../../services/aiService';
import { Sparkles, X, MapPin, Calendar, DollarSign, Loader2, Check, CheckCircle2, Camera, Utensils, Sun, Landmark, Compass, Music, Heart, ShoppingBag, Users, User, Home, Info, Navigation, Minimize2, Maximize2, Activity, Terminal } from 'lucide-react';

const HOT_DESTINATIONS = ['Đà Lạt', 'Hà Giang', 'Phú Quốc', 'Ninh Bình', 'Sa Pa', 'Đà Nẵng - Hội An', 'Quy Nhơn'];

const DESTINATION_COVERS = {
  'Đà Lạt': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  'Hà Giang': 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
  'Phú Quốc': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
  'Ninh Bình': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'Sa Pa': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
  'Đà Nẵng - Hội An': 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
  'Quy Nhơn': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  'Hà Nội': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
  'Huế': 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80',
  'default': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'
};

const INTEREST_OPTIONS = [
  { id: 'checkin', label: 'Check-in sống ảo', icon: Camera },
  { id: 'food', label: 'Ẩm thực bản địa', icon: Utensils },
  { id: 'beach', label: 'Nghỉ dưỡng & Biển', icon: Sun },
  { id: 'culture', label: 'Văn hóa & Di sản', icon: Landmark },
  { id: 'trekking', label: 'Trekking & Phượt', icon: Compass },
  { id: 'nightlife', label: 'Phố đêm & Vui chơi', icon: Music },
  { id: 'healing', label: 'Chữa lành & Thư giãn', icon: Heart },
  { id: 'shopping', label: 'Mua sắm & Chợ', icon: ShoppingBag }
];

const AI_RESEARCH_MILESTONES = [
  { id: 1, minProgress: 20, label: 'Khởi tạo kết nối & Định vị địa lý' },
  { id: 2, minProgress: 45, label: 'Nghiên cứu danh lam, di tích thực tế' },
  { id: 3, minProgress: 75, label: 'Khảo sát ẩm thực & quán ăn đặc sản bản địa' },
  { id: 4, minProgress: 95, label: 'Tối ưu lộ trình từng ngày & Cân đối ngân sách' }
];

export const AITripGeneratorModal = () => {
  const {
    isAIGeneratorOpen,
    setIsAIGeneratorOpen,
    generateAITrip,
    aiGeneratorInitialData,
    aiGeneratingStatus,
    setAiGeneratingStatus
  } = useApp();
  const toast = useToast();

  // Core Trip Parameters
  const [destination, setDestination] = useState('Đà Nẵng - Hội An, Việt Nam');
  const [daysCount, setDaysCount] = useState(3);

  // Sync initial destination when triggered from specific spot or place
  useEffect(() => {
    if (isAIGeneratorOpen && aiGeneratorInitialData?.destination) {
      setDestination(aiGeneratorInitialData.destination);
      if (aiGeneratorInitialData.item?.name) {
        setCustomPrompt(`Lịch trình cần có điểm dừng chân trải nghiệm tại: ${aiGeneratorInitialData.item.name} (${aiGeneratorInitialData.item.category || ''}).`);
      }
    }
  }, [isAIGeneratorOpen, aiGeneratorInitialData]);

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
  const [companion, setCompanion] = useState('couple');

  // Transit
  const [transit, setTransit] = useState('taxi');

  // Budget Tier
  const [budgetTier, setBudgetTier] = useState(2);
  const [includeFlight, setIncludeFlight] = useState(true);

  // Personalization & AI Tuning
  const [selectedInterests, setSelectedInterests] = useState(['checkin', 'food', 'culture']);
  const [pacing, setPacing] = useState('balanced');
  const [accommodation, setAccommodation] = useState('Khách sạn 3 sao tiện nghi, trung tâm');
  const [diningStyle, setDiningStyle] = useState('Quán ăn bản địa chuẩn vị & nổi tiếng');
  const [customPrompt, setCustomPrompt] = useState('');

  // ─────────────────────────────────────────────────────────────────────────────
  // GÓC NHỎ MÀN HÌNH: TIẾN TRÌNH TẠO LỊCH TỪ 0 TỚI 100%
  // ─────────────────────────────────────────────────────────────────────────────
  if (!isAIGeneratorOpen) {
    if (aiGeneratingStatus?.isGenerating) {
      // 1. CHẾ ĐỘ THU NHỎ Ở GÓC MÀN HÌNH (Mini Corner Pill)
      if (!aiGeneratingStatus.isExpanded) {
        return (
          <div
            onClick={() => setAiGeneratingStatus(prev => ({ ...prev, isExpanded: true }))}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3.5 bg-slate-900/95 text-white pl-3.5 pr-3 py-2.5 rounded-2xl shadow-2xl border border-sky-400/50 backdrop-blur-xl animate-fade-in ring-1 ring-sky-500/30 cursor-pointer hover:border-sky-300 hover:scale-[1.02] transition-all group select-none"
            title="Bấm vào để xem toàn bộ quá trình AI phân tích từ 0 đến 100%"
          >
            {/* Vòng tròn tiến trình % */}
            <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
              <svg className="w-11 h-11 -rotate-90">
                <circle cx="22" cy="22" r="17" stroke="currentColor" strokeWidth="3.5" className="text-slate-800" fill="transparent" />
                <circle
                  cx="22"
                  cy="22"
                  r="17"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  className="text-sky-400 transition-all duration-300 ease-out"
                  fill="transparent"
                  strokeDasharray={107}
                  strokeDashoffset={107 - (107 * (aiGeneratingStatus.progress || 0)) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[11px] font-extrabold text-sky-300 font-mono">
                {aiGeneratingStatus.progress || 0}%
              </span>
            </div>

            <div className="text-left pr-1">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs text-white group-hover:text-sky-300 transition-colors">
                  AI Đang Nghiên Cứu: {aiGeneratingStatus.destination}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-extrabold">
                  {aiGeneratingStatus.daysCount}N
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1 max-w-[260px]">
                {aiGeneratingStatus.currentStep || 'Đang tra cứu dữ liệu thực địa...'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700/60">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAiGeneratingStatus(prev => ({ ...prev, isExpanded: true }));
                }}
                className="px-2.5 py-1.5 rounded-xl bg-sky-600/30 hover:bg-sky-600 text-sky-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                title="Bấm để mở xem quá trình từ 0 đến 100%"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Xem tiến trình</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAiGeneratingStatus({ isGenerating: false, isExpanded: false, destination: '', daysCount: 3, progress: 0, currentStep: '', logs: [] });
                }}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Đóng thanh tiến trình"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      }

      // 2. CHẾ ĐỘ MỞ RỘNG (Expanded Live Inspector - Hiển thị chi tiết từ 0 đến 100%)
      return (
        <div className="fixed bottom-6 right-6 z-50 w-[94vw] sm:w-[480px] bg-slate-900/98 text-white rounded-3xl shadow-2xl border border-sky-500/40 backdrop-blur-2xl animate-fade-in p-5 ring-1 ring-sky-500/20 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
                <Sparkles className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <span>WanderAI Live Inspector</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono font-bold">
                    Gemini 1.5 Flash
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Nghiên cứu điểm đến: <strong className="text-sky-300">{aiGeneratingStatus.destination}</strong>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setAiGeneratingStatus(prev => ({ ...prev, isExpanded: false }))}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Thu nhỏ lại góc màn hình"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setAiGeneratingStatus({ isGenerating: false, isExpanded: false, destination: '', daysCount: 3, progress: 0, currentStep: '', logs: [] })}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Thanh Tiến Trình 0% - 100% */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-sky-400" />
                <span>Tiến trình phân tích AI</span>
              </span>
              <span className="font-extrabold text-sky-400 font-mono text-base">
                {aiGeneratingStatus.progress || 0}%
              </span>
            </div>
            <div className="w-full h-3.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-300 ease-out shadow-sm"
                style={{ width: `${aiGeneratingStatus.progress || 0}%` }}
              />
            </div>
            <p className="text-xs text-sky-300 font-semibold flex items-center gap-2 pt-0.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400 shrink-0" />
              <span className="truncate">{aiGeneratingStatus.currentStep}</span>
            </p>
          </div>

          {/* 4 Cột mốc phân tích */}
          <div className="space-y-2 bg-slate-950/70 rounded-2xl p-3 border border-slate-800/80">
            {AI_RESEARCH_MILESTONES.map((m, idx) => {
              const isDone = (aiGeneratingStatus.progress || 0) >= m.minProgress;
              const isCurrent = !isDone && (idx === 0 || (aiGeneratingStatus.progress || 0) >= AI_RESEARCH_MILESTONES[idx - 1].minProgress);
              return (
                <div key={m.id} className="flex items-center gap-2.5 text-xs">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-sky-400 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                  )}
                  <span className={isDone ? 'text-slate-300 line-through opacity-80' : isCurrent ? 'text-white font-bold' : 'text-slate-500'}>
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Nhật ký xử lý thời gian thực (Live Thought Stream) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                <span>Nhật ký suy luận trực tiếp</span>
              </span>
              <span className="font-mono text-[10px] text-slate-500">{aiGeneratingStatus.logs?.length || 0} sự kiện</span>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1 font-mono text-[11px] bg-slate-950 p-3 rounded-2xl border border-slate-800 text-slate-300">
              {(aiGeneratingStatus.logs || []).map((l, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-sky-500 shrink-0">[{l.time}]</span>
                  <span className="text-slate-200">{l.message}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer nút bấm */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400 italic">
              Khi đạt 100%, kết quả sẽ tự động bung mở
            </span>
            <button
              type="button"
              onClick={() => setAiGeneratingStatus(prev => ({ ...prev, isExpanded: false }))}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Thu nhỏ góc màn hình
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  // Toggle Interest
  const toggleInterest = (id) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Handle Duration Change
  const handleSelectDuration = (count) => {
    setDaysCount(count);
  };

  // Reset Form
  const handleReset = () => {
    setDestination('Đà Nẵng - Hội An, Việt Nam');
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
    toast.showInfo('Đã khôi phục các tùy chọn mặc định của WanderAI!');
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

  // Helper lấy ảnh bìa theo điểm đến
  const getDestinationCover = (dest) => {
    const dLower = dest.toLowerCase();
    for (const key of Object.keys(DESTINATION_COVERS)) {
      if (dLower.includes(key.toLowerCase())) {
        return DESTINATION_COVERS[key];
      }
    }
    return DESTINATION_COVERS['default'];
  };

  // Helper tạo đối tượng Lịch Trình từ kết quả phân tích AI thực tế
  const buildItineraryFromAI = (parsedAI, isDraft = false) => {
    const companionText = getCompanionLabel();
    const pacingText = getPacingLabel();
    const budgetVal = budgetTier === 1 ? 3000000 : budgetTier === 2 ? 5500000 : budgetTier === 3 ? 9000000 : 16000000;
    const styleText = selectedInterests
      .map(id => INTEREST_OPTIONS.find(o => o.id === id)?.label)
      .filter(Boolean)
      .join(', ');

    const finalDays = parsedAI.days && Array.isArray(parsedAI.days) && parsedAI.days.length > 0
      ? parsedAI.days
      : [
        {
          dayNumber: 1,
          title: `Ngày 1: Khám phá điểm nhấn văn hóa & danh lam tại ${destination}`,
          activities: [
            { time: '08:00 – 09:30', category: 'Ẩm thực buổi sáng', title: `Thưởng thức điểm tâm đặc sản tại trung tâm ${destination}`, address: `Khu phố ẩm thực ${destination}`, note: 'Hương vị truyền thống địa phương', cost: '50.000đ' },
            { time: '10:00 – 12:00', category: 'Tham quan danh thắng', title: `Khám phá danh thắng nổi tiếng tại ${destination}`, address: `Trung tâm ${destination}`, note: 'Điểm check-in biểu tượng', cost: '80.000đ' },
            { time: '14:30 – 17:00', category: 'Trải nghiệm sinh thái', title: `Tham quan cảnh quan thiên nhiên & thư giãn`, address: `Khu sinh thái ${destination}`, note: 'Ngắm cảnh và chụp ảnh', cost: '60.000đ' },
            { time: '19:00 – 21:30', category: 'Phố đêm & Ẩm thực', title: `Khám phá chợ đêm & ẩm thực đường phố`, address: `Phố đi bộ ${destination}`, note: 'Thưởng thức món ăn vặt về đêm', cost: '120.000đ' }
          ]
        }
      ];

    let finalPlacesList = [];
    if (parsedAI.placesList && Array.isArray(parsedAI.placesList) && parsedAI.placesList.length > 0) {
      finalPlacesList = parsedAI.placesList.slice(0, 6);
    } else {
      finalDays.forEach(d => {
        (d.activities || []).forEach(a => {
          const clean = (a.title || '').replace(/^Thưởng thức |^Khám phá |^Chiêm bái |^Thăm |^Check-in |^Chinh phục /g, '').split(' tại ')[0].trim();
          if (clean && clean.length > 3 && !finalPlacesList.includes(clean)) {
            finalPlacesList.push(clean);
          }
        });
      });
      finalPlacesList = finalPlacesList.slice(0, 6);
    }

    return {
      id: `itin-${Date.now()}`,
      title: `Hành Trình ${destination} (${daysCount}N${Math.max(1, daysCount - 1)}Đ): Tối Ưu Thực Địa WanderAI`,
      destination: destination,
      region: 'Điểm đến du lịch Việt Nam',
      coverImage: getDestinationCover(destination),
      duration: `${daysCount}N${Math.max(1, daysCount - 1)}Đ`,
      daysCount: daysCount,
      status: isDraft ? 'drafts' : 'upcoming',
      isAiGenerated: true,
      countdown: isDraft ? 'Bản nháp AI nghiên cứu' : `Sắp khởi hành • Khởi hành ${startDate.split('-').reverse().join('/')}`,
      departureDate: `${startDate.split('-').reverse().join('/')} – ${endDateDisplay}`,
      groupType: companionText,
      placesCount: finalDays.reduce((acc, d) => acc + (d.activities?.length || 3), 0),
      placesList: finalPlacesList.length > 0 ? finalPlacesList : [`Trung tâm ${destination}`, 'Khu danh lam thắng cảnh', 'Phố ẩm thực bản địa'],
      budgetPerPerson: budgetVal,
      totalBudget: budgetVal * (companion === 'solo' ? 1 : companion === 'couple' ? 2 : companion === 'friends' ? 4 : 5),
      budgetProgress: isDraft ? 15 : 45,
      budgetNote: `Ngân sách: ${getBudgetLabel()} • ${includeFlight ? 'Đã gồm vé khứ hồi' : 'Chưa gồm vé máy bay'}`,
      pace: pacingText,
      style: styleText || 'Trải nghiệm du lịch toàn diện',
      aiTipNote: parsedAI.summaryTip || `Lời khuyên WanderAI: Lịch trình ${destination} đã được AI phân tích tọa độ địa lý, ưu tiên các món ngon chuẩn vị ${diningStyle} và danh lam thắng cảnh tiêu biểu.`,
      days: finalDays
    };
  };

  // Helper format giờ hiện tại: HH:mm:ss
  const getTimeString = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // SUBMIT GENERATION: AI NGHIÊN CỨU TỪ ĐỊA ĐIỂM NGƯỜI DÙNG NHẬP (KHÔNG DÙNG DỮ LIỆU CỐ ĐỊNH)
  // TIẾN TRÌNH TỪ 0 ĐẾN 100% HIỂN THỊ TRỰC TIẾP TẠI GÓC MÀN HÌNH
  // ─────────────────────────────────────────────────────────────────────────────
  const handleGenerate = async (isDraft = false) => {
    if (!destination.trim()) {
      toast.showInfo('Vui lòng nhập điểm đến du lịch bạn mong muốn!');
      return;
    }

    // 1. NGAY LẬP TỨC ẨN MODAL NHẬP LIỆU ĐỂ GIẢI PHÓNG MÀN HÌNH
    setIsAIGeneratorOpen(false);

    // 2. KHỞI TẠO TIẾN TRÌNH Ở GÓC MÀN HÌNH (0% -> 100%)
    setAiGeneratingStatus({
      isGenerating: true,
      isExpanded: false,
      destination: destination,
      daysCount: daysCount,
      progress: 10,
      currentStep: `Đang kết nối Google Gemini & Định vị địa lý "${destination}"...`,
      logs: [
        { time: getTimeString(), message: `Bắt đầu phiên phân tích WanderAI cho điểm đến: "${destination}" (${daysCount} ngày)` },
        { time: getTimeString(), message: `Kết nối mô hình Google Gemini 3.5 Flash...` }
      ]
    });

    toast.showInfo(`✨ WanderAI đang phân tích thực tế cho ${destination}... Bấm vào góc nhỏ màn hình để xem tiến trình từ 0 - 100%!`);

    // Ticker mô phỏng nhịp phân tích mượt mà từ 10% đến 88% trong khi AI đang xử lý
    let currentP = 15;
    const progressTimer = setInterval(() => {
      currentP = Math.min(88, currentP + Math.floor(Math.random() * 8) + 4);
      let stepMsg = `Đang nghiên cứu danh lam thắng cảnh thực tế tại "${destination}"...`;
      if (currentP >= 40 && currentP < 65) {
        stepMsg = `Khảo sát ẩm thực bản địa, đặc sản & quán ăn nổi tiếng tại "${destination}"...`;
      } else if (currentP >= 65) {
        stepMsg = `Tối ưu hóa cung đường di chuyển theo ngày & cân đối ngân sách...`;
      }

      setAiGeneratingStatus(prev => {
        if (!prev.isGenerating) return prev;
        const newLogs = [...(prev.logs || [])];
        if (currentP === 25) newLogs.push({ time: getTimeString(), message: `Nghiên cứu danh thắng, di tích & điểm tham quan tại "${destination}"` });
        if (currentP === 55) newLogs.push({ time: getTimeString(), message: `Tra cứu văn hóa ẩm thực & các quán ăn trứ danh địa phương` });
        if (currentP === 78) newLogs.push({ time: getTimeString(), message: `Phân bổ lịch trình ${daysCount} ngày theo tuyến đường tối ưu` });

        return {
          ...prev,
          progress: currentP,
          currentStep: stepMsg,
          logs: newLogs
        };
      });
    }, 700);

    try {
      // 3. BUILD PROMPT CÔ ĐỌNG, YÊU CẦU AI NGHIÊN CỨU TRỰC TIẾP ĐỊA ĐIỂM NGƯỜI DÙNG NHẬP
      // Tối ưu để không bao giờ vượt quá token limit
      const prompt = `Bạn là chuyên gia cố vấn du lịch bản địa hàng đầu tại Việt Nam.
Hãy nghiên cứu và phân tích điểm đến: "${destination}".
Lập lịch trình du lịch ${daysCount} ngày với các danh lam thắng cảnh, di tích lịch sử và quán ăn đặc sản có thật 100% tại "${destination}".
Thông tin chuyến đi:
- Điểm đến: ${destination}
- Thời lượng: ${daysCount} ngày (${daysCount}N${Math.max(1, daysCount - 1)}Đ)
- Đối tượng: ${getCompanionLabel()}
- Phương tiện: ${getTransitLabel()}
- Ngân sách: ${getBudgetLabel()}
- Gu trải nghiệm: ${selectedInterests.join(', ')}
- Nhịp độ: ${getPacingLabel()}
- Lưu trú: ${accommodation}
- Ẩm thực: ${diningStyle}
${customPrompt ? `- Yêu cầu thêm: ${customPrompt}` : ''}

QUY TẮC BẮT BUỘC:
1. Nghiên cứu chính xác các địa điểm, quán ăn có thật 100% tại "${destination}". Tuyệt đối không dùng văn mẫu chung chung.
2. Mỗi ngày có 3-4 hoạt động sắp xếp từ sáng đến tối.
3. BẮT BUỘC cung cấp "location" (tên ngắn gọn của địa danh/quán ăn), "address" (địa chỉ cụ thể), và "lat", "lng" (tọa độ GPS thực tế có thật của địa điểm đó tại Việt Nam) để đồng bộ chính xác trên bản đồ và Google Maps.
4. Trả về DUY NHẤT một chuỗi JSON hợp lệ theo định dạng:
{
  "summaryTip": "Mẹo du lịch bản địa ngắn gọn...",
  "placesList": ["Tên điểm thật 1", "Tên điểm thật 2", "Tên điểm thật 3", "Tên điểm thật 4"],
  "days": [
    {
      "dayNumber": 1,
      "title": "Chủ đề ngày...",
      "activities": [
        {
          "time": "08:00 – 09:30",
          "category": "Ẩm thực buổi sáng",
          "location": "Tên địa danh hoặc quán ăn cụ thể",
          "title": "Tên món và tên quán ăn cụ thể",
          "address": "Địa chỉ cụ thể tại ${destination}",
          "lat": 18.3414,
          "lng": 105.9082,
          "note": "Kinh nghiệm ngắn gọn",
          "cost": "45.000đ/người",
          "transit": "15 phút"
        }
      ]
    }
  ]
}`;

      // 4. GỌI TRỰC TIẾP GEMINI 3.5 FLASH (MAX TOKENS 8192)
      const aiResponse = await aiService.generateText({
        prompt,
        model: 'gemini-3.5-flash',
        maxTokens: 8192,
        temperature: 0.3
      });

      clearInterval(progressTimer);

      // Cập nhật tiến trình lên 95%
      setAiGeneratingStatus(prev => ({
        ...prev,
        progress: 95,
        currentStep: 'Hoàn tất phân tích! Đang tổng hợp dữ liệu lịch trình...',
        logs: [...(prev.logs || []), { time: getTimeString(), message: `Google Gemini đã phản hồi thành công. Đang đóng gói dữ liệu...` }]
      }));

      // Parse JSON an toàn
      let parsedData = {};
      try {
        const cleaned = typeof aiResponse === 'string'
          ? aiResponse.replace(/```json/gi, '').replace(/```/g, '').trim()
          : '';
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.warn('Could not parse JSON from Gemini:', e);
      }

      // Nếu kết quả AI không có cấu trúc days hợp lệ, báo lỗi rõ ràng
      if (!parsedData.days || !Array.isArray(parsedData.days) || parsedData.days.length === 0) {
        throw new Error('Dữ liệu phản hồi từ AI không đúng cấu trúc lịch trình. Vui lòng thử lại!');
      }

      // Xây dựng đối tượng hành trình từ kết quả AI
      const fullItinerary = buildItineraryFromAI(parsedData, isDraft);

      // Chạm mốc 100%
      setAiGeneratingStatus(prev => ({
        ...prev,
        progress: 100,
        currentStep: 'Hoàn tất 100%! Đang mở chi tiết lịch trình...',
        logs: [...(prev.logs || []), { time: getTimeString(), message: `Google Gemini đã phản hồi thành công. Khởi tạo giao diện chi tiết hành trình.` }]
      }));

      // Chờ 600ms để người dùng thấy con số 100%
      await new Promise(resolve => setTimeout(resolve, 600));

      generateAITrip({ fullItinerary });

      // Đóng thanh tiến trình
      setAiGeneratingStatus({
        isGenerating: false,
        isExpanded: false,
        destination: '',
        daysCount: 3,
        progress: 0,
        currentStep: '',
        logs: []
      });

      if (isDraft) {
        toast.showSuccess(`Đã lưu nháp lịch trình AI cho ${destination}!`);
      } else {
        toast.showSuccess(`WanderAI đã hoàn tất nghiên cứu lịch trình ${daysCount} ngày tại ${destination}! Đang mở chi tiết... 🎉`);
      }
    } catch (err) {
      clearInterval(progressTimer);
      console.error('AI Generation error:', err);

      // Đóng thanh tiến trình và thông báo lỗi rõ ràng cho người dùng
      setAiGeneratingStatus({
        isGenerating: false,
        isExpanded: false,
        destination: '',
        daysCount: 3,
        progress: 0,
        currentStep: '',
        logs: []
      });

      toast.showError(err.message || 'Không thể kết nối đến máy chủ AI lúc này. Vui lòng kiểm tra lại mạng hoặc thử lại sau!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 py-8 sm:py-12 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-fade-in">
      {/* COMPACT MODAL CARD (Max-w: 620px, thoáng đãng, lề trên rộng rãi) */}
      <div className="relative w-full max-w-[620px] bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh] border border-slate-200">

        {/* MODAL HEADER - THOÁNG ĐÃNG, LỀ TRÊN RỘNG RÃI, KHÔNG SÁT MÉP */}
        <div className="px-7 sm:px-8 pt-7 sm:pt-8 pb-5 bg-gradient-to-b from-sky-50/50 via-white to-white flex items-start justify-between gap-4 border-b border-slate-100 shrink-0">
          <div className="flex items-start gap-3.5">
            <span className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
              <Sparkles className="w-5 h-5 text-sky-600" />
            </span>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Lập Lịch Trình AI Thông Minh
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 leading-relaxed">
                AI nghiên cứu thực tế theo điểm đến bạn nhập (toàn quốc & quốc tế).
              </p>
            </div>
          </div>

          {/* Duy nhất 1 nút X thanh lịch để đóng popup */}
          <button
            type="button"
            onClick={() => setIsAIGeneratorOpen(false)}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer shrink-0 mt-0.5"
            title="Đóng popup"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* MODAL BODY - Form gọn gàng, thoáng đãng, dễ điền */}
        <div className="px-7 sm:px-8 py-5 overflow-y-auto flex-1 space-y-5">

          {/* 1. Điểm đến du lịch */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                <span>Điểm đến du lịch</span>
              </label>
              <span className="text-[11px] font-semibold text-slate-400">
                Nhập bất kỳ tỉnh thành / huyện / đảo
              </span>
            </div>
            <div className="relative">
              <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Nhập bất kỳ điểm đến nào (ví dụ: Bảo Lộc, Côn Đảo, Phú Yên, Hà Giang, Cà Mau, Sa Pa...)"
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 text-slate-900 text-xs font-semibold border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
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

            {/* Quick destination tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[11px] font-bold text-slate-400">Gợi ý nhanh:</span>
              {HOT_DESTINATIONS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setDestination(tag)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${destination === tag
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-700'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Thời gian chuyến đi & Ngày khởi hành */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                <span>Thời lượng chuyến đi</span>
              </label>
              <span className="text-xs font-bold text-sky-600">
                {daysCount} ngày {daysCount > 1 ? `(${daysCount}N${daysCount - 1}Đ)` : '(Trong ngày)'}
              </span>
            </div>

            {/* Stepper + Flexible Days Control */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDaysCount(prev => Math.max(1, prev - 1))}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-base flex items-center justify-center transition-colors cursor-pointer select-none active:scale-95 shrink-0"
                title="Giảm 1 ngày"
              >
                -
              </button>

              <div className="flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 font-extrabold text-xs sm:text-sm">
                <span>{daysCount} Ngày</span>
                <span className="text-[11px] sm:text-xs text-sky-600 font-semibold">
                  {daysCount > 1 ? `• ${daysCount}N${daysCount - 1}Đ` : '• Đi về trong ngày'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setDaysCount(prev => Math.min(30, prev + 1))}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-base flex items-center justify-center transition-colors cursor-pointer select-none active:scale-95 shrink-0"
                title="Tăng 1 ngày"
              >
                +
              </button>
            </div>

            {/* Quick Presets (Từ 2 ngày đến 14 ngày & 1 tháng) */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 mr-0.5">Chọn nhanh:</span>
              {[
                { days: 2, label: '2N1Đ' },
                { days: 3, label: '3N2Đ' },
                { days: 4, label: '4N3Đ' },
                { days: 5, label: '5N4Đ' },
                { days: 7, label: '7N6Đ (1 tuần)' },
                { days: 10, label: '10 Ngày' },
                { days: 14, label: '14 Ngày (2 tuần)' }
              ].map(item => (
                <button
                  key={item.days}
                  type="button"
                  onClick={() => handleSelectDuration(item.days)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${daysCount === item.days
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Start Date & End Date auto-calc */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Ngày bắt đầu</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Ngày kết thúc</span>
                <div className="px-3 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-between border border-slate-200/60">
                  <span>{endDateDisplay}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Đối tượng & Ngân sách */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            {/* Companions */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Đi cùng ai?</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'solo', label: '1 mình', icon: User },
                  { id: 'couple', label: 'Cặp đôi', icon: Heart },
                  { id: 'friends', label: 'Nhóm bạn', icon: Users },
                  { id: 'family', label: 'Gia đình', icon: Home }
                ].map(item => {
                  const isSelected = companion === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCompanion(item.id)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${isSelected
                          ? 'bg-sky-50 text-sky-700 border-2 border-sky-500'
                          : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                <span>Ngân sách mỗi người</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { tier: 1, label: 'Tiết kiệm', sub: '2 - 4 tr' },
                  { tier: 2, label: 'Tiêu chuẩn', sub: '4 - 7 tr' },
                  { tier: 3, label: 'Thoải mái', sub: '7 - 12 tr' },
                  { tier: 4, label: 'Cao cấp', sub: '> 15 tr' }
                ].map(item => {
                  const isSelected = budgetTier === item.tier;
                  return (
                    <button
                      key={item.tier}
                      type="button"
                      onClick={() => setBudgetTier(item.tier)}
                      className={`py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center ${isSelected
                          ? 'bg-amber-50 text-amber-900 border-2 border-amber-500'
                          : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      <span className="text-xs font-bold">{item.label}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{item.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Gu trải nghiệm du lịch (Interests Chips) */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Gu du lịch & Trải nghiệm</span>
              </label>
              <span className="text-[11px] font-semibold text-slate-400">Chọn 1 hoặc nhiều</span>
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
                    className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${isSelected
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Ghi chú thêm cho AI */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>Yêu cầu đặc biệt cho AI (Tùy chọn)</span>
            </label>
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Ví dụ: Không dậy sớm trước 8h, thích ăn hải sản vỉa hè, muốn ghé chùa..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 text-slate-900 text-xs font-medium border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>

        </div>

        {/* MODAL FOOTER - Gọn gàng, nút bấm rõ ràng */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer transition-colors"
          >
            Làm mới
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAIGeneratorOpen(false)}
              className="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Đóng
            </button>

            <button
              type="button"
              onClick={() => handleGenerate(false)}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Khởi Tạo Lịch Trình ✨</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

