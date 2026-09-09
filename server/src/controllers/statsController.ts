import { Request, Response } from 'express';
import { getDashboardStats as getDashboardStatsData } from '../services/statsService';

// Cung cấp dữ liệu Báo cáo Thống kê Tổng quan dành cho trang Quản trị viên
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Ủy quyền xử lý cho Service
    const { summary, topDoctors, specialtyStats } = await getDashboardStatsData();

    // Trả về Response
    return res.json({
      summary,
      topDoctors,
      specialtyStats
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Lỗi khi lấy thống kê hệ thống', error: error.message });
  }
};
