import React, { createContext, useContext, useState, useEffect } from 'react';
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
  // Navigation & Role State
  const [portalMode, setPortalMode] = useState('user'); // 'user' | 'admin'
  const [userTab, setUserTab] = useState('home'); // 'home'|'explore'|'community'|'itineraries'|'ai-planner'|'messages'|'profile'|'notifications'
  const [adminTab, setAdminTab] = useState('dashboard'); // 'dashboard'|'places'|'users'

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

  // Notification State (M08)
  const [notifications, setNotifications] = useState(INITIAL_MOCK_NOTIFICATIONS);
  const [isNotificationLiveBackend, setIsNotificationLiveBackend] = useState(false);

  // Fetch notifications on mount
  useEffect(() => {
    notificationApi.getNotifications().then(res => {
      if (res && res.data) {
        setNotifications(res.data);
        setIsNotificationLiveBackend(res.isBackend);
      }
    });
  }, []);

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const markNotificationAsRead = async (id) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
    await notificationApi.markAsRead(id);
  };

  const markAllNotificationsAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await notificationApi.markAllAsRead();
  };

  const deleteNotification = async (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await notificationApi.deleteNotification(id);
  };

  const addTestNotification = async (payload) => {
    const res = await notificationApi.createTestNotification(payload);
    if (res && res.data) {
      setNotifications(prev => [res.data, ...prev]);
    }
  };

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // User Profile
  const [currentUser, setCurrentUser] = useState({
    name: 'Nguyễn Thanh Tùng',
    handle: '@tung_wanderlust',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'Đam mê khám phá thiên nhiên & trải nghiệm ẩm thực du lịch độc lạ cùng AI 🌍✈️',
    destinationsCount: 18,
    tripsCount: 6,
    savedItinerariesCount: 4
  });

  const login = (userData) => {
    setIsLoggedIn(true);
    if (userData) {
      setCurrentUser(prev => ({ ...prev, ...userData }));
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setPortalMode('user');
    setUserTab('home');
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
        addTestNotification
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
