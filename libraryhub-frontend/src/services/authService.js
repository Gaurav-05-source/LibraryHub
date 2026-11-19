
import api from './api';

const authService = {
    async login(credentials) {
        const response = await api.post('/auth/login', credentials);

        const { token, user } = response.data;

        sessionStorage.setItem('libraryhub_token', token);
        sessionStorage.setItem('libraryhub_user', JSON.stringify(user));

        return response.data;
    },

    async register(userData) {
        const response = await api.post('/users/register', userData);
        return response.data;
    },

    getToken() {
        return sessionStorage.getItem('libraryhub_token');
    },

    getUser() {
        const user = sessionStorage.getItem('libraryhub_user');

        if (!user || user === 'undefined' || user === 'null') {
            sessionStorage.removeItem('libraryhub_user');
            return null;
        }

        try {
            return JSON.parse(user);
        } catch (error) {
            console.error('Invalid stored user data:', error);
            sessionStorage.removeItem('libraryhub_user');
            return null;
        }
    },

    logout() {
        sessionStorage.removeItem('libraryhub_token');
        sessionStorage.removeItem('libraryhub_user');
    },

    isAuthenticated() {
        return !!this.getToken();
    }
};

export default authService;
