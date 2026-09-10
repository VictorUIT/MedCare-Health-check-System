import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, Lock, Mail, Loader2 } from 'lucide-react';

// Login Component
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sử dụng context để lấy hàm login và navigate để điều hướng sau khi đăng nhập thành công
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  // Hàm xử lý khi người dùng submit form đăng nhập
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      if (user.role === 'DOCTOR') {
        navigate('/doctor-dashboard');
      } else if (user.role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else {
        navigate(redirect);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi người dùng muốn đăng nhập nhanh bằng tài khoản demo
  const handleQuickLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100 space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl gradient-bg mx-auto flex items-center justify-center text-white shadow-md">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Đăng Nhập MedCare</h2>
          <p className="text-xs text-slate-500">Đăng nhập tài khoản Bệnh nhân, Bác sĩ hoặc Quản trị viên</p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
            🚀 Đăng nhập nhanh cho Hội đồng / GV (Demo):
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('patient@gmail.com', 'patient123')}
              className="px-2 py-1.5 bg-white border border-teal-200 text-teal-800 text-[11px] font-bold rounded-xl hover:bg-teal-50 transition-colors shadow-sm"
            >
              👤 Bệnh Nhân
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('bs.nguyenvanan@medcare.com', 'doctor123')}
              className="px-2 py-1.5 bg-white border border-sky-200 text-sky-800 text-[11px] font-bold rounded-xl hover:bg-sky-50 transition-colors shadow-sm"
            >
              🩺 Bác Sĩ
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@medcare.com', 'admin123')}
              className="px-2 py-1.5 bg-white border border-purple-200 text-purple-800 text-[11px] font-bold rounded-xl hover:bg-purple-50 transition-colors shadow-sm"
            >
              👑 Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email đăng nhập:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="vd: patient@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm text-white gradient-bg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Đăng Nhập'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Chưa có tài khoản bệnh nhân?{' '}
          <Link to="/register" className="font-bold text-teal-600 hover:underline">
            Đăng ký ngay
          </Link>
        </p>

      </div>
    </div>
  );
}
