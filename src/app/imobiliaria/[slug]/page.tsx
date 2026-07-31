import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PropertyCard } from '@/components/property-card';
import {
  fetchImobiliariaBySlug,
  fetchPropertiesByAgency,
  fetchAgentsByAgency,
  fetchSimilarAgencies
} from '@/lib/functions/supabase-actions/imobiliaria-actions';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  CheckCircle2,
  Building2,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ImobiliariaSidebarClient } from '@/components/imobiliarias/imobiliaria-sidebar-client';
import { PageViewTracker } from '@/components/page-view-tracker';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { OrganizationJsonLd } from '@/components/json-ld';

interface PageProps {
  params: { slug: string };
}

// SEO Dinâmico
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kercasa.com';
  const imobiliaria = await fetchImobiliariaBySlug(slug);

  if (!imobiliaria) return { title: 'Imobiliária não encontrada' };

  const url = `${siteUrl}/imobiliaria/${slug}`;

  const rawDesc = imobiliaria.descricao || `Confira os imóveis da ${imobiliaria.nome} no Kercasa. ${imobiliaria.cidade ? `Agência em ${imobiliaria.cidade}.` : ''}`;
  const description = rawDesc.length > 155
    ? rawDesc.substring(0, 152).replace(/\s\S*$/, '') + '...'
    : rawDesc;

  return {
    title: `${imobiliaria.nome} - Imóveis em ${imobiliaria.cidade || 'Angola'} | Kercasa`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${imobiliaria.nome} | Kercasa`,
      description: imobiliaria.descricao?.substring(0, 200) || `Imóveis da ${imobiliaria.nome} no Kercasa.`,
      url,
      siteName: 'Kercasa',
      locale: 'pt_AO',
      type: 'website',
      images: imobiliaria.logo ? [{ url: imobiliaria.logo, width: 400, height: 400, alt: imobiliaria.nome }] : [],
    },
    twitter: { card: 'summary_large_image', title: `${imobiliaria.nome} | Kercasa`, description: imobiliaria.descricao?.substring(0, 200) || `Imóveis da ${imobiliaria.nome}` },
    robots: { index: true, follow: true },
    other: {
      'X-Robots-Tag': 'index, follow',
    },
  };
}

export default async function ImobiliariaPerfilPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const imobiliaria = await fetchImobiliariaBySlug(slug);

  if (!imobiliaria) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kercasa.com';
  const currentUrl = `${siteUrl}/imobiliaria/${slug}`;

  const imoveis = await fetchPropertiesByAgency(imobiliaria.id);
  const agentes = await fetchAgentsByAgency(imobiliaria.id);
  const semelhantes = await fetchSimilarAgencies(imobiliaria.cidade || '', imobiliaria.id);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <PageViewTracker
        eventType="view_agency"
        entityType="imobiliaria"
        entityId={imobiliaria.id}
      />

      <OrganizationJsonLd />

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 pt-28 pb-4">
        <Breadcrumbs items={[{ label: 'Agências', href: '/imobiliarias' }, { label: imobiliaria.nome }]} currentUrl={currentUrl} />
      </div>

      {/* Hero Section — Redesenhado: Simples, profissional, identidade Kercasa */}
      <div className="max-w-7xl mx-auto px-4 mb-2">
        <div className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm relative">
          
          {/* Header Banner */}
          <div className="h-40 md:h-56 bg-[#820AD1] relative">
             {/* Decoração sutil Kercasa */}
             <div className="absolute inset-0" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\" fill=\"white\" fill-opacity=\"0.1\"/%3E%3C/svg%3E')" }}></div>
             <div className="absolute right-0 bottom-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
          </div>
          
          {/* Profile Content */}
          <div className="px-6 pb-8 md:px-10">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end -mt-16 md:-mt-20 relative z-10">
              
              {/* Logo Box */}
              <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-2xl shadow-lg border-4 border-white shrink-0 flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-gray-50/50"></div>
                 <Image
                   src={imobiliaria.logo || '/logo-placeholder.svg'}
                   alt={imobiliaria.nome}
                   fill
                   className="object-contain p-3 relative z-10"
                 />
              </div>

              {/* Info Area */}
              <div className="flex-1 text-center md:text-left pt-2 md:pt-0 md:pb-2">
                 <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                      {imobiliaria.nome}
                    </h1>
                    {imobiliaria.verificada && (
                      <span className="inline-flex items-center justify-center gap-1.5 py-1 px-3 rounded-full bg-orange-50 text-orange-600 border border-orange-100 text-xs font-bold uppercase tracking-wider mx-auto md:mx-0">
                        <CheckCircle2 className="w-4 h-4" />
                        Verificada
                      </span>
                    )}
                 </div>
                 
                 <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 text-sm md:text-base font-medium">
                   <MapPin className="w-4 h-4 text-[#820AD1] shrink-0" />
                   <span>
                     {[imobiliaria.bairro, imobiliaria.cidade].filter(Boolean).join(", ")}
                   </span>
                 </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-12 gap-12">

          {/* Main Content (Left Column - 8 grids) */}
          <div className="lg:col-span-8 space-y-12">

            {/* Informações Rápidas */}
            <div className="flex flex-wrap items-center gap-6">
              {imobiliaria.telefone && (
                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-gray-200 shadow-sm grow sm:grow-0">
                  <div className="bg-purple-50 p-2 rounded-xl text-[#820AD1]"><Phone className="w-4 h-4" /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Telefone</p>
                    <p className="font-bold text-gray-900">{imobiliaria.telefone}</p>
                  </div>
                </div>
              )}
              {imobiliaria.email && (
                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-gray-200 shadow-sm grow sm:grow-0">
                  <div className="bg-orange-50 p-2 rounded-xl text-orange-600"><Mail className="w-4 h-4" /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Email Direto</p>
                    <p className="font-bold text-gray-900">{imobiliaria.email}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-gray-200 shadow-sm grow sm:grow-0">
                <div className="bg-blue-50 p-2 rounded-xl text-blue-600"><Building2 className="w-4 h-4" /></div>
                <div>
                  <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Propriedades</p>
                  <p className="font-bold text-gray-900">{imoveis.length} ativas</p>
                </div>
              </div>
            </div>

            {/* Descrição - Sobre a Agência */}
            {imobiliaria.descricao && (
              <div className="prose max-w-none">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Sobre a imobiliária</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{imobiliaria.descricao}</p>
              </div>
            )}

            {/* Listagem de Imóveis Associados */}
            <div className="border-t border-gray-200 pt-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Building2 className="w-6 h-6 text-[#820AD1]" />
                Imóveis Disponíveis ({imoveis.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {imoveis.length > 0 ? (
                  imoveis.map((imovel: any) => (
                    <PropertyCard key={imovel.id} property={imovel} />
                  ))
                ) : (
                  <div className="col-span-full py-12 bg-white rounded-3xl border-2 border-dashed border-gray-200 text-center">
                    <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-700 mb-1">Nenhum imóvel listado</h3>
                    <p className="text-gray-500 text-sm">Esta imobiliária ainda não publicou ofertas.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Imobiliárias Semelhantes (Exact same model as ImoveisSemelhantes) */}
            {semelhantes.length > 0 && (
              <div className="pt-12 border-t border-gray-200 animate-in fade-in duration-700 slide-in-from-bottom-4">
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 px-1">
                    Imobiliárias Semelhantes
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {semelhantes.map((agency: any) => (
                      <Link
                        href={`/imobiliaria/${agency.slug}`}
                        key={agency.id}
                        className="group block bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300"
                      >
                        <div className="w-full h-32 relative flex items-center justify-center bg-gray-50 border-b border-gray-50">
                          <Image
                            src={agency.logo || '/logo-placeholder.svg'}
                            alt={agency.nome}
                            fill
                            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-3">
                          <h4 className="text-xs font-semibold text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
                            {agency.nome}
                          </h4>
                          <p className="text-[10px] text-gray-500 line-clamp-1 mb-1 font-bold uppercase tracking-widest">
                            {agency.cidade || 'Localização não informada'}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
          </div>

          {/* Sticky Sidebar (Right Column - 4 grids) */}
          <div className="lg:col-span-4 space-y-8">
            <ImobiliariaSidebarClient imobiliaria={imobiliaria} agentes={agentes} />
          </div>
        </div>
      </div>
    </div>
  );
}
