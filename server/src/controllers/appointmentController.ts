import { Request, Response } from 'express';
import prisma from '../services/appointmentService';
import { AuthRequest } from '../middlewares/auth';
import { generateAppointmentCode, getDateOnlyString, parseDateOnly } from '../utils';

// 1. Hàm kiểm soát chuyển đổi trạng thái (State Transition)
export const isValidAppointmentStatusTransition = (currentStatus: string, nextStatus: string): boolean => {
  const validTransitions: Record<string, string[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: []
  };

  // Kiểm tra xem trạng thái hiện tại có tồn tại trong danh sách chuyển đổi hợp lệ không
  return validTransitions[currentStatus]?.includes(nextStatus) ?? false;
};

// 2. createAppointment — Đặt lịch khám mới (Bệnh nhân)
export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    // Đọc patientId từ token người dùng (req.user.id)
    const patientId = req.user?.id;
    const { doctorId, date, startTime, endTime, timeSlot, patientNotes } = req.body;
    const [legacyStartTime, legacyEndTime] = typeof timeSlot === 'string' ? timeSlot.split(' - ') : [];
    const appointmentStartTime = startTime || legacyStartTime;
    const appointmentEndTime = endTime || legacyEndTime;
    const appointmentDate = typeof date === 'string' ? parseDateOnly(date) : null;

    // Kiểm tra dữ liệu đầu vào
    if (!doctorId || !appointmentDate || !appointmentStartTime || !appointmentEndTime) {
      return res.status(400).json({ message: 'Vui lòng chọn đầy đủ Bác sĩ, Ngày khám và Khung giờ' });
    }

    // Kiểm tra xem bác sĩ có tồn tại hay không
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      include: { specialty: true }
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Bác sĩ không tồn tại' });
    }

    // Kiểm tra xem khung giờ đã được đặt trước hay chưa
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

    // Tạo mã đặt lịch duy nhất
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

// 3. getPatientAppointments — Xem danh sách lịch hẹn của Bệnh nhân
export const getPatientAppointments = async (req: AuthRequest, res: Response) => {
  try {
    // Đọc patientId từ token người dùng (req.user.id)
    const patientId = req.user?.id;
    // Nhận query param ?type=upcoming hoặc ?type=past
    const { type } = req.query as { type?: string };
    
    const today = parseDateOnly(new Date().toISOString().split('T')[0]) as Date;

    const where: any = { patientId };

    if (type === 'upcoming') {
      where.date = { gte: today };
      where.status = { in: ['PENDING', 'CONFIRMED'] };
    } else if (type === 'past') {
      where.status = { in: ['COMPLETED', 'CANCELLED'] };
    }

    // Lấy danh sách lịch hẹn với thông tin chi tiết về Bác sĩ và Review
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
      // Sắp xếp theo Ngày khám giảm dần, và Khung giờ bắt đầu tăng dần
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

// 4. getDoctorAppointments — Xem lịch làm việc của Bác sĩ
export const getDoctorAppointments = async (req: AuthRequest, res: Response) => {
  try {
    // Kiểm tra xem người dùng có phải là bác sĩ hay không
    const doctorProfile = req.user?.doctorProfile;
    if (!doctorProfile) {
      return res.status(403).json({ message: 'Tài khoản không phải là bác sĩ' });
    }

    // Cho phép lọc lịch hẹn theo Ngày khám (date) và Trạng thái (status)
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

    // Lấy danh sách lịch hẹn với thông tin chi tiết về Bệnh nhân và Review
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

    // Nếu không có lịch hẹn nào, trả về mảng rỗng
    return res.json(appointments);
  } catch (error: any) {
    return res.status(500).json({ message: 'Lỗi khi lấy lịch làm việc của bác sĩ', error: error.message });
  }
};


// 5. getAdminAppointments — Quản lý toàn bộ lịch hẹn (Admin Dashboard)
export const getAdminAppointments = async (req: Request, res: Response) => {
  try {
    const { doctorId, status, date, search } = req.query as {
      doctorId?: string;
      status?: string;
      date?: string;
      search?: string;
    };

    const where: any = {};

    // Cho phép Admin lọc linh hoạt theo doctorId, status, date
    if (doctorId) where.doctorId = doctorId;
    if (status) where.status = status;
    if (date) {
      const appointmentDate = parseDateOnly(date);
      if (!appointmentDate) {
        return res.status(400).json({ message: 'Ngày khám không hợp lệ' });
      }
      where.date = appointmentDate;
    }

    // Cho phép Admin tìm kiếm theo appointmentCode, patient fullName hoặc patient phone
    if (search) {
      where.OR = [
        { appointmentCode: { contains: search } },
        { patient: { fullName: { contains: search } } },
        { patient: { phone: { contains: search } } }
      ];
    }

    // Lấy danh sách lịch hẹn với thông tin chi tiết về Bệnh nhân, Bác sĩ và Review
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

// 6. updateAppointmentStatus — Cập nhật trạng thái / Ghi chú của Bác sĩ
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

    // Phân quyền: Nếu là Bác sĩ, chỉ được phép sửa lịch hẹn do chính mình đảm nhận
    if (req.user?.role === 'DOCTOR' && appointment.doctorId !== req.user.doctorProfile?.id) {
      return res.status(403).json({ message: 'Bạn không thể thay đổi trạng thái lịch hẹn của bác sĩ khác' });
    }

    // Kiểm tra tính hợp lệ của việc chuyển đổi trạng thái
    if (!isValidAppointmentStatusTransition(appointment.status, status)) {
      return res.status(400).json({
        message: `Không thể chuyển trạng thái từ ${appointment.status} sang ${status}.`
      });
    }

    // Cập nhật trạng thái và ghi chú của bác sĩ nếu có
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


// 7. cancelAppointment — Hủy lịch hẹn
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

    // Nếu người hủy là Bệnh nhân (PATIENT)
    if (req.user?.role === 'PATIENT') {
      if (appointment.patientId !== req.user.id) {
        // Kiểm tra không được hủy lịch của người khác (403)
        return res.status(403).json({ message: 'Bạn không thể hủy lịch hẹn của bệnh nhân khác' });
      }

      //Không được hủy lịch đã CANCELLED hoặc COMPLETED (400)
      if (appointment.status === 'CANCELLED') {
        return res.status(400).json({ message: 'Lịch hẹn này đã bị hủy trước đó' });
      }

      if (appointment.status === 'COMPLETED') {
        return res.status(400).json({ message: 'Không thể hủy lịch hẹn đã hoàn tất khám' });
      }

      // Kiểm tra thời gian hủy lịch: không được hủy trước giờ khám tối thiểu 2 tiếng (400)
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
