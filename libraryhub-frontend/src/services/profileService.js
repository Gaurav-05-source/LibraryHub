
import api from './api';

const profileService = {
    // Fetch logged-in user's profile
    async getMyProfile() {
        const response = await api.get('/users/me');
        return response.data;
    },

    // Update profile name and phone
    async updateMyProfile(profileData) {
        const response = await api.put('/users/me', profileData);
        return response.data;
    },

    // Change account password
    async changePassword(passwordData) {
        const response = await api.patch(
            '/users/me/change-password',
            passwordData
        );
        return response;
    }
};

export default profileService;
