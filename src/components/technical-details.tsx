import { TPropertyResponseSchema } from "@/lib/types/property";
import { BedDouble, Bath, CarFront, Ruler, LandPlot, Square } from "lucide-react";
import { formatArea, formatCount } from "@/lib/utils/formatting";

// ===== COMPONENTE TECHNICAL DETAILS =====
export function TechnicalDetails({ property }: { property: TPropertyResponseSchema }) {

  const details = [
    { label: "Quartos", value: formatCount(property.bedrooms, "Quarto", "Quartos"), icon: BedDouble },
    { label: "Banheiros", value: formatCount(property.bathrooms, "Banheiro", "Banheiros"), icon: Bath },
    { label: "Garagens", value: formatCount(property.garagens, "Garagem", "Garagens"), icon: CarFront },
    { label: "Área Útil", value: formatArea(property.size), icon: Ruler },
    { label: "Terreno", value: formatArea(property.area_terreno), icon: LandPlot },
    { label: "Garagem Área", value: formatArea((property as any).garagemtamanho ?? (property as any).garagem_tamanho), icon: Square },
  ];

  if (details.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 md:gap-4 w-full">
      {details.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow min-w-0 text-gray-900 overflow-hidden">
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <item.icon size={16} className="md:w-6 md:h-6" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 overflow-hidden">
            <p className="text-[9px] md:text-sm text-gray-500 font-medium truncate uppercase tracking-wider">{item.label}</p>
            <p className="text-xs md:text-lg font-bold truncate leading-tight">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
