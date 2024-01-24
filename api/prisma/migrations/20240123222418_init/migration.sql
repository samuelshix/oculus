-- CreateTable
CREATE TABLE "Coin" (
    "id" SERIAL NOT NULL,
    "coinIdentifier" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mintAddress" TEXT NOT NULL,

    CONSTRAINT "Coin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Price" (
    "id" SERIAL NOT NULL,
    "coinName" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Coin_coinIdentifier_key" ON "Coin"("coinIdentifier");

-- CreateIndex
CREATE UNIQUE INDEX "Coin_name_key" ON "Coin"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Coin_mintAddress_key" ON "Coin"("mintAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Price_coinName_date_key" ON "Price"("coinName", "date");

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_coinName_fkey" FOREIGN KEY ("coinName") REFERENCES "Coin"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
