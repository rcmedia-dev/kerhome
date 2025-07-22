import { TPropertyResponseSchema } from '@/lib/types/property';
import { PropertyCard } from './property-card';

type PropertiesShowCaseProps = {
  property: TPropertyResponseSchema[];
  inline?: boolean
}

export default function PropertiesShowcase({ property, inline }: PropertiesShowCaseProps) {
  return (
    <section className="flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-10 bg-white">
      <div className="flex flex-col justify-center items-center text-center mb-10">
        <h2 className="text-2xl md:text-3xl lg:text-4xl text-gray-800 font-bold">
          Sua Próxima Casa
        </h2>
        <p className="text-gray-600 mt-2 text-sm md:text-base">
          Encontre sua próxima casa aqui na Kerhome
        </p>
      </div>

      <div className="mx-auto">
        {inline ? (
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-stretch">
            {property.map((property) => (
              <PropertyCard key={property.title} property={property} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-center">
            {property.map((property) => (
              <PropertyCard key={property.title} property={property} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
