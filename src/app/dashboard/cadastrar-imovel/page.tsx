'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import { useFormStatus } from 'react-dom';
import { 
  Loader2, Plus, Trash, Home, MapPin, DollarSign, 
  Settings, Camera, FileText, StickyNote, ChevronDown,
  Upload, X, Eye
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { createProperty } from '@/lib/actions/supabase-actions/create-propertie-action';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-context';
import { TPropriedadeFormData } from '@/lib/types/property';
import { useEffect, useState, useMemo } from 'react';

// Componente para inputs de arquivo moderno
const ModernFileInput = ({ 
  register, 
  name, 
  label, 
  required = false, 
  accept, 
  multiple = false,
  maxSizeMB = 10,
  maxFiles = 5,
  errors,
  icon: Icon = Upload
}: any) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews].slice(0, maxFiles));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews].slice(0, maxFiles));
      
      // Create a fake event to trigger react-hook-form registration
      const input = document.querySelector(`input[name="${name}"]`) as HTMLInputElement;
      if (input) {
        const dataTransfer = new DataTransfer();
        files.forEach(file => dataTransfer.items.add(file));
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  const removePreview = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <Icon className="w-4 h-4" />
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      
      <div 
        className={`relative border-2 border-dashed rounded-xl p-6 transition-colors ${
          isDragging 
            ? 'border-indigo-400 bg-indigo-50' 
            : 'border-slate-300 hover:border-indigo-300 hover:bg-slate-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          name={name}
          accept={accept}
          multiple={multiple}
          {...register(name, { 
            required: required && `${label} é obrigatório`,
            validate: {
              lessThanMaxSize: (files: FileList) => {
                if (!files || files.length === 0) return !required || `${label} é obrigatório`;
                return Array.from(files).every(file => file.size <= maxSizeMB * 1024 * 1024) ||
                  `Cada arquivo deve ter menos de ${maxSizeMB}MB`;
              },
              maxFiles: (files: FileList) => {
                if (!files) return true;
                return files.length <= maxFiles ||
                  `Máximo de ${maxFiles} arquivos permitidos`;
              }
            },
            onChange: handleFileChange
          })}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="text-center">
          <Icon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600">
            Arraste arquivos aqui ou <span className="text-indigo-600 font-medium">clique para selecionar</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Máximo {maxSizeMB}MB por arquivo • {maxFiles} arquivos máximo
          </p>
        </div>
      </div>

      {errors[name] && (
        <p className="text-red-500 text-xs flex items-center gap-1">
          <X className="w-3 h-3" />
          {errors[name].message}
        </p>
      )}

      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {previews.map((preview, i) => (
            <div key={i} className="relative group">
              <img 
                src={preview} 
                alt={`Preview ${i + 1}`} 
                className="w-full h-20 object-cover rounded-lg border border-slate-200"
              />
              <button
                type="button"
                onClick={() => removePreview(i)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Componente para seções expansíveis
const FormSection = ({ 
  title, 
  icon: Icon, 
  children, 
  isExpanded = true, 
  onToggle 
}: any) => {
  const [expanded, setExpanded] = useState(isExpanded);

  const handleToggle = () => {
    const newState = !expanded;
    setExpanded(newState);
    onToggle?.(newState);
  };

  return (
    <Card className="shadow-sm border border-slate-200 overflow-hidden">
      <button
        type="button"
        onClick={handleToggle}
        className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white hover:from-slate-100 hover:to-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Icon className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      
      {expanded && (
        <CardContent className="p-6 border-t border-slate-100">
          {children}
        </CardContent>
      )}
    </Card>
  );
};

// Input moderno reutilizável
const ModernInput = ({ 
  label, 
  required = false, 
  error, 
  icon: Icon, 
  className = "", 
  ...props 
}: any) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
      {Icon && <Icon className="w-4 h-4" />}
      {label}{required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <input
        className={`w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors ${className} ${
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''
        }`}
        {...props}
      />
    </div>
    {error && (
      <p className="text-red-500 text-xs flex items-center gap-1">
        <X className="w-3 h-3" />
        {error.message}
      </p>
    )}
  </div>
);

// Select moderno
const ModernSelect = ({ 
  label, 
  required = false, 
  error, 
  icon: Icon, 
  children,
  className = "",
  ...props 
}: any) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
      {Icon && <Icon className="w-4 h-4" />}
      {label}{required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        className={`w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors appearance-none ${className} ${
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''
        }`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
    {error && (
      <p className="text-red-500 text-xs flex items-center gap-1">
        <X className="w-3 h-3" />
        {error.message}
      </p>
    )}
  </div>
);

// Campo de detalhes modernizado
const ModernDetailField = ({ register, index, remove, errors }: any) => (
  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="font-medium text-slate-700">Detalhe #{index + 1}</h4>
      <button
        type="button"
        onClick={() => remove(index)}
        className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-colors"
      >
        <Trash className="w-4 h-4" />
      </button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ModernInput
        label="Título"
        {...register(`detalhes.${index}.titulo`)}
        error={errors.detalhes?.[index]?.titulo}
      />
      <ModernInput
        label="Valor"
        {...register(`detalhes.${index}.valor`)}
        error={errors.detalhes?.[index]?.valor}
      />
    </div>
  </div>
);

// Botão de envio
function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  const { pending } = useFormStatus();
  const isLoading = isSubmitting || pending;
  
  return (
    <Card className="shadow-lg border-0">
      <CardContent className="p-4">
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full px-6 py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 text-lg transition-all transform ${
            isLoading 
              ? 'bg-slate-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-[1.02] shadow-lg hover:shadow-xl'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Cadastrando...
            </>
          ) : (
            <>
              <Home className="w-5 h-5" />
              Cadastrar Imóvel
            </>
          )}
        </button>
        
        {!isLoading && (
          <p className="text-center text-slate-500 text-sm mt-2">
            Revise todas as informações antes de enviar
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function CadastrarImovelPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState('');

  // Listas de opções
  const caracteristicasList = useMemo(() => [
    'Ar Condicionado', 'Aquecimento Central', 'Fogão Elétrico', 'Alarme de Incêndio',
    'Academia', 'Home Theater', 'Lavanderia', 'Lavanderia Separada', 'Pisos de Mármore',
    'Micro-ondas', 'Geladeira', 'Sauna', 'Piscina', 'TV a Cabo', 'Máquina de Lavar', 'WiFi'
  ], []);

  const paises = useMemo(() => [
    'Angola', 'Brasil', 'Portugal', 'Estados Unidos', 'Espanha', 'Outro'
  ], []);

  const provinciasAngola = useMemo(() => [
    'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango', 'Cuanza Norte',
    'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Luanda', 'Lunda Norte',
    'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire'
  ], []);

  const cidadesAngola = useMemo(() => [
    'Luanda', 'Lubango', 'Benguela', 'Malanje', 'Soyo', 'Sumbe', 'Ndalatando',
    'Uíge', 'Cabinda', 'Menongue', 'Ondjiva', 'Outra'
  ], []);

  const tiposPropriedade = useMemo(() => [
    'Apartamento', 'Casa', 'Terreno', 'Comercial', 'Prédio', 'Fazenda', 'Outro'
  ], []);

  const { 
    register, 
    control, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue
  } = useForm<TPropriedadeFormData>({
    defaultValues: {
      caracteristicas: [],
      detalhes: [{ titulo: '', valor: '' }],
      estatus_da_propriedade: 'para alugar',
      rotulo_da_propriedade: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "detalhes"
  });

  const onSubmit = async (data: any) => {
    try {
      const formData = new FormData();
      formData.append('owner_id', user?.id || '');
      
      // Adicionar campos ao FormData
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'detalhes') {
          (value as Array<{ titulo: string; valor: string }>).forEach((detail, index) => {
            formData.append(`detalhes.${index}.titulo`, detail.titulo);
            formData.append(`detalhes.${index}.valor`, detail.valor);
          });
        } else if (key === 'caracteristicas') {
          (value as string[]).forEach((item: string) => {
            formData.append('caracteristicas', item);
          });
        } else if (value !== null && value !== undefined) {
          formData.append(key, value as any);
        }
      });

      // Adicionar arquivos
      const fileInputs = ['imagens_da_propriedade', 'documentos_da_propriedade', 'video_da_propriedade'];
      fileInputs.forEach(name => {
        const input = document.querySelector(`input[name="${name}"]`) as HTMLInputElement;
        if (input?.files) {
          Array.from(input.files).forEach(file => {
            formData.append(name, file);
          });
        }
      });

      const result = await createProperty(formData);
      
      if (result?.success) {
        toast.success('Imóvel cadastrado com sucesso!');
        reset();
        router.push('/dashboard');
        router.refresh();
      } else {
        toast.error(result?.message || 'Erro ao cadastrar imóvel');
      }
    } catch (error) {
      toast.error('Erro ao cadastrar imóvel');
      console.error('Submission error:', error);
    }
  };

  // Observar mudanças no país selecionado
  const watchCountry = watch('pais_da_propriedade');
  useEffect(() => {
    setSelectedCountry(watchCountry || '');
    
    // Resetar província e cidade quando o país mudar
    if (watchCountry) {
      setValue('provincia_da_propriedade', '');
      setValue('cidade_da_propriedade', '');
    }
  }, [watchCountry, setValue]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
            <Home className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Cadastrar Novo Imóvel</h1>
          <p className="text-slate-600">Preencha os dados para adicionar sua propriedade</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Informações Básicas */}
          <FormSection title="Informações Básicas" icon={Home}>
            <div className="space-y-6">
              <ModernInput
                label="Título da Propriedade"
                required
                placeholder="Ex: Casa moderna com 3 quartos em Luanda"
                {...register("titulo_da_propriedade", { 
                  required: "Título é obrigatório",
                  minLength: { value: 5, message: "Mínimo 5 caracteres" }
                })}
                error={errors.titulo_da_propriedade}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Descrição <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register("descricao_da_propriedade", { 
                    required: "Descrição é obrigatória",
                    minLength: { value: 20, message: "Mínimo 20 caracteres" }
                  })}
                  className={`w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors resize-none ${
                    errors.descricao_da_propriedade ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''
                  }`}
                  rows={4}
                  placeholder="Descreva as características e diferenciais da propriedade..."
                />
                {errors.descricao_da_propriedade && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.descricao_da_propriedade.message}
                  </p>
                )}
              </div>
            </div>
          </FormSection>

          {/* Localização */}
          <FormSection title="Localização" icon={MapPin}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <ModernInput
                  label="Endereço"
                  required
                  placeholder="Ex: Largo do Kinaxixi, Primeira Conservatoria do Registro Civil"
                  {...register("endereco_da_propriedade", { required: "Endereço é obrigatório" })}
                  error={errors.endereco_da_propriedade}
                />
              </div>

              <ModernSelect
                label="País"
                required
                {...register("pais_da_propriedade", { 
                  required: "País é obrigatório"
                })}
                error={errors.pais_da_propriedade}
              >
                <option value="">Selecione o país</option>
                {paises.map(pais => (
                  <option key={pais} value={pais}>{pais}</option>
                ))}
              </ModernSelect>

              <ModernSelect
                label="Província"
                required
                disabled={!selectedCountry}
                {...register("provincia_da_propriedade", { required: "Província é obrigatória" })}
                error={errors.provincia_da_propriedade}
              >
                <option value="">Selecione a província</option>
                {selectedCountry === 'Angola' && provinciasAngola.map(provincia => (
                  <option key={provincia} value={provincia}>{provincia}</option>
                ))}
                {selectedCountry && selectedCountry !== 'Angola' && (
                  <option value="Outra">Outra</option>
                )}
              </ModernSelect>

              <ModernSelect
                label="Cidade"
                required
                disabled={!selectedCountry}
                {...register("cidade_da_propriedade", { required: "Cidade é obrigatória" })}
                error={errors.cidade_da_propriedade}
              >
                <option value="">Selecione a cidade</option>
                {selectedCountry === 'Angola' ? (
                  cidadesAngola.map(cidade => (
                    <option key={cidade} value={cidade}>{cidade}</option>
                  ))
                ) : (
                  <option value="Outra">Outra</option>
                )}
              </ModernSelect>
            </div>
          </FormSection>

          {/* Tipo e Status */}
          <FormSection title="Tipo e Status" icon={Settings}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ModernSelect
                label="Tipo da Propriedade"
                required
                {...register("tipo_da_propriedade", { required: "Tipo é obrigatório" })}
                error={errors.tipo_da_propriedade}
              >
                <option value="">Selecione o tipo</option>
                {tiposPropriedade.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </ModernSelect>

              <ModernSelect
                label="Status"
                required
                {...register("estatus_da_propriedade", { required: "Status é obrigatório" })}
              >
                <option value="para alugar">Para Alugar</option>
                <option value="para comprar">Para Vender</option>
              </ModernSelect>

              <ModernSelect
                label="Rótulo"
                {...register("rotulo_da_propriedade")}
              >
                <option value="">Nenhum</option>
                <option value="Promoção">Promoção</option>
                <option value="Destaque">Destaque</option>
                <option value="Novo">Novo</option>
              </ModernSelect>
            </div>
          </FormSection>

          {/* Preço */}
          <FormSection title="Preço" icon={DollarSign}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ModernInput
                label="Preço"
                required
                type="number"
                placeholder="0"
                {...register("preco_da_propriedade", { 
                  required: "Preço é obrigatório",
                  min: { value: 1, message: "Preço inválido" }
                })}
                error={errors.preco_da_propriedade}
              />

               <ModernSelect
                  label="Unidade de Preço"
                  required
                  {...register("unidade_preco_da_propriedade", { required: "Selecione a moeda" })}
                  error={errors.unidade_preco_da_propriedade}
                >
                  <option value="">Selecione...</option>
                  <option value="kwanza">Kwanza</option>
                  <option value="dolar">Dólar</option>
                </ModernSelect>
            </div>
          </FormSection>


          {/* Características */}
          <FormSection title="Características" icon={Settings}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {caracteristicasList.map(caracteristica => (
                <label key={caracteristica} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-indigo-300 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    value={caracteristica}
                    {...register("caracteristicas")}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200"
                  />
                  <span className="text-sm text-slate-700">{caracteristica}</span>
                </label>
              ))}
            </div>
          </FormSection>

          {/* Detalhes Técnicos */}
          <FormSection title="Detalhes Técnicos" icon={Settings}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ModernInput
                label="Tamanho (m²)"
                type="number"
                placeholder="0"
                {...register("tamanho_da_propriedade", { min: 0 })}
              />

              <ModernInput
                label="Área do Terreno (m²)"
                type="number"
                placeholder="0"
                {...register("area_terreno_da_propriedade", { min: 0 })}
              />

              <ModernInput
                label="Quartos"
                type="number"
                placeholder="0"
                {...register("quartos_da_propriedade", { min: 0 })}
              />

              <ModernInput
                label="Banheiros"
                type="number"
                placeholder="0"
                {...register("casas_banho_da_propriedade", { min: 0 })}
              />

              <ModernInput
                label="Garagens"
                type="number"
                placeholder="0"
                {...register("garagens_da_propriedade", { min: 0 })}
              />

              <ModernInput
                label="Tamanho Garagem (m²)"
                type="number"
                placeholder="0"
                {...register("tamanho_garagen_da_propriedade", { min: 0 })}
              />

              <ModernInput
                label="Ano de Construção"
                type="number"
                placeholder="2024"
                {...register("ano_construcao_da_propriedade", { 
                  min: 1800,
                  max: new Date().getFullYear()
                })}
              />

              <ModernInput
                label="ID da Propriedade"
                placeholder="ID único"
                {...register("id_da_propriedade")}
              />
            </div>
          </FormSection>

          {/* Detalhes Adicionais */}
          <FormSection title="Detalhes Adicionais" icon={Plus}>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <ModernDetailField 
                  key={field.id}
                  register={register}
                  index={index}
                  remove={remove}
                  errors={errors}
                />
              ))}
              
              <button
                type="button"
                onClick={() => append({ titulo: '', valor: '' })}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar Detalhe
              </button>
            </div>
          </FormSection>

          {/* Mídia */}
          <FormSection title="Mídia" icon={Camera}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ModernFileInput
                register={register}
                name="imagens_da_propriedade"
                label="Imagens da Propriedade"
                required={true}
                accept="image/*"
                multiple={true}
                maxSizeMB={10}
                maxFiles={5}
                errors={errors}
                icon={Camera}
              />

              <ModernFileInput
                register={register}
                name="documentos_da_propriedade"
                label="Documentos"
                accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp"
                multiple={true}
                maxSizeMB={10}
                maxFiles={5}
                errors={errors}
                icon={FileText}
              />

              <ModernFileInput
                register={register}
                name="video_da_propriedade"
                label="Vídeo da Propriedade"
                accept="video/*"
                maxSizeMB={50}
                errors={errors}
                icon={Camera}
              />

              <ModernInput
                label="Imagem 360°"
                placeholder="URL da imagem 360°"
                {...register("imagem_360_da_propriedade")}
                icon={Eye}
              />
            </div>
          </FormSection>

          {/* Notas */}
          <FormSection title="Notas" icon={StickyNote}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nota Privada</label>
              <textarea
                {...register("nota_da_propriedade")}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors resize-none"
                rows={3}
                placeholder="Notas internas não visíveis publicamente..."
              />
            </div>
          </FormSection>

          {/* Botão de Envio */}
          <div className="sticky bottom-4 z-10">
            <SubmitButton isSubmitting={isSubmitting} />
          </div>
        </form>
      </div>
    </div>
  );
}