import { Suspense } from 'react';
import CompararPage from './compare-propert';

export default function ComperPage() {
  return (
    <Suspense fallback={<div className="p-4 text-gray-600">Carregando imóveis...</div>}>
      <CompararPage/>
    </Suspense>
  );
}
