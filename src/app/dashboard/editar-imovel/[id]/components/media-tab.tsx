'use client';

import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Image, Trash } from 'lucide-react';
import { deleteGalleryImage } from '@/lib/functions/supabase-actions/update-propertie';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils/formatting';

interface MediaTabProps {
  property?: {
    id: string;
    image?: string | null;
    gallery?: string[] | null;
  };
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imagem de Capa
        </label>
        <Controller
          name="coverFile"
          control={control}
          render={({ field }) => (
            <div className="flex items-start gap-4">
              <div>
                {coverPreview ? (
                  <div className="relative w-40 h-32 rounded-lg overflow-hidden">
                    <img
                      src={coverPreview}
                      alt="pré-capa"
                      className="w-full h-full object-cover"
                    />
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
                <p className="mt-2 text-sm text-gray-500">
                  Recomendado: 800x600px
                </p>
              </div>
            </div>
          )}
        />
      </div>

      {/* Galeria de Imagens */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Galeria
        </label>
        <Controller
          name="galleryFiles"
          control={control}
          render={({ field }) => (
            <div>
              <label className="inline-flex items-center px-4 py-2 font-medium text-white bg-purple-700 rounded-lg cursor-pointer hover:bg-purple-800">
                <Image className="w-4 h-4 mr-2" />
                Adicionar Imagens
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    field.onChange(files);
                  }}
                  className="hidden"
                />
              </label>

              {/* Preview Galeria */}
              {(galleryPreview.length > 0 || galleryFiles.length > 0) && (
                <div className="mt-4 grid grid-cols-4 gap-4">
                  {galleryPreview.map((img) => (
                    <div
                      key={img}
                      className="relative w-24 h-24 rounded-lg overflow-hidden"
                    >
                      <img
                        src={img}
                        alt="galeria"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteExistingImage(img)
                        }
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        <Trash className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {galleryFiles.map((file: File, index: number) => (
                    <div
                      key={index}
                      className="relative w-24 h-24 rounded-lg overflow-hidden"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`novo-${index}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        />
      </div>
    </div>
  );
}
