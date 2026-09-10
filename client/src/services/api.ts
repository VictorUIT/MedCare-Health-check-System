import axios, { InternalAxiosRequestConfig } from 'axios';

// Đặt URL cơ sở cho API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Tạo một instance của axios với cấu hình mặc định
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để tự động thêm token vào header Authorization nếu có
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('medcare_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Thêm interceptor để xử lý lỗi 401 (Unauthorized) và xóa token khỏi localStorage nếu xảy ra
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('medcare_token');
      localStorage.removeItem('medcare_user');
    }
    return Promise.reject(error);
  }
);

export default api;
