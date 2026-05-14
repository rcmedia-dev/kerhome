'use client';

import Link from 'next/link';
import { Pencil, Trash, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { TPropertyResponseSchema } from '@/lib/types/property';
import { deleteProperty } from '@/lib/functions/supabase-actions/delete-propertie';
import { useUserStore } from '@/lib/store/user-store';
import { PropertyCardBase } from '@/components/ui/property-card-base';

export function RejectedPropertyCard({ property, onDelete }: { property: TPropertyResponseSchema; onDelete?: () => void }) {
  const { user } = useUserStore();
  const isOwner = user?.id === property.owner_id;

  const handleDelete = async () => {
    try {
      if (onDelete) onDelete(); // Optimistic update
      await deleteProperty(property.id, user?.id);
      toast.success('Imóvel deletado com sucesso');
    } catch (e) {
      console.log('error:', e);
    }
  };

  const topBadge = (
    <span className="bg-red-500 text-white text-sm font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
      <XCircle className="w-4 h-4" />
      Rejeitado
    </span>
  );

  const topRightActions = isOwner ? (
    <>
      <Link
        href={`/dashboard/editar-imovel/${property.id}`}
        className="bg-white p-2.5 rounded-full shadow-md hover:bg-purple-50 transition-all hover:scale-110"
        title="Editar propriedade"
      >
        <Pencil className="w-4 h-4 text-purple-700" />
      </Link>
      <button
        onClick={(e) => { e.preventDefault(); handleDelete(); }}
        className="bg-white p-2.5 rounded-full shadow-md hover:bg-red-50 transition-all hover:scale-110"
        title="Eliminar propriedade"
      >
        <Trash className="w-4 h-4 text-red-600" />
      </button>
    </>
  ) : undefined;

  const footerAction = (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-2">
      <div className="flex items-center gap-2 text-red-700 mb-1">
        <XCircle className="w-4 h-4" />
        <span className="font-semibold text-sm">Imóvel rejeitado</span>
      </div>
      <p className="text-xs text-red-600">
        Infelizmente, seu imóvel não foi aprovado pela nossa equipe. Você pode editar as informações e enviar novamente para análise.
      </p>
    </div>
  );

  return (
    <PropertyCardBase
      property={property}
      topBadge={topBadge}
      topRightActions={topRightActions}
      footerAction={footerAction}
      isClickable={false}
    />
  );
}
