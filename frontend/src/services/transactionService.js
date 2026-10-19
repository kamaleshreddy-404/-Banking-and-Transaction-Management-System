import api from './api';

export const transactionService = {
  async getTransactions({ page = 0, size = 10, accountId, type, status, startDate, endDate } = {}) {
    const params = { page, size };
    if (accountId) params.accountId = accountId;
    if (type) params.type = type;
    if (status) params.status = status;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get('/transactions', { params });
    return response.data;
  },

  async getTransactionById(id) {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  async getTransactionReceipt(id) {
    const response = await api.get(`/transactions/${id}/receipt`);
    return response.data;
  }
};

export default transactionService;
