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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {details.map((item, idx) => (
        <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <item.icon size={24} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
            <p className="text-lg font-bold text-gray-900">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};