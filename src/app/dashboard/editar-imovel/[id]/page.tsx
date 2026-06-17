'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller, useFormContext, FormProvider } from 'react-hook-form';
import { ArrowLeft, Save, Plus, Trash, Loader2, MapPin, Home, DollarSign, Image, FileText, Settings } from 'lucide-react';
import { getPropertyById } from '@/lib/functions/get-properties';
import { updateProperty, deleteGalleryImage } from '@/lib/functions/supabase-actions/update-propertie';
import { toast } from 'sonner';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { propertySchema, PropertyDataSchema } from '../components/schema';

import { MediaTab } from '../components/media-tab';
import { NotesTab } from '../components/notes-tab';
import { InfoTab } from '../components/info-tab';
import { LocationTab } from '../components/location-tab';
import { PriceTab } from '../components/price-tab';
import { DetailsTab } from '../components/details-tab';
import { FormHeader, TabNavigation } from '../components/form-header-navigation';

export default function PropertyEditForm() {
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedProperty, setLoadedProperty] = useState<any>(null);

  const methods = useForm<PropertyDataSchema>({
    resolver: zodResolver(propertySchema as any),
    defaultValues: {
      detalhes_adicionais: [] as { titulo: string; valor: string }[],
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
            size: property.size ? Number(String(property.size).replace(/\D/g, '')) : null,
            endereco: property.endereco ?? '',
            cidade: property.cidade ?? '',
            bairro: property.bairro ?? '',
            ano_construcao: property.anoconstrucao ?? null,
            area_terreno: property.area_terreno ?? null,
            garagens: property.garagens ?? null,
            garagem_tamanho: property.garagemtamanho ? Number(String(property.garagemtamanho).replace(/\D/g, '')) : null,
            pais: property.pais ?? '',
            provincia: property.provincia ?? '',
            rotulo: property.rotulo ?? '', 
            preco_chamada: property.preco_chamada ? Number(String(property.preco_chamada).replace(/\D/g, '')) : null,
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

  const onSubmit = async (data: PropertyDataSchema) => {
    setIsSubmitting(true);
    try {
      const result = await updateProperty(id, data as any);

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
                {activeTab === 'notas' && <NotesTab register={register} />}
              </form>
            </FormProvider>
          </div>
        </div>
      </main>
    </div>
  );
}