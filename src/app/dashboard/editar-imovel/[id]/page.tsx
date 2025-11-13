'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller, useFormContext, FormProvider } from 'react-hook-form';
import { ArrowLeft, Save, Plus, Trash, Loader2, MapPin, Home, DollarSign, Image, FileText, Settings } from 'lucide-react';
import { getPropertyById } from '@/lib/functions/get-properties';
import { updateProperty, deleteGalleryImage } from '@/lib/functions/supabase-actions/update-propertie';
import { toast } from 'sonner';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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

const tiposPropriedade = ['Apartamento', 'Casa', 'Prédio', 'Vivenda'];
const statusOptions = ['arrendar', 'comprar'];
const caracteristicasOptions = [
  'Piscina', 'Academia', 'Garagem', 'Elevador', 'Portaria 24h', 
  'Churrasqueira', 'Salão de Festas', 'Quadra Esportiva', 'Varanda',
  'Jardim', 'Mobiliado', 'Ar Condicionado', 'Aquecimento', 'Cozinha Equipada'
];
const unidadesPreco = ['Kwanza', 'Dólar', 'Euro'];
const opcoesPrecoChamada = ['Preço Fixo', 'Preço Negociável', 'Sob Consulta'];

// Função para formatar o preço com separadores de milhar
const formatarPreco = (valor: string | number | null | undefined): string => {
  if (valor === null || valor === undefined || valor === '') return '';
  const valorString = typeof valor === 'number' ? valor.toString() : String(valor);
  const apenasNumeros = valorString.replace(/\D/g, '');
  if (apenasNumeros.length === 0) return '';
  return Number(apenasNumeros).toLocaleString('pt-BR');
};

interface MediaTabProps {
  property?: any;
}

function MediaTab({ property }: MediaTabProps) {
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
      // Atualizar o estado local
      const newGallery = galleryPreview.filter(img => img !== imageUrl);
      setGalleryPreview(newGallery);
      setValue('gallery', newGallery);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Mídia</h2>

      {/* Imagem de Capa */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Imagem de Capa</label>
        <Controller
          name="coverFile"
          control={control}
          render={({ field }) => (
            <div className="flex items-start gap-4">
              <div>
                {coverPreview ? (
                  <div className="relative w-40 h-32 rounded-lg overflow-hidden">
                    <img src={coverPreview} alt="pré-capa" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverPreview(null);
                        field.onChange(null);
                        setValue('image', null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-40 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <span className="text-gray-500">Sem imagem</span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <label className="inline-flex items-center px-4 py-2 font-medium text-white bg-purple-700 rounded-lg cursor-pointer hover:bg-purple-800">
                  <Image className="w-4 h-4 mr-2" />
                  Alterar Capa
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
                <p className="mt-2 text-sm text-gray-500">Recomendado: 800x600px</p>
              </div>
            </div>
          )}
        />
      </div>

      {/* Galeria */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Galeria de Imagens</label>
        <Controller
          name="galleryFiles"
          control={control}
          render={({ field }) => (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
                {galleryPreview.map((img, idx) => (
                  <div key={idx} className="relative w-full h-28 rounded-md overflow-hidden">
                    <img src={img} alt={`pré-${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        if (img.startsWith('blob:')) {
                          // Imagem nova - apenas remover do preview
                          const newPreview = galleryPreview.filter((_, i: number) => i !== idx);
                          setGalleryPreview(newPreview);
                          const newFiles = galleryFiles.filter((_: File, i: number) => i !== idx);
                          field.onChange(newFiles);
                        } else {
                          // Imagem existente - chamar API para deletar
                          handleDeleteExistingImage(img);
                        }
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <label className="inline-flex items-center px-4 py-2 font-medium text-gray-700 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Imagens
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

      {/* Vídeo URL */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">URL do Vídeo</label>
        <Controller
          name="video_url"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="https://youtube.com/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
            />
          )}
        />
      </div>
    </div>
  );
}

// Componente para a aba de Notas
const NotesTab = ({ register, control }: { register: any; control: any }) => {
  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Notas Internas</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Anotações privadas sobre a propriedade
          </label>
          <textarea
            {...register('nota_privada')}
            rows={8}
            placeholder="Adicione observações privadas, informações relevantes ou detalhes importantes sobre esta propriedade..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        
        <div className="flex items-center">
          <Controller
            name="is_featured"
            control={control}
            render={({ field }) => (
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={field.value || false}
                  onChange={field.onChange}
                  className="w-4 h-4 text-purple-700 border-gray-300 rounded focus:ring-purple-700"
                />
                <span className="text-sm text-gray-700">Destacar esta propriedade</span>
              </label>
            )}
          />
        </div>
      </div>
    </div>
  );
};

// Componente para o cabeçalho
const FormHeader = ({ isDirty, isSubmitting, handleSubmit }: { 
  isDirty: boolean; 
  isSubmitting: boolean; 
  handleSubmit: () => void; 
}) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl px-4 py-4 mx-auto sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Editar Propriedade</h1>
        </div>
        <button
          onClick={handleSubmit}
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
  );
};

// Componente para a navegação por abas
const TabNavigation = ({ activeTab, setActiveTab }: { 
  activeTab: string; 
  setActiveTab: (tab: string) => void; 
}) => {
  const tabs = [
    { id: 'info', label: 'Informações', icon: Home },
    { id: 'local', label: 'Localização', icon: MapPin },
    { id: 'preco', label: 'Preço', icon: DollarSign },
    { id: 'detalhes', label: 'Detalhes', icon: Settings },
    { id: 'midia', label: 'Mídia', icon: Image },
    { id: 'notas', label: 'Notas', icon: FileText }
  ];

  return (
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
  );
};

// Componente para informações básicas
const InfoTab = ({ register }: { register: any }) => {
  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Informações Básicas</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Título da Propriedade
          </label>
          <input
            {...register('title')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Descrição
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Tipo de Propriedade
            </label>
            <select
              {...register('tipo')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
            />
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Área do Terreno (m²)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('area_terreno')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
            />
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Garagens
            </label>
            <input
              type="number"
              {...register('garagens')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
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
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Localização</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Endereço Completo
          </label>
          <input
            {...register('endereco')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              País
            </label>
            <input
              {...register('pais')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Província
            </label>
            <input
              {...register('provincia')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Cidade
            </label>
            <input
              {...register('cidade')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Bairro
          </label>
          <input
            {...register('bairro')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
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
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Preço e Dimensões</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Preço
            </label>
            <input
              value={precoValue ? formatarPreco(precoValue) : ''}
              onChange={handlePrecoChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Unidade de Preço
            </label>
            <select
              {...register('unidade_preco')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
            >
              <option value="">Selecione</option>
              {unidadesPreco.map(unidade => (
                <option key={unidade} value={unidade}>{unidade}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Preço por Chamada
            </label>
            <select
              {...register('preco_chamada')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
            >
              <option value="">Selecione</option>
              {opcoesPrecoChamada.map(opcao => (
                <option key={opcao} value={opcao}>{opcao}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Quartos
            </label>
            <input
              type="number"
              {...register('bedrooms')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Banheiros
            </label>
            <input
              type="number"
              {...register('bathrooms')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Área (m²)
            </label>
            <input
              {...register('size')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Tamanho da Garagem
            </label>
            <input
              {...register('garagem_tamanho')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para detalhes
const DetailsTab = ({ register, fields, append, remove }: { 
  register: any; 
  control: any;
  fields: any[];
  append: any;
  remove: any;
}) => {
  return (
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
                className="w-4 h-4 text-purple-700 border-gray-300 rounded focus:ring-purple-700"
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
            className="flex items-center px-3 py-1 text-sm text-white bg-orange-500 rounded-lg hover:bg-orange-600"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 text-sm font-medium text-gray-700">Valor</label>
                <input
                  {...register(`detalhes_adicionais.${index}.valor` as const)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
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
  );
};

export default function PropertyEditForm() {
  const params = useParams();
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
      nota_privada: ''
    }
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { isDirty }
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
              console.warn('Nao foi possivel parse detalhes_adicionais', err);
            }
          }

          let caracteristicas: string[] = [];

          if (property.caracteristicas) {
            try {
              if (typeof property.caracteristicas === 'string') {
                // Primeiro tenta JSON.parse
                caracteristicas = JSON.parse(property.caracteristicas) as string[];
              } else if (Array.isArray(property.caracteristicas)) {
                caracteristicas = property.caracteristicas;
              }
            } catch (err) {
              console.warn('Nao foi possivel parse caracteristicas', err);
              // Fallback: split (force cast para string)
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
            pais: property.pais ?? '',
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
        }
      } catch (error) {
        console.error('Erro ao carregar propriedade:', error);
        toast.error('Erro ao carregar dados da propriedade');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadProperty();
    }
  }, [id, reset]);

  const onSubmit = async (data: PropertyData) => {
    setIsSubmitting(true);
    try {
      const result = await updateProperty(id, data);

      if (result.success) {
        toast.success('Propriedade atualizada com sucesso!', {
          position: 'top-right',
          duration: 5000,
        });
        
        // Atualizar o estado com os dados retornados
        setLoadedProperty(result.property);
        
        reset({
          ...result.property,
          coverFile: null,
          galleryFiles: [],
        });
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 text-purple-700 animate-spin" />
          <p className="text-gray-600">Carregando dados da propriedade...</p>
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

      <main className="max-w-7xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="flex-1">
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