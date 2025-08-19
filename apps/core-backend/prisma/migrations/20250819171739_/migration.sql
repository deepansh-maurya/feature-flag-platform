/*
  Warnings:

  - The values [free,pro,business] on the enum `PlanKey` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `RateLimit` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `workspaceId` to the `AllowlistEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `ChangeRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `ConfigSnapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `Environment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `EvalEventRaw` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `EvalRollupDaily` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `EvalRollupHourly` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `Flag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `FlagVersion` table without a default value. This is not possible if the table is not empty.
  - Made the column `workspaceId` on table `OutboxEvent` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `workspaceId` to the `RateLimit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `SdkKey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `Segment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `SegmentMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `WebhookDelivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripeCustomerId` to the `Workspace` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."PlanKey_new" AS ENUM ('STARTER', 'GROWTH', 'ENTERPRISE');
ALTER TABLE "public"."Plan" ALTER COLUMN "key" TYPE "public"."PlanKey_new" USING ("key"::text::"public"."PlanKey_new");
ALTER TABLE "public"."Subscription" ALTER COLUMN "planKey" TYPE "public"."PlanKey_new" USING ("planKey"::text::"public"."PlanKey_new");
ALTER TYPE "public"."PlanKey" RENAME TO "PlanKey_old";
ALTER TYPE "public"."PlanKey_new" RENAME TO "PlanKey";
DROP TYPE "public"."PlanKey_old";
COMMIT;

-- DropIndex
DROP INDEX "public"."AllowlistEntry_projectId_envKey_kind_idx";

-- DropIndex
DROP INDEX "public"."ChangeRequest_envKey_idx";

-- DropIndex
DROP INDEX "public"."ConfigSnapshot_projectId_envKey_idx";

-- DropIndex
DROP INDEX "public"."EvalEventRaw_projectId_ts_idx";

-- DropIndex
DROP INDEX "public"."EvalEventRaw_ts_idx";

-- DropIndex
DROP INDEX "public"."EvalRollupDaily_projectId_envKey_flagKey_date_idx";

-- DropIndex
DROP INDEX "public"."EvalRollupHourly_projectId_envKey_flagKey_dateHour_idx";

-- DropIndex
DROP INDEX "public"."Invoice_workspaceId_periodStart_periodEnd_idx";

-- DropIndex
DROP INDEX "public"."NotificationSetting_webhookEnabled_idx";

-- DropIndex
DROP INDEX "public"."RateLimit_windowStart_idx";

-- DropIndex
DROP INDEX "public"."SdkKey_projectId_idx";

-- DropIndex
DROP INDEX "public"."Subscription_workspaceId_periodStart_periodEnd_idx";

-- DropIndex
DROP INDEX "public"."UsageCountersMonthly_workspaceId_month_idx";

-- DropIndex
DROP INDEX "public"."WebhookDelivery_createdAt_idx";

-- DropIndex
DROP INDEX "public"."WebhookDelivery_endpointId_status_nextRetryAt_idx";

-- DropIndex
DROP INDEX "public"."WebhookEndpoint_workspaceId_idx";

-- AlterTable
ALTER TABLE "public"."AllowlistEntry" ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."ChangeRequest" ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."ConfigSnapshot" ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Environment" ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."EvalEventRaw" ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."EvalRollupDaily" ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."EvalRollupHourly" ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Flag" ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."FlagVersion" ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."OutboxEvent" ALTER COLUMN "workspaceId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."RateLimit" DROP CONSTRAINT "RateLimit_pkey",
ADD COLUMN     "workspaceId" TEXT NOT NULL,
ADD CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key", "windowStart", "workspaceId");

-- AlterTable
ALTER TABLE "public"."RefreshToken" ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."SdkKey" ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Segment" ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."SegmentMember" ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Session" ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."WebhookDelivery" ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Workspace" ADD COLUMN     "stripeCustomerId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."WebhookEvent" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AllowlistEntry_workspaceId_idx" ON "public"."AllowlistEntry"("workspaceId");

-- CreateIndex
CREATE INDEX "ChangeRequest_workspaceId_idx" ON "public"."ChangeRequest"("workspaceId");

-- CreateIndex
CREATE INDEX "ConfigSnapshot_workspaceId_idx" ON "public"."ConfigSnapshot"("workspaceId");

-- CreateIndex
CREATE INDEX "EvalEventRaw_workspaceId_idx" ON "public"."EvalEventRaw"("workspaceId");

-- CreateIndex
CREATE INDEX "EvalRollupDaily_workspaceId_idx" ON "public"."EvalRollupDaily"("workspaceId");

-- CreateIndex
CREATE INDEX "EvalRollupHourly_workspaceId_idx" ON "public"."EvalRollupHourly"("workspaceId");

-- CreateIndex
CREATE INDEX "Flag_workspaceId_idx" ON "public"."Flag"("workspaceId");

-- CreateIndex
CREATE INDEX "FlagVersion_workspaceId_idx" ON "public"."FlagVersion"("workspaceId");

-- CreateIndex
CREATE INDEX "RateLimit_workspaceId_idx" ON "public"."RateLimit"("workspaceId");

-- CreateIndex
CREATE INDEX "RefreshToken_workspaceId_idx" ON "public"."RefreshToken"("workspaceId");

-- CreateIndex
CREATE INDEX "SdkKey_workspaceId_idx" ON "public"."SdkKey"("workspaceId");

-- CreateIndex
CREATE INDEX "Segment_workspaceId_idx" ON "public"."Segment"("workspaceId");

-- CreateIndex
CREATE INDEX "SegmentMember_workspaceId_idx" ON "public"."SegmentMember"("workspaceId");

-- CreateIndex
CREATE INDEX "Session_workspaceId_idx" ON "public"."Session"("workspaceId");

-- CreateIndex
CREATE INDEX "WebhookDelivery_workspaceId_idx" ON "public"."WebhookDelivery"("workspaceId");

-- AddForeignKey
ALTER TABLE "public"."WebhookEvent" ADD CONSTRAINT "WebhookEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Environment" ADD CONSTRAINT "Environment_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Flag" ADD CONSTRAINT "Flag_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FlagVersion" ADD CONSTRAINT "FlagVersion_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChangeRequest" ADD CONSTRAINT "ChangeRequest_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Segment" ADD CONSTRAINT "Segment_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SegmentMember" ADD CONSTRAINT "SegmentMember_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SdkKey" ADD CONSTRAINT "SdkKey_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApiToken" ADD CONSTRAINT "ApiToken_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AllowlistEntry" ADD CONSTRAINT "AllowlistEntry_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConfigSnapshot" ADD CONSTRAINT "ConfigSnapshot_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OutboxEvent" ADD CONSTRAINT "OutboxEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EvalEventRaw" ADD CONSTRAINT "EvalEventRaw_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EvalRollupHourly" ADD CONSTRAINT "EvalRollupHourly_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EvalRollupDaily" ADD CONSTRAINT "EvalRollupDaily_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UsageCountersMonthly" ADD CONSTRAINT "UsageCountersMonthly_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotificationSetting" ADD CONSTRAINT "NotificationSetting_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WebhookEndpoint" ADD CONSTRAINT "WebhookEndpoint_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RateLimit" ADD CONSTRAINT "RateLimit_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
