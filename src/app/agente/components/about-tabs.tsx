import { Card } from "@/components/ui/card";
import { Home, Trophy, Users, Shield } from "lucide-react";

interface AboutTabProps {
  profile: any;
  agentStats: {
    yearsExperience: number;
  };
}

export function AboutTab({ profile, agentStats }: AboutTabProps) {
  return (
    <div className="space-y-8">
      <Card className="p-8 shadow-lg border-0 rounded-2xl bg-gradient-to-br from-white via-purple-50/30 to-orange-50/30 backdrop-blur-sm">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Minha Paixão por Imóveis</h3>
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
          {profile?.sobre_mim ? (
            <p className="text-lg">{profile.sobre_mim}</p>
          ) : (
            <div className="space-y-4">
              <p>
                Com mais de {agentStats.yearsExperience} anos de experiência no mercado imobiliário, 
                tenho o prazer de ajudar famílias e investidores a encontrar o imóvel perfeito 
                que atenda às suas necessidades e supere suas expectativas.
              </p>
              <p>
                Minha abordagem é baseada em transparência, comunicação constante e um 
                profundo conhecimento do mercado. Acredito que cada negócio imobiliário 
                é único e merece atenção personalizada e dedicada.
              </p>
              <p>
                Meu compromisso é garantir que sua experiência na compra ou venda de 
                um imóvel seja tranquila, segura e bem-sucedida.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Especialidades */}
      <Card className="p-8 shadow-lg border-0 rounded-2xl bg-gradient-to-br from-white via-purple-50/30 to-orange-50/30 backdrop-blur-sm">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Áreas de Especialização</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <SpecialtyCard
            icon={Home}
            title="Imóveis Residenciais"
            description="Apartamentos, moradias e vivendas para famílias que buscam conforto e qualidade de vida."
            color="purple"
          />
          <SpecialtyCard
            icon={Trophy}
            title="Segmento de Luxo"
            description="Propriedades exclusivas com alto padrão de acabamento e localização privilegiada."
            color="orange"
          />
          <SpecialtyCard
            icon={Users}
            title="Investimentos"
            description="Assessoria especializada para investidores que buscam rentabilidade e valorização."
            color="purple"
          />
          <SpecialtyCard
            icon={Shield}
            title="Assessoria Completa"
            description="Acompanhamento em todas as etapas, desde a busca até a documentação final."
            color="orange"
          />
        </div>
      </Card>
    </div>
  );
}

function SpecialtyCard({ 
  icon: Icon, 
  title, 
  description, 
  color 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: 'purple' | 'orange';
}) {
  const colorClasses = {
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
      iconBg: 'bg-gradient-to-r from-purple-600 to-purple-700'
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200',
      iconBg: 'bg-gradient-to-r from-orange-500 to-amber-500'
    }
  };

  const classes = colorClasses[color];

  return (
    <div className={`flex items-start space-x-4 p-4 rounded-xl ${classes.bg} border`}>
      <div className={`p-3 rounded-lg ${classes.iconBg}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );
}