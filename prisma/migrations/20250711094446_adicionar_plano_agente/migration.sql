/*
  Warnings:

  - You are about to drop the column `pacote_agente` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "pacote_agente";

-- CreateTable
CREATE TABLE "PlanoAgente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "limite" INTEGER NOT NULL,
    "restante" INTEGER NOT NULL,
    "destaques" BOOLEAN NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PlanoAgente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanoAgente_userId_key" ON "PlanoAgente"("userId");

-- AddForeignKey
ALTER TABLE "PlanoAgente" ADD CONSTRAINT "PlanoAgente_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
