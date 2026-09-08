import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../services/aiService';

const MEDICAL_RULES = [
  {
    specialtyName: 'Nội khoa',
    keywords: ['đau bụng', 'tiêu chảy', 'táo bón', 'đầy hơi', 'dạ dày', 'trào ngược', 'gan', 'sốt', 'mệt mỏi', 'sút cân', 'tiểu đường', 'huyết áp'],
    explanation: 'Các triệu chứng liên quan đến hệ tiêu hóa, nội tiết, tuần hoàn và các bệnh lý tổng quát trong cơ thể.'
  },
  {
    specialtyName: 'Thần kinh',
    keywords: ['đau đầu', 'chóng mặt', 'hoa mắt', 'mất ngủ', 'tê tay', 'tê chân', 'suy giảm trí nhớ', 'co giật', 'đau nửa đầu', 'tiền đình', 'đau cổ vai gáy'],
    explanation: 'Các triệu chứng liên quan đến hệ thần kinh trung ương, não bộ, hội chứng tiền đình và đau dây thần kinh.'
  },
  {
    specialtyName: 'Tâm lý',
    keywords: ['lo âu', 'trầm cảm', 'căng thẳng', 'stress', 'hồi hộp', 'hoảng sợ', 'bồn chồn', 'mất ngủ kéo dài', 'suy nhược tinh thần', 'u ủ', 'ám ảnh'],
    explanation: 'Các dấu hiệu liên quan đến sức khỏe tinh thần, lo âu kéo dài, rối loạn giấc ngủ và các hội chứng tâm lý.'
  },
  {
    specialtyName: 'Nhi khoa',
    keywords: ['trẻ em', 'bé', 'sốt cao', 'ho sổ mũi ở trẻ', 'lười ăn', 'biếng ăn', 'chậm lớn', 'quấy khóc', 'phát ban trẻ em', 'nôn trớ'],
    explanation: 'Các bệnh lý và sự phát triển thể chất, tinh thần chuyên biệt ở trẻ sơ sinh và trẻ nhỏ.'
  },
  {
    specialtyName: 'Da liễu',
    keywords: ['nổi mẩn', 'ngứa', 'mụn', 'dị ứng', 'vảy nến', 'mề đắp', 'mề đay', 'rụng tóc', 'viêm da', 'thâm nám', 'nấm da', 'tàn nhang'],
    explanation: 'Các biểu hiện bất thường trên da, niêm mạc, tóc và móng.'
  },
  {
    specialtyName: 'Tim mạch',
    keywords: ['đau ngực', 'khó thở', 'tăng huyết áp', 'hạ huyết áp', 'tim đập nhanh', 'hồi hộp đánh trống ngực', 'choáng váng khi đứng lên', 'sưng chân'],
    explanation: 'Dấu hiệu liên quan đến hệ tuần hoàn, cơ tim, mạch máu và huyết áp.'
  },
  {
    specialtyName: 'Tai Mũi Họng',
    keywords: ['đau họng', 'ho', 'viêm họng', 'sổ mũi', 'ngạt mũi', 'ù tai', 'đau tai', 'khàn tiếng', 'viêm xoang', 'chảy máu cam', 'nuốt đau'],
    explanation: 'Các vấn đề liên quan đến tai, đường hô hấp trên, mũi xoang và thanh quản.'
  }
];

const DISCLAIMER_TEXT = '⚠️ LƯU Ý Y KHOA QUAN TRỌNG: Kết quả gợi ý từ AI chỉ mang tính chất tham khảo dựa trên mô tả triệu chứng ban đầu của bạn và KHÔNG PHẢI LÀ CHẨN ĐOÁN Y KHOA CHÍNH THỨC. Vui lòng chọn bác sĩ chuyên khoa phù hợp để thăm khám trực tiếp hoặc liên hệ cấp cứu 115 trong trường hợp khẩn cấp.';

export const suggestSpecialty = async (req: Request, res: Response) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || symptoms.trim().length < 5) {
      return res.status(400).json({ message: 'Vui lòng nhập chi tiết triệu chứng của bạn (tối thiểu 5 ký tự)' });
    }

    const cleanedSymptoms = symptoms.toLowerCase();
    let suggestedSpecialtyNames: string[] = [];
    let reasoning = '';

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Bạn là trợ lý tư vấn y tế thông minh. Bệnh nhân mô tả triệu chứng: "${symptoms}".
Các chuyên khoa hiện có trong hệ thống phòng khám: [Nội khoa, Thần kinh, Tâm lý, Nhi khoa, Da liễu, Tim mạch, Tai Mũi Họng].
Hãy phân tích và gợi ý 1 đến 2 chuyên khoa phù hợp nhất.
Trả về định dạng JSON thuần như sau:
{
  "suggestedSpecialties": ["Tên chuyên khoa 1", "Tên chuyên khoa 2"],
  "reasoning": "Giải thích ngắn gọn 2-3 câu bằng tiếng Việt lý do tại sao triệu chứng lại phù hợp với chuyên khoa này."
}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          suggestedSpecialtyNames = parsed.suggestedSpecialties || [];
          reasoning = parsed.reasoning || '';
        }
      } catch (geminiError: any) {
        console.warn('Gemini API Error, falling back to Medical NLP Rules:', geminiError.message);
      }
    }

    if (suggestedSpecialtyNames.length === 0) {
      const matches: any[] = [];

      for (const rule of MEDICAL_RULES) {
        let matchCount = 0;
        const matchedKeywords: string[] = [];

        for (const kw of rule.keywords) {
          if (cleanedSymptoms.includes(kw)) {
            matchCount++;
            matchedKeywords.push(kw);
          }
        }

        if (matchCount > 0) {
          matches.push({
            specialtyName: rule.specialtyName,
            matchCount,
            matchedKeywords,
            explanation: rule.explanation
          });
        }
      }

      matches.sort((a, b) => b.matchCount - a.matchCount);

      if (matches.length > 0) {
        suggestedSpecialtyNames = matches.slice(0, 2).map(m => m.specialtyName);
        const topMatch = matches[0];
        reasoning = `Dựa trên mô tả triệu chứng chứa các từ khóa (${topMatch.matchedKeywords.join(', ')}), hệ thống nhận diện bạn có khả năng cần thăm khám chuyên khoa ${suggestedSpecialtyNames.join(' hoặc ')}. ${topMatch.explanation}`;
      } else {
        suggestedSpecialtyNames = ['Nội khoa'];
        reasoning = 'Triệu chứng của bạn chưa thể phân loại chính xác vào các chuyên khoa hẹp. Bạn nên đặt lịch khám Nội khoa tổng quát để được bác sĩ kiểm tra sàng lọc ban đầu.';
      }
    }

    const specialties = await prisma.specialty.findMany({
      where: {
        name: { in: suggestedSpecialtyNames }
      },
      include: {
        doctors: {
          include: {
            user: { select: { fullName: true, phone: true } },
            specialty: true
          },
          orderBy: { ratingAvg: 'desc' },
          take: 3
        }
      }
    });

    return res.json({
      symptoms,
      suggestedSpecialties: specialties,
      reasoning,
      disclaimer: DISCLAIMER_TEXT
    });
  } catch (error: any) {
    console.error('AI Suggestion Error:', error);
    return res.status(500).json({ message: 'Lỗi khi phân tích triệu chứng bằng AI', error: error.message });
  }
};
