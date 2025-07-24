import { z } from 'zod';

export const favoritedPropertyResponseSchema = z.object({
  id: z.string().uuid(),
  propertyid: z.string(),
  title: z.string(),
  description: z.string(),
  endereco: z.string(),
  pais: z.string().nullable(),
  provincia: z.string().nullable(),
  cidade: z.string().nullable(),
  bairro: z.string().nullable(),
  tipo: z.string(),
  status: z.string(),
  rotulo: z.string().nullable(),

  price: z.coerce.number().nullable(),
  unidade_preco: z.string().nullable(),
  preco_chamada: z.string().nullable(),

  caracteristicas: z.array(z.string()).nullable(),

  size: z.string(),
  area_terreno: z.coerce.number().nullable(),
  bedrooms: z.coerce.number(),
  bathrooms: z.coerce.number(),
  garagens: z.coerce.number(),
  garagemtamanho: z.string(),

  anoconstrucao: z.union([z.number(), z.string()]),

  notaprivada: z.string().optional(),

  detalhesadicionais: z.array(
    z.object({
      titulo: z.string().optional(),
      valor: z.string().optional(),
    })
  ).optional(),

  image: z.string().url(),
  gallery: z.array(z.string().url()),

  createdAt: z.union([z.string(), z.date()]),

  ownerId: z.string().uuid(),

  owner: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    password: z.string(),
    createdAt: z.union([z.string(), z.date()]),
    updatedAt: z.union([z.string(), z.date()]),

    primeiro_nome: z.string().nullable().optional(),
    ultimo_nome: z.string().nullable().optional(),
    username: z.string().nullable().optional(),
    telefone: z.string().nullable().optional(),
    empresa: z.string().nullable().optional(),
    licenca: z.string().nullable().optional(),
    website: z.string().nullable().optional(),
    facebook: z.string().nullable().optional(),
    linkedin: z.string().nullable().optional(),
    instagram: z.string().nullable().optional(),
    youtube: z.string().nullable().optional(),
    sobre_mim: z.string().nullable().optional(),
    pacote_agente: z.enum(['BASICO', 'PADRAO', 'PREMIUM']).nullable().optional(),
  }),
});
export type TFavoritedPropertyResponseSchema = z.infer<typeof favoritedPropertyResponseSchema>;