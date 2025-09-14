/*
  Warnings:

  - Changed the type of `langSupport` on the `Project` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Project" DROP COLUMN "langSupport",
ADD COLUMN     "langSupport" TEXT NOT NULL;

-- DropEnum
DROP TYPE "public"."SdkPlatform";
