import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PropertiesByLocation } from '@/components/properties-by-location';

interface Props {
  params: Promise<{ cidade: string; bairro: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cidade, bairro } = await params;
  const cidadeNome = decodeURIComponent(cidade).replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  const bairroNome = decodeURIComponent(bairro).replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://kercasa.com'}/imoveis-em/${cidade}/${bairro}`;

  return {
    title: `Imóveis em ${bairroNome}, ${cidadeNome} | Comprar e Arrendar | Kercasa`,
    description: `Encontre imóveis em ${bairroNome}, ${cidadeNome}, Angola. Apartamentos, casas e terrenos para comprar ou arrendar no bairro ${bairroNome}.`,
    alternates: { canonical: url },
    openGraph: {
      title: `Imóveis em ${bairroNome}, ${cidadeNome} | Kercasa`,
      description: `Encontre imóveis em ${bairroNome}, ${cidadeNome}, Angola.`,
      url,
      siteName: 'Kercasa',
      locale: 'pt_AO',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: `Imóveis em ${bairroNome}, ${cidadeNome} | Kercasa` },
    robots: { index: true, follow: true },
  };
}

export default async function BairroPage({ params }: Props) {
  const { cidade, bairro } = await params;
  const cidadeNome = decodeURIComponent(cidade).replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  const bairroNome = decodeURIComponent(bairro).replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());

  return <PropertiesByLocation cidade={cidadeNome} bairro={bairroNome} />;
}
