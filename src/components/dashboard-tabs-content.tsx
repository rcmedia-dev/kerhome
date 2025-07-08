
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Settings } from 'lucide-react';
import { PropertyCard } from './property-showcase';
import { Property } from '@/lib/types/property';
import { useAuth } from './auth-context';
import { getUserProperties } from '@/lib/actions/get-user-properties';

export function MinhasPropriedades() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
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
  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6 text-center text-gray-500">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Imóveis Guardados</h2>
      <div>Nenhum imóvel favorito.</div>
    </div>
  );
}



export function Analytics() {
  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6 text-center text-gray-500">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Faturas</h2>
      <div>Nenhuma fatura encontrada.</div>
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

export function ConfiguracoesConta() {
  return (
    <Card className="shadow-md mt-6">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center text-gray-800">
          <Settings className="w-6 h-6 mr-3 text-purple-700" />
          Configurações da Conta
        </CardTitle>
        <CardDescription className="text-gray-500">
          Gerencie suas informações pessoais e profissionais
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['Primeiro Nome', 'Último Nome', 'Email', 'Telefone', 'Empresa', 'Licença', 'Website', 'Facebook', 'LinkedIn', 'Instagram', 'YouTube'].map(label => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <input className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2 focus:border-purple-500 focus:ring-purple-500" />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Sobre Mim</label>
              <textarea rows={4} className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2 focus:border-purple-500 focus:ring-purple-500" />
            </div>
          </div>
          <button type="submit" className="bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800">
            Atualizar Perfil
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
