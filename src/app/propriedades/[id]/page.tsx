import { getPropertyById } from "@/lib/functions/get-properties";
import { getPropertyOwner } from "@/lib/functions/get-agent";
import { TPropertyResponseSchema } from "@/lib/types/property";
import ImoveisSemelhantes from "@/components/imoveis-destaque";
import CorretoresEmDestaque from "@/components/corretores";
import { NotFoundState } from "@/components/not-found";
import { PropertyContact } from "@/components/property-contact";
import { PropertyDescription } from "@/components/property-description";
import { PropertyGallery } from "@/components/property-gallery";
import { PropertyHeader } from "@/components/property-header";
import { PropertyLocation } from "@/components/property-location";
import { PropertyTabs } from "@/components/property-tabs";
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
      // Evita duplicar views — só roda no lado do cliente
      if (typeof window !== "undefined") {
        const viewedBoosts = JSON.parse(localStorage.getItem("boosted_views") || "{}");
        const lastViewTime = viewedBoosts[property.id];
        const now = Date.now();
        const twelveHours = 12 * 60 * 60 * 1000; // 12h em milissegundos

        if (!lastViewTime || now - lastViewTime > twelveHours) {
          // Registra visualização no Supabase
          await trackBoostView(property.id);

          // Atualiza registro local
          viewedBoosts[property.id] = now;
          localStorage.setItem("boosted_views", JSON.stringify(viewedBoosts));
        } else {
          console.log("View já contada recentemente — ignorando.");
        }
      }
    } catch (error) {
      console.error("Erro ao registrar view impulsionada:", error);
    }
  }

  // Dados do proprietário
  const ownerDetails = await getPropertyOwner(property.id);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 overflow-x-hidden pb-16 md:pb-0">
      {/* Header com breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-3 px-4">
        <div className="max-w-7xl mx-auto">
          <nav className="text-sm text-gray-500">
            <span>Início</span> / <span>Imóveis</span> /{" "}
            <span>{property.cidade || "Cidade"}</span> /{" "}
            <span className="text-gray-800 font-medium">{property.title}</span>
          </nav>
        </div>
      </div>

      {/* Mapa no topo */}
      <div className="w-full h-[250px] sm:h-[350px] overflow-hidden border-b border-gray-200">
        <iframe
          className="w-full h-full"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${encodeURIComponent(property.endereco ?? "")}&output=embed`}
        ></iframe>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-3 sm:px-5 py-6 sm:py-12">
        <div className="grid lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Conteúdo principal */}
          <div className="lg:col-span-3 space-y-6 sm:space-y-8">
            <PropertyHeader property={property} />

            <div className="bg-white rounded-xl p-5 shadow-sm border">
              <PropertyGallery property={property} />
            </div>

            <TechnicalDetails property={property} />
            <PropertyTabs property={property} />
            <PropertyDescription property={property} />
            <PropertyLocation property={property} />
            <PropertyContact property={property} ownerDetails={ownerDetails} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-24 space-y-6">
              <ImoveisSemelhantes />
              <CorretoresEmDestaque />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
