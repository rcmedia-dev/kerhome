import { Suspense } from 'react';
import { PropriedadesPage } from './rsults-page';

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500">A carregar resultados...</div>}>
      <PropriedadesPage />
    </Suspense>
  );
}
