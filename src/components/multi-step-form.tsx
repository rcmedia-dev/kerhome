"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { PropertyFormData } from "@/lib/types/property";
import FormStep from "@/components/form-step";
import { createProperty } from "@/lib/functions/supabase-actions/create-propertie-action";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Circle, UserCircle, Store, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PropertyCard } from "@/components/property-card";

interface MultiStepFormProps {
  userId?: string;
  agentName: string;
  userAgency?: any;
}

const MultiStepForm = ({ userId, agentName, userAgency }: MultiStepFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIdentity, setSelectedIdentity] = useState<'personal' | 'agency'>('personal');
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

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

  // Atualizar owner_id quando userId estiver disponível
  useEffect(() => {
    if (userId) {
      setValue("owner_id", userId);
    }
  }, [userId, setValue]);

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
          question: "O que está a vender ou arrendar?",
          placeholder: "Ex: Apartamento T4 no Kilamba com vista para o mar",
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
          question: "Descreva o seu imóvel para os interessados",
          placeholder: "Ex: Apartamento renovado com acabamentos premium, condomínio com piscina e segurança 24h...",
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
          question: "Que tipo de propriedade é?",
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
          question: "Pretende vender ou arrendar?",
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
        { name: "size", label: "Área Construída (m²)", type: "number", question: "Qual a área construída em m²?", placeholder: "Ex: 120" },
        { name: "area_terreno", label: "Área Total do Terreno (m²)", type: "number", question: "E a área total do terreno?", placeholder: "Ex: 300" },
        {
          name: "bedrooms",
          label: "Número de Quartos",
          type: "number",
          required: true,
          question: "Quantos quartos tem?",
          placeholder: "Ex: 3",
          validation: { required: "Número de quartos é obrigatório", min: { value: 0, message: "Não pode ser negativo" } }
        },
        {
          name: "bathrooms",
          label: "Número de Banheiros",
          type: "number",
          required: true,
          question: "E casas de banho?",
          placeholder: "Ex: 2",
          validation: { required: "Número de banheiros é obrigatório", min: { value: 0, message: "Não pode ser negativo" } }
        },
        { name: "garagens", label: "Vagas de Garagem", type: "number", question: "Tem garagem? Quantas vagas?", placeholder: "Ex: 2" },
        { name: "garagem_tamanho", label: "Tamanho da Garagem", type: "number", question: "Qual o tamanho da garagem em m²?", placeholder: "Ex: 20" },
        {
          name: "ano_construcao",
          label: "Ano de Construção",
          type: "number",
          question: "Em que ano foi construído?",
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
          question: "Qual o valor do imóvel?",
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
          question: "Em que moeda?",
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
          question: "Qual a condição de negociação?",
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
          question: "Qual o endereço do imóvel?",
          placeholder: "Ex: Rua Amílcar Cabral, nº 123",
          validation: { required: "Endereço obrigatório", minLength: { value: 5, message: "Mínimo 5 caracteres" } }
        },
        { name: "bairro", label: "Bairro", type: "text", required: true, question: "Em que bairro fica?", placeholder: "Ex: Maianga, Talatona, Benfica...", validation: { required: "Obrigatório" } },
        { name: "cidade", label: "Cidade", type: "text", required: true, question: "E a cidade?", placeholder: "Ex: Luanda, Lobito, Lubango...", validation: { required: "Obrigatório" } },
        { 
          name: "provincia", 
          label: "Província", 
          type: "select", 
          required: true, 
          question: "Qual a província?", 
          options: [
            { value: "Luanda", label: "Luanda" },
            { value: "Bengo", label: "Bengo" },
            { value: "Benguela", label: "Benguela" },
            { value: "Bié", label: "Bié" },
            { value: "Cabinda", label: "Cabinda" },
            { value: "Cunene", label: "Cunene" },
            { value: "Huambo", label: "Huambo" },
            { value: "Huíla", label: "Huíla" },
            { value: "Kuando Kubango", label: "Kuando Kubango" },
            { value: "Kwanza Norte", label: "Kwanza Norte" },
            { value: "Kwanza Sul", label: "Kwanza Sul" },
            { value: "Lunda Norte", label: "Lunda Norte" },
            { value: "Lunda Sul", label: "Lunda Sul" },
            { value: "Malanje", label: "Malanje" },
            { value: "Moxico", label: "Moxico" },
            { value: "Namibe", label: "Namibe" },
            { value: "Uíge", label: "Uíge" },
            { value: "Zaire", label: "Zaire" }
          ],
          placeholder: "Selecione a província", 
          validation: { required: "Obrigatório" } 
        },
        { name: "pais", label: "País", type: "text", required: true, question: "Em que país?", placeholder: "Ex: Angola", validation: { required: "Obrigatório" } }
      ]}
    />,

    <FormStep
      key="media"
      title="Mídia e Documentos"
      description="Imagens e arquivos da propriedade"
      fields={[
        { name: "image", label: "Imagem Principal", type: "file", accept: "image/*", question: "Adicione a foto de capa do imóvel", placeholder: "Foto de capa" },
        { name: "gallery", label: "Galeria", type: "file", accept: "image/*", multiple: true, question: "Quer adicionar mais fotos?", placeholder: "Fotos adicionais" },
        { name: "video_url", label: "Vídeo", type: "file", accept: "video/*", question: "Tem algum vídeo do imóvel?", placeholder: "Vídeo tour" },
        { name: "documents", label: "Documentos", type: "file", accept: ".pdf,.doc,.docx", multiple: true, question: "Documentação do imóvel", placeholder: "Documentação" }
      ]}
    />,

    <FormStep
      key="additional"
      title="Informações Adicionais"
      description="Detalhes extras"
      fields={[
        { name: "caracteristicas", label: "Comodidades", type: "text", question: "Que comodidades tem o imóvel?", placeholder: "Ex: piscina, jardim, varanda, churrasqueira" },
        { name: "detalhes_adicionais", label: "Infos Complementares", type: "textarea", question: "Algo mais que os interessados devam saber?", placeholder: "Detalhes sobre condomínio, taxas, regulamentos..." },
        { name: "nota_privada", label: "Notas Internas", type: "textarea", question: "Notas privadas para a sua equipe", placeholder: "Informações confidenciais que não serão publicadas" }
      ]}
    />
  ];

  // Accordion state
  const [openStepIndex, setOpenStepIndex] = useState<number | null>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleStepClick = (index: number) => {
    setOpenStepIndex(openStepIndex === index ? null : index);
  };

  const handleStepComplete = async (index: number) => {
    const fieldNames = steps[index].props.fields.map((field: any) => field.name);
    const isValidStep = await trigger(fieldNames as any);
    if (!isValidStep) return;

    if (!completedSteps.includes(index)) {
      setCompletedSteps(prev => [...prev, index]);
    }
    // Open next incomplete step
    const nextIncomplete = steps.findIndex((_, i) => i > index && !completedSteps.includes(i));
    setOpenStepIndex(nextIncomplete !== -1 ? nextIncomplete : null);
  };

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        reset();
        setOpenStepIndex(0);
        setCompletedSteps([]);
        setShowSuccess(false);
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, reset]);

  const onFormSubmit = async (data: PropertyFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    setSuccessMessage(null);

    try {
      const numericPrice = parseInt(data.price.toString().replace(/\D/g, ''), 10);
      const formData = { 
        ...data, 
        price: numericPrice,
        imobiliaria_id: selectedIdentity === 'agency' ? userAgency?.id : null
      };
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

  const calculateProgress = () => {
    return Math.round((completedSteps.length / steps.length) * 100);
  };

  const formValues = watch();
  const watchedImage = watch("image");
  const watchedPrice = watch("price");
  const watchedCurrency = watch("unidade_preco");
  const watchedAmenities = watch("caracteristicas");

  // Extração robusta do preview da imagem em tempo real
  const previewImage = useMemo(() => {
    const getFileFromSource = (source: any): File | string | null => {
      if (!source) return null;
      // Tratar FileList (comum em inputs de ficheiro)
      if (source instanceof FileList && source.length > 0) return source[0];
      // Tratar Array de Ficheiros
      if (Array.isArray(source) && source.length > 0) return source[0];
      // Tratar Ficheiro ou Blob único
      if (source instanceof File || (typeof Blob !== "undefined" && source instanceof Blob)) return source as File;
      // Tratar String (URL já existente)
      if (typeof source === "string" && source.length > 0) return source;
      
      return null;
    };

    const imageSource = getFileFromSource(watchedImage);
    const sourceObj = imageSource as any;

    if (sourceObj && (sourceObj instanceof File || (typeof Blob !== "undefined" && sourceObj instanceof Blob))) {
      try {
        return URL.createObjectURL(imageSource as Blob);
      } catch (e) {
        console.error("Erro ao criar URL de preview:", e);
        return null;
      }
    }
    return imageSource as string | null;
  }, [watchedImage]);
 
   // Limpeza de URLs temporárias para evitar fugas de memória
   useEffect(() => {
     return () => {
       if (previewImage && typeof previewImage === 'string' && previewImage.startsWith('blob:')) {
         URL.revokeObjectURL(previewImage);
       }
     };
   }, [previewImage]);

  // Compute how many fields to show for the active step (sequential reveal)
  const computeVisibleFields = () => {
    if (openStepIndex === null) return 0;
    const currentFields = steps[openStepIndex].props.fields;
    let count = 1;
    for (let i = 0; i < currentFields.length; i++) {
      const fieldName = currentFields[i].name as keyof typeof formValues;
      const val = formValues[fieldName];
      const isFilled = val !== undefined && val !== null && val !== '' && !(Array.isArray(val) && val.length === 0);
      if (isFilled) {
        count = Math.min(i + 2, currentFields.length);
      } else {
        break;
      }
    }
    return count;
  };

  const visibleFieldCount = computeVisibleFields();
  
  // Nova lógica: allFieldsFilled agora verifica se todos os campos OBRIGATÓRIOS estão preenchidos
  const allFieldsFilled = openStepIndex !== null && (steps[openStepIndex] as any).props.fields.every((f: any) => {
    if (!f.required) return true;
    const val = formValues[f.name as keyof typeof formValues];
    return val !== undefined && val !== null && val !== '' && !(Array.isArray(val) && val.length === 0);
  });

  const livePreviewProperty: any = {
    id: "preview-id",
    owner_id: userId || "",
    title: formValues.title || "Título atraente do seu imóvel",
    description: formValues.description || "A descrição da propriedade aparecerá aqui...",
    tipo: formValues.tipo || "apartamento",
    status: formValues.status || "comprar",
    price: typeof formValues.price === 'string' ? parseInt(String(formValues.price).replace(/\D/g, ''), 10) || 0 : formValues.price,
    unidade_preco: formValues.unidade_preco || "kwanza",
    rotulo: formValues.rotulo,
    endereco: formValues.endereco || "Sua Rua, Bairro, Cidade",
    bedrooms: Number(formValues.bedrooms) || 0,
    bathrooms: Number(formValues.bathrooms) || 0,
    garagens: Number(formValues.garagens) || 0,
    size: formValues.size?.toString() || "0",
    image: previewImage,
    gallery: [],
    caracteristicas: watchedAmenities || "",
  };

  return (
    <FormProvider {...methods}>
      {!hasMounted ? null : (
      <div className="max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6 h-auto lg:h-full min-h-[700px] lg:min-h-0">

        {/* LADO ESQUERDO: FORMULÁRIO (60% => col-span-3) */}
        <div className="lg:col-span-3 flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 relative h-full">
          
          {/* HEADER - muda conforme o modo */}
          <div className="p-6 lg:p-8 border-b border-gray-100 bg-gray-50/80 shrink-0">
            {openStepIndex !== null ? (
              /* Conversation Mode Header */
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setOpenStepIndex(null)}
                  className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-white hover:text-gray-900 transition-all hover:scale-105 shadow-sm shrink-0"
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <p className="text-[10px] text-purple-600 font-black uppercase tracking-widest mb-0.5">Passo {openStepIndex + 1} de {steps.length}</p>
                  <h2 className="text-lg font-bold text-gray-900">{steps[openStepIndex].props.title}</h2>
                </div>
              </div>
            ) : (
              /* List Mode Header */
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Cadastrar Imóvel</h2>
                  <div className="flex items-center gap-3">
                    <svg className="-rotate-90" height="18" viewBox="0 0 18 18" width="18">
                      <circle cx="9" cy="9" fill="none" r="7" strokeWidth="2.5" className="stroke-gray-200" pathLength="100" />
                      <circle cx="9" cy="9" fill="none" r="7" strokeWidth="2.5" className="stroke-purple-600" pathLength="100" strokeDasharray="100" strokeLinecap="round" style={{ strokeDashoffset: 100 - calculateProgress() }} />
                    </svg>
                    <span className="text-sm text-gray-500">
                      <span className="font-bold text-gray-900">{completedSteps.length}</span>
                      {' / '}
                      <span className="font-bold text-gray-900">{steps.length}</span>
                      {' '}concluídos
                    </span>
                  </div>
                </div>

                {/* Identity Selector */}
                {userAgency && userAgency.status === 'approved' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-5 p-1 bg-gray-100/50 backdrop-blur-sm rounded-[2rem] border border-gray-200/50 shadow-inner"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedIdentity('personal')}
                        className={`relative flex items-center gap-3 p-4 rounded-[1.8rem] transition-all duration-500 overflow-hidden group ${
                          selectedIdentity === 'personal'
                            ? "bg-white shadow-xl shadow-purple-500/10 border-white"
                            : "hover:bg-white/40 border-transparent"
                        }`}
                      >
                        <div className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center transition-transform duration-500 ${
                          selectedIdentity === 'personal' ? "bg-purple-600 text-white shadow-md shadow-purple-500/30" : "bg-white text-gray-400 shadow-sm"
                        }`}>
                          <UserCircle size={20} />
                        </div>
                        <div className="text-left relative z-10 overflow-hidden">
                          <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${selectedIdentity === 'personal' ? "text-purple-600" : "text-gray-400"}`}>
                            Pessoal
                          </p>
                          <p className={`font-extrabold text-xs truncate ${selectedIdentity === 'personal' ? "text-gray-900" : "text-gray-500"}`}>
                            {agentName}
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedIdentity('agency')}
                        className={`relative flex items-center gap-3 p-4 rounded-[1.8rem] transition-all duration-500 overflow-hidden group ${
                          selectedIdentity === 'agency'
                            ? "bg-white shadow-xl shadow-orange-500/10 border-white"
                            : "hover:bg-white/40 border-transparent"
                        }`}
                      >
                        <div className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center transition-transform duration-500 ${
                          selectedIdentity === 'agency' ? "bg-orange-500 text-white shadow-md shadow-orange-500/30" : "bg-white text-gray-400 shadow-sm"
                        }`}>
                          <Store size={20} />
                        </div>
                        <div className="text-left relative z-10 overflow-hidden">
                          <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${selectedIdentity === 'agency' ? "text-orange-600" : "text-gray-400"}`}>
                            Agência
                          </p>
                          <p className={`font-extrabold text-xs truncate ${selectedIdentity === 'agency' ? "text-gray-900" : "text-gray-500"}`}>
                            {userAgency.nome}
                          </p>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* FORM BODY */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <form onSubmit={handleSubmit(onFormSubmit)}>
              <input type="hidden" {...methods.register("owner_id")} />

              {serverError && (
                <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 shrink-0 rounded-full bg-red-500"></div>
                  {serverError}
                </div>
              )}


              {openStepIndex !== null ? (
                /* ========== CONVERSATION MODE ========== */
                <div className="p-6 lg:p-8">
                  <p className="text-sm text-gray-500 mb-6">{steps[openStepIndex].props.description}</p>
                  
                  <FormStep
                    key={`step-${openStepIndex}`}
                    {...steps[openStepIndex].props}
                    maxVisibleFields={visibleFieldCount}
                    showQuestions={true}
                    onStepComplete={allFieldsFilled ? () => handleStepComplete(openStepIndex) : undefined}
                    nextLabel={openStepIndex === steps.length - 1 ? 'Concluir Etapa' : 'Prosseguir'}
                  />

                </div>
              ) : (
                /* ========== LIST MODE (Accordion) ========== */
                <div className="py-2">
                  {steps.map((stepEl, index) => {
                    const isCompleted = completedSteps.includes(index);
                    const isFirst = index === 0;
                    const showBorderTop = !isFirst;

                    return (
                      <div
                        key={stepEl.key}
                        className={`${showBorderTop ? 'border-t border-gray-100' : ''}`}
                      >
                        <div
                          className="block w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                          onClick={() => handleStepClick(index)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleStepClick(index);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="relative flex items-center justify-between gap-3 py-4 px-6 hover:bg-gray-50/60 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="shrink-0">
                                {isCompleted ? (
                                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                                    <Check size={14} className="text-white" strokeWidth={3} />
                                  </div>
                                ) : (
                                  <Circle size={24} className="text-gray-300" strokeWidth={1.5} />
                                )}
                              </div>
                              <div>
                                <h4 className={`text-sm font-semibold ${isCompleted ? 'text-purple-600' : 'text-gray-900'}`}>
                                  {stepEl.props.title}
                                </h4>
                                <p className="text-xs text-gray-400 mt-0.5">{stepEl.props.description}</p>
                                
                                {/* Data Summary for Completed Steps */}
                                {isCompleted && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {index === 0 && formValues.title && (
                                      <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium border border-purple-100 italic line-clamp-1 max-w-[150px]">
                                        {formValues.title}
                                      </span>
                                    )}
                                    {index === 1 && (formValues.bedrooms || formValues.size) && (
                                      <div className="flex gap-2">
                                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium border border-blue-100">
                                          {formValues.bedrooms || 0} Qrt • {formValues.bathrooms || 0} Ban
                                        </span>
                                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium border border-indigo-100">
                                          {formValues.size || 0} m²
                                        </span>
                                      </div>
                                    )}
                                    {index === 2 && formValues.price && (
                                      <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium border border-green-100">
                                        {formValues.price} {formValues.unidade_preco === 'kwanza' ? 'Kz' : formValues.unidade_preco === 'dolar' ? 'USD' : '€'}
                                      </span>
                                    )}
                                    {index === 3 && formValues.bairro && (
                                      <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium border border-orange-100">
                                        {formValues.bairro}, {formValues.provincia}
                                      </span>
                                    )}
                                    {index === 4 && (
                                      <span className="text-[10px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full font-medium border border-gray-100 italic">
                                        Mídia e arquivos anexados
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <ArrowRight size={16} className="shrink-0 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* SUBMIT BUTTON */}
                  {completedSteps.length === steps.length && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="px-6 py-4"
                    >
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-6 py-5 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-700 to-orange-500 bg-[length:200%_auto] hover:bg-right transition-all duration-700 text-white font-bold shadow-xl shadow-purple-500/20 hover:shadow-orange-500/30 hover:-translate-y-1 flex items-center justify-center gap-2 text-lg active:scale-95"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Publicando Imóvel...
                          </>
                        ) : (
                          <>
                            <span>Finalizar e Publicar Imóvel</span>
                            <CheckCircle2 size={24} />
                          </>
                        )}
                      </button>
                    </motion.div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* LADO DIREITO: PREVIEW (40% => col-span-2) - ESCONDIDO NO MOBILE */}
        <div className="hidden lg:flex lg:col-span-2 flex-col relative items-center justify-center w-full h-full">
          {/* Fundo Decorativo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200 blur-3xl opacity-20 rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-200 blur-3xl opacity-20 rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

          {/* Componente Fake PropertyCard Desktop */}
          <div className="w-full max-w-[420px] relative z-10 rounded-3xl">
            {/* Badge de Preview estilo "À Venda" */}
            <div className="absolute top-4 right-4 z-50 bg-gradient-to-r from-purple-600 to-indigo-500 px-4 py-1.5 rounded-[2rem] text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-500/30 border border-white/20 backdrop-blur-sm">
              Preview do Imóvel
            </div>
            <PropertyCard property={livePreviewProperty} canBoost={false} isClickable={false} />
          </div>
        </div>

        {/* OVERLAY DE SUCESSO PREMIUM */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] flex items-center justify-center bg-white/95 backdrop-blur-md p-6"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300, delay: 0.1 }}
                className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-purple-500/10 border border-gray-100 p-8 text-center"
              >
                <div className="relative mx-auto w-24 h-24 mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="absolute inset-0 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30"
                  >
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -inset-4 bg-green-500/20 rounded-full -z-10"
                  />
                </div>

                <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
                  Parabéns! 🎉
                </h2>
                <p className="text-gray-600 font-medium mb-8 leading-relaxed">
                  O seu imóvel foi cadastrado com sucesso e já está em fase de revisão pela nossa equipa.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      reset();
                      setOpenStepIndex(0);
                      setCompletedSteps([]);
                      setShowSuccess(false);
                      setSuccessMessage(null);
                    }}
                    className="w-full py-4 rounded-2xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-all hover:shadow-lg hover:shadow-purple-500/20 active:scale-95"
                  >
                    Cadastrar Outro Imóvel
                  </button>
                  <button
                    onClick={() => {
                      window.location.href = '/dashboard';
                    }}
                    className="w-full py-4 rounded-2xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-all active:scale-95 text-sm"
                  >
                    Ir para o meu Painel
                  </button>
                </div>

                <p className="mt-6 text-xs text-gray-400 font-medium">
                  KerCasa • O seu imóvel em boas mãos
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
      </div>
    </FormProvider>
  );

};

export default MultiStepForm;
