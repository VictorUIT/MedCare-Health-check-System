export const doctorScheduleDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type DoctorScheduleDay = typeof doctorScheduleDays[number];

export const getDoctorScheduleDay = (dayOfWeek: unknown): DoctorScheduleDay | null => {
  return typeof dayOfWeek === 'string' && doctorScheduleDays.includes(dayOfWeek as DoctorScheduleDay)
    ? dayOfWeek as DoctorScheduleDay
    : null;
};

export const getDoctorScheduleDayFromDate = (date: Date): DoctorScheduleDay => {
  return (['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const)[date.getUTCDay()];
};

export const generateTimeSlots = (startTime: string, endTime: string, durationMinutes = 30): string[] => {
  const slots: string[] = [];
  const [currentHour, currentMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const endTotal = endHour * 60 + endMinute;
  let time = currentHour * 60 + currentMinute;

  while (time + durationMinutes <= endTotal) {
    const startHour = String(Math.floor(time / 60)).padStart(2, '0');
    const startMinute = String(time % 60).padStart(2, '0');
    const nextTime = time + durationMinutes;
    const nextHour = String(Math.floor(nextTime / 60)).padStart(2, '0');
    const nextMinute = String(nextTime % 60).padStart(2, '0');
    slots.push(`${startHour}:${startMinute} - ${nextHour}:${nextMinute}`);
    time = nextTime;
  }

  return slots;
};
