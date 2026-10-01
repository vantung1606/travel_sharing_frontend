import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../components/common/Toast';
import {
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  CheckCircle2,
  ArrowRight,
  Clock,
  Compass,
  Users,
  Search,
  ShieldCheck,
  Utensils,
  Camera,
  Zap,
  Bot,
  Radar,
  Copy,
  Heart,
  RefreshCw,
  Send,
  Check,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Map,
  Layers,
  ArrowDown,
  Timer,
  Wallet,
  Navigation as NavigationIcon,
  Flame,
  Award
} from 'lucide-react';

export const HomePage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    destinations = [],
    itineraries = [],
    setIsAIGeneratorOpen,
    setUserTab,
    generateAITrip,
    addItinerary
  } = useApp();

  // Dock States
  const [activeDockTab, setActiveDockTab] = useState('ai'); // 'ai' | 'explore' | 'community'
  const [dockDest, setDockDest] = useState('Đà Nẵng & Hội An');
  const [dockBudget, setDockBudget] = useState('standard');
  const [dockStyle, setDockStyle] = useState('chill');
  const [dockDuration, setDockDuration] = useState('3d2n');
  const [isDockGenerating, setIsDockGenerating] = useState(false);

  // Sandbox Widget States
  const [sandboxPrompt, setSandboxPrompt] = useState(
    'Tôi muốn đi Đà Lạt 3 ngày 2 đêm cùng bạn gái, ngân sách khoảng 4 triệu, thích quán cà phê view hoàng hôn đồi thông, thích ăn lẩu gà lá é và không thích chỗ quá đông đúc.'
  );
  const [sandboxResult, setSandboxResult] = useState({
    title: 'Đà Lạt • Hành Trình Lãng Mạn (3N2Đ)',
    subtitle: 'Phù hợp: Cặp đôi • Dự toán: 3.920.000đ',
    badge: 'Tối ưu 98%',
    items: [
      {
        time: '08h',
        title: 'Ăn sáng Bánh căn Lệ & Cà phê Tùng',
        cost: '75.000đ',
        desc: 'Không gian hoài niệm trung tâm, tránh khung giờ cao điểm 9h.',
        tagColor: 'text-emerald-700 bg-emerald-50 border-emerald-200'
      },
      {
        time: '15h',
        title: 'Hoàng hôn tại Đồi Thông Cầu Đất',
        cost: 'AI Hidden Gem ⭐',
        desc: 'Gợi ý góc chụp vắng người và tuyến đường bê tông an toàn.',
        tagColor: 'text-amber-700 bg-amber-50 border-amber-200'
      },
      {
        time: '18h',
        title: 'Lẩu gà lá é Tao Ngộ & Kem bơ Thanh Thảo',
        cost: '280.000đ/2 người',
        desc: 'Hương vị trứ danh, nhận ưu đãi độc quyền thành viên Wayfare.',
        tagColor: 'text-teal-700 bg-teal-50 border-teal-200'
      }
    ]
  });

  // Showcase Filter Tab
  const [showcaseRegion, setShowcaseRegion] = useState('all'); // 'all' | 'bac' | 'trung' | 'nam'

  // Curated Itineraries Data
  const curatedTours = [
    {
      id: 'tour-danang',
      region: 'trung',
      title: 'Đà Nẵng & Hội An: Biển Xanh & Phố Cổ',
      desc: 'Kết hợp nghỉ ngơi bãi biển Mỹ Khê, chèo SUP bán đảo Sơn Trà và thưởng thức ẩm thực đêm Hội An.',
      duration: '4N3Đ',
      tag: 'Tiết kiệm 20%',
      category: 'Chill & Ẩm thực',
      rating: 4.9,
      saves: '1.4k',
      price: '3.850.000đ',
      location: 'Miền Trung',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA-h2cLwc5CdF6h0dRxDQA022yMVF7GWoxITdVo7iDMIPrBK07-Q6UXcSvydFO-dTaCmXcCagxuUmbrPdmyjgf-ulpuDiJHFPA1oGswXLH_BvkE161zaq95P8cdt3dirDMIiiMx3w05xGMUXWomXB8VcaIPTOzkNP8GSvrtLc70T3yWatirb8iaKsXYTPGEY9wh68Ddk_VHtxC1-De6ARR59idcxEGdgFGFaJLJtpTnxGRgydzygYKNsg'
    },
    {
      id: 'tour-mucangchai',
      region: 'bac',
      title: 'Mù Cang Chải & Sa Pa: Biển Vàng Tây Bắc',
      desc: 'Hành trình qua đèo Khau Phạ hùng vĩ, ngắm đồi Mâm Xôi và săn mây đỉnh Fansipan lúc bình minh.',
      duration: '3N2Đ',
      tag: 'Trending 🔥',
      category: 'Nhiếp ảnh & Săn mây',
      rating: 4.95,
      saves: '2.8k',
      price: '2.950.000đ',
      location: 'Tây Bắc',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCpwomIleTpAobBNCDIwfplLgTZZaoTDtEW0KStBKwJZZ0zcz6lWmrCB40orCB3IlHb5qKvfaCGCWvikJ1EdgDvfSwymzYZkq9rAS4lW1HaqVddDpHdikcwLQ9IBcca4K6fOISOm6qp3vOEMj8qgHTuISZGp2XrCseQ4Fv69DkO-_RgTn3uQf_wceYhyi3vA51GMCk8Ln5uFA-94q-0qgz9lUdfDu6yvr9yLdEbRVCg2kicRIlquCnzbQ'
    },
    {
      id: 'tour-phuquoc',
      region: 'nam',
      title: 'Phú Quốc: Hoàng Hôn Đảo Ngọc',
      desc: 'Trải nghiệm cáp treo vượt biển dài nhất thế giới, lặn ngắm san hô Hòn Mây Rút và tiệc cocktail bãi biển.',
      duration: '3N2Đ',
      tag: 'Độc quyền AI',
      category: 'Nghỉ dưỡng & Hải sản',
      rating: 4.88,
      saves: '950',
      price: '5.600.000đ',
      location: 'Kiên Giang',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuChhFKlsCt-iikW1Qz3T91RgcoCz11xwiKv7cEqPreNRCpW1_gKBZVT62CCFPUsemz0OyWoGWaqQyk8_eWkidIPnxmzlORT1dSTXZOvS1Q-ggcyjeZUvGRyfUBeIXliuICD-ZXL1Dx0aD7g9_8UuPTURrnamPStgDZH2uN5NQSWYTh2q5KDhFUmncdBXr98LdTdHdjyBLT8du_MGAF6iP5iZGWStCfwAsTyxG2dHeBO87zhVKBc2pd1jw'
    },
    {
      id: 'tour-ninhbinh',
      region: 'bac',
      title: 'Ninh Bình: Di Sản Tràng An & Hang Múa',
      desc: 'Xuôi thuyền khám phá thủy động kỳ vĩ, chinh phục đỉnh ngọa long Hang Múa ngắm toàn cảnh Tam Cốc.',
      duration: '2N1Đ',
      tag: 'Cuối tuần 🌿',
      category: 'Di sản & Thiên nhiên',
      rating: 4.92,
      saves: '3.1k',
      price: '1.850.000đ',
      location: 'Ninh Bình',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCybtAuVbQy2HZwLngelj5I7ggYLsmTQOUp99z4x7pjaQBb0ZCQi5egaeaHQJziA_i2NQrGNl5xvfqxkH1rRG741pRvW4jU2P8olBwfJwwASX1oxhhaGBAInLqTH1_HUE-9VCPAhK0BwJImk6EEagJUTvf_yCfoQG6e-dkoYWxx0Gu272Fe_QSFw7fwJi6RA0rwluZe-MRcck3NccoVOfVRK_otEmWlHe56lWuBx0KpbmxXOFAljfv87A'
    }
  ];

  const filteredTours =
    showcaseRegion === 'all'
      ? curatedTours
      : curatedTours.filter((t) => t.region === showcaseRegion);

  // Trigger AI Generator from Dock
  const handleDockGenerate = (e) => {
    e?.preventDefault();
    setIsDockGenerating(true);
    setTimeout(() => {
      setIsDockGenerating(false);
      generateAITrip({
        destination: dockDest,
        budget:
          dockBudget === 'budget'
            ? '2.500.000đ'
            : dockBudget === 'luxury'
            ? '8.000.000đ'
            : '4.500.000đ',
        style:
          dockStyle === 'photo'
            ? 'Sống ảo & Văn hóa'
            : dockStyle === 'nature'
            ? 'Trekking thiên nhiên'
            : dockStyle === 'family'
            ? 'Gia đình & Trẻ nhỏ'
            : 'Nghỉ dưỡng & Ẩm thực',
        duration:
          dockDuration === '2d1n'
            ? '2 Ngày 1 Đêm'
            : dockDuration === '4d3n'
            ? '4 Ngày 3 Đêm'
            : dockDuration === '5d4n'
            ? '5 Ngày 4 Đêm'
            : '3 Ngày 2 Đêm'
      });
      toast.success(`Đã khởi tạo lộ trình AI cho ${dockDest}! ✨`);
    }, 1000);
  };

  // Run Sandbox Simulation
  const handleRunSandbox = () => {
    const val = sandboxPrompt.toLowerCase();
    if (val.includes('gia đình') || val.includes('đà nẵng')) {
      setSandboxResult({
        title: 'Đà Nẵng • Nghỉ Dưỡng Gia Đình (4N3Đ)',
        subtitle: 'Phù hợp: Đa thế hệ • Dự toán: 4.850.000đ/người',
        badge: 'Tối ưu 99%',
        items: [
          {
            time: '08h',
            title: 'Ăn sáng Bún chả cá Bà Lữ & dạo bãi biển Mỹ Khê',
            cost: '55.000đ',
            desc: 'Quán ăn lâu đời có điều hòa và bãi đỗ xe thoáng cho xe gia đình.',
            tagColor: 'text-emerald-700 bg-emerald-50 border-emerald-200'
          },
          {
            time: '14h',
            title: 'Bà Nà Hills & Cầu Vàng (Lối đi ưu tiên xe đẩy)',
            cost: 'Vé trọn gói',
            desc: 'Thời tiết mát mẻ 20°C, khung cảnh châu Âu thích hợp cả ông bà và trẻ em.',
            tagColor: 'text-amber-700 bg-amber-50 border-amber-200'
          },
          {
            time: '18h30',
            title: 'Du thuyền sông Hàn xem Cầu Rồng phun lửa',
            cost: '150.000đ/vé',
            desc: 'Không gian thoáng mát, gió biển êm dịu, không sợ say sóng.',
            tagColor: 'text-teal-700 bg-teal-50 border-teal-200'
          }
        ]
      });
    } else if (val.includes('hà giang') || val.includes('phượt') || val.includes('trekking')) {
      setSandboxResult({
        title: 'Hà Giang • Khám Phá Hùng Vĩ Mã Pí Lèng (3N2Đ)',
        subtitle: 'Phù hợp: Phượt thủ & Bạn trẻ • Dự toán: 2.750.000đ/người',
        badge: 'An toàn 100%',
        items: [
          {
            time: '07h',
            title: 'Dốc Thẩm Mã & Cổng trời Quản Bạ',
            cost: 'Check-in tự do',
            desc: 'Buổi sáng nắng dịu, đường vắng xe tải, dễ dàng chụp ảnh kỷ niệm.',
            tagColor: 'text-emerald-700 bg-emerald-50 border-emerald-200'
          },
          {
            time: '13h',
            title: 'Chèo thuyền Kayak hẻm Tu Sản & Sông Nho Quế',
            cost: '120.000đ/người',
            desc: 'Làn nước xanh ngọc bích tuyệt đẹp, đã đặt trước vé thuyền không cần xếp hàng.',
            tagColor: 'text-amber-700 bg-amber-50 border-amber-200'
          },
          {
            time: '19h',
            title: 'Thịt trâu gác bếp & Rượu ngô men lá Làng cổ Lô Lô Chải',
            cost: '180.000đ',
            desc: 'Giao lưu văn hóa người Lô Lô ấm áp bên bếp lửa rực hồng.',
            tagColor: 'text-teal-700 bg-teal-50 border-teal-200'
          }
        ]
      });
    } else {
      setSandboxResult({
        title: 'Đà Lạt • Hành Trình Lãng Mạn (3N2Đ)',
        subtitle: 'Phù hợp: Cặp đôi • Dự toán: 3.920.000đ',
        badge: 'Tối ưu 98%',
        items: [
          {
            time: '08h',
            title: 'Ăn sáng Bánh căn Lệ & Cà phê Tùng',
            cost: '75.000đ',
            desc: 'Không gian hoài niệm trung tâm, tránh khung giờ cao điểm 9h.',
            tagColor: 'text-emerald-700 bg-emerald-50 border-emerald-200'
          },
          {
            time: '15h',
            title: 'Hoàng hôn tại Đồi Thông Cầu Đất',
            cost: 'AI Hidden Gem ⭐',
            desc: 'Gợi ý góc chụp vắng người và tuyến đường bê tông an toàn.',
            tagColor: 'text-amber-700 bg-amber-50 border-amber-200'
          },
          {
            time: '18h',
            title: 'Lẩu gà lá é Tao Ngộ & Kem bơ Thanh Thảo',
            cost: '280.000đ/2 người',
            desc: 'Hương vị trứ danh, nhận ưu đãi độc quyền thành viên Wayfare.',
            tagColor: 'text-teal-700 bg-teal-50 border-teal-200'
          }
        ]
      });
    }
    toast.info('AI đã cập nhật phân tích lộ trình tức thì! 💡');
  };

  // Copy Tour Action
  const handleCopyTour = (tour) => {
    if (addItinerary) {
      addItinerary({
        title: tour.title,
        destination: tour.location,
        duration: tour.duration,
        budget: tour.price,
        coverImage: tour.image,
        days: [
          {
            dayNumber: 1,
            title: 'Khởi hành & Check-in',
            activities: [
              { time: '09:00', title: 'Đến sân bay/bến xe, nhận phòng' },
              { time: '14:30', title: 'Khám phá các danh thắng nổi bật' },
              { time: '19:00', title: 'Thưởng thức ẩm thực đêm bản địa' }
            ]
          }
        ]
      });
    }
    toast.success(`Đã sao chép lịch trình "${tour.title}" vào Quản lý Tour! 📋`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-emerald-600 selection:text-white pb-24">
      {/* ──────────────────────────────────────────────────────────────────────────
          1. HERO SECTION WITH SAGE & MINT CINEMATIC LAYER
          Matching Stitch M01: Grand terrace sunrise, dual CTA, avatar stats & AI Capsule
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden -mt-6 pt-10 pb-16 lg:pb-28 bg-[#022c22]">
        {/* Background Canvas Layer with High-Res Nature Scrim */}
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center transition-all duration-700 opacity-90 scale-105"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAeds4SWXIgkLOcYCF9MRa2Xf7J7LHWiWV0SqQRgS-SNeFVBvlgdYmcoxC3x1domXqmyE01LvwSCh0gYST4PvNqp5OmGljYAY-fN96D5JyyOTLH2h_aZVLigY5-g_0TH_gREeCqY3VBeHGgeZ5U5a5JbM0h4gTDWwIY2ts4mI-WxQMvvE8nBFNy-w4aJQ322Rq-i9FjrnO9x4uDAUv8Yene08vSZxbRZw5Oao0QT_XWeOKZmu5WK9ggVA')`
            }}
          />
          {/* Complex Gradient Scrim with Soft Emerald & Forest Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-emerald-950/85 to-slate-950/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] via-transparent to-slate-950/70" />
          
          {/* Ambient Glow Orbs in Soft Mint & Emerald */}
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-1/3 w-80 h-80 rounded-full bg-teal-400/15 blur-3xl pointer-events-none" />
        </div>

        {/* Content Container strictly aligned with Navbar edge padding */}
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Breadcrumb / Announcement Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white font-medium text-xs mb-6 shadow-sm border border-emerald-400/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span className="tracking-wide">
              Nền Tảng Du Lịch Cá Nhân Hóa Thế Hệ Mới • Powered by Gemini AI
            </span>
          </div>

          {/* Hero Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Headline & CTAs (8 Cols) */}
            <div className="lg:col-span-8 flex flex-col items-start pr-0 lg:pr-8 text-white">
              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] mb-5">
                Kiến Tạo Chuyến Đi Mơ Ước <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 bg-clip-text text-transparent">
                  Chỉ Trong 3 Giây
                </span>{' '}
                Cùng Trí Tuệ Nhân Tạo
              </h1>

              <p className="text-slate-200 text-sm sm:text-base lg:text-lg max-w-2xl mb-8 leading-relaxed font-normal">
                Từ ý tưởng mơ hồ đến lịch trình chi tiết từng phút, dự toán ngân sách chính xác theo
                thời gian thực và cá nhân hóa theo gu riêng của bạn chỉ với một chạm.
              </p>

              {/* Dual CTAs */}
              <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto mb-10">
                <a
                  href="#ai-dock"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-900/40 hover:shadow-xl hover:scale-[1.02] transition-all ring-2 ring-emerald-400/30 cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Lập Lịch Trình AI Ngay</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-extrabold tracking-wide uppercase">
                    Free
                  </span>
                </a>

                <a
                  href="#kham-pha"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-bold text-sm transition-all border border-emerald-300/30 cursor-pointer"
                >
                  <Compass className="w-5 h-5 text-emerald-300" />
                  <span>Khám Phá Điểm Đến Hot</span>
                  <ArrowDown className="w-4 h-4 text-emerald-200" />
                </a>
              </div>

              {/* Social Proof & Live Metrics */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                {/* Avatars */}
                <div className="flex items-center">
                  <div className="flex -space-x-3 overflow-hidden">
                    <img
                      className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover"
                      alt="Traveler"
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                    />
                    <img
                      className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover"
                      alt="Traveler"
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                    />
                    <img
                      className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover"
                      alt="Traveler"
                      src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80"
                    />
                    <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-emerald-600 text-white text-xs font-extrabold ring-2 ring-white">
                      +12k
                    </div>
                  </div>
                  <div className="ml-3.5 flex flex-col">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <Star className="w-4 h-4 fill-amber-400" />
                      <Star className="w-4 h-4 fill-amber-400" />
                      <Star className="w-4 h-4 fill-amber-400" />
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span className="text-white font-bold text-sm ml-1">4.9/5</span>
                    </div>
                    <span className="text-slate-300 text-xs">Hơn 120,000+ du khách tin dùng</span>
                  </div>
                </div>

                {/* Vertical Separator */}
                <div className="hidden md:block w-px h-8 bg-white/20" />

                {/* Fast Stat Pill */}
                <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-emerald-400/20">
                  <Timer className="w-6 h-6 text-emerald-300" />
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-sm leading-tight">3.2 Giây</span>
                    <span className="text-slate-300 text-xs">Khởi tạo lịch trình hoàn chỉnh</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: AI Interactive Live Capsule Preview (4 Cols) */}
            <div className="lg:col-span-4 hidden lg:flex flex-col gap-4">
              <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl flex flex-col gap-4 text-slate-900 border border-emerald-200/80">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Trợ Lý AI Wayfare</h4>
                      <p className="text-[11px] text-slate-500">Sẵn sàng lập tour cá nhân hóa</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" /> Live
                  </span>
                </div>

                {/* Chat Bubble Sample */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 text-slate-800 text-xs border border-emerald-100/80">
                  <p className="italic text-slate-700">
                    “Gợi ý tour 3N2Đ tại Phú Quốc cho 2 người, ngân sách 5 triệu, thích ngắm hoàng hôn
                    và thưởng thức hải sản địa phương.”
                  </p>
                </div>

                {/* Instant AI Outcome Tag */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Wallet className="w-5 h-5 text-emerald-600" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">Tối ưu tiết kiệm</span>
                      <span className="text-[11px] text-slate-500">
                        Tiết kiệm 22% so với tự đặt lẻ
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                    -1.200k
                  </span>
                </div>

                {/* Route Quick Steps */}
                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center gap-2 text-slate-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span className="font-bold">Ngày 1:</span> Check-in Bãi Sao & Thị trấn Hoàng Hôn
                  </div>
                  <div className="flex items-center gap-2 text-slate-800">
                    <span className="w-2 h-2 rounded-full bg-teal-600" />
                    <span className="font-bold">Ngày 2:</span> Tour 4 đảo lặn san hô & BBQ bãi biển
                  </div>
                  <div className="flex items-center gap-2 text-slate-800">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="font-bold">Ngày 3:</span> Cà phê ngắm bình minh & Chợ Đêm
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. FLOATING SMART AI PLANNER DOCK (Negative Margin Overlap)
          Matching Stitch M01: 4 interactive grid inputs, quick city chips, 3s rocket CTA
      ────────────────────────────────────────────────────────────────────────── */}
      <section
        className="relative z-20 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 -mt-10 lg:-mt-16 mb-16"
        id="ai-dock"
      >
        <div className="p-4 sm:p-8 rounded-3xl bg-white shadow-2xl backdrop-blur-2xl border border-slate-200/80">
          {/* Planner Modes Segmented Control */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 p-1.5 rounded-full bg-slate-100/90 border border-slate-200/60">
              <button
                type="button"
                onClick={() => setActiveDockTab('ai')}
                className={`px-5 py-2.5 rounded-full text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeDockTab === 'ai'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Lập lịch trình bằng AI</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveDockTab('explore');
                  navigate('/explore');
                }}
                className={`px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeDockTab === 'explore'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Khám phá điểm đến</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveDockTab('community');
                  navigate('/community');
                }}
                className={`px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeDockTab === 'community'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Tìm bạn đồng hành</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Phân tích dữ liệu từ hơn 1.200 điểm đến Việt Nam</span>
            </div>
          </div>

          {/* Omni-Search Interactive Grid Form */}
          <form
            onSubmit={handleDockGenerate}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            {/* Field 1: Destination */}
            <div className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 transition-colors flex flex-col justify-center border border-slate-200/80 hover:border-emerald-500/50">
              <label className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Điểm đến mơ ước</span>
              </label>
              <input
                type="text"
                value={dockDest}
                onChange={(e) => setDockDest(e.target.value)}
                placeholder="Đà Nẵng & Hội An"
                className="w-full bg-transparent text-sm sm:text-base font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none truncate"
              />
            </div>

            {/* Field 2: Budget */}
            <div className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 transition-colors flex flex-col justify-center border border-slate-200/80 hover:border-emerald-500/50">
              <label className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ngân sách dự kiến</span>
              </label>
              <select
                value={dockBudget}
                onChange={(e) => setDockBudget(e.target.value)}
                className="w-full bg-transparent text-sm sm:text-base font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="budget">Tiết kiệm (2 - 3.5 triệu)</option>
                <option value="standard">Tiêu chuẩn (3.5 - 6 triệu)</option>
                <option value="luxury">Nghỉ dưỡng sang trọng (7 triệu+)</option>
              </select>
            </div>

            {/* Field 3: Travel Style */}
            <div className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 transition-colors flex flex-col justify-center border border-slate-200/80 hover:border-emerald-500/50">
              <label className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                <span>Phong cách trải nghiệm</span>
              </label>
              <select
                value={dockStyle}
                onChange={(e) => setDockStyle(e.target.value)}
                className="w-full bg-transparent text-sm sm:text-base font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="chill">Nghỉ dưỡng & Ẩm thực biển</option>
                <option value="photo">Sống ảo & Di sản văn hóa</option>
                <option value="nature">Thiên nhiên hoang sơ & Trekking</option>
                <option value="family">Gia đình & Tiện nghi trẻ em</option>
              </select>
            </div>

            {/* Field 4: Duration */}
            <div className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 transition-colors flex flex-col justify-center border border-slate-200/80 hover:border-emerald-500/50">
              <label className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Thời lượng chuyến đi</span>
              </label>
              <select
                value={dockDuration}
                onChange={(e) => setDockDuration(e.target.value)}
                className="w-full bg-transparent text-sm sm:text-base font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="2d1n">2 Ngày 1 Đêm (Cuối tuần)</option>
                <option value="3d2n">3 Ngày 2 Đêm (Lý tưởng)</option>
                <option value="4d3n">4 Ngày 3 Đêm (Trọn vẹn)</option>
                <option value="5d4n">5 Ngày 4 Đêm (Khám phá sâu)</option>
              </select>
            </div>
          </form>

          {/* Bottom Bar: Quick Destination Tags & Main Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 font-semibold">Gợi ý nhanh:</span>
              {[
                { label: '🌸 Đà Lạt sương mù', val: 'Đà Lạt' },
                { label: '🏖️ Phú Quốc đảo ngọc', val: 'Phú Quốc' },
                { label: '🌾 Mù Cang Chải', val: 'Mù Cang Chải' },
                { label: '🛶 Ninh Bình non nước', val: 'Ninh Bình' }
              ].map((chip) => (
                <button
                  key={chip.val}
                  type="button"
                  onClick={() => setDockDest(chip.val)}
                  className="px-3 py-1 rounded-full bg-slate-100 hover:bg-emerald-100/70 text-slate-700 hover:text-emerald-800 text-xs font-semibold transition-colors border border-slate-200 cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={isDockGenerating}
              onClick={handleDockGenerate}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              {isDockGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Đang phân tích thông minh...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Tạo Lộ Trình Thông Minh</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-extrabold">
                    3s
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          3. 4 VALUE PILLARS / USP SECTION (SOFT SAGE GREEN PALETTE)
          Matching Stitch M01: Asymmetric 4-card bento grid with speed, wallet, GPS & community
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="w-full py-16 bg-[#f8fafc]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Section Header */}
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14">
            <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs uppercase tracking-wider mb-3 border border-emerald-200">
              Đột phá thế hệ 4.0
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Tại Sao Hơn 120.000 Du Khách Chọn Wayfare?
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Không còn nỗi sợ lập bảng tính excel phức tạp, đọc hàng trăm bài review trái chiều hay
              lúng túng khi thời tiết xấu bất chợt.
            </p>
          </div>

          {/* 4 Cards Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="p-7 rounded-3xl bg-white hover:bg-emerald-50/30 transition-all duration-300 shadow-sm hover:shadow-md group flex flex-col justify-between border border-slate-200/80 hover:border-emerald-200">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Lập Lịch Trình Siêu Tốc</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  Xử lý dữ liệu phân luồng giao thông, giờ mở cửa và thứ tự ghé thăm hợp lý nhất
                  trong 3 giây, tránh hoàn toàn đi lòng vòng.
                </p>
              </div>
              <div className="mt-8 pt-3 flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                <span>Tự động tối ưu 100%</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-7 rounded-3xl bg-white hover:bg-emerald-50/30 transition-all duration-300 shadow-sm hover:shadow-md group flex flex-col justify-between border border-slate-200/80 hover:border-emerald-200">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Wallet className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Tối Ưu Ngân Sách Thực Tế</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  Dự toán chi tiết từng khoản chi: vé di chuyển, phòng ốc, ẩm thực địa phương và dự
                  phòng phát sinh chính xác đến 95%.
                </p>
              </div>
              <div className="mt-8 pt-3 flex items-center gap-1.5 text-teal-700 font-bold text-xs">
                <span>Cắt giảm 20-30% chi phí thừa</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-7 rounded-3xl bg-white hover:bg-emerald-50/30 transition-all duration-300 shadow-sm hover:shadow-md group flex flex-col justify-between border border-slate-200/80 hover:border-emerald-200">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <NavigationIcon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Trợ Lý Đi Đường On-The-Go</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  Trời mưa bất ngờ? Nhà hàng đóng cửa? AI chủ động đề xuất phương án B thay thế ngay
                  tức thì trong bán kính 1km quanh bạn.
                </p>
              </div>
              <div className="mt-8 pt-3 flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                <span>Đồng hành 24/7 theo GPS</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="p-7 rounded-3xl bg-white hover:bg-emerald-50/30 transition-all duration-300 shadow-sm hover:shadow-md group flex flex-col justify-between border border-slate-200/80 hover:border-emerald-200">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Cộng Đồng Trải Nghiệm Thật</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  Khám phá và sao chép lịch trình thực chiến từ hàng ngàn travel blogger, hướng dẫn
                  viên bản địa đã được kiểm chứng.
                </p>
              </div>
              <div className="mt-8 pt-3 flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                <span>Sao chép lịch trình 1-click</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          4. LIVE INTERACTIVE AI SANDBOX WIDGET
          Matching Stitch M01: Left textarea sandbox + Right dynamic interactive micro-timeline
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="w-full py-16 bg-emerald-50/40 border-y border-emerald-100/70">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="rounded-3xl bg-white p-6 lg:p-10 shadow-xl border border-emerald-100">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left: User Prompt Sandbox (5 cols) */}
              <div className="lg:col-span-5 flex flex-col">
                <div className="inline-flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-2">
                  <Bot className="w-4 h-4" />
                  <span>Trải nghiệm thử nghiệm trực tiếp</span>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
                  Mô Tả Chuyến Đi Theo Cách Của Bạn
                </h3>

                <p className="text-slate-600 text-xs sm:text-sm mb-5 leading-relaxed">
                  Thử nhập một câu ngắn nói rõ mong muốn của bạn. Wayfare sẽ bóc tách địa điểm,
                  phân bổ thời gian và lên thực đơn chi tiết.
                </p>

                <div className="relative mb-4">
                  <textarea
                    rows={4}
                    value={sandboxPrompt}
                    onChange={(e) => setSandboxPrompt(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-slate-50 font-normal text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-200 resize-none"
                  />
                  <button
                    type="button"
                    onClick={handleRunSandbox}
                    className="absolute bottom-3 right-3 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Phân tích</span>
                  </button>
                </div>

                {/* Quick Template Prompt Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">Thử mẫu:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSandboxPrompt(
                        'Gia đình 4 người đi Đà Nẵng 4N3Đ có người lớn tuổi, ưu tiên resort biển và ẩm thực nhẹ nhàng.'
                      );
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 text-xs font-semibold transition-colors border border-slate-200 cursor-pointer"
                  >
                    👨‍👩‍👧‍👦 Gia đình Đà Nẵng
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSandboxPrompt(
                        'Solo trekking Hà Giang 3N2Đ săn mây Mã Pí Lèng, ngân sách sinh viên tiết kiệm.'
                      );
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 text-xs font-semibold transition-colors border border-slate-200 cursor-pointer"
                  >
                    🏍️ Phượt Hà Giang
                  </button>
                </div>
              </div>

              {/* Right: Real-time Output Interactive Canvas (7 cols) */}
              <div className="lg:col-span-7 rounded-2xl bg-slate-50 p-6 flex flex-col justify-between border border-slate-200/80">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
                      AI
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900">
                        {sandboxResult.title}
                      </h4>
                      <p className="text-xs text-slate-500">{sandboxResult.subtitle}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-300">
                    {sandboxResult.badge}
                  </span>
                </div>

                {/* Dynamic Micro Timeline */}
                <div className="space-y-3.5 my-4">
                  {sandboxResult.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-white text-emerald-700 font-bold flex items-center justify-center text-xs ring-1 ring-emerald-200 shadow-xs">
                          {item.time}
                        </div>
                        {idx < sandboxResult.items.length - 1 && (
                          <div className="w-0.5 h-8 bg-slate-200 mt-1" />
                        )}
                      </div>
                      <div className="bg-white p-3.5 rounded-xl flex-1 shadow-xs border border-slate-200/80">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs sm:text-sm text-slate-900">
                            {item.title}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${item.tagColor}`}>
                            {item.cost}
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs mt-1">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Action within widget */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200/80">
                  <span className="text-[11px] text-slate-400">
                    Đã đồng bộ với Google Maps & Dự báo thời tiết thực tế
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      generateAITrip({
                        destination: 'Đà Lạt',
                        daysCount: '3',
                        budget: '4.000.000đ',
                        style: 'Lãng mạn & Ẩm thực'
                      });
                      toast.success('Đang mở chi tiết toàn bộ lộ trình 3 ngày! ✨');
                    }}
                    className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Mở toàn bộ lộ trình 3 ngày</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          5. CURATED TRENDING ITINERARIES SHOWCASE
          Matching Stitch M01: Tabs (All/Bac/Trung/Nam) + 4 luxury destination cards with copy
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="w-full py-16 bg-[#f8fafc]" id="kham-pha">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Section Header with Filter Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-2">
                <Compass className="w-4 h-4" />
                <span>Hành trình được yêu thích nhất</span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Bộ Sưu Tập Lộ Trình AI Nổi Bật
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Được tổng hợp từ hơn 50.000 lượt lưu và đánh giá cao từ cộng đồng người dùng thực tế.
              </p>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'bac', label: 'Miền Bắc' },
                { id: 'trung', label: 'Miền Trung' },
                { id: 'nam', label: 'Miền Nam & Biển Đảo' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setShowcaseRegion(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    showcaseRegion === tab.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Cards Grid Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTours.map((tour) => (
              <div
                key={tour.id}
                className="rounded-3xl bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group border border-slate-200/80 hover:border-emerald-200"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={tour.title}
                    src={tour.image}
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-extrabold text-emerald-800 shadow-sm">
                    {tour.duration}
                  </div>
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{tour.tag}</span>
                  </div>
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium">
                    {tour.category}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <strong className="text-slate-800">{tour.rating}</strong> ({tour.saves} lưu)
                      </span>
                      <span className="text-[11px] font-semibold">{tour.location}</span>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-1.5 group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {tour.title}
                    </h3>
                    <p className="text-slate-500 text-xs mb-4 line-clamp-2 leading-relaxed">
                      {tour.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        Dự toán/người
                      </span>
                      <span className="font-extrabold text-sm sm:text-base text-emerald-700">
                        {tour.price}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyTour(tour)}
                      className="px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-xs font-bold transition-all border border-emerald-200 cursor-pointer flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép tour</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          6. INTERACTIVE MAP & HIDDEN GEMS RADAR
          Matching Stitch M01: Left radar pins with green pulse + Right static map mockup card
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="w-full py-16 bg-emerald-50/30 border-y border-emerald-100/60">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Text & List Details (5 cols) */}
            <div className="lg:col-span-5 flex flex-col">
              <span className="px-3.5 py-1 rounded-full bg-white text-emerald-700 font-extrabold text-xs uppercase tracking-wider mb-3 w-fit border border-emerald-200 shadow-xs">
                Bản đồ nhiệt AI
              </span>

              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                Khám Phá Điểm Đến Bí Mật Không Có Trên Bản Đồ Thường
              </h2>

              <p className="text-slate-600 text-xs sm:text-sm mb-6 leading-relaxed">
                Hệ thống định vị thông minh của Wayfare nhận diện những quán cà phê ẩn mình, con thác
                hoang sơ và cung đường săn ảnh độc nhất vô nhị.
              </p>

              <div className="space-y-3 mb-6">
                <div className="p-4 rounded-2xl bg-white flex items-center justify-between shadow-xs border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                        Suối Tía - Hồ Tuyền Lâm
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Thời điểm săn sương đẹp nhất: 05:30 sáng
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    Chấm xanh AI
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white flex items-center justify-between shadow-xs border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-teal-600" />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                        Bản Sâu Chua - Sa Pa
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Làng cổ không thương mại hóa, yên bình tuyệt đối
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">
                    Bản địa
                  </span>
                </div>
              </div>

              <a
                href="#ai-dock"
                className="inline-flex items-center gap-2 text-emerald-700 font-bold text-xs sm:text-sm hover:underline"
              >
                <span>Bật radar quét điểm bí mật xung quanh bạn</span>
                <Radar className="w-4 h-4" />
              </a>
            </div>

            {/* Map View Container (7 cols) */}
            <div className="lg:col-span-7">
              <div className="relative w-full h-[450px] rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-emerald-200/60">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuC7Jm2XaUGzIRS6gyLerV6qQzZmkIQtu-dM8O4Gg_KI5XzZSwZzluM8x0qjr0vtDcxj6AjcgMzHC3eBFLai-Br3OMplv8X-IqJQKDnggCEKlV3YQ1d3TwhcqzIN8V1GTZx_VRGB4J9Nv-Op2-dc7369ElwTap4tKjtKdI-Ars9lescVoc5Ag43rtdrn5N9dqtO3iaCSsZYcd145ifUWuinU7MBrj9nj8x3sex1B6CVnmR_0DkkXdGf7rw')`
                  }}
                />

                {/* Floating Overlay Card on Map */}
                <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:max-w-md p-4 rounded-2xl bg-white/95 backdrop-blur-xl shadow-xl flex items-center gap-4 text-slate-900 border border-emerald-300/60">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Radar className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-900">
                      Đang phát hiện 14 Hidden Gems
                    </h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Cập nhật mật độ khách trực tiếp theo thời gian thực.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          7. SOCIAL PROOF & TESTIMONIALS
          Matching Stitch M01: 3 customer feedback cards with 5-star ratings and photo avatars
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="w-full py-16 bg-[#f8fafc]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs uppercase tracking-wider mb-3 border border-emerald-200">
              Đánh giá cộng đồng
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Câu Chuyện Khách Hàng Thực Tế
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Hàng ngàn chuyến đi đáng nhớ đã được hoàn thành dễ dàng hơn nhờ sự trợ lực của trí tuệ
              nhân tạo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Review 1 */}
            <div className="p-7 rounded-3xl bg-white shadow-xs flex flex-col justify-between border border-slate-200/80">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 italic text-xs sm:text-sm leading-relaxed mb-6">
                  “Lần đầu đi du lịch cùng đại gia đình 8 người mà mình không hề bị đau đầu. Wayfare
                  phân bổ lộ trình có thời gian nghỉ cho bố mẹ và chọn các quán ăn thanh đạm rất
                  chuẩn.”
                </p>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <img
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-200"
                  alt="Minh Trang"
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
                />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">Minh Trang</h4>
                  <p className="text-[11px] text-slate-500">Chuyến đi Đà Nẵng cùng gia đình</p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="p-7 rounded-3xl bg-white shadow-xs flex flex-col justify-between border border-slate-200/80">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 italic text-xs sm:text-sm leading-relaxed mb-6">
                  “Tính năng cảnh báo mưa và tự động đổi quán cafe trong nhà lúc mình ở Sa Pa cứu cánh
                  cả chuyến đi! Ngân sách tính ra sát nút chỉ lệch có 150k.”
                </p>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <img
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-200"
                  alt="Hoàng Nam"
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80"
                />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">Hoàng Nam</h4>
                  <p className="text-[11px] text-slate-500">Solo Traveler & Nhiếp ảnh</p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="p-7 rounded-3xl bg-white shadow-xs flex flex-col justify-between border border-slate-200/80">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 italic text-xs sm:text-sm leading-relaxed mb-6">
                  “Bọn mình đã có một kỳ trăng mật trong mơ tại Phú Quốc. Những quán bar hoàng hôn do AI
                  gợi ý vắng khách du lịch tour, cực kỳ lãng mạn và riêng tư!”
                </p>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <img
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-200"
                  alt="Quang & Thảo"
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80"
                />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">Quang & Thảo</h4>
                  <p className="text-[11px] text-slate-500">Honeymoon Phú Quốc 4N3Đ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          8. GRAND FINAL CTA BANNER (DEEP FOREST EMERALD GRADIENT WITH MINT GLOW)
          Matching Stitch M01: Full width emerald luxury banner with free instant launch
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="w-full py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="relative rounded-3xl overflow-hidden p-8 sm:p-14 lg:p-16 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white shadow-2xl">
            {/* Subtle Pattern Backdrop */}
            <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
            <div className="absolute top-0 right-1/3 w-64 h-64 rounded-full bg-teal-300/20 blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl flex flex-col items-start">
              <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white font-bold text-xs mb-4 border border-emerald-300/30">
                🚀 Khởi đầu hành trình mới ngay hôm nay
              </span>

              <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                Sẵn Sàng Cho Chuyến Phiêu Lưu Kế Tiếp?
              </h2>

              <p className="text-emerald-100 text-xs sm:text-sm lg:text-base mb-8 leading-relaxed">
                Hãy để AI lo mọi khâu chuẩn bị, nghiên cứu và tối ưu chi phí. Bạn chỉ cần tận hưởng
                từng khoảnh khắc trọn vẹn bên người thân yêu.
              </p>

              <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                <a
                  href="#ai-dock"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-emerald-800 font-bold text-sm shadow-xl hover:bg-emerald-50 hover:scale-[1.03] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Lập Lịch Trình Miễn Phí Ngay</span>
                </a>

                <div className="flex items-center gap-2 text-emerald-100 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Không cần thẻ tín dụng • Dùng ngay không chờ đợi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
