import { getPropertyById } from "@/lib/functions/get-properties";
import { getPropertyOwner } from "@/lib/functions/get-agent";
import { TPropertyResponseSchema } from "@/lib/types/property";
import ImoveisSemelhantes from "@/components/imoveis-destaque";
import { NotFoundState } from "@/components/not-found";
import { PropertyContact } from "@/components/property-contact";
import { PropertyDescription } from "@/components/property-description";
import { PropertyGallery } from "@/components/property-gallery";
import { PropertyHeader } from "@/components/property-header";
import { PropertyLocation } from "@/components/property-location";
import { TechnicalDetails } from "@/components/techinical-details";
import { checkIfPropertyIsBoosted, trackBoostView } from "@/lib/functions/supabase-actions/boost-functions";

// 🔑 METADATA DINÂMICA
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) {
    return {
      title: "Imóvel não encontrado",
      description: "Este imóvel não existe ou foi removido.",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  return {
    title: property.title || "Imóvel Incrível",
    description: property.description || "Veja mais detalhes deste imóvel.",
    openGraph: {
      title: property.title,
      description: property.description,
      url: `${siteUrl}/propriedades/${property.id}`,
      type: "article",
      images: [
        {
          url: property.image,
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: property.title,
      description: property.description,
      images: [`${siteUrl}/propriedades/${property.id}/opengraph-image`],
    },
  };
}

// ===== COMPONENTE PRINCIPAL =====
export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property: TPropertyResponseSchema | null = await getPropertyById(id);

  if (!property) {
    return <NotFoundState />;
  }

  // Verifica se o imóvel está impulsionado
  const isBoosted = await checkIfPropertyIsBoosted(property.id);

  if (isBoosted) {
    try {
      if (typeof window !== "undefined") {
        const viewedBoosts = JSON.parse(localStorage.getItem("boosted_views") || "{}");
        const lastViewTime = viewedBoosts[property.id];
        const now = Date.now();
        const twelveHours = 12 * 60 * 60 * 1000;

        if (!lastViewTime || now - lastViewTime > twelveHours) {
          await trackBoostView(property.id);
          viewedBoosts[property.id] = now;
          localStorage.setItem("boosted_views", JSON.stringify(viewedBoosts));
        }
      }
    } catch (error) {
      console.error("Erro ao registrar view impulsionada:", error);
    }
  }

  // Dados do proprietário
  const ownerDetails = await getPropertyOwner(property.id);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">

      {/* Immersive Gallery Section (Full Width Background) */}
      <div className="w-full bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
            <a href="/" className="hover:text-purple-600 transition-colors">Início</a>
            <span className="text-gray-300">/</span>
            <a href="/propriedades" className="hover:text-purple-600 transition-colors">Imóveis</a>
            <span className="text-gray-300">/</span>
            <span className="text-gray-800 font-medium truncate max-w-[200px]">{property.title}</span>
          </nav>
          <PropertyGallery property={property} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-12 gap-12">

          {/* Main Content (Left Column) */}
          <div className="lg:col-span-8 space-y-12">

            {/* Header & Title */}
            <PropertyHeader property={property} />

            {/* Content Blocks */}
            <div className="space-y-12">
              <TechnicalDetails property={property} />

              <div className="prose max-w-none">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Sobre este imóvel</h3>
                <PropertyDescription property={property} />
              </div>

              <div className="border-t border-gray-200 pt-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Localização</h3>
                <PropertyLocation property={property} />
              </div>
            </div>

            {/* Similar Properties (Below Content) */}
            <div className="pt-12 border-t border-gray-200">
              <ImoveisSemelhantes />
            </div>
          </div>

          {/* Sticky Sidebar (Right Column) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-24 space-y-6">

              {/* Contact Card */}
              <div className="bg-white rounded-2xl shadow-xl shadow-purple-900/5 border border-purple-100 overflow-hidden transform transition-all hover:scale-[1.01] duration-300">
                <div className="p-6 bg-linear-to-br from-purple-50 to-white">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Interessado?</h3>
                  <p className="text-sm text-gray-500 mb-6">Fale direto com o anunciante</p>
                  <PropertyContact property={property} ownerDetails={ownerDetails} />
                </div>
              </div>

              {/* Additional Info / Safety Tips could go here */}
              <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100 text-sm text-blue-800">
                <p className="font-semibold mb-2 flex items-center gap-2">🛡️ Dica de Segurança</p>
                Nunca faça pagamentos antecipados sem visitar o imóvel e assinar contrato.
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
