import React, { useRef } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PropertyFormData } from "@/lib/types/property";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, Image, Video, FileText, X, Loader2, Home, Building2, Trees, Store, MoreHorizontal, Tag, Key, Check, Handshake, Lock, HelpCircle, Waves, Car, Wind, Wifi, ShieldCheck, Plus, ArrowLeft, ArrowRight } from "lucide-react";
import imageCompression from "browser-image-compression";
import { motion, AnimatePresence } from "framer-motion";

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
  question?: string;
  isStepComplete?: boolean;
}

interface FormStepProps {
  title: string;
  description: string;
  fields: FormField[];
  maxVisibleFields?: number;
  showQuestions?: boolean;
  onStepComplete?: () => void;
  nextLabel?: string;
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
          className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${error
            ? "border-red-300 bg-red-50"
            : "border-purple-200 bg-purple-50/50 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md"
            }`}
        >
          <div className="p-3 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
            <Image className="w-8 h-8 text-purple-500" />
          </div>
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
          className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 group ${error
            ? "border-red-300 bg-red-50"
            : "border-purple-200 bg-purple-50/50 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md"
            }`}
        >
          <div className="p-3 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
            <Image className="w-8 h-8 text-purple-500" />
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
          className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 group ${error
            ? "border-red-300 bg-red-50"
            : "border-purple-200 bg-purple-50/50 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md"
            }`}
        >
          <div className="p-3 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
            <Video className="w-8 h-8 text-purple-500" />
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
          className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 group ${error
            ? "border-red-300 bg-red-50"
            : "border-purple-200 bg-purple-50/50 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md"
            }`}
        >
          <div className="p-3 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
            <FileText className="w-8 h-8 text-purple-500" />
          </div>
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

interface VisualSelectorProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

const VisualSelector = ({ field, value, onChange, error }: VisualSelectorProps) => {
  const getIcon = (val: string) => {
    switch (val) {
      case "casa": return <Home size={20} />;
      case "apartamento": return <Building2 size={20} />;
      case "terreno": return <Trees size={20} />;
      case "comercial": return <Store size={20} />;
      case "Outro": return <MoreHorizontal size={20} />;
      case "comprar": return <Tag size={20} />;
      case "arrendar": return <Key size={20} />;
      case "kwanza": return <span className="font-bold text-sm">Kz</span>;
      case "dolar": return <span className="font-bold text-sm">$</span>;
      case "euro": return <span className="font-bold text-sm">€</span>;
      case "Preço sob consulta": return <HelpCircle size={20} />;
      case "Preço Negociavel": return <Handshake size={20} />;
      case "Valor Fixo": return <Lock size={20} />;
      default: return null;
    }
  };

  const isStatusField = field.name === "status" || field.name === "unidade_preco" || field.name === "rotulo";

  return (
    <div className="w-full">
      <div className={`grid gap-3 ${isStatusField ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
        {field.options?.map((option) => {
          const isSelected = value === option.value;
          return (
            <motion.button
              key={option.value}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(option.value)}
              className={`relative flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${
                isSelected
                  ? "border-purple-600 bg-purple-50/50 text-purple-700 shadow-lg shadow-purple-500/10"
                  : "border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50"
              } ${error ? "border-red-100" : ""}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                isSelected ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
              }`}>
                {getIcon(option.value)}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? "text-purple-700" : "text-gray-500"}`}>
                {option.label}
              </span>
              
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center shadow-sm"
                >
                  <Check size={12} className="text-white" strokeWidth={3} />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};


const AmenitiesSelector = ({ value, onChange }: { value: string | string[] | undefined; onChange: (val: string) => void }) => {
  const commonAmenities = [
    { id: "Piscina", label: "Piscina", icon: <Waves size={16} /> },
    { id: "Garagem", label: "Garagem", icon: <Car size={16} /> },
    { id: "Jardim", label: "Jardim", icon: <Trees size={16} /> },
    { id: "Climatização", label: "Climatização", icon: <Wind size={16} /> },
    { id: "Wifi", label: "Wifi", icon: <Wifi size={16} /> },
    { id: "Segurança 24h", label: "Segurança", icon: <ShieldCheck size={16} /> },
  ];

  const currentItems = React.useMemo(() => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(String).map(i => i.trim());
    if (typeof value === 'string') return value.split(",").map(i => i.trim());
    return [];
  }, [value]);

  const toggleAmenity = (id: string) => {
    let newItems;
    if (currentItems.includes(id)) {
      newItems = currentItems.filter(i => i !== id);
    } else {
      newItems = [...currentItems, id];
    }
    onChange(newItems.filter(Boolean).join(", "));
  };

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {commonAmenities.map((amenity) => {
        const isSelected = currentItems.includes(amenity.id);
        return (
          <button
            key={amenity.id}
            type="button"
            onClick={() => toggleAmenity(amenity.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold transition-all ${
              isSelected
                ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-500/20"
                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {amenity.icon}
            {amenity.label}
            {isSelected && <Check size={12} className="ml-1" />}
          </button>
        );
      })}
      
      {/* Input de texto discreto para itens extras */}
      <div className="w-full mt-3">
        <Input 
          placeholder="Adicione outras comodidades (ex: churrasqueira, ginásio...)"
          value={typeof value === 'string' ? value : Array.isArray(value) ? (value as string[]).join(", ") : ""}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 text-xs border-gray-100 bg-gray-50/50 focus:bg-white rounded-lg"
        />
      </div>
    </div>
  );
};

const FormStep = ({ title, description, fields, maxVisibleFields, showQuestions, onStepComplete, nextLabel }: FormStepProps) => {
  const [internalActiveIndex, setInternalActiveIndex] = React.useState(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  
  const {
    register,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useFormContext<PropertyFormData>();

  // Remoção do useEffect para garantir que a transição seja 100% manual via botão

  const visibleFields = showQuestions && maxVisibleFields !== undefined
    ? fields.slice(0, Math.max(maxVisibleFields, internalActiveIndex + 1))
    : fields;

  const currentField = showQuestions ? visibleFields[internalActiveIndex] : null;

  const goBack = () => setInternalActiveIndex(prev => Math.max(0, prev - 1));
  const goNext = async () => {
    if (!currentField) return;
    const isValid = await trigger(currentField.name);
    if (isValid) {
      if (internalActiveIndex < visibleFields.length - 1) {
        setInternalActiveIndex(prev => prev + 1);
      }
    }
  };

  const isLastQuestion = internalActiveIndex === fields.length - 1;

  const [isCompressing, setIsCompressing] = React.useState(false);

  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error("Erro na compressão:", error);
      return file;
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof PropertyFormData,
    multiple: boolean = false
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    try {
      if (multiple) {
        const compressedFiles = await Promise.all(
          Array.from(files).map(async (file) => {
            if (file.type.startsWith("image/")) {
              return await compressImage(file);
            }
            return file;
          })
        );
        setValue(fieldName, compressedFiles as any);
      } else {
        const file = files[0];
        if (file.type.startsWith("image/")) {
          const compressed = await compressImage(file);
          setValue(fieldName, compressed as any, { shouldValidate: true });
        } else {
          setValue(fieldName, file as any, { shouldValidate: true });
        }
      }
    } finally {
      setIsCompressing(false);
      setTimeout(() => trigger(fieldName), 100);
    }
  };

  const removeFile = (fieldName: keyof PropertyFormData) => {
    setValue(fieldName, null as any);
    setTimeout(() => trigger(fieldName), 100);
  };

  return (
    <div>
      {!showQuestions && (
        <>
          <h2 className="text-xl font-bold bg-linear-to-r from-purple-700 to-orange-500 bg-clip-text text-transparent mb-2">{title}</h2>
          <p className="text-gray-600 mb-6">{description}</p>
        </>
      )}

      <div className="relative min-h-[400px]" ref={scrollRef}>
        {isCompressing && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-xl border border-purple-100 shadow-sm">
            <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-2xl shadow-xl border border-purple-50">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700">Otimizando imagens...</p>
                <p className="text-xs text-gray-500">Isto reduz o tempo de upload</p>
              </div>
            </div>
          </div>
        )}

        {showQuestions && maxVisibleFields !== undefined ? (
          <div className="space-y-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-purple-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${((internalActiveIndex + 1) / visibleFields.length) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">
                Pergunta {internalActiveIndex + 1} de {visibleFields.length}
              </span>
            </div>

            <AnimatePresence mode="wait">
              {currentField && (
                <motion.div
                  key={currentField.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-6"
                >
                  <div className="space-y-4 p-8 rounded-[2.5rem] bg-white border border-purple-100/50 shadow-[0_32px_64px_-16px_rgba(124,58,237,0.08)] ring-1 ring-purple-600/5">
                    <p className="text-xl font-bold text-gray-900 leading-tight">
                      {currentField.question}
                    </p>

                    <div className="pt-2">
                      {renderFieldContent(currentField)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-4">
                    <button
                      type="button"
                      onClick={goBack}
                      disabled={internalActiveIndex === 0}
                      className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
                        internalActiveIndex === 0 
                          ? "opacity-0 pointer-events-none" 
                          : "text-gray-400 hover:text-purple-600 hover:bg-purple-50"
                      }`}
                    >
                      <ArrowLeft size={18} />
                      Anterior
                    </button>

                    {internalActiveIndex < visibleFields.length - 1 ? (
                      <button
                        type="button"
                        onClick={goNext}
                        className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-purple-600 text-white text-sm font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 hover:-translate-y-0.5 transition-all"
                      >
                        Próxima
                        <ArrowRight size={18} />
                      </button>
                    ) : onStepComplete && (
                      <button
                        type="button"
                        onClick={onStepComplete}
                        className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-purple-600 text-white text-sm font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 hover:-translate-y-0.5 transition-all animate-in fade-in slide-in-from-bottom-2 duration-500"
                      >
                        <Check size={18} />
                        {nextLabel || 'Prosseguir'}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-6">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name} className="text-gray-700 font-semibold">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {renderFieldContent(field)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  function renderFieldContent(field: FormField) {
    const error = errors[field.name]?.message as string;
    const value = watch(field.name);

    if (field.type === "textarea") {
      return (
        <div>
          <Textarea
            id={field.name}
            placeholder={field.placeholder}
            rows={4}
            {...register(field.name, field.validation)}
            className={`resize-none border-gray-200 focus:border-purple-500 focus:ring-purple-200 rounded-xl transition-all ${error ? "border-red-500 focus:ring-red-200" : ""}`}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
      );
    }

    if (field.type === "select") {
      return (
        <div>
          {(field.name === "tipo" || field.name === "status" || field.name === "unidade_preco" || field.name === "rotulo") ? (
            <VisualSelector 
              field={field} 
              value={value} 
              onChange={(val) => {
                setValue(field.name, val);
                trigger(field.name);
              }}
              error={error}
            />
          ) : (
            <select
              id={field.name}
              {...register(field.name, field.validation)}
              className={`w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all ${error ? "border-red-500" : ""}`}
            >
              <option value="">Selecione...</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      );
    }

    if (field.name === "caracteristicas") {
      return (
        <div>
          <AmenitiesSelector 
            value={(value as any) || ""} 
            onChange={(val) => {
              setValue(field.name, val);
              trigger(field.name);
            }} 
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
      );
    }

    if (field.type === "file") {
      if (field.name === "image") return <ImageUploadField field={field} error={error} value={value} onChange={(e) => handleFileChange(e, field.name, false)} onRemove={() => removeFile(field.name)} />;
      if (field.name === "gallery") return <GalleryUploadField field={field} error={error} value={value} onChange={(e) => handleFileChange(e, field.name, true)} onRemove={() => removeFile(field.name)} />;
      if (field.name === "video_url") return <VideoUploadField field={field} error={error} value={value} onChange={(e) => handleFileChange(e, field.name, false)} onRemove={() => removeFile(field.name)} />;
      if (field.name === "documents") return <DocumentUploadField field={field} error={error} value={value} onChange={(e) => handleFileChange(e, field.name, true)} onRemove={() => removeFile(field.name)} />;
    }

    return (
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
          className={`border-gray-200 focus:border-purple-500 focus:ring-purple-200 rounded-xl transition-all ${error ? "border-red-500 focus:ring-red-200" : ""}`}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
};

export default FormStep;
