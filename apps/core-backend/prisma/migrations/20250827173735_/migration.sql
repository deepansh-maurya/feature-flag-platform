/*
  Warnings:

  - You are about to drop the column `token` on the `Admin` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Admin" DROP COLUMN "token",
ADD COLUMN     "deviceId" TEXT;
