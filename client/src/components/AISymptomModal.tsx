import React, { useState } from 'react';
import { Sparkles, X, AlertTriangle, ArrowRight, Stethoscope, CheckCircle2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AISuggestionResponse } from '../types';

// Các props cho AISymptomModal component
interface AISymptomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// AISymptomModal component dùng để phân tích triệu chứng và gợi ý chuyên khoa
export default function AISymptomModal({ isOpen, onClose }: AISymptomModalProps) {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AISuggestionResponse | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Nếu modal không mở, không render gì
  if (!isOpen) return null;

  // Xử lý khi người dùng nhấn nút phân tích triệu chứng
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim() || symptoms.trim().length < 5) {
      setError('Vui lòng nhập mô tả triệu chứng của bạn (tối thiểu 5 ký tự).');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await api.post('/ai/suggest-specialty', { symptoms });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi phân tích triệu chứng bằng AI.');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi người dùng nhấn nút đặt lịch với bác sĩ được gợi ý
  const handleBookDoctor = (doctorId: string) => {
    onClose();
    navigate(`/doctors/${doctorId}`);
  };

  // Xử lý khi người dùng nhấn vào một ví dụ mô tả triệu chứng mẫu
  const handleSampleClick = (sampleText: string) => {
    setSymptoms(sampleText);
  };

  // Render modal với giao diện người dùng
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8">
        
        <div className="gradient-bg p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
              <Sparkles className="w-6 h-6 text-teal-200" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold">Trợ Lý AI Gợi Ý Chuyên Khoa</h2>
              <p className="text-xs text-teal-100">Mô tả triệu chứng bằng tiếng Việt tự nhiên để nhận gợi ý bác sĩ phù hợp</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Ví dụ mô tả triệu chứng mẫu:
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                "Tôi hay bị đau đầu và mất ngủ, hoa mắt chóng mặt",
                "Em bé 2 tuổi bị sốt cao kèm biếng ăn và ho",
                "Da mặt bị nổi mẩn đỏ ngứa sau khi xài kem",
                "Tôi hay bị đau thắt ngực khi vận động mạnh"
              ].map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSampleClick(sample)}
                  className="text-xs px-3 py-1.5 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 font-medium transition-colors text-left"
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">
                Mô tả triệu chứng hiện tại của bạn:
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={3}
                placeholder="Ví dụ: Dạo này tôi hay bị đầy hơi, đau bụng âm ỉ vùng thượng vị sau khi ăn..."
                className="w-full p-3.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none"
              ></textarea>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white gradient-bg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang phân tích triệu chứng với AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Phân Tích & Gợi Ý Chuyên Khoa
                </>
              )}
            </button>
          </form>

          {result && (
            <div className="space-y-5 pt-4 border-t border-slate-100 animate-fade-in">
              
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-teal-600" />
                  Kết quả phân tích từ AI:
                </div>
                <p className="text-xs text-teal-800 leading-relaxed font-medium">
                  {result.reasoning}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Chuyên khoa & Bác sĩ được đề xuất:
                </h4>
                
                <div className="space-y-4">
                  {result.suggestedSpecialties?.map((spec) => (
                    <div key={spec.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-5 h-5 text-teal-600" />
                          <span className="font-bold text-slate-900 text-sm">Khoa {spec.name}</span>
                        </div>
                        <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2.5 py-0.5 rounded-full">
                          Đề xuất hàng đầu
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mb-3">{spec.description}</p>

                      <div className="space-y-2">
                        {spec.doctors?.map((doc) => (
                          <div
                            key={doc.id}
                            className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between hover:border-teal-400 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-teal-600 text-white font-bold flex items-center justify-center text-sm">
                                {doc.user?.fullName?.split(' ').pop()?.charAt(0) || 'B'}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900">{doc.user?.fullName}</p>
                                <p className="text-[10px] text-slate-500">{doc.title} • {doc.experienceYears} năm kinh nghiệm</p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleBookDoctor(doc.id)}
                              className="px-3 py-1.5 text-xs font-bold text-white gradient-bg rounded-lg flex items-center gap-1 shadow-sm hover:scale-105 transition-transform"
                            >
                              Đặt lịch
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                  {result.disclaimer}
                </p>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
