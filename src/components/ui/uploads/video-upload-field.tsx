'use client';

import React, { useRef } from "react";
import { Video as VideoIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/lib/types/form-field";

export const VideoUploadField = ({ field, error, value, onChange, onRemove }: {
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

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={field.accept || "video/*"}
        onChange={onChange}
        className="hidden"
      />

      {!value ? (
        <div
          onClick={handleClick}
          className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 group ${error
            ? "border-red-300 bg-red-50"
            : "border-purple-200 bg-purple-50/50 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md"
            }`}
        >
          <div className="p-3 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
            <VideoIcon className="w-8 h-8 text-purple-500" />
          </div>
          <span className="text-lg font-medium text-gray-700 mb-2">
            Upload de Vídeo
          </span>
          <span className="text-sm text-gray-500 text-center">
            Clique para selecionar um vídeo ou arraste e solte aqui
          </span>
          {field.accept && (
            <span className="text-xs text-gray-400 mt-2">
              Formatos: {field.accept}
            </span>
          )}
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-gray-700">Vídeo selecionado:</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-1" /> Remover
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            {value instanceof File && (
              <>
                <VideoIcon className="w-10 h-10 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{value.name}</p>
                  <p className="text-xs text-gray-500">
                    {(value.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};
