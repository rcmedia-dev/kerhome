'use client';

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Camera, 
  FileText, 
  DollarSign, 
  Zap, 
  MessageCircle, 
  Video, 
  MapPin, 
  ShieldCheck, 
  UserCircle, 
  Share2,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Rocket
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Tip {
  id: number;
  title: string;
  description: string;
  icon: any;
  color: string;
}

const PERFORMANCE_TIPS: Tip[] = [
  {
    id: 1,
    title: 'Fotos de Alta Qualidade',
    description: 'Use iluminação natural e ângulos amplos para mostrar todo o potencial do espaço. Anúncios com fotos profissionais recebem 40% mais cliques.',
    icon: Camera,
    color: 'bg-blue-50 text-blue-600'
  },
  {
    id: 2,
    title: 'Descrições Detalhadas',
    description: 'Vá além do básico. Mencione escolas, hospitais e supermercados próximos. O cliente compra o bairro, não apenas a casa.',
    icon: FileText,
    color: 'bg-purple-50 text-purple-600'
  },
  {
    id: 3,
    title: 'Preço Competitivo',
    description: 'Pesquise imóveis similares na zona. Um preço justo no lançamento evita que o anúncio fique "esquecido" por muito tempo.',
    icon: DollarSign,
    color: 'bg-green-50 text-green-600'
  },
  {
    id: 4,
    title: 'Velocidade de Resposta',
    description: 'Lead frio não compra. Tente responder às mensagens no chat ou WhatsApp em menos de 10 minutos para manter o interesse alto.',
    icon: MessageCircle,
    color: 'bg-orange-50 text-orange-600'
  },
  {
    id: 5,
    title: 'Impulsionamento Estratégico',
    description: 'Use os Boosts nos fins de semana ou feriados, quando o volume de pesquisas aumenta consideravelmente no Kercasa.',
    icon: Rocket,
    color: 'bg-indigo-50 text-indigo-600'
  },
  {
    id: 6,
    title: 'Vídeos e Tours Virtuais',
    description: 'Vídeos curtos (estilo Stories) ajudam a criar uma ligação emocional e mostram o fluxo real da casa melhor que fotos estáticas.',
    icon: Video,
    color: 'bg-red-50 text-red-600'
  },
  {
    id: 7,
    title: 'Localização Precisa',
    description: 'Seja honesto sobre a localização. Isso filtra curiosos e atrai clientes que realmente querem viver naquela zona específica.',
    icon: MapPin,
    color: 'bg-amber-50 text-amber-600'
  },
  {
    id: 8,
    title: 'Documentação Pronta',
    description: 'Mencione na descrição que a documentação está em dia. Isso transmite confiança e acelera o processo de decisão do comprador.',
    icon: ShieldCheck,
    color: 'bg-teal-50 text-teal-600'
  },
  {
    id: 9,
    title: 'Perfil do Corretor',
    description: 'Mantenha a sua foto de perfil profissional e biografia atualizada. Os clientes compram de quem eles confiam.',
    icon: UserCircle,
    color: 'bg-gray-50 text-gray-600'
  },
  {
    id: 10,
    title: 'Partilha Social Ativa',
    description: 'Não espere apenas pelo tráfego orgânico. Partilhe os seus links no WhatsApp e Facebook para atrair a sua própria rede.',
    icon: Share2,
    color: 'bg-pink-50 text-pink-600'
  }
];

export function PerformanceTipsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = PERFORMANCE_TIPS.length;
  const currentTip = PERFORMANCE_TIPS[currentStep];

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
      setCurrentStep(0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if(!open) onClose(); }}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-md border-none shadow-2xl">
        <DialogTitle className="sr-only">Guia de Performance — Dicas para Corretores</DialogTitle>
        <div className="relative">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 z-10">
            <motion.div 
              className="h-full bg-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="p-8 pt-10">
            <div className="flex justify-between items-start mb-6">
               <div className={cn("p-4 rounded-md", currentTip.color)}>
                  <currentTip.icon className="w-8 h-8" />
               </div>
               <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-400">
                  <X className="w-5 h-5" />
               </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Dica {currentStep + 1} de {totalSteps}</p>
                   <h2 className="text-2xl font-black text-gray-900 leading-tight">
                      {currentTip.title}
                   </h2>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {currentTip.description}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-10">
               <button 
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all",
                    currentStep === 0 ? "text-gray-300 pointer-events-none" : "text-gray-500 hover:text-gray-900"
                  )}
               >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
               </button>

               <button 
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-md font-bold text-sm shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all"
               >
                  {currentStep === totalSteps - 1 ? 'Concluir Guia' : 'Próxima Dica'}
                  <ChevronRight className="w-4 h-4" />
               </button>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-1.5 mt-8">
               {PERFORMANCE_TIPS.map((_, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "h-1 rounded-full transition-all duration-300",
                      idx === currentStep ? "w-4 bg-purple-600" : "w-1 bg-gray-200"
                    )}
                  />
               ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
