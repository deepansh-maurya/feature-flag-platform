/*
  Warnings:

  - You are about to drop the column `projectId` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "projectId",
ALTER COLUMN "razorpayOrderId" DROP NOT NULL;
