-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "allowedUsers" TEXT[],
ADD COLUMN     "queuedUsers" TEXT[];
