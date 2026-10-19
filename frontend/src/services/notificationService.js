import api from './api';

export const notificationService = {
  async getNotifications(page = 0, size = 15) {
    const response = await api.get('/notifications', {
      params: { page, size }
    });
    return response.data;
  },

  async markAsRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.post('/notifications/mark-all-read');
    return response.data;
  },

  async getAnnouncements() {
    const response = await api.get('/notifications/announcements');
    return response.data;
  }
};

export default notificationService;
