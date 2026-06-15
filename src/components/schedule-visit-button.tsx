'use client';

import { VisitScheduler } from './visit-scheduler';
import { Calendar } from 'lucide-react';

export function ScheduleVisitButton({ property }: { property: any }) {
  const ownerData = property.owner || {};
  const imobiliaria = property.imobiliarias;

  return (
    <VisitScheduler
      property={{
        id: property.id || property.propertyid,
        title: property.title || '',
        image: property.image || null,
      }}
      ownerData={{
        id: ownerData.id || '',
        name: `${ownerData.primeiro_nome || ''} ${ownerData.ultimo_nome || ''}`.trim() || 'Corretor',
        imobiliaria_id: imobiliaria?.id || property.imobiliaria_id || undefined,
      }}
      userId={undefined}
    >
      <div className="w-full">
        <button className="w-full h-10 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95">
          <Calendar className="w-4 h-4" />
          Agendar Visita
        </button>
      </div>
    </VisitScheduler>
  );
}
