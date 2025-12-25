-- CreateEnum
CREATE TYPE "UpsellMode" AS ENUM ('Metafield', 'SelectedCollection');

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "is_online" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "access_token" TEXT NOT NULL,
    "user_id" BIGINT,
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT,
    "account_owner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "email_verified" BOOLEAN DEFAULT false,
    "refresh_token" TEXT,
    "refresh_token_expires" TIMESTAMP(3),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_upsells" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "upsell_product_id" TEXT NOT NULL,
    "mode" "UpsellMode" NOT NULL,
    "collection_id" TEXT,

    CONSTRAINT "product_upsells_pkey" PRIMARY KEY ("id")
);
