'use client';

import React, { useState, useTransition, useCallback, useEffect, useMemo } from 'react';
import {
  AlertTriangle, CheckCircle2, ShieldAlert, TrendingUp, RefreshCw,
  MapPin, Eye, Share2, Pencil, Trash2, Clock,
  SlidersHorizontal, X, Plus, Check, Copy,
  MoreVertical, Sparkles, MessageCircle, Building2,
  Phone, ChevronRight, Users, BarChart2, Flame,
  BookmarkCheck, Home, BadgeCheck, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';

import { PropertyCard } from '@/components/property-card';
import { PendingPropertyCard } from '@/components/pending-property-card';
import { RejectedPropertyCard } from '@/components/rejected-property-card';
import LoadingState from '@/app/propriedades/components/loading-state';
import { PropertyHealthScore } from '@/components/property-health-score';

import { TPropertyResponseSchema } from '@/lib/types/property';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/lib/store/user-store';

import {
  SectionHeader,
  KanbanColumn,
  EmptyState,
  ErrorBoundary
} from '@/components/dashboard/shared-ui';

type FilterStatus = 'all' | 'active' | 'pending' | 'rejected';
type SortBy = 'newest' | 'oldest' | 'price-high' | 'price-low' | 'views';

type MinePropertiesProps = {
  userProperties: TPropertyResponseSchema[] | null;
};

// ─── Formatador de Preço em Kz com separador por PONTOS (ex: 10.000 Kz) ───
export const formatPriceKz = (price?: number | null, tipo?: string) => {
  if (price === null || price === undefined || isNaN(Number(price))) return 'Consulte';
  const formatted = Math.round(Number(price)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const isMensal = tipo === 'aluguel' || tipo === 'arrendamento';
  return `${formatted} Kz${isMensal ? '/mês' : ''}`;
};

// ─── Detecção de Papel do Utilizador ───
function useUserRole() {
  const { user } = useUserStore();
  const role = user?.role?.toLowerCase() || '';
  const isAgent = ['agente', 'agent', 'corretor', 'profissional'].includes(role);
  const hasAgency = !!user?.imobiliaria_id;
  const hasLicense = !!user?.licenca;
  const hasPlan = !!user?.pacote_agente;
  return { isAgent, hasAgency, hasLicense, hasPlan, role };
}

// ─── Status config helper ───
function getStatusConfig(status: string) {
  const map: Record<string, { label: string; dot: string; text: string; bg: string; border: string }> = {
    approved: {
      label: 'Ativo',
      dot: 'bg-emerald-500',
      text: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
    pending: {
      label: 'Em análise',
      dot: 'bg-amber-500',
      text: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
    rejected: {
      label: 'Rejeitado',
      dot: 'bg-rose-500',
      text: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
    },
  };
  return map[status] || map.pending;
}

// ─── Relative Date Helper ───
function relativeDate(dateStr?: string) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'Hoje';
  if (d === 1) return 'Ontem';
  if (d < 7) return `Há ${d} dias`;
  if (d < 30) return `Há ${Math.floor(d / 7)} sem.`;
  return `Há ${Math.floor(d / 30)} mês.`;
}

// ═══════════════════════════════════════════════════════════════
// CARD: AGENTE / CORRETOR  — foco comercial e métricas de negócio
// ═══════════════════════════════════════════════════════════════
function AgentPropertyCard({
  property,
  onOpenActions,
}: {
  property: any;
  onOpenActions: (p: TPropertyResponseSchema) => void;
}) {
  const status = getStatusConfig(property.aprovement_status);
  const thumb =
    property.fotos?.[0] ||
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300&auto=format&fit=crop&q=80';

  const leads = (property as any).leads_count ?? Math.max(1, Math.round((property.views_count || 10) * 0.07));
  const score = Math.min(100, Math.round(60 + ((property.views_count || 0) / 5)));
  const photoCount = property.fotos?.length || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.22 }}
      className={cn(
        "bg-white rounded-[20px] border overflow-hidden shadow-sm active:scale-[0.992] transition-transform",
        property.aprovement_status === 'rejected' ? "border-rose-200/80 opacity-80" : "border-slate-200/80",
        (property as any).is_destaque && property.aprovement_status === 'approved' && "border-amber-300/70 ring-1 ring-amber-200/60"
      )}
    >
      {/* Hero image: status, tipo de negócio, fotos e preço ficam no contexto visual do imóvel. */}
      <div className="relative h-[172px] w-full overflow-hidden bg-slate-100">
        <img
          src={thumb}
          alt={property.titulo}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/70" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className={cn("px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight flex items-center gap-1 shadow-sm", status.bg, status.text, status.border, "border")}>
            <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
            {status.label}
          </span>
          <span className="px-2 py-1 rounded-lg bg-black/55 text-white text-[10px] font-bold backdrop-blur-sm">
            {property.tipo_negocio === 'aluguel' || property.tipo_negocio === 'arrendamento' ? 'Arrendamento' : 'Venda'}
          </span>
        </div>
        {photoCount > 0 && (
          <span className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/55 text-white text-[10px] font-bold backdrop-blur-sm">
            {photoCount} fotos
          </span>
        )}
        {(property as any).is_destaque && (
          <span className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-amber-500 text-white text-[9px] font-black uppercase shadow-sm">
            ★ Destaque
          </span>
        )}
        <div className="absolute bottom-3 left-3 right-3">
          <span className="text-[19px] font-black leading-none text-white drop-shadow-md">
            {formatPriceKz(property.preco, property.tipo_negocio)}
          </span>
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-[14.5px] font-black text-slate-900 leading-snug line-clamp-2">{property.titulo}</h3>
            <div className="flex items-center gap-1 mt-0.5 text-[10.5px] text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span className="truncate">{property.bairro || property.cidade}, {property.cidade || 'Angola'}</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold shrink-0">{relativeDate(property.created_at)}</span>
        </div>

        <div className="flex items-center gap-2.5 mt-2 pb-2 border-b border-slate-100">
          <span className="text-[10.5px] text-slate-600"><strong className="text-slate-900">{property.quartos || 0}</strong> quartos</span>
          <span className="text-[10.5px] text-slate-600"><strong className="text-slate-900">{property.banheiros || 0}</strong> WCs</span>
          <span className="text-[10.5px] text-slate-600"><strong className="text-slate-900">{property.area_total || 0}</strong> m²</span>
        </div>

        <div className="flex items-center justify-center gap-5 mt-2 mb-2 text-[10px] font-semibold">
          <span className="text-slate-500"><Eye className="inline w-3 h-3 mr-0.5" />{property.views_count || 0} views</span>
          <span className="text-purple-700"><Phone className="inline w-3 h-3 mr-0.5" />{leads} leads</span>
          <span className={cn(score >= 80 ? "text-emerald-700" : score >= 60 ? "text-amber-700" : "text-rose-700")}>Saúde {score}%</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Link href={`/dashboard/editar-imovel/${property.id}`} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-purple-50 border border-purple-100 py-1.5 text-[11px] font-black text-purple-700 active:scale-[0.98]">
            <Pencil className="w-3.5 h-3.5" />Editar
          </Link>
          <button onClick={() => onOpenActions(property)} className="w-9 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center active:scale-90" aria-label={`Mais ações para ${property.titulo}`}>
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CARD: UTILIZADOR NORMAL — foco em gestão pessoal simples
// ═══════════════════════════════════════════════════════════════
function UserPropertyCard({
  property,
  onOpenActions,
}: {
  property: any;
  onOpenActions: (p: TPropertyResponseSchema) => void;
}) {
  const status = getStatusConfig(property.aprovement_status);
  const thumb =
    property.fotos?.[0] ||
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=300&auto=format&fit=crop&q=80';
  const photoCount = property.fotos?.length || 0;
  const propertyData = property as any;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.22 }}
      className={cn(
        "bg-white rounded-[20px] border overflow-hidden shadow-sm active:scale-[0.992] transition-transform",
        property.aprovement_status === 'rejected' ? "border-rose-200/60 opacity-75" : "border-slate-200/80"
      )}
    >
      <div className="relative h-[160px] w-full overflow-hidden bg-slate-100">
        <img
          src={thumb}
          alt={property.titulo}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/65" />
        <span className={cn("absolute top-3 left-3 px-2 py-1 rounded-lg text-[10px] font-black shadow-sm", status.bg, status.text, "border", status.border)}>
          {status.label}
        </span>
        {photoCount > 0 && (
          <span className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/55 text-white text-[10px] font-bold backdrop-blur-sm">
            {photoCount} fotos
          </span>
        )}
        <span className="absolute bottom-3 left-3 text-[18px] font-black text-white drop-shadow-md">
          {formatPriceKz(property.preco, property.tipo_negocio)}
        </span>
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-[14px] font-black text-slate-900 leading-snug line-clamp-2">{property.titulo}</h3>
            <div className="flex items-center gap-1 mt-0.5 text-[10.5px] text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span className="truncate">{property.bairro || property.cidade}, {property.cidade || 'Angola'}</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold shrink-0">{relativeDate(property.created_at)}</span>
        </div>

        <div className="flex items-center gap-2.5 mt-2 pb-2 border-b border-slate-100">
          <span className="text-[10.5px] text-slate-600"><strong className="text-slate-900">{propertyData.quartos || 0}</strong> quartos</span>
          <span className="text-[10.5px] text-slate-600"><strong className="text-slate-900">{propertyData.banheiros || 0}</strong> WCs</span>
          <span className="text-[10.5px] text-slate-600"><strong className="text-slate-900">{propertyData.area_total || 0}</strong> m²</span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-lg">
            <Eye className="w-3 h-3" /> {propertyData.views_count || 0} visualizações
          </span>
          <button onClick={() => onOpenActions(property)} className="w-9 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center active:scale-90" aria-label={`Mais ações para ${propertyData.titulo}`}>
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BOTTOM SHEET DE AÇÕES — AGENTE
// ═══════════════════════════════════════════════════════════════
function AgentActionsSheet({
  isOpen,
  onClose,
  property,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  property: any;
  onDelete?: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!isOpen) { setConfirmDelete(false); setCopied(false); }
  }, [isOpen]);

  if (!property) return null;

  const propertyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/propriedades/${property.slug || property.id}`
    : '';

  const whatsappText = encodeURIComponent(
    `✨ Imóvel em Luanda disponível para ${property.tipo_negocio === 'aluguel' ? 'arrendamento' : 'venda'}:\n*${property.titulo}*\n💰 ${formatPriceKz(property.preco, property.tipo_negocio)}\n📍 ${property.bairro}, ${property.cidade}\n\n🔗 Ver detalhes: ${propertyUrl}`
  );

  const leads = (property as any).leads_count ?? Math.max(1, Math.round((property.views_count || 10) * 0.07));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-[2px] lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[28px] z-[101] max-h-[92vh] flex flex-col lg:hidden mobile-scroll-container safe-area-bottom"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1.5">
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
            </div>

            {/* Header com mini-ficha comercial */}
            <div className="px-5 pb-3 border-b border-slate-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Tipo + role label */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black uppercase">
                      <Building2 className="w-3 h-3" />
                      Gestão Comercial
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 line-clamp-2 leading-snug">
                    {property.titulo}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-black text-purple-700">
                      {formatPriceKz(property.preco, property.tipo_negocio)}
                    </span>
                    <span className="flex items-center gap-1 text-[10.5px] text-emerald-700 font-black">
                      <Phone className="w-3 h-3" /> {leads} leads
                    </span>
                    <span className="flex items-center gap-1 text-[10.5px] text-slate-500 font-bold">
                      <Eye className="w-3 h-3" /> {property.views_count || 0}
                    </span>
                  </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>

            <div className="mobile-scroll-container overflow-y-auto flex-1 p-4 space-y-2">
              {/* Editar anúncio */}
              <Link href={`/dashboard/editar-imovel/${property.id}`} onClick={onClose}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 active:scale-[0.98] transition-transform">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">Editar Anúncio & Fotos</div>
                  <div className="text-[10.5px] text-slate-500 font-medium">Preço, descrição, comodidades e galeria</div>
                </div>
              </Link>

              {/* Impulsionar / Destacar */}
              <button onClick={() => { toast.info('Selecione um plano de destaque para aparecer no topo das buscas de Luanda.'); onClose(); }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-amber-50/80 border border-amber-200/70 active:scale-[0.98] transition-transform text-left">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 fill-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-black text-amber-950">Destacar no Portal KerHome</div>
                  <div className="text-[10.5px] text-amber-700 font-medium">Apareça no topo das pesquisas em Luanda</div>
                </div>
              </button>

              {/* Analytics / Métricas */}
              <button onClick={() => { toast.info('Métricas detalhadas disponíveis no painel Pro.'); onClose(); }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200/60 active:scale-[0.98] transition-transform text-left">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-indigo-950">Ver Métricas de Desempenho</div>
                  <div className="text-[10.5px] text-indigo-700 font-medium">Conversão, tempo de resposta e funil de leads</div>
                </div>
              </button>

              {/* Partilhar WhatsApp — Ficha profissional */}
              <a href={`https://api.whatsapp.com/send?text=${whatsappText}`} target="_blank" rel="noreferrer"
                onClick={onClose}
                className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 active:scale-[0.98] transition-transform">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-emerald-950">Enviar Ficha Comercial no WhatsApp</div>
                  <div className="text-[10.5px] text-emerald-700 font-medium">Partilhar proposta formatada com potenciais clientes</div>
                </div>
              </a>

              {/* Copiar Link */}
              <button onClick={() => {
                navigator.clipboard.writeText(propertyUrl);
                setCopied(true);
                toast.success('Link do anúncio copiado!');
                setTimeout(() => setCopied(false), 2500);
              }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 active:scale-[0.98] transition-transform text-left">
                <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">
                    {copied ? 'Link Copiado!' : 'Copiar Link do Anúncio'}
                  </div>
                  <div className="text-[10.5px] text-slate-500 font-medium">Copiar URL público para partilha directa</div>
                </div>
              </button>

              {/* Pausar */}
              <button onClick={() => {
                toast.success(property.aprovement_status === 'approved' ? 'Anúncio pausado.' : 'Anúncio reativado.');
                onClose();
              }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 active:scale-[0.98] transition-transform text-left">
                <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">
                    {property.aprovement_status === 'approved' ? 'Pausar Anúncio' : 'Reativar Anúncio'}
                  </div>
                  <div className="text-[10.5px] text-slate-500 font-medium">
                    {property.aprovement_status === 'approved' ? 'Ocultar sem apagar dados do anúncio' : 'Voltar a publicar no portal'}
                  </div>
                </div>
              </button>

              {/* Excluir */}
              {!confirmDelete ? (
                <button onClick={() => setConfirmDelete(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-rose-50/70 border border-rose-200/60 active:scale-[0.98] transition-transform text-left">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                    <Trash2 className="w-4 h-4 text-rose-600" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-rose-700">Excluir Anúncio</div>
                    <div className="text-[10.5px] text-rose-500 font-medium">Remover definitivamente da carteira</div>
                  </div>
                </button>
              ) : (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 space-y-2">
                  <p className="text-xs font-black text-rose-900">Confirmar exclusão do anúncio?</p>
                  <p className="text-[10.5px] text-rose-600 font-medium">Esta ação é irreversível e removerá o imóvel da sua carteira.</p>
                  <div className="flex gap-2">
                    <button onClick={() => { onDelete?.(property.id); onClose(); }}
                      className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-black active:scale-95">
                      Sim, Excluir
                    </button>
                    <button onClick={() => setConfirmDelete(false)}
                      className="flex-1 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-xl text-xs font-bold active:scale-95">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════
// BOTTOM SHEET DE AÇÕES — UTILIZADOR NORMAL
// ═══════════════════════════════════════════════════════════════
function UserActionsSheet({
  isOpen,
  onClose,
  property,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  property: any;
  onDelete?: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!isOpen) { setConfirmDelete(false); setCopied(false); }
  }, [isOpen]);

  if (!property) return null;

  const propertyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/propriedades/${property.slug || property.id}`
    : '';
  const whatsappText = encodeURIComponent(
    `Olá! Tenho um imóvel disponível: *${property.titulo}* por ${formatPriceKz(property.preco, property.tipo_negocio)}\n${propertyUrl}`
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-[2px] lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[28px] z-[101] max-h-[85vh] flex flex-col lg:hidden mobile-scroll-container safe-area-bottom"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
          >
            <div className="flex justify-center pt-3 pb-1.5">
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
            </div>

            {/* Header simples */}
            <div className="px-5 pb-3 border-b border-slate-100 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase">
                    <Home className="w-3 h-3" />
                    O Meu Imóvel
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                  {property.titulo}
                </h3>
                <p className="text-sm font-black text-purple-700 mt-0.5">
                  {formatPriceKz(property.preco, property.tipo_negocio)}
                </p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="mobile-scroll-container overflow-y-auto flex-1 p-4 space-y-2">
              {/* Ver detalhes */}
              <Link href={`/propriedades/${property.slug || property.id}`} onClick={onClose}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 active:scale-[0.98] transition-transform">
                <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Ver Anúncio Publicado</div>
                  <div className="text-[10.5px] text-slate-500">Como os outros utilizadores vêem o seu imóvel</div>
                </div>
              </Link>

              {/* Editar */}
              <Link href={`/dashboard/editar-imovel/${property.id}`} onClick={onClose}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 active:scale-[0.98] transition-transform">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Editar Informações</div>
                  <div className="text-[10.5px] text-slate-500">Alterar preço, fotos e descrição</div>
                </div>
              </Link>

              {/* Partilhar */}
              <a href={`https://api.whatsapp.com/send?text=${whatsappText}`} target="_blank" rel="noreferrer"
                onClick={onClose}
                className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 active:scale-[0.98] transition-transform">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-950">Partilhar pelo WhatsApp</div>
                  <div className="text-[10.5px] text-emerald-700">Enviar link do imóvel a amigos ou familiares</div>
                </div>
              </a>

              {/* Copiar link */}
              <button onClick={() => {
                navigator.clipboard.writeText(propertyUrl);
                setCopied(true);
                toast.success('Link copiado!');
                setTimeout(() => setCopied(false), 2500);
              }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 active:scale-[0.98] transition-transform text-left">
                <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{copied ? 'Link Copiado!' : 'Copiar Link'}</div>
                  <div className="text-[10.5px] text-slate-500">Copiar o link público do anúncio</div>
                </div>
              </button>

              {/* Excluir */}
              {!confirmDelete ? (
                <button onClick={() => setConfirmDelete(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-rose-50/70 border border-rose-200/60 active:scale-[0.98] transition-transform text-left">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                    <Trash2 className="w-4 h-4 text-rose-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-rose-700">Remover Anúncio</div>
                    <div className="text-[10.5px] text-rose-500">Apagar definitivamente o imóvel</div>
                  </div>
                </button>
              ) : (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 space-y-2">
                  <p className="text-xs font-bold text-rose-900">Tem a certeza que quer remover este imóvel?</p>
                  <div className="flex gap-2">
                    <button onClick={() => { onDelete?.(property.id); onClose(); }}
                      className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold active:scale-95">
                      Sim, Remover
                    </button>
                    <button onClick={() => setConfirmDelete(false)}
                      className="flex-1 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-xl text-xs font-medium active:scale-95">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Mobile Filter Bottom Sheet (Partilhado) ───
function MobileFilterSheet({
  isOpen, onClose, filterStatus, setFilterStatus, sortBy, setSortBy,
  totalCount, activeCount, pendingCount, rejectedCount, isAgent,
}: {
  isOpen: boolean; onClose: () => void;
  filterStatus: FilterStatus; setFilterStatus: (v: FilterStatus) => void;
  sortBy: SortBy; setSortBy: (v: SortBy) => void;
  totalCount: number; activeCount: number; pendingCount: number; rejectedCount: number;
  isAgent: boolean;
}) {
  const statusOpts = [
    { value: 'all' as FilterStatus, label: 'Todos', count: totalCount, cls: 'text-purple-700 bg-purple-100' },
    { value: 'active' as FilterStatus, label: isAgent ? 'Ativos / Publicados' : 'Ativos', count: activeCount, cls: 'text-emerald-700 bg-emerald-100' },
    { value: 'pending' as FilterStatus, label: 'Em Análise', count: pendingCount, cls: 'text-amber-700 bg-amber-100' },
    { value: 'rejected' as FilterStatus, label: isAgent ? 'Rejeitados / Pausados' : 'Rejeitados', count: rejectedCount, cls: 'text-rose-700 bg-rose-100' },
  ];

  const sortOpts: { value: SortBy; label: string }[] = [
    { value: 'newest', label: 'Mais recentes' },
    { value: 'oldest', label: 'Mais antigos' },
    { value: 'price-high', label: 'Maior preço' },
    { value: 'price-low', label: 'Menor preço' },
    { value: 'views', label: isAgent ? 'Mais visualizados (leads)' : 'Mais visualizados' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-[2px] lg:hidden" onClick={onClose} />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[28px] z-[101] max-h-[85vh] flex flex-col lg:hidden mobile-scroll-container safe-area-bottom"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>

            <div className="flex justify-center pt-3 pb-1.5">
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
            </div>

            <div className="px-5 pb-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900">Filtros & Ordenação</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="mobile-scroll-container flex-1 overflow-y-auto px-5 py-4 space-y-5">
              <div>
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {statusOpts.map(opt => (
                    <button key={opt.value} onClick={() => setFilterStatus(opt.value)}
                      className={cn("flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all",
                        filterStatus === opt.value ? "bg-purple-50 border-purple-300" : "bg-slate-50 border-transparent")}>
                      <span className={cn("text-xs font-black", filterStatus === opt.value ? "text-purple-800" : "text-slate-700")}>{opt.label}</span>
                      <span className={cn("text-[10px] font-black px-1.5 py-0.5 rounded-full", opt.cls)}>{opt.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Ordenar por</p>
                <div className="space-y-1">
                  {sortOpts.map(opt => (
                    <button key={opt.value} onClick={() => setSortBy(opt.value)}
                      className={cn("w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all",
                        sortBy === opt.value ? "bg-purple-50 border border-purple-200" : "hover:bg-slate-50")}>
                      <span className={cn("text-xs", sortBy === opt.value ? "text-purple-900 font-black" : "text-slate-700 font-semibold")}>{opt.label}</span>
                      {sortBy === opt.value && <div className="w-2 h-2 rounded-full bg-purple-600" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 pt-2 border-t border-slate-100">
              <button onClick={onClose}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-orange-500 text-white text-sm font-black rounded-2xl active:scale-[0.98] transition-transform shadow-lg shadow-purple-500/20">
                Aplicar Filtros
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main Component ────────────────────────────────────────────────
export function MinhasPropriedades({ userProperties }: MinePropertiesProps) {
  const { isAgent, hasAgency, hasPlan } = useUserRole();

  const [localProperties, setLocalProperties] = useState<TPropertyResponseSchema[]>(() => {
    return userProperties || [];
  });

  const [isRefreshing, startTransition] = useTransition();
  const queryClient = useQueryClient();

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<TPropertyResponseSchema | null>(null);

  useEffect(() => {
    setLocalProperties(userProperties || []);
  }, [userProperties, isAgent]);

  const handleDelete = useCallback((id: string) => {
    setLocalProperties(prev => prev.filter(p => p.id !== id));
    toast.success('Imóvel removido com sucesso.');
  }, []);

  const { approved, pending, suspended, hasSuspended } = useMemo(() => {
    const list = localProperties;
    return {
      approved: list.filter(p => p.aprovement_status === 'approved'),
      pending: list.filter(p => p.aprovement_status === 'pending'),
      suspended: list.filter((p: any) => p.aprovement_status === 'rejected' || p.rejected_reason === 'suspicious'),
      hasSuspended: list.some((p: any) => p.aprovement_status === 'rejected' || p.rejected_reason === 'suspicious'),
    };
  }, [localProperties]);

  const filtered = useMemo(() => {
    let list = localProperties;
    if (filterStatus === 'active') list = list.filter(p => p.aprovement_status === 'approved');
    else if (filterStatus === 'pending') list = list.filter(p => p.aprovement_status === 'pending');
    else if (filterStatus === 'rejected') list = list.filter((p: any) => p.aprovement_status === 'rejected' || p.rejected_reason === 'suspicious');

    switch (sortBy) {
      case 'newest': return [...list].sort((a, b) => new Date((b as any).created_at || (b as any).createdAt || 0).getTime() - new Date((a as any).created_at || (a as any).createdAt || 0).getTime());
      case 'oldest': return [...list].sort((a, b) => new Date((a as any).created_at || (a as any).createdAt || 0).getTime() - new Date((b as any).created_at || (b as any).createdAt || 0).getTime());
      case 'price-high': return [...list].sort((a, b) => ((b as any).preco ?? (b as any).price ?? 0) - ((a as any).preco ?? (a as any).price ?? 0));
      case 'price-low': return [...list].sort((a, b) => ((a as any).preco ?? (a as any).price ?? 0) - ((b as any).preco ?? (b as any).price ?? 0));
      case 'views': return [...list].sort((a, b) => ((b as any).views_count ?? (b as any).views ?? 0) - ((a as any).views_count ?? (a as any).views ?? 0));
      default: return list;
    }
  }, [localProperties, filterStatus, sortBy]);

  const handleRefresh = useCallback(() => {
    startTransition(async () => {
      try {
        await queryClient.invalidateQueries({ queryKey: ['user-properties'] });
        toast.success('Lista atualizada!');
      } catch {
        toast.error('Erro ao atualizar.');
      }
    });
  }, [queryClient]);

  const totalCount = localProperties.length;

  return (
    <ErrorBoundary>
      <div className="w-full">

        {/* ═══════════ MOBILE LAYOUT ═══════════ */}
        <div className="lg:hidden">

          {/* ─── Subheader Diferenciado por Perfil ─── */}
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-100">

            {/* Row principal: Título + Ações */}
            <div className="px-4 py-2.5 flex items-center justify-between">
              <div>
                <h1 className="text-sm font-black text-slate-900 leading-tight">
                  {isAgent ? 'Carteira de Imóveis' : 'Os Meus Imóveis'}
                </h1>
                <p className="text-[10.5px] font-semibold text-slate-400">
                  {totalCount} {totalCount === 1 ? 'imóvel' : 'imóveis'}
                  {isAgent && approved.length > 0 && ` · ${approved.length} ativos no portal`}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                {!isAgent && (
                  <Link
                    href="/cadastrar-imovel"
                    className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 text-white text-[11px] font-black flex items-center gap-1 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.8]" />
                    <span>Novo Imóvel</span>
                  </Link>
                )}
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center active:scale-95"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5 text-slate-600", isRefreshing && "animate-spin")} />
                </button>
                <button
                  onClick={() => setShowFilter(true)}
                  className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center active:scale-95 relative"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
                  {filterStatus !== 'all' && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-purple-600 rounded-full text-[8px] text-white flex items-center justify-center font-black">•</span>
                  )}
                </button>
              </div>
            </div>

            {/* ─── Chips de Filtro — Agente vs Utilizador ─── */}
            <div className="px-4 pb-2.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {(isAgent
                ? [
                    { value: 'all' as FilterStatus, label: 'Todos', count: totalCount },
                    { value: 'active' as FilterStatus, label: 'Publicados', count: approved.length },
                    { value: 'pending' as FilterStatus, label: 'Em Moderação', count: pending.length },
                    { value: 'rejected' as FilterStatus, label: 'Pausados', count: suspended.length },
                  ]
                : [
                    { value: 'all' as FilterStatus, label: 'Todos', count: totalCount },
                    { value: 'active' as FilterStatus, label: 'Ativos', count: approved.length },
                    { value: 'pending' as FilterStatus, label: 'Em análise', count: pending.length },
                    { value: 'rejected' as FilterStatus, label: 'Rejeitados', count: suspended.length },
                  ]
              ).map(chip => (
                <button
                  key={chip.value}
                  onClick={() => setFilterStatus(chip.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 active:scale-95",
                    filterStatus === chip.value
                      ? "bg-purple-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {chip.label}
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-lg text-[9.5px] font-black leading-none",
                    filterStatus === chip.value ? "bg-white/20 text-white" : "bg-white text-slate-500"
                  )}>
                    {chip.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ─── Banner de Aviso (Agente vs Utilizador) ─── */}
          {hasSuspended && (
            <div className={cn(
              "mx-4 mt-3 p-3 rounded-2xl flex items-start gap-2.5",
              isAgent
                ? "bg-rose-50 border border-rose-200"
                : "bg-amber-50 border border-amber-200"
            )}>
              <ShieldAlert className={cn("w-4 h-4 shrink-0 mt-0.5", isAgent ? "text-rose-600" : "text-amber-600")} />
              <div>
                <h4 className={cn("font-black text-xs", isAgent ? "text-rose-900" : "text-amber-900")}>
                  {isAgent ? 'Anúncios com Problema Detectado' : 'Imóvel a Necessitar de Atenção'}
                </h4>
                <p className={cn("text-[11px] font-medium leading-tight mt-0.5", isAgent ? "text-rose-700" : "text-amber-700")}>
                  {isAgent
                    ? 'Reveja os anúncios rejeitados para manter a saúde da sua carteira e evitar perda de leads.'
                    : 'O seu anúncio pode ter informações em falta. Edite-o para ativar a publicação.'}
                </p>
              </div>
            </div>
          )}

          {/* ─── Feed de Imóveis: Compacto de Alta Densidade ─── */}
          <div className="p-3.5 space-y-2.5 pb-28">
            {filtered.length === 0 ? (
              <div className="py-14 text-center">
                <EmptyState
                  message={isAgent
                    ? 'Nenhum anúncio encontrado para este filtro na sua carteira.'
                    : 'Nenhum imóvel encontrado. Tente mudar o filtro.'}
                  icon={TrendingUp}
                />
                <button
                  onClick={() => setFilterStatus('all')}
                  className="mt-3 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-xs font-black"
                >
                  Ver todos
                </button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filtered.map(property =>
                  isAgent ? (
                    <AgentPropertyCard
                      key={property.id}
                      property={property}
                      onOpenActions={setSelectedProperty}
                    />
                  ) : (
                    <UserPropertyCard
                      key={property.id}
                      property={property}
                      onOpenActions={setSelectedProperty}
                    />
                  )
                )}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* ═══════════ DESKTOP LAYOUT (Kanban Original Preservado) ═══════════ */}
        <div className="hidden lg:block">
          <SectionHeader
            title="Minhas Propriedades"
            icon={TrendingUp}
            description={isAgent ? "Gerencie sua carteira de anúncios por status." : "Gerencie seus imóveis por status."}
            className="mb-8 px-2"
          >
            <div className="flex items-center gap-3">
              <Link
                href="/cadastrar-imovel"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-xl text-xs font-black shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Imóvel</span>
              </Link>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-border text-gray-600 rounded-button hover:bg-gray-50 transition-all disabled:opacity-50 shadow-card text-sm font-medium"
              >
                <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                {isRefreshing ? 'Atualizando...' : 'Atualizar'}
              </button>
            </div>
          </SectionHeader>

          {hasSuspended && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 bg-red-50 border border-red-100 rounded-card p-4 flex items-start gap-3 shadow-card">
              <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-red-800 font-semibold text-base mb-1">Impulsionamento Suspenso</h4>
                <p className="text-red-700 text-xs">Verifique as propriedades suspensas para regularizar.</p>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {localProperties.length === 0 ? (
              <EmptyState message="Nenhum imóvel cadastrado ainda." icon={TrendingUp} />
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10">
                <KanbanColumn title="Em Análise & Pendentes" count={pending.length + suspended.length} color="orange" icon={AlertTriangle}>
                  <AnimatePresence mode="popLayout">
                    {[...pending, ...suspended].map(property => {
                      if (!property?.id) return null;
                      return (
                        <motion.div key={property.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                          {property.aprovement_status === 'pending'
                            ? <PendingPropertyCard property={property} onDelete={() => handleDelete(property.id)} />
                            : <RejectedPropertyCard property={property} onDelete={() => handleDelete(property.id)} />}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {pending.length === 0 && suspended.length === 0 && (
                    <div className="p-12 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                      <p className="text-gray-400 text-sm">Tudo em dia aqui</p>
                    </div>
                  )}
                </KanbanColumn>

                <KanbanColumn title="Publicados" count={approved.length} color="purple" icon={CheckCircle2}>
                  <AnimatePresence mode="popLayout">
                    {approved.map(property => {
                      if (!property?.id) return null;
                      return (
                        <motion.div key={property.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                          <div className="relative">
                            <PropertyCard property={property} canBoost={suspended.length <= 1} onDelete={() => handleDelete(property.id)} />
                            <div className="absolute top-3 right-3">
                              <PropertyHealthScore propertyId={property.id} />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {approved.length === 0 && (
                    <div className="p-12 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                      <p className="text-gray-400 text-sm">Nenhum imóvel publicado</p>
                    </div>
                  )}
                </KanbanColumn>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══════════ BOTTOM SHEETS ═══════════ */}
        {isAgent ? (
          <AgentActionsSheet
            isOpen={!!selectedProperty}
            onClose={() => setSelectedProperty(null)}
            property={selectedProperty}
            onDelete={handleDelete}
          />
        ) : (
          <UserActionsSheet
            isOpen={!!selectedProperty}
            onClose={() => setSelectedProperty(null)}
            property={selectedProperty}
            onDelete={handleDelete}
          />
        )}

        <MobileFilterSheet
          isOpen={showFilter}
          onClose={() => setShowFilter(false)}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          sortBy={sortBy}
          setSortBy={setSortBy}
          totalCount={totalCount}
          activeCount={approved.length}
          pendingCount={pending.length}
          rejectedCount={suspended.length}
          isAgent={isAgent}
        />
      </div>
    </ErrorBoundary>
  );
}
