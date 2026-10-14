import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../components/common/Toast';
import { RealMapView } from '../../../components/map/RealMapView';
import { reviewApi } from '../../../services/api';
import { Compass, Sparkles } from 'lucide-react';

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

export const ExplorePage = () => {
  const {
    destinations = [],
    places = [],
    addNewPlace,
    setIsAIGeneratorOpen,
    openAIGeneratorWithItem,
    currentUser,
    itineraries = [],
    setItineraries = () => {},
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
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'rating' | 'nearest'
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

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

  // 8. Modals
  const [isAddToTripModalOpen, setIsAddToTripModalOpen] = useState(false);
  const [isAddPlaceModalOpen, setIsAddPlaceModalOpen] = useState(false);
  const [isSubmittingPlace, setIsSubmittingPlace] = useState(false);
  const [placeTypeTab, setPlaceTypeTab] = useState('spot');
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

  const regions = ['Tất cả', 'Miền Bắc', 'Miền Trung', 'Miền Nam', 'Tây Nguyên'];

  // Categories adapt to currently selected layer
  const currentCategories = useMemo(() => {
    if (exploreLayer === 'spots') {
      return [
        'Tất cả',
        'Quán Cafe & Săn Mây',
        'Homestay & Nghỉ Dưỡng',
        'Ẩm Thực & Đặc Sản',
        'Trải Nghiệm & Hoạt Động',
        'Danh Lam & Thắng Cảnh'
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
    toast.info('Đang bật radar định vị GPS quanh bạn... 🛰️');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setIsLocating(false);
        setSortBy('nearest');
        toast.success('Đã xác định vị trí! Tự động sắp xếp các điểm gần bạn nhất 📍');
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
  const handleToggleSave = (item, e) => {
    e?.stopPropagation();
    const isSavedNow = toggleSavePlace(item);
    if (isSavedNow) {
      toast.success(
        <div>
          <p className="font-bold">Đã lưu "{item.name}"! ❤️</p>
          <p className="text-[11px] text-slate-200 font-normal mt-0.5">
            Xem tại tab <b>"Địa điểm đã lưu"</b> hoặc trong Trang cá nhân.
          </p>
        </div>,
        { duration: 4000 }
      );
    } else {
      toast.info(`Đã gỡ "${item.name}" khỏi danh sách yêu thích.`);
    }
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
    toast.success(`Đã kết nối AI Travel Planner với "${item.name}"! ✨`);
  };

  // Smart Transition: Explore Spots in a specific City (from Destination Card)
  const handleExploreSpotsAtCity = (cityName) => {
    setExploreLayer('spots');
    setSearchQuery(cityName);
    setSelectedCategory('Tất cả');
    toast.info(`Đang hiển thị các tọa độ quán xá & lưu trú tại ${cityName} 📍`);
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

  // Add Place to Existing Itinerary
  const handleAddToTrip = (itin) => {
    const targetItem = detailModalItem || activeItem;
    if (!itin || !targetItem) return;
    const newActivity = {
      time: '14:30 – 16:30',
      category: targetItem.category || 'Điểm tham quan',
      title: targetItem.name,
      location: targetItem.name,
      address: targetItem.address || `${targetItem.city}, Việt Nam`,
      note: targetItem.tagline || targetItem.description || 'Được thêm từ trang Khám phá.',
      cost: targetItem.priceEstimate || 'Miễn phí',
      image: targetItem.image
    };

    const updatedDays = (itin.days || []).map((day, idx) => {
      if (idx === 0) {
        return {
          ...day,
          activities: [...(day.activities || []), newActivity]
        };
      }
      return day;
    });

    const updatedItin = {
      ...itin,
      days: updatedDays,
      placesCount: (itin.placesCount || 0) + 1,
      placesList: [...(itin.placesList || []), targetItem.name]
    };

    setItineraries(prev => prev.map(item => item.id === itin.id ? updatedItin : item));
    toast.success(`Đã thêm "${targetItem.name}" vào lịch trình "${itin.title}"! 🚀`);
    setIsAddToTripModalOpen(false);
  };

  // Submit New Place Form
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
      toast.success(`Đã gửi yêu cầu đăng ký "${created.name}"! Vui lòng chờ Ban Quản Trị duyệt trước khi xuất hiện trên bản đồ 🎉`);
      setIsAddPlaceModalOpen(false);
      setExploreLayer('spots');
      setActiveItem(created);
    } catch (err) {
      toast.error('Lỗi khi đăng địa điểm: ' + err.message);
    } finally {
      setIsSubmittingPlace(false);
    }
  };

  // Unified items list based on active tab
  const unifiedItems = useMemo(() => {
    if (exploreLayer === 'spots') {
      return (places || []).map(p => ({
        id: `spot-${p.id}`,
        rawId: p.id,
        isLocalSpot: true,
        name: p.name,
        category: p.categoryName || 'Tọa độ bản địa',
        city: p.city || 'Việt Nam',
        region: getRegionByCity(p.city),
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
    }

    // Saved Wishlist Items
    if (exploreLayer === 'saved') {
      return (savedPlaces || []).map((p, idx) => ({
        ...p,
        id: p.id ? String(p.id) : `saved-${idx}`,
        rawId: p.rawId || p.id || idx,
        isLocalSpot: p.isLocalSpot !== undefined ? p.isLocalSpot : true,
        region: p.region || getRegionByCity(p.name || p.city),
        image: p.image || p.coverImageUrl || 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
        category: p.categoryName || p.category || 'Tọa độ yêu thích',
        rating: p.averageRating || p.rating || '4.9',
        reviewsCount: p.reviewCount || p.reviewsCount || 120,
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
      image: d.image || d.coverImageUrl || 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
      category: d.categoryName || d.category || 'Danh Lam & Thắng Cảnh',
      rating: d.averageRating || d.rating || '4.9',
      reviewsCount: d.reviewCount || d.reviewsCount || 88,
      amenities: d.specialties || (typeof d.amenities === 'string' ? d.amenities.split(',').map(s => s.trim()) : d.amenities) || []
    }));
  }, [exploreLayer, places, destinations, savedPlaces]);

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
  }, [unifiedItems, searchQuery, selectedRegion, selectedCategory, sortBy, userCoords]);

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
    setSelectedBudget('all');
    setSortBy('popular');
    toast.info('Đã đặt lại tất cả bộ lọc');
  };

  // Quick City & Weather Filter
  const handleQuickFilterCity = (cityName) => {
    setSearchQuery(cityName);
    setSelectedCategory('Tất cả');
    toast.info(`Đang hiển thị điểm đến & thời tiết tại ${cityName} 🌤️`);
  };

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 space-y-6">
      
      {/* 1. COMPACT DISCOVERY HEADER */}
      <ExploreHeader
        placesCount={places.length}
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
        placesCount={places.length}
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
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>
          Tìm thấy <strong className="text-slate-900 font-bold">{filteredItems.length}</strong>{' '}
          {exploreLayer === 'spots' ? 'tọa độ & cơ sở bản địa' : 'tỉnh thành & điểm đến'}
          {searchQuery && ` cho từ khóa "${searchQuery}"`}
          {selectedRegion !== 'Tất cả' && ` tại ${selectedRegion}`}
        </span>

        {(searchQuery || selectedCategory !== 'Tất cả' || activeFilterCount > 0) && (
          <button
            onClick={handleResetFilters}
            className="text-sky-600 hover:text-sky-700 font-bold hover:underline cursor-pointer"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* 4. MAIN CONTENT VIEW DISPLAY */}
      {/* ─── A. SPLIT VIEW (Cards Left + Interactive Map Right) ─── */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[650px]">
          
          {/* Left Column: Scrollable Cards */}
          <div className="lg:col-span-6 space-y-4 max-h-[820px] overflow-y-auto pr-1.5 sidebar-scrollbar">
            {filteredItems.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center space-y-3 border border-slate-200 shadow-xs">
                <Compass className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-base text-slate-900">Không tìm thấy địa điểm phù hợp</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Hãy thử đổi từ khóa tìm kiếm hoặc bấm "Đăng địa điểm" để chia sẻ tọa độ mới của bạn nhé!
                </p>
                <button
                  onClick={() => setIsAddPlaceModalOpen(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  + Đăng Tọa Độ Mới
                </button>
              </div>
            ) : (
              filteredItems.map(item => {
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
                    onSelect={setActiveItem}
                    onToggleSave={handleToggleSave}
                    onOpenDetail={setDetailModalItem}
                    onAddToTrip={(place) => {
                      setActiveItem(place);
                      setIsAddToTripModalOpen(true);
                    }}
                  />
                );
              })
            )}
          </div>

          {/* Right Column: Interactive Real Map */}
          <div className="lg:col-span-6 sticky top-24 h-[650px] lg:h-[820px] rounded-3xl overflow-hidden border border-slate-200/80 shadow-md">
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
            <div className="bg-white p-12 rounded-3xl text-center space-y-3 border border-slate-200 shadow-xs">
              <Compass className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base text-slate-900">Không tìm thấy địa điểm phù hợp</h3>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map(item => {
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
          )}
        </div>
      )}

      {/* ─── C. FULL MAP VIEW ─── */}
      {viewMode === 'map' && (
        <div className="w-full h-[750px] rounded-3xl overflow-hidden border border-slate-200/80 shadow-md">
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
        placeTypeTab={placeTypeTab}
        setPlaceTypeTab={setPlaceTypeTab}
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
  );
};

export default ExplorePage;
