'use client';

import { CheckCircle, Edit, Eye, Heart, MapPin, Plus, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getProperties, Property } from "../dashboard/actions/get-properties";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { approveProperty, rejectProperty } from "../dashboard/actions/set-properties-status";
import { useAuth } from "@/components/auth-context";

interface RenderPropertiesProps {  
  darkMode?: boolean;
}

export function RenderProperties({ darkMode }: RenderPropertiesProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const data = await getProperties();
        setProperties(data);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handlePropertyUpdate = (updatedProperty: Property) => {
    setProperties(prev => prev.map(p => 
      p.id === updatedProperty.id ? updatedProperty : p
    ));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Gestão de Imóveis</h2>
          <div className="bg-gray-200 dark:bg-gray-700 h-10 w-40 rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(4)].map((_, index) => (
            <div 
              key={index} 
              className={`rounded-3xl overflow-hidden shadow-2xl ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } h-96 animate-pulse`}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Gestão de Imóveis</h2>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Imóvel
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {properties.map((property) => (
          <PropertyCard 
            key={property.id} 
            property={property} 
            darkMode={darkMode}
            onUpdate={handlePropertyUpdate}
          />
        ))}
      </div>
    </div>
  );
}

interface PropertyCardProps {
  property: Property;
  darkMode?: boolean;
  onUpdate: (updatedProperty: Property) => void;
}

export function PropertyCard({ property, darkMode, onUpdate }: PropertyCardProps) {
  const { user } = useAuth();
  const mainImage = property.gallery[0] || '';

  const handleApprove = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const result = await approveProperty({
        propertyId: property.id
      });

      if (result.success) {
        toast.success(result.message);
        onUpdate({
          ...property,
          aprovement_status: 'aprovado'
        });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Erro ao aprovar imóvel');
    }
  };

  const handleReject = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const result = await rejectProperty({
        propertyId: property.id
      });

      if (result.success) {
        toast.success(result.message);
        onUpdate({
          ...property,
          aprovement_status: 'rejeitado'
        });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Erro ao rejeitar imóvel');
    }
  };

  return (
    <div 
      className={`group relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-3xl hover:-translate-y-2 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50' 
          : 'bg-gradient-to-br from-white via-gray-50 to-white border border-gray-200/50'
      } backdrop-blur-sm`}
    >
      {/* Efeito glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
      
      {/* Container da imagem */}
      <div className="relative h-72 w-full overflow-hidden">
        {mainImage && (
          <Image 
            src={mainImage} 
            alt={property.title || "Imóvel sem título"}
            fill
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        
        {/* Overlay com gradiente dinâmico */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-70"></div>
        
        {/* Badge de status */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold border transition-all duration-300 ${
            property.aprovement_status === 'aprovado' 
              ? 'bg-emerald-600/90 text-white border-emerald-700 shadow-lg shadow-emerald-500/30' :
            property.aprovement_status === 'pending' 
              ? 'bg-amber-500/90 text-white border-amber-600 shadow-lg shadow-amber-500/30' :
              'bg-rose-600/90 text-white border-rose-700 shadow-lg shadow-rose-500/30'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              property.aprovement_status === 'aprovado' ? 'bg-white' :
              property.aprovement_status === 'pending' ? 'bg-white' : 'bg-white'
            }`}></div>
            {property.aprovement_status === 'aprovado' ? 'Aprovado' : property.aprovement_status === 'pending' ? 'Pendente' : 'Rejeitado'}
          </span>
        </div>
        
        {/* Preço */}
        <div className="absolute bottom-6 left-6">
          <div className="backdrop-blur-md bg-white/10 rounded-2xl p-4 border border-white/20">
            <span className="block text-sm text-white/80 font-medium mb-1">Preço</span>
            <span className="text-3xl font-black text-white drop-shadow-2xl tracking-tight">
              {property.price || '--'}
              <span className="text-lg font-normal ml-1 text-white/90">Kz</span>
            </span>
          </div>
        </div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="p-6 space-y-4">
        {/* Título e tipo */}
        <div className="space-y-2">
          <h3 className={`text-2xl font-bold tracking-tight transition-colors ${
            darkMode ? 'text-white group-hover:text-blue-300' : 'text-gray-900 group-hover:text-blue-600'
          }`}>
            {property.title || 'Imóvel sem título'}
          </h3>
          <div className="flex items-center space-x-2">
            <MapPin className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`text-sm font-medium ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {property.endereco || 'Tipo não especificado'}
            </p>
          </div>
        </div>
        
        {/* Divisor */}
        <div className={`h-px bg-gradient-to-r ${
          darkMode 
            ? 'from-transparent via-gray-600 to-transparent' 
            : 'from-transparent via-gray-300 to-transparent'
        }`}></div>
        
        {/* Seção do agente */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                darkMode
                  ? 'bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600'
                  : 'bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300'
              } group-hover:scale-110`}
            >
              {property.owner_id ? (
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'
                  } text-xs font-bold`}
                >
                  {property.owner_id?.primeiro_nome?.charAt(0)?.toUpperCase() || ''}
                  {property.owner_id?.ultimo_nome?.charAt(0)?.toUpperCase() || ''}
                </div>
              ) : (
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'
                  } text-xs font-bold`}
                >
                  ?
                </div>
              )}

              {/* Status online */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>

            {/* Info do agente */}
            <div>
              <p
                className={`text-sm font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {property.owner_id?.primeiro_nome || 'Agente'}{' '}
                {property.owner_id?.ultimo_nome || ''}
              </p>
              <p
                className={`text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Agente Certificado
              </p>
            </div>
          </div>
        </div>
          
        {/* Ações */}
        <div className="flex items-center space-x-1">
          <Link
            href={`/admin/dashboard/properties/${property.id}`}
            className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${
              darkMode 
                ? 'hover:bg-blue-500/20 text-gray-300 hover:text-blue-300 border border-transparent hover:border-blue-500/30'
                : 'hover:bg-blue-50 text-gray-500 hover:text-blue-600 border border-transparent hover:border-blue-200'
            } hover:shadow-lg backdrop-blur-sm`}
            title="Visualizar"
          >
            <Eye className="w-5 h-5" />
          </Link>

          <button
            onClick={handleApprove}
            className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${
              darkMode 
                ? 'hover:bg-emerald-500/20 text-gray-300 hover:text-emerald-300 border border-transparent hover:border-emerald-500/30'
                : 'hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 border border-transparent hover:border-emerald-200'
            } hover:shadow-lg backdrop-blur-sm`}
            title="Aprovar"
            disabled={property.aprovement_status === 'aprovado'}
          >
            <CheckCircle className="w-5 h-5" />
          </button>

          <button
            onClick={handleReject}
            className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${
              darkMode 
                ? 'hover:bg-rose-500/20 text-gray-300 hover:text-rose-300 border border-transparent hover:border-rose-500/30'
                : 'hover:bg-rose-50 text-gray-500 hover:text-rose-600 border border-transparent hover:border-rose-200'
            } hover:shadow-lg backdrop-blur-sm`}
            title="Rejeitar"
            disabled={property.aprovement_status === 'rejeitado'}
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        
        {/* Barra de progresso */}
        <div className="relative h-1 bg-gray-200/30 rounded-full overflow-hidden">
          <div className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ${
            property.aprovement_status === 'aprovado' ? 'w-full bg-emerald-500' :
            property.aprovement_status === 'pending' ? 'w-2/3 bg-amber-500' : 'w-1/3 bg-rose-500'
          }`}></div>
        </div>
      </div>
    </div>
  );
}