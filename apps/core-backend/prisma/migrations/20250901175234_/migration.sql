/*
  Warnings:

  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[ownerUserId]` on the table `Workspace` will be added. If there are existing duplicate values, this will fail.

*/
-- DropTable
DROP TABLE "public"."Order";

-- DropEnum
DROP TYPE "public"."OrderStatus";

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_ownerUserId_key" ON "public"."Workspace"("ownerUserId");
