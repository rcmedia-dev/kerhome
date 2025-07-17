
import React, { useEffect, useState } from 'react';
import { useAuth } from './auth-context';
import { getUserProperties } from '@/lib/actions/get-user-properties';
import { PropertyResponse } from '@/lib/types/property';
import { getUserInvoices } from '@/lib/actions/get-user-invoices';
import { CheckCircle2 } from 'lucide-react';
import { Fatura } from '@/lib/types/faturas';
import { PropertyCard } from './property-card';
import { getImoveisFavoritos } from '@/lib/actions/get-favorited-imoveis';

export function MinhasPropriedades() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    getUserProperties(user.id).then(props => {
      setProperties(props);
      setLoading(false);
    });
  }, [user?.id]);

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Minhas Propriedades</h2>
      {loading ? (
        <div className="text-center text-gray-500">Carregando...</div>
      ) : properties.length === 0 ? (
        <div className="text-center text-gray-500">Nenhum imóvel cadastrado.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Favoritas() {
  const { user } = useAuth();
  const [favoritos, setFavoritos] = useState<PropertyResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return;

      setLoading(true);
      const data = await getImoveisFavoritos(user.id);
      setFavoritos(data);
      setLoading(false);
    }

    fetchData();
  }, [user?.id]);

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Imóveis Guardados</h2>

      {loading ? (
        <div className="text-center text-gray-500">Carregando...</div>
      ) : favoritos.length === 0 ? (
        <div className="text-center text-gray-500">Nenhum imóvel favorito.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {favoritos.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}



export function Analytics() {
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchFaturas() {
      if (!user?.id) return;

      const data = await getUserInvoices(user.id);
      setFaturas(data);
      setLoading(false);
    }

    fetchFaturas();
  }, [user]);

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6 text-center text-gray-500">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Minhas Faturas</h2>

      {loading ? (
        <div>Carregando faturas...</div>
      ) : faturas.length === 0 ? (
        <div>Nenhuma fatura encontrada.</div>
      ) : (
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
            {faturas.map((fatura) => (
              <tr key={fatura.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{fatura.servico}</td>
                <td className="p-2">{fatura.valor.toLocaleString()} Kz</td>
                <td className="p-2 capitalize">
                  {fatura.status === 'pago' ? (
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Pago
                    </span>
                  ) : (
                    <span className="text-yellow-600 font-medium">Pendente</span>
                  )}
                </td>
                <td className="p-2">
                  {new Date(fatura.criadoEm).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}



export function NovaPropriedade() {
  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Nova Propriedade</h2>
      <div className="text-gray-700">Formulário para adicionar nova propriedade.</div>
    </div>
  );
}
