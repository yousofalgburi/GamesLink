-- DropIndex
DROP INDEX "ProcessedGame_type_requiredAge_idx";

-- CreateIndex
CREATE INDEX "ProcessedGame_type_idx" ON "ProcessedGame"("type");
