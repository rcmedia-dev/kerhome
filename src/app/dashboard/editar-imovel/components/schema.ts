import * as z from 'zod';

const numberOrNull = z.preprocess(
  (val) => {
    if (val === '' || val === null || val === undefined) return null;
    return Number(val);
  },
  z.number().nullable().optional()
);

export const propertySchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  tipo: z.string().optional(),
  status: z.string().optional(),
  price: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null;
      return Number(val);
    },
    z.number().min(10000, 'O preço deve ser no mínimo 10.000').nullable().optional()
  ),
  bedrooms: numberOrNull,
  bathrooms: numberOrNull,
  size: z.string().nullable().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  bairro: z.string().optional(),
  caracteristicas: z.array(z.string()).optional(),
  detalhes_adicionais: z.array(
    z.object({
      titulo: z.string(),
      valor: z.string()
    })
  ).optional(),
  ano_construcao: numberOrNull,
  area_terreno: numberOrNull,
  garagens: numberOrNull,
  garagem_tamanho: z.string().optional(),
  pais: z.string().optional(),
  provincia: z.string().optional(),
  rotulo: z.string().optional(),
  preco_chamada: z.string().optional(),
  unidade_preco: z.string().optional(),
  coverFile: z.any().nullable().optional(),
  galleryFiles: z.any().nullable().optional(),
  image: z.string().nullable().optional(),
  gallery: z.array(z.string()).nullable().optional(),
  video_url: z.string().optional(),
  is_featured: z.boolean().optional(),
  nota_privada: z.string().optional(),
});

// For hook form we need the output type
export type PropertyDataSchema = z.infer<typeof propertySchema>;
