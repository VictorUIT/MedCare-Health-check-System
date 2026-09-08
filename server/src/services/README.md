# Service layer

Controllers own HTTP concerns only. Database access is centralized behind `databaseService` and domain service modules.

- `authService`: registration, login, profile lookup and updates
- `patientService`: patient profile queries
- `specialtyService`: specialty CRUD and deletion rules
- `statsService`: dashboard aggregates
- `appointmentService`, `doctorService`, `scheduleService`, `reviewService`, `aiService`: domain boundaries for the remaining modules

New business logic should be added to the relevant domain service instead of a controller. Controllers should read request data, call a service, and map the result or error to an HTTP response.
