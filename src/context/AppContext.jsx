import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  INITIAL_DESTINATIONS,
  INITIAL_POSTS,
  INITIAL_ITINERARIES,
  ADMIN_STATS,
  INITIAL_PENDING_PLACES,
  INITIAL_USER_LIST,
  INITIAL_REPORTS
} from '../mock/data';
import { notificationApi, userApi, placeApi, itineraryApi, authApi } from '../services/api';

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
  destinations: INITIAL_DESTINATIONS || [],
  places: [],
  setPlaces: () => {},
  fetchPlaces: () => {},
  addNewPlace: () => {},
  posts: INITIAL_POSTS || [],
  itineraries: INITIAL_ITINERARIES || [],
  pendingPlaces: INITIAL_PENDING_PLACES || [],
  users: INITIAL_USER_LIST || [],
  reports: INITIAL_REPORTS || [],
  stats: ADMIN_STATS || {},
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
  unreadNotificationsCount: 0,
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
      navigate('/admin/dashboard');
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
    if (p.startsWith('/admin/analytics')) return 'analytics';
    if (p.startsWith('/admin/audit-logs')) return 'audit-logs';
    if (p.startsWith('/admin/revenue')) return 'revenue';
    if (p.startsWith('/admin/ai-config')) return 'ai-config';
    return 'dashboard';
  }, [location.pathname]);

  const setAdminTab = (tabId) => {
    const pathMap = {
      dashboard: '/admin/dashboard',
      places: '/admin/places',
      users: '/admin/users',
      reports: '/admin/reports',
      analytics: '/admin/analytics',
      'audit-logs': '/admin/audit-logs',
      revenue: '/admin/revenue',
      'ai-config': '/admin/ai-config'
    };
    navigate(pathMap[tabId] || '/admin/dashboard');
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

  // Data States
  const [destinations, setDestinations] = useState(INITIAL_DESTINATIONS);
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [itineraries, setItineraries] = useState(INITIAL_ITINERARIES);
  const [pendingPlaces, setPendingPlaces] = useState(INITIAL_PENDING_PLACES);
  const [places, setPlaces] = useState([]);
  const [users, setUsers] = useState(INITIAL_USER_LIST);
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [stats, setStats] = useState(ADMIN_STATS);

  // Fetch places from backend on mount
  const fetchPlaces = useCallback(async (filters = {}) => {
    try {
      const data = await placeApi.getPlaces(filters);
      if (data && data.length > 0) {
        setPlaces(data);
      }
    } catch (err) {
      console.warn('Failed to fetch places:', err);
    }
  }, []);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  // Host / User adds new place
  const addNewPlace = async (placeData) => {
    try {
      const activeEmail = (currentUser?.email) || '';
      const created = await placeApi.createPlace(placeData, activeEmail);
      if (created) {
        setPlaces(prev => [created, ...prev]);
        return created;
      }
    } catch (err) {
      console.warn('Backend place create failed, using local place state:', err.message);
      const fallback = {
        id: 'place-' + Date.now(),
        ...placeData,
        ownerId: currentUser?.id || null,
        ownerName: (currentUser?.id ? currentUser.name : 'Người dùng bản địa'),
        ownerHandle: (currentUser?.id ? currentUser.handle : '@local_host'),
        ownerAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        status: 'ACTIVE',
        isVerifiedHost: false,
        averageRating: 5.0,
        reviewCount: 0,
        createdAt: new Date().toISOString()
      };
      setPlaces(prev => [fallback, ...prev]);
      return fallback;
    }
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
    } catch (e) {
      console.warn('Failed to parse wayfare_user from localStorage', e);
    }
    return GUEST_USER;
  });

  // Clean Login: ĐẢM BẢO CÁCH LY TUYỆT ĐỐI GIỮA CÁC USER, KHÔNG ĐÈ DỮ LIỆU CŨ SANG USER MỚI
  const login = (userData) => {
    if (!userData) return;

    // 1. DỌN SẠCH DỮ LIỆU PHIÊN CŨ TRƯỚC KHI LƯU USER MỚI (Tránh ô nhiễm state & storage)
    try {
      localStorage.removeItem('wayfare_user');
      localStorage.removeItem('wayfare_auth');
      localStorage.removeItem('wayfare_portal_mode');
      localStorage.removeItem('token');
    } catch (e) {
      console.warn('Could not clean old storage:', e);
    }

    // 2. KHỞI TẠO USER MỚI HOÀN TOÀN ĐỘC LẬP (Tuyệt đối KHÔNG merge với currentUser cũ)
    const rawEmail = userData.email ? String(userData.email).trim() : '';
    const emailPrefix = rawEmail ? rawEmail.split('@')[0] : 'user';
    const isAdmin = rawEmail.toLowerCase().includes('admin');

    const freshUser = {
      id: userData.id || null,
      name: userData.fullName || userData.name || emailPrefix,
      fullName: userData.fullName || userData.name || emailPrefix,
      handle: userData.handle || (rawEmail ? `@${emailPrefix.toLowerCase().replace(/[^a-z0-9_]/g, '')}` : '@user'),
      email: rawEmail,
      avatar: userData.avatar || userData.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      bio: userData.bio || '',
      token: userData.token || ('mock-token-' + Date.now()),
      destinationsCount: typeof userData.destinationsCount === 'number' ? userData.destinationsCount : 0,
      tripsCount: typeof userData.tripsCount === 'number' ? userData.tripsCount : 0,
      savedItinerariesCount: typeof userData.savedItinerariesCount === 'number' ? userData.savedItinerariesCount : 0,
      roles: Array.isArray(userData.roles) && userData.roles.length > 0
        ? userData.roles
        : (isAdmin ? ['ROLE_ADMIN', 'ROLE_USER'] : ['ROLE_USER'])
    };

    setIsLoggedIn(true);
    setCurrentUser(freshUser);

    try {
      localStorage.setItem('wayfare_user', JSON.stringify(freshUser));
      localStorage.setItem('wayfare_auth', 'true');
    } catch (e) {
      console.error('Failed to save fresh user to localStorage:', e);
    }
  };

  // Safe Logout: Gửi thông báo đến Backend ghi log kiểm toán và Reset sạch sẽ về Guest
  const logout = () => {
    const userToLogout = currentUser;
    if (userToLogout?.email) {
      authApi.logout(userToLogout.email).catch(e => console.warn('Logout API error:', e));
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
    } catch (e) {
      console.error('Failed to clear auth from localStorage', e);
    }
  };

  // Cập nhật profile của CHÍNH user đang đăng nhập (đồng bộ cả State và localStorage)
  const updateCurrentUser = (updates) => {
    if (!updates) return;
    setCurrentUser(prev => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem('wayfare_user', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to update wayfare_user in localStorage:', e);
      }
      return updated;
    });
  };

  // Auto-sync profile ID and details with backend if missing or on reload
  useEffect(() => {
    if (!isLoggedIn || !currentUser?.email) return;
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
            } catch (e) {
              console.error(e);
            }
            return updated;
          });
        }
      })
      .catch(err => console.warn('Could not sync user profile with backend:', err));
  }, [isLoggedIn, currentUser?.email]);

  // Notification State - Synced with currentUser
  const [notifications, setNotifications] = useState([]);
  const [isNotificationLiveBackend, setIsNotificationLiveBackend] = useState(false);

  const fetchNotifications = useCallback(async (targetEmail) => {
    if (!isLoggedIn) {
      setNotifications([]);
      return;
    }
    const emailToUse = targetEmail || currentUser?.email || 'admin@gmail.com';
    try {
      const res = await notificationApi.getNotifications(emailToUse);
      if (res && res.data) {
        setNotifications(res.data);
        setIsNotificationLiveBackend(res.isBackend);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
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
      coverImage: item.coverImageUrl || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
      duration: `${daysCount}N${Math.max(1, daysCount - 1)}Đ`,
      daysCount: daysCount,
      status: (item.status || 'ACTIVE').toLowerCase() === 'active' ? 'upcoming' : (item.status || 'upcoming').toLowerCase(),
      isAiGenerated: Boolean(item.isAiGenerated),
      countdown: item.startDate ? `Khởi hành ${item.startDate}` : 'Sắp khởi hành',
      departureDate: item.startDate ? `${item.startDate}${item.endDate ? ' – ' + item.endDate : ''}` : 'Khởi hành trong tháng tới',
      groupType: 'Nhóm bạn / Cặp đôi',
      placesCount: places.length > 0 ? places.length : (daysCount * 3),
      placesList: places.length > 0 ? places : [item.destination + ' City Tour'],
      budgetPerPerson: item.budgetTotal ? Math.round(Number(item.budgetTotal) / 2) : 3500000,
      totalBudget: item.budgetTotal ? Number(item.budgetTotal) : 7000000,
      budgetProgress: 35,
      budgetNote: `Dự toán: ~${Number(item.budgetTotal || 5000000).toLocaleString('vi-VN')}đ`,
      pace: 'Cân bằng',
      style: 'Trải nghiệm tổng hợp',
      aiTipNote: 'Lịch trình được lưu trữ trên hệ thống máy chủ Wayfare.',
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
      const activeEmail = email || currentUser?.email || 'admin@gmail.com';
      const data = await itineraryApi.getMyItineraries(activeEmail);
      if (data && data.length > 0) {
        const mapped = data.map(mapBackendItineraryToFrontend).filter(Boolean);
        const existingIds = new Set(mapped.map(m => String(m.id)));
        const nonDuplicateInitials = INITIAL_ITINERARIES.filter(i => !existingIds.has(String(i.id)));
        setItineraries([...mapped, ...nonDuplicateInitials]);
      }
    } catch (err) {
      console.warn('Failed to fetch itineraries from backend:', err);
    }
  }, [currentUser?.email, mapBackendItineraryToFrontend]);

  // Sync itineraries on mount and when user session changes
  useEffect(() => {
    fetchItineraries();
  }, [fetchItineraries]);

  const saveItineraryToBackend = async (itineraryObj, email) => {
    try {
      const activeEmail = email || currentUser?.email || 'admin@gmail.com';
      const payload = {
        title: itineraryObj.title || 'Chuyến đi mới',
        destination: itineraryObj.destination || 'Việt Nam',
        startDate: itineraryObj.startDate || (new Date().toISOString().split('T')[0]),
        endDate: itineraryObj.endDate || null,
        budgetTotal: itineraryObj.totalBudget || (itineraryObj.budgetPerPerson ? itineraryObj.budgetPerPerson * 2 : 5000000),
        coverImageUrl: itineraryObj.coverImage || itineraryObj.coverImageUrl || null,
        isAiGenerated: Boolean(itineraryObj.isAiGenerated ?? true),
        status: (itineraryObj.status || 'ACTIVE').toUpperCase(),
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
    } catch (err) {
      console.warn('Persist itinerary to backend failed, kept in local state:', err.message);
    }
    return itineraryObj;
  };

  const deleteItineraryFromBackend = async (id, email) => {
    try {
      const activeEmail = email || currentUser?.email || 'admin@gmail.com';
      if (typeof id === 'number' || !String(id).startsWith('itin-')) {
        await itineraryApi.deleteItinerary(id, activeEmail);
      }
    } catch (err) {
      console.warn('Backend delete itinerary warning:', err.message);
    }
    setItineraries(prev => prev.filter(item => String(item.id) !== String(id)));
  };

  const createManualItinerary = async (tripData, email) => {
    setItineraries(prev => [tripData, ...prev]);
    return await saveItineraryToBackend(tripData, email);
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
    setStats(prev => ({ ...prev, pendingCheckins: Math.max(0, prev.pendingCheckins - 1) }));
  };

  const rejectPlace = (placeId) => {
    setPendingPlaces(prev => prev.filter(p => p.id !== placeId));
    setStats(prev => ({ ...prev, pendingCheckins: Math.max(0, prev.pendingCheckins - 1) }));
  };

  const resolveReport = (reportId) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
    setStats(prev => ({ ...prev, reportedContent: Math.max(0, prev.reportedContent - 1) }));
  };

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
        unreadNotificationsCount,
        isNotificationLiveBackend,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        addTestNotification,
        broadcastNotification,
        fetchNotifications,
        fetchItineraries,
        saveItineraryToBackend,
        deleteItineraryFromBackend,
        createManualItinerary
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    console.warn('[useApp] Context not found or not initialized yet, falling back to DEFAULT_APP_STATE.');
    return DEFAULT_APP_STATE;
  }
  return context;
};
