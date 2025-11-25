import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const authService = {
    register: (userData) => api.post('/auth/register', userData),
    login: (userData) => api.post('/auth/login', userData),
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    getCurrentUser: () => api.get('/auth/me'),
};

export const assetService = {
    getUploadUrl: (data) => api.post('/assets/upload-url', data),
    getUserAssets: () => api.get('/assets'),
    deleteAsset: (id) => api.delete(`/assets/${id}`),
};

export const experienceService = {
    create: (data) => api.post('/experiences', data),
    getAll: () => api.get('/experiences'),
    getById: (id) => api.get(`/experiences/${id}`),
    save: (id, data) => api.put(`/experiences/${id}`, data),
    publish: (id, isPublished) => api.post(`/experiences/${id}/publish`, { isPublished }),
    getPublic: (id) => api.get(`/experiences/public/${id}`),
};

export default api;
