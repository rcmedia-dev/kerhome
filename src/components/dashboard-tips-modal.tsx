'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronLeft, ChevronRight, X, CheckCircle2, Lightbulb, TrendingUp, MessageCircle, Target, RefreshCw } from 'lucide-react';
import { analyzeAgentProfile, type AgentProfileAnalysis } from '@/lib/functions/supabase-actions/analyze-agent-profile';
import { analyzePropertyHealth, type PropertyHealthAnalysis } from '@/lib/functions/supabase-actions/analyze-property-health';

const STORAGE_KEY = 'kercasa_dashboard_tips_seen';

interface StepData {
  icon: any;
  title: string;
  description: string;
  content: React.ReactNode;
}

export function DashboardTipsModal({
  userId,
  userProperties,
}: {
  userId: string;
  userProperties?: any[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState<AgentProfileAnalysis | null>(null);
  const [propertyData, setPropertyData] = useState<PropertyHealthAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen) {
      const parsed = JSON.parse(seen);
      if (parsed.date === new Date().toDateString()) {
        setDismissed(true);
        return;
      }
    }

    const load = async () => {
      setLoading(true);
      const [profile, propertyHealth] = await Promise.all([
        analyzeAgentProfile(userId),
        userProperties && userProperties.length > 0
          ? analyzePropertyHealth(userProperties[0].id)
          : Promise.resolve(null),
      ]);
      setProfileData(profile);
      setPropertyData(propertyHealth);
      setLoading(false);
      setTimeout(() => setIsOpen(true), 500);
    };
    load();
  }, [userId, userProperties]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: new Date().toDateString() }));
  }, []);

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  if (dismissed || !isOpen || loading) return null;

  const scoreColor = (score: number) =>
    score >= 80 ? 'text-green-600' : score >= 50 ? 'text-orange-500' : 'text-red-500';
  const scoreBg = (score: number) =>
    score >= 80 ? 'bg-green-50 border-green-200' : score >= 50 ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200';

  const steps: StepData[] = [
    {
      icon: Sparkles,
      title: 'Otimização do Perfil',
      description: profileData
        ? `Score: ${profileData.score}/100 — ${profileData.score >= 80 ? 'Excelente!' : profileData.score >= 50 ? 'Pode melhorar' : 'Precisa de atenção'}`
        : 'Carregando...',
      content: profileData ? (
        <div className="space-y-4">
          <div className={`flex items-center gap-3 p-3 rounded-lg border ${scoreBg(profileData.score)}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${scoreBg(profileData.score)}`}>
              <span className={`text-lg font-black ${scoreColor(profileData.score)}`}>{profileData.score}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Score do Perfil</p>
              <p className="text-xs text-gray-500">
                {profileData.completeness.filter(f => f.filled).length} de {profileData.completeness.length} campos preenchidos
              </p>
            </div>
          </div>

          {profileData.tips.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Lightbulb size={12} className="text-orange-500" />
                Dicas principais
              </h4>
              {profileData.tips.slice(0, 3).map((tip, i) => (
                <div key={i} className="flex items-start gap-2 bg-orange-50 rounded-lg p-2.5 border border-orange-100">
                  <Target size={12} className="text-orange-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-orange-800 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null,
    },
    {
      icon: TrendingUp,
      title: 'Saúde dos Anúncios',
      description: propertyData
        ? `"${propertyData.title}" — Score: ${propertyData.score}/100`
        : userProperties && userProperties.length > 0
          ? 'A analisar...'
          : 'Nenhum imóvel publicado',
      content: propertyData ? (
        <div className="space-y-4">
          <div className={`flex items-center gap-3 p-3 rounded-lg border ${scoreBg(propertyData.score)}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${scoreBg(propertyData.score)}`}>
              <span className={`text-lg font-black ${scoreColor(propertyData.score)}`}>{propertyData.score}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{propertyData.title}</p>
              <p className="text-xs text-gray-500">
                {propertyData.strengths.length > 0 ? propertyData.strengths[0] : 'Sem dados'}
              </p>
            </div>
          </div>

          {propertyData.tips.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Lightbulb size={12} className="text-orange-500" />
                Melhorias recomendadas
              </h4>
              {propertyData.tips.slice(0, 3).map((tip, i) => (
                <div key={i} className="flex items-start gap-2 bg-orange-50 rounded-lg p-2.5 border border-orange-100">
                  <RefreshCw size={12} className="text-orange-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-orange-800 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'Fotos', ok: propertyData.score >= 20 },
              { label: 'Descrição', ok: propertyData.score >= 30 },
              { label: 'Localização', ok: propertyData.score >= 25 },
              { label: 'Características', ok: propertyData.score >= 50 },
            ].map((item) => (
              <span key={item.label} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border ${item.ok ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                {item.ok ? <CheckCircle2 size={10} /> : <X size={10} />}
                {item.label}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Publique o seu primeiro imóvel para receber dicas de otimização</p>
        </div>
      ),
    },
    {
      icon: MessageCircle,
      title: 'Atendimento ao Lead',
      description: 'Dicas para melhorar a resposta e conversão',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-100">
            <h4 className="text-sm font-bold text-gray-900 mb-2">Boas práticas de atendimento</h4>
            <ul className="space-y-2">
              {[
                'Responda aos leads em menos de 5 minutos — aumenta a conversão em 50%',
                'Use mensagens personalizadas com o nome do lead e o imóvel de interesse',
                'Envie fotos adicionais ou vídeo tour para leads quentes',
                'Agende uma visita presencial após 3 trocas de mensagens',
                'Mantenha um tom profissional mas cordial — isso gera confiança',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                  <CheckCircle2 size={12} className="text-green-500 mt-0.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
            <p className="text-xs text-orange-800 flex items-start gap-2">
              <Lightbulb size={14} className="text-orange-500 mt-0.5 shrink-0" />
              Leads classificados como "Quentes" devem ser priorizados — responda primeiro a eles
            </p>
          </div>
        </div>
      ),
    },
  ];

  const totalSteps = steps.length;
  const currentData = steps[currentStep];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-purple-200" />
                  <h2 className="text-white font-bold text-base">Dicas Inteligentes</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="text-white/60 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Step Indicator */}
              <div className="px-6 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  {steps.map((step, i) => (
                    <button
                      key={i}
                      onClick={() => handleStepClick(i)}
                      className={`flex-1 h-1.5 rounded-full transition-all cursor-pointer ${
                        i === currentStep
                          ? 'bg-purple-600'
                          : i < currentStep
                            ? 'bg-purple-300'
                            : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-4 min-h-[250px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                        <currentData.icon size={20} className="text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">{currentData.title}</h3>
                        <p className="text-xs text-gray-500">{currentData.description}</p>
                      </div>
                    </div>
                    {currentData.content}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
                <button
                  onClick={handleClose}
                  className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors"
                >
                  Dispensar
                </button>

                <div className="flex items-center gap-2">
                  {currentStep > 0 && (
                    <button
                      onClick={() => setCurrentStep(prev => prev - 1)}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                    >
                      <ChevronLeft size={14} />
                      Anterior
                    </button>
                  )}

                  {currentStep < totalSteps - 1 ? (
                    <button
                      onClick={() => setCurrentStep(prev => prev + 1)}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg bg-purple-600 text-xs font-bold text-white hover:bg-purple-700 transition-all shadow-sm"
                    >
                      Próximo
                      <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={handleClose}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-xs font-bold text-white hover:opacity-90 transition-all shadow-sm"
                    >
                      <CheckCircle2 size={14} />
                      Começar!
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
