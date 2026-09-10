import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  XCircle,
  Star,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import api from '../services/api';
import ReviewModal from '../components/ReviewModal';
import { Appointment } from '../types';

// Component hiển thị trang quản lý lịch hẹn của người dùng
export default function MyAppointmentsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [cancellingAppt, setCancellingAppt] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const [reviewAppt, setReviewAppt] = useState<Appointment | null>(null);

  // Hàm fetch danh sách lịch hẹn của người dùng dựa trên tab đang chọn (upcoming hoặc past)
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/appointments/my-appointments?type=${activeTab}`);
      setAppointments(res.data);
    } catch (err) {
      console.error('Error fetching patient appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  // useEffect để fetch danh sách lịch hẹn khi component được mount hoặc khi tab activeTab thay đổi
  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  // Hàm xử lý khi người dùng submit form hủy lịch hẹn
  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingAppt) return;

    setCancelLoading(true);
    setCancelError('');

    try {
      await api.put(`/appointments/${cancellingAppt.id}/cancel`, {
        reason: cancelReason
      });

      setCancellingAppt(null);
      setCancelReason('');
      fetchAppointments();
    } catch (err: any) {
      setCancelError(err.response?.data?.message || 'Có lỗi xảy ra khi hủy lịch hẹn.');
    } finally {
      setCancelLoading(false);
    }
  };

  // Hàm render trạng thái của lịch hẹn dưới dạng badge với màu sắc và biểu tượng khác nhau
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge-pending">⏳ Chờ xác nhận</span>;
      case 'CONFIRMED':
        return <span className="badge-confirmed">✓ Đã xác nhận</span>;
      case 'COMPLETED':
        return <span className="badge-completed">★ Đã khám xong</span>;
      case 'CANCELLED':
        return <span className="badge-cancelled">✕ Đã hủy</span>;
      default:
        return <span className="badge-pending">{status}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Lịch Hẹn Khám Của Tôi
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Theo dõi trạng thái lịch hẹn, hủy lịch hoặc gửi đánh giá cho bác sĩ sau khi khám
        </p>
      </div>

      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'upcoming'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          📅 Sắp Tới / Đang Chờ
        </button>

        <button
          onClick={() => setActiveTab('past')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'past'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          📜 Lịch Sử / Đã Khám & Đã Hủy
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 font-medium">Đang tải danh sách lịch hẹn...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">Không có lịch hẹn nào</h3>
          <p className="text-xs text-slate-500">Bạn chưa có lịch hẹn khám nào trong mục này.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => {
            const doctorUser = appt.doctor?.user || { fullName: '' };
            const doctorProfile = appt.doctor || {};
            const specialty = appt.doctor?.specialty || { name: '' };

            return (
              <div
                key={appt.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Mã đặt lịch:</span>
                    <span className="text-xs font-extrabold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
                      {appt.appointmentCode}
                    </span>
                  </div>
                  {renderStatusBadge(appt.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  
                  <div className="md:col-span-8 flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl gradient-bg text-white font-extrabold text-xl flex items-center justify-center shrink-0">
                      {doctorUser.fullName ? doctorUser.fullName.split(' ').pop()?.charAt(0) : 'B'}
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-base">{doctorUser.fullName}</h3>
                      <p className="text-xs font-semibold text-slate-500">{appt.doctor?.title || 'Bác sĩ'} • Khoa {specialty.name}</p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                        <span className="flex items-center gap-1 font-bold text-teal-700">
                          <Calendar className="w-4 h-4 text-teal-600" />
                          {appt.date.slice(0, 10)}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-teal-700">
                          <Clock className="w-4 h-4 text-teal-600" />
                          {appt.startTime} - {appt.endTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-4 flex flex-col md:items-end justify-center gap-2">
                    {appt.status === 'PENDING' || appt.status === 'CONFIRMED' ? (
                      <button
                        onClick={() => setCancellingAppt(appt)}
                        className="px-4 py-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        Hủy Lịch Hẹn
                      </button>
                    ) : null}

                    {appt.status === 'COMPLETED' && !appt.review && (
                      <button
                        onClick={() => setReviewAppt(appt)}
                        className="px-4 py-2 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        Đánh Giá Bác Sĩ
                      </button>
                    )}

                    {appt.status === 'COMPLETED' && appt.review && (
                      <div className="text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 font-semibold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        Đã đánh giá ({appt.review.rating}★)
                      </div>
                    )}
                  </div>

                </div>

                {appt.patientNotes && (
                  <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-600">
                    <strong>Ghi chú lý do khám:</strong> {appt.patientNotes}
                  </div>
                )}

                {appt.doctorNotes && (
                  <div className="text-xs bg-teal-50/70 p-3 rounded-xl border border-teal-100 text-teal-900">
                    <strong>Dặn dò / Chẩn đoán của Bác sĩ:</strong> {appt.doctorNotes}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {cancellingAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            
            <div className="flex items-center gap-3 text-rose-600 font-extrabold text-lg border-b border-slate-100 pb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              Xác Nhận Hủy Lịch Hẹn
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn hủy lịch hẹn <strong>{cancellingAppt.appointmentCode}</strong> vào ngày <strong>{cancellingAppt.date.slice(0, 10)} ({cancellingAppt.startTime} - {cancellingAppt.endTime})</strong> với <strong>{cancellingAppt.doctor?.user?.fullName}</strong>?
            </p>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-800 leading-relaxed font-medium">
              ⚠️ <strong>Lưu ý quy định:</strong> Hệ thống chỉ chấp nhận hủy lịch online trước giờ khám tối thiểu <strong>2 tiếng</strong>.
            </div>

            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lý do hủy (không bắt buộc):
                </label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ví dụ: Bận công tác đột xuất..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              {cancelError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl leading-relaxed">
                  {cancelError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingAppt(null)}
                  className="py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Quay Lại
                </button>
                <button
                  type="submit"
                  disabled={cancelLoading}
                  className="py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow flex items-center justify-center gap-1"
                >
                  {cancelLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Đồng Ý Hủy'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {reviewAppt && (
        <ReviewModal
          isOpen={Boolean(reviewAppt)}
          onClose={() => setReviewAppt(null)}
          appointment={reviewAppt}
          onSuccess={fetchAppointments}
        />
      )}

    </div>
  );
}
