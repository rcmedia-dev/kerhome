import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PropertyCard } from './property-card';
import { TFavoritedPropertyResponseSchema } from '@/lib/types/user';
import { PropertyFavoritedCard } from './property-favorite-card';
import { Fatura, TPropertyResponseSchema } from '@/lib/types/property';
import { TMyPropertiesWithViews } from '@/lib/actions/supabase-actions/get-most-seen-propeties';



type MinePropertiesProps = {
  userProperties: TPropertyResponseSchema[]
}

export function MinhasPropriedades({ userProperties }: MinePropertiesProps) {

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Minhas Propriedades</h2>

      {userProperties.length === 0 ? (
        <div className="text-center text-gray-500">Nenhum imóvel cadastrado.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {userProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}



type FavoritasProps = {
  userFavoriteProperties: TFavoritedPropertyResponseSchema[]
}

export function Favoritas({ userFavoriteProperties }: FavoritasProps) {
  const hasFavorites =
    userFavoriteProperties && userFavoriteProperties.length > 0;

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Imóveis Guardados
      </h2>

      {hasFavorites ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {userFavoriteProperties!.map((property) => (
            <PropertyFavoritedCard
              key={property.propertyid}
              property={{
                ...property,
                price:
                  property.price !== null && property.price !== undefined
                    ? String(property.price)
                    : null,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-gray-500 italic text-center py-6">
          Nenhum imóvel guardado ainda.
        </div>
      )}
    </div>
  );
}

type FaturasProps = {
  invoices: Fatura[]
}

export function Faturas({ invoices }: FaturasProps) {
  const hasInvoices = invoices && invoices.length > 0;

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">
        Minhas Faturas
      </h2>

      {hasInvoices ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead>
              <tr className="border-b font-semibold">
                <th className="p-2">Serviço</th>
                <th className="p-2">Valor</th>
                <th className="p-2">Status</th>
                <th className="p-2">Data</th>
              </tr>
            </thead>
            <tbody>
              {invoices!.map((fatura) => (
                <tr key={fatura.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{fatura.servico}</td>
                  <td className="p-2">
                    {fatura.valor.toLocaleString("pt-AO")} Kz
                  </td>
                  <td className="p-2 capitalize">
                    {fatura.status === "pago" ? (
                      <span className="text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Pago
                      </span>
                    ) : (
                      <span className="text-yellow-600 font-medium">
                        Pendente
                      </span>
                    )}
                  </td>
                  <td className="p-2">
                    {new Date(fatura.created_at).toLocaleDateString("pt-AO")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-gray-500 italic text-center py-6">
          Nenhuma fatura encontrada.
        </div>
      )}
    </div>
  );
}

type MostViewedProps = {
  mostViewedProperties: TMyPropertiesWithViews;
};

export function PropriedadesMaisVisualizadas({
  mostViewedProperties,
}: MostViewedProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Propriedades Mais Visualizadas
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Ordenado por visualizações</span>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Total de visualizações:{" "}
        <span className="font-semibold text-gray-800">
          {mostViewedProperties.total_views_all}
        </span>
      </p>

      {mostViewedProperties.properties.length === 0 ? (
        <div className="text-center text-gray-500">
          Nenhuma propriedade visualizada ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {mostViewedProperties.properties.map((property) => (
            <div key={property.id} className="relative">
              <PropertyCard property={property} />
              <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <span>{property.total_views}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
