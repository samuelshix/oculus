/*
  Warnings:

  - You are about to alter the column `date` on the `Price` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `DateTime`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Price" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "coinName" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    CONSTRAINT "Price_coinName_fkey" FOREIGN KEY ("coinName") REFERENCES "Coin" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Price" ("coinName", "date", "id", "price") SELECT "coinName", "date", "id", "price" FROM "Price";
DROP TABLE "Price";
ALTER TABLE "new_Price" RENAME TO "Price";
CREATE UNIQUE INDEX "Price_coinName_date_key" ON "Price"("coinName", "date");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
