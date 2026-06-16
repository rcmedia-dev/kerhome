'use client';

import { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, XCircle, Lightbulb, Trophy, RefreshCw, Shield, Camera, User, Phone, Globe, Linkedin, Instagram, FileText, Building } from 'lucide-react';
import { analyzeAgentProfile, type AgentProfileAnalysis } from '@/lib/functions/supabase-actions/analyze-agent-profile';

const FIELD_ICONS: Record<string, any> = {
  'Foto de perfil': Camera,
  'Nome completo': User,
  'Telefone': Phone,
  'Biografia': FileText,
  'Empresa': Building,
  'Licença': Shield,
  'Website': Globe,
  'LinkedIn': Linkedin,
  'Instagram': Instagram,
};

export function AgentProfileTips({ userId }: { userId: string }) {
  const [data, setData] = useState<AgentProfileAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setLoading(true);
    const result = await analyzeAgentProfile(userId);
    setData(result);
    setLoading(false);
  };

  useEffect(() => { load(); }, [userId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm animate-pulse p-6 space-y-4">
        <div className="h-5 bg-gray-100 rounded w-1/3" />
        <div className="h-16 bg-gray-50 rounded-full w-32 mx-auto" />
        <div className="space-y-2"><div className="h-3 bg-gray-50 rounded w-full" /><div className="h-3 bg-gray-50 rounded w-4/5" /></div>
      </div>
    );
  }

  if (!data) return null;

  const scoreColor = data.score >= 80 ? 'text-green-600' : data.score >= 50 ? 'text-orange-500' : 'text-red-500';
  const scoreBg = data.score >= 80 ? 'bg-green-50 border-green-200' : data.score >= 50 ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200';

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-purple-200" />
          <h3 className="text-sm font-bold text-white">Otimização do Perfil</h3>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} className="text-white/70 hover:text-white transition-colors">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="p-5 space-y-5">
        <div className="flex flex-col items-center gap-3">
          <div className={`relative w-24 h-24 rounded-full flex items-center justify-center border-4 ${scoreBg}`}>
            <span className={`text-2xl font-black ${scoreColor}`}>{data.score}</span>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-900">
              {data.score >= 80 ? 'Perfil Excelente!' : data.score >= 60 ? 'Bom, mas pode melhorar' : 'Perfil precisa de atenção'}
            </p>
            <p className="text-xs text-gray-500">
              {data.score >= 80 ? 'Seu perfil está completo e profissional' : data.score >= 60 ? 'Complete os campos em falta' : 'Preencha os campos essenciais'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-green-500" />
            Checklist de Completude
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {data.completeness.map((f) => {
              const Icon = FIELD_ICONS[f.field] || Shield;
              return (
                <div key={f.field} className="flex items-center gap-2 text-xs">
                  {f.filled ? (
                    <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                  ) : (
                    <XCircle size={14} className="text-gray-300 shrink-0" />
                  )}
                  <Icon size={12} className="text-gray-400 shrink-0" />
                  <span className={f.filled ? 'text-gray-700' : 'text-gray-400'}>{f.field}</span>
                </div>
              );
            })}
          </div>
        </div>

        {data.tips.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb size={12} className="text-orange-500" />
              Dicas Inteligentes
            </h4>
            <div className="space-y-2">
              {data.tips.slice(0, 5).map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-3 border border-orange-100">
                  <Lightbulb size={14} className="text-orange-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-orange-800 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
