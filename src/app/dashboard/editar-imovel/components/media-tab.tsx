'use client';

import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Image, Trash, Plus } from 'lucide-react';
import { deleteGalleryImage } from '@/lib/functions/supabase-actions/update-propertie';
import { toast } from 'sonner';

interface MediaTabProps {
  property?: Record<string, any>;
}

export function MediaTab({ property }: MediaTabProps) {
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
                          const newPreview = galleryPreview.filter((_, i) => i !== idx);
                          setGalleryPreview(newPreview);
                          const newFiles = galleryFiles.filter((_: File, i: number) => i !== idx);
                          field.onChange(newFiles);
                        } else {
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
