import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Plus,
  Award,
  Loader2,
  CalendarDays,
  Clock3,
  X
} from 'lucide-react';
import api from '../services/api';
import { Appointment, DoctorProfile, DoctorSchedule, ScheduleBlock, Specialty } from '../types';

// AdminDashboardPage component cho trang quản trị hệ thống
export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'stats' | 'appointments' | 'doctors' | 'specialties'>('stats');

  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [apptSearch, setApptSearch] = useState('');
  const [apptStatusFilter, setApptStatusFilter] = useState('');

  const [doctorsList, setDoctorsList] = useState<DoctorProfile[]>([]);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [docFormData, setDocFormData] = useState({
    email: '',
    password: 'doctor123',
    fullName: '',
    phone: '',
    gender: 'Nam',
    specialtyId: '',
    title: 'BS. CKI',
    bio: '',
    experienceYears: 5,
    consultationFee: 300000,
    hospitalAddress: 'Phòng khám MedCare'
  });

  // State quản lý danh sách chuyên khoa, lịch của bác sĩ và các khối lịch trình
  const [specialtiesList, setSpecialtiesList] = useState<Specialty[]>([]);
  const [scheduleDoctor, setScheduleDoctor] = useState<DoctorProfile | null>(null);
  const [doctorSchedules, setDoctorSchedules] = useState<DoctorSchedule[]>([]);
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false);
  const [specFormData, setSpecFormData] = useState({
    name: '',
    description: '',
    icon: 'Stethoscope'
  });

  // Hàm fetch dữ liệu thống kê từ server
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await api.get('/stats/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error('Error loading admin stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Hàm fetch tất cả lịch hẹn từ server với các tham số tìm kiếm và lọc trạng thái
  const fetchAllAppointments = async () => {
    setLoadingAppts(true);
    try {
      const params: any = {};
      if (apptSearch) params.search = apptSearch;
      if (apptStatusFilter) params.status = apptStatusFilter;
      const res = await api.get('/appointments/admin-all', { params });
      setAllAppointments(res.data);
    } catch (err) {
      console.error('Error fetching admin appointments:', err);
    } finally {
      setLoadingAppts(false);
    }
  };

  // Hàm fetch danh sách bác sĩ và chuyên khoa từ server
  const fetchDoctorsAndSpecialties = async () => {
    try {
      const [docRes, specRes] = await Promise.all([
        api.get('/doctors'),
        api.get('/specialties')
      ]);
      setDoctorsList(docRes.data);
      setSpecialtiesList(specRes.data);
      if (specRes.data.length > 0 && !docFormData.specialtyId) {
        setDocFormData(prev => ({ ...prev, specialtyId: specRes.data[0].id }));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  // useEffect để fetch dữ liệu khi component được mount
  useEffect(() => {
    fetchStats();
    fetchDoctorsAndSpecialties();
  }, []);

  // useEffect để fetch tất cả lịch hẹn khi tab active là 'appointments' hoặc khi filter thay đổi
  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchAllAppointments();
    }
  }, [activeTab, apptStatusFilter]);

  // Hàm xử lý cập nhật trạng thái lịch hẹn từ admin
  const handleUpdateApptStatus = async (apptId: string, status: string) => {
    try {
      await api.put(`/appointments/${apptId}/status`, { status });
      fetchAllAppointments();
      fetchStats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  // Hàm xử lý submit form tạo bác sĩ mới
  const handleCreateDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/doctors', docFormData);
      alert('Tạo bác sĩ thành công!');
      setShowDoctorModal(false);
      fetchDoctorsAndSpecialties();
      fetchStats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể tạo bác sĩ');
    }
  };

  // Hàm xử lý submit form tạo chuyên khoa mới
  const handleCreateSpecialtySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/specialties', specFormData);
      alert('Tạo chuyên khoa thành công!');
      setShowSpecialtyModal(false);
      fetchDoctorsAndSpecialties();
      fetchStats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể tạo chuyên khoa');
    }
  };

  // Hàm xử lý khi admin muốn xem lịch làm việc và các khối lịch trình của bác sĩ
  const handleViewDoctorSchedule = async (doctor: DoctorProfile) => {
    setScheduleDoctor(doctor);
    setLoadingSchedule(true);
    try {
      const res = await api.get(`/schedules/doctor/${doctor.id}`);
      setDoctorSchedules(res.data.schedules);
      setScheduleBlocks(res.data.blocks);
    } catch (err: any) {
      setScheduleDoctor(null);
      alert(err.response?.data?.message || 'Không thể tải lịch của bác sĩ');
    } finally {
      setLoadingSchedule(false);
    }
  };

  // Hàm xử lý khi admin muốn đóng modal xem lịch bác sĩ
  const dayLabels: Record<DoctorSchedule['dayOfWeek'], string> = {
    mon: 'Thứ 2', tue: 'Thứ 3', wed: 'Thứ 4', thu: 'Thứ 5',
    fri: 'Thứ 6', sat: 'Thứ 7', sun: 'Chủ nhật'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-teal-600" />
            Bảng Quản Trị Hệ Thống MedCare
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Quản lý bác sĩ, chuyên khoa, lịch hẹn toàn hệ thống & xem thống kê</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'stats' ? 'gradient-bg text-white shadow' : 'bg-slate-100 text-slate-700'
            }`}
          >
            📊 Thống Kê
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'appointments' ? 'gradient-bg text-white shadow' : 'bg-slate-100 text-slate-700'
            }`}
          >
            📅 Tất Cả Lịch Hẹn
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'doctors' ? 'gradient-bg text-white shadow' : 'bg-slate-100 text-slate-700'
            }`}
          >
            🩺 Quản Lý Bác Sĩ
          </button>
          <button
            onClick={() => setActiveTab('specialties')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'specialties' ? 'gradient-bg text-white shadow' : 'bg-slate-100 text-slate-700'
            }`}
          >
            🏥 Quản Lý Chuyên Khoa
          </button>
        </div>
      </div>

      {activeTab === 'stats' && (
        <div className="space-y-6">
          {loadingStats ? (
            <div className="text-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <span className="text-xs font-bold text-slate-400 block">Tổng Lịch Hẹn Hệ Thống</span>
                  <p className="text-3xl font-extrabold text-slate-900">{stats?.summary?.totalAppointments || 0}</p>
                  <span className="text-[10px] text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded-full">
                    Hôm nay: {stats?.summary?.todayAppointments || 0} ca
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <span className="text-xs font-bold text-slate-400 block">Số Ca Đã Khám Xong</span>
                  <p className="text-3xl font-extrabold text-emerald-600">{stats?.summary?.completedAppointments || 0}</p>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    Tỷ lệ hoàn thành cao
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <span className="text-xs font-bold text-slate-400 block">Tổng Bác Sĩ Đang Hoạt Động</span>
                  <p className="text-3xl font-extrabold text-sky-600">{stats?.summary?.totalDoctors || 0}</p>
                  <span className="text-[10px] text-sky-600 font-bold bg-sky-50 px-2 py-0.5 rounded-full">
                    {stats?.summary?.totalSpecialties || 0} Chuyên khoa
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <span className="text-xs font-bold text-slate-400 block">Tổng Bệnh Nhân Đăng Ký</span>
                  <p className="text-3xl font-extrabold text-purple-600">{stats?.summary?.totalPatients || 0}</p>
                  <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-full">
                    Khách hàng cá nhân
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Top Bác Sĩ Đóng Góp & Được Đặt Nhiều Nhất
                </h3>

                <div className="space-y-3">
                  {stats?.topDoctors?.map((doc: any, idx: number) => (
                    <div key={doc.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{doc.user?.fullName}</p>
                          <p className="text-[10px] text-slate-500">{doc.specialty?.name} • Rating: {doc.ratingAvg}★</p>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
                        {doc._count?.appointments || 0} Lịch hẹn
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Quản Lý Toàn Bộ Lịch Hẹn Hệ Thống</h2>
              <p className="text-xs text-slate-500">Xác nhận hoặc hủy lịch hẹn hộ bệnh nhân khi gọi điện thoại</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={apptStatusFilter}
                onChange={(e) => setApptStatusFilter(e.target.value)}
                className="p-2 text-xs font-bold rounded-xl border border-slate-300 outline-none"
              >
                <option value="">Tất cả Trạng thái</option>
                <option value="PENDING">PENDING (Chờ xác nhận)</option>
                <option value="CONFIRMED">CONFIRMED (Đã xác nhận)</option>
                <option value="COMPLETED">COMPLETED (Đã khám xong)</option>
                <option value="CANCELLED">CANCELLED (Đã hủy)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="p-3">Mã Lịch</th>
                  <th className="p-3">Bệnh Nhân</th>
                  <th className="p-3">Bác Sĩ / Khoa</th>
                  <th className="p-3">Ngày & Khung Giờ</th>
                  <th className="p-3">Trạng Thái</th>
                  <th className="p-3 text-right">Thao Tác Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-teal-800">{appt.appointmentCode}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{appt.patient?.fullName}</p>
                      <p className="text-[10px] text-slate-500">{appt.patient?.phone}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-800">{appt.doctor?.user?.fullName}</p>
                      <p className="text-[10px] text-slate-500">{appt.doctor?.specialty?.name}</p>
                    </td>
                    <td className="p-3 font-medium">
                      {appt.date.slice(0, 10)} <br />
                      <span className="font-bold text-slate-700">{appt.startTime} - {appt.endTime}</span>
                    </td>
                    <td className="p-3">
                      {appt.status === 'PENDING' && <span className="badge-pending">Chờ xác nhận</span>}
                      {appt.status === 'CONFIRMED' && <span className="badge-confirmed">Đã xác nhận</span>}
                      {appt.status === 'COMPLETED' && <span className="badge-completed">Đã khám xong</span>}
                      {appt.status === 'CANCELLED' && <span className="badge-cancelled">Đã hủy</span>}
                    </td>
                    <td className="p-3 text-right space-x-1">
                      {appt.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateApptStatus(appt.id, 'CONFIRMED')}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                          Xác Nhận
                        </button>
                      )}
                      {appt.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateApptStatus(appt.id, 'COMPLETED')}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                        >
                          Đã Khám Xong
                        </button>
                      )}
                      {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleUpdateApptStatus(appt.id, 'CANCELLED')}
                          className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 rounded-lg border border-rose-200 hover:bg-rose-100"
                        >
                          Hủy Hộ
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'doctors' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Danh Sách Bác Sĩ Hệ Thống</h2>
              <p className="text-xs text-slate-500">Thêm mới bác sĩ, phân công chuyên khoa và tài khoản đăng nhập</p>
            </div>
            <button
              onClick={() => setShowDoctorModal(true)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white gradient-bg flex items-center gap-1 shadow"
            >
              <Plus className="w-4 h-4" /> Thêm Bác Sĩ Mới
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctorsList.map((doc) => (
              <div key={doc.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full">
                    {doc.specialty?.name}
                  </span>
                  <span className="text-xs font-bold text-amber-700">{doc.ratingAvg}★</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{doc.user?.fullName}</h3>
                <p className="text-xs text-slate-500">{doc.title} • {doc.experienceYears} năm KN</p>
                <p className="text-xs font-bold text-slate-700">Giá: {doc.consultationFee?.toLocaleString('vi-VN')} đ</p>
                <button
                  onClick={() => handleViewDoctorSchedule(doc)}
                  className="mt-2 w-full px-3 py-2 text-xs font-bold text-teal-700 bg-teal-50 rounded-xl border border-teal-100 hover:bg-teal-100 flex items-center justify-center gap-1.5"
                >
                  <CalendarDays className="w-4 h-4" /> Xem lịch làm việc & lịch bận
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'specialties' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Danh Mục Chuyên Khoa Y Tế</h2>
              <p className="text-xs text-slate-500">Tương tự Category sản phẩm, dùng để phân loại bác sĩ</p>
            </div>
            <button
              onClick={() => setShowSpecialtyModal(true)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white gradient-bg flex items-center gap-1 shadow"
            >
              <Plus className="w-4 h-4" /> Thêm Chuyên Khoa
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {specialtiesList.map((spec) => (
              <div key={spec.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">Khoa {spec.name}</h3>
                <p className="text-xs text-slate-600 line-clamp-2">{spec.description}</p>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full">
                  {spec._count?.doctors || 0} Bác sĩ trực thuộc
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl my-8">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Thêm Bác Sĩ Mới
            </h3>

            <form onSubmit={handleCreateDoctorSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email (*):</label>
                  <input
                    type="email"
                    required
                    value={docFormData.email}
                    onChange={(e) => setDocFormData({ ...docFormData, email: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mật khẩu (*):</label>
                  <input
                    type="password"
                    required
                    value={docFormData.password}
                    onChange={(e) => setDocFormData({ ...docFormData, password: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Họ và Tên Bác sĩ (*):</label>
                <input
                  type="text"
                  required
                  value={docFormData.fullName}
                  onChange={(e) => setDocFormData({ ...docFormData, fullName: e.target.value })}
                  placeholder="BS. CKI Nguyễn Văn A"
                  className="w-full p-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chuyên khoa (*):</label>
                  <select
                    value={docFormData.specialtyId}
                    onChange={(e) => setDocFormData({ ...docFormData, specialtyId: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl"
                  >
                    {specialtiesList.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Học vị / Chức danh:</label>
                  <input
                    type="text"
                    value={docFormData.title}
                    onChange={(e) => setDocFormData({ ...docFormData, title: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số năm kinh nghiệm:</label>
                  <input
                    type="number"
                    value={docFormData.experienceYears}
                    onChange={(e) => setDocFormData({ ...docFormData, experienceYears: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giá khám (VNĐ):</label>
                  <input
                    type="number"
                    value={docFormData.consultationFee}
                    onChange={(e) => setDocFormData({ ...docFormData, consultationFee: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô tả tiểu sử bác sĩ:</label>
                <textarea
                  value={docFormData.bio}
                  onChange={(e) => setDocFormData({ ...docFormData, bio: e.target.value })}
                  rows={2}
                  className="w-full p-2 border border-slate-300 rounded-xl"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDoctorModal(false)}
                  className="py-2.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="py-2.5 text-xs font-bold text-white gradient-bg rounded-xl"
                >
                  Tạo Bác Sĩ Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSpecialtyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Thêm Chuyên Khoa Mới
            </h3>

            <form onSubmit={handleCreateSpecialtySubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên chuyên khoa (*):</label>
                <input
                  type="text"
                  required
                  placeholder="Ngoại khoa, Mắt, Răng Hàm Mặt..."
                  value={specFormData.name}
                  onChange={(e) => setSpecFormData({ ...specFormData, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô tả chuyên khoa:</label>
                <textarea
                  value={specFormData.description}
                  onChange={(e) => setSpecFormData({ ...specFormData, description: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSpecialtyModal(false)}
                  className="py-2.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="py-2.5 text-xs font-bold text-white gradient-bg rounded-xl"
                >
                  Lưu Chuyên Khoa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {scheduleDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Lịch của {scheduleDoctor.user?.fullName}</h3>
                <p className="text-xs text-slate-500 mt-1">Lịch làm việc cố định và các khung giờ đã đăng ký bận</p>
              </div>
              <button onClick={() => setScheduleDoctor(null)} className="p-2 text-slate-500 hover:text-slate-900" aria-label="Đóng">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingSchedule ? (
              <div className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <section>
                  <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2"><Clock3 className="w-4 h-4 text-teal-600" /> Lịch làm việc tuần</h4>
                  <div className="space-y-2">
                    {doctorSchedules.length === 0 ? <p className="text-xs text-slate-500">Chưa đăng ký lịch làm việc.</p> : doctorSchedules.map(schedule => (
                      <div key={schedule.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <span className="font-bold text-slate-800">{dayLabels[schedule.dayOfWeek]}</span>
                        <span className="text-slate-600">{schedule.isAvailable ? `${schedule.startTime} - ${schedule.endTime}` : 'Không làm việc'}</span>
                        <span className="text-[10px] text-slate-400">{schedule.slotDurationMinutes} phút/ca</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2"><CalendarDays className="w-4 h-4 text-rose-600" /> Lịch bận đã đăng ký</h4>
                  <div className="space-y-2">
                    {scheduleBlocks.length === 0 ? <p className="text-xs text-slate-500">Chưa có lịch bận.</p> : scheduleBlocks.map(block => (
                      <div key={block.id} className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs">
                        <div className="flex items-center justify-between font-bold text-rose-800"><span>{block.date}</span><span>{block.startTime} - {block.endTime}</span></div>
                        <p className="mt-1 text-rose-700">{block.reason || 'Bận đột xuất / Nghỉ phép'}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
