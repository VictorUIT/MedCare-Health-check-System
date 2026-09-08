import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting MedCare TypeScript Database Seeding...');

  await prisma.review.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.scheduleBlock.deleteMany();
  await prisma.doctorSchedule.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.specialty.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('admin123', 10);
  const patientPassword = await bcrypt.hash('patient123', 10);
  const doctorPassword = await bcrypt.hash('doctor123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@medcare.com',
      password: hashedPassword,
      fullName: 'Quản trị viên Hệ thống MedCare',
      phone: '0901234567',
      role: 'ADMIN'
    }
  });
  console.log('✅ Admin created:', admin.email);

  const specialtiesData = [
    {
      name: 'Nội khoa',
      description: 'Khám, sàng lọc và điều trị các bệnh lý nội khoa tổng quát, đường tiêu hóa, gan mật và nội tiết.',
      icon: 'Stethoscope',
      image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=500'
    },
    {
      name: 'Thần kinh',
      description: 'Chẩn đoán và điều trị hội chứng đau đầu, mất ngủ, chóng mặt, tiền đình, thần kinh ngoại biên.',
      icon: 'Brain',
      image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=500'
    },
    {
      name: 'Tâm lý',
      description: 'Tư vấn và điều trị rối loạn lo âu, stress, trầm cảm, khủng hoảng tinh thần và chăm sóc sức khỏe tâm trí.',
      icon: 'Smile',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500'
    },
    {
      name: 'Nhi khoa',
      description: 'Chăm sóc sức khỏe toàn diện cho trẻ sơ sinh, trẻ nhỏ và thiếu niên, theo dõi tăng trưởng và dinh dưỡng.',
      icon: 'Baby',
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500'
    },
    {
      name: 'Da liễu',
      description: 'Điều trị mụn trứng cá, dị ứng da, vảy nến, viêm da cơ địa, chăm sóc và trẻ hóa làn da.',
      icon: 'Sparkles',
      image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=500'
    },
    {
      name: 'Tim mạch',
      description: 'Khám tầm soát tăng huyết áp, bệnh mạch vành, rối loạn nhịp tim và hội chứng mạch máu.',
      icon: 'HeartPulse',
      image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500'
    },
    {
      name: 'Tai Mũi Họng',
      description: 'Điều trị viêm xoang, viêm họng hạt, ù tai, nghẹt mũi và các bệnh lý đường hô hấp trên.',
      icon: 'Ear',
      image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=500'
    }
  ];

  const specialties: Record<string, string> = {};
  for (const s of specialtiesData) {
    const created = await prisma.specialty.create({ data: s });
    specialties[s.name] = created.id;
  }
  console.log('✅ Created 7 Specialties');

  const doctorsData = [
    {
      email: 'bs.nguyenvanan@medcare.com',
      fullName: 'BS. CKI Nguyễn Văn An',
      phone: '0912345678',
      gender: 'Nam',
      specialtyId: specialties['Thần kinh'],
      title: 'Bác sĩ Chuyên khoa I - Thần kinh',
      bio: 'Hơn 12 năm kinh nghiệm công tác tại Bệnh viện Đại học Y Dược. Chuyên điều trị đau đầu mãn tính, rối loạn tiền đình và mất ngủ.',
      experienceYears: 12,
      consultationFee: 400000,
      hospitalAddress: 'Phòng khám MedCare - Cơ sở 1 (Q.5, TP.HCM)'
    },
    {
      email: 'bs.tranthibinh@medcare.com',
      fullName: 'ThS. BS Trần Thị Bình',
      phone: '0923456789',
      gender: 'Nữ',
      specialtyId: specialties['Nhi khoa'],
      title: 'Thạc sĩ Bác sĩ Nhi khoa',
      bio: 'Bác sĩ chính tại Bệnh viện Nhi Đồng. Tâm huyết, tận tụy với các mầm non, tư vấn dinh dưỡng và theo dõi phát triển chiều cao thể chất.',
      experienceYears: 9,
      consultationFee: 350000,
      hospitalAddress: 'Phòng khám MedCare - Cơ sở 2 (Q.1, TP.HCM)'
    },
    {
      email: 'bs.lehoangcuong@medcare.com',
      fullName: 'TS. BS Lê Hoàng Cường',
      phone: '0934567890',
      gender: 'Nam',
      specialtyId: specialties['Tim mạch'],
      title: 'Tiến sĩ Bác sĩ Tim mạch',
      bio: 'Nguyên Phó khoa Tim mạch Bệnh viện Chợ Rẫy. Chuyên gia tầm soát tăng huyết áp, suy tim và xơ vữa động mạch.',
      experienceYears: 18,
      consultationFee: 500000,
      hospitalAddress: 'Phòng khám MedCare - Cơ sở 1 (Q.5, TP.HCM)'
    },
    {
      email: 'bs.phamthiduyen@medcare.com',
      fullName: 'BS. CKI Phạm Thị Duyên',
      phone: '0945678901',
      gender: 'Nữ',
      specialtyId: specialties['Da liễu'],
      title: 'Bác sĩ CKI Da liễu & Thẩm mỹ',
      bio: 'Hơn 8 năm kinh nghiệm điều trị mụn chuẩn y khoa, tàn nhang, viêm da cơ địa và phục hồi da nhạy cảm.',
      experienceYears: 8,
      consultationFee: 300000,
      hospitalAddress: 'Phòng khám MedCare - Cơ sở 3 (Q.3, TP.HCM)'
    },
    {
      email: 'bs.vuminhduc@medcare.com',
      fullName: 'ThS. BS Vũ Minh Đức',
      phone: '0956789012',
      gender: 'Nam',
      specialtyId: specialties['Tâm lý'],
      title: 'Thạc sĩ Tham vấn & Trị liệu Tâm lý',
      bio: 'Chuyên gia tư vấn giải tỏa căng thẳng stress, rối loạn lo âu, rối loạn cảm xúc và đồng hành cùng người trẻ.',
      experienceYears: 10,
      consultationFee: 450000,
      hospitalAddress: 'Phòng khám MedCare - Cơ sở 2 (Q.1, TP.HCM)'
    },
    {
      email: 'bs.hoangthanhhuong@medcare.com',
      fullName: 'BS. CKI Hoàng Thanh Hương',
      phone: '0967890123',
      gender: 'Nữ',
      specialtyId: specialties['Tai Mũi Họng'],
      title: 'Bác sĩ CKI Tai Mũi Họng',
      bio: 'Tốt nghiệp ĐH Y Dược TP.HCM. Kinh nghiệm phong phú điều trị viêm xoang dị ứng, khàn tiếng, ù tai và viêm họng cấp.',
      experienceYears: 9,
      consultationFee: 320000,
      hospitalAddress: 'Phòng khám MedCare - Cơ sở 1 (Q.5, TP.HCM)'
    }
  ];

  const doctorsList: any[] = [];

  for (const doc of doctorsData) {
    const user = await prisma.user.create({
      data: {
        email: doc.email,
        password: doctorPassword,
        fullName: doc.fullName,
        phone: doc.phone,
        gender: doc.gender,
        role: 'DOCTOR'
      }
    });

    const profile = await prisma.doctorProfile.create({
      data: {
        userId: user.id,
        specialtyId: doc.specialtyId,
        title: doc.title,
        bio: doc.bio,
        experienceYears: doc.experienceYears,
        consultationFee: doc.consultationFee,
        hospitalAddress: doc.hospitalAddress,
        ratingAvg: 4.8,
        totalReviews: 12
      }
    });

    const schedules = (['mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const).map((dayOfWeek) => ({
      doctorId: profile.id,
      dayOfWeek,
      startTime: '08:00',
      endTime: '17:00',
      slotDurationMinutes: 30,
      isAvailable: true
    }));

    await prisma.doctorSchedule.createMany({ data: schedules });
    doctorsList.push(profile);
  }
  console.log('✅ Created 6 Doctors with profiles & working schedules');

  const patient1 = await prisma.user.create({
    data: {
      email: 'patient@gmail.com',
      password: patientPassword,
      fullName: 'Nguyễn Văn Minh',
      phone: '0987654321',
      dateOfBirth: '1995-06-15',
      gender: 'Nam',
      address: '123 Nguyễn Trãi, Quận 5, TP.HCM',
      role: 'PATIENT'
    }
  });

  const patient2 = await prisma.user.create({
    data: {
      email: 'patient2@gmail.com',
      password: patientPassword,
      fullName: 'Trần Thị Thu',
      phone: '0978123456',
      dateOfBirth: '1998-11-20',
      gender: 'Nữ',
      address: '456 Lê Văn Sỹ, Quận 3, TP.HCM',
      role: 'PATIENT'
    }
  });

  console.log('✅ Created Patients: patient@gmail.com, patient2@gmail.com');

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 3);
  const pastDateStr = pastDate.toISOString().split('T')[0];

  const appt1 = await prisma.appointment.create({
    data: {
      appointmentCode: 'MED-20260814-A101',
      patientId: patient1.id,
      doctorId: doctorsList[0].id,
      specialtyId: specialties['Thần kinh'],
      date: new Date(`${pastDateStr}T00:00:00.000Z`),
      startTime: '09:00',
      endTime: '09:30',
      status: 'COMPLETED',
      patientNotes: 'Tôi thường hay đau nửa đầu bên trái kèm buồn nôn.',
      doctorNotes: 'Bệnh nhân có biểu hiện đau đầu Migraine nhẹ. Đã kê đơn thuốc giãn cơ và giảm đau nhẹ. Khuyên tập luyện nghỉ ngơi đều đặn.'
    }
  });

  await prisma.review.create({
    data: {
      appointmentId: appt1.id,
      patientId: patient1.id,
      doctorId: doctorsList[0].id,
      rating: 5,
      comment: 'Bác sĩ An giải thích rất cặn kẽ và nhiệt tình. Uống thuốc 2 ngày đã thấy đỡ hẳn đau đầu!'
    }
  });

  await prisma.appointment.create({
    data: {
      appointmentCode: 'MED-20260818-B202',
      patientId: patient1.id,
      doctorId: doctorsList[1].id,
      specialtyId: specialties['Nhi khoa'],
      date: new Date(`${tomorrowStr}T00:00:00.000Z`),
      startTime: '10:00',
      endTime: '10:30',
      status: 'CONFIRMED',
      patientNotes: 'Khám sức khỏe định kỳ cho bé 2 tuổi.'
    }
  });

  await prisma.appointment.create({
    data: {
      appointmentCode: 'MED-20260817-C303',
      patientId: patient2.id,
      doctorId: doctorsList[3].id,
      specialtyId: specialties['Da liễu'],
      date: new Date(`${todayStr}T00:00:00.000Z`),
      startTime: '14:00',
      endTime: '14:30',
      status: 'PENDING',
      patientNotes: 'Da nổi mẩn đỏ quanh vùng cổ sau khi dùng mỹ phẩm mới.'
    }
  });

  console.log('✅ Created Sample Appointments & Reviews');
  console.log('🎉 TypeScript Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
