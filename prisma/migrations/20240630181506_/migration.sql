/*
  Warnings:

  - You are about to drop the column `gameId` on the `Platform` table. All the data in the column will be lost.
  - Added the required column `platformId` to the `ProcessedGame` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Platform" DROP CONSTRAINT "Platform_gameId_fkey";

-- DropIndex
DROP INDEX "Platform_gameId_key";

-- AlterTable
ALTER TABLE "Platform" DROP COLUMN "gameId";

-- AlterTable
ALTER TABLE "ProcessedGame" ADD COLUMN     "platformId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ProcessedGame" ADD CONSTRAINT "ProcessedGame_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
