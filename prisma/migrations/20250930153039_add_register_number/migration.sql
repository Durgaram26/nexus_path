-- AlterTable Student: Add registerNumber column
ALTER TABLE "public"."Student" ADD COLUMN "registerNumber" TEXT;

-- Create unique index for registerNumber
CREATE UNIQUE INDEX "Student_registerNumber_key" ON "public"."Student"("registerNumber");

-- Set registerNumber as NOT NULL (after allowing it to be created as nullable)
-- First, update any existing NULL values with a temporary unique value
UPDATE "public"."Student" SET "registerNumber" = 'REG' || id::text WHERE "registerNumber" IS NULL;

-- Now make it NOT NULL
ALTER TABLE "public"."Student" ALTER COLUMN "registerNumber" SET NOT NULL;



