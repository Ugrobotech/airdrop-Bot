-- CreateEnum
CREATE TYPE "Category" AS ENUM ('LATEST', 'HOTTEST', 'POTENTIAL');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "chat_id" INTEGER NOT NULL,
    "subscribed" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AirDrops" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "steps" TEXT NOT NULL,
    "cost" TEXT NOT NULL,

    CONSTRAINT "AirDrops_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
