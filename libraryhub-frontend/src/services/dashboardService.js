
import api from './api';

const dashboardService = {
  async getMemberDashboard() {
    const response = await api.get('/dashboard/member');
    return response.data;
  },
};

export default dashboardService;
