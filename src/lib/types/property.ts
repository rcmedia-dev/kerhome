import { z } from 'zod';

// Schema para detalhes adicionais
export const detalheAdicionalSchema = z.object({
  titulo: z.string(),
  valor: z.string(),
});

// Schema principal da propriedade (para resposta / backend)
export const propertySchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  title: z.string(),
  description: z.string(),
  tipo: z.string(),
  status: z.string(), // "para comprar" ou "para alugar"
  rotulo: z.string(),
  price: z.number(),
  unidade_preco: z.string(),
  preco_antes: z.number().optional(),
  preco_depois: z.number().optional(),
  preco_chamada: z.string().optional(),
  caracteristicas: z.array(z.string()),
  size: z.union([z.string(), z.number()]),
  area_terreno: z.number().optional(),
  bedrooms: z.number(),
  bathrooms: z.number(),
  garagens: z.number().optional(),
  garagemtamanho: z.union([z.string(), z.number()]).optional(),
  anoconstrucao: z.number().optional(),
  propertyid: z.string().optional(),
  detalhesadicionais: z.array(detalheAdicionalSchema).optional(),
  endereco: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string(),
  provincia: z.string(),
  pais: z.string(),
  notaprivada: z.string().optional(),
  gallery: z.array(z.string().url()),
  image: z.string().url(),
});

// Schema para formulário (validação com React Hook Form + Server Action)
export const upPropertySchema = z.object({
  ownerId: z.string(),
  titulo: z.string().min(1, "Título obrigatório"),
  descricao: z.string().min(1, "Descrição obrigatória"),
  tipo: z.string().min(1),
  status: z.enum(["para comprar", "para alugar"]),
  rotulo: z.string().optional(),
  preco: z.coerce.number().nonnegative("Preço inválido"),
  unidade_preco: z.string().optional(),
  preco_antes: z.coerce.number().optional(),
  preco_depois: z.coerce.number().optional(),
  preco_chamada: z.string().optional(),
  caracteristicas: z.array(z.string()).optional(),
  size: z.string().optional(),
  area_terreno: z.coerce.number().optional(),
  bedrooms: z.coerce.number().optional(),
  bathrooms: z.coerce.number().optional(),
  garagens: z.coerce.number().optional(),
  garagemtamanho: z.string().optional(),
  anoconstrucao: z.coerce.number().optional(),
  notaprivada: z.string().optional(),

  pais: z.string().optional(),
  provincia: z.string().optional(),
  cidade: z.string().optional(),
  bairro: z.string().optional(),
  endereco: z.string().optional(),

  detalhesadicionais: z
    .array(z.object({ titulo: z.string(), valor: z.string() }))
    .optional(),

  galleryFiles: z.any().optional(), // arquivos FormData para Supabase
});

// Tipos inferidos automaticamente
export type PropertyFormData = z.infer<typeof upPropertySchema>;
export type PropertyResponse = z.infer<typeof propertySchema>;
