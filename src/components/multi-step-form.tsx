"use client";

import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useMultiStepForm } from "@/hooks/use-multi-step-form";
import { Button } from "@/components/ui/button";
import { PropertyFormData } from "@/lib/types/property";
import FormStep from "./form-step";
import { useRouter } from "next/navigation";
import { createProperty } from "@/lib/actions/supabase-actions/create-propertie-action";

interface MultiStepFormProps {
  userId?: string;
}

const MultiStepForm = ({ userId }: MultiStepFormProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const methods = useForm<PropertyFormData>({
    defaultValues: {
      owner_id: userId || "",
      title: "",
      description: "",
      tipo: "",
      status: "",
      rotulo: "",
      price: 0,
      unidade_preco: "",
      preco_chamada: 0,
      size: 0,
      area_terreno: 0,
      bedrooms: 0,
      bathrooms: 0,
      garagens: 0,
      garagem_tamanho: 0,
      ano_construcao: new Date().getFullYear(),
      propertyid: "",
      endereco: "",
      bairro: "",
      cidade: "",
      provincia: "",
      pais: "Angola",
      nota_privada: "",
      image: "",
      gallery: [],
      caracteristicas: [],
      detalhes_adicionais: "",
      aprovement_status: "pending",
      video_url: "",
      is_featured: false,
      rejection_reason: "",
      documents: [],
    },
    mode: "onChange",
  });

  const { handleSubmit, trigger, reset } = methods;

  // Definindo os passos do formulário
  const steps = [
    <FormStep 
      key="basic" 
      title="Informações Básicas"
      description="Informações essenciais sobre a propriedade"
      fields={[
        {
          name: "title",
          label: "Título",
          type: "text",
          required: true,
          placeholder: "Ex: Apartamento com vista para o mar",
          validation: {
            required: "Título é obrigatório",
            minLength: {
              value: 5,
              message: "Título deve ter pelo menos 5 caracteres"
            }
          }
        },
        {
          name: "description",
          label: "Descrição",
          type: "textarea",
          required: true,
          placeholder: "Descreva a propriedade em detalhes",
          validation: {
            required: "Descrição é obrigatória",
            minLength: {
              value: 20,
              message: "Descrição deve ter pelo menos 20 caracteres"
            }
          }
        },
        {
          name: "tipo",
          label: "Tipo de Propriedade",
          type: "select",
          required: true,
          options: [
            { value: "casa", label: "Casa" },
            { value: "apartamento", label: "Apartamento" },
            { value: "terreno", label: "Terreno" },
            { value: "comercial", label: "Comercial" },
            { value: "rural", label: "Outra" }
          ],
          validation: {
            required: "Tipo de propriedade é obrigatório"
          }
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          required: true,
          options: [
            { value: "para comprar", label: "Venda" },
            { value: "para alugar", label: "Aluguel" },
          ],
          validation: {
            required: "Status é obrigatório"
          }
        }
      ]}
    />,
    
    <FormStep 
      key="details" 
      title="Detalhes da Propriedade"
      description="Características físicas da propriedade"
      fields={[
        {
          name: "size",
          label: "Tamanho (m²)",
          type: "number",
        },
        {
          name: "area_terreno",
          label: "Área do Terreno (m²)",
          type: "number",
        },
        {
          name: "bedrooms",
          label: "Quartos",
          type: "number",
          required: true,
          validation: {
            required: "Número de quartos é obrigatório",
            min: {
              value: 0,
              message: "Número de quartos não pode ser negativo"
            }
          }
        },
        {
          name: "bathrooms",
          label: "Banheiros",
          type: "number",
          required: true,
          validation: {
            required: "Número de banheiros é obrigatório",
            min: {
              value: 0,
              message: "Número de banheiros não pode ser negativo"
            }
          }
        },
        {
          name: "garagens",
          label: "Vagas de Garagem",
          type: "number",
        },
        {
          name: "garagem_tamanho",
          label: "Tamanho da Garagem (m²)",
          type: "number",
        },
        {
          name: "ano_construcao",
          label: "Ano de Construção",
          type: "number",
          validation: {
            min: {
              value: 1500,
              message: "Ano de construção deve ser após 1500"
            },
            max: {
              value: new Date().getFullYear(),
              message: "Ano de construção não pode ser futuro"
            }
          }
        }
      ]}
    />,
    
    <FormStep 
      key="price" 
      title="Informações de Preço"
      description="Detalhes sobre valores e condições"
      fields={[
        {
          name: "price",
          label: "Preço",
          type: "number",
          required: true,
          validation: {
            required: "Preço é obrigatório",
            min: {
              value: 1,
              message: "Preço deve ser maior que 0"
            }
          }
        },
        {
          name: "unidade_preco",
          label: "Unidade de Preço",
          type: "select",
          options: [
            { value: "kwanza", label: "KZ" },
            { value: "dolar", label: "USD" },
            { value: "euro", label: "Euro" }
          ],
          validation: {
            required: "Unidade de preço é obrigatória"
          }
        },
        {
          name: "rotulo",
          label: "Rótulo de Preço",
          type: "select",
          options: [
            { value: "Preço sob consulta", label: "Sob Consulta" },
            { value: "Preço Negociavel", label: "Preço Negociável" },
            { value: "Valor Fixo", label: "Valor Fixo" }
          ]
        }
      ]}
    />,
    
    <FormStep 
      key="location" 
      title="Localização"
      description="Endereço da propriedade"
      fields={[
        {
          name: "endereco",
          label: "Endereço",
          type: "text",
          required: true,
          validation: {
            required: "Endereço é obrigatório"
          }
        },
        {
          name: "bairro",
          label: "Bairro",
          type: "text",
          required: true,
          validation: {
            required: "Bairro é obrigatório"
          }
        },
        {
          name: "cidade",
          label: "Cidade",
          type: "text",
          required: true,
          validation: {
            required: "Cidade é obrigatória"
          }
        },
        {
          name: "provincia",
          label: "Província",
          type: "text",
          required: true,
          validation: {
            required: "Província é obrigatória"
          }
        },
        {
          name: "pais",
          label: "País",
          type: "text",
          required: true,
          validation: {
            required: "País é obrigatório"
          }
        }
      ]}
    />,
    
    <FormStep 
      key="media" 
      title="Mídia e Documentos"
      description="Imagens, vídeos e documentos da propriedade"
      fields={[
        {
          name: "image",
          label: "Imagem Principal",
          type: "file",
          accept: "image/*"
        },
        {
          name: "gallery",
          label: "Galeria de Imagens",
          type: "file",
          accept: "image/*",
          multiple: true
        },
        {
          name: "video_url",
          label: "Vídeo",
          type: "file",
          accept: "video/*"
        },
        {
          name: "documents",
          label: "Documentos",
          type: "file",
          accept: ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg",
          multiple: true
        }
      ]}
    />,
    
    <FormStep 
      key="additional" 
      title="Informações Adicionais"
      description="Detalhes extras sobre a propriedade"
      fields={[
        {
          name: "caracteristicas",
          label: "Características (separadas por vírgula)",
          type: "text",
          placeholder: "Ex: piscina, jardim, varanda gourmet"
        },
        {
          name: "detalhes_adicionais",
          label: "Detalhes Adicionais",
          type: "textarea"
        },
        {
          name: "nota_privada",
          label: "Nota Privada",
          type: "textarea",
          placeholder: "Notas visíveis apenas para administradores"
        }
      ]}
    />
  ];

  const { currentStepIndex, step, isFirstStep, isLastStep, back, next, goTo } = 
    useMultiStepForm(steps);

  // Reset do formulário após sucesso
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        reset();
        goTo(0);
        setShowSuccess(false);
        setSuccessMessage(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showSuccess, reset, goTo]);

  const onFormSubmit = async (data: PropertyFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    setSuccessMessage(null);

    try {
      // Debug: verificar se owner_id está presente
      console.log("Dados do formulário:", {
        owner_id: data.owner_id,
        title: data.title,
      });

      // Chamar a Server Action diretamente com os dados do React Hook Form
      const result = await createProperty(data);

      if (result.success) {
        setSuccessMessage("Propriedade cadastrada com sucesso!");
        setShowSuccess(true);
      } else {
        setServerError(result.error || "Erro ao criar propriedade");
      }
    } catch (error) {
      console.error("Erro no formulário:", error);
      setServerError('Erro interno do servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToNextStep = async () => {
    // Valida apenas os campos do passo atual antes de avançar
    const fieldNames = steps[currentStepIndex].props.fields.map(
      (field: any) => field.name
    );
    
    const isValid = await trigger(fieldNames as any);
    
    if (isValid) {
      next();
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Cadastro de Propriedade</h1>
          <div className="flex items-center mt-4">
            {steps.map((_, index) => (
              <React.Fragment key={index}>
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index === currentStepIndex 
                      ? "bg-blue-600 text-white" 
                      : index < currentStepIndex 
                      ? "bg-green-500 text-white" 
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    index < currentStepIndex ? "bg-green-500" : "bg-gray-200"
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {serverError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {serverError}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Campo hidden para garantir que owner_id seja enviado */}
          <input type="hidden" {...methods.register("owner_id")} />
          
          {step}
          
          <div className="flex justify-between mt-8">
            {!isFirstStep ? (
              <Button type="button" variant="outline" onClick={back} disabled={isSubmitting}>
                Voltar
              </Button>
            ) : (
              <div></div>
            )}
            
            {isLastStep ? (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Finalizar"}
              </Button>
            ) : (
              <Button type="button" onClick={goToNextStep} disabled={isSubmitting}>
                Próximo
              </Button>
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
};

export default MultiStepForm;