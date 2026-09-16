'use client';

import {
    Home,
    Heart,
    MessageCircle,
    Activity,
    Calendar,
    BarChart3,
    Settings,
    Store,
    X,
    LogOut,
    ArrowLeft,
    Plus,
    ChevronRight,
    Star,
    Sparkles,
    ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/lib/store/user-store';
import { useChatStore } from '@/lib/store/chat-store';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import Link from 'next/link';

interface MobileNavbarProps {
    activeTab: string;
    setActiveTab: (id: string) => void;
    userAgency?: any;
    displayName?: string;
    avatarUrl?: string | null;
    planName?: string;
    propertyCount?: number;
    favoriteCount?: number;
    invoiceCount?: number;
    visitCount?: number;
    isAgent?: boolean;
    planLimit?: number;
    planRemaining?: number;
    showSidebar?: boolean;
    onOpenSidebar?: () => void;
    onCloseSidebar?: () => void;
}

export function MobileNavbar({
    activeTab,
    setActiveTab,
    userAgency,
    displayName = 'Usuário',
    avatarUrl,
    planName = 'Free',
    propertyCount = 0,
    favoriteCount = 0,
    invoiceCount = 0,
    visitCount = 0,
    isAgent = false,
    planLimit = 10,
    planRemaining = 0,
    showSidebar: externalShowSidebar,
    onOpenSidebar,
    onCloseSidebar
}: MobileNavbarProps) {
    const [internalShowSidebar, setInternalShowSidebar] = useState(false);
    const showSidebar = externalShowSidebar ?? internalShowSidebar;
    const setShowSidebar = (v: boolean) => {
        if (v) onOpenSidebar?.();
        else onCloseSidebar?.();
        setInternalShowSidebar(v);
    };
    const supabase = createClient();
    const { totalUnreadCount } = useChatStore();

    const handleLogout = async () => {
        try {
            const store = useUserStore.getState();
            if (typeof store.signOut === 'function') {
                await store.signOut();
            } else {
                await supabase.auth.signOut();
            }
            toast.success('Sessão encerrada com sucesso');
            window.location.replace('/');
        } catch (error) {
            console.error('Error during logout:', error);
            toast.error('Erro ao encerrar a sessão');
            window.location.replace('/');
        }
    };

    // Abas principais do Floating Dock
    const dockTabs = [
        { id: 'properties', label: 'Imóveis', icon: Home, badge: propertyCount > 0 ? propertyCount : undefined },
        { id: 'favorites', label: 'Salvos', icon: Heart, badge: favoriteCount > 0 ? favoriteCount : undefined },
        // Botão central FAB (Adicionar/Criar) inserido entre as abas
        { id: 'messages', label: 'Chat', icon: MessageCircle, badge: !isAgent && totalUnreadCount > 0 ? totalUnreadCount : undefined },
        { id: 'visits', label: 'Visitas', icon: Calendar, badge: visitCount > 0 ? visitCount : undefined }
    ];

    // Cálculo da porcentagem de cota usada
    const publishedCount = Math.max(0, propertyCount);
    const maxLimit = Math.max(1, planLimit);
    const quotaPercentage = Math.min(100, Math.round((publishedCount / maxLimit) * 100));

    return (
        <>
            {/* ═════════════════════════════════════════════════════════════════
                NAVBAR — FLOATING DOCK ARREDONDADO (VARIAÇÃO 1: FINTECH DOCK)
            ═════════════════════════════════════════════════════════════════ */}
            <nav
                className="lg:hidden fixed bottom-3 left-3 right-3 z-50 bg-white/95 backdrop-blur-2xl rounded-[26px] border border-slate-200/90 shadow-[0_12px_32px_-6px_rgba(0,0,0,0.15)] flex items-center justify-around px-2 pt-1 select-none safe-area-bottom"
            >
                {/* Aba 1: Imóveis */}
                <button
                    onClick={() => { setActiveTab('properties'); setShowSidebar(false); }}
                    className="flex-1 flex flex-col items-center justify-center py-1.5 transition-transform active:scale-90 outline-none group"
                    aria-label="Imóveis"
                >
                    <div className={cn(
                        'w-10 h-7 rounded-full flex items-center justify-center transition-all duration-200 relative',
                        activeTab === 'properties' && !showSidebar
                            ? 'bg-purple-100 text-purple-700 shadow-2xs'
                            : 'text-slate-400 group-hover:text-slate-600'
                    )}>
                        <Home className="w-4.5 h-4.5" />
                    </div>
                    <span className={cn(
                        'text-[9.5px] font-bold mt-0.5 leading-none transition-colors',
                        activeTab === 'properties' && !showSidebar ? 'text-purple-700 font-extrabold' : 'text-slate-400'
                    )}>
                        Imóveis
                    </span>
                </button>

                {/* Aba 2: Favoritos */}
                <button
                    onClick={() => { setActiveTab('favorites'); setShowSidebar(false); }}
                    className="flex-1 flex flex-col items-center justify-center py-1.5 transition-transform active:scale-90 outline-none relative group"
                    aria-label="Salvos"
                >
                    <div className={cn(
                        'w-10 h-7 rounded-full flex items-center justify-center transition-all duration-200 relative',
                        activeTab === 'favorites' && !showSidebar
                            ? 'bg-purple-100 text-purple-700 shadow-2xs'
                            : 'text-slate-400 group-hover:text-slate-600'
                    )}>
                        <Heart className="w-4.5 h-4.5" />
                        {favoriteCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                        )}
                    </div>
                    <span className={cn(
                        'text-[9.5px] font-bold mt-0.5 leading-none transition-colors',
                        activeTab === 'favorites' && !showSidebar ? 'text-purple-700 font-extrabold' : 'text-slate-400'
                    )}>
                        Salvos
                    </span>
                </button>

                {/* BOTÃO CENTRAL ELEVADO (+ NOVO IMÓVEL) */}
                <Link
                    href="/dashboard/cadastrar-imovel"
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 via-purple-700 to-orange-500 text-white shadow-lg shadow-purple-600/35 -translate-y-3 flex items-center justify-center active:scale-90 transition-transform outline-none shrink-0"
                    title="Novo Imóvel"
                    aria-label="Cadastrar Novo Imóvel"
                    onClick={() => setShowSidebar(false)}
                >
                    <Plus className="w-6 h-6 stroke-[2.8]" />
                </Link>

                {/* Aba 3: Chat com Leads */}
                <button
                    onClick={() => { setActiveTab('messages'); setShowSidebar(false); }}
                    className="flex-1 flex flex-col items-center justify-center py-1.5 transition-transform active:scale-90 outline-none relative group"
                    aria-label="Chat"
                >
                    <div className={cn(
                        'w-10 h-7 rounded-full flex items-center justify-center transition-all duration-200 relative',
                        activeTab === 'messages' && !showSidebar
                            ? 'bg-purple-100 text-purple-700 shadow-2xs'
                            : 'text-slate-400 group-hover:text-slate-600'
                    )}>
                        <MessageCircle className="w-4.5 h-4.5" />
                        {!isAgent && totalUnreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full ring-2 ring-white">
                                {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                            </span>
                        )}
                    </div>
                    <span className={cn(
                        'text-[9.5px] font-bold mt-0.5 leading-none transition-colors',
                        activeTab === 'messages' && !showSidebar ? 'text-purple-700 font-extrabold' : 'text-slate-400'
                    )}>
                        Chat
                    </span>
                </button>

                {/* Aba 4: Visitas */}
                <button
                    onClick={() => { setActiveTab('visits'); setShowSidebar(false); }}
                    className="flex-1 flex flex-col items-center justify-center py-1.5 transition-transform active:scale-90 outline-none group"
                    aria-label="Visitas"
                >
                    <div className={cn(
                        'w-10 h-7 rounded-full flex items-center justify-center transition-all duration-200 relative',
                        activeTab === 'visits' && !showSidebar
                            ? 'bg-purple-100 text-purple-700 shadow-2xs'
                            : 'text-slate-400 group-hover:text-slate-600'
                    )}>
                        <Calendar className="w-4.5 h-4.5" />
                        {visitCount > 0 && (
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full ring-2 ring-white">
                                {visitCount > 9 ? '9+' : visitCount}
                            </span>
                        )}
                    </div>
                    <span className={cn(
                        'text-[9.5px] font-bold mt-0.5 leading-none transition-colors',
                        activeTab === 'visits' && !showSidebar ? 'text-purple-700 font-extrabold' : 'text-slate-400'
                    )}>
                        Visitas
                    </span>
                </button>
            </nav>

            {/* ═════════════════════════════════════════════════════════════════
                SIDEBAR — DRAWER MODERNO COM CARD EXECUTIVO E COTA (VARIAÇÃO 1)
            ═════════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {showSidebar && (
                    <>
                        {/* Backdrop com Blur Suave */}
                        <motion.div
                            key="sidebar-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="lg:hidden fixed inset-0 bg-black/60 z-[60] backdrop-blur-xs"
                            onClick={() => setShowSidebar(false)}
                        />

                        {/* Sidebar Drawer Panel */}
                        <motion.div
                            key="sidebar-panel"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                            className="lg:hidden fixed top-0 left-0 bottom-0 w-[310px] max-w-[85vw] bg-white z-[70] shadow-2xl flex flex-col overflow-hidden safe-area-top mobile-app-shell"
                        >
                            {/* Card Executivo do Usuário */}
                            <div className="p-5 bg-gradient-to-br from-[#1e1b4b] via-[#2a133d] to-[#3b0d40] text-white shrink-0 rounded-b-[28px] shadow-md">
                                {/* Close Button — topo direito isolado */}
                                <div className="flex justify-end mb-3">
                                    <button
                                        onClick={() => setShowSidebar(false)}
                                        className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors backdrop-blur-sm"
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3 mb-4">
                                    {/* Avatar circular */}
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-400 to-orange-400 p-[2px] shrink-0 shadow-md shadow-purple-900/40">
                                        <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center">
                                            {avatarUrl ? (
                                                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-white text-sm font-black">
                                                    {displayName.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        {/* Nome completo + badge de plano na mesma linha */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-black text-white leading-tight">{displayName}</p>
                                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-extrabold text-amber-300 shrink-0">
                                                <Star className="w-2.5 h-2.5 fill-amber-300" />
                                                <span>{planName}</span>
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-white/70 truncate mt-0.5 font-medium">
                                            {userAgency?.nome || 'Luanda, Angola'}
                                        </p>
                                    </div>
                                </div>

                                {/* Barra de Cota do Plano */}
                                <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-xs border border-white/10">
                                    <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                                        <span className="text-white/80">Cota de Imóveis</span>
                                        <span className="text-white font-extrabold">{publishedCount} de {maxLimit}</span>
                                    </div>
                                    <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 rounded-full transition-all duration-500"
                                            style={{ width: `${quotaPercentage}%` }}
                                        />
                                    </div>
                                </div>

                            </div>

                            {/* Links de Navegação Categorizados */}
                            <div className="mobile-scroll-container flex-1 overflow-y-auto py-3 px-3 space-y-4">
                                {/* Seção: Gestão Imobiliária */}
                                <div>
                                    <p className="px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                                        Gestão Imobiliária
                                    </p>
                                    <div className="space-y-1 mt-1">
                                        {/* Meus Imóveis */}
                                        <button
                                            onClick={() => { setActiveTab('properties'); setShowSidebar(false); }}
                                            className={cn(
                                                'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98]',
                                                activeTab === 'properties'
                                                    ? 'bg-purple-50 text-purple-800'
                                                    : 'text-slate-700 hover:bg-slate-50'
                                            )}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className={cn(
                                                    'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                                                    activeTab === 'properties' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                                                )}>
                                                    <Home className="w-4 h-4" />
                                                </div>
                                                <span>Meus Imóveis</span>
                                            </div>
                                            <span className={cn(
                                                'text-[11px] font-extrabold px-2 py-0.5 rounded-full',
                                                activeTab === 'properties' ? 'bg-purple-200 text-purple-900' : 'bg-slate-100 text-slate-600'
                                            )}>
                                                {propertyCount}
                                            </span>
                                        </button>

                                        {/* Visitas Agendadas */}
                                        <button
                                            onClick={() => { setActiveTab('visits'); setShowSidebar(false); }}
                                            className={cn(
                                                'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98]',
                                                activeTab === 'visits'
                                                    ? 'bg-purple-50 text-purple-800'
                                                    : 'text-slate-700 hover:bg-slate-50'
                                            )}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className={cn(
                                                    'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                                                    activeTab === 'visits' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                                                )}>
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <span>Agenda de Visitas</span>
                                            </div>
                                        </button>

                                        {/* Faturas & Pagamentos */}
                                        <button
                                            onClick={() => { setActiveTab('invoices'); setShowSidebar(false); }}
                                            className={cn(
                                                'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98]',
                                                activeTab === 'invoices'
                                                    ? 'bg-purple-50 text-purple-800'
                                                    : 'text-slate-700 hover:bg-slate-50'
                                            )}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className={cn(
                                                    'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                                                    activeTab === 'invoices' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                                                )}>
                                                    <BarChart3 className="w-4 h-4" />
                                                </div>
                                                <span>Faturas & Pagamentos</span>
                                            </div>
                                            {invoiceCount > 0 && (
                                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                                    {invoiceCount}
                                                </span>
                                            )}
                                        </button>

                                        {/* Agência (se aprovada) */}
                                        {userAgency?.status === 'approved' && (
                                            <button
                                                onClick={() => { setActiveTab('agency'); setShowSidebar(false); }}
                                                className={cn(
                                                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98]',
                                                    activeTab === 'agency'
                                                        ? 'bg-purple-50 text-purple-800'
                                                        : 'text-slate-700 hover:bg-slate-50'
                                                )}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className={cn(
                                                        'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                                                        activeTab === 'agency' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                                                    )}>
                                                        <Store className="w-4 h-4" />
                                                    </div>
                                                    <span>Minha Agência</span>
                                                </div>
                                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Seção: Clientes & Comunicação */}
                                <div>
                                    <p className="px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                                        Clientes & Comunicação
                                    </p>
                                    <div className="space-y-1 mt-1">
                                        {/* Chat com Leads */}
                                        <button
                                            onClick={() => { setActiveTab('messages'); setShowSidebar(false); }}
                                            className={cn(
                                                'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98]',
                                                activeTab === 'messages'
                                                    ? 'bg-purple-50 text-purple-800'
                                                    : 'text-slate-700 hover:bg-slate-50'
                                            )}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className={cn(
                                                    'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                                                    activeTab === 'messages' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                                                )}>
                                                    <MessageCircle className="w-4 h-4" />
                                                </div>
                                                <span>Mensagens</span>
                                            </div>
                                            {totalUnreadCount > 0 && (
                                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500 text-white">
                                                    {totalUnreadCount}
                                                </span>
                                            )}
                                        </button>

                                        {/* Imóveis Salvos */}
                                        <button
                                            onClick={() => { setActiveTab('favorites'); setShowSidebar(false); }}
                                            className={cn(
                                                'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98]',
                                                activeTab === 'favorites'
                                                    ? 'bg-purple-50 text-purple-800'
                                                    : 'text-slate-700 hover:bg-slate-50'
                                            )}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className={cn(
                                                    'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                                                    activeTab === 'favorites' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                                                )}>
                                                    <Heart className="w-4 h-4" />
                                                </div>
                                                <span>Imóveis Guardados</span>
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-400">
                                                {favoriteCount}
                                            </span>
                                        </button>

                                        {/* Estatísticas */}
                                        <button
                                            onClick={() => { setActiveTab('stats'); setShowSidebar(false); }}
                                            className={cn(
                                                'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98]',
                                                activeTab === 'stats'
                                                    ? 'bg-purple-50 text-purple-800'
                                                    : 'text-slate-700 hover:bg-slate-50'
                                            )}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className={cn(
                                                    'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                                                    activeTab === 'stats' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                                                )}>
                                                    <Activity className="w-4 h-4" />
                                                </div>
                                                <span>Estatísticas</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Seção: Conta & Sistema */}
                                <div>
                                    <p className="px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                                        Conta & Sistema
                                    </p>
                                    <div className="space-y-1 mt-1">
                                        <button
                                            onClick={() => { setActiveTab('settings'); setShowSidebar(false); }}
                                            className={cn(
                                                'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98]',
                                                activeTab === 'settings'
                                                    ? 'bg-purple-50 text-purple-800'
                                                    : 'text-slate-700 hover:bg-slate-50'
                                            )}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className={cn(
                                                    'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                                                    activeTab === 'settings' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                                                )}>
                                                    <Settings className="w-4 h-4" />
                                                </div>
                                                <span>Configurações</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Rodapé da Sidebar: Portal & Logout */}
                            <div className="p-4 border-t border-slate-100 shrink-0 bg-slate-50/60">
                                <div className="flex gap-2.5">
                                    {/* Voltar ao Portal */}
                                    <button
                                        onClick={() => window.location.href = '/'}
                                        className="flex-1 min-w-0 flex flex-col items-center justify-center gap-1 px-3 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl transition-all active:scale-[0.97] hover:bg-slate-50 hover:border-slate-300 shadow-xs"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                                            <ArrowLeft className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <span className="text-[10px] font-extrabold text-slate-500 leading-tight text-center whitespace-nowrap">Portal KerCasa</span>
                                    </button>

                                    {/* Terminar Sessão */}
                                    <button
                                        onClick={handleLogout}
                                        className="flex-1 min-w-0 flex flex-col items-center justify-center gap-1 px-3 py-3 bg-rose-50 hover:bg-rose-100 border border-rose-100 hover:border-rose-200 text-rose-600 rounded-2xl transition-all active:scale-[0.97] shadow-xs"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
                                            <LogOut className="w-4 h-4 text-rose-500" />
                                        </div>
                                        <span className="text-[10px] font-extrabold text-rose-500 leading-tight text-center whitespace-nowrap">Terminar Sessão</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
