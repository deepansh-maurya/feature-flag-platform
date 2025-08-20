/*
  Warnings:

  - You are about to drop the column `workspaceId` on the `WebhookEvent` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."WebhookEvent" DROP CONSTRAINT "WebhookEvent_workspaceId_fkey";

-- AlterTable
ALTER TABLE "public"."Subscription" ADD COLUMN     "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cancelsAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."WebhookEvent" DROP COLUMN "workspaceId";
