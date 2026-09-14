/**
 * WanderAI Frontend API Service Layer
 * Placeholders and ready-to-use hooks for connecting real Backend API endpoints.
 */

// Config base URL (Change this to your real API server e.g. http://localhost:8080/api)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Generic Fetch Wrapper with Error Handling & Auth Header support
 */
async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('wanderai_auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP Error ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.warn(`[API Fallback] Endpoint "${endpoint}" failed, using Mock Data:`, err.message);
    return null; // Return null so callers can seamlessly fall back to mock state
  }
}

// -------------------------------------------------------------
// REAL BACKEND API ENDPOINT PLACEHOLDERS (READY FOR INTEGRATION)
// -------------------------------------------------------------

export const ApiService = {
  // 1. Destinations API
  async getDestinations(category = '') {
    const res = await fetchAPI(`/destinations${category ? `?category=${category}` : ''}`);
    return res; // If null, AppContext uses mock data
  },

  async getDestinationById(id) {
    return await fetchAPI(`/destinations/${id}`);
  },

  // 2. AI Itinerary Generation API
  async generateAITrip(params) {
    return await fetchAPI('/ai/generate-trip', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  // 3. Community Posts & Social Feed API
  async getPosts(page = 1, filter = 'latest') {
    return await fetchAPI(`/posts?page=${page}&filter=${filter}`);
  },

  async createPost(postData) {
    return await fetchAPI('/posts', {
      method: 'POST',
      body: JSON.stringify(postData)
    });
  },

  async toggleLikePost(postId) {
    return await fetchAPI(`/posts/${postId}/like`, {
      method: 'POST'
    });
  },

  // 4. Admin API
  async getAdminStats() {
    return await fetchAPI('/admin/stats');
  },

  async approvePlaceRequest(placeId) {
    return await fetchAPI(`/admin/places/${placeId}/approve`, {
      method: 'PUT'
    });
  },

  async banUser(userId) {
    return await fetchAPI(`/admin/users/${userId}/ban`, {
      method: 'PUT'
    });
  }
};
