import { TPropertyResponseSchema } from "@/lib/types/property";
import { MapPin } from "lucide-react";

// ===== COMPONENTE PROPERTY LOCATION =====
export function PropertyLocation({ property }: { property: TPropertyResponseSchema }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Localização</h2>
      <div className="flex items-start gap-2 text-gray-600 mb-4">
        <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-orange-500" />
        <span className="break-words">{property.endereco}</span>
      </div>
      <div className="w-full h-[200px] rounded-lg overflow-hidden">
        <iframe
          className="w-full h-full"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${encodeURIComponent(
            property.endereco ?? ''
          )}&output=embed&zoom=15`}
        ></iframe>
      </div>
    </div>
  );
};