/*
  Warnings:

  - You are about to drop the column `playing` on the `Room` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Room" DROP COLUMN "playing",
ADD COLUMN     "playingAnimeId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "playingId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "playingTitle" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "playingType" TEXT NOT NULL DEFAULT '';
