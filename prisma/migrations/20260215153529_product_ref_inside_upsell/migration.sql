/*
  Warnings:

  - A unique constraint covering the columns `[product_id]` on the table `product_upsells` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_id_key" ON "products"("id");

-- CreateIndex
CREATE UNIQUE INDEX "product_upsells_product_id_key" ON "product_upsells"("product_id");

-- AddForeignKey
ALTER TABLE "product_upsells" ADD CONSTRAINT "product_upsells_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
