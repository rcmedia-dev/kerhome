import { Property } from "../types/property";

const titles = ['Apartamento Moderno', 'Vivenda de Luxo', 'Casa Rústica', 'Penthouse Vista Mar'];
const locations = ['Luanda - Talatona', 'Benfica', 'Kilamba', 'Huambo - Centro'];
const tipos = ['Apartamento', 'Vivenda', 'Casa', 'Penthouse'];
const caracteristicasList = [
  'Ar Condicionado', 'Aquecimento Central', 'Fogão Elétrico', 'Alarme de Incêndio',
  'Academia', 'Home Theater', 'Lavanderia', 'Pisos de Mármore', 'Micro-ondas',
  'Geladeira', 'Sauna', 'Piscina', 'TV a Cabo', 'Máquina de Lavar', 'WiFi'
];

export async function mockGetProperties(limit: number = 50): Promise<Property[]> {
  return Array.from({ length: limit }, (_, i) => ({
    id: i + 1,
    image: `/house${(i % 10) + 1}.jpg`,
    gallery: [`/house${(i % 10) + 1}.jpg`, `/house${((i+1) % 10) + 1}.jpg`],
    title: titles[i % titles.length],
    description: 'Imóvel de alto padrão, excelente localização e infraestrutura.',
    location: locations[i % locations.length],
    endereco: 'Rua Exemplo, 123',
    bairro: 'Bairro Central',
    cidade: 'Luanda',
    provincia: 'Luanda',
    pais: 'Angola',
    tipo: tipos[i % tipos.length],
    status: i % 2 === 0 ? 'para alugar' : 'para comprar',
    rotulo: i % 2 === 0 ? 'Promoção' : 'À Venda',
    price: `${Math.floor(Math.random() * 60 + 10)}.000.000 Kz`,
    unidadePreco: 'Kz',
    precoAntes: '',
    precoDepois: '',
    precoChamada: '',
    caracteristicas: caracteristicasList.slice(0, (i % caracteristicasList.length) + 1),
    size: `${Math.floor(Math.random() * 200) + 60} m²`,
    areaTerreno: `${Math.floor(Math.random() * 500) + 100} m²`,
    bedrooms: Math.floor(Math.random() * 5) + 1,
    bathrooms: Math.floor(Math.random() * 4) + 1,
    garagens: Math.floor(Math.random() * 3),
    garagemTamanho: `${Math.floor(Math.random() * 40) + 10} m²`,
    anoConstrucao: `${2000 + (i % 20)}`,
    propertyId: `KH${1000 + i}`,
    detalhesAdicionais: [
      { titulo: 'Vista', valor: 'Mar' },
      { titulo: 'Andar', valor: `${(i % 10) + 1}` }
    ],
    anexos: [],
    video: '',
    imagem360: '',
    planosChao: i % 2 === 0,
    notaPrivada: '',
  }));
}

export async function mockGetPropertyById(id: number): Promise<Property> {
  return (await mockGetProperties(50)).find(p => p.id === id) as Property;
}
