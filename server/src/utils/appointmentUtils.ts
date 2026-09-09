// Sinh Appointment Code ngẫu nhiên và duy nhất
export const generateAppointmentCode = (): string => {
  // Trích xuất Chuỗi Ngày Tháng
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  // Sinh Hậu tố Ngẫu nhiên
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  // Ghép Chuỗi & Trả về Kết quả
  return `MED-${dateStr}-${randomSuffix}`;
};
