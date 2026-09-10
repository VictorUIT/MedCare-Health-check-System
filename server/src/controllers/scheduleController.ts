import { Request, Response } from 'express';
import prisma from '../services/scheduleService';
import { AuthRequest } from '../middlewares/auth';
import { generateTimeSlots, getDoctorScheduleDay, getDoctorScheduleDayFromDate } from '../utils';

export const getDoctorScheduleDetails = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      include: {
        user: { select: { fullName: true } },
        schedules: { orderBy: { id: 'asc' } },
        blocks: { orderBy: [{ date: 'asc' }, { startTime: 'asc' }] }
      }
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Không tìm thấy bác sĩ' });
    }

    return res.json({
      doctor: { id: doctor.id, fullName: doctor.user.fullName },
      schedules: doctor.schedules,
      blocks: doctor.blocks
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Lỗi khi lấy lịch làm việc của bác sĩ', error: error.message });
  }
};

// 1. Cài đặt Lịch làm việc cố định theo tuần
export const setDoctorSchedules = async (req: AuthRequest, res: Response) => {
  try {
    // Kiểm tra quyền truy cập: chỉ bác sĩ hoặc admin mới có thể thiết lập lịch làm việc
    const doctorProfile = req.user?.doctorProfile;
    if (!doctorProfile && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Chỉ bác sĩ hoặc admin mới có thể thiết lập lịch làm việc' });
    }

    // Nếu là bác sĩ, lấy doctorId từ profile; nếu là admin, lấy từ body
    const doctorId = doctorProfile ? doctorProfile.id : req.body.doctorId;
    const { schedules } = req.body;

    if (!Array.isArray(schedules)) {
      return res.status(400).json({ message: 'Danh sách lịch làm việc không hợp lệ' });
    }

    // Chuẩn hóa dữ liệu dayOfWeek từ các giá trị đầu vào
    const normalizedSchedules = schedules.map((schedule: any) => ({
      ...schedule,
      // Chuyển đổi định dạng ngày qua helper
      dayOfWeek: getDoctorScheduleDay(schedule.dayOfWeek)
    }));

    if (normalizedSchedules.some((schedule) => !schedule.dayOfWeek)) {
      return res.status(400).json({
        message: 'dayOfWeek phải là một trong: mon, tue, wed, thu, fri, sat, sun'
      });
    }

    // Thực hiện Transaction để xóa lịch cũ và tạo lịch mới
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

    // Lấy lại danh sách lịch làm việc mới để trả về cho client
    const updatedSchedules = await prisma.doctorSchedule.findMany({
      where: { doctorId },
      orderBy: { id: 'asc' }
    });

    return res.json({ message: 'Cập nhật lịch làm việc tuần thành công', schedules: updatedSchedules });
  } catch (error: any) {
    return res.status(500).json({ message: 'Lỗi khi cài đặt lịch làm việc', error: error.message });
  }
};

// 2. Chặn khung giờ bận đột xuất
export const addScheduleBlock = async (req: AuthRequest, res: Response) => {
  try {
    // Kiểm tra quyền truy cập: chỉ bác sĩ hoặc admin mới có thể chặn khung giờ
    const doctorProfile = req.user?.doctorProfile;
    const doctorId = doctorProfile ? doctorProfile.id : req.body.doctorId;
    const { date, startTime, endTime, reason } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Vui lòng điền ngày và khoảng giờ chặn' });
    }

    // Kiểm tra xem khung giờ chặn có hợp lệ không
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

// 3. Mở lại khung giờ đã chặn
export const deleteScheduleBlock = async (req: Request, res: Response) => {
  try {
    // Kiểm tra quyền truy cập: chỉ bác sĩ hoặc admin mới có thể mở lại khung giờ
    const { id } = req.params;
    // Xóa khung giờ chặn theo id
    await prisma.scheduleBlock.delete({ where: { id } });
    return res.json({ message: 'Gỡ chặn khung giờ thành công' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Lỗi khi xóa khung giờ chặn', error: error.message });
  }
};

// 4. Thuật toán tính toán slot trống thực tế
export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    // Kiểm tra quyền truy cập: chỉ bác sĩ hoặc admin mới có thể xem khung giờ trống
    const { doctorId } = req.params;
    const { date } = req.query as { date?: string };

    if (!date) {
      return res.status(400).json({ message: 'Vui lòng truyền ngày khám (date=YYYY-MM-DD)' });
    }

    // Chuyển đổi ngày từ query string sang đối tượng Date
    const selectedDate = new Date(`${date}T00:00:00.000Z`);
    const appointmentDate = new Date(`${date}T00:00:00.000Z`);
    const dayOfWeek = getDoctorScheduleDayFromDate(selectedDate);

    // Lấy lịch làm việc của bác sĩ theo ngày trong tuần
    const schedule = await prisma.doctorSchedule.findFirst({
      where: {
        doctorId,
        dayOfWeek,
        isAvailable: true
      }
    });

    // Nếu bác sĩ không có lịch làm việc vào ngày này, trả về thông báo
    if (!schedule) {
      return res.json({ date, dayOfWeek, isAvailableDay: false, slots: [] });
    }

    // Tạo danh sách các khung giờ dựa trên lịch làm việc và độ dài slot
    let slots = generateTimeSlots(schedule.startTime, schedule.endTime, schedule.slotDurationMinutes);

    // Lấy danh sách các khung giờ đã được đặt (booked) và các khung giờ bị chặn (blocked)
    const blocks = await prisma.scheduleBlock.findMany({
      where: { doctorId, date }
    });

    // Lấy danh sách các lịch hẹn đã được đặt (booked) trong ngày
    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: appointmentDate,
        status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED'] }
      },
      select: { startTime: true, endTime: true }
    });

    // Tạo một Set để dễ dàng kiểm tra các khung giờ đã được đặt
    const bookedSlotsSet = new Set(bookedAppointments.map(a => `${a.startTime} - ${a.endTime}`));

    // Tính toán các khung giờ trống thực tế bằng cách loại bỏ các khung giờ đã được đặt và các khung giờ bị chặn
    const availableSlots = slots.map(slot => {
      const [slotStart, slotEnd] = slot.split(' - ');
      const isBooked = bookedSlotsSet.has(slot);

      const isBlocked = blocks.some(b => {
        return (slotStart >= b.startTime && slotStart < b.endTime) ||
               (slotEnd > b.startTime && slotEnd <= b.endTime);
      });

      // Trả về thông tin khung giờ và trạng thái khả dụng
      return {
        timeSlot: slot,
        isAvailable: !isBooked && !isBlocked,
        reasonNotAvailable: isBooked ? 'Đã có người đặt' : (isBlocked ? 'Bác sĩ bận' : null)
      };
    });

    // Trả về kết quả cho client
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
