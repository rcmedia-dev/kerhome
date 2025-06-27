// app/api/properties/route.ts
import { NextRequest, NextResponse } from 'next/server';

const titles = ['Apartamento Moderno', 'Vivenda de Luxo', 'Casa Rústica', 'Penthouse Vista Mar'];
const locations = ['Luanda - Talatona', 'Benfica', 'Kilamba', 'Huambo - Centro'];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? parseInt(limitParam) : 50;

  const properties = Array.from({ length: limit }, (_, i) => ({
    id: i + 1,
    image: `/house${(i % 10) + 1}.jpg`,
    title: titles[i % titles.length],
    location: locations[i % locations.length],
    bedrooms: Math.floor(Math.random() * 5) + 1,
    size: `${Math.floor(Math.random() * 200) + 60} m²`,
    price: `${Math.floor(Math.random() * 60 + 10)}.000.000 Kz`,
    status: i % 2 === 0 ? 'para alugar' : 'para comprar',
  }));

  return NextResponse.json(properties);
}
