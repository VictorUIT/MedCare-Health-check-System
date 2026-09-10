import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Stethoscope,
  CalendarCheck,
  ArrowRight,
  Brain,
  Baby,
  Smile,
  HeartPulse,
  Ear
} from 'lucide-react';
import api from '../services/api';
import DoctorCard from '../components/DoctorCard';
import AISymptomModal from '../components/AISymptomModal';
import { Specialty, DoctorProfile } from '../types';

// HomePage component
export default function HomePage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // useEffect để fetch danh sách chuyên khoa và bác sĩ nổi bật khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [specRes, docRes] = await Promise.all([
          api.get('/specialties'),
          api.get('/doctors?minRating=4.5')
        ]);
        setSpecialties(specRes.data);
        setDoctors(docRes.data.slice(0, 6));
      } catch (err) {
        console.error('Error loading homepage data:', err);
      }
    };
    fetchData();
  }, []);

  // Hàm xử lý khi người dùng submit form tìm kiếm bác sĩ
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctors?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Hàm lấy icon tương ứng với chuyên khoa
  const getSpecialtyIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Brain': return <Brain className="w-6 h-6 text-teal-600" />;
      case 'Baby': return <Baby className="w-6 h-6 text-teal-600" />;
      case 'Smile': return <Smile className="w-6 h-6 text-teal-600" />;
      case 'HeartPulse': return <HeartPulse className="w-6 h-6 text-teal-600" />;
      case 'Ear': return <Ear className="w-6 h-6 text-teal-600" />;
      default: return <Stethoscope className="w-6 h-6 text-teal-600" />;
    }
  };

  return (
    <div className="space-y-16 pb-16">
      
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white pt-20 pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-500/20 via-transparent to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold shadow-inner">
                <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
                Hệ thống Y tế & Đặt lịch Khám Bệnh Trực tuyến MedCare (TypeScript)
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Chăm sóc sức khỏe <br />
                <span className="gradient-text">Nhanh chóng & Chu đáo</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Đặt lịch khám với các bác sĩ chuyên khoa giỏi hàng đầu, chủ động lựa chọn khung giờ trống và sử dụng <strong>Trợ lý AI gợi ý chuyên khoa</strong> theo triệu chứng.
              </p>

              <div className="bg-white/10 backdrop-blur-md p-3 rounded-3xl border border-white/20 shadow-2xl max-w-xl mx-auto lg:mx-0 space-y-3">
                
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-white rounded-2xl p-2 shadow-inner">
                  <Search className="w-5 h-5 text-slate-400 ml-2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm tên bác sĩ, chuyên khoa..."
                    className="w-full text-sm text-slate-900 placeholder:text-slate-400 bg-transparent border-none focus:outline-none px-2"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-white gradient-bg hover:opacity-95 transition-all shrink-0"
                  >
                    Tìm Kiếm
                  </button>
                </form>

                <div className="flex items-center justify-between px-2 pt-1">
                  <span className="text-xs text-slate-300">Không chắc chắn triệu chứng?</span>
                  <button
                    onClick={() => setAiModalOpen(true)}
                    className="text-xs font-bold text-teal-300 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    Hỏi AI Gợi Ý Ngay →
                  </button>
                </div>

              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 max-w-lg mx-auto lg:mx-0 border-t border-white/10 text-center lg:text-left">
                <div>
                  <p className="text-2xl font-extrabold text-white">50+</p>
                  <p className="text-xs text-slate-400 font-medium">Bác sĩ chuyên khoa</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-white">10.000+</p>
                  <p className="text-xs text-slate-400 font-medium">Bệnh nhân hài lòng</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-teal-400">4.9/5★</p>
                  <p className="text-xs text-slate-400 font-medium">Đánh giá uy tín</p>
                </div>
              </div>

            </div>

            <div className="lg:col-span-5 relative hidden lg:block">
              <div className="relative mx-auto max-w-md">
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&auto=format&fit=crop&q=80"
                  alt="Bác sĩ thăm khám"
                  className="rounded-3xl shadow-2xl border-4 border-white/20 object-cover w-full h-[450px]"
                />
                
                <div className="absolute -bottom-6 -left-6 glass-panel p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-white/50 text-slate-900 max-w-xs">
                  <div className="w-12 h-12 rounded-xl gradient-bg text-white flex items-center justify-center font-bold shrink-0">
                    <CalendarCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Đặt Lịch 24/7</p>
                    <p className="text-[11px] text-slate-500">Xác nhận ngay lập tức, không chờ đợi</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-extrabold text-teal-600 uppercase tracking-widest block mb-1">
              Danh Mục Khám Chữa Bệnh
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Các Chuyên Khoa Y Tế
            </h2>
          </div>
          <Link
            to="/doctors"
            className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
          >
            Xem tất cả chuyên khoa <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {specialties.map((spec) => (
            <Link
              key={spec.id}
              to={`/doctors?specialtyId=${spec.id}`}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all">
                  {getSpecialtyIcon(spec.icon)}
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1 group-hover:text-teal-600 transition-colors">
                  {spec.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {spec.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>{spec._count?.doctors || 0} Bác sĩ</span>
                <ChevronRightIcon />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-extrabold text-teal-600 uppercase tracking-widest block mb-1">
              Đội Ngũ Chuyên Gia
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Bác Sĩ Nổi Bật Được Đánh Giá Cao
            </h2>
          </div>
          <Link
            to="/doctors"
            className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            Xem danh sách đầy đủ <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden gradient-bg text-white p-8 sm:p-12 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-teal-200" />
              Công Nghệ Độc Quyền AI MedCare
            </div>
            <h2 className="text-3xl font-extrabold">
              Bắt đầu với mô tả triệu chứng tự nhiên bằng Tiếng Việt
            </h2>
            <p className="text-sm text-teal-100 leading-relaxed">
              Nhập các biểu hiện mệt mỏi, đau nhức hay lo âu. Trợ lý AI sẽ tự động phân tích và chỉ định chuyên khoa khám có liên quan kèm danh sách bác sĩ giỏi nhất.
            </p>
            <button
              onClick={() => setAiModalOpen(true)}
              className="mt-2 px-6 py-3 rounded-xl bg-white text-teal-900 font-bold text-sm hover:bg-teal-50 transition-colors shadow-lg flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-teal-600" />
              Trải Nghiệm Tính Năng AI Ngay
            </button>
          </div>
        </div>
      </section>

      <AISymptomModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
    </div>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
