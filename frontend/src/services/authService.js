import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('fincore_token', response.data.token);
      localStorage.setItem('fincore_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('fincore_token', response.data.token);
      localStorage.setItem('fincore_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token, newPassword) {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  logout() {
    localStorage.removeItem('fincore_token');
    localStorage.removeItem('fincore_user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('fincore_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('fincore_token');
  },

  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  async changePassword(oldPassword, newPassword) {
    const response = await api.post('/users/change-password', { oldPassword, newPassword });
    return response.data;
  }
};

export default authService;
