
import api from './api';

const fineService = {

    // Member: Get personal fines
    async getMyFines() {
        const response = await api.get('/fines/my-fines');
        return response.data;
    },

    // Admin: Get all fines
    async getAllFines() {
        const response = await api.get('/fines');
        return response.data;
    },

    // Get fine by ID
    async getFineById(fineId) {
        const response = await api.get(`/fines/${fineId}`);
        return response.data;
    },

    // Generate fine
    async generateFine(borrowId) {
        const response = await api.post(`/fines/generate/${borrowId}`);
        return response.data;
    },

    // Mark fine as paid
    async markFineAsPaid(fineId) {
        const response = await api.patch(`/fines/${fineId}/pay`);
        return response.data;
    },

    // Waive fine
    async waiveFine(fineId) {
        const response = await api.patch(`/fines/${fineId}/waive`);
        return response.data;
    }

};

export default fineService;
