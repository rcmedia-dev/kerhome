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

      {/* Hero Section — Consistente com a Hero da página Notícias */}
      <div className="relative bg-gradient-to-r from-[#130f25] to-purple-900 text-white overflow-hidden pt-28 pb-20">
        {/* Decorações de fundo */}
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\" fill=\"white\" fill-opacity=\"0.5\"/%3E%3C/svg%3E')" }}
        ></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          {/* Breadcrumb */}
          <nav className="text-sm text-purple-300 mb-8 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">Início</Link>
            <ChevronRight className="w-4 h-4 opacity-50" />
            <Link href="/imobiliarias" className="hover:text-white transition-colors">Agências</Link>
            <ChevronRight className="w-4 h-4 opacity-50" />
            <span className="text-white/70 font-medium truncate max-w-[300px]">{imobiliaria.nome}</span>
          </nav>

          {/* Hero Content */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            {/* Logo */}
            <div className="w-36 h-36 bg-white rounded-3xl shadow-2xl p-4 border border-white/20 flex items-center justify-center shrink-0">
              <div className="relative w-full h-full">
                <Image
                  src={imobiliaria.logo || '/logo-placeholder.png'}
                  alt={imobiliaria.nome}
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left pb-2">
              {imobiliaria.verificada && (
                <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-orange-200 text-xs font-medium mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Agência Verificada
                </span>
              )}
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-3">
                {imobiliaria.nome}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2 text-purple-200 text-base">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                <span className="font-medium">
                  {[imobiliaria.bairro, imobiliaria.cidade].filter(Boolean).join(", ")}
                </span>
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
