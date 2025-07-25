'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Package, Home, Eye, Star } from 'lucide-react';

interface PlanoCardProps {
  userId: string;
}

export function PlanoCard({ userId }: PlanoCardProps) {
  const [plan, setPlan] = useState<{
    nome: string;
    limite: number;
    restante: number;
    destaques: boolean;
  } | null>(null);

  // Dados mockados
  const mockPlano = {
    nome: 'Premium Mensal',
    limite: 10,
    restante: 4,
    destaques: true,
  };

  useEffect(() => {
    if (!userId) return;

    // Simula carregamento
    const timer = setTimeout(() => {
      setPlan(mockPlano);
    }, 1000);

    return () => clearTimeout(timer);
  }, [userId]);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-gray-800 flex items-center text-base sm:text-lg">
          <Package className="w-5 h-5 mr-2 text-purple-700" />
          Plano Atual
        </CardTitle>
      </CardHeader>
      <CardContent>
        {plan ? (
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
              <span className="text-gray-800 font-semibold text-xs sm:text-base">{plan.destaques ? '1' : '0'}</span>
            </div>
            <button
              className="w-full mt-4 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg animate-pulse text-sm sm:text-base"
              onClick={() => window.location.href = '/planos'}
            >
              <Star className="w-4 h-4 mr-2" />
              Upgrade Plan
            </button>
          </>
        ) : (
          <div className="text-center text-sm text-gray-400">Carregando plano...</div>
        )}
      </CardContent>
    </Card>
  );
}
