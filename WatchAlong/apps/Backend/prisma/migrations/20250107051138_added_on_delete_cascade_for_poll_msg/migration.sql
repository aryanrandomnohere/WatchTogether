-- DropForeignKey
ALTER TABLE "pollOptions" DROP CONSTRAINT "pollOptions_chatId_fkey";

-- AddForeignKey
ALTER TABLE "pollOptions" ADD CONSTRAINT "pollOptions_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
