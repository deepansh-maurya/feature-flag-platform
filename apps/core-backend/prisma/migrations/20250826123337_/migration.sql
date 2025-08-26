/*
  Warnings:

  - The values [grace] on the enum `BillingStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."BillingStatus_new" AS ENUM ('active', 'past_due', 'canceled', 'frozen', 'default');
ALTER TABLE "public"."Workspace" ALTER COLUMN "billingStatus" DROP DEFAULT;
ALTER TABLE "public"."Workspace" ALTER COLUMN "billingStatus" TYPE "public"."BillingStatus_new" USING ("billingStatus"::text::"public"."BillingStatus_new");
ALTER TYPE "public"."BillingStatus" RENAME TO "BillingStatus_old";
ALTER TYPE "public"."BillingStatus_new" RENAME TO "BillingStatus";
DROP TYPE "public"."BillingStatus_old";
ALTER TABLE "public"."Workspace" ALTER COLUMN "billingStatus" SET DEFAULT 'active';
COMMIT;

-- AlterEnum
ALTER TYPE "public"."PlanKey" ADD VALUE 'DEFAULT';
