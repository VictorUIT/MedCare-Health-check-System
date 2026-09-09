import { Request, Response } from 'express';
import {
  createSpecialtyRecord,
  deleteSpecialtyRecord,
  findSpecialtyByName,
  getSpecialty,
  listSpecialties,
  updateSpecialtyRecord
} from '../services/specialtyService';

// 1. getSpecialties — Lấy danh sách tất cả Chuyên khoa
export const getSpecialties = async (req: Request, res: Response) => {
  try {
    const specialties = await listSpecialties();
    return res.json(specialties);
  } catch (error: any) {
    return res.status(500).json({ message: 'Lỗi khi lấy danh sách chuyên khoa', error: error.message });
  }
};

// 2. getSpecialtyById — Xem chi tiết 1 Chuyên khoa
export const getSpecialtyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const specialty = await getSpecialty(id);

    if (!specialty) {
      return res.status(404).json({ message: 'Không tìm thấy chuyên khoa' });
    }

    return res.json(specialty);
  } catch (error: any) {
    return res.status(500).json({ message: 'Lỗi khi lấy chi tiết chuyên khoa', error: error.message });
  }
};

// 3. createSpecialty — Tạo Chuyên khoa mới (Admin)
export const createSpecialty = async (req: Request, res: Response) => {
  try {
    const { name, description, icon, image } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Tên chuyên khoa là bắt buộc' });
    }

    const existing = await findSpecialtyByName(name);
    if (existing) {
      return res.status(400).json({ message: 'Chuyên khoa này đã tồn tại' });
    }

    const specialty = await createSpecialtyRecord({ name, description, icon, image });

    return res.status(201).json({ message: 'Tạo chuyên khoa thành công', specialty });
  } catch (error: any) {
    return res.status(500).json({ message: 'Lỗi khi tạo chuyên khoa', error: error.message });
  }
};

// 4. updateSpecialty — Cập nhật Chuyên khoa
export const updateSpecialty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, icon, image } = req.body;

    const specialty = await updateSpecialtyRecord(id, { name, description, icon, image });

    return res.json({ message: 'Cập nhật chuyên khoa thành công', specialty });
  } catch (error: any) {
    return res.status(500).json({ message: 'Lỗi khi cập nhật chuyên khoa', error: error.message });
  }
};

// 5. deleteSpecialty — Xóa Chuyên khoa
export const deleteSpecialty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await deleteSpecialtyRecord(id);
    return res.json({ message: 'Xóa chuyên khoa thành công' });
  } catch (error: any) {
    if (error.message === 'SPECIALTY_HAS_DOCTORS') {
      return res.status(400).json({ message: 'Không thể xóa chuyên khoa đang có bác sĩ hoạt động' });
    }
    return res.status(500).json({ message: 'Lỗi khi xóa chuyên khoa', error: error.message });
  }
};
