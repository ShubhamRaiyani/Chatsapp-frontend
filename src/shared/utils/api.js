import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // This sends the HttpOnly cookie automatically
});

// Response interceptor - simplified for single cookie auth
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Standardize error message extraction
        const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
        error.customMessage = message;
        return Promise.reject(error);
    }
);

export default apiClient;
