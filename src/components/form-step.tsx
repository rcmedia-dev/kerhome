import React, { useRef } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PropertyFormData } from "@/lib/types/property";
import { Textarea } from "./ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, Image, Video, FileText, X } from "lucide-react";

interface FormField {
  name: keyof PropertyFormData;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  accept?: string;
  multiple?: boolean;
  validation?: any;
}

interface FormStepProps {
  title: string;
  description: string;
  fields: FormField[];
}

// Componente customizado para upload de imagem única
const ImageUploadField = ({ field, error, value, onChange, onRemove }: {
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
        accept={field.accept || "image/*"}
        onChange={onChange}
        className="hidden"
      />
      
      {!value ? (
        <div
          onClick={handleClick}
          className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            error 
              ? "border-red-300 bg-red-50" 
              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          }`}
        >
          <Image className="w-12 h-12 text-gray-400 mb-4" />
          <span className="text-lg font-medium text-gray-700 mb-2">
            Upload de Imagem Principal
          </span>
          <span className="text-sm text-gray-500 text-center">
            Clique para selecionar uma imagem ou arraste e solte aqui
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
            <span className="font-medium text-gray-700">Imagem selecionada:</span>
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
                <Image className="w-10 h-10 text-blue-500" />
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

// Componente customizado para upload de galeria de imagens
const GalleryUploadField = ({ field, error, value, onChange, onRemove }: {
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
      // Criar um DataTransfer para simular um change event
      const dataTransfer = new DataTransfer();
      newFiles.forEach(file => dataTransfer.items.add(file));
      
      // Disparar o evento change manualmente
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
          className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            error 
              ? "border-red-300 bg-red-50" 
              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          }`}
        >
          <Image className="w-12 h-12 text-gray-400 mb-4" />
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
                  <Image className="w-8 h-8 text-blue-500" />
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

// Componente customizado para upload de vídeo
const VideoUploadField = ({ field, error, value, onChange, onRemove }: {
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
          className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            error 
              ? "border-red-300 bg-red-50" 
              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          }`}
        >
          <Video className="w-12 h-12 text-gray-400 mb-4" />
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
                <Video className="w-10 h-10 text-blue-500" />
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

// Componente customizado para upload de documentos
const DocumentUploadField = ({ field, error, value, onChange, onRemove }: {
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
      // Criar um DataTransfer para simular um change event
      const dataTransfer = new DataTransfer();
      newFiles.forEach(file => dataTransfer.items.add(file));
      
      // Disparar o evento change manualmente
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
        accept={field.accept || ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"}
        multiple={true}
        onChange={onChange}
        className="hidden"
      />
      
      {(!value || value.length === 0) ? (
        <div
          onClick={handleClick}
          className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            error 
              ? "border-red-300 bg-red-50" 
              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          }`}
        >
          <FileText className="w-12 h-12 text-gray-400 mb-4" />
          <span className="text-lg font-medium text-gray-700 mb-2">
            Upload de Documentos
          </span>
          <span className="text-sm text-gray-500 text-center">
            Clique para selecionar documentos ou arraste e solte aqui
          </span>
          <span className="text-xs text-gray-400 mt-2">
            Você pode selecionar vários documentos de uma vez
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
              {value.length} documento(s) selecionado(s)
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-1" /> Remover todos
            </Button>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {value.map((file: File, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-md border">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-blue-500" />
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
            <Upload className="h-4 w-4 mr-2" /> Adicionar mais documentos
          </Button>
        </div>
      )}
      
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

const FormStep = ({ title, description, fields }: FormStepProps) => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useFormContext<PropertyFormData>();

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof PropertyFormData,
    multiple: boolean = false
  ) => {
    const files = e.target.files;
    if (!files) return;

    if (multiple) {
      setValue(fieldName, Array.from(files) as any);
    } else {
      setValue(fieldName, files[0] as any);
    }
    
    // Disparar validação após selecionar arquivos
    setTimeout(() => trigger(fieldName), 100);
  };

  const removeFile = (fieldName: keyof PropertyFormData) => {
    setValue(fieldName, null as any);
    // Disparar validação após remover arquivos
    setTimeout(() => trigger(fieldName), 100);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600 mb-6">{description}</p>

      <div className="space-y-6">
        {fields.map((field) => {
          const error = errors[field.name]?.message as string;
          const value = watch(field.name);

          return (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>

              {field.type === "textarea" ? (
                <div>
                  <Textarea
                    id={field.name}
                    placeholder={field.placeholder}
                    rows={4}
                    {...register(field.name, field.validation)}
                    className={error ? "border-red-500" : ""}
                  />
                  {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>
              ) : field.type === "select" ? (
                <div>
                  <select
                    id={field.name}
                    {...register(field.name, field.validation)}
                    className={`w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400 ${
                      error ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">Selecione...</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>
              ) : field.type === "file" && field.name === "image" ? (
                <ImageUploadField
                  field={field}
                  error={error}
                  value={value}
                  onChange={(e) => handleFileChange(e, field.name, false)}
                  onRemove={() => removeFile(field.name)}
                />
              ) : field.type === "file" && field.name === "gallery" ? (
                <GalleryUploadField
                  field={field}
                  error={error}
                  value={value}
                  onChange={(e) => handleFileChange(e, field.name, true)}
                  onRemove={() => removeFile(field.name)}
                />
              ) : field.type === "file" && field.name === "video_url" ? (
                <VideoUploadField
                  field={field}
                  error={error}
                  value={value}
                  onChange={(e) => handleFileChange(e, field.name, false)}
                  onRemove={() => removeFile(field.name)}
                />
              ) : field.type === "file" && field.name === "documents" ? (
                <DocumentUploadField
                  field={field}
                  error={error}
                  value={value}
                  onChange={(e) => handleFileChange(e, field.name, true)}
                  onRemove={() => removeFile(field.name)}
                />
              ) : (
                <div>
                  <Input
                    id={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    step={field.type === "number" ? "any" : undefined}
                    {...register(field.name, {
                      valueAsNumber: field.type === "number",
                      ...field.validation,
                    })}
                    className={error ? "border-red-500" : ""}
                  />
                  {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FormStep;