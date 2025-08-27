-- AlterTable
ALTER TABLE "public"."Admin" ALTER COLUMN "isUsable" DROP NOT NULL,
ALTER COLUMN "isUsable" SET DEFAULT true;
