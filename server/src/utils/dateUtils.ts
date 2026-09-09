// Xử lý và chuẩn hóa thời gian theo dạng Date-Only
export const parseDateOnly = (date: string): Date | null => {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

// Chuyển ngược từ một đối tượng Date sang chuỗi văn bản định dạng YYYY-MM-DD
export const getDateOnlyString = (date: Date): string => date.toISOString().slice(0, 10);
