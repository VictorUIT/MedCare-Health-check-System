DO $$
BEGIN
  CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Appointment"
  ADD COLUMN "date_new" DATE,
  ADD COLUMN "startTime_new" TEXT,
  ADD COLUMN "endTime_new" TEXT,
  ADD COLUMN "status_new" "AppointmentStatus";

UPDATE "Appointment"
SET
  "date_new" = "date"::DATE,
  "startTime_new" = split_part("timeSlot", ' - ', 1),
  "endTime_new" = split_part("timeSlot", ' - ', 2),
  "status_new" = "status"::"AppointmentStatus";

ALTER TABLE "Appointment"
  DROP COLUMN "date",
  DROP COLUMN "timeSlot",
  DROP COLUMN "status";

ALTER TABLE "Appointment"
  RENAME COLUMN "date_new" TO "date";

ALTER TABLE "Appointment"
  RENAME COLUMN "startTime_new" TO "startTime";

ALTER TABLE "Appointment"
  RENAME COLUMN "endTime_new" TO "endTime";

ALTER TABLE "Appointment"
  RENAME COLUMN "status_new" TO "status";

ALTER TABLE "Appointment"
  ALTER COLUMN "date" SET NOT NULL,
  ALTER COLUMN "startTime" SET NOT NULL,
  ALTER COLUMN "endTime" SET NOT NULL,
  ALTER COLUMN "status" SET NOT NULL,
  ALTER COLUMN "status" SET DEFAULT 'PENDING';

CREATE INDEX IF NOT EXISTS "Appointment_doctorId_date_idx"
  ON "Appointment" ("doctorId", "date");
