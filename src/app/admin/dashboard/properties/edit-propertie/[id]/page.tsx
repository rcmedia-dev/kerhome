// app/dashboard/imoveis/[id]/edit/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller, useFormContext, FormProvider } from 'react-hook-form';
import { ArrowLeft, Save, Plus, Trash, Loader2, MapPin, Home, DollarSign, Image, FileText, Settings, Building, Bath, Bed, Car, Ruler } from 'lucide-react';
import { getPropertyById } from '@/lib/actions/get-properties';
import { updateProperty, deleteGalleryImage } from '@/lib/actions/supabase-actions/update-propertie';
import { toast } from 'sonner';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface PropertyData {
  id: string;
  title?: string;
  description?: string;
  tipo?: string;
  status?: string;
  price?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  size?: string | null;
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
  coverFile?: File | null;
  galleryFiles?: File[] | null;
  image?: string | null;
  gallery?: string[] | null;
  video_url?: string;
  is_featured?: boolean;
  nota_privada?: string;
}

const tiposPropriedade = ['Apartamento', 'Casa', 'Prédio', 'Vivenda', 'Terreno', 'Comercial', 'Escritório'];
const statusOptions = ['arrendar', 'comprar'];
const caracteristicasOptions = [
  'Piscina', 'Academia', 'Garagem', 'Elevador', 'Portaria 24h', 
  'Churrasqueira', 'Salão de Festas', 'Quadra Esportiva', 'Varanda',
  'Jardim', 'Mobiliado', 'Ar Condicionado', 'Aquecimento', 'Cozinha Equipada',
  'Segurança 24h', 'Área de Serviço', 'Varanda Gourmet', 'Playground'
];
const unidadesPreco = ['Kwanza', 'Dólar', 'Euro'];
const opcoesPrecoChamada = ['Preço Fixo', 'Preço Negociável', 'Sob Consulta'];

// Função para formatar o preço
const formatarPreco = (valor: string | number | null | undefined): string => {
  if (valor === null || valor === undefined || valor === '') return '';
  const valorString = typeof valor === 'number' ? valor.toString() : String(valor);
  const apenasNumeros = valorString.replace(/\D/g, '');
  if (apenasNumeros.length === 0) return '';
  return Number(apenasNumeros).toLocaleString('pt-BR');
};

// Componente para o cabeçalho
const FormHeader = ({ isDirty, isSubmitting, handleSubmit }: { 
  isDirty: boolean; 
  isSubmitting: boolean; 
  handleSubmit: () => void; 
}) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/imoveis"
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Imóveis
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-xl font-bold text-gray-900">Editar Imóvel</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard/imoveis"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              onClick={handleSubmit}
              disabled={!isDirty || isSubmitting}
              className={`inline-flex items-center px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                isDirty 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
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
        </div>
      </div>
    </div>
  );
};

// Componente para a navegação por abas
const TabNavigation = ({ activeTab, setActiveTab }: { 
  activeTab: string; 
  setActiveTab: (tab: string) => void; 
}) => {
  const tabs = [
    { id: 'info', label: 'Informações', icon: Home, description: 'Dados básicos do imóvel' },
    { id: 'local', label: 'Localização', icon: MapPin, description: 'Endereço e área' },
    { id: 'preco', label: 'Preço', icon: DollarSign, description: 'Valor e condições' },
    { id: 'detalhes', label: 'Características', icon: Settings, description: 'Detalhes e amenities' },
    { id: 'midia', label: 'Mídia', icon: Image, description: 'Fotos e vídeos' },
    { id: 'notas', label: 'Notas', icon: FileText, description: 'Observações internas' }
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Navegação</h3>
      <div className="space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-start w-full p-4 text-left rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-50 border-2 border-blue-200 shadow-sm'
                  : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="ml-3 flex-1">
                <div className={`font-medium ${
                  activeTab === tab.id ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {tab.label}
                </div>
                <div className={`text-sm ${
                  activeTab === tab.id ? 'text-blue-700' : 'text-gray-500'
                }`}>
                  {tab.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Componente para informações básicas
const InfoTab = ({ register }: { register: any }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações Básicas</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título do Imóvel *
            </label>
            <input
              {...register('title', { required: true })}
              placeholder="Ex: Apartamento moderno com vista para o mar"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea
              {...register('description', { required: true })}
              rows={5}
              placeholder="Descreva o imóvel em detalhes, incluindo características especiais, localização privilegiada, etc."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Imóvel *
              </label>
              <select
                {...register('tipo', { required: true })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Selecione...</option>
                {tiposPropriedade.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                {...register('status', { required: true })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Selecione...</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status === 'arrendar' ? 'Para Arrendar' : 'Para Comprar'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rótulo
              </label>
              <input
                {...register('rotulo')}
                placeholder="Ex: Oportunidade, Novo, Destaque"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Especificações Técnicas</h3>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="w-4 h-4 inline mr-1" />
              Ano de Construção
            </label>
            <input
              type="number"
              {...register('ano_construcao')}
              min="1900"
              max="2030"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Ruler className="w-4 h-4 inline mr-1" />
              Área do Terreno (m²)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('area_terreno')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Car className="w-4 h-4 inline mr-1" />
              Garagens
            </label>
            <input
              type="number"
              {...register('garagens')}
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tamanho da Garagem
            </label>
            <input
              {...register('garagem_tamanho')}
              placeholder="Ex: 20m²"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para localização
const LocationTab = ({ register }: { register: any }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Localização</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Endereço Completo *
          </label>
          <input
            {...register('endereco', { required: true })}
            placeholder="Ex: Rua da Independência, Nº 123"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              País *
            </label>
            <input
              {...register('pais', { required: true })}
              defaultValue="Angola"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Província *
            </label>
            <input
              {...register('provincia', { required: true })}
              placeholder="Ex: Luanda"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cidade *
            </label>
            <input
              {...register('cidade', { required: true })}
              placeholder="Ex: Luanda"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bairro *
          </label>
          <input
            {...register('bairro', { required: true })}
            placeholder="Ex: Alvalade"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};

// Componente para preço
const PriceTab = ({ register, setValue, watch }: { 
  register: any;
  setValue: any;
  watch: any;
}) => {
  const precoValue = watch('price') || '';
  
  const handlePrecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarPreco(e.target.value);
    const valorNumerico = valorFormatado.replace(/\D/g, '');
    setValue('price', valorNumerico ? Number(valorNumerico) : null, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações de Preço</h2>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preço *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                value={precoValue ? formatarPreco(precoValue) : ''}
                onChange={handlePrecoChange}
                placeholder="0,00"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unidade de Preço *
            </label>
            <select
              {...register('unidade_preco', { required: true })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Selecione...</option>
              {unidadesPreco.map(unidade => (
                <option key={unidade} value={unidade}>{unidade}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condição de Preço
            </label>
            <select
              {...register('preco_chamada')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Selecione...</option>
              {opcoesPrecoChamada.map(opcao => (
                <option key={opcao} value={opcao}>{opcao}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Dimensões do Imóvel</h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Bed className="w-4 h-4 inline mr-1" />
              Quartos
            </label>
            <input
              type="number"
              {...register('bedrooms')}
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Bath className="w-4 h-4 inline mr-1" />
              Banheiros
            </label>
            <input
              type="number"
              {...register('bathrooms')}
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Ruler className="w-4 h-4 inline mr-1" />
              Área Total (m²) *
            </label>
            <input
              {...register('size', { required: true })}
              placeholder="Ex: 120"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vagas Garagem
            </label>
            <input
              type="number"
              {...register('garagens')}
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para detalhes
const DetailsTab = ({ register, control, fields, append, remove }: { 
  register: any; 
  control: any;
  fields: any[];
  append: any;
  remove: any;
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Características do Imóvel</h2>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {caracteristicasOptions.map((caracteristica) => (
            <label key={caracteristica} className="flex items-center p-3 space-x-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                value={caracteristica}
                {...register('caracteristicas')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{caracteristica}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Detalhes Adicionais</h3>
            <p className="text-sm text-gray-500 mt-1">Adicione informações específicas do imóvel</p>
          </div>
          <button
            type="button"
            onClick={() => append({ titulo: '', valor: '' })}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Campo
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-end gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                <input
                  {...register(`detalhes_adicionais.${index}.titulo` as const)}
                  placeholder="Ex: Tipo de Piso"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
                <input
                  {...register(`detalhes_adicionais.${index}.valor` as const)}
                  placeholder="Ex: Mármore"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="Remover campo"
              >
                <Trash className="w-5 h-5" />
              </button>
            </div>
          ))}
          
          {fields.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhum detalhe adicional adicionado</p>
              <p className="text-sm">Clique em "Adicionar Campo" para incluir informações específicas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para mídia
const MediaTab = ({ property }: { property?: any }) => {
  const { control, setValue, watch } = useFormContext();
  const [coverPreview, setCoverPreview] = useState<string | null>(
    property?.image || null
  );
  const [galleryPreview, setGalleryPreview] = useState<string[]>(
    property?.gallery || []
  );

  const galleryFiles = watch('galleryFiles') || [];

  const handleDeleteExistingImage = async (imageUrl: string) => {
    if (!property?.id) return;
    
    const result = await deleteGalleryImage(property.id, imageUrl);
    
    if (result.success) {
      toast.success('Imagem removida com sucesso');
      const newGallery = galleryPreview.filter(img => img !== imageUrl);
      setGalleryPreview(newGallery);
      setValue('gallery', newGallery);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Imagem de Capa</h2>
        
        <Controller
          name="coverFile"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                {coverPreview ? (
                  <div className="relative w-64 h-48 rounded-lg overflow-hidden border-2 border-blue-200">
                    <img 
                      src={coverPreview} 
                      alt="Preview da capa" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverPreview(null);
                        field.onChange(null);
                        setValue('image', null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-64 h-48 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50">
                    <Image className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-gray-500 text-sm">Sem imagem</span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <label className="inline-flex items-center px-6 py-3 font-medium text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors mb-3">
                  <Image className="w-5 h-5 mr-2" />
                  {coverPreview ? 'Alterar Imagem' : 'Selecionar Imagem'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        field.onChange(file);
                        setCoverPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500">
                  Recomendado: Imagem em landscape, 800x600px ou superior. Formatos: JPG, PNG, WEBP
                </p>
              </div>
            </div>
          )}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Galeria de Imagens</h2>
        
        <Controller
          name="galleryFiles"
          control={control}
          render={({ field }) => (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                {galleryPreview.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        if (img.startsWith('blob:')) {
                          const newPreview = galleryPreview.filter((_, i: number) => i !== idx);
                          setGalleryPreview(newPreview);
                          const newFiles = galleryFiles.filter((_: File, i: number) => i !== idx);
                          field.onChange(newFiles);
                        } else {
                          handleDeleteExistingImage(img);
                        }
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <Trash className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {galleryPreview.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <Image className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Nenhuma imagem na galeria</p>
                    <p className="text-sm">Adicione imagens para mostrar o imóvel</p>
                  </div>
                )}
              </div>

              <label className="inline-flex items-center px-6 py-3 font-medium text-gray-700 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                <Plus className="w-5 h-5 mr-2" />
                Adicionar Imagens à Galeria
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      const current = Array.from(galleryFiles || []);
                      field.onChange([...current, ...files]);
                      setGalleryPreview([
                        ...galleryPreview,
                        ...files.map((f) => URL.createObjectURL(f)),
                      ]);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          )}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vídeo do Imóvel</h3>
        <Controller
          name="video_url"
          control={control}
          render={({ field }) => (
            <div>
              <input
                {...field}
                placeholder="https://youtube.com/embed/... ou https://vimeo.com/..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <p className="text-sm text-gray-500 mt-2">
                Cole a URL embed do YouTube ou Vimeo. Ex: https://www.youtube.com/embed/VIDEO_ID
              </p>
            </div>
          )}
        />
      </div>
    </div>
  );
};

// Componente para a aba de Notas
const NotesTab = ({ register, control }: { register: any; control: any }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Notas Internas</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block mb-3 text-sm font-medium text-gray-700">
            Anotações Privadas
          </label>
          <textarea
            {...register('nota_privada')}
            rows={10}
            placeholder="Adicione observações internas, informações relevantes para a equipe, detalhes de negociação, ou qualquer informação que não deve ser exibida publicamente..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
          />
        </div>
        
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <Controller
            name="is_featured"
            control={control}
            render={({ field }) => (
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.value || false}
                  onChange={field.onChange}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Destacar este imóvel</span>
                  <p className="text-sm text-gray-600 mt-1">
                    Quando ativado, este imóvel será destacado nas listagens e terá maior visibilidade.
                  </p>
                </div>
              </label>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default function PropertyEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedProperty, setLoadedProperty] = useState<any>(null);

  const methods = useForm<PropertyData>({
    defaultValues: {
      detalhes_adicionais: [],
      caracteristicas: [],
      coverFile: null,
      galleryFiles: [],
      image: null,
      gallery: [],
      is_featured: false,
      nota_privada: '',
      pais: 'Angola'
    }
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { isDirty, errors }
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'detalhes_adicionais'
  });

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const property = await getPropertyById(id);

        if (property) {
          setLoadedProperty(property);

          let detalhesParsed: { titulo: string; valor: string }[] = [];
          if (property.detalhesadicionais) {
            try {
              if (typeof property.detalhesadicionais === 'string') {
                detalhesParsed = JSON.parse(property.detalhesadicionais);
              } else if (Array.isArray(property.detalhesadicionais)) {
                detalhesParsed = property.detalhesadicionais;
              }
            } catch (err) {
              console.warn('Não foi possível fazer parse dos detalhes_adicionais', err);
            }
          }

          let caracteristicas: string[] = [];
          if (property.caracteristicas) {
            try {
              if (typeof property.caracteristicas === 'string') {
                caracteristicas = JSON.parse(property.caracteristicas) as string[];
              } else if (Array.isArray(property.caracteristicas)) {
                caracteristicas = property.caracteristicas;
              }
            } catch (err) {
              console.warn('Não foi possível fazer parse das características', err);
              if (typeof property.caracteristicas === 'string') {
                caracteristicas = (property.caracteristicas as string)
                  .split(',')
                  .map((s) => s.trim());
              }
            }
          }

          reset({
            id: property.id,
            title: property.title ?? '',
            description: property.description ?? '',
            tipo: property.tipo ?? '',
            status: property.status ?? '',
            price: property.price ?? null,
            bedrooms: property.bedrooms ?? null,
            bathrooms: property.bathrooms ?? null,
            size: property.size ?? '',
            endereco: property.endereco ?? '',
            cidade: property.cidade ?? '',
            bairro: property.bairro ?? '',
            ano_construcao: property.anoconstrucao ?? null,
            area_terreno: property.area_terreno ?? null,
            garagens: property.garagens ?? null,
            garagem_tamanho: property.garagemtamanho ?? '',
            pais: property.pais ?? 'Angola',
            provincia: property.provincia ?? '',
            rotulo: property.rotulo ?? '', 
            preco_chamada: property.preco_chamada ?? '',
            unidade_preco: property.unidade_preco ?? '',
            nota_privada: property.notaprivada ?? '',
            detalhes_adicionais: detalhesParsed,
            caracteristicas: caracteristicas,
            image: property.image ?? null,
            gallery: Array.isArray(property.gallery) ? property.gallery : [],
            coverFile: null,
            galleryFiles: []
          });
        } else {
          toast.error('Imóvel não encontrado');
          router.push('/admin/dashboard');
        }
      } catch (error) {
        console.error('Erro ao carregar imóvel:', error);
        toast.error('Erro ao carregar dados do imóvel');
        router.push('/admin/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadProperty();
    }
  }, [id, reset, router]);

  const onSubmit = async (data: PropertyData) => {
    setIsSubmitting(true);
    try {
      const result = await updateProperty(id, data);

      if (result.success) {
        toast.success('Imóvel atualizado com sucesso!', {
          position: 'top-right',
          duration: 5000,
        });
        
        setLoadedProperty(result.property);
        
        reset({
          ...result.property,
          coverFile: null,
          galleryFiles: [],
        });

        // Redirecionar após sucesso
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 2000);
      } else {
        toast.error(result.message || 'Erro ao atualizar imóvel', {
          position: 'top-right',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Failed to update property:', error);
      toast.error('Erro ao atualizar imóvel');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
          <p className="text-gray-600 text-lg">Carregando dados do imóvel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FormHeader 
        isDirty={isDirty} 
        isSubmitting={isSubmitting} 
        handleSubmit={handleSubmit(onSubmit)} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Navegação lateral */}
          <div className="lg:w-80 flex-shrink-0">
            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1 min-w-0">
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {activeTab === 'info' && <InfoTab register={register} />}
                {activeTab === 'local' && <LocationTab register={register} />}
                {activeTab === 'preco' && (
                  <PriceTab 
                    register={register} 
                    setValue={setValue}
                    watch={watch}
                  />
                )}
                {activeTab === 'detalhes' && (
                  <DetailsTab 
                    register={register} 
                    control={control}
                    fields={fields}
                    append={append}
                    remove={remove}
                  />
                )}
                {activeTab === 'midia' && <MediaTab property={loadedProperty} />}
                {activeTab === 'notas' && <NotesTab register={register} control={control} />}
              </form>
            </FormProvider>
          </div>
        </div>
      </main>
    </div>
  );
}