import React, { createContext, useContext, useState } from 'react';
import {
  INITIAL_DESTINATIONS,
  INITIAL_POSTS,
  INITIAL_ITINERARIES,
  ADMIN_STATS,
  INITIAL_PENDING_PLACES,
  INITIAL_USER_LIST,
  INITIAL_REPORTS
} from '../mock/data';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Navigation & Role State
  const [portalMode, setPortalMode] = useState('user'); // 'user' | 'admin'
  const [userTab, setUserTab] = useState('home'); // 'home'|'explore'|'community'|'itineraries'|'ai-planner'|'messages'|'profile'
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
    const newItinerary = {
      id: `itin-${Date.now()}`,
      title: `${tripParams.destination}: Hành Trình AI Thiết Kế (${tripParams.daysCount} ngày)`,
      destination: tripParams.destination,
      budgetTotal: tripParams.budget || '4.500.000đ',
      daysCount: Number(tripParams.daysCount) || 3,
      pace: tripParams.pace || 'Cân bằng',
      style: tripParams.style || 'Trải nghiệm tổng hợp',
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

    setItineraries([newItinerary, ...itineraries]);
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
        toggleLikePost,
        addCommunityPost,
        generateAITrip,
        approvePlace,
        rejectPlace,
        resolveReport,
        toggleUserStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
