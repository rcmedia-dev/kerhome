// mock-api.ts
// Centraliza operações mockadas para imóveis, favoritos, cadastro, etc.
import { Property } from './types/property';

// Mock de propriedades
const mockProperties: Property[] = [
  {
    id: 1,
    image: '/house1.jpg',
    title: 'Casa Moderna',
    description: 'Linda casa moderna com piscina.',
    location: 'Luanda',
    cidade: 'Luanda',
    status: 'para alugar',
    price: 'Kz 50.000.000',
    size: '300',
    bedrooms: 4,
  },
  {
    id: 2,
    image: '/house2.jpg',
    title: 'Apartamento Central',
    description: 'Apartamento no centro da cidade.',
    location: 'Benguela',
    cidade: 'Benguela',
    status: 'para alugar',
    price: 'Kz 35.000.000',
    size: '120',
    bedrooms: 2,
  },
];

export function getProperties() {
  return Promise.resolve(mockProperties);
}

export function getPropertyById(id: number) {
  return Promise.resolve(mockProperties.find(p => p.id === id) || null);
}

export function getFavorites(userId: string) {
  // Simula favoritos do usuário
  return Promise.resolve([mockProperties[1]]);
}

export function createProperty(property: Partial<Property>) {
  // Simula cadastro (não persiste)
  return new Promise(resolve => setTimeout(() => resolve({ ...property, id: Date.now() }), 800));
}

export function getInvoices(userId: string) {
  return Promise.resolve([
    { id: 'f1', plano: 'Premium', valor: 'Kz 10.000', data: '2025-07-01', status: 'Pago' },
    { id: 'f2', plano: 'Básico', valor: 'Kz 5.000', data: '2025-06-01', status: 'Pendente' },
  ]);
}
