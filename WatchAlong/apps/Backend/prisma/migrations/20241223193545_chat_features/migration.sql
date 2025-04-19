-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "edited" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "multipletVotes" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "replyToId" INTEGER;

-- CreateIndex
CREATE INDEX "Chat_replyToId_idx" ON "Chat"("replyToId");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
