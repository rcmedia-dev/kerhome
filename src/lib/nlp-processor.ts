import { SearchParams } from '@/types/ai-actions';

const TIPO_MAP: Record<string, string> = {
  vivenda: 'Vivenda', moradia: 'Vivenda',
  casa: 'Casa', casinha: 'Casa', residência: 'Casa', residencia: 'Casa', sobrado: 'Casa',
  apartamento: 'Apartamento', ap: 'Apartamento', flat: 'Apartamento', andar: 'Apartamento',
  terreno: 'Terreno', lote: 'Terreno',
  quitinete: 'Quitinete', kitnet: 'Quitinete', studio: 'Quitinete',
  loja: 'Comercial', escritório: 'Comercial', escritorio: 'Comercial',
};

const STATUS_MAP: Record<string, string> = {
  arrendar: 'arrendar', alugar: 'arrendar', arrendamento: 'arrendar', renda: 'arrendar',
  comprar: 'comprar', compra: 'comprar', aquisição: 'comprar', adquirir: 'comprar', vender: 'comprar', venda: 'comprar',
};

const CIDADE_MAP: Record<string, string> = {
  luanda: 'Luanda', talatona: 'Luanda', belas: 'Luanda', kilamba: 'Luanda',
  benguela: 'Benguela', lubango: 'Lubango', huambo: 'Huambo', lobito: 'Lobito',
  cabinda: 'Cabinda', viana: 'Luanda', cacuaco: 'Luanda',
};

export class NLPProcessor {
  extractParams(message: string): SearchParams {
    const msg = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const params: SearchParams = {};

    for (const [key, tipo] of Object.entries(TIPO_MAP)) {
      if (msg.includes(key)) { params.tipo = tipo; break; }
    }

    for (const [key, status] of Object.entries(STATUS_MAP)) {
      if (msg.includes(key)) { params.status = status; break; }
    }

    const quartosMatch = msg.match(/t\s*(\d+)/i) || msg.match(/(\d+)\s*quartos?/i) || msg.match(/(\d+)\s*q/i);
    if (quartosMatch) params.quartos = parseInt(quartosMatch[1]);

    const rangeMatch = msg.match(/(\d+)\s*(?:a|ou|e)\s*(\d+)\s*quartos?/i);
    if (rangeMatch) {
      params.quartos_min = parseInt(rangeMatch[1]);
      params.quartos_max = parseInt(rangeMatch[2]);
    }

    this.extractPrice(msg, params);
    this.extractLocation(msg, params);
    this.extractKeywords(msg, params);

    return params;
  }

  private extractPrice(msg: string, params: SearchParams) {
    const patterns = [
      { re: /(?:ate|maximo|no maximo)\s*(?:de\s*)?(\d+)\s*(milhoes?|mil|m|k)/i, isRange: true, isMin: false },
      { re: /(?:acima|mais de)\s*(\d+)\s*(milhoes?|mil|m|k)/i, isRange: true, isMin: true },
      { re: /(?:entre|de)\s*(\d+)\s*(?:a|e)\s*(\d+)\s*(milhoes?|mil|m|k)/i, isRange: false, isMin: true },
    ];

    for (const p of patterns) {
      const match = msg.match(p.re);
      if (!match) continue;
      if (p.re.source.includes('(?:a|e)') && match.length >= 4) {
        params.preco_min = this.parsePrice(match[1], match[3]);
        params.preco_max = this.parsePrice(match[2], match[3]);
      } else if (p.isRange) {
        const val = this.parsePrice(match[1], match[2]);
        if (p.isMin) params.preco_min = val;
        else params.preco_max = val;
      }
    }

    const singleMatch = msg.match(/(\d+)\s*(milhoes?|mil|m|k)/i);
    if (singleMatch && params.preco_max == null && params.preco_min == null) {
      params.preco_max = this.parsePrice(singleMatch[1], singleMatch[2]);
    }

    if (msg.includes('barato') || msg.includes('economico') || msg.includes('acessivel')) {
      params.preco_max = params.preco_max || 30000000;
    }
    if (msg.includes('luxo') || msg.includes('alto padrao') || msg.includes('premium')) {
      params.preco_min = params.preco_min || 100000000;
    }
  }

  private parsePrice(val: string, unit: string): number {
    const num = parseInt(val);
    const u = (unit || '').toLowerCase();
    if (u.includes('milhao') || u === 'm') return num * 1000000;
    if (u.includes('mil') || u === 'k') return num * 1000;
    return num;
  }

  private extractLocation(msg: string, params: SearchParams) {
    for (const [key, cidade] of Object.entries(CIDADE_MAP)) {
      if (msg.includes(key)) { params.cidade = cidade; break; }
    }

    if (msg.includes('centro') || msg.includes('capital')) {
      params.cidade = params.cidade || 'Luanda';
    }
  }

  private extractKeywords(msg: string, params: SearchParams) {
    const features = ['piscina', 'condominio', 'seguranca', 'vista mar', 'praia',
      'orla', 'ginasio', 'jardim', 'quintal', 'varanda', 'terraco',
      'churrasqueira', 'estacionamento', 'elevador', 'suite', 'suites'];

    const found = features.filter(f => msg.includes(f));

    const tokens = msg.split(/\s+/).filter(t => t.length > 2);
    const known = [...Object.keys(TIPO_MAP), ...Object.keys(STATUS_MAP), ...Object.keys(CIDADE_MAP),
      'ate', 'maximo', 'entre', 'comprar', 'arrendar', 'quero', 'para', 'por', 'nao', 'com',
      ...features];

    const keywords = tokens.filter(t => !known.some(k => t.includes(k)));
    const all = [...found, ...keywords.filter(k => !found.includes(k))];

    if (all.length > 0) params.q = all.join(' ');
  }
}
