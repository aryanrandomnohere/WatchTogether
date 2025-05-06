/*
  Warnings:

  - The primary key for the `Movie` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `imdbID` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `poster` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Movie` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `Movie` will be added. If there are existing duplicate values, this will fail.
  - The required column `Mid` was added to the `Movie` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `adult` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `backdrop_path` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_air_date` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `original_language` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `original_name` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `overview` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `popularity` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `poster_path` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vote_average` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vote_count` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `Movie` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "UserMovieList" DROP CONSTRAINT "UserMovieList_movieId_fkey";

-- DropIndex
DROP INDEX "Movie_imdbID_key";

-- AlterTable
ALTER TABLE "Movie" DROP CONSTRAINT "Movie_pkey",
DROP COLUMN "imdbID",
DROP COLUMN "poster",
DROP COLUMN "type",
DROP COLUMN "year",
ADD COLUMN     "Mid" TEXT NOT NULL,
ADD COLUMN     "adult" BOOLEAN NOT NULL,
ADD COLUMN     "backdrop_path" TEXT NOT NULL,
ADD COLUMN     "first_air_date" TEXT NOT NULL,
ADD COLUMN     "media_type" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "original_language" TEXT NOT NULL,
ADD COLUMN     "original_name" TEXT NOT NULL,
ADD COLUMN     "overview" TEXT NOT NULL,
ADD COLUMN     "popularity" INTEGER NOT NULL,
ADD COLUMN     "poster_path" TEXT NOT NULL,
ADD COLUMN     "vote_average" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "vote_count" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ALTER COLUMN "title" DROP NOT NULL,
ADD CONSTRAINT "Movie_pkey" PRIMARY KEY ("Mid");

-- CreateTable
CREATE TABLE "GenreIds" (
    "id" SERIAL NOT NULL,
    "movieId" TEXT NOT NULL,
    "genre_id" INTEGER NOT NULL,

    CONSTRAINT "GenreIds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OriginCountry" (
    "id" SERIAL NOT NULL,
    "movieId" TEXT NOT NULL,
    "country" TEXT NOT NULL,

    CONSTRAINT "OriginCountry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Movie_id_key" ON "Movie"("id");

-- AddForeignKey
ALTER TABLE "UserMovieList" ADD CONSTRAINT "UserMovieList_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("Mid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenreIds" ADD CONSTRAINT "GenreIds_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("Mid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OriginCountry" ADD CONSTRAINT "OriginCountry_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("Mid") ON DELETE RESTRICT ON UPDATE CASCADE;
