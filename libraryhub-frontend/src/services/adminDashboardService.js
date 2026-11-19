
import api from './api';

const adminDashboardService = {

  async getBooks() {
    const response = await api.get('/books');
    return response.data;
  },

  async getMembers() {
    const response = await api.get('/users');
    return response.data;
  },

  async getBorrowings() {
    const response = await api.get('/borrow-records');
    return response.data;
  },

  async getFines() {
    const response = await api.get('/fines');
    return response.data;
  },

  async getReservations() {
    const response = await api.get('/reservations');
    return response.data;
  }

};

export default adminDashboardService;
