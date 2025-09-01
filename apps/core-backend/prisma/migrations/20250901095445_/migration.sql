/*
  Warnings:

  - You are about to drop the column `stripeCustomerId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubId` on the `Subscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[razorpaySubId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Subscription_stripeSubId_key";

-- AlterTable
ALTER TABLE "public"."Subscription" DROP COLUMN "stripeCustomerId",
DROP COLUMN "stripeSubId",
ADD COLUMN     "razorpayCustomerId" TEXT,
ADD COLUMN     "razorpaySubId" TEXT;

-- AlterTable
ALTER TABLE "public"."Workspace" ADD COLUMN     "razorpayCustomerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_razorpaySubId_key" ON "public"."Subscription"("razorpaySubId");
