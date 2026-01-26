/*
  Warnings:

  - You are about to drop the column `upsell_product_id` on the `product_upsells` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "product_upsells" DROP COLUMN "upsell_product_id",
ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "offers" JSONB[],
ALTER COLUMN "mode" SET DEFAULT 'Metafield';
