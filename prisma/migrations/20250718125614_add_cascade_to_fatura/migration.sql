-- DropForeignKey
ALTER TABLE "Fatura" DROP CONSTRAINT "Fatura_userId_fkey";

-- AddForeignKey
ALTER TABLE "Fatura" ADD CONSTRAINT "Fatura_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
