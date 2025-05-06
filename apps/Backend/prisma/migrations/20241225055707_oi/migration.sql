/*
  Warnings:

  - A unique constraint covering the columns `[optionId,userId]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Vote_optionId_userId_key" ON "Vote"("optionId", "userId");
