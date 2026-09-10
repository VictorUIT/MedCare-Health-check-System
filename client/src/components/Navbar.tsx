import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Stethoscope,
  Sparkles,
  Calendar,
  LogOut,
  Menu,
  X,
  Search,
  LayoutDashboard,
  UserCheck
} from 'lucide-react';
import AISymptomModal from './AISymptomModal';

// Navbar component cho cho ứng dụng
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Hàm xử lý khi người dùng đăng xuất
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Hàm kiểm tra xem đường dẫn hiện tại có trùng với đường dẫn được cung cấp hay không
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">Med<span className="text-teal-600">Care</span></span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold bg-teal-100 text-teal-800 rounded-full">Phòng Khám Y Tế</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/doctors"
                className={`text-sm font-semibold transition-colors hover:text-teal-600 flex items-center gap-1.5 ${
                  isActive('/doctors') ? 'text-teal-600 font-bold' : 'text-slate-600'
                }`}
              >
                <Search className="w-4 h-4" />
                Tìm Bác Sĩ
              </Link>

              <button
                onClick={() => setAiModalOpen(true)}
                className="text-sm font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-teal-500 to-sky-500 text-white shadow-sm hover:shadow-md hover:scale-105 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                Gợi Ý Chuyên Khoa AI
              </button>

              {user && user.role === 'PATIENT' && (
                <Link
                  to="/my-appointments"
                  className={`text-sm font-semibold transition-colors hover:text-teal-600 flex items-center gap-1.5 ${
                    isActive('/my-appointments') ? 'text-teal-600 font-bold' : 'text-slate-600'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Lịch Hẹn Của Tôi
                </Link>
              )}

              {user && user.role === 'DOCTOR' && (
                <Link
                  to="/doctor-dashboard"
                  className={`text-sm font-semibold transition-colors hover:text-teal-600 flex items-center gap-1.5 ${
                    isActive('/doctor-dashboard') ? 'text-teal-600 font-bold' : 'text-slate-600'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  Lịch Bác Sĩ
                </Link>
              )}

              {user && user.role === 'ADMIN' && (
                <Link
                  to="/admin-dashboard"
                  className={`text-sm font-semibold transition-colors hover:text-teal-600 flex items-center gap-1.5 ${
                    isActive('/admin-dashboard') ? 'text-teal-600 font-bold' : 'text-slate-600'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Quản Trị Hệ Thống
                </Link>
              )}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-slate-100 hover:bg-slate-200/80 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-sm">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800 leading-none">{user.fullName}</p>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        {user.role === 'ADMIN' ? 'Quản trị viên' : user.role === 'DOCTOR' ? 'Bác sĩ' : 'Bệnh nhân'}
                      </p>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    title="Đăng xuất"
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-sm font-semibold text-slate-700 hover:text-teal-600 px-4 py-2 rounded-xl transition-colors"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-bold text-white gradient-bg px-4 py-2 rounded-xl shadow-md shadow-teal-500/20 hover:opacity-95 transition-opacity"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>

            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setAiModalOpen(true)}
                className="p-2 rounded-lg bg-teal-50 text-teal-700 text-xs font-bold flex items-center gap-1"
              >
                <Sparkles className="w-4 h-4 text-teal-600" />
                AI
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-3 shadow-lg">
            <Link
              to="/doctors"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 hover:text-teal-600"
            >
              🔍 Tìm kiếm Bác sĩ
            </Link>

            {user && user.role === 'PATIENT' && (
              <Link
                to="/my-appointments"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-slate-700 hover:text-teal-600"
              >
                📅 Lịch Hẹn Của Tôi
              </Link>
            )}

            {user && user.role === 'DOCTOR' && (
              <Link
                to="/doctor-dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-slate-700 hover:text-teal-600"
              >
                🩺 Lịch Làm Việc Bác Sĩ
              </Link>
            )}

            {user && user.role === 'ADMIN' && (
              <Link
                to="/admin-dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-slate-700 hover:text-teal-600"
              >
                ⚙️ Quản Trị Hệ Thống
              </Link>
            )}

            {user ? (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800">{user.fullName}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold text-white gradient-bg rounded-lg"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      <AISymptomModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
    </>
  );
}
