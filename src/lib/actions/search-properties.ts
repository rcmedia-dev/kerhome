'use server';

import { PropertyResponse } from '@/lib/types/property';
import { mockProperties } from '../mockups/properties-mockup';

type SearchParams = {
  title?: string;
  endereco?: string;
  status?: 'para comprar' | 'para alugar';
  tipo?: string;
  minPrice?: number;
  maxPrice?: number;
  quartos?: number;
  banhos?: number;
  garagens?: number;
};

export async function searchProperties(params: SearchParams): Promise<PropertyResponse[]> {
  const filtered = mockProperties.filter((property) => {
    return (
      (!params.title || property.title.toLowerCase().includes(params.title.toLowerCase())) &&
      (!params.endereco || (property.endereco?.toLowerCase().includes(params.endereco.toLowerCase()))) &&
      (!params.status || property.status === params.status) &&
      (!params.tipo || property.tipo?.toLowerCase().includes(params.tipo.toLowerCase())) &&
      (!params.minPrice || property.price >= params.minPrice) &&
      (!params.maxPrice || property.price <= params.maxPrice) &&
      (!params.quartos || property.bedrooms === params.quartos) &&
      (!params.banhos || property.bathrooms === params.banhos) &&
      (!params.garagens || (property.garagens || 0) === params.garagens)
    );
  });

  return filtered;
}
