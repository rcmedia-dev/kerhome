import { AgentePageComponent } from '@/components/agent-component';
import { Suspense } from 'react';

export default function AgentePage() {
  return (
    <section className="min-h-screen bg-gray-50 text-gray-800 py-12">
      <Suspense fallback={<div className="text-center py-20">Carregando...</div>}>
        <AgentePageComponent />
      </Suspense>
    </section>
  );
}
