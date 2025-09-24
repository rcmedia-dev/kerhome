import { TPropertyResponseSchema } from "@/lib/types/property";

// ===== COMPONENTE PROPERTY DESCRIPTION =====
export function PropertyDescription({ property }: { property: TPropertyResponseSchema }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Descrição</h2>
      <p className="text-gray-600 leading-relaxed">
        {property.description || 
          (property.status === "para alugar"
            ? "Imóvel disponível para arrendamento com excelente localização e infraestrutura. Possui amplos espaços, acabamentos de qualidade e está situado em uma região privilegiada com fácil acesso a comércios, serviços e transporte público."
            : "Excelente oportunidade de compra. Ideal para moradia ou investimento. Este imóvel oferece conforto, praticidade e potencial de valorização. Agende uma visita e comprove pessoalmente todas as qualidades deste empreendimento.")}
      </p>
    </div>
  );
};