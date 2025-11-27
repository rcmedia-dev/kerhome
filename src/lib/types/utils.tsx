
import { PacoteDestaque } from "@/lib/types/defaults";
import { Star, Target, TrendingUp, Zap } from "lucide-react";


export const getDefaultPacotes = (): PacoteDestaque[] => [
  {
    id: 'basico', nome: 'Básico', dias: 7, preco: 10000, corDestaque: 'purple',
    icone: <Star className="w-5 h-5 text-white" />,
    beneficios: ['Destaque na lista principal', '7 dias de visibilidade', 'Badge especial'],
  },
  {
    id: 'popular', nome: 'Popular', dias: 15, preco: 18000, popular: true, corDestaque: 'purple',
    icone: <TrendingUp className="w-5 h-5 text-white" />,
    beneficios: ['Posição prioritária', '15 dias de visibilidade', '+50% visualizações'],
  },
  {
    id: 'premium', nome: 'Premium', dias: 30, preco: 30000, corDestaque: 'orange',
    icone: <Target className="w-5 h-5 text-white" />,
    beneficios: ['Destaque na página inicial', '30 dias visibilidade', 'Suporte prioritário'],
  },
  {
    id: 'turbo', nome: 'Turbo', dias: 60, preco: 50000, corDestaque: 'orange',
    icone: <Zap className="w-5 h-5 text-white" />,
    beneficios: ['Destaque em todas categorias', '60 dias visibilidade', 'Consultoria personalizada'],
  },
];

export const mapPacotesFromSupabase = (data: any[]): PacoteDestaque[] => {
  return data.map(pacote => {
    const corDestaque = pacote.id === 'premium' || pacote.id === 'turbo' ? 'orange' : 'purple';
    
    const getIcone = (iconeName: string) => {
      switch (iconeName) {
        case 'Star': return <Star className="w-5 h-5 text-white" />;
        case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-white" />;
        case 'Target': return <Target className="w-5 h-5 text-white" />;
        case 'Zap': return <Zap className="w-5 h-5 text-white" />;
        default: return <Star className="w-5 h-5 text-white" />;
      }
    };

    return {
      id: pacote.id,
      nome: pacote.nome,
      dias: pacote.dias,
      preco: pacote.preco,
      popular: pacote.popular || false,
      corDestaque,
      icone: getIcone(pacote.icone || 'Star'),
      beneficios: Array.isArray(pacote.beneficios) ? pacote.beneficios : []
    };
  });
};