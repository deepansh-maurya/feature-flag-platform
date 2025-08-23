/*
  Warnings:

  - You are about to drop the column `ip` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `ua` on the `AuditLog` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."AuditLog_actionType_createdAt_idx";

-- DropIndex
DROP INDEX "public"."AuditLog_projectId_createdAt_idx";

-- DropIndex
DROP INDEX "public"."AuditLog_workspaceId_createdAt_idx";

-- AlterTable
ALTER TABLE "public"."AuditLog" DROP COLUMN "ip",
DROP COLUMN "ua",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "entityKey" TEXT,
ADD COLUMN     "metadata" JSONB;

-- CreateIndex
CREATE INDEX "AuditLog_workspaceId_createdAt_idx" ON "public"."AuditLog"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_workspaceId_projectId_envKey_createdAt_idx" ON "public"."AuditLog"("workspaceId", "projectId", "envKey", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_workspaceId_entityType_entityId_createdAt_idx" ON "public"."AuditLog"("workspaceId", "entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_workspaceId_actionType_createdAt_idx" ON "public"."AuditLog"("workspaceId", "actionType", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_workspaceId_actorUserId_createdAt_idx" ON "public"."AuditLog"("workspaceId", "actorUserId", "createdAt");
