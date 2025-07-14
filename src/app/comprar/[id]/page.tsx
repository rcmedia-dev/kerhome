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
import { getPropertyById } from '@/lib/actions/get-properties';
import Link from "next/link";
import { PropertyResponse } from "@/lib/types/property";
import { PropertyFilterSidebar } from "@/components/sidebar-filtro";

export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  
  const [property, setProperty] = useState<PropertyResponse | null>(null);

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
      <div className="w-full h-[400px] overflow-hidden border-b border-gray-200">
        <iframe
          className="w-full h-full"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${encodeURIComponent(property.endereco ?? '')}&output=embed`}
        ></iframe>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-12 items-start">
          <div className="md:col-span-2 space-y-12 order-1 md:order-none">
            <Hero property={property} />
            <PropertyGallery gallery={property.gallery} title={property.title} />
            <PropertyTabs property={property} />
            <ContactAndAgent />
          </div>

          <PropertyFilterSidebar />
        </div>
      </div>
    </section>
  );
}

function Hero({ property }: { property: PropertyResponse }) {
  return (
    <div className="space-y-6">
      <span className="inline-block bg-orange-100 text-orange-700 text-sm font-medium px-4 py-1.5 rounded-full shadow-sm">
        {property.rotulo || (property.status === "para alugar" ? "Para Alugar" : "À Venda")}
      </span>
      <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">{property.title}</h1>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <MapPin className="w-4 h-4" />
        <span>{[property.endereco, property.bairro, property.cidade, property.provincia, property.pais].filter(Boolean).join(", ")}</span>
      </div>
    </div>
  );
}

function PropertyGallery({ gallery, title }: { gallery: string[]; title: string }) {
  if (!gallery || gallery.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="relative w-full h-[400px] rounded-3xl overflow-hidden shadow-xl border border-gray-200 mb-4">
        <Image src={gallery[0]} alt={title} fill className="object-cover" />
      </div>
      {gallery.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {gallery.slice(1).map((img, idx) => (
            <div key={idx} className="relative w-32 h-20 rounded-xl overflow-hidden border border-gray-200 shadow cursor-pointer hover:ring-2 hover:ring-purple-400 transition">
              <Image src={img} alt={title} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PropertyTabs({ property }: { property: PropertyResponse }) {
  return (
    <Tabs defaultValue="visao-geral" className="space-y-4">
      <TabsList className="flex space-x-2 border-b">
        <TabsTrigger value="visao-geral" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white px-4 py-2 rounded-t-md text-sm font-medium transition">Visão Geral</TabsTrigger>
        <TabsTrigger value="video" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white px-4 py-2 rounded-t-md text-sm font-medium transition">Vídeo</TabsTrigger>
        <TabsTrigger value="tour" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white px-4 py-2 rounded-t-md text-sm font-medium transition">Passeio Virtual</TabsTrigger>
      </TabsList>
      <TabsContent value="visao-geral">
        <ul className="text-gray-600 space-y-2 list-disc list-inside mt-2">
          <li><span className="font-semibold">Tipo:</span> {property.tipo}</li>
          <li><span className="font-semibold">Quartos:</span> {property.bedrooms}</li>
          <li><span className="font-semibold">Banheiros:</span> {property.bathrooms}</li>
          <li><span className="font-semibold">Garagens:</span> {property.garagens}</li>
          <li><span className="font-semibold">Área do Terreno:</span> {property.area_terreno}</li>
          <li><span className="font-semibold">Tamanho:</span> {property.size}</li>
        </ul>
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
  );
}

function ContactAndAgent() {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl border flex flex-col md:flex-row gap-8 items-center md:items-start">
      <div className="flex flex-col items-center text-center md:w-1/3 w-full">
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-purple-600 mb-3">
          <Image src="/people/1.jpg" alt="Agente" width={80} height={80} className="object-cover w-full h-full" />
        </div>
        <p className="text-lg font-semibold text-gray-900">
          <Link href="/agente" className="hover:underline text-purple-700 cursor-pointer">Maria Silva</Link>
        </p>
        <p className="text-sm text-purple-700 font-medium">Agente de Imóveis</p>
        <p className="text-xs text-gray-500 mb-4">maria.silva@kerhome.com</p>
        <a href="/agente" className="w-full bg-purple-700 text-white py-2 rounded-lg font-semibold hover:bg-purple-800 transition block text-center">Ver outras propriedades</a>
      </div>
      <div className="flex-1 w-full">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 text-left md:text-center">Entrar em contato</h3>
        <ContactForm />
      </div>
    </div>
  );
}

function ContactForm() {
  return (
    <form className="space-y-5">
      <InputField id="name" label="Nome" type="text" />
      <InputField id="email" label="Email" type="email" />
      <TextareaField id="message" label="Mensagem" />
      <button type="submit" className="w-full py-3 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg shadow transition">Enviar</button>
    </form>
  );
}

function InputField({ id, label, type }: { id: string; label: string; type: string }) {
  return (
    <div className="relative">
      <input type={type} id={id} placeholder=" " required className="peer w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
      <label htmlFor={id} className="absolute left-4 top-3 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-orange-500">{label}</label>
    </div>
  );
}

function TextareaField({ id, label }: { id: string; label: string }) {
  return (
    <div className="relative">
      <textarea id={id} placeholder=" " required rows={4} className="peer w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
      <label htmlFor={id} className="absolute left-4 top-3 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-orange-500">{label}</label>
    </div>
  );
}
