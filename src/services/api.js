export const BASE_URL = (() => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return 'http://localhost:8081/api';
  return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
})();

export function getBackendBaseUrl() {
  return BASE_URL.replace(/\/api\/?$/, '');
}

export function normalizeMediaUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (/^http:\/\/localhost(:\d+)?\/uploads\//i.test(url)) {
    const backendBase = getBackendBaseUrl();
    if (!backendBase.includes('localhost')) {
      return url.replace(/^http:\/\/localhost(:\d+)?/i, backendBase);
    }
  }
  return url;
}

export function normalizePost(post) {
  if (!post || typeof post !== 'object') return post;
  const normalized = { ...post };
  if (normalized.imageUrl) normalized.imageUrl = normalizeMediaUrl(normalized.imageUrl);
  if (Array.isArray(normalized.images)) {
    normalized.images = normalized.images.map(normalizeMediaUrl);
  }
  if (Array.isArray(normalized.mediaUrls)) {
    normalized.mediaUrls = normalized.mediaUrls.map(normalizeMediaUrl);
  }
  if (normalized.videoUrl) normalized.videoUrl = normalizeMediaUrl(normalized.videoUrl);
  if (normalized.authorAvatar) normalized.authorAvatar = normalizeMediaUrl(normalized.authorAvatar);
  if (normalized.author?.avatar) {
    normalized.author = { ...normalized.author, avatar: normalizeMediaUrl(normalized.author.avatar) };
  }
  if (normalized.author?.avatarUrl) {
    normalized.author = { ...normalized.author, avatarUrl: normalizeMediaUrl(normalized.author.avatarUrl) };
  }
  if (normalized.placeCoverImageUrl) normalized.placeCoverImageUrl = normalizeMediaUrl(normalized.placeCoverImageUrl);
  if (normalized.sharedPost) {
    normalized.sharedPost = normalizePost(normalized.sharedPost);
  }
  return normalized;
}

// ─── Core Auth & User Storage Helpers ─────────────────────────────────────────
export function getStoredUser() {
  try {
    const raw = localStorage.getItem('wayfare_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
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

// Global fetch wrapper with 401 Unauthorized handling.
// 401 = token invalid/expired → clear session.
// 403 = authenticated but missing permission → keep session (do not log the user out).
// Only clear when the failing request used the token that is still current in this tab,
// so a stale request from another tab cannot wipe a freshly logged-in session.
const nativeFetch = typeof window !== 'undefined' ? window.fetch.bind(window) : globalThis.fetch.bind(globalThis);
const fetch = async (url, options) => {
  const tokenAtRequest = getAuthToken();
  const response = await nativeFetch(url, options);
  if (response.status === 401) {
    const urlStr = typeof url === 'string' ? url : (url?.url || '');
    const isAuthEndpoint = urlStr.includes('/auth/login') || urlStr.includes('/auth/register');
    const isCurrentSession = Boolean(tokenAtRequest) && getAuthToken() === tokenAtRequest;
    if (!isAuthEndpoint && isCurrentSession) {
      try {
        localStorage.removeItem('wayfare_user');
        localStorage.removeItem('wayfare_auth');
        localStorage.removeItem('token');
      } catch {}
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
      return response.ok;
    } catch {
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

  getAllItineraries() {
    return itineraryApi.getAllItineraries();
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
      if (!response.ok) return [];
      const res = await response.json();
      return res.data || [];
    } catch {
      return [];
    }
  },

  async getMyItineraries(email) {
    try {
      const token = getAuthToken();
      if (!token) return [];
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
      if (!response.ok) return [];
      const res = await response.json();
      return res.data || [];
    } catch {
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

  async deleteItineraryDetail(detailId, email) {
    const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
    const userEmail = email || user?.email || '';
    const response = await fetch(`${BASE_URL}/itineraries/details/${detailId}?email=${encodeURIComponent(userEmail)}`, {
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

  async reorderItineraryDetails(itineraryId, items, email) {
    const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
    const userEmail = email || user?.email || '';
    const response = await fetch(`${BASE_URL}/itineraries/${itineraryId}/details/reorder?email=${encodeURIComponent(userEmail)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(items)
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
  },

  async toggleVisibility(id, isPublic) {
    const token = getAuthToken();
    if (!token) throw new Error('Vui lòng đăng nhập!');
    const response = await fetch(`${BASE_URL}/itineraries/${id}/visibility`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(isPublic !== undefined ? { isPublic } : {})
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Không thể cập nhật chế độ hiển thị (${response.status})`);
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
    } catch {
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
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async getCommunityHighlights() {
    try {
      const res = await fetch(`${BASE_URL}/home/community-highlights`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async getTrendingDestinations() {
    try {
      const res = await fetch(`${BASE_URL}/home/trending-destinations`);
      if (!res.ok) return ['Đà Lạt', 'Phú Quốc', 'Sa Pa', 'Đà Nẵng & Hội An', 'Mù Cang Chải', 'Ninh Bình'];
      const json = await res.json();
      return json.data || ['Đà Lạt', 'Phú Quốc', 'Sa Pa', 'Đà Nẵng & Hội An', 'Mù Cang Chải', 'Ninh Bình'];
    } catch {
      return ['Đà Lạt', 'Phú Quốc', 'Sa Pa', 'Đà Nẵng & Hội An', 'Mù Cang Chải', 'Ninh Bình'];
    }
  }
};

// ─── Admin Users & RBAC API (A03) ─────────────────────────────────────────────
// ═══ Admin Reviews Moderation API (Kiểm duyệt đánh giá địa điểm) ═══
export const adminReviewApi = {
  async getReviews({ keyword, placeId, rating, visibility, page = 0, size = 20 } = {}) {
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (placeId) params.append('placeId', placeId);
      if (rating) params.append('rating', rating);
      if (visibility && visibility !== 'all') params.append('visibility', visibility);
      params.append('page', page);
      params.append('size', size);

      const response = await fetch(`${BASE_URL}/admin/reviews?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      if (!response.ok) return { content: [], totalElements: 0, totalPages: 1, number: 0 };
      const result = await response.json();
      const pageData = result.data || {};
      return {
        content: pageData.content || [],
        totalElements: pageData.totalElements ?? 0,
        totalPages: pageData.totalPages ?? 1,
        number: pageData.number ?? 0
      };
    } catch {
      return { content: [], totalElements: 0, totalPages: 1, number: 0 };
    }
  },

  async getMetrics() {
    try {
      const response = await fetch(`${BASE_URL}/admin/reviews/metrics`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      if (!response.ok) return {};
      const result = await response.json();
      return result.data || {};
    } catch {
      return {};
    }
  },

  async hideReview(id) {
    const response = await fetch(`${BASE_URL}/admin/reviews/${id}/hide`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (await response.json()).data;
  },

  async unhideReview(id) {
    const response = await fetch(`${BASE_URL}/admin/reviews/${id}/unhide`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (await response.json()).data;
  },

  async deleteReview(id) {
    const response = await fetch(`${BASE_URL}/admin/reviews/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return true;
  }
};

export const adminUserApi = {
  async getUsers({ keyword = '', role = '', status = '', page, size } = {}) {
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (role && role !== 'all') params.append('role', role);
      if (status && status !== 'all') params.append('status', status);
      if (page !== undefined && page !== null) params.append('page', page);
      if (size !== undefined && size !== null) params.append('size', size);

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
      // Backend trả Page<UserDto> (phân trang server-side) — giữ tương thích
      // trường hợp trả danh sách thuần (includeAll).
      if (Array.isArray(result.data)) {
        return { content: result.data, totalElements: result.data.length, totalPages: 1, number: 0 };
      }
      const pageData = result.data || {};
      return {
        content: pageData.content || [],
        totalElements: pageData.totalElements ?? (pageData.content || []).length,
        totalPages: pageData.totalPages ?? 1,
        number: pageData.number ?? 0
      };
    } catch {
      return { content: [], totalElements: 0, totalPages: 1, number: 0 };
    }
  },

  // Cấp / gỡ badge "Xác thực" cho người dùng
  async setUserVerified(userId, verified) {
    try {
      const response = await fetch(`${BASE_URL}/admin/users/${userId}/verified`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ verified })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      return result.data;
    } catch (error) {
      throw error;
    }
  },

  // Đặt lại mật khẩu — trả về { userId, email, tempPassword } (hiển thị 1 lần)
  async resetPassword(userId) {
    try {
      const response = await fetch(`${BASE_URL}/admin/users/${userId}/reset-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      return result.data;
    } catch (error) {
      throw error;
    }
  },

  // Thống kê hoạt động thật của người dùng (posts/trips/reviews/saved/follows)
  async getUserActivity(userId) {
    try {
      const response = await fetch(`${BASE_URL}/admin/users/${userId}/activity`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      if (!response.ok) return {};
      const result = await response.json();
      return result.data || {};
    } catch {
      return {};
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
        return {
          totalUsers: 0,
          activeUsers: 0,
          lockedUsers: 0,
          adminCount: 0,
          newUsersToday: 0
        };
      }
      const result = await response.json();
      return result.data || {
        totalUsers: 0,
        activeUsers: 0,
        lockedUsers: 0,
        adminCount: 0,
        newUsersToday: 0
      };
    } catch {
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
    } catch {
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
      if (!response.ok) return [];
      const res = await response.json();
      return res.data || [];
    } catch {
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
      if (!response.ok) return [];
      const res = await response.json();
      return res.data || [];
    } catch {
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

  async unhidePost(postId) {
    const response = await fetch(`${BASE_URL}/admin/reports/${postId}/unhide`, {
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
    const token = getAuthToken();
    if (!token || !email) {
      return { isBackend: true, data: [] };
    }
    try {
      const response = await fetch(`${BASE_URL}/notifications?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!response.ok) {
        return { isBackend: true, data: [] };
      }
      const data = await response.json();
      return { isBackend: true, data: Array.isArray(data) ? data : [] };
    } catch {
      return { isBackend: true, data: [] };
    }
  },

  // Get unread notification count
  async getUnreadCount(email = getCurrentUserEmail()) {
    const token = getAuthToken();
    if (!token || !email) {
      return { isBackend: true, count: 0 };
    }
    try {
      const response = await fetch(`${BASE_URL}/notifications/unread-count?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!response.ok) {
        return { isBackend: true, count: 0 };
      }
      const data = await response.json();
      const count = typeof data.unreadCount === 'number' ? data.unreadCount : (typeof data.count === 'number' ? data.count : 0);
      return { isBackend: true, count };
    } catch {
      return { isBackend: true, count: 0 };
    }
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
  },

  async getBroadcastHistory() {
    try {
      const response = await fetch(`${BASE_URL}/notifications/broadcast/history`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!response.ok) return [];
      const json = await response.json();
      return Array.isArray(json) ? json : [];
    } catch {
      return [];
    }
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
      if (!res.ok) return { content: [], totalElements: 0, totalPages: 0, number: 0 };
      const json = await res.json();
      return json.data;
    } catch {
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
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
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
      if (!res.ok) return {};
      const json = await res.json();
      return json.data || {};
    } catch {
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
  async getPosts({ category = '', keyword = '', placeId = null, email = '' } = {}) {
    try {
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user.email || '';
      const params = new URLSearchParams();
      if (category && category !== 'Tất cả') params.append('category', category);
      if (keyword) params.append('keyword', keyword);
      if (placeId) params.append('placeId', String(placeId));
      if (userEmail) params.append('email', userEmail);

      const res = await fetch(`${BASE_URL}/posts?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) return [];
      const json = await res.json();
      const list = json.data || [];
      return Array.isArray(list) ? list.map(normalizePost) : list;
    } catch {
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
      if (!res.ok) return null;
      const json = await res.json();
      return normalizePost(json.data);
    } catch {
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
    return normalizePost(json.data);
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

  async getPostLikers(postId) {
    const res = await fetch(`${BASE_URL}/posts/${postId}/likes`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || `HTTP error ${res.status}`);
    return json.data || [];
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
      const token = getAuthToken();
      if (!token) return [];
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user.email || '';
      if (!userEmail) return [];
      const url = `${BASE_URL}/posts/bookmarked/ids?email=${encodeURIComponent(userEmail)}`;
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async getBookmarkedPosts(email = '') {
    try {
      const token = getAuthToken();
      if (!token) return [];
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user.email || '';
      if (!userEmail) return [];
      const url = `${BASE_URL}/posts/bookmarked?email=${encodeURIComponent(userEmail)}`;
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) return [];
      const json = await res.json();
      const list = json.data || [];
      return Array.isArray(list) ? list.map(normalizePost) : list;
    } catch {
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
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
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
    if (!file) return null;
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
    return normalizeMediaUrl(json.data);
  },

  async uploadFiles(fileList) {
    if (!fileList || fileList.length === 0) return [];
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
    const urls = json.data || [];
    return Array.isArray(urls) ? urls.map(normalizeMediaUrl) : urls;
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

  async changePassword(currentPassword, newPassword, confirmPassword) {
    const res = await fetch(`${BASE_URL}/users/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Đổi mật khẩu không thành công');
    }
    return json;
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
      const token = getAuthToken();
      const user = getStoredUser() || {};
      const userEmail = email || user.email || '';
      if (!token && !userEmail) {
        return [];
      }
      const qs = userEmail ? `?email=${encodeURIComponent(userEmail)}` : '';
      const res = await fetch(`${BASE_URL}/users/following/ids${qs}`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) {
        return [];
      }
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async getMyProfile(email) {
    try {
      const token = getAuthToken();
      if (!token) return null;
      const user = getStoredUser() || {};
      const userEmail = email || user.email || '';
      const qs = userEmail ? `?email=${encodeURIComponent(userEmail)}` : '';
      const res = await fetch(`${BASE_URL}/users/me${qs}`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    } catch {
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
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
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
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
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
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
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
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
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
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    } catch {
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
      throw err;
    }
  },

  async getMyPlaces(email) {
    try {
      const token = getAuthToken();
      if (!token) return [];
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user?.email || '';
      if (!userEmail) return [];
      const res = await fetch(`${BASE_URL}/places/my-places?email=${encodeURIComponent(userEmail)}`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
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
      throw err;
    }
  },

  async updatePlace(id, placeData) {
    try {
      const res = await fetch(`${BASE_URL}/places/admin/${id}`, {
        method: 'PUT',
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
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
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
      throw err;
    }
  },

  async geocodeMissingPlaces() {
    try {
      const res = await fetch(`${BASE_URL}/places/admin/geocode-missing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      throw err;
    }
  },

  async setPlaceVerified(id, verified) {
    try {
      const res = await fetch(`${BASE_URL}/places/admin/${id}/verified?verified=${verified}`, {
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
      throw err;
    }
  },

  async getFeaturedPlaces() {
    try {
      const res = await fetch(`${BASE_URL}/places/featured`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async updateFeaturedStatus(id, { isFeatured, featuredOrder = 0, featuredBadge = '' }) {
    const res = await fetch(`${BASE_URL}/places/admin/${id}/featured`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ isFeatured, featuredOrder, featuredBadge })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data;
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
      throw err;
    }
  }
};

/**
 * Danh sách "muốn đi" (wishlist) lưu TRÊN SERVER — web & app mobile cùng
 * người dùng chia sẻ đúng 1 danh sách thay vì lưu rải rác theo thiết bị.
 * Cả 3 hàm yêu cầu đã đăng nhập (JWT); guest thì client tự fallback local.
 */
/**
 * Danh mục tỉnh thành & dấu chân du lịch (server: bảng provinces + user_provinces_visited).
 */
export const provinceApi = {
  /** Danh mục 34 tỉnh thành (dữ liệu thật trong DB, có alias các tỉnh cũ để nhận diện). */
  async getProvinces() {
    try {
      const res = await fetch(`${BASE_URL}/provinces`, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || [];
    } catch {
      return null; // caller dùng fallback hardcode
    }
  },

  /** Dấu chân của user đang đăng nhập (lưu trên server). Trả về mã VN01..VN34 hoặc [] / null lỗi. */
  async getMyVisited() {
    try {
      const token = getAuthToken();
      if (!token) return [];
      const res = await fetch(`${BASE_URL}/provinces/visited`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  /** Check-in / gỡ dấu chân 1 tỉnh (đồng bộ server). Trả về danh sách mã mới hoặc null lỗi. */
  async setVisited(provinceCode, visited) {
    try {
      const res = await fetch(`${BASE_URL}/provinces/${encodeURIComponent(provinceCode)}/visited?visited=${visited}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return null;
    }
  }
};

export const savedPlaceApi = {
  async getSavedPlaces() {
    try {
      const token = getAuthToken();
      if (!token) return [];
      const res = await fetch(`${BASE_URL}/users/saved-places`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json.data) ? json.data : [];
    } catch {
      return [];
    }
  },

  async addSavedPlace(placeId) {
    try {
      const res = await fetch(`${BASE_URL}/users/saved-places/${placeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return true;
    } catch (err) {
      throw err;
    }
  },

  async removeSavedPlace(placeId) {
    try {
      const res = await fetch(`${BASE_URL}/users/saved-places/${placeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return true;
    } catch (err) {
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
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
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
      throw err;
    }
  },

  async updateReview(reviewId, { rating, comment }, email) {
    try {
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user?.email || '';
      const res = await fetch(`${BASE_URL}/places/reviews/${reviewId}?email=${encodeURIComponent(userEmail)}`, {
        method: 'PUT',
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
      throw err;
    }
  }
};

export const reportApi = {
  async submitReport({ targetType, targetId, category, reason, description, evidenceImageUrl }) {
    const res = await fetch(`${BASE_URL}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ targetType, targetId, category, reason, description, evidenceImageUrl })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Gửi báo cáo vi phạm thất bại');
    }
    return json.data;
  },

  async getAdminReports(status = 'ALL', targetType = 'ALL') {
    const res = await fetch(`${BASE_URL}/reports/admin?status=${status}&targetType=${targetType}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Lấy danh sách báo cáo thất bại');
    }
    return json.data || [];
  },

  async resolveReport(id, action, notes) {
    const res = await fetch(`${BASE_URL}/reports/admin/${id}/resolve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ action, notes })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Xử lý báo cáo thất bại');
    }
    return json.data;
  },

  // Backwards-compatible aliases
  getAdminSystemReports(status = 'ALL', targetType = 'ALL') {
    return this.getAdminReports(status, targetType);
  },

  resolveSystemReport(id, action, notes) {
    return this.resolveReport(id, action, notes);
  }
};

// ─── Real-Time Chat API (Group & Direct Rooms, Cloud Media) ───────────────────
export const chatApi = {
  async getRooms(email) {
    try {
      const token = getAuthToken();
      if (!token) return [];
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user?.email || '';
      if (!userEmail) return [];
      const res = await fetch(`${BASE_URL}/chat/rooms?email=${encodeURIComponent(userEmail)}`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async getUnreadCount(email) {
    try {
      const token = getAuthToken();
      if (!token) return 0;
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user?.email || '';
      if (!userEmail) return 0;
      const res = await fetch(`${BASE_URL}/chat/unread-count?email=${encodeURIComponent(userEmail)}`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      if (!res.ok) return 0;
      const json = await res.json();
      return json?.data?.unreadCount || 0;
    } catch {
      return 0;
    }
  },

  async getRoomMessages(roomId, email) {
    try {
      const token = getAuthToken();
      if (!token) return [];
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user?.email || '';
      if (!userEmail) return [];
      const res = await fetch(`${BASE_URL}/chat/rooms/${roomId}/messages?email=${encodeURIComponent(userEmail)}`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async markRoomAsRead(roomId, email) {
    try {
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user?.email || '';
      const res = await fetch(`${BASE_URL}/chat/rooms/${roomId}/read?email=${encodeURIComponent(userEmail)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    } catch {
      return null;
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
      throw err;
    }
  },

  async getAvailableUsers(keyword = '', email) {
    try {
      const token = getAuthToken();
      if (!token) return [];
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user?.email || '';
      if (!userEmail) return [];
      const qs = keyword ? `&keyword=${encodeURIComponent(keyword)}` : '';
      const res = await fetch(`${BASE_URL}/chat/available-users?email=${encodeURIComponent(userEmail)}${qs}`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async getRoomMembers(roomId, email) {
    try {
      const token = getAuthToken();
      if (!token) return [];
      const user = JSON.parse(localStorage.getItem('wayfare_user') || '{}');
      const userEmail = email || user?.email || '';
      if (!userEmail) return [];
      const res = await fetch(`${BASE_URL}/chat/rooms/${roomId}/members?email=${encodeURIComponent(userEmail)}`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
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
      throw err;
    }
  }
};

// ─── Dynamic RBAC & Permission APIs ──────────────────────────────────────────
export const adminPermissionApi = {
  async getAllPermissions() {
    const res = await fetch(`${BASE_URL}/admin/permissions`, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Không thể tải danh mục quyền');
    const json = await res.json();
    return json.data || [];
  },

  async getModerators() {
    const res = await fetch(`${BASE_URL}/admin/moderators`, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Không thể tải danh sách người giám sát');
    const json = await res.json();
    return json.data || [];
  },

  async getUserPermissions(userId) {
    const res = await fetch(`${BASE_URL}/admin/users/${userId}/permissions`, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Không thể tải quyền của người dùng');
    const json = await res.json();
    return json.data || [];
  },

  async getEffectivePermissions(userId) {
    const res = await fetch(`${BASE_URL}/admin/users/${userId}/effective-permissions`, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Không thể tính toán quyền hiệu lực');
    const json = await res.json();
    return json.data || null;
  },

  async updateUserPermissions(userId, { allow = [], deny = [] }) {
    const res = await fetch(`${BASE_URL}/admin/users/${userId}/permissions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ allow, deny })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || 'Không thể cập nhật phân quyền người dùng');
    }
    const json = await res.json();
    return json.data;
  }
};

// ─── Site Settings & Theme Management APIs ────────────────────────────────────
export const adminThemeApi = {
  async getTheme() {
    const res = await fetch(`${BASE_URL}/admin/theme`, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Không thể tải cấu hình giao diện');
    const json = await res.json();
    return json.data || {};
  },

  async saveDraft(themeData, note = 'Lưu bản nháp') {
    const res = await fetch(`${BASE_URL}/admin/theme/draft`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ theme: themeData, note })
    });
    if (!res.ok) throw new Error('Không thể lưu bản nháp giao diện');
    const json = await res.json();
    return json.data;
  },

  async publishTheme() {
    const res = await fetch(`${BASE_URL}/admin/theme/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Không thể xuất bản giao diện');
    const json = await res.json();
    return json.data;
  },

  async resetTheme() {
    const res = await fetch(`${BASE_URL}/admin/theme/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Không thể khôi phục giao diện mặc định');
    const json = await res.json();
    return json.data;
  },

  async getVersions() {
    const res = await fetch(`${BASE_URL}/admin/theme/versions`, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Không thể tải lịch sử phiên bản');
    const json = await res.json();
    return json.data || [];
  },

  async rollbackVersion(versionId) {
    const res = await fetch(`${BASE_URL}/admin/theme/versions/${versionId}/rollback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Không thể rollback phiên bản');
    const json = await res.json();
    return json.data;
  }
};

export const publicConfigApi = {
  async getSiteConfig() {
    try {
      const res = await nativeFetch(`${BASE_URL}/public/site-config`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }
};

// ─── Maintenance Mode APIs ───────────────────────────────────────────────────
export const adminMaintenanceApi = {
  async getMaintenance() {
    const res = await fetch(`${BASE_URL}/admin/maintenance`, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Không thể tải trạng thái bảo trì');
    const json = await res.json();
    return json.data || {};
  },

  async updateMaintenance(data) {
    const res = await fetch(`${BASE_URL}/admin/maintenance`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || 'Không thể cập nhật chế độ bảo trì');
    }
    const json = await res.json();
    return json.data;
  }
};





