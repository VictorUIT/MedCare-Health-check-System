import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Calendar, Award } from 'lucide-react';
import { DoctorProfile } from '../types';

// Các props cho DoctorCard component
interface DoctorCardProps {
  doctor: DoctorProfile;
}

// Component hiển thị thông tin cơ bản của Bác sĩ
export default function DoctorCard({ doctor }: DoctorCardProps) {
  const user = doctor.user || { fullName: '' };
  const specialty = doctor.specialty || { name: 'Chuyên khoa' };

  // Các props cho AISymptomModal component
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="px-3 py-1 text-xs font-bold bg-teal-50 text-teal-700 rounded-full border border-teal-100">
            {specialty.name}
          </span>
          <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-amber-800">{doctor.ratingAvg || 5.0}</span>
            <span className="text-[10px] text-slate-400">({doctor.totalReviews || 0})</span>
          </div>
        </div>

        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-sky-600 text-white font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
            {user.fullName ? user.fullName.split(' ').pop()?.charAt(0) : 'B'}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-teal-600 transition-colors">
              {user.fullName || 'Bác sĩ'}
            </h3>
            <p className="text-xs font-semibold text-slate-500 mb-1">{doctor.title || 'Bác sĩ chuyên khoa'}</p>
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Award className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>{doctor.experienceYears || 5} năm kinh nghiệm</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed bg-slate-50 p-2.5 rounded-xl">
          {doctor.bio || 'Bác sĩ tận tâm, giàu kinh nghiệm chuyên môn.'}
        </p>

        <div className="flex items-start gap-2 text-xs text-slate-500 mb-4">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span className="line-clamp-1">{doctor.hospitalAddress || 'Phòng khám MedCare'}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">Giá khám dịch vụ</span>
          <span className="text-sm font-extrabold text-teal-700">
            {doctor.consultationFee ? doctor.consultationFee.toLocaleString('vi-VN') : '300.000'} đ
          </span>
        </div>

        <Link
          to={`/doctors/${doctor.id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white gradient-bg shadow-sm hover:shadow-md hover:scale-105 transition-all"
        >
          <Calendar className="w-3.5 h-3.5" />
          Đặt lịch
        </Link>
      </div>
    </div>
  );
}
