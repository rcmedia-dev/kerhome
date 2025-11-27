/**
 * Schemas de validação usando Zod
 * Centralizar validações em um único lugar
 */

import { z } from 'zod';

// ========== SCHEMAS DE PROPRIEDADE ==========

export const PropertyStatusSchema = z.enum(['arrendar', 'comprar']);
export const PropertyTypeSchema = z.enum(['Apartamento', 'Casa', 'Prédio', 'Vivenda']);
export const PriceUnitSchema = z.enum(['Kwanza', 'Dólar', 'Euro']);
export const PriceCallSchema = z.enum(['Preço Fixo', 'Preço Negociável', 'Sob Consulta']);

export const CreatePropertySchema = z.object({
  title: z
    .string()
    .min(5, 'Título deve ter no mínimo 5 caracteres')
    .max(200, 'Título deve ter no máximo 200 caracteres'),
  description: z
    .string()
    .min(10, 'Descrição deve ter no mínimo 10 caracteres')
    .optional(),
  tipo: PropertyTypeSchema,
  status: PropertyStatusSchema,
  price: z
    .number()
    .min(0, 'Preço não pode ser negativo')
    .max(999999999, 'Preço muito alto'),
  preco_chamada: PriceCallSchema,
  unidade_preco: PriceUnitSchema,
  bedrooms: z
    .number()
    .int()
    .min(0, 'Quartos não podem ser negativos')
    .max(50, 'Quartos muito alto'),
  bathrooms: z
    .number()
    .int()
    .min(0, 'Banheiros não podem ser negativos')
    .max(50, 'Banheiros muito alto'),
  size: z
    .number()
    .min(0, 'Tamanho não pode ser negativo')
    .max(999999, 'Tamanho muito grande'),
  endereco: z
    .string()
    .min(5, 'Endereço muito curto')
    .max(255, 'Endereço muito longo'),
  cidade: z.string().optional(),
  bairro: z.string().optional(),
  provincia: z.string().optional(),
  pais: z.string().optional(),
  area_terreno: z.number().optional(),
  ano_construcao: z.number().int().optional(),
  garagens: z.number().int().min(0).optional(),
  caracteristicas: z.array(z.string()).optional(),
  is_featured: z.boolean().optional(),
  video_url: z.string().url().optional().or(z.literal('')),
  nota_privada: z.string().optional(),
});

export const UpdatePropertySchema = CreatePropertySchema.partial();

// ========== SCHEMAS DE USUÁRIO ==========

export const UserProfileSchema = z.object({
  primeiro_nome: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome muito longo'),
  ultimo_nome: z
    .string()
    .min(2, 'Sobrenome deve ter no mínimo 2 caracteres')
    .max(100, 'Sobrenome muito longo'),
  email: z.string().email('Email inválido'),
  telefone: z
    .string()
    .regex(/^\+?[0-9\s-()]+$/, 'Telefone inválido')
    .optional()
    .or(z.literal('')),
  empresa: z.string().optional(),
  website: z
    .string()
    .url('Website inválido')
    .optional()
    .or(z.literal('')),
  sobre_mim: z
    .string()
    .max(1000, 'Sobre mim muito longo')
    .optional(),
  facebook: z.string().optional(),
  linkedin: z.string().optional(),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
});

export const CreateUserSchema = UserProfileSchema.extend({
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter número'),
});

export const UpdateUserSchema = UserProfileSchema.partial();

// ========== SCHEMAS DE MENSAGEM ==========

export const CreateMessageSchema = z.object({
  subject: z
    .string()
    .min(3, 'Assunto deve ter no mínimo 3 caracteres')
    .max(100, 'Assunto muito longo'),
  message: z
    .string()
    .min(10, 'Mensagem deve ter no mínimo 10 caracteres')
    .max(5000, 'Mensagem muito longa'),
  email: z.string().email('Email inválido'),
  telefone: z
    .string()
    .regex(/^\+?[0-9\s-()]+$/, 'Telefone inválido')
    .optional(),
});

// ========== SCHEMAS DE BUSCA ==========

export const PropertySearchSchema = z.object({
  query: z.string().optional(),
  city: z.string().optional(),
  type: PropertyTypeSchema.optional(),
  status: PropertyStatusSchema.optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// ========== TYPES INFERIDOS ==========

export type CreateProperty = z.infer<typeof CreatePropertySchema>;
export type UpdateProperty = z.infer<typeof UpdatePropertySchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type CreateMessage = z.infer<typeof CreateMessageSchema>;
export type PropertySearch = z.infer<typeof PropertySearchSchema>;

/**
 * Função helper para validar dados
 * 
 * @example
 * ```tsx
 * const result = validateData(CreatePropertySchema, propertyData);
 * if (!result.success) {
 *   console.error(result.error);
 * } else {
 *   console.log(result.data);
 * }
 * ```
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ReturnType<z.ZodSchema<T>['safeParse']> {
  return schema.safeParse(data as any);
}
