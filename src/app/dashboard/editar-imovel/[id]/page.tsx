'use client';

import React, { useState, useEffect, use } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { ArrowLeft, Save, Plus, Trash, Loader2, MapPin, Home, DollarSign, Image, FileText, Settings } from 'lucide-react';
import { getPropertyById } from '@/lib/actions/get-properties';
import { updateProperty } from '@/lib/actions/supabase-actions/update-propertie';
import { toast } from 'sonner';
import Link from 'next/link';

interface PropertyData {
  id: string;
  title?: string;
  description?: string;
  tipo?: string;
  status?: string;
  price?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  size?: number | null;
  endereco?: string;
  cidade?: string;
  bairro?: string;
  caracteristicas?: string[];
  detalhes_adicionais?: { titulo: string; valor: string }[];
  ano_construcao?: number | null;
  area_terreno?: number | null;
  garagens?: number | null;
  garagem_tamanho?: string;
  pais?: string;
  provincia?: string;
  rotulo?: string;
  preco_chamada?: string;
  unidade_preco?: string;
}

const tiposPropriedade = ['Apartamento', 'Casa', 'Terreno', 'Comercial', 'Prédio', 'Fazenda'];
const statusOptions = ['para alugar', 'para vender', 'vendido', 'alugado'];
const caracteristicasOptions = [
  'Piscina', 'Academia', 'Garagem', 'Elevador', 'Portaria 24h', 
  'Churrasqueira', 'Salão de Festas', 'Quadra Esportiva', 'Varanda',
  'Jardim', 'Mobiliado', 'Ar Condicionado', 'Aquecimento', 'Cozinha Equipada'
];

export default function PropertyEditForm({ params }: { params: Promise<{ id: string }> }) {
  // Use React.use() to unwrap the params promise
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { 
    register, 
    handleSubmit, 
    control,
    reset,
    formState: { isDirty }
  } = useForm<PropertyData>({
    defaultValues: {
      detalhes_adicionais: [],
      caracteristicas: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'detalhes_adicionais'
  });

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const property = await getPropertyById(id);
        
        if (property) {
          // Basic info
          reset({
            id: property.id,
            title: property.title || '',
            description: property.description || '',
            tipo: property.tipo || '',
            status: property.status || '',
            price: property.price || 0,
            bedrooms: property.bedrooms || 0,
            bathrooms: property.bathrooms || 0,
            size: property.size ? Number(property.size) : 0,
            endereco: property.endereco || '',
            cidade: property.cidade || '',
            bairro: property.bairro || '',
            ano_construcao: property.anoconstrucao || 0,
            area_terreno: property.area_terreno ? Number(property.area_terreno) : 0,
            garagens: property.garagens || 0,
            garagem_tamanho: property.garagemtamanho || '',
            pais: property.pais || '',
            provincia: property.provincia || '',
            rotulo: property.rotulo || '',
            preco_chamada: property.preco_chamada || '',
            unidade_preco: property.unidade_preco || '',
          });
        }
      } catch (error) {
        console.error('Erro ao carregar propriedade:', error);
        toast.error('Erro ao carregar dados da propriedade');
      } finally {
        setIsLoading(false);
      }
    };

    loadProperty();
  }, [id, reset]);

  const onSubmit = async (data: PropertyData) => {
    setIsSubmitting(true);
    try {
      const result = await updateProperty(id, {
        ...data
      });
      
      if (result.success) {
        toast.success('Propriedade atualizada com sucesso!', {
        position: 'top-right',
        duration: 5000,
        action: {
          label: 'Fechar',
          onClick: () => {},
        },
      });
        reset(data); // Update form state to prevent dirty flag
      } else {
        toast.error(result.message || 'Erro ao atualizar propriedade', {
        position: 'top-right',
        duration: 5000,
      });
      }
    } catch (error) {
      console.error('Failed to update property:', error);
      toast.error('Erro ao atualizar propriedade');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'info', label: 'Informações', icon: Home },
    { id: 'local', label: 'Localização', icon: MapPin },
    { id: 'preco', label: 'Preço', icon: DollarSign },
    { id: 'detalhes', label: 'Detalhes', icon: Settings },
    { id: 'midia', label: 'Mídia', icon: Image },
    { id: 'notas', label: 'Notas', icon: FileText }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
          <p className="text-gray-600">Carregando dados da propriedade...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl px-4 py-4 mx-auto sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Editar Propriedade</h1>
          </div>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={!isDirty || isSubmitting}
            className={`flex items-center px-4 py-2 font-medium rounded-lg ${
              isDirty 
                ? 'bg-purple-700 text-white hover:bg-purple-800'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-7xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <nav className="space-y-2 lg:w-64">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center w-full px-4 py-3 text-left rounded-xl transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-700 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex-1">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {activeTab === 'info' && (
                <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <h2 className="mb-4 text-lg font-semibold">Informações Básicas</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Título da Propriedade
                      </label>
                      <input
                        {...register('title')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Descrição
                      </label>
                      <textarea
                        {...register('description')}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Tipo de Propriedade
                        </label>
                        <select
                          {...register('tipo')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Selecione um tipo</option>
                          {tiposPropriedade.map(tipo => (
                            <option key={tipo} value={tipo}>{tipo}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <select
                          {...register('status')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Selecione um status</option>
                          {statusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Rótulo
                        </label>
                        <input
                          {...register('rotulo')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Ano de Construção
                        </label>
                        <input
                          type="number"
                          {...register('ano_construcao')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Área do Terreno (m²)
                        </label>
                        <input
                          type="number"
                          {...register('area_terreno')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Garagens
                        </label>
                        <input
                          type="number"
                          {...register('garagens')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'local' && (
                <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <h2 className="mb-4 text-lg font-semibold">Localização</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Endereço Completo
                      </label>
                      <input
                        {...register('endereco')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          País
                        </label>
                        <input
                          {...register('pais')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Província
                        </label>
                        <input
                          {...register('provincia')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Cidade
                        </label>
                        <input
                          {...register('cidade')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Bairro
                      </label>
                      <input
                        {...register('bairro')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'preco' && (
                <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <h2 className="mb-4 text-lg font-semibold">Preço e Dimensões</h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Preço (Kz)
                        </label>
                        <input
                          type="number"
                          {...register('price')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Unidade de Preço
                        </label>
                        <input
                          {...register('unidade_preco')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Preço por Chamada
                        </label>
                        <input
                          {...register('preco_chamada')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Quartos
                        </label>
                        <input
                          type="number"
                          {...register('bedrooms')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Banheiros
                        </label>
                        <input
                          type="number"
                          {...register('bathrooms')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Área (m²)
                        </label>
                        <input
                          type="number"
                          {...register('size')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'detalhes' && (
                <div className="space-y-6">
                  <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold">Características</h2>
                    
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                      {caracteristicasOptions.map((caracteristica) => (
                        <label key={caracteristica} className="flex items-center p-2 space-x-2 rounded-lg hover:bg-gray-50">
                          <input
                            type="checkbox"
                            value={caracteristica}
                            {...register('caracteristicas')}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{caracteristica}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Detalhes Adicionais</h2>
                      <button
                        type="button"
                        onClick={() => append({ titulo: '', valor: '' })}
                        className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar
                      </button>
                    </div>

                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-3">
                          <div className="flex-1">
                            <label className="block mb-1 text-sm font-medium text-gray-700">Título</label>
                            <input
                              {...register(`detalhes_adicionais.${index}.titulo` as const)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block mb-1 text-sm font-medium text-gray-700">Valor</label>
                            <input
                              {...register(`detalhes_adicionais.${index}.valor` as const)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-2 text-red-500 hover:text-red-700"
                          >
                            <Trash className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'midia' && (
                <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <h2 className="mb-4 text-lg font-semibold">Mídia</h2>
                  <p className="text-gray-600">Área para upload de fotos e vídeos da propriedade</p>
                </div>
              )}

              {activeTab === 'notas' && (
                <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <h2 className="mb-4 text-lg font-semibold">Notas</h2>
                  <p className="text-gray-600">Área para anotações internas sobre a propriedade</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}