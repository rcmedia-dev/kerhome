import Image from 'next/image';
import { notFound } from 'next/navigation';
import { MapPin, BedDouble, Ruler, Tag } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Property } from '@/lib/types/property';

async function getProperty(id: string): Promise<Property | null> {
  const res = await fetch(`http://localhost:3000/api/properties/${id}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return null;
  return res.json();
}

export default async function PropertyPage({ params }: { params: { id: string } }) {
  const property = await getProperty(params.id);

  if (!property) return notFound();

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
                {property.status === 'para alugar' ? 'Para Alugar' : 'À Venda'}
              </span>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                {property.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>{property.location}</span>
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-gray-700 mt-4">
                <div className="flex items-center gap-2">
                  <BedDouble className="w-5 h-5 text-orange-500" />
                  <span>{property.bedrooms} Quartos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-orange-500" />
                  <span>{property.size}</span>
                </div>
              </div>
              <p className="text-3xl font-extrabold text-orange-500 mt-6 flex items-center gap-2">
                <Tag className="w-6 h-6" /> {property.price}
              </p>
            </div>

            {/* Imagem principal */}
            <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-xl border border-gray-200">
              <Image
                src={property.image}
                alt={property.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Tabs Visão Geral */}
            <Tabs defaultValue="visao-geral" className="space-y-4">
              <TabsList className="flex space-x-2 border-b">
                <TabsTrigger value="visao-geral" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white px-4 py-2 rounded-t-md text-sm font-medium transition">Visão Geral</TabsTrigger>
                <TabsTrigger value="video" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white px-4 py-2 rounded-t-md text-sm font-medium transition">Vídeo</TabsTrigger>
                <TabsTrigger value="tour" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white px-4 py-2 rounded-t-md text-sm font-medium transition">Passeio Virtual</TabsTrigger>
              </TabsList>
              <TabsContent value="visao-geral">
                <ul className="text-gray-600 space-y-2 list-disc list-inside mt-4">
                  <li>{property.bedrooms} Quartos</li>
                  <li>Tamanho: {property.size}</li>
                  <li>Status: {property.status}</li>
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

            {/* Descrição */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Descrição</h2>
              <p className="text-gray-600 leading-relaxed">
                {property.status === 'para alugar'
                  ? 'Imóvel disponível para arrendamento com excelente localização e infraestrutura.'
                  : 'Excelente oportunidade de compra. Ideal para moradia ou investimento.'}
              </p>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Endereço</h2>
              <p className="text-gray-600">{property.location}</p>
            </div>

            {/* Formulário de contato */}
            <div className="bg-white rounded-2xl p-6 shadow-md border">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Entrar em contato</h3>
              <ContactForm />
            </div>
          </div>

          {/* Sidebar Filtro + Info */}
          <div className="md:col-span-1 sticky top-24 self-start order-none md:order-last space-y-6">
            <div className="bg-white border shadow-md rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Filtrar imóveis</h3>
              <select className="w-full border px-3 py-2 rounded-md text-sm">
                <option>Status</option>
                <option>Para alugar</option>
                <option>Para comprar</option>
              </select>
              <input type="text" placeholder="Tipo de imóvel" className="w-full border px-3 py-2 rounded-md text-sm" />
              <input type="number" placeholder="Nº de banhos" className="w-full border px-3 py-2 rounded-md text-sm" />
              <input type="number" placeholder="Nº de quartos" className="w-full border px-3 py-2 rounded-md text-sm" />
              <input type="number" placeholder="Nº de garagens" className="w-full border px-3 py-2 rounded-md text-sm" />
              <input type="number" placeholder="Preço máximo" className="w-full border px-3 py-2 rounded-md text-sm" />
              <input type="text" placeholder="Tamanho mínimo (m²)" className="w-full border px-3 py-2 rounded-md text-sm" />
              <button className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition">Buscar</button>
            </div>

            {/* Cidades disponíveis */}
            <div className="bg-white border shadow-md rounded-2xl p-6 space-y-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Cidades com imóveis</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>Luanda (12)</li>
                <li>Benguela (8)</li>
                <li>Lubango (5)</li>
                <li>Huambo (4)</li>
              </ul>
            </div>

            {/* Imóveis em destaque */}
            <div className="bg-white border shadow-md rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Imóveis em destaque</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <a href="#" key={i} className="block border border-orange-500 rounded-lg overflow-hidden shadow hover:shadow-md transition">
                    <Image src="/house.jpg" alt="Destaque" width={300} height={200} className="w-full h-32 object-cover" />
                    <div className="p-3">
                      <h4 className="text-sm font-semibold text-gray-800">Apartamento em Talatona</h4>
                      <p className="text-xs text-gray-500">Luanda</p>
                      <p className="text-sm font-bold text-orange-500 mt-1">60.000.000 Kz</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Corretores em destaque */}
            <div className="bg-white border shadow-md rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Corretores em destaque</h3>
              <ul className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-500">
                      <Image src="/people/1.jpg" alt="Agente" width={48} height={48} className="object-cover w-full h-full" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">João Pedro</p>
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
