import { Request, Response } from 'express';
import { getDashboardStats as getDashboardStatsData } from '../services/statsService';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const { summary, topDoctors, specialtyStats } = await getDashboardStatsData();

    return res.json({
      summary,
      topDoctors,
      specialtyStats
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Lỗi khi lấy thống kê hệ thống', error: error.message });
  }
};
