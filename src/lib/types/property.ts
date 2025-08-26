import { z } from 'zod';



export const propriedadeSchema = z.object({
  titulo_da_propriedade: z.string().min(1, "Título é obrigatório"),
  descricao_da_propriedade: z.string().min(1, "Descrição é obrigatória"),
  endereco_da_propriedade: z.string().min(1, "Endereço é obrigatório"),
  pais_da_propriedade: z.string().min(1, "País é obrigatório"),
  provincia_da_propriedade: z.string().min(1, "Província é obrigatória"),
  cidade_da_propriedade: z.string().min(1, "A cidade é obrigatória"),
  bairro_da_propriedade: z.string().optional(),

  tipo_da_propriedade: z.string().min(1, "Tipo de propriedade é obrigatório"),
  estatus_da_propriedade: z.string().min(1, "Estado é obrigatório"),
  rotulo_da_propriedade: z.string().min(1, "Rótulo é obrigatório"),

  preco_da_propriedade: z.coerce.number(),
  unidade_preco_da_propriedade: z.string(),
  preco_chamada_da_propriedade: z.string().optional(),

  caracteristicas: z.array(z.string()).optional(),

  tamanho_da_propriedade: z.string().optional(),
  area_terreno_da_propriedade: z.string().optional(),
  quartos_da_propriedade: z.string().optional(),
  casas_banho_da_propriedade: z.string().optional(),
  garagens_da_propriedade: z.string().optional(),
  tamanho_garagen_da_propriedade: z.string().optional(),

  ano_construcao_da_propriedade: z.coerce.number()
    .min(1800, 'O ano deve ser posterior a 1800')
    .max(new Date().getFullYear(), 'O ano não pode ser no futuro')
    .optional(),

  id_da_propriedade: z.string().min(1, "ID da propriedade é obrigatório"),

  detalhes: z.array(
    z.object({
      titulo: z.string().optional(),
      valor: z.string().optional(),
    })
  ),

  imagens_da_propriedade: z
    .any()
    .refine((files) => files && files.length > 0, "Pelo menos uma imagem é obrigatória"),

  documentos_da_propriedade: z
    .any()
    .refine((files) => files && files.length > 0, "Pelo menos um documento é obrigatório"),

  video_da_propriedade: z.any().optional(),

  imagem_360_da_propriedade: z.string().optional(),
  nota_da_propriedade: z.string().optional(),
});

export type TPropriedadeFormData= z.infer<typeof propriedadeSchema>;

export const ownerSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string(), // geralmente não enviado para o frontend — considere remover no backend
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  primeiro_nome: z.string().nullable(),
  ultimo_nome: z.string().nullable(),
  username: z.string().nullable(),
  telefone: z.string().nullable(),
  empresa: z.string().nullable(),
  licenca: z.string().nullable(),
  website: z.string().nullable(),
  facebook: z.string().nullable(),
  linkedin: z.string().nullable(),
  instagram: z.string().nullable(),
  youtube: z.string().nullable(),
  sobre_mim: z.string().nullable(),
});

export const propertyResponseSchema = z.object({
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
    z.string(), // aceita string simples também
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

  gallery: z.array(z.string()),
  image: z.string().nullable(),

  createdAt: z.string().or(z.date()),

  owner: ownerSchema,
});

// Schema para validação
export const faturaSchema = z.object({
  id: z.string(),
  servico: z.string(),
  valor: z.number(),
  status: z.enum(['pago', 'pendente']),
  created_at: z.string()
});

export type Fatura = z.infer<typeof faturaSchema>;

export type TPropertyResponseSchema = z.infer<typeof propertyResponseSchema>;

export type PropertyWithViews = TPropertyResponseSchema & {
  total_views: number;
};