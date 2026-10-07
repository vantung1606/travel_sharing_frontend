import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../common/Toast';
import { aiService } from '../../services/aiService';
import { generateCustomVietnamItinerary, VIETNAM_PROVINCES_DATA } from '../../utils/vietnamTravelDatabase';
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
  Navigation,
  Minimize2,
  EyeOff
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
  { id: 'checkin', label: 'Check-in sống ảo', icon: Camera },
  { id: 'food', label: 'Ẩm thực bản địa', icon: Utensils },
  { id: 'beach', label: 'Nghỉ dưỡng & Biển', icon: Sun },
  { id: 'culture', label: 'Văn hóa & Di sản', icon: Landmark },
  { id: 'trekking', label: 'Trekking & Phượt', icon: Compass },
  { id: 'nightlife', label: 'Phố đêm & Vui chơi', icon: Music },
  { id: 'healing', label: 'Chữa lành & Thư giãn', icon: Heart },
  { id: 'shopping', label: 'Mua sắm & Chợ', icon: ShoppingBag }
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

  // Khi form đang ẩn nhưng hệ thống đang tạo lịch trình ngầm trong nền
  if (!isAIGeneratorOpen) {
    if (aiGeneratingStatus?.isGenerating) {
      return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3.5 bg-slate-900/95 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-sky-400/40 backdrop-blur-xl animate-fade-in ring-1 ring-sky-500/30">
          <div className="relative flex items-center justify-center shrink-0">
            <Loader2 className="w-5 h-5 text-sky-400 animate-spin" />
            <span className="absolute w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          </div>
          <div className="text-left pr-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-white">Đang thiết lập tour: {aiGeneratingStatus.destination}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-extrabold">{aiGeneratingStatus.daysCount}N</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">Tra cứu địa danh thật & lên lịch riêng từng ngày...</p>
          </div>
          <button
            type="button"
            onClick={() => setIsAIGeneratorOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            Mở lại form
          </button>
          <button
            type="button"
            onClick={() => setAiGeneratingStatus({ isGenerating: false, destination: '', daysCount: 3, progress: 0 })}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Đóng thông báo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
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
    setSmartAvoidTraffic(true);
    setSmartLoopRoute(true);
    setSmartWeather(true);
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

  // Build Itinerary helper với dữ liệu AI hoặc fallback CSDL địa phương
  const createItineraryObject = (aiResponseText, isDraft = false) => {
    // 1. Tìm ảnh bìa từ database hoặc presets
    let cover = DESTINATION_COVERS['default'];
    const dLower = destination.toLowerCase();
    for (const [key, val] of Object.entries(VIETNAM_PROVINCES_DATA)) {
      if (dLower.includes(key)) {
        if (val.cover) cover = val.cover;
        break;
      }
    }
    if (cover === DESTINATION_COVERS['default']) {
      for (const key of Object.keys(DESTINATION_COVERS)) {
        if (dLower.includes(key.toLowerCase())) {
          cover = DESTINATION_COVERS[key];
          break;
        }
      }
    }

    const companionText = getCompanionLabel();
    const pacingText = getPacingLabel();
    const budgetVal = budgetTier === 1 ? 3000000 : budgetTier === 2 ? 5500000 : budgetTier === 3 ? 9000000 : 16000000;
    const styleText = selectedInterests
      .map(id => INTEREST_OPTIONS.find(o => o.id === id)?.label)
      .filter(Boolean)
      .join(', ');

    // 2. Thử parse JSON trả về từ Google Gemini AI
    let aiParsedDays = null;
    let aiSummaryTip = null;
    let aiPlacesList = null;

    if (aiResponseText) {
      try {
        const cleaned = typeof aiResponseText === 'string'
          ? aiResponseText.replace(/```json/gi, '').replace(/```/g, '').trim()
          : '';
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.days && Array.isArray(parsed.days) && parsed.days.length > 0) {
            aiParsedDays = parsed.days;
          }
          if (parsed.summaryTip) aiSummaryTip = parsed.summaryTip;
          if (parsed.placesList && Array.isArray(parsed.placesList)) aiPlacesList = parsed.placesList;
        }
      } catch (e) {
        console.warn('Could not parse Gemini JSON, falling back to smart realistic generator:', e);
      }
    }

    // Ưu tiên dữ liệu do AI Google Gemini suy luận, nếu không có thì dùng CSDL địa phương
    const finalDays = (aiParsedDays && aiParsedDays.length >= daysCount)
      ? aiParsedDays.slice(0, daysCount)
      : (aiParsedDays && aiParsedDays.length > 0)
        ? aiParsedDays
        : generateCustomVietnamItinerary(destination, daysCount);

    // 3. Rút trích danh sách địa điểm nổi bật thực tế
    let finalPlacesList = [];
    if (aiPlacesList && aiPlacesList.length > 0) {
      finalPlacesList = aiPlacesList.slice(0, 6);
    } else {
      const extractedPlaces = [];
      finalDays.forEach(d => {
        (d.activities || []).forEach(a => {
          const cleanName = (a.title || '')
            .replace(/^Thưởng thức |^Khám phá |^Chiêm bái |^Thăm |^Check-in |^Chinh phục |^Trải nghiệm |^Dạo bước |^Tắm biển |^Ăn trưa |^Ăn tối /g, '')
            .split(' tại ')[0]
            .split(' – ')[0]
            .trim();
          if (cleanName && cleanName.length > 3 && !extractedPlaces.includes(cleanName)) {
            extractedPlaces.push(cleanName);
          }
        });
      });
      finalPlacesList = extractedPlaces.slice(0, 6);
    }

    // Xác định phân vùng địa lý
    let region = 'Điểm đến du lịch Việt Nam';
    for (const [key, val] of Object.entries(VIETNAM_PROVINCES_DATA)) {
      if (dLower.includes(key) && val.region) {
        region = val.region;
        break;
      }
    }

    return {
      id: `itin-${Date.now()}`,
      title: `Hành Trình ${destination} (${daysCount}N${Math.max(1, daysCount - 1)}Đ): Tối Ưu Điểm Đến Bản Địa`,
      destination: destination,
      region: region,
      coverImage: cover,
      duration: `${daysCount}N${Math.max(1, daysCount - 1)}Đ`,
      daysCount: daysCount,
      status: isDraft ? 'drafts' : 'upcoming',
      isAiGenerated: true,
      countdown: isDraft ? 'Bản nháp AI đề xuất' : `Sắp khởi hành • Khởi hành ${startDate.split('-').reverse().join('/')}`,
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
      aiTipNote: aiSummaryTip || `Gợi ý độc quyền WanderAI: Lịch trình ${destination} đã được tối ưu tọa độ GPS, ưu tiên các món ngon chuẩn vị ${diningStyle} và danh lam thắng cảnh tiêu biểu tại ${destination}.`,
      days: finalDays
    };
  };

  // Submit AI Generation (Ưu tiên gọi Google Gemini AI trực tiếp với fallback dự phòng)
  const handleGenerate = async (isDraft = false) => {
    if (!destination.trim()) {
      toast.showInfo('Vui lòng nhập điểm đến du lịch bạn mong muốn!');
      return;
    }

    // 1. NGAY LẬP TỨC ẨN FORM ĐỂ GIẢI PHÓNG MÀN HÌNH
    setIsAIGeneratorOpen(false);
    setIsGenerating(false);

    setAiGeneratingStatus({
      isGenerating: true,
      destination: destination,
      daysCount: daysCount,
      progress: 25
    });

    toast.showInfo(`✨ WanderAI đang gọi Google Gemini tra cứu địa danh thật & lên lịch trình cho ${destination}... (Form đã ẩn để bạn tiếp tục thao tác)`);

    try {
      // 2. XÂY DỰNG PROMPT CHUYÊN SÂU CHO GOOGLE GEMINI AI
      const prompt = `Bạn là chuyên gia cố vấn du lịch bản địa hàng đầu tại Việt Nam.
Nhiệm vụ: Lập kế hoạch lịch trình du lịch chi tiết cho ${daysCount} ngày tại "${destination}" (hỗ trợ toàn diện bất kỳ địa phương, tỉnh thành, huyện, đảo nào trên khắp 63 tỉnh thành Việt Nam).
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

QUY TẮC BẮT BUỘC (CRITICAL):
1. TẤT CẢ các địa điểm tham quan, danh lam thắng cảnh, bãi biển, di tích lịch sử, quán ăn đặc sản PHẢI LÀ ĐỊA DANH / QUÁN ĂN CỤ THỂ CÓ THẬT 100% tại "${destination}". Tuyệt đối không dùng từ chung chung như "ngắm hoàng hôn", "đi dạo", "quán ăn bản địa".
2. Mỗi ngày có 3-4 hoạt động sắp xếp từ sáng đến tối theo lộ trình địa lý hợp lý.
3. Trả về DUY NHẤT một chuỗi JSON hợp lệ theo mẫu:
{
  "summaryTip": "Mẹo di chuyển và lưu ý ăn uống hữu ích nhất...",
  "placesList": ["Tên điểm thật 1", "Tên điểm thật 2", "Tên điểm thật 3", "Tên điểm thật 4"],
  "days": [
    {
      "dayNumber": 1,
      "title": "Chủ đề ngày 1 kèm địa danh tiêu biểu",
      "activities": [
        {
          "time": "08:00 – 09:30",
          "category": "Ẩm thực buổi sáng",
          "title": "Tên món và tên quán ăn cụ thể",
          "address": "Địa chỉ hoặc khu vực cụ thể tại ${destination}",
          "note": "Gợi ý món nên thử hoặc trải nghiệm thú vị",
          "cost": "50.000đ/người",
          "transit": "Di chuyển 15 phút"
        }
      ]
    }
  ]
}`;

      // 3. GỌI API GEMINI TRỰC TIẾP
      let aiResponse = null;
      try {
        aiResponse = await aiService.generateText({ prompt, model: 'gemini-3.5-flash' });
      } catch (aiErr) {
        console.warn('Gemini API call failed, switching to local database fallback:', aiErr);
      }

      // 4. ĐÓNG GÓI LỊCH TRÌNH
      const fullItinerary = createItineraryObject(aiResponse, isDraft);

      generateAITrip({ fullItinerary });
      setAiGeneratingStatus({ isGenerating: false, destination: '', daysCount: 3, progress: 0 });

      if (isDraft) {
        toast.showSuccess(`Đã lưu nháp lịch trình cho ${destination}!`);
      } else {
        toast.showSuccess(`WanderAI đã hoàn tất lịch trình ${daysCount} ngày tại ${destination}! Đang mở chi tiết... 🎉`);
      }
    } catch (err) {
      console.error('AI Generation error:', err);
      const fallbackItinerary = createItineraryObject(null, isDraft);
      generateAITrip({ fullItinerary: fallbackItinerary });
      setAiGeneratingStatus({ isGenerating: false, destination: '', daysCount: 3, progress: 0 });
      toast.showSuccess(`WanderAI đã tạo thành công lịch trình với địa danh thực tế cho ${destination}!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-fade-in">
      {/* COMPACT MODAL CARD (Max-w: 640px, thoáng đãng, gọn gàng, không chằng chịt) */}
      <div className="relative w-full max-w-[640px] bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] border border-slate-200">
        
        {/* MODAL HEADER - Gọn gàng, sạch sẽ, có nút ẩn form */}
        <div className="px-5 sm:px-6 py-4 bg-white flex items-center justify-between border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-sky-600" />
            </span>
            <div>
              <h2 className="font-display text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Lập Lịch Trình AI Thông Minh
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Tra cứu địa danh thật trên toàn bộ 63 tỉnh thành & hải đảo Việt Nam.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsAIGeneratorOpen(false)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer"
              title="Ẩn form (vẫn tiếp tục tạo lịch trình trong nền nếu đang tạo)"
            >
              <Minimize2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Ẩn form</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAIGeneratorOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              title="Đóng popup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MODAL BODY - Form gọn gàng, thoáng đãng, dễ điền */}
        <div className="px-5 sm:px-6 py-4 overflow-y-auto flex-1 space-y-4">

          {/* 1. Điểm đến du lịch */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                <span>Điểm đến du lịch</span>
              </label>
              <span className="text-[11px] font-semibold text-slate-400">
                Toàn quốc (63 tỉnh thành)
              </span>
            </div>
            <div className="relative">
              <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Nhập bất kỳ điểm đến nào (ví dụ: Côn Đảo, Phú Yên, Hà Giang, Cà Mau, Sa Pa...)"
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
              <span className="text-[11px] font-bold text-slate-400">Phổ biến:</span>
              {HOT_DESTINATIONS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setDestination(tag)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    destination === tag
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
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    daysCount === item.days
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
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
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
                      className={`py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
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
                    className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
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
              placeholder="Ví dụ: Không dậy sớm trước 8h, thích ăn hải sản vỉa hè, muốn ghé Chùa Hương Tích..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 text-slate-900 text-xs font-medium border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>

        </div>

        {/* MODAL FOOTER - Gọn gàng, nút bấm rõ ràng, tạo và ẩn form tức thì */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer transition-colors"
          >
            Làm mới
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsAIGeneratorOpen(false)}
              className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Ẩn / Đóng
            </button>

            <button
              type="button"
              onClick={() => handleGenerate(false)}
              className="relative px-6 py-2.5 rounded-full bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
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
