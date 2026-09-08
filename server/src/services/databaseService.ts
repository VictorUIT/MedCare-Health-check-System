import prisma from '../prisma';
import { PrismaClient } from '@prisma/client';

const databaseService: PrismaClient = prisma;

export default databaseService;
