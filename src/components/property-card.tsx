'use client';

import { MapPin, BedDouble, Ruler, Pencil, Trash, Heart, Share2, Zap, AlertCircle, ShieldAlert, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { toggleFavoritoProperty } from '@/lib/functions/toggle-favorite';
import { TPropertyResponseSchema } from '@/lib/types/property';
import { getImoveisFavoritos } from '@/lib/functions/get-favorited-imoveis';
import { useUserStore } from '@/lib/store/user-store';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// =======================
// Subcomponentes (Redesigned)
// =======================
const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'comprar') return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/90 backdrop-blur-md text-white text-xs font-bold shadow-lg border border-white/20">
      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      À Venda
    </div>
  );
  if (status === 'arrendar') return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/90 backdrop-blur-md text-white text-xs font-bold shadow-lg border border-white/20">
      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      Arrendar
    </div>
  );
  return null;
};

const BoostedBadge = ({ isExpired, isSuspended }: { isExpired?: boolean; isSuspended?: boolean }) => {
  let bgColor = 'bg-gradient-to-r from-orange-500 to-purple-600';
  let icon = <Zap className="w-3 h-3 text-white" />;
  let text = 'Destaque';

  if (isSuspended) {
    bgColor = 'bg-red-600';
    icon = <ShieldAlert className="w-3 h-3 text-white" />;
    text = 'Suspenso';
  } else if (isExpired) {
    bgColor = 'bg-gray-500';
    icon = <AlertCircle className="w-3 h-3 text-white" />;
    text = 'Expirado';
  }

  return (
    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-lg ${bgColor} backdrop-blur-md border border-white/20`}>
      {icon}
      <span>{text}</span>
    </div>
  );
};

const UserActions = ({
  favorito,
  toggleFavorito,
  handleShare,
}: {
  favorito: boolean;
  toggleFavorito: () => void;
  handleShare: () => void;
}) => (
  <div className="absolute top-4 right-4 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
    <button
      onClick={(e) => { e.preventDefault(); toggleFavorito(); }}
      className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white hover:scale-110 transition active:scale-95 group/btn"
    >
      <Heart className={`w-5 h-5 transition-colors ${favorito ? 'text-red-500 fill-red-500' : 'text-gray-600 group-hover/btn:text-red-500'}`} />
    </button>
    <button
      onClick={(e) => { e.preventDefault(); handleShare(); }}
      className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white hover:scale-110 transition active:scale-95 group/btn"
    >
      <Share2 className="w-5 h-5 text-gray-600 group-hover/btn:text-blue-500" />
    </button>
  </div>
);

const OwnerActions = ({
  propertyId,
  userId,
  onDelete,
}: {
  propertyId: string;
  userId: string;
  onDelete?: () => void;
}) => (
  <div className="absolute top-4 right-4 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
    <Link
      href={`/propriedades/${propertyId}/editar`}
      className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white hover:scale-110 transition active:scale-95 group/btn"
    >
      <Pencil className="w-5 h-5 text-gray-600 group-hover/btn:text-blue-500" />
    </Link>
    {onDelete && (
      <button
        onClick={(e) => {
          e.preventDefault();
          onDelete();
        }}
        className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white hover:scale-110 transition active:scale-95 group/btn"
      >
        <Trash className="w-5 h-5 text-gray-600 group-hover/btn:text-red-500" />
      </button>
    )}
  </div>
);

// =======================
// Interface do Componente Principal
// =======================
interface PropertyCardProps {
  property: TPropertyResponseSchema;
  canBoost?: boolean;
  onDelete?: () => void;
}

// =======================
// Componente Principal
// =======================
export function PropertyCard({ property, canBoost = true, onDelete }: PropertyCardProps) {
  const { user } = useUserStore();
  const isOwner = user?.id === property.owner_id;

  const [favorito, setFavorito] = useState(false);
  const [boostInfo, setBoostInfo] = useState<{
    isBoosted: boolean;
    isExpired: boolean;
    isSuspended: boolean;
    status: 'active' | 'pending' | 'rejected' | 'expired' | null;
    rejected_reason?: string;
  }>({
    isBoosted: false,
    isExpired: false,
    isSuspended: false,
    status: null
  });
  const [isTogglingFav, setIsTogglingFav] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/propriedades/${property.id}`);
    }
    return () => { mountedRef.current = false; };
  }, [property.id]);

  // Check favorito
  useEffect(() => {
    if (!user) { setFavorito(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const favoritos = await getImoveisFavoritos(user.id);
        if (!cancelled && mountedRef.current) {
          setFavorito(favoritos.some(fav => fav.id === property.id));
        }
      } catch (e) { console.error(e); }
    })();
    return () => { cancelled = true; };
  }, [user, property.id]);

  // Check boosted status
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('properties_to_boost')
          .select('id, status, created_at, plan_id, rejected_reason')
          .eq('property_id', property.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          let isExpired = false;
          let isSuspended = false;
          if (data.rejected_reason === 'suspicious') isSuspended = true;

          if (data.status === 'active' && !isSuspended) {
            const { data: planData } = await supabase.from('pacotes_destaque').select('dias').eq('id', data.plan_id).single();
            if (planData?.dias) {
              const expiresAt = new Date(new Date(data.created_at).setDate(new Date(data.created_at).getDate() + planData.dias));
              isExpired = new Date() > expiresAt;
            }
          } else if (data.status === 'expired') isExpired = true;

          if (!cancelled && mountedRef.current) {
            setBoostInfo({
              isBoosted: data.status === 'active' && !isExpired && !isSuspended,
              isExpired: isExpired || data.status === 'expired',
              isSuspended: isSuspended,
              status: data.status,
              rejected_reason: data.rejected_reason
            });
          }
        }
      } catch (e) { console.error(e); }
    })();
    return () => { cancelled = true; };
  }, [property.id]);


  // Toggle favorito
  const toggleFavorito = useCallback(async () => {
    if (!user) { toast.warning('Você precisa estar autenticado para guardar imóveis.'); return; }
    if (isTogglingFav) return;
    setIsTogglingFav(true);
    const previousState = favorito;
    setFavorito(!favorito);
    try {
      const result = await toggleFavoritoProperty(user.id, property.id);
      if (!result.success) throw new Error(result.error || "Erro ao favoritar");
      setFavorito(result.isFavorited);
    } catch (e) {
      setFavorito(previousState);
      toast.error('Erro ao atualizar favoritos');
    } finally { if (mountedRef.current) setIsTogglingFav(false); }
  }, [user, favorito, property.id, isTogglingFav]);

  // Compartilhar
  const handleShare = useCallback(async () => {
    if (!shareUrl) return;
    if (navigator.share) {
      try { await navigator.share({ title: property.title, url: shareUrl }); } catch { }
    } else {
      await navigator.clipboard.writeText(shareUrl); toast.success('Link copiado!');
    }
  }, [shareUrl, property.title]);


  return (
    <div className="group relative w-full bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden border border-gray-100 pb-2">

      {/* IMAGEM & BADGES */}
      <div className="relative h-[250px] w-full overflow-hidden shrink-0">
        <Link href={`/propriedades/${property.id}`} className="absolute inset-0 z-10" />

        <Image
          src={property.image ?? '/house.jpg'}
          alt={property.title}
          fill
          priority
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Top Badges - Padronizado igual imagem: Verde para venda */}
        <div className="absolute top-4 left-4 z-20">
          {/* Se for destaque, mostra destaque, senão mostra status padrao */}
          {(boostInfo.isBoosted || boostInfo.isSuspended || boostInfo.isExpired) ? (
            <BoostedBadge isExpired={boostInfo.isExpired} isSuspended={boostInfo.isSuspended} />
          ) : (
            <div className={`px-4 py-1.5 rounded-full text-white text-sm font-semibold shadow-sm ${property.status === 'comprar' ? 'bg-[#10B981]' : 'bg-blue-500'}`}>
              {property.status === 'comprar' ? 'À venda' : 'Arrendar'}
            </div>
          )}
        </div>

        {/* Actions - Bottom Right - Círculos brancos */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-3">
          {!isOwner && (
            <>
              <button
                onClick={(e) => { e.preventDefault(); toggleFavorito(); }}
                className="bg-white w-10 h-10 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition active:scale-95"
              >
                <Heart className={`w-5 h-5 ${favorito ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); handleShare(); }}
                className="bg-white w-10 h-10 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition active:scale-95"
              >
                <Share2 className="w-5 h-5 text-gray-400" />
              </button>
            </>
          )}
          {isOwner && (
            <div className="flex gap-2">
              <Link
                href={`/propriedades/${property.id}/editar`}
                className="bg-white w-10 h-10 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition active:scale-95"
              >
                <Pencil className="w-5 h-5 text-gray-400 hover:text-blue-500" />
              </Link>
              {onDelete && (
                <button
                  onClick={(e) => { e.preventDefault(); onDelete(); }}
                  className="bg-white w-10 h-10 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition active:scale-95"
                >
                  <Trash className="w-5 h-5 text-gray-400 hover:text-red-500" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* INFO CONTENT */}
      <div className="flex-1 px-5 pt-5 pb-4 flex flex-col relative">

        {/* Location Row */}
        <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-1.5">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="line-clamp-1">{property.endereco || "Localização não informada"}</span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-[#1A1A1A] leading-tight line-clamp-2 mb-3 h-[50px] overflow-hidden" title={property.title}>
          <Link href={`/propriedades/${property.id}`}>
            {property.title}
          </Link>
        </h3>

        {/* Features Row - Justify Between (Left / Right split) */}
        <div className="flex items-center justify-between text-gray-600 text-sm mb-2 border-b border-gray-50 pb-2">
          {/* Left: Bedrooms */}
          <div className="flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-gray-400" />
            <span className="font-medium">{property.bedrooms} Quartos</span>
          </div>

          {/* Right: Size */}
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{property.size}m²</span>
          </div>
        </div>

        {/* Type & Bathrooms Row - Justify Between */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span className="capitalize">{property.tipo}</span>
          {(property.bathrooms && property.bathrooms > 0) ? (
            <span className="text-gray-500">{property.bathrooms} Banheiros</span>
          ) : (
            <span></span>
          )}
        </div>

        {/* Price - Orange & Bold */}
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-5 h-5 text-[#F97316] -rotate-90" />
          <span className="text-2xl font-bold text-[#F97316]">
            {property.price?.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz
          </span>
        </div>

        {/* Button - Purple Layout */}
        <Link
          href={`/propriedades/${property.id}`}
          className="w-full bg-[#820AD1] hover:bg-[#6e08b0] text-white font-bold py-3.5 rounded-xl text-center transition-colors shadow-sm text-base mt-auto"
        >
          Ver detalhes
        </Link>

      </div>
    </div>
  );
}