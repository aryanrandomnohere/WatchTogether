/*
  Warnings:

  - You are about to drop the column `to` on the `FriendRequests` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[from,toId]` on the table `FriendRequests` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `toId` to the `FriendRequests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FriendRequests" DROP COLUMN "to",
ADD COLUMN     "toId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "FriendRequests_from_toId_key" ON "FriendRequests"("from", "toId");
