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
import { notificationApi, INITIAL_MOCK_NOTIFICATIONS } from '../services/api';

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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  // Data States
  const [destinations, setDestinations] = useState(INITIAL_DESTINATIONS);
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [itineraries, setItineraries] = useState(INITIAL_ITINERARIES);
  const [pendingPlaces, setPendingPlaces] = useState(INITIAL_PENDING_PLACES);
  const [users, setUsers] = useState(INITIAL_USER_LIST);
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [stats, setStats] = useState(ADMIN_STATS);

  const DEFAULT_USER = {
    name: 'Nguyễn Thanh Tùng',
    handle: '@tung_wanderlust',
    email: 'tung@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'Đam mê khám phá thiên nhiên & trải nghiệm ẩm thực du lịch độc lạ cùng AI 🌍✈️',
    destinationsCount: 18,
    tripsCount: 6,
    savedItinerariesCount: 4,
    roles: ['ROLE_USER']
  };

  // Auth State (Restores from localStorage on page reload)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return localStorage.getItem('wayfare_auth') === 'true';
    } catch {
      return false;
    }
  });

  // User Profile (Restores from localStorage on page reload)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('wayfare_user');
      if (stored) {
        return { ...DEFAULT_USER, ...JSON.parse(stored) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_USER;
  });

  const login = (userData) => {
    setIsLoggedIn(true);
    let updatedUser = { ...DEFAULT_USER, ...currentUser };
    if (userData) {
      const normalized = {
        ...userData,
        name: userData.fullName || userData.name || currentUser.name,
        handle: userData.handle || currentUser.handle,
        email: userData.email || currentUser.email,
        avatar: userData.avatar || currentUser.avatar,
        roles: userData.roles || (userData.email?.toLowerCase().includes('admin') ? ['ROLE_ADMIN', 'ROLE_USER'] : ['ROLE_USER'])
      };
      updatedUser = { ...updatedUser, ...normalized };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem('wayfare_user', JSON.stringify(updatedUser));
      } catch (e) {
        console.error('Failed to save wayfare_user to localStorage', e);
      }
    }
    try {
      localStorage.setItem('wayfare_auth', 'true');
    } catch (e) {
      console.error('Failed to save wayfare_auth to localStorage', e);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(DEFAULT_USER);
    setPortalMode('user');
    setUserTab('home');
    try {
      localStorage.removeItem('wayfare_auth');
      localStorage.removeItem('wayfare_user');
      localStorage.removeItem('wayfare_portal_mode');
    } catch (e) {
      console.error('Failed to clear auth from localStorage', e);
    }
  };

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
        isAuthModalOpen,
        setIsAuthModalOpen,
        authMode,
        setAuthMode,
        destinations,
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
