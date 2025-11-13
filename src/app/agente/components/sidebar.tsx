import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Instagram, Linkedin, MessageCircle } from "lucide-react";

interface SidebarProps {
  profile: any;
  agentStats: {
    propertiesSold: number;
    yearsExperience: number;
    clientSatisfaction: number;
    averageDaysOnMarket: number;
  };
  onOpenMessageBox: () => void;
}

export function Sidebar({ profile, agentStats, onOpenMessageBox }: SidebarProps) {
  return (
    <div className="pt-5 lg:w-1/3 space-y-6">
      {/* Card de Contato */}
      <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-white via-purple-50/30 to-orange-50/30 backdrop-blur-sm rounded-2xl">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Disponível Para Novos Negócios</h3>
          <p className="text-sm text-gray-600">
            Pronto para encontrar o imóvel dos seus sonhos?
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={onOpenMessageBox}
              className="w-full bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Vamos Conversar?
            </Button>
          </div>
        </div>

        {profile && (
          <div className="mt-6 pt-6 border-t border-purple-200">
            <h3 className="font-semibold text-gray-900 mb-4 text-center">Contacto Directo</h3>
            
            <div className="space-y-3">
              <div className="flex items-center p-3 rounded-lg bg-white hover:bg-purple-50 transition-colors border border-purple-100">
                <Phone className="w-4 h-4 mr-3 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">
                  {profile[0].telefone || "A definir"}
                </span>
              </div>
              
              <div className="flex items-center p-3 rounded-lg bg-white hover:bg-purple-50 transition-colors border border-purple-100">
                <Mail className="w-4 h-4 mr-3 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">
                  {profile[0].email || "A definir"}
                </span>
              </div>
            </div>
            
            <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-purple-200">
              {profile.instagram && (
                <a href={profile[0].instagram} target="_blank" className="p-2 bg-white hover:bg-pink-100 text-gray-600 hover:text-pink-600 rounded-lg transition-all duration-300 border border-purple-100">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {profile.linkedin && (
                <a href={profile[0].linkedin} target="_blank" className="p-2 bg-white hover:bg-blue-100 text-gray-600 hover:text-blue-600 rounded-lg transition-all duration-300 border border-purple-100">
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Card de Estatísticas */}
      <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-purple-600 to-orange-600 text-white rounded-2xl">
        <h3 className="font-semibold text-lg mb-6 text-center">Meu Desempenho</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-white/15 rounded-xl backdrop-blur-sm">
            <div className="text-2xl font-bold text-white">{agentStats.propertiesSold}+</div>
            <div className="text-sm text-purple-100">Imóveis Vendidos</div>
          </div>
          <div className="text-center p-4 bg-white/15 rounded-xl backdrop-blur-sm">
            <div className="text-2xl font-bold text-white">{agentStats.yearsExperience}+</div>
            <div className="text-sm text-purple-100">Anos de Experiência</div>
          </div>
          <div className="text-center p-4 bg-white/15 rounded-xl backdrop-blur-sm">
            <div className="text-2xl font-bold text-white">{agentStats.clientSatisfaction}%</div>
            <div className="text-sm text-purple-100">Satisfação</div>
          </div>
          <div className="text-center p-4 bg-white/15 rounded-xl backdrop-blur-sm">
            <div className="text-2xl font-bold text-white">{agentStats.averageDaysOnMarket}</div>
            <div className="text-sm text-purple-100">Dias no Mercado</div>
          </div>
        </div>
      </Card>
    </div>
  );
}