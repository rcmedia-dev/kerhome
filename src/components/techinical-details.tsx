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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {details.map((item, idx) => (
        <div key={idx} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow min-w-0 text-gray-900">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <item.icon size={20} className="md:w-6 md:h-6" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-sm text-gray-500 font-medium truncate uppercase tracking-wider">{item.label}</p>
            <p className="text-sm md:text-lg font-bold truncate">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
