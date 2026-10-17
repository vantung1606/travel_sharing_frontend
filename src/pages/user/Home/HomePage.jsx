import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../components/common/Toast';
import { homeApi, itineraryApi, postApi } from '../../../services/api';

const DOCK_BUDGET_OPTIONS = [
  { val: 'budget', title: 'Tiết kiệm', sub: '2.0 - 3.5 triệu / người', icon: '💳', badge: 'Tiết kiệm' },
  { val: 'standard', title: 'Tiêu chuẩn', sub: '3.5 - 6.0 triệu / người', icon: '⭐', badge: 'Phổ biến' },
  { val: 'luxury', title: 'Nghỉ dưỡng VIP', sub: '7.0 triệu+ / 5 sao', icon: '💎', badge: 'Cao cấp' }
];

const DOCK_STYLE_OPTIONS = [
  { val: 'chill', title: 'Nghỉ dưỡng & Ẩm thực', sub: 'Biển xanh, cafe chill & ẩm thực địa phương', icon: '🏖️', badge: 'Thư giãn' },
  { val: 'photo', title: 'Sống ảo & Văn hóa', sub: 'Di sản, phố cổ, góc chụp triệu view', icon: '📸', badge: 'Hot' },
  { val: 'nature', title: 'Thiên nhiên & Trekking', sub: 'Săn mây, cắm trại, leo núi hoang sơ', icon: '⛰️', badge: 'Khám phá' },
  { val: 'family', title: 'Gia đình & Tiện nghi', sub: 'Lịch trình nhẹ nhàng, tiện nghi trẻ nhỏ', icon: '👨‍👩‍👧', badge: 'An tâm' }
];

const DOCK_DURATION_OPTIONS = [
  { val: '2d1n', title: '2 Ngày 1 Đêm', sub: 'Cuối tuần chớp nhoáng, nạp năng lượng', icon: '⚡' },
  { val: '3d2n', title: '3 Ngày 2 Đêm', sub: 'Lý tưởng nhất cho hầu hết chuyến đi', icon: '🌟', badge: 'Phổ biến' },
  { val: '4d3n', title: '4 Ngày 3 Đêm', sub: 'Trọn vẹn, thảnh thơi khám phá sâu', icon: '🌿' },
  { val: '5d4n', title: '5 Ngày 4 Đêm', sub: 'Hành trình xuyên suốt mọi ngóc ngách', icon: '🗺️', badge: 'Chuyên sâu' }
];
import { MapPin, Calendar, DollarSign, Star, CheckCircle2, ArrowRight, Compass, Users, Search, ShieldCheck, Zap, Copy, Heart, RefreshCw, Check, ChevronDown, Map, ArrowDown, Wallet, Navigation as NavigationIcon, SlidersHorizontal, Bookmark, MessageSquare } from 'lucide-react';

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
  const [activeDropdown, setActiveDropdown] = useState(null); // 'budget' | 'style' | 'duration' | null
  const dockRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dockRef.current && !dockRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedBudget = DOCK_BUDGET_OPTIONS.find(o => o.val === dockBudget) || DOCK_BUDGET_OPTIONS[1];
  const selectedStyle = DOCK_STYLE_OPTIONS.find(o => o.val === dockStyle) || DOCK_STYLE_OPTIONS[0];
  const selectedDuration = DOCK_DURATION_OPTIONS.find(o => o.val === dockDuration) || DOCK_DURATION_OPTIONS[1];

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
          desc: 'Thời điểm biển mây bồng bềnh đẹp nhất. Hệ thống định vị góc chụp vắng người và tuyến đường an toàn.',
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
          cost: 'Ưu đãi thành viên',
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
      badge: 'Điểm đến độc đáo',
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
      tag: 'Được yêu thích ⭐',
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

  // Dynamic Backend Data States (SWR Instant Hydration)
  const [homeStats, setHomeStats] = useState(() => {
    try {
      const cached = sessionStorage.getItem('wayfare_home_stats_cache');
      return cached ? JSON.parse(cached) : {
        totalItineraries: 128,
        totalPlaces: 84,
        totalPosts: 320,
        totalUsers: 1450,
        totalLikes: 5240,
        totalComments: 1890
      };
    } catch {
      return { totalItineraries: 128, totalPlaces: 84, totalPosts: 320, totalUsers: 1450, totalLikes: 5240, totalComments: 1890 };
    }
  });
  const [featuredTours, setFeaturedTours] = useState(curatedTours);
  const [communityPosts, setCommunityPosts] = useState(() => {
    try {
      const cached = sessionStorage.getItem('wayfare_home_community_cache') || sessionStorage.getItem('wayfare_community_posts_cache');
      return cached ? JSON.parse(cached).slice(0, 4) : [];
    } catch {
      return [];
    }
  });
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
      if (data) {
        setHomeStats(data);
        try {
          sessionStorage.setItem('wayfare_home_stats_cache', JSON.stringify(data));
        } catch {}
      }
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
          try {
            sessionStorage.setItem('wayfare_home_community_cache', JSON.stringify(data));
          } catch {}
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
      toast.success(`Đã khởi tạo lộ trình thành công cho ${dockDest}! 🚀`);
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
    toast.info('Wayfare đã phân tích yêu cầu và tối ưu lại lộ trình 3 ngày! 💡');
  };

  // Copy Tour Action (Đồng bộ vào CSDL MySQL)
  const handleCopyTour = async (tour) => {
    if (!isLoggedIn) {
      requireAuth('sao chép lịch trình này vào bộ sưu tập cá nhân của bạn');
      return;
    }

    if (
      (tour.creatorId && currentUser?.id && tour.creatorId === currentUser.id) ||
      (tour.creatorEmail && currentUser?.email && tour.creatorEmail === currentUser.email) ||
      (tour.userId && currentUser?.id && tour.userId === currentUser.id)
    ) {
      toast.error('Bạn là tác giả của lịch trình này nên không thể tự sao chép!');
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn sao chép chuyến đi "${tour.title}" vào kho của bạn không?`)) {
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-blue-600 selection:text-white pb-20 w-full max-w-full overflow-x-clip -mt-16">
      {/* ──────────────────────────────────────────────────────────────────────────
          1. HERO SECTION (CINEMATIC DEEP ATMOSPHERE - NO WASHED-OUT BOTTOM)
          - Deep contrast dark green & slate canvas, no hazy bottom mist
          - Single-row balanced trust metrics (No awkward wrapping)
          - Royal Blue CTA buttons with energetic glow
          - Quick inspiration tags in unified row
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden pt-28 pb-24 lg:pt-32 lg:pb-32 bg-[#031726] text-white">
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

          {/* Seamless Bottom Fade Transition to Light Canvas (Loang mờ đáy tự nhiên xuống nền trang) */}
          <div className="absolute bottom-0 left-0 right-0 h-28 sm:h-40 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/50 to-transparent pointer-events-none" />
        </div>

          {/* Content Container Aligned with Navbar Width */}
        <div className="relative z-10 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Main Hero Header Stack */}
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-4 sm:space-y-6">
            {/* Expansive Grand Headline with Gradient Flow - Scaled for Mobile */}
            <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.2] text-white drop-shadow-md">
              Kiến Tạo Chuyến Đi Mơ Ước <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-300 bg-clip-text text-transparent animate-gradient-flow">
                Cùng Wayfare
              </span>{' '}
            </h1>

            {/* Subtitle with High Legibility & Scaled Mobile Typography */}
            <p className="text-slate-100 text-xs sm:text-sm md:text-base max-w-2xl leading-relaxed font-normal tracking-[0.015em] drop-shadow-sm px-2">
              Từ ý tưởng mơ hồ đến lịch trình chi tiết từng phút, dự toán ngân sách chính xác theo
              thời gian thực và cá nhân hóa theo gu riêng của bạn chỉ với một chạm.
            </p>

            {/* Action Buttons: Responsive full-width on mobile, compact and clean travel icons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4 w-full sm:w-auto">
              <a
                href="#plan-dock"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-extrabold text-xs sm:text-sm md:text-base shadow-[0_10px_25px_rgba(2,132,199,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer ring-2 ring-blue-300/40 tracking-[0.015em]"
              >
                <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-sky-200" />
                <span>Lên Kế Hoạch Chuyến Đi</span>
                <span className="px-2 py-0.5 rounded-full bg-black/25 text-[10px] sm:text-xs font-black uppercase tracking-wider">
                  Miễn phí
                </span>
              </a>

              <a
                href="#kham-pha"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white font-bold text-xs sm:text-sm md:text-base transition-all border border-white/25 hover:border-white/50 shadow-md cursor-pointer tracking-[0.015em] hover:scale-105 active:scale-95 group"
              >
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-sky-300" />
                <span>Khám Phá Điểm Đến</span>
                <ArrowDown className="w-3.5 h-3.5 text-sky-300 group-hover:translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. SMART TRAVEL PLANNER DOCK (CRISP WHITE ELEVATED CARD - NO WASHOUT)
          - Compact responsive paddings
          - High-legibility mobile layout without clipped pills or oversized boxes
          - Clear, high-contrast travel inputs
      ────────────────────────────────────────────────────────────────────────── */}
      <section
        className="relative z-20 w-full max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 -mt-10 sm:-mt-12 lg:-mt-16 mb-12 sm:mb-16 lg:mb-20"
        id="plan-dock"
      >
        <div className="p-3.5 sm:p-7 lg:p-8 rounded-2xl sm:rounded-3xl bg-white/98 backdrop-blur-2xl shadow-[0_15px_45px_-15px_rgba(2,132,199,0.18)] border border-slate-200/90 transition-all">
          {/* Planner Modes Tabs & Estimate Pill */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 mb-3.5 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-100">
            {/* 3 Tabs: 3-column grid on mobile so no scrolling or truncation occurs */}
            <div className="grid grid-cols-3 sm:flex sm:items-center gap-1 p-1 rounded-xl sm:rounded-full bg-slate-100/90 border border-slate-200/70 shadow-2xs w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveDockTab('ai')}
                className={`w-full sm:w-auto px-2.5 sm:px-5 py-2 sm:py-2 rounded-lg sm:rounded-full text-[11px] sm:text-sm font-bold shadow-xs flex items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer whitespace-nowrap ${activeDockTab === 'ai'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-700 hover:text-sky-700 hover:bg-white'
                  }`}
              >
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-200 shrink-0" />
                <span>Lên lịch trình</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveDockTab('explore');
                  navigate('/explore');
                }}
                className={`w-full sm:w-auto px-2.5 sm:px-5 py-2 sm:py-2 rounded-lg sm:rounded-full text-[11px] sm:text-sm font-bold flex items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer whitespace-nowrap ${activeDockTab === 'explore'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-700 hover:text-sky-700 hover:bg-white'
                  }`}
              >
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>Điểm đến</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveDockTab('community');
                  navigate('/community');
                }}
                className={`w-full sm:w-auto px-2.5 sm:px-5 py-2 sm:py-2 rounded-lg sm:rounded-full text-[11px] sm:text-sm font-bold flex items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer whitespace-nowrap ${activeDockTab === 'community'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-700 hover:text-sky-700 hover:bg-white'
                  }`}
              >
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>Cộng đồng</span>
              </button>
            </div>

            {/* Dynamic Estimate Pill: Full width on mobile, balanced text */}
            <div className="flex items-center justify-between sm:justify-end px-3 py-1.5 rounded-lg sm:rounded-full bg-sky-50 text-sky-800 border border-sky-200/80 shadow-2xs text-[11px] sm:text-sm font-semibold">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 shrink-0" />
                <span>Dự toán: ~{dockEstimate.budgetText}</span>
              </span>
              <span className="flex items-center gap-1.5 ml-2">
                <span className="w-1 h-1 rounded-full bg-sky-400 shrink-0" />
                <span className="text-sky-700 font-bold shrink-0">{dockEstimate.savings}</span>
              </span>
            </div>
          </div>

          {/* Omni-Search 4 Fields: High Contrast Modern Cards with Custom Premium Dropdowns */}
          <form
            ref={dockRef}
            onSubmit={handleDockGenerate}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-3 sm:mb-6"
          >
            {/* Field 1: Destination */}
            <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 hover:bg-slate-100/90 transition-all flex flex-col justify-center border border-slate-200/80 hover:border-blue-400 focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100/60 shadow-xs">
              <label className="flex items-center gap-1.5 text-slate-500 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider mb-0.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Điểm đến mong muốn</span>
              </label>
              <input
                type="text"
                value={dockDest}
                onChange={(e) => setDockDest(e.target.value)}
                placeholder="Đà Nẵng, Sa Pa, Phú Quốc..."
                className="w-full bg-transparent text-xs sm:text-sm md:text-[15px] font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none truncate tracking-[0.015em]"
              />
            </div>

            {/* Field 2: Budget (Custom Dropdown) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'budget' ? null : 'budget')}
                className={`w-full text-left p-2.5 sm:p-4 rounded-xl sm:rounded-2xl transition-all flex flex-col justify-center border shadow-xs cursor-pointer ${
                  activeDropdown === 'budget'
                    ? 'bg-white border-blue-600 ring-2 sm:ring-4 ring-blue-100/70 shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100/90 border-slate-200/80 hover:border-blue-400'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-0.5 sm:mb-1">
                  <span className="flex items-center gap-1.5 text-slate-500 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">
                    <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                    <span>Ngân sách dự kiến</span>
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 transition-transform duration-200 ${
                    activeDropdown === 'budget' ? 'rotate-180 text-blue-600' : ''
                  }`} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm md:text-[15px] font-bold text-slate-900 truncate">
                    {selectedBudget.title} <span className="text-[11px] sm:text-xs font-normal text-slate-500 hidden sm:inline">({selectedBudget.sub.split('/')[0]})</span>
                  </span>
                </div>
              </button>

              <AnimatePresence>
                {activeDropdown === 'budget' && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute top-full left-0 right-0 mt-2 z-50 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/90 p-2 space-y-1 min-w-[260px]"
                  >
                    {DOCK_BUDGET_OPTIONS.map((opt) => {
                      const isSelected = dockBudget === opt.val;
                      return (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => {
                            setDockBudget(opt.val);
                            setActiveDropdown(null);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer group ${
                            isSelected
                              ? 'bg-sky-50 text-sky-900 font-bold border border-sky-200/60 shadow-xs'
                              : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-base shrink-0 p-1.5 rounded-lg bg-slate-100 group-hover:scale-110 transition-transform">
                              {opt.icon}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs sm:text-sm font-bold truncate">{opt.title}</span>
                                {opt.badge && (
                                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-800">
                                    {opt.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 truncate font-normal mt-0.5">{opt.sub}</p>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-sky-600 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Field 3: Travel Style (Custom Dropdown) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'style' ? null : 'style')}
                className={`w-full text-left p-2.5 sm:p-4 rounded-xl sm:rounded-2xl transition-all flex flex-col justify-center border shadow-xs cursor-pointer ${
                  activeDropdown === 'style'
                    ? 'bg-white border-blue-600 ring-2 sm:ring-4 ring-blue-100/70 shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100/90 border-slate-200/80 hover:border-blue-400'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-0.5 sm:mb-1">
                  <span className="flex items-center gap-1.5 text-slate-500 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">
                    <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                    <span>Gu trải nghiệm</span>
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 transition-transform duration-200 ${
                    activeDropdown === 'style' ? 'rotate-180 text-blue-600' : ''
                  }`} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm md:text-[15px] font-bold text-slate-900 truncate">
                    {selectedStyle.title}
                  </span>
                </div>
              </button>

              <AnimatePresence>
                {activeDropdown === 'style' && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute top-full left-0 right-0 mt-2 z-50 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/90 p-2 space-y-1 min-w-[270px]"
                  >
                    {DOCK_STYLE_OPTIONS.map((opt) => {
                      const isSelected = dockStyle === opt.val;
                      return (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => {
                            setDockStyle(opt.val);
                            setActiveDropdown(null);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer group ${
                            isSelected
                              ? 'bg-sky-50 text-sky-900 font-bold border border-sky-200/60 shadow-xs'
                              : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-base shrink-0 p-1.5 rounded-lg bg-slate-100 group-hover:scale-110 transition-transform">
                              {opt.icon}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs sm:text-sm font-bold truncate">{opt.title}</span>
                                {opt.badge && (
                                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-sky-100 text-sky-800">
                                    {opt.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 truncate font-normal mt-0.5">{opt.sub}</p>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-sky-600 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Field 4: Duration (Custom Dropdown) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'duration' ? null : 'duration')}
                className={`w-full text-left p-2.5 sm:p-4 rounded-xl sm:rounded-2xl transition-all flex flex-col justify-center border shadow-xs cursor-pointer ${
                  activeDropdown === 'duration'
                    ? 'bg-white border-blue-600 ring-2 sm:ring-4 ring-blue-100/70 shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100/90 border-slate-200/80 hover:border-blue-400'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-0.5 sm:mb-1">
                  <span className="flex items-center gap-1.5 text-slate-500 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                    <span>Thời lượng chuyến đi</span>
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 transition-transform duration-200 ${
                    activeDropdown === 'duration' ? 'rotate-180 text-blue-600' : ''
                  }`} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm md:text-[15px] font-bold text-slate-900 truncate">
                    {selectedDuration.title} <span className="text-[11px] sm:text-xs font-normal text-slate-500 hidden sm:inline">({selectedDuration.sub.split(',')[0]})</span>
                  </span>
                </div>
              </button>

              <AnimatePresence>
                {activeDropdown === 'duration' && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute top-full left-0 right-0 mt-2 z-50 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/90 p-2 space-y-1 min-w-[280px]"
                  >
                    {DOCK_DURATION_OPTIONS.map((opt) => {
                      const isSelected = dockDuration === opt.val;
                      return (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => {
                            setDockDuration(opt.val);
                            setActiveDropdown(null);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer group ${
                            isSelected
                              ? 'bg-sky-50 text-sky-900 font-bold border border-sky-200/60 shadow-xs'
                              : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-base shrink-0 p-1.5 rounded-lg bg-slate-100 group-hover:scale-110 transition-transform">
                              {opt.icon}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs sm:text-sm font-bold truncate">{opt.title}</span>
                                {opt.badge && (
                                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-800">
                                    {opt.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 truncate font-normal mt-0.5">{opt.sub}</p>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-sky-600 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>

          {/* Quick Destination Tags & Primary Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs">
              <span className="text-slate-500 font-semibold text-[11px] sm:text-xs">Gợi ý nhanh:</span>
              {trendingDestinations.map((chip) => (
                <button
                  key={chip.val}
                  type="button"
                  onClick={() => setDockDest(chip.val)}
                  className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all border cursor-pointer shadow-2xs hover:scale-105 active:scale-95 ${dockDest === chip.val
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-slate-100/90 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border-slate-200'
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
              className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 tracking-tight whitespace-nowrap shrink-0"
            >
              {isDockGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Đang khởi tạo lịch trình...</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4 text-sky-200" />
                  <span>Tạo Lịch Trình Chuyến Đi</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-extrabold uppercase">
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
          - Gradient icon bubbles & responsive typography
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="w-full py-10 sm:py-16 lg:py-20 bg-gradient-to-b from-[#f2f7f4] via-[#f8faf9] to-[#edf5f0] border-t border-b border-sky-900/10">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Section Header */}
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-2 sm:space-y-3">
            <h2 className="font-display text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tại Sao Hơn {homeStats.totalUsers.toLocaleString()}+ Du Khách Chọn Wayfare?
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed font-normal tracking-[0.015em]">
              Không còn nỗi lo lập bảng tính excel phức tạp, lúng túng khi thời tiết xấu hay chi tiêu
              thâm hụt ngoài dự kiến.
            </p>
          </div>

          {/* 4 Cards Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Pillar 1 */}
            <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white hover:bg-sky-50/30 transition-all duration-300 shadow-sm hover:shadow-xl hover-elevate group flex flex-col justify-between border border-slate-200/90 hover:border-blue-400 cursor-pointer">
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="px-2.5 sm:px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] sm:text-xs border border-blue-200/60 group-hover:scale-105 transition-transform">
                    Tốc độ 3.2s
                  </span>
                </div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-1.5 sm:mb-2 group-hover:text-blue-700 transition-colors">Lập Lịch Trình Siêu Tốc</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal tracking-[0.015em]">
                  Xử lý dữ liệu phân luồng giao thông, giờ mở cửa và thứ tự ghé thăm hợp lý nhất
                  trong 3 giây, tránh hoàn toàn đi lòng vòng.
                </p>
              </div>
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 flex items-center gap-1.5 text-blue-600 font-bold text-xs sm:text-sm">
                <span>Tự động tối ưu 100%</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white hover:bg-sky-50/30 transition-all duration-300 shadow-sm hover:shadow-xl hover-elevate group flex flex-col justify-between border border-slate-200/90 hover:border-sky-400 cursor-pointer">
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/25 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="px-2.5 sm:px-3 py-1 rounded-full bg-sky-50 text-sky-700 font-bold text-[11px] sm:text-xs border border-sky-200/60 group-hover:scale-105 transition-transform">
                    Tiết kiệm 22%
                  </span>
                </div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-1.5 sm:mb-2 group-hover:text-sky-700 transition-colors">Tối Ưu Ngân Sách Thực Tế</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal tracking-[0.015em]">
                  Dự toán chi tiết từng khoản chi: vé máy bay, phòng ốc, ăn uống địa phương và dự
                  phòng phát sinh chính xác đến 95%.
                </p>
              </div>
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 flex items-center gap-1.5 text-sky-700 font-bold text-xs sm:text-sm">
                <span>Cắt giảm chi phí thừa</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white hover:bg-sky-50/30 transition-all duration-300 shadow-sm hover:shadow-xl hover-elevate group flex flex-col justify-between border border-slate-200/90 hover:border-blue-400 cursor-pointer">
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-600/25 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <NavigationIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="px-2.5 sm:px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] sm:text-xs border border-blue-200/60 group-hover:scale-105 transition-transform">
                    Lộ trình chuẩn xác
                  </span>
                </div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-1.5 sm:mb-2 group-hover:text-blue-700 transition-colors">Lộ Trình Tinh Gọn On-The-Go</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal tracking-[0.015em]">
                  Trời mưa bất ngờ? Điểm tham quan đóng cửa? Wayfare chủ động gợi ý phương án dự phòng
                  ngay tức thì trong bán kính gần.
                </p>
              </div>
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 flex items-center gap-1.5 text-blue-600 font-bold text-xs sm:text-sm">
                <span>Linh hoạt theo điểm đến</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white hover:bg-sky-50/30 transition-all duration-300 shadow-sm hover:shadow-xl hover-elevate group flex flex-col justify-between border border-slate-200/90 hover:border-amber-400 cursor-pointer">
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-md shadow-amber-500/25 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="px-2.5 sm:px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-bold text-[11px] sm:text-xs border border-amber-200/60 group-hover:scale-105 transition-transform">
                    {homeStats.totalPosts.toLocaleString()}+ Bài Viết
                  </span>
                </div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-1.5 sm:mb-2 group-hover:text-amber-700 transition-colors">Cộng Đồng Trải Nghiệm Thật</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal tracking-[0.015em]">
                  Khám phá và sao chép lịch trình thực chiến từ hàng ngàn travel blogger, hướng dẫn
                  viên bản địa đã được kiểm chứng.
                </p>
              </div>
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 flex items-center gap-1.5 text-amber-700 font-bold text-xs sm:text-sm">
                <span>Sao chép 1-click</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          4. LIVE INTERACTIVE TRAVEL STUDIO
          - Dedicated soft blue-slate lab environment
          - Elevated grand white workspace card
          - Left: Natural Prompt Lab with chips & Royal Blue action
          - Right: Dynamic multi-day timeline with instant estimates
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="w-full py-10 sm:py-16 lg:py-20 bg-gradient-to-b from-[#eaf2f8] via-[#f1f6fa] to-[#e4eef6] border-b border-blue-900/10">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="rounded-2xl sm:rounded-[2.5rem] bg-white p-5 sm:p-8 lg:p-12 shadow-xl border border-blue-200/80">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
              {/* Left Column: Interactive Prompt Lab (5 cols) */}
              <div className="lg:col-span-5 flex flex-col">
                <div className="inline-flex items-center gap-2 text-blue-700 font-extrabold text-[11px] sm:text-xs uppercase tracking-wider mb-2 sm:mb-3">
                  <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Trải nghiệm thử nghiệm trực tiếp</span>
                </div>

                <h3 className="font-display text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 mb-2 sm:mb-3 tracking-tight">
                  Mô Tả Chuyến Đi Theo Cách Của Bạn
                </h3>

                <p className="text-slate-600 text-xs sm:text-sm md:text-base mb-4 sm:mb-6 leading-relaxed font-normal tracking-[0.015em]">
                  Chỉ cần nhập một câu tự nhiên nói rõ mong muốn của bạn. Wayfare sẽ bóc tách danh
                  thắng, căn chỉnh thời gian vàng và lên thực đơn chi tiết.
                </p>

                <div className="flex flex-col gap-2 mb-3 sm:mb-4">
                  <textarea
                    rows={3}
                    value={sandboxPrompt}
                    onChange={(e) => setSandboxPrompt(e.target.value)}
                    className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/70 font-medium text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-600 focus:bg-white border border-slate-300/80 resize-none shadow-xs placeholder:text-slate-400 tracking-[0.015em] transition-all"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleRunSandbox}
                      className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-200" />
                      <span>Lên kế hoạch</span>
                    </button>
                  </div>
                </div>

                {/* Quick Template Prompt Pills */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <span className="text-slate-500 font-semibold text-[11px] sm:text-xs">Thử mẫu:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSandboxPrompt(
                        'Gia đình 4 người đi Đà Nẵng 4N3Đ có người lớn tuổi, ưu tiên resort biển và ẩm thực nhẹ nhàng.'
                      );
                    }}
                    className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 text-[11px] sm:text-xs font-semibold transition-all border border-slate-200 cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
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
                    className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 text-[11px] sm:text-xs font-semibold transition-all border border-slate-200 cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                  >
                    🏍️ Phượt Hà Giang
                  </button>
                </div>
              </div>

              {/* Right Column: Real-time Multi-Day Interactive Canvas (7 cols) */}
              <div className="lg:col-span-7 rounded-2xl sm:rounded-3xl bg-slate-50/90 p-3.5 sm:p-6 lg:p-7 flex flex-col justify-between text-slate-900 shadow-sm border border-slate-200/90 hover:shadow-md transition-shadow">
                {/* Header with Title and Day Switcher - Stacked to guarantee zero horizontal overflow */}
                <div className="flex flex-col gap-2.5 pb-3 sm:pb-4 border-b border-slate-200/80">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl bg-sky-600 text-white flex items-center justify-center font-black text-xs sm:text-sm shadow-sm shrink-0">
                      <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-xs sm:text-base text-slate-900 truncate">
                        Đà Lạt • Hành Trình Lãng Mạn (3N2Đ)
                      </h4>
                      <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
                        Dự toán: 3.920.000đ • Tối ưu 98%
                      </p>
                    </div>
                  </div>

                  {/* Multi-Day Tabs - 100% width grid so all 3 days fit inside without overflow */}
                  <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-white border border-slate-200 shadow-2xs w-full">
                    {[1, 2, 3].map((dayNum) => (
                      <button
                        key={dayNum}
                        type="button"
                        onClick={() => setSandboxActiveDay(dayNum)}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${sandboxActiveDay === dayNum
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
                <div className="py-2 text-[11px] sm:text-sm font-bold text-sky-700 flex items-center gap-1.5 sm:gap-2">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 shrink-0" />
                  <span className="truncate">{sandboxMultiDayData[sandboxActiveDay].dayTitle}</span>
                </div>

                {/* Dynamic Compact Timeline Grid (Grid 1 col on mobile, compact cards) */}
                <div className="space-y-2.5 sm:space-y-3.5 my-2 sm:my-3">
                  {sandboxMultiDayData[sandboxActiveDay].items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 sm:gap-3.5 group">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-600 text-white font-extrabold flex items-center justify-center text-[11px] sm:text-xs shadow-xs group-hover:scale-110 transition-transform">
                          {item.time}
                        </div>
                        {idx < sandboxMultiDayData[sandboxActiveDay].items.length - 1 && (
                          <div className="w-0.5 h-6 sm:h-8 bg-slate-300 mt-1" />
                        )}
                      </div>
                      <div className="bg-white p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl flex-1 shadow-2xs border border-slate-200/90 hover:border-sky-300 hover:shadow-sm transition-all min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs sm:text-sm md:text-base text-slate-900 group-hover:text-sky-700 transition-colors truncate">
                            {item.title}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-black border shrink-0 ${item.tagColor}`}
                          >
                            {item.cost}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] sm:text-xs md:text-sm mt-0.5 sm:mt-1 font-normal leading-relaxed tracking-[0.015em] line-clamp-2">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Action within widget */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 sm:pt-4 border-t border-slate-200/80">
                  <span className="text-[11px] sm:text-xs text-slate-500 font-semibold text-center sm:text-left">
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
                      toast.success('Đang mở chi tiết toàn bộ lộ trình 3 ngày!');
                    }}
                    className="w-full sm:w-auto px-5 py-2 sm:py-2.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <span>Mở toàn bộ lộ trình 3 ngày</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1" />
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
      {/* ──────────────────────────────────────────────────────────────────────────
          5. CURATED TRENDING ITINERARIES SHOWCASE
          - Soft natural canvas
          - Category filter pills with Royal Blue active state
          - White photo cards with verified metrics & prices
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="w-full py-10 sm:py-16 lg:py-20 bg-gradient-to-b from-[#f0f9ff] via-[#f8fafc] to-[#e0f2fe] border-b border-sky-900/10" id="kham-pha">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Section Header with Filter Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-10">
            <div>
              <h2 className="font-display text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
                Bộ Sưu Tập Lộ Trình Nổi Bật
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm md:text-base mt-1 font-normal tracking-[0.015em]">
                Được tổng hợp từ hơn 50.000 lượt lưu và đánh giá cao từ cộng đồng người dùng thực tế.
              </p>
            </div>

            {/* All 4 tabs fit in 100% width on mobile without overflowing */}
            <div className="grid grid-cols-4 gap-1 sm:flex sm:items-center sm:gap-2 w-full sm:w-auto">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'bac', label: 'Miền Bắc' },
                { id: 'trung', label: 'Miền Trung' },
                { id: 'nam', label: 'Miền Nam' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setShowcaseRegion(tab.id)}
                  className={`w-full sm:w-auto px-1 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-full text-[11px] sm:text-sm font-bold transition-all text-center cursor-pointer ${showcaseRegion === tab.id
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'bg-white hover:bg-sky-50 text-slate-700 border border-sky-200/80 shadow-2xs'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Compact Responsive Grid Showcase (2 cols on mobile, 4 on desktop, max 4 items displayed) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {featuredTours.slice(0, 4).map((tour) => (
              <div
                key={tour.id}
                onClick={() => navigate('/explore')}
                className="rounded-xl sm:rounded-3xl bg-white overflow-hidden shadow-xs hover:shadow-xl hover-elevate transition-all duration-300 flex flex-col group border border-sky-100 hover:border-sky-400 cursor-pointer"
              >
                <div className="relative h-28 sm:h-52 w-full overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    alt={tour.title}
                    src={tour.image}
                  />
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/95 backdrop-blur-md text-[9px] sm:text-xs font-black text-sky-900 shadow-xs group-hover:scale-105 transition-transform">
                    {tour.duration}
                  </div>
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-sky-600 text-white text-[9px] sm:text-xs font-bold flex items-center gap-0.5 sm:gap-1 shadow-xs max-w-[100px] sm:max-w-none truncate">
                    <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-200 shrink-0" />
                    <span className="truncate">{tour.tag}</span>
                  </div>
                  <div className="hidden sm:block absolute bottom-3 left-3 px-2.5 sm:px-3 py-1 rounded-full bg-slate-950/75 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold">
                    {tour.category}
                  </div>
                </div>

                <div className="p-2.5 sm:p-5 flex flex-col flex-1 justify-between bg-white">
                  <div>
                    <div className="flex items-center justify-between text-slate-500 text-[10px] sm:text-xs mb-1 sm:mb-2 font-semibold">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 fill-amber-400" />
                        <strong className="text-slate-900">{tour.rating}</strong>
                        <span className="hidden sm:inline">({tour.saves} lưu)</span>
                      </span>
                      <span className="text-sky-700 font-bold truncate max-w-[70px] sm:max-w-[120px]">{tour.location}</span>
                    </div>

                    <h3 className="font-bold text-xs sm:text-base text-slate-900 mb-1 sm:mb-1.5 group-hover:text-sky-700 transition-colors line-clamp-2 sm:line-clamp-1 leading-snug">
                      {tour.title}
                    </h3>
                    <p className="hidden sm:block text-slate-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed font-normal tracking-[0.015em]">
                      {tour.desc}
                    </p>
                  </div>

                  <div className="pt-2 sm:pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-0">
                    <div>
                      <span className="text-[9px] sm:text-[11px] text-slate-400 font-medium block">
                        Dự toán/người
                      </span>
                      <span className="font-extrabold text-xs sm:text-base lg:text-lg text-sky-700">
                        {tour.price}
                      </span>
                    </div>
                    {!Boolean(
                      (tour.creatorId && currentUser?.id && String(tour.creatorId) === String(currentUser.id)) ||
                      (tour.creatorEmail && currentUser?.email && tour.creatorEmail.toLowerCase() === (currentUser.email || '').toLowerCase()) ||
                      (tour.userId && currentUser?.id && String(tour.userId) === String(currentUser.id))
                    ) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyTour(tour);
                        }}
                        className={`w-full sm:w-auto px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-full text-[10px] sm:text-xs font-bold transition-all border flex items-center justify-center gap-1 cursor-pointer hover:scale-102 active:scale-95 ${savedTours[tour.id]
                          ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                          : 'bg-sky-50 hover:bg-sky-600 hover:text-white text-sky-800 border-sky-200'
                          }`}
                      >
                        {savedTours[tour.id] ? (
                          <>
                            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span>Đã lưu</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action to Explore All Itineraries - Avoid endless scrolling on home */}
          <div className="mt-6 sm:mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => navigate('/explore')}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white hover:bg-sky-50 text-sky-700 hover:text-sky-800 font-bold text-xs sm:text-sm border border-sky-200/90 shadow-2xs hover:shadow-md transition-all active:scale-95"
            >
              <span>Khám phá thêm các lộ trình khác</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          5B. COMMUNITY HIGHLIGHTS & LIVE TRAVEL PULSE
          - Connected to real backend MySQL post repository
          - Shows top community travel stories with likes, comments, author badges
          - Guest vs Member actions (Like/Bookmark/Create prompt login if guest)
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="w-full py-10 sm:py-16 lg:py-20 bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#edf2f7] border-b border-slate-200">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-12">
            <div>
              <h2 className="font-display text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
                Nhịp Sống Du Lịch & Khoảnh Khắc Thực Tế
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm md:text-base mt-1 font-normal tracking-[0.015em]">
                Khám phá những trải nghiệm check-in, ẩm thực và kinh nghiệm đắt giá được chia sẻ trực tiếp từ cộng đồng.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!isLoggedIn) {
                    requireAuth('đăng bài viết chia sẻ chuyến đi');
                  } else {
                    navigate('/community');
                  }
                }}
                className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              >
                <Compass className="w-4 h-4 text-sky-200" />
                <span>Chia sẻ chuyến đi của bạn</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/community')}
                className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-300 text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer hover:scale-105"
              >
                <span>Xem tất cả ({homeStats.totalPosts}+ bài viết)</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {communityPosts.length > 0 ? (
              communityPosts.slice(0, 4).map((post) => (
                <div
                  key={post.id}
                  className="rounded-2xl sm:rounded-3xl bg-white overflow-hidden shadow-sm hover:shadow-xl hover-elevate transition-all duration-300 flex flex-col group border border-slate-200/90 hover:border-blue-400"
                >
                  {/* Photo */}
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={post.image || 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80'}
                      alt={post.title}
                    />
                    {post.locationTag && (
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span className="truncate max-w-[120px]">{post.locationTag}</span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
                    <div>
                      {/* Author */}
                      <div className="flex items-center gap-2.5 mb-2.5 sm:mb-3">
                        <img
                          src={post.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                          alt={post.author?.name}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-1 ring-blue-400 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {post.author?.name || 'Thành viên Wayfare'}
                          </p>
                          <p className="text-[10px] sm:text-[11px] text-slate-400">{post.timeAgo || 'Gần đây'}</p>
                        </div>
                      </div>

                      <h3
                        onClick={() => navigate('/community')}
                        className="font-bold text-xs sm:text-sm md:text-base text-slate-900 mb-1.5 line-clamp-1 group-hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        {post.title}
                      </h3>
                      <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-3 sm:mb-4">
                        {post.content}
                      </p>
                    </div>

                    {/* Footer Interactions */}
                    <div className="pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <button
                        type="button"
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center gap-1.5 transition-colors cursor-pointer ${likedPosts[post.id] || post.isLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-600'
                          }`}
                      >
                        <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${likedPosts[post.id] || post.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>{(post.likes || 0) + (likedPosts[post.id] ? 1 : 0)}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate('/community')}
                        className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>{post.commentsCount || 0} phản hồi</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBookmarkPost(post.id)}
                        className={`transition-colors cursor-pointer ${bookmarkedPosts[post.id] ? 'text-amber-500' : 'hover:text-amber-500'
                          }`}
                        title={bookmarkedPosts[post.id] ? 'Đã lưu' : 'Lưu bài viết'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${bookmarkedPosts[post.id] ? 'fill-amber-500 text-amber-500' : ''}`} />
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
                  className="rounded-2xl sm:rounded-3xl bg-white overflow-hidden shadow-sm hover:shadow-xl hover-elevate transition-all duration-300 flex flex-col group border border-slate-200/90 hover:border-blue-400"
                >
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={post.image}
                      alt={post.title}
                    />
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span>{post.location}</span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-center gap-2.5 mb-2.5 sm:mb-3">
                        <img
                          src={post.avatar}
                          alt={post.author}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-1 ring-blue-400 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{post.author}</p>
                          <p className="text-[10px] sm:text-[11px] text-slate-400">1 ngày trước</p>
                        </div>
                      </div>

                      <h3
                        onClick={() => navigate('/community')}
                        className="font-bold text-xs sm:text-sm md:text-base text-slate-900 mb-1.5 line-clamp-1 group-hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        {post.title}
                      </h3>
                      <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-3 sm:mb-4">
                        {post.content}
                      </p>
                    </div>

                    <div className="pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <button
                        type="button"
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center gap-1.5 transition-colors cursor-pointer ${likedPosts[post.id] ? 'text-rose-600 font-bold' : 'hover:text-rose-600'
                          }`}
                      >
                        <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${likedPosts[post.id] ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>{post.likes + (likedPosts[post.id] ? 1 : 0)}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate('/community')}
                        className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>{post.comments}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBookmarkPost(post.id)}
                        className={`transition-colors cursor-pointer ${bookmarkedPosts[post.id] ? 'text-amber-500' : 'hover:text-amber-500'
                          }`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${bookmarkedPosts[post.id] ? 'fill-amber-500 text-amber-500' : ''}`} />
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
          6. INTERACTIVE MAP & HIDDEN GEMS
          - Immersive midnight obsidian section canvas
          - Natural travel discovery & destination preview
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="w-full py-10 sm:py-16 lg:py-20 bg-gradient-to-b from-[#0a111a] via-[#0f1926] to-[#070d14] text-white border-b border-slate-800">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="rounded-2xl sm:rounded-3xl bg-slate-900/90 backdrop-blur-xl text-white p-5 sm:p-8 lg:p-12 shadow-2xl border border-slate-700/80">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
              {/* Text & List Details (5 cols) */}
              <div className="lg:col-span-5 flex flex-col">
                <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight mb-2 sm:mb-4 leading-tight">
                  Khám Phá Điểm Đến Bí Mật Không Có Trên Bản Đồ Thường
                </h2>

                <p className="text-slate-300 text-xs sm:text-sm md:text-base mb-4 sm:mb-7 leading-relaxed font-normal tracking-[0.015em]">
                  Hệ thống kết nối sâu vào dữ liệu bản địa của Wayfare giúp bạn tìm ra những
                  con thác nguyên sơ, quán cà phê ẩn mình và góc ngắm bình minh tuyệt đối riêng tư.
                </p>

                {/* Clickable Hidden Gem Cards */}
                <div className="space-y-2 sm:space-y-3 mb-5 sm:mb-7">
                  {[
                    { id: 'dalat', name: 'Suối Tía - Hồ Tuyền Lâm', location: 'Đà Lạt', tag: 'Tọa độ bí mật' },
                    { id: 'sapa', name: 'Bản Sâu Chua', location: 'Sa Pa', tag: 'Bản địa' },
                    { id: 'phuquoc', name: 'Hòn Dăm & Rạch Tràm', location: 'Phú Quốc', tag: 'Hoang sơ' }
                  ].map((gem) => (
                    <button
                      key={gem.id}
                      type="button"
                      onClick={() => setSelectedGemId(gem.id)}
                      className={`w-full p-2.5 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 transition-all text-left cursor-pointer border hover:scale-[1.01] active:scale-[0.99] ${selectedGemId === gem.id
                        ? 'bg-sky-600/35 border-sky-400 shadow-md ring-1 ring-sky-400/30'
                        : 'bg-white/10 hover:bg-white/15 border-white/15'
                        }`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <span
                          className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 ${selectedGemId === gem.id ? 'bg-sky-400 animate-pulse' : 'bg-slate-400'
                            }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between sm:justify-start gap-1.5">
                            <h4 className="font-bold text-xs sm:text-sm md:text-base text-white leading-tight">
                              {gem.name} <span className="text-slate-400 font-normal">({gem.location})</span>
                            </h4>
                            <span
                              className={`sm:hidden px-2 py-0.5 rounded-full text-[9px] font-bold uppercase transition-colors shrink-0 ${selectedGemId === gem.id
                                ? 'bg-sky-500 text-white'
                                : 'bg-white/20 text-slate-300'
                                }`}
                            >
                              {gem.tag}
                            </span>
                          </div>
                          <p className="text-[10px] sm:text-xs text-slate-300 font-normal mt-0.5 line-clamp-1">
                            {hiddenGems[gem.id].time}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`hidden sm:inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase transition-colors shrink-0 ${selectedGemId === gem.id
                          ? 'bg-sky-500 text-white'
                          : 'bg-white/20 text-slate-300'
                          }`}
                      >
                        {gem.tag}
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/explore')}
                  className="inline-flex items-center gap-2 text-sky-400 font-bold text-xs sm:text-sm md:text-base hover:text-sky-300 hover:underline cursor-pointer group"
                >
                  <span>Khám phá các tọa độ ẩn xung quanh bạn</span>
                  <NavigationIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-300 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Dynamic Map & Scenic View Container (7 cols) */}
              <div className="lg:col-span-7">
                <div className="relative w-full h-[260px] sm:h-[400px] lg:h-[460px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-700">
                  <div
                    className="w-full h-full bg-cover bg-center transition-all duration-700"
                    style={{
                      backgroundImage: `url('${hiddenGems[selectedGemId].image}')`
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]" />

                  {/* Top Badge: Weather & Crowd */}
                  <div className="absolute top-3 sm:top-5 left-3 sm:left-5 flex items-center gap-1.5 sm:gap-2.5">
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md text-sky-300 text-[10px] sm:text-xs font-bold border border-sky-400/40">
                      🌤️ {hiddenGems[selectedGemId].temp}
                    </span>
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md text-sky-300 text-[10px] sm:text-xs font-bold border border-sky-400/40">
                      👥 {hiddenGems[selectedGemId].crowd}
                    </span>
                  </div>

                  {/* Floating GPS Card with Dynamic Selected Gem Details */}
                  <div className="absolute bottom-2.5 sm:bottom-6 left-2.5 sm:left-6 right-2.5 sm:right-auto sm:max-w-md p-2.5 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-900/95 backdrop-blur-xl shadow-2xl flex items-center gap-2.5 sm:gap-4 text-white border border-slate-700">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-sky-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-sky-600/50">
                      <MapPin className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-extrabold text-xs sm:text-sm md:text-base text-white truncate">
                        {hiddenGems[selectedGemId].title}
                      </h5>
                      <p className="text-[10px] sm:text-xs text-slate-300 font-medium mt-0.5 line-clamp-2">
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
      <section className="w-full py-10 sm:py-16 lg:py-20 bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#eef2f6] border-b border-slate-200/90">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-2">
            <h2 className="font-display text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Câu Chuyện Từ Những Người Đã Đi
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm md:text-base font-normal tracking-[0.015em]">
              Hàng ngàn chuyến đi đáng nhớ đã được hoàn thành trọn vẹn nhờ sự đồng hành của Wayfare.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
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
                  “Bọn mình đã có một kỳ trăng mật trong mơ tại Phú Quốc. Những quán bar hoàng hôn do Wayfare
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
      {/* ──────────────────────────────────────────────────────────────────────────
          8. GRAND FINALE CTA BANNER
          - Framed on a soft sapphire ambient pedestal
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="w-full py-10 sm:py-16 bg-gradient-to-b from-[#f0f9ff] to-[#f8fafc]">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden p-6 sm:p-10 lg:p-16 bg-gradient-to-r from-[#031726] via-[#082845] to-[#0c385f] text-white shadow-2xl border border-sky-900/40">
            {/* Subtle Ambient Light Orbs with Pulse Animations */}
            <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none animate-pulse-slow" />
            <div className="absolute top-0 right-1/3 w-64 h-64 rounded-full bg-sky-400/20 blur-2xl pointer-events-none animate-pulse-slow [animation-delay:3s]" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
              {/* Left Column: Heading, Subtitle & Actions (7 cols) */}
              <div className="lg:col-span-7 flex flex-col items-start space-y-4 sm:space-y-6">
                <h2 className="font-display text-xl sm:text-3xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  Sẵn Sàng Cho Chuyến Phiêu Lưu Kế Tiếp?
                </h2>

                <p className="text-sky-100 text-xs sm:text-sm md:text-base leading-relaxed font-normal tracking-[0.015em] max-w-xl">
                  Hãy để Wayfare đồng hành chuẩn bị, lên lịch trình và tối ưu chi phí. Bạn chỉ cần tận hưởng
                  từng khoảnh khắc trọn vẹn bên người thân yêu.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto pt-1">
                  <a
                    href="#plan-dock"
                    className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-700 hover:to-blue-700 text-white font-extrabold text-xs sm:text-sm md:text-base shadow-[0_12px_30px_rgba(2,132,199,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-sky-200" />
                    <span>Lên Lịch Trình Miễn Phí Ngay</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => navigate('/community')}
                    className="w-full sm:w-auto px-6 sm:px-7 py-3.5 sm:py-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white font-bold text-xs sm:text-sm md:text-base transition-all border border-white/20 hover:border-white/40 shadow-sm cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-sky-300" />
                    <span>Khám Phá Cộng Đồng</span>
                  </button>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-[11px] sm:text-xs md:text-sm text-sky-100">
                  <div className="flex items-center gap-1.5 sm:gap-2 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                    <span>Không cần thẻ tín dụng • Trải nghiệm ngay 100% miễn phí</span>
                  </div>
                  <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-sky-400/50" />
                  <div className="flex items-center gap-1.5 text-sky-200">
                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-white">4.9/5</span>
                    <span>từ 50.000+ du khách</span>
                  </div>
                </div>
              </div>

              {/* Right Column: High-tech Glassmorphism Trip Preview Card (5 cols - fills empty space) */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
                <div className="w-full max-w-md rounded-2xl sm:rounded-3xl bg-slate-900/80 backdrop-blur-2xl p-4 sm:p-6 border border-sky-400/30 shadow-2xl space-y-3 sm:space-y-4 hover:border-sky-400/60 transition-all">
                  {/* Card Header Preview */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shrink-0">
                        <Compass className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm md:text-base text-white truncate">Lộ Trình Tinh Gọn</h4>
                        <p className="text-[11px] sm:text-xs text-sky-200 truncate">Đà Lạt • Sương Mù & Thung Lũng</p>
                      </div>
                    </div>
                    <span className="px-2.5 sm:px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] sm:text-xs font-bold shrink-0">
                      Sẵn sàng
                    </span>
                  </div>

                  {/* 3 Live Feature Chips */}
                  <div className="space-y-2 sm:space-y-2.5">
                    <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-[11px] sm:text-xs text-slate-200">
                      <span className="flex items-center gap-2 truncate pr-2">
                        <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping shrink-0" />
                        <span className="truncate">Tự động phân luồng thứ tự ghé thăm</span>
                      </span>
                      <span className="font-bold text-sky-300 shrink-0">Tốc độ 3.2s</span>
                    </div>

                    <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-[11px] sm:text-xs text-slate-200">
                      <span className="flex items-center gap-2 truncate pr-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        <span className="truncate">Dự toán chi phí & cảnh báo phát sinh</span>
                      </span>
                      <span className="font-bold text-emerald-300 shrink-0">Chuẩn 98%</span>
                    </div>

                    <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-[11px] sm:text-xs text-slate-200">
                      <span className="flex items-center gap-2 truncate pr-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                        <span className="truncate">Phương án dự phòng linh hoạt</span>
                      </span>
                      <span className="font-bold text-amber-300 shrink-0">Tự động 24/7</span>
                    </div>
                  </div>

                  {/* Footer Stat Summary within Preview */}
                  <div className="pt-2 flex items-center justify-between text-[11px] sm:text-xs">
                    <span className="text-slate-300">Tiết kiệm trung bình</span>
                    <span className="font-black text-xs sm:text-sm text-sky-300 bg-sky-500/10 px-2.5 sm:px-3 py-1 rounded-lg border border-sky-500/20">
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

