import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Users, MapPin, Sparkles, Calendar, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface PropertiesTabProps {
  agentProperties: any;
  onOpenMessageBox: () => void;
}

export function PropertiesTab({ agentProperties, onOpenMessageBox }: PropertiesTabProps) {
  return (
    <div className="space-y-6">
      {agentProperties.data?.length === 0 ? (
        <Card className="p-12 text-center shadow-lg border-0 rounded-2xl bg-gradient-to-br from-white via-purple-50/30 to-orange-50/30 backdrop-blur-sm">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Portfólio em Actualização</h3>
          <p className="text-gray-600 mb-6">
            Estou a preparar os melhores imóveis para si. Entre em contacto para conhecer oportunidades exclusivas!
          </p>
          <Button 
            onClick={onOpenMessageBox}
            className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Saber Oportunidades
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6">
          {agentProperties.data?.map((prop: any) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      )}
    </div>
  );
}

function PropertyCard({ property }: { property: any }) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 border-0 rounded-2xl bg-gradient-to-br from-white via-purple-50/30 to-orange-50/30 backdrop-blur-sm group">
      <div className="rounded-md px-4 flex flex-col md:flex-row">
        <div className="md:w-2/5 relative h-64 md:h-auto">
          <Image 
            src={property.image || '/placeholder-property.jpg'} 
            alt={property.title} 
            fill
            className="object-cover rounded-md w-full h-full transition-transform duration-500 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className={`absolute top-4 left-4 text-xs font-bold py-2 px-3 rounded-full ${
            property.status === 'para comprar' 
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
              : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
          }`}>
            {property.status}
          </div>
          <div className="absolute bottom-4 left-4 text-white font-semibold text-lg">
            {property.preco}
          </div>
        </div>

        <CardContent className="p-6 md:w-3/5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2">{property.title}</h3>
            
            <div className="flex gap-4 text-sm text-gray-600 mb-4">
              <span className="flex items-center">
                <Home className="w-4 h-4 mr-1" />
                {property.bedrooms} quartos
              </span>
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {property.bathrooms} banheiros
              </span>
              <span className="flex items-center">
                <span className="w-4 h-4 mr-1">㎡</span>
                {property.size}m²
              </span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <MapPin className="w-4 h-4 mr-2 text-purple-600" />
              <span className="line-clamp-1">{property.endereco}</span>
            </div>
            
            <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
              {property.description || "Imóvel exclusivo com acabamentos de alta qualidade e localização privilegiada."}
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <Link href={`/propriedades/${property.id}`} className="flex-1">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white py-3 rounded-xl transition-all duration-300">
                <Sparkles className="w-4 h-4 mr-2" />
                Ver Detalhes
              </Button>
            </Link>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}