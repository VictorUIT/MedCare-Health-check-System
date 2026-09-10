import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Stethoscope, RotateCcw } from 'lucide-react';
import api from '../services/api';
import DoctorCard from '../components/DoctorCard';
import { DoctorProfile, Specialty } from '../types';

// Component hiển thị danh sách bác sĩ kèm chức năng tìm kiếm và lọc
export default function DoctorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get('specialtyId') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [minRating, setMinRating] = useState('');
  const [maxFee, setMaxFee] = useState('');

  // useEffect để fetch danh sách chuyên khoa khi component được mount
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await api.get('/specialties');
        setSpecialties(res.data);
      } catch (err) {
        console.error('Error loading specialties:', err);
      }
    };
    fetchSpecialties();
  }, []);

  // useEffect để cập nhật URL khi các bộ lọc thay đổi
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedSpecialty) params.specialtyId = selectedSpecialty;
      if (searchQuery) params.search = searchQuery;
      if (minRating) params.minRating = minRating;
      if (maxFee) params.maxFee = maxFee;

      const res = await api.get('/doctors', { params });
      setDoctors(res.data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  // useEffect để fetch danh sách bác sĩ khi component được mount hoặc khi các bộ lọc thay đổi
  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty, minRating, maxFee]);

  // Hàm xử lý khi người dùng submit form tìm kiếm
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors();
  };

  // Hàm xử lý khi người dùng muốn đặt lại các bộ lọc
  const handleResetFilters = () => {
    setSelectedSpecialty('');
    setSearchQuery('');
    setMinRating('');
    setMaxFee('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Danh Sách Bác Sĩ Chuyên Khoa
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Tìm kiếm bác sĩ theo chuyên khoa, kinh nghiệm, mức giá và đặt lịch hẹn khám trực tuyến
        </p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tên bác sĩ, học vị..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-slate-700 font-medium"
            >
              <option value="">-- Tất cả Chuyên khoa --</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-slate-700"
            >
              <option value="">Tất cả Đánh giá</option>
              <option value="4.5">⭐ 4.5 sao trở lên</option>
              <option value="4.0">⭐ 4.0 sao trở lên</option>
            </select>
          </div>

          <div className="md:col-span-3 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white gradient-bg shadow-sm hover:opacity-95 transition-opacity"
            >
              Tìm Bác Sĩ
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              title="Đặt lại bộ lọc"
              className="p-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </form>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Lọc nhanh:</span>
          <button
            onClick={() => setSelectedSpecialty('')}
            className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors ${
              selectedSpecialty === ''
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả
          </button>
          {specialties.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSpecialty(s.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                selectedSpecialty === s.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-500 font-medium">Đang tải danh sách bác sĩ...</p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 max-w-md mx-auto space-y-3">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">Không tìm thấy bác sĩ phù hợp</h3>
          <p className="text-xs text-slate-500">Vui lòng thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc.</p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-teal-50 text-teal-700 rounded-xl text-xs font-bold hover:bg-teal-100"
          >
            Đặt lại tìm kiếm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}

    </div>
  );
}
