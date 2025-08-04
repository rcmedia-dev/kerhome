'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import { useFormStatus } from 'react-dom';
import { Loader2, Plus, Trash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createProperty } from '@/lib/actions/supabase-actions/create-propertie-action';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-context';
import { TPropriedadeFormData } from '@/lib/types/property';

// Listas de opções
const caracteristicasList = [
  'Ar Condicionado', 'Aquecimento Central', 'Fogão Elétrico', 'Alarme de Incêndio',
  'Academia', 'Home Theater', 'Lavanderia', 'Lavanderia Separada', 'Pisos de Mármore',
  'Micro-ondas', 'Geladeira', 'Sauna', 'Piscina', 'TV a Cabo', 'Máquina de Lavar', 'WiFi'
];

const paises = [
  'Angola', 'Brasil', 'Portugal', 'Estados Unidos', 'Espanha', 'Outro'
];

const provinciasAngola = [
  'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango', 'Cuanza Norte',
  'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Luanda', 'Lunda Norte',
  'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire'
];

const cidadesAngola = [
  'Luanda', 'Lubango', 'Benguela', 'Malanje', 'Soyo', 'Sumbe', 'Ndalatando',
  'Uíge', 'Cabinda', 'Menongue', 'Ondjiva', 'Outra'
];

const tiposPropriedade = [
  'Apartamento', 'Casa', 'Terreno', 'Comercial', 'Prédio', 'Fazenda', 'Outro'
];

export default function CadastrarImovelPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const { 
    register, 
    control, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    reset,
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
    const fileInputs = ['imagens_da_propriedade', 'documentos_da_propriedade', 'video_da_propriedade', 'imagem_360_da_propriedade'];
    fileInputs.forEach(name => {
      const input = document.querySelector(`input[name="${name}"]`) as HTMLInputElement;
      if (input?.files) {
        Array.from(input.files).forEach(file => {
          formData.append(name, file);
        });
      }
    });

    try {
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

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-2 py-8">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Cadastrar Novo Imóvel</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Seção: Informações Básicas */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-800">Informações Básicas</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Título da Propriedade*</label>
                <input
                  {...register("titulo_da_propriedade", { 
                    required: "Título é obrigatório",
                    minLength: { value: 5, message: "Mínimo 5 caracteres" }
                  })}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                />
                {errors.titulo_da_propriedade && (
                  <p className="text-red-500 text-xs mt-1">{errors.titulo_da_propriedade.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição*</label>
                <textarea
                  {...register("descricao_da_propriedade", { 
                    required: "Descrição é obrigatória",
                    minLength: { value: 20, message: "Mínimo 20 caracteres" }
                  })}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                  rows={4}
                />
                {errors.descricao_da_propriedade && (
                  <p className="text-red-500 text-xs mt-1">{errors.descricao_da_propriedade.message}</p>
                )}
              </div>
            </div>

            {/* Seção: Localização */}
            <div className="pt-4 border-t space-y-4">
              <h3 className="font-semibold text-lg text-gray-800">Localização</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Endereço*</label>
                  <input
                    {...register("endereco_da_propriedade", { required: "Endereço é obrigatório" })}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                  />
                  {errors.endereco_da_propriedade && (
                    <p className="text-red-500 text-xs mt-1">{errors.endereco_da_propriedade.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">País*</label>
                  <select
                    {...register("pais_da_propriedade", { required: "País é obrigatório" })}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                  >
                    <option value="">Selecione o país</option>
                    {paises.map(pais => (
                      <option key={pais} value={pais}>{pais}</option>
                    ))}
                  </select>
                  {errors.pais_da_propriedade && (
                    <p className="text-red-500 text-xs mt-1">{errors.pais_da_propriedade.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Província*</label>
                  <select
                    {...register("provincia_da_propriedade", { required: "Província é obrigatória" })}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                  >
                    <option value="">Selecione a província</option>
                    {provinciasAngola.map(provincia => (
                      <option key={provincia} value={provincia}>{provincia}</option>
                    ))}
                  </select>
                  {errors.provincia_da_propriedade && (
                    <p className="text-red-500 text-xs mt-1">{errors.provincia_da_propriedade.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Cidade*</label>
                  <select
                    {...register("cidade_da_propriedade", { 
                      required: "Cidade é obrigatória",
                      validate: value => 
                        cidadesAngola.includes(value) || "Selecione uma cidade válida"
                    })}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                  >
                    <option value="">Selecione a cidade</option>
                    {cidadesAngola.map(cidade => (
                      <option key={cidade} value={cidade}>{cidade}</option>
                    ))}
                  </select>
                  {errors.cidade_da_propriedade && (
                    <p className="text-red-500 text-xs mt-1">{errors.cidade_da_propriedade.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Bairro</label>
                  <input
                    {...register("bairro_da_propriedade")}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                  />
                </div>
              </div>
            </div>

            {/* Seção: Tipo e Status */}
            <div className="pt-4 border-t space-y-4">
              <h3 className="font-semibold text-lg text-gray-800">Tipo e Status</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo*</label>
                  <select
                    {...register("tipo_da_propriedade", { required: "Tipo é obrigatório" })}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                  >
                    <option value="">Selecione o tipo</option>
                    {tiposPropriedade.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                  {errors.tipo_da_propriedade && (
                    <p className="text-red-500 text-xs mt-1">{errors.tipo_da_propriedade.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status*</label>
                  <select
                    {...register("estatus_da_propriedade", { required: "Status é obrigatório" })}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                  >
                    <option value="para alugar">Para Alugar</option>
                    <option value="para comprar">Para Vender</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Rótulo</label>
                  <select
                    {...register("rotulo_da_propriedade")}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                  >
                    <option value="">Nenhum</option>
                    <option value="Promoção">Promoção</option>
                    <option value="Destaque">Destaque</option>
                    <option value="Novo">Novo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Seção: Preço */}
            <div className="pt-4 border-t space-y-4">
              <h3 className="font-semibold text-lg text-gray-800">Preço</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Preço (KZ)*</label>
                  <input
                    type="number"
                    {...register("preco_da_propriedade", { 
                      required: "Preço é obrigatório",
                      min: { value: 1, message: "Preço inválido" }
                    })}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                  />
                  {errors.preco_da_propriedade && (
                    <p className="text-red-500 text-xs mt-1">{errors.preco_da_propriedade.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Unidade de Preço</label>
                  <input
                    {...register("unidade_preco_da_propriedade")}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                    placeholder="Ex: mensal, anual"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Preço de Chamada</label>
                  <input
                    {...register("preco_chamada_da_propriedade")}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                    placeholder="Ex: A partir de..."
                  />
                </div>
              </div>
            </div>

            {/* Seção: Características */}
            <div className="pt-4 border-t space-y-4">
              <h3 className="font-semibold text-lg text-gray-800">Características</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {caracteristicasList.map(caracteristica => (
                  <label key={caracteristica} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={caracteristica}
                      {...register("caracteristicas")}
                      className="h-4 w-4 rounded border-gray-300 text-purple-700 focus:ring-purple-700"
                    />
                    <span className="text-sm text-gray-700">{caracteristica}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Seção: Detalhes Técnicos */}
            <div className="pt-4 border-t space-y-4">
              <h3 className="font-semibold text-lg text-gray-800">Detalhes Técnicos</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tamanho (m²)</label>
                  <input
                    type="number"
                    {...register("tamanho_da_propriedade", { min: 0 })}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Área do Terreno (m²)</label>
                  <input
                    type="number"
                    {...register("area_terreno_da_propriedade", { min: 0 })}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Quartos</label>
                  <input
                    type="number"
                    {...register("quartos_da_propriedade", { min: 0 })}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Banheiros</label>
                  <input
                    type="number"
                    {...register("casas_banho_da_propriedade", { min: 0 })}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Garagens</label>
                  <input
                    type="number"
                    {...register("garagens_da_propriedade", { min: 0 })}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tamanho Garagem (m²)</label>
                  <input
                    type="number"
                    {...register("tamanho_garagen_da_propriedade", { min: 0 })}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Ano de Construção</label>
                  <input
                    type="number"
                    {...register("ano_construcao_da_propriedade", { 
                      min: 1800,
                      max: new Date().getFullYear()
                    })}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">ID da Propriedade</label>
                  <input
                    {...register("id_da_propriedade")}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                  />
                </div>
              </div>
            </div>

            {/* Seção: Detalhes Adicionais */}
            <div className="pt-4 border-t space-y-4">
              <h3 className="font-semibold text-lg text-gray-800">Detalhes Adicionais</h3>
              
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Título</label>
                    <input
                      {...register(`detalhes.${index}.titulo`)}
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Valor</label>
                    <input
                      {...register(`detalhes.${index}.valor`)}
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => append({ titulo: '', valor: '' })}
                className="flex items-center gap-2 text-purple-700 hover:text-purple-800 text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                Adicionar Detalhe
              </button>
            </div>

            {/* Seção: Mídia */}
            <div className="pt-4 border-t space-y-4">
              <h3 className="font-semibold text-lg text-gray-800">Mídia</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Imagens*</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    {...register("imagens_da_propriedade", { 
                      required: "Pelo menos uma imagem é obrigatória"
                    })}
                    className="mt-1 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Documentos</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp"
                    multiple
                    {...register("documentos_da_propriedade")}
                    className="mt-1 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Vídeo</label>
                  <input
                    type="file"
                    accept="video/*"
                    {...register("video_da_propriedade")}
                    className="mt-1 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Imagem 360°</label>
                  <input
                    type="text"
                    {...register("imagem_360_da_propriedade")}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                    placeholder="URL da imagem 360°"
                  />
                </div>
              </div>
            </div>

            {/* Seção: Notas */}
            <div className="pt-4 border-t space-y-4">
              <h3 className="font-semibold text-lg text-gray-800">Notas</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Nota Privada</label>
                <textarea
                  {...register("nota_da_propriedade")}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2"
                  rows={3}
                  placeholder="Notas internas não visíveis publicamente"
                />
              </div>
            </div>

            {/* Botão de Envio */}
            <div className="pt-4">
              <SubmitButton isSubmitting={isSubmitting} />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={isSubmitting || pending}
      className={`w-full px-4 py-3 rounded-md font-semibold text-white flex items-center justify-center gap-2 ${
        isSubmitting || pending ? 'bg-indigo-400 cursor-not-allowed' : 'bg-purple-700 hover:bg-purple-800'
      }`}
    >
      {(isSubmitting || pending) ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Cadastrando...
        </>
      ) : (
        'Cadastrar Imóvel'
      )}
    </button>
  );
}