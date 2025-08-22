/*
  Warnings:

  - The values [rule,list] on the enum `SegmentType` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `SegmentMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `SegmentMember` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[workspaceId,projectId,key]` on the table `Segment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdBy` to the `Segment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Segment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetKey` to the `SegmentMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetType` to the `SegmentMember` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."TargetType" AS ENUM ('user', 'account', 'service');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."SegmentType_new" AS ENUM ('dynamic', 'static');
ALTER TABLE "public"."Segment" ALTER COLUMN "type" TYPE "public"."SegmentType_new" USING ("type"::text::"public"."SegmentType_new");
ALTER TYPE "public"."SegmentType" RENAME TO "SegmentType_old";
ALTER TYPE "public"."SegmentType_new" RENAME TO "SegmentType";
DROP TYPE "public"."SegmentType_old";
COMMIT;

-- DropIndex
DROP INDEX "public"."Segment_projectId_idx";

-- DropIndex
DROP INDEX "public"."Segment_projectId_key_key";

-- DropIndex
DROP INDEX "public"."Segment_workspaceId_idx";

-- DropIndex
DROP INDEX "public"."SegmentMember_userId_idx";

-- DropIndex
DROP INDEX "public"."SegmentMember_workspaceId_idx";

-- AlterTable
ALTER TABLE "public"."Segment" ADD COLUMN     "compiledBlob" BYTEA,
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "definitionHash" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "updatedBy" TEXT,
ALTER COLUMN "projectId" DROP NOT NULL,
ALTER COLUMN "rulesJson" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."SegmentMember" DROP CONSTRAINT "SegmentMember_pkey",
DROP COLUMN "userId",
ADD COLUMN     "addedBy" TEXT,
ADD COLUMN     "targetKey" TEXT NOT NULL,
ADD COLUMN     "targetType" "public"."TargetType" NOT NULL,
ADD CONSTRAINT "SegmentMember_pkey" PRIMARY KEY ("segmentId", "targetType", "targetKey");

-- CreateTable
CREATE TABLE "public"."FlagRuleSet" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "flagId" TEXT NOT NULL,
    "envKey" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "rules" JSONB NOT NULL,
    "defaultVar" TEXT NOT NULL,
    "killswitch" BOOLEAN NOT NULL DEFAULT false,
    "prerequisites" JSONB,
    "salt" TEXT NOT NULL,
    "configHash" TEXT,
    "createdBy" TEXT NOT NULL,
    "publishedBy" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlagRuleSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FlagOverride" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "flagId" TEXT NOT NULL,
    "envKey" TEXT NOT NULL,
    "targetType" "public"."TargetType" NOT NULL,
    "targetKey" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "variationKey" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlagOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FlagRuleSet_workspaceId_projectId_flagId_envKey_status_idx" ON "public"."FlagRuleSet"("workspaceId", "projectId", "flagId", "envKey", "status");

-- CreateIndex
CREATE UNIQUE INDEX "FlagRuleSet_flagId_envKey_version_key" ON "public"."FlagRuleSet"("flagId", "envKey", "version");

-- CreateIndex
CREATE INDEX "FlagOverride_workspaceId_flagId_envKey_targetType_targetKey_idx" ON "public"."FlagOverride"("workspaceId", "flagId", "envKey", "targetType", "targetKey");

-- CreateIndex
CREATE INDEX "Segment_workspaceId_name_idx" ON "public"."Segment"("workspaceId", "name");

-- CreateIndex
CREATE INDEX "Segment_workspaceId_isArchived_idx" ON "public"."Segment"("workspaceId", "isArchived");

-- CreateIndex
CREATE UNIQUE INDEX "Segment_workspaceId_projectId_key_key" ON "public"."Segment"("workspaceId", "projectId", "key");

-- CreateIndex
CREATE INDEX "SegmentMember_workspaceId_targetType_targetKey_idx" ON "public"."SegmentMember"("workspaceId", "targetType", "targetKey");

-- CreateIndex
CREATE INDEX "SegmentMember_segmentId_idx" ON "public"."SegmentMember"("segmentId");
