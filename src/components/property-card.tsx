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
// Subcomponentes
// =======================
const StatusBadge = ({ status }: { status: string }) => {
  const baseClass =
    "absolute top-3 left-3 text-white text-xs font-bold px-3 py-1 rounded-full shadow z-10";
  if (status === 'comprar') return <span className={`${baseClass} bg-green-600`}>À venda</span>;
  if (status === 'arrendar') return <span className={`${baseClass} bg-blue-600`}>Para alugar</span>;
  return null;
};

const BoostedBadge = ({ isExpired, isSuspended }: { isExpired?: boolean; isSuspended?: boolean }) => (
  <div className="absolute top-3 left-3 z-10">
    <div className={`text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 ${
      isSuspended 
        ? 'bg-red-600' 
        : isExpired 
        ? 'bg-gray-500' 
        : 'bg-gradient-to-r from-orange-500 to-purple-600'
    }`}>
      {isSuspended ? <ShieldAlert className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
      {isSuspended ? 'Suspenso' : isExpired ? 'Expirado' : 'Impulsionado'}
    </div>
  </div>
);

const ExpiredBoostBadge = () => (
  <div className="absolute top-12 left-3 z-10">
    <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
      <AlertCircle className="w-3 h-3" />
      Precisa renovar
    </div>
  </div>
);

const SuspendedBoostBadge = () => (
  <div className="absolute top-12 left-3 z-10">
    <div className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
      <ShieldAlert className="w-3 h-3" />
      Impulsionamento suspenso
    </div>
  </div>
);

const OwnerActions = ({ propertyId, userId }: { propertyId: string; userId: string }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = useCallback(async () => {
    if (isDeleting) return;
    const confirmed = window.confirm('Tem certeza que deseja eliminar este imóvel? Esta ação é irreversível.');
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteProperty(propertyId, userId);
      toast.success('Propriedade eliminada com sucesso');
      await queryClient.invalidateQueries({ queryKey: ['user-properties'] });
      await queryClient.invalidateQueries({ queryKey: ['most-viewed'] });
    } catch (e) {
      console.error('Erro ao eliminar propriedade:', e);
      toast.error('Erro ao eliminar imóvel');
    } finally {
      setIsDeleting(false);
    }
  }, [isDeleting, propertyId, userId, queryClient]);

  return (
    <div className="absolute top-3 right-3 z-20 flex gap-2">
      <Link
        href={`/dashboard/editar-imovel/${propertyId}`}
        className="bg-white p-1.5 rounded-full shadow hover:bg-purple-100 transition"
        title="Editar"
      >
        <Pencil className="w-4 h-4 text-purple-700" />
      </Link>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className={`bg-white p-1.5 rounded-full shadow hover:bg-red-100 transition ${isDeleting ? 'opacity-60 pointer-events-none' : ''}`}
        title="Eliminar"
        aria-busy={isDeleting}
      >
        <Trash className="w-4 h-4 text-red-600" />
      </button>
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
  <div className="absolute bottom-3 right-3 flex gap-2">
    <button
      onClick={toggleFavorito}
      className="bg-white rounded-full p-2 shadow-md hover:scale-105 transition"
      title={favorito ? 'Remover dos favoritos' : 'Guardar imóvel'}
    >
      <Heart className={`w-5 h-5 transition-colors ${
        favorito ? 'text-purple-600 fill-purple-600' : 'text-gray-400 hover:text-purple-500'
      }`} />
    </button>

    <button
      onClick={handleShare}
      className="bg-white rounded-full p-2 shadow-md hover:scale-105 transition"
      title="Compartilhar imóvel"
    >
      <Share2 className="w-5 h-5 text-gray-500" />
    </button>
  </div>
);

// =======================
// Interface do Componente Principal
// =======================
interface PropertyCardProps {
  property: TPropertyResponseSchema;
  canBoost?: boolean;
}

// =======================
// Componente Principal
// =======================
export function PropertyCard({ property, canBoost = true }: PropertyCardProps) {
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
  const [loadingBoost, setLoadingBoost] = useState(true);
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
          // Verificar se o boost está expirado
          let isExpired = false;
          let isSuspended = false;
          
          // Verificar se está suspenso por motivo suspicious
          if (data.rejected_reason === 'suspicious') {
            isSuspended = true;
          }
          
          if (data.status === 'active' && !isSuspended) {
            // Buscar informações do plano para calcular expiração
            const { data: planData } = await supabase
              .from('pacotes_destaque')
              .select('dias')
              .eq('id', data.plan_id)
              .single();

            if (planData?.dias) {
              const startedAt = new Date(data.created_at);
              const expiresAt = new Date(startedAt);
              expiresAt.setDate(startedAt.getDate() + planData.dias);
              isExpired = new Date() > expiresAt;
            }
          } else if (data.status === 'expired') {
            isExpired = true;
          }

          if (!cancelled && mountedRef.current) {
            setBoostInfo({
              isBoosted: data.status === 'active' && !isExpired && !isSuspended,
              isExpired: isExpired || data.status === 'expired',
              isSuspended: isSuspended,
              status: data.status,
              rejected_reason: data.rejected_reason
            });
          }
        } else {
          if (!cancelled && mountedRef.current) {
            setBoostInfo({
              isBoosted: false,
              isExpired: false,
              isSuspended: false,
              status: null
            });
          }
        }
      } catch (e) { 
        console.error('Erro ao verificar boost:', e); 
        if (!cancelled && mountedRef.current) {
          setBoostInfo({
            isBoosted: false,
            isExpired: false,
            isSuspended: false,
            status: null
          });
        }
      } finally { 
        if (!cancelled && mountedRef.current) setLoadingBoost(false); 
      }
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
      if (result.isFavorited && result.action === 'added') toast.success('Imóvel adicionado aos favoritos! ❤️');
      else if (!result.isFavorited && result.action === 'removed') toast.info('Imóvel removido dos favoritos');
    } catch (e) {
      console.error(e);
      if (mountedRef.current) setFavorito(previousState);
      toast.error(e instanceof Error ? e.message : 'Erro ao atualizar favoritos');
    } finally { if (mountedRef.current) setIsTogglingFav(false); }
  }, [user, favorito, property.id, isTogglingFav]);

  // Compartilhar
  const handleShare = useCallback(async () => {
    if (!shareUrl) return;
    const shareData = { title: property.title, text: `Confira este imóvel em ${property.endereco}`, url: shareUrl };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { console.log('Erro ao compartilhar'); }
    } else {
      try { await navigator.clipboard.writeText(shareUrl); toast.success('Link copiado para a área de transferência!'); }
      catch { toast.error('Não foi possível copiar o link.'); }
    }
  }, [shareUrl, property.title, property.endereco]);

  const getBoostButtonText = () => {
    if (!canBoost) return 'Impulsionamento Bloqueado';
    if (boostInfo.isSuspended) return 'Impulsionamento suspenso';
    if (boostInfo.isBoosted) return 'Impulsionado ✓';
    if (boostInfo.isExpired) return 'Precisa renovar';
    if (boostInfo.status === 'pending') return 'Aguardando aprovação';
    if (boostInfo.status === 'rejected') return 'Solicitação rejeitada';
    return 'Destacar propriedade';
  };

  const getBoostButtonClass = () => {
    if (!canBoost) return 'border-gray-400 bg-gray-100 text-gray-500 opacity-60 cursor-not-allowed';
    if (boostInfo.isSuspended) return 'border-red-600 bg-red-50 text-red-700 opacity-60 cursor-not-allowed';
    if (boostInfo.isBoosted) return 'border-green-600 bg-green-50 text-green-700 opacity-60 cursor-not-allowed';
    if (boostInfo.isExpired) return 'border-red-600 bg-red-50 text-red-700 hover:bg-red-100';
    if (boostInfo.status === 'pending') return 'border-yellow-600 bg-yellow-50 text-yellow-700 opacity-60 cursor-not-allowed';
    if (boostInfo.status === 'rejected') return 'border-red-600 bg-red-50 text-red-700 hover:bg-red-100';
    return 'border-purple-700 text-purple-700 hover:bg-purple-50';
  };

  const getBoostButtonIcon = () => {
    if (!canBoost) return 'text-gray-500';
    if (boostInfo.isSuspended) return 'text-red-600';
    if (boostInfo.isBoosted) return 'text-green-600';
    if (boostInfo.isExpired) return 'text-red-600';
    if (boostInfo.status === 'pending') return 'text-yellow-600';
    if (boostInfo.status === 'rejected') return 'text-red-600';
    return '';
  };

  const shouldShowBoostButton = () => {
    // Não mostrar botão se estiver suspenso
    if (boostInfo.isSuspended) return false;
    // Mostrar botão apenas para o proprietário
    return isOwner;
  };

  const shouldDisableBoostButton = () => {
    return !canBoost || boostInfo.isBoosted || boostInfo.status === 'pending' || boostInfo.isSuspended;
  };

  const handleBoostClick = (e: React.MouseEvent) => {
    if (!canBoost) {
      e.preventDefault();
      toast.error('Você não pode impulsionar propriedades devido a restrições em suas propriedades suspensas.');
      return;
    }
    
    if (shouldDisableBoostButton()) {
      e.preventDefault();
    }
  };

  return (
    <div className={`w-[300px] bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 h-full flex flex-col relative group ${
      boostInfo.isSuspended ? 'ring-2 ring-red-500 ring-opacity-50' :
      boostInfo.isBoosted ? 'ring-2 ring-orange-500 ring-opacity-50' : 
      boostInfo.isExpired ? 'ring-2 ring-red-300 ring-opacity-50' : ''
    }`}>
      {/* Badges */}
      {boostInfo.isSuspended && (
        <>
          <BoostedBadge isSuspended={true} />
          <SuspendedBoostBadge />
        </>
      )}
      {boostInfo.isBoosted && <BoostedBadge />}
      {boostInfo.isExpired && (
        <>
          <BoostedBadge isExpired={true} />
          <ExpiredBoostBadge />
        </>
      )}
      {!boostInfo.isBoosted && !boostInfo.isExpired && !boostInfo.isSuspended && <StatusBadge status={property.status} />}
      
      {isOwner && <OwnerActions propertyId={property.id} userId={user.id}/>}

      <div className="relative h-56 w-full">
        <Image 
          src={property.image ?? '/house.jpg'} 
          alt={property.title} 
          fill 
          className="object-cover" 
          priority={false}
        />
        {boostInfo.isBoosted && <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent pointer-events-none" />}
        {boostInfo.isExpired && <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent pointer-events-none" />}
        {boostInfo.isSuspended && <div className="absolute inset-0 bg-gradient-to-t from-red-600/10 to-transparent pointer-events-none" />}
        {user && !isOwner && <UserActions favorito={favorito} toggleFavorito={toggleFavorito} handleShare={handleShare}/>}
      </div>

      <div className="p-5 flex flex-col flex-1 space-y-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>{property.endereco}</span>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{property.title}</h3>

          {!isOwner && boostInfo.isBoosted && (
            <div className="flex items-center gap-1 text-xs text-orange-600 font-medium">
              <Zap className="w-3 h-3" />
              <span>Imóvel Impulsionado</span>
            </div>
          )}

          {!isOwner && boostInfo.isExpired && (
            <div className="flex items-center gap-1 text-xs text-red-600 font-medium">
              <AlertCircle className="w-3 h-3" />
              <span>Destaque Expirado</span>
            </div>
          )}

          {!isOwner && boostInfo.isSuspended && (
            <div className="flex items-center gap-1 text-xs text-red-600 font-medium">
              <ShieldAlert className="w-3 h-3" />
              <span>Impulsionamento Suspenso</span>
            </div>
          )}

          <div className="flex justify-between text-gray-700 text-sm">
            <div className="flex items-center gap-1"><BedDouble className="w-4 h-4"/> {property.bedrooms} Quartos</div>
            <div className="flex items-center gap-1"><Ruler className="w-4 h-4"/> {property.size}m²</div>
          </div>

          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{property.tipo || property.status}</span>
            {property.bathrooms != null && <span>{property.bathrooms} Banheiro{property.bathrooms > 1 ? 's' : ''}</span>}
            {property.garagens != null && property.garagens > 0 && <span>{property.garagens} Garagem{property.garagens > 1 ? 's' : ''}</span>}
          </div>

          <div className="flex items-center gap-2 text-orange-500 font-bold mt-2">
            <Tag className="w-5 h-5" />
            <span>{property.price?.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz{property.status === 'arrendar' ? '/mês' : ''}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Link 
            href={`/propriedades/${property.id}`} 
            className="flex justify-center cursor-pointer w-full bg-purple-700 hover:bg-purple-800 text-white py-2 rounded-lg font-medium transition" 
            prefetch={false}
          >
            Ver detalhes
          </Link>

          {shouldShowBoostButton() && (
            <Link
              href={shouldDisableBoostButton() ? '#' : `/dashboard/destacar/${property.id}`}
              onClick={handleBoostClick}
              className={`flex items-center justify-center gap-2 w-full border py-2 rounded-lg font-medium transition ${getBoostButtonClass()}`}
            >
              <Star className={`w-4 h-4 ${getBoostButtonIcon()}`} />
              {getBoostButtonText()}
            </Link>
          )}

          {isOwner && boostInfo.isSuspended && (
            <div className="text-xs text-red-600 text-center p-2 bg-red-50 rounded-lg border border-red-200">
              <ShieldAlert className="w-4 h-4 mx-auto mb-1" />
              Seu impulsionamento foi suspenso por suspeita de atividade. Contacte o suporte.
            </div>
          )}

          {isOwner && !canBoost && !boostInfo.isSuspended && (
            <div className="text-xs text-gray-600 text-center p-2 bg-gray-50 rounded-lg border border-gray-200">
              <ShieldAlert className="w-4 h-4 mx-auto mb-1" />
              Impulsionamento bloqueado devido a propriedades suspensas na sua conta.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}