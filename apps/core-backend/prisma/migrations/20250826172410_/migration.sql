/*
  Warnings:

  - The primary key for the `Plan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `featuresJson` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `limitsJson` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `priceMonthly` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `priceYearly` on the `Plan` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `Plan` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `Plan` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `name` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `key` on the `Plan` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."PlanStatus" AS ENUM ('draft', 'active', 'archived');

-- AlterTable
ALTER TABLE "public"."Plan" DROP CONSTRAINT "Plan_pkey",
DROP COLUMN "featuresJson",
DROP COLUMN "limitsJson",
DROP COLUMN "priceMonthly",
DROP COLUMN "priceYearly",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" "public"."PlanStatus" NOT NULL DEFAULT 'draft',
ADD COLUMN     "trialDays" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "key",
ADD COLUMN     "key" TEXT NOT NULL,
ADD CONSTRAINT "Plan_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "public"."Price" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "recurringInterval" "public"."BillingCycle" NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "unitAmountCents" INTEGER NOT NULL,
    "stripeProductId" TEXT,
    "stripePriceId" TEXT,
    "isMetered" BOOLEAN NOT NULL DEFAULT false,
    "meterKey" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlanFeature" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,

    CONSTRAINT "PlanFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlanLimit" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "soft" INTEGER,
    "hard" INTEGER,

    CONSTRAINT "PlanLimit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanFeature_planId_key_key" ON "public"."PlanFeature"("planId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "PlanLimit_planId_resource_key" ON "public"."PlanLimit"("planId", "resource");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_key_key" ON "public"."Plan"("key");

-- AddForeignKey
ALTER TABLE "public"."Price" ADD CONSTRAINT "Price_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanFeature" ADD CONSTRAINT "PlanFeature_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanLimit" ADD CONSTRAINT "PlanLimit_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
