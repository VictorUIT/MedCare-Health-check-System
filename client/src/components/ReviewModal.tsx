import React, { useState } from 'react';
import { Star, X, Loader2, MessageSquare } from 'lucide-react';
import api from '../services/api';
import { Appointment } from '../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onSuccess: () => void;
}
// Modal component gửi đánh giá về bác sĩ sau buổi khám
export default function ReviewModal({ isOpen, onClose, appointment, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Nếu modal không mở hoặc không có cuộc hẹn nào, thì không hiển thị gì cả
  if (!isOpen || !appointment) return null;

  // Hàm xử lý khi người dùng gửi đánh giá
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/reviews', {
        appointmentId: appointment.id,
        rating,
        comment
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  // Lấy tên bác sĩ từ cuộc hẹn, nếu không có thì hiển thị "Bác sĩ"
  const doctorName = appointment.doctor?.user?.fullName || 'Bác sĩ';

  // JSX hiển thị modal đánh giá
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        
        <div className="gradient-bg p-6 text-white relative text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md mx-auto mb-3 flex items-center justify-center text-2xl font-bold">
            ⭐
          </div>
          <h3 className="text-lg font-extrabold">Đánh Giá Bác Sĩ</h3>
          <p className="text-xs text-teal-100 mt-1">{doctorName} • {appointment.specialty?.name || 'Khám chữa bệnh'}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div className="text-center">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Chọn mức độ hài lòng:
            </label>
            <div className="flex justify-center items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-amber-700 mt-2">
              {rating === 5 && 'Tuyệt vời, bác sĩ rất tận tâm!'}
              {rating === 4 && 'Hài lòng với trải nghiệm khám'}
              {rating === 3 && 'Bình thường'}
              {rating === 2 && 'Chưa thực sự hài lòng'}
              {rating === 1 && 'Rất kém'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nhận xét chi tiết (không bắt buộc):
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Chia sẻ trải nghiệm của bạn về thái độ phục vụ, tính chính xác và tư vấn của bác sĩ..."
              className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
            ></textarea>
          </div>

          {error && (
            <p className="text-xs text-rose-600 font-semibold text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-bold text-white gradient-bg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang gửi đánh giá...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                Gửi Đánh Giá Ngay
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
}
