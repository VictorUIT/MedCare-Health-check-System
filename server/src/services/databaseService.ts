import prisma from '../prisma';
import { PrismaClient } from '@prisma/client';

// Khởi tạo dịch vụ cơ sở dữ liệu
const databaseService: PrismaClient = prisma;

export default databaseService;
