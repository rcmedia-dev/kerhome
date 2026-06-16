import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PropertiesByLocation } from '@/components/properties-by-location';

interface Props {
  params: Promise<{ cidade: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cidade } = await params;
  const nome = decodeURIComponent(cidade).replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://kercasa.com'}/imoveis-em/${cidade}`;

  return {
    title: `Imóveis em ${nome} | Comprar e Arrendar | Kercasa`,
    description: `Encontre os melhores imóveis para comprar ou arrendar em ${nome}, Angola. Apartamentos, casas, terrenos e mais. Pesquise por preço, tipo e localização.`,
    alternates: { canonical: url },
    openGraph: {
      title: `Imóveis em ${nome} | Kercasa`,
      description: `Encontre imóveis em ${nome}, Angola. Compre ou arrende com a Kercasa.`,
      url,
      siteName: 'Kercasa',
      locale: 'pt_AO',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: `Imóveis em ${nome} | Kercasa`, description: `Encontre imóveis em ${nome}, Angola.` },
    robots: { index: true, follow: true },
  };
}

export default async function CityPage({ params }: Props) {
  const { cidade } = await params;
  const nome = decodeURIComponent(cidade).replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());

  return <PropertiesByLocation cidade={nome} />;
}
