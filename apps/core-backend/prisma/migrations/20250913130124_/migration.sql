/*
  Warnings:

  - You are about to drop the column `slug` on the `Project` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[workspaceId,name]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `timeZone` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Project_workspaceId_slug_key";

-- AlterTable
ALTER TABLE "public"."Project" DROP COLUMN "slug",
ADD COLUMN     "timeZone" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Project_workspaceId_name_key" ON "public"."Project"("workspaceId", "name");
