'use client';

import { CheckCircle, Eye, MapPin, Plus, UserCircle2, XCircle, Clock, Check, X, MoreVertical, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getProperties, Property } from "../dashboard/actions/get-properties";
import Image from "next/image";
import { toast } from "sonner";
import { approveProperty, rejectProperty } from "../dashboard/actions/set-properties-status";
import { useAuth } from "@/components/auth-context";

interface RenderPropertiesProps {
  darkMode?: boolean;
}

export function RenderProperties({ darkMode }: RenderPropertiesProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'aprovado' | 'rejeitado'>('all');

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
    setProperties(prev =>
      prev.map(p => (p.id === updatedProperty.id ? updatedProperty : p))
    );
  };

  const filteredProperties = properties.filter(property => {
    if (activeTab === "all") return true;
    return property.aprovement_status === activeTab;
  });

  const countByStatus = (status: 'pending' | 'aprovado' | 'rejeitado') =>
    properties.filter(p => p.aprovement_status === status).length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>

          {/* Tabs Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex-1 py-3 bg-gray-200 dark:bg-gray-600 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse h-96"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Imóveis</h1>
          <p className="text-gray-600">Gerencie todos os imóveis da plataforma</p>
        </div>

        {/* Tabs Modernas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {[
              { key: 'all', label: 'Todos', icon: null, count: properties.length },
              { key: 'pending', label: 'Pendentes', icon: Clock, count: countByStatus('pending') },
              { key: 'aprovado', label: 'Aprovados', icon: CheckCircle, count: countByStatus('aprovado') },
              { key: 'rejeitado', label: 'Rejeitados', icon: XCircle, count: countByStatus('rejeitado') },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    activeTab === tab.key
                      ? "bg-white text-purple-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                  }`}
                >
                  {Icon && <Icon size={16} />}
                  {tab.label}
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.key 
                      ? "bg-purple-100 text-purple-600" 
                      : "bg-gray-200 text-gray-600"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista de imóveis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                darkMode={darkMode}
                onUpdate={handlePropertyUpdate}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <MapPin size={40} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Nenhum imóvel encontrado
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Não há imóveis com o status "{activeTab}" no momento.
              </p>
            </div>
          )}
        </div>
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
      const result = await approveProperty({ propertyId: property.id });
      if (result.success) {
        toast.success(result.message);
        onUpdate({ ...property, aprovement_status: 'aprovado' });
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('Erro ao aprovar imóvel');
    }
  };

  const handleReject = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const result = await rejectProperty({ propertyId: property.id });
      if (result.success) {
        toast.success(result.message);
        onUpdate({ ...property, aprovement_status: 'rejeitado' });
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('Erro ao rejeitar imóvel');
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'aprovado':
        return {
          color: 'bg-green-100 text-green-700',
          icon: CheckCircle,
          label: 'Aprovado'
        };
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-700',
          icon: Clock,
          label: 'Pendente'
        };
      case 'rejeitado':
        return {
          color: 'bg-red-100 text-red-700',
          icon: XCircle,
          label: 'Rejeitado'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-700',
          icon: Clock,
          label: 'Pendente'
        };
    }
  };

  const statusConfig = getStatusConfig(property.aprovement_status);
  const StatusIcon = statusConfig.icon;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA'
    }).format(value);
  };

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Imagem */}
      <div className="relative h-60 w-full overflow-hidden">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={property.title || "Imóvel sem título"}
            fill
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
            <MapPin className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

        {/* Status */}
        <div className="absolute top-4 right-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${statusConfig.color}`}
          >
            <StatusIcon size={12} />
            {statusConfig.label}
          </span>
        </div>

        {/* Preço */}
        {property.price && (
          <div className="absolute bottom-4 left-4">
            <span className="bg-black/80 text-white px-3 py-1 rounded-full text-sm font-bold">
              {formatCurrency(property.price)}
            </span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-5 space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
          {property.title || 'Imóvel sem título'}
        </h3>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">
              {property.endereco || 'Sem endereço'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <UserCircle2 className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">
              {property.owner_id
                ? `${property.owner_id.primeiro_nome} ${property.owner_id.ultimo_nome}`
                : 'Desconhecido'}
            </span>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href={`/admin/dashboard/properties/${property.id}`}
            className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 flex items-center justify-center gap-2 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Ver
          </Link>
          
          <button
            onClick={handleApprove}
            disabled={property.aprovement_status === 'aprovado'}
            className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors ${
              property.aprovement_status === 'aprovado'
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <Check className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleReject}
            disabled={property.aprovement_status === 'rejeitado'}
            className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors ${
              property.aprovement_status === 'rejeitado'
                ? 'bg-red-100 text-red-700 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}