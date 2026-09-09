import { PrismaClient } from '@prisma/client';

// Tạo một instance của PrismaClient để kết nối với cơ sở dữ liệu
const prisma = new PrismaClient();

export default prisma;
