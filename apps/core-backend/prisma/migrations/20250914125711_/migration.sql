/*
  Warnings:

  - Added the required column `key` to the `Flag` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Flag" ADD COLUMN     "key" TEXT NOT NULL;
