import api from './api';

export const supportService = {
  async getTickets() {
    const response = await api.get('/support/tickets');
    return response.data;
  },

  async createTicket(data) {
    const response = await api.post('/support/tickets', data);
    return response.data;
  },

  async addMessage(ticketId, message) {
    const response = await api.post(`/support/tickets/${ticketId}/messages`, { message });
    return response.data;
  }
};

export default supportService;
