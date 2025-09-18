'use client';

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
import { useQuery } from "@tanstack/react-query";
import { getPropertyOwner } from "@/lib/actions/get-agent";

const agents = [
  { id: 1, name: "João Fernando", picture: "/people/1.jpg" },
  { id: 2, name: "Antonia Miguel", picture: "/people/2.jpg" },
  { id: 3, name: "Pedro Afonso", picture: "/people/3.jpg" },
];

// Componente para a galeria de imagens com troca
function PropertyGallery({ property }: { property: TPropertyResponseSchema }) {
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  // Inicializa a galeria
  useEffect(() => {
    if (property?.gallery && property.gallery.length > 0) {
      setMainImage(property.gallery[0]); // primeira como destaque
      setThumbnails(property.gallery.slice(1)); // restantes como miniaturas
    }
  }, [property]);

  // Função para trocar a principal com a miniatura clicada
  const handleSwap = (clickedImg: string, idx: number) => {
    if (!mainImage) return;
    const newThumbs = [...thumbnails];
    newThumbs[idx] = mainImage; // miniatura clicada recebe a antiga principal
    setMainImage(clickedImg);   // principal vira a imagem clicada
    setThumbnails(newThumbs);
  };

  return (
    <>
      {/* Galeria de Fotos com destaque */}
      {mainImage && (
        <div className="mb-6">
          {/* Foto principal */}
          <div className="relative w-full h-[300px] sm:h-[400px] rounded-3xl overflow-hidden shadow-xl border border-gray-200 mb-4">
            <Image
              src={mainImage}
              alt={property.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            />
          </div>

          {/* Miniaturas/carrossel */}
          {thumbnails.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {thumbnails.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSwap(img, idx)}
                  className="relative w-24 h-16 sm:w-32 sm:h-20 rounded-xl overflow-hidden border border-gray-200 shadow cursor-pointer hover:ring-2 hover:ring-purple-400 transition flex-shrink-0"
                >
                  <Image
                    src={img}
                    alt={`${property.title} - miniatura ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [property, setProperty] = useState<TPropertyResponseSchema | null>(null);
  const { user } = useAuth();

  const propertyDetails = useQuery({
    queryKey: ['propertie-data-alugar'],
    queryFn: async() => {
      const response = await getPropertyById(id)
      setProperty(response)
      return response
    }
  })

  const ownerDetails = useQuery({
    queryKey: ['owner-data-alugar'],
    queryFn: async() => {
      const response = await getPropertyOwner(propertyDetails.data?.id)
      return response
    }
  })

  if (!property) {
    return (
      <section className="min-h-screen bg-gray-50 text-gray-800 overflow-x-hidden">
        {/* Esqueleto para o mapa */}
        <div className="w-full h-[300px] sm:h-[400px] bg-gray-200 animate-pulse overflow-hidden border-b border-gray-200" />

        {/* Esqueleto para o Hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-5 py-8 sm:py-16">
          <div className="grid md:grid-cols-3 gap-8 sm:gap-12 items-start">
            {/* Esqueleto para o Conteúdo principal */}
            <div className="md:col-span-2 space-y-8 sm:space-y-12 order-1 md:order-none">
              {/* Esqueleto para Detalhes principais */}
              <div className="space-y-4 sm:space-y-6">
                <div className="h-6 w-32 bg-gray-200 animate-pulse rounded-full" />
                <div className="h-10 sm:h-12 w-3/4 bg-gray-200 animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 animate-pulse" />
                <div className="flex flex-wrap gap-4 sm:gap-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 w-20 sm:w-24 bg-gray-200 animate-pulse" />
                  ))}
                </div>
                <div className="h-8 w-40 bg-gray-200 animate-pulse" />
              </div>

              {/* Esqueleto para Galeria de Fotos */}
              <div className="space-y-4">
                <div className="w-full h-[300px] sm:h-[400px] bg-gray-200 animate-pulse rounded-3xl" />
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-24 h-16 sm:w-32 sm:h-20 bg-gray-200 animate-pulse rounded-xl flex-shrink-0" />
                  ))}
                </div>
              </div>

              {/* Esqueleto para Detalhes Técnicos */}
              <div className="pt-2 space-y-2">
                <div className="h-6 w-40 bg-gray-200 animate-pulse" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-4 w-full bg-gray-200 animate-pulse" />
                  ))}
                </div>
              </div>

              {/* Esqueleto para Tabs */}
              <div className="space-y-4 min-h-[300px]">
                <div className="flex space-x-2 border-b overflow-x-auto">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-8 w-20 sm:w-24 bg-gray-200 animate-pulse rounded-t-md flex-shrink-0" />
                  ))}
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-4 w-full bg-gray-200 animate-pulse" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Esqueleto para Descrição */}
              <div className="space-y-4">
                <div className="h-8 w-32 bg-gray-200 animate-pulse" />
                <div className="h-4 w-full bg-gray-200 animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 animate-pulse" />
              </div>

              {/* Esqueleto para Endereço */}
              <div className="space-y-4">
                <div className="h-8 w-32 bg-gray-200 animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 animate-pulse" />
              </div>

              {/* Esqueleto para Formulário de contato + Agente */}
              <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-xl border flex flex-col md:flex-row gap-6 sm:gap-8 items-center md:items-start">
                <div className="flex-1 w-full space-y-4">
                  <div className="h-6 w-40 bg-gray-200 animate-pulse" />
                  <div className="h-32 w-full bg-gray-200 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Esqueleto para Sidebar (visível apenas em md+) */}
            <div className="hidden md:block md:col-span-1 sticky top-24 self-start order-none md:order-last space-y-6">
              {/* Esqueleto para Filtro de imóveis */}
              <div className="h-64 w-full bg-gray-200 animate-pulse rounded-2xl" />

              {/* Esqueleto para Cidades disponíveis */}
              <div className="h-48 w-full bg-gray-200 animate-pulse rounded-2xl" />

              {/* Esqueleto para Imóveis em destaque */}
              <div className="h-80 w-full bg-gray-200 animate-pulse rounded-2xl" />

              {/* Esqueleto para Corretores em destaque */}
              <div className="h-64 w-full bg-gray-200 animate-pulse rounded-2xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 text-gray-800 overflow-x-hidden">
      {/* Mapa no topo */}
      <div className="w-full h-[300px] sm:h-[400px] overflow-hidden border-b border-gray-200">
        <div className="w-full h-full relative">
          <iframe
            className="w-full h-full rounded-lg"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${encodeURIComponent(
              property.endereco ?? ""
            )}&output=embed`}
          ></iframe>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-5 py-8 sm:py-16">
        <div className="grid md:grid-cols-3 gap-8 sm:gap-12 items-start">
          {/* Conteúdo principal */}
          <div className="md:col-span-2 space-y-8 sm:space-y-12 order-1 md:order-none">
            {/* Detalhes principais */}
            <div className="space-y-4 sm:space-y-6">
              <span className="inline-block bg-orange-100 text-orange-700 text-sm font-medium px-4 py-1.5 rounded-full shadow-sm">
                {property.rotulo || (property.status === "para alugar" ? "Para Alugar" : "À Venda")}
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {property.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="break-words">
                  {[property.endereco, property.bairro, property.cidade, property.provincia, property.pais]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-gray-700 mt-4">
                {property.tipo && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Tipo:</span> {property.tipo}
                  </div>
                )}
                {typeof property.bedrooms !== "undefined" && (
                  <div className="flex items-center gap-2">
                    <BedDouble className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
                    <span>{property.bedrooms} Quartos</span>
                  </div>
                )}
                {property.size && (
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
                    <span>{property.size}</span>
                  </div>
                )}
                {typeof property.bathrooms !== "undefined" && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Banheiros:</span> {property.bathrooms}
                  </div>
                )}
                {typeof property.garagens !== "undefined" && (
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
              <p className="text-2xl sm:text-3xl font-extrabold text-orange-500 mt-4 sm:mt-6 flex items-center gap-2">
                {property.price && (
                  <>
                    <Tag className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                    {property.price.toLocaleString(
                      property.unidade_preco === "dolar" ? "en-US" : "pt-AO",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}

                    {property.unidade_preco && (
                      <span className="text-sm sm:text-base font-normal">
                        {property.unidade_preco === "kwanza"
                          ? "KZ"
                          : property.unidade_preco === "dolar"
                          ? "USD"
                          : property.unidade_preco}
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>

            {/* Galeria de Fotos com troca de imagens */}
            <PropertyGallery property={property} />

            {/* Detalhes Técnicos */}
            <div className="pt-2">
              <h3 className="font-semibold text-gray-700 mb-2">Detalhes Técnicos</h3>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                {typeof property.area_terreno !== "undefined" && (
                  <li>
                    <span className="font-medium">Área do Terreno:</span> {property.area_terreno}
                  </li>
                )}
                {property.size && (
                  <li>
                    <span className="font-medium">Tamanho:</span> {property.size}
                  </li>
                )}
                {property.garagemtamanho && (
                  <li>
                    <span className="font-medium">Garagem (m²):</span> {property.garagemtamanho}
                  </li>
                )}
              </ul>
            </div>

            {/* Tabs Visão Geral */}
            <Tabs defaultValue="visao-geral" className="space-y-4 min-h-[300px]">
              <TabsList className="flex space-x-2 border-b overflow-x-auto">
                <TabsTrigger
                  value="visao-geral"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white px-3 py-2 sm:px-4 sm:py-2 rounded-t-md text-xs sm:text-sm font-medium transition flex-shrink-0"
                >
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger
                  value="video"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white px-3 py-2 sm:px-4 sm:py-2 rounded-t-md text-xs sm:text-sm font-medium transition flex-shrink-0"
                >
                  Vídeo
                </TabsTrigger>
                <TabsTrigger
                  value="tour"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white px-3 py-2 sm:px-4 sm:py-2 rounded-t-md text-xs sm:text-sm font-medium transition flex-shrink-0"
                >
                  Passeio Virtual
                </TabsTrigger>
              </TabsList>
              <TabsContent value="visao-geral">
                <div className="space-y-4">
                  {/* Detalhes principais */}
                  <ul className="text-gray-600 space-y-2 list-disc list-inside mt-2">
                    {property.tipo && (
                      <li>
                        <span className="font-semibold">Tipo:</span> {property.tipo}
                      </li>
                    )}
                    {typeof property.bedrooms !== "undefined" && (
                      <li>
                        <span className="font-semibold">Quartos:</span> {property.bedrooms}
                      </li>
                    )}
                    {typeof property.bathrooms !== "undefined" && (
                      <li>
                        <span className="font-semibold">Banheiros:</span> {property.bathrooms}
                      </li>
                    )}
                    {typeof property.garagens !== "undefined" && (
                      <li>
                        <span className="font-semibold">Garagens:</span> {property.garagens}
                      </li>
                    )}
                    {property.anoconstrucao && (
                      <li>
                        <span className="font-semibold">Ano:</span> {property.anoconstrucao}
                      </li>
                    )}
                    {property.propertyid && (
                      <li>
                        <span className="font-semibold">ID:</span> {property.propertyid}
                      </li>
                    )}
                    {typeof property.area_terreno !== "undefined" && (
                      <li>
                        <span className="font-semibold">Área do Terreno:</span> {property.area_terreno}
                      </li>
                    )}
                    {property.size && (
                      <li>
                        <span className="font-semibold">Tamanho:</span> {property.size}
                      </li>
                    )}
                    {property.garagemtamanho && (
                      <li>
                        <span className="font-semibold">Garagem (m²):</span> {property.garagemtamanho}
                      </li>
                    )}
                    {property.status && (
                      <li>
                        <span className="font-semibold">Status:</span> {property.status}
                      </li>
                    )}
                    {property.price && (
                      <li>
                        <span className="font-semibold">Preço:</span>{" "}
                        {property.price.toLocaleString(
                          property.unidade_preco === "dolar" ? "en-US" : "pt-AO",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}{" "}
                        {property.unidade_preco && (
                          <span className="text-sm font-normal">
                            {property.unidade_preco === "kwanza"
                              ? "KZ"
                              : property.unidade_preco === "dolar"
                              ? "USD"
                              : property.unidade_preco}
                          </span>
                        )}
                      </li>
                    )}
                  </ul>
                  {/* Características */}
                  {property.caracteristicas &&
                    Array.isArray(property.caracteristicas) &&
                    property.caracteristicas.length > 0 && (
                      <div className="pt-2">
                        <h3 className="font-semibold text-gray-700 mb-2">Características</h3>
                        <ul className="flex flex-wrap gap-2">
                          {Array.isArray(property.caracteristicas) &&
                            property.caracteristicas
                              .filter((c): c is string => typeof c === "string")
                              .map((c, i) => (
                                <li
                                  key={i}
                                  className="bg-purple-50 text-purple-700 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium border border-purple-100"
                                >
                                  {c}
                                </li>
                              ))}
                        </ul>
                      </div>
                    )}
                  {/* Detalhes Adicionais */}
                  {property.detalhesadicionais &&
                    Array.isArray(property.detalhesadicionais) &&
                    property.detalhesadicionais.length > 0 && (
                      <div className="pt-2">
                        <h3 className="font-semibold text-gray-700 mb-2">Detalhes Adicionais</h3>
                        <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          {Array.isArray(property.detalhesadicionais) &&
                            property.detalhesadicionais
                              .filter(
                                (d): d is { titulo: string; valor: string } =>
                                  typeof d === "object" &&
                                  d !== null &&
                                  "titulo" in d &&
                                  "valor" in d &&
                                  typeof (d as any).titulo === "string" &&
                                  typeof (d as any).valor === "string"
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
                <div className="text-gray-600 italic mt-4">Passeio virtual em breve disponível.</div>
              </TabsContent>
            </Tabs>

            {/* Descrição */}
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Descrição</h2>
              <p className="text-gray-600 leading-relaxed">
                {property.status === "para alugar"
                  ? "Imóvel disponível para arrendamento com excelente localização e infraestrutura."
                  : "Excelente oportunidade de compra. Ideal para moradia ou investimento."}
              </p>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Endereço</h2>
              <p className="text-gray-600 break-words">{property.endereco}</p>
            </div>

            {/* Formulário de contato + Agente juntos */}
            <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-xl border flex flex-col md:flex-row gap-6 sm:gap-8 items-center md:items-start">
              {/* Formulário de contato */}
              <div className="flex-1 w-full">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 text-left md:text-center">
                  Entrar em contato
                </h3>
                <AgentCardWithChat ownerData={ownerDetails.data} propertyId={property.id} userId={user?.id}/>
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
                {agents.map((agent) => (
                  <li key={agent.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-500">
                      <Image
                        src={agent.picture}
                        alt="Agente"
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {agent.name}
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