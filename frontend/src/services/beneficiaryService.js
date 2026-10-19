import api from './api';

export const beneficiaryService = {
  async getBeneficiaries() {
    const response = await api.get('/beneficiaries');
    return response.data;
  },

  async addBeneficiary(data) {
    const response = await api.post('/beneficiaries', data);
    return response.data;
  },

  async deleteBeneficiary(id) {
    const response = await api.delete(`/beneficiaries/${id}`);
    return response.data;
  },

  async toggleBeneficiary(id) {
    const response = await api.patch(`/beneficiaries/${id}/toggle`);
    return response.data;
  }
};

export default beneficiaryService;
