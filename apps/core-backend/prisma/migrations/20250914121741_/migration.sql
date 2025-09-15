/*
  Warnings:

  - You are about to drop the column `key` on the `Flag` table. All the data in the column will be lost.
  - You are about to drop the `FlagMeta` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Flag` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[projectId,name]` on the table `Flag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Flag` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."FlagMeta" DROP CONSTRAINT "FlagMeta_flagId_fkey";

-- DropIndex
DROP INDEX "public"."Flag_projectId_key_key";

-- AlterTable
ALTER TABLE "public"."Flag" DROP COLUMN "key",
ADD COLUMN     "name" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."FlagMeta";

-- CreateIndex
CREATE UNIQUE INDEX "Flag_name_key" ON "public"."Flag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Flag_projectId_name_key" ON "public"."Flag"("projectId", "name");
