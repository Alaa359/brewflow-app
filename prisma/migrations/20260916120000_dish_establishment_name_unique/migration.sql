-- AlterTable
-- A unique constraint covering the columns [establishmentId, name] will be added.
CREATE UNIQUE INDEX "Dish_establishmentId_name_key" ON "Dish"("establishmentId", "name");