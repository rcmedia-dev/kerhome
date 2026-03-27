export interface Imobiliaria {
  id: string;
  nome: string;
  slug: string;
  descricao?: string;
  logo?: string;
  telefone?: string;
  email?: string;
  website?: string;
  whatsapp?: string;
  cidade: string;
  bairro?: string;
  endereco?: string;
  ano_fundacao?: number;
  verificada: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  
  // Campos virtuais para contagem de imóveis
  _count_imoveis?: number;
  propertyCount?: number;
  total_imoveis?: number;
}

