import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../services/doctorService';

// 1. getDoctors — Lấy danh sách bác sĩ (Có bộ lọc & Tìm kiếm)
export const getDoctors = async (req: Request, res: Response) => {
  try {
    // Bóc tách các tham số query từ req.query
    const { specialtyId, search, minRating, maxFee } = req.query as {
      specialtyId?: string;
      search?: string;
      minRating?: string;
      maxFee?: string;
    };

    // Tạo điều kiện lọc dựa trên các tham số query
    const where: any = {};

    // Lọc theo chuyên khoa nếu có
    if (specialtyId) {
      where.specialtyId = specialtyId;
    }

    // Lọc theo đánh giá trung bình nếu có
    if (minRating) {
      where.ratingAvg = { gte: parseFloat(minRating) };
    }

    // Lọc theo mức phí tư vấn nếu có
    if (maxFee) {
      where.consultationFee = { lte: parseFloat(maxFee) };
    }

    // Tìm kiếm theo tên, chuyên môn hoặc tiểu sử nếu có
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { bio: { contains: search } },
        { user: { fullName: { contains: search } } }
      ];
    }

    // Lấy danh sách bác sĩ từ cơ sở dữ liệu với các điều kiện lọc và sắp xếp theo đánh giá trung bình giảm dần
    const doctors = await prisma.doctorProfile.findMany({
      where,
      include: {
        user: {
          select: { id: true, fullName: true, email: true, phone: true, gender: true }
        },
        specialty: true,
        schedules: true
      },
      orderBy: { ratingAvg: 'desc' }
    });

    return res.json(doctors);
  } catch (error: any) {
    return res.status(500).json({ message: 'Lỗi khi lấy danh sách bác sĩ', error: error.message });
  }
};

// 2. getDoctorById — Xem thông tin chi tiết của 1 Bác sĩ
export const getDoctorById = async (req: Request, res: Response) => {
  try {
    // Bóc tách id từ req.params
    const { id } = req.params;

    // Tìm bác sĩ theo id và bao gồm thông tin user, specialty, schedules, blocks và reviews
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id },
      include: {
        // Tài khoản
        user: {
          select: { id: true, fullName: true, email: true, phone: true, gender: true }
        },
        // Chuyên khoa
        specialty: true,
        // Khung giờ làm việc
        schedules: true,
        // Khung giờ bận/khóa
        blocks: true,
        // Tối đa 20 đánh giá mới nhất từ bệnh nhân
        reviews: {
          include: {
            patient: {
              select: { id: true, fullName: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Không tìm thấy bác sĩ' });
    }

    return res.json(doctor);
  } catch (error: any) {
    return res.status(500).json({ message: 'Lỗi khi lấy thông tin bác sĩ', error: error.message });
  }
};

// 3. createDoctor — Tạo tài khoản & Hồ sơ Bác sĩ (Admin)
export const createDoctor = async (req: Request, res: Response) => {
  try {
    // Bóc tách dữ liệu từ req.body
    const {
      email,
      password,
      fullName,
      phone,
      gender,
      specialtyId,
      title,
      bio,
      experienceYears,
      consultationFee,
      hospitalAddress
    } = req.body;

    if (!email || !password || !fullName || !specialtyId) {
      return res.status(400).json({ message: 'Vui lòng nhập đủ thông tin bắt buộc: email, password, fullName, specialtyId' });
    }

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email này đã tồn tại trên hệ thống' });
    }

    // Hash mật khẩu trước khi lưu vào cơ sở dữ liệu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Sử dụng transaction để tạo user, doctorProfile và default schedules cùng lúc
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          fullName,
          phone,
          gender,
          role: 'DOCTOR'
        }
      });

      // Tạo hồ sơ bác sĩ
      const doctorProfile = await tx.doctorProfile.create({
        data: {
          userId: user.id,
          specialtyId,
          title: title || 'Bác sĩ',
          bio: bio || '',
          experienceYears: experienceYears ? parseInt(experienceYears) : 5,
          consultationFee: consultationFee ? parseFloat(consultationFee) : 300000,
          hospitalAddress: hospitalAddress || 'Phòng khám MedCare'
        },
        include: {
          user: { select: { id: true, fullName: true, email: true, phone: true } },
          specialty: true
        }
      });

      // Tạo lịch mặc định cho bác sĩ (Thứ 2 đến Thứ 6, từ 8:00 đến 17:00, mỗi slot 30 phút)
      const defaultSchedules = (['mon', 'tue', 'wed', 'thu', 'fri'] as const).map((dayOfWeek) => ({
        doctorId: doctorProfile.id,
        dayOfWeek,
        startTime: '08:00',
        endTime: '17:00',
        slotDurationMinutes: 30,
        isAvailable: true
      }));

      await tx.doctorSchedule.createMany({
        data: defaultSchedules
      });

      return doctorProfile;
    });

    return res.status(201).json({ message: 'Tạo tài khoản bác sĩ thành công', doctor: result });
  } catch (error: any) {
    return res.status(500).json({ message: 'Lỗi khi tạo tài khoản bác sĩ', error: error.message });
  }
};

// 4. updateDoctor — Cập nhật thông tin & Hồ sơ Bác sĩ (Admin)
export const updateDoctor = async (req: Request, res: Response) => {
  try {
    // Bóc tách dữ liệu từ req.params và req.body
    const { id } = req.params;
    const {
      fullName,
      phone,
      gender,
      specialtyId,
      title,
      bio,
      experienceYears,
      consultationFee,
      hospitalAddress
    } = req.body;

    // Kiểm tra xem bác sĩ có tồn tại không
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin bác sĩ' });
    }

    // Sử dụng transaction để cập nhật thông tin user và doctorProfile cùng lúc
    const updatedDoctor = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: doctor.userId },
        data: { fullName, phone, gender }
      });

      return await tx.doctorProfile.update({
        where: { id },
        data: {
          specialtyId,
          title,
          bio,
          experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
          consultationFee: consultationFee ? parseFloat(consultationFee) : undefined,
          hospitalAddress
        },
        include: {
          user: { select: { id: true, fullName: true, email: true, phone: true } },
          specialty: true
        }
      });
    });

    return res.json({ message: 'Cập nhật thông tin bác sĩ thành công', doctor: updatedDoctor });
  } catch (error: any) {
    return res.status(500).json({ message: 'Lỗi khi cập nhật thông tin bác sĩ', error: error.message });
  }
};

// 5. deleteDoctor — Xóa tài khoản & Hồ sơ Bác sĩ (Admin)
export const deleteDoctor = async (req: Request, res: Response) => {
  try {
    // Tìm bác sĩ theo id để lấy userId
    const { id } = req.params;

    // Kiểm tra xem bác sĩ có tồn tại không
    const doctor = await prisma.doctorProfile.findUnique({ where: { id } });
    if (!doctor) {
      return res.status(404).json({ message: 'Không tìm thấy bác sĩ' });
    }

    // Xóa hồ sơ bác sĩ
    await prisma.user.delete({ where: { id: doctor.userId } });

    return res.json({ message: 'Xóa tài khoản bác sĩ thành công' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Lỗi khi xóa bác sĩ', error: error.message });
  }
};
