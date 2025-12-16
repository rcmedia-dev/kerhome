'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface DashboardBannerProps {
    displayName: string;
    userPlanName?: string;
    onNewPropertyClick?: () => void;
}

export function DashboardBanner({ displayName, userPlanName, onNewPropertyClick }: DashboardBannerProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white shadow-xl mb-8"
        >
            {/* Decorative stars/sparkles */}
            <div className="absolute top-0 right-0 p-12 opacity-10">
                <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 0L122.45 77.55L200 100L122.45 122.45L100 200L77.55 122.45L0 100L77.55 77.55L100 0Z" fill="currentColor" />
                </svg>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm mb-3"
                    >
                        {userPlanName || 'Plano Gratuito'}
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl font-bold sm:text-4xl mb-2"
                    >
                        Impulsione seus negócios imobiliários
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="max-w-xl text-purple-100/90 text-lg"
                    >
                        Olá, {displayName}. Gerencie suas propriedades e acompanhe seus resultados em um só lugar.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex-shrink-0"
                >
                    <Link href="/dashboard/cadastrar-imovel">
                        <button
                            onClick={onNewPropertyClick}
                            className="group flex items-center gap-2 rounded-md bg-white px-6 py-3 font-semibold text-purple-600 shadow-lg transition-all hover:bg-purple-50 hover:scale-105 active:scale-95"
                        >
                            <span>Novo Imóvel</span>
                            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-600 group-hover:bg-purple-200">
                                <Plus size={14} />
                            </div>
                        </button>
                    </Link>
                </motion.div>
            </div>
        </motion.div>
    );
}
