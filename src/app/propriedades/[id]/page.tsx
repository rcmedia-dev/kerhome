import { getPropertyById, getPropertyBySlug } from "@/lib/functions/get-properties";
import { getPropertyOwner } from "@/lib/functions/get-agent";
import { TPropertyResponseSchema } from "@/lib/types/property";
import PropertySuggestions from "@/components/property-suggestions";
import { PropertyCreditSimulator } from "@/components/property-credit-simulator";
import { NotFoundState } from "@/components/not-found";
import { PropertyContact } from "@/components/property-contact";
import { PropertyDescription } from "@/components/property-description";
import { PropertyGallery } from "@/components/property-gallery";
import { PropertyHeader } from "@/components/property-header";
import { PropertyLocation } from "@/components/property-location";
import { TechnicalDetails } from "@/components/techinical-details";
import { MobileContactFAB } from "@/components/mobile-contact-fab";
import { checkIfPropertyIsBoosted, trackBoostView } from "@/lib/functions/supabase-actions/boost-functions";
import { redirect } from "next/navigation";

function isUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

// 🔑 METADATA DINMICA
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let property = isUUID(id) ? await getPropertyById(id) : await getPropertyBySlug(id);

  if (!property) {
    return {
      title: "Imóvel não encontrado",
      description: "Este imóvel não existe ou foi removido.",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const propertyUrl = property.slug 
    ? `${siteUrl}/propriedades/${property.slug}`
    : `${siteUrl}/propriedades/${property.id}`;

  return {
    title: property.title || "Imóvel Incrível",
    description: property.description || "Veja mais detalhes deste imóvel.",
    openGraph: {
      title: property.title,
      description: property.description,
      url: propertyUrl,
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
      images: [`${propertyUrl}/opengraph-image`],
    },
  };
}

// ===== COMPONENTE PRINCIPAL =====
export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property: TPropertyResponseSchema | null = isUUID(id) ? await getPropertyById(id) : await getPropertyBySlug(id);

  if (!property) {
    return <NotFoundState />;
  }

  // Redirect to slug URL if accessing by ID
  if (property.slug && isUUID(id)) {
    redirect(`/propriedades/${property.slug}`);
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
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans overflow-x-hidden">

      {/* Immersive Gallery Section - Full Width */}
      <div className="w-full">
        <div className="px-0">
          <nav className="text-[10px] md:text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-1.5 md:gap-2 px-1">
            <a href="/" className="hover:text-purple-600 transition-colors shrink-0">Início</a>
            <span className="text-gray-300">/</span>
            <a href="/propriedades" className="hover:text-purple-600 transition-colors shrink-0">Imóveis</a>
            <span className="text-gray-300">/</span>
            <span className="text-gray-800 font-medium truncate max-w-[150px] md:max-w-[300px]">{property.title}</span>
          </nav>
          <PropertyGallery property={property} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-12 gap-8 md:gap-12 min-w-0">

          {/* Main Content (Left Column) */}
          <div className="lg:col-span-8 space-y-12 min-w-0">

            {/* Header & Title */}
            <PropertyHeader property={property} />

            {/* Content Blocks */}
            <div className="space-y-8 md:space-y-12">
              <TechnicalDetails property={property} />


              {/* Características/Features */}
              {property.caracteristicas && property.caracteristicas.length > 0 && (
                <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-5">Características</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.caracteristicas.map((feature, idx) => (
                      <span 
                        key={idx} 
                        className="px-4 py-2 bg-gradient-to-r from-purple-50 to-orange-50 text-gray-800 rounded-full text-xs font-semibold border border-purple-100"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="prose max-w-none bg-white rounded-2xl p-5 md:p-8 border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-5 border-b border-gray-100 pb-3">Sobre este imóvel</h3>
                <PropertyDescription property={property} />
              </div>

              {/* Credit Simulator Section */}
              <div className="border-t border-gray-200 pt-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Simular Crédito</h3>
                <PropertyCreditSimulator 
                  propertyPrice={property.price || 0}
                  propertyTitle={property.title}
                  unidade_preco={property.unidade_preco}
                />
              </div>

              <div className="border-t border-gray-200 pt-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Localização</h3>
                <PropertyLocation property={property} />
              </div>
            </div>

            {/* Property Suggestions (Below Content) */}
            <div className="pt-12 border-t border-gray-200">
              <PropertySuggestions property={property} />
            </div>
          </div>

          {/* Sticky Sidebar (Right Column) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-[140px] space-y-6 z-10">

              {/* Contact Card */}
              <div className="bg-white rounded-2xl shadow-xl shadow-purple-900/5 border border-purple-100 overflow-hidden transform transition-all hover:scale-[1.01] duration-300 hidden lg:block">
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
      
      {/* Floating Action Button for Contact (Mobile Only) */}
      <MobileContactFAB property={property} ownerDetails={ownerDetails} />
    </div>
  );
}
