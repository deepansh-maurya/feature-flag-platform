/*
  Warnings:

  - You are about to drop the column `type` on the `Flag` table. All the data in the column will be lost.
  - You are about to drop the `FlagVersion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."FlagEnvConfig" DROP CONSTRAINT "FlagEnvConfig_flagVersionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FlagVersion" DROP CONSTRAINT "FlagVersion_flagId_fkey";

-- AlterTable
ALTER TABLE "public"."Flag" DROP COLUMN "type";

-- DropTable
DROP TABLE "public"."FlagVersion";
