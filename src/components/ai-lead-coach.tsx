'use client';

import { Sparkles, Clock, TrendingUp, MessageCircle, Zap, Target } from 'lucide-react';
import { useMemo } from 'react';

interface Message {
  created_at: string;
  sender_id: string;
  content?: string;
}

interface AiLeadCoachProps {
  messages: Message[];
  currentUserId: string;
  totalUnread?: number;
}

export function AiLeadCoach({ messages, currentUserId, totalUnread = 0 }: AiLeadCoachProps) {
  const analysis = useMemo(() => {
    if (!messages.length) return null;

    const agentMessages = messages.filter(m => m.sender_id === currentUserId);
    const leadMessages = messages.filter(m => m.sender_id !== currentUserId);

    if (!agentMessages.length || !leadMessages.length) return null;

    const sorted = [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    let totalLeadResponseTime = 0;
    let responseCount = 0;

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      if (current.sender_id !== currentUserId && next.sender_id === currentUserId) {
        const diff = new Date(next.created_at).getTime() - new Date(current.created_at).getTime();
        totalLeadResponseTime += diff;
        responseCount++;
      }
    }

    const avgResponseMs = responseCount > 0 ? totalLeadResponseTime / responseCount : 0;
    const avgResponseMinutes = Math.round(avgResponseMs / 60000);

    const conversations = new Set(leadMessages.map(m => m.sender_id)).size;

    let tip = '';
    let score = 100;

    if (totalUnread > 0) {
      score -= Math.min(30, totalUnread * 5);
      tip = 'Tens mensagens não lidas. Responder rapidamente aumenta a confiança do lead.';
    } else if (avgResponseMinutes > 60) {
      score -= 20;
      tip = 'O tempo médio de resposta está acima de 1h. Responder em menos de 10 minutos aumenta a conversão em 50%.';
    } else if (avgResponseMinutes > 30) {
      score -= 10;
      tip = 'Bom tempo de resposta! Tenta manter abaixo de 10 minutos para melhores resultados.';
    } else if (avgResponseMinutes > 0 && avgResponseMinutes <= 10) {
      score += 10;
      tip = 'Excelente tempo de resposta! Responder rápido é o segredo para fechar negócios.';
    } else {
      tip = 'Continue mantendo um bom tempo de resposta com os leads.';
    }

    const level = score >= 90 ? 'top' : score >= 70 ? 'good' : 'needs_improvement';

    return {
      avgResponseMinutes,
      conversations,
      totalLeadMessages: leadMessages.length,
      totalAgentMessages: agentMessages.length,
      tip,
      score: Math.max(0, Math.min(100, score)),
      level,
      unreadCount: totalUnread,
    };
  }, [messages, currentUserId, totalUnread]);

  if (!analysis) return null;

  const levelConfig = {
    top: { color: 'text-green-600', bg: 'bg-green-50 border-green-200', icon: Zap, label: 'Excelente' },
    good: { color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', icon: TrendingUp, label: 'Bom' },
    needs_improvement: { color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', icon: Clock, label: 'Precisa melhorar' },
  };

  const config = levelConfig[analysis.level as keyof typeof levelConfig];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <Sparkles size={12} className="text-purple-200" />
          <span className="text-xs font-bold text-white">Coach de Atendimento</span>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${config.bg}`}>
          <div className="flex items-center gap-2">
            <config.icon size={14} className={config.color} />
            <span className={`text-xs font-bold ${config.color}`}>{config.label}</span>
          </div>
          <span className={`text-sm font-black ${config.color}`}>{analysis.score}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-xs font-black text-gray-900">{analysis.avgResponseMinutes < 1 ? '<1' : analysis.avgResponseMinutes}m</p>
            <p className="text-[9px] text-gray-400">Resposta Média</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-xs font-black text-gray-900">{analysis.conversations}</p>
            <p className="text-[9px] text-gray-400">Conversas</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-xs font-black text-gray-900">{analysis.unreadCount}</p>
            <p className="text-[9px] text-gray-400">Não Lidas</p>
          </div>
        </div>

        {analysis.tip && (
          <div className="flex items-start gap-2 bg-orange-50 rounded-lg p-2.5 border border-orange-100">
            <Target size={12} className="text-orange-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-orange-800 leading-relaxed">{analysis.tip}</p>
          </div>
        )}
      </div>
    </div>
  );
}
