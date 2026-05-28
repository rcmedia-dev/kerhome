'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Pencil, Trash, Heart, Share2, Zap, AlertCircle, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

import { PropertyCardBase } from '@/components/ui/property-card-base';
import { toggleFavoritoProperty } from '@/lib/functions/toggle-favorite';
import { getImoveisFavoritos } from '@/lib/functions/get-favorited-imoveis';
import { useUserStore } from '@/lib/store/user-store';
import { createClient } from '@/lib/supabase/client';
import { TPropertyResponseSchema } from '@/lib/types/property';

const supabase = createClient();

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
    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-badge text-white text-xs font-bold shadow-card ${bgColor} backdrop-blur-md border border-white/20`}>
      {icon}
      <span>{text}</span>
    </div>
  );
};

interface PropertyCardProps {
  property: TPropertyResponseSchema;
  canBoost?: boolean;
  onDelete?: () => void;
  isClickable?: boolean;
}

export function PropertyCard({ property, canBoost = true, isClickable = true, onDelete }: PropertyCardProps) {
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
      setShareUrl(`${window.location.origin}/${property.slug ? `propriedades/${property.slug}` : `propriedades/${property.id}`}`);
    }
    return () => { mountedRef.current = false; };
  }, [property.id, property.slug]);

  useEffect(() => {
    if (!user || property.id === 'preview-id') { 
      setFavorito(false); 
      return; 
    }
    let cancelled = false;
    (async () => {
      try {
        const favoritos = await getImoveisFavoritos(user.id);
        if (!cancelled && mountedRef.current) {
          setFavorito(favoritos.some(fav => fav.id === property.id));
        }
      } catch (e) {
        console.error("Error in PropertyCard favorito useEffect:", e);
      }
    })();
    return () => { cancelled = true; };
  }, [user, property.id]);

  useEffect(() => {
    if (property.id === 'preview-id') return;
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

          if (data.status === 'active' && !isSuspended && data.plan_id) {
            const { data: planData, error: planError } = await supabase
              .from('pacotes_destaque')
              .select('dias')
              .eq('id', data.plan_id)
              .maybeSingle();
            
            if (planError) {
              console.error("Error fetching boost plan details:", planError);
            } else if (planData?.dias) {
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
      } catch (e) {
        console.error("Error in PropertyCard boosted status useEffect:", e);
      }
    })();
    return () => { cancelled = true; };
  }, [property.id]);

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

  const handleShare = useCallback(async () => {
    if (!shareUrl) return;
    if (navigator.share) {
      try { await navigator.share({ title: property.title, url: shareUrl }); } catch { }
    } else {
      await navigator.clipboard.writeText(shareUrl); toast.success('Link copiado!');
    }
  }, [shareUrl, property.title]);

  const topBadge = (
    (boostInfo.isBoosted || boostInfo.isSuspended || boostInfo.isExpired) ? (
      <BoostedBadge isExpired={boostInfo.isExpired} isSuspended={boostInfo.isSuspended} />
    ) : (
      <div className={`px-2 sm:px-4 py-1 sm:py-1.5 rounded-badge text-white text-[11px] sm:text-sm font-semibold shadow-card ${property.status === 'comprar' ? 'bg-[#10B981]' : 'bg-blue-500'}`}>
        {property.status === 'comprar' ? 'À venda' : 'Arrendar'}
      </div>
    )
  );

  const bottomRightActions = (
    <>
      {!isOwner && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); toggleFavorito(); }}
            className="bg-white w-10 h-10 rounded-badge shadow-card flex items-center justify-center hover:bg-gray-50 transition active:scale-95"
          >
            <Heart className={`w-5 h-5 ${favorito ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); handleShare(); }}
            className="bg-white w-10 h-10 rounded-badge shadow-card flex items-center justify-center hover:bg-gray-50 transition active:scale-95"
          >
            <Share2 className="w-5 h-5 text-gray-400" />
          </button>
        </>
      )}
      {isOwner && property.id !== 'preview-id' && (
        <div className="flex gap-2">
          <Link
            href={`/propriedades/${property.id}/editar`}
            className="bg-white w-10 h-10 rounded-badge shadow-card flex items-center justify-center hover:bg-gray-50 transition active:scale-95"
          >
            <Pencil className="w-5 h-5 text-gray-400 hover:text-blue-500" />
          </Link>
          {onDelete && (
            <button
              onClick={(e) => { e.preventDefault(); onDelete(); }}
              className="bg-white w-10 h-10 rounded-badge shadow-card flex items-center justify-center hover:bg-gray-50 transition active:scale-95"
            >
              <Trash className="w-5 h-5 text-gray-400 hover:text-red-500" />
            </button>
          )}
        </div>
      )}
    </>
  );

  return (
    <PropertyCardBase
      property={property}
      topBadge={topBadge}
      bottomRightActions={bottomRightActions}
      isClickable={isClickable}
    />
  );
}
