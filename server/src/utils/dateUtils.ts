export const parseDateOnly = (date: string): Date | null => {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const getDateOnlyString = (date: Date): string => date.toISOString().slice(0, 10);
