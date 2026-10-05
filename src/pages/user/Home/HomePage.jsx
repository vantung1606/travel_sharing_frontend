import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../components/common/Toast';
import { homeApi, itineraryApi, postApi } from '../../../services/api';
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
  MessageSquare,
  Share2
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
    addItinerary,
    isLoggedIn,
    currentUser,
    setIsAuthModalOpen,
    setAuthMode
  } = useApp();

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

  // Multi-day sandbox data for interactive experience
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

  // Dynamic Backend Data States
  const [homeStats, setHomeStats] = useState({
    totalItineraries: 128,
    totalPlaces: 84,
    totalPosts: 320,
    totalUsers: 1450,
    totalLikes: 5240,
    totalComments: 1890
  });
  const [featuredTours, setFeaturedTours] = useState(curatedTours);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [isLoadingCommunity, setIsLoadingCommunity] = useState(false);
  const [trendingDestinations, setTrendingDestinations] = useState([
    { label: '🌸 Đà Lạt sương mù', val: 'Đà Lạt' },
    { label: '🏖️ Phú Quốc đảo ngọc', val: 'Phú Quốc' },
    { label: '🌾 Mù Cang Chải', val: 'Mù Cang Chải' },
    { label: '🛶 Ninh Bình non nước', val: 'Ninh Bình' },
    { label: '🌊 Đà Nẵng & Hội An', val: 'Đà Nẵng & Hội An' }
  ]);
  const [likedPosts, setLikedPosts] = useState({});
  const [bookmarkedPosts, setBookmarkedPosts] = useState({});

  // 1. Fetch live platform stats & destinations on mount
  useEffect(() => {
    homeApi.getStats().then((data) => {
      if (data) setHomeStats(data);
    });

    homeApi.getTrendingDestinations().then((dests) => {
      if (Array.isArray(dests) && dests.length > 0) {
        const mapped = dests.map((d) => ({
          label: d.includes('Đà Lạt')
            ? '🌸 ' + d
            : d.includes('Phú Quốc')
              ? '🏖️ ' + d
              : d.includes('Đà Nẵng')
                ? '🌊 ' + d
                : d.includes('Mù Cang')
                  ? '🌾 ' + d
                  : '✨ ' + d,
          val: d
        }));
        setTrendingDestinations(mapped);
      }
    });

    // Fetch community highlights
    setIsLoadingCommunity(true);
    homeApi.getCommunityHighlights()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCommunityPosts(data);
        }
      })
      .finally(() => setIsLoadingCommunity(false));
  }, []);

  // 2. Fetch featured itineraries on region tab change
  useEffect(() => {
    homeApi.getFeaturedItineraries(showcaseRegion).then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setFeaturedTours(data);
      }
    });
  }, [showcaseRegion]);

  // Guest Authentication Guard Helper
  const requireAuth = (actionDescription, callback) => {
    if (!isLoggedIn) {
      toast.info(`Vui lòng đăng nhập để ${actionDescription}! 🔐`);
      setIsAuthModalOpen(true);
      return false;
    }
    if (callback) callback();
    return true;
  };

  // Trigger AI Generator from Dock (Lưu trực tiếp vào CSDL)
  const handleDockGenerate = async (e) => {
    e?.preventDefault();
    if (!isLoggedIn) {
      requireAuth('khởi tạo và lưu lịch trình vào tài khoản cá nhân của bạn');
      return;
    }

    setIsDockGenerating(true);
    try {
      await itineraryApi.aiQuickGenerate(
        {
          destination: dockDest,
          budget: dockBudget,
          style: dockStyle,
          duration: dockDuration
        },
        currentUser?.email
      );
      toast.success(`Đã khởi tạo lộ trình AI thành công cho ${dockDest}! ✨`);
      navigate('/itineraries');
    } catch (err) {
      console.warn('Backend quick generate warning, using local fallback:', err);
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
      toast.success(`Đã khởi tạo lộ trình cho ${dockDest}! ✨`);
      navigate('/itineraries');
    } finally {
      setIsDockGenerating(false);
    }
  };

  // Run Sandbox Simulation
  const handleRunSandbox = () => {
    toast.info('Trợ lý AI đã phân tích yêu cầu và tối ưu lại lộ trình 3 ngày! 💡');
  };

  // Copy Tour Action (Đồng bộ vào CSDL MySQL)
  const handleCopyTour = async (tour) => {
    if (!isLoggedIn) {
      requireAuth('sao chép lịch trình này vào bộ sưu tập cá nhân của bạn');
      return;
    }

    try {
      if (tour.id && typeof tour.id === 'number') {
        await itineraryApi.cloneItinerary(tour.id, currentUser?.email);
      } else {
        if (addItinerary) {
          addItinerary({
            title: '[Sao chép] ' + tour.title,
            destination: tour.location || tour.destination,
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
      }
      setSavedTours((prev) => ({ ...prev, [tour.id]: true }));
      toast.success(`Đã sao chép lịch trình "${tour.title}" vào Quản lý Tour của bạn! 📋`);
    } catch (err) {
      toast.error('Sao chép lịch trình thất bại: ' + err.message);
    }
  };

  // Community Interactions from Home Page
  const handleLikePost = async (postId) => {
    if (!isLoggedIn) {
      requireAuth('thích bài viết từ cộng đồng Wayfare');
      return;
    }
    setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
    try {
      await postApi.toggleLike(postId, currentUser?.email);
    } catch (e) {
      console.warn('Like post warning:', e);
    }
  };

  const handleBookmarkPost = async (postId) => {
    if (!isLoggedIn) {
      requireAuth('lưu bài viết này vào danh mục yêu thích');
      return;
    }
    const isCurrentlySaved = bookmarkedPosts[postId];
    setBookmarkedPosts((prev) => ({ ...prev, [postId]: !isCurrentlySaved }));
    try {
      await postApi.toggleBookmark(postId, currentUser?.email);
      toast.success(isCurrentlySaved ? 'Đã bỏ lưu bài viết' : 'Đã lưu bài viết vào mục yêu thích! 🔖');
    } catch (e) {
      console.warn('Bookmark post warning:', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-blue-600 selection:text-white pb-20">
      {/* ──────────────────────────────────────────────────────────────────────────
          1. HERO SECTION (CINEMATIC DEEP ATMOSPHERE - NO WASHED-OUT BOTTOM)
          - Deep contrast dark green & slate canvas, no hazy bottom mist
          - Single-row balanced trust metrics (No awkward wrapping)
          - Royal Blue CTA buttons with energetic glow
          - Quick inspiration tags in unified row
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden -mt-16 pt-28 pb-24 lg:pt-32 lg:pb-32 bg-[#031726] text-white">
        {/* Cinematic Backdrop with Clear Vibrant Landscape */}
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center transition-all duration-1000 scale-105"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=2400&q=90')`
            }}
          />
          {/* Refined Photographic Scrim - Clear, Vibrant Background ("nền rõ hơn tí") */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-[#031726]/30 to-slate-950/50" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-[#031726]/90" />

          {/* Radiant Subtle Ambient Light with Pulse Animations */}
          <div className="absolute -top-12 left-1/3 w-[600px] h-[600px] rounded-full bg-sky-500/20 blur-[140px] pointer-events-none animate-pulse-slow" />
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/15 blur-[130px] pointer-events-none animate-pulse-slow [animation-delay:3.5s]" />
        </div>

        {/* Content Container Aligned with Navbar Width */}
        <div className="relative z-10 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Main Hero Header Stack */}
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
            {/* Expansive Grand Headline with Gradient Flow */}
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.18] text-white drop-shadow-md">
              Kiến Tạo Chuyến Đi Mơ Ước <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-300 bg-clip-text text-transparent animate-gradient-flow">
                Cùng Wayfare
              </span>{' '}
            </h1>

            {/* Subtitle with High Legibility & Relaxed 14px-16px Text */}
            <p className="text-slate-100 text-sm sm:text-base max-w-2xl leading-relaxed font-normal tracking-[0.015em] drop-shadow-sm">
              Từ ý tưởng mơ hồ đến lịch trình chi tiết từng phút, dự toán ngân sách chính xác theo
              thời gian thực và cá nhân hóa theo gu riêng của bạn chỉ với một chạm.
            </p>

            {/* Action Buttons: VIBRANT ROYAL BLUE BUTTONS WITH SHIMMER */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <a
                href="#ai-dock"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-extrabold text-sm sm:text-base shadow-[0_12px_30px_rgba(2,132,199,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer ring-2 ring-blue-300/40 tracking-[0.015em] shimmer-effect"
              >
                <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow" />
                <span>Lập Lịch Trình AI Ngay</span>
                <span className="px-2.5 py-0.5 rounded-full bg-black/25 text-xs font-black uppercase tracking-wider">
                  Miễn phí
                </span>
              </a>

              <a
                href="#kham-pha"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white font-bold text-sm sm:text-base transition-all border border-white/25 hover:border-white/50 shadow-md cursor-pointer tracking-[0.015em] hover:scale-105 active:scale-95 group"
              >
                <Compass className="w-5 h-5 text-sky-300 group-hover:rotate-45 transition-transform duration-300" />
                <span>Khám Phá Điểm Đến Hot</span>
                <ArrowDown className="w-4 h-4 text-sky-300 group-hover:translate-y-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. SMART AI PLANNER DOCK (CRISP WHITE ELEVATED CARD - NO WASHOUT)
          - Crisp white backdrop with soft ambient depth
          - High-contrast search inputs with clear states
          - Royal Blue CTA button with rocket launch icon
          - Aligned with Navbar container padding
      ────────────────────────────────────────────────────────────────────────── */}
      <section
        className="relative z-20 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 -mt-12 lg:-mt-16 mb-20"
        id="ai-dock"
      >
        <div className="p-6 sm:p-8 rounded-3xl bg-white/95 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(2,132,199,0.16)] border border-slate-200/90 transition-all">
          {/* Planner Modes Segmented Control */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-100 border border-slate-200/60 shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveDockTab('ai')}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer ${activeDockTab === 'ai'
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
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${activeDockTab === 'explore'
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
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${activeDockTab === 'community'
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
              {trendingDestinations.map((chip) => (
                <button
                  key={chip.val}
                  type="button"
                  onClick={() => setDockDest(chip.val)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer shadow-2xs hover:scale-105 active:scale-95 ${dockDest === chip.val
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
          3. 4 VALUE PILLARS (CLEAN MODERN BENTO CARDS)
          - Subtle sage leaf gradient canvas
          - Crisp white cards with distinctive accent borders
          - Gradient icon bubbles & crisp 14px typography
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="w-full py-20 bg-gradient-to-b from-[#f2f7f4] via-[#f8faf9] to-[#edf5f0] border-t border-b border-sky-900/10">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Section Header */}
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-14 space-y-3">

            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tại Sao Hơn {homeStats.totalUsers.toLocaleString()}+ Du Khách Chọn Wayfare?
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal tracking-[0.015em]">
              Không còn nỗi lo lập bảng tính excel phức tạp, lúng túng khi thời tiết xấu hay chi tiêu
              thâm hụt ngoài dự kiến.
            </p>
          </div>

          {/* 4 Cards Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="p-7 rounded-3xl bg-white hover:bg-sky-50/30 transition-all duration-300 shadow-sm hover:shadow-xl hover-elevate group flex flex-col justify-between border border-slate-200/90 hover:border-blue-400 cursor-pointer">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Zap className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200/60 group-hover:scale-105 transition-transform">
                    Tốc độ 3.2s
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">Lập Lịch Trình Siêu Tốc</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-normal tracking-[0.015em]">
                  Xử lý dữ liệu phân luồng giao thông, giờ mở cửa và thứ tự ghé thăm hợp lý nhất
                  trong 3 giây, tránh hoàn toàn đi lòng vòng.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-blue-600 font-bold text-sm">
                <span>Tự động tối ưu 100%</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-7 rounded-3xl bg-white hover:bg-sky-50/30 transition-all duration-300 shadow-sm hover:shadow-xl hover-elevate group flex flex-col justify-between border border-slate-200/90 hover:border-sky-400 cursor-pointer">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/25 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 font-bold text-xs border border-sky-200/60 group-hover:scale-105 transition-transform">
                    Tiết kiệm 22%
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-sky-700 transition-colors">Tối Ưu Ngân Sách Thực Tế</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-normal tracking-[0.015em]">
                  Dự toán chi tiết từng khoản chi: vé máy bay, phòng ốc, ăn uống địa phương và dự
                  phòng phát sinh chính xác đến 95%.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-sky-700 font-bold text-sm">
                <span>Cắt giảm chi phí thừa</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-7 rounded-3xl bg-white hover:bg-sky-50/30 transition-all duration-300 shadow-sm hover:shadow-xl hover-elevate group flex flex-col justify-between border border-slate-200/90 hover:border-blue-400 cursor-pointer">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-600/25 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <NavigationIcon className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200/60 group-hover:scale-105 transition-transform">
                    GPS 24/7
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">Trợ Lý Đi Đường On-The-Go</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-normal tracking-[0.015em]">
                  Trời mưa bất ngờ? Điểm tham quan đóng cửa? AI chủ động đề xuất phương án B thay thế
                  ngay tức thì trong bán kính 1km.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-blue-600 font-bold text-sm">
                <span>Đồng hành theo GPS</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="p-7 rounded-3xl bg-white hover:bg-sky-50/30 transition-all duration-300 shadow-sm hover:shadow-xl hover-elevate group flex flex-col justify-between border border-slate-200/90 hover:border-amber-400 cursor-pointer">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-md shadow-amber-500/25 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200/60 group-hover:scale-105 transition-transform">
                    {homeStats.totalPosts.toLocaleString()}+ Bài Viết
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-amber-700 transition-colors">Cộng Đồng Trải Nghiệm Thật</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-normal tracking-[0.015em]">
                  Khám phá và sao chép lịch trình thực chiến từ hàng ngàn travel blogger, hướng dẫn
                  viên bản địa đã được kiểm chứng.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-amber-700 font-bold text-sm">
                <span>Sao chép 1-click</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          4. LIVE INTERACTIVE AI TRAVEL STUDIO
          - Dedicated soft blue-slate lab environment
          - Elevated grand white workspace card
          - Left: Natural Prompt Lab with chips & Royal Blue action
          - Right: Dynamic multi-day timeline with instant estimates
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
              <div className="lg:col-span-7 rounded-3xl bg-slate-50/90 p-6 sm:p-7 flex flex-col justify-between text-slate-900 shadow-sm border border-slate-200/90 hover:shadow-md transition-shadow">
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
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer hover:scale-105 active:scale-95 ${sandboxActiveDay === dayNum
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
          5. CURATED TRENDING ITINERARIES SHOWCASE
          - Soft leaf-green natural canvas
          - Category filter pills with Royal Blue active state
          - White photo cards with verified metrics & prices
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="w-full py-20 bg-gradient-to-b from-[#f0f9ff] via-[#f8fafc] to-[#e0f2fe] border-b border-sky-900/10" id="kham-pha">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Section Header with Filter Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>

              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
                Bộ Sưu Tập Lộ Trình AI Nổi Bật
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-1 font-normal tracking-[0.015em]">
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
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${showcaseRegion === tab.id
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
            {featuredTours.map((tour) => (
              <div
                key={tour.id}
                className="rounded-3xl bg-white overflow-hidden shadow-sm hover:shadow-2xl hover-elevate transition-all duration-300 flex flex-col group border border-sky-100 hover:border-sky-400 cursor-pointer"
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
                      className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all border flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 ${savedTours[tour.id]
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
          5B. COMMUNITY HIGHLIGHTS & LIVE TRAVEL PULSE
          - Connected to real backend MySQL post repository
          - Shows top community travel stories with likes, comments, author badges
          - Guest vs Member actions (Like/Bookmark/Create prompt login if guest)
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="w-full py-20 bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#edf2f7] border-b border-slate-200">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>

              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
                Nhịp Sống Du Lịch & Khoảnh Khắc Thực Tế
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-1 font-normal tracking-[0.015em]">
                Khám phá những trải nghiệm check-in, ẩm thực và kinh nghiệm đắt giá được chia sẻ trực tiếp từ cộng đồng.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!isLoggedIn) {
                    requireAuth('đăng bài viết chia sẻ chuyến đi');
                  } else {
                    navigate('/community');
                  }
                }}
                className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Chia sẻ chuyến đi của bạn</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/community')}
                className="px-5 py-2.5 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-300 text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer hover:scale-105"
              >
                <span>Xem tất cả ({homeStats.totalPosts}+ bài viết)</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {communityPosts.length > 0 ? (
              communityPosts.slice(0, 4).map((post) => (
                <div
                  key={post.id}
                  className="rounded-3xl bg-white overflow-hidden shadow-sm hover:shadow-xl hover-elevate transition-all duration-300 flex flex-col group border border-slate-200/90 hover:border-blue-400"
                >
                  {/* Photo */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={post.image || 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80'}
                      alt={post.title}
                    />
                    {post.locationTag && (
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span className="truncate max-w-[120px]">{post.locationTag}</span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <div>
                      {/* Author */}
                      <div className="flex items-center gap-2.5 mb-3">
                        <img
                          src={post.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                          alt={post.author?.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-blue-400"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {post.author?.name || 'Thành viên Wayfare'}
                          </p>
                          <p className="text-[11px] text-slate-400">{post.timeAgo || 'Gần đây'}</p>
                        </div>
                      </div>

                      <h3
                        onClick={() => navigate('/community')}
                        className="font-bold text-sm sm:text-base text-slate-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        {post.title}
                      </h3>
                      <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">
                        {post.content}
                      </p>
                    </div>

                    {/* Footer Interactions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <button
                        type="button"
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center gap-1.5 transition-colors cursor-pointer ${likedPosts[post.id] || post.isLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-600'
                          }`}
                      >
                        <Heart className={`w-4 h-4 ${likedPosts[post.id] || post.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>{(post.likes || 0) + (likedPosts[post.id] ? 1 : 0)}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate('/community')}
                        className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.commentsCount || 0} phản hồi</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBookmarkPost(post.id)}
                        className={`transition-colors cursor-pointer ${bookmarkedPosts[post.id] ? 'text-amber-500' : 'hover:text-amber-500'
                          }`}
                        title={bookmarkedPosts[post.id] ? 'Đã lưu' : 'Lưu bài viết'}
                      >
                        <Bookmark className={`w-4 h-4 ${bookmarkedPosts[post.id] ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Fallback curated community posts if database empty
              [
                {
                  id: 101,
                  title: 'Bí kíp săn mây Tà Xùa 2N1Đ chi phí dưới 1.5 triệu',
                  content: 'Kinh nghiệm vượt đèo trong sương sớm, chọn homestay view thung lũng đẹp nhất và những lưu ý an toàn.',
                  location: 'Tà Xùa, Sơn La',
                  author: 'Hoàng Nam',
                  avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
                  likes: 245,
                  comments: 38,
                  image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80'
                },
                {
                  id: 102,
                  title: 'Food tour Hải Phòng 1 ngày ăn sập 10 món trứ danh',
                  content: 'Bánh đa cua bể Bà Cụ, dừa dầm Lạch Tray, pate Cột Đèn thơm nức mũi chuẩn vị người bản địa.',
                  location: 'Hải Phòng',
                  author: 'Linh Hoàng',
                  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
                  likes: 312,
                  comments: 54,
                  image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80'
                },
                {
                  id: 103,
                  title: 'Trải nghiệm lặn san hô đảo Hòn Mây Rút Phú Quốc',
                  content: 'Nước biển trong vắt nhìn tận đáy, san hô ngũ sắc bạt ngàn và bữa tiệc hải sản tươi sống trên bè.',
                  location: 'Phú Quốc',
                  author: 'Quang & Thảo',
                  avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
                  likes: 189,
                  comments: 26,
                  image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=800&q=80'
                },
                {
                  id: 104,
                  title: 'Hành trình xuyên Việt 15 ngày một mình bằng xe máy',
                  content: 'Từ Hà Nội đến Mũi Cà Mau, ngắm nhìn vẻ đẹp non sông hùng vĩ và sự hiếu khách ấm áp của con người Việt Nam.',
                  location: 'Xuyên Việt',
                  author: 'Trần Bách',
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
                  likes: 420,
                  comments: 72,
                  image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
                }
              ].map((post) => (
                <div
                  key={post.id}
                  className="rounded-3xl bg-white overflow-hidden shadow-sm hover:shadow-xl hover-elevate transition-all duration-300 flex flex-col group border border-slate-200/90 hover:border-blue-400"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={post.image}
                      alt={post.title}
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span>{post.location}</span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-center gap-2.5 mb-3">
                        <img
                          src={post.avatar}
                          alt={post.author}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-blue-400"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{post.author}</p>
                          <p className="text-[11px] text-slate-400">1 ngày trước</p>
                        </div>
                      </div>

                      <h3
                        onClick={() => navigate('/community')}
                        className="font-bold text-sm sm:text-base text-slate-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        {post.title}
                      </h3>
                      <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">
                        {post.content}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <button
                        type="button"
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center gap-1.5 transition-colors cursor-pointer ${likedPosts[post.id] ? 'text-rose-600 font-bold' : 'hover:text-rose-600'
                          }`}
                      >
                        <Heart className={`w-4 h-4 ${likedPosts[post.id] ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>{post.likes + (likedPosts[post.id] ? 1 : 0)}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate('/community')}
                        className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comments}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBookmarkPost(post.id)}
                        className={`transition-colors cursor-pointer ${bookmarkedPosts[post.id] ? 'text-amber-500' : 'hover:text-amber-500'
                          }`}
                      >
                        <Bookmark className={`w-4 h-4 ${bookmarkedPosts[post.id] ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          6. INTERACTIVE MAP & HIDDEN GEMS RADAR
          - Immersive midnight obsidian section canvas
          - High-tech glowing satellite radar & destination preview
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="w-full py-20 bg-gradient-to-b from-[#0a111a] via-[#0f1926] to-[#070d14] text-white border-b border-slate-800">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="rounded-3xl bg-slate-900/90 backdrop-blur-xl text-white p-7 sm:p-12 shadow-2xl border border-slate-700/80">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Text & List Details (5 cols) */}
              <div className="lg:col-span-5 flex flex-col">


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
                      className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all text-left cursor-pointer border hover:scale-[1.02] active:scale-[0.98] ${selectedGemId === gem.id
                        ? 'bg-blue-600/35 border-blue-400 shadow-md ring-1 ring-blue-400/30'
                        : 'bg-white/10 hover:bg-white/15 border-white/15'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-3 h-3 rounded-full ${selectedGemId === gem.id ? 'bg-sky-400 animate-ping' : 'bg-sky-400'
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
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase transition-colors ${selectedGemId === gem.id
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
                <div className="relative w-full h-[460px] rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-700">
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
          7. SOCIAL PROOF & TESTIMONIALS
          - Crisp warm slate canvas with color-accented review cards
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="w-full py-20 bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#eef2f6] border-b border-slate-200/90">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2.5">

            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Câu Chuyện Từ Những Người Đã Đi
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-normal tracking-[0.015em]">
              Hàng ngàn chuyến đi đáng nhớ đã được hoàn thành trọn vẹn nhờ sự đồng hành của AI
              Wayfare.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Review 1 */}
            <div className="p-7 rounded-3xl bg-white shadow-sm hover:shadow-xl hover-elevate transition-all flex flex-col justify-between border-t-4 border-t-blue-600 border border-slate-200/90 cursor-pointer">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-800 italic text-sm leading-relaxed mb-6 font-medium tracking-[0.015em]">
                  “Lần đầu đi du lịch cùng đại gia đình 8 người mà mình không hề bị stress. Wayfare
                  phân bổ lộ trình có thời gian nghỉ cho bố mẹ và chọn các quán ăn thanh đạm rất
                  chuẩn vị.”
                </p>
              </div>
              <div className="flex items-center gap-3.5 pt-4 border-t border-slate-100">
                <img
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500"
                  alt="Minh Trang"
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
                />
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900">Minh Trang</h4>
                  <p className="text-xs text-slate-500 font-medium">Chuyến đi Đà Nẵng gia đình</p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="p-7 rounded-3xl bg-white shadow-sm hover:shadow-xl hover-elevate transition-all flex flex-col justify-between border-t-4 border-t-sky-600 border border-slate-200/90 cursor-pointer">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-800 italic text-sm leading-relaxed mb-6 font-medium tracking-[0.015em]">
                  “Tính năng cảnh báo mưa bất chợt và tự động đổi quán cà phê ngắm cảnh lúc mình ở Sa
                  Pa đã cứu cánh cả chuyến đi! Chi phí dự tính sát nút chỉ lệch có 150k.”
                </p>
              </div>
              <div className="flex items-center gap-3.5 pt-4 border-t border-slate-100">
                <img
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-sky-500"
                  alt="Hoàng Nam"
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80"
                />
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900">Hoàng Nam</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Solo Traveler & Nhiếp ảnh gia
                  </p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="p-7 rounded-3xl bg-white shadow-sm hover:shadow-xl hover-elevate transition-all flex flex-col justify-between border-t-4 border-t-amber-500 border border-slate-200/90 cursor-pointer">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-800 italic text-sm leading-relaxed mb-6 font-medium tracking-[0.015em]">
                  “Bọn mình đã có một kỳ trăng mật trong mơ tại Phú Quốc. Những quán bar hoàng hôn do AI
                  gợi ý không hề xô bồ như các tour đại trà, cực kỳ lãng mạn và tinh tế!”
                </p>
              </div>
              <div className="flex items-center gap-3.5 pt-4 border-t border-slate-100">
                <img
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-500"
                  alt="Quang & Thảo"
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80"
                />
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900">Quang & Thảo</h4>
                  <p className="text-xs text-slate-500 font-medium">Honeymoon Phú Quốc 4N3Đ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          8. GRAND FINALE CTA BANNER
          - Framed on a soft sapphire ambient pedestal
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="w-full py-16 bg-gradient-to-b from-[#f0f9ff] to-[#f8fafc]">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 lg:p-16 bg-gradient-to-r from-[#031726] via-[#082845] to-[#0c385f] text-white shadow-2xl border border-sky-900/40">
            {/* Subtle Ambient Light Orbs with Pulse Animations */}
            <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none animate-pulse-slow" />
            <div className="absolute top-0 right-1/3 w-64 h-64 rounded-full bg-sky-400/20 blur-2xl pointer-events-none animate-pulse-slow [animation-delay:3s]" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Heading, Subtitle & Actions (7 cols) */}
              <div className="lg:col-span-7 flex flex-col items-start space-y-6">
                <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  Sẵn Sàng Cho Chuyến Phiêu Lưu Kế Tiếp?
                </h2>

                <p className="text-sky-100 text-sm sm:text-base leading-relaxed font-normal tracking-[0.015em] max-w-xl">
                  Hãy để AI lo mọi khâu chuẩn bị, nghiên cứu và tối ưu chi phí. Bạn chỉ cần tận hưởng
                  từng khoảnh khắc trọn vẹn bên người thân yêu.
                </p>

                <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto pt-1">
                  <a
                    href="#ai-dock"
                    className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-700 hover:to-blue-700 text-white font-extrabold text-sm sm:text-base shadow-[0_12px_30px_rgba(2,132,199,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer shimmer-effect"
                  >
                    <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow" />
                    <span>Lập Lịch Trình Miễn Phí Ngay</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => navigate('/community')}
                    className="w-full sm:w-auto px-7 py-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white font-bold text-sm sm:text-base transition-all border border-white/20 hover:border-white/40 shadow-sm cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Users className="w-5 h-5 text-sky-300" />
                    <span>Khám Phá Cộng Đồng</span>
                  </button>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs sm:text-sm text-sky-100">
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Không cần thẻ tín dụng • Trải nghiệm ngay 100% miễn phí</span>
                  </div>
                  <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-sky-400/50" />
                  <div className="flex items-center gap-1.5 text-sky-200">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-white">4.9/5</span>
                    <span>từ 50.000+ du khách</span>
                  </div>
                </div>
              </div>

              {/* Right Column: High-tech Glassmorphism Trip Preview Card (5 cols - fills empty space) */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div className="w-full max-w-md rounded-3xl bg-slate-900/80 backdrop-blur-2xl p-6 border border-sky-400/30 shadow-2xl space-y-4 hover:border-sky-400/60 transition-all hover:scale-[1.02]">
                  {/* Card Header Preview */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                        <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm sm:text-base text-white">Lộ Trình AI Tối Ưu</h4>
                        <p className="text-xs text-sky-200">Đà Lạt • Sương Mù & Thung Lũng</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                      Sẵn sàng
                    </span>
                  </div>

                  {/* 3 Live Feature Chips */}
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-slate-200">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                        <span>Tự động phân luồng thứ tự ghé thăm</span>
                      </span>
                      <span className="font-bold text-sky-300">Tốc độ 3.2s</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-slate-200">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Dự toán chi phí & cảnh báo phát sinh</span>
                      </span>
                      <span className="font-bold text-emerald-300">Chuẩn 98%</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-slate-200">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span>Phương án B khi thời tiết xấu</span>
                      </span>
                      <span className="font-bold text-amber-300">Tự động 24/7</span>
                    </div>
                  </div>

                  {/* Footer Stat Summary within Preview */}
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-300">Tiết kiệm trung bình</span>
                    <span className="font-black text-sm text-sky-300 bg-sky-500/10 px-3 py-1 rounded-lg border border-sky-500/20">
                      ~850.000đ / chuyến
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

