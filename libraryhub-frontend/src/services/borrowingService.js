
import api from './api';

const borrowingService = {
  async getMyBorrowingHistory() {
    const response = await api.get('/borrow-records/my-history');
    return response.data;
  }
};

export default borrowingService;
