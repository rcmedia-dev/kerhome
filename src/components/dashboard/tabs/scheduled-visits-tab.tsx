'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Building2,
  User,
  Trash2,
  Phone,
  MessageCircle,
  MapPin,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Navigation,
  Compass,
  Check,
  Share2,
  ShieldCheck,
  CalendarCheck2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { useUserStore } from '@/lib/store/user-store';
import {
  SectionHeader,
  EmptyState,
  ErrorBoundary
} from '@/components/dashboard/shared-ui';

// ─── Tipos ───────────────────────────────────────────────────────────────────
export type VisitItem = {
  id: string;
  conversation_id?: string | null;
  property_id?: string | null;
  property_slug?: string | null;
  property_title: string;
  property_location?: string | null;
  property_price?: string | null;
  property_image?: string | null;
  agent_id?: string | null;
  agent_name?: string | null;
  agent_phone?: string | null;
  lead_id?: string | null;
  lead_name?: string | null;
  lead_phone?: string | null;
  scheduled_date: string; // YYYY-MM-DD
  scheduled_time: string; // HH:MM
  notes?: string | null;
  status: 'pending' | 'confirmed' | 'done' | 'cancelled';
  created_at?: string;
  updated_at?: string;
};

type VisitasProps = {
  userId?: string;
};

// ─── Helper de Role ──────────────────────────────────────────────────────────
function useUserRole() {
  const { user } = useUserStore();
  const role = user?.role?.toLowerCase() || '';
  const isAgent = ['agente', 'agent', 'corretor', 'profissional'].includes(role);
  const hasAgency = !!user?.imobiliaria_id;
  return { isAgent, hasAgency, user };
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. CARD DO CORRETOR (Gestão de Atendimento aos Clientes)
// ═════════════════════════════════════════════════════════════════════════════
function AgentVisitCard({
  visit,
  onOpenSheet,
  onUpdateStatus,
  onDelete
}: {
  visit: VisitItem;
  onOpenSheet: (v: VisitItem) => void;
  onUpdateStatus: (id: string, s: VisitItem['status']) => void;
  onDelete: (id: string) => void;
}) {
  const dateObj = visit.scheduled_date ? new Date(visit.scheduled_date + 'T12:00:00') : new Date();
  const formattedDate = format(dateObj, "dd 'de' MMM", { locale: ptBR });
  const timeShort = visit.scheduled_time ? visit.scheduled_time.substring(0, 5) : '--:--';
  const cleanPhone = (visit.lead_phone || '').replace(/\D/g, '');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      onClick={() => onOpenSheet(visit)}
      className="bg-white rounded-2xl border border-slate-200/90 hover:border-purple-300 shadow-sm overflow-hidden transition-all relative cursor-pointer"
    >
      {/* Top Strip com Horário e Status de Atendimento */}
      <div className={cn(
        "px-3.5 py-2 border-b flex items-center justify-between text-xs font-bold",
        visit.status === 'confirmed' && "bg-purple-50/80 border-purple-100 text-purple-900",
        visit.status === 'pending' && "bg-amber-50/80 border-amber-100 text-amber-900",
        visit.status === 'done' && "bg-emerald-50/80 border-emerald-100 text-emerald-900",
        visit.status === 'cancelled' && "bg-red-50/80 border-red-100 text-red-900"
      )}>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-black text-[13px]">Às {timeShort}</span>
          <span className="opacity-70 font-semibold">· {formattedDate}</span>
        </div>

        <span className={cn(
          "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md",
          visit.status === 'confirmed' && "bg-purple-200 text-purple-900",
          visit.status === 'pending' && "bg-amber-200 text-amber-900",
          visit.status === 'done' && "bg-emerald-200 text-emerald-900",
          visit.status === 'cancelled' && "bg-red-200 text-red-900"
        )}>
          {visit.status === 'confirmed' ? 'Confirmada' : visit.status === 'pending' ? 'Pendente' : visit.status === 'done' ? 'Realizada' : 'Cancelada'}
        </span>
      </div>

      <div className="p-3.5 space-y-3">
        {/* Imóvel */}
        <div className="flex gap-3 items-start">
          <img
            src={visit.property_image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300&auto=format&fit=crop&q=80'}
            alt={visit.property_title}
            className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100 border border-slate-100"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-black text-[13px] text-slate-900 leading-snug line-clamp-1">
              {visit.property_title}
            </h3>
            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              {visit.property_location || 'Luanda, Angola'}
            </p>
            {visit.property_price && (
              <span className="inline-block mt-0.5 font-black text-xs text-purple-700">
                {visit.property_price}
              </span>
            )}
          </div>
        </div>

        {/* Box do Cliente (Lead) — só identificação, sem botões de contacto */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
            {(visit.lead_name || 'C').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-slate-900 line-clamp-1">
              {visit.lead_name || 'Cliente Interessado'}
            </p>
            <p className="text-[10px] text-slate-500 font-semibold">
              {visit.lead_phone || 'Telefone não informado'}
            </p>
          </div>
        </div>

        {/* Observações do Cliente */}
        {visit.notes && (
          <p className="text-[11px] text-purple-950/80 bg-purple-50/50 px-2.5 py-1.5 rounded-lg italic line-clamp-1 border border-purple-100/60">
            "{visit.notes}"
          </p>
        )}

        {/* ─── Ações Operacionais do Corretor ─── */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="pt-1 flex items-center gap-2 border-t border-slate-100"
        >
          {visit.status === 'pending' && (
            <>
              <button
                onClick={() => onUpdateStatus(visit.id, 'confirmed')}
                className="flex-1 py-2 bg-gradient-to-r from-purple-700 to-indigo-600 text-white font-black text-xs rounded-xl shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Confirmar Visita
              </button>
              <button
                onClick={() => onUpdateStatus(visit.id, 'cancelled')}
                className="px-3 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-bold text-xs rounded-xl transition-colors"
              >
                Recusar
              </button>
            </>
          )}

          {visit.status === 'confirmed' && (
            <button
              onClick={() => onUpdateStatus(visit.id, 'done')}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Marcar como Realizada
            </button>
          )}

          {(visit.status === 'done' || visit.status === 'cancelled') && (
            <div className="flex-1 py-2 text-center text-xs font-bold text-slate-400 bg-slate-50 rounded-xl">
              {visit.status === 'done' ? '✓ Visita Realizada' : 'Visita Cancelada'}
            </div>
          )}

          <button
            onClick={() => onDelete(visit.id)}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
            title="Remover agendamento"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. CARD DO USUÁRIO NORMAL (Visitas Agendadas para Visitar Imóveis)
// ═════════════════════════════════════════════════════════════════════════════
function UserVisitCard({
  visit,
  onOpenSheet,
  onCancelVisit
}: {
  visit: VisitItem;
  onOpenSheet: (v: VisitItem) => void;
  onCancelVisit: (id: string) => void;
}) {
  const dateObj = visit.scheduled_date ? new Date(visit.scheduled_date + 'T12:00:00') : new Date();
  const formattedDate = format(dateObj, "dd 'de' MMM", { locale: ptBR });
  const timeShort = visit.scheduled_time ? visit.scheduled_time.substring(0, 5) : '--:--';
  const cleanPhone = (visit.agent_phone || '').replace(/\D/g, '');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      onClick={() => onOpenSheet(visit)}
      className="bg-white rounded-2xl border border-slate-200/90 hover:border-purple-300 shadow-sm overflow-hidden transition-all relative cursor-pointer"
    >
      {/* Top Strip com Data e Status pelo Ponto de Vista do Cliente */}
      <div className={cn(
        "px-3.5 py-2 border-b flex items-center justify-between text-xs font-bold",
        visit.status === 'confirmed' && "bg-emerald-50/80 border-emerald-100 text-emerald-900",
        visit.status === 'pending' && "bg-amber-50/80 border-amber-100 text-amber-900",
        visit.status === 'done' && "bg-slate-100 border-slate-200 text-slate-800",
        visit.status === 'cancelled' && "bg-red-50/80 border-red-100 text-red-900"
      )}>
        <div className="flex items-center gap-1.5">
          <CalendarCheck2 className="w-3.5 h-3.5 text-purple-600" />
          <span className="font-black text-[13px]">{formattedDate}</span>
          <span className="opacity-80 font-bold">às {timeShort}</span>
        </div>

        <span className={cn(
          "text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full",
          visit.status === 'confirmed' && "bg-emerald-200 text-emerald-900",
          visit.status === 'pending' && "bg-amber-200 text-amber-900",
          visit.status === 'done' && "bg-slate-200 text-slate-700",
          visit.status === 'cancelled' && "bg-red-200 text-red-900"
        )}>
          {visit.status === 'confirmed'
            ? 'Confirmada'
            : visit.status === 'pending'
            ? 'Aguardando Corretor'
            : visit.status === 'done'
            ? 'Concluída'
            : 'Cancelada'}
        </span>
      </div>

      <div className="p-3.5 space-y-3">
        {/* Foto do Imóvel que o Cliente vai Visitar */}
        <div className="flex gap-3 items-start">
          <img
            src={visit.property_image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300&auto=format&fit=crop&q=80'}
            alt={visit.property_title}
            className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100 border border-slate-100"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-black text-[13px] text-slate-900 leading-snug line-clamp-2">
              {visit.property_title}
            </h3>
            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-purple-600 shrink-0" />
              {visit.property_location || 'Luanda, Angola'}
            </p>
            {visit.property_price && (
              <span className="inline-block mt-1 font-black text-xs text-purple-700">
                {visit.property_price}
              </span>
            )}
          </div>
        </div>

        {/* Box do Corretor — com botões WhatsApp e Ligar (é o cliente que contacta) */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center shrink-0 border border-purple-200">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9.5px] font-black text-purple-700 uppercase tracking-wide block">
                Quem vai te receber:
              </span>
              <p className="text-xs font-bold text-slate-900 line-clamp-1">
                {visit.agent_name || 'Corretor Responsável'}
              </p>
            </div>
          </div>

          {/* WhatsApp + Ligar para o Corretor */}
          <div className="flex items-center gap-1.5 shrink-0">
            {cleanPhone && (
              <a
                href={`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(`Olá ${visit.agent_name || 'Corretor'}, tenho uma visita agendada para ${formattedDate} às ${timeShort} no imóvel "${visit.property_title}". Gostaria de confirmar detalhes.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors border border-emerald-200/60"
                title="Falar com o Corretor no WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
            {cleanPhone && (
              <a
                href={`tel:${cleanPhone}`}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors border border-slate-200"
                title="Ligar para o Corretor"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Aviso amigável de status para o cliente */}
        <div className="text-[11px] leading-tight px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-100 flex items-center gap-1.5">
          {visit.status === 'confirmed' ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Visita confirmada! Chegue com 5 minutos de antecedência.</span>
            </>
          ) : visit.status === 'pending' ? (
            <>
              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>O corretor recebeu o seu pedido e irá confirmar em breve.</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Visita concluída. Esperamos que tenha gostado do imóvel!</span>
            </>
          )}
        </div>

        {/* ─── Ações Práticas do Usuário Normal ─── */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="pt-1 flex items-center gap-2 border-t border-slate-100"
        >
          {/* Como Chegar (Google Maps) */}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${visit.property_title}, ${visit.property_location || 'Luanda, Angola'}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5 text-purple-600" />
            <span>Como Chegar</span>
          </a>

          {/* Ver Anúncio no Site */}
          <Link
            href={`/propriedades/${visit.property_slug || visit.property_id || ''}`}
            className="flex-1 py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
            <span>Ver Imóvel</span>
          </Link>

          {/* Cancelar Visita (se ainda não tiver sido concluída) */}
          {visit.status !== 'done' && visit.status !== 'cancelled' && (
            <button
              onClick={() => onCancelVisit(visit.id)}
              className="px-3 py-2 text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl transition-colors shrink-0"
              title="Cancelar Agendamento"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 3. BOTTOM SHEET PARA O CORRETOR
// ═════════════════════════════════════════════════════════════════════════════
function AgentVisitSheet({
  open,
  onClose,
  visit,
  onUpdateStatus,
  onDelete
}: {
  open: boolean;
  onClose: () => void;
  visit: VisitItem | null;
  onUpdateStatus: (id: string, s: VisitItem['status']) => void;
  onDelete: (id: string) => void;
}) {
  if (!visit) return null;
  const cleanPhone = (visit.lead_phone || '').replace(/\D/g, '');

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs lg:hidden"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-[101] bg-white rounded-t-[30px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col lg:hidden mobile-scroll-container safe-area-bottom"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
          >
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-300" />
            </div>

            <div className="mobile-scroll-container overflow-y-auto px-5 pb-6 pt-2 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block">
                    Gestão de Atendimento
                  </span>
                  <h2 className="text-base font-black text-slate-900 leading-snug mt-0.5">
                    {visit.property_title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">{visit.property_location}</p>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              {/* Ficha do Cliente / Lead */}
              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2">
                <span className="text-[10px] font-black uppercase text-purple-800 tracking-wider block">
                  Dados do Cliente Interessado
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-black text-slate-900">{visit.lead_name || 'Cliente'}</div>
                    <div className="text-xs text-slate-600 font-semibold">{visit.lead_phone || 'Sem telefone'}</div>
                  </div>
                </div>
                {visit.notes && (
                  <div className="pt-2 border-t border-purple-100/80 text-xs text-purple-950 italic">
                    "{visit.notes}"
                  </div>
                )}
              </div>

              {/* Ações do Corretor */}
              <div className="space-y-2 pt-2">
                {visit.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { onUpdateStatus(visit.id, 'confirmed'); onClose(); }}
                      className="flex-1 py-3 bg-gradient-to-r from-purple-700 to-indigo-600 text-white font-black text-xs rounded-xl shadow-md"
                    >
                      Confirmar Visita
                    </button>
                    <button
                      onClick={() => { onUpdateStatus(visit.id, 'cancelled'); onClose(); }}
                      className="px-4 py-3 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                    >
                      Recusar
                    </button>
                  </div>
                )}

                {visit.status === 'confirmed' && (
                  <button
                    onClick={() => { onUpdateStatus(visit.id, 'done'); onClose(); }}
                    className="w-full py-3 bg-emerald-600 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Marcar como Realizada
                  </button>
                )}

                <button
                  onClick={() => { onDelete(visit.id); onClose(); }}
                  className="w-full py-2.5 text-rose-600 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar da Agenda
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 4. BOTTOM SHEET PARA O USUÁRIO NORMAL
// ═════════════════════════════════════════════════════════════════════════════
function UserVisitSheet({
  open,
  onClose,
  visit,
  onCancelVisit
}: {
  open: boolean;
  onClose: () => void;
  visit: VisitItem | null;
  onCancelVisit: (id: string) => void;
}) {
  if (!visit) return null;
  const cleanPhone = (visit.agent_phone || '').replace(/\D/g, '');

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs lg:hidden"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-[101] bg-white rounded-t-[30px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col lg:hidden mobile-scroll-container safe-area-bottom"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
          >
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-300" />
            </div>

            <div className="mobile-scroll-container overflow-y-auto px-5 pb-6 pt-2 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block">
                    Detalhes da Sua Visita
                  </span>
                  <h2 className="text-base font-black text-slate-900 leading-snug mt-0.5">
                    {visit.property_title}
                  </h2>
                  <p className="text-xs text-purple-700 font-extrabold mt-0.5">{visit.property_price}</p>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              {/* Informações do Corretor */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                  Corretor que vai te receber
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-black text-slate-900">{visit.agent_name || 'Corretor KerHome'}</div>
                    <div className="text-xs text-slate-500 font-semibold">{visit.property_location}</div>
                  </div>
                  {cleanPhone && (
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://api.whatsapp.com/send?phone=${cleanPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp
                      </a>
                      <a
                        href={`tel:${cleanPhone}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Ligar
                      </a>
                    </div>
                  )}
                </div>
                {visit.notes && (
                  <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 italic">
                    ℹ️ {visit.notes}
                  </div>
                )}
              </div>

              {/* Ações do Cliente */}
              <div className="space-y-2 pt-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${visit.property_title}, ${visit.property_location || 'Luanda, Angola'}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-purple-700 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Abrir Rota no Google Maps
                </a>

                <Link
                  href={`/propriedades/${visit.property_slug || visit.property_id || ''}`}
                  onClick={onClose}
                  className="w-full py-3 bg-slate-100 text-slate-800 font-black text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4 text-purple-600" />
                  Ver Página do Imóvel
                </Link>

                {visit.status !== 'done' && visit.status !== 'cancelled' && (
                  <button
                    onClick={() => { onCancelVisit(visit.id); onClose(); }}
                    className="w-full py-2.5 text-rose-600 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    Desmarcar Esta Visita
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════
function VisitsMobileSkeleton() {
  return (
    <div className="w-full min-w-0 animate-pulse">
      <div className="flex items-center justify-between gap-3 mb-4 px-1 sm:px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 shrink-0" />
          <div className="space-y-2">
            <div className="h-5 w-44 rounded-md bg-slate-200" />
            <div className="h-2.5 w-56 rounded-md bg-slate-100" />
          </div>
        </div>
        <div className="h-9 w-24 rounded-xl bg-slate-100 shrink-0" />
      </div>

      <div className="mb-4 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="space-y-2">
            <div className="h-3.5 w-32 rounded bg-slate-200" />
            <div className="h-2.5 w-40 rounded bg-slate-100" />
          </div>
          <div className="h-7 w-16 rounded-xl bg-purple-100" />
        </div>
        <div className="flex gap-1.5 overflow-hidden">
          {[...Array(7)].map((_, index) => (
            <div key={index} className="h-16 min-w-[46px] rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>

      <div className="flex gap-1.5 overflow-hidden pb-2 mb-3">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="h-8 min-w-[76px] rounded-xl bg-slate-100" />
        ))}
      </div>

      <div className="flex items-center justify-between mb-3 px-1">
        <div className="h-3 w-44 rounded bg-slate-100" />
        <div className="h-3 w-16 rounded bg-slate-100" />
      </div>

      <div className="grid grid-cols-1 gap-3.5 pb-24">
        {[...Array(2)].map((_, index) => (
          <div key={index} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="space-y-2">
                <div className="h-4 w-36 rounded bg-slate-200" />
                <div className="h-3 w-24 rounded bg-slate-100" />
              </div>
              <div className="h-7 w-20 rounded-lg bg-purple-50" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-4/5 rounded bg-slate-100" />
              <div className="h-3 w-3/5 rounded bg-slate-100" />
            </div>
            <div className="h-10 w-full rounded-xl bg-slate-100 mt-4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function VisitasAgendadas({ userId }: VisitasProps) {
  const { isAgent } = useUserRole();

  const [visits, setVisits] = useState<VisitItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const [selectedDate, setSelectedDate] = useState<string | 'all'>(isAgent ? todayStr : 'all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'history'>('all');

  useEffect(() => {
    if (isAgent && selectedDate === 'all') {
      setSelectedDate(todayStr);
    }
  }, [isAgent, selectedDate, todayStr]);

  // Controle de exclusão e modal
  const [deletingVisitId, setDeletingVisitId] = useState<string | null>(null);
  const [activeSheetVisit, setActiveSheetVisit] = useState<VisitItem | null>(null);

  // ─── Busca de Dados por Perfil ────────────────────────────────────────────
  const fetchVisits = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!userId) {
        setVisits([]);
        setIsLoading(false);
        return;
      }
      const endpoint = isAgent ? `/api/visits?agent_id=${userId}` : `/api/visits?client_id=${userId}`;
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        const serverVisits: VisitItem[] = data.visits || [];
        setVisits(serverVisits);
      } else {
        setVisits([]);
      }
    } catch {
      setVisits([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, isAgent]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  // ─── Atualização de Status ────────────────────────────────────────────────
  const handleUpdateStatus = async (id: string, newStatus: VisitItem['status']) => {
    try {
      const res = await fetch('/api/visits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        setVisits(prev => prev ? prev.map(v => v.id === id ? { ...v, status: newStatus } : v) : null);
        toast.success('Status atualizado');
      } else {
        toast.error('Erro ao atualizar status');
      }
    } catch {
      toast.error('Erro de conexão ao atualizar');
    }
  };

  // ─── Cancelamento / Remoção de Visita ──────────────────────────────────────
  const confirmDeleteVisit = async (id: string) => {
    try {
      const res = await fetch(`/api/visits?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setVisits(prev => prev ? prev.filter(v => v.id !== id) : null);
        toast.success(isAgent ? 'Agendamento removido' : 'Visita desmarcada');
      } else {
        toast.error('Erro ao remover agendamento');
      }
    } catch {
      toast.error('Erro ao remover');
    } finally {
      setDeletingVisitId(null);
    }
  };

  // ─── Calendário (14 dias centrado no dia actual) ──────────────────────────
  const calendarDays = useMemo(() => {
    const today = new Date();
    // Começa 1 dia antes de hoje para dar contexto; cobre 14 dias
    const start = subDays(today, 1);
    const days = [];
    for (let i = 0; i < 14; i++) {
      const d = addDays(start, i);
      const dateKey = format(d, 'yyyy-MM-dd');
      const dayName = format(d, 'EEE', { locale: ptBR }).replace('.', '');
      const dayNumber = format(d, 'dd');
      const isToday = isSameDay(d, today);
      // Conta quantas visitas há neste dia para mostrar badge com número
      const dayVisitCount = (visits || []).filter(v => v.scheduled_date === dateKey).length;

      days.push({ dateKey, dayName, dayNumber, isToday, hasVisits: dayVisitCount > 0, visitCount: dayVisitCount });
    }
    return days;
  }, [visits]);

  // ─── Filtros Combinados ───────────────────────────────────────────────────
  const filteredVisits = useMemo(() => {
    let list = visits || [];
    if (selectedDate !== 'all') {
      list = list.filter(v => v.scheduled_date === selectedDate);
    }
    if (statusFilter === 'pending') {
      list = list.filter(v => v.status === 'pending');
    } else if (statusFilter === 'confirmed') {
      list = list.filter(v => v.status === 'confirmed');
    } else if (statusFilter === 'history') {
      list = list.filter(v => v.status === 'done' || v.status === 'cancelled');
    }
    return list;
  }, [visits, selectedDate, statusFilter]);

  const counts = useMemo(() => {
    const list = visits || [];
    return {
      all: list.length,
      pending: list.filter(v => v.status === 'pending').length,
      confirmed: list.filter(v => v.status === 'confirmed').length,
      history: list.filter(v => v.status === 'done' || v.status === 'cancelled').length
    };
  }, [visits]);

  if (isLoading) return <VisitsMobileSkeleton />;

  return (
    <ErrorBoundary>
      <div className="w-full min-w-0">
        {/* Cabeçalho do Dashboard */}
        <SectionHeader
          title={isAgent ? "Atendimentos & Visitas" : "Minhas Visitas"}
          icon={Calendar}
          description={
            isAgent
              ? "Gerencie os pedidos de visita recebidos de clientes interessados nos seus imóveis."
              : "Acompanhe os imóveis que você agendou para visitar e o contato com os corretores."
          }
          className="mb-4 px-1 sm:px-2"
        >
          <button
            onClick={fetchVisits}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-white border border-border text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm text-xs sm:text-sm font-semibold shrink-0 active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Atualizar</span>
          </button>
        </SectionHeader>

        {/* ─── Mini Calendário (14 dias) ───────────────────────────── */}
        <div className="mb-4 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between px-1 mb-2.5">
            <div>
              <span className="text-xs font-extrabold text-slate-800 capitalize block">
                {format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                {selectedDate === 'all'
                  ? 'Mostrando todas as visitas'
                  : `Filtrado por ${format(new Date(selectedDate + 'T12:00:00'), "dd/MM", { locale: ptBR })}`}
              </span>
            </div>
            <button
              onClick={() => setSelectedDate('all')}
              className={cn(
                "text-[11px] font-black px-2.5 py-1 rounded-xl transition-all",
                selectedDate === 'all'
                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
              )}
            >
              {selectedDate === 'all' ? '✓ Todos' : 'Ver todos'}
            </button>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {calendarDays.map((d) => {
              const isSelected = selectedDate === d.dateKey;
              return (
                <button
                  key={d.dateKey}
                  onClick={() => setSelectedDate(isSelected ? 'all' : d.dateKey)}
                  className={cn(
                    "min-w-[46px] py-2 px-1 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 transition-all select-none shrink-0 active:scale-95",
                    isSelected
                      ? "bg-gradient-to-b from-purple-700 to-purple-800 border-purple-600 text-white shadow-md shadow-purple-900/25"
                      : d.isToday
                      ? "bg-purple-50 border-purple-300 text-purple-900"
                      : "bg-slate-50/80 border-slate-200/60 text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <span className={cn(
                    "text-[9px] font-extrabold uppercase tracking-widest leading-none",
                    isSelected ? "text-purple-200" : d.isToday ? "text-purple-600" : "text-slate-400"
                  )}>
                    {d.isToday ? 'hoje' : d.dayName}
                  </span>
                  <span className={cn(
                    "text-sm font-black leading-none mt-0.5",
                    isSelected ? "text-white" : d.isToday ? "text-purple-800" : "text-slate-800"
                  )}>
                    {d.dayNumber}
                  </span>
                  {/* Badge de visitas */}
                  <div className="h-4 flex items-center justify-center mt-0.5">
                    {d.visitCount > 0 ? (
                      <span className={cn(
                        "px-1.5 rounded-full text-[8px] font-black leading-none py-0.5",
                        isSelected
                          ? "bg-white/25 text-white"
                          : d.isToday
                          ? "bg-purple-200 text-purple-900"
                          : "bg-orange-100 text-orange-700"
                      )}>
                        {d.visitCount}
                      </span>
                    ) : (
                      <span className="w-1 h-1" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Tabs de Filtro por Status (rounded-xl igual a 'Marcar como Realizada') ──── */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5",
              statusFilter === 'all'
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            Todas
            <span className={cn(
              "text-[10px] px-1.5 py-0.2 rounded-lg font-black",
              statusFilter === 'all' ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600"
            )}>
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('confirmed')}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5",
              statusFilter === 'confirmed'
                ? "bg-purple-700 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            Confirmadas
            <span className={cn(
              "text-[10px] px-1.5 py-0.2 rounded-lg font-black",
              statusFilter === 'confirmed' ? "bg-purple-800 text-purple-100" : "bg-purple-50 text-purple-700"
            )}>
              {counts.confirmed}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('pending')}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5",
              statusFilter === 'pending'
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            {isAgent ? 'Pendentes (Aprovar)' : 'Aguardando Resposta'}
            <span className={cn(
              "text-[10px] px-1.5 py-0.2 rounded-lg font-black",
              statusFilter === 'pending' ? "bg-amber-700 text-amber-100" : "bg-amber-50 text-amber-700"
            )}>
              {counts.pending}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('history')}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5",
              statusFilter === 'history'
                ? "bg-slate-700 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            Histórico
            <span className={cn(
              "text-[10px] px-1.5 py-0.2 rounded-lg font-black",
              statusFilter === 'history' ? "bg-slate-600 text-slate-200" : "bg-slate-100 text-slate-600"
            )}>
              {counts.history}
            </span>
          </button>
        </div>

        {/* Resumo do Filtro */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-3 px-1">
          <span>
            {selectedDate === 'all'
              ? (isAgent ? 'Todas as visitas da sua carteira' : 'Todos os seus agendamentos')
              : `Visitas para ${format(new Date(selectedDate + 'T12:00:00'), "dd 'de' MMMM", { locale: ptBR })}`}
          </span>
          <span className="font-extrabold text-slate-800">
            {filteredVisits.length} {filteredVisits.length === 1 ? 'visita' : 'visitas'}
          </span>
        </div>

        {/* ─── Lista de Visitas Diferenciada (Agente vs Usuário) ──── */}
        <AnimatePresence mode="wait">
          {filteredVisits.length === 0 ? (
            <motion.div
              key="empty-visits"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-14 px-4 text-center bg-white rounded-3xl border border-dashed border-slate-200"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-black text-slate-800">
                {isAgent ? 'Nenhum pedido de visita encontrado' : 'Nenhuma visita agendada'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {isAgent
                  ? 'Não há solicitações de clientes para este dia ou filtro.'
                  : 'Você ainda não agendou visitas para os imóveis com este filtro.'}
              </p>
              {selectedDate !== 'all' && (
                <button
                  onClick={() => setSelectedDate('all')}
                  className="mt-3.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition-all"
                >
                  Ver todos os dias
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="visits-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pb-24"
            >
              {filteredVisits.map((visit) =>
                isAgent ? (
                  <AgentVisitCard
                    key={visit.id}
                    visit={visit}
                    onOpenSheet={setActiveSheetVisit}
                    onUpdateStatus={handleUpdateStatus}
                    onDelete={(id) => setDeletingVisitId(id)}
                  />
                ) : (
                  <UserVisitCard
                    key={visit.id}
                    visit={visit}
                    onOpenSheet={setActiveSheetVisit}
                    onCancelVisit={(id) => setDeletingVisitId(id)}
                  />
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Bottom Sheet Diferenciado ──────────────────────────── */}
        {isAgent ? (
          <AgentVisitSheet
            open={!!activeSheetVisit}
            onClose={() => setActiveSheetVisit(null)}
            visit={activeSheetVisit}
            onUpdateStatus={handleUpdateStatus}
            onDelete={(id) => {
              setActiveSheetVisit(null);
              setDeletingVisitId(id);
            }}
          />
        ) : (
          <UserVisitSheet
            open={!!activeSheetVisit}
            onClose={() => setActiveSheetVisit(null)}
            visit={activeSheetVisit}
            onCancelVisit={(id) => {
              setActiveSheetVisit(null);
              setDeletingVisitId(id);
            }}
          />
        )}

        {/* ─── Modal de Confirmação de Cancelamento / Exclusão ────── */}
        <AnimatePresence>
          {deletingVisitId && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">
                    {isAgent ? 'Remover da Agenda?' : 'Desmarcar Visita?'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {isAgent
                      ? 'Tem certeza que deseja apagar este agendamento da sua carteira?'
                      : 'Tem certeza que deseja desmarcar esta visita? O corretor será notificado.'}
                  </p>
                </div>
                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => setDeletingVisitId(null)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => confirmDeleteVisit(deletingVisitId)}
                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md transition-all"
                  >
                    {isAgent ? 'Eliminar' : 'Sim, Desmarcar'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
