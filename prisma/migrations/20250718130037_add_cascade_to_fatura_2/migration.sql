-- DropForeignKey
ALTER TABLE "Mensagem" DROP CONSTRAINT "Mensagem_deId_fkey";

-- DropForeignKey
ALTER TABLE "Mensagem" DROP CONSTRAINT "Mensagem_paraId_fkey";

-- DropForeignKey
ALTER TABLE "PlanoAgente" DROP CONSTRAINT "PlanoAgente_userId_fkey";

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_ownerId_fkey";

-- AddForeignKey
ALTER TABLE "PlanoAgente" ADD CONSTRAINT "PlanoAgente_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_deId_fkey" FOREIGN KEY ("deId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_paraId_fkey" FOREIGN KEY ("paraId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
