import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Search,
  MapPin,
  Filter,
  Star,
  Sparkles,
  Navigation,
  Layers,
  List,
  Map as MapIcon,
  Grid,
  Heart,
  Calendar,
  Clock,
  Compass,
  DollarSign,
  Sun,
  Eye,
  X,
  ChevronRight,
  Share2,
  Copy,
  CheckCircle2,
  SlidersHorizontal,
  Flame,
  Umbrella,
  Camera,
  Utensils,
  Phone,
  ExternalLink,
  PlusCircle,
  Store,
  Coffee,
  Home,
  Award,
  Radio,
  Check,
  Building2,
  Send
} from 'lucide-react';
import { useToast } from '../../../components/common/Toast';
import { RealMapView } from '../../../components/map/RealMapView';

export const ExplorePage = () => {
  const { destinations, places, addNewPlace, setIsAIGeneratorOpen, currentUser } = useApp();
  const toast = useToast();

  // Explore Layer: 'all' | 'spots' (Local Businesses / Spots) | 'destinations' (Regions & Cities)
  const [exploreLayer, setExploreLayer] = useState('spots');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('Tất cả');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedBudget, setSelectedBudget] = useState('all'); // 'all' | 'under3m' | '3m-6m' | 'above6m'
  const [selectedDuration, setSelectedDuration] = useState('all'); // 'all' | '2d' | '3d' | '4d+'
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'rating' | 'nearest'
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // View Mode: 'split' (Cards + Map) | 'grid' (All Cards Grid) | 'map' (Full Map)
  const [viewMode, setViewMode] = useState('split');
  const [mapLayer, setMapLayer] = useState('osm'); // 'osm' | 'hot' | 'osmfr'

  // User GPS coordinates for Distance Radar
  const [userCoords, setUserCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Saved / Wishlist
  const [savedItems, setSavedItems] = useState({});

  // Active Item for Map & Detail Modal
  const [activeItem, setActiveItem] = useState(null);
  const [detailModalItem, setDetailModalItem] = useState(null);

  // Add Place Modal State
  const [isAddPlaceModalOpen, setIsAddPlaceModalOpen] = useState(false);
  const [isSubmittingPlace, setIsSubmittingPlace] = useState(false);
  const [newPlaceForm, setNewPlaceForm] = useState({
    name: '',
    categoryName: 'Quán Cafe & Săn Mây',
    city: 'Đà Lạt',
    address: '',
    latitude: '',
    longitude: '',
    phoneNumber: '',
    openHours: '07:00 - 22:00',
    priceRange: '35.000đ - 85.000đ',
    ticketPrice: '',
    amenities: ['Wifi tốc độ cao', 'Bãi đỗ xe ô tô'],
    coverImageUrl: '',
    description: ''
  });

  const availableAmenityOptions = [
    'Wifi tốc độ cao',
    'Bãi đỗ xe ô tô',
    'View săn mây',
    'Bàn ngoài trời thoáng đãng',
    'Đốt lửa trại',
    'Thanh toán thẻ / Quét QR',
    'Thân thiện thú cưng',
    'Phục vụ đồ ăn đêm',
    'Phù hợp làm việc từ xa',
    'Nhạc Acoustic cuối tuần'
  ];

  const suggestedCoverImages = [
    { label: 'Cafe Săn Mây', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80' },
    { label: 'Homestay Bản Địa', url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80' },
    { label: 'Ẩm Thực Quán Ăn', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
    { label: 'Nghỉ Dưỡng View Biển', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80' }
  ];

  const spotCategories = [
    'Tất cả',
    'Quán Cafe & Săn Mây',
    'Homestay & Nghỉ Dưỡng',
    'Ẩm Thực & Đặc Sản',
    'Trải Nghiệm & Hoạt Động',
    'Danh Lam & Thắng Cảnh'
  ];

  const regions = ['Tất cả', 'Miền Bắc', 'Miền Trung', 'Miền Nam', 'Tây Nguyên'];

  // Calculate distance between 2 coordinates (Haversine formula in km)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Radius of Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // Live Location Locator
  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt của bạn không hỗ trợ định vị GPS');
      return;
    }
    setIsLocating(true);
    toast.info('Đang bật radar định vị GPS quanh bạn... 🛰️');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setIsLocating(false);
        setSortBy('nearest');
        toast.success(`Đã xác định vị trí! Tìm các địa điểm gần bạn nhất 📍`);
      },
      (err) => {
        setIsLocating(false);
        toast.error('Không thể lấy vị trí: ' + err.message);
      },
      { timeout: 10000 }
    );
  };

  // Copy GPS
  const handleCopyGPS = (item, e) => {
    e?.stopPropagation();
    const lat = item.latitude || item.coordinates?.lat;
    const lng = item.longitude || item.coordinates?.lng;
    if (!lat || !lng) {
      toast.info('Tọa độ chưa được cập nhật chính xác');
      return;
    }
    const coordString = `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;
    navigator.clipboard?.writeText(coordString);
    toast.success(`Đã sao chép tọa độ GPS: ${coordString} 📍`);
  };

  // Google Maps Direction
  const handleOpenGoogleMaps = (item, e) => {
    e?.stopPropagation();
    const lat = item.latitude || item.coordinates?.lat;
    const lng = item.longitude || item.coordinates?.lng;
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + (item.city || ''))}`, '_blank');
    }
  };

  // Launch AI Planner
  const handlePlanWithAI = (item, e) => {
    e?.stopPropagation();
    setIsAIGeneratorOpen(true);
    toast.info(`Khởi tạo AI Travel Planner cho "${item.name}"... ✨`);
  };

  // Toggle Save
  const handleToggleSave = (item, e) => {
    e.stopPropagation();
    const idKey = item.id;
    const isCurrentlySaved = !!savedItems[idKey];
    setSavedItems(prev => ({ ...prev, [idKey]: !isCurrentlySaved }));
    if (!isCurrentlySaved) {
      toast.success(`Đã thêm "${item.name}" vào danh sách yêu thích! ❤️`);
    } else {
      toast.info(`Đã gỡ "${item.name}" khỏi danh sách yêu thích.`);
    }
  };

  // Fill GPS in Modal Form
  const handleGetLocationForForm = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ GPS');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNewPlaceForm(prev => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6)
        }));
        toast.success('Đã tự động lấy tọa độ GPS của bạn! 📍');
      },
      (err) => {
        toast.error('Không thể lấy tọa độ: ' + err.message);
      }
    );
  };

  // Toggle Amenity in Form
  const toggleAmenity = (amenity) => {
    setNewPlaceForm(prev => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter(a => a !== amenity)
          : [...prev.amenities, amenity]
      };
    });
  };

  // Submit Add Place Form
  const handleAddPlaceSubmit = async (e) => {
    e.preventDefault();
    if (!newPlaceForm.name.trim()) {
      toast.error('Vui lòng nhập tên địa điểm hoặc cơ sở kinh doanh');
      return;
    }
    setIsSubmittingPlace(true);
    try {
      const payload = {
        name: newPlaceForm.name.trim(),
        categoryName: newPlaceForm.categoryName,
        city: newPlaceForm.city || 'Đà Lạt',
        address: newPlaceForm.address,
        latitude: newPlaceForm.latitude ? parseFloat(newPlaceForm.latitude) : null,
        longitude: newPlaceForm.longitude ? parseFloat(newPlaceForm.longitude) : null,
        phoneNumber: newPlaceForm.phoneNumber,
        openHours: newPlaceForm.openHours || '07:00 - 22:00',
        priceRange: newPlaceForm.priceRange || '35.000đ - 85.000đ',
        ticketPrice: newPlaceForm.ticketPrice ? parseFloat(newPlaceForm.ticketPrice) : 0,
        amenities: newPlaceForm.amenities.join(', '),
        coverImageUrl: newPlaceForm.coverImageUrl || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
        description: newPlaceForm.description
      };

      const created = await addNewPlace(payload);
      toast.success(`Chúc mừng! "${created.name}" đã được đăng tải thành công lên Wayfare 🎉`);
      setIsAddPlaceModalOpen(false);
      setNewPlaceForm({
        name: '',
        categoryName: 'Quán Cafe & Săn Mây',
        city: 'Đà Lạt',
        address: '',
        latitude: '',
        longitude: '',
        phoneNumber: '',
        openHours: '07:00 - 22:00',
        priceRange: '35.000đ - 85.000đ',
        ticketPrice: '',
        amenities: ['Wifi tốc độ cao', 'Bãi đỗ xe ô tô'],
        coverImageUrl: '',
        description: ''
      });
      setExploreLayer('spots');
      setActiveItem(created);
    } catch (err) {
      toast.error('Lỗi khi đăng địa điểm: ' + err.message);
    } finally {
      setIsSubmittingPlace(false);
    }
  };

  // Format Items depending on exploreLayer
  const unifiedItems = useMemo(() => {
    let list = [];

    // Local Spots (from Backend / State)
    if (exploreLayer === 'spots' || exploreLayer === 'all') {
      const formattedSpots = (places || []).map(p => ({
        id: `spot-${p.id}`,
        rawId: p.id,
        isLocalSpot: true,
        name: p.name,
        category: p.categoryName || 'Tọa độ bản địa',
        city: p.city || 'Việt Nam',
        region: p.city?.includes('Đà Lạt') || p.city?.includes('Hà Giang') ? 'Miền Bắc / Tây Nguyên' : 'Việt Nam',
        address: p.address,
        image: p.coverImageUrl || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
        latitude: p.latitude,
        longitude: p.longitude,
        rating: p.averageRating ? Number(p.averageRating).toFixed(1) : '5.0',
        reviewsCount: p.reviewCount || 1,
        phoneNumber: p.phoneNumber,
        openHours: p.openHours || '07:00 - 22:00',
        priceEstimate: p.priceRange || (p.ticketPrice ? `${Number(p.ticketPrice).toLocaleString()}đ` : 'Miễn phí'),
        amenities: p.amenities ? p.amenities.split(',').map(s => s.trim()) : [],
        isVerifiedHost: p.isVerifiedHost,
        ownerName: p.ownerName,
        ownerHandle: p.ownerHandle,
        ownerAvatar: p.ownerAvatar,
        tagline: p.description || 'Tọa độ check-in & trải nghiệm do người dùng và cơ sở bản địa chia sẻ.',
        weather: 'Mát mẻ 22°C'
      }));
      list.push(...formattedSpots);
    }

    // Destinations (Broad province / regions)
    if (exploreLayer === 'destinations' || exploreLayer === 'all') {
      const formattedDestinations = (destinations || []).map(d => ({
        ...d,
        isLocalSpot: false,
        rawId: d.id,
        latitude: d.coordinates?.lat,
        longitude: d.coordinates?.lng,
        amenities: d.specialties || []
      }));
      list.push(...formattedDestinations);
    }

    return list;
  }, [exploreLayer, places, destinations]);

  // Filter & Sort
  const filteredItems = useMemo(() => {
    return unifiedItems
      .filter(item => {
        // Search
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          item.name.toLowerCase().includes(q) ||
          item.city?.toLowerCase().includes(q) ||
          item.tagline?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q) ||
          item.address?.toLowerCase().includes(q);

        // Region / City
        const matchesRegion =
          selectedRegion === 'Tất cả' ||
          item.region === selectedRegion ||
          item.city?.toLowerCase().includes(selectedRegion.toLowerCase());

        // Category
        const matchesCategory =
          selectedCategory === 'Tất cả' ||
          item.category?.toLowerCase().includes(selectedCategory.toLowerCase());

        return matchesSearch && matchesRegion && matchesCategory;
      })
      .map(item => {
        // Attach dynamic distance
        if (userCoords && item.latitude && item.longitude) {
          const dist = calculateDistance(userCoords.lat, userCoords.lng, item.latitude, item.longitude);
          return { ...item, distanceKm: dist };
        }
        return item;
      })
      .sort((a, b) => {
        if (sortBy === 'nearest' && a.distanceKm && b.distanceKm) {
          return parseFloat(a.distanceKm) - parseFloat(b.distanceKm);
        }
        if (sortBy === 'rating') {
          return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
        }
        if (sortBy === 'popular') {
          return (b.reviewsCount || 0) - (a.reviewsCount || 0);
        }
        return 0;
      });
  }, [unifiedItems, searchQuery, selectedRegion, selectedCategory, sortBy, userCoords]);

  // Set default activeItem
  useEffect(() => {
    if (!activeItem && filteredItems.length > 0) {
      setActiveItem(filteredItems[0]);
    }
  }, [filteredItems, activeItem]);

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 space-y-8">
      
      {/* ──────────────────────────────────────────────────────────────────────────
          1. BREADCRUMB & HERO DISCOVERY BANNER (WITH HOST ACTION)
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <a href="/" className="hover:text-sky-600 transition-colors">Trang chủ</a>
          <span>/</span>
          <span className="text-slate-900 font-bold">Khám phá & Tọa độ Bản địa</span>
        </div>

        {/* Hero Title & Live Metrics */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-sky-950 via-[#071f38] to-slate-950 rounded-3xl p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden shadow-2xl border border-sky-500/20">
          {/* Subtle Ambient Orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/15 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute -bottom-10 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-sky-300 text-xs font-bold border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
              <span>Wayfare Local Host Network • Mạng Lưới Điểm Dừng Chân Bản Địa</span>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Bản Đồ Tọa Độ & Cơ Sở Bản Địa
            </h1>

            <p className="text-slate-200 text-sm sm:text-base font-normal leading-relaxed opacity-95">
              Khám phá các homestay mộc mạc, quán cà phê săn mây view triệu đô, và ẩm thực bí truyền do chính 
              người bản địa và chủ quán đăng tải. Kết nối trực tiếp, đặt bàn & lên lịch trình thông minh!
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs sm:text-sm font-semibold text-sky-200">
              <div className="flex items-center gap-1.5">
                <Store className="w-4 h-4 text-emerald-400" />
                <span>{places.length || 8}+ Cơ sở bản địa đang hoạt động</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>4.9★ Đánh giá từ phượt thủ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
                <span>Hỗ trợ định vị radar quanh bạn</span>
              </div>
            </div>
          </div>

          {/* Action Trigger Group: Post Place & AI Planner */}
          <div className="relative z-10 shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
            {/* Host Register Button */}
            <button
              onClick={() => setIsAddPlaceModalOpen(true)}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>+ Đăng Địa Điểm Của Bạn</span>
            </button>

            {/* AI Generator Button */}
            <button
              onClick={() => setIsAIGeneratorOpen(true)}
              className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 backdrop-blur-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-sky-300" />
              <span>Lập Tour AI Tự Động</span>
            </button>
            <span className="text-[11px] text-sky-200/80 text-center lg:text-right">
              Chủ quán & Người bản địa đăng tải miễn phí 🚀
            </span>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. DUAL-LEVEL EXPLORE TABS (BẢN ĐỊA VS TOÀN CẢNH VS RADAR GPS)
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setExploreLayer('spots')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              exploreLayer === 'spots'
                ? 'bg-white text-sky-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="w-4 h-4 text-orange-500" />
            <span>Tọa Độ Bản Địa & Cơ Sở ({places.length || 8})</span>
            <span className="px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px]">Mới</span>
          </button>

          <button
            onClick={() => setExploreLayer('destinations')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              exploreLayer === 'destinations'
                ? 'bg-white text-sky-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4 text-sky-500" />
            <span>Tỉnh Thành & Danh Lam ({destinations.length})</span>
          </button>

          <button
            onClick={() => setExploreLayer('all')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              exploreLayer === 'all'
                ? 'bg-white text-sky-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-500" />
            <span>Tất Cả ({unifiedItems.length})</span>
          </button>
        </div>

        {/* Radar GPS Trigger */}
        <button
          onClick={handleGetLiveLocation}
          disabled={isLocating}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
            userCoords
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-sky-600' : 'text-emerald-600'}`} />
          <span>{userCoords ? '📍 Đang dùng vị trí GPS của bạn' : 'Bật Radar GPS Quanh Tôi'}</span>
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          3. MULTI-CRITERIA FILTER & VIEW TOOLBAR
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
        {/* Top Filter Row: Search Input + Category Chips + View Mode */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search Input Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm địa danh du lịch Việt Nam: Đà Lạt, Hà Giang, Phú Quốc, Hội An, Sa Pa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-sky-500 text-xs font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
            {spotCategories.map(cat => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl shrink-0 self-end lg:self-auto border border-slate-200/60">
            <button
              onClick={() => setViewMode('split')}
              title="Chế độ chia đôi (Danh sách + Bản đồ)"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'split' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chia đôi</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="Chế độ lưới toàn cảnh"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lưới card</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              title="Bản đồ tọa độ toàn cảnh"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'map' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bản đồ</span>
            </button>
          </div>
        </div>

        {/* Secondary Filter Row: Region + Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
              Vùng miền:
            </span>
            {regions.map(reg => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedRegion === reg
                    ? 'bg-sky-100 text-sky-900 font-bold border border-sky-300'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-xl outline-none cursor-pointer text-xs"
            >
              <option value="popular">Phổ biến nhất</option>
              <option value="rating">Đánh giá cao nhất</option>
              {userCoords && <option value="nearest">Gần tôi nhất (Radar GPS)</option>}
            </select>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          4. MAIN CONTENT: BASED ON VIEW MODE (SPLIT | GRID | FULL MAP)
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>
          Hiển thị <strong className="text-slate-900 font-bold">{filteredItems.length}</strong> tọa độ phù hợp
          {exploreLayer === 'spots' && ' (Cơ sở do người dùng & chủ quán đăng tải)'}
        </span>
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(''); setSelectedRegion('Tất cả'); setSelectedCategory('Tất cả'); }}
            className="text-sky-600 hover:underline font-bold"
          >
            Đặt lại bộ lọc
          </button>
        )}
      </div>

      {/* ─────────────────── A. SPLIT VIEW ─────────────────── */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[650px]">
          
          {/* Left: Scrollable Destination / Spot Cards */}
          <div className="lg:col-span-6 space-y-4 max-h-[820px] overflow-y-auto pr-2 sidebar-scrollbar">
            {filteredItems.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center space-y-3 border border-slate-200 shadow-sm">
                <Compass className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-base text-slate-900">Không tìm thấy địa điểm phù hợp</h3>
                <p className="text-xs text-slate-500">Hãy thử đổi từ khoá hoặc nhấn "+ Đăng Địa Điểm Của Bạn" để chia sẻ tọa độ mới nhé!</p>
                <button
                  onClick={() => setIsAddPlaceModalOpen(true)}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  + Đăng Địa Điểm Mới Ngay
                </button>
              </div>
            ) : (
              filteredItems.map(item => {
                const isActive = activeItem?.id === item.id;
                const isSaved = !!savedItems[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveItem(item)}
                    className={`bg-white rounded-3xl p-4 transition-all cursor-pointer flex flex-col sm:flex-row gap-4 border ${
                      isActive
                        ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-lg scale-[1.01]'
                        : 'border-slate-200/80 hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-full sm:w-48 h-48 sm:h-auto rounded-2xl overflow-hidden shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      {/* Host Verified Badge */}
                      {item.isLocalSpot && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-orange-600/90 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1 shadow-sm">
                          <Store className="w-3 h-3 text-amber-200" />
                          <span>Chủ cơ sở</span>
                        </span>
                      )}

                      {/* Distance Tag (if GPS available) */}
                      {item.distanceKm && (
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-semibold text-emerald-300 flex items-center gap-1">
                          <Navigation className="w-3 h-3" />
                          {item.distanceKm} km
                        </span>
                      )}

                      {/* Wishlist Heart */}
                      <button
                        onClick={(e) => handleToggleSave(item, e)}
                        className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                          isSaved ? 'bg-rose-500 text-white shadow-md' : 'bg-black/35 text-white hover:bg-black/60'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Details Content */}
                    <div className="flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        {/* Top Category & Rating */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-800 text-[10px] font-bold">
                            {item.category} • {item.city}
                          </span>
                          <div className="flex items-center gap-1 text-xs font-black text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{item.rating} ({item.reviewsCount})</span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 mt-1 line-clamp-1">
                          {item.name}
                        </h3>

                        {/* Tagline / Address */}
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {item.address ? `📍 ${item.address} • ` : ''}
                          {item.tagline}
                        </p>

                        {/* Host owner badge if available */}
                        {item.ownerName && (
                          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-600 font-medium">
                            {item.ownerAvatar ? (
                              <img src={item.ownerAvatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                            ) : (
                              <Store className="w-3.5 h-3.5 text-orange-500" />
                            )}
                            <span>Đăng bởi: <strong className="text-slate-800 font-bold">{item.ownerName}</strong></span>
                            {item.isVerifiedHost && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" title="Đã xác thực" />
                            )}
                          </div>
                        )}

                        {/* Amenities Chips */}
                        {item.amenities && item.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.amenities.slice(0, 3).map((a, idx) => (
                              <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                                ✓ {a}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Pricing, Hotline & Actions */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="block text-[10px] text-slate-400 font-semibold">
                            {item.openHours ? `🕒 ${item.openHours}` : 'Giá dự kiến'}
                          </span>
                          <span className="font-bold text-xs sm:text-sm text-sky-700">{item.priceEstimate}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Call Hotline button if present */}
                          {item.phoneNumber && (
                            <a
                              href={`tel:${item.phoneNumber}`}
                              onClick={(e) => e.stopPropagation()}
                              title={`Gọi hotline: ${item.phoneNumber}`}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span className="hidden sm:inline">Gọi quán</span>
                            </a>
                          )}

                          <button
                            onClick={(e) => { e.stopPropagation(); setDetailModalItem(item); }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Chi tiết</span>
                          </button>

                          <button
                            onClick={(e) => handlePlanWithAI(item, e)}
                            className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-amber-200" />
                            <span>Tạo Tour</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Interactive Real Leaflet Map Viewport */}
          <div className="lg:col-span-6 h-[720px] lg:h-[820px] sticky top-24">
            <RealMapView
              items={filteredItems}
              activeItem={activeItem}
              setActiveItem={setActiveItem}
              setDetailModalItem={setDetailModalItem}
              userCoords={userCoords}
              mapStyle={mapLayer}
              setMapStyle={setMapLayer}
              className="h-full"
            />
          </div>

        </div>
      )}

      {/* ─────────────────── B. GRID VIEW ─────────────────── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => {
            const isSaved = !!savedItems[item.id];
            return (
              <div
                key={item.id}
                onClick={() => setDetailModalItem(item)}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {item.isLocalSpot && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-orange-600/95 backdrop-blur-md text-[10px] font-extrabold text-white flex items-center gap-1 shadow-md">
                      <Store className="w-3 h-3 text-amber-200" />
                      <span>Cơ sở bản địa</span>
                    </span>
                  )}
                  <button
                    onClick={(e) => handleToggleSave(item, e)}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                      isSaved ? 'bg-rose-500 text-white shadow-md' : 'bg-black/35 text-white hover:bg-black/60'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                  <span className="absolute bottom-2 left-3 px-2.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white">
                    📍 {item.city}
                  </span>
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {item.rating}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {item.tagline}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold">Khoảng giá</span>
                      <span className="font-bold text-xs text-slate-900">{item.priceEstimate}</span>
                    </div>
                    <button
                      onClick={(e) => handlePlanWithAI(item, e)}
                      className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                    >
                      <Sparkles className="w-3 h-3 text-amber-200" />
                      <span>Tour AI</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─────────────────── C. FULL MAP VIEW ─────────────────── */}
      {viewMode === 'map' && (
        <div className="h-[750px] w-full rounded-3xl overflow-hidden shadow-2xl">
          <RealMapView
            items={filteredItems}
            activeItem={activeItem}
            setActiveItem={setActiveItem}
            setDetailModalItem={setDetailModalItem}
            userCoords={userCoords}
            mapStyle={mapLayer}
            setMapStyle={setMapLayer}
            className="h-full"
          />
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          5. MODAL: "+ ĐĂNG ĐỊA ĐIỂM / CƠ SỞ KINH DOANH MỚI" (FOR HOSTS & USERS)
      ────────────────────────────────────────────────────────────────────────── */}
      {isAddPlaceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-orange-600 via-amber-600 to-amber-700 text-white flex items-center justify-between shrink-0">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                  <Store className="w-3 h-3 text-amber-200" />
                  <span>Dành Cho Doanh Nghiệp & Người Bản Địa</span>
                </div>
                <h3 className="font-display font-extrabold text-lg sm:text-xl text-white">
                  Đăng Tải Tọa Độ / Điểm Dừng Chân Của Bạn
                </h3>
                <p className="text-xs text-amber-100">
                  Thu hút hàng ngàn du khách và phượt thủ đến với cơ sở của bạn hoàn toàn miễn phí.
                </p>
              </div>
              <button
                onClick={() => setIsAddPlaceModalOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleAddPlaceSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              
              {/* Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tên cơ sở / Địa điểm <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Homestay Hoàng Hôn Bản Lô Lô, Tiệm Cafe Mây..."
                  value={newPlaceForm.name}
                  onChange={(e) => setNewPlaceForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-slate-900 font-semibold"
                />
              </div>

              {/* Category & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phân loại cơ sở</label>
                  <select
                    value={newPlaceForm.categoryName}
                    onChange={(e) => setNewPlaceForm(prev => ({ ...prev, categoryName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none font-semibold text-slate-800 bg-white"
                  >
                    <option value="Quán Cafe & Săn Mây">Quán Cafe & Săn Mây</option>
                    <option value="Homestay & Nghỉ Dưỡng">Homestay & Nghỉ Dưỡng</option>
                    <option value="Ẩm Thực & Đặc Sản">Ẩm Thực & Đặc Sản</option>
                    <option value="Trải Nghiệm & Hoạt Động">Trải Nghiệm & Hoạt Động</option>
                    <option value="Danh Lam & Thắng Cảnh">Danh Lam & Thắng Cảnh</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tỉnh / Thành phố</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Đà Lạt, Hà Giang, Đà Nẵng..."
                    value={newPlaceForm.city}
                    onChange={(e) => setNewPlaceForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Địa chỉ cụ thể</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Số 31 Hẻm Sào Nam, Phường 11 hoặc Bản Lô Lô Chải..."
                  value={newPlaceForm.address}
                  onChange={(e) => setNewPlaceForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none font-semibold text-slate-800"
                />
              </div>

              {/* GPS Coordinates with Quick Fetch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">Tọa độ Vĩ độ (Latitude)</label>
                    <button
                      type="button"
                      onClick={handleGetLocationForForm}
                      className="text-[11px] text-sky-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3" />
                      Lấy GPS tự động
                    </button>
                  </div>
                  <input
                    type="number"
                    step="any"
                    placeholder="Ví dụ: 11.9404"
                    value={newPlaceForm.latitude}
                    onChange={(e) => setNewPlaceForm(prev => ({ ...prev, latitude: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tọa độ Kinh độ (Longitude)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Ví dụ: 108.4583"
                    value={newPlaceForm.longitude}
                    onChange={(e) => setNewPlaceForm(prev => ({ ...prev, longitude: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Phone, Open Hours, Price Range */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Hotline / Zalo đặt chỗ</label>
                  <input
                    type="tel"
                    placeholder="09xx xxx xxx"
                    value={newPlaceForm.phoneNumber}
                    onChange={(e) => setNewPlaceForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Giờ mở cửa</label>
                  <input
                    type="text"
                    placeholder="07:00 - 22:30"
                    value={newPlaceForm.openHours}
                    onChange={(e) => setNewPlaceForm(prev => ({ ...prev, openHours: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Khoảng giá</label>
                  <input
                    type="text"
                    placeholder="45.000đ - 85.000đ"
                    value={newPlaceForm.priceRange}
                    onChange={(e) => setNewPlaceForm(prev => ({ ...prev, priceRange: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Amenities Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Tiện ích nổi bật tại cơ sở</label>
                <div className="flex flex-wrap gap-2">
                  {availableAmenityOptions.map(amenity => {
                    const selected = newPlaceForm.amenities.includes(amenity);
                    return (
                      <button
                        type="button"
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                          selected
                            ? 'bg-orange-50 text-orange-800 border-orange-300 font-bold'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {selected ? '✓ ' : '+ '} {amenity}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Image URL & Quick Suggestions */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Link ảnh bìa cơ sở</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newPlaceForm.coverImageUrl}
                  onChange={(e) => setNewPlaceForm(prev => ({ ...prev, coverImageUrl: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none font-semibold text-slate-800"
                />
                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                  <span>Hoặc chọn ảnh mẫu nhanh:</span>
                  {suggestedCoverImages.map((s, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setNewPlaceForm(prev => ({ ...prev, coverImageUrl: s.url }))}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Mô tả & Điểm đặc sắc thu hút du khách</label>
                <textarea
                  rows={3}
                  placeholder="Kể về view mây, đồ uống đặc trưng, không gian chụp ảnh hoặc câu chuyện của cơ sở..."
                  value={newPlaceForm.description}
                  onChange={(e) => setNewPlaceForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-orange-500 outline-none font-normal text-slate-800 leading-relaxed"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddPlaceModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPlace}
                  className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  {isSubmittingPlace ? (
                    <span>Đang tải lên...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Xác nhận & Đăng Tải Ngay</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          6. MODAL: CHI TIẾT ĐỊA ĐIỂM (DETAIL MODAL)
      ────────────────────────────────────────────────────────────────────────── */}
      {detailModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            {/* Modal Image Header */}
            <div className="relative h-64 sm:h-72 w-full overflow-hidden shrink-0">
              <img
                src={detailModalItem.image}
                alt={detailModalItem.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <button
                onClick={() => setDetailModalItem(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-xs font-bold">
                    {detailModalItem.category} • {detailModalItem.city}
                  </span>
                  <div className="flex items-center gap-1 text-amber-300 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{detailModalItem.rating}</span>
                  </div>
                </div>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-white">
                  {detailModalItem.name}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              
              {/* Host & Merchant Profile Banner if available */}
              {detailModalItem.ownerName && (
                <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={detailModalItem.ownerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border-2 border-orange-300"
                    />
                    <div>
                      <div className="flex items-center gap-1 font-bold text-slate-900 text-sm">
                        <span>{detailModalItem.ownerName}</span>
                        {detailModalItem.isVerifiedHost && (
                          <CheckCircle2 className="w-4 h-4 text-sky-600" title="Chủ cơ sở uy tín đã xác thực" />
                        )}
                      </div>
                      <span className="text-slate-500 text-[11px]">{detailModalItem.ownerHandle || '@local_host'} • Chủ cơ sở bản địa</span>
                    </div>
                  </div>

                  {detailModalItem.phoneNumber && (
                    <a
                      href={`tel:${detailModalItem.phoneNumber}`}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Gọi đặt chỗ</span>
                    </a>
                  )}
                </div>
              )}

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="block text-[10px] text-slate-400 font-semibold">Giờ mở cửa</span>
                  <span className="font-bold text-slate-800 text-xs">{detailModalItem.openHours || '07:00 - 22:00'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-semibold">Khoảng giá dự kiến</span>
                  <span className="font-bold text-sky-700 text-xs">{detailModalItem.priceEstimate}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-semibold">Hotline liên hệ</span>
                  <span className="font-bold text-slate-800 text-xs">{detailModalItem.phoneNumber || 'Đang cập nhật'}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-sm text-slate-900">Giới thiệu & Điểm đặc sắc</h4>
                <p className="text-slate-600 leading-relaxed text-xs">
                  {detailModalItem.tagline || detailModalItem.description}
                </p>
                {detailModalItem.address && (
                  <p className="text-slate-500 italic text-[11px] pt-1">
                    📍 Địa chỉ: {detailModalItem.address}
                  </p>
                )}
              </div>

              {/* Amenities */}
              {detailModalItem.amenities && detailModalItem.amenities.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-slate-900">Tiện ích & Điểm nổi bật</h4>
                  <div className="flex flex-wrap gap-2">
                    {detailModalItem.amenities.map((a, i) => (
                      <span key={i} className="px-3 py-1 rounded-xl bg-sky-50 text-sky-800 font-semibold border border-sky-200/80">
                        ✓ {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleOpenGoogleMaps(detailModalItem, e)}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                  <span>Google Maps</span>
                </button>
                <button
                  onClick={(e) => handleCopyGPS(detailModalItem, e)}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy GPS</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDetailModalItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  onClick={(e) => {
                    handlePlanWithAI(detailModalItem, e);
                    setDetailModalItem(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Lập Tour AI Điểm Này</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ExplorePage;
