'use client';

import { CheckCircle, Eye, MapPin, Plus, UserCircle2, XCircle, Clock, Check, X, Building, Settings, Trash2, Edit, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getProperties, Property } from "@/app/admin/dashboard/actions/get-properties";
import Image from "next/image";
import { toast } from "sonner";
import { approveProperty, rejectProperty } from "@/app/admin/dashboard/actions/set-properties-status";
import { deleteProperty } from "@/lib/functions/supabase-actions/delete-propertie";
import { useUserStore } from "@/lib/store/user-store";

interface RenderPropertiesProps {
  darkMode?: boolean;
}

export function RenderProperties({ darkMode }: RenderPropertiesProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'approval' | 'management'>('approval');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'aprovado' | 'rejeitado'>('all');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const data = await getProperties();
        setProperties(data);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
        toast.error('Erro ao carregar imóveis');
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

  const handlePropertyDelete = (propertyId: string) => {
    setProperties(prev => prev.filter(p => p.id !== propertyId));
  };

  const filteredProperties = properties.filter(property => {
    if (activeTab === "all") return true;
    return property.aprovement_status === activeTab;
  });

  const countByStatus = (status: 'pending' | 'aprovado' | 'rejeitado') =>
    properties.filter(p => p.aprovement_status === status).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>

          {/* Sections Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              {[...Array(2)].map((_, index) => (
                <div key={index} className="flex-1 py-4 bg-gray-200 dark:bg-gray-600 rounded-xl animate-pulse"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {activeSection === 'approval' ? 'Aprovação de Imóveis' : 'Gestão de Imóveis'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {activeSection === 'approval' 
              ? 'Aprove ou rejeite imóveis pendentes' 
              : 'Gerencie todos os imóveis da plataforma'}
          </p>
        </div>

        {/* Seções */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-8">
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            {[
              { 
                key: 'approval', 
                label: 'Aprovação', 
                icon: CheckCircle, 
                description: 'Gerir estados dos imóveis' 
              },
              { 
                key: 'management', 
                label: 'Gestão Completa', 
                icon: Settings, 
                description: 'CRUD de imóveis' 
              },
            ].map(section => {
              const Icon = section.icon;
              return (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key as any)}
                  className={`flex-1 py-4 px-6 rounded-xl text-left transition-all duration-200 ${
                    activeSection === section.key
                      ? "bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <Icon size={20} />
                    <span className="font-semibold">{section.label}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{section.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conteúdo baseado na seção selecionada */}
        {activeSection === 'approval' ? (
          <ApprovalSection 
            properties={filteredProperties}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            countByStatus={countByStatus}
            onPropertyUpdate={handlePropertyUpdate}
            darkMode={darkMode}
          />
        ) : (
          <ManagementSection 
            properties={properties}
            onPropertyUpdate={handlePropertyUpdate}
            onPropertyDelete={handlePropertyDelete}
            darkMode={darkMode}
          />
        )}
      </div>
    </div>
  );
}

// Seção de Aprovação
interface ApprovalSectionProps {
  properties: Property[];
  activeTab: 'all' | 'pending' | 'aprovado' | 'rejeitado';
  setActiveTab: (tab: 'all' | 'pending' | 'aprovado' | 'rejeitado') => void;
  countByStatus: (status: 'pending' | 'aprovado' | 'rejeitado') => number;
  onPropertyUpdate: (property: Property) => void;
  darkMode?: boolean;
}

function ApprovalSection({ 
  properties, 
  activeTab, 
  setActiveTab, 
  countByStatus, 
  onPropertyUpdate, 
  darkMode 
}: ApprovalSectionProps) {
  return (
    <>
      {/* Tabs de Status */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-8">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
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
                    ? "bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50"
                }`}
              >
                {Icon && <Icon size={16} />}
                {tab.label}
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.key 
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" 
                    : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de imóveis para aprovação */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {properties.length > 0 ? (
          properties.map((property) => (
            <ApprovalPropertyCard
              key={property.id}
              property={property}
              darkMode={darkMode}
              onUpdate={onPropertyUpdate}
            />
          ))
        ) : (
          <EmptyState 
            icon={Building}
            title="Nenhum imóvel encontrado"
            description={`Não há imóveis com o status "${activeTab}" no momento.`}
          />
        )}
      </div>
    </>
  );
}

// Seção de Gestão Completa (CRUD)
interface ManagementSectionProps {
  properties: Property[];
  onPropertyUpdate: (property: Property) => void;
  onPropertyDelete: (propertyId: string) => void;
  darkMode?: boolean;
}

function ManagementSection({ properties, onPropertyUpdate, onPropertyDelete, darkMode }: ManagementSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProperties = properties.filter(property =>
    property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.endereco?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.owner_id?.primeiro_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.owner_id?.ultimo_nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Barra de ferramentas */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex-1 w-full sm:max-w-md">
            <input
              type="text"
              placeholder="Pesquisar imóveis por título, endereço ou proprietário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              Filtros
            </button>
            <Link
              href="/admin/dashboard/properties/new"
              className="flex-1 sm:flex-none px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Novo Imóvel
            </Link>
          </div>
        </div>
      </div>

      {/* Lista de imóveis para gestão */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProperties.length > 0 ? (
          filteredProperties.map((property) => (
            <ManagementPropertyCard
              key={property.id}
              property={property}
              darkMode={darkMode}
              onUpdate={onPropertyUpdate}
              onDelete={onPropertyDelete}
            />
          ))
        ) : (
          <EmptyState 
            icon={Building}
            title="Nenhum imóvel encontrado"
            description={searchTerm ? "Tente ajustar os termos da pesquisa." : "Comece adicionando seu primeiro imóvel."}
          />
        )}
      </div>
    </>
  );
}

// Card para Aprovação
interface PropertyCardProps {
  property: Property;
  darkMode?: boolean;
  onUpdate: (updatedProperty: Property) => void;
}

function ApprovalPropertyCard({ property, darkMode, onUpdate }: PropertyCardProps) {
  const { user } = useUserStore();
  const mainImage = property.gallery?.[0] || '';

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

  const statusConfig = getStatusConfig(property.aprovement_status);
  const StatusIcon = statusConfig.icon;

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
            <Building className="w-12 h-12 text-gray-400" />
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

        {/* Ações para Aprovação */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href={`/admin/dashboard/properties/${property.id}`}
            className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Ver
          </Link>
          
          <button
            onClick={handleApprove}
            disabled={property.aprovement_status === 'aprovado'}
            className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors ${
              property.aprovement_status === 'aprovado'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-not-allowed'
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
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 cursor-not-allowed'
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

// Card para Gestão Completa
interface ManagementPropertyCardProps {
  property: Property;
  darkMode?: boolean;
  onUpdate: (updatedProperty: Property) => void;
  onDelete: (propertyId: string) => void;
}

function ManagementPropertyCard({ property, darkMode, onUpdate, onDelete }: ManagementPropertyCardProps) {
  const { user } = useUserStore();
  const mainImage = property.gallery?.[0] || '';
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user?.id) return;
    
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir este imóvel?\n\nEsta ação não pode ser desfeita e todas as informações do imóvel serão permanentemente removidas.'
    );
    
    if (!confirmed) return;

    setIsDeleting(true);
    
    try {
      await deleteProperty(property.id);
      onDelete(property.id);
      
    } catch (error) {
      console.error('Erro ao excluir imóvel:', error);
      toast.error('Erro ao excluir imóvel');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = `/admin/dashboard/properties/edit-propertie/${property.id}`;
  };

  const statusConfig = getStatusConfig(property.aprovement_status);
  const StatusIcon = statusConfig.icon;

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
            <Building className="w-12 h-12 text-gray-400" />
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

        {/* Ações para Gestão */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href={`/admin/dashboard/properties/${property.id}`}
            className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Ver
          </Link>
          
          <button
            onClick={handleEdit}
            className="px-3 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 transition-colors"
            title="Editar imóvel"
          >
            <Edit className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors ${
              isDeleting
                ? 'bg-red-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            } text-white`}
            title="Excluir imóvel"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente de estado vazio
function EmptyState({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="col-span-full text-center py-12">
      <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
        <Icon size={40} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
        {description}
      </p>
    </div>
  );
}

// Funções auxiliares
function getStatusConfig(status: string) {
  switch (status) {
    case 'aprovado':
      return {
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        icon: CheckCircle,
        label: 'Aprovado'
      };
    case 'pending':
      return {
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: Clock,
        label: 'Pendente'
      };
    case 'rejeitado':
      return {
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        icon: XCircle,
        label: 'Rejeitado'
      };
    default:
      return {
        color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
        icon: Clock,
        label: 'Pendente'
      };
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA'
  }).format(value);
}

export default RenderProperties;