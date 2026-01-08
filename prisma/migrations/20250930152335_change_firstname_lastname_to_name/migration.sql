-- AlterTable Faculty: Replace firstName and lastName with name
ALTER TABLE "public"."Faculty" DROP COLUMN "firstName";
ALTER TABLE "public"."Faculty" DROP COLUMN "lastName";
ALTER TABLE "public"."Faculty" ADD COLUMN "name" TEXT NOT NULL DEFAULT '';

-- AlterTable Student: Replace firstName and lastName with name
ALTER TABLE "public"."Student" DROP COLUMN "firstName";
ALTER TABLE "public"."Student" DROP COLUMN "lastName";
ALTER TABLE "public"."Student" ADD COLUMN "name" TEXT NOT NULL DEFAULT '';

-- Remove default after adding column
ALTER TABLE "public"."Faculty" ALTER COLUMN "name" DROP DEFAULT;
ALTER TABLE "public"."Student" ALTER COLUMN "name" DROP DEFAULT;



