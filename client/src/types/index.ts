export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  doctorProfile?: DoctorProfile;
}

export interface Specialty {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  image?: string;
  doctors?: DoctorProfile[];
  _count?: {
    doctors: number;
  };
}

export interface DoctorProfile {
  id: string;
  userId: string;
  user?: User;
  specialtyId: string;
  specialty?: Specialty;
  title?: string;
  bio?: string;
  experienceYears?: number;
  consultationFee?: number;
  hospitalAddress?: string;
  ratingAvg?: number;
  totalReviews?: number;
  schedules?: DoctorSchedule[];
  blocks?: ScheduleBlock[];
  reviews?: Review[];
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isAvailable: boolean;
}

export interface ScheduleBlock {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

export interface Appointment {
  id: string;
  appointmentCode: string;
  patientId: string;
  patient?: User;
  doctorId: string;
  doctor?: DoctorProfile;
  specialtyId: string;
  specialty?: Specialty;
  date: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  patientNotes?: string;
  doctorNotes?: string;
  review?: Review;
  createdAt?: string;
}

export interface Review {
  id: string;
  appointmentId: string;
  patientId: string;
  patient?: User;
  doctorId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface AvailableSlot {
  timeSlot: string;
  isAvailable: boolean;
  reasonNotAvailable?: string | null;
}

export interface SlotsResponse {
  date: string;
  dayOfWeek: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  isAvailableDay: boolean;
  workingHours?: string;
  slots: AvailableSlot[];
}

export interface AISuggestionResponse {
  symptoms: string;
  suggestedSpecialties: Specialty[];
  reasoning: string;
  disclaimer: string;
}
