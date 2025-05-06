/*
  Warnings:

  - A unique constraint covering the columns `[userId,Mid,listType]` on the table `UserMovieList` will be added. If there are existing duplicate values, this will fail.
  - Made the column `Mid` on table `UserMovieList` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "UserMovieList_userId_movieId_listType_key";

-- AlterTable
ALTER TABLE "UserMovieList" ALTER COLUMN "Mid" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserMovieList_userId_Mid_listType_key" ON "UserMovieList"("userId", "Mid", "listType");
