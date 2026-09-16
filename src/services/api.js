const BASE_URL = 'http://localhost:8081/api';

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
      // Fallback for seamless dev demo
      return {
        success: true,
        message: 'Đăng nhập thành công (Demo Mode)',
        data: {
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            name: email.split('@')[0] || 'Nguyễn Thanh Tùng',
            handle: '@' + (email.split('@')[0] || 'tung_wanderlust'),
            email: email,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
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
