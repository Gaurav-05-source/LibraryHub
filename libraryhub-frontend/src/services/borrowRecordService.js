
import api from './api';

const borrowRecordService = {

    // Get all borrowing records
    async getAllBorrowRecords() {
        const response = await api.get('/borrow-records');
        return response.data;
    },

    // Get borrowing record by ID
    async getBorrowRecordById(id) {
        const response = await api.get(`/borrow-records/${id}`);
        return response.data;
    },

    // Issue a book
    async issueBook(borrowData) {
        const response = await api.post('/borrow-records/issue', borrowData);
        return response.data;
    },

    // Return a book
    async returnBook(id) {
        const response = await api.patch(`/borrow-records/${id}/return`);
        return response.data;
    }
};

export default borrowRecordService;
