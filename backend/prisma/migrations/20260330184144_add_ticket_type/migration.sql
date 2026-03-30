/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'general';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "updatedAt";
