import { Request, Response } from 'express';
import prisma from '../services/scheduleService';
import { AuthRequest } from '../middlewares/auth';
import { generateTimeSlots, getDoctorScheduleDay, getDoctorScheduleDayFromDate } from '../utils';

export const setDoctorSchedules = async (req: AuthRequest, res: Response) => {
  try {
    const doctorProfile = req.user?.doctorProfile;
    if (!doctorProfile && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Chỉ bác sĩ hoặc admin mới có thể thiết lập lịch làm việc' });
    }

    const doctorId = doctorProfile ? doctorProfile.id : req.body.doctorId;
    const { schedules } = req.body;

    if (!Array.isArray(schedules)) {
      return res.status(400).json({ message: 'Danh sách lịch làm việc không hợp lệ' });
    }

    const normalizedSchedules = schedules.map((schedule: any) => ({
      ...schedule,
      dayOfWeek: getDoctorScheduleDay(schedule.dayOfWeek)
    }));

    if (normalizedSchedules.some((schedule) => !schedule.dayOfWeek)) {
      return res.status(400).json({
        message: 'dayOfWeek phải là một trong: mon, tue, wed, thu, fri, sat, sun'
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.doctorSchedule.deleteMany({ where: { doctorId } });
      await tx.doctorSchedule.createMany({
        data: normalizedSchedules.map((s: any) => ({
          doctorId,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime || '08:00',
          endTime: s.endTime || '17:00',
          slotDurationMinutes: parseInt(s.slotDurationMinutes || 30),
          isAvailable: s.isAvailable !== undefined ? Boolean(s.isAvailable) : true
        }))
      });
    });

    const updatedSchedules = await prisma.doctorSchedule.findMany({
      where: { doctorId },
      orderBy: { id: 'asc' }
    });

    return res.json({ message: 'Cập nhật lịch làm việc tuần thành công', schedules: updatedSchedules });
  } catch (error: any) {
    return res.status(500).json({ message: 'Lỗi khi cài đặt lịch làm việc', error: error.message });
  }
};

export const addScheduleBlock = async (req: AuthRequest, res: Response) => {
  try {
    const doctorProfile = req.user?.doctorProfile;
    const doctorId = doctorProfile ? doctorProfile.id : req.body.doctorId;
    const { date, startTime, endTime, reason } = req.body;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Vui lòng điền ngày và khoảng giờ chặn' });
    }

    const block = await prisma.scheduleBlock.create({
      data: {
        doctorId,
        date,
        startTime,
        endTime,
        reason: reason || 'Bận đột xuất / Nghỉ phép'
      }
    });

    return res.status(201).json({ message: 'Tạo khung giờ chặn thành công', block });
  } catch (error: any) {
    return res.status(500).json({ message: 'Lỗi khi chặn khung giờ', error: error.message });
  }
};

export const deleteScheduleBlock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.scheduleBlock.delete({ where: { id } });
    return res.json({ message: 'Gỡ chặn khung giờ thành công' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Lỗi khi xóa khung giờ chặn', error: error.message });
  }
};

export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query as { date?: string };

    if (!date) {
      return res.status(400).json({ message: 'Vui lòng truyền ngày khám (date=YYYY-MM-DD)' });
    }

    const selectedDate = new Date(`${date}T00:00:00.000Z`);
    const appointmentDate = new Date(`${date}T00:00:00.000Z`);
    const dayOfWeek = getDoctorScheduleDayFromDate(selectedDate);

    const schedule = await prisma.doctorSchedule.findFirst({
      where: {
        doctorId,
        dayOfWeek,
        isAvailable: true
      }
    });

    if (!schedule) {
      return res.json({ date, dayOfWeek, isAvailableDay: false, slots: [] });
    }

    let slots = generateTimeSlots(schedule.startTime, schedule.endTime, schedule.slotDurationMinutes);

    const blocks = await prisma.scheduleBlock.findMany({
      where: { doctorId, date }
    });

    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: appointmentDate,
        status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED'] }
      },
      select: { startTime: true, endTime: true }
    });

    const bookedSlotsSet = new Set(bookedAppointments.map(a => `${a.startTime} - ${a.endTime}`));

    const availableSlots = slots.map(slot => {
      const [slotStart, slotEnd] = slot.split(' - ');
      const isBooked = bookedSlotsSet.has(slot);

      const isBlocked = blocks.some(b => {
        return (slotStart >= b.startTime && slotStart < b.endTime) ||
               (slotEnd > b.startTime && slotEnd <= b.endTime);
      });

      return {
        timeSlot: slot,
        isAvailable: !isBooked && !isBlocked,
        reasonNotAvailable: isBooked ? 'Đã có người đặt' : (isBlocked ? 'Bác sĩ bận' : null)
      };
    });

    return res.json({
      date,
      dayOfWeek,
      isAvailableDay: true,
      workingHours: `${schedule.startTime} - ${schedule.endTime}`,
      slots: availableSlots
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Lỗi khi tính toán khung giờ trống', error: error.message });
  }
};
