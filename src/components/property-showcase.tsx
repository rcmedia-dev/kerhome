import Link from "next/link";
import { TPropertyResponseSchema } from '@/lib/types/property';
import { PropertyCard } from './property-card';

type PropertiesShowCaseProps = {
  property: TPropertyResponseSchema[];
  inline?: boolean;
};

export default function PropertiesShowcase({ property, inline }: PropertiesShowCaseProps) {
  // limitar a exibição para no máximo 8 imóveis (2 linhas de 4 colunas)
  const limitedProperties = property.slice(0, 8);

  return (
    <section className="relative py-16 lg:px-10 bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative flex flex-col justify-center items-center text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-4">
          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
          Propriedades Selecionadas
        </div>
        
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
          Sua Próxima <span className="text-orange-500">Casa</span>
        </h2>
        
        <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">
          Descobre as melhores oportunidades imobiliárias com a KerCasa. 
          <span className="block text-gray-500 text-base mt-1">
            Qualidade e confiança em cada detalhe
          </span>
        </p>
      </div>

      <div className="relative flex justify-center mx-auto max-w-7xl">
        {inline ? (
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-stretch overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-100">
            {limitedProperties.map((property) => (
              <div key={property.id} className="min-w-[300px] flex-1 sm:flex-none">
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-center">
            {limitedProperties.map((property) => (
              <div key={property.id} className="w-11/12 sm:w-auto">
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botão "Ver mais propriedades" */}
      <div className="relative flex justify-center mt-12">
        <Link
          href="/propriedades"
          className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-orange-500/25"
        >
          <span className="relative z-10 flex items-center gap-2">
            Explorar Todas as Propriedades
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
          
          {/* Efeito de brilho no hover */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>
      </div>

      {/* Elemento decorativo inferior */}
      <div className="relative mt-16 flex justify-center">
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>
    </section>
  );
}