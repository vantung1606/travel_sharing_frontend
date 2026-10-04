import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Award,
  SlidersHorizontal,
  Bookmark,
  Coffee,
  Sun,
  ShieldAlert,
  Play,
  Cpu,
  Waves,
  Settings,
  HelpCircle,
  MessageSquare
} from 'lucide-react';

// Floating Ambient Glow Orb Component (Neuralyn Style)
const FloatingOrb = ({ color, size, top, left, delay = 0 }) => (
  <motion.div
    animate={{
      y: [0, -25, 0],
      x: [0, 18, 0],
      scale: [1, 1.06, 1],
      opacity: [0.2, 0.45, 0.2]
    }}
    transition={{
      duration: 9 + Math.random() * 4,
      repeat: Infinity,
      delay,
      ease: 'easeInOut'
    }}
    className="absolute pointer-events-none blur-[110px] rounded-full z-0"
    style={{
      backgroundColor: color,
      width: size,
      height: size,
      top,
      left
    }}
  />
);

// 3D Perspective Grid Component (Neuralyn Style)
const PerspectiveGrid = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.18]">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage:
          'linear-gradient(#0284c7 1px, transparent 1px), linear-gradient(90deg, #0284c7 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        perspective: '1000px',
        transform: 'rotateX(60deg) scale(2.2) translateY(-40px)',
        transformOrigin: '50% 100%',
        maskImage: 'linear-gradient(to top, black 50%, transparent 100%)'
      }}
    />
  </div>
);

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

  // Multi-Slide Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroSlides = [
    {
      subtitle: 'TRÍ TUỆ NHÂN TẠO LẬP LỊCH TRÌNH THẾ HỆ MỚI • WAYFARE AI 4.0',
      title: (
        <>
          Kiến Tạo Lộ Trình <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
            Đỉnh Cao Cá Nhân Hóa
          </span>
        </>
      ),
      description:
        'Từ ý tưởng mơ hồ đến lịch trình chi tiết từng phút, tự động cân đối chi phí thực tế và tối ưu lộ trình thông minh chỉ trong 3 giây.',
      badge: '⚡ Xử lý siêu tốc 3.2s',
      image:
        'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=2400&q=90',
      destTag: 'Sapa & Mù Cang Chải • 3N2Đ'
    },
    {
      subtitle: 'RADAR ĐỊNH VỊ VỆ TINH ĐỘC BẢN • GPS ON-THE-GO',
      title: (
        <>
          Khám Phá Điểm Đến <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
            Bí Mật Nguyên Sơ
          </span>
        </>
      ),
      description:
        'Hệ thống quét sâu dữ liệu địa phương, dẫn lối bạn đến những con thác nguyên sơ, quán cà phê ẩn mình và góc ngắm bình minh không có trên bản đồ thường.',
      badge: '🛰️ Radar GPS 24/7',
      image:
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2400&q=90',
      destTag: 'Suối Tía Đà Lạt • Săn mây'
    },
    {
      subtitle: 'MẠNG XÃ HỘI CHIA SẺ TRẢI NGHIỆM THỰC CHIẾN',
      title: (
        <>
          Kết Nối Phượt Thủ <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
            120.000+ Du Khách
          </span>
        </>
      ),
      description:
        'Sao chép 1-click các lộ trình được đánh giá cao nhất, chia sẻ kinh nghiệm thực chiến và tìm kiếm bạn đồng hành cho chuyến phiêu lưu kế tiếp.',
      badge: '👥 50k+ Đánh giá thật',
      image:
        'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=2400&q=90',
      destTag: 'Phú Quốc Đảo Ngọc • Trọn gói'
    }
  ];

  // Auto slide rotation every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Dock States
  const [activeDockTab, setActiveDockTab] = useState('ai'); // 'ai' | 'explore' | 'community'
  const [dockDest, setDockDest] = useState('Đà Nẵng & Hội An');
  const [dockBudget, setDockBudget] = useState('standard');
  const [dockStyle, setDockStyle] = useState('chill');
  const [dockDuration, setDockDuration] = useState('3d2n');
  const [isDockGenerating, setIsDockGenerating] = useState(false);

  // Dynamic estimate calculations based on dock settings
  const getDockEstimate = () => {
    let budgetText = '3.500.000đ - 5.000.000đ';
    let savings = 'Tiết kiệm ~850k';

    if (dockBudget === 'budget') {
      budgetText = '2.000.000đ - 3.200.000đ';
      savings = 'Tiết kiệm ~600k';
    } else if (dockBudget === 'luxury') {
      budgetText = '7.500.000đ - 12.000.000đ';
      savings = 'Dịch vụ 5 sao';
    }

    return { budgetText, savings };
  };

  const dockEstimate = getDockEstimate();

  // Interactive Sandbox Day Tab
  const [sandboxActiveDay, setSandboxActiveDay] = useState(1);
  const [sandboxPrompt, setSandboxPrompt] = useState(
    'Tôi muốn đi Đà Lạt 3 ngày 2 đêm cùng bạn gái, ngân sách khoảng 4 triệu, thích quán cà phê view hoàng hôn đồi thông, ăn lẩu gà lá é và không thích chỗ quá đông đúc.'
  );

  // Multi-day sandbox data
  const sandboxMultiDayData = {
    1: {
      dayTitle: 'Ngày 1: Check-in Sương Mù & Thưởng Thức Ẩm Thực Ấm Cúng',
      items: [
        {
          time: '08:30',
          title: 'Ăn sáng Bánh căn Lệ & Cà phê Tùng',
          cost: '75.000đ',
          desc: 'Quán ăn hoài niệm góc dốc nhỏ, thưởng thức ly cà phê phin đậm đà giữa tiết trời se lạnh.',
          tagColor: 'text-blue-800 bg-blue-50 border-blue-200'
        },
        {
          time: '14:30',
          title: 'Check-in Homestay Nhà Gỗ Thung Lũng & Nghỉ ngơi',
          cost: 'Tối ưu 30%',
          desc: 'Phòng view trọn vẹn đồi thông xanh mát, không khí trong lành yên tĩnh tuyệt đối.',
          tagColor: 'text-sky-800 bg-sky-50 border-sky-200'
        },
        {
          time: '18:30',
          title: 'Lẩu gà lá é Tao Ngộ & Kem bơ Thanh Thảo',
          cost: '280.000đ/2 người',
          desc: 'Hương vị cay nồng lá é trứ danh, nhận ưu đãi độc quyền 10% thành viên Wayfare.',
          tagColor: 'text-sky-800 bg-sky-50 border-sky-200'
        }
      ]
    },
    2: {
      dayTitle: 'Ngày 2: Săn Mây Cầu Đất & Chiều Hoàng Hôn Đồi Thông',
      items: [
        {
          time: '05:30',
          title: 'Săn mây bình minh Đồi Chè Cầu Đất',
          cost: 'Miễn phí vé',
          desc: 'Thời điểm biển mây bồng bềnh đẹp nhất. AI định vị góc chụp vắng người và tuyến đường bê tông an toàn.',
          tagColor: 'text-amber-800 bg-amber-50 border-amber-200'
        },
        {
          time: '11:30',
          title: 'Ăn trưa cơm niêu Như Ngọc & Thác Datanla',
          cost: '160.000đ/người',
          desc: 'Thử cảm giác trượt máng nước dài nhất Đông Nam Á xuyên qua cánh rừng thông nguyên sinh.',
          tagColor: 'text-blue-800 bg-blue-50 border-blue-200'
        },
        {
          time: '16:45',
          title: 'Ngắm hoàng hôn & Acoustic Bar Thung Lũng Đèn',
          cost: 'AI Hidden Gem ⭐',
          desc: 'Ly cocktail thơm nồng cùng giai điệu mộc giữa biển ánh sáng nhà lồng rực rỡ.',
          tagColor: 'text-purple-800 bg-purple-50 border-purple-200'
        }
      ]
    },
    3: {
      dayTitle: 'Ngày 3: Dạo Chợ Đà Lạt Mua Đặc Sản & Tạm Biệt',
      items: [
        {
          time: '08:00',
          title: 'Bánh mì xíu mại Hoàng Diệu & Sữa đậu nành nóng',
          cost: '45.000đ',
          desc: 'Bát xíu mại thơm phức béo ngậy kèm bánh mì giòn rụm nạp năng lượng cho buổi sáng.',
          tagColor: 'text-blue-800 bg-blue-50 border-blue-200'
        },
        {
          time: '10:00',
          title: 'Mua quà mứt dâu tây L’angfarm & Chợ đồ len',
          cost: 'Được giảm giá AI',
          desc: 'Gợi ý các quầy hàng uy tín có kiểm định nguồn gốc xuất xứ, tránh tình trạng ép giá.',
          tagColor: 'text-sky-800 bg-sky-50 border-sky-200'
        },
        {
          time: '13:00',
          title: 'Check-out Homestay & Xe Limousine ra sân bay Liên Khương',
          cost: '120.000đ/vé',
          desc: 'Xe đón tận nơi đúng giờ, kết thúc chuyến đi thư giãn trọn vẹn không một chút mệt mỏi.',
          tagColor: 'text-sky-800 bg-sky-50 border-sky-200'
        }
      ]
    }
  };

  // Hidden Gems Interactive State
  const [selectedGemId, setSelectedGemId] = useState('dalat');
  const hiddenGems = {
    dalat: {
      title: 'Suối Tía - Hồ Tuyền Lâm (Đà Lạt)',
      time: 'Khoảnh khắc sương bay: 05:15 - 06:00 sáng',
      badge: 'Chấm xanh AI',
      desc: 'Nơi khởi nguồn dòng nước đổ vào hồ Tuyền Lâm, chèo thuyền kayak qua làn sương mờ ảo như chốn bồng lai tiên cảnh.',
      image:
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=85',
      temp: '17°C • Sương nhẹ',
      crowd: 'Vắng người (95% yên tĩnh)'
    },
    sapa: {
      title: 'Bản Sâu Chua - Sa Pa (Lào Cai)',
      time: 'Mùa hoa lê & đào rừng: 06:30 - 10:00',
      badge: 'Bản địa nguyên bản',
      desc: 'Ngôi làng cổ người Mông nằm chênh vênh sườn núi đá, gần như chưa bị du lịch hóa, tràn ngập không khí bình dị.',
      image:
        'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1400&q=85',
      temp: '15°C • Nắng sớm',
      crowd: 'Chỉ người bản địa'
    },
    phuquoc: {
      title: 'Hòn Dăm & Bãi Rạch Tràm (Phú Quốc)',
      time: 'Ngắm hoàng hôn cô độc: 16:30 - 18:00',
      badge: 'Đảo không sóng di động',
      desc: 'Hòn đảo hoang sơ tách biệt hoàn toàn với thế giới hiện đại, làn nước trong vắt nhìn thấy từng rạn san hô tự nhiên.',
      image:
        'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1400&q=85',
      temp: '28°C • Biển êm',
      crowd: 'Tối đa 20 khách/ngày'
    }
  };

  // Showcase Filter Tab
  const [showcaseRegion, setShowcaseRegion] = useState('all'); // 'all' | 'bac' | 'trung' | 'nam'
  const [savedTours, setSavedTours] = useState({});

  // Curated Itineraries Data
  const curatedTours = [
    {
      id: 'tour-danang',
      region: 'trung',
      title: 'Đà Nẵng & Hội An: Biển Xanh & Phố Cổ Lung Linh',
      desc: 'Nghỉ dưỡng bãi biển Mỹ Khê, chèo SUP bán đảo Sơn Trà và thưởng thức ẩm thực đêm phố đèn lồng Hội An.',
      duration: '4 Ngày 3 Đêm',
      tag: 'Tiết kiệm 20%',
      category: 'Chill & Ẩm thực',
      rating: 4.9,
      saves: '1.420',
      price: '3.850.000đ',
      location: 'Miền Trung',
      image:
        'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=85'
    },
    {
      id: 'tour-mucangchai',
      region: 'bac',
      title: 'Mù Cang Chải & Sa Pa: Biển Vàng Mây Ngàn Tây Bắc',
      desc: 'Chinh phục đèo Khau Phạ hùng vĩ, chiêm ngưỡng đồi Mâm Xôi mùa lúa chín và săn mây đỉnh Fansipan.',
      duration: '3 Ngày 2 Đêm',
      tag: 'Trending 🔥',
      category: 'Nhiếp ảnh & Săn mây',
      rating: 4.95,
      saves: '2.840',
      price: '2.950.000đ',
      location: 'Tây Bắc',
      image:
        'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=85'
    },
    {
      id: 'tour-phuquoc',
      region: 'nam',
      title: 'Phú Quốc: Thiên Đường Hoàng Hôn Đảo Ngọc',
      desc: 'Trải nghiệm cáp treo vượt biển dài nhất thế giới, lặn ngắm san hô Hòn Mây Rút và tiệc cocktail bãi biển.',
      duration: '3 Ngày 2 Đêm',
      tag: 'Độc quyền AI',
      category: 'Nghỉ dưỡng & Hải sản',
      rating: 4.88,
      saves: '950',
      price: '5.600.000đ',
      location: 'Kiên Giang',
      image:
        'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1200&q=85'
    },
    {
      id: 'tour-ninhbinh',
      region: 'bac',
      title: 'Ninh Bình: Tuyệt Tác Di Sản Tràng An & Hang Múa',
      desc: 'Xuôi thuyền khám phá thủy động kỳ vĩ, chinh phục đỉnh ngọa long Hang Múa ngắm trọn toàn cảnh Tam Cốc.',
      duration: '2 Ngày 1 Đêm',
      tag: 'Cuối tuần 🌿',
      category: 'Di sản & Thiên nhiên',
      rating: 4.92,
      saves: '3.120',
      price: '1.850.000đ',
      location: 'Ninh Bình',
      image:
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85'
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
    }, 900);
  };

  // Run Sandbox Simulation
  const handleRunSandbox = () => {
    toast.info('Trợ lý AI đã phân tích yêu cầu và tối ưu lại lộ trình 3 ngày! 💡');
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
              { time: '09:00', title: 'Đến nơi, nhận phòng & nghỉ ngơi' },
              { time: '14:30', title: 'Khám phá các danh thắng nổi bật' },
              { time: '19:00', title: 'Thưởng thức ẩm thực đêm bản địa' }
            ]
          }
        ]
      });
    }
    setSavedTours((prev) => ({ ...prev, [tour.id]: true }));
    toast.success(`Đã sao chép lịch trình "${tour.title}" vào Quản lý Tour! 📋`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-sky-600 selection:text-white pb-20 overflow-x-hidden">
      {/* ──────────────────────────────────────────────────────────────────────────
          1. HERO SECTION (NEURALYN HIGH-TECH CINEMATIC SLIDER + 3D GRID + ORBS)
          - Multi-slide carousel with AnimatePresence
          - Perspective 3D cyber grid & dynamic floating gradient orbs
          - Ultra-bold tracking typography & Royal Sapphire accents
          - 3D Preview Glass Card with Real-time AI metric badge
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden -mt-6 pt-16 pb-28 lg:pb-36 bg-[#031726] text-white">
        {/* Dynamic Background Backdrop with Crossfade Image */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${heroSlides[currentSlide].image}')` }}
            />
          </AnimatePresence>

          {/* Deep Contrast Scrims */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#031726]/95 via-[#082845]/90 to-[#031726]/90" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#031726]/50 to-[#031726]" />

          {/* 3D Perspective Grid Background (Inspired by Neuralyn) */}
          <PerspectiveGrid />

          {/* Dynamic Floating Glowing Ambient Orbs */}
          <FloatingOrb color="#0284c7" size="550px" top="-80px" left="15%" delay={0} />
          <FloatingOrb color="#1d4ed8" size="480px" top="20%" left="60%" delay={2.5} />
          <FloatingOrb color="#38bdf8" size="360px" top="60%" left="35%" delay={4} />
        </div>

        {/* Content Container Aligned with Navbar Width */}
        <div className="relative z-10 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Multi-Slide Animated Text Stack */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="space-y-6"
                >
                  {/* Top Subtitle with wide letter spacing (Neuralyn style) */}
                  <div className="inline-flex items-center gap-2.5 px-4.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xl text-sky-300 font-extrabold text-[11px] sm:text-xs tracking-[0.25em] uppercase border border-sky-400/40 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                    <span>{heroSlides[currentSlide].subtitle}</span>
                  </div>

                  {/* Grand Display Headline */}
                  <h1 className="font-display text-3xl sm:text-5xl lg:text-[3.9rem] font-black tracking-tight leading-[1.14] text-white">
                    {heroSlides[currentSlide].title}
                  </h1>

                  {/* Subtitle with High Legibility */}
                  <p className="text-slate-200 text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed font-normal tracking-[0.015em] opacity-90 mx-auto lg:mx-0">
                    {heroSlides[currentSlide].description}
                  </p>

                  {/* Action Buttons: Ultra-Bold Sapphire Pill + Glass Circle Play Video */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 pt-4">
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href="#ai-dock"
                      className="inline-flex items-center justify-center gap-3 px-9 py-4 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-black text-xs sm:text-sm tracking-[0.15em] uppercase shadow-[0_12px_30px_rgba(2,132,199,0.5)] cursor-pointer ring-2 ring-blue-300/40 shimmer-effect"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
                      <span>LẬP LỊCH TRÌNH AI NGAY</span>
                    </motion.a>

                    <a
                      href="#about"
                      className="flex items-center gap-3 text-white font-black tracking-[0.18em] text-xs sm:text-sm uppercase hover:text-sky-300 transition-colors group cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white transition-all shadow-md">
                        <Play className="w-4 h-4 fill-current ml-0.5 text-white" />
                      </div>
                      <span>VIDEO THỰC TẾ</span>
                    </a>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Slider Navigation Dots (Neuralyn Style: Active expands to w-12) */}
              <div className="flex justify-center lg:justify-start items-center gap-3 mt-10">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 transition-all duration-500 rounded-full cursor-pointer ${
                      currentSlide === idx
                        ? 'w-12 bg-sky-400 shadow-md shadow-sky-400/50'
                        : 'w-3.5 bg-white/30 hover:bg-white/60'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Right Column: 3D Showcase Hero Card (Neuralyn Hero Graphic Style) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, type: 'spring' }}
              className="lg:col-span-5 relative"
            >
              {/* Glowing Halo Backdrop */}
              <div className="absolute -inset-6 bg-sky-500/20 blur-[80px] rounded-full animate-pulse-slow pointer-events-none" />

              {/* Elevated Glass Card Showcase */}
              <div className="relative rounded-[2.5rem] overflow-hidden border-2 border-white/20 bg-slate-900/60 backdrop-blur-2xl shadow-2xl p-6 group hover:-translate-y-2 transition-all duration-500">
                <div className="relative h-72 sm:h-80 w-full rounded-2xl overflow-hidden shadow-inner">
                  <img
                    src={heroSlides[currentSlide].image}
                    alt="Wayfare AI Preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#031726] via-transparent to-transparent opacity-80" />

                  {/* Top Floating Badge */}
                  <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md text-sky-300 font-extrabold text-xs border border-sky-400/40 shadow-lg flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{heroSlides[currentSlide].destTag}</span>
                  </div>

                  {/* Bottom Stats Overlay inside image */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                    <span className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-sky-400" />
                      100% Đã kiểm định GPS
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-blue-600 font-black">
                      AI TỐI ƯU
                    </span>
                  </div>
                </div>

                {/* Sub-card with Realtime AI Metrics */}
                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-lg font-black text-sky-400">3.2s</div>
                    <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                      Tốc độ
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-lg font-black text-sky-400">95%</div>
                    <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                      Chính xác
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-lg font-black text-sky-400">1-Click</div>
                    <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                      Sao chép
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. SMART AI PLANNER DOCK (CRISP ELEVATED CARD OVERLAPPING HERO)
          - Clean glassmorphism white container
          - Omni-search 4 fields with micro-hover states
          - Direct trigger to AI trip planner
      ────────────────────────────────────────────────────────────────────────── */}
      <section
        className="relative z-20 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 -mt-12 lg:-mt-16 mb-20"
        id="ai-dock"
      >
        <div className="p-6 sm:p-8 rounded-[2.5rem] bg-white/95 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(2,132,199,0.16)] border border-slate-200/90 transition-all">
          {/* Planner Modes Segmented Control */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-100 border border-slate-200/60 shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveDockTab('ai')}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeDockTab === 'ai'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'text-slate-700 hover:text-sky-700 hover:bg-white'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
                <span>Lập lịch trình bằng AI</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveDockTab('explore');
                  navigate('/explore');
                }}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeDockTab === 'explore'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'text-slate-700 hover:text-sky-700 hover:bg-white'
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
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeDockTab === 'community'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'text-slate-700 hover:text-sky-700 hover:bg-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Tìm bạn đồng hành</span>
              </button>
            </div>

            {/* Dynamic AI Estimate Pill */}
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200/80 shadow-2xs flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-float-slow">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>Dự toán: ~{dockEstimate.budgetText}</span>
                <span className="w-1 h-1 rounded-full bg-sky-400" />
                <span className="text-sky-700 font-bold">{dockEstimate.savings}</span>
              </div>
            </div>
          </div>

          {/* Omni-Search 4 Fields: High Contrast Modern Cards with Micro-Hover */}
          <form
            onSubmit={handleDockGenerate}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            {/* Field 1: Destination */}
            <div className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/90 transition-all flex flex-col justify-center border border-slate-200/80 hover:border-blue-400 focus-within:border-blue-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100/60 shadow-xs hover:-translate-y-0.5">
              <label className="flex items-center gap-1.5 text-slate-500 text-[11px] font-extrabold uppercase tracking-wider mb-1">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Điểm đến mong muốn</span>
              </label>
              <input
                type="text"
                value={dockDest}
                onChange={(e) => setDockDest(e.target.value)}
                placeholder="Đà Nẵng, Sa Pa, Phú Quốc..."
                className="w-full bg-transparent text-sm sm:text-[15px] font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none truncate tracking-[0.015em]"
              />
            </div>

            {/* Field 2: Budget */}
            <div className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/90 transition-all flex flex-col justify-center border border-slate-200/80 hover:border-blue-400 focus-within:border-blue-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100/60 shadow-xs hover:-translate-y-0.5">
              <label className="flex items-center gap-1.5 text-slate-500 text-[11px] font-extrabold uppercase tracking-wider mb-1">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span>Ngân sách dự kiến</span>
              </label>
              <select
                value={dockBudget}
                onChange={(e) => setDockBudget(e.target.value)}
                className="w-full bg-transparent text-sm sm:text-[15px] font-bold text-slate-900 focus:outline-none cursor-pointer tracking-[0.015em]"
              >
                <option value="budget">Tiết kiệm (2.0 - 3.5 triệu)</option>
                <option value="standard">Tiêu chuẩn (3.5 - 6.0 triệu)</option>
                <option value="luxury">Nghỉ dưỡng sang trọng (7.0 triệu+)</option>
              </select>
            </div>

            {/* Field 3: Travel Style */}
            <div className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/90 transition-all flex flex-col justify-center border border-slate-200/80 hover:border-blue-400 focus-within:border-blue-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100/60 shadow-xs hover:-translate-y-0.5">
              <label className="flex items-center gap-1.5 text-slate-500 text-[11px] font-extrabold uppercase tracking-wider mb-1">
                <Compass className="w-4 h-4 text-blue-600" />
                <span>Gu trải nghiệm</span>
              </label>
              <select
                value={dockStyle}
                onChange={(e) => setDockStyle(e.target.value)}
                className="w-full bg-transparent text-sm sm:text-[15px] font-bold text-slate-900 focus:outline-none cursor-pointer tracking-[0.015em]"
              >
                <option value="chill">Nghỉ dưỡng & Ẩm thực biển</option>
                <option value="photo">Sống ảo & Di sản văn hóa</option>
                <option value="nature">Thiên nhiên hoang sơ & Trekking</option>
                <option value="family">Gia đình & Tiện nghi trẻ em</option>
              </select>
            </div>

            {/* Field 4: Duration */}
            <div className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/90 transition-all flex flex-col justify-center border border-slate-200/80 hover:border-blue-400 focus-within:border-blue-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100/60 shadow-xs hover:-translate-y-0.5">
              <label className="flex items-center gap-1.5 text-slate-500 text-[11px] font-extrabold uppercase tracking-wider mb-1">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Thời lượng chuyến đi</span>
              </label>
              <select
                value={dockDuration}
                onChange={(e) => setDockDuration(e.target.value)}
                className="w-full bg-transparent text-sm sm:text-[15px] font-bold text-slate-900 focus:outline-none cursor-pointer tracking-[0.015em]"
              >
                <option value="2d1n">2 Ngày 1 Đêm (Cuối tuần)</option>
                <option value="3d2n">3 Ngày 2 Đêm (Lý tưởng)</option>
                <option value="4d3n">4 Ngày 3 Đêm (Trọn vẹn)</option>
                <option value="5d4n">5 Ngày 4 Đêm (Khám phá sâu)</option>
              </select>
            </div>
          </form>

          {/* Quick Destination Tags & Royal Blue Primary Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
              <span className="text-slate-600 font-semibold">Gợi ý nhanh:</span>
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
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer shadow-2xs hover:scale-105 active:scale-95 ${
                    dockDest === chip.val
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border-slate-200'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={isDockGenerating}
              onClick={handleDockGenerate}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-700 hover:to-blue-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-sky-500/25 hover:shadow-xl hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 tracking-[0.015em] shimmer-effect"
            >
              {isDockGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-white" />
                  <span>Đang khởi tạo lịch trình...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 text-amber-300" />
                  <span>Tạo Lộ Trình Thông Minh</span>
                  <span className="px-2 py-0.5 rounded-full bg-black/20 text-xs font-black uppercase">
                    3s
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          3. PRODUCTION PROCESS & PRO STANDARD (NEURALYN STYLE)
          - Left: 16:9 cinematic video showcase card with rounded-[3rem] & Play button
          - Right: High-impact Stat Badges & Professional Standards
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="relative py-24 bg-[#e8ebf2] z-20" id="about">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: 16:9 Aspect Video Card */}
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            viewport={{ once: true }}
            className="lg:col-span-6 relative group rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden shadow-2xl w-full aspect-video bg-slate-900 flex items-center justify-center border-4 border-white"
          >
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
              className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-1000"
              alt="Wayfare Cinematic Experience"
            />
            <div className="absolute inset-0 bg-[#0284c7]/20 flex items-center justify-center z-10 group-hover:bg-transparent transition-colors">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform shadow-2xl border-2 border-white/40">
                <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1 text-white" />
              </div>
            </div>
            <div className="absolute bottom-5 left-6 z-20 text-white font-bold text-sm backdrop-blur-md bg-black/40 px-4 py-1.5 rounded-full border border-white/20">
              🎬 Trải Nghiệm Khám Phá Thực Tế
            </div>
          </motion.div>

          {/* Right Column: Narrative & 2x2 High-Impact Metrics */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <span className="text-sky-700 font-black tracking-[0.3em] uppercase text-xs">
              CHẤT LƯỢNG LÀM NÊN THƯƠNG HIỆU
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight">
              Tiêu Chuẩn Lộ Trình <br className="hidden sm:inline" />
              <span className="text-sky-600">Chuyên Nghiệp Pro</span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal tracking-[0.015em] max-w-xl mx-auto lg:mx-0">
              Mọi gợi ý lộ trình xuất xưởng từ Wayfare AI đều phải vượt qua thuật toán tối ưu phân luồng
              và đồng bộ dữ liệu thời tiết thực tế, đảm bảo chuyến đi của bạn mượt mà tuyệt đối.
            </p>

            {/* 2x2 Metric Cards Grid */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-3">
              <div className="space-y-1.5 p-5 sm:p-6 bg-white rounded-2xl shadow-sm border border-slate-200/90 hover:border-sky-400 transition-colors text-left">
                <div className="text-3xl sm:text-4xl font-black text-sky-600">100%</div>
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-900">
                  TỐI ƯU TUYẾN ĐƯỜNG
                </div>
                <p className="text-xs text-slate-500 font-medium">Tránh hoàn toàn đi lòng vòng</p>
              </div>

              <div className="space-y-1.5 p-5 sm:p-6 bg-white rounded-2xl shadow-sm border border-slate-200/90 hover:border-sky-400 transition-colors text-left">
                <div className="text-3xl sm:text-4xl font-black text-blue-600">3.2s</div>
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-900">
                  TỐC ĐỘ XỬ LÝ AI
                </div>
                <p className="text-xs text-slate-500 font-medium">Lập kế hoạch chỉ trong chớp mắt</p>
              </div>

              <div className="space-y-1.5 p-5 sm:p-6 bg-white rounded-2xl shadow-sm border border-slate-200/90 hover:border-sky-400 transition-colors text-left">
                <div className="text-3xl sm:text-4xl font-black text-sky-600">95%</div>
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-900">
                  DỰ TOÁN CHUẨN XÁC
                </div>
                <p className="text-xs text-slate-500 font-medium">Sát với chi phí phát sinh thực</p>
              </div>

              <div className="space-y-1.5 p-5 sm:p-6 bg-white rounded-2xl shadow-sm border border-slate-200/90 hover:border-sky-400 transition-colors text-left">
                <div className="text-3xl sm:text-4xl font-black text-indigo-600">120k+</div>
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-900">
                  DU KHÁCH TIN DÙNG
                </div>
                <p className="text-xs text-slate-500 font-medium">Được yêu mến khắp Việt Nam</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          4. TECHNICAL EXCELLENCE BENTO CARDS (NEURALYN STYLE)
          - 4 modern Bento Cards with rotating gradient icons
          - Subtle silver-blue background with crisp typography
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white relative z-10">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center mb-16 space-y-3">
            <span className="text-sky-600 font-black tracking-[0.3em] uppercase text-xs">
              CÔNG NGHỆ ĐỘT PHÁ
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Đặc Tính Công Nghệ 4.0
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Giải pháp toàn diện giúp bạn rảnh tay tận hưởng chuyến đi mà không cần bận tâm về tính toán.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Cpu,
                tag: 'Lõi AI 4.0',
                title: 'Smart AI Core Engine',
                desc: 'Phân tích thứ tự ghé thăm, giờ mở cửa và mật độ giao thông để tránh hoàn toàn đi lòng vòng.'
              },
              {
                icon: Wallet,
                tag: 'Tiết kiệm 22%',
                title: 'Tối Ưu Ngân Sách Dynamic',
                desc: 'Dự toán từng khoản chi vé máy bay, phòng ở, ăn uống bản địa với độ chính xác lên đến 95%.'
              },
              {
                icon: NavigationIcon,
                tag: 'GPS 24/7',
                title: 'Radar GPS On-The-Go',
                desc: 'Tự động đề xuất phương án B khi thời tiết xấu hay điểm đến đóng cửa trong bán kính 1km.'
              },
              {
                icon: Award,
                tag: 'Cộng đồng lớn',
                title: 'Trải Nghiệm Thực Chiến',
                desc: 'Khám phá và sao chép 1-click lộ trình từ hàng ngàn blogger và hướng dẫn viên bản địa.'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="group p-6 sm:p-8 rounded-[2rem] bg-[#e8ebf2]/40 border-2 border-transparent hover:border-sky-500 hover:bg-white transition-all duration-500 shadow-sm hover:shadow-xl flex flex-col justify-between cursor-pointer hover-elevate"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 group-hover:rotate-12 transition-transform duration-300">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 font-bold text-xs border border-sky-200">
                      {item.tag}
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-slate-900 mb-2 leading-tight group-hover:text-sky-700 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-slate-600 text-sm font-normal leading-relaxed tracking-[0.015em]">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-1.5 text-sky-600 font-bold text-xs uppercase tracking-wider">
                  <span>Khám phá tính năng</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          5. LIVE INTERACTIVE AI TRAVEL STUDIO (PROMPT SANDBOX)
          - Prompt input with quick template pills
          - Interactive 3-day timeline preview
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="w-full py-20 bg-gradient-to-b from-[#eaf2f8] via-[#f1f6fa] to-[#e4eef6] border-b border-blue-900/10">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="rounded-[2.5rem] bg-white p-7 sm:p-10 lg:p-12 shadow-xl border border-blue-200/80">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Interactive Prompt Lab (5 cols) */}
              <div className="lg:col-span-5 flex flex-col">
                <div className="inline-flex items-center gap-2 text-blue-700 font-extrabold text-xs uppercase tracking-wider mb-3">
                  <Bot className="w-4 h-4" />
                  <span>Trải nghiệm thử nghiệm trực tiếp</span>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
                  Mô Tả Chuyến Đi Theo Cách Của Bạn
                </h3>

                <p className="text-slate-600 text-sm sm:text-base mb-6 leading-relaxed font-normal tracking-[0.015em]">
                  Chỉ cần nhập một câu tự nhiên nói rõ mong muốn của bạn. Wayfare sẽ bóc tách danh
                  thắng, căn chỉnh thời gian vàng và lên thực đơn chi tiết.
                </p>

                <div className="relative mb-4">
                  <textarea
                    rows={4}
                    value={sandboxPrompt}
                    onChange={(e) => setSandboxPrompt(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-slate-50/70 font-medium text-sm sm:text-[15px] text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-600 focus:bg-white border border-slate-300/80 resize-none shadow-xs placeholder:text-slate-400 tracking-[0.015em] transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleRunSandbox}
                    className="absolute bottom-3 right-3 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 shimmer-effect"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
                    <span>Phân tích</span>
                  </button>
                </div>

                {/* Quick Template Prompt Pills */}
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                  <span className="text-slate-500 font-semibold">Thử mẫu:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSandboxPrompt(
                        'Gia đình 4 người đi Đà Nẵng 4N3Đ có người lớn tuổi, ưu tiên resort biển và ẩm thực nhẹ nhàng.'
                      );
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 text-xs font-semibold transition-all border border-slate-200 cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
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
                    className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 text-xs font-semibold transition-all border border-slate-200 cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                  >
                    🏍️ Phượt Hà Giang
                  </button>
                </div>
              </div>

              {/* Right Column: Real-time Multi-Day Interactive Canvas (7 cols) */}
              <div className="lg:col-span-7 rounded-[2rem] bg-slate-50/90 p-6 sm:p-7 flex flex-col justify-between text-slate-900 shadow-sm border border-slate-200/90 hover:shadow-md transition-shadow">
                {/* Header with Title and Day Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-black text-sm shadow-sm animate-pulse-slow">
                      AI
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base sm:text-lg text-slate-900">
                        Đà Lạt • Hành Trình Lãng Mạn (3N2Đ)
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium">
                        Dự toán: 3.920.000đ • Tối ưu 98%
                      </p>
                    </div>
                  </div>

                  {/* Multi-Day Tabs in Royal Blue */}
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    {[1, 2, 3].map((dayNum) => (
                      <button
                        key={dayNum}
                        type="button"
                        onClick={() => setSandboxActiveDay(dayNum)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                          sandboxActiveDay === dayNum
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-sky-700 hover:bg-slate-100'
                        }`}
                      >
                        Ngày {dayNum}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Day Subtitle */}
                <div className="py-2.5 text-xs sm:text-sm font-bold text-sky-700 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow" />
                  <span>{sandboxMultiDayData[sandboxActiveDay].dayTitle}</span>
                </div>

                {/* Dynamic Micro Timeline */}
                <div className="space-y-3.5 my-3">
                  {sandboxMultiDayData[sandboxActiveDay].items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3.5 group">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-extrabold flex items-center justify-center text-xs shadow-xs group-hover:scale-110 transition-transform">
                          {item.time}
                        </div>
                        {idx < sandboxMultiDayData[sandboxActiveDay].items.length - 1 && (
                          <div className="w-0.5 h-8 bg-slate-300 mt-1" />
                        )}
                      </div>
                      <div className="bg-white p-3.5 rounded-2xl flex-1 shadow-2xs border border-slate-200/90 hover:border-sky-300 hover:shadow-sm hover:translate-x-1 transition-all">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-sky-700 transition-colors">
                            {item.title}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-xs font-black border ${item.tagColor}`}
                          >
                            {item.cost}
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs sm:text-sm mt-1 font-normal leading-relaxed tracking-[0.015em]">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Action within widget */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200/80">
                  <span className="text-xs text-slate-500 font-semibold">
                    Đã đồng bộ Google Maps & Thời tiết thực tế
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
                    className="px-6 py-2.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 shimmer-effect"
                  >
                    <span>Mở toàn bộ lộ trình 3 ngày</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          6. REAL-WORLD APPLICATIONS / DESTINATIONS GALLERY (NEURALYN STYLE)
          - Tall vertical aspect cards with expanding underline indicators on hover
          - 4px crisp white border and zoom animations
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#e8ebf2] relative z-20">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center mb-16 space-y-4">
            <span className="text-sky-700 font-black tracking-[0.3em] uppercase text-xs">
              KHÔNG GIAN ĐIỂM ĐẾN
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Tuyệt Tác Phong Cảnh Việt Nam
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Những tọa độ du lịch độc bản được AI Wayfare tối ưu góc chụp, giờ săn hoàng hôn và lộ trình di chuyển hoàn hảo.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                title: 'Sa Pa & Mù Cang Chải',
                subtitle: 'Săn mây Tây Bắc',
                img: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80'
              },
              {
                title: 'Phú Quốc Đảo Ngọc',
                subtitle: 'Hoàng hôn biển xanh',
                img: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=800&q=80'
              },
              {
                title: 'Đà Lạt Ngàn Hoa',
                subtitle: 'Sương mù & Chill',
                img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
              },
              {
                title: 'Hội An & Đà Nẵng',
                subtitle: 'Phố cổ & Di sản',
                img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="relative group h-[250px] sm:h-[350px] md:h-[440px] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white cursor-pointer"
              >
                <img
                  src={item.img}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  alt={item.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#031726] via-[#031726]/40 to-transparent opacity-65 group-hover:opacity-85 transition-opacity" />
                <div className="absolute bottom-5 left-5 right-5 sm:bottom-8 sm:left-8 sm:right-8 z-10 text-white">
                  <span className="text-sky-300 font-bold text-xs uppercase tracking-wider block mb-1">
                    {item.subtitle}
                  </span>
                  <h4 className="text-base sm:text-2xl font-black text-white tracking-tight mb-2">
                    {item.title}
                  </h4>
                  {/* Neuralyn expanding line indicator on hover */}
                  <div className="w-10 sm:w-12 h-1.5 bg-sky-400 rounded-full transform origin-left transition-transform duration-500 scale-x-0 group-hover:scale-x-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          7. CURATED TRENDING ITINERARIES SHOWCASE
          - Category filter pills with Royal Blue active state
          - White photo cards with verified metrics & prices
      ────────────────────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-20 bg-gradient-to-b from-[#f0f9ff] via-[#f8fafc] to-[#e0f2fe] border-b border-sky-900/10"
        id="kham-pha"
      >
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Section Header with Filter Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <span className="px-4 py-1.5 rounded-full bg-sky-100 text-sky-800 font-extrabold text-xs uppercase tracking-wider border border-sky-200 shadow-2xs">
                ⭐ Tuyển Chọn Xu Hướng
              </span>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
                Lịch Trình Được Sao Chép Nhiều Nhất
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-1.5 font-normal tracking-[0.015em]">
                Những chuyến đi hoàn hảo đã được cộng đồng trải nghiệm, kiểm tra thực tế và đánh giá cao.
              </p>
            </div>

            {/* Region Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'bac', label: 'Miền Bắc & Tây Bắc' },
                { id: 'trung', label: 'Miền Trung & Cao Nguyên' },
                { id: 'nam', label: 'Miền Nam & Biển Đảo' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setShowcaseRegion(tab.id)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer hover:scale-105 active:scale-95 ${
                    showcaseRegion === tab.id
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                      : 'bg-white hover:bg-sky-50 text-slate-700 border border-sky-200/80 shadow-2xs'
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
                className="rounded-[2rem] bg-white overflow-hidden shadow-sm hover:shadow-2xl hover-elevate transition-all duration-300 flex flex-col group border border-sky-100 hover:border-sky-400 cursor-pointer"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    alt={tour.title}
                    src={tour.image}
                  />
                  <div className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-xs font-black text-sky-900 shadow-md group-hover:scale-105 transition-transform">
                    {tour.duration}
                  </div>
                  <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-sky-600 text-white text-xs font-bold flex items-center gap-1 shadow-md">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
                    <span>{tour.tag}</span>
                  </div>
                  <div className="absolute bottom-3.5 left-3.5 px-3.5 py-1 rounded-full bg-slate-950/75 backdrop-blur-md text-white text-xs font-bold">
                    {tour.category}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1 justify-between bg-white">
                  <div>
                    <div className="flex items-center justify-between text-slate-500 text-xs sm:text-sm mb-2 font-semibold">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <strong className="text-slate-900">{tour.rating}</strong> ({tour.saves} lưu)
                      </span>
                      <span className="text-sky-700 font-bold">{tour.location}</span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 mb-2 group-hover:text-sky-700 transition-colors line-clamp-1">
                      {tour.title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-5 line-clamp-2 leading-relaxed font-normal tracking-[0.015em]">
                      {tour.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 font-semibold block">
                        Dự toán/người
                      </span>
                      <span className="font-black text-base sm:text-lg text-sky-700">
                        {tour.price}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyTour(tour)}
                      className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all border flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 ${
                        savedTours[tour.id]
                          ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                          : 'bg-sky-50 hover:bg-sky-600 hover:text-white text-sky-800 border-sky-200'
                      }`}
                    >
                      {savedTours[tour.id] ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Đã lưu</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Sao chép tour</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          8. INTERACTIVE MAP & HIDDEN GEMS RADAR
          - Immersive midnight obsidian section canvas
          - High-tech glowing satellite radar & destination preview
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="w-full py-20 bg-gradient-to-b from-[#0a111a] via-[#0f1926] to-[#070d14] text-white border-b border-slate-800">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="rounded-[2.5rem] bg-slate-900/90 backdrop-blur-xl text-white p-7 sm:p-12 shadow-2xl border border-slate-700/80">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Text & List Details (5 cols) */}
              <div className="lg:col-span-5 flex flex-col">
                <span className="px-4 py-1.5 rounded-full bg-blue-500/20 text-sky-300 font-extrabold text-xs uppercase tracking-wider mb-3 w-fit border border-blue-400/40">
                  Radar Vệ Tinh Độc Bản
                </span>

                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4 leading-tight">
                  Khám Phá Điểm Đến Bí Mật Không Có Trên Bản Đồ Thường
                </h2>

                <p className="text-slate-300 text-sm sm:text-base mb-7 leading-relaxed font-normal tracking-[0.015em]">
                  Hệ thống định vị thông minh của Wayfare quét sâu vào dữ liệu bản địa, tìm ra những
                  con thác nguyên sơ, quán cà phê ẩn mình và góc săn mây bình minh tuyệt đối riêng tư.
                </p>

                {/* Clickable Hidden Gem Cards */}
                <div className="space-y-3.5 mb-7">
                  {[
                    { id: 'dalat', name: 'Suối Tía - Hồ Tuyền Lâm (Đà Lạt)', tag: 'Chấm xanh AI' },
                    { id: 'sapa', name: 'Bản Sâu Chua - Sa Pa (Lào Cai)', tag: 'Bản địa nguyên bản' },
                    { id: 'phuquoc', name: 'Hòn Dăm & Bãi Rạch Tràm (Phú Quốc)', tag: 'Hoang sơ 100%' }
                  ].map((gem) => (
                    <button
                      key={gem.id}
                      type="button"
                      onClick={() => setSelectedGemId(gem.id)}
                      className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all text-left cursor-pointer border hover:scale-[1.02] active:scale-[0.98] ${
                        selectedGemId === gem.id
                          ? 'bg-blue-600/35 border-blue-400 shadow-md ring-1 ring-blue-400/30'
                          : 'bg-white/10 hover:bg-white/15 border-white/15'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-3 h-3 rounded-full ${
                            selectedGemId === gem.id ? 'bg-sky-400 animate-ping' : 'bg-sky-400'
                          }`}
                        />
                        <div>
                          <h4 className="font-bold text-sm sm:text-base text-white">{gem.name}</h4>
                          <p className="text-xs text-slate-300 font-medium">
                            {hiddenGems[gem.id].time}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase transition-colors ${
                          selectedGemId === gem.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/20 text-slate-300'
                        }`}
                      >
                        {gem.tag}
                      </span>
                    </button>
                  ))}
                </div>

                <a
                  href="#ai-dock"
                  className="inline-flex items-center gap-2 text-sky-400 font-bold text-sm sm:text-base hover:text-sky-300 hover:underline cursor-pointer group"
                >
                  <span>Bật radar quét điểm bí mật xung quanh bạn</span>
                  <Radar className="w-5 h-5 animate-pulse group-hover:rotate-45 transition-transform" />
                </a>
              </div>

              {/* Dynamic Map & Scenic View Container (7 cols) */}
              <div className="lg:col-span-7">
                <div className="relative w-full h-[460px] rounded-[2rem] overflow-hidden shadow-2xl bg-slate-900 border border-slate-700">
                  <div
                    className="w-full h-full bg-cover bg-center transition-all duration-700"
                    style={{
                      backgroundImage: `url('${hiddenGems[selectedGemId].image}')`
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]" />

                  {/* Top Badge: Weather & Crowd */}
                  <div className="absolute top-5 left-5 flex items-center gap-2.5">
                    <span className="px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md text-sky-300 text-xs font-bold border border-sky-400/40">
                      🌤️ {hiddenGems[selectedGemId].temp}
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md text-sky-300 text-xs font-bold border border-sky-400/40">
                      👥 {hiddenGems[selectedGemId].crowd}
                    </span>
                  </div>

                  {/* Floating GPS Radar Card with Dynamic Selected Gem Details */}
                  <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:max-w-md p-5 rounded-2xl bg-slate-900/95 backdrop-blur-xl shadow-2xl flex items-center gap-4 text-white border border-slate-700 hover:scale-[1.02] transition-transform">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/50">
                      <Radar className="w-6 h-6 animate-spin-slow" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-sm sm:text-base text-white">
                        {hiddenGems[selectedGemId].title}
                      </h5>
                      <p className="text-xs text-slate-300 font-medium mt-0.5 line-clamp-2">
                        {hiddenGems[selectedGemId].desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          9. TESTIMONIALS (NEURALYN STYLE: CORNER CUT ACCENTS + SLEEK TYPOGRAPHY)
          - 3 modern cards with corner accent & elegant 5 stars
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="relative py-24 bg-[#89aad3]/30 z-10" id="testimonials">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-800 font-extrabold text-xs uppercase tracking-wider border border-blue-200">
              ❤️ CỘNG ĐỒNG YÊU MẾN
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Khách Hàng Nói Gì Về Wayfare
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Hàng ngàn chuyến đi đáng nhớ đã được hoàn thành trọn vẹn nhờ sự đồng hành của AI Wayfare.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Minh Trang',
                role: 'CHUYẾN ĐI ĐÀ NẴNG GIA ĐÌNH',
                text: 'Lần đầu đi du lịch cùng đại gia đình 8 người mà mình không hề bị stress. Wayfare phân bổ lộ trình có thời gian nghỉ cho bố mẹ và chọn các quán ăn thanh đạm rất chuẩn vị.',
                avatar:
                  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
              },
              {
                name: 'Hoàng Nam',
                role: 'SOLO TRAVELER & NHIẾP ẢNH GIA',
                text: 'Tính năng cảnh báo mưa bất chợt và tự động đổi quán cà phê ngắm cảnh lúc mình ở Sa Pa đã cứu cánh cả chuyến đi! Chi phí dự tính sát nút chỉ lệch có 150k.',
                avatar:
                  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80'
              },
              {
                name: 'Quang & Thảo',
                role: 'HONEYMOON PHÚ QUỐC 4N3Đ',
                text: 'Bọn mình đã có một kỳ trăng mật trong mơ tại Phú Quốc. Những quán bar hoàng hôn do AI gợi ý không hề xô bồ như các tour đại trà, cực kỳ lãng mạn và tinh tế!',
                avatar:
                  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -8, scale: 1.01 }}
                className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden border border-slate-200/90 cursor-pointer flex flex-col justify-between"
              >
                {/* Neuralyn signature corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-sky-500/10 rounded-bl-[3rem]" />

                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>

                  <p className="text-slate-800 text-base sm:text-lg font-bold leading-relaxed mb-8 italic">
                    "{item.text}"
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center gap-4">
                  <img
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-sky-500"
                    alt={item.name}
                    src={item.avatar}
                  />
                  <div>
                    <h4 className="text-lg font-black text-slate-900 leading-tight">
                      {item.name}
                    </h4>
                    <p className="text-sky-600 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                      {item.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          10. FAQ (FREQUENTLY ASKED QUESTIONS - NEURALYN STYLE)
          - Clean card-based FAQ list with CheckCircle2 icons
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white relative z-10">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 space-y-3">
              <span className="text-sky-600 font-black tracking-[0.3em] uppercase text-xs">
                GIẢI ĐÁP THẮC MẮC
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                Câu Hỏi Thường Gặp
              </h2>
            </div>

            <div className="space-y-5">
              {[
                {
                  q: 'Lập lịch trình bằng AI Wayfare có mất phí không?',
                  a: 'Hoàn toàn 100% miễn phí! Bạn có thể khởi tạo không giới hạn lộ trình, xem bản đồ GPS và dự toán ngân sách chi tiết.'
                },
                {
                  q: 'Dự toán chi phí có chuẩn xác với thực tế tại địa phương không?',
                  a: 'Độ chính xác đạt tới 95%. Hệ thống tự động quét và cập nhật biểu giá vé tham quan, giá homestay và menu các quán ăn theo thời gian thực.'
                },
                {
                  q: 'Tôi có thể tùy chỉnh hoặc đổi điểm đến sau khi AI đã tạo không?',
                  a: 'Chắc chắn có. Bạn hoàn toàn có thể kéo thả, thêm bớt điểm đến, thay đổi giờ giấc hoặc đổi sang phương án dự phòng chỉ bằng 1 chạm.'
                },
                {
                  q: 'Làm thế nào để tìm bạn đồng hành cùng chuyến đi?',
                  a: 'Bạn chỉ cần chọn tính năng "Tìm bạn đồng hành" trong mục Cộng đồng hoặc đăng lộ trình của mình lên để kết nối cùng các phượt thủ khác.'
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 sm:p-7 rounded-[2rem] bg-[#e8ebf2]/40 border-2 border-transparent hover:border-sky-500 transition-all duration-300 group shadow-sm hover:shadow-lg"
                >
                  <h4 className="text-base sm:text-lg font-black text-slate-900 mb-3 flex items-start gap-3.5">
                    <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                    <span>{item.q}</span>
                  </h4>
                  <p className="text-slate-600 text-sm font-normal pl-9 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          11. GRAND FINALE BANNER / NEWSLETTER (NEURALYN STYLE)
          - Rounded-[3.5rem] grand container with ambient glowing orb inside
          - Dual column with integrated input bar and instant AI trigger
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 xl:px-12 bg-[#e8ebf2] relative z-10">
        <div className="w-full max-w-[1700px] mx-auto">
          <div className="bg-gradient-to-r from-[#031726] via-[#082845] to-[#0c385f] rounded-[3rem] sm:rounded-[3.5rem] p-10 sm:p-14 lg:p-16 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl border border-sky-500/20 text-white">
            {/* Ambient Blurred Light Orb inside container */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="space-y-5 relative z-10 text-center lg:text-left max-w-xl">
              <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-sky-300 font-black text-xs uppercase tracking-widest border border-white/20">
                🚀 BẮT ĐẦU CHUYẾN PHIÊU LƯU NGAY
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Sẵn Sàng Cho Chuyến Đi <br className="hidden sm:inline" />
                Kế Tiếp Cùng <span className="text-sky-300">Wayfare AI</span>
              </h2>
              <p className="text-slate-300 text-sm sm:text-base font-normal leading-relaxed opacity-90">
                Hãy để AI lo mọi khâu chuẩn bị, nghiên cứu và tối ưu chi phí. Bạn chỉ cần tận hưởng trọn vẹn từng khoảnh khắc.
              </p>
            </div>

            <div className="relative z-10 w-full max-w-md">
              <div className="flex flex-col sm:flex-row bg-white p-2 rounded-3xl shadow-2xl gap-2">
                <input
                  type="text"
                  placeholder="Nhập điểm đến bạn muốn đi..."
                  value={dockDest}
                  onChange={(e) => setDockDest(e.target.value)}
                  className="flex-1 bg-transparent px-5 py-3.5 text-slate-900 placeholder:text-slate-400 outline-none font-bold text-sm tracking-[0.015em]"
                />
                <button
                  type="button"
                  onClick={handleDockGenerate}
                  className="bg-sky-600 hover:bg-sky-700 text-white px-7 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all shadow-md hover:scale-105 active:scale-95 shimmer-effect cursor-pointer"
                >
                  TẠO TOUR
                </button>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2 text-sky-200 text-xs font-semibold mt-3.5">
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                <span>Hoàn toàn miễn phí • Không cần thẻ tín dụng</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
