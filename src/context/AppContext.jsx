import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { notificationApi, chatApi, userApi, placeApi, itineraryApi, authApi, savedPlaceApi, adminReviewApi, adminReportApi } from '../services/api';
import { mapApiSpot } from '../utils/placeMap';

const DEFAULT_APP_STATE = {
  portalMode: 'user',
  setPortalMode: () => {},
  userTab: 'home',
  setUserTab: () => {},
  adminTab: 'dashboard',
  setAdminTab: () => {},
  isAIGeneratorOpen: false,
  setIsAIGeneratorOpen: () => {},
  aiGeneratorInitialData: null,
  openAIGeneratorWithItem: () => {},
  isAuthModalOpen: false,
  setIsAuthModalOpen: () => {},
  authMode: 'login',
  setAuthMode: () => {},
  destinations: [],
  places: [],
  setPlaces: () => {},
  fetchPlaces: () => {},
  addNewPlace: () => {},
  posts: [],
  itineraries: [],
  pendingPlaces: [],
  users: [],
  reports: [],
  stats: {},
  currentUser: {
    id: null,
    name: 'Khách',
    fullName: 'Khách vãng lai',
    handle: '@guest',
    email: '',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    bio: '',
    destinationsCount: 0,
    tripsCount: 0,
    savedItinerariesCount: 0,
    roles: []
  },
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  login: () => {},
  logout: () => {},
  updateCurrentUser: () => {},
  toggleLikePost: () => {},
  addCommunityPost: () => {},
  generateAITrip: () => {},
  activeViewingItinerary: null,
  setActiveViewingItinerary: () => {},
  aiGeneratingStatus: { isGenerating: false, isExpanded: false, destination: '', daysCount: 3, progress: 0, currentStep: '', logs: [] },
  setAiGeneratingStatus: () => {},
  approvePlace: () => {},
  rejectPlace: () => {},
  resolveReport: () => {},
  toggleUserStatus: () => {},
  notifications: [],
  setNotifications: () => {},
  addNewNotification: () => {},
  unreadNotificationsCount: 0,
  unreadMessagesCount: 0,
  fetchUnreadMessages: () => {},
  isNotificationLiveBackend: false,
  markNotificationAsRead: () => {},
  markAllNotificationsAsRead: () => {},
  deleteNotification: () => {},
  addTestNotification: () => {},
  broadcastNotification: () => {},
  fetchNotifications: () => {}
};

export const AppContext = createContext(DEFAULT_APP_STATE);

export const AppProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation & Role State linked directly to Browser URL
  const portalMode = location.pathname.startsWith('/admin') ? 'admin' : 'user';

  const setPortalMode = (mode) => {
    if (mode === 'admin') {
      const userRoles = Array.isArray(currentUser?.roles) ? currentUser.roles : [];
      const isModOnly = userRoles.includes('ROLE_MODERATOR') && !userRoles.includes('ROLE_ADMIN');
      navigate(isModOnly ? '/admin/places' : '/admin/dashboard');
    } else {
      navigate('/');
    }
  };

  // User Tab dynamically derived from URL pathname
  const userTab = useMemo(() => {
    const p = location.pathname;
    if (p === '/' || p === '/home') return 'home';
    if (p.startsWith('/explore')) return 'explore';
    if (p.startsWith('/community')) return 'community';
    if (p.startsWith('/itineraries')) return 'itineraries';
    if (p.startsWith('/ai-planner')) return 'ai-planner';
    if (p.startsWith('/messages')) return 'messages';
    if (p.startsWith('/profile')) return 'profile';
    if (p.startsWith('/notifications')) return 'notifications';
    return 'home';
  }, [location.pathname]);

  const setUserTab = (tabId) => {
    const pathMap = {
      home: '/',
      explore: '/explore',
      community: '/community',
      itineraries: '/itineraries',
      'ai-planner': '/ai-planner',
      messages: '/messages',
      profile: '/profile',
      notifications: '/notifications'
    };
    navigate(pathMap[tabId] || '/');
  };

  // Admin Tab dynamically derived from URL pathname
  const adminTab = useMemo(() => {
    const p = location.pathname;
    if (p === '/admin' || p === '/admin/' || p.startsWith('/admin/dashboard')) return 'dashboard';
    if (p.startsWith('/admin/places')) return 'places';
    if (p.startsWith('/admin/users')) return 'users';
    if (p.startsWith('/admin/reports')) return 'reports';
    if (p.startsWith('/admin/reviews')) return 'reviews';
    if (p.startsWith('/admin/analytics')) return 'analytics';
    if (p.startsWith('/admin/audit-logs')) return 'audit-logs';
    return 'dashboard';
  }, [location.pathname]);

  const setAdminTab = (tabId) => {
    const pathMap = {
      dashboard: '/admin/dashboard',
      places: '/admin/places',
      reviews: '/admin/reviews',
      users: '/admin/users',
      reports: '/admin/reports',
      analytics: '/admin/analytics',
      'audit-logs': '/admin/audit-logs'
    };
    const userRoles = Array.isArray(currentUser?.roles) ? currentUser.roles : [];
    const isModOnly = userRoles.includes('ROLE_MODERATOR') && !userRoles.includes('ROLE_ADMIN');
    const target = pathMap[tabId] || (isModOnly ? '/admin/places' : '/admin/dashboard');
    navigate(target);
  };

  // AI & Auth Modal State
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [aiGeneratorInitialData, setAiGeneratorInitialData] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [activeViewingItinerary, setActiveViewingItinerary] = useState(null);
  const [aiGeneratingStatus, setAiGeneratingStatus] = useState({
    isGenerating: false,
    isExpanded: false,
    destination: '',
    daysCount: 3,
    progress: 0,
    currentStep: '',
    logs: []
  });

  const openAIGeneratorWithItem = (item) => {
    if (item) {
      const destText = item.city && !item.name.includes(item.city)
        ? `${item.name}, ${item.city}`
        : item.name;
      setAiGeneratorInitialData({
        destination: destText,
        item: item
      });
    } else {
      setAiGeneratorInitialData(null);
    }
    setIsAIGeneratorOpen(true);
  };

  // Data States (100% Database Driven - Single Source of Truth)
  const [destinations, setDestinations] = useState([]);
  const [posts, setPosts] = useState([]);
  const [itineraries, setItineraries] = useState(() => {
    try {
      const cached = sessionStorage.getItem('wayfare_my_itineraries_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [pendingPlaces, setPendingPlaces] = useState([]);
  const [places, setPlaces] = useState(() => {
    try {
      const cached = sessionStorage.getItem('wayfare_places_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  // Trạng thái phân trang phía server cho danh sách địa điểm
  const PLACES_PAGE_SIZE = 100;
  const [placesTotal, setPlacesTotal] = useState(0);
  const [hasMorePlaces, setHasMorePlaces] = useState(false);
  const [placesPage, setPlacesPage] = useState(0);
  const [loadingMorePlaces, setLoadingMorePlaces] = useState(false);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({});

  // Fetch places from backend database via RESTful API (SWR: Fast local hydration + background revalidation)
  const fetchPlaces = useCallback(async (filters = {}) => {
    try {
      const data = await placeApi.getPlaces(filters);
      if (Array.isArray(data)) {
        setPlaces(data);
        try {
          sessionStorage.setItem('wayfare_places_cache', JSON.stringify(data));
        } catch {
          // Ignore quota if any
        }
        // Synchronize distinct destination cities directly from database records
        const distinctCities = Array.from(new Set(data.map(p => p.city).filter(Boolean)));
        setDestinations(distinctCities.map(city => ({ name: city, destination: city })));
      }
    } catch {
      // Ignore background places fetch error
    }
  }, []);

  // Đồng bộ danh sách tỉnh thành từ dữ liệu địa điểm đang có
  const syncDestinationsFromPlaces = (items) => {
    const distinctCities = Array.from(new Set((items || []).map(p => p.city).filter(Boolean)));
    setDestinations(distinctCities.map(city => ({ name: city, destination: city })));
  };

  // Tải trang địa điểm đầu tiên (100 địa điểm) thay vì tải toàn bộ 565 địa điểm (~470KB)
  const fetchInitialPlaces = useCallback(async () => {
    try {
      const result = await placeApi.getPlacesPaged({ page: 0, size: PLACES_PAGE_SIZE });
      if (result && Array.isArray(result.items)) {
        setPlaces(result.items);
        setPlacesTotal(result.totalElements || result.items.length);
        setHasMorePlaces(Boolean(result.hasNext));
        setPlacesPage(0);
        syncDestinationsFromPlaces(result.items);
        try {
          sessionStorage.setItem('wayfare_places_cache', JSON.stringify(result.items));
        } catch {
          // Ignore quota if any
        }
        return;
      }
      // Fallback: nếu API phân trang không khả dụng thì dùng cách tải toàn bộ như cũ
      await fetchPlaces();
    } catch {
      await fetchPlaces();
    }
  }, [fetchPlaces]);

  // Tải thêm một trang địa điểm (nối vào danh sách hiện tại, chống trùng theo id)
  const loadMorePlaces = useCallback(async () => {
    if (loadingMorePlaces || !hasMorePlaces) return;
    setLoadingMorePlaces(true);
    try {
      const nextPage = placesPage + 1;
      const result = await placeApi.getPlacesPaged({ page: nextPage, size: PLACES_PAGE_SIZE });
      if (result && Array.isArray(result.items)) {
        setPlaces(prev => {
          const seen = new Set(prev.map(p => p.id));
          const merged = [...prev, ...result.items.filter(p => !seen.has(p.id))];
          syncDestinationsFromPlaces(merged);
          try {
            sessionStorage.setItem('wayfare_places_cache', JSON.stringify(merged));
          } catch {
            // Ignore quota if any
          }
          return merged;
        });
        setPlacesPage(nextPage);
        setPlacesTotal(result.totalElements || 0);
        setHasMorePlaces(Boolean(result.hasNext));
      }
    } catch {
      // Ignore load more places error
    } finally {
      setLoadingMorePlaces(false);
    }
  }, [loadingMorePlaces, hasMorePlaces, placesPage]);

  // Tải toàn bộ địa điểm (dùng khi tìm kiếm để kết quả không bị giới hạn trong các trang đã tải).
  // Chỉ tải một lần cho mỗi phiên; sau đó hasMorePlaces = false.
  const fetchingAllPlacesRef = useRef(false);
  const fetchAllPlaces = useCallback(async () => {
    if (fetchingAllPlacesRef.current) return;
    fetchingAllPlacesRef.current = true;
    setLoadingMorePlaces(true);
    try {
      const pageSize = 200;
      let page = 0;
      let more = true;
      let aggregated = [];
      let total = 0;
      while (more && page < 20) {
        const result = await placeApi.getPlacesPaged({ page, size: pageSize });
        if (!result || !Array.isArray(result.items)) break;
        aggregated = aggregated.concat(result.items);
        total = result.totalElements || aggregated.length;
        more = Boolean(result.hasNext);
        page += 1;
      }
      if (aggregated.length > 0) {
        setPlaces(aggregated);
        setPlacesTotal(total);
        setHasMorePlaces(false);
        setPlacesPage(Math.max(page - 1, 0));
        syncDestinationsFromPlaces(aggregated);
        try {
          sessionStorage.setItem('wayfare_places_cache', JSON.stringify(aggregated));
        } catch {
          // Ignore quota if any
        }
      }
    } catch {
      // Ignore fetch all places error
    } finally {
      setLoadingMorePlaces(false);
      fetchingAllPlacesRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchInitialPlaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // User contributes a new place (strictly requires admin approval before public listing)
  const addNewPlace = async (placeData) => {
    const activeEmail = (currentUser?.email) || '';
    if (!activeEmail) {
      throw new Error('Vui lòng đăng nhập để gửi đề xuất địa điểm mới!');
    }
    const created = await placeApi.createPlace(placeData, activeEmail);
    if (created) {
      // Chỉ bổ sung vào danh sách hiển thị nếu địa điểm đã ACTIVE (ví dụ admin tạo).
      // Đối với người dùng thông thường, status là PENDING_APPROVAL nên không hiển thị công khai cho đến khi Admin duyệt.
      if (created.status === 'ACTIVE') {
        setPlaces(prev => [created, ...prev]);
      }
      return created;
    }
    throw new Error('Không nhận được dữ liệu địa điểm từ máy chủ.');
  };

  // Saved Places (Wishlist) persisted in localStorage
  const [savedPlaces, setSavedPlaces] = useState(() => {
    try {
      const stored = localStorage.getItem('wayfare_saved_places');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleSavePlace = (place) => {
    if (!place) return false;
    const exists = savedPlaces.some(p => p.id === place.id || p.name === place.name);
    const isSavedNow = !exists;
    const next = exists
      ? savedPlaces.filter(p => p.id !== place.id && p.name !== place.name)
      : [place, ...savedPlaces];
    setSavedPlaces(next);
    try {
      localStorage.setItem('wayfare_saved_places', JSON.stringify(next));
    } catch {
      // Ignore storage quota
    }

    // Đồng bộ lên SERVER (bảng saved_places) khi đã đăng nhập — web & mobile
    // cùng 1 danh sách. Guest thì vẫn giữ lưu theo thiết bị như trước.
    const placeId = Number(place.rawId);
    if (currentUser?.email && Number.isFinite(placeId) && placeId > 0) {
      const syncCall = isSavedNow ? savedPlaceApi.addSavedPlace : savedPlaceApi.removeSavedPlace;
      syncCall(placeId).catch(() => {});
    }
    return isSavedNow;
  };

  const isPlaceSaved = (placeIdOrItem) => {
    if (!placeIdOrItem) return false;
    if (typeof placeIdOrItem === 'object') {
      return savedPlaces.some(p => (p.id && p.id === placeIdOrItem.id) || (p.name && placeIdOrItem.name && p.name === placeIdOrItem.name));
    }
    return savedPlaces.some(p => p.id === placeIdOrItem || (p.name && p.name === placeIdOrItem));
  };

  // Safe Fallback Guest User when NOT logged in (No leaked data from previous users)
  const GUEST_USER = {
    id: null,
    name: 'Khách',
    fullName: 'Khách vãng lai',
    handle: '@guest',
    email: '',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    bio: '',
    destinationsCount: 0,
    tripsCount: 0,
    savedItinerariesCount: 0,
    roles: []
  };

  // Auth State (Strict Single-Source Verification from localStorage)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      const stored = localStorage.getItem('wayfare_user');
      const auth = localStorage.getItem('wayfare_auth');
      return auth === 'true' && Boolean(stored);
    } catch {
      return false;
    }
  });

  // User Profile (Restores active session or cleanly defaults to GUEST_USER)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const auth = localStorage.getItem('wayfare_auth');
      const stored = localStorage.getItem('wayfare_user');
      if (auth === 'true' && stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.id || parsed.email || parsed.token)) {
          return parsed;
        }
      }
    } catch {
      // Ignore corrupted localStorage data
    }
    return GUEST_USER;
  });

  // HYDRATION wishlist: khi đăng nhập, kéo danh sách yêu thích từ SERVER về
  // merge với danh sách local (union theo placeId) — thứ đã lưu khi offline
  // vẫn giữ, những gì lưu từ app mobile/website khác cũng xuất hiện.
  useEffect(() => {
    if (!currentUser?.email || !currentUser?.token) return undefined;
    let alive = true;
    savedPlaceApi.getSavedPlaces().then(list => {
      if (!alive || !Array.isArray(list) || list.length === 0) return;
      const mapped = list.map(p => mapApiSpot(p)).filter(Boolean);
      if (mapped.length === 0) return;
      setSavedPlaces(prev => {
        const serverIds = new Set(mapped.map(m => m.rawId));
        const localOnly = prev.filter(p => !serverIds.has(Number(p.rawId)) && !serverIds.has(p.rawId));
        const merged = [...mapped, ...localOnly];
        try {
          localStorage.setItem('wayfare_saved_places', JSON.stringify(merged));
        } catch {
          // Ignore quota error
        }
        return merged;
      });
    }).catch(() => {
      // Silent error handling
    });
    return () => { alive = false; };
  }, [currentUser?.email, currentUser?.token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clean Login: ĐẢM BẢO CÁCH LY TUYỆT ĐỐI GIỮA CÁC USER, KHÔNG ĐÈ DỮ LIỆU CŨ SANG USER MỚI
  const login = (userData) => {
    if (!userData) return;

    // 1. DỌN SẠCH DỮ LIỆU PHIÊN CŨ TRƯỚC KHI LƯU USER MỚI (Tránh ô nhiễm state & storage)
    try {
      localStorage.removeItem('wayfare_user');
      localStorage.removeItem('wayfare_auth');
      localStorage.removeItem('wayfare_portal_mode');
      localStorage.removeItem('token');
    } catch {
      // Clean storage safely
    }

    // 2. KHỞI TẠO USER MỚI HOÀN TOÀN ĐỘC LẬP TỪ DỮ LIỆU BACKEND
    const rawEmail = userData.email ? String(userData.email).trim() : '';
    const emailPrefix = rawEmail ? rawEmail.split('@')[0] : 'user';

    const freshUser = {
      id: userData.id || null,
      name: userData.fullName || userData.name || emailPrefix,
      fullName: userData.fullName || userData.name || emailPrefix,
      handle: userData.handle || (rawEmail ? `@${emailPrefix.toLowerCase().replace(/[^a-z0-9_]/g, '')}` : '@user'),
      email: rawEmail,
      avatar: userData.avatar || userData.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      bio: userData.bio || '',
      token: userData.token || '',
      destinationsCount: typeof userData.destinationsCount === 'number' ? userData.destinationsCount : 0,
      tripsCount: typeof userData.tripsCount === 'number' ? userData.tripsCount : 0,
      savedItinerariesCount: typeof userData.savedItinerariesCount === 'number' ? userData.savedItinerariesCount : 0,
      tier: userData.tier || (rawEmail.startsWith('tung1@') || rawEmail.startsWith('admin@') ? 'diamond' : rawEmail.startsWith('tung2@') ? 'gold' : rawEmail.startsWith('tung3@') ? 'silver' : 'bronze'),
      roles: Array.isArray(userData.roles) && userData.roles.length > 0
        ? userData.roles
        : ['ROLE_USER']
    };

    setIsLoggedIn(true);
    setCurrentUser(freshUser);

    try {
      localStorage.setItem('wayfare_user', JSON.stringify(freshUser));
      localStorage.setItem('wayfare_auth', 'true');
    } catch {
      // Ignore localStorage error
    }
  };

  // Safe Logout: Gửi thông báo đến Backend ghi log kiểm toán và Reset sạch sẽ về Guest
  const logout = () => {
    const userToLogout = currentUser;
    if (userToLogout?.email) {
      authApi.logout(userToLogout.email).catch(() => {});
    }
    setIsLoggedIn(false);
    setCurrentUser(GUEST_USER);
    setPortalMode('user');
    setUserTab('home');
    try {
      localStorage.removeItem('wayfare_auth');
      localStorage.removeItem('wayfare_user');
      localStorage.removeItem('wayfare_portal_mode');
      localStorage.removeItem('token');
    } catch {
      // Ignore localStorage error
    }
  };

  // Cập nhật profile của CHÍNH user đang đăng nhập (đồng bộ cả State và localStorage)
  const updateCurrentUser = (updates) => {
    if (!updates) return;
    setCurrentUser(prev => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem('wayfare_user', JSON.stringify(updated));
      } catch {
        // Ignore localStorage error
      }
      return updated;
    });
  };

  // Tự động bắt sự kiện 401/403 từ API client: reset session và hiển thị modal đăng nhập
  useEffect(() => {
    const onUnauthorized = () => {
      setIsLoggedIn(false);
      setCurrentUser(GUEST_USER);
      setPortalMode('user');
      setUserTab('home');
      try {
        localStorage.removeItem('wayfare_auth');
        localStorage.removeItem('wayfare_user');
        localStorage.removeItem('token');
      } catch {}
      setAuthMode('login');
      setIsAuthModalOpen(true);
    };

    window.addEventListener('wayfare:unauthorized', onUnauthorized);
    return () => window.removeEventListener('wayfare:unauthorized', onUnauthorized);
  }, []);

  // Auto-sync profile ID and details with backend if missing or on reload
  useEffect(() => {
    if (!isLoggedIn || !currentUser?.email || !currentUser?.token) return;
    userApi
      .getMyProfile(currentUser.email)
      .then(profile => {
        if (profile && profile.id) {
          setCurrentUser(prev => {
            // Đảm bảo không đồng bộ nhầm nếu email không trùng khớp
            if (profile.email && prev.email && profile.email.toLowerCase() !== prev.email.toLowerCase()) {
              return prev;
            }
            if (prev.id === profile.id && prev.name === (profile.fullName || prev.name)) return prev;
            const updated = {
              ...prev,
              id: profile.id,
              name: profile.fullName || prev.name,
              fullName: profile.fullName || prev.fullName,
              avatar: profile.avatarUrl || prev.avatar,
              handle: profile.handle || prev.handle,
              bio: profile.bio !== undefined ? profile.bio : prev.bio
            };
            try {
              localStorage.setItem('wayfare_user', JSON.stringify(updated));
            } catch {
              // Ignore localStorage error
            }
            return updated;
          });
        }
      })
      .catch(() => {});
  }, [isLoggedIn, currentUser?.email, currentUser?.token]);

  // Notification State - Synced with currentUser
  const [notifications, setNotifications] = useState([]);
  const [isNotificationLiveBackend, setIsNotificationLiveBackend] = useState(false);

  const addNewNotification = useCallback((incomingNotif) => {
    if (!incomingNotif) return;
    setNotifications(prev => {
      if (prev.some(n => n.id && n.id === incomingNotif.id)) return prev;
      return [incomingNotif, ...prev];
    });
  }, []);

  const fetchNotifications = useCallback(async (targetEmail) => {
    if (!isLoggedIn) {
      setNotifications([]);
      return;
    }
    const emailToUse = targetEmail || currentUser?.email || '';
    if (!emailToUse) {
      setNotifications([]);
      return;
    }
    try {
      const res = await notificationApi.getNotifications(emailToUse);
      if (res && res.data) {
        setNotifications(res.data);
        setIsNotificationLiveBackend(res.isBackend);
      }
    } catch {
      // Ignore background notification fetch errors
    }
  }, [currentUser?.email, isLoggedIn]);

  // Sync notifications on mount and whenever user email changes
  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [fetchNotifications, isLoggedIn]);

  // Polling every 30 seconds for live notification updates & badge counts
  useEffect(() => {
    if (!isLoggedIn) return;
    const timer = setInterval(() => {
      fetchNotifications();
    }, 30000);
    return () => clearInterval(timer);
  }, [fetchNotifications, isLoggedIn]);

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  // ─── UNREAD CHAT MESSAGES COUNT (Navbar Badge) ─────────────────────────────
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const fetchUnreadMessages = useCallback(async () => {
    if (!isLoggedIn || !currentUser?.email) {
      setUnreadMessagesCount(0);
      return;
    }
    try {
      const count = await chatApi.getUnreadCount(currentUser.email);
      setUnreadMessagesCount(Number(count) || 0);
    } catch {
      // ignore
    }
  }, [isLoggedIn, currentUser?.email]);

  useEffect(() => {
    if (!isLoggedIn) {
      setUnreadMessagesCount(0);
      return;
    }
    fetchUnreadMessages();
    const timer = setInterval(() => {
      fetchUnreadMessages();
    }, 15000);

    const onChatActivity = () => {
      fetchUnreadMessages();
    };
    window.addEventListener('wayfare_chat_updated', onChatActivity);

    return () => {
      clearInterval(timer);
      window.removeEventListener('wayfare_chat_updated', onChatActivity);
    };
  }, [fetchUnreadMessages, isLoggedIn]);

  // ─── ITINERARY PERSISTENCE & SYNC WITH MYSQL BACKEND ─────────────────────────
  const mapBackendItineraryToFrontend = useCallback((item) => {
    if (!item) return null;
    const places = (item.details || []).map(d => d.locationName).filter(Boolean);
    const dayNumbers = (item.details || []).map(d => d.dayNumber).filter(Boolean);
    const daysCount = dayNumbers.length > 0 ? Math.max(...dayNumbers, 1) : 3;

    // Group activities by day
    const dayMap = {};
    (item.details || []).forEach(d => {
      const dayNum = d.dayNumber || 1;
      if (!dayMap[dayNum]) {
        dayMap[dayNum] = {
          dayNumber: dayNum,
          title: `Ngày ${dayNum}: Khám phá ${item.destination || 'Điểm đến'}`,
          activities: []
        };
      }
      dayMap[dayNum].activities.push({
        id: d.id,
        time: d.startTime ? d.startTime.substring(0, 5) : '08:30',
        title: d.locationName || 'Điểm tham quan',
        location: d.locationName || item.destination,
        address: d.locationAddress || `${item.destination || 'Việt Nam'}`,
        category: d.category || 'Khám phá',
        note: d.note || d.transitInfo || 'Trải nghiệm du lịch bản địa',
        aiTip: d.aiTip || '',
        cost: d.estimatedCost ? `${Number(d.estimatedCost).toLocaleString('vi-VN')}đ` : 'Tùy chọn'
      });
    });

    const days = Object.values(dayMap).sort((a, b) => a.dayNumber - b.dayNumber);

    return {
      id: item.id,
      title: item.title,
      destination: item.destination,
      region: item.destination || 'Điểm đến du lịch',
      coverImage: item.coverImageUrl || null,
      duration: `${daysCount}N${Math.max(1, daysCount - 1)}Đ`,
      daysCount: daysCount,
      status: (item.status || 'ACTIVE').toLowerCase() === 'active' ? 'upcoming' : (item.status || 'upcoming').toLowerCase(),
      isAiGenerated: Boolean(item.isAiGenerated),
      isPublic: item.isPublic !== false,
      creatorId: item.creatorId,
      creatorEmail: item.creatorEmail,
      startDate: item.startDate || null,
      endDate: item.endDate || null,
      countdown: item.startDate ? `Khởi hành ${item.startDate}` : 'Sắp khởi hành',
      departureDate: item.startDate ? `${item.startDate}${item.endDate ? ' – ' + item.endDate : ''}` : 'Khởi hành trong tháng tới',
      groupType: item.groupType || 'Cá nhân',
      travelStyle: item.travelStyle || 'Nghỉ dưỡng & Khám phá',
      placesCount: places.length > 0 ? places.length : (daysCount * 3),
      placesList: places.length > 0 ? places : [item.destination + ' City Tour'],
      budgetPerPerson: item.budgetTotal ? Math.round(Number(item.budgetTotal) / 2) : 0,
      totalBudget: item.budgetTotal ? Number(item.budgetTotal) : 0,
      budgetProgress: item.budgetTotal ? 35 : 0,
      budgetNote: item.budgetTotal ? `Dự toán: ~${Number(item.budgetTotal).toLocaleString('vi-VN')}đ` : 'Chưa có dự toán',
      pace: 'Cân bằng',
      style: item.travelStyle || 'Nghỉ dưỡng & Khám phá',
      aiTipNote: 'Lịch trình được lưu trữ trên hệ thống máy chủ Wayfare.',
      // 15 Tiêu chuẩn Tour lữ hành thương mại
      tourCode: item.tourCode || null,
      theme: item.theme || null,
      departureLocation: item.departureLocation || null,
      endingLocation: item.endingLocation || null,
      targetAudience: item.targetAudience || null,
      maxGroupSize: item.maxGroupSize || null,
      transportation: item.transportation || null,
      mealPlan: item.mealPlan || null,
      accommodationInfo: item.accommodationInfo || null,
      tourGuideInfo: item.tourGuideInfo || null,
      childPrice: item.childPrice || null,
      singleRoomSurcharge: item.singleRoomSurcharge || null,
      servicesIncluded: item.servicesIncluded || null,
      servicesExcluded: item.servicesExcluded || null,
      cancellationPolicy: item.cancellationPolicy || null,
      packingNotes: item.packingNotes || null,
      days: days.length > 0 ? days : [
        {
          dayNumber: 1,
          title: `Ngày 1: Khám phá điểm nhấn ${item.destination || 'Việt Nam'}`,
          activities: [
            { time: '08:30', title: `Bắt đầu lịch trình tại ${item.destination}`, note: 'Khởi hành khám phá', cost: '150.000đ' },
            { time: '14:00', title: 'Tham quan điểm check-in nổi bật', note: 'Trải nghiệm danh lam thắng cảnh', cost: 'Tùy chọn' },
            { time: '18:30', title: 'Thưởng thức ẩm thực và dạo phố đêm', note: 'Không khí về đêm rực rỡ', cost: '200.000đ' }
          ]
        }
      ]
    };
  }, []);

  const fetchItineraries = useCallback(async (email) => {
    try {
      const activeEmail = email || currentUser?.email || '';
      if (!activeEmail) {
        setItineraries([]);
        return;
      }
      const data = await itineraryApi.getMyItineraries(activeEmail);
      if (data && Array.isArray(data)) {
        const mapped = data.map(mapBackendItineraryToFrontend).filter(Boolean);
        setItineraries(mapped);
        try {
          sessionStorage.setItem('wayfare_my_itineraries_cache', JSON.stringify(mapped));
        } catch {
          // Ignore storage quota
        }
      } else {
        setItineraries([]);
      }
    } catch {
      setItineraries([]);
    }
  }, [currentUser?.email, mapBackendItineraryToFrontend]);

  // Sync itineraries on mount and when user session changes
  useEffect(() => {
    fetchItineraries();
  }, [fetchItineraries]);

  const saveItineraryToBackend = async (itineraryObj, email) => {
    const activeEmail = email || currentUser?.email || '';
    if (!activeEmail) {
      throw new Error('Vui lòng đăng nhập để lưu lịch trình chuyến đi!');
    }
    const payload = {
      title: itineraryObj.title || 'Chuyến đi mới',
      destination: itineraryObj.destination || 'Việt Nam',
      startDate: itineraryObj.startDate || (new Date().toISOString().split('T')[0]),
      endDate: itineraryObj.endDate || null,
      budgetTotal: itineraryObj.totalBudget || (itineraryObj.budgetPerPerson ? itineraryObj.budgetPerPerson * 2 : null),
      coverImageUrl: itineraryObj.coverImage || itineraryObj.coverImageUrl || null,
      isAiGenerated: Boolean(itineraryObj.isAiGenerated ?? true),
      isPublic: itineraryObj.isPublic !== false,
      status: (itineraryObj.status || 'ACTIVE').toUpperCase(),
      groupType: itineraryObj.groupType || 'Cá nhân',
      travelStyle: itineraryObj.travelStyle || itineraryObj.style || 'Nghỉ dưỡng & Khám phá',
      
      // 15 Tiêu chuẩn Tour lữ hành thương mại
      tourCode: itineraryObj.tourCode || null,
      theme: itineraryObj.theme || null,
      departureLocation: itineraryObj.departureLocation || null,
      endingLocation: itineraryObj.endingLocation || null,
      targetAudience: itineraryObj.targetAudience || null,
      maxGroupSize: itineraryObj.maxGroupSize ? Number(itineraryObj.maxGroupSize) : null,
      transportation: itineraryObj.transportation || null,
      mealPlan: itineraryObj.mealPlan || null,
      accommodationInfo: itineraryObj.accommodationInfo || null,
      tourGuideInfo: itineraryObj.tourGuideInfo || null,
      childPrice: itineraryObj.childPrice ? (typeof itineraryObj.childPrice === 'number' ? itineraryObj.childPrice : Number(String(itineraryObj.childPrice).replace(/\D/g, '')) || null) : null,
      singleRoomSurcharge: itineraryObj.singleRoomSurcharge ? (typeof itineraryObj.singleRoomSurcharge === 'number' ? itineraryObj.singleRoomSurcharge : Number(String(itineraryObj.singleRoomSurcharge).replace(/\D/g, '')) || null) : null,
      servicesIncluded: itineraryObj.servicesIncluded || null,
      servicesExcluded: itineraryObj.servicesExcluded || null,
      cancellationPolicy: itineraryObj.cancellationPolicy || null,
      packingNotes: itineraryObj.packingNotes || null,

      details: (itineraryObj.days || []).flatMap(day =>
        (day.activities || []).map((act, idx) => ({
          dayNumber: day.dayNumber || 1,
          visitOrder: idx + 1,
          startTime: act.time ? (act.time.length === 5 ? `${act.time}:00` : (act.time.includes(':') ? act.time.substring(0, 5) + ':00' : '08:30:00')) : '08:30:00',
          locationName: act.title || act.location || 'Điểm dừng chân',
          locationAddress: act.address || itineraryObj.destination || 'Việt Nam',
          category: act.category || 'Khám phá',
          estimatedCost: typeof act.cost === 'number' ? act.cost : (parseInt((act.cost || '').replace(/\D/g, '')) || 100000),
          aiTip: act.aiTip || '',
          transitInfo: act.transit || '',
          note: act.note || ''
        }))
      )
    };

    const saved = await itineraryApi.createItinerary(payload, activeEmail);
    if (saved && saved.id) {
      const mapped = mapBackendItineraryToFrontend(saved);
      setItineraries(prev => prev.map(item => item.id === itineraryObj.id ? mapped : item));
      return mapped;
    }
    return itineraryObj;
  };

  // Thêm 1 điểm dừng chân vào lịch trình có sẵn (API thật: POST /itineraries/{id}/details)
  // rồi đồng bộ lại state từ server để mọi trang đều nhìn thấy.
  const addPlaceToItinerary = async (itineraryId, detail, email) => {
    const activeEmail = email || currentUser?.email || '';
    if (!activeEmail) {
      throw new Error('Vui lòng đăng nhập để lưu điểm dừng vào lịch trình!');
    }
    const created = await itineraryApi.addItineraryDetail(itineraryId, detail, activeEmail);
    // Nạp lại từ server (nguồn sự thật) để placesCount/placesList/days chuẩn
    await fetchItineraries(activeEmail);
    return created;
  };

  const deleteItineraryFromBackend = async (id, email) => {
    try {
      const activeEmail = email || currentUser?.email || '';
      if (activeEmail && (typeof id === 'number' || !String(id).startsWith('itin-'))) {
        await itineraryApi.deleteItinerary(id, activeEmail);
      }
    } catch {
      // Ignore network errors on itinerary delete
    }
    setItineraries(prev => prev.filter(item => String(item.id) !== String(id)));
  };

  const createManualItinerary = async (tripData, email) => {
    setItineraries(prev => [tripData, ...prev]);
    return await saveItineraryToBackend(tripData, email);
  };

  const toggleItineraryVisibility = async (id, isPublic) => {
    const updated = await itineraryApi.toggleVisibility(id, isPublic);
    setItineraries(prev => prev.map(item => String(item.id) === String(id) ? { ...item, isPublic: updated.isPublic } : item));
    return updated;
  };

  const updateItineraryInBackend = async (id, updatedFields, email) => {
    const activeEmail = email || currentUser?.email || '';
    if (!activeEmail) {
      throw new Error('Vui lòng đăng nhập để cập nhật thông tin chuyến đi!');
    }
    const updated = await itineraryApi.updateItinerary(id, updatedFields, activeEmail);
    if (updated && updated.id) {
      const mapped = mapBackendItineraryToFrontend(updated);
      setItineraries(prev => prev.map(item => String(item.id) === String(id) ? mapped : item));
      return mapped;
    }
    return updated;
  };

  const markNotificationAsRead = async (id) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
    await notificationApi.markAsRead(id, currentUser?.email);
  };

  const markAllNotificationsAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await notificationApi.markAllAsRead(currentUser?.email);
  };

  const deleteNotification = async (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await notificationApi.deleteNotification(id, currentUser?.email);
  };

  const addTestNotification = async (payload) => {
    const res = await notificationApi.createTestNotification(payload, currentUser?.email);
    if (res && res.data) {
      setNotifications(prev => [res.data, ...prev]);
    }
    return res;
  };

  const broadcastNotification = async (payload) => {
    const res = await notificationApi.broadcastNotification({
      ...payload,
      senderEmail: currentUser?.email
    });
    fetchNotifications();
    return res;
  };

  // Actions
  const toggleLikePost = (postId) => {
    setPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          };
        }
        return post;
      })
    );
  };

  const addCommunityPost = (newPostData) => {
    const newPost = {
      id: `post-${Date.now()}`,
      author: {
        name: currentUser.name,
        avatar: currentUser.avatar,
        badge: 'Thành viên mới'
      },
      timeAgo: 'Vừa xong',
      likes: 0,
      commentsCount: 0,
      savedCount: 0,
      isLiked: false,
      ...newPostData
    };
    setPosts([newPost, ...posts]);
  };

  const generateAITrip = (tripParams) => {
    let newItinerary;
    if (tripParams.fullItinerary) {
      newItinerary = tripParams.fullItinerary;
    } else if (tripParams.id && tripParams.days) {
      newItinerary = tripParams;
    } else {
      newItinerary = {
        id: `itin-${Date.now()}`,
        title: `${tripParams.destination}: Hành Trình AI Thiết Kế (${tripParams.daysCount || 3} ngày)`,
        destination: tripParams.destination,
        region: tripParams.region || 'Điểm đến du lịch',
        coverImage: tripParams.coverImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        duration: `${tripParams.daysCount || 3}N${Math.max(1, (tripParams.daysCount || 3) - 1)}Đ`,
        daysCount: Number(tripParams.daysCount) || 3,
        status: tripParams.status || 'upcoming',
        isAiGenerated: true,
        countdown: 'Sắp khởi hành • Mới tạo',
        departureDate: tripParams.departureDate || 'Khởi hành trong tháng tới',
        groupType: tripParams.groupType || 'Nhóm bạn / Cặp đôi',
        placesCount: (Number(tripParams.daysCount) || 3) * 3,
        placesList: [tripParams.destination + ' City Center', 'Điểm Check-in Đặc Sắc', 'Khu Ẩm Thực Đêm'],
        budgetPerPerson: tripParams.budgetPerPerson || 3500000,
        totalBudget: tripParams.totalBudget || 7000000,
        budgetProgress: 40,
        budgetNote: 'Được tạo bởi WanderAI Gemini • Hạn mức tối ưu',
        pace: tripParams.pace || 'Cân bằng',
        style: tripParams.style || 'Trải nghiệm tổng hợp',
        aiTipNote: tripParams.aiTipNote || 'Gợi ý từ WanderAI: Nên khởi hành sớm để tránh nắng gắt và săn ảnh bình minh đẹp.',
        days: Array.from({ length: Number(tripParams.daysCount) || 3 }).map((_, i) => ({
          dayNumber: i + 1,
          title: `Ngày ${i + 1}: Khám phá điểm nhấn ${tripParams.destination}`,
          activities: [
            { time: '08:00', title: `Đón bình minh & Thưởng thức đặc sản địa phương`, note: 'AI gợi ý quán truyền thống 4.9*' },
            { time: '10:30', title: `Check-in danh thắng nổi tiếng tại ${tripParams.destination}`, note: 'Tránh khung giờ đông khách' },
            { time: '14:00', title: `Trải nghiệm văn hóa & hoạt động outdoor`, note: 'Tích hợp bản đồ trực tuyến' },
            { time: '19:00', title: `Thưởng thức tiệc tối & Chill đêm`, note: 'Gợi ý điểm ngắm hoàng hôn/đêm đẹp nhất' }
          ]
        }))
      };
    }

    setItineraries(prev => [newItinerary, ...prev]);
    setStats(prev => ({ ...prev, aiGenerationsToday: prev.aiGenerationsToday + 1 }));
    setActiveViewingItinerary(newItinerary);
    setUserTab('itineraries');
    // Asynchronously persist to MySQL backend database
    saveItineraryToBackend(newItinerary);
    return newItinerary;
  };

  // Admin Actions
  const approvePlace = (placeId) => {
    setPendingPlaces(prev => prev.filter(p => p.id !== placeId));
    setStats(prev => ({ ...prev, pendingPlaces: Math.max(0, (prev.pendingPlaces || 1) - 1) }));
  };

  const rejectPlace = (placeId) => {
    setPendingPlaces(prev => prev.filter(p => p.id !== placeId));
    setStats(prev => ({ ...prev, pendingPlaces: Math.max(0, (prev.pendingPlaces || 1) - 1) }));
  };

  const resolveReport = (reportId) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
    setStats(prev => ({ ...prev, reportedContent: Math.max(0, (prev.reportedContent || 1) - 1) }));
  };

  // Badge thật cho sidebar admin: địa điểm chờ duyệt / đánh giá đã ẩn / báo cáo chờ xử lý.
  // Trước đây các badge này là số ảo (pendingCheckins không bao giờ được nạp từ backend).
  useEffect(() => {
    if (!location.pathname.startsWith('/admin')) return undefined;
    let cancelled = false;
    const loadAdminBadges = async () => {
      try {
        const [pendingList, reviewMetrics, reportMetrics] = await Promise.all([
          placeApi.getPendingPlaces(),
          adminReviewApi.getMetrics(),
          adminReportApi.getMetrics()
        ]);
        if (cancelled) return undefined;
        setStats(prev => ({
          ...prev,
          pendingPlaces: Array.isArray(pendingList) ? pendingList.length : (prev.pendingPlaces || 0),
          hiddenReviews: reviewMetrics?.hiddenReviews ?? (prev.hiddenReviews || 0),
          reportedContent: reportMetrics?.pendingReportsCount ?? (prev.reportedContent || 0)
        }));
      } catch {
        /* badge tạm giữ giá trị cũ nếu mạng chập chờn */
      }
      return undefined;
    };
    loadAdminBadges();
    const refreshTimer = setInterval(loadAdminBadges, 60000);
    return () => { cancelled = true; clearInterval(refreshTimer); };
  }, [location.pathname]);

  const toggleUserStatus = (userId) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          return { ...u, status: u.status === 'Active' ? 'Banned' : 'Active' };
        }
        return u;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        portalMode,
        setPortalMode,
        userTab,
        setUserTab,
        adminTab,
        setAdminTab,
        isAIGeneratorOpen,
        setIsAIGeneratorOpen,
        aiGeneratorInitialData,
        openAIGeneratorWithItem,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authMode,
        setAuthMode,
        destinations,
        places,
        setPlaces,
        fetchPlaces,
        placesTotal,
        hasMorePlaces,
        loadMorePlaces,
        loadingMorePlaces,
        fetchAllPlaces,
        addNewPlace,
        posts,
        itineraries,
        pendingPlaces,
        users,
        reports,
        stats,
        currentUser,
        isLoggedIn,
        setIsLoggedIn,
        login,
        logout,
        updateCurrentUser,
        toggleLikePost,
        addCommunityPost,
        generateAITrip,
        activeViewingItinerary,
        setActiveViewingItinerary,
        aiGeneratingStatus,
        setAiGeneratingStatus,
        approvePlace,
        rejectPlace,
        resolveReport,
        toggleUserStatus,
        notifications,
        setNotifications,
        addNewNotification,
        unreadNotificationsCount,
        unreadMessagesCount,
        fetchUnreadMessages,
        setUnreadMessagesCount,
        isNotificationLiveBackend,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        addTestNotification,
        broadcastNotification,
        fetchNotifications,
        fetchItineraries,
        saveItineraryToBackend,
        addPlaceToItinerary,
        deleteItineraryFromBackend,
        createManualItinerary,
        toggleItineraryVisibility,
        updateItineraryInBackend,
        savedPlaces,
        toggleSavePlace,
        isPlaceSaved
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    return DEFAULT_APP_STATE;
  }
  return context;
};
