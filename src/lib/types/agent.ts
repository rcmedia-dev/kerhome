import { z } from 'zod';
import { propertyResponseSchema } from './property';

export const planoAgenteSchema = z.object({
  id: z.string(),
  nome: z.string(),
  limite: z.number(),
  restante: z.number(),
  destaques: z.boolean(),
  destaquesPermitidos: z.number().default(1),
  criadoEm: z.string(), // ou z.coerce.date() se já estiver como Date
  atualizadoEm: z.string(),
});

export const faturaSchema = z.object({
  id: z.string(),
  valor: z.number(),
  status: z.string(),
  servico: z.string(),
  criadoEm: z.string(),
});

export const mensagemRecebidaSchema = z.object({
  id: z.string(),
  conteudo: z.string(),
  criadoEm: z.string(),
  deId: z.string(),
});

export const mensagemEnviadaSchema = z.object({
  id: z.string(),
  conteudo: z.string(),
  criadoEm: z.string(),
  paraId: z.string(),
});

export const agentSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),

  primeiro_nome: z.string().optional(),
  ultimo_nome: z.string().optional(),
  username: z.string().optional(),
  telefone: z.string().optional(),
  empresa: z.string().optional(),
  licenca: z.string().optional(),
  website: z.string().optional(),
  facebook: z.string().optional(),
  linkedin: z.string().optional(),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
  sobre_mim: z.string().optional(),
  avatar: z.string().url().optional(),

  pacote_agente: planoAgenteSchema.optional(),

  properties: z.array(propertyResponseSchema).optional(),
  imoveisGuardados: z.array(propertyResponseSchema).optional(),
  faturas: z.array(faturaSchema).optional(),

  mensagensEnviadas: z.array(mensagemEnviadaSchema).optional(),
  mensagensRecebidas: z.array(mensagemRecebidaSchema).optional(),
});

// Enum de planos, incluindo o gratuito
export enum Plano {
  Free = "FREE",
  Basico = "BÁSICO",
  Professional = "PROFESSIONAL",
  Super = "SUPER",
}

export interface UserPlan {
  id?: string;
  nome: string;
  limite: number;
  restante: number;
  destaques: boolean;
  destaques_permitidos: number;
  userId?: string;
  criadoEm?: Date;
  updated_at?: Date;
}

export type Agent = z.infer<typeof agentSchema>;
export type Fatura = z.infer<typeof faturaSchema>;
export type PlanoAgente = z.infer<typeof planoAgenteSchema>;
