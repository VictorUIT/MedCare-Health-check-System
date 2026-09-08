import prisma from './databaseService';

export const listSpecialties = () => prisma.specialty.findMany({
  include: { _count: { select: { doctors: true } } },
  orderBy: { name: 'asc' }
});

export const getSpecialty = (id: string) => prisma.specialty.findUnique({
  where: { id },
  include: {
    doctors: {
      include: { user: { select: { id: true, fullName: true, email: true, phone: true } } }
    }
  }
});

export const findSpecialtyByName = (name: string) => prisma.specialty.findUnique({ where: { name } });

export const createSpecialtyRecord = (data: any) => prisma.specialty.create({ data });

export const updateSpecialtyRecord = (id: string, data: any) => prisma.specialty.update({ where: { id }, data });

export const deleteSpecialtyRecord = async (id: string) => {
  const doctorCount = await prisma.doctorProfile.count({ where: { specialtyId: id } });
  if (doctorCount > 0) throw new Error('SPECIALTY_HAS_DOCTORS');
  return prisma.specialty.delete({ where: { id } });
};
