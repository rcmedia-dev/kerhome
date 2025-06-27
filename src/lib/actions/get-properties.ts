'use server';

import { Property } from "../types/property";

// Buscar lista de imóveis
export async function getProperties(limit: number = 50): Promise<Property[]> {
  const res = await fetch(`http://localhost:3000/api/properties?limit=${limit}`, {
    cache: 'no-store',
  });

  if (!res.ok) throw new Error('Erro ao buscar imóveis');
  return res.json();
}

// Buscar imóvel por ID
export async function getPropertyById(id: number): Promise<Property> {
  const res = await fetch(`http://localhost:3000/api/properties/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) throw new Error('Erro ao buscar o imóvel');
  return res.json();
}
