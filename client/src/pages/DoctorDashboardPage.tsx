import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import api from '../services/api';
import { Appointment, ScheduleBlock } from '../types';

// Doctor Dashboard component
export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const doctorProfile = user?.doctorProfile;

  const [activeTab, setActiveTab] = useState<'appointments' | 'schedule' | 'blocks'>('appointments');
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(true);

  const [completingAppt, setCompletingAppt] = useState<Appointment | null>(null);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [schedules, setSchedules] = useState([
    { dayOfWeek: 'mon', startTime: '08:00', endTime: '17:00', slotDurationMinutes: 30, isAvailable: true },
    { dayOfWeek: 'tue', startTime: '08:00', endTime: '17:00', slotDurationMinutes: 30, isAvailable: true },
    { dayOfWeek: 'wed', startTime: '08:00', endTime: '17:00', slotDurationMinutes: 30, isAvailable: true },
    { dayOfWeek: 'thu', startTime: '08:00', endTime: '17:00', slotDurationMinutes: 30, isAvailable: true },
    { dayOfWeek: 'fri', startTime: '08:00', endTime: '17:00', slotDurationMinutes: 30, isAvailable: true },
    { dayOfWeek: 'sat', startTime: '08:00', endTime: '12:00', slotDurationMinutes: 30, isAvailable: true },
    { dayOfWeek: 'sun', startTime: '08:00', endTime: '12:00', slotDurationMinutes: 30, isAvailable: false }
  ]);
  const [scheduleSuccess, setScheduleSuccess] = useState('');

  const [blockDate, setBlockDate] = useState('');
  const [blockStartTime, setBlockStartTime] = useState('09:00');
  const [blockEndTime, setBlockEndTime] = useState('11:00');
  const [blockReason, setBlockReason] = useState('');
  const [blocksList, setBlocksList] = useState<ScheduleBlock[]>([]);
  const [blockLoading, setBlockLoading] = useState(false);

  // Lấy thông tin các cuộc hẹn khám bệnh cho ngày đã chọn
  const fetchDoctorAppointments = async () => {
    setLoadingAppts(true);
    try {
      const res = await api.get(`/appointments/doctor-appointments?date=${selectedDate}`);
      setAppointments(res.data);
    } catch (err) {
      console.error('Error fetching doctor appointments:', err);
    } finally {
      setLoadingAppts(false);
    }
  };

  // useEffect để fetch các cuộc hẹn khi component được mount và khi ngày được chọn thay đổi
  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchDoctorAppointments();
    }
  }, [selectedDate, activeTab]);

  // Hàm xử lý khi bác sĩ đánh dấu một cuộc hẹn là đã hoàn thành
  const handleMarkCompleted = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingAppt) return;

    setActionLoading(true);
    try {
      await api.put(`/appointments/${completingAppt.id}/status`, {
        status: 'COMPLETED',
        doctorNotes
      });

      setCompletingAppt(null);
      setDoctorNotes('');
      fetchDoctorAppointments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
      setActionLoading(false);
    }
  };

  // Hàm xử lý lưu khung giờ làm việc cố định của bác sĩ
  const handleSaveSchedules = async () => {
    setScheduleSuccess('');
    try {
      await api.post('/schedules/set-hours', { schedules });
      setScheduleSuccess('Cập nhật khung giờ làm việc cố định thành công!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể lưu khung giờ');
    }
  };

  // Lấy danh sách các khối giờ bận đã được tạo
  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlockLoading(true);
    try {
      const res = await api.post('/schedules/blocks', {
        date: blockDate,
        startTime: blockStartTime,
        endTime: blockEndTime,
        reason: blockReason
      });

      setBlocksList([...blocksList, res.data.block]);
      setBlockReason('');
      alert('Đã tạo khung giờ bận!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể tạo khung giờ bận');
    } finally {
      setBlockLoading(false);
    }
  };

  // Hàm xử lý xóa khối giờ bận
  const getDayName = (day: string) => {
    const days: Record<string, string> = {
      mon: 'Thứ 2',
      tue: 'Thứ 3',
      wed: 'Thứ 4',
      thu: 'Thứ 5',
      fri: 'Thứ 6',
      sat: 'Thứ 7',
      sun: 'Chủ Nhật'
    };
    return days[day] || day;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-bg text-white font-extrabold text-2xl flex items-center justify-center shadow-lg">
            🩺
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Bác Sĩ {user?.fullName}</h1>
            <p className="text-xs text-slate-500 font-medium">
              {doctorProfile?.title} • Chuyên khoa {doctorProfile?.specialty?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'appointments' ? 'gradient-bg text-white shadow' : 'bg-slate-100 text-slate-700'
            }`}
          >
            📅 Lịch Khám Bệnh Nhận
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'schedule' ? 'gradient-bg text-white shadow' : 'bg-slate-100 text-slate-700'
            }`}
          >
            ⚙️ Cài Đặt Giờ Tuần
          </button>
          <button
            onClick={() => setActiveTab('blocks')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'blocks' ? 'gradient-bg text-white shadow' : 'bg-slate-100 text-slate-700'
            }`}
          >
            🚫 Chặn Giờ Bận
          </button>
        </div>
      </div>

      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">Chọn Ngày Khám:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="p-2 text-xs font-bold rounded-xl border border-slate-300 outline-none"
              />
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              Tổng số bệnh nhân: {appointments.length} người
            </span>
          </div>

          {loadingAppts ? (
            <div className="text-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Đang tải danh sách lịch khám...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 text-xs">
              Bác sĩ không có lịch hẹn khám nào vào ngày này.
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((appt) => (
                <div key={appt.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">Khung giờ:</span>
                      <span className="text-xs font-extrabold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md">
                        {appt.startTime} - {appt.endTime}
                      </span>
                      <span className="text-xs text-slate-400">| Mã: {appt.appointmentCode}</span>
                    </div>
                    <div>
                      {appt.status === 'COMPLETED' ? (
                        <span className="badge-completed">✓ Đã khám xong</span>
                      ) : appt.status === 'CANCELLED' ? (
                        <span className="badge-cancelled">✕ Đã hủy</span>
                      ) : (
                        <span className="badge-pending">⏳ Chờ khám</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-sm">
                        Bệnh nhân: {appt.patient?.fullName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        SĐT: <strong>{appt.patient?.phone || 'Chưa cập nhật'}</strong> • Giới tính: {appt.patient?.gender || 'N/A'} • Ngày sinh: {appt.patient?.dateOfBirth || 'N/A'}
                      </p>
                      {appt.patientNotes && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg italic">
                          Lý do khám: "{appt.patientNotes}"
                        </p>
                      )}
                    </div>

                    {appt.status !== 'COMPLETED' && appt.status !== 'CANCELLED' && (
                      <button
                        onClick={() => setCompletingAppt(appt)}
                        className="px-4 py-2 text-xs font-bold text-white gradient-bg rounded-xl shadow hover:opacity-95 shrink-0"
                      >
                        Đánh dấu "Đã Khám Xong"
                      </button>
                    )}
                  </div>

                  {appt.doctorNotes && (
                    <div className="text-xs bg-teal-50 p-3 rounded-xl border border-teal-200 text-teal-900">
                      <strong>Ghi chú khám của bạn:</strong> {appt.doctorNotes}
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Thiết Lập Khung Giờ Làm Việc Theo Tuần</h2>
            <p className="text-xs text-slate-500">Đặt thời gian bắt đầu, kết thúc và các ngày nhận bệnh nhân</p>
          </div>

          <div className="space-y-3">
            {schedules.map((s, idx) => (
              <div key={idx} className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="w-28 text-xs font-bold text-slate-800">
                  {getDayName(s.dayOfWeek)}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span>Từ:</span>
                  <input
                    type="time"
                    value={s.startTime}
                    onChange={(e) => {
                      const updated = [...schedules];
                      updated[idx].startTime = e.target.value;
                      setSchedules(updated);
                    }}
                    className="p-1.5 rounded-lg border border-slate-300 font-bold"
                  />
                  <span>Đến:</span>
                  <input
                    type="time"
                    value={s.endTime}
                    onChange={(e) => {
                      const updated = [...schedules];
                      updated[idx].endTime = e.target.value;
                      setSchedules(updated);
                    }}
                    className="p-1.5 rounded-lg border border-slate-300 font-bold"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={s.isAvailable}
                    onChange={(e) => {
                      const updated = [...schedules];
                      updated[idx].isAvailable = e.target.checked;
                      setSchedules(updated);
                    }}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <span>Mở nhận lịch</span>
                </label>
              </div>
            ))}
          </div>

          {scheduleSuccess && (
            <p className="text-xs font-bold text-emerald-600 bg-emerald-50 p-3 rounded-xl">{scheduleSuccess}</p>
          )}

          <button
            onClick={handleSaveSchedules}
            className="px-6 py-3 rounded-xl text-xs font-bold text-white gradient-bg shadow hover:opacity-95"
          >
            Lưu Khung Giờ Làm Việc
          </button>
        </div>
      )}

      {activeTab === 'blocks' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Chặn Khung Giờ Bận Đột Xuất</h2>
            <p className="text-xs text-slate-500">Bệnh nhân sẽ không thể đặt trùng khung giờ này trên lịch</p>
          </div>

          <form onSubmit={handleAddBlock} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ngày bận:</label>
              <input
                type="date"
                required
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Từ giờ:</label>
              <input
                type="time"
                value={blockStartTime}
                onChange={(e) => setBlockStartTime(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Đến giờ:</label>
              <input
                type="time"
                value={blockEndTime}
                onChange={(e) => setBlockEndTime(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lý do:</label>
              <input
                type="text"
                placeholder="Họp khoa, đi công tác..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-slate-300"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4 pt-2">
              <button
                type="submit"
                disabled={blockLoading}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white gradient-bg"
              >
                Xác Nhận Chặn Khung Giờ
              </button>
            </div>
          </form>
        </div>
      )}

      {completingAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Hoàn Thành Khám Bệnh - {completingAppt.patient?.fullName}
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú chẩn đoán / Dặn dò bệnh nhân:</label>
              <textarea
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                rows={4}
                placeholder="Nhập dặn dò thuốc, chế độ sinh hoạt hoặc kết quả chẩn đoán..."
                className="w-full p-3 text-xs rounded-xl border border-slate-300 outline-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCompletingAppt(null)}
                className="py-2.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleMarkCompleted}
                disabled={actionLoading}
                className="py-2.5 text-xs font-bold text-white gradient-bg rounded-xl"
              >
                Xác Nhận Đã Khám Xong
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
