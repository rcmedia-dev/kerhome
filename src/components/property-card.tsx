'use client';

import { MapPin, BedDouble, Ruler, Tag, Pencil, Trash, Heart, Share2, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/components/auth-context';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toggleFavoritoProperty } from '@/lib/actions/toggle-favorite';
import { TPropertyResponseSchema } from '@/lib/types/property';
import { getImoveisFavoritos } from '@/lib/actions/get-favorited-imoveis';
import { deleteProperty } from '@/lib/actions/supabase-actions/delete-propertie';
import { toast } from 'sonner';

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

const OwnerActions = ({ propertyId }: { propertyId: string }) => (
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
        if (confirm('Tem certeza que deseja eliminar este imóvel?')) {
          try {
            await deleteProperty(propertyId);
            toast.success('Imóvel deletado com sucesso');
          } catch (e) {
            toast.error('Erro ao deletar o imóvel');
            console.error('error:', e);
          }
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
  loadingFavorito,
  toggleFavorito,
  handleShare,
}: {
  favorito: boolean;
  loadingFavorito: boolean;
  toggleFavorito: () => void;
  handleShare: () => void;
}) => (
  <div className="absolute bottom-3 right-3 flex gap-2">
    <button
      onClick={toggleFavorito}
      className="bg-white rounded-full p-2 shadow-md hover:scale-105 transition"
      title={favorito ? 'Remover dos favoritos' : 'Guardar imóvel'}
      disabled={loadingFavorito}
    >
      {loadingFavorito ? (
        <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <Heart className={`w-5 h-5 ${favorito ? 'text-purple-600 fill-purple-600' : 'text-gray-400'}`} />
      )}
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
// Main Component
// =======================
export function PropertyCard({ property }: { property: TPropertyResponseSchema }) {
  const { user } = useAuth();
  const isOwner = user?.id === property.owner_id;

  const [favorito, setFavorito] = useState(false);
  const [loadingFavorito, setLoadingFavorito] = useState(true);

  // URL do imóvel (fix SSR)
  const [shareUrl, setShareUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/propriedades/${property.id}`);
    }
  }, [property.id]);

  // Checar se o imóvel é favorito
  useEffect(() => {
    if (!user) return setLoadingFavorito(false);

    (async () => {
      try {
        const favoritos = await getImoveisFavoritos(user.id);
        setFavorito(favoritos.some((fav) => fav.id === property.id));
      } catch (error) {
        console.error('Erro ao verificar favoritos:', error);
      } finally {
        setLoadingFavorito(false);
      }
    })();
  }, [user, property.id]);

  // Toggle favorito
  const toggleFavorito = async () => {
    if (!user) {
      toast.warning('Você precisa estar autenticado para guardar imóveis.');
      return;
    }

    const novoEstado = !favorito;
    setFavorito(novoEstado);
    setLoadingFavorito(true);

    try {
      const result = await toggleFavoritoProperty(user.id, property.id);
      if (!result.success || result.isFavorited !== novoEstado) {
        setFavorito(!novoEstado); // rollback
      }
    } catch (error) {
      console.error('Erro ao alternar favorito:', error);
      setFavorito(!novoEstado);
    } finally {
      setLoadingFavorito(false);
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

  // Função para destacar propriedade
  const handleDestacarPropriedade = () => {
    // TODO: Implementar lógica para destacar propriedade
    toast.info('Funcionalidade de destaque em breve!');
  };

  return (
    <div className="w-[300px] bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 h-full flex flex-col relative group">
      <StatusBadge status={property.status} />

      {isOwner && <OwnerActions propertyId={property.id} />}

      {/* Imagem */}
      <div className="relative h-56 w-full">
        <Image src={property.image ?? '/house.jpg'} alt={property.title} fill className="object-cover" priority={false} />
        {user && !isOwner && (
          <UserActions
            favorito={favorito}
            loadingFavorito={loadingFavorito}
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
              href='/dashboard/destacar'
              className="flex items-center justify-center gap-2 w-full border border-purple-700 text-purple-700 hover:bg-purple-50 py-2 rounded-lg font-medium transition"
            >
              <Star className="w-4 h-4" />
              Destacar propriedade
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}