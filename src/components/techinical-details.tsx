import { TPropertyResponseSchema } from "@/lib/types/property";
import { BedDouble, Bath, CarFront, Ruler, LandPlot, Square } from "lucide-react";

// ===== COMPONENTE TECHNICAL DETAILS =====
export function TechnicalDetails({ property }: { property: TPropertyResponseSchema }) {

  const details = [
    { label: "Quartos", value: property.bedrooms, icon: BedDouble },
    { label: "Banheiros", value: property.bathrooms, icon: Bath },
    { label: "Garagens", value: property.garagens, icon: CarFront },
    { label: "Área Útil", value: property.size ? `${property.size} m²` : null, icon: Ruler },
    { label: "Terreno", value: property.area_terreno ? `${property.area_terreno} m²` : null, icon: LandPlot },
    { label: "Garagem Área", value: property.garagemtamanho ? `${property.garagemtamanho} m²` : null, icon: Square },
  ].filter(item => item.value !== null && item.value !== undefined);

  if (details.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-4">
      {details.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2 md:gap-3 p-2 md:p-4 rounded-xl md:rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow min-w-0 text-gray-900 w-fit">
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <item.icon size={16} className="md:w-6 md:h-6" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 pr-2">
            <p className="text-[10px] md:text-sm text-gray-500 font-medium truncate uppercase tracking-wider">{item.label}</p>
            <p className="text-xs md:text-lg font-bold truncate">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
