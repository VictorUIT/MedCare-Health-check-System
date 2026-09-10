import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Award,
  Star,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  Loader2
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DoctorProfile, SlotsResponse, Appointment } from '../types';

// Component hiển thị chi tiết thông tin bác sĩ và cho phép người dùng đặt lịch khám trực tuyến
export default function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [slotsData, setSlotsData] = useState<SlotsResponse | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [patientNotes, setPatientNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [successAppointment, setSuccessAppointment] = useState<Appointment | null>(null);

  // useEffect để fetch thông tin bác sĩ khi component được mount
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await api.get(`/doctors/${id}`);
        setDoctor(res.data);
      } catch (err) {
        console.error('Error fetching doctor details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  // useEffect để fetch các khung giờ trống của bác sĩ khi ngày hoặc id bác sĩ thay đổi
  useEffect(() => {
    const fetchSlots = async () => {
      if (!id || !selectedDate) return;
      setSlotsLoading(true);
      setSelectedSlot('');
      try {
        const res = await api.get(`/schedules/available/${id}?date=${selectedDate}`);
        setSlotsData(res.data);
      } catch (err) {
        console.error('Error fetching available slots:', err);
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [id, selectedDate]);

  // Hàm xử lý khi người dùng submit form đặt lịch khám
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!selectedSlot) {
      setBookingError('Vui lòng chọn một khung giờ khám còn trống.');
      return;
    }

    setBookingError('');
    setBookingLoading(true);

    try {
      const res = await api.post('/appointments', {
        doctorId: id,
        date: selectedDate,
        startTime: selectedSlot.split(' - ')[0],
        endTime: selectedSlot.split(' - ')[1],
        patientNotes
      });

      setSuccessAppointment(res.data.appointment);
    } catch (err: any) {
      setBookingError(err.response?.data?.message || 'Không thể tạo lịch hẹn. Vui lòng thử lại.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-slate-500 font-medium">Đang tải thông tin bác sĩ...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl text-center border border-slate-200 shadow-sm space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Không tìm thấy bác sĩ</h2>
        <p className="text-xs text-slate-500">Bác sĩ này có thể đã bị ngưng hoạt động hoặc không tồn tại.</p>
        <Link to="/doctors" className="inline-block px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold">
          Trở về danh sách bác sĩ
        </Link>
      </div>
    );
  }

  const doctorUser = doctor.user || { fullName: '' };
  const specialty = doctor.specialty || { name: '' };
  const reviews = doctor.reviews || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <Link to="/doctors" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-teal-600">
        <ChevronLeft className="w-4 h-4" /> Trở về danh sách Bác sĩ
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="w-24 h-24 rounded-3xl gradient-bg text-white font-extrabold text-4xl flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/20">
                {doctorUser.fullName ? doctorUser.fullName.split(' ').pop()?.charAt(0) : 'B'}
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 text-xs font-bold bg-teal-50 text-teal-700 rounded-full border border-teal-100">
                    Khoa {specialty.name}
                  </span>
                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-amber-800">{doctor.ratingAvg || 5.0}</span>
                    <span className="text-[10px] text-slate-400">({doctor.totalReviews || 0} đánh giá)</span>
                  </div>
                </div>

                <h1 className="text-2xl font-extrabold text-slate-900">{doctorUser.fullName}</h1>
                <p className="text-sm font-semibold text-slate-500">{doctor.title}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Award className="w-4 h-4 text-teal-600" />
                    {doctor.experienceYears} năm kinh nghiệm
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {doctor.hospitalAddress}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-slate-100 space-y-2">
              <h3 className="text-sm font-bold text-slate-900">Giới thiệu & Quá trình công tác</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl">
                {doctor.bio}
              </p>
            </div>

            <div className="p-4 bg-teal-50/70 border border-teal-100 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Chi phí khám tư vấn</span>
                <span className="text-lg font-extrabold text-teal-800">
                  {doctor.consultationFee?.toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
              <span className="text-[11px] text-teal-700 bg-teal-100 font-bold px-3 py-1 rounded-full">
                Thanh toán tại phòng khám
              </span>
            </div>

          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span>Đánh Giá Từ Bệnh Nhân</span>
              <span className="text-xs font-semibold text-slate-500">{reviews.length} đánh giá</span>
            </h3>

            {reviews.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">Bác sĩ chưa có đánh giá nào từ bệnh nhân.</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{rev.patient?.fullName || 'Bệnh nhân'}</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {rev.comment && (
                      <p className="text-xs text-slate-600 leading-relaxed">"{rev.comment}"</p>
                    )}
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl border border-teal-200 shadow-xl p-6 sticky top-24 space-y-5">
            
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                Đặt Lịch Khám Trực Tuyến
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Chọn ngày và khung giờ khám trống của bác sĩ</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Chọn ngày khám:
              </label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Chọn khung giờ (Slot 30 phút):
              </label>

              {slotsLoading ? (
                <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                  Đang tải khung giờ trống...
                </div>
              ) : !slotsData?.isAvailableDay ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center font-medium">
                  Bác sĩ không có lịch làm việc vào ngày này. Vui lòng chọn ngày khác.
                </div>
              ) : slotsData.slots.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-100 text-slate-600 text-xs text-center font-medium">
                  Không có khung giờ khả dụng.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {slotsData.slots.map((slotObj, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={!slotObj.isAvailable}
                      onClick={() => setSelectedSlot(slotObj.timeSlot)}
                      className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center border ${
                        !slotObj.isAvailable
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                          : selectedSlot === slotObj.timeSlot
                          ? 'bg-teal-600 text-white border-teal-600 shadow-md scale-95'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-teal-500 hover:bg-teal-50'
                      }`}
                    >
                      {slotObj.timeSlot}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  3. Lý do khám / Mô tả triệu chứng:
                </label>
                <textarea
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  rows={2}
                  placeholder="Ví dụ: Đau đầu kéo dài 3 ngày qua..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                ></textarea>
              </div>

              {bookingError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {bookingError}
                </div>
              )}

              <button
                type="submit"
                disabled={bookingLoading || !selectedSlot}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white gradient-bg shadow-lg shadow-teal-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang xử lý đặt lịch...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Xác Nhận Đặt Lịch Khám
                  </>
                )}
              </button>
            </form>

          </div>
        </div>

      </div>

      {successAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-5 shadow-2xl border border-slate-100">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Đặt Lịch Thành Công!</h3>
              <p className="text-xs text-slate-500 mt-1">Mã lịch hẹn của bạn là:</p>
              <div className="mt-2 text-lg font-extrabold text-teal-700 bg-teal-50 border border-teal-200 py-2 rounded-xl">
                {successAppointment.appointmentCode}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl text-left text-xs space-y-2 text-slate-700 border border-slate-200">
              <p><strong>Bác sĩ:</strong> {doctorUser.fullName}</p>
              <p><strong>Ngày khám:</strong> {successAppointment.date.slice(0, 10)}</p>
              <p><strong>Khung giờ:</strong> {successAppointment.startTime} - {successAppointment.endTime}</p>
              <p><strong>Trạng thái:</strong> <span className="badge-pending">Chờ phòng khám xác nhận</span></p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate('/my-appointments')}
                className="py-2.5 text-xs font-bold text-white gradient-bg rounded-xl shadow"
              >
                Xem Lịch Hẹn Của Tôi
              </button>
              <button
                onClick={() => setSuccessAppointment(null)}
                className="py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
