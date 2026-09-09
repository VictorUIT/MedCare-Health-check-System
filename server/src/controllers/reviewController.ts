import { Response } from 'express';
import prisma from '../services/reviewService';
import { AuthRequest } from '../middlewares/auth';

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    // 1. Bóc tách dữ liệu & Validation cơ bản
    const patientId = req.user?.id;
    const { appointmentId, rating, comment } = req.body;

    // 2. Kiểm tra điều kiện nghiệp vụ (Business Rules)
    if (!appointmentId || !rating) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mã lịch hẹn và số sao đánh giá (1-5)' });
    }

    // Chuyển đổi rating sang số nguyên và kiểm tra giá trị hợp lệ
    const numericRating = parseInt(rating);
    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Số sao đánh giá phải từ 1 đến 5' });
    }

    // Kiểm tra xem lịch hẹn có tồn tại và thuộc về bệnh nhân hiện tại hay không
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    if (appointment.patientId !== patientId) {
      return res.status(403).json({ message: 'Bạn chỉ có thể đánh giá cho lịch hẹn của chính mình' });
    }

    if (appointment.status !== 'COMPLETED') {
      return res.status(400).json({ message: 'Chỉ có thể đánh giá bác sĩ sau khi lịch khám đã hoàn thành (COMPLETED)' });
    }

    // Kiểm tra xem bệnh nhân đã gửi đánh giá cho lịch hẹn này chưa`
    const existingReview = await prisma.review.findUnique({
      where: { appointmentId }
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Bạn đã gửi đánh giá cho lịch hẹn này rồi' });
    }

    // 3. Thực thi Database Transaction
    const review = await prisma.$transaction(async (tx) => {
      // Tạo đánh giá mới (Create Review)
      const newReview = await tx.review.create({
        data: {
          appointmentId,
          patientId: patientId!,
          doctorId: appointment.doctorId,
          rating: numericRating,
          comment
        }
      });

      // Lấy tất cả đánh giá của Bác sĩ
      const allDoctorReviews = await tx.review.findMany({
        where: { doctorId: appointment.doctorId }
      });

      // Tính toán lại chỉ số đánh giá trung bình và tổng số đánh giá của Bác sĩ
      const totalReviews = allDoctorReviews.length;
      const ratingSum = allDoctorReviews.reduce((sum, r) => sum + r.rating, 0);
      const ratingAvg = Math.round((ratingSum / totalReviews) * 10) / 10;

      // Cập nhật lại thông tin đánh giá của Bác sĩ
      await tx.doctorProfile.update({
        where: { id: appointment.doctorId },
        data: {
          ratingAvg,
          totalReviews
        }
      });

      return newReview;
    });

    // 4. Trả về kết quả (Response)
    return res.status(201).json({ message: 'Cảm ơn bạn đã gửi đánh giá cho bác sĩ!', review });
  } catch (error: any) {
    console.error('Create Review Error:', error);
    return res.status(500).json({ message: 'Lỗi khi gửi đánh giá bác sĩ', error: error.message });
  }
};
