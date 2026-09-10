# 🏥 MedCare Health-check System

Hệ thống quản lý và đặt lịch khám bệnh thông minh (MedCare Health-check System) được xây dựng theo kiến trúc Client-Server, hỗ trợ bệnh nhân đặt lịch khám, bác sĩ quản lý lịch hẹn và hệ thống tích hợp các tính năng AI hỗ trợ tư vấn.

---

## 🚀 Công nghệ sử dụng (Tech Stack)

### **Backend (Server)**
- **Runtime Environment:** Node.js
- **Framework:** Express.js (TypeScript)
- **Database & ORM:** PostgreSQL / SQLite (Development) & Prisma ORM
- **Validation:** Yup
- **Authentication:** JWT (JSON Web Token), bcrypt
- **Architecture:** Layered Architecture (Routes - Controllers - Services - Middlewares - Schemas - Barrel Pattern)

### **Frontend (Client)**
- **Framework/Library:** React (TypeScript)
- **Build Tool:** Vite / Create React App
- **Styling:** Tailwind CSS / CSS Modules
- **State Management:** React Context API
- **HTTP Client:** Axios / Fetch API

---

## 📁 Cấu trúc dự án (Project Structure)

```text
MedCare-Health-check-System/
├── client/                   # Frontend React Application
│   ├── src/
│   │   ├── components/       # Reusable UI Components
│   │   ├── context/          # React Context Providers
│   │   ├── pages/            # Page Views / Routes
│   │   ├── services/         # API Integration Services
│   │   ├── types/            # TypeScript Interfaces & Types
│   │   ├── App.tsx           # Main App Component
│   │   ├── main.tsx          # Entry point
│   │   └── index.css         # Global Styles
│   └── package.json
│
├── server/                   # Backend Express Application
│   ├── prisma/               # Prisma Schema & Migrations / Seeds
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── middlewares/      # Express Middlewares (Auth, Validation, Error)
│   │   ├── routes/           # API Endpoint Routes
│   │   ├── schemas/          # Yup Validation Schemas
│   │   ├── services/         # Business Logic Layer
│   │   └── utils/            # Helper utilities
│   ├── ERD.svg               # Database ERD Diagram
│   └── package.json
│
├── docker-compose.yml        # Docker Orchestration Config
└── README.md
