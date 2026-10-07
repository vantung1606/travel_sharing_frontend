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
import { notificationApi, userApi, placeApi, INITIAL_MOCK_NOTIFICATIONS } from '../services/api';

const AppContext = createContext();

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

  // Safe Logout: Reset sạch sẽ về Guest
  const logout = () => {
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
    setUserTab('itineraries');
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
        fetchNotifications
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
