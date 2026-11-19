
import api from './api';

const categoryService = {
    // Get all categories
    async getAllCategories() {
        const response = await api.get('/categories');
        return response.data;
    },

    // Get category by ID
    async getCategoryById(categoryId) {
        const response = await api.get(`/categories/${categoryId}`);
        return response.data;
    },

    // Create category
    async createCategory(categoryData) {
        const response = await api.post('/categories', categoryData);
        return response.data;
    },

    // Update category
    async updateCategory(categoryId, categoryData) {
        const response = await api.put(
            `/categories/${categoryId}`,
            categoryData
        );
        return response.data;
    },

    // Delete category
    async deleteCategory(categoryId) {
        const response = await api.delete(`/categories/${categoryId}`);
        return response.data;
    }
};

export default categoryService;
