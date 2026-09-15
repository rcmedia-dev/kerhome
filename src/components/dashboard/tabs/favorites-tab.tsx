'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Heart,
  MapPin,
  Building2,
  Calendar,
  MessageCircle,
  ExternalLink,
  ArrowUpDown,
  X,
  Share2,
  Bed,
  Bath,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';

import { PropertyFavoritedCard } from '@/components/property-favorite-card';
import LoadingState from '@/app/propriedades/components/loading-state';
import { TPropertyResponseSchema } from '@/lib/types/property';
import { useUserStore } from '@/lib/store/user-store';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import {
  SectionHeader,
  EmptyState,
  AnimatedGrid,
  ErrorBoundary
} from '@/components/dashboard/shared-ui';

// ─── Tipo Normalizado para Favoritos ──────────────────────────────────────────
type FavoritePropertyItem = {
  id: string;
  propertyid: string;
  title: string;
  tipo: string;
  status: string; // 'comprar', 'para comprar', 'alugar', 'para alugar'
  price: number | string | null;
  endereco: string;
  bairro?: string | null;
  cidade?: string | null;
  bedrooms: number;
  bathrooms: number;
  garagens: number;
  size: string;
  image: string | null;
  gallery?: string[];
  agent_phone?: string;
  isMock?: boolean;
};

// ─── Dados Mockados Realistas de Luanda (Angola) para Pré-visualização ────────
const MOCK_FAVORITES: FavoritePropertyItem[] = [
  {
    id: 'fav-mock-01',
    propertyid: 'prop-talatona-01',
    title: 'Apartamento T3 Vista Mar - Talatona',
    tipo: 'Apartamento',
    status: 'comprar',
    price: 180000000,
    endereco: 'Condomínio Dolce Vita, Talatona, Luanda',
    bairro: 'Talatona',
    cidade: 'Luanda',
    bedrooms: 3,
    bathrooms: 2,
    garagens: 2,
    size: '185 m²',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=500&q=80',
    agent_phone: '+244923456789',
    isMock: true
  },
  {
    id: 'fav-mock-02',
    propertyid: 'prop-kilamba-02',
    title: 'Vivenda V4 com Piscina Privativa - Kilamba',
    tipo: 'Vivenda',
    status: 'comprar',
    price: 95000000,
    endereco: 'Quarteirão F, Centralidade do Kilamba',
    bairro: 'Kilamba',
    cidade: 'Luanda',
    bedrooms: 4,
    bathrooms: 3,
    garagens: 3,
    size: '260 m²',
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=500&q=80',
    agent_phone: '+244931888222',
    isMock: true
  },
  {
    id: 'fav-mock-03',
    propertyid: 'prop-ingombota-03',
    title: 'Escritório Comercial 120m² - Ingombota',
    tipo: 'Comercial',
    status: 'alugar',
    price: 2500000,
    endereco: 'Torres Kianda, Av. 4 de Fevereiro, Luanda',
    bairro: 'Ingombota',
    cidade: 'Luanda',
    bedrooms: 1,
    bathrooms: 2,
    garagens: 2,
    size: '120 m²',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=500&q=80',
    agent_phone: '+244944111333',
    isMock: true
  },
  {
    id: 'fav-mock-04',
    propertyid: 'prop-miramar-04',
    title: 'Cobertura Duplex T4 Luxo - Miramar',
    tipo: 'Apartamento',
    status: 'comprar',
    price: 340000000,
    endereco: 'Bairro Miramar, Luanda Centro',
    bairro: 'Miramar',
    cidade: 'Luanda',
    bedrooms: 4,
    bathrooms: 4,
    garagens: 3,
    size: '320 m²',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=500&q=80',
    agent_phone: '+244912777999',
    isMock: true
  },
  {
    id: 'fav-mock-05',
    propertyid: 'prop-camama-05',
    title: 'Vivenda V3 em Condomínio Fechado - Camama',
    tipo: 'Vivenda',
    status: 'comprar',
    price: 70000000,
    endereco: 'Condomínio Jardim de Rosas, Camama',
    bairro: 'Camama',
    cidade: 'Luanda',
    bedrooms: 3,
    bathrooms: 2,
    garagens: 2,
    size: '170 m²',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=80',
    agent_phone: '+244925333444',
    isMock: true
  }
];

// ─── Formatador de Moeda em Kwanza ───────────────────────────────────────────
function formatKwanzaPrice(price: number | string | null, status: string): string {
  if (price === null || price === undefined || price === '') return 'Sob consulta';
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return String(price);

  const formatted = num.toLocaleString('pt-AO');
  const isRent = status === 'alugar' || status === 'para alugar';
  return isRent ? `${formatted} Kz/mês` : `${formatted} Kz`;
}

// ─── Componente Bottom Sheet de Ação Rápida no Mobile ────────────────────────
function FavoriteActionSheet({
  open,
  onClose,
  property,
  onRemove,
  isAgent
}: {
  open: boolean;
  onClose: () => void;
  property: FavoritePropertyItem | null;
  onRemove: (id: string) => void;
  isAgent: boolean;
}) {
  if (!property) return null;

  const isRent = property.status === 'alugar' || property.status === 'para alugar';
  const cleanPhone = (property.agent_phone || '244923456789').replace(/\D/g, '');

  const handleShare = () => {
    const text = `Confira este imóvel no KerHome: ${property.title} por ${formatKwanzaPrice(property.price, property.status)}`;
    if (navigator.share) {
      navigator.share({ title: property.title, text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado para a área de transferência');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop Blur */}
          <motion.div
            key="fav-sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Sliding Panel */}
          <motion.div
            key="fav-sheet-panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-[101] bg-white rounded-t-[32px] shadow-2xl overflow-hidden max-h-[88vh] flex flex-col"
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-11 h-1.5 rounded-full bg-slate-300" />
            </div>

            <div className="overflow-y-auto px-5 pb-8 pt-2 space-y-4">
              {/* Header do Sheet */}
              <div className="flex items-start justify-between">
                <div>
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                    isRent ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                  )}>
                    {isRent ? 'Para Arrendar' : 'À Venda'}
                  </span>
                  <h2 className="text-base font-black text-slate-900 mt-1.5 leading-tight">
                    {property.title}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Imagem em Destaque */}
              {property.image && (
                <div className="relative w-full h-40 rounded-2xl overflow-hidden shadow-inner border border-slate-100">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2.5 left-2.5 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-sm font-black text-white">
                    {formatKwanzaPrice(property.price, property.status)}
                  </div>
                </div>
              )}

              {/* Ficha com Especificações */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-200/70 p-3 rounded-2xl text-center">
                <div className="p-2">
                  <Bed className="w-4 h-4 mx-auto text-purple-700 mb-1" />
                  <span className="block text-xs font-black text-slate-800">{property.bedrooms} Qts</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Quartos</span>
                </div>
                <div className="p-2 border-x border-slate-200/60">
                  <Bath className="w-4 h-4 mx-auto text-purple-700 mb-1" />
                  <span className="block text-xs font-black text-slate-800">{property.bathrooms} WC</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Banheiros</span>
                </div>
                <div className="p-2">
                  <Maximize2 className="w-4 h-4 mx-auto text-purple-700 mb-1" />
                  <span className="block text-xs font-black text-slate-800">{property.size || '--'}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Área Útil</span>
                </div>
              </div>

              {/* Endereço */}
              <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200/70 rounded-2xl text-xs text-slate-600">
                <MapPin className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <span className="font-semibold">{property.endereco}</span>
              </div>

              {/* Botões de Ação Imediata */}
              <div className="space-y-2.5 pt-1">
                {!isAgent && (
                  <Link
                    href="/dashboard?tab=visits"
                    onClick={onClose}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-700 to-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-700/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Agendar Visita Neste Imóvel
                  </Link>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/${cleanPhone}?text=Ol%C3%A1,%20tenho%20interesse%20no%20im%C3%B3vel%20${encodeURIComponent(property.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/15 active:scale-[0.98] transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {isAgent ? 'Contactar anunciante' : 'WhatsApp'}
                  </a>

                  {/* Ver Página Completa */}
                  <Link
                    href={`/propriedades/${property.propertyid || property.id}`}
                    onClick={onClose}
                    className="flex items-center justify-center gap-1.5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold active:scale-[0.98] transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver Detalhes
                  </Link>
                </div>

                {/* Compartilhar e Remover */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 px-1">
                  <button
                    onClick={handleShare}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    {isAgent ? 'Partilhar imóvel' : 'Compartilhar'}
                  </button>

                  <button
                    onClick={() => {
                      onRemove(property.id);
                      onClose();
                    }}
                    className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1.5"
                  >
                    <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                    Remover dos Guardados
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Componente Principal ───────────────────────────────────────────────────
type FavoritasProps = {
  userFavoriteProperties: TPropertyResponseSchema[] | null;
};

export function Favoritas({ userFavoriteProperties }: FavoritasProps) {
  const { user } = useUserStore();
  const supabase = createClient();
  const isAgent = ['agente', 'agent', 'corretor', 'profissional'].includes(user?.role?.toLowerCase() || '');

  // Converte e normaliza dados reais recebidos da prop
  const initialFavorites = useMemo<FavoritePropertyItem[]>(() => {
    if (!userFavoriteProperties || userFavoriteProperties.length === 0) {
      return MOCK_FAVORITES;
    }
    return userFavoriteProperties.map(p => ({
      id: p.id,
      propertyid: p.propertyid || p.id,
      title: p.title,
      tipo: p.tipo,
      status: p.status,
      price: p.price,
      endereco: p.endereco,
      bairro: p.bairro,
      cidade: p.cidade,
      bedrooms: p.bedrooms ?? 0,
      bathrooms: p.bathrooms ?? 0,
      garagens: p.garagens ?? 0,
      size: p.size ?? '',
      image: (typeof p.image === 'string' ? p.image : null) || (Array.isArray(p.gallery) && p.gallery[0] ? String(p.gallery[0]) : null),
      gallery: Array.isArray(p.gallery) ? p.gallery.map(String) : [],
      isMock: false
    }));
  }, [userFavoriteProperties]);

  // Estado local com suporte a remoções imediatas
  const [favorites, setFavorites] = useState<FavoritePropertyItem[]>(initialFavorites);

  // Sincroniza se a prop mudar
  React.useEffect(() => {
    setFavorites(initialFavorites);
  }, [initialFavorites]);

  // Variação 2 Mobile: Filtros táteis por categoria
  const [activeFilter, setActiveFilter] = useState<'all' | 'venda' | 'alugar' | 'talatona' | 'kilamba'>('all');

  // Variação 2 Mobile: Ordenação rápida
  const [sortBy, setSortBy] = useState<'recent' | 'price-asc' | 'price-desc'>('recent');

  // Bottom Sheet de Ações Rápidas
  const [sheetProperty, setSheetProperty] = useState<FavoritePropertyItem | null>(null);

  // ─── Remoção com suporte tanto a Mocks quanto a Dados Reais ──────────────
  const handleRemoveFavorite = useCallback(async (propertyId: string) => {
    const propToRemove = favorites.find(f => f.id === propertyId);

    // Se for mock, apenas remove do estado local
    if (propToRemove?.isMock || propertyId.startsWith('fav-mock-')) {
      setFavorites(prev => prev.filter(f => f.id !== propertyId));
      toast.success('Imóvel removido da sua lista');
      return;
    }

    // Se for registro real da base de dados Supabase
    try {
      if (user) {
        const { error } = await supabase
          .from('favoritos')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', propertyId);

        if (error) throw error;
      }
      setFavorites(prev => prev.filter(f => f.id !== propertyId));
      toast.success('Imóvel removido dos favoritos');
    } catch (err) {
      toast.error('Erro ao remover dos favoritos');
    }
  }, [favorites, user, supabase]);

  // ─── Contadores para os Chips Táteis ──────────────────────────────────────
  const counts = useMemo(() => {
    return {
      all: favorites.length,
      venda: favorites.filter(p => p.status === 'comprar' || p.status === 'para comprar').length,
      alugar: favorites.filter(p => p.status === 'alugar' || p.status === 'para alugar').length,
      talatona: favorites.filter(p => (p.endereco || '').toLowerCase().includes('talatona') || (p.bairro || '').toLowerCase().includes('talatona')).length,
      kilamba: favorites.filter(p => (p.endereco || '').toLowerCase().includes('kilamba') || (p.bairro || '').toLowerCase().includes('kilamba')).length,
    };
  }, [favorites]);

  // ─── Filtragem e Ordenação dos Favoritos ──────────────────────────────────
  const filteredAndSortedFavorites = useMemo(() => {
    let list = [...favorites];

    // Filtros por Categoria
    if (activeFilter === 'venda') {
      list = list.filter(p => p.status === 'comprar' || p.status === 'para comprar');
    } else if (activeFilter === 'alugar') {
      list = list.filter(p => p.status === 'alugar' || p.status === 'para alugar');
    } else if (activeFilter === 'talatona') {
      list = list.filter(p => (p.endereco || '').toLowerCase().includes('talatona') || (p.bairro || '').toLowerCase().includes('talatona'));
    } else if (activeFilter === 'kilamba') {
      list = list.filter(p => (p.endereco || '').toLowerCase().includes('kilamba') || (p.bairro || '').toLowerCase().includes('kilamba'));
    }

    // Ordenação
    if (sortBy === 'price-asc') {
      list.sort((a, b) => {
        const priceA = typeof a.price === 'number' ? a.price : parseFloat(String(a.price || 0));
        const priceB = typeof b.price === 'number' ? b.price : parseFloat(String(b.price || 0));
        return priceA - priceB;
      });
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => {
        const priceA = typeof a.price === 'number' ? a.price : parseFloat(String(a.price || 0));
        const priceB = typeof b.price === 'number' ? b.price : parseFloat(String(b.price || 0));
        return priceB - priceA;
      });
    }

    return list;
  }, [favorites, activeFilter, sortBy]);

  const hasFavorites = favorites.length > 0;

  return (
    <ErrorBoundary>
      <div className="w-full min-w-0">
        {/* ─── Header Geral ─────────────────────────────────────── */}
        <SectionHeader
          title="Imóveis Guardados"
          icon={Heart}
          description={isAgent
            ? `${favorites.length} imóveis guardados para análise`
            : `${favorites.length} propriedades salvas na sua lista de desejos`}
          className="mb-4 sm:mb-8 px-1 sm:px-2"
        />

        {!hasFavorites ? (
          <EmptyState message="Nenhum imóvel guardado ainda." icon={Heart} />
        ) : (
          <>
            {/* ═════════════════════════════════════════════════════════════════
                MOBILE — VARIAÇÃO 2: LISTA COMPACTA DE ALTA DENSIDADE COM CHIPS
            ═════════════════════════════════════════════════════════════════ */}
            <div className="block md:hidden">
              {/* Barra de Filtros Táteis em Carrossel Horizontal */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5",
                    activeFilter === 'all'
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  Todos
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-lg font-extrabold",
                    activeFilter === 'all' ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600"
                  )}>
                    {counts.all}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter('venda')}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5",
                    activeFilter === 'venda'
                      ? "bg-emerald-700 text-white shadow-sm shadow-emerald-700/20"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  À Venda
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-lg font-extrabold",
                    activeFilter === 'venda' ? "bg-emerald-800 text-emerald-100" : "bg-emerald-50 text-emerald-700"
                  )}>
                    {counts.venda}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter('alugar')}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5",
                    activeFilter === 'alugar'
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  Para Arrendar
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-lg font-extrabold",
                    activeFilter === 'alugar' ? "bg-blue-700 text-blue-100" : "bg-blue-50 text-blue-700"
                  )}>
                    {counts.alugar}
                  </span>
                </button>

                {counts.talatona > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveFilter('talatona')}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5",
                      activeFilter === 'talatona'
                        ? "bg-purple-700 text-white shadow-sm shadow-purple-700/20"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    Talatona
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-lg font-extrabold",
                      activeFilter === 'talatona' ? "bg-purple-800 text-purple-100" : "bg-purple-50 text-purple-700"
                    )}>
                      {counts.talatona}
                    </span>
                  </button>
                )}

                {counts.kilamba > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveFilter('kilamba')}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5",
                      activeFilter === 'kilamba'
                        ? "bg-purple-700 text-white shadow-sm shadow-purple-700/20"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    Kilamba
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-lg font-extrabold",
                      activeFilter === 'kilamba' ? "bg-purple-800 text-purple-100" : "bg-purple-50 text-purple-700"
                    )}>
                      {counts.kilamba}
                    </span>
                  </button>
                )}
              </div>

              {/* Barra de Resumo e Seletor de Ordenação */}
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-slate-500">
                  {filteredAndSortedFavorites.length} {filteredAndSortedFavorites.length === 1 ? 'imóvel guardado' : 'imóveis guardados'}
                </span>

                {/* Alternador Rápido de Ordenação */}
                <button
                  type="button"
                  onClick={() => {
                    if (sortBy === 'recent') setSortBy('price-asc');
                    else if (sortBy === 'price-asc') setSortBy('price-desc');
                    else setSortBy('recent');
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 active:scale-95 transition-all shadow-2xs"
                >
                  <ArrowUpDown className="w-3 h-3 text-purple-700" />
                  <span>
                    {sortBy === 'recent' && 'Mais Recentes'}
                    {sortBy === 'price-asc' && 'Menor Preço'}
                    {sortBy === 'price-desc' && 'Maior Preço'}
                  </span>
                </button>
              </div>

              {/* Lista de Linhas Compactas (Row Cards) */}
              <AnimatePresence mode="popLayout">
                {filteredAndSortedFavorites.length === 0 ? (
                  <div className="py-12 px-4 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs text-slate-400 font-bold">Nenhum imóvel nesta categoria.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredAndSortedFavorites.map((p) => {
                      const isRent = p.status === 'alugar' || p.status === 'para alugar';
                      return (
                        <motion.div
                          key={p.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          onClick={() => setSheetProperty(p)}
                          className="bg-white rounded-2xl border border-slate-200/80 p-2.5 shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex gap-3 items-center cursor-pointer relative"
                        >
                          {/* Miniatura 84x84 com Fallback */}
                          <div className="relative w-[84px] h-[84px] rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-100">
                            {p.image ? (
                              <img
                                src={p.image}
                                alt={p.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-purple-50 text-purple-600">
                                <Building2 className="w-6 h-6 opacity-60" />
                              </div>
                            )}

                            {/* Badge Mini de Status */}
                            <span className={cn(
                              "absolute top-1.5 left-1.5 px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase tracking-wider text-white shadow-xs",
                              isRent ? "bg-blue-600/90" : "bg-emerald-600/90"
                            )}>
                              {isRent ? 'Arrendar' : 'Venda'}
                            </span>
                          </div>

                          {/* Metadados do Imóvel */}
                          <div className="flex-1 min-w-0 pr-1">
                            <h3 className="font-extrabold text-[13px] text-slate-900 leading-snug line-clamp-1">
                              {p.title}
                            </h3>

                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              {p.endereco}
                            </p>

                            <div className="mt-1 flex items-baseline justify-between gap-1">
                              <span className="font-black text-sm text-orange-600 tracking-tight">
                                {formatKwanzaPrice(p.price, p.status)}
                              </span>
                            </div>

                            {/* Especificações Compactas */}
                            <div className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1.5">
                              {p.bedrooms > 0 && <span>{p.bedrooms} Qts</span>}
                              {p.bathrooms > 0 && <span>· {p.bathrooms} WC</span>}
                              {p.size && <span>· {p.size}</span>}
                            </div>
                          </div>

                          {/* Botão de Desfavoritar Rápido com 1 Toque */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFavorite(p.id);
                            }}
                            className="w-8 h-8 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center shrink-0 active:scale-90 transition-all shadow-2xs"
                            title="Remover dos guardados"
                          >
                            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* ═════════════════════════════════════════════════════════════════
                DESKTOP — GRADE ORIGINAL PRESERVADA (ANIMATED GRID)
            ═════════════════════════════════════════════════════════════════ */}
            <div className="hidden md:block">
              <AnimatedGrid>
                <AnimatePresence mode="popLayout">
                  {favorites.map((property, index) => (
                    <motion.div
                      key={property.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <PropertyFavoritedCard
                        property={{
                          id: property.id,
                          propertyid: property.propertyid || property.id,
                          title: property.title,
                          description: '',
                          tipo: property.tipo,
                          status: property.status,
                          price: property.price != null ? String(property.price) : null,
                          endereco: property.endereco,
                          bedrooms: property.bedrooms ?? 0,
                          bathrooms: property.bathrooms ?? 0,
                          garagens: property.garagens ?? 0,
                          size: property.size ?? '',
                          gallery: property.gallery || (property.image ? [property.image] : [])
                        }}
                        onRemove={() => handleRemoveFavorite(property.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </AnimatedGrid>
            </div>
          </>
        )}

        {/* ─── Bottom Sheet Modal de Ações no Mobile ─────────────── */}
        <FavoriteActionSheet
          open={!!sheetProperty}
          onClose={() => setSheetProperty(null)}
          property={sheetProperty}
          onRemove={handleRemoveFavorite}
          isAgent={isAgent}
        />
      </div>
    </ErrorBoundary>
  );
}
