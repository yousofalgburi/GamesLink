-- DropIndex
DROP INDEX "ProcessedGame_type_idx";

-- CreateIndex
CREATE INDEX "ProcessedGame_type_voteCount_idx" ON "ProcessedGame"("type", "voteCount");
