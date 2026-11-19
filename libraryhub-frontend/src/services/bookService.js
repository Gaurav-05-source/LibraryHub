
import api from './api';

const bookService = {

  async getAllBooks() {
    const response = await api.get('/books');
    return response.data;
  },

  async searchBooks(params = {}) {
    const response = await api.get('/books/search', {
      params
    });

    return response.data;
  },

  async getBookById(bookId) {
    const response = await api.get(`/books/${bookId}`);
    return response.data;
  },

  async getCategories() {
    const response = await api.get('/categories');
    return response.data;
  },

  async createBook(bookData) {
    const response = await api.post('/books', bookData);
    return response.data;
  },

  async updateBook(bookId, bookData) {
    const response = await api.put(`/books/${bookId}`, bookData);
    return response.data;
  },

  async deleteBook(bookId) {
    const response = await api.delete(`/books/${bookId}`);
    return response.data;
  }

};

export default bookService;
