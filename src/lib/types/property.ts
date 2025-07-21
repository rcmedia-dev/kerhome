import { z } from 'zod';



export const propriedadeSchema = z.object({
  titulo_da_propriedade: z.string().min(1, "Título é obrigatório"),
  descricao_da_propriedade: z.string().min(1, "Descrição é obrigatória"),
  endereco_da_propriedade: z.string().min(1, "Endereço é obrigatório"),
  pais_da_propriedade: z.string().min(1, "País é obrigatório"),
  provincia_da_propriedade: z.string().min(1, "Província é obrigatória"),
  cidade_da_propriedade: z.string().min(1, "Cidade é obrigatória"),
  bairro_da_propriedade: z.string().optional(),

  tipo_da_propriedade: z.string().min(1, "Tipo de propriedade é obrigatório"),
  estatus_da_propriedade: z.string().min(1, "Estado é obrigatório"),
  rotulo_da_propriedade: z.string().min(1, "Rótulo é obrigatório"),

  preco_da_propriedade: z.union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, "Preço da propriedade é obrigatório e deve ser um número válido"),

  unidade_preco_da_propriedade: z.string().optional(),
  preco_chamada_da_propriedade: z.string().optional(),

  caracteristicas: z.array(z.string()).optional(),

  tamanho_da_propriedade: z.string().optional(),
  area_terreno_da_propriedade: z.string().optional(),
  quartos_da_propriedade: z.string().optional(),
  casas_banho_da_propriedade: z.string().optional(),
  garagens_da_propriedade: z.string().optional(),
  tamanho_garagen_da_propriedade: z.string().optional(),

  ano_construcao_da_propriedade: z.string().min(1, "Ano de construção é obrigatório"),

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

  imagem_360_da_propriedade: z.boolean().optional(),
  nota_da_propriedade: z.string().optional(),
});

export type TPropriedadeFormData= z.infer<typeof propriedadeSchema>;

