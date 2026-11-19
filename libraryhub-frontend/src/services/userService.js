
import api from './api';

const userService = {

  async getAllUsers() {
    const response = await api.get('/users');
    return response.data;
  },

  async getUserById(userId) {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  }

};

export default userService;
