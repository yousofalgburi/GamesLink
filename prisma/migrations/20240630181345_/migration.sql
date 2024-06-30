/*
  Warnings:

  - Made the column `additionalData` on table `ProcessedGame` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ProcessedGame" ALTER COLUMN "additionalData" SET NOT NULL;
