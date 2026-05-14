'use client';

import React, { useRef } from "react";
import { Image as ImageIcon, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/lib/types/form-field";

export const GalleryUploadField = ({ field, error, value, onChange, onRemove }: {
  field: FormField;
  error: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeSingleFile = (index: number) => {
    if (Array.isArray(value)) {
      const newFiles = [...value];
      newFiles.splice(index, 1);
      const dataTransfer = new DataTransfer();
      newFiles.forEach(file => dataTransfer.items.add(file));

      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        const event = new Event('change', { bubbles: true });
        fileInputRef.current.dispatchEvent(event);
      }
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={field.accept || "image/*"}
        multiple={true}
        onChange={onChange}
        className="hidden"
      />

      {(!value || value.length === 0) ? (
        <div
          onClick={handleClick}
          className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 group ${error
            ? "border-red-300 bg-red-50"
            : "border-purple-200 bg-purple-50/50 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md"
            }`}
        >
          <div className="p-3 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
            <ImageIcon className="w-8 h-8 text-purple-500" />
          </div>
          <span className="text-lg font-medium text-gray-700 mb-2">
            Upload de Galeria de Imagens
          </span>
          <span className="text-sm text-gray-500 text-center">
            Clique para selecionar múltiplas imagens ou arraste e solte aqui
          </span>
          <span className="text-xs text-gray-400 mt-2">
            Você pode selecionar várias imagens de uma vez
          </span>
          {field.accept && (
            <span className="text-xs text-gray-400 mt-1">
              Formatos: {field.accept}
            </span>
          )}
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-gray-700">
              {value.length} imagem(ns) selecionada(s)
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-1" /> Remover todas
            </Button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {value.map((file: File, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-md border">
                <div className="flex items-center space-x-3">
                  <ImageIcon className="w-8 h-8 text-blue-500" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate max-w-xs">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSingleFile(index)}
                  className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            className="mt-3 w-full"
          >
            <Upload className="h-4 w-4 mr-2" /> Adicionar mais imagens
          </Button>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};
