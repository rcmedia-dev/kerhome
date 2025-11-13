'use client';

import { MapPin, Pencil, Trash, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { TPropertyResponseSchema } from '@/lib/types/property';
import { deleteProperty } from '@/lib/functions/supabase-actions/delete-propertie';
import { toast } from 'sonner';
import { useUserStore } from '@/lib/store/user-store';

export function RejectedPropertyCard({ property }: { property: TPropertyResponseSchema }) {
  const { user } = useUserStore();
  const isOwner = user?.id === property.owner_id;

  const handleDelete = async () => {
    try {
      await deleteProperty(property.id, user?.id);
      toast.success('Imóvel deletado com sucesso');
    } catch (e) {
      console.log('error:', e);
    }
  };

  return (
    <div className="w-[320px] bg-white rounded-2xl shadow-lg overflow-hidden h-full flex flex-col relative border-1 transition-all duration-300 hover:shadow-xl">
      
      {/* Badge de status rejeitado */}
      <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-semibold px-3 py-2 rounded-full shadow-lg z-20 flex items-center gap-1.5">
        <XCircle className="w-4 h-4" />
        Rejeitado
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

          {/* Mensagem de status rejeitado */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-3">
            <div className="flex items-center gap-2 text-red-700 mb-1">
              <XCircle className="w-4 h-4" />
              <span className="font-semibold">Imóvel rejeitado</span>
            </div>
            <p className="text-xs text-red-600">
              Infelizmente, seu imóvel não foi aprovado pela nossa equipe. Você pode editar as informações e enviar novamente para análise.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
