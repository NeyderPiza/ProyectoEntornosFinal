// /frontend/src/api/axiosConfig.js (VERSIÓN FINAL)

import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Este "interceptor" es la magia. Se ejecuta ANTES de cada petición.
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Si hay token, lo ponemos en la cabecera.
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;