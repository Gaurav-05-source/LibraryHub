
import api from './api';

const bookCopyService = {

  async getAllCopies() {
    const response = await api.get('/book-copies');
    return response.data;
  },

  async getCopyById(copyId) {
    const response = await api.get(`/book-copies/${copyId}`);
    return response.data;
  },

  async createCopy(copyData) {
    const response = await api.post('/book-copies', copyData);
    return response.data;
  },

  async deleteCopy(copyId) {
    const response = await api.delete(`/book-copies/${copyId}`);
    return response.data;
  }

};

export default bookCopyService;
