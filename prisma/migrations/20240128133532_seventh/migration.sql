/*
  Warnings:

  - You are about to drop the `Wishlist` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Wishlist" DROP CONSTRAINT "Wishlist_airdropId_fkey";

-- DropForeignKey
ALTER TABLE "Wishlist" DROP CONSTRAINT "Wishlist_ownerId_fkey";

-- DropTable
DROP TABLE "Wishlist";

-- CreateTable
CREATE TABLE "Wishlists" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "airdropId" INTEGER NOT NULL,

    CONSTRAINT "Wishlists_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Wishlists" ADD CONSTRAINT "Wishlists_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlists" ADD CONSTRAINT "Wishlists_airdropId_fkey" FOREIGN KEY ("airdropId") REFERENCES "AirDrops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
