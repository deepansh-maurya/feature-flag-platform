/*
  Warnings:

  - You are about to drop the column `variant` on the `FlagEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `configHash` on the `FlagRuleSet` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `FlagRuleSet` table. All the data in the column will be lost.
  - You are about to drop the column `defaultVar` on the `FlagRuleSet` table. All the data in the column will be lost.
  - You are about to drop the column `prerequisites` on the `FlagRuleSet` table. All the data in the column will be lost.
  - You are about to drop the column `publishedBy` on the `FlagRuleSet` table. All the data in the column will be lost.
  - You are about to drop the column `salt` on the `FlagRuleSet` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `FlagRuleSet` table. All the data in the column will be lost.
  - You are about to drop the `FlagOverride` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "public"."FlagRuleSet_workspaceId_projectId_flagId_envKey_status_idx";

-- AlterTable
ALTER TABLE "public"."FlagEvaluation" DROP COLUMN "variant";

-- AlterTable
ALTER TABLE "public"."FlagRuleSet" DROP COLUMN "configHash",
DROP COLUMN "createdBy",
DROP COLUMN "defaultVar",
DROP COLUMN "prerequisites",
DROP COLUMN "publishedBy",
DROP COLUMN "salt",
DROP COLUMN "status";

-- DropTable
DROP TABLE "public"."FlagOverride";

-- CreateIndex
CREATE INDEX "FlagRuleSet_workspaceId_projectId_flagId_envKey_idx" ON "public"."FlagRuleSet"("workspaceId", "projectId", "flagId", "envKey");
