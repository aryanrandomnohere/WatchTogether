/*
  Warnings:

  - A unique constraint covering the columns `[userId,movieId,listType]` on the table `UserMovieList` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UserMovieList_userId_Mid_listType_key";

-- CreateIndex
CREATE UNIQUE INDEX "UserMovieList_userId_movieId_listType_key" ON "UserMovieList"("userId", "movieId", "listType");
