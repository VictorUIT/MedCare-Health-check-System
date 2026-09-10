import React, { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, Loader2, MapPin, Phone, UserRound, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const promptSessionKey = 'medcare_patient_profile_prompt_seen';

const hasMissingPatientInfo = (user: { phone?: string; dateOfBirth?: string; gender?: string; address?: string }) => {
  return !user.phone || !user.dateOfBirth || !user.gender || !user.address;
};

export default function PatientProfilePrompt() {
  const { user, loading, updateProfileState } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (loading || user?.role !== 'PATIENT' || !hasMissingPatientInfo(user)) {
      return;
    }

    if (sessionStorage.getItem(promptSessionKey) !== 'true') {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setDateOfBirth(user.dateOfBirth || '');
      setGender(user.gender || '');
      setAddress(user.address || '');
      setIsOpen(true);
      sessionStorage.setItem(promptSessionKey, 'true');
    }
  }, [loading, user]);

  const closePrompt = () => {
    setIsOpen(false);
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await api.put('/auth/profile', {
        fullName,
        phone,
        dateOfBirth,
        gender,
        address
      });
      updateProfileState(response.data.user);
      closePrompt();
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Không thể lưu thông tin. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
      <div className="relative max-h-[calc(100vh-3rem)] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={closePrompt}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Đóng"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 pr-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
            <UserRound className="h-6 w-6" />
          </div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-teal-600">Hoàn thiện hồ sơ</p>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Để MedCare chăm sóc bạn tốt hơn</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Bổ sung thông tin bệnh nhân để đặt lịch nhanh hơn và giúp bác sĩ chuẩn bị tốt cho buổi khám.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-700">Họ và tên</span>
            <div className="relative">
              <UserRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} required className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
            </div>
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-700">Số điện thoại</span>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input value={phone} onChange={(event) => setPhone(event.target.value)} required placeholder="090..." className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-700">Ngày sinh</span>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input type="date" value={dateOfBirth} onChange={(event) => setDateOfBirth(event.target.value)} required className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-700">Giới tính</span>
              <select value={gender} onChange={(event) => setGender(event.target.value)} required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100">
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-700">Địa chỉ</span>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input value={address} onChange={(event) => setAddress(event.target.value)} required placeholder="Địa chỉ liên hệ" className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
              </div>
            </label>
          </div>

          {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</p>}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={closePrompt} className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-100">Để sau</button>
            <button type="submit" disabled={saving} className="flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {saving ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}