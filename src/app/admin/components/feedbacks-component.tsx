'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { createClient } from '@/lib/supabase/client';
import {
  MessageSquare,
  Bug,
  Lightbulb,
  Sparkles,
  Heart,
  ShieldAlert,
  Flag,
  HelpCircle,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Loader2,
  ExternalLink,
} from 'lucide-react';

const supabase = createClient();

interface Feedback {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  categoria: string;
  titulo: string;
  mensagem: string;
  url: string | null;
  user_agent: string | null;
  status: string;
  admin_notes: string | null;
  image_url: string | null;
  created_at: string;
}

const categoriaConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  bug:                  { label: 'Reportar Bug',         icon: Bug,            color: 'text-red-600',    bg: 'bg-red-100' },
  sugestao:             { label: 'Melhoria',             icon: Lightbulb,      color: 'text-amber-600',  bg: 'bg-amber-100' },
  nova_funcionalidade:  { label: 'Nova Funcionalidade',  icon: Sparkles,       color: 'text-purple-600', bg: 'bg-purple-100' },
  elogio:               { label: 'Elogio',               icon: Heart,          color: 'text-pink-600',   bg: 'bg-pink-100' },
  problema_acesso:      { label: 'Problema de Acesso',   icon: ShieldAlert,    color: 'text-orange-600', bg: 'bg-orange-100' },
  reportar_conteudo:    { label: 'Reportar Conteudo',    icon: Flag,           color: 'text-blue-600',   bg: 'bg-blue-100' },
  duvida:               { label: 'Duvida',               icon: HelpCircle,     color: 'text-teal-600',   bg: 'bg-teal-100' },
  outro:                { label: 'Outro',                icon: MessageSquare,  color: 'text-gray-600',   bg: 'bg-gray-100' },
};

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending:   { label: 'Pendente',    color: 'text-amber-700',  bg: 'bg-amber-100',  icon: Clock },
  reviewing: { label: 'Em Analise',  color: 'text-blue-700',   bg: 'bg-blue-100',   icon: Eye },
  resolved:  { label: 'Resolvido',   color: 'text-green-700',  bg: 'bg-green-100',  icon: CheckCircle2 },
  dismissed: { label: 'Descartado',  color: 'text-gray-700',   bg: 'bg-gray-100',   icon: XCircle },
};

export default function FeedbacksManagement({ darkMode }: { darkMode: boolean }) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [updatingFeedback, setUpdatingFeedback] = useState<{ id: string; status: string } | null>(null);

  useEffect(() => {
    if (expandedImage) {
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
    }
    return () => { document.documentElement.style.overflow = ''; };
  }, [expandedImage]);
  const [fetching, setFetching] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchFeedbacks = useCallback(async () => {
    setFetching(true);
    setError(null);
    try {
      const res = await fetch('/api/feedback');
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao carregar feedbacks');
      }
      const data: Feedback[] = await res.json();
      setFeedbacks(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar feedbacks';
      console.error('Erro ao carregar feedbacks:', msg);
      setError(msg);
      toast.error(msg);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  useEffect(() => {
    const channel = supabase
      .channel('feedbacks-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'feedbacks',
      }, (payload) => {
        const newFeedback = payload.new as Feedback;
        setFeedbacks((prev) => [newFeedback, ...prev]);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'feedbacks',
      }, (payload) => {
        const updated = payload.new as Feedback;
        setFeedbacks((prev) => prev.map((f) => f.id === updated.id ? updated : f));
        setSelectedFeedback((prev) => prev?.id === updated.id ? updated : prev);
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'feedbacks',
      }, (payload) => {
        const deletedId = payload.old.id;
        setFeedbacks((prev) => prev.filter((f) => f.id !== deletedId));
        setSelectedFeedback((prev) => prev?.id === deletedId ? null : prev);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingFeedback({ id, status: newStatus });

    if (newStatus === 'dismissed') {
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
      setSelectedFeedback((prev) => (prev?.id === id ? null : prev));
      try {
        const res = await fetch('/api/feedback', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Erro ao descartar feedback');
        }
        toast.success('Feedback descartado');
      } catch (err) {
        console.error('Erro ao descartar feedback:', err);
        toast.error('Erro ao descartar feedback');
        fetchFeedbacks();
      } finally {
        setUpdatingFeedback(null);
      }
      return;
    }

    setFeedbacks((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f))
    );
    if (selectedFeedback?.id === id) {
      setSelectedFeedback((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      const res = await fetch('/api/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao atualizar status');
      }
      toast.success(`Feedback marcado como "${statusConfig[newStatus]?.label}"`);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      toast.error('Erro ao atualizar status');
      fetchFeedbacks();
    } finally {
      setUpdatingFeedback(null);
    }
  };

  const filtered = feedbacks.filter((f) => {
    const matchesStatus = activeStatus === 'all' || f.status === activeStatus;
    const matchesSearch =
      !searchTerm ||
      f.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.mensagem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = feedbacks.reduce(
    (acc, f) => {
      acc[f.status] = (acc[f.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "dd MMM yyyy, HH:mm", { locale: pt });
    } catch {
      return date;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Gestao de Feedbacks
          </h2>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {feedbacks.length} feedback(s) recebido(s)
          </p>
        </div>
        <button
          onClick={fetchFeedbacks}
          disabled={fetching}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            darkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Status tabs */}
      <div className={`flex flex-wrap gap-2 p-1 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        {[
          { id: 'all', label: 'Todos', count: feedbacks.length },
          { id: 'pending', label: 'Pendentes', count: statusCounts['pending'] || 0 },
          { id: 'reviewing', label: 'Em Analise', count: statusCounts['reviewing'] || 0 },
          { id: 'resolved', label: 'Resolvidos', count: statusCounts['resolved'] || 0 },
          { id: 'dismissed', label: 'Descartados', count: statusCounts['dismissed'] || 0 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveStatus(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeStatus === tab.id
                ? 'bg-white text-purple-600 shadow-sm'
                : darkMode
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              activeStatus === tab.id ? 'bg-purple-100 text-purple-600' : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
        <input
          type="text"
          placeholder="Pesquisar por titulo, mensagem, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm ${
            darkMode
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500'
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500'
          } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
        />
      </div>

      {/* Content */}
      {error ? (
        <div className={`text-center py-16 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-red-200'}`}>
          <ShieldAlert className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-red-400' : 'text-red-300'}`} />
          <p className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Erro ao carregar feedbacks
          </p>
          <p className={`text-sm mb-4 max-w-md mx-auto ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {error}
          </p>
          <button
            onClick={fetchFeedbacks}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className={`text-center py-16 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <MessageSquare className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
          <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Nenhum feedback encontrado
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((feedback) => {
            const cat = categoriaConfig[feedback.categoria] || categoriaConfig.outro;
            const stat = statusConfig[feedback.status] || statusConfig.pending;
            const CatIcon = cat.icon;
            const StatIcon = stat.icon;

            return (
              <div
                key={feedback.id}
                onClick={() => setSelectedFeedback(feedback)}
                className={`rounded-2xl border p-5 cursor-pointer transition-all hover:shadow-md ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cat.bg}`}>
                    <CatIcon className={`w-5 h-5 ${cat.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {feedback.titulo}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${stat.bg} ${stat.color}`}>
                        <StatIcon className="w-3 h-3" />
                        {stat.label}
                      </span>
                    </div>
                    <p className={`text-sm line-clamp-2 mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {feedback.mensagem}
                    </p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>
                        {cat.label}
                      </span>
                      <span className={darkMode ? 'text-gray-600' : 'text-gray-300'}>|</span>
                      <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>
                        {feedback.user_name || feedback.user_email || 'Anonimo'}
                      </span>
                      <span className={darkMode ? 'text-gray-600' : 'text-gray-300'}>|</span>
                      <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>
                        {formatDate(feedback.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedFeedback(null)} />
          <div className={`relative w-full max-w-lg rounded-2xl border shadow-xl ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {(() => {
                    const cat = categoriaConfig[selectedFeedback.categoria] || categoriaConfig.outro;
                    const CatIcon = cat.icon;
                    return (
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.bg}`}>
                        <CatIcon className={`w-5 h-5 ${cat.color}`} />
                      </div>
                    );
                  })()}
                  <div>
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedFeedback.titulo}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {categoriaConfig[selectedFeedback.categoria]?.label || selectedFeedback.categoria}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Message */}
              <div className={`rounded-xl p-4 mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm whitespace-pre-wrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedFeedback.mensagem}
                </p>
              </div>

              {selectedFeedback.image_url && (
                <div className={`rounded-xl overflow-hidden mb-4 cursor-pointer ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <img
                    src={selectedFeedback.image_url}
                    alt="Imagem do feedback"
                    onClick={() => setExpandedImage(selectedFeedback.image_url!)}
                    className="w-full h-48 object-contain bg-gray-100 hover:opacity-90 transition-opacity cursor-pointer"
                  />
                </div>
              )}

              {/* Meta */}
              <div className={`space-y-2 text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="flex justify-between">
                  <span>Autor:</span>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {selectedFeedback.user_name || 'Anonimo'}
                    {selectedFeedback.user_email && ` (${selectedFeedback.user_email})`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Data:</span>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {formatDate(selectedFeedback.created_at)}
                  </span>
                </div>
                {selectedFeedback.url && (
                  <div className="flex justify-between items-center">
                    <span>URL:</span>
                    <a
                      href={selectedFeedback.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:underline inline-flex items-center gap-1 truncate max-w-50"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      {selectedFeedback.url.replace(/^https?:\/\//, '').slice(0, 40)}
                    </a>
                  </div>
                )}
                {selectedFeedback.user_agent && (
                  <div className="flex justify-between">
                    <span>Browser:</span>
                    <span className="truncate max-w-50 text-right">{selectedFeedback.user_agent.slice(0, 60)}...</span>
                  </div>
                )}
              </div>

              {/* Status actions */}
              <div className={`border-t pt-4 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <p className={`text-xs font-semibold mb-3 uppercase tracking-wide ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Alterar Status
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(statusConfig).map(([key, cfg]) => {
                    const SIcon = cfg.icon;
                    const isActive = selectedFeedback.status === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleUpdateStatus(selectedFeedback.id, key)}
                        disabled={updatingFeedback?.id === selectedFeedback.id && updatingFeedback?.status === key || isActive}
                        className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? `${cfg.bg} ${cfg.color} ring-2 ring-offset-1 ring-current`
                            : darkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        } disabled:opacity-50`}
                      >
                        {updatingFeedback?.id === selectedFeedback.id && updatingFeedback?.status === key ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <SIcon className="w-4 h-4" />
                        )}
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expanded image lightbox */}
      {expandedImage && (
        <div className="fixed inset-0 z-60 flex items-center justify-center overflow-y-auto" onClick={() => setExpandedImage(null)}>
          <div className="absolute inset-0 bg-black/80" />
          <img
            src={expandedImage}
            alt="Imagem ampliada"
            className="relative max-w-[90vw] max-h-[90vh] object-contain"
          />
        </div>
      )}
    </div>
  );
}
