'use client';

import {
    Home,
    Heart,
    MessageCircle,
    Activity,
    MoreHorizontal,
    Calendar,
    BarChart3,
    Settings,
    Store,
    X,
    LogOut,
    ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/lib/store/user-store';
import { createClient } from '@/lib/supabase/client';

interface MobileNavbarProps {
    activeTab: string;
    setActiveTab: (id: string) => void;
    userAgency?: any;
}

export function MobileNavbar({ activeTab, setActiveTab, userAgency }: MobileNavbarProps) {
    const [showMore, setShowMore] = useState(false);
    const supabase = createClient();

    const handleLogout = async () => {
        try {
            const store = useUserStore.getState();
            if (typeof store.signOut === 'function') {
                await store.signOut();
            } else {
                await supabase.auth.signOut();
            }
            window.location.href = '/login';
        } catch (error) {
            console.error('Error during logout:', error);
            window.location.href = '/login';
        }
    };

    const primaryTabs = [
        { id: 'properties', label: 'Imóveis', icon: Home },
        { id: 'favorites', label: 'Favoritas', icon: Heart },
        { id: 'messages', label: 'Chat', icon: MessageCircle },
        { id: 'stats', label: 'Stats', icon: Activity },
    ];

    const secondaryTabs = [
        { id: 'visits', label: 'Visitas', icon: Calendar },
        { id: 'invoices', label: 'Faturas', icon: BarChart3 },
        { id: 'settings', label: 'Ajustes', icon: Settings },
    ];

    if (userAgency?.status === 'approved') {
        secondaryTabs.unshift({ id: 'agency', label: 'Agência', icon: Store });
    }

    const isSecondaryActive = secondaryTabs.some(t => t.id === activeTab);

    return (
        <>
            {/* ── Fixed Bottom Navigation Bar ── */}
            <nav
                className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/96 backdrop-blur-xl border-t border-gray-100 shadow-[0_-2px_24px_rgba(0,0,0,0.07)]"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
                <div className="flex items-center h-16 px-2">
                    {primaryTabs.map((tab) => {
                        const isActive = activeTab === tab.id && !showMore;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setShowMore(false); }}
                                className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-all duration-150 active:scale-90 outline-none"
                                aria-label={tab.label}
                            >
                                <div className={cn(
                                    'w-11 h-7 rounded-full flex items-center justify-center transition-all duration-200',
                                    isActive ? 'bg-purple-100' : ''
                                )}>
                                    <tab.icon className={cn(
                                        'w-[19px] h-[19px] transition-all duration-200',
                                        isActive ? 'text-purple-600' : 'text-gray-400'
                                    )} />
                                </div>
                                <span className={cn(
                                    'text-[9.5px] font-semibold leading-none transition-colors duration-200',
                                    isActive ? 'text-purple-600' : 'text-gray-400'
                                )}>
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}

                    {/* More button */}
                    <button
                        onClick={() => setShowMore(v => !v)}
                        className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-all duration-150 active:scale-90 outline-none"
                        aria-label="Mais opções"
                    >
                        <div className={cn(
                            'w-11 h-7 rounded-full flex items-center justify-center transition-all duration-200',
                            (showMore || isSecondaryActive) ? 'bg-purple-100' : ''
                        )}>
                            <AnimatePresence mode="wait" initial={false}>
                                {showMore ? (
                                    <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                                        <X className="w-[19px] h-[19px] text-purple-600" />
                                    </motion.div>
                                ) : (
                                    <motion.div key="more" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                                        <MoreHorizontal className={cn(
                                            'w-[19px] h-[19px]',
                                            (showMore || isSecondaryActive) ? 'text-purple-600' : 'text-gray-400'
                                        )} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <span className={cn(
                            'text-[9.5px] font-semibold leading-none transition-colors duration-200',
                            (showMore || isSecondaryActive) ? 'text-purple-600' : 'text-gray-400'
                        )}>
                            Mais
                        </span>
                    </button>
                </div>
            </nav>

            {/* ── Bottom Sheet backdrop + panel ── */}
            <AnimatePresence>
                {showMore && (
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="lg:hidden fixed inset-0 bg-black/25 z-40 backdrop-blur-[3px]"
                        onClick={() => setShowMore(false)}
                    />
                )}

                {showMore && (
                    <motion.div
                        key="sheet"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 34, stiffness: 420 }}
                        className="lg:hidden fixed bottom-16 left-0 right-0 bg-white rounded-t-[28px] z-50 shadow-2xl px-4 pt-5 pb-6"
                        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
                    >
                        {/* Handle */}
                        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-1">
                            Mais opções
                        </p>

                        <div className="grid grid-cols-3 gap-3">
                            {secondaryTabs.map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => { setActiveTab(tab.id); setShowMore(false); }}
                                        className={cn(
                                            'flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all active:scale-95',
                                            isActive
                                                ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg shadow-purple-200'
                                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                        )}
                                    >
                                        <tab.icon className="w-5 h-5" />
                                        <span className="text-xs font-semibold">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Extra Actions */}
                        <div className="mt-6 pt-6 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex-1 flex items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition-all active:scale-95 font-semibold text-xs"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Voltar ao Site
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center gap-2 p-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all active:scale-95 font-semibold text-xs"
                            >
                                <LogOut className="w-4 h-4" />
                                Sair
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
