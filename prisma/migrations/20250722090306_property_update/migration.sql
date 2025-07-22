/*
  Warnings:

  - You are about to drop the column `preco_antes` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `preco_depois` on the `Property` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Property" DROP COLUMN "preco_antes",
DROP COLUMN "preco_depois";
