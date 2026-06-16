import { TPropertyResponseSchema } from "@/lib/types/property";
import { MapPin, School, ShoppingBag, Hospital, Bus, Landmark, Church } from "lucide-react";

const POI_CATEGORIES = [
  { icon: ShoppingBag, label: "Supermercados", query: "supermercados+próximos" },
  { icon: School, label: "Escolas", query: "escolas+próximas" },
  { icon: Hospital, label: "Hospitais", query: "hospitais+próximos" },
  { icon: Bus, label: "Transportes", query: "paragens+de+autocarro+próximas" },
  { icon: Landmark, label: "Bancos", query: "bancos+próximos" },
  { icon: Church, label: "Igrejas", query: "igrejas+próximas" },
];

export function PropertyLocation ({ property }: { property: TPropertyResponseSchema }) {
  const address = [property.endereco, property.bairro, property.cidade, property.provincia].filter(Boolean).join(", ");

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Localização</h2>
        <div className="flex items-start gap-2 text-gray-600 mb-4">
          <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-orange-500" />
          <span className="break-words">{address || property.endereco}</span>
        </div>
        <div className="w-full h-[250px] rounded-lg overflow-hidden">
          <iframe
            className="w-full h-full"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${encodeURIComponent(
              property.endereco ?? ''
            )}&output=embed&zoom=16`}
          ></iframe>
        </div>
      </div>

      {property.endereco && (
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3">Pontos de Interesse Próximos</h3>
          <div className="flex flex-wrap gap-2">
            {POI_CATEGORIES.map((cat) => (
              <a
                key={cat.label}
                href={`https://www.google.com/maps/search/${cat.query}+${encodeURIComponent(address || property.endereco)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-200 text-xs font-semibold text-gray-600 hover:text-purple-700 transition-all"
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
