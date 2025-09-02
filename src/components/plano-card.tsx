'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Package, Home, Eye, Star } from 'lucide-react';
import { getUserPlan } from '@/lib/actions/supabase-actions/get-user-package-action';
import { useRouter } from 'next/navigation'; // Importe o useRouter

interface PlanoCardProps {
  userId: string;
}

export function PlanoCard({ userId }: PlanoCardProps) {
  const router = useRouter(); // Adicione o hook useRouter
  const [plan, setPlan] = useState<{
    nome: string;
    limite: number;
    restante: number;
    destaquesPermitidos: number;
  } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false); // Estado para controle do redirecionamento

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadPlan = async () => {
      setLoading(true);
      try {
        const userPlan = await getUserPlan(userId);
        setPlan(userPlan);
      } catch (error) {
        console.error('Erro ao carregar plano:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [userId]);

  // Função para lidar com o redirecionamento
  const handleManagePlan = () => {
    setIsRedirecting(true);
    router.push('/planos'); // Use o router do Next.js para navegação
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-gray-800 flex items-center text-base sm:text-lg">
          <Package className="w-5 h-5 mr-2 text-purple-700" />
          Plano Atual
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center text-sm text-gray-400">Carregando plano...</div>
        ) : plan ? (
          <>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-600 text-xs sm:text-base">Plano</span>
              </div>
              <span className="text-gray-800 font-semibold text-xs sm:text-base">{plan.nome}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Home className="w-4 h-4 text-green-500" />
                <span className="text-gray-600 text-xs sm:text-base">Listagens</span>
              </div>
              <span className="text-gray-800 font-semibold text-xs sm:text-base">{plan.limite}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-blue-500" />
                <span className="text-gray-600 text-xs sm:text-base">Restante</span>
              </div>
              <span className="text-gray-800 font-semibold text-xs sm:text-base">{plan.restante}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-purple-500" />
                <span className="text-gray-600 text-xs sm:text-base">Destaques</span>
              </div>
              <span className="text-gray-800 font-semibold text-xs sm:text-base">
                {plan.destaquesPermitidos ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <button
              className={`w-full mt-4 flex items-center justify-center ${
                plan.destaquesPermitidos 
                  ? 'bg-orange-500 hover:bg-orange-600' 
                  : 'bg-purple-500 hover:bg-purple-600'
              } text-white py-2 rounded-lg text-sm sm:text-base transition-colors`}
              onClick={handleManagePlan}
              disabled={isRedirecting || loading}
            >
              <Star className="w-4 h-4 mr-2" />
              {isRedirecting ? 'Redirecionando...' : 
               plan.destaquesPermitidos ? 'Gerenciar Plano' : 'Atualizar Plano'}
            </button>
          </>
        ) : (
          <div className="text-center text-sm text-gray-400">
            Nenhum plano encontrado ou erro ao carregar
          </div>
        )}
      </CardContent>
    </Card>
  );
}