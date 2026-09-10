import React from 'react';
import { Stethoscope, Heart, Phone, Mail, MapPin, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

// Component đại diện cho phần footer của trang web
export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white">
                <Stethoscope className="w-6 h-6" />
              </div>
              <span className="text-2xl font-extrabold text-white">Med<span className="text-teal-400">Care</span></span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Nền tảng đặt lịch khám bệnh trực tuyến cho phòng khám y tế uy tín. Tìm kiếm bác sĩ giỏi, xem lịch trống và đặt lịch nhanh chóng.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold bg-teal-950/50 border border-teal-800/50 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4" />
              Bảo mật thông tin hồ sơ y tế 100%
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-base mb-4">Liên Kết Nhanh</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/doctors" className="hover:text-teal-400 transition-colors">Tìm kiếm Bác sĩ</Link>
              </li>
              <li>
                <Link to="/my-appointments" className="hover:text-teal-400 transition-colors">Quản lý Lịch hẹn</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-teal-400 transition-colors">Đăng nhập Bác sĩ / Lễ tân</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-teal-400 transition-colors">Đăng ký Bệnh nhân mới</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-base mb-4">Chuyên Khoa Nổi Bật</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>• Khoa Thần kinh & Tiền đình</li>
              <li>• Khoa Nhi & Dinh dưỡng trẻ em</li>
              <li>• Khoa Tim mạch & Huyết áp</li>
              <li>• Khoa Da liễu & Thẩm mỹ y khoa</li>
              <li>• Tham vấn & Trị liệu Tâm lý</li>
              <li>• Khoa Tai Mũi Họng</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-base mb-4">Liên Hệ & Hotline</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 text-slate-300">
                <MapPin className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <span>227 Nguyễn Văn Cừ, Phường 4, Quận 5, TP. Hồ Chí Minh</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Phone className="w-5 h-5 text-teal-400 shrink-0" />
                <span className="font-bold text-white">Hotline: 1900 - 6789 (24/7)</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Mail className="w-5 h-5 text-teal-400 shrink-0" />
                <span>support@medcare.vn</span>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-8 bg-amber-950/40 border border-amber-800/40 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200/90 leading-relaxed">
            <strong className="text-amber-300">Miễn trừ trách nhiệm y khoa:</strong> Các thông tin gợi ý từ tính năng AI trên website chỉ mang tính chất tham khảo định hướng chuyên khoa. Trong trường hợp khẩn cấp hoặc cấp cứu y tế nguy hiểm đến tính mạng, vui lòng gọi điện thoại ngay tới <strong>115</strong> hoặc di chuyển đến cơ sở y tế gần nhất.
          </p>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 MedCare Health-check System. Đồ án tốt nghiệp Full-stack JavaScript/TypeScript - CSC ĐH KHTN TP.HCM.</p>
          <p className="flex items-center gap-1">
            Được phát triển với <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> và ReactJS, ExpressJS & TypeScript
          </p>
        </div>
      </div>
    </footer>
  );
}
