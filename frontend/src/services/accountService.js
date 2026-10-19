import api from './api';

export const accountService = {
  async getAccounts() {
    const response = await api.get('/accounts');
    return response.data;
  },

  async getAccountById(id) {
    const response = await api.get(`/accounts/${id}`);
    return response.data;
  },

  async getAccountLedger(accountId, page = 0, size = 15) {
    const response = await api.get(`/accounts/${accountId}/ledger`, {
      params: { page, size }
    });
    return response.data;
  },

  async createAccount(data) {
    const response = await api.post('/accounts', data);
    return response.data;
  }
};

export default accountService;
