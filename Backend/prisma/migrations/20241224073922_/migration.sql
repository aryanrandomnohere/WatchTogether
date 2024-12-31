/*
  Warnings:

  - You are about to drop the column `multipletVotes` on the `Chat` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Vote_userId_chatId_key";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "multipletVotes",
ADD COLUMN     "multipleVotes" BOOLEAN NOT NULL DEFAULT false;
