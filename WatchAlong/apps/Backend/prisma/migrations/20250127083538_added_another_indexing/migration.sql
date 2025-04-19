-- CreateIndex
CREATE INDEX "Vote_chatId_userId_optionId_idx" ON "Vote"("chatId", "userId", "optionId");
