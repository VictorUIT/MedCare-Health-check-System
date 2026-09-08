import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../services/doctorService';

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const { specialtyId, search, minRating, maxFee } = req.query as {
      specialtyId?: string;
      search?: string;
      minRating?: string;
      maxFee?: string;
    };

    const where: any = {};

    if (specialtyId) {
      where.specialtyId = specialtyId;
    }

    if (minRating) {
      where.ratingAvg = { gte: parseFloat(minRating) };
    }

    if (maxFee) {
      where.consultationFee = { lte: parseFloat(maxFee) };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { bio: { contains: search } },
        { user: { fullName: { contains: search } } }
      ];
    }

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

export const getDoctorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, phone: true, gender: true }
        },
        specialty: true,
        schedules: true,
        blocks: true,
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

export const createDoctor = async (req: Request, res: Response) => {
  try {
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

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email này đã tồn tại trên hệ thống' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

export const updateDoctor = async (req: Request, res: Response) => {
  try {
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

    const doctor = await prisma.doctorProfile.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin bác sĩ' });
    }

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

export const deleteDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctorProfile.findUnique({ where: { id } });
    if (!doctor) {
      return res.status(404).json({ message: 'Không tìm thấy bác sĩ' });
    }

    await prisma.user.delete({ where: { id: doctor.userId } });

    return res.json({ message: 'Xóa tài khoản bác sĩ thành công' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Lỗi khi xóa bác sĩ', error: error.message });
  }
};
