import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, CheckCircle2, RefreshCw, Building2, User, Trash2, Trash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import LoadingState from '@/app/propriedades/components/loading-state';
import { cn } from '@/lib/utils';
import {
  SectionHeader,
  EmptyState
} from '@/components/dashboard/shared-ui';

type VisitasProps = {
  userId: string;
}

export function VisitasAgendadas({ userId }: VisitasProps) {
  const [visits, setVisits] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subTab, setSubTab] = useState<'pending' | 'confirmed' | 'history'>('pending');

  const fetchVisits = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/visits?agent_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setVisits(data.visits || []);
      }
    } catch (e) {
      toast.error('Erro ao carregar visitas');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const [deletingVisitId, setDeletingVisitId] = useState<string | null>(null);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/visits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        setVisits(prev => prev ? prev.map(v => v.id === id ? { ...v, status } : v) : null);
        toast.success('Status atualizado');
      }
    } catch (e) {
      toast.error('Erro ao atualizar');
    }
  };

  const confirmDeleteVisit = async (id: string) => {
    try {
      const res = await fetch(`/api/visits?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setVisits(prev => prev ? prev.filter(v => v.id !== id) : null);
        toast.success('Visita removida');
      }
    } catch (e) {
      toast.error('Erro ao remover');
    } finally {
      setDeletingVisitId(null);
    }
  };

  if (isLoading) return <LoadingState.LoadingList count={3} />;

  const pending = visits?.filter(v => v.status === 'pending') || [];
  const confirmed = visits?.filter(v => v.status === 'confirmed') || [];
  const history = visits?.filter(v => v.status === 'done' || v.status === 'cancelled') || [];

  const currentList = subTab === 'pending' ? pending : subTab === 'confirmed' ? confirmed : history;

  return (
    <div className="w-full">
      <SectionHeader
        title="Visitas Agendadas"
        icon={Calendar}
        description="Gerencie seus compromissos com potenciais clientes."
        className="mb-8 px-2"
      >
        <button
          onClick={fetchVisits}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-border text-gray-600 rounded-button hover:bg-gray-50 transition-all shadow-card text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </SectionHeader>

      {!visits || visits.length === 0 ? (
        <EmptyState message="Nenhuma visita agendada ainda." icon={Calendar} />
      ) : (
        <div className="space-y-8">
          <div className="flex p-1 bg-gray-100 rounded-card w-fit mx-auto lg:mx-0">
            {[
              { id: 'pending', label: 'Pendentes', count: pending.length, color: 'text-orange-600' },
              { id: 'confirmed', label: 'Confirmadas', count: confirmed.length, color: 'text-purple-600' },
              { id: 'history', label: 'Histórico', count: history.length, color: 'text-gray-600' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as any)}
                className={cn(
                    "px-6 py-2.5 rounded-button text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  subTab === tab.id 
                    ? "bg-white text-gray-900 shadow-card" 
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                {tab.label}
                <span className={cn("px-2 py-0.5 rounded-full bg-gray-50 text-[10px]", subTab === tab.id ? tab.color : "text-gray-300")}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={subTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 min-w-0"
            >
              {currentList.length === 0 ? (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-card-lg">
                  <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Nada para mostrar aqui</p>
                </div>
              ) : (
                currentList.map((visit) => (
                  <VisitListItem 
                    key={visit.id} 
                    visit={visit} 
                    onUpdate={handleUpdateStatus} 
                    onDelete={() => setDeletingVisitId(visit.id)}
                    isDeleting={deletingVisitId === visit.id}
                    onCancelDelete={() => setDeletingVisitId(null)}
                    onConfirmDelete={() => confirmDeleteVisit(visit.id)}
                  />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function VisitListItem({ 
  visit, onUpdate, onDelete, isDeleting, onCancelDelete, onConfirmDelete 
}: { 
  visit: any, 
  onUpdate: (id: string, status: string) => void,
  onDelete: () => void,
  isDeleting: boolean,
  onCancelDelete: () => void,
  onConfirmDelete: () => void
}) {
  const statusMap: any = {
    pending: { label: 'Pendente', cls: 'bg-orange-50 text-orange-700 border-orange-100', icon: Clock },
    confirmed: { label: 'Confirmada', cls: 'bg-purple-50 text-purple-700 border-purple-100', icon: CheckCircle },
    cancelled: { label: 'Cancelada', cls: 'bg-red-50 text-red-700 border-red-100', icon: XCircle },
    done: { label: 'Realizada', cls: 'bg-green-50 text-green-700 border-green-100', icon: CheckCircle2 },
  };

  const s = statusMap[visit.status] || statusMap.pending;
  const StatusIcon = s.icon;

  const dateObj = visit.scheduled_date ? new Date(visit.scheduled_date + 'T12:00:00') : new Date();
  const formattedDate = format(dateObj, "dd 'de' MMMM", { locale: ptBR });
  const dayName = format(dateObj, "EEEE", { locale: ptBR });
  const timeShort = visit.scheduled_time?.substring(0, 5) || '--:--';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white p-6 md:p-8 lg:p-10 rounded-card-lg border border-border shadow-card hover:shadow-card-hover hover:border-purple-200 transition-all group space-y-7 relative overflow-hidden"
    >
      <div className={cn("absolute -right-6 -top-6 w-32 h-32 opacity-[0.03] rotate-12 transition-transform group-hover:scale-110", s.cls.split(' ')[0])}>
        <StatusIcon className="w-full h-full" />
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute top-4 right-4 p-2 opacity-40 hover:opacity-100 transition-all hover:bg-rose-50 rounded-md group/trash z-50 cursor-pointer"
      >
        <Trash2 className="w-4 h-4 text-gray-400 group-hover/trash:text-rose-500 transition-colors" />
      </button>

      {isDeleting && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
        >
          <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mb-4">
            <Trash2 className="w-6 h-6 text-rose-500" />
          </div>
          <p className="text-[11px] font-black text-rose-600 uppercase tracking-[0.2em] mb-4">Eliminar este agendamento?</p>
          <div className="flex gap-3 w-full max-w-[240px]">
            <button 
              onClick={(e) => { e.stopPropagation(); onConfirmDelete(); }}
              className="flex-1 py-3 bg-rose-500 text-white text-[10px] font-black uppercase rounded-md shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all cursor-pointer"
            >
              Apagar
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onCancelDelete(); }}
              className="flex-1 py-3 bg-gray-100 text-gray-500 text-[10px] font-black uppercase rounded-md hover:bg-gray-200 transition-all cursor-pointer"
            >
              Voltar
            </button>
          </div>
        </motion.div>
      )}

      <div className="flex justify-between items-start relative z-10">
        <div className={cn("flex items-center gap-2.5 px-4 py-2 rounded-badge border text-[11px] font-black uppercase tracking-widest", s.cls)}>
          <StatusIcon className="w-4 h-4" />
          {s.label}
        </div>
        <div className="text-right">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Horário</p>
          <div className="flex items-center gap-1.5 justify-end text-purple-600">
            <Clock className="w-4 h-4" />
            <p className="text-lg font-black">{timeShort}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 relative z-10">
        <div className="flex items-center gap-2.5 text-orange-500">
          <Calendar className="w-4 h-4" />
          <span className="text-[11px] font-black uppercase tracking-widest">{dayName}</span>
        </div>
        <h3 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
          {formattedDate}
        </h3>
      </div>

      <div className="p-6 bg-gray-50/50 rounded-card border border-border space-y-5 relative z-10">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-button bg-white border border-border flex items-center justify-center shadow-card shrink-0">
            <Building2 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Imóvel da Visita</p>
            <p className="text-[13px] font-black text-gray-800 line-clamp-2 leading-snug">{visit.property_title || 'Não especificado'}</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-button bg-white border border-border flex items-center justify-center shadow-card shrink-0">
            <User className="w-5 h-5 text-gray-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Lead / Cliente</p>
            <p className="text-[13px] font-black text-gray-800 line-clamp-1 leading-snug">{visit.lead_name || 'Anónimo'}</p>
          </div>
        </div>
      </div>

      {visit.notes && (
        <div className="px-6 py-4 bg-purple-50/40 rounded-card border border-purple-100/40 relative z-10">
          <p className="text-xs text-purple-700/80 font-semibold italic leading-relaxed">
            "{visit.notes}"
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-2 relative z-10">
        {visit.status === 'pending' && (
          <>
            <button
              onClick={() => onUpdate(visit.id, 'confirmed')}
              className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-[20px] text-[11px] font-black uppercase tracking-widest hover:from-purple-700 hover:to-indigo-700 transition-all shadow-xl shadow-purple-200 cursor-pointer flex items-center justify-center gap-2"
            >
              Confirmar
            </button>
            <button
              onClick={() => onUpdate(visit.id, 'cancelled')}
              className="px-5 py-4 bg-gray-50 text-gray-400 rounded-button hover:bg-red-50 hover:text-red-500 transition-all border border-border cursor-pointer flex items-center justify-center"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </>
        )}
        {visit.status === 'confirmed' && (
          <button
            onClick={() => onUpdate(visit.id, 'done')}
            className="w-full py-4 md:py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-[20px] text-[10px] md:text-[11px] font-black uppercase tracking-widest hover:from-green-600 hover:to-emerald-700 transition-all shadow-xl shadow-green-200 flex items-center justify-center gap-3 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            Finalizar Visita
          </button>
        )}
        {(visit.status === 'done' || visit.status === 'cancelled') && (
           <div className="w-full py-4 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest border-2 border-dashed border-border rounded-button">
             Concluído
           </div>
        )}
      </div>
    </motion.div>
  );
}
