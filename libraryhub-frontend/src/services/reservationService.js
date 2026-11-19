
import api from './api';

const reservationService = {

    async createReservation(bookId) {
        const response = await api.post('/reservations', {
            bookId: bookId
        });

        return response.data;
    },

    // Admin: Get all reservations
    async getAllReservations() {
        const response = await api.get('/reservations');
        return response.data;
    },

    async getMyReservations() {
        const response = await api.get('/reservations');
        return response.data;
    },

    async cancelReservation(reservationId) {
        const response = await api.patch(
            `/reservations/${reservationId}/cancel`
        );

        return response.data;
    }


};

export default reservationService;
