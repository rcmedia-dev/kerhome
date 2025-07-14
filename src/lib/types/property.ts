import { z } from "zod";
import { JsonValue } from "@prisma/client/runtime/library";

export type PropertyResponse = {
  id: string;
  ownerId: string;

  title: string;
  description: string;
  tipo: string;
  status: string;
  rotulo: string | null;

  price: number | null;
  unidade_preco: string | null;
  preco_antes: number | null;
  preco_depois: number | null;
  preco_chamada: string | null;

  caracteristicas: JsonValue | null;
  size: string | null;
  area_terreno: number | null;

  bedrooms: number | null;
  bathrooms: number | null;
  garagens: number | null;
  garagemtamanho: string | null;

  anoconstrucao: number | null;
  propertyid: string | null;
  detalhesadicionais: JsonValue | null;

  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  provincia: string | null;
  pais: string | null;
  notaprivada: string | null;

  gallery: string[];
  image: string | null;

  createdAt: Date;
  updatedAt: Date;
};

export type PrismaProperty = {
  id: string;
  ownerId: string;

  title: string;
  description: string;
  tipo: string;
  status: string;
  rotulo: string | null;

  price: number | null;
  unidade_preco: string | null;
  preco_antes: number | null;
  preco_depois: number | null;
  preco_chamada: string | null;

  caracteristicas: JsonValue | null;
  size: string | null;
  area_terreno: number | null;

  bedrooms: number | null;
  bathrooms: number | null;
  garagens: number | null;
  garagemtamanho: string | null;

  anoconstrucao: number | null;
  propertyid: string | null;
  detalhesadicionais: JsonValue | null;

  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  provincia: string | null;
  pais: string | null;
  notaprivada: string | null;

  gallery: string[];
  image: string | null;

  createdAt: Date;
  updatedAt: Date;
};

// Define o schema com Zod
const propertySchema = z.object({
  id: z.string(),
  ownerId: z.string(),

  title: z.string(),
  description: z.string(),
  tipo: z.string(),
  status: z.string(),
  rotulo: z.string().nullable(),

  price: z.number().nullable(),
  unidade_preco: z.string().nullable(),
  preco_antes: z.number().nullable(),
  preco_depois: z.number().nullable(),
  preco_chamada: z.string().nullable(),

  caracteristicas: z.array(z.string()).nullable().or(z.unknown()).transform((val) => {
    if (Array.isArray(val) && val.every((v) => typeof v === "string")) {
      return val;
    }
    return null;
  }),

  size: z.string().nullable(),
  area_terreno: z.number().nullable(),

  bedrooms: z.number().nullable(),
  bathrooms: z.number().nullable(),
  garagens: z.number().nullable(),
  garagemtamanho: z.string().nullable(),

  anoconstrucao: z.number().nullable(),
  propertyid: z.string().nullable(),
  detalhesadicionais: z.array(z.object({
    titulo: z.string(),
    valor: z.string(),
  })).nullable(),

  endereco: z.string().nullable(),
  bairro: z.string().nullable(),
  cidade: z.string().nullable(),
  provincia: z.string().nullable(),
  pais: z.string().nullable(),
  notaprivada: z.string().nullable(),

  gallery: z.array(z.string()),
  image: z.string().nullable(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export function parsePrismaProperties(data: any[]): PropertyResponse[] {
  return data.map((item) => {
    const parsed = propertySchema.safeParse(item);

    if (!parsed.success) {
      console.warn("Erro ao validar propriedade:", parsed.error);
      return null;
    }

    return parsed.data as PropertyResponse;
  }).filter((item): item is PropertyResponse => item !== null);
}
