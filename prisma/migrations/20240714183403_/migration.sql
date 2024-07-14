-- DropIndex
DROP INDEX "ProcessedGame_voteCount_idx";

-- DropIndex
DROP INDEX "ProcessedGame_type_voteCount_idx";

-- CreateIndex
CREATE INDEX "GameCategory_gameId_description_idx" ON "GameCategory"("gameId", "description");

-- CreateIndex
CREATE INDEX "GameGenre_gameId_description_idx" ON "GameGenre"("gameId", "description");

-- CreateIndex
CREATE INDEX "ProcessedGame_type_voteCount_id_idx" ON "ProcessedGame"("type", "voteCount", "id");

-- CreateIndex
CREATE INDEX "ProcessedGame_type_name_idx" ON "ProcessedGame"("type", "name");

-- CreateIndex
CREATE INDEX "ProcessedGame_type_shortDescription_idx" ON "ProcessedGame"("type", "shortDescription");

-- CreateIndex
CREATE INDEX "ProcessedGame_isFree_type_voteCount_idx" ON "ProcessedGame"("isFree", "type", "voteCount");

-- CreateIndex
CREATE INDEX "ProcessedGame_requiredAge_type_voteCount_idx" ON "ProcessedGame"("requiredAge", "type", "voteCount");

-- CreateIndex
CREATE INDEX "ProcessedGame_createdAt_type_voteCount_idx" ON "ProcessedGame"("createdAt", "type", "voteCount");

-- CreateIndex
CREATE INDEX "ProcessedGame_updatedAt_type_voteCount_idx" ON "ProcessedGame"("updatedAt", "type", "voteCount");

-- CreateIndex
CREATE INDEX "ProcessedGame_platformId_idx" ON "ProcessedGame"("platformId");
