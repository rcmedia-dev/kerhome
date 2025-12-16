'use client';

import { MapPin, BedDouble, Ruler, Tag, Pencil, Trash, Heart, Share2, Star, Zap, AlertCircle, ShieldAlert } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { toggleFavoritoProperty } from '@/lib/functions/toggle-favorite';
import { TPropertyResponseSchema } from '@/lib/types/property';
import { getImoveisFavoritos } from '@/lib/functions/get-favorited-imoveis';
import { deleteProperty } from '@/lib/functions/supabase-actions/delete-propertie';
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

  // Check boosted status (Logica mantida simplificada aqui, focando no visual)
  // ... (A lógica de boostInfo original pode ser mantida ou re-inserida se for crítica, aqui mantemos o mesmo hook)
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
    <div className="group relative w-full h-[420px] bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden border border-gray-100">

      {/* IMAGEM & BADGES */}
      <div className="relative h-[65%] w-full overflow-hidden">
        <Link href={`/propriedades/${property.id}`} className="absolute inset-0 z-10" />

        <Image
          src={property.image ?? '/house.jpg'}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
          {(boostInfo.isBoosted || boostInfo.isSuspended || boostInfo.isExpired) ? (
            <BoostedBadge isExpired={boostInfo.isExpired} isSuspended={boostInfo.isSuspended} />
          ) : (
            <StatusBadge status={property.status} />
          )}
        </div>

        {/* Floating Price Tag */}
        <div className="absolute bottom-4 left-4 z-20">
          <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-white/20 flex items-baseline gap-1">
            <span className="text-gray-900 font-extrabold text-lg">
              {property.price?.toLocaleString('pt-AO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="text-purple-600 font-bold text-xs uppercase">Kz</span>
            {property.status === 'arrendar' && <span className="text-gray-500 text-xs font-medium">/ mês</span>}
          </div>
        </div>

        {/* User Actions (Hover only) */}
        {!isOwner && <UserActions favorito={favorito} toggleFavorito={toggleFavorito} handleShare={handleShare} />}

        {isOwner && <OwnerActions propertyId={property.id} userId={user.id} onDelete={onDelete} />}
      </div>

      {/* INFO CONTENT */}
      <div className="flex-1 p-5 flex flex-col justify-between bg-white relative">
        <div className="space-y-3">
          {/* Location */}
          <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium uppercase tracking-wide">
            <MapPin className="w-3.5 h-3.5 text-purple-500" />
            <span className="line-clamp-1">{property.endereco}</span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-purple-600 transition-colors">
            <Link href={`/propriedades/${property.id}`}>
              {property.title}
            </Link>
          </h3>

          {/* Features */}
          <div className="flex items-center gap-4 text-gray-600 text-sm pt-1">
            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg">
              <BedDouble className="w-4 h-4 text-gray-400" />
              <span className="font-semibold">{property.bedrooms}</span>
              <span className="text-xs text-gray-400 font-medium">Quartos</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg">
              <Ruler className="w-4 h-4 text-gray-400" />
              <span className="font-semibold">{property.size}</span>
              <span className="text-xs text-gray-400 font-medium">m²</span>
            </div>
            {(property.bathrooms && property.bathrooms > 0) && (
              <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg hidden md:flex">
                <div className="w-4 h-4 text-gray-400 flex items-center justify-center font-serif text-xs italic">B</div>
                <span className="font-semibold">{property.bathrooms}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}