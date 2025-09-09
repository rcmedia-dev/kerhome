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

  const { handleSubmit, trigger, reset, setValue, watch } = methods;

  // Função para formatar o preço com separadores de milhar
  const formatPrice = (value: string): string => {
    // Remove todos os caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');
    
    // Converte para número e formata com separadores de milhar
    if (numericValue === '') return '';
    
    const numberValue = parseInt(numericValue, 10);
    if (isNaN(numberValue)) return '';
    
    return numberValue.toLocaleString('pt-BR');
  };

  // Observa mudanças no campo de preço para aplicar a máscara
  const priceValue = watch("price");
  useEffect(() => {
    if (priceValue !== undefined && priceValue !== null) {
      const formattedValue = formatPrice(priceValue.toString());
      if (formattedValue !== priceValue.toString()) {
        setValue("price", formattedValue as any);
      }
    }
  }, [priceValue, setValue]);

  // Definindo os passos do formulário com placeholders descritivos
  const steps = [
    <FormStep 
      key="basic" 
      title="Informações Básicas"
      description="Informações essenciais sobre a propriedade"
      fields={[
        {
          name: "title",
          label: "Título do Anúncio",
          type: "text",
          required: true,
          placeholder: "Ex: Apartamento de luxo com 3 quartos no centro de Luanda, vista para o mar",
          validation: {
            required: "Título é obrigatório",
            minLength: {
              value: 10,
              message: "Título deve ter pelo menos 10 caracteres para atrair compradores"
            }
          }
        },
        {
          name: "description",
          label: "Descrição Detalhada",
          type: "textarea",
          required: true,
          placeholder: "Ex: Apartamento completamente renovado com acabamentos de alta qualidade, localizado em condomínio fechado com piscina, academia e segurança 24h. Próximo ao shopping e escolas internacionais.",
          validation: {
            required: "Descrição é obrigatória",
            minLength: {
              value: 50,
              message: "Descrição deve ter pelo menos 50 caracteres para ser informativa"
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
            { value: "rural", label: "Propriedade Rural" }
          ],
          placeholder: "Selecione o tipo de propriedade",
          validation: {
            required: "Tipo de propriedade é obrigatório"
          }
        },
        {
          name: "status",
          label: "Finalidade do Anúncio",
          type: "select",
          required: true,
          options: [
            { value: "para comprar", label: "Venda" },
            { value: "para alugar", label: "Aluguel" },
          ],
          placeholder: "Selecione se é para vender ou alugar",
          validation: {
            required: "Finalidade é obrigatória"
          }
        }
      ]}
    />,
    
    <FormStep 
      key="details" 
      title="Detalhes da Propriedade"
      description="Características físicas e dimensionais da propriedade"
      fields={[
        {
          name: "size",
          label: "Área Construída",
          type: "number",
          placeholder: "Ex: 120 (apenas números em metros quadrados)",
          
        },
        {
          name: "area_terreno",
          label: "Área Total do Terreno",
          type: "number",
          placeholder: "Ex: 300 (apenas números em metros quadrados)",
        },
        {
          name: "bedrooms",
          label: "Número de Quartos",
          type: "number",
          required: true,
          placeholder: "Ex: 3 (inclua todos os dormitórios, suítes e quartos de hóspedes)",
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
          label: "Número de Banheiros",
          type: "number",
          required: true,
          placeholder: "Ex: 2 (inclua banheiros sociais, suítes e lavabos)",
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
          placeholder: "Ex: 2 (número total de carros que cabem na garagem)",
        },
        {
          name: "garagem_tamanho",
          label: "Tamanho da Garagem",
          type: "number",
          placeholder: "Ex: 20 (em metros quadrados, opcional)",
        },
        {
          name: "ano_construcao",
          label: "Ano de Construção",
          type: "number",
          placeholder: "Ex: 2015 (ano em que a construção foi finalizada)",
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
      description="Defina o valor e condições comerciais"
      fields={[
        {
          name: "price",
          label: "Valor da Propriedade",
          type: "text", // Alterado para text para aceitar a máscara
          required: true,
          placeholder: "Ex: 25 000 000 (o sistema formatará automaticamente)",
          validation: {
            required: "Preço é obrigatório",
            validate: (value: any) => {
              const numericValue = parseInt(value.toString().replace(/\s/g, ''), 10);
              return !isNaN(numericValue) && numericValue > 0 || "Preço deve ser maior que zero";
            }
          }
        },
        {
          name: "unidade_preco",
          label: "Moeda do Preço",
          type: "select",
          options: [
            { value: "kwanza", label: "Kwanza (Kz)" },
            { value: "dolar", label: "Dólar Americano (USD)" },
            { value: "euro", label: "Euro (€)" }
          ],
          placeholder: "Selecione a moeda do valor anunciado",
          validation: {
            required: "Moeda é obrigatória"
          }
        },
        {
          name: "rotulo",
          label: "Tipo de Negociação",
          type: "select",
          options: [
            { value: "Preço sob consulta", label: "Sob Consulta" },
            { value: "Preço Negociavel", label: "Preço Negociável" },
            { value: "Valor Fixo", label: "Valor Fixo" }
          ],
          placeholder: "Selecione como deseja negociar",
        }
      ]}
    />,
    
    <FormStep 
      key="location" 
      title="Localização"
      description="Endereço completo para localização precisa"
      fields={[
        {
          name: "endereco",
          label: "Endereço Completo",
          type: "text",
          required: true,
          placeholder: "Ex: Rua Amílcar Cabral, nº 123, Edifício Mar Azul, 5º andar, apartamento 502",
          validation: {
            required: "Endereço é obrigatório",
            minLength: {
              value: 5,
              message: "Endereço deve conter pelo menos 5 caracteres"
            }
          }
        },
        {
          name: "bairro",
          label: "Bairro",
          type: "text",
          required: true,
          placeholder: "Ex: Maianga, Alvalade, Kilamba Kiaxi, Benfica",
          validation: {
            required: "Bairro é obrigatório"
          }
        },
        {
          name: "cidade",
          label: "Cidade/Município",
          type: "text",
          required: true,
          placeholder: "Ex: Luanda, Benguela, Lubango, Huambo",
          validation: {
            required: "Cidade é obrigatória"
          }
        },
        {
          name: "provincia",
          label: "Província",
          type: "text",
          required: true,
          placeholder: "Ex: Luanda, Benguela, Huíla, Huambo",
          validation: {
            required: "Província é obrigatória"
          }
        },
        {
          name: "pais",
          label: "País",
          type: "text",
          required: true,
          placeholder: "Ex: Angola",
          validation: {
            required: "País é obrigatório"
          }
        }
      ]}
    />,
    
    <FormStep 
      key="media" 
      title="Mídia e Documentos"
      description="Adicione imagens, vídeos e documentos para valorizar seu anúncio"
      fields={[
        {
          name: "image",
          label: "Imagem Principal",
          type: "file",
          accept: "image/*",
          placeholder: "Selecione a foto de capa do anúncio (melhor imagem da propriedade)",
        },
        {
          name: "gallery",
          label: "Galeria de Imagens",
          type: "file",
          accept: "image/*",
          multiple: true,
          placeholder: "Selecione até 10 fotos adicionais (fachada, interior, quartos, área externa)",
        },
        {
          name: "video_url",
          label: "Vídeo Tour",
          type: "file",
          accept: "video/*",
          placeholder: "Selecione um vídeo mostrando a propriedade (opcional mas recomendado)",
        },
        {
          name: "documents",
          label: "Documentos Legais",
          type: "file",
          accept: ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg",
          multiple: true,
          placeholder: "Selecite documentos como: título de propriedade, licenças, plantas (opcional)",
        }
      ]}
    />,
    
    <FormStep 
      key="additional" 
      title="Informações Adicionais"
      description="Detalhes extras que podem fazer a diferença para o comprador"
      fields={[
        {
          name: "caracteristicas",
          label: "Características e Comodidades",
          type: "text",
          placeholder: "Ex: piscina, jardim, varanda gourmet, armários embutidos, ar condicionado, cozinha equipada, área de serviço, segurança 24h",
        },
        {
          name: "detalhes_adicionais",
          label: "Informações Complementares",
          type: "textarea",
          placeholder: "Detalhes sobre: condomínio (valor da taxa), IPTU, reformas recentes, mobilía incluída, horário para visitas, motivação da venda, histórico da propriedade...",
        },
        {
          name: "nota_privada",
          label: "Observações Internas (não será publicada)",
          type: "textarea",
          placeholder: "Informações confidenciais: valor mínimo aceitável, flexibilidade nas condições de pagamento, problemas não visíveis na propriedade, restrições de horário para contato...",
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
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showSuccess, reset, goTo]);

  const onFormSubmit = async (data: PropertyFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    setSuccessMessage(null);

    try {
      // Converter o preço formatado para valor numérico
      const numericPrice = parseInt(data.price.toString().replace(/\s/g, ''), 10);
      
      const formData = {
        ...data,
        price: numericPrice
      };

      // Debug: verificar se owner_id está presente
      console.log("Dados do formulário:", {
        owner_id: formData.owner_id,
        title: formData.title,
        price: formData.price
      });

      // Chamar a Server Action diretamente com os dados do React Hook Form
      const result = await createProperty(formData);

      if (result.success) {
        setSuccessMessage("Propriedade cadastrada com sucesso! Em breve será revisada pela nossa equipe.");
        setShowSuccess(true);
      } else {
        setServerError(result.error || "Erro ao criar propriedade. Verifique os dados e tente novamente.");
      }
    } catch (error) {
      console.error("Erro no formulário:", error);
      setServerError('Erro interno do servidor. Por favor, tente novamente mais tarde.');
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Cadastre sua Propriedade</h1>
          <p className="text-gray-600">Preencha todos os campos com informações detalhadas para atrair mais compradores</p>
          
          <div className="mt-6 flex items-center">
            {steps.map((_, index) => (
              <React.Fragment key={index}>
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    index === currentStepIndex 
                      ? "bg-blue-600 border-blue-600 text-white" 
                      : index < currentStepIndex 
                      ? "bg-green-500 border-green-500 text-white" 
                      : "bg-white border-gray-300 text-gray-400"
                  } transition-all duration-300`}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-1 ${
                    index < currentStepIndex ? "bg-green-500" : "bg-gray-200"
                  } transition-all duration-300`} />
                )}
              </React.Fragment>
            ))}
          </div>
          
          <div className="mt-4 text-sm text-gray-500 text-center">
            Passo {currentStepIndex + 1} de {steps.length}: {steps[currentStepIndex].props.title}
          </div>
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>{serverError}</div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>{successMessage}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Campo hidden para garantir que owner_id seja enviado */}
          <input type="hidden" {...methods.register("owner_id")} />
          
          {step}
          
          <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
            {!isFirstStep ? (
              <Button 
                type="button" 
                variant="outline" 
                onClick={back} 
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                ← Voltar
              </Button>
            ) : (
              <div></div>
            )}
            
            {isLastStep ? (
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="min-w-[120px] bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Publicando...
                  </>
                ) : "Publicar Anúncio"}
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={goToNextStep} 
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                Próximo →
              </Button>
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
};

export default MultiStepForm;