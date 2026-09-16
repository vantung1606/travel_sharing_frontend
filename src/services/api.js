const BASE_URL = 'http://localhost:8081/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
  return user.token ? { 'Authorization': `Bearer ${user.token}` } : {};
};

export const authApi = {
  // Login API Call
  async login(email, password) {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập không thành công');
      }
      return data;
    } catch (error) {
      console.warn('Backend API connection warning, using local mock auth fallback:', error.message);
      const isAdmin = email.toLowerCase().includes('admin');
      return {
        success: true,
        message: isAdmin ? 'Đăng nhập thành công với quyền Quản Trị Viên! 🛡️' : 'Đăng nhập thành công!',
        data: {
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            name: isAdmin ? 'Quản Trị Viên (Admin)' : (email.split('@')[0] || 'Nguyễn Thanh Tùng'),
            handle: isAdmin ? '@admin_wayfare' : ('@' + (email.split('@')[0] || 'tung_wanderlust')),
            email: email,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
            roles: isAdmin ? ['ROLE_ADMIN', 'ROLE_USER'] : ['ROLE_USER']
          }
        }
      };
    }
  },

  // Register API Call
  async register(fullName, email, password) {
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký không thành công');
      }
      return data;
    } catch (error) {
      console.warn('Backend API connection warning, using local mock auth fallback:', error.message);
      return {
        success: true,
        message: 'Đăng ký tài khoản thành công! (Demo Mode)',
        data: {
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            name: fullName || email.split('@')[0],
            handle: '@' + (fullName ? fullName.toLowerCase().replace(/\s+/g, '_') : 'user'),
            email: email,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
          }
        }
      };
    }
  }
};

// ─── Admin API ────────────────────────────────────────────────────────────────
export const adminApi = {
  async getStats() {
    try {
      const response = await fetch(`${BASE_URL}/admin/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn('Admin stats API unavailable, using mock data:', error.message);
      // Fallback mock data for development
      const makeGrowth = (base) => {
        const now = new Date();
        return Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
          return {
            label: `Th${d.getMonth() + 1}/${d.getFullYear()}`,
            count: Math.floor(base * (0.5 + Math.random()))
          };
        });
      };
      return {
        totalUsers: 1,
        newUsersThisMonth: 1,
        totalPosts: 0,
        newPostsThisMonth: 0,
        totalPlaces: 0,
        totalItineraries: 0,
        newItinerariesThisMonth: 0,
        activeItineraries: 0,
        totalLikes: 0,
        totalComments: 0,
        averagePlaceRating: 0,
        userGrowth: makeGrowth(5),
        postGrowth: makeGrowth(10),
        topDestinations: [],
        topPlaces: []
      };
    }
  }
};

// ─── Notification API (M08) ──────────────────────────────────────────────────
export const INITIAL_MOCK_NOTIFICATIONS = [
  {
    id: 1,
    recipientId: 1,
    actorId: 2,
    actorName: 'Linh Hoàng',
    actorHandle: '@linh_hoang92',
    actorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    type: 'AI_READY',
    message: 'Trợ lý AI đã tạo xong toàn bộ lịch trình chi tiết 3N2Đ Đà Nẵng - Hội An cho bạn!',
    targetUrl: '/itineraries',
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    recipientId: 1,
    actorId: 2,
    actorName: 'Linh Hoàng',
    actorHandle: '@linh_hoang92',
    actorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    type: 'LIKE',
    message: 'Linh Hoàng đã thích bài viết review "Săn mây Tà Xùa - Hướng dẫn chi tiết từ A-Z" của bạn.',
    targetUrl: '/community',
    isRead: false,
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    recipientId: 1,
    actorId: 3,
    actorName: 'Hoàng Nam',
    actorHandle: '@namwanderer',
    actorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    type: 'COMMENT',
    message: 'Hoàng Nam đã bình luận: "Cung đường này đi xe máy có khó khăn vào mùa mưa không bạn?"',
    targetUrl: '/community',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 4,
    recipientId: 1,
    actorId: 4,
    actorName: 'Minh Anh',
    actorHandle: '@minh_anh',
    actorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    type: 'CHAT_INVITE',
    message: 'Bạn đã được mời tham gia nhóm chuyến đi: "Phượt Cực Bắc - Mùa Hoa Tam Giác Mạch".',
    targetUrl: '/messages',
    isRead: true,
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
  },
  {
    id: 5,
    recipientId: 1,
    actorId: null,
    actorName: 'Ban Quản Trị Wayfare',
    actorHandle: '@wayfare_admin',
    actorAvatar: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=300&q=80',
    type: 'PLACE_APPROVED',
    message: 'Địa điểm "Tiệm Cafe Túi Mơ To (Đà Lạt)" do bạn đề xuất đã được duyệt hiển thị trên bản đồ!',
    targetUrl: '/explore',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    id: 6,
    recipientId: 1,
    actorId: null,
    actorName: 'Hệ Thống WanderAI',
    actorHandle: '@wanderai_engine',
    actorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    type: 'SYSTEM',
    message: 'Bản cập nhật WanderAI Core v2.4-turbo: Nâng cấp Semantic Cache giúp tăng 60% tốc độ tạo lịch trình.',
    targetUrl: '/ai-config',
    isRead: true,
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  }
];

const LOCAL_NOTIF_KEY = 'wayfare_notifications_store_v1';

const getStoredLocalNotifications = () => {
  try {
    const raw = localStorage.getItem(LOCAL_NOTIF_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_NOTIF_KEY, JSON.stringify(INITIAL_MOCK_NOTIFICATIONS));
      return INITIAL_MOCK_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MOCK_NOTIFICATIONS;
  }
};

const saveStoredLocalNotifications = (list) => {
  try {
    localStorage.setItem(LOCAL_NOTIF_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save notifications to localStorage', e);
  }
};

export const notificationApi = {
  // Fetch list of notifications
  async getNotifications(email = 'admin@gmail.com') {
    try {
      const response = await fetch(`${BASE_URL}/notifications?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        saveStoredLocalNotifications(data);
        return { isBackend: true, data };
      }
      return { isBackend: true, data };
    } catch (err) {
      console.warn('Real backend notifications unavailable, using local mock notifications fallback:', err.message);
      return { isBackend: false, data: getStoredLocalNotifications() };
    }
  },

  // Mark a single notification as read
  async markAsRead(id, email = 'admin@gmail.com') {
    try {
      const response = await fetch(`${BASE_URL}/notifications/${id}/read?email=${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const updated = await response.json();
      return { isBackend: true, data: updated };
    } catch (err) {
      const list = getStoredLocalNotifications().map(n => (n.id === id ? { ...n, isRead: true } : n));
      saveStoredLocalNotifications(list);
      return { isBackend: false, data: list.find(n => n.id === id) };
    }
  },

  // Mark all notifications as read
  async markAllAsRead(email = 'admin@gmail.com') {
    try {
      const response = await fetch(`${BASE_URL}/notifications/read-all?email=${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return { isBackend: true };
    } catch (err) {
      const list = getStoredLocalNotifications().map(n => ({ ...n, isRead: true }));
      saveStoredLocalNotifications(list);
      return { isBackend: false };
    }
  },

  // Delete a notification
  async deleteNotification(id, email = 'admin@gmail.com') {
    try {
      const response = await fetch(`${BASE_URL}/notifications/${id}?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return { isBackend: true };
    } catch (err) {
      const list = getStoredLocalNotifications().filter(n => n.id !== id);
      saveStoredLocalNotifications(list);
      return { isBackend: false };
    }
  },

  // Create test / real push notification
  async createTestNotification(payload, email = 'admin@gmail.com') {
    try {
      const response = await fetch(`${BASE_URL}/notifications/test?email=${encodeURIComponent(email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const created = await response.json();
      return { isBackend: true, data: created };
    } catch (err) {
      const newNotif = {
        id: Date.now(),
        recipientId: 1,
        actorId: null,
        actorName: payload.actorName || 'Hệ Thống Wayfare',
        actorHandle: payload.actorHandle || '@wayfare_live',
        actorAvatar: payload.actorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        type: payload.type || 'SYSTEM',
        message: payload.message || 'Thông báo thử nghiệm mới.',
        targetUrl: payload.targetUrl || '/community',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      const list = [newNotif, ...getStoredLocalNotifications()];
      saveStoredLocalNotifications(list);
      return { isBackend: false, data: newNotif };
    }
  }
};
