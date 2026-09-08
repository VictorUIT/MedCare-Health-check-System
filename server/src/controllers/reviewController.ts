import { Response } from 'express';
import prisma from '../services/reviewService';
import { AuthRequest } from '../middlewares/auth';

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.user?.id;
    const { appointmentId, rating, comment } = req.body;

    if (!appointmentId || !rating) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mã lịch hẹn và số sao đánh giá (1-5)' });
    }

    const numericRating = parseInt(rating);
    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Số sao đánh giá phải từ 1 đến 5' });
    }

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

    const existingReview = await prisma.review.findUnique({
      where: { appointmentId }
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Bạn đã gửi đánh giá cho lịch hẹn này rồi' });
    }

    const review = await prisma.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: {
          appointmentId,
          patientId: patientId!,
          doctorId: appointment.doctorId,
          rating: numericRating,
          comment
        }
      });

      const allDoctorReviews = await tx.review.findMany({
        where: { doctorId: appointment.doctorId }
      });

      const totalReviews = allDoctorReviews.length;
      const ratingSum = allDoctorReviews.reduce((sum, r) => sum + r.rating, 0);
      const ratingAvg = Math.round((ratingSum / totalReviews) * 10) / 10;

      await tx.doctorProfile.update({
        where: { id: appointment.doctorId },
        data: {
          ratingAvg,
          totalReviews
        }
      });

      return newReview;
    });

    return res.status(201).json({ message: 'Cảm ơn bạn đã gửi đánh giá cho bác sĩ!', review });
  } catch (error: any) {
    console.error('Create Review Error:', error);
    return res.status(500).json({ message: 'Lỗi khi gửi đánh giá bác sĩ', error: error.message });
  }
};
