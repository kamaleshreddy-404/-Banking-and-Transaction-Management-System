import api from './api';

export const adminService = {
  async getAdminStats() {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  async getUsers({ page = 0, size = 10, query = '', status = '' } = {}) {
    const params = { page, size };
    if (query) params.query = query;
    if (status) params.status = status;
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  async updateUserStatus(userId, status, reason = '') {
    const response = await api.patch(`/admin/users/${userId}/status`, { status, reason });
    return response.data;
  },

  async getAccounts({ page = 0, size = 10, query = '', status = '' } = {}) {
    const params = { page, size };
    if (query) params.query = query;
    if (status) params.status = status;
    const response = await api.get('/admin/accounts', { params });
    return response.data;
  },

  async updateAccountStatus(accountId, status, reason = '') {
    const response = await api.patch(`/admin/accounts/${accountId}/status`, { status, reason });
    return response.data;
  },

  async getTransactions({ page = 0, size = 15, query = '', status = '', type = '' } = {}) {
    const params = { page, size };
    if (query) params.query = query;
    if (status) params.status = status;
    if (type) params.type = type;
    const response = await api.get('/admin/transactions', { params });
    return response.data;
  },

  async getLedgerEntries({ page = 0, size = 20, accountId, entryType } = {}) {
    const params = { page, size };
    if (accountId) params.accountId = accountId;
    if (entryType) params.entryType = entryType;
    const response = await api.get('/admin/ledger', { params });
    return response.data;
  },

  async getAuditLogs({ page = 0, size = 20, action = '', userId = null } = {}) {
    const params = { page, size };
    if (action) params.action = action;
    if (userId) params.userId = userId;
    const response = await api.get('/admin/audit-logs', { params });
    return response.data;
  },

  async getLimits() {
    const response = await api.get('/admin/limits');
    return response.data;
  },

  async updateLimit(tier, data) {
    const response = await api.put(`/admin/limits/${tier}`, data);
    return response.data;
  },

  async getTickets() {
    const response = await api.get('/admin/tickets');
    return response.data;
  },

  async updateTicketStatus(ticketId, status) {
    const response = await api.patch(`/admin/tickets/${ticketId}/status`, { status });
    return response.data;
  },

  async addTicketResponse(ticketId, message) {
    const response = await api.post(`/admin/tickets/${ticketId}/messages`, { message });
    return response.data;
  },

  async getAnnouncements() {
    const response = await api.get('/admin/announcements');
    return response.data;
  },

  async createAnnouncement(data) {
    const response = await api.post('/admin/announcements', data);
    return response.data;
  },

  async deleteAnnouncement(id) {
    const response = await api.delete(`/admin/announcements/${id}`);
    return response.data;
  },

  async getSystemHealth() {
    try {
      const response = await api.get('/admin/system/health');
      return response.data;
    } catch {
      // Fallback directly to Spring Boot Actuator
      const response = await api.get('/actuator/health');
      return response.data;
    }
  }
};

export default adminService;
