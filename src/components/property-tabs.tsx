import { TPropertyResponseSchema } from "@/lib/types/property";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";

// ===== COMPONENTE PROPERTY TABS =====
export function PropertyTabs({ property }: { property: TPropertyResponseSchema }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border">
      <Tabs defaultValue="visao-geral" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger
            value="visao-geral"
            className="data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-sm rounded-md py-2 transition-all"
          >
            Visão Geral
          </TabsTrigger>
          <TabsTrigger
            value="video"
            className="data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-sm rounded-md py-2 transition-all"
          >
            Vídeo
          </TabsTrigger>
          <TabsTrigger
            value="tour"
            className="data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-sm rounded-md py-2 transition-all"
          >
            Passeio Virtual
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="visao-geral" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Informações Básicas</h4>
              <ul className="space-y-2 text-gray-600">
                {property.tipo && (
                  <li className="flex justify-between py-2 border-b border-gray-100">
                    <span>Tipo</span>
                    <span className="font-medium">{property.tipo}</span>
                  </li>
                )}
                {typeof property.bedrooms !== 'undefined' && (
                  <li className="flex justify-between py-2 border-b border-gray-100">
                    <span>Quartos</span>
                    <span className="font-medium">{property.bedrooms}</span>
                  </li>
                )}
                {typeof property.bathrooms !== 'undefined' && (
                  <li className="flex justify-between py-2 border-b border-gray-100">
                    <span>Banheiros</span>
                    <span className="font-medium">{property.bathrooms}</span>
                  </li>
                )}
                {typeof property.garagens !== 'undefined' && (
                  <li className="flex justify-between py-2 border-b border-gray-100">
                    <span>Garagens</span>
                    <span className="font-medium">{property.garagens}</span>
                  </li>
                )}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Detalhes Adicionais</h4>
              <ul className="space-y-2 text-gray-600">
                {property.anoconstrucao && (
                  <li className="flex justify-between py-2 border-b border-gray-100">
                    <span>Ano de Construção</span>
                    <span className="font-medium">{property.anoconstrucao}</span>
                  </li>
                )}
                {property.propertyid && (
                  <li className="flex justify-between py-2 border-b border-gray-100">
                    <span>ID do Imóvel</span>
                    <span className="font-medium">{property.propertyid}</span>
                  </li>
                )}
                {property.status && (
                  <li className="flex justify-between py-2 border-b border-gray-100">
                    <span>Status</span>
                    <span className="font-medium capitalize px-3 py-1 rounded-lg text-white bg-gradient-to-r from-purple-700 to-orange-500 shadow-md">
                      {property.status}
                    </span>
                  </li>

                )}
                {property.price && (
                  <li className="flex justify-between py-2 border-b border-gray-100">
                    <span>Preço</span>
                    <span className="font-medium text-orange-500">
                      {property.price.toLocaleString(
                        property.unidade_preco === "dolar" ? "en-US" : "pt-AO",
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                      )}{" "}
                      {property.unidade_preco === "kwanza"
                        ? "KZ"
                        : property.unidade_preco === "dolar"
                        ? "USD"
                        : property.unidade_preco}
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </div>
          
          {property.caracteristicas && Array.isArray(property.caracteristicas) && property.caracteristicas.length > 0 && (
            <div className="pt-4">
              <h4 className="font-semibold text-gray-700 mb-3">Características</h4>
              <div className="flex flex-wrap gap-2">
                {property.caracteristicas
                  .filter((c): c is string => typeof c === 'string')
                  .map((c, i) => (
                    <span
                      key={i}
                      className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium border border-purple-100"
                    >
                      {c}
                    </span>
                  ))}
              </div>
            </div>
          )}
          
          {property.detalhesadicionais && Array.isArray(property.detalhesadicionais) && property.detalhesadicionais.length > 0 && (
            <div className="pt-4">
              <h4 className="font-semibold text-gray-700 mb-3">Mais Detalhes</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {property.detalhesadicionais
                  .filter(
                    (d): d is { titulo: string; valor: string } =>
                      typeof d === 'object' &&
                      d !== null &&
                      'titulo' in d &&
                      'valor' in d
                  )
                  .map((d, i) => (
                    <div key={i} className="bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium block text-sm text-gray-500">{d.titulo}</span>
                      <span className="text-gray-800">{d.valor}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="video">
          <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Este imóvel não tem vídeo disponível.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="tour">
          <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Este imóvel não tem passeio virtual disponível.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};