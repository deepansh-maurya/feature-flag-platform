/*
  Warnings:

  - You are about to drop the column `tokens` on the `Oauth` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Oauth" DROP COLUMN "tokens";
