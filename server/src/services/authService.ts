import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from './databaseService';

const generateToken = (user: any) => jwt.sign(
  { userId: user.id, role: user.role, email: user.email },
  process.env.JWT_SECRET || 'medcare_super_secret_jwt_key_2026',
  { expiresIn: '7d' }
);

const withoutPassword = (user: any) => {
  const { password, ...userData } = user;
  return userData;
};

const userWithDoctor = {
  doctorProfile: {
    include: { specialty: true }
  }
};

export const registerUser = async (data: any) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    throw new Error('EMAIL_ALREADY_REGISTERED');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      fullName: data.fullName,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      address: data.address,
      role: 'PATIENT'
    }
  });

  return { user: withoutPassword(user), token: generateToken(user) };
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email }, include: userWithDoctor });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('INVALID_CREDENTIALS');
  }

  return { user: withoutPassword(user), token: generateToken(user) };
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id }, include: userWithDoctor });
  return user ? withoutPassword(user) : null;
};

export const updateUserProfile = async (id: string, data: any) => {
  const user = await prisma.user.update({
    where: { id },
    data: {
      fullName: data.fullName,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      address: data.address
    },
    include: userWithDoctor
  });

  return withoutPassword(user);
};
