import React from 'react';
import { getPropertyById } from '../../actions/get-properties-by-id';
import PropertyDetailClient from './client-component';

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const property = await getPropertyById(id);
  
  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Imóvel não encontrado</h1>
      </div>
    );
  }

  return <PropertyDetailClient property={property} />;
}