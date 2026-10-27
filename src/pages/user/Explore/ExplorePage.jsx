import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../components/common/Toast';
import { RealMapView } from '../../../components/map/RealMapView';
import { reviewApi, itineraryApi, placeApi } from '../../../services/api';
import { resolvePlaceImage, fixImageUrl, pickFallbackImage } from '../../../utils/placeImages';
import { mapApiSpot } from '../../../utils/placeMap';
import { fetchLiveWeatherBatch } from '../../../utils/weatherUtils';
import { Compass, ChevronLeft, ChevronRight } from 'lucide-react';

// Subcomponents
import { ExploreHeader } from './components/ExploreHeader';
import { ExploreFilterBar } from './components/ExploreFilterBar';
import { ExploreFilterDrawer } from './components/ExploreFilterDrawer';
import { ExploreSpotCard } from './components/ExploreSpotCard';
import { ExploreDestinationCard } from './components/ExploreDestinationCard';
import { PlaceDetailModal } from './components/PlaceDetailModal';
import { AddPlaceModal } from './components/AddPlaceModal';
import { AddToTripModal } from './components/AddToTripModal';

// Chuẩn hóa chuỗi tiếng Việt không dấu để tìm kiếm thông minh
const removeVietnameseTones = (str = '') => {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
};

// Chuyển giá CSDL (vd "Vé vào cổng: 50.000đ - 100.000đ", "Miễn phí") thành số VND để lọc ngân sách
const parsePriceVND = (item = {}) => {
  if (item.ticketPrice !== undefined && item.ticketPrice !== null && item.ticketPrice !== '') {
    return Number(item.ticketPrice) || 0;
  }
  const text = String(item.priceRange || item.priceEstimate || '').replace(/\s/g, '');
  if (!text || /miễnphí/i.test(text)) return 0;
  const numbers = (text.match(/[\d.,]+/g) || [])
    .map(n => Number(n.replace(/[.,]/g, '')))
    .filter(n => !Number.isNaN(n));
  return numbers.length ? Math.min(...numbers) : 0;
};

// Khớp khoảng giá với bộ lọc ngân sách trong ExploreFilterDrawer
const matchBudget = (priceVND, budget) => {
  switch (budget) {
    case 'under50k': return priceVND < 50000;
    case '50k-200k': return priceVND >= 50000 && priceVND <= 200000;
    case '200k-1m': return priceVND > 200000 && priceVND <= 1000000;
    case 'above1m': return priceVND > 1000000;
    default: return true;
  }
};

export const ExplorePage = () => {
  const {
    destinations = [],
    places = [],
    placesTotal = 0,
    hasMorePlaces = false,
    loadMorePlaces = () => {},
    loadingMorePlaces = false,
    addNewPlace,
    addPlaceToItinerary = async () => {},
    setIsAIGeneratorOpen,
    openAIGeneratorWithItem,
    currentUser,
    itineraries = [],
    savedPlaces = [],
    toggleSavePlace = () => {},
    isPlaceSaved = () => false
  } = useApp();
  const toast = useToast();

  // 1. Primary Discovery Layer: 'spots' (Tọa độ & Cơ sở bản địa) | 'destinations' (Cẩm nang Tỉnh thành)
  const [exploreLayer, setExploreLayer] = useState('spots');

  // 2. View Mode: 'grid' (Mặc định: Lưới trực quan) | 'split' (Chia đôi) | 'map' (Toàn bản đồ)
  const [viewMode, setViewMode] = useState('grid');
  const [mapStyle, setMapStyle] = useState('osm');

  // 3. Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedRegion, setSelectedRegion] = useState('Tất cả');
  const [selectedCity, setSelectedCity] = useState('Tất cả');
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'rating' | 'nearest'
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'grid' ? 12 : 8;

  // 3.1 Tìm kiếm & lọc tỉnh thành chạy TRỰC TIẾP trên server (/places?keyword=&city=)
  // thay vì tải cả 565 bản ghi về client như trước. remotePool = kết quả server.
  const [remotePool, setRemotePool] = useState(null);
  const [isRemoteSearching, setIsRemoteSearching] = useState(false);

  useEffect(() => {
    if (exploreLayer !== 'spots') return undefined;
    const kw = searchQuery.trim();
    const city = selectedCity !== 'Tất cả' ? selectedCity : '';
    if (!kw && !city) {
      setRemotePool(null);
      setIsRemoteSearching(false);
      return undefined;
    }
    let alive = true;
    setIsRemoteSearching(true);
    const timer = setTimeout(() => {
      placeApi
        .getPlaces({ keyword: kw || undefined, city: city || undefined })
        .then(res => {
          if (!alive) return;
          setRemotePool(res || []);
          setIsRemoteSearching(false);
        });
    }, 450);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedCity, exploreLayer]);

  // 4. User GPS Coordinates for Radar
  const [userCoords, setUserCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // 5. Saved Items (Wishlist)
  const [savedItems, setSavedItems] = useState({});

  // 6. Active Item for Map & Detail Modal
  const [activeItem, setActiveItem] = useState(null);
  const [detailModalItem, setDetailModalItem] = useState(null);

  // 7. Reviews State for Active Place in Detail Modal
  const [placeReviews, setPlaceReviews] = useState([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // 7.1 Thời tiết THẬT cho các card đang hiển thị (Open-Meteo, 1 request batch)
  const [weatherByPoint, setWeatherByPoint] = useState({});

  // 8. Modals
  const [isAddToTripModalOpen, setIsAddToTripModalOpen] = useState(false);
  const [isAddPlaceModalOpen, setIsAddPlaceModalOpen] = useState(false);
  const [isSubmittingPlace, setIsSubmittingPlace] = useState(false);
  const defaultPlaceForm = {
    name: '',
    categoryName: 'Danh Lam & Thắng Cảnh',
    city: 'Đà Lạt',
    address: '',
    latitude: '',
    longitude: '',
    phoneNumber: '',
    openHours: '07:00 - 22:00',
    priceRange: 'Miễn phí tham quan',
    ticketPrice: '',
    amenities: ['Wifi miễn phí', 'Bãi đỗ xe ô tô'],
    coverImageUrl: '',
    description: ''
  };
  const [newPlaceForm, setNewPlaceForm] = useState(defaultPlaceForm);

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

  const regions = ['Tất cả', 'Miền Bắc', 'Miền Trung', 'Miền Nam', 'Tây Nguyên'];

  // Categories adapt to currently selected layer
  // Chuỗi chip phải ĐÚNG categoryName trong CSDL (bấm mới có kết quả):
  // Núi Rừng & Mây Ngàn (496), Di Sản & Phố Cổ (42), Biển Đảo & Nghỉ Dưỡng (13),
  // Danh Lam & Thắng Cảnh (7), Quán Cafe & Săn Mây (1).
  const currentCategories = useMemo(() => {
    if (exploreLayer === 'spots') {
      return [
        'Tất cả',
        'Núi Rừng & Mây Ngàn',
        'Di Sản & Phố Cổ',
        'Biển Đảo & Nghỉ Dưỡng',
        'Danh Lam & Thắng Cảnh',
        'Quán Cafe & Săn Mây'
      ];
    }
    return [
      'Tất cả',
      'Núi Rừng & Mây Ngàn',
      'Biển Đảo & Nghỉ Dưỡng',
      'Di Sản & Phố Cổ',
      'Thành Thị & Văn Hóa'
    ];
  }, [exploreLayer]);

  // Determine Region by City / Province name (Chuẩn hóa 63 tỉnh thành Việt Nam)
  const getRegionByCity = (cityName = '') => {
    const c = String(cityName).toLowerCase().trim();
    if (!c) return 'Khác';

    // Miền Bắc (Đông Bắc, Tây Bắc & Đồng bằng sông Hồng)
    if (
      c.includes('hà nội') || c.includes('hải phòng') || c.includes('quảng ninh') ||
      c.includes('hạ long') || c.includes('ninh bình') || c.includes('hà giang') ||
      c.includes('lào cai') || c.includes('sa pa') || c.includes('sapa') ||
      c.includes('cao bằng') || c.includes('lạng sơn') || c.includes('bắc kạn') ||
      c.includes('tuyên quang') || c.includes('thái nguyên') || c.includes('phú thọ') ||
      c.includes('bắc giang') || c.includes('bắc ninh') || c.includes('hải dương') ||
      c.includes('hưng yên') || c.includes('hà nam') || c.includes('nam định') ||
      c.includes('thái bình') || c.includes('vĩnh phúc') || c.includes('sơn la') ||
      c.includes('mộc châu') || c.includes('hòa bình') || c.includes('điện biên') ||
      c.includes('lai châu') || c.includes('yên bái')
    ) {
      return 'Miền Bắc';
    }

    // Tây Nguyên (5 tỉnh Cao nguyên)
    if (
      c.includes('đà lạt') || c.includes('lâm đồng') || c.includes('đắk lắk') ||
      c.includes('dak lak') || c.includes('buôn ma thuột') || c.includes('gia lai') ||
      c.includes('pleiku') || c.includes('kon tum') || c.includes('măng đen') ||
      c.includes('đắk nông') || c.includes('bảo lộc')
    ) {
      return 'Tây Nguyên';
    }

    // Miền Trung (Bắc Trung Bộ & Duyên hải Nam Trung Bộ)
    if (
      c.includes('thanh hóa') || c.includes('sầm sơn') || c.includes('nghệ an') ||
      c.includes('hà tĩnh') || c.includes('quảng bình') || c.includes('phong nha') ||
      c.includes('quảng trị') || c.includes('thừa thiên') || c.includes('huế') ||
      c.includes('đà nẵng') || c.includes('quảng nam') || c.includes('hội an') ||
      c.includes('quảng ngãi') || c.includes('bình định') || c.includes('quy nhơn') ||
      c.includes('phú yên') || c.includes('tuy hòa') || c.includes('khánh hòa') ||
      c.includes('nha trang') || c.includes('ninh thuận') || c.includes('phan rang') ||
      c.includes('bình thuận') || c.includes('phan thiết') || c.includes('mũi né')
    ) {
      return 'Miền Trung';
    }

    // Miền Nam (Đông Nam Bộ & Đồng bằng sông Cửu Long)
    if (
      c.includes('hồ chí minh') || c.includes('sài gòn') || c.includes('tphcm') ||
      c.includes('bà rịa') || c.includes('vũng tàu') || c.includes('bình dương') ||
      c.includes('bình phước') || c.includes('đồng nai') || c.includes('tây ninh') ||
      c.includes('an giang') || c.includes('bạc liêu') || c.includes('bến tre') ||
      c.includes('cà mau') || c.includes('cần thơ') || c.includes('đồng tháp') ||
      c.includes('hậu giang') || c.includes('kiên giang') || c.includes('phú quốc') ||
      c.includes('long an') || c.includes('sóc trăng') || c.includes('tiền giang') ||
      c.includes('trà vinh') || c.includes('vĩnh long')
    ) {
      return 'Miền Nam';
    }

    return 'Miền Trung';
  };

  // Haversine Distance in Km
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
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

  // Live Location Trigger
  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ định vị GPS');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setIsLocating(false);
        setSortBy('nearest');
      },
      (err) => {
        setIsLocating(false);
        toast.error('Không thể lấy vị trí: ' + err.message);
      },
      { timeout: 10000 }
    );
  };

  // Listen for navigation events and URL params for layer switching (e.g. ?layer=saved)
  useEffect(() => {
    const handleCustomLayerSwitch = (e) => {
      if (e.detail) {
        setExploreLayer(e.detail);
        setSelectedCategory('Tất cả');
      }
    };
    window.addEventListener('wayfare-switch-explore-layer', handleCustomLayerSwitch);

    try {
      const params = new URLSearchParams(window.location.search);
      const layer = params.get('layer') || params.get('tab');
      if (layer === 'saved') {
        setExploreLayer('saved');
      } else if (layer === 'destinations') {
        setExploreLayer('destinations');
      }
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener('wayfare-switch-explore-layer', handleCustomLayerSwitch);
    };
  }, []);

  // Toggle Save Wishlist (persists into localStorage & syncs across app)
  // Icon tim tự cập nhật ngay trên card -> không cần toast
  const handleToggleSave = (item, e) => {
    e?.stopPropagation();
    toggleSavePlace(item);
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

  // Open Google Maps
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

  // Launch AI Planner with Item
  const handlePlanWithAI = (item, e) => {
    e?.stopPropagation();
    if (openAIGeneratorWithItem) {
      openAIGeneratorWithItem(item);
    } else {
      setIsAIGeneratorOpen(true);
    }
  };

  // Smart Transition: Explore Spots in a specific City (from Destination Card)
  const handleExploreSpotsAtCity = (cityName) => {
    setExploreLayer('spots');
    setSearchQuery(cityName);
    setSelectedCategory('Tất cả');
  };

  // Load reviews when detailModalItem opens
  useEffect(() => {
    if (detailModalItem?.rawId) {
      setIsReviewsLoading(true);
      reviewApi.getReviews(detailModalItem.rawId)
        .then(res => setPlaceReviews(res || []))
        .catch(err => {
          console.warn('Could not load reviews:', err);
          setPlaceReviews([]);
        })
        .finally(() => setIsReviewsLoading(false));
    } else {
      setPlaceReviews([]);
    }
  }, [detailModalItem]);

  // Submit Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!detailModalItem?.rawId) return;
    if (!reviewComment.trim()) {
      toast.warn('Vui lòng viết đôi lời nhận xét về địa điểm này!');
      return;
    }
    setIsSubmittingReview(true);
    try {
      const created = await reviewApi.addReview(
        detailModalItem.rawId,
        { rating: reviewRating, comment: reviewComment.trim() },
        currentUser?.email
      );
      toast.success('Gửi đánh giá thành công! Cảm ơn đóng góp của bạn. ⭐');
      setPlaceReviews(prev => [created, ...prev]);
      setReviewComment('');
      setReviewRating(5);
    } catch (err) {
      toast.error('Lỗi gửi đánh giá: ' + err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Add Place to Existing Itinerary — GHI VÀO DB THẬT (POST /itineraries/{id}/details)
  const handleAddToTrip = async (payload) => {
    const targetItem = detailModalItem || activeItem;
    if (!payload || !targetItem) return;

    const itin = payload.itinerary || payload;
    const dayNumber = Number(payload.dayNumber) || Number(itin.daysCount) || 1;
    const startTime = payload.startTime || '09:00:00';
    const timeSlotLabel = payload.timeSlotLabel || '09:00';
    const activityCategory = payload.category || targetItem.category || 'Khám phá';
    const cost = payload.estimatedCost !== undefined ? Number(payload.estimatedCost) : (Number(targetItem.ticketPrice) || null);
    const noteText = payload.note || (targetItem.tagline || targetItem.description || '').slice(0, 500);

    // Cần đăng nhập — lịch trình chỉnh sửa chạy qua server
    if (!currentUser?.email || /^itin-|^-/.test(String(itin.id))) {
      toast.info('Vui lòng đăng nhập bằng tài khoản có lịch trình trên hệ thống để thêm điểm dừng nhé!');
      setIsAddToTripModalOpen(false);
      return;
    }

    const currentDayActivities = (itin.days || []).find(d => Number(d.dayNumber) === dayNumber)?.activities ||
      (Array.isArray(itin.details) ? itin.details.filter(d => Number(d.dayNumber) === dayNumber) : []);
    const visitOrder = currentDayActivities.length + 1;

    const detail = {
      placeId: Number(targetItem.rawId || targetItem.id) || null,
      locationName: targetItem.name,
      locationAddress: targetItem.address || `${targetItem.city}, Việt Nam`,
      category: activityCategory,
      dayNumber,
      visitOrder,
      startTime,
      estimatedCost: cost,
      note: noteText
    };

    try {
      await addPlaceToItinerary(itin.id, detail, currentUser.email);
      toast.success(
        <div>
          <p className="font-bold">Đã thêm vào lịch trình thành công! 🚀</p>
          <p className="text-xs text-slate-100 mt-0.5">
            "{targetItem.name}" • Ngày {dayNumber} ({timeSlotLabel}) của chuyến đi "{itin.title}"
          </p>
        </div>
      );
    } catch (err) {
      toast.error('Lỗi khi thêm vào lịch trình: ' + err.message);
    } finally {
      setIsAddToTripModalOpen(false);
    }
  };

  // Submit New Place Form (100% Pending Approval Moderation)
  const handleAddPlaceSubmit = async (e) => {
    e.preventDefault();
    if (!newPlaceForm.name.trim()) {
      toast.error('Vui lòng nhập tên địa điểm!');
      return;
    }
    const trimmedAddress = newPlaceForm.address.trim();
    if (!trimmedAddress) {
      toast.error('Vui lòng nhập địa chỉ cụ thể của địa điểm!');
      return;
    }
    const hasDelimiter = trimmedAddress.includes('-') || trimmedAddress.includes(',') || trimmedAddress.includes('/');
    const hasAdminLevel = /quận|huyện|phường|xã|thị xã|tp|thành phố/i.test(trimmedAddress);
    if (!hasDelimiter && !hasAdminLevel && trimmedAddress.length < 16) {
      toast.warning('⚠️ Địa chỉ chưa đủ cụ thể! Không được chỉ ghi tên đường cộc lốc như "202 Chương Dương". Vui lòng ghi đầy đủ: Số nhà/Đường - Phường/Quận/Huyện - Tỉnh/Thành phố (Ví dụ: 202 Chương Dương - Sơn Trà - Đà Nẵng).');
      return;
    }
    setIsSubmittingPlace(true);
    try {
      const payload = {
        name: newPlaceForm.name.trim(),
        categoryName: newPlaceForm.categoryName,
        city: newPlaceForm.city ? newPlaceForm.city.trim() : 'Đà Lạt',
        address: newPlaceForm.address.trim(),
        latitude: newPlaceForm.latitude ? parseFloat(newPlaceForm.latitude) : null,
        longitude: newPlaceForm.longitude ? parseFloat(newPlaceForm.longitude) : null,
        phoneNumber: newPlaceForm.phoneNumber ? newPlaceForm.phoneNumber.trim() : '',
        openHours: newPlaceForm.openHours || '07:00 - 22:00',
        priceRange: newPlaceForm.priceRange || 'Miễn phí tham quan',
        ticketPrice: newPlaceForm.ticketPrice ? parseFloat(newPlaceForm.ticketPrice) : 0,
        amenities: newPlaceForm.amenities.join(', '),
        coverImageUrl: newPlaceForm.coverImageUrl.trim() || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        description: newPlaceForm.description.trim()
      };

      const created = await addNewPlace(payload);
      if (created.status === 'ACTIVE') {
        toast.success(`🎉 Tuyệt vời! Địa điểm "${created.name}" đã được AI thẩm định thành công và hiển thị ngay trên hệ thống!`);
      } else {
        toast.info(`📍 Địa điểm "${created.name}" đã được chuyển tới Ban Quản Trị để thẩm định thêm: ${created.aiModerationNote || 'Chờ duyệt'}`);
      }
      setIsAddPlaceModalOpen(false);
      setNewPlaceForm(defaultPlaceForm);
    } catch (err) {
      toast.error('Lỗi khi gửi duyệt địa điểm: ' + err.message);
    } finally {
      setIsSubmittingPlace(false);
    }
  };

  // Unified items list based on active tab
  const spotSource = remotePool !== null ? remotePool : (places || []);
  const unifiedItems = useMemo(() => {
    if (exploreLayer === 'spots') {
      // Khi đang tìm kiếm / lọc tỉnh: dùng kết quả TRUY VẤN SERVER (toàn bộ 565),
      // còn không thì dùng pool tải dần theo trang như thường lệ.
      return spotSource.map(p => ({
        ...mapApiSpot(p),
        region: getRegionByCity(p.city),
      })).filter(Boolean);
    }

    // Saved Wishlist Items
    if (exploreLayer === 'saved') {
      return (savedPlaces || []).map((p, idx) => ({
        ...p,
        id: p.id ? String(p.id) : `saved-${idx}`,
        rawId: p.rawId || p.id || idx,
        isLocalSpot: p.isLocalSpot !== undefined ? p.isLocalSpot : true,
        region: p.region || getRegionByCity(p.name || p.city),
        image: resolvePlaceImage({ ...p, id: p.rawId || idx }),
        category: p.categoryName || p.category || 'Tọa độ yêu thích',
        rating: p.averageRating || p.rating || null,
        reviewsCount: p.reviewCount || p.reviewsCount || 0,
        amenities: p.specialties || (typeof p.amenities === 'string' ? p.amenities.split(',').map(s => s.trim()) : p.amenities) || []
      }));
    }

    // Destinations
    return (destinations || []).map((d, index) => ({
      ...d,
      id: d.id ? `dest-${d.id}` : `dest-${index}`,
      isLocalSpot: false,
      rawId: d.id || index,
      region: d.region || getRegionByCity(d.name || d.city),
      latitude: d.latitude || d.coordinates?.lat,
      longitude: d.longitude || d.coordinates?.lng,
      image: resolvePlaceImage({ ...d, id: d.id || index }),
      category: d.categoryName || d.category || 'Điểm đến',
      rating: d.averageRating || d.rating || null,
      reviewsCount: d.reviewCount || d.reviewsCount || 0,
      amenities: d.specialties || (typeof d.amenities === 'string' ? d.amenities.split(',').map(s => s.trim()) : d.amenities) || []
    }));
  }, [exploreLayer, places, destinations, savedPlaces, remotePool]);

  // Thống kê THẬT từ dữ liệu đang có (places đã lưu + pool truy vấn server)
  const provincesCount = useMemo(
    () => new Set(
      (remotePool !== null ? remotePool : (places || []))
        .map(p => p.city)
        .filter(Boolean)
    ).size,
    [places, remotePool]
  );

  // Danh sách tỉnh thành THẬT từ dữ liệu đã tải (xếp theo số lượng địa điểm)
  const cityOptions = useMemo(() => {
    const counts = new Map();
    (places || []).forEach(p => {
      const c = p.city;
      if (c) counts.set(c, (counts.get(c) || 0) + 1);
    });
    return [
      'Tất cả',
      ...[...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(e => e[0])
    ];
  }, [places]);

  // Filter & Sort Items
  const filteredItems = useMemo(() => {
    return unifiedItems
      .filter(item => {
        // Search Query - Không phân biệt dấu tiếng Việt
        const rawQ = searchQuery.toLowerCase().trim();
        const cleanQ = removeVietnameseTones(searchQuery);

        const cleanName = removeVietnameseTones(item.name);
        const cleanCity = removeVietnameseTones(item.city);
        const cleanTagline = removeVietnameseTones(item.tagline || item.description);
        const cleanCategory = removeVietnameseTones(item.category);
        const cleanAddress = removeVietnameseTones(item.address);

        const matchesSearch =
          !rawQ ||
          cleanName.includes(cleanQ) ||
          cleanCity.includes(cleanQ) ||
          cleanTagline.includes(cleanQ) ||
          cleanCategory.includes(cleanQ) ||
          cleanAddress.includes(cleanQ) ||
          item.name.toLowerCase().includes(rawQ);

        // Region
        const matchesRegion =
          selectedRegion === 'Tất cả' ||
          item.region === selectedRegion ||
          item.city?.toLowerCase().includes(selectedRegion.toLowerCase());

        // Category
        const matchesCategory =
          selectedCategory === 'Tất cả' ||
          item.category?.toLowerCase().includes(selectedCategory.toLowerCase());

        // Budget (Khoảng giá dự kiến)
        if (!matchBudget(parsePriceVND(item), selectedBudget)) return false;

        return matchesSearch && matchesRegion && matchesCategory;
      })
      .map(item => {
        // Dynamic Distance Calculation
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
  }, [unifiedItems, searchQuery, selectedRegion, selectedCategory, selectedBudget, sortBy, userCoords]);

  // Reset page when any filter criteria changes
  useEffect(() => {
    setCurrentPage(1);
  }, [exploreLayer, searchQuery, selectedCategory, selectedRegion, selectedBudget, sortBy]);

  // Pagination Calculations
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  // Thời tiết THẬT theo toạ độ GPS cho các card trên trang hiện tại
  // (open-meteo nhận list toạ độ -> chỉ 1 HTTP request cho cả trang)
  useEffect(() => {
    if (exploreLayer !== 'spots') return;
    const points = paginatedItems
      .filter(it => it.isLocalSpot && it.latitude && it.longitude)
      .map(it => ({ lat: it.latitude, lng: it.longitude }));
    if (!points.length) return;
    let alive = true;
    fetchLiveWeatherBatch(points).then(res => {
      if (alive && res && Object.keys(res).length) {
        setWeatherByPoint(prev => ({ ...prev, ...res }));
      }
    });
    return () => { alive = false; };
  }, [paginatedItems, exploreLayer]);

  const generatePageNumbers = (current, total) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 pb-1 border-t border-ink-200/70 mt-5">
        <p className="text-[11px] text-ink-400 font-medium">
          Hiển thị <strong className="text-ink-800 font-bold">{(currentPage - 1) * itemsPerPage + 1}</strong> - <strong className="text-ink-800 font-bold">{Math.min(currentPage * itemsPerPage, filteredItems.length)}</strong> trong số <strong className="text-ink-800 font-bold">{filteredItems.length}</strong> {exploreLayer === 'spots' ? 'tọa độ' : 'điểm đến'}
        </p>

        <div className="flex items-center gap-1 flex-wrap justify-center">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => {
              setCurrentPage((p) => Math.max(p - 1, 1));
              window.scrollTo({ top: 120, behavior: 'smooth' });
            }}
            className="h-8 px-2 sm:px-3 rounded-[5px] border border-ink-200 bg-[#FFFDF8] hover:bg-clay-50 hover:border-clay-300 text-[11px] font-bold text-ink-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Trước</span>
          </button>

          {generatePageNumbers(currentPage, totalPages).map((p, idx) => (
            typeof p === 'number' ? (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCurrentPage(p);
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                className={`min-w-[30px] h-8 px-1.5 rounded-[5px] text-[11px] font-bold transition-colors cursor-pointer flex items-center justify-center border ${
                  currentPage === p
                    ? 'bg-clay-600 text-[#FFFDF8] border-clay-600'
                    : 'bg-[#FFFDF8] hover:bg-clay-50 text-ink-600 border-ink-200 hover:border-clay-300'
                }`}
              >
                {p}
              </button>
            ) : (
              <span key={idx} className="px-1 text-ink-300 text-xs select-none">...</span>
            )
          ))}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => {
              setCurrentPage((p) => Math.min(p + 1, totalPages));
              window.scrollTo({ top: 120, behavior: 'smooth' });
            }}
            className="h-8 px-2 sm:px-3 rounded-[5px] border border-ink-200 bg-[#FFFDF8] hover:bg-clay-50 hover:border-clay-300 text-[11px] font-bold text-ink-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 transition-colors"
          >
            <span className="hidden sm:inline">Sau</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  // Set default activeItem
  useEffect(() => {
    if (!activeItem && filteredItems.length > 0) {
      setActiveItem(filteredItems[0]);
    }
  }, [filteredItems, activeItem]);

  // Smooth scroll into view when marker on map is clicked
  useEffect(() => {
    if (activeItem?.id && viewMode === 'split') {
      const cardEl = document.getElementById(`explore-card-${activeItem.id}`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeItem?.id, viewMode]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedRegion !== 'Tất cả') count++;
    if (selectedBudget !== 'all') count++;
    if (sortBy !== 'popular') count++;
    return count;
  }, [selectedRegion, selectedBudget, sortBy]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Tất cả');
    setSelectedRegion('Tất cả');
    setSelectedCity('Tất cả');
    setSelectedBudget('all');
    setSortBy('popular');
  };

  // Quick City & Weather Filter
  const handleQuickFilterCity = (cityName) => {
    setSearchQuery(cityName);
    setSelectedCategory('Tất cả');
  };

  return (
    <div className="explore-page w-full min-h-screen bg-[#F8F4EC] text-ink-800 pb-14">
      <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-6 sm:pt-8 space-y-5">
      
      {/* 1. COMPACT DISCOVERY HEADER */}
      <ExploreHeader
        placesCount={placesTotal || places.length}
        provincesCount={provincesCount}
        destinationsCount={destinations.length}
        userCoords={userCoords}
        isLocating={isLocating}
        onGetLiveLocation={handleGetLiveLocation}
        onOpenAddPlaceModal={() => setIsAddPlaceModalOpen(true)}
        onOpenAIGenerator={() => setIsAIGeneratorOpen(true)}
        onQuickFilterCity={handleQuickFilterCity}
      />

      {/* 2. DUAL-LAYER FILTER & SEARCH TOOLBAR */}
      <ExploreFilterBar
        exploreLayer={exploreLayer}
        setExploreLayer={setExploreLayer}
        placesCount={placesTotal || places.length}
        destinationsCount={destinations.length}
        savedCount={savedPlaces.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categories={currentCategories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenFilterDrawer={() => setIsFilterDrawerOpen(true)}
        activeFilterCount={activeFilterCount}
        onResetFilters={handleResetFilters}
      />

      {/* 3. FILTER RESULTS META BAR */}
      <div className="flex items-center justify-between gap-3 text-[11px] text-ink-400 font-medium px-0.5">
        <span>
          <strong className="text-ink-800 font-bold">{filteredItems.length}</strong>{' '}
          {exploreLayer === 'spots' ? 'địa điểm du lịch' : 'tỉnh thành & điểm đến'}
          {searchQuery && ` cho từ khóa "${searchQuery}"`}
          {selectedRegion !== 'Tất cả' && ` tại ${selectedRegion}`}
        </span>

        {(searchQuery || selectedCategory !== 'Tất cả' || activeFilterCount > 0) && (
          <button
            onClick={handleResetFilters}
            className="text-clay-700 hover:text-clay-800 font-bold hover:underline transition-colors cursor-pointer shrink-0"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* 3.1 SERVER SEARCH / LOAD-MORE STATUS */}
      {exploreLayer === 'spots' && remotePool !== null && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-[5px] border border-ink-200 bg-[#FFFDF8] px-4 py-3">
          <span className="text-[11px] sm:text-xs text-ink-400 text-center sm:text-left">
            {isRemoteSearching && !remotePool.length ? 'Đang tìm trên server...' : (
              <>
                Tìm thấy <strong className="text-ink-800 font-bold">{remotePool.length}</strong> địa điểm trên toàn bộ hệ thống.
                {!remotePool.length && ' Không có kết quả phù hợp — thử từ khoá khác.'}
              </>
            )}
          </span>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCity('Tất cả'); }}
            className="shrink-0 h-8 rounded-[5px] border border-ink-200 bg-[#F8F4EC] px-3.5 text-[11px] font-bold text-ink-700 transition-colors hover:border-clay-400 hover:text-clay-700 cursor-pointer"
          >
            Nhìn lại toàn bộ địa điểm
          </button>
        </div>
      )}
      {exploreLayer === 'spots' && remotePool === null && hasMorePlaces && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-[5px] border border-ink-200 bg-[#FFFDF8] px-4 py-3">
          <span className="text-[11px] sm:text-xs text-ink-400 text-center sm:text-left">
            Đang hiển thị <strong className="text-ink-800 font-bold">{places.length}</strong> / {placesTotal} địa điểm.
          </span>
          <button
            onClick={loadMorePlaces}
            disabled={loadingMorePlaces}
            className="shrink-0 inline-flex items-center justify-center gap-2 h-8 rounded-[5px] bg-clay-600 px-4 text-[11px] font-bold text-[#FFFDF8] border border-clay-600 transition-colors hover:bg-clay-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {loadingMorePlaces ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Đang tải...
              </>
            ) : (
              'Tải thêm địa điểm'
            )}
          </button>
        </div>
      )}

      {/* 4. MAIN CONTENT VIEW DISPLAY */}
      {/* ─── A. SPLIT VIEW (Cards Left + Interactive Map Right) ─── */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[650px]">
          
          {/* Left Column: Scrollable Cards */}
          <div className="lg:col-span-6 space-y-4 max-h-[760px] overflow-y-auto pr-1.5 sidebar-scrollbar">
            {filteredItems.length === 0 ? (
              <div className="bg-[#FFFDF8] p-10 rounded-[6px] text-center space-y-3 border border-ink-200">
                <Compass className="w-10 h-10 text-ink-300 mx-auto" />
                <h3 className="font-bold text-base text-ink-800">Không tìm thấy địa điểm phù hợp</h3>
                <p className="text-xs text-ink-400 max-w-sm mx-auto leading-relaxed">
                  Hãy thử đổi từ khóa tìm kiếm hoặc đăng một tọa độ mới để cộng đồng cùng khám phá.
                </p>
                <button
                  onClick={() => setIsAddPlaceModalOpen(true)}
                  className="px-5 h-9 bg-clay-600 hover:bg-clay-700 text-[#FFFDF8] rounded-[5px] text-xs font-bold transition-colors cursor-pointer"
                >
                  Đăng địa điểm mới
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                    {paginatedItems.map(item => {
                      if (exploreLayer === 'destinations') {
                        return (
                          <ExploreDestinationCard
                            key={item.id}
                            destination={item}
                            onExploreSpotsAtCity={handleExploreSpotsAtCity}
                            onOpenAIGenerator={(dest) => openAIGeneratorWithItem ? openAIGeneratorWithItem(dest) : setIsAIGeneratorOpen(true)}
                          />
                        );
                      }
                      return (
                        <ExploreSpotCard
                          key={item.id}
                          item={item}
                          isActive={activeItem?.id === item.id}
                          isSaved={isPlaceSaved(item.id)}
                          liveWeather={weatherByPoint[`${Number(item.latitude).toFixed(2)},${Number(item.longitude).toFixed(2)}`]}
                          onSelect={setActiveItem}
                          onToggleSave={handleToggleSave}
                          onOpenDetail={setDetailModalItem}
                          onAddToTrip={(place) => {
                            setActiveItem(place);
                            setIsAddToTripModalOpen(true);
                          }}
                        />
                      );
                    })}
                  </div>
                  {renderPagination()}
                </>
              )}
            </div>

            {/* Right Column: Interactive Real Map */}
            <div className="lg:col-span-6 sticky top-24 h-[550px] sm:h-[650px] lg:h-[760px] rounded-[6px] overflow-hidden border border-ink-200 bg-[#FFFDF8]">
              <RealMapView
                items={filteredItems}
                activeItem={activeItem}
                setActiveItem={setActiveItem}
                setDetailModalItem={setDetailModalItem}
                userCoords={userCoords}
                mapStyle={mapStyle}
                setMapStyle={setMapStyle}
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        {/* ─── B. GRID VIEW (All Cards Grid) ─── */}
        {viewMode === 'grid' && (
          <div>
            {filteredItems.length === 0 ? (
              <div className="bg-[#FFFDF8] p-10 sm:p-12 rounded-[6px] text-center space-y-3 border border-ink-200">
                <Compass className="w-10 h-10 text-ink-300 mx-auto" />
                <h3 className="font-bold text-base text-ink-800">Không tìm thấy địa điểm phù hợp</h3>
                <p className="text-xs text-ink-400 max-w-sm mx-auto leading-relaxed">
                  Thử đổi từ khóa, chọn tỉnh thành khác hoặc đặt lại bộ lọc.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 h-9 bg-clay-600 hover:bg-clay-700 text-[#FFFDF8] rounded-[5px] text-xs font-bold transition-colors cursor-pointer"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {paginatedItems.map(item => {
                    if (exploreLayer === 'destinations') {
                      return (
                        <ExploreDestinationCard
                          key={item.id}
                          destination={item}
                          onExploreSpotsAtCity={handleExploreSpotsAtCity}
                          onOpenAIGenerator={(dest) => openAIGeneratorWithItem ? openAIGeneratorWithItem(dest) : setIsAIGeneratorOpen(true)}
                        />
                      );
                    }
                    return (
                      <ExploreSpotCard
                        key={item.id}
                        item={item}
                        isActive={activeItem?.id === item.id}
                        isSaved={isPlaceSaved(item.id)}
                        liveWeather={weatherByPoint[`${Number(item.latitude).toFixed(2)},${Number(item.longitude).toFixed(2)}`]}
                        onSelect={setActiveItem}
                        onToggleSave={handleToggleSave}
                        onOpenDetail={setDetailModalItem}
                        onAddToTrip={(place) => {
                          setActiveItem(place);
                          setIsAddToTripModalOpen(true);
                        }}
                      />
                    );
                  })}
                </div>
                {renderPagination()}
              </>
            )}
          </div>
        )}

      {/* ─── C. FULL MAP VIEW ─── */}
      {viewMode === 'map' && (
        <div className="w-full h-[750px] rounded-[6px] overflow-hidden border border-ink-200 bg-[#FFFDF8]">
          <RealMapView
            items={filteredItems}
            activeItem={activeItem}
            setActiveItem={setActiveItem}
            setDetailModalItem={setDetailModalItem}
            userCoords={userCoords}
            mapStyle={mapStyle}
            setMapStyle={setMapStyle}
            className="w-full h-full"
          />
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          5. MODALS
      ────────────────────────────────────────────────────────────────────────── */}
      {/* Advanced Filter Drawer */}
      <ExploreFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        regions={regions}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        cities={cityOptions}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedBudget={selectedBudget}
        setSelectedBudget={setSelectedBudget}
        userCoords={userCoords}
        onResetFilters={handleResetFilters}
      />

      {/* Place Detail Modal */}
      {detailModalItem && (
        <PlaceDetailModal
          item={detailModalItem}
          onClose={() => setDetailModalItem(null)}
          reviews={placeReviews}
          setReviews={setPlaceReviews}
          isReviewsLoading={isReviewsLoading}
          reviewRating={reviewRating}
          setReviewRating={setReviewRating}
          reviewComment={reviewComment}
          setReviewComment={setReviewComment}
          isSubmittingReview={isSubmittingReview}
          onSubmitReview={handleSubmitReview}
          onOpenGoogleMaps={handleOpenGoogleMaps}
          onCopyGPS={handleCopyGPS}
          onAddToTrip={(place) => {
            setActiveItem(place);
            setIsAddToTripModalOpen(true);
          }}
          onPlanWithAI={(place, e) => {
            handlePlanWithAI(place, e);
            setDetailModalItem(null);
          }}
        />
      )}

      {/* Add Place Contribution Modal */}
      <AddPlaceModal
        isOpen={isAddPlaceModalOpen}
        onClose={() => setIsAddPlaceModalOpen(false)}
        newPlaceForm={newPlaceForm}
        setNewPlaceForm={setNewPlaceForm}
        availableAmenityOptions={availableAmenityOptions}
        suggestedCoverImages={suggestedCoverImages}
        onGetLocationForForm={() => {
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
        }}
        toggleAmenity={(amenity) => {
          setNewPlaceForm(prev => {
            const exists = prev.amenities.includes(amenity);
            return {
              ...prev,
              amenities: exists
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
            };
          });
        }}
        onSubmit={handleAddPlaceSubmit}
        isSubmitting={isSubmittingPlace}
      />

      {/* Add To Trip Modal */}
      <AddToTripModal
        isOpen={isAddToTripModalOpen}
        onClose={() => setIsAddToTripModalOpen(false)}
        item={detailModalItem || activeItem}
        itineraries={itineraries}
        onAddToTrip={handleAddToTrip}
        onCreateNewTripWithItem={() => {
          const item = detailModalItem || activeItem;
          setIsAddToTripModalOpen(false);
          setDetailModalItem(null);
          if (openAIGeneratorWithItem) {
            openAIGeneratorWithItem(item);
          } else {
            setIsAIGeneratorOpen(true);
          }
        }}
      />
      </div>
    </div>
  );
};

export default ExplorePage;
