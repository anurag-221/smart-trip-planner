/*
  Warnings:

  - Added the required column `type` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "text" DROP NOT NULL;
