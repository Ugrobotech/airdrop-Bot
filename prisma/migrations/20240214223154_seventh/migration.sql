-- DropForeignKey
ALTER TABLE "Wishlists" DROP CONSTRAINT "Wishlists_airdropId_fkey";

-- DropForeignKey
ALTER TABLE "Wishlists" DROP CONSTRAINT "Wishlists_ownerId_fkey";

-- AddForeignKey
ALTER TABLE "Wishlists" ADD CONSTRAINT "Wishlists_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlists" ADD CONSTRAINT "Wishlists_airdropId_fkey" FOREIGN KEY ("airdropId") REFERENCES "AirDrops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
