'use client';

import { MapPin, Pencil, Trash, Clock, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/components/auth-context';
import { TPropertyResponseSchema } from '@/lib/types/property';
import { deleteProperty } from '@/lib/actions/supabase-actions/delete-propertie';
import { toast } from 'sonner';

export function PendingPropertyCard({ property }: { property: TPropertyResponseSchema }) {
  const { user } = useAuth();
  const isOwner = user?.id === property.owner_id;

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja eliminar este imóvel?')) {
      try {
        await deleteProperty(property.id, user?.id);
        toast.success('Imóvel deletado com sucesso');
      } catch (e) {
        toast.error('Erro ao deletar o imóvel');
        console.log('error:', e);
      }
    }
  };

  return (
    <div className="w-[320px] bg-white rounded-2xl shadow-lg overflow-hidden h-full flex flex-col relative border-1 transition-all duration-300hover:shadow-xl">
      {/* Overlay e badge de status pendente */}
      
      <span className="absolute top-4 left-4 bg-orange-500 text-white text-sm font-semibold px-3 py-2 rounded-full shadow-lg z-20 flex items-center gap-1.5">
        <Clock className="w-4 h-4" />
        Aguardando aprovação
      </span>

      {/* Botões de ação do dono */}
      {isOwner && (
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <Link
            href={`/dashboard/editar-imovel/${property.id}`}
            className="bg-white p-2 rounded-full shadow-md hover:bg-purple-50 transition-all hover:scale-110"
            title="Editar propriedade"
          >
            <Pencil className="w-4 h-4 text-purple-700" />
          </Link>
          <button
            onClick={handleDelete}
            className="bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition-all hover:scale-110"
            title="Eliminar propriedade"
          >
            <Trash className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {/* Imagem com overlay */}
      <div className="relative h-60 w-full">
        <Image
          src={property.image ?? "/placeholder-property.jpg"}
          alt={property.title}
          fill
          className="object-cover grayscale-[20%]"
          priority={false}
        />
      </div>

      {/* Conteúdo */}
      <div className="p-5 flex flex-col flex-1 space-y-4 z-20 relative">
        <div className="space-y-3 flex-1">
          {/* Localização */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="line-clamp-1">{property.endereco}</span>
          </div>

          {/* Título */}
          <h3 className="text-xl font-medium text-gray-900 line-clamp-2 leading-tight">
            {property.title}
          </h3>

          {/* Mensagem de status */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mt-3">
            <div className="flex items-center gap-2 text-orange-700 mb-1">
              <EyeOff className="w-4 h-4" />
              <span className="font-semibold">Não visível publicamente</span>
            </div>
            <p className="text-xs text-orange-600">
              Seu imóvel está em análise pela nossa equipe. Você será notificado quando for aprovado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}