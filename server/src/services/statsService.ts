import prisma from './databaseService';

export const getDashboardStats = async () => {
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

  const topDoctors = await prisma.doctorProfile.findMany({
    take: 5,
    orderBy: { totalReviews: 'desc' },
    include: {
      user: { select: { fullName: true } },
      specialty: { select: { name: true } },
      _count: { select: { appointments: true } }
    }
  });

  const specialtyStats = await prisma.specialty.findMany({
    select: {
      id: true,
      name: true,
      _count: { select: { doctors: true } }
    }
  });

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
