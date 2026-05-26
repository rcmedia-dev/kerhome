import { SearchParams } from '@/types/ai-actions';

export class PropertyMatcher {
  findMatches(properties: Record<string, unknown>[], params: SearchParams): Record<string, unknown>[] {
    let filtered = properties.filter(p => {
      if (params.tipo && !this.matchesField(p.tipo, params.tipo)) return false;
      if (params.cidade && !this.matchesField(p.cidade, params.cidade)) return false;
      if (params.bairro && !this.matchesField(p.bairro, params.bairro)) return false;
      if (params.quartos != null && Number(p.bedrooms) !== params.quartos) return false;
      if (params.quartos_min != null && Number(p.bedrooms) < params.quartos_min) return false;
      if (params.quartos_max != null && Number(p.bedrooms) > params.quartos_max) return false;
      if (params.banheiros != null && Number(p.bathrooms) < params.banheiros) return false;
      if (params.garagens != null && Number(p.garagens) < params.garagens) return false;
      if (params.area_min != null && (Number(p.size) || 0) < params.area_min) return false;
      if (params.area_max != null && (Number(p.size) || 0) > params.area_max) return false;
      if (params.preco_min != null && Number(p.price) < params.preco_min) return false;
      if (params.preco_max != null && Number(p.price) > params.preco_max) return false;
      if (params.status && !this.matchesStatus(String(p.status || ''), params.status)) return false;
      return true;
    });

    if (params.q && filtered.length > 0) {
      const keywords = params.q.toLowerCase().split(/\s+/).filter(Boolean);
      if (keywords.length > 0) {
        const kwFiltered = filtered.filter(p => {
          const title = String(p.title || '').toLowerCase();
          const features = Array.isArray(p.caracteristicas) ? p.caracteristicas.join(' ').toLowerCase() : '';
          const searchText = `${title} ${features}`;
          return keywords.some(kw => this.keywordMatch(searchText, kw));
        });
        if (kwFiltered.length > 0) filtered = kwFiltered;
      }
    }

    return filtered;
  }

  private keywordMatch(text: string, keyword: string): boolean {
    if (text.includes(keyword)) return true;

    if (keyword.endsWith('s') && keyword.length > 3) {
      const singular = keyword.slice(0, -1);
      if (text.includes(singular)) return true;
    }

    if (keyword.endsWith('es') && keyword.length > 4) {
      const root = keyword.slice(0, -2);
      if (text.includes(root)) return true;
    }

    if (keyword.endsWith('os') || keyword.endsWith('as')) {
      const singular = keyword.slice(0, -1);
      if (text.includes(singular)) return true;
      const masculino = keyword.slice(0, -2) + 'o';
      if (text.includes(masculino)) return true;
    }

    return false;
  }

  private matchesField(propVal: unknown, searchVal: string): boolean {
    return String(propVal || '').toLowerCase().includes(searchVal.toLowerCase());
  }

  private matchesStatus(propStatus: string, searchStatus: string): boolean {
    const norm = searchStatus.toLowerCase();
    if (norm === 'comprar') return propStatus === 'venda' || propStatus === 'comprar';
    return propStatus === norm || propStatus.includes(norm);
  }
}
