import { TPropertyResponseSchema } from "@/lib/types/property";

// ===== COMPONENTE TECHNICAL DETAILS =====
export function TechnicalDetails({ property }: { property: TPropertyResponseSchema }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border">
      <h3 className="font-semibold text-gray-700 mb-4 text-lg">Detalhes Técnicos</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {typeof property.area_terreno !== 'undefined' && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="font-medium block text-sm text-gray-500">Área do Terreno</span>
            <span className="text-gray-800">{property.area_terreno}</span>
          </div>
        )}
        {property.size && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="font-medium block text-sm text-gray-500">Tamanho</span>
            <span className="text-gray-800">{property.size}</span>
          </div>
        )}
        {property.garagemtamanho && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="font-medium block text-sm text-gray-500">Garagem (m²)</span>
            <span className="text-gray-800">{property.garagemtamanho}</span>
          </div>
        )}
        {typeof property.bedrooms !== 'undefined' && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="font-medium block text-sm text-gray-500">Quartos</span>
            <span className="text-gray-800">{property.bedrooms}</span>
          </div>
        )}
        {typeof property.bathrooms !== 'undefined' && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="font-medium block text-sm text-gray-500">Banheiros</span>
            <span className="text-gray-800">{property.bathrooms}</span>
          </div>
        )}
        {typeof property.garagens !== 'undefined' && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="font-medium block text-sm text-gray-500">Garagens</span>
            <span className="text-gray-800">{property.garagens}</span>
          </div>
        )}
      </div>
    </div>
  );
};