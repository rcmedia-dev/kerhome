"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { MapPin, BedDouble, Ruler, Tag } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertyFilterSidebar } from "@/components/sidebar-filtro";
import { CidadesDisponiveis } from "@/components/cidades-disponiveis";
import { ImoveisDestaque } from "@/components/imoveis-destaque";
import { useAuth } from "@/components/auth-context";
import { getPropertyById } from "@/lib/actions/get-properties";
import { TPropertyResponseSchema } from "@/lib/types/property";
import AgentCardWithChat from "@/components/agent-card-with-chat";



export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [property, setProperty] = useState<TPropertyResponseSchema | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchData() {
      const prop = await getPropertyById(id);
      setProperty(prop);
    }
    fetchData();
  }, [id]);

  if (!property) return null;

  return (
    <section className="min-h-screen bg-gray-50 text-gray-800">
      {/* Mapa no topo */}
      <div className="w-full h-[400px] overflow-hidden border-b border-gray-200">
        <iframe
          className="w-full h-full"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${encodeURIComponent(
            property.endereco ?? ''
          )}&output=embed`}
        ></iframe>
      </div>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-12 items-start">
          {/* Conteúdo principal */}
          <div className="md:col-span-2 space-y-12 order-1 md:order-none">
            {/* Detalhes principais */}
            <div className="space-y-6">
              <span className="inline-block bg-orange-100 text-orange-700 text-sm font-medium px-4 py-1.5 rounded-full shadow-sm">
                {property.rotulo || (property.status === "para alugar" ? "Para Alugar" : "À Venda")}
              </span>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                {property.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>{[property.endereco, property.bairro, property.cidade, property.provincia, property.pais].filter(Boolean).join(", ")}</span>
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-gray-700 mt-4">
                {property.tipo && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Tipo:</span> {property.tipo}
                  </div>
                )}
                {typeof property.bedrooms !== 'undefined' && (
                  <div className="flex items-center gap-2">
                    <BedDouble className="w-5 h-5 text-orange-500" />
                    <span>{property.bedrooms} Quartos</span>
                  </div>
                )}
                {property.size && (
                  <div className="flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-orange-500" />
                    <span>{property.size}</span>
                  </div>
                )}
                {typeof property.bathrooms !== 'undefined' && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Banheiros:</span> {property.bathrooms}
                  </div>
                )}
                {typeof property.garagens !== 'undefined' && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Garagens:</span> {property.garagens}
                  </div>
                )}
                {property.anoconstrucao && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Ano:</span> {property.anoconstrucao}
                  </div>
                )}
                {property.propertyid && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">ID:</span> {property.propertyid}
                  </div>
                )}
              </div>
                <p className="text-3xl font-extrabold text-orange-500 mt-6 flex items-center gap-2">
                  {property.price && (
                    <>
                      <Tag className="w-6 h-6" />
                      {property.price.toLocaleString('pt-AO', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                      {property.unidade_preco && (
                        <span className="text-base font-normal">
                          {property.unidade_preco}
                        </span>
                      )}
                    </>
                  )}
                </p>

            </div>

            {/* Galeria de Fotos com destaque */}
            {property.gallery && property.gallery.length > 0 && (
              <div className="mb-6">
                {/* Foto principal em destaque */}
                <div className="relative w-full h-[400px] rounded-3xl overflow-hidden shadow-xl border border-gray-200 mb-4">
                  <Image
                    src={property.gallery[0]}
                    alt={property.title}
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Miniaturas/carrossel das outras fotos */}
                {property.gallery.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {property.gallery.slice(1).map((img, idx) => (
                      <div key={idx} className="relative w-32 h-20 rounded-xl overflow-hidden border border-gray-200 shadow cursor-pointer hover:ring-2 hover:ring-purple-400 transition">
                        <Image src={img} alt={property.title} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Detalhes Técnicos */}
            <div className="pt-2">
              <h3 className="font-semibold text-gray-700 mb-2">Detalhes Técnicos</h3>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                {typeof property.area_terreno !== 'undefined' && (
                  <li><span className="font-medium">Área do Terreno:</span> {property.area_terreno}</li>
                )}
                {property.size && (
                  <li><span className="font-medium">Tamanho:</span> {property.size}</li>
                )}
                {property.garagemtamanho && (
                  <li><span className="font-medium">Garagem (m²):</span> {property.garagemtamanho}</li>
                )}
              </ul>
            </div>

            {/* Tabs Visão Geral */}
            <Tabs defaultValue="visao-geral" className="space-y-4">
              <TabsList className="flex space-x-2 border-b">
                <TabsTrigger
                  value="visao-geral"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white px-4 py-2 rounded-t-md text-sm font-medium transition"
                >
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger
                  value="video"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white px-4 py-2 rounded-t-md text-sm font-medium transition"
                >
                  Vídeo
                </TabsTrigger>
                <TabsTrigger
                  value="tour"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white px-4 py-2 rounded-t-md text-sm font-medium transition"
                >
                  Passeio Virtual
                </TabsTrigger>
              </TabsList>
              <TabsContent value="visao-geral">
                <div className="space-y-4">
                  {/* Detalhes principais */}
                  <ul className="text-gray-600 space-y-2 list-disc list-inside mt-2">
                    {property.tipo && (
                      <li><span className="font-semibold">Tipo:</span> {property.tipo}</li>
                    )}
                    {typeof property.bedrooms !== 'undefined' && (
                      <li><span className="font-semibold">Quartos:</span> {property.bedrooms}</li>
                    )}
                    {typeof property.bathrooms !== 'undefined' && (
                      <li><span className="font-semibold">Banheiros:</span> {property.bathrooms}</li>
                    )}
                    {typeof property.garagens !== 'undefined' && (
                      <li><span className="font-semibold">Garagens:</span> {property.garagens}</li>
                    )}
                    {property.anoconstrucao && (
                      <li><span className="font-semibold">Ano:</span> {property.anoconstrucao}</li>
                    )}
                    {property.propertyid && (
                      <li><span className="font-semibold">ID:</span> {property.propertyid}</li>
                    )}
                    {typeof property.area_terreno !== 'undefined' && (
                      <li><span className="font-semibold">Área do Terreno:</span> {property.area_terreno}</li>
                    )}
                    {property.size && (
                      <li><span className="font-semibold">Tamanho:</span> {property.size}</li>
                    )}
                    {property.garagemtamanho && (
                      <li><span className="font-semibold">Garagem (m²):</span> {property.garagemtamanho}</li>
                    )}
                    {property.status && (
                      <li><span className="font-semibold">Status:</span> {property.status}</li>
                    )}
                    {property.price && (
                      <li><span className="font-semibold">Preço:</span> {property.price} {property.unidade_preco && <span className="text-base font-normal">{property.unidade_preco}</span>}</li>
                    )}
                  </ul>
                  {/* Características */}
                  {property.caracteristicas && Array.isArray(property.caracteristicas) && property.caracteristicas.length > 0
 && (
                    <div className="pt-2">
                      <h3 className="font-semibold text-gray-700 mb-2">Características</h3>
                      <ul className="flex flex-wrap gap-2">
                        {Array.isArray(property.caracteristicas) &&
                          property.caracteristicas
                            .filter((c): c is string => typeof c === 'string')
                            .map((c, i) => (
                              <li
                                key={i}
                                className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-medium border border-purple-100"
                              >
                                {c}
                              </li>
                            ))}
                      </ul>

                    </div>
                  )}
                  {/* Detalhes Adicionais */}
                  {property.detalhesadicionais &&  Array.isArray(property.detalhesadicionais) && property.detalhesadicionais.length > 0 && (
                    <div className="pt-2">
                      <h3 className="font-semibold text-gray-700 mb-2">Detalhes Adicionais</h3>
                      <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        {Array.isArray(property.detalhesadicionais) &&
                          property.detalhesadicionais
                            .filter(
                              (d): d is { titulo: string; valor: string } =>
                                typeof d === 'object' &&
                                d !== null &&
                                'titulo' in d &&
                                'valor' in d &&
                                typeof (d as any).titulo === 'string' &&
                                typeof (d as any).valor === 'string'
                            )
                            .map((d, i) => (
                              <li key={i}>
                                <span className="font-medium">{d.titulo}:</span> {d.valor}
                              </li>
                            ))}
                      </ul>

                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="video">
                <div className="mt-4 w-full aspect-video rounded-lg overflow-hidden">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title="Vídeo do imóvel"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </TabsContent>
              <TabsContent value="tour">
                <div className="text-gray-600 italic mt-4">
                  Passeio virtual em breve disponível.
                </div>
              </TabsContent>
            </Tabs>

            {/* Descrição */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Descrição</h2>
              <p className="text-gray-600 leading-relaxed">
                {property.status === "para alugar"
                  ? "Imóvel disponível para arrendamento com excelente localização e infraestrutura."
                  : "Excelente oportunidade de compra. Ideal para moradia ou investimento."}
              </p>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Endereço</h2>
              <p className="text-gray-600">{property.endereco}</p>
            </div>

            {/* Formulário de contato + Agente juntos */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border flex flex-col md:flex-row gap-8 items-center md:items-start">
              {/* Card do Agente */}

              {/* Formulário de contato */}
              <div className="flex-1 w-full">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 text-left md:text-center">
                  Entrar em contato
                </h3>
                <AgentCardWithChat ownerId={property.owner_id} propertyId={property.id} />
              </div>
            </div>
          </div>

          {/* Sidebar Filtro + Info */}
          <div className="hidden md:block md:col-span-1 sticky top-24 self-start order-none md:order-last space-y-6">
            {/* Filtro de imóveis */}
            <PropertyFilterSidebar property={property} />

            {/* Cidades disponíveis */}
            <CidadesDisponiveis />

            {/* Imóveis em destaque */}
            <ImoveisDestaque />

            {/* Corretores em destaque */}
            <div className="bg-white border shadow-md rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Corretores em destaque
              </h3>
              <ul className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-500">
                      <Image
                        src="/people/1.jpg"
                        alt="Agente"
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        João Pedro
                      </p>
                      <p className="text-xs text-gray-500">25 casas vendidas</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
