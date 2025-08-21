/*
  Warnings:

  - The values [archived] on the enum `FlagVersionStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `dataJson` on the `FlagVersion` table. All the data in the column will be lost.
  - You are about to drop the column `envKey` on the `FlagVersion` table. All the data in the column will be lost.
  - You are about to drop the column `workspaceId` on the `FlagVersion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[flagId,version]` on the table `FlagVersion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."EnvKey" AS ENUM ('dev', 'stage', 'prod');

-- AlterEnum
ALTER TYPE "public"."FlagType" ADD VALUE 'json';

-- AlterEnum
BEGIN;
CREATE TYPE "public"."FlagVersionStatus_new" AS ENUM ('draft', 'active', 'superseded', 'rolled_back');
ALTER TABLE "public"."FlagVersion" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."FlagVersion" ALTER COLUMN "status" TYPE "public"."FlagVersionStatus_new" USING ("status"::text::"public"."FlagVersionStatus_new");
ALTER TYPE "public"."FlagVersionStatus" RENAME TO "FlagVersionStatus_old";
ALTER TYPE "public"."FlagVersionStatus_new" RENAME TO "FlagVersionStatus";
DROP TYPE "public"."FlagVersionStatus_old";
ALTER TABLE "public"."FlagVersion" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."FlagVersion" DROP CONSTRAINT "FlagVersion_workspaceId_fkey";

-- DropIndex
DROP INDEX "public"."FlagVersion_flagId_envKey_idx";

-- DropIndex
DROP INDEX "public"."FlagVersion_flagId_envKey_version_key";

-- DropIndex
DROP INDEX "public"."FlagVersion_workspaceId_idx";

-- AlterTable
ALTER TABLE "public"."Flag" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "public"."FlagVersion" DROP COLUMN "dataJson",
DROP COLUMN "envKey",
DROP COLUMN "workspaceId",
ADD COLUMN     "comment" TEXT;

-- CreateTable
CREATE TABLE "public"."FlagMeta" (
    "flagId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tags" TEXT[],

    CONSTRAINT "FlagMeta_pkey" PRIMARY KEY ("flagId")
);

-- CreateTable
CREATE TABLE "public"."FlagEnvConfig" (
    "id" TEXT NOT NULL,
    "flagVersionId" TEXT NOT NULL,
    "envKey" "public"."EnvKey" NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "variantKey" TEXT,
    "jsonValue" JSONB,
    "rollout" INTEGER,
    "rules" JSONB,

    CONSTRAINT "FlagEnvConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FlagEnvConfig_envKey_idx" ON "public"."FlagEnvConfig"("envKey");

-- CreateIndex
CREATE UNIQUE INDEX "FlagEnvConfig_flagVersionId_envKey_key" ON "public"."FlagEnvConfig"("flagVersionId", "envKey");

-- CreateIndex
CREATE INDEX "FlagVersion_flagId_idx" ON "public"."FlagVersion"("flagId");

-- CreateIndex
CREATE UNIQUE INDEX "FlagVersion_flagId_version_key" ON "public"."FlagVersion"("flagId", "version");

-- AddForeignKey
ALTER TABLE "public"."FlagMeta" ADD CONSTRAINT "FlagMeta_flagId_fkey" FOREIGN KEY ("flagId") REFERENCES "public"."Flag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FlagEnvConfig" ADD CONSTRAINT "FlagEnvConfig_flagVersionId_fkey" FOREIGN KEY ("flagVersionId") REFERENCES "public"."FlagVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
