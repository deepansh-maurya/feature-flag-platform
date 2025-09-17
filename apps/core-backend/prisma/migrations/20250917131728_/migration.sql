/*
  Warnings:

  - You are about to drop the column `createdBy` on the `SdkKey` table. All the data in the column will be lost.
  - You are about to drop the column `envKey` on the `SdkKey` table. All the data in the column will be lost.
  - You are about to drop the column `keyHash` on the `SdkKey` table. All the data in the column will be lost.
  - Added the required column `envId` to the `SdkKey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revoked` to the `SdkKey` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."SdkKey_projectId_envKey_type_status_idx";

-- AlterTable
ALTER TABLE "public"."SdkKey" DROP COLUMN "createdBy",
DROP COLUMN "envKey",
DROP COLUMN "keyHash",
ADD COLUMN     "envId" TEXT NOT NULL,
ADD COLUMN     "revoked" BOOLEAN NOT NULL;

-- CreateIndex
CREATE INDEX "SdkKey_projectId_type_status_idx" ON "public"."SdkKey"("projectId", "type", "status");

-- AddForeignKey
ALTER TABLE "public"."SdkKey" ADD CONSTRAINT "SdkKey_envId_fkey" FOREIGN KEY ("envId") REFERENCES "public"."Environment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
