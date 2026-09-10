import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Loader2, Save } from 'lucide-react';
import api from '../services/api';

// Component hiển thị trang hồ sơ cá nhân của người dùng
export default function ProfilePage() {
  const { user, updateProfileState } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || '');
  const [gender, setGender] = useState(user?.gender || 'Nam');
  const [address, setAddress] = useState(user?.address || '');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Hàm xử lý khi người dùng submit form cập nhật hồ sơ cá nhân
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await api.put('/auth/profile', {
        fullName,
        phone,
        dateOfBirth,
        gender,
        address
      });

      updateProfileState(res.data.user);
      setMessage('Cập nhật hồ sơ cá nhân thành công!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể cập nhật hồ sơ cá nhân');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Hồ Sơ Cá Nhân
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Quản lý thông tin liên hệ và chi tiết bệnh nhân trên hệ thống MedCare
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
        
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl gradient-bg text-white font-extrabold text-2xl flex items-center justify-center shadow-lg">
            {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.fullName}</h2>
            <p className="text-xs text-slate-500">{user?.email} • Vai trò: <span className="font-bold text-teal-600">{user?.role}</span></p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Họ và Tên (*):
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số Điện Thoại:
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="090XXXXXXX"
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày Sinh:
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Giới Tính:
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Địa Chỉ Thường Trú:
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Nhập địa chỉ nhà..."
              className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          {message && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {message}
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-xs text-white gradient-bg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang lưu thay đổi...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Lưu Thay Đổi Hồ Sơ
              </>
            )}
          </button>

        </form>

      </div>

    </div>
  );
}
