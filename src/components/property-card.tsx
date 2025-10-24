'use client';

import { MapPin, BedDouble, Ruler, Tag, Pencil, Trash, Heart, Share2, Star, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { toggleFavoritoProperty } from '@/lib/actions/toggle-favorite';
import { TPropertyResponseSchema } from '@/lib/types/property';
import { getImoveisFavoritos } from '@/lib/actions/get-favorited-imoveis';
import { deleteProperty } from '@/lib/actions/supabase-actions/delete-propertie';
import { toast } from 'sonner';
import { useUserStore } from '@/lib/store/user-store';
import { createClient } from '@/lib/supabase/client';

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

const BoostedBadge = () => (
  <div className="absolute top-3 left-3 z-10">
    <div className="bg-gradient-to-r from-orange-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
      <Zap className="w-3 h-3" />
      Impulsionado
    </div>
  </div>
);

const OwnerActions = ({ propertyId, userId }: { propertyId: string; userId: string }) => (
  <div className="absolute top-3 right-3 z-20 flex gap-2">
    <Link
      href={`/dashboard/editar-imovel/${propertyId}`}
      className="bg-white p-1.5 rounded-full shadow hover:bg-purple-100 transition"
      title="Editar"
    >
      <Pencil className="w-4 h-4 text-purple-700" />
    </Link>
    <button
      onClick={async () => {
          try {
            await deleteProperty(propertyId, userId);
            toast.success("Propriedade Deletada Com Sucesso");
          } catch (e) {
            console.error('error:', e);
          }
      }}
      className="bg-white p-1.5 rounded-full shadow hover:bg-red-100 transition"
      title="Eliminar"
    >
      <Trash className="w-4 h-4 text-red-600" />
    </button>
  </div>
);

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

// Função para verificar se o imóvel está impulsionado
const checkIfPropertyIsBoosted = async (propertyId: string): Promise<boolean> => {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('properties_to_boost')
      .select('id')
      .eq('property_id', propertyId)
      .maybeSingle();

    if (error) {
      console.error('Erro ao verificar impulsionamento:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Erro ao verificar impulsionamento:', error);
    return false;
  }
};

// =======================
// Main Component
// =======================
export function PropertyCard({ property }: { property: TPropertyResponseSchema }) {
  const { user } = useUserStore();
  const isOwner = user?.id === property.owner_id;

  const [favorito, setFavorito] = useState<boolean>(false);
  const [isBoosted, setIsBoosted] = useState(false);
  const [loadingBoost, setLoadingBoost] = useState(true);

  // URL do imóvel (fix SSR)
  const [shareUrl, setShareUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/propriedades/${property.id}`);
    }
  }, [property.id]);

  // Checar se o imóvel é favorito
  useEffect(() => {
    if (!user) {
      return;
    }

    (async () => {
      try {
        const favoritos = await getImoveisFavoritos(user.id);
        setFavorito(favoritos.some((fav) => fav.id === property.id));
      } catch (error) {
        console.error('Erro ao verificar favoritos:', error);
      }
    })();
  }, [user, property.id]);

  // Checar se o imóvel está impulsionado
  useEffect(() => {
    (async () => {
      try {
        const boosted = await checkIfPropertyIsBoosted(property.id);
        setIsBoosted(boosted);
      } catch (error) {
        console.error('Erro ao verificar impulsionamento:', error);
      } finally {
        setLoadingBoost(false);
      }
    })();
  }, [property.id]);

  // Toggle favorito com optimistic updates (sem loading visual)
  const toggleFavorito = async () => {
    if (!user) {
      toast.warning('Você precisa estar autenticado para guardar imóveis.');
      return;
    }

    // Optimistic update - atualiza UI imediatamente SEM loading
    const previousState = favorito;
    const novoEstado = !favorito;
    
    setFavorito(novoEstado);

    try {
      const result = await toggleFavoritoProperty(user.id, property.id);
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao favoritar imóvel');
      }

      // Verifica se o resultado do backend corresponde ao estado otimista
      if (result.isFavorited !== novoEstado) {
        console.warn('Estado do favorito não corresponde ao esperado. Fazendo rollback...');
        setFavorito(result.isFavorited);
      }

      // Feedback sutil para o usuário (opcional)
      if (result.isFavorited && result.action === 'added') {
        toast.success('Imóvel adicionado aos favoritos! ❤️');
      } else if (!result.isFavorited && result.action === 'removed') {
        toast.info('Imóvel removido dos favoritos');
      }

    } catch (error) {
      console.error('Erro ao alternar favorito:', error);
      
      // Rollback em caso de erro - usuário nem percebe que houve tentativa
      setFavorito(previousState);
      
      // Mensagem de erro apenas se for relevante
      if (error instanceof Error) {
        if (error.message.includes('já é favorito')) {
          // Não mostra toast pois o rollback já corrigiu visualmente
        } else if (error.message.includes('não encontrado')) {
          toast.error('Imóvel não encontrado');
        } else {
          toast.error('Erro ao atualizar favoritos');
        }
      }
    }
  };

  // Share
  const handleShare = async () => {
    if (!shareUrl) return;

    const shareData = {
      title: property.title,
      text: `Confira este imóvel em ${property.endereco}`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copiado para a área de transferência!');
      } catch {
        toast.error('Não foi possível copiar o link.');
      }
    }
  };

  return (
    <div className={`w-[300px] bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 h-full flex flex-col relative group ${
      isBoosted ? 'ring-2 ring-orange-500 ring-opacity-50' : ''
    }`}>
      {/* Badge de status e impulsionamento */}
      {isBoosted ? (
        <BoostedBadge />
      ) : (
        <StatusBadge status={property.status} />
      )}

      {isOwner && <OwnerActions propertyId={property.id} userId={user.id}/>}

      {/* Imagem */}
      <div className="relative h-56 w-full">
        <Image 
          src={property.image ?? '/house.jpg'} 
          alt={property.title} 
          fill 
          className="object-cover" 
          priority={false} 
        />
        
        {/* Overlay sutil para imóveis impulsionados */}
        {isBoosted && (
          <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent pointer-events-none" />
        )}
        
        {user && !isOwner && (
          <UserActions
            favorito={favorito}
            toggleFavorito={toggleFavorito}
            handleShare={handleShare}
          />
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-5 flex flex-col flex-1 space-y-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>{property.endereco}</span>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{property.title}</h3>

          {/* Indicador de impulsionamento para não-donos */}
          {!isOwner && isBoosted && (
            <div className="flex items-center gap-1 text-xs text-orange-600 font-medium">
              <Zap className="w-3 h-3" />
              <span>Imóvel Impulsionado</span>
            </div>
          )}

          <div className="flex justify-between text-gray-700 text-sm">
            <div className="flex items-center gap-1">
              <BedDouble className="w-4 h-4" /> {property.bedrooms} Quartos
            </div>
            <div className="flex items-center gap-1">
              <Ruler className="w-4 h-4" /> {property.size}m²
            </div>
          </div>

          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{property.tipo || property.status}</span>
            {property.bathrooms !== undefined && (
              <span>
                {property.bathrooms ?? 0} Banheiro{(property.bathrooms ?? 0) > 1 ? 's' : ''}
              </span>
            )}
            {property.garagens != null && property.garagens > 0 && (
              <span>{property.garagens} Garagem{property.garagens > 1 ? 's' : ''}</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-orange-500 font-bold mt-2">
            <Tag className="w-5 h-5" />
            <span>
              {property.price?.toLocaleString('pt-AO', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              Kz
              {property.status === 'arrendar' && '/mês'}
            </span>
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
          
          {isOwner && (
            <Link
              href={isBoosted ? '#' : `/dashboard/destacar/${property.id}`}
              onClick={(e) => {
                if (isBoosted) e.preventDefault(); // Impede a navegação se estiver desabilitado
              }}
              className={`flex items-center justify-center gap-2 w-full border py-2 rounded-lg font-medium transition ${
                isBoosted
                  ? 'border-green-600 bg-green-50 text-green-700 opacity-60 cursor-not-allowed'
                  : 'border-purple-700 text-purple-700 hover:bg-purple-50'
              }`}
            >
              <Star className={`w-4 h-4 ${isBoosted ? 'text-green-600' : ''}`} />
              {isBoosted ? 'Impulsionado ✓' : 'Destacar propriedade'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}