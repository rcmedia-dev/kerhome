"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-context";
import { getPropertyById } from "@/lib/actions/get-properties";
import { TPropertyResponseSchema } from "@/lib/types/property";
import { useQuery } from "@tanstack/react-query";
import { getPropertyOwner } from "@/lib/actions/get-agent";
import ImoveisSemelhantes from "@/components/imoveis-destaque";
import CorretoresEmDestaque from "@/components/corretores";
import { PropertySkeleton } from "../componentes/property-skeleton";
import { PropertyGallery } from "../componentes/gallery";
import { PropertyHeader } from "../componentes/property-header";
import { TechnicalDetails } from "../componentes/techinical-details";
import { PropertyTabs } from "../componentes/property-tabs";
import { PropertyDescription } from "../componentes/property-description";
import { PropertyLocation } from "../componentes/property-location";
import { PropertyContact } from "../componentes/property-contact";
import { MobileMenu } from "../componentes/mobile-menu";
import { ErrorState } from "../componentes/error-state";
import { NotFoundState } from "../componentes/not-found";

// ===== COMPONENTE PRINCIPAL =====
export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  // Resolve a Promise do params usando React.use()
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;
  
  const [property, setProperty] = useState<TPropertyResponseSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const propertyDetails = useQuery({
    queryKey: ["propertie-data-comprar", id],
    queryFn: async () => {
      const response = await getPropertyById(id);
      setProperty(response);
      return response;
    },
    enabled: !!id, // Só executa quando o id estiver disponível
  });

  const ownerDetails = useQuery({
    queryKey: ["owner-data-comprar", propertyDetails.data?.id],
    queryFn: async () => {
      if (!propertyDetails.data?.id) return null;
      return await getPropertyOwner(propertyDetails.data.id);
    },
    enabled: !!propertyDetails.data?.id,
  });

  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      try {
        setLoading(true);
        const prop = await getPropertyById(id);
        setProperty(prop);
      } catch (err) {
        console.error("Error fetching property:", err);
        setError("Não foi possível carregar os dados do imóvel.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  // Adicione uma verificação adicional enquanto o params está sendo resolvido
  if (!resolvedParams || !id) return <PropertySkeleton />;
  if (loading) return <PropertySkeleton />;
  if (error) return <ErrorState error={error} onRetry={() => window.location.reload()} />;
  if (!property) return <NotFoundState />;

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

      {/* Mapa */}
      <div className="w-full h-[250px] sm:h-[350px] overflow-hidden border-b border-gray-200">
        <iframe
          className="w-full h-full"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${encodeURIComponent(
            property.endereco ?? ""
          )}&output=embed`}
        ></iframe>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-3 sm:px-5 py-6 sm:py-12">
        <div className="grid lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Main */}
          <div className="lg:col-span-3 space-y-6 sm:space-y-8">
            <PropertyHeader property={property} />
            <div className="bg-white rounded-xl p-5 shadow-sm border">
              <PropertyGallery property={property} />
            </div>
            <TechnicalDetails property={property} />
            <PropertyTabs property={property} />
            <PropertyDescription property={property} />
            <PropertyLocation property={property} />
            <PropertyContact
              property={property}
              ownerDetails={ownerDetails.data}
              user={user}
            />
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

      <MobileMenu />
    </div>
  );
}