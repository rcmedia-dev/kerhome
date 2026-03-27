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

interface PageProps {
  params: { slug: string };
}

// SEO Dinâmico
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const imobiliaria = await fetchImobiliariaBySlug(slug);

  if (!imobiliaria) return { title: 'Imobiliária não encontrada' };

  return {
    title: `${imobiliaria.nome} - Imóveis em ${imobiliaria.cidade} | Kercasa`,
    description: imobiliaria.descricao || `Confira os imóveis da ${imobiliaria.nome} no Kercasa.`,
  };
}

export default async function ImobiliariaPerfilPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const imobiliaria = await fetchImobiliariaBySlug(slug);

  if (!imobiliaria) {
    notFound();
  }

  const imoveis = await fetchPropertiesByAgency(imobiliaria.id);
  const agentes = await fetchAgentsByAgency(imobiliaria.id);
  const semelhantes = await fetchSimilarAgencies(imobiliaria.cidade || '', imobiliaria.id);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">

      {/* Immersive Header Section (Full Width Background) */}
      <div className="w-full bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-purple-600 transition-colors">Início</Link>
            <span className="text-gray-300">/</span>
            <Link href="/imobiliarias" className="hover:text-purple-600 transition-colors">Agências</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-800 font-medium truncate max-w-[300px]">{imobiliaria.nome}</span>
          </nav>

          <div className="relative bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200">
            <div className="relative h-48 md:h-64 bg-gradient-to-br from-[#4C067A] via-[#820AD1] to-[#FF6B00]">
              <div className="absolute inset-0 opacity-10 bg-[url('/grid-pattern.svg')] bg-repeat"></div>
            </div>
            <div className="px-6 md:px-10 pb-8 -mt-20 relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-end">
              {/* Logo Wrapper */}
              <div className="w-40 h-40 bg-white rounded-3xl shadow-xl p-4 border border-gray-100 flex items-center justify-center shrink-0">
                <div className="relative w-full h-full">
                  <Image
                    src={imobiliaria.logo || '/logo-placeholder.png'}
                    alt={imobiliaria.nome}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              {/* Short Info */}
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-none">
                    {imobiliaria.nome}
                  </h1>
                  {imobiliaria.verificada && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-widest border border-blue-100">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verificada
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 text-gray-500 text-base mb-4">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span className="font-medium">
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
                            src={agency.logo || '/logo-placeholder.png'}
                            alt={agency.nome}
                            fill
                            className="object-contain p-4 grayscale group-hover:grayscale-0 transition-transform duration-500 group-hover:scale-105"
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
