-- AlterTable
ALTER TABLE "public"."Faculty" ADD COLUMN "assignedYears" TEXT;

-- CreateTable
CREATE TABLE "public"."FacultyCareerPath" (
    "id" SERIAL NOT NULL,
    "facultyId" INTEGER NOT NULL,
    "careerPathId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacultyCareerPath_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FacultyCareerPath_facultyId_careerPathId_key" ON "public"."FacultyCareerPath"("facultyId", "careerPathId");

-- AddForeignKey
ALTER TABLE "public"."FacultyCareerPath" ADD CONSTRAINT "FacultyCareerPath_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "public"."Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FacultyCareerPath" ADD CONSTRAINT "FacultyCareerPath_careerPathId_fkey" FOREIGN KEY ("careerPathId") REFERENCES "public"."CareerPath"("id") ON DELETE CASCADE ON UPDATE CASCADE;
