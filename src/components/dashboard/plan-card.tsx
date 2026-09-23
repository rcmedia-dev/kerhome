'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface DashboardPlanCardProps {
    planName?: string;
    limit: number;
    remaining: number;
}

export function DashboardPlanCard({ planName, limit, remaining }: DashboardPlanCardProps) {
    const used = limit - remaining;
    const percentage = limit > 0 ? Math.min(100, Math.max(0, (used / limit) * 100)) : 0;
    const percentLabel = Math.round(percentage);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-border shadow-card p-4 flex items-center gap-3"
            role="region"
            aria-label="Uso do plano"
        >
            <div
                className="relative w-12 h-12 rounded-full shrink-0 grid place-items-center"
                style={{
                    background: `conic-gradient(#820AD1 ${percentage}%, #e5e7eb ${percentage}% 100%)`,
                }}
                role="progressbar"
                aria-valuenow={percentLabel}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Percentagem do plano usado"
            >
                <span className="absolute inset-[5px] rounded-full bg-white" aria-hidden="true" />
                <span className="relative z-10 text-[11px] font-black text-[#820AD1] tabular-nums">
                    {percentLabel}%
                </span>
            </div>

            <div className="flex-1 min-w-0">
                <strong className="block text-[13px] font-extrabold text-gray-900 truncate leading-tight">
                    Plano {planName || 'Free'}
                </strong>
                <span className="block text-[11px] text-gray-500 mt-0.5 leading-snug">
                    {used} de {limit || '∞'} imóveis usados
                </span>
            </div>

            <Link href="/planos" className="shrink-0">
                <Button
                    size="sm"
                    className="h-9 px-3.5 text-xs rounded-button bg-purple-600 text-white font-bold shadow-md shadow-purple-500/25 hover:bg-purple-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    Upgrade
                </Button>
            </Link>
        </motion.div>
    );
}
