/*
  Warnings:

  - You are about to drop the column `categoryId` on the `GameCategory` table. All the data in the column will be lost.
  - You are about to drop the column `genreId` on the `GameGenre` table. All the data in the column will be lost.
  - You are about to drop the column `movieId` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `mp4480` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `mp4Max` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `webm480` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `webmMax` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `releaseDateId` on the `ProcessedGame` table. All the data in the column will be lost.
  - You are about to drop the column `supportInfoId` on the `ProcessedGame` table. All the data in the column will be lost.
  - You are about to drop the column `screenshotId` on the `Screenshot` table. All the data in the column will be lost.
  - You are about to drop the `SystemRequirements` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[gameId,id]` on the table `GameCategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gameId,id]` on the table `GameGenre` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gameId,id]` on the table `Movie` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gameId,id]` on the table `Screenshot` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mp4` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `webm` to the `Movie` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProcessedGame" DROP CONSTRAINT "ProcessedGame_releaseDateId_fkey";

-- DropForeignKey
ALTER TABLE "ProcessedGame" DROP CONSTRAINT "ProcessedGame_supportInfoId_fkey";

-- DropForeignKey
ALTER TABLE "SystemRequirements" DROP CONSTRAINT "SystemRequirements_gameId_fkey";

-- DropIndex
DROP INDEX "GameCategory_gameId_categoryId_key";

-- DropIndex
DROP INDEX "GameGenre_gameId_genreId_key";

-- DropIndex
DROP INDEX "Movie_gameId_movieId_key";

-- DropIndex
DROP INDEX "ProcessedGame_releaseDateId_key";

-- DropIndex
DROP INDEX "ProcessedGame_supportInfoId_key";

-- DropIndex
DROP INDEX "Screenshot_gameId_screenshotId_key";

-- AlterTable
ALTER TABLE "GameCategory" DROP COLUMN "categoryId";

-- AlterTable
ALTER TABLE "GameGenre" DROP COLUMN "genreId";

-- AlterTable
ALTER TABLE "Movie" DROP COLUMN "movieId",
DROP COLUMN "mp4480",
DROP COLUMN "mp4Max",
DROP COLUMN "webm480",
DROP COLUMN "webmMax",
ADD COLUMN     "mp4" JSONB NOT NULL,
ADD COLUMN     "webm" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "ProcessedGame" DROP COLUMN "releaseDateId",
DROP COLUMN "supportInfoId",
ADD COLUMN     "additionalData" JSONB,
ADD COLUMN     "packages" INTEGER[];

-- AlterTable
ALTER TABLE "Screenshot" DROP COLUMN "screenshotId";

-- DropTable
DROP TABLE "SystemRequirements";

-- CreateTable
CREATE TABLE "PcRequirements" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "minimum" TEXT NOT NULL,
    "recommended" TEXT,

    CONSTRAINT "PcRequirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MacRequirements" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "minimum" TEXT NOT NULL,
    "recommended" TEXT,

    CONSTRAINT "MacRequirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinuxRequirements" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "minimum" TEXT NOT NULL,
    "recommended" TEXT,

    CONSTRAINT "LinuxRequirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageGroup" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "selectionText" TEXT NOT NULL,
    "saveText" TEXT,
    "displayType" INTEGER NOT NULL,
    "isRecurringSubscription" TEXT NOT NULL,

    CONSTRAINT "PackageGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sub" (
    "id" SERIAL NOT NULL,
    "packageGroupId" INTEGER NOT NULL,
    "packageid" INTEGER NOT NULL,
    "percentSavingsText" TEXT,
    "percentSavings" INTEGER NOT NULL,
    "optionText" TEXT NOT NULL,
    "optionDescription" TEXT,
    "canGetFreeLicense" TEXT NOT NULL,
    "isFreeLicense" BOOLEAN NOT NULL,
    "priceInCentsWithDiscount" INTEGER NOT NULL,

    CONSTRAINT "Sub_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PcRequirements_gameId_key" ON "PcRequirements"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "MacRequirements_gameId_key" ON "MacRequirements"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "LinuxRequirements_gameId_key" ON "LinuxRequirements"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "GameCategory_gameId_id_key" ON "GameCategory"("gameId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "GameGenre_gameId_id_key" ON "GameGenre"("gameId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_gameId_id_key" ON "Movie"("gameId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Screenshot_gameId_id_key" ON "Screenshot"("gameId", "id");

-- AddForeignKey
ALTER TABLE "PcRequirements" ADD CONSTRAINT "PcRequirements_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MacRequirements" ADD CONSTRAINT "MacRequirements_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinuxRequirements" ADD CONSTRAINT "LinuxRequirements_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseDate" ADD CONSTRAINT "ReleaseDate_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportInfo" ADD CONSTRAINT "SupportInfo_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageGroup" ADD CONSTRAINT "PackageGroup_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ProcessedGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sub" ADD CONSTRAINT "Sub_packageGroupId_fkey" FOREIGN KEY ("packageGroupId") REFERENCES "PackageGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
