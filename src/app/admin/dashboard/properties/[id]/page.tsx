import { getPropertyById } from '../../actions/get-properties-by-id';
import PropertyDetailClient from './client-component';


interface PropertyDetailPageProps {
  params: {
    id: string; // esse `id` vem da URL
  }
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = params; // params já vem pronto
  const property = await getPropertyById(id);

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Imóvel não encontrado
        </h1>
      </div>
    );
  }

  return <PropertyDetailClient property={property} />;
}
