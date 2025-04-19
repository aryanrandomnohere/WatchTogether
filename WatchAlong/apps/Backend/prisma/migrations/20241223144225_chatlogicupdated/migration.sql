/*
  Warnings:

  - You are about to drop the column `name` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Chat` table. All the data in the column will be lost.
  - Added the required column `roomId` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_userId_fkey";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "name",
DROP COLUMN "userId",
ADD COLUMN     "roomId" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "pollOptions" (
    "id" SERIAL NOT NULL,
    "option" TEXT NOT NULL,
    "chatId" INTEGER NOT NULL,

    CONSTRAINT "pollOptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "optionId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vote_userId_chatId_key" ON "Vote"("userId", "chatId");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pollOptions" ADD CONSTRAINT "pollOptions_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "pollOptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
