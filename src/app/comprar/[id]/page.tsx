"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { MapPin, BedDouble, Ruler, Tag } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Property } from "@/lib/types/property";
import { getPropertyById } from '@/lib/actions/get-properties';
import Link from "next/link";


export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [property, setProperty] = useState<Property | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const prop = await getPropertyById(id);
      console.log('Property retornada do Supabase:', prop);
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
            property.location
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
                    <Tag className="w-6 h-6" /> {property.price} {property.unidadepreco && <span className="text-base font-normal">{property.unidadepreco}</span>}
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

            {/* Características */}
            {property.caracteristicas && property.caracteristicas.length > 0 && (
              <div className="pt-2">
                <h3 className="font-semibold text-gray-700 mb-2">Características</h3>
                <ul className="flex flex-wrap gap-2">
                  {property.caracteristicas.map((c, i) => (
                    <li key={i} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-medium border border-purple-100">{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Detalhes Técnicos */}
            <div className="pt-2">
              <h3 className="font-semibold text-gray-700 mb-2">Detalhes Técnicos</h3>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                {typeof property.areaterreno !== 'undefined' && (
                  <li><span className="font-medium">Área do Terreno:</span> {property.areaterreno}</li>
                )}
                {property.size && (
                  <li><span className="font-medium">Tamanho:</span> {property.size}</li>
                )}
                {property.garagemtamanho && (
                  <li><span className="font-medium">Garagem (m²):</span> {property.garagemtamanho}</li>
                )}
              </ul>
            </div>

            {/* Detalhes Adicionais */}
            {property.detalhesadicionais && property.detalhesadicionais.length > 0 && (
              <div className="pt-2">
                <h3 className="font-semibold text-gray-700 mb-2">Detalhes Adicionais</h3>
                <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                  {property.detalhesadicionais.map((d: { titulo: string; valor: string }, i: number) => (
                    <li key={i}><span className="font-medium">{d.titulo}:</span> {d.valor}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Botão Comparar */}
            <div className="flex justify-end mt-6">
              <a
                href={`/comprar/comparar?id=${property.id}`}
                className="px-8 py-3 rounded-2xl font-bold text-white text-lg shadow-lg transition-all border-0 bg-gradient-to-r from-orange-500 via-purple-600 to-orange-400 hover:from-orange-600 hover:via-purple-700 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 animate-gradient-x"
                style={{ backgroundSize: '200% 200%' }}
              >
                <svg xmlns='http://www.w3.org/2000/svg' className='w-6 h-6 mr-2 inline-block' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 4H6a2 2 0 00-2 2v12a2 2 0 002 2h4m4-16h4a2 2 0 012 2v12a2 2 0 01-2 2h-4m-4 0V4m4 16V4' /></svg>
                Comparar com outros imóveis
              </a>
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
                    {typeof property.areaterreno !== 'undefined' && (
                      <li><span className="font-semibold">Área do Terreno:</span> {property.areaterreno}</li>
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
                      <li><span className="font-semibold">Preço:</span> {property.price} {property.unidadepreco && <span className="text-base font-normal">{property.unidadepreco}</span>}</li>
                    )}
                  </ul>
                  {/* Características */}
                  {property.caracteristicas && property.caracteristicas.length > 0 && (
                    <div className="pt-2">
                      <h3 className="font-semibold text-gray-700 mb-2">Características</h3>
                      <ul className="flex flex-wrap gap-2">
                        {property.caracteristicas.map((c, i) => (
                          <li key={i} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-medium border border-purple-100">{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Detalhes Adicionais */}
                  {property.detalhesadicionais && property.detalhesadicionais.length > 0 && (
                    <div className="pt-2">
                      <h3 className="font-semibold text-gray-700 mb-2">Detalhes Adicionais</h3>
                      <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        {property.detalhesadicionais.map((d, i) => (
                          <li key={i}><span className="font-medium">{d.titulo}:</span> {d.valor}</li>
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
              <p className="text-gray-600">{property.location}</p>
            </div>

            {/* Formulário de contato + Agente juntos */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border flex flex-col md:flex-row gap-8 items-center md:items-start">
              {/* Card do Agente */}
              <div className="flex flex-col items-center text-center md:w-1/3 w-full">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-purple-600 mb-3">
                  <Image
                    src="/people/1.jpg"
                    alt="Agente"
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  <Link href="/agente" className="hover:underline text-purple-700 cursor-pointer">
                    Maria Silva
                  </Link>
                </p>
                <p className="text-sm text-purple-700 font-medium">
                  Agente de Imóveis
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  maria.silva@kerhome.com
                </p>
                <a
                  href="/agente"
                  className="w-full bg-purple-700 text-white py-2 rounded-lg font-semibold hover:bg-purple-800 transition block text-center"
                >
                  Ver outras propriedades
                </a>
              </div>
              {/* Formulário de contato */}
              <div className="flex-1 w-full">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 text-left md:text-center">
                  Entrar em contato
                </h3>
                <ContactForm />
              </div>
            </div>
          </div>

          {/* Sidebar Filtro + Info */}
          <div className="hidden md:block md:col-span-1 sticky top-24 self-start order-none md:order-last space-y-6">
            {/* Filtro de imóveis */}
            <div className="bg-white border shadow-md rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Filtrar imóveis
              </h3>
              <select className="w-full border px-3 py-2 rounded-md text-sm">
                <option>Status</option>
                <option>Para alugar</option>
                <option>Para comprar</option>
              </select>
              <input
                type="text"
                placeholder="Tipo de imóvel"
                className="w-full border px-3 py-2 rounded-md text-sm"
              />
              <input
                type="number"
                placeholder="Nº de banhos"
                className="w-full border px-3 py-2 rounded-md text-sm"
              />
              <input
                type="number"
                placeholder="Nº de quartos"
                className="w-full border px-3 py-2 rounded-md text-sm"
              />
              <input
                type="number"
                placeholder="Nº de garagens"
                className="w-full border px-3 py-2 rounded-md text-sm"
              />
              <input
                type="number"
                placeholder="Preço máximo"
                className="w-full border px-3 py-2 rounded-md text-sm"
              />
              <input
                type="text"
                placeholder="Tamanho mínimo (m²)"
                className="w-full border px-3 py-2 rounded-md text-sm"
              />
              <button className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition">
                Buscar
              </button>
            </div>

            {/* Cidades disponíveis */}
            <div className="bg-white border shadow-md rounded-2xl p-6 space-y-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Cidades com imóveis
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>Luanda (12)</li>
                <li>Benguela (8)</li>
                <li>Lubango (5)</li>
                <li>Huambo (4)</li>
              </ul>
            </div>

            {/* Imóveis em destaque */}
            <div className="bg-white border shadow-md rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Imóveis em destaque
              </h3>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <a
                    href="#"
                    key={i}
                    className="block border border-orange-500 rounded-lg overflow-hidden shadow hover:shadow-md transition"
                  >
                    <Image
                      src="/house.jpg"
                      alt="Destaque"
                      width={300}
                      height={200}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-3">
                      <h4 className="text-sm font-semibold text-gray-800">
                        Apartamento em Talatona
                      </h4>
                      <p className="text-xs text-gray-500">Luanda</p>
                      <p className="text-sm font-bold text-orange-500 mt-1">
                        60.000.000 Kz
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

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

export function ContactForm() {
  return (
    <form className="space-y-5">
      <div className="relative">
        <input
          type="text"
          id="name"
          placeholder=" "
          required
          className="peer w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        />
        <label
          htmlFor="name"
          className="absolute left-4 top-3 text-gray-500 text-sm transition-all \
            peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base \
            peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm \
            peer-focus:text-orange-500"
        >
          Nome
        </label>
      </div>

      <div className="relative">
        <input
          type="email"
          id="email"
          placeholder=" "
          required
          className="peer w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        />
        <label
          htmlFor="email"
          className="absolute left-4 top-3 text-gray-500 text-sm transition-all \
            peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base \
            peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm \
            peer-focus:text-orange-500"
        >
          Email
        </label>
      </div>

      <div className="relative">
        <textarea
          id="message"
          placeholder=" "
          required
          rows={4}
          className="peer w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        />
        <label
          htmlFor="message"
          className="absolute left-4 top-3 text-gray-500 text-sm transition-all \
            peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base \
            peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm \
            peer-focus:text-orange-500"
        >
          Mensagem
        </label>
      </div>

      <button
        type="submit"
        className="w-full py-3 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg shadow transition"
      >
        Enviar
      </button>
    </form>
  );
}
