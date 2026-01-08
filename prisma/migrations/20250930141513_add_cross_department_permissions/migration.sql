-- AlterTable
ALTER TABLE "public"."Faculty" ADD COLUMN     "allowedDepartments" TEXT,
ADD COLUMN     "canAssignCrossDepartment" BOOLEAN NOT NULL DEFAULT false;
