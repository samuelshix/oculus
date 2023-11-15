/*
  Warnings:

  - Added the required column `mintAddress` to the `Coin` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Coin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "mintAddress" TEXT NOT NULL
);
INSERT INTO "new_Coin" ("id", "name") SELECT "id", "name" FROM "Coin";
DROP TABLE "Coin";
ALTER TABLE "new_Coin" RENAME TO "Coin";
CREATE UNIQUE INDEX "Coin_name_key" ON "Coin"("name");
CREATE UNIQUE INDEX "Coin_mintAddress_key" ON "Coin"("mintAddress");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
