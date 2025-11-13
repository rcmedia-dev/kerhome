import z from "zod";
import { propertyResponseSchema, ownerSchema } from "./property";

// types/property.ts
export interface MixedProperty {
  // Campos básicos da propriedade
  id: string;
  owner_id: string;
  title: string;
  description: string;
  tipo: string;
  status: string;
  rotulo: string;
  price: number;
  unidade_preco: string;
  preco_chamada: string;
  size: string;
  area_terreno: number;
  bedrooms: number;
  bathrooms: number;
  garagens: number;
  garagem_tamanho: string;
  ano_construcao: number;
  propertyid: string;
  endereco: string;
  bairro: string;
  cidade: string;
  provincia: string;
  pais: string;
  nota_privada: string;
  image: string;
  gallery: string[];
  caracteristicas: any;
  detalhes_adicionais: any;
  created_at: string;
  updated_at: string;
  aprovement_status: string;
  video_url: string;
  is_featured: boolean;
  rejection_reason: string;
  documents: string[];
  views_count: number;
  
  // Campos do boost
  boost_id?: number;
  boost_plan?: string;
  boost_status?: string;
  boost_views?: number;
  boost_clicks?: number;
  boost_start?: string;
  boost_end?: string;
  is_active_boost?: boolean;
  
  // Campos de ordenação
  weight: number;
  is_boosted: boolean;
}

export interface BoostStats {
  total_boosted: number;
  premium_count: number;
  standard_count: number;
  basic_count: number;
  expired_count: number;
  total_properties: number;
}

// Crie um schema simplificado para a resposta da API
export const propertyResponseSchemaSimplified = z.object({
  id: z.string(),
  owner_id: z.string(),

  title: z.string(),
  description: z.string(),
  tipo: z.string(),
  status: z.string(),
  rotulo: z.string().nullable(),

  price: z.coerce.number().nullable(),
  unidade_preco: z.string().nullable(),
  preco_chamada: z.string().nullable(),

  caracteristicas: z.union([
    z.array(z.string()),
    z.string(),
    z.null()
  ]).transform((val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return [val];
    return null;
  }),

  size: z.string().nullable(),
  area_terreno: z.coerce.number().nullable(),
  bedrooms: z.number().nullable(),
  bathrooms: z.number().nullable(),
  garagens: z.number().nullable(),
  garagemtamanho: z.string().nullable(),

  anoconstrucao: z.coerce.number().min(1888, "Ano de construção deve ser válido").nullable(),
  propertyid: z.string().nullable(),

  detalhesadicionais: z.array(z.object({
    titulo: z.string(),
    valor: z.string()
  })).nullable(),

  endereco: z.string(),
  bairro: z.string().nullable(),
  cidade: z.string(),
  provincia: z.string(),
  pais: z.string(),

  notaprivada: z.string().nullable(),
  aprovement_status: z.string(),

  gallery: z.array(z.string()),
  image: z.string().nullable(),

  createdAt: z.string().or(z.date()),

  // 🔥 SCHEMA SIMPLIFICADO DO OWNER - apenas campos que vêm da query
  owner: z.object({
    id: z.string(),
    primeiro_nome: z.string().nullable(),
    ultimo_nome: z.string().nullable(),
    email: z.string().nullable(),
    telefone: z.string().nullable(),
    avatar_url: z.string().nullable(),
    created_at: z.string().or(z.date()).nullable(),
  })
});

// Ou, se preferir manter o schema original, crie um transform
export const propertyResponseSchemaWithTransform = propertyResponseSchema.extend({
  owner: ownerSchema.optional().transform((owner) => {
    // Se owner não existe, retorna um objeto vazio com campos padrão
    if (!owner) {
      return {
        id: '',
        email: '',
        password: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        primeiro_nome: '',
        ultimo_nome: '',
        username: '',
        telefone: '',
        empresa: '',
        licenca: '',
        website: '',
        facebook: '',
        linkedin: '',
        instagram: '',
        youtube: '',
        sobre_mim: '',
      };
    }
    return owner;
  })
});