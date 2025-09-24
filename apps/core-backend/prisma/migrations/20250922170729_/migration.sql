/*
  Warnings:

  - Added the required column `status` to the `FlagRuleSet` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."RuleStatus" AS ENUM ('active', 'disabled');

-- AlterTable
ALTER TABLE "public"."FlagRuleSet" ADD COLUMN     "status" "public"."RuleStatus" NOT NULL;
