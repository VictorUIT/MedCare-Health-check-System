import prisma from './databaseService';

// Truy vấn và tổng hợp các số liệu từ CSDL để phục vụ cho Dashboard Admin
export const getDashboardStats = async () => {
  // 1. Xử lý thời gian & Truy vấn song song các chỉ số tổng quan
  const today = new Date(`${new Date().toISOString().split('T')[0]}T00:00:00.000Z`);
  const [
    totalAppointments,
    todayAppointments,
    completedAppointments,
    cancelledAppointments,
    totalDoctors,
    totalPatients,
    totalSpecialties
  ] = await Promise.all([
    prisma.appointment.count(),
    prisma.appointment.count({ where: { date: today } }),
    prisma.appointment.count({ where: { status: 'COMPLETED' } }),
    prisma.appointment.count({ where: { status: 'CANCELLED' } }),
    prisma.doctorProfile.count(),
    prisma.user.count({ where: { role: 'PATIENT' } }),
    prisma.specialty.count()
  ]);

  // 2. Lấy danh sách Top 5 Bác sĩ nổi bật
  const topDoctors = await prisma.doctorProfile.findMany({
    take: 5,
    orderBy: { totalReviews: 'desc' },
    include: {
      user: { select: { fullName: true } },
      specialty: { select: { name: true } },
      _count: { select: { appointments: true } }
    }
  });

  // 3. Thống kê theo Chuyên khoa
  const specialtyStats = await prisma.specialty.findMany({
    select: {
      id: true,
      name: true,
      _count: { select: { doctors: true } }
    }
  });

  // 4. Đóng gói và trả về kết quả
  return {
    summary: {
      totalAppointments,
      todayAppointments,
      completedAppointments,
      cancelledAppointments,
      totalDoctors,
      totalPatients,
      totalSpecialties
    },
    topDoctors,
    specialtyStats
  };
};
