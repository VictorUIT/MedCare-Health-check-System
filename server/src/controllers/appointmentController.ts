import { Request, Response } from 'express';
import prisma from '../services/appointmentService';
import { AuthRequest } from '../middlewares/auth';
import { generateAppointmentCode, getDateOnlyString, parseDateOnly } from '../utils';

export const isValidAppointmentStatusTransition = (currentStatus: string, nextStatus: string): boolean => {
  const validTransitions: Record<string, string[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: []
  };

  return validTransitions[currentStatus]?.includes(nextStatus) ?? false;
};

export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.user?.id;
    const { doctorId, date, startTime, endTime, timeSlot, patientNotes } = req.body;
    const [legacyStartTime, legacyEndTime] = typeof timeSlot === 'string' ? timeSlot.split(' - ') : [];
    const appointmentStartTime = startTime || legacyStartTime;
    const appointmentEndTime = endTime || legacyEndTime;
    const appointmentDate = typeof date === 'string' ? parseDateOnly(date) : null;

    if (!doctorId || !appointmentDate || !appointmentStartTime || !appointmentEndTime) {
      return res.status(400).json({ message: 'Vui lòng chọn đầy đủ Bác sĩ, Ngày khám và Khung giờ' });
    }

    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      include: { specialty: true }
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Bác sĩ không tồn tại' });
    }

    const existing = await prisma.appointment.findFirst({
      where: {
        doctorId,
        date: appointmentDate,
        startTime: appointmentStartTime,
        endTime: appointmentEndTime,
        status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED'] }
      }
    });

    if (existing) {
      return res.status(400).json({ message: 'Khung giờ này đã được đặt trước bởi bệnh nhân khác. Vui lòng chọn khung giờ khác.' });
    }

    const appointmentCode = generateAppointmentCode();
    const appointment = await prisma.appointment.create({
      data: {
        appointmentCode,
        patientId,
        doctorId,
        specialtyId: doctor.specialtyId,
        date: appointmentDate,
        startTime: appointmentStartTime,
        endTime: appointmentEndTime,
        status: 'PENDING',
        patientNotes
      },
      include: {
        doctor: {
          include: {
            user: { select: { fullName: true, phone: true } },
            specialty: true
          }
        },
        patient: { select: { fullName: true, email: true, phone: true } }
      }
    });

    return res.status(201).json({
      message: 'Đặt lịch khám thành công! Vui lòng chờ bác sĩ/phòng khám xác nhận.',
      appointment
    });
  } catch (error: any) {
    console.error('Create Appointment Error:', error);
    return res.status(500).json({ message: 'Lỗi khi đặt lịch khám', error: error.message });
  }
};

export const getPatientAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.user?.id;
    const { type } = req.query as { type?: string };

    const today = parseDateOnly(new Date().toISOString().split('T')[0]) as Date;

    const where: any = { patientId };

    if (type === 'upcoming') {
      where.date = { gte: today };
      where.status = { in: ['PENDING', 'CONFIRMED'] };
    } else if (type === 'past') {
      where.status = { in: ['COMPLETED', 'CANCELLED'] };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        doctor: {
          include: {
            user: { select: { fullName: true, phone: true } },
            specialty: true
          }
        },
        review: true
      },
      orderBy: [
        { date: 'desc' },
        { startTime: 'asc' }
      ]
    });

    return res.json(appointments);
  } catch (error: any) {
    return res.status(500).json({ message: 'Lỗi khi lấy lịch hẹn của bệnh nhân', error: error.message });
  }
};

export const getDoctorAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const doctorProfile = req.user?.doctorProfile;
    if (!doctorProfile) {
      return res.status(403).json({ message: 'Tài khoản không phải là bác sĩ' });
    }

    const { date, status } = req.query as { date?: string; status?: string };
    const where: any = { doctorId: doctorProfile.id };

    if (date) {
      const appointmentDate = parseDateOnly(date);
      if (!appointmentDate) {
        return res.status(400).json({ message: 'Ngày khám không hợp lệ' });
      }
      where.date = appointmentDate;
    }

    if (status) {
      where.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: { select: { id: true, fullName: true, phone: true, dateOfBirth: true, gender: true, email: true } },
        review: true
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    });

    return res.json(appointments);
  } catch (error: any) {
    return res.status(500).json({ message: 'Lỗi khi lấy lịch làm việc của bác sĩ', error: error.message });
  }
};

export const getAdminAppointments = async (req: Request, res: Response) => {
  try {
    const { doctorId, status, date, search } = req.query as {
      doctorId?: string;
      status?: string;
      date?: string;
      search?: string;
    };

    const where: any = {};

    if (doctorId) where.doctorId = doctorId;
    if (status) where.status = status;
    if (date) {
      const appointmentDate = parseDateOnly(date);
      if (!appointmentDate) {
        return res.status(400).json({ message: 'Ngày khám không hợp lệ' });
      }
      where.date = appointmentDate;
    }

    if (search) {
      where.OR = [
        { appointmentCode: { contains: search } },
        { patient: { fullName: { contains: search } } },
        { patient: { phone: { contains: search } } }
      ];
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: { select: { fullName: true, phone: true, email: true } },
        doctor: {
          include: {
            user: { select: { fullName: true } },
            specialty: true
          }
        },
        review: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(appointments);
  } catch (error: any) {
    return res.status(500).json({ message: 'Lỗi khi quản lý danh sách lịch hẹn', error: error.message });
  }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, doctorNotes } = req.body;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { doctor: true }
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    if (req.user?.role === 'DOCTOR' && appointment.doctorId !== req.user.doctorProfile?.id) {
      return res.status(403).json({ message: 'Bạn không thể thay đổi trạng thái lịch hẹn của bác sĩ khác' });
    }

    if (!isValidAppointmentStatusTransition(appointment.status, status)) {
      return res.status(400).json({
        message: `Không thể chuyển trạng thái từ ${appointment.status} sang ${status}.`
      });
    }

    const updateData: any = { status };
    if (doctorNotes !== undefined) {
      updateData.doctorNotes = doctorNotes;
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        patient: { select: { fullName: true, email: true, phone: true } },
        doctor: {
          include: {
            user: { select: { fullName: true } },
            specialty: true
          }
        }
      }
    });

    return res.json({ message: `Đã cập nhật trạng thái lịch hẹn thành ${status}`, appointment: updated });
  } catch (error: any) {
    return res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái lịch hẹn', error: error.message });
  }
};

export const cancelAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    if (req.user?.role === 'PATIENT') {
      if (appointment.patientId !== req.user.id) {
        return res.status(403).json({ message: 'Bạn không thể hủy lịch hẹn của bệnh nhân khác' });
      }

      if (appointment.status === 'CANCELLED') {
        return res.status(400).json({ message: 'Lịch hẹn này đã bị hủy trước đó' });
      }

      if (appointment.status === 'COMPLETED') {
        return res.status(400).json({ message: 'Không thể hủy lịch hẹn đã hoàn tất khám' });
      }

      const apptDateTime = new Date(`${getDateOnlyString(appointment.date)}T${appointment.startTime}:00Z`).getTime();
      const now = new Date().getTime();

      const diffInHours = (apptDateTime - now) / (1000 * 60 * 60);

      if (diffInHours < 2) {
        return res.status(400).json({
          message: 'Theo quy định, bạn chỉ có thể hủy lịch hẹn trước giờ khám tối thiểu 2 tiếng. Vui lòng liên hệ bộ phận Lễ tân qua hotline để được trợ giúp đổi/hủy lịch.'
        });
      }
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        patientNotes: reason ? `[Lý do hủy]: ${reason}` : appointment.patientNotes
      }
    });

    return res.json({ message: 'Hủy lịch hẹn thành công', appointment: updated });
  } catch (error: any) {
    return res.status(500).json({ message: 'Lỗi khi hủy lịch hẹn', error: error.message });
  }
};
