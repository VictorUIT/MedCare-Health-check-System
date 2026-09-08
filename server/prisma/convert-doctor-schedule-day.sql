DO $$
BEGIN
  CREATE TYPE "DoctorScheduleDay" AS ENUM ('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "DoctorSchedule"
  ADD COLUMN "dayOfWeek_new" "DoctorScheduleDay";

UPDATE "DoctorSchedule"
SET "dayOfWeek_new" = CASE "dayOfWeek"
  WHEN 0 THEN 'sun'::"DoctorScheduleDay"
  WHEN 1 THEN 'mon'::"DoctorScheduleDay"
  WHEN 2 THEN 'tue'::"DoctorScheduleDay"
  WHEN 3 THEN 'wed'::"DoctorScheduleDay"
  WHEN 4 THEN 'thu'::"DoctorScheduleDay"
  WHEN 5 THEN 'fri'::"DoctorScheduleDay"
  WHEN 6 THEN 'sat'::"DoctorScheduleDay"
END;

ALTER TABLE "DoctorSchedule"
  DROP COLUMN "dayOfWeek";

ALTER TABLE "DoctorSchedule"
  RENAME COLUMN "dayOfWeek_new" TO "dayOfWeek";

ALTER TABLE "DoctorSchedule"
  ALTER COLUMN "dayOfWeek" SET NOT NULL;
