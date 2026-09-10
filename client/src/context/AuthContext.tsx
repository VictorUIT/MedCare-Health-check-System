import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { User } from '../types';

// Auth Context interface định nghĩa các giá trị và phương thức mà AuthContext sẽ cung cấp
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (formData: any) => Promise<User>;
  logout: () => void;
  updateProfileState: (updatedUser: User) => void;
}

// Tạo AuthContext với giá trị mặc định là undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component cung cấp AuthContext cho các component con
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('medcare_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // useEffect để fetch thông tin người dùng khi component được mount
  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('medcare_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('medcare_user', JSON.stringify(res.data));
        } catch (error) {
          console.error('Fetch me error:', error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchMe();
  }, []);

  // Hàm đăng nhập người dùng
  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('medcare_token', token);
    localStorage.setItem('medcare_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  // Hàm đăng ký người dùng mới
  const register = async (formData: any): Promise<User> => {
    const res = await api.post('/auth/register', formData);
    const { token, user: userData } = res.data;
    localStorage.setItem('medcare_token', token);
    localStorage.setItem('medcare_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  // Hàm đăng xuất người dùng
  const logout = () => {
    localStorage.removeItem('medcare_token');
    localStorage.removeItem('medcare_user');
    setUser(null);
  };

  // Hàm cập nhật thông tin người dùng trong state và localStorage
  const updateProfileState = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('medcare_user', JSON.stringify(updatedUser));
  };

  // Cung cấp các giá trị và phương thức của AuthContext cho các component con
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfileState }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook để sử dụng AuthContext trong các component
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
