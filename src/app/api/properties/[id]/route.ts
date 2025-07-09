import { NextRequest, NextResponse } from 'next/server';

const titles = ['Apartamento Moderno', 'Vivenda de Luxo', 'Casa Rústica', 'Penthouse Vista Mar'];
const locations = ['Luanda - Talatona', 'Benfica', 'Kilamba', 'Huambo - Centro'];

function generateProperties(limit: number) {
  return Array.from({ length: limit }, (_, i) => ({
    id: i + 1,
    image: `/house${(i % 10) + 1}.jpg`,
    title: titles[i % titles.length],
    location: locations[i % locations.length],
    bedrooms: Math.floor(Math.random() * 5) + 1,
    size: `${Math.floor(Math.random() * 200) + 60} m²`,
    price: `${Math.floor(Math.random() * 60 + 10)}.000.000 Kz`,
    status: i % 2 === 0 ? 'para alugar' : 'para comprar',
  }));
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop(); // pega o último segmento da URL
  const parsedId = parseInt(id || '');

  const properties = generateProperties(50);
  const property = properties.find((p) => p.id === parsedId);

  if (!property) {
    return NextResponse.json({ error: 'Imóvel não encontrado' }, { status: 404 });
  }

  return NextResponse.json(property);
}
