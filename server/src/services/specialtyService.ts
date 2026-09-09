import prisma from './databaseService';

// Lấy danh sách tất cả Chuyên khoa
export const listSpecialties = () => prisma.specialty.findMany({
  include: { _count: { select: { doctors: true } } },
  orderBy: { name: 'asc' }
});

// Xem chi tiết 1 Chuyên khoa kèm danh sách Bác sĩ
export const getSpecialty = (id: string) => prisma.specialty.findUnique({
  where: { id },
  include: {
    doctors: {
      include: { user: { select: { id: true, fullName: true, email: true, phone: true } } }
    }
  }
});

// Tìm chuyên khoa theo tên
export const findSpecialtyByName = (name: string) => prisma.specialty.findUnique({ where: { name } });

// Tạo Chuyên khoa mới
export const createSpecialtyRecord = (data: any) => prisma.specialty.create({ data });

// Cập nhật Chuyên khoa
export const updateSpecialtyRecord = (id: string, data: any) => prisma.specialty.update({ where: { id }, data });

// Xóa Chuyên khoa (Có kiểm tra ràng buộc)
export const deleteSpecialtyRecord = async (id: string) => {
  const doctorCount = await prisma.doctorProfile.count({ where: { specialtyId: id } });
  if (doctorCount > 0) throw new Error('SPECIALTY_HAS_DOCTORS');
  return prisma.specialty.delete({ where: { id } });
};
