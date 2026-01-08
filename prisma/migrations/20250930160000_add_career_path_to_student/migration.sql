-- DropForeignKey
ALTER TABLE "public"."StudentCareerPath" DROP CONSTRAINT "StudentCareerPath_studentId_fkey";

-- AlterTable
ALTER TABLE "public"."StudentCareerPath" ADD CONSTRAINT "StudentCareerPath_studentId_careerPathId_key" UNIQUE ("studentId", "careerPathId");

-- AddForeignKey
ALTER TABLE "public"."StudentCareerPath" ADD CONSTRAINT "StudentCareerPath_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey (already exists, but adding cascade)
ALTER TABLE "public"."StudentCareerPath" DROP CONSTRAINT IF EXISTS "StudentCareerPath_careerPathId_fkey";
ALTER TABLE "public"."StudentCareerPath" ADD CONSTRAINT "StudentCareerPath_careerPathId_fkey" FOREIGN KEY ("careerPathId") REFERENCES "public"."CareerPath"("id") ON DELETE CASCADE ON UPDATE CASCADE;
