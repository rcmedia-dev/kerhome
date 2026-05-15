import React from 'react';
import FormStep from "@/components/form-step";

export const getFormSteps = () => {
  return [
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
          question: "Quantos quartos tem?",
          placeholder: "Ex: 3",
          validation: { min: { value: 0, message: "Não pode ser negativo" } }
        },
        {
          name: "bathrooms",
          label: "Número de Banheiros",
          type: "number",
          question: "E casas de banho?",
          placeholder: "Ex: 2",
          validation: { min: { value: 0, message: "Não pode ser negativo" } }
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
              if (value === undefined || value === null) return "Preço é obrigatório";
              const numericValue = parseInt(value.toString().replace(/\s/g, ''), 10);
              return (!isNaN(numericValue) && numericValue >= 10000) || "Preço deve ser no mínimo 10.000";
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
};
