export const BASE_URL = (() => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return 'http://localhost:8081/api';
  return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
})();

// ─── Core Auth & User Storage Helpers ─────────────────────────────────────────
export function getStoredUser() {
  try {
    const raw = localStorage.getItem('wayfare_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('Error reading wayfare_user from localStorage', e);
    return null;
  }
}

export function getAuthToken() {
  const user = getStoredUser();
  return user?.token || null;
}

export function getAuthHeader() {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Global fetch wrapper with 401 Unauthorized handling
const nativeFetch = typeof window !== 'undefined' ? window.fetch.bind(window) : globalThis.fetch.bind(globalThis);
const fetch = async (url, options) => {
  const response = await nativeFetch(url, options);
  if (response.status === 401) {
    const urlStr = typeof url === 'string' ? url : (url?.url || '');
    if (!urlStr.includes('/auth/login') && !urlStr.includes('/auth/register')) {
      console.warn('[Wayfare API] 401 Unauthorized detected from endpoint:', urlStr);
      try {
        localStorage.removeItem('wayfare_user');
        localStorage.removeItem('wayfare_auth');
        localStorage.removeItem('token');
      } catch (e) {
        console.warn('Could not clean auth storage on 401', e);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('wayfare:unauthorized', { detail: { endpoint: urlStr } }));
      }
    }
  }
  return response;
};

export const authApi = {
  // Login API Call
  async login(email, password) {
    let response;
    try {
      response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
    } catch (networkError) {
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng hoặc thử lại sau!');
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error('Phản hồi từ máy chủ không hợp lệ.');
    }

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Email hoặc mật khẩu không chính xác!');
    }

    return data;
  },

  // Register API Call
  async register(fullName, email, password) {
    let response;
    try {
      response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password })
      });
    } catch (networkError) {
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng hoặc thử lại sau!');
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error('Phản hồi từ máy chủ không hợp lệ.');
    }

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Đăng ký tài khoản không thành công!');
    }

    return data;
  },

  // Logout API Call (Ghi nhận nhật ký kiểm toán hệ thống & cập nhật trạng thái offline)
  async logout(email) {
    try {
      const user = getStoredUser();
      const userEmail = email || user?.email || '';
      const response = await fetch(`${BASE_URL}/auth/logout?email=${encodeURIComponent(userEmail)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      if (!response.ok) {
        console.warn('Backend logout response not OK:', response.status);
      }
      return true;
    } catch (error) {
      console.warn('Backend API connection warning on logout:', error.message);
      return false;
    }
  },

  // Google OAuth Login API Call
  async loginWithGoogle(idToken) {
    let response;
    try {
      response = await fetch(`${BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });
    } catch (networkError) {
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng hoặc thử lại sau!');
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error('Phản hồi từ máy chủ không hợp lệ.');
    }

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Xác thực tài khoản Google không thành công!');
    }

    return data;
  }
};

// ─── Admin API ────────────────────────────────────────────────────────────────
export const adminApi = {
  async getStats() {
    const response = await fetch(`${BASE_URL}/admin/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    if (!response.ok) {
      throw new Error(`Không thể lấy số liệu thống kê (Mã lỗi: ${response.status})`);
    }
    return await response.json();
  },

  async getAllItineraries() {
    try {
      const response = await fetch(`${BASE_URL}/itineraries/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const res = await response.json();
      return res.data || [];
    } catch (err) {
      console.warn('Admin getAllItineraries API warning:', err.message);
      return [];
    }
  }
};

// ─── Itineraries API ─────────────────────────────────────────────────────────
export const itineraryApi = {
  async getAllItineraries() {
    try {
      const response = await fetch(`${BASE_URL}/itineraries/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const res = await response.json();
      return res.data || [];
    } catch (err) {
      console.warn('getAllItineraries API warning:', err.message);
      return [];
    }
  },

  async getMyItineraries(email) {
    try {
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user?.email || '';
      if (!userEmail) return [];
      const response = await fetch(`${BASE_URL}/itineraries?email=${encodeURIComponent(userEmail)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const res = await response.json();
      return res.data || [];
    } catch (err) {
      console.warn('getMyItineraries API warning:', err.message);
      return [];
    }
  },

  async createItinerary(payload, email) {
    const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
    const userEmail = email || user?.email || '';
    const response = await fetch(`${BASE_URL}/itineraries?email=${encodeURIComponent(userEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${response.status}`);
    }
    const res = await response.json();
    return res.data;
  },

  async getItineraryById(id, email) {
    const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
    const userEmail = email || user?.email || '';
    const response = await fetch(`${BASE_URL}/itineraries/${id}?email=${encodeURIComponent(userEmail)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${response.status}`);
    }
    const res = await response.json();
    return res.data;
  },

  async updateItinerary(id, payload, email) {
    const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
    const userEmail = email || user?.email || '';
    const response = await fetch(`${BASE_URL}/itineraries/${id}?email=${encodeURIComponent(userEmail)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${response.status}`);
    }
    const res = await response.json();
    return res.data;
  },

  /**
   * Thêm một điểm dừng chân vào lịch trình có sẵn (đúng hợp đồng backend /
   * đối ứng mobile: POST /itineraries/{id}/details). Trả về ItineraryDetailItem.
   */
  async addItineraryDetail(id, detail, email) {
    const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
    const userEmail = email || user?.email || '';
    const response = await fetch(`${BASE_URL}/itineraries/${id}/details?email=${encodeURIComponent(userEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(detail)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${response.status}`);
    }
    const res = await response.json();
    return res.data;
  },

  async deleteItinerary(id, email) {
    const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
    const userEmail = email || user?.email || '';
    const response = await fetch(`${BASE_URL}/itineraries/${id}?email=${encodeURIComponent(userEmail)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${response.status}`);
    }
    const res = await response.json();
    return res.data;
  },

  async cloneItinerary(id, email) {
    const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
    const userEmail = email || user?.email || '';
    const response = await fetch(`${BASE_URL}/itineraries/${id}/clone?email=${encodeURIComponent(userEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${response.status}`);
    }
    const res = await response.json();
    return res.data;
  },

  async aiQuickGenerate(payload, email) {
    const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
    const userEmail = email || user?.email || '';
    const response = await fetch(`${BASE_URL}/itineraries/ai-quick-generate?email=${encodeURIComponent(userEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${response.status}`);
    }
    const res = await response.json();
    return res.data;
  }
};

// ─── Home Page API ───────────────────────────────────────────────────────────
export const homeApi = {
  async getStats() {
    try {
      const res = await fetch(`${BASE_URL}/home/stats`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('Home stats API warning:', err.message);
      return {
        totalItineraries: 128,
        totalPlaces: 84,
        totalPosts: 320,
        totalUsers: 1450,
        totalLikes: 5240,
        totalComments: 1890
      };
    }
  },

  async getFeaturedItineraries(region = 'all') {
    try {
      const res = await fetch(`${BASE_URL}/home/featured-itineraries?region=${encodeURIComponent(region)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn('Featured itineraries API warning:', err.message);
      return [];
    }
  },

  async getCommunityHighlights() {
    try {
      const res = await fetch(`${BASE_URL}/home/community-highlights`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn('Community highlights API warning:', err.message);
      return [];
    }
  },

  async getTrendingDestinations() {
    try {
      const res = await fetch(`${BASE_URL}/home/trending-destinations`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      return ['Đà Lạt', 'Phú Quốc', 'Sa Pa', 'Đà Nẵng & Hội An', 'Mù Cang Chải', 'Ninh Bình'];
    }
  }
};

// ─── Admin Users & RBAC API (A03) ─────────────────────────────────────────────
export const adminUserApi = {
  async getUsers({ keyword = '', role = '', status = '' } = {}) {
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (role && role !== 'all') params.append('role', role);
      if (status && status !== 'all') params.append('status', status);

      const response = await fetch(`${BASE_URL}/admin/users?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.warn('Admin users API unavailable:', error.message);
      return [];
    }
  },

  async getUserMetrics() {
    try {
      const response = await fetch(`${BASE_URL}/admin/users/metrics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const result = await response.json();
      return result.data || {
        totalUsers: 0,
        activeUsers: 0,
        lockedUsers: 0,
        adminCount: 0,
        newUsersToday: 0
      };
    } catch (error) {
      console.warn('Admin user metrics API unavailable:', error.message);
      return {
        totalUsers: 0,
        activeUsers: 0,
        lockedUsers: 0,
        adminCount: 0,
        newUsersToday: 0
      };
    }
  },

  async getUserById(id) {
    const response = await fetch(`${BASE_URL}/admin/users/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const result = await response.json();
    return result.data;
  },

  async toggleUserStatus(id) {
    const response = await fetch(`${BASE_URL}/admin/users/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  },

  async updateUserRole(id, role) {
    const response = await fetch(`${BASE_URL}/admin/users/${id}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ role })
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  },

  async createUser(payload) {
    const response = await fetch(`${BASE_URL}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `HTTP ${response.status}`);
    }
    return await response.json();
  }
};

// ─── Admin Content & Reports Moderation API (A04) ─────────────────────────────
export const adminReportApi = {
  async getMetrics() {
    try {
      const response = await fetch(`${BASE_URL}/admin/reports/metrics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const res = await response.json();
      return res.data || {
        totalPostsToday: 0,
        pendingReportsCount: 0,
        hiddenPostsCount: 0,
        safeRate: 98.4,
        growthPercent: 12,
        totalArticlesCount: 0
      };
    } catch (err) {
      console.warn('Admin report metrics API warning:', err.message);
      return {
        totalPostsToday: 0,
        pendingReportsCount: 0,
        hiddenPostsCount: 0,
        safeRate: 98.4,
        growthPercent: 12,
        totalArticlesCount: 0
      };
    }
  },

  async getPendingReports(keyword = '') {
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      const response = await fetch(`${BASE_URL}/admin/reports/pending?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const res = await response.json();
      return res.data || [];
    } catch (err) {
      console.warn('Pending reports API warning:', err.message);
      return [];
    }
  },

  async getAllArticles({ keyword = '', status = 'all' } = {}) {
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (status && status !== 'all') params.append('status', status);
      const response = await fetch(`${BASE_URL}/admin/reports/all?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const res = await response.json();
      return res.data || [];
    } catch (err) {
      console.warn('All articles API warning:', err.message);
      return [];
    }
  },

  async approvePost(postId) {
    const response = await fetch(`${BASE_URL}/admin/reports/${postId}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async dismissReport(postId) {
    const response = await fetch(`${BASE_URL}/admin/reports/${postId}/dismiss`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async hidePost(postId) {
    const response = await fetch(`${BASE_URL}/admin/reports/${postId}/hide`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async removePostAndBanAuthor(postId) {
    const response = await fetch(`${BASE_URL}/admin/reports/${postId}/remove-and-ban`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async deletePost(postId) {
    const response = await fetch(`${BASE_URL}/admin/reports/${postId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  }
};

// ─── Notification API ────────────────────────────────────────────────────────
const getCurrentUserEmail = () => {
  try {
    const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
    return user?.email || '';
  } catch {
    return '';
  }
};

export const notificationApi = {
  // Fetch list of notifications
  async getNotifications(email = getCurrentUserEmail()) {
    if (!email) {
      return { isBackend: true, data: [] };
    }
    const response = await fetch(`${BASE_URL}/notifications?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { isBackend: true, data: [] };
      }
      throw new Error(`Lỗi lấy thông báo: HTTP ${response.status}`);
    }
    const data = await response.json();
    return { isBackend: true, data: Array.isArray(data) ? data : [] };
  },

  // Get unread notification count
  async getUnreadCount(email = getCurrentUserEmail()) {
    if (!email) {
      return { isBackend: true, count: 0 };
    }
    const response = await fetch(`${BASE_URL}/notifications/unread-count?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { isBackend: true, count: 0 };
      }
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    const count = typeof data.unreadCount === 'number' ? data.unreadCount : (typeof data.count === 'number' ? data.count : 0);
    return { isBackend: true, count };
  },

  // Mark a single notification as read
  async markAsRead(id, email = getCurrentUserEmail()) {
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
  },

  // Mark all notifications as read
  async markAllAsRead(email = getCurrentUserEmail()) {
    const response = await fetch(`${BASE_URL}/notifications/read-all?email=${encodeURIComponent(email)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return { isBackend: true };
  },

  // Delete a notification
  async deleteNotification(id, email = getCurrentUserEmail()) {
    const response = await fetch(`${BASE_URL}/notifications/${id}?email=${encodeURIComponent(email)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return { isBackend: true };
  },

  // Create test / real push notification
  async createTestNotification(payload, email = getCurrentUserEmail()) {
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
  },

  // Broadcast a notification to all users (Admin only)
  async broadcastNotification(payload) {
    const senderEmail = payload.senderEmail || getCurrentUserEmail();
    const response = await fetch(`${BASE_URL}/notifications/broadcast?email=${encodeURIComponent(senderEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({
        type: payload.type || 'SYSTEM',
        message: payload.message,
        targetUrl: payload.targetUrl || '/'
      })
    });
    if (!response.ok) throw new Error(`Phát sóng thông báo thất bại: HTTP ${response.status}`);
    const data = await response.json();
    return { isBackend: true, data };
  }
};

// ─── AUDIT LOGS API ─────────────────────────────────────────────────────────
export const auditLogApi = {
  async getLogs({ keyword = '', userId = '', action = '', category = '', page = 0, size = 15 } = {}) {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (userId) params.append('userId', userId);
    if (action && action !== 'ALL') params.append('action', action);
    if (category && category !== 'ALL') params.append('category', category);
    params.append('page', page);
    params.append('size', size);

    try {
      const res = await fetch(`${BASE_URL}/admin/audit-logs?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('API error fetching audit logs:', err.message);
      return { content: [], totalElements: 0, totalPages: 0, number: 0 };
    }
  },

  async getActions() {
    try {
      const res = await fetch(`${BASE_URL}/admin/audit-logs/actions`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn('API error fetching audit actions:', err.message);
      return [];
    }
  },

  async getStats() {
    try {
      const res = await fetch(`${BASE_URL}/admin/audit-logs/stats`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data || {};
    } catch (err) {
      console.warn('API error fetching audit stats:', err.message);
      return {};
    }
  },

  async downloadLogFile(category = 'ALL') {
    const res = await fetch(`${BASE_URL}/admin/audit-logs/download?category=${category}`, {
      headers: {
        ...getAuthHeader()
      }
    });
    if (!res.ok) throw new Error(`Tải file log thất bại: HTTP ${res.status}`);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wayfare-${category.toLowerCase()}-${Date.now()}.log`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};

// ─── Community Posts & Social Interaction API ────────────────────────────────
export const postApi = {
  async getPosts({ category = '', keyword = '', email = '' } = {}) {
    try {
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user.email || '';
      const params = new URLSearchParams();
      if (category && category !== 'Tất cả') params.append('category', category);
      if (keyword) params.append('keyword', keyword);
      if (userEmail) params.append('email', userEmail);

      const res = await fetch(`${BASE_URL}/posts?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn('API error fetching community posts:', err.message);
      return [];
    }
  },

  async getPostById(id, email = '') {
    try {
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user.email || '';
      const url = userEmail
        ? `${BASE_URL}/posts/${id}?email=${encodeURIComponent(userEmail)}`
        : `${BASE_URL}/posts/${id}`;
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('API error fetching post detail:', err.message);
      return null;
    }
  },

  async createPost(payload, email = '') {
    const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
    const userEmail = email || user.email || '';
    const url = userEmail
      ? `${BASE_URL}/posts?email=${encodeURIComponent(userEmail)}`
      : `${BASE_URL}/posts`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || `HTTP error ${res.status}`);
    return json.data;
  },

  async toggleLike(postId, email = '') {
    const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
    const userEmail = email || user.email || '';
    const url = userEmail
      ? `${BASE_URL}/posts/${postId}/like?email=${encodeURIComponent(userEmail)}`
      : `${BASE_URL}/posts/${postId}/like`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || `HTTP error ${res.status}`);
    return json.data;
  },

  async toggleBookmark(postId, email = '') {
    const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
    const userEmail = email || user.email || '';
    const url = userEmail
      ? `${BASE_URL}/posts/${postId}/bookmark?email=${encodeURIComponent(userEmail)}`
      : `${BASE_URL}/posts/${postId}/bookmark`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || `HTTP error ${res.status}`);
    return json.data;
  },

  async getBookmarkedPostIds(email = '') {
    try {
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user.email || '';
      const url = userEmail
        ? `${BASE_URL}/posts/bookmarked/ids?email=${encodeURIComponent(userEmail)}`
        : `${BASE_URL}/posts/bookmarked/ids`;
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn('API error fetching bookmarked post IDs:', err.message);
      return [];
    }
  },

  async getBookmarkedPosts(email = '') {
    try {
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user.email || '';
      const url = userEmail
        ? `${BASE_URL}/posts/bookmarked?email=${encodeURIComponent(userEmail)}`
        : `${BASE_URL}/posts/bookmarked`;
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn('API error fetching bookmarked posts:', err.message);
      return [];
    }
  },

  async getComments(postId) {
    try {
      const res = await fetch(`${BASE_URL}/posts/${postId}/comments`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn('API error fetching post comments:', err.message);
      return [];
    }
  },

  async addComment(postId, payload, email = '') {
    const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
    const userEmail = email || user.email || '';
    const url = userEmail
      ? `${BASE_URL}/posts/${postId}/comments?email=${encodeURIComponent(userEmail)}`
      : `${BASE_URL}/posts/${postId}/comments`;

    const bodyObj = typeof payload === 'string' ? { content: payload } : payload;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(bodyObj)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || `HTTP error ${res.status}`);
    return json.data;
  },

  async cloneItinerary(postId) {
    const res = await fetch(`${BASE_URL}/posts/${postId}/clone-itinerary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || `HTTP error ${res.status}`);
    return json.data;
  },

  async deleteComment(postId, commentId, email = '') {
    const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
    const userEmail = email || user.email || '';
    const url = userEmail
      ? `${BASE_URL}/posts/${postId}/comments/${commentId}?email=${encodeURIComponent(userEmail)}`
      : `${BASE_URL}/posts/${postId}/comments/${commentId}`;

    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || `HTTP error ${res.status}`);
    return json.data;
  },

  async reportPost(postId, payload, email = '') {
    const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
    const userEmail = email || user.email || '';
    const url = userEmail
      ? `${BASE_URL}/posts/${postId}/report?email=${encodeURIComponent(userEmail)}`
      : `${BASE_URL}/posts/${postId}/report`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || `HTTP error ${res.status}`);
    return json.data;
  },

  async update(id, payload, email = '') {
    const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
    const userEmail = email || user.email || '';
    const url = userEmail
      ? `${BASE_URL}/posts/${id}?email=${encodeURIComponent(userEmail)}`
      : `${BASE_URL}/posts/${id}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || `HTTP error ${res.status}`);
    return json.data;
  },

  async updateVisibility(id, visibility, email = '') {
    const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
    const userEmail = email || user.email || '';
    const url = userEmail
      ? `${BASE_URL}/posts/${id}/visibility?visibility=${encodeURIComponent(visibility)}&email=${encodeURIComponent(userEmail)}`
      : `${BASE_URL}/posts/${id}/visibility?visibility=${encodeURIComponent(visibility)}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || `HTTP error ${res.status}`);
    return json.data;
  },

  async delete(id, email = '') {
    const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
    const userEmail = email || user.email || '';
    const url = userEmail
      ? `${BASE_URL}/posts/${id}?email=${encodeURIComponent(userEmail)}`
      : `${BASE_URL}/posts/${id}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || `HTTP error ${res.status}`);
    return json.data;
  }
};

// ─── File Upload API (Images & Videos - Cloudinary CDN / Local Fallback) ──────
export const uploadApi = {
  async getStorageStatus() {
    try {
      const res = await fetch(`${BASE_URL}/upload/status`);
      if (!res.ok) return { provider: 'LOCAL_DISK', isCloudinaryActive: false };
      const json = await res.json();
      return json.data || { provider: 'LOCAL_DISK', isCloudinaryActive: false };
    } catch {
      return { provider: 'LOCAL_DISK', isCloudinaryActive: false };
    }
  },

  async uploadSingle(file) {
    const formData = new FormData();
    formData.append('file', file);
    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      headers,
      body: formData
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || `HTTP error ${res.status}`);
    return json.data;
  },

  async uploadFiles(fileList) {
    const formData = new FormData();
    for (let i = 0; i < fileList.length; i++) {
      formData.append('files', fileList[i]);
    }
    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}/upload/multiple`, {
      method: 'POST',
      headers,
      body: formData
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || `HTTP error ${res.status}`);
    return json.data || [];
  }
};

// ─── User Profile & Follow API ────────────────────────────────────────────────
export const userApi = {
  async getProfile(userId, email) {
    const user = getStoredUser() || {};
    const userEmail = email || user.email || '';
    const qs = userEmail ? `?email=${encodeURIComponent(userEmail)}` : '';
    const res = await fetch(`${BASE_URL}/users/${userId}/profile${qs}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || `HTTP error ${res.status}`);
    return json.data;
  },

  async updateProfile(profileData, email) {
    const user = getStoredUser() || {};
    const userEmail = email || user.email || '';
    const qs = userEmail ? `?email=${encodeURIComponent(userEmail)}` : '';
    const res = await fetch(`${BASE_URL}/users/profile${qs}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(profileData)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || `HTTP error ${res.status}`);
    return json.data;
  },

  async toggleFollow(userId, email) {
    const user = getStoredUser() || {};
    const userEmail = email || user.email || '';
    const qs = userEmail ? `?email=${encodeURIComponent(userEmail)}` : '';
    const res = await fetch(`${BASE_URL}/users/${userId}/follow${qs}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || `HTTP error ${res.status}`);
    return json.data;
  },

  async getFollowingIds(email) {
    try {
      const user = getStoredUser() || {};
      const userEmail = email || user.email || '';
      const qs = userEmail ? `?email=${encodeURIComponent(userEmail)}` : '';
      const res = await fetch(`${BASE_URL}/users/following/ids${qs}`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn('API error fetching following user IDs:', err.message);
      return [];
    }
  },

  async getMyProfile(email) {
    try {
      const user = getStoredUser() || {};
      const userEmail = email || user.email || '';
      const qs = userEmail ? `?email=${encodeURIComponent(userEmail)}` : '';
      const res = await fetch(`${BASE_URL}/users/me${qs}`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('API error fetching my profile:', err.message);
      return null;
    }
  },

  async getFollowing(userId, email) {
    try {
      const user = getStoredUser() || {};
      const userEmail = email || user.email || '';
      const qs = userEmail ? `?email=${encodeURIComponent(userEmail)}` : '';
      const hasNumericId = userId && !isNaN(Number(userId)) && Number(userId) > 0;
      const url = hasNumericId
        ? `${BASE_URL}/users/${userId}/following${qs}`
        : `${BASE_URL}/users/following${qs}`;
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn('API error fetching following list:', err.message);
      return [];
    }
  },

  async getFollowers(userId, email) {
    try {
      const user = getStoredUser() || {};
      const userEmail = email || user.email || '';
      const qs = userEmail ? `?email=${encodeURIComponent(userEmail)}` : '';
      const hasNumericId = userId && !isNaN(Number(userId)) && Number(userId) > 0;
      const url = hasNumericId
        ? `${BASE_URL}/users/${userId}/followers${qs}`
        : `${BASE_URL}/users/followers${qs}`;
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn('API error fetching followers list:', err.message);
      return [];
    }
  }
};

export const placeApi = {
  async getPlaces({ city, category, status, keyword } = {}) {
    try {
      const params = new URLSearchParams();
      if (city && city !== 'Tất cả') params.append('city', city);
      if (category && category !== 'Tất cả') params.append('category', category);
      if (status && status !== 'Tất cả') params.append('status', status);
      if (keyword) params.append('keyword', keyword);

      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${BASE_URL}/places${qs}`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn('API error fetching places:', err.message);
      return [];
    }
  },

  /**
   * Lấy địa điểm có phân trang phía server.
   * Trả về { items, page, size, totalElements, totalPages, hasNext } hoặc null nếu lỗi.
   */
  async getPlacesPaged({ page = 0, size = 50, city, category, status, keyword } = {}) {
    try {
      const params = new URLSearchParams();
      params.append('page', String(Math.max(page, 0)));
      params.append('size', String(Math.max(size, 1)));
      if (city && city !== 'Tất cả') params.append('city', city);
      if (category && category !== 'Tất cả') params.append('category', category);
      if (status && status !== 'Tất cả') params.append('status', status);
      if (keyword) params.append('keyword', keyword);

      const res = await fetch(`${BASE_URL}/places?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data || null;
    } catch (err) {
      console.warn('API error fetching paged places:', err.message);
      return null;
    }
  },

  async getPlaceById(id) {
    try {
      const res = await fetch(`${BASE_URL}/places/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn(`API error fetching place #${id}:`, err.message);
      return null;
    }
  },

  async createPlace(placeData, email) {
    try {
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user?.email || '';
      const res = await fetch(`${BASE_URL}/places?email=${encodeURIComponent(userEmail)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(placeData)
      });
      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.message || `HTTP error ${res.status}`);
      }
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.error('API error creating place:', err.message);
      throw err;
    }
  },

  async getMyPlaces(email) {
    try {
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user?.email || '';
      const res = await fetch(`${BASE_URL}/places/my-places?email=${encodeURIComponent(userEmail)}`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn('API error fetching my places:', err.message);
      return [];
    }
  },

  async updatePlaceStatus(id, status) {
    try {
      const res = await fetch(`${BASE_URL}/places/${id}/status?status=${encodeURIComponent(status)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.error(`API error updating place #${id} status:`, err.message);
      throw err;
    }
  },

  async getPendingPlaces() {
    try {
      const res = await fetch(`${BASE_URL}/places/admin/pending`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn('API error fetching pending places:', err.message);
      return [];
    }
  },

  async approvePlace(id) {
    try {
      const res = await fetch(`${BASE_URL}/places/admin/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.error(`API error approving place #${id}:`, err.message);
      throw err;
    }
  },

  async rejectPlace(id, reason = 'Thông tin chưa hợp lệ') {
    try {
      const res = await fetch(`${BASE_URL}/places/admin/${id}/reject?reason=${encodeURIComponent(reason)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.error(`API error rejecting place #${id}:`, err.message);
      throw err;
    }
  },

  async deletePlace(id, email) {
    try {
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user?.email || '';
      const res = await fetch(`${BASE_URL}/places/${id}?email=${encodeURIComponent(userEmail)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json;
    } catch (err) {
      console.error(`API error deleting place #${id}:`, err.message);
      throw err;
    }
  }
};

export const reviewApi = {
  async getReviews(placeId) {
    try {
      const res = await fetch(`${BASE_URL}/places/${placeId}/reviews`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn(`API error fetching reviews for place #${placeId}:`, err.message);
      return [];
    }
  },

  async addReview(placeId, { rating, comment }, email) {
    try {
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user?.email || '';
      const res = await fetch(`${BASE_URL}/places/${placeId}/reviews?email=${encodeURIComponent(userEmail)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ rating: Number(rating), comment: String(comment || '').trim() })
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `HTTP error ${res.status}`);
      }
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.error(`API error adding review for place #${placeId}:`, err.message);
      throw err;
    }
  },

  async deleteReview(reviewId, email) {
    try {
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user?.email || '';
      const res = await fetch(`${BASE_URL}/places/reviews/${reviewId}?email=${encodeURIComponent(userEmail)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json;
    } catch (err) {
      console.error(`API error deleting review #${reviewId}:`, err.message);
      throw err;
    }
  }
};

// ─── Real-Time Chat API (Group & Direct Rooms, Cloud Media) ───────────────────
export const chatApi = {
  async getRooms(email) {
    try {
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user?.email || '';
      const res = await fetch(`${BASE_URL}/chat/rooms?email=${encodeURIComponent(userEmail)}`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.error('API error fetching chat rooms:', err);
      throw err;
    }
  },

  async getRoomMessages(roomId, email) {
    try {
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user?.email || '';
      const res = await fetch(`${BASE_URL}/chat/rooms/${roomId}/messages?email=${encodeURIComponent(userEmail)}`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.error(`API error fetching messages for room ${roomId}:`, err);
      throw err;
    }
  },

  async sendMessage(roomId, { content, messageType = 'TEXT' }, email) {
    try {
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user?.email || '';
      const res = await fetch(`${BASE_URL}/chat/rooms/${roomId}/messages?email=${encodeURIComponent(userEmail)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ content, messageType })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.error(`API error sending message to room ${roomId}:`, err);
      throw err;
    }
  },

  async openDirectRoom(targetUserId, email) {
    try {
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user?.email || '';
      const res = await fetch(`${BASE_URL}/chat/direct?targetUserId=${targetUserId}&email=${encodeURIComponent(userEmail)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.error(`API error opening direct room with user ${targetUserId}:`, err);
      throw err;
    }
  },

  async openItineraryRoom(itineraryId, email) {
    try {
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user?.email || '';
      const res = await fetch(`${BASE_URL}/chat/itinerary/${itineraryId}?email=${encodeURIComponent(userEmail)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.error(`API error opening itinerary room ${itineraryId}:`, err);
      throw err;
    }
  },

  async createRoom(roomData, email) {
    try {
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user?.email || '';
      const res = await fetch(`${BASE_URL}/chat/rooms?email=${encodeURIComponent(userEmail)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(roomData)
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || `HTTP error ${res.status}`);
      }
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.error('API error creating chat room:', err);
      throw err;
    }
  },

  async deleteRoom(roomId, email) {
    try {
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user?.email || '';
      const res = await fetch(`${BASE_URL}/chat/rooms/${roomId}?email=${encodeURIComponent(userEmail)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || `HTTP error ${res.status}`);
      }
      return true;
    } catch (err) {
      console.error(`API error deleting room ${roomId}:`, err);
      throw err;
    }
  },

  async getAvailableUsers(keyword = '', email) {
    try {
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user?.email || '';
      const qs = keyword ? `&keyword=${encodeURIComponent(keyword)}` : '';
      const res = await fetch(`${BASE_URL}/chat/available-users?email=${encodeURIComponent(userEmail)}${qs}`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.error('API error fetching available users:', err);
      return [];
    }
  },

  async getRoomMembers(roomId, email) {
    try {
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user?.email || '';
      const res = await fetch(`${BASE_URL}/chat/rooms/${roomId}/members?email=${encodeURIComponent(userEmail)}`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || `HTTP error ${res.status}`);
      }
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.error(`API error fetching members for room ${roomId}:`, err);
      throw err;
    }
  },

  async addMembers(roomId, memberIds = [], email) {
    try {
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user?.email || '';
      const res = await fetch(`${BASE_URL}/chat/rooms/${roomId}/members?email=${encodeURIComponent(userEmail)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ memberIds })
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || `HTTP error ${res.status}`);
      }
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.error(`API error adding members to room ${roomId}:`, err);
      throw err;
    }
  },

  async removeMember(roomId, targetUserId, email) {
    try {
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user?.email || '';
      const res = await fetch(`${BASE_URL}/chat/rooms/${roomId}/members/${targetUserId}?email=${encodeURIComponent(userEmail)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || `HTTP error ${res.status}`);
      }
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.error(`API error removing member ${targetUserId} from room ${roomId}:`, err);
      throw err;
    }
  }
};



