import api from './api';

export const transferService = {
  async executeTransfer(transferData, idempotencyKey = null) {
    const key = idempotencyKey || `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const response = await api.post('/transfers', transferData, {
      headers: {
        'Idempotency-Key': key
      }
    });
    return response.data;
  },

  async getLimits() {
    const response = await api.get('/transfers/limits');
    return response.data;
  }
};

export default transferService;
