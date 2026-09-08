import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes';
import specialtyRoutes from './routes/specialtyRoutes';
import doctorRoutes from './routes/doctorRoutes';
import scheduleRoutes from './routes/scheduleRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import reviewRoutes from './routes/reviewRoutes';
import aiRoutes from './routes/aiRoutes';
import statsRoutes from './routes/statsRoutes';
import patientRoutes from './routes/patientRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Versioned API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/specialties', specialtyRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/patients', patientRoutes);

// Health check
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'MedCare TypeScript API Server is running smoothly' });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: 'Lỗi hệ thống nội bộ', error: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 MedCare TypeScript Server listening on http://localhost:${PORT}`);
});
