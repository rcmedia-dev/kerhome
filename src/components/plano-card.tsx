'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Package, Home, Eye, Star, Crown, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Create a local type that matches your actual data structure
interface LocalUserPlan {
  nome: string;
  limite: number;
  restante: number;
  destaques: boolean;
  destaquesPermitidos: number;
  pacote_agente_id: string;
}

interface PlanoCardProps {
  plan?: LocalUserPlan;
  userProperties: number;
}

// Componente de feature item com animação
const PlanFeature = ({ 
  icon: Icon, 
  label, 
  value, 
  color = "purple",
  index 
}: { 
  icon: any; 
  label: string; 
  value: string | number; 
  color?: "purple" | "green" | "blue" | "orange" | "yellow" | "gray";
  index: number;
}) => {
  const colorClasses = {
    purple: "bg-purple-100 text-purple-700",
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    orange: "bg-orange-100 text-orange-700",
    yellow: "bg-amber-100 text-amber-700",
    gray: "bg-gray-100 text-gray-700"
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ 
        scale: 1.02,
        x: 4
      }}
      className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100 hover:shadow-md transition-all duration-300 group"
    >
      <div className="flex items-center space-x-3">
        <div className={cn(
          "p-2 rounded-lg transition-colors duration-300 group-hover:scale-110",
          colorClasses[color]
        )}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-gray-700 text-sm font-medium">{label}</span>
      </div>
      <motion.span 
        className={cn(
          "font-semibold text-sm",
          color === "purple" && "text-purple-700",
          color === "orange" && "text-orange-700",
          color === "blue" && "text-blue-700",
          color === "green" && "text-green-700",
          color === "yellow" && "text-amber-700"
        )}
        whileHover={{ scale: 1.1 }}
      >
        {value}
      </motion.span>
    </motion.div>
  );
};

// Badge do plano com gradiente usando as cores especificadas
const PlanBadge = ({ planName }: { planName: string }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-700 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg"
  >
    <Crown className="w-4 h-4" />
    <span className="text-sm font-semibold">{planName}</span>
  </motion.div>
);

// Barra de progresso animada com as cores especificadas
const ProgressBar = ({ used, total }: { used: number; total: number }) => {
  const percentage = (used / total) * 100;
  const isLow = percentage > 80;
  const isMedium = percentage > 50;

  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>Utilizado: {used}/{total}</span>
        <span>{percentage.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full transition-all duration-300",
            isLow 
              ? "bg-gradient-to-r from-orange-500 to-red-500" 
              : isMedium
              ? "bg-gradient-to-r from-orange-400 to-orange-500"
              : "bg-gradient-to-r from-purple-500 to-purple-700"
          )}
        />
      </div>
    </div>
  );
};

// Botão de ação com animação usando as cores especificadas
const ActionButton = ({ 
  onClick, 
  isLoading, 
  hasHighlights,
  isLowQuota 
}: { 
  onClick: () => void;
  isLoading: boolean;
  hasHighlights: boolean;
  isLowQuota: boolean;
}) => {
  const getButtonConfig = () => {
    if (isLowQuota) {
      return {
        gradient: "from-orange-500 to-orange-600",
        icon: TrendingUp,
        text: "Atualizar Plano"
      };
    }
    
    if (hasHighlights) {
      return {
        gradient: "from-purple-700 to-purple-800",
        icon: Sparkles,
        text: "Gerenciar Plano"
      };
    }

    return {
      gradient: "from-purple-600 to-purple-700",
      icon: Zap,
      text: "Atualizar Plano"
    };
  };

  const config = getButtonConfig();
  const IconComponent = config.icon;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "w-full mt-6 flex items-center justify-center space-x-2 text-white py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 relative overflow-hidden",
        `bg-gradient-to-r ${config.gradient} hover:shadow-xl`
      )}
    >
      {/* Efeito de brilho no hover */}
      <motion.div
        className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300"
        whileHover={{ opacity: 1 }}
      />
      
      <motion.div
        animate={isLoading ? { rotate: 360 } : {}}
        transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}
      >
        <IconComponent className="w-4 h-4" />
      </motion.div>
      <span className="relative z-10">
        {isLoading ? 'Redirecionando...' : config.text}
      </span>
    </motion.button>
  );
};

export function PlanoCard({ plan, userProperties }: PlanoCardProps) {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleManagePlan = () => {
    setIsRedirecting(true);
    router.push('/planos');
  };

  const isLowQuota = plan ? plan.restante / plan.limite < 0.2 : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-purple-50/30 to-orange-50/30 backdrop-blur-sm overflow-hidden">
        {/* Efeito de gradiente no topo usando as cores especificadas */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-700 via-purple-500 to-orange-500" />
        
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-800 flex items-center text-lg">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <Package className="w-5 h-5 text-purple-700" />
              </div>
              Meu Plano
            </CardTitle>
            {plan && <PlanBadge planName={plan.nome} />}
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <AnimatePresence>
            {plan ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {/* Plano e informações básicas */}
                <PlanFeature
                  icon={Package}
                  label="Plano"
                  value={plan.nome}
                  color="purple"
                  index={0}
                />

                {/* Listagens com barra de progresso */}
                <div className="p-3 rounded-xl bg-white border border-gray-100">
                  <PlanFeature
                    icon={Home}
                    label="Listagens Totais"
                    value={plan.limite}
                    color="purple"
                    index={1}
                  />
                  <ProgressBar used={userProperties } total={plan.limite} />
                </div>

                {/* Listagens restantes */}
                <PlanFeature
                  icon={Eye}
                  label="Listagens Restantes"
                  value={plan.restante - userProperties}
                  color={isLowQuota ? "orange" : "purple"}
                  index={2}
                />

                {/* Destaques */}
                <PlanFeature
                  icon={Star}
                  label="Destaques"
                  value={plan.destaques ? 'Ativo' : 'Inativo'}
                  color={plan.destaques ? "orange" : "gray"}
                  index={3}
                />

                {/* Destaques permitidos */}
                {plan.destaques && (
                  <PlanFeature
                    icon={Sparkles}
                    label="Destaques Permitidos"
                    value={plan.destaquesPermitidos}
                    color="orange"
                    index={4}
                  />
                )}

                {/* Botão de ação */}
                <ActionButton
                  onClick={handleManagePlan}
                  isLoading={isRedirecting}
                  hasHighlights={plan.destaques}
                  isLowQuota={isLowQuota}
                />

                {/* Aviso de quota baixa */}
                {isLowQuota && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-3"
                  >
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-orange-700" />
                      <span className="text-orange-800 text-sm font-medium">
                        Suas listagens estão acabando!
                      </span>
                    </div>
                    <p className="text-orange-700 text-xs mt-1">
                      Atualize seu plano para continuar publicando.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-purple-700" />
                </div>
                <p className="text-gray-500 text-sm mb-2">
                  Nenhum plano ativo
                </p>
                <p className="text-gray-400 text-xs">
                  Escolha um plano para começar
                </p>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleManagePlan}
                  className="mt-4 bg-gradient-to-r from-purple-700 to-orange-500 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Ver Planos
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}