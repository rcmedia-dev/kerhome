'use client';

import { MapPin, BedDouble, Ruler, Tag, Pencil, Trash, Heart } from 'lucide-react';
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

export function PropertyCard({ property }: { property: TPropertyResponseSchema }) {
  const { user } = useAuth();
  const router = useRouter();
  const isOwner = user?.id === property.owner_id;
  const [favorito, setFavorito] = useState(false);
  const [loadingFavorito, setLoadingFavorito] = useState(true);

  // Verificar status de favorito ao carregar o componente
  useEffect(() => {
    async function checkFavoriteStatus() {
      if (!user) {
        setLoadingFavorito(false);
        return;
      }
      
      try {
        const favoritos = await getImoveisFavoritos(user.id);
        const isFavorited = favoritos.some(fav => fav.id === property.id);
        setFavorito(isFavorited);
      } catch (error) {
        console.error("Erro ao verificar favoritos:", error);
      } finally {
        setLoadingFavorito(false);
      }
    }

    checkFavoriteStatus();
  }, [user, property.id]);

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja eliminar este imóvel?')) {
      try{
        await deleteProperty(property.id, user?.id)
        toast.success('Imovel Deletado com Sucesso')
      }catch(e){
        toast.error('Erro ao deletar o Imovel')
        console.log('error:', e)
      }
    }
  };

  const toggleFavorito = async () => {
    if (!user) {
      alert("Você precisa estar autenticado para guardar imóveis.");
      return;
    }
    
    // Atualização otimista
    const novoEstado = !favorito;
    setFavorito(novoEstado);
    setLoadingFavorito(true);
    
    try {
      const result = await toggleFavoritoProperty(user.id, property.id);
      if (!result.success || result.isFavorited !== novoEstado) {
        // Reverter se houver inconsistência
        setFavorito(!novoEstado);
      }
    } catch (error) {
      console.error("Erro ao alternar favorito:", error);
      setFavorito(!novoEstado); // Reverter em caso de erro
    } finally {
      setLoadingFavorito(false);
    }
  };

  return (
    <div className="w-[300px] bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 h-full flex flex-col relative group">
      {/* Badge de status */}
      {property.status === 'para comprar' && (
        <span className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow z-10">
          À venda
        </span>
      )}
      {property.status === 'para alugar' && (
        <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow z-10">
          Para alugar
        </span>
      )}

      {/* Botões de ação do dono */}
      {isOwner && (
        <div className="absolute top-3 right-3 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition">
          <Link
          href={`/dashboard/editar-imovel/${property.id}`}
            className="bg-white p-1.5 rounded-full shadow hover:bg-purple-100 transition"
            title="Editar"
          >
            <Pencil className="w-4 h-4 text-purple-700" />
          </Link>
          <button
            onClick={handleDelete}
            className="bg-white p-1.5 rounded-full shadow hover:bg-red-100 transition"
            title="Eliminar"
          >
            <Trash className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {/* Imagem */}
      <div className="relative h-56 w-full">
        <Image
          src={property.image ?? ""}
          alt={property.title}
          fill
          className="object-cover"
          priority={false}
        />

        {/* Ícone de Favorito (apenas se autenticado e não for o dono) */}
        {user && !isOwner && (
          <button
            onClick={toggleFavorito}
            className="absolute bottom-3 right-3 bg-white rounded-full p-2 shadow-md hover:scale-105 transition"
            title={favorito ? "Remover dos favoritos" : "Guardar imóvel"}
            disabled={loadingFavorito}
            aria-label={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            {loadingFavorito ? (
              <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Heart className={`w-5 h-5 ${favorito ? 'text-purple-600 fill-purple-600' : 'text-gray-400'}`} />
            )}
          </button>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-5 flex flex-col flex-1 space-y-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>{property.endereco}</span>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
            {property.title}
          </h3>

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
                maximumFractionDigits: 2
              })} Kz
              {property.status === 'para alugar' && '/mês'}
            </span>
          </div>
        </div>

        <div>
          <Link
            href={`/${property.status === 'para comprar' ? 'comprar' : 'alugar'}/${property.id}`}
            className="flex justify-center cursor-pointer w-full mt-2 bg-purple-700 hover:bg-purple-800 text-white py-2 rounded-lg font-medium transition"
            prefetch={false}
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </div>
  );
}