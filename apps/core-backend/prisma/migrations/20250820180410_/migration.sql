/*
  Warnings:

  - The primary key for the `WorkspaceMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[workspaceId,userId]` on the table `WorkspaceMember` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `WorkspaceMember` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "public"."WorkspaceMember_userId_idx";

-- AlterTable
ALTER TABLE "public"."WorkspaceMember" DROP CONSTRAINT "WorkspaceMember_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "WorkspaceMember_workspaceId_createdAt_id_idx" ON "public"."WorkspaceMember"("workspaceId", "createdAt", "id");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMember_workspaceId_userId_key" ON "public"."WorkspaceMember"("workspaceId", "userId");
