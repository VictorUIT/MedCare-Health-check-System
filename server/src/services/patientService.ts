import prisma from './databaseService';

export const getPatientProfile = async (userId: string) => prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    fullName: true,
    phone: true,
    dateOfBirth: true,
    gender: true,
    address: true,
    role: true,
    createdAt: true,
    updatedAt: true
  }
});
