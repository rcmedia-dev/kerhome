"use client";

import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useMultiStepForm } from "@/hooks/use-multi-step-form";
import { Button } from "@/components/ui/button";
import { PropertyFormData } from "@/lib/types/property";
import FormStep from "@/components/form-step";
import { createProperty } from "@/lib/functions/supabase-actions/create-propertie-action";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Circle } from "lucide-react";
import { motion } from "framer-motion";

interface MultiStepFormProps {
  userId?: string;
  agentName: string;
}

const MultiStepForm = ({ userId, agentName }: MultiStepFormProps) => {
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

  const { handleSubmit, trigger, reset, setValue, watch, formState: { isValid } } = methods;

  // Função para formatar o preço com separadores de milhar
  const formatPrice = (value: string): string => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue === '') return '';
    const numberValue = parseInt(numericValue, 10);
    if (isNaN(numberValue)) return '';
    return numberValue.toLocaleString('pt-AO');
  };

  const priceValue = watch("price");
  useEffect(() => {
    if (priceValue !== undefined && priceValue !== null) {
      const formattedValue = formatPrice(priceValue.toString());
      if (formattedValue !== priceValue.toString()) {
        setValue("price", formattedValue as any);
      }
    }
  }, [priceValue, setValue]);

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
            { value: "Outro", label: "Outra Propriedade" }
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
            { value: "comprar", label: "Venda" },
            { value: "arrendar", label: "Aluguel" },
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
      description="Características físicas e dimensionais"
      fields={[
        { name: "size", label: "Área Construída (m²)", type: "number", placeholder: "Ex: 120" },
        { name: "area_terreno", label: "Área Total do Terreno (m²)", type: "number", placeholder: "Ex: 300" },
        {
          name: "bedrooms",
          label: "Número de Quartos",
          type: "number",
          required: true,
          placeholder: "Ex: 3",
          validation: { required: "Número de quartos é obrigatório", min: { value: 0, message: "Não pode ser negativo" } }
        },
        {
          name: "bathrooms",
          label: "Número de Banheiros",
          type: "number",
          required: true,
          placeholder: "Ex: 2",
          validation: { required: "Número de banheiros é obrigatório", min: { value: 0, message: "Não pode ser negativo" } }
        },
        { name: "garagens", label: "Vagas de Garagem", type: "number", placeholder: "Ex: 2" },
        { name: "garagem_tamanho", label: "Tamanho da Garagem", type: "number", placeholder: "Ex: 20" },
        {
          name: "ano_construcao",
          label: "Ano de Construção",
          type: "number",
          placeholder: "Ex: 2015",
          validation: {
            min: { value: 1500, message: "Ano inválido" },
            max: { value: new Date().getFullYear(), message: "Ano inválido" }
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
          type: "text",
          required: true,
          placeholder: "Ex: 25 000 000",
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
          label: "Moeda",
          type: "select",
          options: [
            { value: "kwanza", label: "Kwanza (Kz)" },
            { value: "dolar", label: "Dólar Americano (USD)" },
            { value: "euro", label: "Euro (€)" }
          ],
          placeholder: "Selecione a moeda",
          validation: { required: "Moeda é obrigatória" }
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
          placeholder: "Selecione a condição",
        }
      ]}
    />,

    <FormStep
      key="location"
      title="Localização"
      description="Endereço completo da propriedade"
      fields={[
        {
          name: "endereco",
          label: "Endereço Completo",
          type: "text",
          required: true,
          placeholder: "Ex: Rua Amílcar Cabral, nº 123",
          validation: { required: "Endereço obrigatório", minLength: { value: 5, message: "Mínimo 5 caracteres" } }
        },
        { name: "bairro", label: "Bairro", type: "text", required: true, placeholder: "Ex: Maianga", validation: { required: "Obrigatório" } },
        { name: "cidade", label: "Cidade", type: "text", required: true, placeholder: "Ex: Luanda", validation: { required: "Obrigatório" } },
        { name: "provincia", label: "Província", type: "text", required: true, placeholder: "Ex: Luanda", validation: { required: "Obrigatório" } },
        { name: "pais", label: "País", type: "text", required: true, placeholder: "Ex: Angola", validation: { required: "Obrigatório" } }
      ]}
    />,

    <FormStep
      key="media"
      title="Mídia e Documentos"
      description="Imagens e arquivos da propriedade"
      fields={[
        { name: "image", label: "Imagem Principal", type: "file", accept: "image/*", placeholder: "Foto de capa" },
        { name: "gallery", label: "Galeria", type: "file", accept: "image/*", multiple: true, placeholder: "Fotos adicionais" },
        { name: "video_url", label: "Vídeo", type: "file", accept: "video/*", placeholder: "Vídeo tour" },
        { name: "documents", label: "Documentos", type: "file", accept: ".pdf,.doc,.docx", multiple: true, placeholder: "Documentação" }
      ]}
    />,

    <FormStep
      key="additional"
      title="Informações Adicionais"
      description="Detalhes extras"
      fields={[
        { name: "caracteristicas", label: "Comodidades (separadas por vírgula)", type: "text", placeholder: "Ex: piscina, jardim, varanda" },
        { name: "detalhes_adicionais", label: "Infos Complementares", type: "textarea", placeholder: "Detalhes sobre condomínio, taxas, etc." },
        { name: "nota_privada", label: "Notas Internas", type: "textarea", placeholder: "Infos confidenciais para a equipe" }
      ]}
    />
  ];

  const { currentStepIndex, step, isFirstStep, isLastStep, back, next, goTo } =
    useMultiStepForm(steps);

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
      const numericPrice = parseInt(data.price.toString().replace(/\s/g, ''), 10);
      const formData = { ...data, price: numericPrice };
      const result = await createProperty(formData, userId);

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
    const fieldNames = steps[currentStepIndex].props.fields.map((field: any) => field.name);
    const isValidStep = await trigger(fieldNames as any);
    if (isValidStep) next();
  };

  const calculateProgress = () => {
    return Math.round(((currentStepIndex + 1) / steps.length) * 100);
  };

  return (
    <FormProvider {...methods}>
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[700px] border border-gray-100">

        {/* SIDEBAR - VERTICAL STEPPER */}
        <div className="w-full lg:w-1/3 bg-gray-50/80 p-8 lg:p-10 border-r border-gray-100 flex flex-col">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Cadastrar Imóvel</h2>
            <p className="text-sm text-gray-500 mt-2">Preencha os dados para anunciar sua propriedade na KerCasa.</p>
          </div>

          <div className="flex-1 space-y-0 relative">
            {/* Connecting Line */}
            <div className="absolute left-[19px] top-4 bottom-10 w-0.5 bg-gray-200 z-0 hidden lg:block"></div>

            {steps.map((s, index) => {
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;

              return (
                <div key={index} className="relative z-10 flex items-start gap-4 pb-8 last:pb-0 group">
                  <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 transition-all duration-300
                                ${isActive ? "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/30" :
                      isCompleted ? "bg-green-500 border-green-500 text-white" : "bg-white border-gray-200 text-gray-300"}
                            `}>
                    {isCompleted ? <Check size={18} strokeWidth={3} /> : <span className="text-sm font-bold">{index + 1}</span>}
                  </div>
                  <div className="pt-2 hidden lg:block">
                    <h3 className={`text-sm font-bold transition-colors ${isActive ? "text-purple-700" : isCompleted ? "text-gray-800" : "text-gray-400"}`}>
                      {s.props.title}
                    </h3>
                    {/* Mobile/Tablet might hide description for space */}
                    <p className={`text-xs mt-0.5 ${isActive ? "text-purple-600/70" : "text-gray-400"}`}>
                      {/* Shorten description for sidebar */}
                      {s.props.title === "Informações Básicas" && "Título, tipo e status"}
                      {s.props.title === "Detalhes da Propriedade" && "Tamanhos e cômodos"}
                      {s.props.title === "Informações de Preço" && "Valores e moeda"}
                      {s.props.title === "Localização" && "Endereço e mapa"}
                      {s.props.title === "Mídia e Documentos" && "Fotos e arquivos"}
                      {s.props.title === "Informações Adicionais" && "Notas e extras"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col">
          {/* TOP PROGRESS BAR (Mobile/Desktop) */}
          <div className="p-8 lg:px-12 lg:pt-12 pb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Progresso</span>
              <span className="text-sm font-bold text-purple-600">{calculateProgress()}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-purple-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${calculateProgress()}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* FORM BODY */}
          <div className="flex-1 px-8 lg:px-12 overflow-y-auto max-h-[600px] custom-scrollbar">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800">{steps[currentStepIndex].props.title}</h2>
              <p className="text-gray-500">{steps[currentStepIndex].props.description}</p>
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                {serverError}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 pb-4">
              {/* Campo hidden para garantir que owner_id seja enviado */}
              <input type="hidden" {...methods.register("owner_id")} />

              {step}
            </form>
          </div>

          {/* FOOTER NAVIGATION */}
          <div className="p-8 lg:px-12 border-t border-gray-100 bg-white flex justify-between items-center mt-auto">
            {!isFirstStep ? (
              <button
                type="button"
                onClick={back}
                disabled={isSubmitting}
                className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all hover:scale-105"
              >
                <ArrowLeft size={20} />
              </button>
            ) : (
              <div className="w-12"></div>
            )}

            {isLastStep ? (
              <button
                type="submit"
                onClick={handleSubmit(onFormSubmit)}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-orange-500 text-white font-bold shadow-lg hover:shadow-orange-500/30 hover:-translate-y-1 transition-all flex items-center gap-2"
              >
                {isSubmitting ? "Publicando..." : "Finalizar Cadastro"}
                {!isSubmitting && <CheckCircle2 size={18} />}
              </button>
            ) : (
              <button
                type="button"
                onClick={goToNextStep}
                className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg hover:shadow-purple-500/30 hover:scale-105 hover:bg-purple-700 transition-all"
              >
                <ArrowRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default MultiStepForm;